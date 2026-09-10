-- ============================================================================
-- Calendário de Conteúdo
-- ============================================================================
--
-- O lugar onde os posts do mês são escritos, entre o Planejamento (o que o
-- ciclo tem) e a Produção (quem faz). Faltava: isso era feito no caderno.
--
-- A DECISÃO QUE DEFINE O MÓDULO: um post e uma tarefa de produção são A MESMA
-- LINHA de `prod_tarefas`, só que marcada com `em_pauta = true`.
--
-- A alternativa óbvia era uma tabela `posts` própria e um botão "subir para
-- produção" que copiasse os dados. Copiar significa duas linhas com título,
-- cliente, data e briefing iguais — e elas divergem no primeiro dia em que
-- alguém corrigir a data de um lado só. É o pior tipo de bug: as duas telas
-- continuam parecendo certas.
--
-- Aqui não há cópia. "Subir para produção" tira a marca, põe a tarefa em
-- `a_fazer` e escreve o responsável. O briefing que a social media escreveu já
-- está em `briefing`, a referência em `referencias_estilo`, o cliente e a data
-- nos campos de sempre — nunca saíram de lá.
--
-- O PREÇO dessa escolha está no fim deste arquivo, e é honesto dizê-lo: toda
-- leitura de produção passa a precisar de um filtro.

-- `true` = ainda é ideia no calendário de conteúdo, invisível para quem
-- produz. Default `false` para que toda tarefa que já existe continue sendo
-- tarefa normal, sem backfill.
alter table public.prod_tarefas
  add column if not exists em_pauta boolean not null default false;

-- De qual ciclo veio. `on delete set null` e NÃO `cascade`: apagar um ciclo de
-- planejamento não pode apagar o trabalho que já virou tarefa de produção — a
-- peça foi feita, entregue e aprovada; ela não pertence mais ao plano.
alter table public.prod_tarefas
  add column if not exists plano_id uuid references public.planos_estrategicos(id) on delete set null;

-- Onde o post vai ao ar e em que formato. Duas colunas em `prod_tarefas` em
-- vez de uma tabela 1-para-1: uma tabela filha custaria um join em toda
-- leitura do calendário e um insert em todo post, para guardar dois textos.
-- Ficam nulas nas tarefas que não são post, que é a maioria.
alter table public.prod_tarefas
  add column if not exists post_canal text;
alter table public.prod_tarefas
  add column if not exists post_formato text;

alter table public.prod_tarefas drop constraint if exists prod_tarefas_post_canal_check;
alter table public.prod_tarefas add constraint prod_tarefas_post_canal_check
  check (post_canal is null or post_canal in
    ('instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'site', 'outro'));

alter table public.prod_tarefas drop constraint if exists prod_tarefas_post_formato_check;
alter table public.prod_tarefas add constraint prod_tarefas_post_formato_check
  check (post_formato is null or post_formato in
    ('reels', 'carrossel', 'story', 'estatico', 'video', 'texto', 'outro'));

-- O índice do calendário: "as pautas deste ciclo, por dia". Parcial, então ele
-- cobre só as linhas em pauta — e não cresce junto com todo o histórico de
-- produção da agência, que é a parte grande da tabela.
create index if not exists prod_tarefas_pauta_idx
  on public.prod_tarefas(plano_id, data_entrega)
  where em_pauta;

comment on column public.prod_tarefas.em_pauta is
  'true = post ainda em planejamento, nao aparece em Producao. Toda leitura de producao precisa filtrar em_pauta = false.';
comment on column public.prod_tarefas.plano_id is
  'Ciclo de planejamento que originou este post. Null para tarefas criadas direto em Producao.';
comment on column public.prod_tarefas.post_canal is
  'Onde o post vai ao ar. Preenchido so para posts vindos do calendario de conteudo.';
comment on column public.prod_tarefas.post_formato is
  'Formato da peca (reels, carrossel...). Preenchido so para posts vindos do calendario de conteudo.';

-- ============================================================================
-- O PREÇO: seis leituras precisam filtrar
-- ============================================================================
--
-- Sem RLS nova e sem tabela nova, a conta veio para a aplicação: quem lê
-- `prod_tarefas` como PRODUÇÃO precisa acrescentar `em_pauta = false`. Sem
-- isso, as trinta pautas do mês caem no backlog do Kanban de todo mundo.
--
-- Os seis lugares, todos com um comentário no código apontando para cá:
--
--   src/app/admin/producao/page.tsx           o Kanban, a lista, o calendário
--   src/app/admin/dashboard/page.tsx          o painel
--   src/app/admin/dashboard/calendario/page.tsx  o calendário geral
--   src/app/admin/agenda/data.ts              a agenda
--   src/app/admin/relatorios/actions.ts       os relatórios de produtividade
--   src/app/dashboard/actions.ts              O PORTAL DO CLIENTE
--
-- O último é o que mais importa: uma pauta que ainda está sendo pensada não
-- pode aparecer para o cliente antes de a agência decidir mostrar.
--
-- Uma view (`prod_tarefas_producao`) resolveria isso de uma vez e foi
-- considerada. Ficou de fora porque trocaria seis filtros explícitos por uma
-- indireção em todo o módulo de produção — e o dia em que alguém escrever a
-- sétima leitura, o comentário na coluna (`comment on column ... em_pauta`) é
-- o que vai avisar, venha a consulta de onde vier.

-- ============================================================================
-- ADENDO — o tipo da pauta, e por que ele existe
-- ============================================================================
--
-- O escopo de um ciclo promete TRÊS coisas contáveis: posts de social media,
-- campanhas de tráfego e peças extras. O calendário nasceu sabendo contar só
-- posts, e os indicadores do topo ("faltam 8 posts") não tinham como
-- descontar campanha de campanha e peça de peça.
--
-- `post` como default porque toda pauta que já existia é post, e porque é o
-- caso comum: quem abre o calendário está montando o mês de social media.
alter table public.prod_tarefas
  add column if not exists tipo_pauta text not null default 'post';

alter table public.prod_tarefas drop constraint if exists prod_tarefas_tipo_pauta_check;
alter table public.prod_tarefas add constraint prod_tarefas_tipo_pauta_check
  check (tipo_pauta in ('post', 'campanha', 'extra'));

comment on column public.prod_tarefas.tipo_pauta is
  'O que a pauta e dentro do escopo do ciclo: post de social, campanha de trafego ou peca extra. Base dos indicadores do calendario de conteudo.';

-- Uma nota sobre a CONTAGEM, que é uma decisão e não um detalhe: os
-- indicadores contam pauta + produção. O que já subiu continua sendo entrega
-- daquele ciclo. Contar só o que está em pauta faria o número andar PARA TRÁS
-- toda vez que a social media soltasse o mês para a produção — como se subir a
-- tarefa desfizesse o trabalho de tê-la escrito.
