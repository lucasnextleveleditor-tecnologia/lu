-- ============================================================================
-- Agência Hub — Correções da Auditoria (AUDITORIA.md)
-- ============================================================================
-- Rode DEPOIS de todos os outros arquivos SQL (schema.sql, cadastros.sql,
-- financeiro.sql, producao.sql, comercial.sql, infoprodutos.sql, whatsapp.sql,
-- dashboard.sql, patrimonio.sql) já terem sido aplicados — este arquivo só
-- ALTERA estruturas que eles criam. Idempotente: seguro rodar mais de uma vez.
--
-- Cobre os itens de banco de dados dos grupos 🔴 Crítico e 🟠 Importante da
-- auditoria (ver AUDITORIA.md na raiz do projeto para o relatório completo):
--   1. fin_transacoes: cascade -> restrict nas FKs de conta/cartão (Crítico #4)
--   2. updated_at + trigger nas tabelas do Financeiro (Importante)
--   3. metas_diarias.cliente_id: cascade -> restrict (Importante)
--   4. Índices faltando (Importante)
--   5. CHECK >= 0 em anuncios_tracking (Importante)
--   6. profiles_select_admin: is_admin() -> is_staff() (Importante)
--   7. file_size_limit / allowed_mime_types nos buckets de Storage (Crítico #9 / #3)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. fin_transacoes — CASCADE silencioso vira RESTRICT explícito.
-- ----------------------------------------------------------------------------
-- Antes: excluir uma conta ou cartão com `on delete cascade` apagava, sem
-- aviso nenhum, TODAS as transações ligadas a ela — inclusive as já pagas,
-- ou seja, apagava histórico financeiro real sem confirmação. Com RESTRICT
-- o Postgres recusa a exclusão enquanto existir transação vinculada; o admin
-- precisa mover ou excluir as transações primeiro (a UI já mostra o erro do
-- banco de forma amigável — ver `removerConta`/`removerCartao` em
-- `src/app/admin/financeiro/actions.ts`).
alter table public.fin_transacoes drop constraint if exists fin_transacoes_conta_id_fkey;
alter table public.fin_transacoes
  add constraint fin_transacoes_conta_id_fkey
  foreign key (conta_id) references public.fin_contas(id) on delete restrict;

alter table public.fin_transacoes drop constraint if exists fin_transacoes_conta_destino_id_fkey;
alter table public.fin_transacoes
  add constraint fin_transacoes_conta_destino_id_fkey
  foreign key (conta_destino_id) references public.fin_contas(id) on delete restrict;

alter table public.fin_transacoes drop constraint if exists fin_transacoes_cartao_id_fkey;
alter table public.fin_transacoes
  add constraint fin_transacoes_cartao_id_fkey
  foreign key (cartao_id) references public.fin_cartoes(id) on delete restrict;

-- ----------------------------------------------------------------------------
-- 2. updated_at — as tabelas do Financeiro nasceram sem essa coluna,
--    diferente de todo o resto do schema (ver `public.set_updated_at()` em
--    schema.sql). Sem ela não dá pra saber quando um lançamento foi
--    corrigido pela última vez — importante agora que `atualizarTransacao`
--    existe (edição de transação, ver Crítico #5).
-- ----------------------------------------------------------------------------
alter table public.fin_contas add column if not exists updated_at timestamptz not null default now();
alter table public.fin_cartoes add column if not exists updated_at timestamptz not null default now();
alter table public.fin_categorias add column if not exists updated_at timestamptz not null default now();
alter table public.fin_transacoes add column if not exists updated_at timestamptz not null default now();

drop trigger if exists fin_contas_set_updated_at on public.fin_contas;
create trigger fin_contas_set_updated_at
  before update on public.fin_contas
  for each row execute function public.set_updated_at();

drop trigger if exists fin_cartoes_set_updated_at on public.fin_cartoes;
create trigger fin_cartoes_set_updated_at
  before update on public.fin_cartoes
  for each row execute function public.set_updated_at();

drop trigger if exists fin_categorias_set_updated_at on public.fin_categorias;
create trigger fin_categorias_set_updated_at
  before update on public.fin_categorias
  for each row execute function public.set_updated_at();

drop trigger if exists fin_transacoes_set_updated_at on public.fin_transacoes;
create trigger fin_transacoes_set_updated_at
  before update on public.fin_transacoes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. metas_diarias.cliente_id — CASCADE silencioso vira RESTRICT.
-- ----------------------------------------------------------------------------
-- A auditoria apontou a inconsistência com o padrão `on delete set null`
-- usado em outras FKs opcionais do sistema (ex: `crm_leads.cliente_id`).
-- Aqui optamos por RESTRICT em vez de SET NULL de propósito: `cliente_id`
-- é `not null` (uma Meta Diária sem cliente não faz sentido — ver comentário
-- original em schema.sql), então SET NULL exigiria tornar a coluna opcional
-- e ajustar a policy `metas_diarias_select_own` e a UI para lidar com metas
-- "órfãs" sem dono. RESTRICT resolve o problema real (exclusão em cascata
-- apagando silenciosamente todo o histórico de tráfego de um cliente) sem
-- essa complexidade extra — hoje não existe nenhum fluxo no app que apague
-- um `profile`, então isso só passa a valer se alguém excluir o usuário
-- direto pelo painel do Supabase Auth, e nesse caso é melhor falhar alto e
-- pedir uma decisão explícita do que apagar dados de tráfego sem aviso.
alter table public.metas_diarias drop constraint if exists metas_diarias_cliente_id_fkey;
alter table public.metas_diarias
  add constraint metas_diarias_cliente_id_fkey
  foreign key (cliente_id) references public.profiles(id) on delete restrict;

-- ----------------------------------------------------------------------------
-- 4. Índices faltando — colunas usadas em filtro/join que ainda dependiam
--    de sequential scan.
-- ----------------------------------------------------------------------------
create index if not exists fin_transacoes_categoria_idx on public.fin_transacoes (categoria_id);

-- Índices parciais: cobrem exatamente as duas consultas mais frequentes do
-- módulo — "quanto desse cartão ainda não foi pra fatura" (view
-- `fin_cartoes_limite`) e "quais transações dessa conta ainda estão em
-- aberto" (saldo/dashboard) — sem indexar linhas que essas consultas nunca
-- tocam (fatura já paga / já quitada).
create index if not exists fin_transacoes_cartao_aberto_idx on public.fin_transacoes (cartao_id) where not fatura_paga;
create index if not exists fin_transacoes_conta_pendente_idx on public.fin_transacoes (conta_id) where not pago;

create index if not exists crm_leads_tipo_servico_idx on public.crm_leads (tipo_servico_id);

create index if not exists anuncios_tracking_produto_principal_idx on public.anuncios_tracking (produto_principal_id);
create index if not exists anuncios_tracking_order_bump_idx on public.anuncios_tracking (order_bump_id);

-- ----------------------------------------------------------------------------
-- 5. anuncios_tracking — trava valores negativos vindos de digitação errada
--    (investimento/receita negativos, cliques maiores que visualizações não
--    são travados aqui de propósito — isso é validação de negócio, não de
--    integridade; a UI já usa `min="0"` nesses campos, isso é a rede de
--    segurança do lado do banco).
-- ----------------------------------------------------------------------------
alter table public.anuncios_tracking drop constraint if exists anuncios_tracking_investimento_check;
alter table public.anuncios_tracking add constraint anuncios_tracking_investimento_check check (investimento >= 0);

alter table public.anuncios_tracking drop constraint if exists anuncios_tracking_visualizacoes_check;
alter table public.anuncios_tracking add constraint anuncios_tracking_visualizacoes_check check (visualizacoes >= 0);

alter table public.anuncios_tracking drop constraint if exists anuncios_tracking_cliques_check;
alter table public.anuncios_tracking add constraint anuncios_tracking_cliques_check check (cliques >= 0);

alter table public.anuncios_tracking drop constraint if exists anuncios_tracking_vendas_principal_check;
alter table public.anuncios_tracking add constraint anuncios_tracking_vendas_principal_check check (vendas_principal >= 0);

alter table public.anuncios_tracking drop constraint if exists anuncios_tracking_vendas_order_bump_check;
alter table public.anuncios_tracking add constraint anuncios_tracking_vendas_order_bump_check check (vendas_order_bump >= 0);

alter table public.anuncios_tracking drop constraint if exists anuncios_tracking_receita_bruta_check;
alter table public.anuncios_tracking add constraint anuncios_tracking_receita_bruta_check check (receita_bruta >= 0);

-- ----------------------------------------------------------------------------
-- 6. profiles_select_admin — is_admin() -> is_staff().
-- ----------------------------------------------------------------------------
-- Toda outra policy "de equipe" do sistema (clientes, financeiro, produção,
-- tráfego, inventário...) libera `admin` E `funcionario` via `is_staff()`.
-- Só essa ficou presa em `is_admin()` — na prática, um funcionário com
-- permissão no módulo Clientes consegue ver a LISTA de clientes (tabela
-- `clientes`), mas a policy de `profiles` bloqueava o join com o perfil de
-- login (nome/email/role) desses mesmos clientes, quebrando telas que
-- precisam dos dois. Alinha com o padrão do resto do schema.
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_staff());

-- ----------------------------------------------------------------------------
-- 7. Buckets — limite de tamanho aplicado pelo próprio Storage (Postgres),
--    não só pela checagem de tamanho na Server Action.
-- ----------------------------------------------------------------------------
-- Motivo direto (Crítico #9): o upload de entrega (`producao`) e de
-- criativo (`infoprodutos`) passou a ir DIRETO do navegador pro Storage via
-- signed upload URL (ver `criarUploadAssinadoVersao` em
-- `src/app/admin/producao/actions.ts` e `criarUploadAssinadoCriativo` em
-- `src/app/admin/trafego/infoprodutos-actions.ts`) — a Server Action que
-- gera a URL nunca mais vê os bytes do arquivo, então o "tamanho máximo" que
-- ela checava antes virou só um aviso de UI: nada no servidor impedia o
-- navegador de mandar um arquivo maior direto pro Storage depois de pegar o
-- token. Só o bucket em si pode recusar isso.
update storage.buckets set file_size_limit = 52428800 where id = 'producao'; -- 50MB
update storage.buckets set file_size_limit = 83886080 where id = 'infoprodutos'; -- 80MB
update storage.buckets set file_size_limit = 3145728 where id = 'branding'; -- 3MB

-- `allowed_mime_types` só nos buckets PÚBLICOS ("infoprodutos", "branding")
-- — mesma allowlist de `src/lib/utils/upload.ts` (sem SVG, ver Crítico #3),
-- agora também garantida pelo Storage e não só pela Server Action. O bucket
-- "producao" é PRIVADO (signed URL pra tudo, nunca link público fixo) e
-- recebe qualquer tipo de entrega de projeto (vídeo, PSD, ZIP, PDF...), por
-- isso não leva allowlist de tipo.
update storage.buckets
  set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  where id = 'infoprodutos';
update storage.buckets
  set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  where id = 'branding';
