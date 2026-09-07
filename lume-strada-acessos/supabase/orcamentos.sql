-- ============================================================================
-- Módulo ORÇAMENTOS — catálogo de serviços (Marketing, Captação Audiovisual,
-- Edição de Vídeos, etc.) + construtor de proposta comercial pra cliente, com
-- link público (sem login) onde o cliente vê, personaliza itens opcionais,
-- aprova ou recusa. Roda DEPOIS de `schema.sql`, `cadastros.sql` e
-- `multitenant-migration.sql` (usa `is_staff()`, `set_updated_at()` e
-- `current_company_id()` já criados por eles).
--
-- Diferença de propósito em relação a `prod_tipos_servico` (Produção/
-- Comercial): aquela é só uma etiqueta plana (nome), sem preço nem
-- categoria — usada pra TAGGEAR tarefa/lead. Aqui é um catálogo de
-- verdade (categoria + preço), pensado pra montar documento de cobrança.
-- Propositalmente uma tabela nova em vez de "enriquecer" `prod_tipos_servico`
-- com preço/categoria — evita mexer num cadastro compartilhado por dois
-- módulos que já funcionam, só pra um terceiro módulo novo.
--
-- Segurança do LINK PÚBLICO (`/orcamento/[token]`, sem login): o token é uma
-- string aleatória de 32 bytes (~256 bits de entropia — impossível de
-- adivinhar por força bruta). RLS do Postgres não sabe filtrar por um valor
-- arbitrário vindo da URL (só sabe `auth.uid()`/role da sessão), então a
-- página pública NÃO tem policy de `anon` nenhuma aqui — ela lê/escreve via
-- `createAdminClient()` (Service Role, `src/lib/supabase/admin.ts`),
-- SEMPRE filtrando por `token = <valor da URL>` no código, nunca por
-- confiar em RLS. Mesma filosofia de segurança já documentada em
-- `lib/auth/requireAdmin.ts` pro Dashboard do cliente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CATEGORIAS DE SERVIÇO — painel de seleção ("Marketing", "Captação
-- Audiovisual", "Edição de Vídeos"...) mostrado ao montar um orçamento.
-- ----------------------------------------------------------------------------
create table if not exists public.orc_categorias (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),

  nome text not null,
  emoji text,
  ordem integer not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists orc_categorias_company_idx on public.orc_categorias (company_id);

-- ----------------------------------------------------------------------------
-- 2. CATÁLOGO DE SERVIÇOS — itens com preço padrão, agrupados por categoria.
-- `ativo = false` esconde do catálogo (ao montar orçamento novo) sem apagar
-- o histórico de orçamentos que já usaram esse serviço (ver `orc_itens`,
-- que guarda uma CÓPIA de nome/valor, não depende do serviço continuar
-- existindo).
-- ----------------------------------------------------------------------------
create table if not exists public.orc_servicos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  categoria_id uuid references public.orc_categorias(id) on delete set null,

  nome text not null,
  descricao text,
  valor_padrao numeric(12, 2) not null default 0,
  unidade text not null default 'unico' check (unidade in ('unico', 'hora', 'dia', 'mes', 'pacote')),
  ativo boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orc_servicos_company_idx on public.orc_servicos (company_id);
create index if not exists orc_servicos_categoria_idx on public.orc_servicos (categoria_id);

drop trigger if exists orc_servicos_set_updated_at on public.orc_servicos;
create trigger orc_servicos_set_updated_at
  before update on public.orc_servicos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. ORÇAMENTOS — cabeçalho da proposta. Pode ser vinculado a um cliente já
-- cadastrado (`cliente_id`) e/ou a um lead do CRM (`lead_id`) — ou nenhum
-- dos dois (proposta avulsa, pra alguém que ainda não existe no sistema).
-- Nome/e-mail/whatsapp do destinatário são sempre uma CÓPIA editável (não
-- dependem do cadastro do cliente/lead continuar igual depois).
-- ----------------------------------------------------------------------------
create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),

  titulo text not null,
  cliente_id uuid references public.clientes(id) on delete set null,
  lead_id uuid references public.crm_leads(id) on delete set null,
  nome_destinatario text not null,
  email_destinatario text,
  whatsapp_destinatario text,

  status text not null default 'rascunho'
    check (status in ('rascunho', 'enviado', 'visualizado', 'aprovado', 'recusado', 'expirado')),

  validade_dias integer not null default 15,
  data_expiracao date,

  desconto_tipo text check (desconto_tipo in ('percentual', 'fixo')),
  desconto_valor numeric(12, 2) not null default 0,
  condicoes_pagamento text,
  observacoes text,

  -- 32 bytes hex = 64 caracteres, gerado uma vez na criação e nunca trocado
  -- (trocar invalidaria um link já enviado ao cliente).
  token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),

  enviado_em timestamptz,
  visualizado_em timestamptz,
  visualizacoes_count integer not null default 0,
  aprovado_em timestamptz,
  aprovado_por_nome text,
  recusado_em timestamptz,
  motivo_recusa text,

  criado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orcamentos_company_idx on public.orcamentos (company_id);
create index if not exists orcamentos_cliente_idx on public.orcamentos (cliente_id) where cliente_id is not null;
create index if not exists orcamentos_lead_idx on public.orcamentos (lead_id) where lead_id is not null;
create index if not exists orcamentos_token_idx on public.orcamentos (token);
create index if not exists orcamentos_status_idx on public.orcamentos (status);

drop trigger if exists orcamentos_set_updated_at on public.orcamentos;
create trigger orcamentos_set_updated_at
  before update on public.orcamentos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. ITENS DO ORÇAMENTO — linha a linha. `nome`/`valor_unitario` são uma
-- CÓPIA do serviço no momento em que foi adicionado (editável dali em
-- diante, sem afetar o catálogo) — o mesmo princípio de nota fiscal: o
-- documento já emitido não muda se o catálogo mudar depois.
--
-- `opcional` + `selecionado` são o mecanismo de "personalização" do
-- cliente no link público: item opcional pode ser marcado/desmarcado por
-- quem recebe o link (ver `orc_itens_publico_update` abaixo) — o total
-- recalcula. Item obrigatório (`opcional = false`) tem `selecionado`
-- sempre `true`, travado (a Server Action pública rejeita tentativa de
-- desmarcar item obrigatório).
-- ----------------------------------------------------------------------------
create table if not exists public.orc_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  servico_id uuid references public.orc_servicos(id) on delete set null,

  nome text not null,
  descricao text,
  quantidade numeric(10, 2) not null default 1,
  valor_unitario numeric(12, 2) not null default 0,
  opcional boolean not null default false,
  selecionado boolean not null default true,
  ordem integer not null default 0,

  created_at timestamptz not null default now()
);

create index if not exists orc_itens_orcamento_idx on public.orc_itens (orcamento_id);

-- ----------------------------------------------------------------------------
-- 5. RLS — mesmo padrão de `fin_*`/`crm_*`: só staff (admin/funcionário) da
-- PRÓPRIA empresa. O link público nunca usa estas policies (bypassa via
-- Service Role, ver cabeçalho do arquivo) — não existe policy de `anon`
-- aqui de propósito.
-- ----------------------------------------------------------------------------
alter table public.orc_categorias enable row level security;
alter table public.orc_servicos enable row level security;
alter table public.orcamentos enable row level security;
alter table public.orc_itens enable row level security;

drop policy if exists orc_categorias_admin on public.orc_categorias;
create policy orc_categorias_admin on public.orc_categorias for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists orc_servicos_admin on public.orc_servicos;
create policy orc_servicos_admin on public.orc_servicos for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

drop policy if exists orcamentos_admin on public.orcamentos;
create policy orcamentos_admin on public.orcamentos for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- `orc_itens` não tem `company_id` próprio (herda do orçamento pai) — a
-- policy confere posse via subquery no `orcamentos`, mesmo padrão que o
-- resto do projeto usaria pra uma tabela "filha" sem tenant direto.
drop policy if exists orc_itens_admin on public.orc_itens;
create policy orc_itens_admin on public.orc_itens for all
  using (public.is_staff() and exists (
    select 1 from public.orcamentos o where o.id = orc_itens.orcamento_id and o.company_id = public.current_company_id()
  ))
  with check (public.is_staff() and exists (
    select 1 from public.orcamentos o where o.id = orc_itens.orcamento_id and o.company_id = public.current_company_id()
  ));

-- ----------------------------------------------------------------------------
-- 6. Categorias padrão — semeadas SÓ pra empresas que ainda não têm nenhuma
-- categoria de orçamento (não duplica se rodar a migração de novo, e não
-- mexe em quem já personalizou a própria lista). Cobre os pedidos originais
-- (Marketing, Captação Audiovisual, Edição de Vídeos) + o resto do universo
-- audiovisual/marketing de uma produtora.
-- ----------------------------------------------------------------------------
insert into public.orc_categorias (company_id, nome, emoji, ordem)
select c.id, v.nome, v.emoji, v.ordem
from public.companies c
cross join (values
  ('Marketing', '📣', 1),
  ('Captação Audiovisual', '🎥', 2),
  ('Edição de Vídeos', '✂️', 3),
  ('Motion Graphics & Animação', '🎬', 4),
  ('Fotografia', '📷', 5),
  ('Social Media', '📱', 6),
  ('Tráfego Pago', '🎯', 7),
  ('Roteirização & Conteúdo', '📝', 8),
  ('Branding & Identidade Visual', '🎨', 9),
  ('Consultoria & Estratégia', '💡', 10)
) as v(nome, emoji, ordem)
where not exists (select 1 from public.orc_categorias existentes where existentes.company_id = c.id);
