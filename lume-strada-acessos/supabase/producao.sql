-- ============================================================================
-- Lume Strada Filmes — Módulo B: Produção / Tarefas
-- ============================================================================
-- Rode DEPOIS de `schema.sql` (precisa de `public.is_admin()`, da tabela
-- `profiles` e da função `public.set_updated_at()` já existirem). Idempotente
-- — seguro rodar de novo, igual o `schema.sql` principal. Se você já rodou
-- uma versão anterior deste arquivo (`prod_tarefas` com `responsavel` texto
-- livre e `descricao`), rode a seção "8. MIGRAÇÃO" no fim antes do resto.
--
-- Escopo (mesma decisão do Financeiro): só o admin usa por enquanto. O
-- fluxo de "Aprovar / Solicitar Alteração" já está pronto pra abrir pro
-- próprio cliente depois — é só adicionar uma policy de select/update
-- restrita a `cliente_id = auth.uid()`, sem migração de dados.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCIONÁRIOS — lista simples de quem pode ser Responsável por uma
--    tarefa. Não é uma conta de login (o sistema ainda só tem admin/cliente)
--    — é só um cadastro de nome, pra virar um vínculo de verdade (FK) em vez
--    de texto livre.
-- ----------------------------------------------------------------------------
create table if not exists public.prod_funcionarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. TIPOS DE SERVIÇO — categorização da natureza da tarefa (Captação,
--    Edição de Foto, Edição de Vídeo, Arte, Tráfego, Copywriting...).
--    Cadastro livre pelo admin (igual `fin_categorias` do Financeiro), não
--    uma lista fixa no código — a agência pode ter tipos diferentes.
-- ----------------------------------------------------------------------------
create table if not exists public.prod_tipos_servico (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. TAREFAS — o card principal. Board Kanban por `status`.
-- ----------------------------------------------------------------------------
create table if not exists public.prod_tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  briefing text, -- rich text (HTML) — o briefing completo da tarefa
  cliente_id uuid references public.profiles(id) on delete set null,
  responsavel_id uuid references public.prod_funcionarios(id) on delete set null,
  tipo_servico_id uuid references public.prod_tipos_servico(id) on delete set null,
  status text not null default 'backlog'
    check (status in ('backlog', 'a_fazer', 'em_producao', 'revisao_interna', 'preview_cliente', 'concluida')),
  prioridade text not null default 'normal' check (prioridade in ('baixa', 'normal', 'alta', 'urgente')),
  data_captacao date, -- dia da gravação/filmagem — separado da data de entrega (ver módulo Dashboard/Calendário)
  data_entrega date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prod_tarefas_status_idx on public.prod_tarefas (status);
create index if not exists prod_tarefas_cliente_idx on public.prod_tarefas (cliente_id);
create index if not exists prod_tarefas_responsavel_idx on public.prod_tarefas (responsavel_id);
create index if not exists prod_tarefas_data_captacao_idx on public.prod_tarefas (data_captacao);
create index if not exists prod_tarefas_data_entrega_idx on public.prod_tarefas (data_entrega);

drop trigger if exists prod_tarefas_set_updated_at on public.prod_tarefas;
create trigger prod_tarefas_set_updated_at
  before update on public.prod_tarefas
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. SUBTAREFAS — checklist simples dentro do card (decupagem, color
--    grading, exportação...).
-- ----------------------------------------------------------------------------
create table if not exists public.prod_subtarefas (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.prod_tarefas(id) on delete cascade,
  titulo text not null,
  concluida boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists prod_subtarefas_tarefa_idx on public.prod_subtarefas (tarefa_id);

-- ----------------------------------------------------------------------------
-- 5/6. ENTREGAS + VERSÕES — cada "entrega" é um slot nomeado (ex: "Vídeo
-- Final", "Preview Instagram"); cada envio pra esse slot vira uma VERSÃO
-- nova (V1, V2, V3...), nunca sobrescreve a anterior. Uma versão pode ser um
-- ARQUIVO (upload pro Storage) ou um LINK externo (Vimeo, Drive, Frame.io)
-- — nunca os dois. Cada versão carrega seu próprio status de aprovação:
-- quando o gestor/cliente aprova, a tarefa inteira vira "concluida"; quando
-- pede alteração, a tarefa volta pra produção e o PRÓXIMO envio (na mesma
-- entrega) já nasce como a versão seguinte, preservando o histórico.
-- ----------------------------------------------------------------------------
create table if not exists public.prod_entregas (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.prod_tarefas(id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now()
);

create index if not exists prod_entregas_tarefa_idx on public.prod_entregas (tarefa_id);

create table if not exists public.prod_entrega_versoes (
  id uuid primary key default gen_random_uuid(),
  entrega_id uuid not null references public.prod_entregas(id) on delete cascade,
  versao integer not null check (versao > 0),

  tipo text not null default 'arquivo' check (tipo in ('arquivo', 'link')),
  storage_path text, -- preenchido quando tipo = 'arquivo'
  link_url text, -- preenchido quando tipo = 'link' (Vimeo, Drive, Frame.io...)
  nome_arquivo text not null, -- nome do arquivo OU um rótulo curto pro link
  tamanho_bytes bigint,
  tipo_mime text,

  status_aprovacao text not null default 'pendente'
    check (status_aprovacao in ('pendente', 'aprovado', 'alteracao_solicitada')),
  observacao_aprovacao text, -- feedback de "o que mudar", preenchido em Solicitar Alteração

  enviado_por uuid references public.profiles(id) on delete set null,
  aprovado_por uuid references public.profiles(id) on delete set null,
  aprovado_em timestamptz,

  created_at timestamptz not null default now(),
  unique (entrega_id, versao),
  constraint prod_entrega_versoes_fonte_valida check (
    (tipo = 'arquivo' and storage_path is not null and link_url is null)
    or
    (tipo = 'link' and link_url is not null and storage_path is null)
  )
);

create index if not exists prod_entrega_versoes_entrega_idx on public.prod_entrega_versoes (entrega_id);

-- View calculada: a versão MAIS RECENTE de cada entrega (nunca guardamos
-- "versão atual" como coluna — mesmo princípio das views de saldo/limite do
-- Financeiro: a fonte da verdade é a lista de versões, o "atual" é derivado).
create or replace view public.prod_entregas_atual as
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
  v.created_at
from public.prod_entregas e
left join lateral (
  select * from public.prod_entrega_versoes pv
  where pv.entrega_id = e.id
  order by pv.versao desc
  limit 1
) v on true;

-- ----------------------------------------------------------------------------
-- 7. RLS — admin-only por enquanto (ver comentário no topo do arquivo).
-- ----------------------------------------------------------------------------
alter table public.prod_funcionarios enable row level security;
alter table public.prod_tipos_servico enable row level security;
alter table public.prod_tarefas enable row level security;
alter table public.prod_subtarefas enable row level security;
alter table public.prod_entregas enable row level security;
alter table public.prod_entrega_versoes enable row level security;

drop policy if exists "prod_funcionarios_admin_all" on public.prod_funcionarios;
create policy "prod_funcionarios_admin_all" on public.prod_funcionarios
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prod_tipos_servico_admin_all" on public.prod_tipos_servico;
create policy "prod_tipos_servico_admin_all" on public.prod_tipos_servico
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prod_tarefas_admin_all" on public.prod_tarefas;
create policy "prod_tarefas_admin_all" on public.prod_tarefas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prod_subtarefas_admin_all" on public.prod_subtarefas;
create policy "prod_subtarefas_admin_all" on public.prod_subtarefas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prod_entregas_admin_all" on public.prod_entregas;
create policy "prod_entregas_admin_all" on public.prod_entregas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prod_entrega_versoes_admin_all" on public.prod_entrega_versoes;
create policy "prod_entrega_versoes_admin_all" on public.prod_entrega_versoes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Storage — bucket "producao" (arquivos/entregas). PRIVADO (ao contrário
-- do bucket "branding") — são arquivos internos/de cliente, não algo que a
-- tela de login precisa carregar sem sessão. Leitura e escrita só-admin; o
-- app gera links assinados (`createSignedUrl`) com validade curta pra
-- download, nunca uma URL pública fixa.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('producao', 'producao', false)
on conflict (id) do nothing;

drop policy if exists "producao_bucket_admin_select" on storage.objects;
create policy "producao_bucket_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'producao' and public.is_admin());

drop policy if exists "producao_bucket_admin_insert" on storage.objects;
create policy "producao_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'producao' and public.is_admin());

drop policy if exists "producao_bucket_admin_update" on storage.objects;
create policy "producao_bucket_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'producao' and public.is_admin())
  with check (bucket_id = 'producao' and public.is_admin());

drop policy if exists "producao_bucket_admin_delete" on storage.objects;
create policy "producao_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'producao' and public.is_admin());

-- ============================================================================
-- MIGRAÇÃO — só rode isto se você já tinha aplicado uma versão ANTERIOR
-- deste arquivo (com `prod_tarefas.descricao` e `prod_tarefas.responsavel`
-- como texto livre). Se está rodando pela primeira vez, ignore esta seção —
-- as tabelas acima já nascem no formato novo.
-- ============================================================================
-- alter table public.prod_tarefas rename column descricao to briefing;
-- alter table public.prod_tarefas add column if not exists responsavel_id uuid references public.prod_funcionarios(id) on delete set null;
-- alter table public.prod_tarefas add column if not exists tipo_servico_id uuid references public.prod_tipos_servico(id) on delete set null;
-- alter table public.prod_tarefas drop column if exists responsavel;
-- alter table public.prod_tarefas drop constraint if exists prod_tarefas_status_check;
-- alter table public.prod_tarefas add constraint prod_tarefas_status_check check (status in ('backlog','a_fazer','em_producao','revisao_interna','preview_cliente','concluida'));
-- alter table public.prod_tarefas drop constraint if exists prod_tarefas_prioridade_check;
-- alter table public.prod_tarefas add constraint prod_tarefas_prioridade_check check (prioridade in ('baixa','normal','alta','urgente'));
-- update public.prod_tarefas set prioridade = 'normal' where prioridade = 'media';
-- alter table public.prod_entrega_versoes add column if not exists tipo text not null default 'arquivo' check (tipo in ('arquivo','link'));
-- alter table public.prod_entrega_versoes add column if not exists link_url text;
-- alter table public.prod_entrega_versoes alter column storage_path drop not null;
-- alter table public.prod_entrega_versoes add column if not exists status_aprovacao text not null default 'pendente' check (status_aprovacao in ('pendente','aprovado','alteracao_solicitada'));
-- alter table public.prod_entrega_versoes add column if not exists observacao_aprovacao text;
-- alter table public.prod_entrega_versoes add column if not exists aprovado_por uuid references public.profiles(id) on delete set null;
-- alter table public.prod_entrega_versoes add column if not exists aprovado_em timestamptz;
