-- Proposta Comercial Web v2 — traz o construtor de Orçamentos pro mesmo
-- nível de completude de uma proposta web "premium" (capa com imagem de
-- fundo própria, cor de destaque customizável, resumo de projeto (objetivo
-- já existia, ganha companhia de diárias/equipe/itens de entrega),
-- investimento em colunas nomeadas (descritivas, ao lado do total já
-- calculado por `orc_itens`), logos de clientes atendidos e contato
-- comercial no encerramento. Mesma convenção de arquivo/comentário de
-- `orcamentos-pdf-institucional.sql`/`orcamentos-encerramento.sql`: um
-- arquivo por incremento de feature, sempre `add column if not exists`.

-- ----------------------------------------------------------------------------
-- 1) Capa + cor de destaque — POR ORÇAMENTO (muda a cada proposta, ao
-- contrário do logo/banner/rodapé da agência em `companies`, que é fixo pra
-- toda proposta enviada). `capa_path` reaproveita o bucket "orcamentos-midia"
-- já existente (prefixo `capa/`, ver `portfolio-actions.ts`).
-- ----------------------------------------------------------------------------
alter table public.orcamentos
  add column if not exists cor_destaque text,
  add column if not exists capa_path text,
  add column if not exists capa_subtitulo text,
  add column if not exists escala_texto_capa numeric(3, 2) not null default 1.00,
  add column if not exists quantidade_diarias text,
  add column if not exists equipe_escalada text;

comment on column public.orcamentos.cor_destaque is 'Cor de destaque (hex, ex: #7c3aed) aplicada em títulos/bordas/glows desta proposta web específica. Null = usa a cor padrão do app.';
comment on column public.orcamentos.capa_path is 'Path no bucket orcamentos-midia da imagem de fundo (tela inteira) da capa desta proposta — diferente de companies.orc_banner_path (fixo da agência). Null = usa o banner da agência ou o degradê padrão.';
comment on column public.orcamentos.capa_subtitulo is 'Subtítulo/badge exibido acima do título na capa (ex: "Proposta Premium"). Null = usa o rótulo padrão ("Proposta Comercial").';
comment on column public.orcamentos.escala_texto_capa is 'Fator de escala (0.80 a 1.20) do texto da capa — ajuste fino de impacto visual sem mudar o layout.';
comment on column public.orcamentos.quantidade_diarias is 'Texto livre (ex: "3 diárias", "Sob demanda") — quantidade de diárias/dias de trabalho previstos, exibido no Resumo do Projeto. Null = seção omitida.';
comment on column public.orcamentos.equipe_escalada is 'Equipe escalada pro projeto, separada por vírgula (ex: "01x Diretor, 02x Câmeras") — exibida como chips no Resumo do Projeto. Null = seção omitida.';

-- ----------------------------------------------------------------------------
-- 2) Itens de Entrega — tabela de deliverables (o quê + prazo), diferente
-- de `orc_itens` (que é linha de PREÇO). Mesmo padrão de tabela filha sem
-- `company_id` próprio de `orc_itens` (herda posse via `orcamento_id`).
-- ----------------------------------------------------------------------------
create table if not exists public.orc_itens_entrega (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,

  item text not null,
  prazo text,
  ordem integer not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists orc_itens_entrega_orcamento_idx on public.orc_itens_entrega (orcamento_id);

alter table public.orc_itens_entrega enable row level security;

drop policy if exists orc_itens_entrega_admin on public.orc_itens_entrega;
create policy orc_itens_entrega_admin on public.orc_itens_entrega for all
  using (public.is_staff() and exists (
    select 1 from public.orcamentos o where o.id = orc_itens_entrega.orcamento_id and o.company_id = public.current_company_id()
  ))
  with check (public.is_staff() and exists (
    select 1 from public.orcamentos o where o.id = orc_itens_entrega.orcamento_id and o.company_id = public.current_company_id()
  ));

-- ----------------------------------------------------------------------------
-- 3) Colunas de Investimento — blocos DESCRITIVOS (ex: "Equipe & Equipamento",
-- "Pós-Produção") ao lado do valor total já calculado a partir de `orc_itens`.
-- `itens` guarda uma lista solta, uma linha por item (texto puro, sem
-- formatação) — o mesmo padrão de `companies.orc_clientes_atendidos`.
-- ----------------------------------------------------------------------------
create table if not exists public.orc_colunas_investimento (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,

  titulo text not null,
  itens text,
  ordem integer not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists orc_colunas_investimento_orcamento_idx on public.orc_colunas_investimento (orcamento_id);

alter table public.orc_colunas_investimento enable row level security;

drop policy if exists orc_colunas_investimento_admin on public.orc_colunas_investimento;
create policy orc_colunas_investimento_admin on public.orc_colunas_investimento for all
  using (public.is_staff() and exists (
    select 1 from public.orcamentos o where o.id = orc_colunas_investimento.orcamento_id and o.company_id = public.current_company_id()
  ))
  with check (public.is_staff() and exists (
    select 1 from public.orcamentos o where o.id = orc_colunas_investimento.orcamento_id and o.company_id = public.current_company_id()
  ));

-- ----------------------------------------------------------------------------
-- 4) Extensão do "Quem Somos" + encerramento — POR EMPRESA (mesma
-- convenção `orc_*` em `companies` de `orcamentos-encerramento.sql`): logos
-- de até 6 clientes atendidos (imagens, complementa `orc_clientes_atendidos`
-- que é só texto) e contato comercial exibido no encerramento da proposta.
-- ----------------------------------------------------------------------------
alter table public.companies
  add column if not exists orc_clientes_logos_paths text[],
  add column if not exists orc_logos_tamanho_px integer not null default 60,
  add column if not exists orc_email_comercial text,
  add column if not exists orc_site_comercial text;

comment on column public.companies.orc_clientes_logos_paths is 'Até 6 paths no bucket orcamentos-midia com logos de clientes/marcas já atendidas (array, posição null = slot vazio) — exibidos junto ao "Quem Somos" da proposta, complementando orc_clientes_atendidos (texto).';
comment on column public.companies.orc_logos_tamanho_px is 'Altura em pixels dos logos de clientes exibidos na proposta (padrão 60px).';
comment on column public.companies.orc_email_comercial is 'E-mail comercial exibido no encerramento da proposta (link público), ao lado de orc_texto_encerramento. Null = omitido.';
comment on column public.companies.orc_site_comercial is 'Site/URL comercial exibido no encerramento da proposta (link público). Null = omitido.';
