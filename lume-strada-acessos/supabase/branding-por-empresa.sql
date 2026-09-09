-- ============================================================================
-- Branding por empresa — fecha o último buraco de multi-tenant
-- ============================================================================
--
-- CONTEXTO
-- `supabase/multitenant-migration.sql` (aplicada em 19/08/2026) isolou por
-- `company_id` todas as tabelas operacionais, mas deixou `branding_config`
-- de fora, de propósito e documentado na Seção 10 daquele arquivo: a tabela
-- é lida ANTES do login (tela de login, favicon, <title>), quando ainda não
-- se sabe de qual empresa é o visitante.
--
-- O EFEITO DISSO HOJE, com mais de uma empresa no banco:
--
--   branding_config_select_all   SELECT {anon,authenticated} USING (true)
--   branding_config_update_admin UPDATE {authenticated}      USING (is_admin())
--
-- Existe UM registro só (id fixo, coluna `singleton` com UNIQUE). Ou seja:
-- o admin da empresa B, ao trocar o logo/o banner/a tela de login, troca
-- também o da empresa A e o da C. Não é risco teórico — é o comportamento
-- atual.
--
-- A DECISÃO DE PRODUTO TOMADA AQUI
-- A pergunta "de qual empresa é este visitante, antes dele logar?" tinha três
-- respostas possíveis: (a) o login sempre usa a marca do dono do SaaS e a
-- marca da agência só aparece depois de entrar; (b) link de login com
-- identificador (`/login?e=slug`); (c) subdomínio por agência.
--
-- Esta migração implementa (a): é a única que não mexe em roteamento, DNS
-- nem domínio no Vercel, e não fecha a porta pra (b)/(c) depois — quando
-- existir uma forma de resolver a empresa no login, basta trocar a policy
-- de `anon` abaixo, sem tocar em dado nenhum.
--
-- Idempotente e transacional, mesmo padrão dos outros arquivos deste diretório.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Quem é a empresa "dona do SaaS"
-- ----------------------------------------------------------------------------
-- É a empresa mais antiga da tabela — a que a própria multitenant-migration
-- criou no PASSO 0 pra receber os dados que já existiam antes do SaaS existir.
-- `security definer` porque a policy de `anon` precisa consultar `companies`,
-- que tem RLS e nenhuma policy pra visitante não autenticado; sem isso a
-- subconsulta voltaria vazia e a tela de login ficaria sem marca nenhuma.
-- Mesmo padrão de `current_company_id()`/`is_super_admin()`.
create or replace function public.saas_owner_company_id()
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select id from public.companies order by created_at asc limit 1;
$$;

-- ----------------------------------------------------------------------------
-- 2. A coluna
-- ----------------------------------------------------------------------------
alter table public.branding_config
  add column if not exists company_id uuid references public.companies(id) on delete cascade;

-- O UNIQUE(singleton) é o que travava a tabela em uma linha só. Some agora;
-- a coluna em si fica (não custa nada e não vale o risco de um DROP COLUMN
-- num banco de produção), só deixa de significar qualquer coisa.
alter table public.branding_config drop constraint if exists branding_config_singleton_key;

-- ----------------------------------------------------------------------------
-- 3. Backfill — a linha que já existe vira a linha da empresa dona do SaaS
-- ----------------------------------------------------------------------------
-- Importante: é ESTA linha que continua sendo lida na tela de login pública,
-- então o visual de login não muda nada com esta migração.
update public.branding_config
   set company_id = public.saas_owner_company_id()
 where company_id is null;

-- Uma linha nova (só com os defaults) pra cada empresa que ainda não tem.
insert into public.branding_config (company_id, singleton)
select c.id, false
  from public.companies c
 where not exists (
   select 1 from public.branding_config b where b.company_id = c.id
 );

-- Só agora dá pra exigir a coluna: antes do backfill isso quebraria no meio.
alter table public.branding_config alter column company_id set not null;

create unique index if not exists branding_config_company_unique_idx
  on public.branding_config (company_id);

-- ----------------------------------------------------------------------------
-- 4. RLS
-- ----------------------------------------------------------------------------
drop policy if exists branding_config_select_all on public.branding_config;
drop policy if exists branding_config_update_admin on public.branding_config;
drop policy if exists branding_config_select_publico on public.branding_config;
drop policy if exists branding_config_select_propria on public.branding_config;
drop policy if exists branding_config_update_propria on public.branding_config;

-- Visitante não autenticado (tela de login, favicon, <title>): enxerga
-- exclusivamente a linha do dono do SaaS. Uma linha, sempre a mesma — é o
-- que mantém `getBrandingConfig()` funcionando com `.limit(1)` sem precisar
-- saber de empresa nenhuma.
create policy branding_config_select_publico
  on public.branding_config
  for select
  to anon
  using (company_id = public.saas_owner_company_id());

-- Autenticado: enxerga exclusivamente a linha da PRÓPRIA empresa — de novo
-- uma linha só, então `.limit(1)` continua devolvendo a certa. super_admin
-- (que nunca tem `company_id`) não recebe nenhuma e cai no visual padrão do
-- código, que é o correto: o painel `/super-admin` tem shell próprio e não
-- usa branding de cliente.
create policy branding_config_select_propria
  on public.branding_config
  for select
  to authenticated
  using (company_id = public.current_company_id());

-- Escrita: admin, e só na própria empresa. É esta linha que fecha o buraco.
create policy branding_config_update_propria
  on public.branding_config
  for update
  to authenticated
  using (public.is_admin() and company_id = public.current_company_id())
  with check (public.is_admin() and company_id = public.current_company_id());

-- ----------------------------------------------------------------------------
-- 5. Toda empresa nova já nasce com a própria linha de branding
-- ----------------------------------------------------------------------------
-- Mesmo padrão do trigger que já provisiona a sessão de WhatsApp de cada
-- empresa nova (`seed_whatsapp_sessao_nova_empresa`, Seção 7 da migração
-- original). Sem isso, uma empresa recém-criada abriria a Aparência e não
-- teria nenhuma linha pra editar.
create or replace function public.seed_branding_nova_empresa()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.branding_config (company_id, singleton)
  values (new.id, false)
  on conflict (company_id) do nothing;
  return new;
end;
$$;

drop trigger if exists companies_seed_branding on public.companies;
create trigger companies_seed_branding
  after insert on public.companies
  for each row execute function public.seed_branding_nova_empresa();

commit;

-- ============================================================================
-- DEPOIS DE RODAR
-- ============================================================================
-- Esta migração precisa subir JUNTO com o deploy do código correspondente.
-- O código antigo escreve com `.eq("id", BRANDING_CONFIG_ID)` — uma linha
-- fixa que, depois daqui, pertence à empresa dona do SaaS. Para o admin
-- dessa empresa nada muda; para o admin das OUTRAS, a nova policy de UPDATE
-- passa a barrar a escrita (que é o certo, mas aparece como erro ao salvar
-- em Aparência até o código novo entrar no ar).
--
-- O código novo (`src/app/admin/aparencia/actions.ts`) escreve com
-- `.eq("company_id", companyId)`, vindo de `requireAdmin()`.
-- ============================================================================
