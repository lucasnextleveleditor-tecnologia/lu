# Lume Strada Filmes — Gestão de Clientes, Acessos, Tráfego, Patrimônio e Marca

Sistema para a Lume Strada Filmes convidar clientes, controlar por quanto
tempo cada um tem acesso liberado, definir a Meta Diária de tráfego de cada
cliente e acompanhar — numa visão única [Cliente] → [Meta do Dia] → [Status
Atual] — se o investimento lançado está "No Caminho" ou "Abaixo da Meta", além
de controlar o inventário de bens da agência (equipamentos, informática,
imóveis...) por categoria e etiqueta, com filtros rápidos para auditoria, e
personalizar a identidade visual da própria plataforma (logo, cores, tela de
login) num painel de White-Label sem precisar mexer em código.
Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (Auth + Postgres + Storage).

## Estrutura de arquivos

```
src/
  middleware.ts                  # Protege rotas + valida expiração a cada requisição
  app/
    layout.tsx                   # Shell global (dark mode, fundo com grão de filme)
    page.tsx                     # "/" — só redireciona (middleware faz o trabalho real)
    login/page.tsx               # Tela de login
    definir-senha/page.tsx       # Passo pós-convite: cliente cria a própria senha
    acesso-expirado/page.tsx     # Tela mostrada quando active=false ou expires_at passou
    auth/callback/route.ts       # Troca o "code" do link de convite por uma sessão
    admin/
      layout.tsx                 # Reconfirma role=admin no servidor + monta a sidebar (AdminShell)
      page.tsx                   # Busca todos os perfis (RLS libera pra admin) e renderiza a tabela
      actions.ts                 # Server Actions: convidar, editar expiração, suspender/reativar
      trafego/
        page.tsx                 # Painel [Cliente] -> [Meta do Dia] -> [Status Atual], por dia
        actions.ts                # Server Actions: salvar meta, lançar/remover registro de tráfego
      inventario/
        layout.tsx                # Abas Categorias | Itens & Etiquetas
        page.tsx                   # Aba Categorias — lista + contagem de itens por categoria
        actions.ts                 # Server Actions: CRUD de categorias e de itens/etiquetas
        itens/page.tsx              # Aba Itens & Etiquetas — lista com join de categoria + filtros
      aparencia/
        page.tsx                   # Painel de White-Label — logos, cores, tela de login, tema, sidebar
        actions.ts                  # Server Actions: upload de asset (Storage), salvar cores/textos/tema
    dashboard/
      layout.tsx                 # Header simplificado do cliente (logo dinâmica)
      page.tsx                   # Status do próprio acesso + tráfego de hoje (somente leitura) + "conteúdo liberado"
  components/
    auth/                        # LoginForm, SetPasswordForm, LogoutButton (Client Components)
    branding/
      BrandingLogo.tsx            # Logo configurada (ou o losango padrão) — usada na sidebar, header e login
    admin/                       # UsersTable, UserRow, InviteClientModal
      AdminShell.tsx               # Sidebar do admin (expandida/recolhida) + wrapper do conteúdo — client component
      trafego/
        DateNav.tsx               # Navegação de dia (?data=yyyy-mm-dd), server-rendered
        MetaCard.tsx               # Card por cliente: meta editável + status + Meter + lançamentos do dia
      inventario/
        InventarioNav.tsx          # Abas Categorias | Itens & Etiquetas
        CategoriasManager.tsx       # Tabela de categorias + criar/editar/excluir
        CategoriaModal.tsx          # Formulário de categoria (nome, código, descrição)
        ItensManager.tsx            # Tabela de itens + filtros rápidos (busca, status, categoria) — 100% client-side
        ItemModal.tsx                # Formulário de item/etiqueta (todos os campos do requisito)
      aparencia/
        AparenciaForm.tsx            # Formulário completo + live preview (a peça central do módulo de branding)
        UploadField.tsx              # Campo de upload reutilizável (logo/favicon/fundo do login)
        LoginPreview.tsx             # Maquete em miniatura da tela de login, usada no live preview
    ui/                          # Button, Input, Select, Card, Badge, Meter, StatusBadge, icons — kit visual mínimo
  lib/
    supabase/
      client.ts                  # Cliente p/ Client Components (chave ANON)
      server.ts                  # Cliente p/ Server Components/Actions (chave ANON + cookies, respeita RLS)
      admin.ts                   # Cliente Service Role — server-only, só p/ auth.admin.inviteUserByEmail
    auth/requireAdmin.ts         # Guarda compartilhada por toda Server Action administrativa
    branding/
      constants.ts                # DEFAULT_BRANDING (fallback seguro), THEME_PRESETS, LOGIN_BG_PRESETS
      getBrandingConfig.ts         # Leitura cacheada (React `cache()`) da config — nunca lança, sempre retorna algo
    types/database.ts            # Tipos do banco (Profile, MetaDiaria, TrafegoRegistro, CategoriaInventario, ItemInventario, BrandingConfig) escritos à mão
    utils/
      status.ts                  # calcularStatus() — a ÚNICA fonte da verdade de Ativo/Inativo/Expirado
      trafego.ts                 # calcularResumoTrafego() — a ÚNICA fonte da verdade do status de tráfego
      inventario.ts               # STATUS_ITEM_META — tone de cada status de patrimônio
      tone.ts                    # Paleta de 4 tons (good/warning/critical/neutral) compartilhada por todo badge/meter
      color.ts                    # hexToRgbTriplet/contrastRatio/buildBrandingCssVars — motor do branding dinâmico
      format.ts                  # Helpers de data (yyyy-mm-dd) e formatação de moeda/percentual (pt-BR)
supabase/
  schema.sql                     # Schema completo, idempotente — cole no SQL Editor do Supabase
```

## Decisões de projeto (vale ler antes de customizar)

- **Status nunca é uma coluna gravada.** `active` (suspensão manual) e
  `expires_at` (prazo) são os dois únicos campos reais; "Ativo / Inativo /
  Expirado" é sempre *calculado* a partir deles em `lib/utils/status.ts`,
  tanto no middleware quanto no painel admin quanto no dashboard do
  cliente. Isso evita o bug clássico de status "preso" desatualizado.
- **Suspensão manual sempre vence a expiração.** Um admin pode suspender
  alguém mesmo com prazo válido; reativar não limpa a data de expiração.
- **Cadastro é só por convite.** Não existe tela de "criar conta" pública —
  todo cliente nasce de `auth.admin.inviteUserByEmail`, chamado a partir de
  uma Server Action que roda no servidor com a Service Role Key. Essa chave
  nunca é enviada ao navegador (o arquivo que a usa importa `server-only`,
  que quebra o build se algum Client Component tentar importá-lo).
- **Todo usuário nasce como `cliente`.** Promover alguém a `admin` é uma
  ação deliberada via SQL (ver `supabase/schema.sql`, seção 8) — o próprio
  painel não tem um botão "tornar admin" para evitar escalonamento
  acidental de privilégio.
- **RLS + Server Actions, em camadas.** As ações administrativas (editar
  expiração, suspender/reativar) usam o cliente autenticado normal — RLS
  (`profiles_update_admin`) já barra qualquer não-admin de alterar outro
  perfil. Além disso, cada Server Action roda `requireAdmin()` antes de
  fazer qualquer coisa, então mesmo a chamada que usa Service Role
  (convidar) é verificada manualmente primeiro.
- **Paleta "Dark Cinematográfico".** Fundo quase preto + tipografia branca
  suave + um único acento âmbar (luz de projeção/marquise). Sem identidade
  visual informada — troque os tokens em `tailwind.config.ts` pela paleta
  real da Lume Strada quando você tiver.
- **Dashboard do cliente é um ponto de partida.** O pedido foi "o cliente
  vê só o conteúdo liberado" — como este projeto é a camada de *gestão de
  acesso* (não o repositório de entregas), a página já vem com o cartão de
  status de acesso, o card de tráfego de hoje (somente leitura) e uma área
  "Conteúdo liberado" em estado vazio, pronta para você plugar os dados
  reais (vídeos, artes, aprovações).
- **Metas e Tráfego são integrados, sem silos.** Não existe uma tabela
  "clientes" separada — um cliente É um `profiles` com `role='cliente'`. A
  `metas_diarias` (uma por cliente/dia) é a única dona da meta do dia; todo
  `trafego_registros` está sempre amarrado a uma `metas_diarias` (nunca
  solto) — é isso que garante a visão única [Cliente] → [Meta do Dia] →
  [Status Atual] sem precisar cruzar tabelas soltas em cada tela. Ver
  `supabase/schema.sql`, seção 5.
- **Status de tráfego também nunca é gravado.** Igual ao status de acesso,
  "Sem Meta / Abaixo da Meta / No Caminho / Meta Batida" é sempre calculado
  em `lib/utils/trafego.ts` a partir da soma dos lançamentos do dia contra
  `valor_investido_meta` — os limiares (60% = No Caminho, 100% = Meta
  Batida) ficam num único lugar, fáceis de recalibrar.
- **Uma única paleta de estado para tudo.** Badges de acesso, de tráfego e
  de patrimônio usam o mesmo sistema de 4 tons (`lib/utils/tone.ts`: good/
  warning/critical/neutral) — cor nunca é a única portadora de significado
  (todo tone vem com ícone/rótulo), e o texto de estado nunca usa a cor
  crítica diretamente (ver `danger` em `tailwind.config.ts`) para manter
  contraste AA no fundo quase preto do app.
- **Inventário é de uso exclusivo do admin.** Diferente de Metas/Tráfego
  (que o cliente vê o próprio, somente leitura), `categorias_inventario` e
  `itens_inventario` não têm nenhuma policy de RLS pra `cliente` — é um
  controle interno da agência, não um dado do cliente. Toda etiqueta
  (`itens_inventario`) é obrigatoriamente vinculada a uma categoria (FK
  `on delete restrict`, ver `supabase/schema.sql` seção 6) — apagar uma
  categoria com itens vinculados falha com uma mensagem amigável em vez de
  apagar ou órfãar os itens.
- **Status de patrimônio "Baixado" usa o tone `critical` de propósito.**
  Numa auditoria visual, um bem marcado como baixado/descartado que ainda
  aparece fisicamente em uso é a discrepância que mais importa notar — por
  isso ele usa a cor mais chamativa da paleta, mesmo sendo um estado
  "esperado" do ciclo de vida do bem (ver `lib/utils/inventario.ts`).
- **Filtros do Inventário são client-side.** A tela de Itens & Etiquetas
  busca a lista inteira uma vez do servidor (já com a categoria resolvida
  via join) e filtra por busca/status/categoria inteiramente no navegador —
  sem round-trip a cada clique, pensado pra alternar filtros rapidamente
  numa auditoria visual.
- **Branding é uma linha SINGLETON, lida a cada request, nunca derruba o
  app.** `branding_config` tem sempre uma única linha (id fixo + trava
  `unique` numa coluna booleana — dois cinturões pro mesmo paraquedas, ver
  `supabase/schema.sql` seção 7). `getBrandingConfig()` nunca lança: se a
  tabela ainda não existir (schema não rodado) ou a query falhar, o app cai
  no `DEFAULT_BRANDING` (o mesmo visual de antes deste módulo existir) em
  vez de quebrar a aplicação inteira.
- **Cor dinâmica é injetada como CSS var no `<html>`, no servidor — sem
  flash de cor errada.** O layout raiz lê a config e escreve
  `--color-accent`/`--color-accent-strong`/`--color-accent-2`/`--primary`
  direto no `style` do `<html>`, já no primeiro HTML enviado (nenhum JS de
  cliente decide a cor). `tailwind.config.ts` só troca `accent`/`accent2`
  pra esse formato dinâmico — `base`, `ink`, `status` e `danger` continuam
  FIXOS e validados por contraste (skill de dataviz); branding troca a cor
  de destaque, nunca a paleta de leitura/estado já auditada.
- **RLS de `branding_config` e do bucket `branding` libera SELECT pra
  `anon`, de propósito.** A tela de login precisa mostrar logo/cores/título
  ANTES de qualquer sessão existir — é a única tabela do sistema com select
  público, porque nada nela é sensível (é literalmente a identidade visual
  pública da plataforma). Escrita continua só-admin nos dois casos.
- **Upload salva sozinho; texto/cor só salva no botão.** Cada campo de
  logo/favicon/fundo do login já grava a URL no banco assim que o upload
  termina (ver `UploadField`/`uploadBrandingAsset`) — não faria sentido
  exigir um segundo clique pra "confirmar" um arquivo que já foi enviado.
  Cores, textos do login, tema e o padrão da sidebar ficam em estado local
  até "Salvar Alterações", pra dar pro admin a chance de comparar no live
  preview antes de aplicar pra todo mundo.
- **Live preview reaproveita os componentes de verdade, não uma cópia.** O
  painel de Aparência escopa as variáveis CSS de branding num `<div
  style={...}>` ao redor só do preview — como `accent`/`accent2` do
  Tailwind seguem a cascata normal de CSS custom properties, o mesmo
  `<Button>` e as mesmas classes `bg-accent`/`border-accent` usadas no app
  inteiro já respondem à cor ainda não salva, sem duplicar nenhum CSS.
- **Sidebar do admin é uma exceção deliberada ao padrão "config só no
  servidor".** Se expandida/recolhida vive em `localStorage` (preferência
  por navegador, não por conta) — `sidebar_compacto_padrao` no banco é só o
  estado INICIAL de uma sessão nova; depois disso, cada admin controla a
  própria sidebar sem afetar os outros.

## Como rodar

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e rode.
3. Vá em **Authentication → Providers** e confirme que "Email" está
   habilitado (login por e-mail/senha).
4. Vá em **Authentication → URL Configuration** e cadastre a URL do seu
   site (ex: `http://localhost:3000` em dev, seu domínio em produção) tanto
   em "Site URL" quanto na lista de "Redirect URLs" (necessário para o link
   de convite funcionar).

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

A partir daí, use o botão **"+ Convidar Cliente"** no painel para cadastrar
os próximos usuários (eles recebem um e-mail para definir a própria senha).

### 5. Personalizar a identidade visual (opcional)

O `supabase/schema.sql` já cria o bucket de Storage `branding` (público de
leitura, só-admin de escrita) e a linha padrão de `branding_config` — não
precisa de nenhum passo manual extra no Supabase. Basta acessar
**Aparência** no menu do admin (`/admin/aparencia`) e enviar logo/favicon,
escolher as cores ou um tema rápido, e customizar a tela de login. Tudo é
aplicado pra todo mundo assim que você clica em "Salvar Alterações" — sem
precisar de novo deploy.

### 6. Produção

- Configure as mesmas variáveis de ambiente na Vercel (ou onde for hospedar).
- Atualize `NEXT_PUBLIC_SITE_URL` para o domínio real — é ele que monta o
  link de callback enviado no e-mail de convite.
- Reconfirme "Site URL" / "Redirect URLs" no Supabase apontando pro domínio
  de produção (o mesmo passo do item 1.4, mas com a URL final).
