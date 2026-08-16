# Auditoria do projeto — Lume Strada Filmes

Análise completa do sistema (8 módulos administrativos, 9 arquivos de schema Supabase, ~1.770 linhas de Server Actions) feita em 14/08/2026 por 5 revisões paralelas focadas em: segurança/RLS, modelo de dados, consistência de UI/UX, lacunas funcionais por módulo, e performance/operação. Este documento consolida os achados, remove duplicatas e prioriza.

Não é uma lista de "bugs" — a maior parte do sistema está bem construída (RLS em 100% das tabelas, padrão `Promise.all` sem N+1, status sempre calculado nunca gravado, Realtime já funcionando no WhatsApp). O que segue é o que falta para o sistema amadurecer com o volume de dados e o número de pessoas que vão operá-lo.

## Resumo executivo — por onde começar

Se só desse pra corrigir 6 coisas esta semana, seriam estas, em ordem:

1. **O webhook do WhatsApp está morto em produção.** O middleware redireciona a própria chamada do provedor externo para `/login` antes dela chegar no código que a processa. Nenhuma mensagem recebida, QR Code ou status de conexão está sendo processado — e não há como perceber isso sem instrumentação, porque não existe log nenhum do lado de dentro.
2. **A integração de WhatsApp em si nunca foi implementada.** `getWhatsAppProvider()` sempre devolve o provedor "não configurado", mesmo com as variáveis de ambiente preenchidas — é código de interface pronto, mas sem nenhuma classe concreta por trás. O módulo inteiro de Conexão/Inbox depende disso.
3. **Um funcionário com permissão só de Produção pode colar HTML malicioso no briefing de uma tarefa e, quando um admin abre esse card, o script roda com a sessão do admin** — um caminho real de escalação de privilégio via XSS armazenado, porque o editor de texto rico salva e renderiza HTML sem sanitizar.
4. **Excluir uma conta ou cartão no Financeiro apaga em cascata, silenciosamente, todo o histórico de transações vinculado** — sem aviso na confirmação, sem log, sem desfazer.
5. **Não existe nenhuma auditoria no sistema.** Ninguém consegue responder "quem mudou essa permissão", "quem editou essa transação" ou "quando esse lead mudou de etapa" — para um sistema que controla RBAC e dinheiro, essa é a lacuna mais séria de governança.
6. **Não há nenhum teste automatizado nem CI.** Toda a lógica de cálculo (status de acesso, status de tráfego, fechamento semanal, atraso de tarefa) é validada só visualmente, por quem estiver revisando o código naquele momento.

O restante deste documento detalha esses pontos e mais ~35 outros, organizados por severidade.

---

## 🔴 Crítico

### Segurança

**1. O middleware bloqueia o próprio webhook do WhatsApp antes dele rodar**
`src/middleware.ts` — `ROTAS_PUBLICAS` (linha 7) não inclui `/api`, e o `matcher` (linha ~162) também não exclui rotas de API. Um POST do provedor externo em `/api/whatsapp/webhook` chega sem cookie de sessão, o middleware não encontra usuário logado, a rota não está na lista de públicas, e ele devolve um redirect para `/login` — antes de `src/app/api/whatsapp/webhook/route.ts` sequer rodar. Toda a validação de segredo compartilhado ali dentro é código morto. **Correção:** excluir `/api` do matcher do middleware, ou checar `pathname.startsWith("/api")` e liberar cedo.

**2. XSS armazenado no briefing de tarefas, com caminho de escalação para admin**
`src/components/admin/producao/RichTextEditor.tsx` usa `dangerouslySetInnerHTML` para renderizar `prod_tarefas.briefing`, que é salvo cru em `src/app/admin/producao/actions.ts` sem nenhuma sanitização. Um funcionário com a permissão `"producao"` (não precisa ser admin) pode colar um `<img onerror="...">` no editor; quando um **admin** abre esse mesmo card, o script roda na sessão do admin, dentro da origem autenticada do painel, podendo chamar qualquer Server Action (inclusive `atualizarPermissoes`). **Correção:** sanitizar o HTML no servidor antes de gravar (`sanitize-html`/DOMPurify), nunca confiar em conteúdo de um editor `contentEditable`.

**3. Upload de SVG em buckets públicos permite XSS armazenado público**
`src/app/admin/aparencia/actions.ts` e `src/app/admin/trafego/infoprodutos-actions.ts` validam só o prefixo do MIME informado pelo próprio navegador (`file.type.startsWith("image/")`), o que aceita `image/svg+xml` — e SVG pode conter `<script>`. Os buckets `branding` e `infoprodutos` são públicos e sem sessão. **Correção:** recusar `image/svg+xml` nesses dois buckets.

### Financeiro / integridade de dados

**4. Excluir conta ou cartão apaga transações em cascata, silenciosamente**
`supabase/financeiro.sql` — `fin_transacoes.conta_id`/`conta_destino_id`/`cartao_id` são `on delete cascade`. A UI (`ContasCard.tsx`/`CartoesCard.tsx`) só avisa disso num `title` de tooltip, não na própria confirmação "Sim/Não". Para um sistema que guarda histórico financeiro, isso é o pior comportamento possível: perda irreversível de dados contábeis por um clique apressado. **Correção:** trocar para `on delete restrict` (força reclassificar transações antes de apagar a conta/cartão), ou adotar exclusão lógica (`ativo boolean`) em contas e cartões em vez de DELETE físico.

**5. Não existe forma de editar uma transação financeira**
`src/app/admin/financeiro/actions.ts` só tem `criarTransacao`, `marcarPago` (toggle) e `removerTransacao` — nenhum `atualizarTransacao`. Corrigir um valor ou data digitado errado exige apagar e recriar, perdendo o rastro de que aquilo foi uma correção. **Correção:** adicionar `atualizarTransacao`, reaproveitando a mesma validação de `criarTransacao`.

### Governança / confiabilidade

**6. Nenhuma auditoria em nenhum lugar do sistema**
Fora dois campos isolados (`criado_por` em `cliente_atividades` e `crm_anotacoes`), não existe tabela de log em nenhum dos 9 arquivos SQL, nem colunas `updated_by`/`deleted_by` em nenhuma tabela de negócio. Mudança de permissão (`atualizarPermissoes`), suspensão de cliente, edição/exclusão de transação financeira, mudança de etapa no funil comercial ou no Kanban de produção — nada disso fica rastreado. Diferente de paginação ou de UI, esse é um dado que **não tem como ser reconstruído depois do fato** se não for capturado agora. **Correção mínima:** uma tabela `audit_log` genérica (tabela/registro/operação/dados antigos/dados novos/quem/quando) com trigger aplicada primeiro em `fin_transacoes` e `profiles` (permissões/role/active), depois estendida a `crm_leads.status` e `prod_tarefas.status` — ver esboço de SQL no relatório completo dos agentes, disponível a pedido.

**7. Zero teste automatizado e zero CI**
Não há `*.test.ts`, não há Jest/Vitest/Playwright no `package.json`, não há `.github/workflows`. O único gate é rodar `tsc`/`lint`/`build` manualmente antes de cada entrega (o que eu já faço a cada mudança, mas isso não substitui teste automatizado nem protege contra regressão em mudanças futuras feitas sem essa disciplina). A lógica mais arriscada — `calcularStatus`, `calcularResumoTrafego`, `segundaFeiraISO`/`calcularStatusPeriodo` (fechamento semanal), `isTarefaAtrasada`, `isFollowUpAtrasado` — é toda matemática de data/dinheiro em funções puras, o candidato ideal para teste unitário barato. **Correção sugerida:** Vitest cobrindo os ~9 arquivos de `lib/utils/*.ts`, mais um workflow simples de GitHub Actions rodando `typecheck` + `lint` + testes a cada PR.

**8. WhatsApp: a integração real nunca foi escrita**
`src/lib/whatsapp/provider.ts` — `getWhatsAppProvider()` sempre retorna o provedor "não configurado", **independente** das variáveis `WHATSAPP_PROVIDER_URL`/`WHATSAPP_PROVIDER_API_KEY` estarem preenchidas. Existe só a interface (`WhatsAppProvider`); nenhuma classe concreta para Evolution API/Baileys/Z-API foi implementada. Isso é diferente do que o `.env.local.example` promete ("preencha essas duas variáveis e funciona") — é trabalho de desenvolvimento pendente, não uma configuração de ambiente. Vale decidir qual provedor usar e implementar essa classe antes de anunciar o módulo como pronto.

### Operacional

**9. Upload de arquivo grande (vídeo) provavelmente falha sempre em produção**
`src/app/admin/producao/actions.ts` e `infoprodutos-actions.ts` validam 50MB/80MB, mas Server Actions do Next 14 limitam o corpo da requisição a **1MB por padrão** (não configurado em `next.config.js`), e a Vercel impõe um teto físico de **4.5MB** por função serverless que nenhuma configuração remove. Ou seja, qualquer entrega de vídeo real ou criativo de anúncio provavelmente já falha silenciosamente hoje, sem log nenhum indicando isso (ver achado de observabilidade abaixo). **Correção:** trocar para upload direto do navegador ao Supabase Storage via signed upload URL — o arquivo nunca passa pelo corpo da Server Action, só a URL assinada (pequena) trafega pelo servidor.

---

## 🟠 Importante

### Segurança e permissões

- **`converterLeadEmCliente` convida um novo usuário sob a permissão `"comercial"`, não `requireAdmin()`** (`src/app/admin/comercial/actions.ts`) — inconsistente com o resto do sistema, onde criar login é deliberadamente admin-only. Impacto moderado (papel `cliente` é o de menor privilégio), mas vale alinhar.
- **O Dashboard Geral mostra o saldo financeiro consolidado — inclusive contas de contexto "pessoal" — para qualquer funcionário**, mesmo sem a permissão `"financeiro"` habilitada (`src/app/admin/dashboard/page.tsx`). O Dashboard é intencionalmente aberto a todo `is_staff()`, mas esse card específico deveria checar a permissão fina e filtrar só contexto profissional.
- **`profiles_select_admin` não foi migrada para `is_staff()`** quando o RBAC por módulo foi introduzido (`supabase/cadastros.sql`) — um funcionário com a permissão `"clientes"` vê a lista de perfis incompleta na tela de Cadastros. É restritivo demais, não é vazamento, mas quebra a UX do RBAC.
- **`enviarVersaoArquivo` (entregas de produção) não valida tipo de arquivo**, só tamanho — um `.html` pode ser enviado e, se aberto direto pela signed URL, renderiza com script ativo.

### Modelo de dados

- **Módulo Financeiro inteiro sem `updated_at`** (`fin_contas`, `fin_cartoes`, `fin_categorias`, `fin_transacoes`) — único módulo fora do padrão `set_updated_at` aplicado em todo o resto do schema.
- **`metas_diarias.cliente_id` é `on delete cascade`**, diferente de `prod_tarefas.cliente_id`/`crm_leads.cliente_id`/`whatsapp_contatos.cliente_id` (todos `on delete set null`) — apagar o login de um cliente apaga permanentemente o histórico de tráfego dele, inconsistente com o resto do sistema.
- **Índices faltando** em `fin_transacoes.categoria_id`, `fin_transacoes` filtrado por cartão em aberto/pendência de pagamento, `crm_leads.tipo_servico_id`, `anuncios_tracking.produto_principal_id`/`order_bump_id` — todos FKs usadas em filtro frequente sem índice dedicado.
- **`anuncios_tracking` sem CHECK ≥ 0** em investimento/vendas/receita — um valor negativo digitado errado corrompe o cálculo de `fechamentos_semanais`, que trava esse número como definitivo.
- **`crm_leads` sem UNIQUE por WhatsApp/e-mail** — o mesmo contato pode virar dois leads (um pelo formulário, outro pelo botão "Adicionar ao CRM" do Inbox), fragmentando o funil.
- **Conceito de "cliente" fragmentado** entre `profiles.role='cliente'` e a tabela `clientes` (CNPJ/endereço) sem nenhuma sincronização garantida — já reconhecido como dívida técnica deliberada no próprio schema, mas vale um relatório periódico de divergência conforme a base crescer.

### UI/UX e acessibilidade

- **O Kanban de Leads do Comercial (`LeadKanbanBoard.tsx`/`LeadCard.tsx`) é o caso mais visível de inconsistência**: estruturalmente idêntico ao Kanban de Produção (mesma lib de drag-and-drop), mas ficou 100% no visual antigo enquanto o de Produção ganhou o tratamento premium. `ListaLeads.tsx` tem a mesma defasagem em relação a `ListaTarefas.tsx`.
- **A página real do Financeiro (`/admin/financeiro`) segue no visual antigo**, enquanto o preview em `/admin/financeiro/novo` já mostra o design aprovado — são duas identidades visuais coexistindo para o mesmo domínio (esperado, é um preview intencional, mas vale ter isso mapeado antes de decidir promover um ao outro).
- **Sidebar do admin não tem nenhum tratamento responsivo** (`AdminShell.tsx`, zero breakpoints no arquivo) — abaixo de 768px de largura, o conteúdo fica espremido atrás de uma sidebar fixa de 256px, sem colapso, sem menu hambúrguer.
- **Inbox do WhatsApp é inutilizável em mobile** (`InboxWorkspace.tsx`) — grid fixo de 320px para a lista de conversas, sem nenhum breakpoint, sem visão empilhada.
- **`<label>` nunca associado ao campo via `htmlFor`/`id`** — padrão sistêmico em pelo menos 28 lugares, incluindo os módulos recém-redesenhados. Leitor de tela não anuncia o rótulo ao focar o campo.
- **Linhas de tabela clicáveis (`<tr onClick>`) não são acessíveis por teclado** em `ListaLeads.tsx` e `ListaTarefas.tsx` — sem `tabIndex`/`role`/`onKeyDown`, só funciona com mouse.
- **O componente `Button` compartilhado não define nenhum estilo de foco visível** (`:focus-visible`) — se propaga para todo botão do app, incluindo os cards-botão do Kanban, que dependem do outline default do navegador (que costuma ter contraste ruim em fundo quase preto).
- **Botões só-ícone sem `aria-label`** em alguns pontos (ex: enviar mensagem no WhatsApp), embora o padrão correto já exista e seja seguido na maioria dos outros lugares.

### Funcionalidades faltando (transversal)

- **Nenhuma paginação em lugar nenhum do sistema** — toda listagem (`profiles`, `clientes`, `crm_leads`, `prod_tarefas`, `whatsapp_contatos`, itens de inventário) busca a tabela inteira via `select("*")`, sem `.limit()`/`.range()`. Não quebra hoje (volume baixo), mas degrada progressivamente conforme o histórico cresce — e como toda página é `force-dynamic` (sem cache), isso significa recarregar o dataset inteiro a cada navegação.
- **`listarMensagens` do WhatsApp busca o histórico inteiro de uma conversa de uma vez**, sem paginação — o caso mais claro de risco real, já que conversas de anos acumulam milhares de mensagens.
- **Nenhum mecanismo de notificação em lugar nenhum**: tarefa atrasada, meta abaixo do esperado, follow-up de lead esquecido, fatura de cartão vencendo — tudo isso é só um badge recalculado na tela, 100% dependente de alguém abrir o módulo certo manualmente. Não há e-mail, push, nem cron.
- **README desatualizado**: documenta uma versão do projeto sem Cadastros/RBAC, Financeiro, Produção, Comercial ou WhatsApp — que hoje são a maior parte do sistema. Isso é risco real de manutenção (a documentação não reflete onde as regras de negócio realmente estão implementadas).
- **Zero logging nos `catch` de Server Actions** — nenhuma das ~77 Server Actions do projeto loga o erro antes de devolver `{ ok: false }` ao cliente; hoje a única forma de saber que algo quebrou em produção é o usuário relatar a mensagem que viu na tela.
- **Autenticação/perfil é consultada 2 a 3 vezes por requisição** (middleware + `requireModulo`/`requireAdmin`, e uma 3ª query redundante em `admin/page.tsx`) — não é um risco de segurança, é latência desnecessária por clique/navegação. Dá pra eliminar a duplicação passando o resultado do middleware via header interno, sem enfraquecer a garantia de expiração em tempo real que motivou o design atual.

---

## 🟡 Nice-to-have

- **Estados vazios inconsistentes** — pelo menos 3 padrões visuais coexistindo (caixa pontilhada só texto, caixa pontilhada com ícone, fundo sólido translúcido com ícone) para o mesmo conceito de "nada aqui ainda".
- **Nenhum loading state/skeleton em lugar nenhum** — o padrão universal é texto "Carregando..." ou o próprio botão trocando de rótulo; não há `loading.tsx` de rota nem esqueleto de conteúdo.
- **Sem exportação de dados** (CSV/PDF/XLSX) em nenhum módulo — todo relatório para cliente ou contabilidade exige transcrição manual.
- **`<textarea>` em `ClienteModal.tsx` reimplementa manualmente as classes do `Input.tsx`** em vez de existir um componente `Textarea` compartilhado — duplicação pontual que diverge silenciosamente se o `Input` mudar de estilo.
- Uma lista de constraints de banco de baixo risco individual, mas fáceis de fechar juntas: `CHECK >= 0` em valores numéricos que ainda não têm (metas de tráfego, valor de item de inventário, valor estimado de lead), `UNIQUE(lower(nome))` em categorias/tipos de serviço/funcionários (evita "Marketing" e "marketing" cadastrados como coisas diferentes), formato de telefone em `whatsapp_contatos`, `updated_at` residual em `prod_entrega_versoes`/`prod_subtarefas`/`prod_entregas`.
- **Exclusões são hard-delete direto** em praticamente todo o sistema (a maioria já tem confirmação em duas etapas na UI, o que reduz bastante o risco de clique acidental, mas não existe lixeira/restauração em lugar nenhum).
- Rotas de autenticação (`/login`, `/definir-senha`) carregam um First Load JS um pouco acima da média das outras páginas — provável reflexo do cliente Supabase completo sendo importado logo na tela de login; não é urgente, mas é o tipo de ajuste que melhora a percepção de velocidade justo na primeira tela que todo usuário vê.

---

## O que já está bem feito (não mexer)

- RLS habilitado em 100% das tabelas revisadas, com o padrão `is_admin()`/`is_staff()` via função `SECURITY DEFINER` aplicado de forma consistente.
- As ~50 Server Actions administrativas chamam `requireAdmin()`/`requireModulo()` como primeira linha, sem exceção relevante fora dos 2 casos apontados acima.
- Nenhum padrão N+1 encontrado — todo carregamento de página usa `Promise.all` + join em memória com `.in(...)`, nunca uma query por item dentro de um loop.
- O Inbox do WhatsApp já usa Supabase Realtime de verdade (assinatura de `postgres_changes`), não depende de reload manual.
- O bucket de entregas de produção é privado com signed URL de validade curta — implementado corretamente.
- Nenhum segredo hardcoded em lugar nenhum do código-fonte.
- O padrão "status nunca é uma coluna gravada, sempre calculado" (acesso, tráfego, atraso de tarefa, follow-up) é aplicado com disciplina em todos os módulos — é o tipo de decisão de arquitetura que evita uma classe inteira de bugs de dessincronia.

---

## Sugestão de ordem de ataque

1. **Esta semana, sem risco de regressão:** corrigir o matcher do middleware (item 1), trocar `image/svg+xml` para bloqueado nos dois buckets públicos (item 3), adicionar `console.error` nos `catch` das Server Actions (item importante de observabilidade) — três correções pequenas, isoladas, de alto impacto.
2. **Antes do próximo ciclo de uso pesado do Financeiro:** `atualizarTransacao`, trocar cascade por restrict em `fin_transacoes`/`fin_faturas`, e o card de saldo do Dashboard Geral respeitando a permissão `"financeiro"`.
3. **Decisão de produto, não só técnica:** decidir se o provedor de WhatsApp vai ser implementado agora (item 8) — hoje o módulo de Conexão promete algo que o código não entrega.
4. **Sanitização do briefing de tarefas** (item 2) — não é grande esforço (uma lib de sanitização + um ponto de chamada), mas fecha o único caminho de escalação de privilégio encontrado.
5. **Fundação de auditoria** (item 6) — uma tabela genérica + 2 triggers (financeiro e permissões) já cobre os dois casos de maior risco; estender para produção/comercial depois.
6. **Testes automatizados** (item 7) — começar pelos `lib/utils/*.ts`, que são funções puras, baratas de testar e concentram o cálculo mais sensível do sistema.
7. **Rodada de "premium" no Comercial** — já que o Kanban de Leads é estruturalmente idêntico ao de Produção, é a extensão mais natural do trabalho visual já feito, e a inconsistência mais visível hoje entre módulos.

Qualquer um desses pontos, posso detalhar mais ou já implementar — é só apontar por onde começar.
