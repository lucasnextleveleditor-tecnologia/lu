-- ============================================================================
-- WhatsApp: acabando de fechar a lacuna multi-tenant deixada pra trás
-- ============================================================================
-- `multitenant-migration.sql` já tinha convertido `whatsapp_sessoes` de
-- singleton global pra uma linha por empresa (§5) — mas o CÓDIGO que lê/
-- escreve essa tabela (Server Actions, páginas, webhook) continuou filtrando
-- por `.eq("singleton", true)`, uma coluna que a própria migração já tinha
-- apagado. Resultado: a Tela de Conexão (`/admin/whatsapp/conexao`) quebrava
-- com "column whatsapp_sessoes.singleton does not exist" pra QUALQUER
-- empresa que abrisse ela. Corrigido no código (não precisa de SQL pra
-- isso: os `.eq("singleton", true)` foram só removidos, a RLS já isola por
-- empresa) — ver `src/app/admin/whatsapp/actions.ts`,
-- `src/app/admin/whatsapp/conexao/page.tsx`, `src/app/admin/dashboard/
-- page.tsx`.
--
-- Achado no mesmo mergulho: o Webhook (`src/app/api/whatsapp/webhook/
-- route.ts`) tinha o MESMO problema, mais um segundo — ele usa a Service
-- Role (não tem sessão de usuário, então RLS não isola nada sozinho) e
-- fazia UPDATE/INSERT sem NENHUM filtro de `company_id`. Sem correção, o
-- primeiro provedor de WhatsApp real que fosse conectado bagunçaria a
-- sessão de TODAS as empresas de uma vez (`.update({...})` sem filtro, com
-- Service Role, afeta todo mundo). Corrigido no código pra exigir
-- `?company_id=` na URL do webhook (uma URL por empresa) e escopar todo
-- update/insert por ela explicitamente — ver o comentário no topo de
-- `route.ts`.
--
-- Este arquivo SQL só cobre a última peça que sobrou: o índice único de
-- idempotência do webhook (`whatsapp_mensagens_external_id_idx`) ainda era
-- GLOBAL (`external_message_id` sozinho) — reescopado pra
-- `(company_id, external_message_id)`, já que esse id vem do PROVEDOR de
-- cada empresa e duas empresas com provedores diferentes podiam, em teoria,
-- colidir sem relação nenhuma entre si. Idempotente: seguro rodar de novo.
-- ============================================================================

drop index if exists public.whatsapp_mensagens_external_id_idx;
create unique index if not exists whatsapp_mensagens_company_external_id_idx
  on public.whatsapp_mensagens (company_id, external_message_id)
  where external_message_id is not null;
