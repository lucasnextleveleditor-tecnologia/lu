# Migração para Multi-Tenant (SaaS) — plano e decisões

Este documento explica **por que** o sistema foi refatorado para multi-tenant e **quais decisões de arquitetura** foram tomadas no caminho. Leia isto antes de rodar `supabase/multitenant-migration.sql`.

## 1. O que muda, em uma frase

O sistema deixa de ser "a ferramenta interna da Lume Strada Filmes" e passa a ser "um SaaS que a Lume Strada vende para outras agências/empresas". Cada empresa compradora (`companies`) tem os próprios dados — clientes, tarefas, financeiro, tráfego, inventário, WhatsApp — completamente isolados dos de qualquer outra empresa, **inclusive da própria Lume Strada**, que a partir de agora é só mais uma linha na tabela `companies`.

## 2. Os três papéis

| Papel | Valor gravado no banco (`profiles.role`) | `company_id` | O que vê |
|---|---|---|---|
| Dono do SaaS (você) | `super_admin` | sempre `null` | Painel mestre em `/super-admin` — só as empresas licenciadas, nunca os dados operacionais delas |
| Dono da empresa compradora | `admin` | o `id` da empresa dele | Painel completo (`/admin`), só os dados da própria empresa |
| Funcionário da empresa compradora | `funcionario` | o `id` da empresa dele | Igual ao admin, mas restrito pelas permissões por módulo que o admin daquela empresa configurar |
| Cliente de uma empresa compradora | `cliente` | o `id` da empresa dele | Portal do cliente (`/dashboard`), só os próprios dados |

### Por que os valores continuam `admin`/`funcionario`/`cliente`, e não `COMPANY_ADMIN`/`COMPANY_USER`

O pedido original usava os nomes `SUPER_ADMIN`/`COMPANY_ADMIN`/`COMPANY_USER`. Decidi **não** renomear os três valores que já existem no banco — isso exigiria trocar todo `role === "admin"` e `role === "funcionario"` espalhado pelo código (dezenas de arquivos: Server Actions, middleware, componentes, RLS) por um nome novo, um trabalho arriscado e sem ganho real, já que o significado é idêntico. Em vez disso, **só adicionei um quarto valor**, `super_admin`, por cima do que já existia. O mapeamento é:

- `'admin'` no banco = `COMPANY_ADMIN` do pedido (dono da empresa compradora)
- `'funcionario'` no banco = `COMPANY_USER` do pedido (funcionário dela)
- `'cliente'` no banco = cliente daquela empresa (não mudou)
- `'super_admin'` (novo) = `SUPER_ADMIN` do pedido (você, dono do SaaS)

Essa decisão está documentada em `src/lib/types/database.ts`, em cima da definição de `PapelUsuario`.

## 3. Isolamento de dados — como funciona de ponta a ponta

### 3.1. A tabela `companies`

Uma linha por empresa compradora: `nome`, `status` (`ativo`/`suspenso`), `expires_at` (data de expiração da licença, opcional), `created_by` (qual super_admin cadastrou).

### 3.2. `company_id` em toda tabela operacional

Todas as 27 tabelas operacionais existentes (clientes, funcionários, tarefas, financeiro, CRM, tráfego, inventário, WhatsApp) ganharam uma coluna `company_id` obrigatória, com `default public.current_company_id()` — uma função que lê a empresa do usuário autenticado direto do token de sessão. Isso cumpre o pedido de "o front-end não precisa passar `company_id` manualmente": ao inserir uma linha nova, se o código não informar `company_id` explicitamente, o Postgres preenche sozinho com a empresa de quem está logado.

Tabelas "filhas" que não têm uma coluna óbvia de dono direto (subtarefas, entregas e versões de entrega, anotações de lead, registros de tráfego, mensagens de WhatsApp) também ganharam `company_id` próprio — em vez de descobrir a empresa navegando por 2-3 tabelas relacionadas a cada checagem de permissão, cada linha já sabe a própria empresa. Mais simples e mais rápido.

### 3.3. Row Level Security (RLS) — a regra de ouro

Toda política de acesso em toda tabela operacional agora exige `company_id = current_company_id()`, além da checagem de papel que já existia (`is_staff()`/`is_admin()`). Na prática: um `SELECT`, `INSERT`, `UPDATE` ou `DELETE` só enxerga/afeta linhas da própria empresa — é o banco que garante isso, não o código do front-end. Mesmo que uma tela tivesse um bug e tentasse buscar dados de outra empresa, o Postgres devolveria zero linhas.

`current_company_id()` e `is_super_admin()` são funções `security definer` (mesmo padrão já usado por `is_admin()`/`is_staff()` neste projeto) que leem a sessão autenticada sem entrar em recursão com as próprias políticas de RLS.

### 3.4. O que isso NÃO cobre nesta etapa (escopo deixado de fora, de propósito)

Duas coisas ficaram fora desta rodada — documentadas também dentro de `supabase/multitenant-migration.sql` (Seção 10):

1. **Buckets do Storage** (`producao`, `branding`, `infoprodutos`): continuam controlados só por papel (admin/funcionário/cliente autenticado), **não** por caminho `company_id`-específico. Isolar de verdade exigiria mudar como os caminhos de upload são gerados no código (ex: `criarUploadAssinadoVersao`), o que não foi feito agora. Enquanto isso não for feito, evite reutilizar nomes de arquivo previsíveis entre empresas diferentes.
2. **`branding_config`**: continua sendo um único registro global (não por empresa), porque é lido *antes* da autenticação, na tela de login — dar branding próprio por empresa é uma pergunta de produto maior (precisa de subdomínio, domínio customizado ou seleção de empresa no login) que não foi resolvida aqui.

## 4. Prevenção de auto-promoção

Uma política de RLS que permite "editar seu próprio perfil se os dados continuarem válidos" não impede, sozinha, que alguém mude só o `role` ou o `company_id` numa única chamada de `UPDATE` — a política valida o resultado final, não *quais colunas* mudaram. Para fechar essa brecha, foi adicionado um gatilho (`profiles_prevent_privilege_escalation`) que bloqueia qualquer alteração em `role`/`company_id` feita por quem não é `super_admin` (com uma exceção para chamadas feitas pela Service Role do Supabase, que é como o próprio sistema promove um convidado a admin/funcionário em segundo plano — essa camada de autorização já é validada no código antes de chegar no banco).

## 5. Fluxo de autenticação e front-end

### 5.1. Middleware (`src/middleware.ts`)

A cada requisição, o middleware agora resolve **dois** status de acesso, e os dois precisam estar "ativo":

- **Pessoal** — igual a antes: `profiles.active`/`expires_at` (suspensão/expiração individual).
- **Da empresa** — novo: `companies.status`/`companies.expires_at`. Se a empresa foi suspensa ou a licença expirou, **todo mundo dela** cai em `/acesso-expirado` na próxima requisição, mesmo com o perfil individual "ativo".

Isso é resolvido numa única consulta relacional (`profiles` já traz `companies(status, expires_at)` junto via a chave estrangeira), sem round-trip extra ao banco.

Depois de validado o acesso, o redirecionamento por papel foi expandido: `super_admin` cai em `/super-admin`; `admin`/`funcionario` continuam caindo em `/admin`; `cliente` continua caindo em `/dashboard`. Cada árvore de rotas (`/super-admin/*`, `/admin/*`) é exclusiva de quem tem o papel certo — uma tentativa de acessar a área errada redireciona para a própria home, nunca para a do outro.

### 5.2. Painel do Super Admin (`/super-admin`)

Estrutura inicial entregue:

- `src/app/super-admin/layout.tsx` — segunda camada de proteção (a primeira é o middleware), shell simples e próprio, sem reaproveitar o `AdminShell` do painel operacional (não faz sentido reusar sidebar de módulos/branding pra uma tela que só o dono do SaaS vê).
- `src/app/super-admin/page.tsx` — lista todas as empresas cadastradas.
- `src/components/super-admin/CompaniesManager.tsx` — busca, resumo (total/ativas/suspensas), tabela com ações por empresa: gerar acesso, suspender/reativar, editar, excluir.
- `src/components/super-admin/EmpresaModal.tsx` — criar/editar empresa (nome + data de expiração da licença).
- `src/components/super-admin/GerarAcessoCompanyAdminModal.tsx` — convida o dono daquela empresa por e-mail. **Sem** campo de expiração individual nesse modal, de propósito: a licença já expira no nível da empresa; um segundo relógio de expiração pro dono só confundiria qual data vale.
- `src/app/super-admin/actions.ts` — Server Actions: `criarEmpresa`, `atualizarEmpresa`, `alternarStatusEmpresa`, `removerEmpresa`, `gerarAcessoCompanyAdmin`.
- `src/lib/auth/requireAdmin.ts` — ganhou `requireSuperAdmin()`/`requireSuperAdminOuRedirect()`, no mesmo padrão de `requireAdmin()`/`requireAdminOuRedirect()` já usado no resto do sistema.

`requireAdmin()` (usado pelas Server Actions do painel operacional) passou a expor também `companyId` — necessário para que os convites de cliente/funcionário (`gerarAcessoCliente`/`gerarAcessoFuncionario`, em `src/app/admin/actions.ts`) gravem o convidado na **mesma** empresa de quem está convidando.

### 5.3. i18n

O painel `/super-admin` foi entregue com textos em português direto no componente, sem passar pelos dicionários `pt`/`en`/`es` usados no resto do sistema. Decisão deliberada: esse painel é visto por uma pessoa só (você), então tradução não traz benefício nesta etapa — pode ser adicionada depois se um dia fizer sentido ter outro super_admin em outro idioma.

## 6. Como a migração dos dados existentes funciona

Rodar `supabase/multitenant-migration.sql` (depois de trocar o e-mail placeholder no "PASSO 0" pelo seu e-mail de login real):

1. Cria a tabela `companies`.
2. Cria automaticamente uma empresa **"Lume Strada Filmes"** e migra todos os perfis/dados existentes para ela — exceto o seu, que vira `super_admin` sem empresa. Nada se perde; a agência continua funcionando exatamente como hoje, só que agora como "empresa nº 1" dentro do próprio SaaS.
3. Adiciona `company_id` a todas as 27 tabelas operacionais, faz o backfill para a empresa "Lume Strada Filmes" e só então marca a coluna como obrigatória (`not null`) — a ordem importa: marcar como obrigatória antes do backfill quebraria a migração no meio.
4. Reescreve todas as políticas de RLS existentes para incluir `company_id = current_company_id()`.
5. Corrige 3 views (`fin_contas_saldo`, `fin_cartoes_limite`, `prod_entregas_atual`) que estavam marcadas como "Security Definer View" pelo auditor de segurança do Supabase — sem essa correção, elas vazariam dados de todas as empresas, ignorando RLS por completo.
6. Endurece a função `pagar_fatura()` (que roda com privilégio elevado) para confirmar que o cartão e a conta de pagamento pertencem à empresa de quem está chamando, antes de mexer em qualquer coisa.
7. Converte `whatsapp_sessoes` de "uma sessão fixa pro sistema inteiro" para "uma sessão por empresa", com um gatilho que já provisiona a sessão de WhatsApp de toda empresa nova automaticamente.
8. Reajusta uniqueness que antes era global (documento de cliente, código de etiqueta de inventário, categoria financeira, telefone de contato do WhatsApp) para ser único **por empresa** — sem isso, duas empresas diferentes não conseguiriam cadastrar, por exemplo, clientes com o mesmo CNPJ, mesmo sendo empresas sem nenhuma relação entre si.

O arquivo é idempotente (seguro rodar mais de uma vez) e roda como uma transação só — se qualquer passo falhar no meio, o Postgres desfaz tudo.

## 7. Status: JÁ APLICADA em produção

Esta migração **já foi aplicada** no banco de produção (projeto `ifoggohkikwtnnhmhwoe`), a seu pedido explícito, em 19/08/2026. O "PASSO 0" foi resolvido usando `lucasmelo748@icloud.com` — o único perfil com `role = 'admin'` encontrado no banco antes da migração — que agora é `super_admin`.

Verificado após a aplicação:
- `lucasmelo748@icloud.com` está com `role = 'super_admin'` e `company_id = null`.
- Existe 1 empresa, "Lume Strada Filmes", e todo o resto dos perfis/dados existentes foi migrado para ela (0 perfis órfãos sem empresa).
- RLS está ativo (`rowsecurity = true`) em `companies` e em todas as tabelas operacionais verificadas.
- `get_advisors` (segurança) não mostrou nenhum problema novo além do padrão já existente antes da migração (as mesmas funções `SECURITY DEFINER` expostas via RPC que `is_admin()`/`is_staff()` já tinham — comportamento esperado, não uma regressão).

Durante a aplicação, três bugs reais foram encontrados e corrigidos (todos já aplicados em produção e já refletidos em `supabase/multitenant-migration.sql`):

1. **Views com coluna fora de ordem.** As 3 views recriadas na Seção 7 originalmente colocavam `company_id` logo depois da coluna de id (ex: `c.id as conta_id, c.company_id, c.nome, ...`) — o Postgres rejeita isso com `cannot change name of view column`, porque `CREATE OR REPLACE VIEW` só permite ACRESCENTAR coluna no final, nunca mudar nome/posição de uma coluna existente. Corrigido movendo `company_id` para o final da lista de colunas nas 3 views (`fin_contas_saldo`, `fin_cartoes_limite`, `prod_entregas_atual`).

2. **Embed ambíguo no middleware.** Depois da migração, `src/middleware.ts` passou a devolver "Acesso Expirado" pra todo mundo, mesmo com os dados certos no banco. Causa: agora existem DUAS foreign keys entre `profiles` e `companies` (`profiles.company_id -> companies.id` e `companies.created_by -> profiles.id`) — o select relacional `companies(status, expires_at)` dentro da consulta de `profiles` ficou ambíguo, e o Supabase respondia HTTP 300 (Multiple Choices) em vez dos dados. Corrigido trocando pra `companies!company_id(status, expires_at)`, que diz explicitamente qual das duas relações seguir.

3. **Índice único "roubado" por um índice comum de mesmo nome.** Criar uma empresa nova (`criarEmpresa`) começou a falhar com `there is no unique or exclusion constraint matching the ON CONFLICT specification`. Causa: o arquivo criava um índice chamado `whatsapp_sessoes_company_idx` DUAS vezes — uma vez comum, na lista de índices da Seção 4 (repetida pra todas as tabelas), e de novo como ÚNICO na Seção 5 (pra virar o "singleton por empresa" que o trigger `seed_whatsapp_sessao_nova_empresa()` depende via `ON CONFLICT (company_id)`). Como `CREATE UNIQUE INDEX IF NOT EXISTS` só checa se já existe um índice com aquele NOME — não se ele é único — a segunda criação foi ignorada silenciosamente, e o índice ficou só como comum. Corrigido removendo a criação duplicada da Seção 4 e renomeando o índice único da Seção 5 para `whatsapp_sessoes_company_unique_idx`.

Nenhuma ação adicional é necessária no Supabase para esta etapa — só rodar as próximas migrações que forem criadas depois desta.

## 8. "Gerar acesso" agora gera um link copiável — não depende mais do e-mail automático do Supabase

Durante os testes do fluxo "Gerar acesso" em produção apareceram, em sequência: link caindo em `localhost` (env var da Vercel), token de convite queimado (Redirect URLs vazio no Supabase) e `email rate limit exceeded` (limite baixíssimo do serviço de e-mail EMBUTIDO do Supabase, documentado como "só pra teste"). Os dois primeiros já foram corrigidos (ver histórico da conversa); o terceiro é uma limitação do plano gratuito que só se resolve configurando SMTP próprio (Resend/Postmark/SendGrid/SES) — adiado a pedido, por enquanto ainda em fase de teste.

Pra não depender desse limite enquanto o SMTP próprio não é configurado, toda ação de "Gerar acesso" (`gerarAcessoCliente`, `gerarAcessoFuncionario` em `app/admin/actions.ts`; `gerarAcessoCompanyAdmin` em `app/super-admin/actions.ts`; `converterLeadEmCliente` em `app/admin/comercial/actions.ts`) trocou `auth.admin.inviteUserByEmail` por `auth.admin.generateLink({ type: "invite" })` (função compartilhada `gerarLinkConvite`, em `src/lib/supabase/admin.ts`):

- `inviteUserByEmail` fazia duas coisas numa chamada só — criar o usuário E mandar o e-mail pelo serviço embutido (rate limit baixo, depende de "Redirect URLs" certo). Qualquer uma das duas quebrando derrubava o convite inteiro, e o token é de uso único — não dava nem pra tentar de novo sem apagar a conta.
- `generateLink` faz só a metade que precisa da Service Role (criar o usuário) e devolve os dados pra quem chamou montar o próprio link — sem nenhum envio de e-mail, então nunca esbarra em rate limit. Cada modal de "Gerar acesso" agora mostra esse link com um botão **Copiar link** e um atalho **Abrir no WhatsApp** (componente `LinkAcessoGerado`, em `src/components/ui/LinkAcessoGerado.tsx`) — copie e mande pra quem for (WhatsApp, e-mail manual, etc.).

De quebra, corrigido um bug real encontrado ao mexer nesse código: `converterLeadEmCliente` (conversão de Lead em Cliente, no módulo Comercial) não passava `company_id` nos metadados do convite — depois da migração multi-tenant, isso batia na constraint `profiles_company_id_invariante` (todo perfil que não é `super_admin` precisa ter empresa) e o trigger `handle_new_user` recusava criar o perfil, fazendo QUALQUER conversão de lead falhar silenciosamente com "Convite não retornou um usuário". Corrigido junto com a troca pra `gerarLinkConvite`.

### 8.1. Bug MAIOR encontrado logo depois, testando o link novo: nenhum convite (nem o antigo por e-mail) conseguia terminar em "definir senha"

Testando o link copiável pela primeira vez (empresa "Lucas Filmmaker", e-mail `contatostradafilmes@gmail.com`), o clique caiu direto de volta em `/login` — sem nenhum aviso, sem a tela de "definir senha". Investigando pelos logs do Supabase (`auth_logs`): o clique no link CHEGOU a verificar com sucesso no lado do Supabase (`email_confirmed_at` foi gravado), mas a rota `src/app/auth/callback/route.ts` nunca recebeu o que precisava pra criar a sessão — e olhando os `edge_logs`, a chamada `/auth/v1/token` (que trocaria o código pela sessão) **nunca aconteceu**.

Causa raiz: `app/auth/callback/route.ts` só sabia ler `?code=...` (fluxo PKCE, via `exchangeCodeForSession`) — mas o link que `generateLink`/`inviteUserByEmail` geram NUNCA usa PKCE (é um convite criado do lado do servidor, com a Service Role; não existe "o mesmo navegador que iniciou o fluxo" pra guardar o `code_verifier` que o PKCE exige). Confirmado na própria documentação do Supabase (seção "Redirecting the user to a server-side endpoint" do guia de Email Templates): o link padrão devolve a sessão nos **fragmentos da URL** (`#access_token=...&refresh_token=...`), e fragmento (depois do `#`) **nunca chega no servidor** — só em JavaScript rodando no navegador. Resultado prático: `code` sempre vinha `null` na nossa rota, ela caía direto no fallback `/login?erro=convite_invalido` — e como `LoginForm` nunca lia esse `erro` (outro gap encontrado junto), a pessoa só via a tela de login comum, sem NENHUMA pista do que tinha acontecido. Isso significa que **nenhum convite completou esse fluxo até hoje** nesta migração — o e-mail automático antigo tinha esse mesmo defeito, só que nunca foi percebido porque os bugs anteriores (localhost, Redirect URLs, rate limit) sempre quebravam antes de chegar nessa etapa.

Corrigido em duas partes:

1. **`gerarLinkConvite` (`src/lib/supabase/admin.ts`)** não usa mais o `action_link` pronto do Supabase (que passa pelo `/auth/v1/verify` deles). Em vez disso monta um link direto pra `/auth/callback` com `token_hash` + `type` (campos que já vêm na resposta do `generateLink`) — o padrão que a própria documentação do Supabase recomenda pra SSR.
2. **`app/auth/callback/route.ts`** ganhou um novo ramo que lê `token_hash`/`type` e chama `supabase.auth.verifyOtp({ token_hash, type })` — que devolve a sessão no CORPO da resposta (não em fragmento), então o servidor consegue gravar nos cookies numa boa. O ramo antigo (`?code=`/`exchangeCodeForSession`) continua ali como fallback.

Bônus: como esse novo caminho nunca passa pelo `/auth/v1/verify` do Supabase, ele também não depende mais da lista "Redirect URLs" configurada no dashboard (aquela do bug anterior) — uma dependência a menos.

Também corrigido, de quebra: `LoginForm` (`src/components/auth/LoginForm.tsx`) agora lê `?erro=convite_invalido` e mostra uma mensagem de verdade ("Esse link de convite já foi usado ou expirou...") em vez de deixar a pessoa numa tela de login muda sem explicação nenhuma.

A conta de teste `contatostradafilmes@gmail.com` (que ficou "presa" de novo — confirmada, mas sem senha, com o link já queimado) foi apagada direto no banco (mesmo procedimento de antes: `delete from auth.users`, com cascade pro `profiles`) pra permitir reteste limpo. A empresa "Lucas Filmmaker" foi conferida e continua intacta.

## 9. Guinada final: convite por link/token abandonado — "Gerar acesso" agora cria login com senha provisória "123"

Mesmo depois do fix da Seção 8.1 (token_hash + verifyOtp, tecnicamente correto e testado por logs), o teste em produção mostrou o MESMO sintoma pro usuário final: clica no link, cai no login comum, sem nenhuma opção visível de criar senha. A decisão, a pedido explícito, foi abandonar por completo o paradigma de link/token de convite — mesmo estando corrigido — em favor de algo mais simples e à prova de falha: toda conta nova já nasce com uma senha provisória conhecida, a pessoa loga direto com e-mail + essa senha, e só depois de logada é que o painel obriga a trocar pra uma senha definitiva. Sem link, sem token, sem e-mail automático, sem depender de fragmento de URL, Redirect URLs ou rate limit do Supabase.

### O que mudou

- **`gerarLinkConvite` foi removida** de `src/lib/supabase/admin.ts`. No lugar, `criarAcessoComSenhaPadrao(admin, email, { data })` chama `auth.admin.createUser({ email, password: "123", email_confirm: true, user_metadata: data })` — cria a conta já confirmada e com senha conhecida, numa tacada só, sem gerar link nenhum. A senha padrão fica numa constante exportada, `SENHA_PADRAO_ACESSO`.
- **Nova coluna `profiles.senha_provisoria`** (boolean, default `false` — migração `supabase/senha-provisoria.sql`, já aplicada em produção). `criarAcessoComSenhaPadrao` grava `true` nela assim que cria a conta. Vira `false` assim que a pessoa define a própria senha.
- **`src/middleware.ts`** agora lê `senha_provisoria` no mesmo select que já fazia (`role, active, expires_at, company_id, ...`) e, se vier `true`, redireciona pra `/definir-senha` ANTES de qualquer roteamento por papel — vale pra super_admin, admin, funcionário e cliente igualmente. Ninguém com senha provisória acessa qualquer outra tela do sistema.
- **`/definir-senha`** (tela e componente já existiam da migração anterior, `SetPasswordForm`) ganhou uma Server Action nova, `concluirTrocaDeSenha` (`src/app/definir-senha/actions.ts`): depois que `supabase.auth.updateUser({ password })` troca a senha de fato, essa action zera `senha_provisoria` — usando o client de Service Role, mas restringindo a atualização estritamente ao `id` do usuário autenticado (via `getUser()` no servidor, nunca um id vindo do cliente). Isso evita ter que abrir uma policy de RLS de "usuário edita o próprio perfil", que abriria brecha pra alguém forjar um PATCH e mudar o próprio `role`/`company_id`/`active`/`expires_at`.
- **As quatro Server Actions que geram acesso** (`gerarAcessoCliente`, `gerarAcessoFuncionario` em `app/admin/actions.ts`; `gerarAcessoCompanyAdmin` em `app/super-admin/actions.ts`; `converterLeadEmCliente` em `app/admin/comercial/actions.ts`) trocaram a chamada pra `criarAcessoComSenhaPadrao` e agora devolvem `{ email, senhaPadrao }` em vez de `{ link }`.
- **`LinkAcessoGerado` foi substituído por `CredenciaisAcessoGerado`** (`src/components/ui/CredenciaisAcessoGerado.tsx`): mostra e-mail + senha provisória em dois campos, com botão **Copiar dados de acesso** e atalho **Abrir no WhatsApp** — a mensagem já vem pronta com link do login, e-mail e senha. Usado nos quatro modais que geram acesso (`GerarAcessoCompanyAdminModal`, `GerarAcessoClienteModal`, `AcessoFuncionarioModal`, `LeadDetalheModal`).
- **`AcessoStatusControls`** (bloco de status reaproveitado no detalhe do Cliente e no modal de acesso do Funcionário) ganhou um selo "Ainda com a senha provisória" quando `profile.senha_provisoria` é `true` — só informativo, pra o admin saber que aquela pessoa ainda não trocou a senha.
- **`/auth/callback/route.ts`** foi mantido no código (ainda sabe processar `token_hash`/`type` via `verifyOtp`, e `code` via `exchangeCodeForSession`), mas hoje está DORMENTE — nenhum caminho do app gera link nenhum. Fica pronto caso um dia entre alguma feature que precise (recuperação de senha por e-mail, magic link).
- **Textos de login corrigidos** (`src/lib/i18n/dictionaries/{pt,en,es}/login.ts`, chave `convitePrompt`): antes diziam pra abrir um link de e-mail — o texto errado provavelmente era a própria causa da confusão do usuário de teste, que via a tela de login comum e não sabia que devia logar direto com e-mail + "123". Agora avisa: "Primeiro acesso? Entre com o e-mail cadastrado e a senha provisória que você recebeu."

### Por que essa troca resolve de vez

O bug da Seção 8.1 (fragmento de URL não chega no servidor) só existe porque havia um link envolvido. Tirando o link da equação, a categoria inteira de bug desaparece — não tem `/auth/v1/verify`, não tem token de uso único que pode "queimar" antes da pessoa clicar, não tem dependência de Redirect URLs configurado certo no dashboard do Supabase, e não tem e-mail automático nenhum (então o rate limit do serviço de e-mail embutido do Supabase, mencionado na Seção 8, deixa de ser relevante pra esse fluxo). O admin sempre teve que copiar e mandar a credencial manualmente mesmo (por WhatsApp, na prática) — agora ele manda e-mail + senha em vez de um link, e a pessoa loga do jeito mais simples que existe: e-mail e senha, sem clique intermediário nenhum.

### Consideração descartada por enquanto

Cogitei adicionar uma ação de admin pra "resetar" uma conta já existente de volta pra senha padrão (útil se alguém esquecer a senha depois de já ter trocado) — não implementei porque não foi pedido; fica registrado aqui como próximo passo natural se aparecer essa necessidade.

## 10. Backup automático 4x/dia pro Google Drive (06h, 12h, 18h e 00h — horário de Brasília)

Pra garantir que nenhum cliente perca dados enquanto estiver com a licença ativa, todo dado de negócio do sistema (de TODAS as empresas licenciadas) é copiado automaticamente 4 vezes por dia pra uma pasta privada do Google Drive do dono do SaaS — os clientes nunca têm acesso a esse link.

### Como funciona

- **`public.backup_snapshot_json()`** (função SQL, migração `backup_snapshot_function` aplicada direto no projeto Supabase) percorre dinamicamente toda tabela do schema `public` (`information_schema.tables`) e devolve um único JSON com o conteúdo inteiro de cada uma — clientes, financeiro, produção, comercial, tráfego, inventário, WhatsApp, perfis e empresas, de todas as empresas de uma vez. Por ser dinâmica (não tem lista de tabela fixa no código), qualquer tabela nova criada no futuro entra automaticamente no backup seguinte, sem precisar tocar nessa função de novo.
- **Nunca inclui login/senha** — a função só lê o schema `public`; `auth.users`/`auth.identities` (onde ficam e-mail confirmado, hash de senha etc.) ficam de fora de propósito. Um backup vazado exporia dados de clientes (nome, financeiro, tarefas...), nunca credenciais de acesso.
- **Só quem acessa o Postgres diretamente com privilégio elevado consegue chamar essa função.** Toda função do schema `public` no Supabase vira automaticamente um endpoint REST (`/rest/v1/rpc/backup_snapshot_json`), e por padrão o Postgres libera `EXECUTE` pra `PUBLIC` — sem cuidado, isso deixaria QUALQUER cliente logado (de qualquer empresa) baixar o banco inteiro de todo mundo pela API. Por isso a migração já aplica `revoke execute ... from public/anon/authenticated` logo depois de criar a função — confirmado via `has_function_privilege`, `anon`/`authenticated` não conseguem chamá-la.
- **Uma Tarefa Agendada** ("Backup diário Lume Strada (banco de dados → Drive)", cron `0 9,15,21,3 * * *` em UTC = 06h/12h/18h/00h em Brasília) roda `select public.backup_snapshot_json();` a cada disparo, pega o JSON devolvido e sobe pro Google Drive (pasta `App Gestão`, ID `16Wt8c9zPiOqZgcE9EBfT3eJtED3Xa3A0`) com `mcp__Google_Drive__create_file`, nomeando o arquivo `backup-lume-strada-AAAA-MM-DD_HHhMM-brasilia.json`. `disableConversionToGoogleType: true` impede o Drive de converter o `.json` num Google Doc (o que quebraria o formato).
- **Retenção: mantém tudo pra sempre**, sem limpeza automática — decisão explícita (a alternativa considerada, apagar backups com mais de 30 dias, foi descartada a pedido). Com 4 backups/dia isso acumula ~120 arquivos/mês na pasta — se um dia quiser limpar, é manual.
- **Silenciosa por padrão.** A tarefa não manda nenhuma mensagem quando dá tudo certo (é uma rotina 4x/dia, não faz sentido notificar toda vez) — só produz uma mensagem (e o sistema de notificação do dono pode alertar) se algum passo falhar (erro de SQL, upload, etc.).

### Testado end-to-end antes de agendar

Antes de criar a Tarefa Agendada, rodei o fluxo inteiro manualmente uma vez: chamei `backup_snapshot_json()` no projeto (`ifoggohkikwtnnhmhwoe`), confirmei que o JSON leva todas as ~29 tabelas de negócio (a maioria vazia ainda, já que o sistema tá no começo) e subi o resultado pra pasta do Drive — o arquivo chegou como `.json` de verdade (não virou Google Doc), confirmando que `disableConversionToGoogleType` funciona como esperado.

### Restaurar um backup, se um dia precisar

Cada arquivo é um JSON com a chave `tabelas` contendo, pra cada tabela, um array de linhas (cada linha já no formato de coluna → valor, pronto pra virar um `insert`). Não existe hoje um botão de "restaurar" no painel — é reimportação manual (linha a linha ou via script), decisão deliberada por enquanto: automatizar RESTAURAÇÃO tem risco de sobrescrever dado bom com dado velho por engano, então fica de fora até ter um pedido específico de como deve se comportar (substituir tudo? só preencher o que estiver faltando? empresa por empresa?).

## 11. Financeiro: transação recorrente gera as ocorrências futuras de verdade, e exclusão de série com 3 escopos

O checkbox "Transação recorrente" (semanal/mensal/anual) já existia na tela de lançamento, mas até aqui era só um rótulo — marcar como "mensal" não criava nada além daquela transação isolada. Agora, marcar recorrente já lança de uma vez a transação atual **+** as próximas ocorrências futuras, prontas pra aparecer quando o admin navegar pros meses seguintes (mesmo princípio do parcelamento: `TransacoesManager`/`buscarDadosFinanceiro` filtram por `data_vencimento` dentro do mês em exibição — uma ocorrência com vencimento em outubro só aparece quando o admin abrir outubro).

### Como funciona

- **`fin_transacoes.recorrencia_grupo_id`** (migração `supabase/financeiro-recorrencia.sql`, aplicada como `financeiro_recorrencia` no projeto) — mesmo padrão do `parcela_grupo_id` do parcelamento: todas as ocorrências nascidas juntas compartilham esse id. Uma transação avulsa (não recorrente) tem esse campo `null`.
- **`criarTransacao`** (`src/app/admin/financeiro/actions.ts`), ao receber `recorrente: true` com um `recorrenciaIntervalo`, gera um `recorrencia_grupo_id` novo e insere de uma vez a ocorrência atual + um horizonte de futuras — **semanal: 12** (~3 meses), **mensal: 12** (1 ano), **anual: 5** —, cada uma com o mesmo valor (diferente do parcelamento, recorrência REPETE o valor, não divide um total) e vencimento calculado com `addDaysISO`/`addMonthsISO`. Só a primeira ocorrência herda o "já paga"; as futuras sempre nascem pendentes.
- Horizonte é finito de propósito (evita gerar milhares de linhas por engano numa recorrência esquecida rodando "pra sempre"). Não existe hoje um job que estende a série automaticamente conforme o tempo passa — se um dia o horizonte acabar, decisão de produto pra revisitar.
- **`atualizarTransacao`**: se a transação editada ainda não pertence a uma série e o admin marca "recorrente" agora, uma série nova é criada a partir dali (mesma lógica de geração). Se ela já pertence a uma série, a edição mexe só naquela linha — não recria nem apaga o resto da série, pra não duplicar nem perder lançamentos que o admin já conferiu.
- **Exclusão com 3 escopos** — `removerTransacaoComEscopo(id, escopo)`, nova Server Action. Ao clicar em Excluir numa transação que tem `recorrencia_grupo_id`, o `TransacoesManager` troca o confirm simples (Sim/Não) por 3 opções, exatamente como pedido: **"Só esta"** (apaga só aquela linha), **"Esta e as futuras"** (apaga essa + tudo da mesma série com vencimento igual ou posterior), **"Esta, as futuras e as anteriores"** (apaga a série inteira). Uma transação avulsa continua com o confirm Sim/Não de sempre.
