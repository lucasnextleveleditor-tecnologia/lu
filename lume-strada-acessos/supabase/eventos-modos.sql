-- Eventos, parte 2: o que os três modos (Plano, Ao Vivo, Fechamento) exigem
-- e a primeira migração não tinha.
--
-- A primeira versão modelava o evento PARADO: ambientes, blocos com hora, uma
-- pauta e uma equipe. O desenho dos três modos pede o evento EM MOVIMENTO —
-- um show atrasa 30 minutos e a grade inteira precisa saber o que anda junto,
-- o que fica parado e quem colide. E pede o FECHAMENTO, que é a parte que
-- hoje vive numa planilha no domingo.

-- ----------------------------------------------------------------------------
-- 1. O evento sabe em que fuso ele acontece
-- ----------------------------------------------------------------------------
-- Uma produtora em Lisboa e uma em São Paulo leem a MESMA timeline; o que
-- muda é como as horas são escritas. Guardar o fuso no evento (e não na
-- empresa) é o que permite cobrir um evento fora do país sem virar o painel
-- inteiro de cabeça para baixo.
--
-- A linha AGORA não depende disto: ela é tempo absoluto. O fuso só decide o
-- texto do eixo e dos horários.
alter table public.ev_eventos
  add column if not exists fuso text not null default 'America/Sao_Paulo',
  -- "Salvar como template": o evento encerrado vira o ponto de partida do
  -- próximo. Modelo não aparece na lista de eventos, só na hora de duplicar.
  add column if not exists modelo boolean not null default false,
  add column if not exists duplicado_de uuid references public.ev_eventos(id) on delete set null,
  -- Carimbos do fechamento: o que já virou tarefa e o que já virou lançamento.
  -- Sem isto, apertar o botão duas vezes cria tudo duas vezes.
  add column if not exists entregas_criadas_em timestamptz,
  add column if not exists custos_lancados_em timestamptz;

comment on column public.ev_eventos.fuso is
  'Fuso IANA do LOCAL do evento (America/Sao_Paulo, Europe/Lisbon, America/New_York...). So afeta como as horas sao escritas.';

-- ----------------------------------------------------------------------------
-- 2. O ambiente sugere; o bloco decide
-- ----------------------------------------------------------------------------
-- No mapa, cada ambiente carrega um rótulo (ENCADEADO / CRAVADO). Ele é o
-- PADRÃO oferecido quando a pessoa cria um bloco ali — e não uma regra do
-- ambiente. Um boom de hora cravada dentro de um palco encadeado precisa
-- existir, e é exatamente o caso do CO₂ no desenho.
alter table public.ev_ambientes
  add column if not exists modo_padrao text not null default 'encadeado'
    check (modo_padrao in ('encadeado', 'cravado'));

-- ----------------------------------------------------------------------------
-- 3. O bloco: âncora, duração, responsável e o atraso acumulado
-- ----------------------------------------------------------------------------

-- `atracao` vira `show`: é a palavra que a produtora usa, e o mapa pede quatro
-- tipos (show, ativação, boom, operação). Ativação de patrocinador não é show
-- nem operação — é o que o cliente paga para existir, e a captação dela é a
-- que mais dá briga quando não acontece.
alter table public.ev_blocos drop constraint if exists ev_blocos_tipo_check;
update public.ev_blocos set tipo = 'show' where tipo = 'atracao';
alter table public.ev_blocos alter column tipo set default 'show';
alter table public.ev_blocos
  add constraint ev_blocos_tipo_check check (tipo in ('show', 'ativacao', 'boom', 'operacao'));

alter table public.ev_blocos
  -- A PERGUNTA ÚNICA da hora de criar o bloco.
  --   encadeado = anda quando o bloco de cima atrasa, no mesmo ambiente.
  --   cravado   = não se move nunca (ativação contratada, virada da
  --               meia-noite, alvará de som, horário do artista).
  add column if not exists ancora text not null default 'encadeado'
    check (ancora in ('encadeado', 'cravado')),

  -- Duração em minutos é o que a tela edita (+/- de 5 em 5), não a hora de
  -- fim: quando o bloco anda, a duração é o que tem que ficar igual.
  add column if not exists duracao_min integer check (duracao_min is null or duracao_min > 0),

  -- Quem cobre esse bloco. É o que permite detectar a colisão que o desenho
  -- mostra — "o fotógrafo está escalado nos dois" —, impossível de ver sem
  -- responsável no bloco.
  add column if not exists responsavel_id uuid references public.ev_equipe(id) on delete set null,

  -- Quanto esse bloco já andou no total, em minutos. Fica guardado para o
  -- fechamento poder dizer "previsto × realizado" sem precisar do log inteiro.
  add column if not exists atraso_min integer not null default 0,

  -- Ordem estável dentro do ambiente. O encadeamento segue o relógio, mas
  -- dois blocos que começam no mesmo minuto precisam de desempate fixo, senão
  -- a cascata escolhe um diferente a cada recálculo.
  add column if not exists ordem smallint not null default 0;

create index if not exists ev_blocos_responsavel_idx on public.ev_blocos (responsavel_id);

comment on column public.ev_blocos.ancora is
  'encadeado = anda junto com o bloco anterior do mesmo ambiente. cravado = hora fixa, nunca se move.';

-- ----------------------------------------------------------------------------
-- 4. A pauta ganha destinatário
-- ----------------------------------------------------------------------------
-- O balanço do fechamento é "EXISTE — o que foi captado, POR DESTINATÁRIO".
-- Sem esta coluna a lista sai por ambiente, e ambiente não é para quem se
-- entrega: três ativações no mesmo palco podem ser de três patrocinadores.
alter table public.ev_capturas
  add column if not exists destinatario text,
  -- Quando o destinatário é um cliente do cadastro, o link fica aqui e o
  -- fechamento consegue criar a entrega já no cliente certo.
  add column if not exists cliente_id uuid references public.clientes(id) on delete set null,
  -- O motivo do "não rolou". No fechamento vira a coluna NÃO EXISTE, que é a
  -- que evita a conversa "por que não tem foto disso?" na segunda-feira.
  add column if not exists motivo text;

create index if not exists ev_capturas_cliente_idx on public.ev_capturas (cliente_id);

-- ----------------------------------------------------------------------------
-- 5. A equipe: cachê, extras e o ponto
-- ----------------------------------------------------------------------------
-- "a conta vem da escala e do ponto, já somada". A escala é quem está aqui; o
-- ponto é a hora que a pessoa chegou e saiu. Com os dois, o custo do evento
-- existe no domingo de manhã sem ninguém somar nada.
alter table public.ev_equipe
  add column if not exists cache numeric(12, 2) not null default 0,
  add column if not exists extras numeric(12, 2) not null default 0,
  add column if not exists checkin_em timestamptz,
  add column if not exists checkout_em timestamptz,
  add column if not exists observacao text;

-- ----------------------------------------------------------------------------
-- 6. O kit — o que sai e o que volta
-- ----------------------------------------------------------------------------
-- Gaveta do Plano, ligada ao Inventário que já existe. `item_inventario_id`
-- NULO de propósito: a pessoa tem que poder escrever "tripé emprestado do
-- João" sem cadastrar um patrimônio que não é dela. O cadastro é atalho,
-- nunca pedágio.
create table if not exists public.ev_kit (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,

  item_inventario_id uuid references public.itens_inventario(id) on delete set null,
  nome text not null,
  quantidade smallint not null default 1 check (quantidade > 0),

  responsavel_id uuid references public.ev_equipe(id) on delete set null,

  saiu boolean not null default false,
  voltou boolean not null default false,
  observacao text,

  ordem smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ev_kit_evento_idx on public.ev_kit (evento_id);

comment on table public.ev_kit is
  'O que vai para o evento. Ligado ao inventario quando da, texto livre quando nao da -- o cadastro nunca pode ser pedagio.';

-- ----------------------------------------------------------------------------
-- 7. O log — hora e autor, sempre
-- ----------------------------------------------------------------------------
-- "o atraso fica no log com hora e autor" e "Ocorrência: dois toques, fica no
-- log com hora e autor". É a mesma tabela: o que aconteceu fora do previsto.
--
-- Duas colunas de autor porque existem DOIS tipos de gente aqui: quem está
-- logado no painel (profile) e o freelancer que entrou pelo link do celular e
-- não tem conta (ev_equipe). Uma coluna só obrigaria a criar conta para
-- freelancer, que é exatamente o que o módulo evita.
create table if not exists public.ev_ocorrencias (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,
  bloco_id uuid references public.ev_blocos(id) on delete set null,
  ambiente_id uuid references public.ev_ambientes(id) on delete set null,

  tipo text not null default 'ocorrencia'
    check (tipo in ('atraso', 'ocorrencia', 'status', 'captura', 'entrega')),

  texto text not null,
  -- Só para `atraso`: quantos minutos entraram (pode ser negativo, quando
  -- adianta).
  minutos integer,

  autor_profile_id uuid references public.profiles(id) on delete set null,
  autor_equipe_id uuid references public.ev_equipe(id) on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists ev_ocorrencias_evento_idx on public.ev_ocorrencias (evento_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 8. Entrega realtime — pedido, editor, link, prazo correndo
-- ----------------------------------------------------------------------------
create table if not exists public.ev_realtime (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,
  bloco_id uuid references public.ev_blocos(id) on delete set null,

  pedido text not null,
  -- O editor pode ser da equipe do evento (freela no link) ou alguém do
  -- painel; mesma razão das duas colunas do log.
  editor_equipe_id uuid references public.ev_equipe(id) on delete set null,
  editor_profile_id uuid references public.profiles(id) on delete set null,

  prazo_em timestamptz,
  status text not null default 'pedido' check (status in ('pedido', 'editando', 'entregue', 'cancelado')),
  link text,

  -- Quando vira tarefa na Produção, o vínculo fica aqui.
  tarefa_id uuid references public.prod_tarefas(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ev_realtime_evento_idx on public.ev_realtime (evento_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 9. RLS — mesma regra das outras tabelas do módulo
-- ----------------------------------------------------------------------------
alter table public.ev_kit enable row level security;
alter table public.ev_ocorrencias enable row level security;
alter table public.ev_realtime enable row level security;

drop policy if exists ev_kit_staff_all on public.ev_kit;
create policy ev_kit_staff_all on public.ev_kit
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists ev_ocorrencias_staff_all on public.ev_ocorrencias;
create policy ev_ocorrencias_staff_all on public.ev_ocorrencias
  for all to authenticated using (is_staff()) with check (is_staff());

drop policy if exists ev_realtime_staff_all on public.ev_realtime;
create policy ev_realtime_staff_all on public.ev_realtime
  for all to authenticated using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- 10. updated_at nas tabelas novas
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['ev_kit', 'ev_realtime'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 11. O PLAY — a hora em que o evento realmente começou
-- ----------------------------------------------------------------------------
-- "O evento era 22h, dei o play 22h10" — a partir daí a timeline corre pelo
-- relógio de verdade, e a grade inteira já nasce 10 minutos deslocada. Sem
-- guardar o instante do play, a única referência seria o horário MARCADO, e a
-- linha AGORA apareceria 10 minutos adiantada em relação ao que está
-- acontecendo no palco — que é o número que a pessoa está olhando para decidir
-- se corre ou não.
--
-- `iniciado_em` também é o que trava a grade: depois do play, mexer em horário
-- deixa de ser planejamento e vira atraso, com registro no log.
alter table public.ev_eventos
  add column if not exists iniciado_em timestamptz,
  add column if not exists encerrado_em timestamptz;

comment on column public.ev_eventos.iniciado_em is
  'Instante do play. A diferenca para `inicio` e o atraso da abertura, aplicado em cascata a tudo que e encadeado.';
