-- ============================================================================
-- FASE 4 — Portal do Cliente ("Link do cliente estendido")
--
-- Em vez de mandar um link por orçamento e outro por contrato, cada cliente
-- ganha UM link público fixo que sempre mostra o que há de mais atual: todos
-- os orçamentos dele, todos os contratos, o portfólio já usado com ele e uma
-- linha do tempo simples — montada em cima dos timestamps que orçamentos e
-- contratos já guardam, sem precisar de uma tabela de log nova.
--
-- Mesmo modelo de acesso público já usado em orcamentos.sql/contratos.sql: o
-- token (32 bytes aleatórios, hex) é o ÚNICO controle de acesso da rota
-- pública `/portal/[token]`, sempre filtrado explicitamente no código via
-- Service Role — nunca delegado à RLS (que seguem exigindo `is_staff()` no
-- admin, como sempre).
-- ============================================================================

alter table public.clientes
  add column if not exists portal_token text unique default encode(extensions.gen_random_bytes(32), 'hex');

-- Backfill: clientes cadastrados antes desta migração não tinham a coluna,
-- então o default acima só vale pra linhas novas — geramos um token pra quem
-- ficou com null.
update public.clientes
  set portal_token = encode(extensions.gen_random_bytes(32), 'hex')
  where portal_token is null;

alter table public.clientes alter column portal_token set not null;

create index if not exists clientes_portal_token_idx on public.clientes (portal_token);
