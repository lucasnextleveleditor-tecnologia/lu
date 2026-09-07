-- ============================================================================
-- Lume Strada Filmes — Módulo WhatsApp (Omnichannel / Inbox)
-- ============================================================================
-- Rode DEPOIS de `schema.sql` (precisa de `public.is_admin()`, `profiles` e
-- `set_updated_at()`) e depois de `comercial.sql` (o botão "Adicionar ao
-- CRM" do Inbox cria um `crm_leads`). Idempotente — seguro rodar de novo.
--
-- IMPORTANTE — o que este arquivo NÃO faz: ele cria o schema, o Realtime e
-- as policies pra guardar sessão/contatos/mensagens, mas não conecta a
-- nenhum provedor de mensageria de verdade. A conexão viva com o WhatsApp
-- (gerar QR Code, enviar mensagem de fato) depende de um serviço externo —
-- Evolution API, Baileys ou Z-API, à escolha do time — configurado via
-- variáveis de ambiente e implementado em `src/lib/whatsapp/provider.ts`
-- (ver o comentário nesse arquivo). Até isso ser plugado, a Tela de Conexão
-- funciona normalmente, mas "Gerar QR Code" retorna um erro amigável
-- avisando que falta configurar o provedor.
--
-- Escopo (mesma decisão dos módulos anteriores): single-tenant, só admin
-- usa por enquanto — SEM `company_id`/multi-tenant ainda. Isso é combinado:
-- o sistema está sendo testado internamente primeiro; a camada multi-tenant
-- entra depois, por cima, sem reescrever nada daqui. Por isso `whatsapp_
-- sessoes` é uma tabela SINGLETON (um número de WhatsApp só, o da agência
-- inteira) em vez de uma sessão por empresa — no dia que virar multi-tenant,
-- essa tabela ganha `company_id` e deixa de ser singleton.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Ajuste no CRM (Comercial) — nova origem de lead "whatsapp"
-- ----------------------------------------------------------------------------
-- O botão "Adicionar ao CRM" do Inbox cria um lead com origem = 'whatsapp'.
-- Se você já rodou `comercial.sql` antes de hoje, a constraint antiga de
-- `origem` não conhece esse valor — este bloco recria a constraint
-- incluindo-o. Idempotente (pode rodar de novo sem erro); se você está
-- criando o projeto do zero, `comercial.sql` já nasce com esse valor e este
-- bloco é só um no-op.
alter table public.crm_leads drop constraint if exists crm_leads_origem_check;
alter table public.crm_leads add constraint crm_leads_origem_check
  check (origem in ('indicacao', 'trafego_pago', 'outbound', 'outro', 'whatsapp'));

-- ----------------------------------------------------------------------------
-- 1. SESSÃO — singleton (um número de WhatsApp só, ver nota de escopo acima).
-- ----------------------------------------------------------------------------
create table if not exists public.whatsapp_sessoes (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique, -- trava de "uma linha só" (mesmo padrão de `branding_config`)

  status text not null default 'desconectado' check (status in ('desconectado', 'aguardando_leitura', 'conectado')),
  numero_conectado text, -- número já formatado, ex: "+55 11 90000-0000" — preenchido quando conecta
  qr_code_base64 text, -- data URL do QR Code atual (gerado pelo provedor) — null quando não há QR pendente
  bateria_percentual smallint, -- nível de bateria do aparelho conectado, quando o provedor informa (nem toda API manda)

  ultima_atualizacao timestamptz, -- último evento/heartbeat recebido do provedor (webhook ou ação manual)
  conectado_em timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint whatsapp_sessoes_singleton_check check (singleton = true)
);

drop trigger if exists whatsapp_sessoes_set_updated_at on public.whatsapp_sessoes;
create trigger whatsapp_sessoes_set_updated_at
  before update on public.whatsapp_sessoes
  for each row execute function public.set_updated_at();

-- Garante que a linha singleton sempre existe — a Tela de Conexão sempre
-- tem uma sessão pra ler/atualizar, nunca precisa lidar com "ainda não
-- existe nenhuma sessão".
insert into public.whatsapp_sessoes (singleton, status)
values (true, 'desconectado')
on conflict (singleton) do nothing;

-- ----------------------------------------------------------------------------
-- 2. CONTATOS — uma linha por número que já trocou mensagem com a agência.
-- ----------------------------------------------------------------------------
create table if not exists public.whatsapp_contatos (
  id uuid primary key default gen_random_uuid(),

  telefone text not null, -- só dígitos, com DDI (ex: "5511999998888") — mesmo formato usado pelo remoteJid dos provedores
  nome text, -- pushName do WhatsApp (nome de exibição) — pode mudar, não é chave
  foto_url text,

  lead_id uuid references public.crm_leads(id) on delete set null, -- setado quando o atendente clica "Adicionar ao CRM"
  cliente_id uuid references public.profiles(id) on delete set null, -- vínculo opcional, se o telefone já bate com um cliente cadastrado

  -- Cache da última mensagem — evita subquery em `whatsapp_mensagens` toda
  -- vez que a lista de conversas carrega (mesmo padrão de `crm_leads.
  -- proximo_contato_em`, atualizado explicitamente pela aplicação, não por
  -- trigger).
  ultima_mensagem_preview text,
  ultima_mensagem_em timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (telefone)
);

create index if not exists whatsapp_contatos_ultima_mensagem_idx on public.whatsapp_contatos (ultima_mensagem_em desc nulls last);
create index if not exists whatsapp_contatos_lead_idx on public.whatsapp_contatos (lead_id);

drop trigger if exists whatsapp_contatos_set_updated_at on public.whatsapp_contatos;
create trigger whatsapp_contatos_set_updated_at
  before update on public.whatsapp_contatos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. MENSAGENS — append-only (nunca editada depois de criada).
-- ----------------------------------------------------------------------------
create table if not exists public.whatsapp_mensagens (
  id uuid primary key default gen_random_uuid(),
  contato_id uuid not null references public.whatsapp_contatos(id) on delete cascade,

  direcao text not null check (direcao in ('recebida', 'enviada')),
  tipo text not null default 'texto' check (tipo in ('texto', 'imagem', 'audio', 'video', 'documento', 'outro')),
  conteudo text, -- texto da mensagem, ou legenda quando `tipo` é mídia
  midia_url text, -- url do anexo, quando `tipo` != 'texto'

  status_entrega text check (status_entrega in ('enviando', 'enviado', 'entregue', 'lido', 'falhou')), -- só relevante pra `direcao = 'enviada'`
  external_message_id text, -- id da mensagem no provedor — usado pra idempotência do webhook (nunca duplica um evento reentregue)
  enviado_por uuid references public.profiles(id) on delete set null, -- quem no time enviou (null quando `direcao = 'recebida'`)

  created_at timestamptz not null default now()
);

create index if not exists whatsapp_mensagens_contato_idx on public.whatsapp_mensagens (contato_id, created_at);
create unique index if not exists whatsapp_mensagens_external_id_idx on public.whatsapp_mensagens (external_message_id) where external_message_id is not null;

-- ----------------------------------------------------------------------------
-- 4. RLS — admin-only por enquanto (mesmo padrão do Financeiro/Produção/
-- Comercial — a equipe inteira da agência hoje é `admin`; um papel tipo
-- "atendente" fica pra quando o sistema virar multi-tenant de verdade).
-- ----------------------------------------------------------------------------
alter table public.whatsapp_sessoes enable row level security;
alter table public.whatsapp_contatos enable row level security;
alter table public.whatsapp_mensagens enable row level security;

drop policy if exists "whatsapp_sessoes_admin_all" on public.whatsapp_sessoes;
create policy "whatsapp_sessoes_admin_all" on public.whatsapp_sessoes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "whatsapp_contatos_admin_all" on public.whatsapp_contatos;
create policy "whatsapp_contatos_admin_all" on public.whatsapp_contatos
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "whatsapp_mensagens_admin_all" on public.whatsapp_mensagens;
create policy "whatsapp_mensagens_admin_all" on public.whatsapp_mensagens
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- 5. Realtime — liga o Postgres Changes pra o Inbox e a Tela de Conexão
-- atualizarem sozinhos (nova mensagem / QR Code / status de conexão
-- aparecem sem precisar de F5). Guardado com `if not exists` porque
-- `alter publication ... add table` dá erro se a tabela já foi adicionada
-- numa execução anterior deste script.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'whatsapp_sessoes'
  ) then
    alter publication supabase_realtime add table public.whatsapp_sessoes;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'whatsapp_contatos'
  ) then
    alter publication supabase_realtime add table public.whatsapp_contatos;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'whatsapp_mensagens'
  ) then
    alter publication supabase_realtime add table public.whatsapp_mensagens;
  end if;
end $$;
