-- ============================================================================
-- Lume Strada Filmes — Migração para Multi-Tenant (SaaS)
-- ============================================================================
-- Transforma o sistema de "ferramenta interna da agência" para "SaaS que a
-- agência vende pra outras empresas". Cada empresa compradora (`companies`)
-- passa a ter os próprios dados, completamente isolados dos de qualquer
-- outra empresa — inclusive da agência dona do software.
--
-- LEIA `MIGRACAO-MULTI-TENANT.md` ANTES DE RODAR ESTE ARQUIVO — ele explica
-- as decisões de arquitetura tomadas aqui (por que os valores de `role` no
-- banco continuam sendo 'admin'/'funcionario'/'cliente' em vez de virarem
-- literalmente COMPANY_ADMIN/COMPANY_USER, como o isolamento é garantido via
-- RLS, o que fica de fora desta etapa e o que precisa ser feito manualmente
-- antes de rodar isto em produção).
--
-- Rode DEPOIS de todos os outros arquivos em `supabase/` (schema.sql,
-- cadastros.sql, producao.sql, producao-sync-funcionarios.sql, comercial.sql,
-- financeiro*.sql, whatsapp.sql, infoprodutos.sql, patrimonio.sql,
-- dashboard*.sql, banner.sql, correcoes-auditoria.sql) — ele assume que TODAS
-- as tabelas operacionais já existem. Rode este arquivo INTEIRO de uma vez só
-- no SQL Editor do Supabase (ele já é uma transação implícita: se qualquer
-- comando falhar no meio, o Postgres desfaz tudo — não fica pela metade).
--
-- ANTES DE RODAR: troque o e-mail no PASSO 0 abaixo pelo seu e-mail de login
-- de verdade (o admin atual do sistema) — é ele que vira o primeiro
-- SUPER_ADMIN. Todo o resto dos dados que já existem no banco (seus próprios
-- clientes, tarefas, leads, financeiro etc.) é automaticamente migrado para
-- uma empresa "Lume Strada Filmes" criada por este script — nada se perde.
--
-- Idempotente — seguro rodar de novo (o PASSO 0 e o backfill não duplicam
-- nada na segunda execução).
-- ============================================================================


-- ============================================================================
-- PASSO 0 — TROQUE ESTE E-MAIL antes de rodar
-- ============================================================================
do $$
begin
  if not exists (select 1 from public.profiles where email = 'SEU-EMAIL-DE-LOGIN-AQUI@exemplo.com') then
    raise exception 'PASSO 0: troque ''SEU-EMAIL-DE-LOGIN-AQUI@exemplo.com'' pelo seu e-mail de login de admin real antes de rodar este script (procure por "PASSO 0" neste arquivo).';
  end if;
end $$;


-- ============================================================================
-- 1. TABELA `companies` — as licenças/empresas compradoras
-- ============================================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),

  nome text not null, -- razão social / nome fantasia da empresa compradora

  -- Licença: controlada 100% pelo Super Admin, independente de qualquer
  -- suspensão/expiração individual de usuário (que continua existindo em
  -- `profiles.active`/`profiles.expires_at`, sem mudança — os dois níveis
  -- coexistem: a empresa inteira pode estar ativa e um funcionário dela
  -- suspenso, ou a empresa inteira suspensa mesmo com todo mundo "ativo").
  status text not null default 'ativo' check (status in ('ativo', 'suspenso')),
  expires_at timestamptz, -- null = sem expiração definida

  created_by uuid references public.profiles(id) on delete set null, -- qual Super Admin cadastrou

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_status_idx on public.companies (status);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();


-- ============================================================================
-- 2. `profiles` — adiciona `company_id` e o papel `super_admin`
-- ============================================================================
-- Decisão de arquitetura (ver plano): os valores 'admin'/'funcionario'/
-- 'cliente' de `role` NÃO são renomeados para COMPANY_ADMIN/COMPANY_USER —
-- só ganham um 4º valor, 'super_admin'. Isso evita reescrever toda checagem
-- `role === "admin"` espalhada pelo front-end hoje (altíssimo risco de
-- quebrar algo). Na prática: 'admin' = "dono da empresa compradora"
-- (COMPANY_ADMIN), 'funcionario' = "funcionário dela" (COMPANY_USER),
-- 'cliente' = cliente DAQUELA empresa (o painel de clientes que a própria
-- agência compradora atende), 'super_admin' = você, dono do SaaS.
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists company_id uuid references public.companies(id) on delete cascade;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'funcionario', 'cliente', 'super_admin'));

create index if not exists profiles_company_id_idx on public.profiles (company_id);

-- ----------------------------------------------------------------------------
-- 2.1 Backfill — cria a empresa "Lume Strada Filmes" (a agência dona do
-- software) e migra TODO mundo que já existe no banco pra ela, exceto quem
-- vira super_admin no próximo passo. `on conflict` não existe aqui de
-- propósito (não há chave única em `nome`) — a proteção contra duplicar numa
-- segunda execução é o `where company_id is null`: depois da primeira
-- rodada, ninguém mais cai nessa condição.
-- ----------------------------------------------------------------------------
do $$
declare
  v_empresa_id uuid;
begin
  select id into v_empresa_id from public.companies where nome = 'Lume Strada Filmes' limit 1;

  if v_empresa_id is null then
    insert into public.companies (nome, status)
    values ('Lume Strada Filmes', 'ativo')
    returning id into v_empresa_id;
  end if;

  update public.profiles
  set company_id = v_empresa_id
  where company_id is null and email <> 'SEU-EMAIL-DE-LOGIN-AQUI@exemplo.com';
end $$;

-- 2.2 Promove você a super_admin (sem empresa — enxerga só o painel mestre).
update public.profiles
set role = 'super_admin', company_id = null
where email = 'SEU-EMAIL-DE-LOGIN-AQUI@exemplo.com';

-- 2.3 SÓ AGORA (com todo mundo já migrado) a invariante vira obrigatória:
-- super_admin nunca tem company_id; todo mundo mais SEMPRE tem.
alter table public.profiles drop constraint if exists profiles_company_id_invariante;
alter table public.profiles add constraint profiles_company_id_invariante
  check ((role = 'super_admin' and company_id is null) or (role <> 'super_admin' and company_id is not null));

-- ----------------------------------------------------------------------------
-- 2.4 Helpers de RLS — mesmo padrão SECURITY DEFINER de `is_admin()`/
-- `is_staff()` já existentes (evita recursão de RLS consultando `profiles`
-- de dentro de uma policy de `profiles`).
-- ----------------------------------------------------------------------------
create or replace function public.current_company_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- `is_admin()`/`is_staff()` (schema.sql) NÃO precisam mudar — continuam
-- checando `role = 'admin'`/`role in ('admin','funcionario')`, que já
-- excluem 'super_admin' automaticamente (é um valor de role diferente).

-- ----------------------------------------------------------------------------
-- 2.5 Trava anti-escalada de privilégio — CRÍTICO. Sem isto, a policy de
-- UPDATE abaixo (que só confere "você é admin da empresa X") deixaria um
-- COMPANY_ADMIN alterar o próprio `role` pra 'super_admin' ou o próprio
-- `company_id` pra outra empresa, numa única chamada de UPDATE — porque a
-- condição continua batendo tanto ANTES quanto DEPOIS da mudança. Este
-- trigger bloqueia qualquer alteração de `role`/`company_id` que não seja
-- feita pelo super_admin OU pela service role (as Server Actions já
-- verificam permissão em código antes de chamar `admin.from("profiles")
-- .update()` com a service role — mesmo modelo de confiança que
-- `gerarAcessoCliente`/`gerarAcessoFuncionario` já usam hoje).
-- ----------------------------------------------------------------------------
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if public.is_super_admin() or auth.role() = 'service_role' then
    return new;
  end if;
  if new.role is distinct from old.role or new.company_id is distinct from old.company_id then
    raise exception 'Você não tem permissão para alterar papel (role) ou empresa (company_id) deste perfil.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

-- ----------------------------------------------------------------------------
-- 2.6 `handle_new_user()` — passa a ler `company_id` dos metadados do
-- convite (`data: { company_id }`, ver `inviteUserByEmail` em
-- `src/app/admin/actions.ts`/`src/app/super-admin/actions.ts`). Sem isso, um
-- novo cadastro nasceria com `company_id` nulo e violaria a invariante do
-- passo 2.3 — a inserção falharia (falha segura: nunca cria usuário
-- "orfão" de empresa por engano).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active, company_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'cliente',
    true,
    nullif(new.raw_user_meta_data ->> 'company_id', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2.7 RLS de `profiles` — reescreve as 3 policies existentes.
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_super_admin() or (public.is_admin() and company_id = public.current_company_id()));

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_super_admin() or (public.is_admin() and company_id = public.current_company_id()))
  with check (public.is_super_admin() or (public.is_admin() and company_id = public.current_company_id()));

-- Super Admin nunca INSERE/DELETA em `profiles` diretamente pela app (usa
-- Auth admin + a mesma trigger `handle_new_user`, igual todo o resto do
-- sistema) — nenhuma policy nova de insert/delete é necessária aqui.


-- ============================================================================
-- 3. RLS de `companies` — só o Super Admin lê/escreve a lista inteira; cada
-- empresa consegue ler (só SELECT) A PRÓPRIA linha, pra UI mostrar algo como
-- "seu plano vence em X" sem dar acesso a nenhuma outra empresa.
-- ============================================================================
alter table public.companies enable row level security;

drop policy if exists "companies_super_admin_all" on public.companies;
create policy "companies_super_admin_all" on public.companies
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "companies_select_own" on public.companies;
create policy "companies_select_own" on public.companies
  for select to authenticated
  using (id = public.current_company_id());


-- ============================================================================
-- 4. Adiciona `company_id` em TODAS as tabelas operacionais + backfill +
-- NOT NULL + índice. Padrão idêntico repetido tabela por tabela:
--   a) ALTER TABLE ... ADD COLUMN company_id (com DEFAULT current_company_id()
--      — é isso que resolve o requisito de o front-end NUNCA precisar passar
--      company_id manualmente num INSERT: o Postgres resolve sozinho, pelo
--      JWT/sessão de quem está inserindo);
--   b) UPDATE ... SET company_id = <empresa Lume Strada> WHERE company_id IS
--      NULL (backfill dos dados que já existem);
--   c) SET NOT NULL;
--   d) índice em company_id (toda query operacional passa a filtrar por ele).
-- ============================================================================
do $$
declare
  v_empresa_id uuid;
begin
  select id into v_empresa_id from public.companies where nome = 'Lume Strada Filmes' limit 1;

  -- Cadastros
  alter table public.clientes add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.clientes set company_id = v_empresa_id where company_id is null;
  alter table public.clientes alter column company_id set not null;

  alter table public.equipe_membros add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.equipe_membros set company_id = v_empresa_id where company_id is null;
  alter table public.equipe_membros alter column company_id set not null;

  alter table public.cliente_atividades add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.cliente_atividades set company_id = v_empresa_id where company_id is null;
  alter table public.cliente_atividades alter column company_id set not null;

  -- Produção
  alter table public.prod_funcionarios add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.prod_funcionarios set company_id = v_empresa_id where company_id is null;
  alter table public.prod_funcionarios alter column company_id set not null;

  alter table public.prod_tipos_servico add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.prod_tipos_servico set company_id = v_empresa_id where company_id is null;
  alter table public.prod_tipos_servico alter column company_id set not null;

  alter table public.prod_tarefas add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.prod_tarefas set company_id = v_empresa_id where company_id is null;
  alter table public.prod_tarefas alter column company_id set not null;

  alter table public.prod_subtarefas add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.prod_subtarefas s set company_id = t.company_id from public.prod_tarefas t where t.id = s.tarefa_id and s.company_id is null;
  alter table public.prod_subtarefas alter column company_id set not null;

  alter table public.prod_entregas add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.prod_entregas e set company_id = t.company_id from public.prod_tarefas t where t.id = e.tarefa_id and e.company_id is null;
  alter table public.prod_entregas alter column company_id set not null;

  alter table public.prod_entrega_versoes add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.prod_entrega_versoes v set company_id = e.company_id from public.prod_entregas e where e.id = v.entrega_id and v.company_id is null;
  alter table public.prod_entrega_versoes alter column company_id set not null;

  -- Comercial
  alter table public.crm_leads add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.crm_leads set company_id = v_empresa_id where company_id is null;
  alter table public.crm_leads alter column company_id set not null;

  alter table public.crm_anotacoes add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.crm_anotacoes a set company_id = l.company_id from public.crm_leads l where l.id = a.lead_id and a.company_id is null;
  alter table public.crm_anotacoes alter column company_id set not null;

  -- Financeiro
  alter table public.fin_contas add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.fin_contas set company_id = v_empresa_id where company_id is null;
  alter table public.fin_contas alter column company_id set not null;

  alter table public.fin_cartoes add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.fin_cartoes set company_id = v_empresa_id where company_id is null;
  alter table public.fin_cartoes alter column company_id set not null;

  alter table public.fin_categorias add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.fin_categorias set company_id = v_empresa_id where company_id is null;
  alter table public.fin_categorias alter column company_id set not null;

  alter table public.fin_transacoes add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.fin_transacoes set company_id = v_empresa_id where company_id is null;
  alter table public.fin_transacoes alter column company_id set not null;

  alter table public.fin_faturas add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.fin_faturas set company_id = v_empresa_id where company_id is null;
  alter table public.fin_faturas alter column company_id set not null;

  -- Tráfego & Metas
  alter table public.metas_diarias add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.metas_diarias set company_id = v_empresa_id where company_id is null;
  alter table public.metas_diarias alter column company_id set not null;

  alter table public.trafego_registros add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.trafego_registros r set company_id = m.company_id from public.metas_diarias m where m.id = r.meta_id and r.company_id is null;
  alter table public.trafego_registros alter column company_id set not null;

  -- Inventário
  alter table public.categorias_inventario add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.categorias_inventario set company_id = v_empresa_id where company_id is null;
  alter table public.categorias_inventario alter column company_id set not null;

  alter table public.itens_inventario add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.itens_inventario set company_id = v_empresa_id where company_id is null;
  alter table public.itens_inventario alter column company_id set not null;

  -- Info-Produtos / Tráfego pago
  alter table public.produtos add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.produtos set company_id = v_empresa_id where company_id is null;
  alter table public.produtos alter column company_id set not null;

  alter table public.anuncios_tracking add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.anuncios_tracking set company_id = v_empresa_id where company_id is null;
  alter table public.anuncios_tracking alter column company_id set not null;

  alter table public.metas_calendario add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.metas_calendario set company_id = v_empresa_id where company_id is null;
  alter table public.metas_calendario alter column company_id set not null;

  alter table public.fechamentos_semanais add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.fechamentos_semanais set company_id = v_empresa_id where company_id is null;
  alter table public.fechamentos_semanais alter column company_id set not null;

  -- WhatsApp
  alter table public.whatsapp_sessoes add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.whatsapp_sessoes set company_id = v_empresa_id where company_id is null;
  alter table public.whatsapp_sessoes alter column company_id set not null;

  alter table public.whatsapp_contatos add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.whatsapp_contatos set company_id = v_empresa_id where company_id is null;
  alter table public.whatsapp_contatos alter column company_id set not null;

  alter table public.whatsapp_mensagens add column if not exists company_id uuid references public.companies(id) on delete cascade default public.current_company_id();
  update public.whatsapp_mensagens m set company_id = c.company_id from public.whatsapp_contatos c where c.id = m.contato_id and m.company_id is null;
  alter table public.whatsapp_mensagens alter column company_id set not null;
end $$;

-- Índices — uma query por módulo praticamente sempre filtra por company_id
-- primeiro; sem isso cada SELECT vira um full scan à medida que a base
-- cresce com várias empresas.
create index if not exists clientes_company_idx on public.clientes (company_id);
create index if not exists equipe_membros_company_idx on public.equipe_membros (company_id);
create index if not exists cliente_atividades_company_idx on public.cliente_atividades (company_id);
create index if not exists prod_funcionarios_company_idx on public.prod_funcionarios (company_id);
create index if not exists prod_tipos_servico_company_idx on public.prod_tipos_servico (company_id);
create index if not exists prod_tarefas_company_idx on public.prod_tarefas (company_id);
create index if not exists prod_subtarefas_company_idx on public.prod_subtarefas (company_id);
create index if not exists prod_entregas_company_idx on public.prod_entregas (company_id);
create index if not exists prod_entrega_versoes_company_idx on public.prod_entrega_versoes (company_id);
create index if not exists crm_leads_company_idx on public.crm_leads (company_id);
create index if not exists crm_anotacoes_company_idx on public.crm_anotacoes (company_id);
create index if not exists fin_contas_company_idx on public.fin_contas (company_id);
create index if not exists fin_cartoes_company_idx on public.fin_cartoes (company_id);
create index if not exists fin_categorias_company_idx on public.fin_categorias (company_id);
create index if not exists fin_transacoes_company_idx on public.fin_transacoes (company_id);
create index if not exists fin_faturas_company_idx on public.fin_faturas (company_id);
create index if not exists metas_diarias_company_idx on public.metas_diarias (company_id);
create index if not exists trafego_registros_company_idx on public.trafego_registros (company_id);
create index if not exists categorias_inventario_company_idx on public.categorias_inventario (company_id);
create index if not exists itens_inventario_company_idx on public.itens_inventario (company_id);
create index if not exists produtos_company_idx on public.produtos (company_id);
create index if not exists anuncios_tracking_company_idx on public.anuncios_tracking (company_id);
create index if not exists metas_calendario_company_idx on public.metas_calendario (company_id);
create index if not exists fechamentos_semanais_company_idx on public.fechamentos_semanais (company_id);
-- `whatsapp_sessoes` NÃO entra aqui de propósito — ela recebe um índice
-- ÚNICO em `company_id` na Seção 5 (é o "singleton por empresa"), que já
-- serve tanto pra indexação quanto pra unicidade. Criar um índice comum
-- aqui com o MESMO NOME que o índice único de lá faria o `IF NOT EXISTS` da
-- Seção 5 encontrar um índice já existente (por nome) e pular a criação do
-- único silenciosamente — bug real encontrado em produção: toda criação de
-- empresa passou a falhar com "no unique or exclusion constraint matching
-- the ON CONFLICT specification", porque o trigger de seed do WhatsApp
-- (Seção 5) depende desse índice ser único. Ver `MIGRACAO-MULTI-TENANT.md`.
create index if not exists whatsapp_contatos_company_idx on public.whatsapp_contatos (company_id);
create index if not exists whatsapp_mensagens_company_idx on public.whatsapp_mensagens (company_id);


-- ============================================================================
-- 5. Re-escopa UNIQUE constraints que hoje são globais mas precisam virar
-- "únicos DENTRO da empresa" (duas empresas diferentes podem, cada uma, ter
-- um cliente com o mesmo CNPJ de teste, uma categoria "Marketing", etc.).
-- ============================================================================
alter table public.clientes drop constraint if exists clientes_documento_idx;
drop index if exists clientes_documento_idx;
create unique index if not exists clientes_company_documento_idx on public.clientes (company_id, documento) where documento is not null;

alter table public.itens_inventario drop constraint if exists itens_inventario_codigo_etiqueta_key;
create unique index if not exists itens_inventario_company_codigo_etiqueta_idx on public.itens_inventario (company_id, codigo_etiqueta);

alter table public.categorias_inventario drop constraint if exists categorias_inventario_codigo_key;
create unique index if not exists categorias_inventario_company_codigo_idx on public.categorias_inventario (company_id, codigo);

alter table public.fin_categorias drop constraint if exists fin_categorias_nome_tipo_key;
create unique index if not exists fin_categorias_company_nome_tipo_idx on public.fin_categorias (company_id, nome, tipo);

alter table public.whatsapp_contatos drop constraint if exists whatsapp_contatos_telefone_key;
create unique index if not exists whatsapp_contatos_company_telefone_idx on public.whatsapp_contatos (company_id, telefone);

-- `whatsapp_sessoes` era SINGLETON global (uma linha só pro sistema
-- inteiro) — agora vira "uma linha só POR EMPRESA". Remove a trava antiga e
-- cria a nova; a linha que já existia (da Lume Strada) continua valendo como
-- a sessão da empresa Lume Strada Filmes.
alter table public.whatsapp_sessoes drop constraint if exists whatsapp_sessoes_singleton_check;
alter table public.whatsapp_sessoes drop constraint if exists whatsapp_sessoes_singleton_key;
drop index if exists whatsapp_sessoes_singleton_key;
alter table public.whatsapp_sessoes drop column if exists singleton;
create unique index if not exists whatsapp_sessoes_company_unique_idx on public.whatsapp_sessoes (company_id);

-- Garante que toda empresa NOVA já nasce com sua própria sessão de WhatsApp
-- "desconectado", sem precisar de código de aplicação pra isso.
create or replace function public.seed_whatsapp_sessao_nova_empresa()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.whatsapp_sessoes (company_id, status) values (new.id, 'desconectado')
  on conflict (company_id) do nothing;
  return new;
end;
$$;

drop trigger if exists companies_seed_whatsapp_sessao on public.companies;
create trigger companies_seed_whatsapp_sessao
  after insert on public.companies
  for each row execute function public.seed_whatsapp_sessao_nova_empresa();


-- ============================================================================
-- 6. RLS — reescreve TODAS as policies operacionais existentes acrescentando
-- `company_id = current_company_id()`. Mesmo texto de `using`/`with check`
-- de antes, só com a condição de empresa "ANDada" — os nomes das policies
-- são mantidos (drop + create no lugar), então nada mais no banco referencia
-- nome de policy precisa mudar.
-- ============================================================================

-- Cadastros
drop policy if exists "clientes_staff_all" on public.clientes;
create policy "clientes_staff_all" on public.clientes
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "equipe_membros_admin_all" on public.equipe_membros;
create policy "equipe_membros_admin_all" on public.equipe_membros
  for all to authenticated
  using (public.is_admin() and company_id = public.current_company_id())
  with check (public.is_admin() and company_id = public.current_company_id());

drop policy if exists "cliente_atividades_staff_all" on public.cliente_atividades;
create policy "cliente_atividades_staff_all" on public.cliente_atividades
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- Produção
drop policy if exists "prod_funcionarios_admin_all" on public.prod_funcionarios;
create policy "prod_funcionarios_admin_all" on public.prod_funcionarios
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "prod_tipos_servico_admin_all" on public.prod_tipos_servico;
create policy "prod_tipos_servico_admin_all" on public.prod_tipos_servico
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "prod_tarefas_admin_all" on public.prod_tarefas;
create policy "prod_tarefas_admin_all" on public.prod_tarefas
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "prod_subtarefas_admin_all" on public.prod_subtarefas;
create policy "prod_subtarefas_admin_all" on public.prod_subtarefas
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "prod_entregas_admin_all" on public.prod_entregas;
create policy "prod_entregas_admin_all" on public.prod_entregas
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "prod_entrega_versoes_admin_all" on public.prod_entrega_versoes;
create policy "prod_entrega_versoes_admin_all" on public.prod_entrega_versoes
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- Comercial
drop policy if exists "crm_leads_admin_all" on public.crm_leads;
create policy "crm_leads_admin_all" on public.crm_leads
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "crm_anotacoes_admin_all" on public.crm_anotacoes;
create policy "crm_anotacoes_admin_all" on public.crm_anotacoes
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- Financeiro
drop policy if exists fin_contas_admin on public.fin_contas;
create policy fin_contas_admin on public.fin_contas for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists fin_cartoes_admin on public.fin_cartoes;
create policy fin_cartoes_admin on public.fin_cartoes for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists fin_categorias_admin on public.fin_categorias;
create policy fin_categorias_admin on public.fin_categorias for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists fin_transacoes_admin on public.fin_transacoes;
create policy fin_transacoes_admin on public.fin_transacoes for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists fin_faturas_admin on public.fin_faturas;
create policy fin_faturas_admin on public.fin_faturas for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- Tráfego & Metas (admin/staff + a policy extra de "cliente vê só o próprio")
drop policy if exists "metas_diarias_admin_all" on public.metas_diarias;
create policy "metas_diarias_admin_all" on public.metas_diarias
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "trafego_registros_admin_all" on public.trafego_registros;
create policy "trafego_registros_admin_all" on public.trafego_registros
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "metas_diarias_select_own" on public.metas_diarias;
create policy "metas_diarias_select_own" on public.metas_diarias
  for select to authenticated
  using (cliente_id = auth.uid() and company_id = public.current_company_id());

drop policy if exists "trafego_registros_select_own" on public.trafego_registros;
create policy "trafego_registros_select_own" on public.trafego_registros
  for select to authenticated
  using (
    company_id = public.current_company_id()
    and exists (
      select 1 from public.metas_diarias m
      where m.id = trafego_registros.meta_id and m.cliente_id = auth.uid()
    )
  );

-- Inventário
drop policy if exists "categorias_inventario_admin_all" on public.categorias_inventario;
create policy "categorias_inventario_admin_all" on public.categorias_inventario
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "itens_inventario_admin_all" on public.itens_inventario;
create policy "itens_inventario_admin_all" on public.itens_inventario
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- Info-Produtos / Tráfego pago
drop policy if exists "produtos_staff_all" on public.produtos;
create policy "produtos_staff_all" on public.produtos
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "anuncios_tracking_staff_all" on public.anuncios_tracking;
create policy "anuncios_tracking_staff_all" on public.anuncios_tracking
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "metas_calendario_staff_all" on public.metas_calendario;
create policy "metas_calendario_staff_all" on public.metas_calendario
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "fechamentos_semanais_staff_all" on public.fechamentos_semanais;
create policy "fechamentos_semanais_staff_all" on public.fechamentos_semanais
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- WhatsApp
drop policy if exists "whatsapp_sessoes_admin_all" on public.whatsapp_sessoes;
create policy "whatsapp_sessoes_admin_all" on public.whatsapp_sessoes
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "whatsapp_contatos_admin_all" on public.whatsapp_contatos;
create policy "whatsapp_contatos_admin_all" on public.whatsapp_contatos
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists "whatsapp_mensagens_admin_all" on public.whatsapp_mensagens;
create policy "whatsapp_mensagens_admin_all" on public.whatsapp_mensagens
  for all to authenticated
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());


-- ============================================================================
-- 7. Views calculadas — CRÍTICO. `fin_contas_saldo`, `fin_cartoes_limite` e
-- `prod_entregas_atual` foram criadas sem `security_invoker`, então rodam
-- com o privilégio de quem CRIOU a view (ignorando RLS de quem está
-- consultando) — inofensivo num sistema single-tenant onde só a própria
-- agência usa, mas seria um vazamento direto de dados entre empresas num
-- SaaS multi-tenant (empresa A veria o saldo calculado da empresa B). Recria
-- as 3 com `security_invoker = true`, que passa a respeitar a RLS de quem
-- está de fato consultando.
-- ============================================================================
-- NOTA: `company_id` vai no FINAL da lista de colunas em cada view, não
-- misturado no meio — `CREATE OR REPLACE VIEW` do Postgres proíbe mudar o
-- NOME ou a ORDEM de uma coluna já existente (só permite acrescentar coluna
-- nova no final); colocar `company_id` logo depois do id, como numa tabela
-- normal, quebra a substituição com "cannot change name of view column".
create or replace view public.fin_contas_saldo
with (security_invoker = true) as
select
  c.id as conta_id,
  c.nome,
  c.contexto,
  c.saldo_inicial,
  c.saldo_inicial + coalesce(sum(
    case
      when t.conta_id = c.id and t.tipo = 'receita' and t.pago then t.valor
      when t.conta_id = c.id and t.tipo = 'despesa' and t.pago then -t.valor
      when t.conta_id = c.id and t.tipo = 'transferencia' and t.pago then -t.valor
      when t.conta_destino_id = c.id and t.tipo = 'transferencia' and t.pago then t.valor
      else 0
    end
  ), 0) as saldo_atual,
  c.company_id
from public.fin_contas c
left join public.fin_transacoes t on t.conta_id = c.id or t.conta_destino_id = c.id
group by c.id, c.nome, c.contexto, c.saldo_inicial, c.company_id;

create or replace view public.fin_cartoes_limite
with (security_invoker = true) as
select
  cc.id as cartao_id,
  cc.nome,
  cc.contexto,
  cc.limite,
  coalesce(sum(t.valor) filter (where t.cartao_id = cc.id and not t.fatura_paga), 0) as limite_consumido,
  cc.limite - coalesce(sum(t.valor) filter (where t.cartao_id = cc.id and not t.fatura_paga), 0) as limite_disponivel,
  cc.company_id
from public.fin_cartoes cc
left join public.fin_transacoes t on t.cartao_id = cc.id
group by cc.id, cc.nome, cc.contexto, cc.limite, cc.company_id;

create or replace view public.prod_entregas_atual
with (security_invoker = true) as
select
  e.id as entrega_id,
  e.tarefa_id,
  e.nome,
  v.id as versao_id,
  v.versao,
  v.tipo,
  v.storage_path,
  v.link_url,
  v.nome_arquivo,
  v.tamanho_bytes,
  v.tipo_mime,
  v.status_aprovacao,
  v.observacao_aprovacao,
  v.enviado_por,
  v.aprovado_por,
  v.aprovado_em,
  v.created_at,
  e.company_id
from public.prod_entregas e
left join lateral (
  select * from public.prod_entrega_versoes pv
  where pv.entrega_id = e.id
  order by pv.versao desc
  limit 1
) v on true;


-- ============================================================================
-- 8. `pagar_fatura()` — é SECURITY DEFINER (roda ignorando RLS de propósito,
-- pra poder inserir em `fin_transacoes`/`fin_faturas`), então precisa
-- validar a empresa NA MÃO — sem isso, um COMPANY_ADMIN malicioso poderia
-- pagar a fatura de um cartão de OUTRA empresa só adivinhando/copiando o
-- UUID do cartão. Mesma lógica de antes, só com a checagem de empresa
-- adicionada logo no início e as duas inserções carimbando `company_id`.
-- ============================================================================
create or replace function public.pagar_fatura(p_cartao_id uuid, p_conta_pagamento_id uuid, p_periodo_referencia date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valor_total numeric(12,2);
  v_transacao_id uuid;
  v_fatura_id uuid;
  v_contexto public.fin_contexto;
  v_company_id uuid;
begin
  if not public.is_staff() then
    raise exception 'Você não tem permissão pra pagar faturas.';
  end if;

  v_company_id := public.current_company_id();

  select contexto into v_contexto from public.fin_cartoes where id = p_cartao_id and company_id = v_company_id;
  if v_contexto is null then
    raise exception 'Cartão não encontrado.';
  end if;

  if not exists (select 1 from public.fin_contas where id = p_conta_pagamento_id and company_id = v_company_id) then
    raise exception 'Conta de pagamento não encontrada.';
  end if;

  select coalesce(sum(valor), 0) into v_valor_total
  from public.fin_transacoes
  where cartao_id = p_cartao_id and company_id = v_company_id and not fatura_paga;

  if v_valor_total <= 0 then
    raise exception 'Não há valor em aberto nesse cartão para pagar.';
  end if;

  insert into public.fin_transacoes (tipo, descricao, valor, contexto, conta_id, pago, data_pagamento, data_vencimento, company_id)
  values ('despesa', 'Pagamento de fatura', v_valor_total, v_contexto, p_conta_pagamento_id, true, now(), current_date, v_company_id)
  returning id into v_transacao_id;

  update public.fin_transacoes
  set fatura_paga = true
  where cartao_id = p_cartao_id and company_id = v_company_id and not fatura_paga and id <> v_transacao_id;

  insert into public.fin_faturas (cartao_id, periodo_referencia, valor_total, conta_pagamento_id, transacao_pagamento_id, company_id)
  values (p_cartao_id, p_periodo_referencia, v_valor_total, p_conta_pagamento_id, v_transacao_id, v_company_id)
  returning id into v_fatura_id;

  return v_fatura_id;
end;
$$;


-- ============================================================================
-- 9. `sync_prod_funcionario_from_equipe_membro()` (producao-sync-
-- funcionarios.sql) — mesma correção do item 8: carimba `company_id` na
-- inserção espelhada (senão a inserção falharia contra o NOT NULL/invariante
-- novos do item 4).
-- ============================================================================
create or replace function public.sync_prod_funcionario_from_equipe_membro()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.prod_funcionarios (nome, ativo, equipe_membro_id, company_id)
  values (new.nome, true, new.id, new.company_id)
  on conflict (equipe_membro_id) where equipe_membro_id is not null
  do update set nome = excluded.nome;
  return new;
end;
$$;


-- ============================================================================
-- 10. Fora do escopo desta migração (ver "O que fica de fora" no plano):
--
--   • Buckets de Storage ("producao", "branding", "infoprodutos") continuam
--     com policy só por papel (is_staff()/is_admin()), SEM prefixo de
--     company_id no caminho do arquivo — dois arquivos de empresas
--     diferentes não colidem (nomes são UUID aleatório) e não há como listar
--     o bucket por fora do app, mas o isolamento não é absoluto ainda. Exige
--     mudar `criarUploadAssinadoVersao` (e equivalentes) pra prefixar o
--     caminho com `company_id/` e reescrever as policies de
--     `storage.objects` pra checar esse prefixo — trabalho de aplicação,
--     não só SQL, fica pra próxima etapa.
--
--   • `branding_config` continua GLOBAL (não vira por-empresa nesta etapa)
--     — é a tela de login, que roda ANTES de existir sessão/empresa
--     conhecida; White-Label por empresa é uma decisão de produto à parte
--     (precisa de subdomínio ou seleção de empresa no login) e fica de fora
--     de propósito.
-- ============================================================================
