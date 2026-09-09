-- Anexos de transação do Financeiro (nota fiscal/recibo, comprovante de
-- pagamento) — pedido do usuário: opcional, mas ele quer poder guardar o
-- documento junto do lançamento. Tabela própria (não colunas fixas em
-- `fin_transacoes`) porque uma transação pode ter MAIS DE UM anexo do mesmo
-- tipo (ex: nota fiscal + recibo separados, ou dois comprovantes de um
-- pagamento dividido) — e funciona igual pra transação antiga ou nova, sem
-- backfill nenhum: a linha só existe quando alguém de fato anexa algo.
create table public.fin_transacao_anexos (
  id uuid primary key default gen_random_uuid(),
  transacao_id uuid not null references public.fin_transacoes(id) on delete cascade,
  tipo text not null check (tipo in ('nota_fiscal', 'comprovante')),
  storage_path text not null,
  nome_arquivo text not null,
  tamanho_bytes bigint,
  tipo_mime text,
  enviado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index fin_transacao_anexos_transacao_id_idx on public.fin_transacao_anexos(transacao_id);

alter table public.fin_transacao_anexos enable row level security;

create policy fin_transacao_anexos_admin on public.fin_transacao_anexos
  for all using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- Storage — bucket "financeiro" (notas fiscais/recibos/comprovantes).
-- PRIVADO, mesmo padrão do bucket "producao": nunca URL pública fixa, o app
-- gera link assinado (`createSignedUrl`) com validade curta pra visualizar/
-- baixar. 20MB cobre PDF/foto de documento sem precisar do limite de vídeo
-- do bucket de produção.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('financeiro', 'financeiro', false, 20971520)
on conflict (id) do nothing;

drop policy if exists "financeiro_bucket_admin_select" on storage.objects;
create policy "financeiro_bucket_admin_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'financeiro' and public.is_staff());

drop policy if exists "financeiro_bucket_admin_insert" on storage.objects;
create policy "financeiro_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'financeiro' and public.is_staff());

drop policy if exists "financeiro_bucket_admin_update" on storage.objects;
create policy "financeiro_bucket_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'financeiro' and public.is_staff())
  with check (bucket_id = 'financeiro' and public.is_staff());

drop policy if exists "financeiro_bucket_admin_delete" on storage.objects;
create policy "financeiro_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'financeiro' and public.is_staff());
