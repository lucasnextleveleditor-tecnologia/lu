-- ============================================================================
-- Trilha de eventos — quem fez o que, quando
-- ============================================================================
--
-- Uma tabela só para TODOS os módulos, e não uma coluna de histórico em cada
-- um. A pergunta que se faz na prática é "o que aconteceu com este cliente?" —
-- e ela atravessa onboarding, planejamento, conteúdo e produção. Com histórico
-- espalhado, responder isso seria juntar quatro consultas na memória e torcer
-- para as datas baterem.
--
-- A decisão que define a tabela está lá embaixo, nas políticas: ela SÓ ACEITA
-- INSERT. Não existe política de update nem de delete, e isso não é
-- esquecimento.

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,

  -- O que aconteceu. Lista fechada de propósito: é ela que a tela traduz para
  -- os três idiomas. Texto livre viraria frase em português gravada no banco,
  -- que não se traduz depois — e uma trilha de auditoria é justamente o tipo
  -- de dado que se lê anos depois.
  --
  -- AO ACRESCENTAR UM PASSO NOVO no fluxo, o nome dele entra aqui, no tipo
  -- `AcaoEvento` (src/lib/eventos/registrar.ts) e nos três dicionários.
  acao text not null check (acao in (
    'onboarding_salvo', 'onboarding_concluido', 'onboarding_reaberto',
    'onboarding_link_enviado', 'onboarding_respondido_cliente',
    'plano_criado', 'plano_editado', 'plano_ativado', 'plano_encerrado', 'plano_cancelado',
    'pauta_criada', 'pauta_removida', 'pauta_subiu', 'pauta_devolvida',
    'tarefa_criada', 'tarefa_status', 'tarefa_removida',
    'versao_enviada', 'versao_aprovada', 'versao_alteracao_solicitada'
  )),

  -- Em que objeto. Par polimórfico, igual ao de `notifications`: SEM FK, de
  -- propósito — o evento tem que sobreviver ao objeto. "Fulano apagou a tarefa
  -- X" é exatamente o registro que não pode sumir junto com a tarefa X.
  entidade text not null check (entidade in ('onboarding', 'plano', 'pauta', 'tarefa', 'versao')),
  entidade_id uuid,

  -- De QUEM é o trabalho. Denormalizado para a leitura que se faz de verdade:
  -- "a linha do tempo deste cliente". Sem esta coluna, montar essa lista
  -- exigiria resolver o cliente de cada tipo de entidade por um caminho
  -- diferente, em toda consulta.
  cliente_id uuid references public.clientes(id) on delete set null,

  -- Título do objeto NO MOMENTO do evento. É um retrato: renomear a tarefa
  -- depois não pode reescrever o passado.
  titulo text,

  -- Para mudança de estado: de onde para onde. É o que transforma
  -- 'tarefa_status' em "entregou para revisão" ou "enviou preview ao cliente"
  -- sem precisar de uma ação diferente para cada transição possível.
  de text,
  para text,

  -- QUEM fez.
  --
  -- `ator_id` aponta para o perfil, mas `ator_nome` guarda o nome ESCRITO na
  -- hora, e não é redundância: funcionário desligado tem o perfil apagado, e
  -- uma trilha que passa a dizer "alguém aprovou" perde a razão de existir.
  -- Por isso também o `on delete set null` — o vínculo se perde, o nome fica.
  ator_id uuid references public.profiles(id) on delete set null,
  ator_nome text,

  -- De que lado veio a ação. `cliente` é o que acontece pelos links públicos
  -- (briefing respondido, versão aprovada no portal), onde não existe
  -- `auth.uid()`; `sistema` é o que o Cron faz sozinho.
  --
  -- "Aprovado pelo cliente" e "aprovado pela agência" são fatos diferentes, e
  -- é esta coluna que os separa.
  ator_tipo text not null default 'equipe' check (ator_tipo in ('equipe', 'cliente', 'sistema')),

  -- Sobra para o que for específico de um passo (número da versão, etapa do
  -- briefing, observação da devolução). Fora das colunas porque cada ação
  -- precisaria da sua, e a maioria ficaria nula em todas as linhas.
  detalhe jsonb,

  created_at timestamptz not null default now()
);

-- A leitura principal: "a linha do tempo deste cliente, do mais recente para
-- o mais antigo".
create index if not exists eventos_cliente_idx
  on public.eventos(company_id, cliente_id, created_at desc);

-- A segunda leitura: "o que aconteceu com esta tarefa".
create index if not exists eventos_entidade_idx
  on public.eventos(entidade, entidade_id, created_at desc);

-- ============================================================================
-- RLS — e a ausência deliberada de duas políticas
-- ============================================================================

alter table public.eventos enable row level security;

drop policy if exists eventos_staff_select on public.eventos;
create policy eventos_staff_select on public.eventos
  for select
  using (is_staff() and company_id = current_company_id());

drop policy if exists eventos_staff_insert on public.eventos;
create policy eventos_staff_insert on public.eventos
  for insert
  with check (is_staff() and company_id = current_company_id());

-- NÃO EXISTE política de UPDATE nem de DELETE, e é aqui que a tabela ganha
-- sentido: uma trilha que pode ser editada não é uma trilha.
--
-- Sem policy, a operação é negada para todo mundo que passa por RLS —
-- inclusive o admin, inclusive quem escreveu a linha. Quem precisar apagar de
-- verdade (retenção de dados, pedido de exclusão) passa pelo Service Role,
-- que é um caminho consciente e não um clique numa tela.

comment on table public.eventos is
  'Trilha de auditoria: quem fez o que e quando, em todos os modulos. So aceita INSERT - nao ha policy de update nem delete de proposito.';
comment on column public.eventos.ator_nome is
  'Nome escrito no momento do evento. Sobrevive ao perfil ser apagado - e o que impede a trilha de virar "alguem aprovou".';
comment on column public.eventos.entidade_id is
  'Sem FK de proposito: o evento tem que sobreviver ao objeto. "Fulano apagou a tarefa X" nao pode sumir junto com a tarefa X.';

-- ============================================================================
-- Onde os eventos são escritos
-- ============================================================================
--
-- Na APLICAÇÃO, por `registrar()` (src/lib/eventos/registrar.ts), e não por
-- trigger. Trigger pegaria toda escrita automaticamente, e mesmo assim seria a
-- escolha errada aqui por dois motivos:
--
--   1. Ele não sabe o NOME da ação. Um UPDATE em `prod_tarefas.status` é a
--      mesma coisa no banco, seja "entregou para revisão" ou "voltou da
--      revisão" — o significado está em quem clicou, não na linha.
--   2. Ele não sabe QUEM nos fluxos públicos. O cliente que aprova uma versão
--      pelo portal não tem `auth.uid()`; o nome dele está na memória da
--      aplicação, não na sessão do banco.
--
-- Os pontos instrumentados:
--   src/app/admin/onboarding/actions.ts      salvar, concluir, reabrir, enviar link
--   src/app/onboarding/acesso.ts             briefing respondido pelo cliente
--   src/app/admin/planejamento/actions.ts    criar, editar, ativar, encerrar, cancelar
--   src/app/admin/planejamento/pautas.ts     criar, excluir, subir, devolver
--   src/app/admin/producao/actions.ts        criar, mudar status, excluir, versões
--   src/app/dashboard/actions.ts             aprovação e devolução PELO CLIENTE

-- ============================================================================
-- ADENDO — a trilha DENTRO da peça
-- ============================================================================
--
-- A trilha por CLIENTE responde "o que anda acontecendo com essa conta". Não
-- responde "o que aconteceu com ESTE arquivo" — e essa é a pergunta que se faz
-- quando o cliente liga dizendo que não recebeu o vídeo. Ninguém quer filtrar
-- a linha do tempo da agência inteira; quer abrir a peça e ver que ela foi
-- para preview terça às 15h40 e voltou quinta às 9h.
--
-- Faltava uma coluna para isso ser uma consulta só: um evento de versão
-- ('versao_enviada', 'versao_aprovada') aponta para o id da VERSÃO, não o da
-- tarefa. Sem `tarefa_id`, juntar a história de uma peça exigiria descobrir
-- antes todas as versões dela.
alter table public.eventos
  add column if not exists tarefa_id uuid;

-- Backfill: para eventos de tarefa e de pauta, a própria entidade JÁ é a
-- tarefa (uma pauta é uma linha de `prod_tarefas` com `em_pauta = true`).
update public.eventos
   set tarefa_id = entidade_id
 where tarefa_id is null
   and entidade in ('tarefa', 'pauta')
   and entidade_id is not null;

create index if not exists eventos_tarefa_idx
  on public.eventos(tarefa_id, created_at);

comment on column public.eventos.tarefa_id is
  'A qual tarefa o evento pertence, inclusive quando a entidade e a versao. Base da trilha dentro do detalhe da peca. Sem FK: o evento sobrevive a tarefa.';

-- Sem FK, pelo mesmo motivo de `entidade_id`: "fulano apagou esta tarefa" é o
-- registro que não pode sumir junto com ela.
--
-- Uma nota sobre "subir para produção": ele grava DOIS eventos por peça
-- agora — um por peça (com `tarefa_id`) e um do lote (sem). Não é duplicação,
-- são trilhas diferentes. Na do cliente, soltar o mês é um gesto só e trinta
-- linhas iguais afogariam tudo o que veio antes. Na da peça, "veio para a
-- produção" é o passo que falta para a história dela fazer sentido do começo
-- ao fim.

-- ============================================================================
-- ADENDO — o cargo, e o passado que já estava gravado
-- ============================================================================
--
-- "Julia enviou para revisão" é uma frase. "Julia (social media) enviou para
-- revisão" é a mesma frase respondendo também POR QUE ela fez isso — e numa
-- trilha lida meses depois, por alguém que talvez nem trabalhasse aqui na
-- época, o cargo é o que transforma um nome numa função.
--
-- Retrato, como o nome: quem era editor na época continua editor no registro,
-- mesmo depois de virar coordenador. Trilha não se reescreve.
alter table public.eventos
  add column if not exists ator_cargo text;

comment on column public.eventos.ator_cargo is
  'Cargo de quem fez, escrito no momento do evento (equipe_membros.cargo). Retrato: quem era editor na epoca continua editor no registro.';

-- O BACKFILL, e por que ele não é invenção.
--
-- As tarefas criadas antes da trilha apareciam com "nada registrado", e isso
-- assusta mais do que informa. Parte do passado delas realmente nunca foi
-- guardada — ninguém anotava mudança de status. Mas parte SIM: a data de
-- criação da tarefa, e cada versão enviada e aprovada, com autor e hora,
-- sempre estiveram em `prod_tarefas` e `prod_entrega_versoes`.
--
-- O backfill lê esses campos e escreve os eventos correspondentes. É o mesmo
-- dado, mudando de lugar para poder ser lido em ordem. O que nunca foi gravado
-- continua sem aparecer — não há de onde tirar, e preencher com suposição
-- seria pior do que a lacuna.
--
-- Três cuidados que fazem esse backfill ser honesto:
--
--   1. `prod_tarefas` nunca guardou QUEM criou. O ator fica nulo e a tela
--      escreve "—": ninguém leva crédito ou culpa por engano.
--   2. Quem aprovou com perfil `cliente` aprovou PELO PORTAL. Essa distinção
--      existia no dado e estava perdida na leitura; o backfill a devolve em
--      `ator_tipo`.
--   3. Todo evento reconstruído leva `detalhe.reconstruido = true`, e a tela
--      diz isso em letra miúda. O que falta nesses históricos falta porque
--      nunca foi guardado, não porque alguém deixou de fazer — e é justo que
--      a diferença apareça.
--
-- Rodou uma vez, filtrando por tarefas sem nenhum evento e por versões sem o
-- evento correspondente, então repetir não duplica.
