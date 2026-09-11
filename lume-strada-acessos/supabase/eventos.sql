-- ============================================================================
-- Eventos — a operação de campo
-- ============================================================================
-- Rode DEPOIS de `cadastros.sql` (precisa de `clientes`) e de
-- `multitenant-migration.sql`. Idempotente.
--
-- O QUE ESTE MÓDULO RESOLVE, que nenhum outro do sistema resolve:
--
-- Num evento há três palcos tocando ao mesmo tempo, em lugares diferentes do
-- mesmo espaço, com a equipe espalhada — um no palco principal, outro no
-- lounge, um terceiro com o drone. No domingo alguém descobre que ninguém
-- fotografou a ativação do patrocinador, que estava no contrato. Não adianta
-- descobrir no domingo.
--
-- A pergunta que o módulo existe para responder, ENQUANTO O SHOW ACONTECE, é:
-- o que ainda falta captar? Todo o resto do modelo serve a ela.
--
-- ----------------------------------------------------------------------------
-- Por que o prefixo `ev_`
-- ----------------------------------------------------------------------------
-- `public.eventos` JÁ EXISTE e é outra coisa: a trilha de auditoria do sistema
-- (`trilha-de-eventos.sql` — acao, entidade, ator, de/para). Duas tabelas não
-- podem ter o mesmo nome, e roubar o nome da trilha quebraria o histórico
-- inteiro. `ev_` segue a convenção que o resto do banco já usa para separar
-- módulo: `prod_`, `fin_`, `crm_`, `orc_`.
--
-- ----------------------------------------------------------------------------
-- Por que TIMESTAMPTZ e não `time`
-- ----------------------------------------------------------------------------
-- Evento vira a madrugada. "Saída de CO₂ à uma" é 01:00 do dia SEGUINTE ao
-- dia em que o evento começou, e um `time` de 01:00 não sabe disso — ele
-- ordena antes das 21:00 e joga o boom para o começo da timeline. Guardar o
-- instante inteiro é o que faz a grade funcionar num show que começa sábado
-- e termina domingo.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. O evento
-- ----------------------------------------------------------------------------

create table if not exists public.ev_eventos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,

  -- Opcional: rola evento próprio (festival da casa) sem cliente contratante.
  cliente_id uuid references public.clientes(id) on delete set null,

  nome text not null,
  local text,

  -- O recorte que a grade desenha. Um evento de dois dias tem duas grades, e
  -- é por `inicio`/`fim` que a tela sabe onde começar e parar de desenhar.
  inicio timestamptz not null,
  fim timestamptz not null,

  -- As cinco fases da operação. `ao_vivo` é a que liga o painel de cobertura
  -- em tempo real; as outras quatro são antes e depois.
  status text not null default 'planejamento'
    check (status in ('planejamento', 'montagem', 'ao_vivo', 'pos', 'encerrado')),

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ev_eventos_fim_depois_do_inicio check (fim > inicio)
);

create index if not exists ev_eventos_company_idx on public.ev_eventos (company_id, inicio desc);
create index if not exists ev_eventos_cliente_idx on public.ev_eventos (cliente_id);

comment on table public.ev_eventos is
  'Operacao de campo com hora para comecar e acabar. A grade de cobertura e desenhada entre inicio e fim.';
comment on column public.ev_eventos.inicio is
  'Instante completo (timestamptz), nao hora do dia: evento vira a madrugada e 01:00 pertence ao dia seguinte.';

-- ----------------------------------------------------------------------------
-- 2. Ambientes — os palcos simultâneos
-- ----------------------------------------------------------------------------
-- É o que torna este módulo diferente de uma agenda: numa agenda, duas coisas
-- no mesmo horário são um CONFLITO. Aqui são o normal — três palcos tocando
-- ao mesmo tempo é a situação, não o erro.

create table if not exists public.ev_ambientes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,

  nome text not null,
  -- Hex da faixa na grade. Null = a tela escolhe pela ordem.
  cor text check (cor is null or cor ~* '^#[0-9a-f]{6}$'),
  ordem smallint not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ev_ambientes_evento_idx on public.ev_ambientes (evento_id, ordem);

comment on table public.ev_ambientes is
  'Palcos/areas simultaneas de um evento. Sobreposicao de horario entre ambientes e o normal, nao conflito.';

-- ----------------------------------------------------------------------------
-- 3. Programação — o que acontece, e quando
-- ----------------------------------------------------------------------------

create table if not exists public.ev_blocos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,
  ambiente_id uuid references public.ev_ambientes(id) on delete cascade,

  titulo text not null,

  -- `atracao` é o show, o painel, a banda — tem duração.
  -- `boom` é o momento de hora cravada (CO₂, pirotecnia, confete): dura
  --   segundos e é o que mais se perde, porque quem piscou perdeu.
  -- `operacao` é o que a produtora faz, não o palco (montagem, passagem de
  --   som, desmontagem) — entra na grade porque ocupa a equipe.
  tipo text not null default 'atracao' check (tipo in ('atracao', 'boom', 'operacao')),

  inicio timestamptz not null,
  -- Null para `boom`: um instante não tem fim. A tela desenha pino, não barra.
  fim timestamptz,

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ev_blocos_fim_depois_do_inicio check (fim is null or fim > inicio)
);

create index if not exists ev_blocos_evento_idx on public.ev_blocos (evento_id, inicio);
create index if not exists ev_blocos_ambiente_idx on public.ev_blocos (ambiente_id, inicio);

comment on column public.ev_blocos.tipo is
  'atracao = tem duracao. boom = instante de hora cravada (fim nulo). operacao = trabalho da produtora que ocupa a equipe.';

-- ----------------------------------------------------------------------------
-- 4. A EQUIPE, e o acesso temporário dela
-- ----------------------------------------------------------------------------
-- Vem ANTES da pauta de captação na ordem das tabelas porque a pauta aponta
-- para cá duas vezes: quem é o responsável, e quem marcou.
--
-- O acesso é POR PESSOA, e não um link único do evento. É isso que faz o
-- "captei" ficar assinado com um nome — com um link só, todo mundo seria "a
-- equipe" e a marcação não valeria como registro. Sem senha e sem conta:
-- freelancer contratado para um sábado não vai criar login, e obrigar a isso
-- garante que ninguém marca nada.
--
-- O token expira junto com o evento (mais uma folga) e pode ser desligado na
-- hora pelo `ativo`. Mesmo mecanismo do link do portal do cliente.

create table if not exists public.ev_equipe (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,

  nome text not null,
  -- Texto livre: cada produtora nomeia as funções do jeito dela, e uma lista
  -- fechada aqui só geraria "outro" em metade das linhas.
  funcao text,
  telefone text,

  -- Quando é gente da casa, o vínculo com o cadastro de equipe. Null para
  -- freelancer, que é a maioria num evento grande.
  equipe_membro_id uuid references public.equipe_membros(id) on delete set null,

  token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  token_expira_em timestamptz,
  ativo boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ev_equipe_evento_idx on public.ev_equipe (evento_id, nome);
create index if not exists ev_equipe_token_idx on public.ev_equipe (token);

comment on column public.ev_equipe.token is
  'Acesso pessoal e temporario a tela de marcacao (/evento/<token>). Pessoal de proposito: e o que faz o "captei" ficar assinado.';

-- ----------------------------------------------------------------------------
-- 5. A PAUTA DE CAPTAÇÃO — o coração
-- ----------------------------------------------------------------------------
-- A lista do que precisa EXISTIR quando o evento acabar. Não é tarefa nem
-- agenda: é cobertura. Cada linha é uma coisa que, se não for captada, vai
-- faltar no material entregue — e algumas delas estão no contrato.

create table if not exists public.ev_capturas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,
  evento_id uuid not null references public.ev_eventos(id) on delete cascade,

  -- Onde. Null = em qualquer lugar do evento (ex: "foto de público").
  ambiente_id uuid references public.ev_ambientes(id) on delete set null,
  -- Amarrado a um momento da programação, quando for o caso. Apagar o bloco
  -- não apaga a captura: o item continua na lista, só perde a âncora.
  bloco_id uuid references public.ev_blocos(id) on delete set null,

  titulo text not null,
  categoria text not null default 'outro'
    check (categoria in ('palco', 'publico', 'drone', 'patrocinador', 'boom', 'bastidores', 'depoimento', 'outro')),

  -- Um item pode exigir os dois. "Foto do patrocinador" e "vídeo do
  -- patrocinador" são coberturas diferentes e falham separado.
  precisa_foto boolean not null default true,
  precisa_video boolean not null default false,

  -- A janela em que dá para captar. Fora dela, não adianta mais — e é essa
  -- comparação com o relógio que faz um item pendente virar PERDIDO na tela
  -- em vez de continuar cinza esperando para sempre.
  janela_inicio timestamptz,
  janela_fim timestamptz,

  -- Patrocinador costuma ser contrato: falhar aqui custa dinheiro, não só
  -- material. A tela grita diferente para estes.
  obrigatorio boolean not null default false,

  responsavel_id uuid references public.ev_equipe(id) on delete set null,

  status text not null default 'pendente' check (status in ('pendente', 'captado', 'nao_rolou')),
  -- `on delete set null`: tirar alguém da equipe não pode apagar a prova de
  -- que a foto foi feita.
  marcado_por uuid references public.ev_equipe(id) on delete set null,
  marcado_em timestamptz,
  observacao text,

  ordem smallint not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ev_capturas_precisa_de_algo check (precisa_foto or precisa_video),
  constraint ev_capturas_janela_coerente check (janela_fim is null or janela_inicio is null or janela_fim > janela_inicio)
);

-- O índice que o painel ao vivo usa: "o que está pendente neste evento,
-- ordenado pela janela que fecha primeiro".
create index if not exists ev_capturas_pendentes_idx
  on public.ev_capturas (evento_id, janela_fim)
  where status = 'pendente';

create index if not exists ev_capturas_evento_idx on public.ev_capturas (evento_id, ordem);
create index if not exists ev_capturas_ambiente_idx on public.ev_capturas (ambiente_id);

comment on table public.ev_capturas is
  'A pauta de captacao: o que precisa EXISTIR ao fim do evento. Pendente com janela_fim no passado = perdido.';
comment on column public.ev_capturas.obrigatorio is
  'Cobertura contratada (patrocinador, entregavel vendido). Falhar custa dinheiro, nao so material.';

-- ----------------------------------------------------------------------------
-- 6. updated_at
-- ----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['ev_eventos', 'ev_ambientes', 'ev_blocos', 'ev_equipe', 'ev_capturas'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. RLS — tudo da equipe, dentro da própria empresa
-- ----------------------------------------------------------------------------
-- Sem a divisão admin/staff que `post_receitas` tem: um evento é operação, e
-- quem opera precisa criar ambiente, mexer em programação e marcar captura no
-- meio do corre. Travar isso em admin faria a produtora inteira parar para
-- esperar uma pessoa.
--
-- A tela da EQUIPE (`/evento/<token>`) não passa por aqui: ela roda por
-- Service Role, como o portal do cliente, com a checagem de posse feita na
-- aplicação (o token diz quem é a pessoa, e a pessoa só enxerga o próprio
-- evento). Ver a nota de segurança em `lib/auth/requireAdmin.ts`.

do $$
declare
  t text;
begin
  foreach t in array array['ev_eventos', 'ev_ambientes', 'ev_blocos', 'ev_equipe', 'ev_capturas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_staff_all on public.%I', t, t);
    execute format(
      'create policy %I_staff_all on public.%I for all using (is_staff() and company_id = current_company_id()) with check (is_staff() and company_id = current_company_id())',
      t, t
    );
  end loop;
end;
$$;
