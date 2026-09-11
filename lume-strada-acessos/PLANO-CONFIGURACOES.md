# `/admin/configuracoes` — o que já existe, o que falta, e como construir

Levantamento de 09/09/2026 cruzando **Floow Studio** (referência de UX, logado como "Estúdio de José"),
**o código no GitHub** (`seu-usuario/seu-repositorio` → `lume-strada-acessos`),
**o Supabase** (projeto `ifoggohkikwtnnhmhwoe`) e **o Vercel** (projeto `lu` → `lu-xi.vercel.app`, branch `main`).

> ⚠️ **A primeira conclusão muda o plano.** O `plano-multi-tenant-e-vendas.md` diz que "hoje o sistema é de uso único" e que a Fase 1 (base de tenant + RLS) ainda precisa ser feita. **Isso está desatualizado.** A migração multi-tenant já foi aplicada em produção em 19/08/2026 e está documentada em `MIGRACAO-MULTI-TENANT.md`. O que sobrou não é uma fase — é um resíduo, e ele está só num lugar.

---

## 1. Estado real do multi-tenant (verificado no banco, agora)

| Item | Situação |
|---|---|
| Tabela `companies` | ✅ existe, **3 empresas cadastradas** (`nome`, `status`, `expires_at`, `created_by`, `nome_app`, dados de orçamento/marca) |
| `company_id` nas tabelas de negócio | ✅ **44 tabelas** com a coluna, `default current_company_id()` |
| RLS por tenant | ✅ todas as 44 com política filtrando `company_id = current_company_id()` |
| Como a sessão sabe "qual empresa é essa" | ✅ **já resolvido** — `current_company_id()` lê `profiles.company_id` de `auth.uid()` |
| Papéis | ✅ `super_admin` (você, sem empresa) / `admin` / `funcionario` / `cliente` |
| Painel do dono do SaaS | ✅ `/super-admin` com criar/suspender/expirar/gerar acesso por empresa |
| Middleware | ✅ checa acesso pessoal **e** licença da empresa (`status`/`expires_at`) → `/acesso-expirado` |
| Anti-autopromoção | ✅ trigger `profiles_prevent_privilege_escalation` |
| **`branding_config`** | ❌ **único ponto ainda global** — ver abaixo |
| Buckets do Storage | ⚠️ isolados só por papel, não por `company_id` (assumido e documentado como fora de escopo) |

### A pergunta em aberto do plano já tem resposta
"Subdomínio por agência ou seletor de workspace pós-login?" — **nenhum dos dois é necessário.** A identidade do tenant já vem de `profiles.company_id`, um usuário pertence a uma empresa, e o roteamento do Next não precisa mudar. Subdomínio só voltaria a fazer sentido se um dia a mesma pessoa precisar pertencer a **duas** agências — aí sim entra seletor. Não é o caso hoje.

### O resíduo real: `branding_config` é global e está furado
```
branding_config_select_all   SELECT  {anon, authenticated}  USING (true)
branding_config_update_admin UPDATE  {authenticated}        USING (is_admin())
```
A tabela tem **um registro só** (id fixo `…0001`, coluna `singleton`). Com 3 empresas no banco, isso significa que **o admin da empresa B, ao trocar o logo, troca o logo da empresa A e da C também.** Não é risco teórico — é o comportamento atual.

O motivo está documentado: branding é lido **antes do login**, e ninguém resolveu de onde tirar a empresa nessa hora. Além disso, `primary_color`/`accent_color`/`theme_preset` foram desligadas de propósito no código (`salvarBranding` diz: "a paleta preto/branco é fixa; as colunas continuam no banco por compatibilidade"). Ou seja: **as colunas de cor já existem, só estão dormindo** — reativar por empresa é barato.

---

## 2. Como o Floow organiza as Configurações (o que dá pra aprender)

Engrenagem no rodapé da sidebar → tela única `Configurações` com barra de abas: **Time & Workspace · Minha conta · Assinatura · WhatsApp · Aparência · Suporte**.

**Padrões que valem adotar** (são convenções de produto, não invenção deles):
- Um card por assunto, com rótulo curto em caixa-alta no topo.
- Linha de ajuda em cinza sob cada campo, em linguagem humana ("é com este e-mail que você entra").
- **Salvar por campo**, não um botão único no fim da página.
- Escolha como cartão clicável (perfil de acesso, tema, moeda) em vez de `<select>`.
- Preview ao vivo na aba de aparência.
- Ação destrutiva isolada num bloco separado, no fim.
- Ponteiro cruzado entre abas ("procurando o nome do workspace? está em Time & Workspace").

**Problemas do Floow que não vamos repetir:**
1. A barra de abas **estoura a tela** — em 1440px a aba "Suporte" fica cortada, sem nenhuma pista visual de que existe mais coisa à direita.
2. **Aba não vai pra URL** — tudo em `/`; F5 volta pra primeira aba e não dá pra mandar link direto pra uma aba.
3. **Moeda dentro de "Aparência"** — moeda é regra de negócio (faturamento, proposta, portal), não estética.
4. Troca de senha **só** por link de e-mail, obrigando sair do app.

> **Sobre plágio:** o que se aproveita é a *arquitetura de informação* (quais assuntos moram juntos, em que ordem) e convenções de formulário que são de domínio comum. **Não** se copia texto de interface, nomes de preset ("Verde Neon", "Roxo Cyber", "Cinemático", "Cristal"), rótulos, microcópia, paleta, ícones ou markup. A tela nova nasce com a linguagem visual que o projeto já tem — Outfit, `rounded-2xl`, `border-base-700`, `bg-base-900/80`, paleta preto/branco — e com textos escritos do zero, passando pelos dicionários `pt`/`en`/`es` que o resto do sistema já usa.

---

## 3. Comparação: o que já temos × o que centralizar

| Assunto | Onde está hoje no lume-strada-acessos | Situação |
|---|---|---|
| Nome do app / da empresa | `companies.nome_app`, editado em `/admin/aparencia` via `atualizarNomeApp()` (Service Role + `.eq("id", companyId)`) | ✅ existe, **já por empresa** — só está no lugar errado |
| Equipe / membros | Aba "Equipe" dentro de `/admin` (`CadastrosWorkspace` → `EquipeManager`) + `equipe_membros` + `gerarAcessoFuncionario` | ✅ existe, **fragmentado** — fica escondido dentro de Cadastros |
| Permissões por módulo | `profiles.permissoes` (jsonb) + `requireModulo*` | ✅ existe e é melhor que o Floow (que só tem Membro/Gestor) |
| Organograma (departamentos/cargos) | `departamentos` + `cargos`, sub-aba de Equipe | ✅ existe, o Floow não tem |
| Logo, favicon, login, banner, sidebar | `/admin/aparencia` + `branding_config` | ✅ existe e é **mais rico** que o Floow |
| Cor de marca | colunas existem, **leitura desligada no código** | ⚠️ dormindo |
| Branding por empresa | — | ❌ **é o buraco** |
| Minha Conta (nome/e-mail/telefone) | — | ❌ não existe |
| Troca de senha voluntária | só a forçada: `profiles.senha_provisoria` → `/definir-senha` | ❌ não existe |
| Assinatura (visão da agência) | invertido: só o `/super-admin` vê `status`/`expires_at` | ❌ a agência não enxerga a própria licença |
| Link de checkout | — (nenhuma env var no Vercel; hoje só `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_*`) | ❌ criar `NEXT_PUBLIC_CHECKOUT_URL` |
| WhatsApp | `/admin/whatsapp` + `/admin/whatsapp/conexao`, sessão por empresa | ✅ existe — **fica fora das Configurações agora**, por ser módulo de trabalho (áudio → IA lança despesa), não configuração |
| Suporte | — | ❌ não existe |

**Resumo:** 60% do conteúdo das Configurações já foi construído — só está espalhado entre `/admin` (Equipe), `/admin/aparencia` (marca) e `/super-admin` (licença). O trabalho é **reunir**, não refazer.

---

## 4. A tela proposta

### Rota
`/admin/configuracoes/[aba]`, abas: `empresa` · `conta` · `aparencia` · `assinatura` (+ `suporte` depois).
`/admin/aparencia` vira `redirect()` permanente pra `/admin/configuracoes/aparencia` — nenhum link antigo quebra.

Ganho direto sobre o Floow: aba na URL (linkável, resistente a F5), resolvido com um segmento dinâmico simples no App Router.

### Entrada
Engrenagem fixa no rodapé da sidebar do `AdminShell`, substituindo o item "Aparência" da lista de módulos. Mantém `adminOnly: true` — funcionário não vê.

### Abas

**1 · Empresa & Equipe** — `requireAdminOuRedirect()`
- Card EMPRESA: logo (já sobe hoje) + nome do app (`companies.nome_app`) + contagem de membros ativos.
- Card MEMBROS: reaproveita `EquipeManager` inteiro, com as permissões por módulo que já existem — nossa versão é mais fina que "Membro/Gestor".
- Sub-aba Organograma continua junto, como já está.
- Bloco de saída de sessão no fim. *(Sem "excluir empresa": quem encerra licença é o super_admin, e é melhor que continue assim.)*

**2 · Minha Conta** — qualquer usuário logado *(novo)*
- Nome (`profiles.full_name`), e-mail (leitura + pedido de troca), telefone — salvar por campo.
- **Alterar senha inline** (atual + nova + confirmar) via `supabase.auth.updateUser`. É exatamente a lacuna do plano: hoje só existe a troca forçada no primeiro login. Link por e-mail fica como plano B, não como caminho único.

**3 · Aparência & Marca** — `requireAdminOuRedirect()` — *o coração do trabalho*
- Move `AparenciaForm` inteiro (logo, favicon, logo claro/escuro, título/subtítulo/posição/fundo do login, banner, sidebar) pra cá, sem reescrever.
- **Reativa a cor**: `primary_color` / `accent_color` / `theme_preset`, agora escopados por empresa, com paleta de presets **nossa** (nomes e valores escritos do zero) + campo hex livre + preview ao vivo.
- Moeda **não** entra aqui — se for implementada, vai pra Empresa, junto das metas de faturamento que já vivem em `companies`.

**4 · Assinatura** — só `admin`, versão enxuta conforme sua decisão
- Card de status **somente leitura**, alimentado pelo que o `/super-admin` já controla: `companies.status` (`ativo`/`suspenso`) e `companies.expires_at`. Zero coluna nova, zero campo pra você preencher duas vezes.
- **Um botão único** → abre `NEXT_PUBLIC_CHECKOUT_URL` (nova env var no Vercel) em aba nova.
- Frase curta dizendo que a liberação é manual após o pagamento, pra não gerar expectativa de ativação automática.
- Sem toggle mensal/anual, sem grade de planos, sem faturas, sem cancelamento — nada disso existe do lado de cá.

*(WhatsApp fora, por decisão sua. Suporte fica pra depois, é barato.)*

---

## 5. A migração de banco que falta (pequena, e é só uma)

`supabase/branding-por-empresa.sql`, no mesmo padrão idempotente dos outros arquivos:

1. `alter table branding_config add column company_id uuid references companies(id) on delete cascade;`
2. Backfill: a linha singleton atual vira a linha da **Creator Suite**; uma linha nova por empresa restante, com os defaults.
3. Índice único por empresa; aposentar a coluna `singleton` e o `BRANDING_CONFIG_ID` fixo em `lib/branding/constants.ts`.
4. RLS nova:
   - `UPDATE` → `is_admin() and company_id = current_company_id()` *(fecha o furo atual)*
   - `SELECT` autenticado → `company_id = current_company_id()`
   - `SELECT` anônimo → **só a linha da empresa dona do SaaS**, que é o branding da tela de login pública
5. Trigger que provisiona a linha de branding de toda empresa nova — mesmo padrão do trigger que já provisiona a sessão de WhatsApp (`seed_whatsapp_sessao_nova_empresa`).
6. `getBrandingConfig()` deixa de usar `.limit(1)` e passa a filtrar pela empresa; `salvarBranding` / `uploadBrandingAsset` / `removerBrandingAsset` trocam `.eq("id", BRANDING_CONFIG_ID)` por `.eq("company_id", companyId)` — `requireAdmin()` **já devolve** `companyId`, então é troca de uma linha em cada.
7. Caminho do upload no bucket passa a ser `${companyId}/${campo}/…`, o que de quebra fecha metade do item de Storage que ficou em aberto na migração original.

### A decisão que sobra (e é bem menor que a do plano)
Na **tela de login**, antes de autenticar, não dá pra saber qual empresa é. Três saídas:

- **(a) Login sempre com a marca do SaaS** — a marca da agência aparece só depois de entrar. Zero mudança de roteamento, uma linha de RLS. **É o que eu recomendaria começar.**
- **(b) Link de login com identificador** (`/login?e=slug`) que a agência distribui — permite marca no login sem mexer no roteamento, mas expõe um slug e precisa de tratamento de valor inválido.
- **(c) Subdomínio por agência** — é o mais bonito e o mais caro: middleware, DNS wildcard, domínio no Vercel, certificado. Dá pra fazer depois, sem refazer nada de (a).

---

## 6. Ordem sugerida

1. **Casca** — criar `/admin/configuracoes/[aba]`, mover `AparenciaForm` pra dentro, redirecionar `/admin/aparencia`, trocar o item da sidebar pela engrenagem. Não toca em dado nenhum, é seguro.
2. **Minha Conta** — tela nova e independente, sem dependência de banco além de `profiles`.
3. **Empresa & Equipe** — realocar `EquipeManager`, sem reescrever.
4. **`branding-por-empresa.sql` + reativar as cores** — o único passo com risco, feito por último e sozinho, com o furo de RLS já mapeado.
5. **Assinatura** — env var no Vercel + card de leitura. Meia hora.
6. *(depois)* Suporte, e Storage por `company_id`.

Fases 3 e 4 do plano original (onboarding self-service, sala de aprovação com timecode, senha em portal/orçamento/contrato, convite por e-mail, bot de WhatsApp com IA) seguem valendo, depois disso.

---

## 7. O que já foi feito (09/09/2026, madrugada)

Está tudo no branch **`configuracoes-centralizadas`**, num commit só, **ainda não publicado** (o GitHub Desktop vai mostrar "Publish branch" — o Linux que rodou isto não tem as credenciais do GitHub, que ficam no chaveiro do macOS).

Feito e verificado com `tsc --noEmit` e `next build` limpos:

- `/admin/configuracoes?aba=` com quatro abas — Empresa & Equipe, Minha Conta, Aparência, Assinatura.
- Engrenagem fixa no rodapé da sidebar; o item "Aparência" saiu da lista de módulos.
- `/admin/aparencia` virou redirect; Cadastros perdeu a aba Equipe e ganhou um ponteiro pro novo lugar.
- Minha Conta: nome, e-mail, telefone e **troca voluntária de senha** (confere a senha atual no servidor).
- Assinatura: card somente leitura sobre `companies.status`/`expires_at` + um botão pro checkout externo.
- Cor de marca por empresa, aplicada por CSS var no painel e no portal do cliente (nunca no login).
- Textos nos três idiomas (pt/en/es).
- `.gitignore` — o repositório não tinha nenhum.

### Falta você fazer (3 coisas, nesta ordem)

1. **Rodar `supabase/branding-por-empresa.sql`** no SQL Editor do Supabase. Não consegui aplicar daqui — a alteração de schema em produção foi barrada por uma trava de segurança do ambiente, e é o tipo de coisa que faz sentido você aprovar com os olhos abertos. **O código do branch depende dela**: sem a coluna `company_id`, salvar em Aparência dá erro.
2. **Publicar o branch e conferir o preview do Vercel** antes de mesclar em `main`. Confira: engrenagem abre; as quatro abas trocam pela URL; salvar cor muda a sidebar; salvar logo continua funcionando; Cadastros mostra só Clientes.
3. **Criar `NEXT_PUBLIC_CHECKOUT_URL`** no Vercel (Production + Preview) com o link do carrinho. Sem ela, a aba Assinatura mostra "link ainda não configurado" em vez do botão — de propósito, é melhor do que um botão morto.

### Enquanto o SQL não roda
A produção continua exatamente como está (o branch não foi mesclado). O furo do branding compartilhado — admin de uma empresa trocando o logo das outras — **continua aberto até o passo 1**.

### Sujeira que ficou na sua máquina
Não tenho permissão de apagar arquivos aí, só de mover. Ficaram, todos descartáveis:
- `lume-strada-acessos/_to_delete/` — restos do sistema de arquivos + o `.tar.gz` que usei pra rodar o build fora da sua máquina.
- `lume-strada-acessos/node_modules/` (423 MB) — de uma instalação que travou na metade, na lentidão do disco compartilhado. Já está no `.gitignore`. Se for rodar local, apague e refaça com `npm ci`.
- Alguns `.git/*.lock.stale.*` — inofensivos, o git ignora.
