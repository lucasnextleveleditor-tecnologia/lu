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
