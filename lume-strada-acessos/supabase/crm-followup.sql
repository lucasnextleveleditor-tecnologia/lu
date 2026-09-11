-- ============================================================================
-- Follow-up de lead: dono, aviso no dia, e encerramento com reabordagem
-- ============================================================================
--
-- Metade disso já existia e não estava sendo usada: `proximo_contato_em` já
-- era coluna de `crm_leads`, `perdido` já era etapa do funil, e
-- `crm_anotacoes` já guardava cada follow-up com data e autor. O que faltava
-- era dono, aviso e encerramento.

-- QUEM está atrás deste lead. É para ele que o aviso do dia vai.
alter table public.crm_leads
  add column if not exists responsavel_id uuid references public.profiles(id) on delete set null;

-- Encerramento.
--
-- `reabordar_em` é a parte que muda o jeito de trabalhar: lead perdido quase
-- nunca é "não", é "não agora". A data guarda esse "agora" — e quando ela
-- chega, o sistema AVISA E NÃO REABRE o lead sozinho. Um lead que volta ao
-- funil por conta própria mente sobre o pipeline: olha-se "5 em negociação" e
-- um deles é um morto que o relógio ressuscitou.
alter table public.crm_leads
  add column if not exists reabordar_em date;

alter table public.crm_leads
  add column if not exists encerrado_em timestamptz;

-- Lista fechada, e não texto livre: o motivo só vale se virar número depois.
-- "Perdi 6 dos 10 por preço" muda como se vende; "perdi 10 por vários motivos
-- escritos de dez jeitos" não responde nada.
alter table public.crm_leads
  add column if not exists motivo_perda text;
alter table public.crm_leads drop constraint if exists crm_leads_motivo_perda_check;
alter table public.crm_leads
  add constraint crm_leads_motivo_perda_check
  check (motivo_perda is null or motivo_perda in
    ('preco', 'sem_resposta', 'concorrente', 'sem_orcamento', 'fora_do_escopo', 'outro'));

create index if not exists crm_leads_reabordar_idx on public.crm_leads (reabordar_em);
create index if not exists crm_leads_responsavel_idx on public.crm_leads (responsavel_id);

-- O que a anotação É.
--
-- O contador de tentativas ("5ª tentativa") sai daqui: conta as anotações do
-- tipo `contato`. DERIVADO e não escolhido, de propósito — um seletor 1-2-3-4-5
-- é um número para manter na mão, e no dia em que alguém esquecer, o lead
-- parece menos trabalhado do que foi. E é com esse número na tela que se
-- decide desistir.
alter table public.crm_anotacoes
  add column if not exists tipo text not null default 'contato';
alter table public.crm_anotacoes drop constraint if exists crm_anotacoes_tipo_check;
alter table public.crm_anotacoes
  add constraint crm_anotacoes_tipo_check check (tipo in ('contato', 'nota'));

create index if not exists crm_anotacoes_lead_tipo_idx on public.crm_anotacoes (lead_id, tipo);

-- ============================================================================
-- O cadeado do aviso
-- ============================================================================
--
-- Mesmo desenho de `plano_alertas`: um Cron diário sem memória é um Cron que
-- repete. A UNIQUE impede o mesmo aviso de sair duas vezes se a função rodar
-- de novo por um susto ou por uma reexecução.
create table if not exists public.crm_alertas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  tipo text not null check (tipo in ('followup', 'reabordar')),
  data_alvo date not null,
  enviado_em timestamptz not null default now(),
  constraint crm_alertas_unico unique (lead_id, tipo, data_alvo)
);

alter table public.crm_alertas enable row level security;

drop policy if exists crm_alertas_staff_select on public.crm_alertas;
create policy crm_alertas_staff_select on public.crm_alertas
  for select using (is_staff() and company_id = current_company_id());

-- ============================================================================
-- A função do Cron
-- ============================================================================
--
-- Duas perguntas no mesmo passe, porque são o mesmo gesto para quem recebe
-- ("hoje eu falo com o fulano") — só que uma vem de um lead vivo e a outra de
-- um lead encerrado.
--
-- QUEM RECEBE: o responsável do lead. Sem responsável, TODO MUNDO da equipe —
-- um follow-up sem dono que não avisa ninguém é um follow-up perdido, e é
-- melhor três pessoas verem do que nenhuma.
--
-- Uma diferença importante para `avisar_planos_vencendo`: ali a comparação é
-- pelo dia EXATO; aqui é `<= current_date`. Plano vencendo tem uma régua de
-- vários marcos, e perder um não perde o próximo. Follow-up tem UM dia — com
-- `=`, uma madrugada em que o Cron falhasse sumiria com o lead para sempre. O
-- cadeado de `crm_alertas` garante que o atrasado saia uma vez só.
--
-- A definição completa está aplicada no banco (migração
-- `avisar_followups_crm`) e agendada no pg_cron como `avisar-followups`,
-- `0 12 * * *` — mesmo horário de `avisar-planos-vencendo`, pelo mesmo motivo:
-- meio-dia UTC é a única hora em que o mundo inteiro concorda sobre que dia é
-- hoje.
--
-- Para conferir:  select * from cron.job;
-- Para testar:    select public.avisar_followups();
