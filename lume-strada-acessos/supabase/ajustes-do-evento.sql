-- ----------------------------------------------------------------------------
-- Ajustes do evento: o que ESTE evento usa
-- ----------------------------------------------------------------------------
--
-- O modulo de Eventos cobre desde "duas cameras num casamento" ate "quatro
-- palcos, dezoito freelas e entrega realtime a noite inteira". Se a tela
-- mostrar tudo o que o modulo sabe fazer, o casamento vira um painel de usina
-- nuclear — e quem abre um evento pequeno passa a gastar atencao decidindo
-- ignorar botao.
--
-- Entao cada evento LIGA o que precisa. E ligam-se DESLIGADOS: a tela nasce no
-- minimo (grade + equipe + ocorrencia) e cresce pelo lado de quem pediu.
--
-- Por que colunas e nao um jsonb `config`:
--   * cada chave aqui vale para SEMPRE, nao e configuracao livre de usuario.
--     Um jsonb faria o TypeScript aceitar `usa_kitt` sem reclamar, e o erro so
--     apareceria na tela, tarde;
--   * `not null default false` faz o Postgres preencher os eventos que ja
--     existem, sem migracao de dados e sem `?? false` espalhado no codigo.
--
-- Ocorrencia NAO tem chave: e o log do que aconteceu, custa um botao e e o
-- unico lugar onde "o show atrasou" vira "o som chegou 21h40". Um evento sem
-- log nao e um evento mais simples, e um evento sem memoria.

alter table public.ev_eventos
  -- A gaveta de Kit: o que saiu e o que voltou. So faz sentido quando ha
  -- equipamento da casa em campo.
  add column if not exists usa_kit boolean not null default false,

  -- A gaveta de Entrega realtime: pedido -> editor -> link com o prazo
  -- correndo. Evento sem corte na hora nao precisa dessa fila na tela.
  add column if not exists usa_realtime boolean not null default false,

  -- Check-in/check-out da equipe. Liga o ponto em um toque na gaveta de Equipe
  -- e as bolinhas de "quem esta em campo" no painel do Ao Vivo.
  add column if not exists usa_ponto boolean not null default false,

  -- Cache e extras por pessoa. Liga os campos de dinheiro na Equipe e o botao
  -- "lancar custos" do Fechamento — que e o que leva esse dinheiro para o
  -- Financeiro.
  add column if not exists usa_cache boolean not null default false,

  -- "Criar entregas" no Fechamento: o que foi captado atravessa para a
  -- Producao como tarefa. Evento de cobertura ao vivo que nao gera pos nao
  -- precisa do botao.
  add column if not exists usa_entregas boolean not null default false;

comment on column public.ev_eventos.usa_kit is 'Mostra a gaveta de Kit (saiu/voltou).';
comment on column public.ev_eventos.usa_realtime is 'Mostra a gaveta de Entrega realtime.';
comment on column public.ev_eventos.usa_ponto is 'Liga check-in/check-out da equipe.';
comment on column public.ev_eventos.usa_cache is 'Liga cache/extras e o lancamento de custos no Fechamento.';
comment on column public.ev_eventos.usa_entregas is 'Liga a criacao de tarefas de Producao no Fechamento.';

-- Eventos que JA existem foram criados quando tudo era visivel, e quem os
-- montou contava com isso. Desligar tudo neles agora esconderia kit e cache
-- que ja estao preenchidos — a migracao seria vista como perda de dado.
-- Entao: o default false vale para os proximos; os de hoje ligam o que ja usam.
update public.ev_eventos e set
  usa_kit      = exists (select 1 from public.ev_kit k where k.evento_id = e.id),
  usa_realtime = exists (select 1 from public.ev_realtime r where r.evento_id = e.id),
  usa_ponto    = exists (select 1 from public.ev_equipe q where q.evento_id = e.id and q.checkin_em is not null),
  usa_cache    = exists (select 1 from public.ev_equipe q where q.evento_id = e.id and coalesce(q.cache, 0) > 0),
  usa_entregas = e.entregas_criadas_em is not null;
