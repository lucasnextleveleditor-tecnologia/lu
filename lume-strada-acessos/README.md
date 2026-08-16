# Lume Strada Filmes — Painel Interno (Agência Hub)

Sistema interno da Lume Strada Filmes: um único painel dark para a equipe
gerenciar clientes e o próprio acesso deles à plataforma, o financeiro da
agência (contas, cartões, transações, faturas), a produção de vídeo (Kanban
de tarefas, briefing, entregas versionadas com aprovação do cliente), o funil
comercial (leads → conversão em cliente), o tráfego pago por cliente (meta
diária vs. investido, no estilo [Cliente] → [Meta do Dia] → [Status Atual]),
o acompanhamento de anúncios/infoprodutos, notificações via WhatsApp e o
inventário de bens da agência — além de um painel de White-Label para
personalizar a identidade visual da própria plataforma sem mexer em código.

Sistema **single-tenant** (uma agência, um banco) — não existe conceito de
`company_id` ou multi-tenant; simplicidade deliberada para o caso de uso real.

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (Auth +
Postgres + RLS + Storage + Realtime).

## Módulos

- **Cadastros** (`/admin`) — clientes (cadastro rico, fora de `profiles`) e
  equipe (`equipe_membros`, cadastro leve dos funcionários); gera/gerencia o
  acesso de login (convite, expiração, suspensão) de clientes e funcionários.
- **Financeiro** (`/admin/financeiro`) — ERP simples: contas/carteiras,
  cartões de crédito (com fatura), categorias, transações (receita/despesa/
  transferência), tudo separado por contexto `pessoal`/`profissional`. Saldo
  e limite de cartão são sempre *calculados* (views), nunca uma coluna
  incrementada manualmente.
- **Produção** (`/admin/producao`) — Kanban e Lista de tarefas de vídeo, com
  briefing rico, subtarefas, responsável e tipo de serviço; cada tarefa tem
  "Entregas" com versionamento (v1, v2...) de arquivo ou link externo e um
  fluxo de aprovação (pendente → aprovado / solicitar alteração).
- **Comercial** (`/admin/comercial`) — funil de leads (CRM simples) com
  atividades e follow-up; converter um lead em cliente cria a conta de
  acesso dele (`auth.admin.inviteUserByEmail`) — ação admin-only.
- **Tráfego & Metas** (`/admin/trafego`) — meta diária de investimento/leads
  por cliente vs. o que foi realmente lançado no dia, com status calculado
  (Sem Meta / Abaixo da Meta / No Caminho / Meta Batida). Inclui o
  sub-módulo **Info-Produtos**: produtos, criativos de anúncio,
  acompanhamento diário (`anuncios_tracking`) e fechamento semanal de lucro.
- **WhatsApp** (`/admin/whatsapp`) — envio/recebimento de mensagens; o
  webhook (`/api/whatsapp/webhook`) já está de pé, mas o *provider* real
  (Twilio/Meta Cloud API/etc.) ainda não foi implementado —
  `getWhatsAppProvider()` hoje sempre retorna "não configurado" (ver
  `AUDITORIA.md`, item deferido).
- **Inventário** (`/admin/inventario`) — bens da agência por categoria e
  etiqueta, uso exclusivo da equipe.
- **Aparência** (`/admin/aparencia`) — White-Label: logo, favicon, cores,
  tela de login, tema — tudo lido a cada request de uma linha singleton.
- **Dashboard** (`/admin/dashboard`) — visão geral (o único módulo aberto a
  *qualquer* membro da equipe, sem depender de permissão): agenda do dia,
  contadores de atraso, e o saldo consolidado financeiro só aparece pra quem
  tem o módulo Financeiro liberado.
- **Portal do Cliente** (`/dashboard`) — status do próprio acesso + tráfego
  de hoje (somente leitura) + área de conteúdo liberado.

## RBAC — papéis e permissões

Três papéis em `profiles.role`: `admin`, `funcionario`, `cliente`. Sem
hierarquia de tenant — é literalmente só isso.

- **`admin`** — acesso total a tudo, sempre (bypass incondicional).
- **`funcionario`** — acesso módulo a módulo, controlado por
  `profiles.permissoes` (jsonb: `{ clientes, financeiro, producao,
  comercial, trafego, inventario, whatsapp }`, cada chave um boolean). Duas
  ações ficam deliberadamente FORA desse sistema, só-admin mesmo com todas
  as permissões ligadas: gerenciar Equipe/Gerar Acesso e a tela de
  Aparência (`requireAdmin()`), e converter um lead em cliente (cria conta
  de login de verdade).
- **`cliente`** — só o Portal (`/dashboard`); nunca acessa `/admin`.

Duas camadas de checagem, sempre as duas:

1. **RLS no banco** (`public.is_staff()` / `public.is_admin()`,
   `security definer`, evita recursão) — garante só "é admin OU
   funcionário?" a nível de linha. É grosso de propósito.
2. **Checagem fina na aplicação** — `requireAdmin()`/`requireModuloOuRedirect()`
   em `src/lib/auth/requireAdmin.ts`, chamada no topo de toda página de
   módulo e no início de toda Server Action correspondente. É aqui que
   "funcionário tem a permissão X ligada?" é decidido — o RLS não sabe disso.

`src/middleware.ts` roda em toda requisição e é a única camada que garante
expiração em tempo real: compara `active`/`expires_at` do perfil a cada
request (não só no login), então suspender/expirar alguém já logado o
derruba na próxima navegação dele.

## Estrutura de arquivos (visão geral)

```
src/
  middleware.ts                  # Protege rotas, valida expiração a cada requisição, libera /api (webhooks) da checagem de sessão
  app/
    login/, definir-senha/, acesso-expirado/, auth/callback/   # Fluxo de acesso (convite -> senha -> sessão)
    api/whatsapp/webhook/        # Recebe eventos do provedor de WhatsApp (autenticação própria, fora do middleware)
    admin/
      layout.tsx, page.tsx, actions.ts   # Cadastros (home do admin): clientes, equipe, gerar acesso
      dashboard/                 # Visão Geral — aberta a qualquer membro da equipe
      financeiro/                # Contas, cartões, categorias, transações, faturas
      producao/                  # Kanban/Lista de tarefas, entregas versionadas, aprovação
      comercial/                 # Funil de leads, atividades, conversão em cliente
      trafego/                   # Metas diárias + registros de tráfego; trafego/infoprodutos-actions.ts = sub-módulo Info-Produtos
      whatsapp/                  # Conversas e envio de mensagens
      inventario/                # Categorias + Itens & Etiquetas
      aparencia/                 # White-Label
    dashboard/                   # Portal do cliente
  components/
    admin/<modulo>/              # Componentes de cada módulo acima, espelhando a mesma pasta em app/admin
    ui/                          # Button, Input, Select, Card, Badge, Meter, StatTile, icons — kit visual mínimo
  lib/
    supabase/{client,server,admin}.ts   # Clientes Supabase (browser ANON / server ANON+cookies / Service Role — server-only)
    auth/requireAdmin.ts         # RBAC — requireAdmin, requireModulo(OuRedirect), buscarPerfilComPermissoes
    branding/                    # Config de White-Label (leitura cacheada, nunca lança)
    types/                       # Tipos do banco, escritos à mão por módulo
    utils/                       # Uma "única fonte da verdade" por cálculo (status.ts, trafego.ts, financeiro.ts, producao.ts, upload.ts, sanitize.ts...)
supabase/
  schema.sql                     # Base: profiles, RBAC, metas/tráfego, inventário, branding — rode primeiro
  cadastros.sql                  # Clientes, equipe, atividades, bucket "producao"
  financeiro.sql                 # ERP: contas, cartões, categorias, transações, faturas, views de saldo/limite
  producao.sql                   # Tarefas, subtarefas, entregas, versões, bucket "producao"
  comercial.sql                  # Leads, atividades de lead
  infoprodutos.sql               # Produtos, anuncios_tracking, fechamentos semanais, bucket "infoprodutos"
  whatsapp.sql                   # Conversas/mensagens de WhatsApp
  patrimonio.sql / dashboard.sql # Extras de inventário / views de apoio ao dashboard
  correcoes-auditoria.sql        # Correções pós-auditoria (rode por ÚLTIMO — ver AUDITORIA.md)
AUDITORIA.md                     # Relatório de auditoria do projeto (segurança, modelo de dados, UX, gaps, performance) e o que ainda falta
```

## Decisões de projeto (vale ler antes de customizar)

- **Single-tenant de propósito.** Sem `company_id`, sem isolamento
  multi-cliente-da-Lume-Strada — é a ferramenta interna de UMA agência.
  Simplifica RLS, simplifica todo o resto.
- **Status nunca é uma coluna gravada.** `active` + `expires_at` são os dois
  únicos campos reais de acesso; "Ativo / Inativo / Expirado" é sempre
  *calculado* em `lib/utils/status.ts`. Mesmo padrão se repete em Tráfego
  (`lib/utils/trafego.ts`) e no status de aprovação de entregas de Produção.
- **Cadastro é só por convite.** Não existe tela de "criar conta" pública —
  todo login nasce de `auth.admin.inviteUserByEmail`, chamado a partir de
  uma Server Action com a Service Role Key (`server-only`, nunca chega ao
  navegador).
- **Dinheiro nunca é uma coluna incrementada manualmente.** Saldo de conta e
  limite de cartão são sempre somados a partir de `fin_transacoes` (views
  `fin_contas_saldo`/`fin_cartoes_limite`) — evita a conta e a soma das
  transações "descolarem" com o tempo. Pelo mesmo motivo, apagar uma conta/
  cartão com transações vinculadas é bloqueado (`on delete restrict`, ver
  `correcoes-auditoria.sql`) em vez de apagar o histórico em cascata.
  Exclusão de conta/cartão só é permitida sem lançamentos.
- **Upload grande vai direto do navegador pro Storage.** Entregas de
  Produção e criativos de anúncio usam signed upload URL
  (`createSignedUploadUrl` + `uploadToSignedUrl`) em vez de mandar o arquivo
  pela Server Action — o corpo de uma function serverless (Vercel) trava em
  4.5MB, incompatível com vídeo de verdade. O limite de tamanho de fato é
  garantido pelo `file_size_limit` do bucket no Storage, não só por uma
  checagem de UI.
- **Buckets públicos nunca aceitam SVG.** `branding` e `infoprodutos` são
  buckets públicos (a tela de login e os criativos de anúncio precisam
  carregar sem sessão) — um upload de SVG malicioso vira XSS armazenado
  servido do próprio domínio, então a allowlist de tipo (`lib/utils/upload.ts`)
  é sempre por `Content-Type` explícito, nunca por prefixo `image/*`.
- **Briefing de tarefa é sanitizado antes de salvar.** `RichTextEditor`
  grava HTML (`prod_tarefas.briefing`), renderizado depois com
  `dangerouslySetInnerHTML` — `sanitizarBriefingHtml()`
  (`lib/utils/sanitize.ts`) roda em toda escrita, porque quem grava esse
  campo pode ser um funcionário (não só admin) e quem lê pode ser um admin.
- **RLS + Server Actions, em camadas — sempre as duas.** RLS
  (`is_staff()`/`is_admin()`) barra por linha; toda Server Action roda
  `requireAdmin()`/`requireModulo()` antes de qualquer coisa, inclusive
  ações que usam a Service Role (que ignora RLS).
- **Uma única paleta de estado para tudo.** Badges/Meters de acesso,
  tráfego, aprovação de entrega e patrimônio usam o mesmo sistema de 4 tons
  (`lib/utils/tone.ts`: good/warning/critical/neutral) — cor nunca é a
  única portadora de significado.
- **Branding é uma linha SINGLETON, lida a cada request, nunca derruba o
  app.** `getBrandingConfig()` nunca lança — cai no `DEFAULT_BRANDING` se a
  tabela ainda não existir ou a query falhar. É a única tabela do sistema
  com `select` liberado pra `anon` (a tela de login precisa da identidade
  visual antes de qualquer sessão existir).
- **Cor dinâmica é injetada como CSS var no `<html>`, no servidor.** Sem
  flash de cor errada — `base`, `ink`, `status` e `danger` continuam FIXOS e
  validados por contraste; só `accent`/`accent2` são dinâmicos.

## Como rodar

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode os arquivos de `supabase/` **NESSA ORDEM** (cada
   um depende de tabelas/funções criadas pelo anterior):
   ```
   schema.sql
   cadastros.sql
   financeiro.sql
   producao.sql
   comercial.sql
   infoprodutos.sql
   whatsapp.sql
   patrimonio.sql
   dashboard.sql
   correcoes-auditoria.sql   -- por último, sempre — só ALTERA o que os outros criaram
   ```
   Todos são idempotentes — seguro rodar de novo se precisar reaplicar.
3. Vá em **Authentication → Providers** e confirme que "Email" está
   habilitado.
4. Vá em **Authentication → URL Configuration** e cadastre a URL do seu
   site (ex: `http://localhost:3000` em dev, seu domínio em produção) tanto
   em "Site URL" quanto em "Redirect URLs" (necessário pro link de convite).

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY` com os valores de **Project Settings → API** do
seu projeto Supabase. A Service Role Key é secreta — nunca faça commit dela.

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` — você cai em `/login`.

### 4. Criar o primeiro administrador

Ainda não existe nenhum usuário. No painel do Supabase:

1. **Authentication → Users → Add user** — crie seu usuário com e-mail e senha.
2. No **SQL Editor**, rode (trocando o e-mail):
   ```sql
   update public.profiles set role = 'admin' where email = 'voce@lumestrada.com';
   ```
3. Faça login em `/login` — você cai direto em `/admin`.

A partir daí, use **Cadastros → Equipe/Gerar Acesso** para convidar os
próximos usuários (recebem um e-mail para definir a própria senha) e
liberar os módulos de cada funcionário em `profiles.permissoes`.

### 5. Personalizar a identidade visual (opcional)

Acesse **Aparência** no menu do admin (`/admin/aparencia`) — logo, favicon,
cores, tema e tela de login, tudo aplicado pra todo mundo assim que você
clica em "Salvar Alterações", sem precisar de novo deploy.

### 6. WhatsApp (pendente)

O webhook (`/api/whatsapp/webhook`) já está de pé, mas o *provider* real
ainda não foi implementado (ver `AUDITORIA.md`) — hoje o módulo funciona só
com o "provider" de desenvolvimento. Pra ligar de verdade, escolha um
provedor (Twilio, Meta Cloud API, etc.), configure as credenciais e
implemente a classe correspondente em `src/lib/whatsapp/provider.ts`.

### 7. Produção

- Configure as mesmas variáveis de ambiente na Vercel (ou onde for hospedar).
- Atualize `NEXT_PUBLIC_SITE_URL` para o domínio real — é ele que monta o
  link de callback enviado no e-mail de convite.
- Reconfirme "Site URL" / "Redirect URLs" no Supabase apontando pro domínio
  de produção.
- Depois do deploy, confirme que `correcoes-auditoria.sql` já foi rodado no
  banco de produção — é ele que ajusta os limites de tamanho/tipo dos
  buckets de Storage usados pelos uploads diretos do navegador.
