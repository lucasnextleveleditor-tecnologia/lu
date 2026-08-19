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
