-- Fase 2 do sistema guiado de Orçamentos: Tipos de Orçamento por perfil
-- profissional (modelos editáveis, um por perfil) + a tag `tipo_perfil` no
-- orçamento em si, pra registrar com qual modelo ele foi criado. Também
-- prepara o terreno pro construtor anexar itens de Portfólio (Fase 1) a um
-- orçamento específico — a tabela de vínculo já existia
-- (`orc_orcamento_portfolio`), só faltava a tela usar.

-- ----------------------------------------------------------------------------
-- 1) Tag de perfil no orçamento.
alter table public.orcamentos
  add column if not exists tipo_perfil text
    check (tipo_perfil is null or tipo_perfil in ('filmmaker','videomaker','social_media','storymaker','designer','fotografo','agencia_marketing'));

comment on column public.orcamentos.tipo_perfil is 'Perfil profissional escolhido ao criar o orçamento (ver PerfilOrcamento em src/lib/types/orcamentos.ts) — só rótulo/sugestão, nunca restringe o catálogo disponível. Null = orçamento avulso.';

-- ----------------------------------------------------------------------------
-- 2) Modelo (cabeçalho) por perfil por empresa — condições de pagamento,
-- observações e validade padrão que pré-preenchem um orçamento novo daquele
-- tipo. Editável a qualquer momento em /admin/orcamentos/tipos. Um único
-- modelo por (empresa, perfil) — criar de novo com o mesmo perfil faz
-- upsert, nunca duplica.
create table if not exists public.orc_tipos_orcamento (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  perfil text not null check (perfil in ('filmmaker','videomaker','social_media','storymaker','designer','fotografo','agencia_marketing')),
  condicoes_pagamento_padrao text,
  observacoes_padrao text,
  validade_dias_padrao integer not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, perfil)
);

alter table public.orc_tipos_orcamento enable row level security;

drop policy if exists orc_tipos_orcamento_staff_all on public.orc_tipos_orcamento;
create policy orc_tipos_orcamento_staff_all on public.orc_tipos_orcamento
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

drop trigger if exists set_updated_at on public.orc_tipos_orcamento;
create trigger set_updated_at before update on public.orc_tipos_orcamento
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3) Itens padrão de cada modelo — pré-carregados no construtor quando o
-- perfil é escolhido num orçamento NOVO (nunca sobrescreve um orçamento já
-- com itens sem confirmação explícita — ver `OrcamentoBuilder.tsx`).
-- `servico_id` é opcional: um item de modelo pode ser "personalizado", só
-- existindo dentro do modelo, sem estar cadastrado no catálogo — mesmo
-- espírito de `orc_itens.servico_id`.
create table if not exists public.orc_tipos_orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  tipo_orcamento_id uuid not null references public.orc_tipos_orcamento(id) on delete cascade,
  servico_id uuid references public.orc_servicos(id) on delete set null,
  nome text not null,
  descricao text,
  quantidade numeric not null default 1,
  valor_unitario numeric not null default 0,
  opcional boolean not null default false,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists orc_tipos_orcamento_itens_tipo_id_idx on public.orc_tipos_orcamento_itens(tipo_orcamento_id);

alter table public.orc_tipos_orcamento_itens enable row level security;

drop policy if exists orc_tipos_orcamento_itens_staff_all on public.orc_tipos_orcamento_itens;
create policy orc_tipos_orcamento_itens_staff_all on public.orc_tipos_orcamento_itens
  for all
  using (is_staff() and exists (select 1 from public.orc_tipos_orcamento t where t.id = tipo_orcamento_id and t.company_id = current_company_id()))
  with check (is_staff() and exists (select 1 from public.orc_tipos_orcamento t where t.id = tipo_orcamento_id and t.company_id = current_company_id()));
