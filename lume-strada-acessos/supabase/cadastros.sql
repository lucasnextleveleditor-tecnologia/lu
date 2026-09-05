-- ============================================================================
-- Lume Strada Filmes — Módulo Central de Cadastros (Clientes & Equipe) +
-- RBAC por Funcionário
-- ============================================================================
-- Rode DEPOIS de `schema.sql`. Idempotente — seguro rodar de novo. Pode
-- rodar independente de quais módulos operacionais (financeiro/producao/
-- comercial/whatsapp) você já instalou — cada bloco abaixo só mexe na
-- policy de um módulo se a tabela dele já existir.
--
-- O QUE MUDA:
-- 1. `profiles` ganha um 3º papel (`funcionario`, além de `admin`/
--    `cliente`) e uma coluna `permissoes` (jsonb) — quais módulos do menu
--    aquele funcionário pode acessar.
-- 2. Duas tabelas novas: `clientes` (cadastro completo — Razão Social/CNPJ/
--    endereço etc., SEM nenhum campo de contrato, de propósito) e
--    `equipe_membros` (cadastro completo de RH/acesso da equipe).
-- 3. O botão "Convidar Cliente" solto vira uma AÇÃO dentro do cadastro
--    (Gerar Acesso) — ver `src/app/admin/actions.ts`. `clientes.profile_id`/
--    `equipe_membros.profile_id` ficam null até isso acontecer.
--
-- MODELO DE SEGURANÇA (leia isto): o RLS abaixo usa `public.is_staff()` —
-- só distingue "é admin OU funcionário" (acesso de banco, grosso). A
-- permissão FINA (qual módulo específico) é checada na aplicação, em toda
-- Server Action e página (`requireModulo`/`requireModuloOuRedirect` em
-- `lib/auth/requireAdmin.ts`). Pra uma ferramenta interna de agência (sem
-- acesso de terceiros ao banco), isso é suficiente e evita duplicar a
-- lógica de "qual chave de permissão" em SQL pra cada tabela de cada
-- módulo. `equipe_membros` e `Aparência` continuam SEMPRE admin-only, em
-- todas as camadas — nunca delegáveis por toggle.
--
-- Escopo (mesma decisão de sempre): sem `company_id`/multi-tenant ainda.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. `profiles` — novo papel + coluna de permissões
-- ----------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'funcionario', 'cliente'));

alter table public.profiles add column if not exists permissoes jsonb not null default '{}'::jsonb;

-- ----------------------------------------------------------------------------
-- 1. Helper `is_staff()` — "é admin OU funcionário" (acesso de banco
-- grosso; a permissão fina de cada funcionário é checada na aplicação, ver
-- nota de segurança acima). Mesmo padrão SECURITY DEFINER de `is_admin()`
-- (evita recursão de RLS).
-- ----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'funcionario')
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. CLIENTES — cadastro completo, independente de ter login. Chave
-- estrangeira que os módulos operacionais podem usar pra vincular um
-- cliente de verdade (ver nota abaixo sobre módulos já existentes).
-- ----------------------------------------------------------------------------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),

  nome text not null, -- Razão Social / Nome Completo
  documento text, -- CNPJ / CPF
  email text,
  telefone text, -- Telefone / WhatsApp
  nome_responsavel text,
  endereco text, -- Endereço Completo (campo único, texto livre — pedido assim no requisito)

  profile_id uuid references public.profiles(id) on delete set null, -- null até "Gerar Acesso" ser usado

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clientes_documento_idx on public.clientes (documento) where documento is not null;
create unique index if not exists clientes_profile_idx on public.clientes (profile_id) where profile_id is not null;

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

drop policy if exists "clientes_staff_all" on public.clientes;
create policy "clientes_staff_all" on public.clientes
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- NOTA sobre módulos já existentes (Produção/Tráfego/Comercial): eles
-- continuam referenciando o CLIENTE PELO PROFILE (`cliente_id -> profiles.
-- id`), exatamente como antes — não foi alterado. Repontar essas 3 FKs pra
-- `clientes.id` exigiria reescrever RLS e queries dos três módulos em cima
-- de dados já em produção, risco alto pra um ganho baixo (o cadastro rico
-- em `clientes` já fica acessível vinculando por `profile_id`). Se um dia
-- fizer sentido migrar de verdade, é um trabalho à parte, deliberado.

-- ----------------------------------------------------------------------------
-- 3. EQUIPE_MEMBROS — cadastro completo de RH/acesso da equipe.
-- Continua sendo uma tabela SEPARADA de `prod_funcionarios` (o dropdown
-- simples "Responsável" das tarefas de Produção — são conceitos diferentes,
-- ver comentário no tipo TS `EquipeMembroRow`), mas desde
-- `producao-sync-funcionarios.sql` os dois ficam SINCRONIZADOS: todo membro
-- criado/renomeado aqui gera (via trigger) um espelho automático em
-- `prod_funcionarios`, então cadastrar alguém em Cadastros → Equipe já basta
-- pra essa pessoa aparecer como opção de Responsável em Produção — não é
-- mais preciso cadastrar o nome de novo nas Configurações de Produção. Rode
-- esse script DEPOIS deste arquivo (precisa de `equipe_membros` já existindo).
-- ----------------------------------------------------------------------------
create table if not exists public.equipe_membros (
  id uuid primary key default gen_random_uuid(),

  nome text not null,
  cargo text, -- Cargo / Função — ex: Editor, Designer, Gestor de Tráfego
  email text,
  telefone text,

  profile_id uuid references public.profiles(id) on delete set null, -- null até "Gerar Acesso" ser usado

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists equipe_membros_profile_idx on public.equipe_membros (profile_id) where profile_id is not null;

drop trigger if exists equipe_membros_set_updated_at on public.equipe_membros;
create trigger equipe_membros_set_updated_at
  before update on public.equipe_membros
  for each row execute function public.set_updated_at();

alter table public.equipe_membros enable row level security;

-- Admin-only SEMPRE — nunca delegável (ver nota de segurança no topo do arquivo).
drop policy if exists "equipe_membros_admin_all" on public.equipe_membros;
create policy "equipe_membros_admin_all" on public.equipe_membros
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Atualiza as policies dos módulos operacionais já instalados: trocam
-- `is_admin()` por `is_staff()` — funcionário com a permissão certa
-- (checada na aplicação) agora consegue passar pelo RLS também. Cada bloco
-- só roda se o módulo já foi instalado (idempotente e seguro em qualquer
-- ordem de instalação).
-- ----------------------------------------------------------------------------

-- Tráfego & Metas (schema.sql — sempre presente)
drop policy if exists "metas_diarias_admin_all" on public.metas_diarias;
create policy "metas_diarias_admin_all" on public.metas_diarias
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "trafego_registros_admin_all" on public.trafego_registros;
create policy "trafego_registros_admin_all" on public.trafego_registros
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Inventário & Patrimônio (schema.sql — sempre presente)
drop policy if exists "categorias_inventario_admin_all" on public.categorias_inventario;
create policy "categorias_inventario_admin_all" on public.categorias_inventario
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "itens_inventario_admin_all" on public.itens_inventario;
create policy "itens_inventario_admin_all" on public.itens_inventario
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Financeiro (financeiro.sql — opcional)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'fin_contas') then
    drop policy if exists fin_contas_admin on public.fin_contas;
    create policy fin_contas_admin on public.fin_contas for all using (public.is_staff()) with check (public.is_staff());

    drop policy if exists fin_cartoes_admin on public.fin_cartoes;
    create policy fin_cartoes_admin on public.fin_cartoes for all using (public.is_staff()) with check (public.is_staff());

    drop policy if exists fin_categorias_admin on public.fin_categorias;
    create policy fin_categorias_admin on public.fin_categorias for all using (public.is_staff()) with check (public.is_staff());

    drop policy if exists fin_transacoes_admin on public.fin_transacoes;
    create policy fin_transacoes_admin on public.fin_transacoes for all using (public.is_staff()) with check (public.is_staff());

    drop policy if exists fin_faturas_admin on public.fin_faturas;
    create policy fin_faturas_admin on public.fin_faturas for all using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- pagar_fatura() checa admin por dentro da função (além do RLS) — também
-- precisa aceitar funcionário com permissão agora.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'pagar_fatura') then
    create or replace function public.pagar_fatura(p_cartao_id uuid, p_conta_pagamento_id uuid, p_periodo_referencia date)
    returns uuid
    language plpgsql
    security definer
    set search_path = public
    as $fn$
    declare
      v_valor_total numeric(12,2);
      v_transacao_id uuid;
      v_fatura_id uuid;
      v_contexto public.fin_contexto;
    begin
      if not public.is_staff() then
        raise exception 'Você não tem permissão pra pagar faturas.';
      end if;

      select contexto into v_contexto from public.fin_cartoes where id = p_cartao_id;
      if v_contexto is null then
        raise exception 'Cartão não encontrado.';
      end if;

      select coalesce(sum(valor), 0) into v_valor_total
      from public.fin_transacoes
      where cartao_id = p_cartao_id and not fatura_paga;

      if v_valor_total <= 0 then
        raise exception 'Não há valor em aberto nesse cartão para pagar.';
      end if;

      insert into public.fin_transacoes (tipo, descricao, valor, contexto, conta_id, pago, data_pagamento, data_vencimento)
      values ('despesa', 'Pagamento de fatura', v_valor_total, v_contexto, p_conta_pagamento_id, true, now(), current_date)
      returning id into v_transacao_id;

      update public.fin_transacoes
      set fatura_paga = true
      where cartao_id = p_cartao_id and not fatura_paga and id <> v_transacao_id;

      insert into public.fin_faturas (cartao_id, periodo_referencia, valor_total, conta_pagamento_id, transacao_pagamento_id)
      values (p_cartao_id, p_periodo_referencia, v_valor_total, p_conta_pagamento_id, v_transacao_id)
      returning id into v_fatura_id;

      return v_fatura_id;
    end;
    $fn$;
  end if;
end $$;

-- Produção & Tarefas (producao.sql — opcional)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'prod_tarefas') then
    drop policy if exists "prod_funcionarios_admin_all" on public.prod_funcionarios;
    create policy "prod_funcionarios_admin_all" on public.prod_funcionarios
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "prod_tipos_servico_admin_all" on public.prod_tipos_servico;
    create policy "prod_tipos_servico_admin_all" on public.prod_tipos_servico
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "prod_tarefas_admin_all" on public.prod_tarefas;
    create policy "prod_tarefas_admin_all" on public.prod_tarefas
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "prod_subtarefas_admin_all" on public.prod_subtarefas;
    create policy "prod_subtarefas_admin_all" on public.prod_subtarefas
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "prod_entregas_admin_all" on public.prod_entregas;
    create policy "prod_entregas_admin_all" on public.prod_entregas
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "prod_entrega_versoes_admin_all" on public.prod_entrega_versoes;
    create policy "prod_entrega_versoes_admin_all" on public.prod_entrega_versoes
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- Storage do bucket "producao" — sempre seguro recriar, mesmo que o bucket
-- ainda não tenha sido criado (a policy só passa a valer quando ele existir).
-- Nomes têm que bater exatamente com os criados por `producao.sql`.
drop policy if exists "producao_bucket_admin_select" on storage.objects;
create policy "producao_bucket_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'producao' and public.is_staff());

drop policy if exists "producao_bucket_admin_insert" on storage.objects;
create policy "producao_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'producao' and public.is_staff());

drop policy if exists "producao_bucket_admin_update" on storage.objects;
create policy "producao_bucket_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'producao' and public.is_staff())
  with check (bucket_id = 'producao' and public.is_staff());

drop policy if exists "producao_bucket_admin_delete" on storage.objects;
create policy "producao_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'producao' and public.is_staff());

-- Comercial / CRM (comercial.sql — opcional)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'crm_leads') then
    drop policy if exists "crm_leads_admin_all" on public.crm_leads;
    create policy "crm_leads_admin_all" on public.crm_leads
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "crm_anotacoes_admin_all" on public.crm_anotacoes;
    create policy "crm_anotacoes_admin_all" on public.crm_anotacoes
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- WhatsApp (whatsapp.sql — opcional)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'whatsapp_sessoes') then
    drop policy if exists "whatsapp_sessoes_admin_all" on public.whatsapp_sessoes;
    create policy "whatsapp_sessoes_admin_all" on public.whatsapp_sessoes
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "whatsapp_contatos_admin_all" on public.whatsapp_contatos;
    create policy "whatsapp_contatos_admin_all" on public.whatsapp_contatos
      for all to authenticated using (public.is_staff()) with check (public.is_staff());

    drop policy if exists "whatsapp_mensagens_admin_all" on public.whatsapp_mensagens;
    create policy "whatsapp_mensagens_admin_all" on public.whatsapp_mensagens
      for all to authenticated using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 5. CLIENTE_ATIVIDADES — atividades & tarefas registradas DENTRO do
-- cadastro do cliente (aba Clientes da Central de Cadastros). Isto é
-- DELIBERADAMENTE um checklist/histórico leve e separado do board de
-- Produção (`prod_tarefas`, Kanban de entregas/versões) — não reaproveita
-- aquela tabela nem o FK `cliente_id -> profiles.id` que ela já usa em
-- produção. Motivo: `prod_tarefas` já está viva e ligada ao fluxo de
-- entregas/versões da Produção; misturar as duas coisas exigiria repontar
-- FKs de um módulo já em uso — o mesmo risco documentado na seção 2 acima
-- sobre não migrar `clientes`. Aqui é só o acompanhamento comercial do
-- cliente em si (ex: "Ligar sobre renovação", "Enviar proposta") — quem
-- precisa de produção de verdade (entrega, versão, revisão) continua usando
-- o módulo de Produção normalmente.
-- ----------------------------------------------------------------------------
create table if not exists public.cliente_atividades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,

  tipo text not null default 'tarefa' check (tipo in ('tarefa', 'nota')),
  titulo text not null,
  descricao text,
  concluida boolean not null default false, -- só relevante quando tipo = 'tarefa' — notas não têm estado de conclusão
  data_prevista date,

  criado_por uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cliente_atividades_cliente_idx on public.cliente_atividades (cliente_id, created_at desc);

drop trigger if exists cliente_atividades_set_updated_at on public.cliente_atividades;
create trigger cliente_atividades_set_updated_at
  before update on public.cliente_atividades
  for each row execute function public.set_updated_at();

alter table public.cliente_atividades enable row level security;

drop policy if exists "cliente_atividades_staff_all" on public.cliente_atividades;
create policy "cliente_atividades_staff_all" on public.cliente_atividades
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());
