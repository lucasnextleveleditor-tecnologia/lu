-- Fase 3 do sistema guiado de Orçamentos: Geração de Contratos.
--
-- Um contrato nasce de dois jeitos: (1) a partir de um ORÇAMENTO APROVADO —
-- herda cliente, itens e valor automaticamente (`orcamento_id` preenchido);
-- ou (2) AVULSO — preenchido do zero, sem orçamento vinculado
-- (`orcamento_id` fica null). Os dois casos usam exatamente as mesmas
-- tabelas e telas.
--
-- Cláusulas são um MODELO editável por perfil profissional
-- (`contratos_tipos`, um por empresa por perfil — mesmo padrão de
-- `orc_tipos_orcamento` na Fase 2), com placeholders ({{cliente}},
-- {{empresa}}, {{titulo}}, {{valor_total}}, {{condicoes_pagamento}},
-- {{data}}) substituídos na hora de criar o contrato — o texto final fica
-- gravado (uma cópia própria) em `contratos.clausulas`, sempre editável
-- depois sem afetar o modelo nem outros contratos já criados.
--
-- Assinatura é um ACEITE SIMPLES no link público (nome + data/hora + IP
-- registrados em `contratos.assinado_*`), sem certificado digital — mesmo
-- espírito da aprovação de orçamento em `orcamentos.aprovado_*`.

create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  orcamento_id uuid references public.orcamentos(id) on delete set null,
  tipo_perfil text check (tipo_perfil is null or tipo_perfil in ('filmmaker','videomaker','social_media','storymaker','designer','fotografo','agencia_marketing')),
  titulo text not null,
  cliente_id uuid references public.clientes(id) on delete set null,
  nome_cliente text not null,
  email_cliente text,
  whatsapp_cliente text,
  clausulas text not null default '',
  condicoes_pagamento text,
  observacoes text,
  status text not null default 'rascunho' check (status in ('rascunho', 'enviado', 'visualizado', 'assinado', 'recusado', 'cancelado')),
  token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  enviado_em timestamptz,
  visualizado_em timestamptz,
  assinado_em timestamptz,
  assinado_nome text,
  assinado_ip text,
  recusado_em timestamptz,
  motivo_recusa text,
  criado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.contratos.orcamento_id is 'Orçamento de origem, quando o contrato nasceu de uma proposta aprovada — null pra contrato avulso.';
comment on column public.contratos.clausulas is 'Texto final do contrato (cabeçalho + cláusulas), já com os placeholders do modelo substituídos — cópia própria, edições aqui nunca afetam `contratos_tipos`.';

create index if not exists contratos_company_id_idx on public.contratos (company_id);
create index if not exists contratos_orcamento_id_idx on public.contratos (orcamento_id);
create index if not exists contratos_token_idx on public.contratos (token);

alter table public.contratos enable row level security;

drop policy if exists contratos_staff_all on public.contratos;
create policy contratos_staff_all on public.contratos
  for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop trigger if exists set_updated_at on public.contratos;
create trigger set_updated_at before update on public.contratos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Itens/entregáveis do contrato — mesma forma de `orc_itens`, sem os campos
-- de interatividade do cliente (`opcional`/`selecionado`): depois de gerado,
-- a lista de entregáveis é fixa nesta tela, só o admin edita reabrindo o
-- contrato. Quando o contrato nasce de um orçamento aprovado, os itens são
-- copiados de `orc_itens` (só os selecionados) na criação.
create table if not exists public.contratos_itens (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  nome text not null,
  descricao text,
  quantidade numeric not null default 1,
  valor_unitario numeric not null default 0,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists contratos_itens_contrato_id_idx on public.contratos_itens (contrato_id);

alter table public.contratos_itens enable row level security;

drop policy if exists contratos_itens_staff_all on public.contratos_itens;
create policy contratos_itens_staff_all on public.contratos_itens
  for all
  using (public.is_staff() and exists (select 1 from public.contratos c where c.id = contratos_itens.contrato_id and c.company_id = public.current_company_id()))
  with check (public.is_staff() and exists (select 1 from public.contratos c where c.id = contratos_itens.contrato_id and c.company_id = public.current_company_id()));

-- ----------------------------------------------------------------------------
-- Modelo de cláusulas por perfil profissional — um por (empresa, perfil),
-- mesmo padrão de `orc_tipos_orcamento`. Editável em `/admin/contratos/tipos`.
create table if not exists public.contratos_tipos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  perfil text not null check (perfil in ('filmmaker', 'videomaker', 'social_media', 'storymaker', 'designer', 'fotografo', 'agencia_marketing')),
  clausulas_padrao text not null default '',
  condicoes_pagamento_padrao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, perfil)
);

comment on column public.contratos_tipos.clausulas_padrao is 'Modelo com placeholders {{cliente}}, {{empresa}}, {{titulo}}, {{valor_total}}, {{condicoes_pagamento}} e {{data}} — ver DEFAULT_CLAUSULAS_POR_PERFIL em src/lib/utils/contratos.ts pro rascunho inicial sugerido por perfil (o admin sempre pode editar livremente; recomendável revisar com um advogado antes de usar com clientes reais).';

alter table public.contratos_tipos enable row level security;

drop policy if exists contratos_tipos_staff_all on public.contratos_tipos;
create policy contratos_tipos_staff_all on public.contratos_tipos
  for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop trigger if exists set_updated_at on public.contratos_tipos;
create trigger set_updated_at before update on public.contratos_tipos
  for each row execute function public.set_updated_at();
