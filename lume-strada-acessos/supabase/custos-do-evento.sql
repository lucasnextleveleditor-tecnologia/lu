-- ----------------------------------------------------------------------------
-- Custos do evento: o dinheiro que sai, lancado ANTES do fechamento
-- ----------------------------------------------------------------------------
--
-- O cache da equipe ja era contado, porque nasce da escala. Todo o resto do
-- dinheiro de um evento — van, diaria de gerador, alimentacao, estacionamento,
-- locacao de lente, pedagio, alvara — nao tinha onde morar, e o fechamento
-- somava so metade da conta.
--
-- A chave do desenho e QUANDO se lanca. Quem produz evento sabe o custo da van
-- na terca, o do gerador na quarta e o da alimentacao na quinta; obrigar tudo a
-- ser digitado na madrugada de domingo, junto com o balanco, e a receita para
-- perder nota e chutar valor. Entao a aba existe o tempo todo, e o fechamento
-- vira o que ele deveria ser: CONFERIR o que ja esta lancado e acrescentar o
-- imprevisto que apareceu no dia.
--
-- Duas colunas de estado, e elas nao sao a mesma coisa:
--
--   `previsto`     — "achei que ia custar" contra "custou". Um item lancado na
--                    terca e estimativa; sem essa distincao o total mente das
--                    duas formas possiveis (ou some com o que nao confirmou,
--                    ou finge que um chute e um fato).
--   `conferido_em` — o olho humano passou por aqui. Um custo pode estar com o
--                    valor real correto e ainda assim ninguem ter olhado para
--                    ele; o que o fechamento precisa destacar e justamente a
--                    linha que ninguem leu.
--
-- A categoria e lista FECHADA de proposito: ela existe para AGRUPAR no
-- fechamento, nao para descrever. Texto livre viraria "Van", "van" e "Van
-- grande" na primeira semana, e o agrupamento morreria junto.

create table if not exists public.ev_custos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,

  descricao text not null,
  categoria text not null default 'outro'
    check (categoria in ('transporte','alimentacao','locacao','equipe','producao','taxa','outro')),
  valor numeric(12,2) not null default 0 check (valor >= 0),

  previsto boolean not null default true,
  conferido_em timestamptz,
  pago boolean not null default false,

  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ev_custos_evento_idx on public.ev_custos(evento_id);

alter table public.ev_custos enable row level security;

drop policy if exists ev_custos_staff on public.ev_custos;
create policy ev_custos_staff on public.ev_custos
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

drop trigger if exists ev_custos_set_updated_at on public.ev_custos;
create trigger ev_custos_set_updated_at
  before update on public.ev_custos
  for each row execute function public.set_updated_at();

comment on table public.ev_custos is 'Despesas do evento lancadas antes do fechamento; o cache da equipe continua vindo de ev_equipe.';
comment on column public.ev_custos.previsto is 'true = estimativa; false = valor real ja confirmado.';
comment on column public.ev_custos.conferido_em is 'Carimbo do olho humano no fechamento.';
