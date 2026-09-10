-- ============================================================================
-- Onboarding de Clientes
-- ============================================================================
--
-- O briefing estratégico que se preenche UMA vez quando o cliente entra, e
-- que depois toda a operação consulta: quem é o público, qual o tom de voz,
-- onde estão os ativos, qual a meta, quem aprova.
--
-- Uma linha POR CLIENTE (`unique (cliente_id)`), não um histórico de
-- respostas. É um documento vivo: quando a marca muda o tom de voz, a linha
-- é atualizada — ninguém quer ler a versão de dois anos atrás para saber a
-- cor da marca hoje. Por isso também o formulário salva por etapa e não só
-- no fim (ver `etapa_atual` mais abaixo).
--
-- Tudo é NULLABLE de propósito, `cliente_id` à parte. Onboarding é o momento
-- em que menos se sabe do cliente: obrigar o campo "jornada de vendas" para
-- poder salvar a etapa 1 faz a pessoa inventar qualquer coisa ou abandonar o
-- formulário. O que é obrigatório de verdade é validado na tela, na hora de
-- CONCLUIR, não no banco a cada rascunho.
--
-- NOMES EM PORTUGUÊS: `cliente_onboarding` e não `client_onboarding` porque
-- todas as 70 tabelas do sistema são em português (`clientes`, `orcamentos`,
-- `prod_tarefas`, `fin_transacoes`). Uma tabela em inglês no meio quebra a
-- convenção e obriga a lembrar dela para sempre. Se preferir em inglês, é
-- trocar o nome aqui e nos índices/políticas — mas a tabela referenciada
-- continua sendo `public.clientes`, que é como ela se chama.

create table if not exists public.cliente_onboarding (
  id uuid primary key default gen_random_uuid(),

  -- Multi-tenant, mesmo padrão de todas as tabelas do sistema. O default
  -- resolve sozinho a partir de quem está logado (`current_company_id()`),
  -- então nenhuma inserção precisa passar o valor — e nenhuma pode mentir,
  -- porque a política de RLS confere.
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,

  -- `clientes`, o cadastro rico — NÃO `profiles`, que é só o login. Nem todo
  -- cliente tem login no portal, e todo cliente tem cadastro.
  -- `on delete cascade`: apagou o cliente, o briefing dele vai junto. Não
  -- existe onboarding órfão.
  cliente_id uuid not null references public.clientes(id) on delete cascade,

  -- ------------------------------------------------------------------------
  -- Etapa 1 — Negócio e Estratégia
  -- ------------------------------------------------------------------------
  oferta_principal text,
  -- Na moeda da empresa (`companies.moeda`), como todo valor do sistema.
  -- `numeric` e nunca `float`: dinheiro em ponto flutuante erra o centavo.
  ticket_medio numeric(14, 2),
  proposta_unica_valor text,
  publico_alvo text,
  personas text,
  jornada_vendas text,
  -- Lista de nomes livres. `text[]` e não uma tabela filha porque concorrente
  -- aqui é só um nome que se lê — não tem status, não tem histórico, ninguém
  -- vai filtrar orçamento por concorrente. Tabela filha custaria um join em
  -- toda leitura para não ganhar nada.
  concorrentes text[] not null default '{}',

  -- ------------------------------------------------------------------------
  -- Etapa 2 — Branding e Ativos
  -- ------------------------------------------------------------------------
  -- Link é o caminho preferido (Drive, Notion, Figma): não gasta
  -- armazenamento da conta e o cliente atualiza sem passar por aqui.
  -- `manual_marca_path` fica para quem quiser subir o PDF mesmo assim.
  manual_marca_url text,
  manual_marca_path text,
  -- Hex em texto, incluindo o "#": é assim que se cola do Figma e é assim
  -- que vai para o CSS. A ordem importa (primária, secundária, apoio), e
  -- array preserva ordem.
  paleta_cores text[] not null default '{}',
  tom_de_voz text,
  diretrizes_marca text,
  drive_ativos_url text,

  -- ------------------------------------------------------------------------
  -- Etapa 3 — Metas e KPIs
  -- ------------------------------------------------------------------------
  -- Coluna própria, e não jsonb, porque este é o campo que um dia vai virar
  -- filtro e gráfico ("todos os clientes cujo objetivo é Vendas").
  objetivo_principal text check (
    objetivo_principal is null
    or objetivo_principal in ('leads', 'vendas', 'branding', 'comunidade', 'outro')
  ),
  objetivo_descricao text,
  roas_alvo numeric(8, 2),
  cpa_alvo numeric(14, 2),
  meta_leads_mes integer,
  meta_faturamento_mes numeric(14, 2),
  historico_marketing text,

  -- ------------------------------------------------------------------------
  -- Etapa 4 — Acessos e Ferramentas
  -- ------------------------------------------------------------------------
  -- IDs de conta, nunca credenciais. Ver o bloco "SENHA NÃO ENTRA AQUI" no
  -- fim deste arquivo — não é detalhe, é a decisão mais importante da tabela.
  meta_ads_id text,
  google_ads_id text,
  ga4_id text,
  pixel_id text,
  -- Bag aberta: {"instagram": "...", "tiktok": "...", "youtube": "..."}.
  -- Aqui jsonb ganha de colunas fixas — rede social nova aparece a cada dois
  -- anos, e nenhuma delas merece uma migração de banco só para existir.
  redes_sociais jsonb not null default '{}'::jsonb,
  site_url text,
  cms_utilizado text,
  -- ONDE está o acesso e QUEM administra — não o acesso em si.
  cms_observacoes text,
  crm_utilizado text,
  ferramentas_observacoes text,

  -- ------------------------------------------------------------------------
  -- Etapa 5 — Operacional
  -- ------------------------------------------------------------------------
  decisor_nome text,
  decisor_cargo text,
  decisor_email text,
  -- Só dígitos com DDI, no mesmo formato que o gerador de link do WhatsApp
  -- produz (`src/lib/ferramentas/whatsapp.ts`) — assim o número cadastrado
  -- aqui vira link de conversa sem nenhuma conversão pelo caminho.
  aprovador_whatsapp text,
  canal_comunicacao text check (
    canal_comunicacao is null
    or canal_comunicacao in ('whatsapp', 'slack', 'email', 'telefone', 'teams', 'discord', 'outro')
  ),
  observacoes_operacionais text,

  -- ------------------------------------------------------------------------
  -- Estado do preenchimento
  -- ------------------------------------------------------------------------
  -- Em que etapa a pessoa parou. É o que faz o formulário de 5 telas ser
  -- usável: fecha o navegador na etapa 3 e volta na etapa 3. Sem isso, todo
  -- preenchimento interrompido vira preenchimento perdido.
  etapa_atual smallint not null default 1 check (etapa_atual between 1 and 5),
  -- `null` = ainda em rascunho. Preenchido = o briefing foi dado por pronto.
  -- Data e não booleano porque "desde quando está pronto" é a pergunta que
  -- se faz depois, e um booleano não responde.
  concluido_em timestamptz,

  criado_por uuid references public.profiles(id) on delete set null,
  atualizado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- UM briefing por cliente. É esta linha que permite o formulário fazer
  -- upsert por `cliente_id` sem nunca duplicar — dois cliques rápidos em
  -- "salvar" não podem gerar dois onboardings do mesmo cliente.
  constraint cliente_onboarding_cliente_unico unique (cliente_id)
);

-- A leitura real é sempre "o onboarding do cliente X". O unique acima já
-- cria o índice de `cliente_id`; este cobre as telas de lista ("quais
-- clientes ainda não concluíram o onboarding"), que filtram por empresa.
create index if not exists cliente_onboarding_company_id_idx
  on public.cliente_onboarding(company_id);

create index if not exists cliente_onboarding_concluido_em_idx
  on public.cliente_onboarding(company_id, concluido_em);

drop trigger if exists cliente_onboarding_set_updated_at on public.cliente_onboarding;
create trigger cliente_onboarding_set_updated_at
  before update on public.cliente_onboarding
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================
--
-- Mesmo desenho das outras tabelas de cadastro (ver `criativos-cadastro.sql`
-- e `cadastros.sql`): a equipe da empresa mexe no que é da empresa, e mais
-- ninguém enxerga nada.
--
-- A dupla checagem `is_staff() and company_id = current_company_id()` é
-- deliberada e não é redundância: a primeira barra cliente logado no portal
-- (que é `profiles.role = 'cliente'`), a segunda barra outra agência. Faltando
-- a segunda, qualquer funcionário de qualquer empresa leria o briefing
-- estratégico de todos os clientes de todas as agências — que é exatamente o
-- tipo de dado que não pode vazar entre concorrentes.
--
-- `with check` além de `using`: sem ele, dá para INSERIR uma linha carimbada
-- com o `company_id` de outra empresa. `using` filtra o que se lê; `with
-- check` valida o que se escreve.

alter table public.cliente_onboarding enable row level security;

drop policy if exists cliente_onboarding_staff_all on public.cliente_onboarding;
create policy cliente_onboarding_staff_all on public.cliente_onboarding
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

-- Sem política para `role = 'cliente'` POR ENQUANTO, e isso é uma escolha:
-- se um dia o próprio cliente for preencher o formulário, o caminho certo
-- não é dar RLS de leitura a ele — é um link com token, como já acontece em
-- orçamento (`/orcamento/[token]`) e assinatura (`/assinar/[token]`), onde
-- quem responde nem precisa ter login. Ver a nota no fim do arquivo.

comment on table public.cliente_onboarding is
  'Briefing estratégico do cliente, preenchido no onboarding. Uma linha por cliente, atualizada ao longo do tempo.';
comment on column public.cliente_onboarding.etapa_atual is
  'Última etapa aberta no formulário (1 a 5) — permite retomar de onde parou.';
comment on column public.cliente_onboarding.concluido_em is
  'NULL enquanto rascunho. Preenchido quando o briefing é dado por concluído.';
comment on column public.cliente_onboarding.cms_observacoes is
  'ONDE está o acesso e quem administra. Credencial NUNCA é armazenada aqui.';

-- ============================================================================
-- SENHA NÃO ENTRA AQUI
-- ============================================================================
--
-- O pedido original falava em "acessos ao site / CMS". Guardar login e senha
-- de cliente em texto no banco de um SaaS é um risco que não compensa: uma
-- falha de RLS, um backup exposto ou um funcionário desligado viram acesso
-- ao site do cliente — e a responsabilidade é de quem guardou.
--
-- Por isso os campos aqui são `site_url`, `cms_utilizado` e
-- `cms_observacoes`: qual é o sistema, onde fica o painel, com quem está a
-- credencial. A senha em si fica onde ela deve ficar — um gerenciador de
-- senhas (1Password, Bitwarden), compartilhada por lá.
--
-- Se um dia isso for mesmo necessário, o caminho é outro: criptografia no
-- servidor com chave fora do banco (pgsodium/Vault), coluna separada, acesso
-- só de admin e registro de cada leitura. Não é uma coluna `text` a mais.

-- ============================================================================
-- O PASSO SEGUINTE, QUANDO QUISER
-- ============================================================================
--
-- Este arquivo cria a tabela para a EQUIPE preencher. O ganho grande vem
-- depois: mandar o formulário para o próprio cliente responder, por link,
-- sem login — do mesmo jeito que ele já aprova orçamento e assina contrato.
--
-- Seriam duas colunas (`token text unique`, `token_expira_em timestamptz`) e
-- uma rota pública lendo por token via Service Role, exatamente como
-- `src/app/orcamento/data.ts` faz. Fica de fora agora porque muda o desenho
-- da tela — e porque preencher pela equipe já resolve o caso de hoje.
