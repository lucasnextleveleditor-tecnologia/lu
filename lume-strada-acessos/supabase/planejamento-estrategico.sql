-- ============================================================================
-- Planejamento Estratégico e Cronograma
-- ============================================================================
--
-- O ciclo de trabalho com o cliente: 1, 2 ou 3 meses, com escopo fechado e
-- datas marcadas. Onde o Onboarding responde "quem é esse cliente" uma vez só,
-- o Planejamento responde "o que vamos fazer para ele NESTES próximos meses" —
-- e por isso é HISTÓRICO, várias linhas por cliente, uma por ciclo.
--
-- É a diferença que decide o desenho da tabela: `cliente_onboarding` tem
-- `unique (cliente_id)` porque é um documento vivo que se atualiza;
-- `planos_estrategicos` NÃO tem, porque o plano de julho-agosto-setembro não
-- pode ser sobrescrito pelo de outubro. O plano velho é a prova do que foi
-- combinado, e é dele que se tira "o que a gente entregou no ciclo passado".
--
-- O que existe aqui, e nada além disso:
--   `planos_estrategicos` — o ciclo (resumo + escopo + cronograma)
--   `plano_alertas`       — o registro de qual aviso já foi disparado
--   `avisar_planos_vencendo()` — a função que o Cron chama uma vez por dia
--
-- A tabela `notifications` NÃO é criada aqui: ela já existe no sistema, é a
-- mesma do sininho, e este módulo só insere linhas nela. Escrever numa tabela
-- que já é lida por uma tela pronta é o barato: o aviso aparece no sino, com
-- link, sem uma linha de UI nova.

-- ============================================================================
-- 1. O ciclo
-- ============================================================================

create table if not exists public.planos_estrategicos (
  id uuid primary key default gen_random_uuid(),

  -- Multi-tenant, igual a todas as tabelas do sistema. O default resolve
  -- sozinho a partir de quem está logado, e a RLS mais abaixo confere.
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,

  -- `clientes`, o cadastro rico — não `profiles`, que é só login.
  -- `on delete cascade`: apagou o cliente, os planos dele vão junto. Não
  -- existe planejamento estratégico de cliente que não existe mais.
  cliente_id uuid not null references public.clientes(id) on delete cascade,

  -- --------------------------------------------------------------------------
  -- A) Resumo do Ciclo
  -- --------------------------------------------------------------------------
  duracao_meses smallint not null default 1 check (duracao_meses in (1, 2, 3)),
  data_inicio date not null,

  -- `data_fim` é CALCULADA e gravada pelo banco, nunca enviada pela tela.
  --
  -- Podia ser uma coluna comum preenchida pelo React, e seria um erro: o dia
  -- em que alguém editar a data de início por um formulário que esqueceu de
  -- recalcular o fim, o cliente inteiro passa a ser avisado na data errada —
  -- e ninguém descobre, porque a data errada parece uma data. Coluna gerada
  -- não tem esse dia. Editou o início ou a duração, o fim se refaz sozinho,
  -- venha a alteração da tela, de um script ou do SQL Editor.
  --
  -- O `- 1 day` é o que faz o ciclo fechar certo: começou em 10/09 e dura 1
  -- mês, termina em 09/10 e não em 10/10, senão o ciclo seguinte começaria no
  -- mesmo dia em que o anterior acaba.
  --
  -- Um aviso sobre fim de mês: o Postgres "grampeia" a data quando o mês
  -- seguinte é mais curto. 31/01 + 1 mês = 28/02, menos 1 dia = 27/02. Não é
  -- bug, é a única resposta possível para "um mês depois de 31 de janeiro" —
  -- mas se o ciclo começa dia 31, o fim vem alguns dias antes do esperado.
  -- Na prática se começa ciclo no dia 1 ou no dia 5, e o caso some.
  data_fim date generated always as (
    ((data_inicio + (duracao_meses * interval '1 month')) - interval '1 day')::date
  ) stored,

  foco_estrategico text,
  -- Na moeda da empresa (`companies.moeda`), como todo valor do sistema.
  -- `numeric` e nunca `float`: verba de mídia em ponto flutuante erra o
  -- centavo, e essa é a conta que o cliente confere.
  orcamento_midia_total numeric(14, 2) check (orcamento_midia_total is null or orcamento_midia_total >= 0),

  -- --------------------------------------------------------------------------
  -- B) Escopo de Entregas
  -- --------------------------------------------------------------------------
  -- Quantidade combinada para o ciclo INTEIRO, não por mês. Um número por
  -- mês obrigaria a multiplicar de cabeça toda vez que alguém pergunta
  -- "quantos posts faltam?", e a resposta que se quer é sempre a do ciclo.
  qtd_posts_social integer not null default 0 check (qtd_posts_social >= 0),
  qtd_campanhas_trafego integer not null default 0 check (qtd_campanhas_trafego >= 0),

  -- Lista de texto livre: "1 vídeo institucional", "banner do evento de maio".
  -- `text[]` e não tabela filha porque peça extra aqui é só uma linha que se
  -- lê no contrato do ciclo — não tem status, não tem prazo próprio, ninguém
  -- vai filtrar relatório por ela. Tabela filha custaria um join em toda
  -- leitura para não ganhar nada. Se um dia peça extra precisar de prazo e
  -- responsável, ela deixou de ser "extra" e virou tarefa de produção, que já
  -- tem tabela.
  pecas_extras text[] not null default '{}',
  escopo_observacoes text,

  -- --------------------------------------------------------------------------
  -- C) Cronograma
  -- --------------------------------------------------------------------------
  -- Tudo NULLABLE de propósito. Quem monta o plano quase nunca tem as quatro
  -- datas na primeira sentada — a reunião de resultados costuma ser marcada
  -- semanas depois. Obrigar as quatro para poder salvar faz a pessoa inventar
  -- data, e data inventada é pior do que data em branco: em branco a tela
  -- mostra "a definir", inventada ela vira compromisso.
  data_limite_pautas date,
  data_limite_artes date,
  data_go_live date,
  data_reuniao_resultados date,

  -- --------------------------------------------------------------------------
  -- Estado
  -- --------------------------------------------------------------------------
  -- `rascunho`  — em montagem, não vale e não gera aviso.
  -- `ativo`     — o ciclo em vigor. É o único que o Cron olha.
  -- `encerrado` — chegou ao fim (na data ou por decisão).
  -- `cancelado` — morreu antes de valer. Guardado para não sumir do histórico.
  status text not null default 'rascunho'
    check (status in ('rascunho', 'ativo', 'encerrado', 'cancelado')),

  criado_por uuid references public.profiles(id) on delete set null,
  atualizado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- UM ciclo ativo por cliente, e a regra mora no BANCO.
--
-- Índice único PARCIAL: a restrição só existe para as linhas `ativo`, então o
-- mesmo cliente pode ter dez planos encerrados e um ativo — que é exatamente
-- o histórico que se quer. Fazer essa checagem só no React seria confiar em
-- quem clica duas vezes em "ativar", em duas abas abertas e no dia em que
-- alguém rodar um UPDATE pelo SQL Editor. Dois ciclos ativos ao mesmo tempo
-- significam duas datas de vencimento e dois avisos contraditórios para o
-- mesmo cliente.
create unique index if not exists planos_estrategicos_um_ativo_por_cliente
  on public.planos_estrategicos(cliente_id)
  where status = 'ativo';

-- A lista da tela: "os planos desta empresa, por status".
create index if not exists planos_estrategicos_company_status_idx
  on public.planos_estrategicos(company_id, status);

-- O índice do Cron. Ele varre TODAS as empresas de uma vez, filtrando por
-- `status = 'ativo'` e comparando `data_fim` — parcial e nessa ordem, a
-- varredura diária lê só os ciclos em vigor, e não a tabela inteira com todo
-- o histórico de todos os clientes de todas as agências.
create index if not exists planos_estrategicos_vencimento_idx
  on public.planos_estrategicos(data_fim)
  where status = 'ativo';

create index if not exists planos_estrategicos_cliente_idx
  on public.planos_estrategicos(cliente_id);

drop trigger if exists planos_estrategicos_set_updated_at on public.planos_estrategicos;
create trigger planos_estrategicos_set_updated_at
  before update on public.planos_estrategicos
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. Os avisos já disparados
-- ============================================================================
--
-- Esta tabela é o CADEADO do Cron, e é a peça mais importante do módulo.
--
-- Um Cron diário sem memória é um Cron que repete: rodou duas vezes por uma
-- reexecução, um deploy, uma migração, um susto — e o cliente aparece duas
-- vezes no sino com o mesmo aviso. Pior: se um dia o agendamento for ajustado
-- para rodar de hora em hora, o mesmo aviso sai 24 vezes.
--
-- A solução não é "conferir antes de inserir" (entre a conferência e a
-- inserção cabem duas execuções simultâneas): é uma UNIQUE em
-- (plano_id, dias_restantes) e deixar o BANCO recusar a segunda. A função lá
-- embaixo insere aqui PRIMEIRO, com `on conflict do nothing`, e só notifica
-- as linhas que a inserção devolveu. O que não entrou aqui, não vira aviso.
create table if not exists public.plano_alertas (
  id uuid primary key default gen_random_uuid(),

  -- Sem `default current_company_id()`, ao contrário de todas as outras
  -- tabelas — e de propósito. Quem insere aqui é o Cron, que roda SEM usuário
  -- logado: `auth.uid()` é nulo, `current_company_id()` devolveria nulo e a
  -- inserção quebraria em `not null` todo santo dia. A função copia o
  -- `company_id` do próprio plano, que é a fonte certa.
  company_id uuid not null references public.companies(id) on delete cascade,

  plano_id uuid not null references public.planos_estrategicos(id) on delete cascade,

  -- Os marcos que o sistema avisa. A lista é fechada aqui também, e não só na
  -- função: se um dia alguém inserir "faltam 7 dias" na mão, o banco recusa —
  -- ou a régua de avisos passa a ser duas listas diferentes que ninguém
  -- lembra de manter iguais.
  dias_restantes smallint not null check (dias_restantes in (20, 15, 10, 5, 4, 3, 2, 1)),

  enviado_em timestamptz not null default now(),

  -- A chave de idempotência. Um aviso, um marco, um plano. Para sempre.
  constraint plano_alertas_unico unique (plano_id, dias_restantes)
);

-- ============================================================================
-- 3. RLS
-- ============================================================================
--
-- Mesmo desenho do resto do sistema (ver `cliente-onboarding.sql`): a equipe
-- da empresa mexe no que é da empresa, e mais ninguém enxerga nada.
--
-- `is_staff() and company_id = current_company_id()` não é redundância: a
-- primeira parte barra cliente logado no portal, a segunda barra outra
-- agência. Faltando a segunda, qualquer funcionário de qualquer empresa leria
-- a verba de mídia e o escopo fechado dos clientes de todas as agências.
--
-- `with check` além de `using`: `using` filtra o que se lê, `with check`
-- valida o que se escreve. Sem ele, dá para INSERIR uma linha carimbada com o
-- `company_id` de outra empresa.

alter table public.planos_estrategicos enable row level security;

drop policy if exists planos_estrategicos_staff_all on public.planos_estrategicos;
create policy planos_estrategicos_staff_all on public.planos_estrategicos
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

alter table public.plano_alertas enable row level security;

-- Só LEITURA para a equipe: a tela pode querer mostrar "avisado há 3 dias",
-- mas ninguém digita alerta na mão. Quem escreve aqui é a função do Cron, que
-- é `security definer` e roda como dona da tabela — dona de tabela não passa
-- por RLS, então a política restritiva não atrapalha o Cron.
drop policy if exists plano_alertas_staff_read on public.plano_alertas;
create policy plano_alertas_staff_read on public.plano_alertas
  for select
  using (is_staff() and company_id = current_company_id());

-- ============================================================================
-- 4. A função que o Cron chama
-- ============================================================================
--
-- Roda uma vez por dia e faz duas coisas, nesta ordem:
--   a) encerra os ciclos cuja data já passou;
--   b) avisa a equipe dos ciclos que vencem em 20, 15, 10, 5, 4, 3, 2 ou 1 dia.
--
-- Devolve quantos avisos foram criados, para dar para rodar na mão no SQL
-- Editor e ver o resultado sem ir olhar tabela.
--
-- `security definer` porque não há usuário logado: sem isso a função tropeça
-- na própria RLS que a gente acabou de escrever. `set search_path = public`
-- porque função `security definer` sem search_path fixo é a receita clássica
-- de escalonamento de privilégio no Postgres.
--
-- Sem parâmetro de empresa, como todas as funções do sistema: ela varre todas
-- as empresas de uma vez, e cada aviso sai carimbado com o `company_id` do
-- plano que o gerou. Uma função por empresa exigiria um agendamento por
-- empresa, e o dia em que uma agência nova fosse criada, ninguém lembraria.

create or replace function public.avisar_planos_vencendo()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  criados integer;
begin
  -- --------------------------------------------------------------------------
  -- a) Encerra o que já venceu
  -- --------------------------------------------------------------------------
  -- Sem isto, o ciclo que acabou em março continua "ativo" para sempre — e o
  -- índice único acima IMPEDE de criar o ciclo seguinte para aquele cliente
  -- ("já existe um plano ativo") por um plano que morreu meses atrás. O
  -- encerramento não apaga nada: a linha continua lá, só muda de status.
  update public.planos_estrategicos
     set status = 'encerrado'
   where status = 'ativo'
     and data_fim < current_date;

  -- --------------------------------------------------------------------------
  -- b) Avisa os que estão vencendo
  -- --------------------------------------------------------------------------
  with marcos as (
    -- A régua de avisos. Larga no começo (20, 15, 10) para dar tempo de
    -- pensar o próximo ciclo, apertada no fim (5, 4, 3, 2, 1) para não deixar
    -- passar. É a régua que o cliente pediu, sem interpretação.
    select unnest(array[20, 15, 10, 5, 4, 3, 2, 1]::smallint[]) as dias
  ),
  vencendo as (
    select
      p.id         as plano_id,
      p.company_id as company_id,
      m.dias       as dias
    from public.planos_estrategicos p
    join marcos m on m.dias = (p.data_fim - current_date)
    where p.status = 'ativo'
  ),
  -- O cadeado: tenta registrar o alerta ANTES de notificar. `do nothing`
  -- engole a repetição em silêncio, e o `returning` devolve só o que era
  -- realmente novo. Duas execuções no mesmo dia: a segunda devolve zero linha
  -- e não notifica ninguém.
  novos as (
    insert into public.plano_alertas (company_id, plano_id, dias_restantes)
    select v.company_id, v.plano_id, v.dias
      from vencendo v
    on conflict (plano_id, dias_restantes) do nothing
    returning company_id, plano_id, dias_restantes
  ),
  avisos as (
    insert into public.notifications (
      company_id, user_id, tipo, titulo, mensagem, href, reference_id, reference_type
    )
    select
      n.company_id,
      pr.id,
      'system',
      -- O texto sai no idioma da EMPRESA (`companies.idioma_padrao`), e não
      -- em português fixo. O sininho mostra o que está gravado na linha — não
      -- há como traduzir na hora da leitura, porque a mensagem tem o nome do
      -- cliente e o número de dias grudados no meio da frase. Então a decisão
      -- do idioma é tomada aqui, no único lugar que a conhece.
      case co.idioma_padrao
        when 'en' then 'Strategic plan expiring'
        when 'es' then 'Planificación por vencer'
        else            'Planejamento vencendo'
      end,
      case co.idioma_padrao
        when 'en' then 'The plan for ' || c.nome || ' expires in ' || n.dias_restantes ||
                       case when n.dias_restantes = 1 then ' day.' else ' days.' end ||
                       ' Time to build the next cycle.'
        when 'es' then 'La planificación de ' || c.nome || ' vence en ' || n.dias_restantes ||
                       case when n.dias_restantes = 1 then ' día.' else ' días.' end ||
                       ' Es hora de rehacer el plan.'
        else            'O planejamento do cliente ' || c.nome || ' vence em ' || n.dias_restantes ||
                       case when n.dias_restantes = 1 then ' dia.' else ' dias.' end ||
                       ' É hora de refazer o plano.'
      end,
      -- O sino leva direto para o plano. Notificação sem link vira "onde era
      -- mesmo?" e a pessoa fecha o sino sem fazer nada.
      '/admin/planejamento/' || n.plano_id,
      n.plano_id,
      'plano_estrategico'
    from novos n
    join public.planos_estrategicos p on p.id = n.plano_id
    join public.clientes c            on c.id = p.cliente_id
    join public.companies co          on co.id = n.company_id
    -- Um aviso por pessoa da equipe daquela empresa. `role in ('admin',
    -- 'funcionario')` é a mesma régua de `is_staff()`: quem não pode abrir o
    -- plano não recebe aviso sobre ele. `active` de fora — funcionário
    -- desligado não recebe notificação nova.
    join public.profiles pr
      on pr.company_id = n.company_id
     and pr.active
     and pr.role in ('admin', 'funcionario')
    returning 1
  )
  select count(*)::integer into criados from avisos;

  return criados;
end;
$$;

-- A função é do CRON, não do navegador.
--
-- O Supabase concede EXECUTE a `anon` e `authenticated` por padrão em toda
-- função nova, e `revoke ... from public` NÃO tira isso — os dois papéis
-- ganharam a permissão diretamente e precisam ser revogados um a um. Sem
-- estas três linhas, qualquer visitante deslogado poderia chamar pela API
-- REST uma função `security definer` que escreve em três tabelas.
revoke execute on function public.avisar_planos_vencendo() from public;
revoke execute on function public.avisar_planos_vencendo() from anon;
revoke execute on function public.avisar_planos_vencendo() from authenticated;

comment on function public.avisar_planos_vencendo() is
  'Chamada pelo pg_cron uma vez por dia: encerra ciclos vencidos e notifica a equipe em 20/15/10/5/4/3/2/1 dias do fim. Idempotente via plano_alertas.';

comment on table public.planos_estrategicos is
  'Ciclo de planejamento do cliente (1, 2 ou 3 meses). Histórico: várias linhas por cliente, no máximo uma ativa.';
comment on column public.planos_estrategicos.data_fim is
  'Calculada pelo banco a partir de data_inicio + duracao_meses - 1 dia. Nunca enviada pela aplicação.';
comment on table public.plano_alertas is
  'Registro de avisos já disparados. A UNIQUE (plano_id, dias_restantes) é o que impede o Cron de repetir notificação.';

-- ============================================================================
-- 5. O agendamento (rodar SEPARADO — ver explicação)
-- ============================================================================
--
-- Estas duas linhas NÃO estão no bloco acima de propósito: instalar extensão
-- e criar agendamento são operações de infraestrutura, feitas uma vez por
-- projeto, e não fazem parte da migração da tabela.
--
-- Já aplicado neste projeto em 10/09/2026. Fica registrado aqui para quem
-- montar um ambiente novo (ou para o dia em que este projeto for recriado):
--
--   create extension if not exists pg_cron with schema pg_catalog;
--   grant usage on schema cron to postgres;
--
-- O `with schema pg_catalog` não é gosto: o pg_cron cria o schema `cron`
-- sozinho e exige ser instalado em `pg_catalog`. Pedir `with schema cron`
-- devolve erro.
--
-- E o agendamento:
--
--   select cron.schedule(
--     'avisar-planos-vencendo',
--     '0 12 * * *',
--     $cron$ select public.avisar_planos_vencendo(); $cron$
--   );
--
-- POR QUE MEIO-DIA UTC, e não meia-noite: o pg_cron marca em UTC e a função
-- compara com `current_date`, que também é UTC. Às 12:00 UTC o dia do
-- calendário é o MESMO em qualquer fuso de UTC-11 a UTC+11 — 09:00 da manhã
-- em Brasília, 04:00 da manhã em Los Angeles, 23:00 em Sydney. Agendar à
-- meia-noite UTC colocaria o Brasil (21:00 do dia anterior) num dia diferente
-- do banco, e todo aviso sairia com um dia de erro. Meio-dia UTC é a única
-- hora do dia em que o mundo inteiro concorda sobre que dia é hoje.
--
-- Para conferir depois:            select * from cron.job;
-- Para ver as últimas execuções:   select * from cron.job_run_details order by start_time desc limit 20;
-- Para desligar:                   select cron.unschedule('avisar-planos-vencendo');
--
-- Para testar sem esperar um dia, no SQL Editor:
--   select public.avisar_planos_vencendo();
-- (devolve quantos avisos criou; rodar duas vezes seguidas deve devolver 0 na
-- segunda — é o cadeado funcionando)
