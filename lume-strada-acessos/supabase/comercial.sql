-- ============================================================================
-- Lume Strada Filmes — Módulo Comercial (Pré-vendas / CRM)
-- ============================================================================
-- Rode DEPOIS de `schema.sql` (precisa de `public.is_admin()`, `profiles` e
-- `set_updated_at()`) e, de preferência, depois de `producao.sql` — o
-- dropdown "Serviço de Interesse" REAPROVEITA a tabela `prod_tipos_servico`
-- que já existe no módulo de Produção, em vez de duplicar o cadastro de
-- serviços da agência. Se você ainda não rodou `producao.sql`, rode-o antes
-- (ou comente a FK de `tipo_servico_id` abaixo e rode sem ela por enquanto).
--
-- Escopo (mesma decisão dos módulos anteriores): single-tenant, só admin usa
-- por enquanto — SEM `company_id`/multi-tenant ainda. Isso é combinado: o
-- sistema está sendo testado internamente primeiro; a camada multi-tenant
-- (pra vender pra outras agências) entra depois, por cima, sem precisar
-- reescrever nada daqui — o padrão "PADRÃO PARA NOVAS TABELAS" no fim de
-- `schema.sql` já deixa isso preparado.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. LEADS (oportunidades do funil de vendas)
-- ----------------------------------------------------------------------------
create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),

  -- Dados do contato
  nome text not null, -- empresa ou pessoa
  email text,
  whatsapp text,
  origem text check (origem in ('indicacao', 'trafego_pago', 'outbound', 'outro')),

  -- Dados do negócio
  tipo_servico_id uuid references public.prod_tipos_servico(id) on delete set null, -- reaproveita o cadastro de serviços do módulo de Produção
  valor_estimado numeric(12, 2),
  data_prevista_fechamento date,
  contrato_assinado boolean not null default false,

  -- Funil
  status text not null default 'lead_frio'
    check (status in ('lead_frio', 'contato_inicial', 'reuniao_realizada', 'proposta_enviada', 'negociacao', 'fechado_ganha', 'perdido')),

  -- Follow-up — denormalizado de propósito: é sempre o `proximo_contato_em`
  -- mais recente lançado em `crm_anotacoes`, guardado aqui pra dar pra
  -- ordenar/filtrar o Kanban e a Lista sem precisar de subquery a cada
  -- carregamento. A fonte de verdade do HISTÓRICO continua sendo
  -- `crm_anotacoes` — este campo é só o "próximo compromisso" em cache.
  proximo_contato_em date,

  -- Conversão: quando um lead vira cliente de verdade (perfil em `profiles`,
  -- role 'cliente'), guardamos o vínculo aqui. Null = ainda não convertido.
  cliente_id uuid references public.profiles(id) on delete set null,
  convertido_em timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_leads_status_idx on public.crm_leads (status);
create index if not exists crm_leads_proximo_contato_idx on public.crm_leads (proximo_contato_em);
create index if not exists crm_leads_cliente_idx on public.crm_leads (cliente_id);

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
  before update on public.crm_leads
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. ANOTAÇÕES (histórico de follow-up) — log append-only; nunca editado
-- depois de criado, só novas entradas.
-- ----------------------------------------------------------------------------
create table if not exists public.crm_anotacoes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  nota text not null,
  proximo_contato_em date,
  criado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists crm_anotacoes_lead_idx on public.crm_anotacoes (lead_id);

-- ----------------------------------------------------------------------------
-- 3. RLS — admin-only por enquanto (mesmo padrão do Financeiro/Produção).
-- ----------------------------------------------------------------------------
alter table public.crm_leads enable row level security;
alter table public.crm_anotacoes enable row level security;

drop policy if exists "crm_leads_admin_all" on public.crm_leads;
create policy "crm_leads_admin_all" on public.crm_leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "crm_anotacoes_admin_all" on public.crm_anotacoes;
create policy "crm_anotacoes_admin_all" on public.crm_anotacoes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
