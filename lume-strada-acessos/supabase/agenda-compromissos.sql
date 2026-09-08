-- Módulo Agenda — compromissos manuais (captação/reunião/entrega/pagamento)
-- num calendário mensal com arrastar-para-reagendar, inspirado no
-- calendário do concorrente (Floow Studio) mas com um diferencial: além dos
-- compromissos cadastrados aqui manualmente, a tela de Agenda também
-- reaproveita e exibe (só leitura, sem duplicar dado) as datas que já
-- existem em Produção (captação/entrega) e Comercial (próximo contato),
-- do mesmo jeito que o Calendário Geral do Dashboard já faz hoje.
--
-- Aplicado direto no projeto de produção (ifoggohkikwtnnhmhwoe) em
-- 08/09/2026. Este arquivo é só o registro histórico da migração.

create table if not exists public.compromissos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  titulo text not null,
  tipo text not null check (tipo in ('captacao', 'reuniao', 'entrega', 'pagamento')),
  data date not null,
  hora time,
  cliente_nome text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.compromissos is 'Compromissos manuais do módulo Agenda (/admin/agenda) — "Novo Compromisso". Diferente dos itens auto-agregados de Produção/Comercial, que continuam vivendo só nas próprias tabelas.';
comment on column public.compromissos.tipo is 'Tipo fixo (captacao/reuniao/entrega/pagamento) — mesmas 4 categorias do filtro da Agenda, cor de identidade em TIPO_COMPROMISSO_META (lib/utils/agenda.ts).';
comment on column public.compromissos.cliente_nome is 'Nome livre do cliente, sem FK — mesmo espírito de "criar rápido" do botão Novo Compromisso, não exige que o cliente já esteja cadastrado.';

create index if not exists compromissos_company_id_idx on public.compromissos(company_id);
create index if not exists compromissos_company_data_idx on public.compromissos(company_id, data);

alter table public.compromissos enable row level security;

drop policy if exists compromissos_staff_all on public.compromissos;
create policy compromissos_staff_all on public.compromissos
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

drop trigger if exists set_updated_at on public.compromissos;
create trigger set_updated_at before update on public.compromissos
  for each row execute function public.set_updated_at();
