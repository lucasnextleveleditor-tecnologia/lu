-- ============================================================================
-- Contrato externo: o que foi assinado fora do sistema
-- ============================================================================
-- Rode DEPOIS de `contratos.sql`. Idempotente.
--
-- Nem todo contrato nasce aqui. A agência assina no papel, no DocuSign, no
-- Clicksign, ou herda um contrato de antes de usar o sistema — e hoje esses
-- simplesmente não existem para o software. Consequência prática: a ficha do
-- cliente mostra "nenhum contrato" para um cliente que tem contrato, e o
-- cliente não tem onde consultar o que assinou.
--
-- A escolha aqui foi NÃO criar uma tabela separada para esses. Um contrato
-- externo é um contrato: ele tem cliente, título, data de assinatura, e
-- precisa aparecer na mesma lista, na mesma ficha e no mesmo painel do
-- cliente. Uma segunda tabela obrigaria toda leitura a juntar as duas e
-- ordenar na memória, e a primeira que alguém esquecesse mostraria metade dos
-- contratos do cliente — que é pior do que não mostrar nenhum.
--
-- O que distingue um do outro é `origem`:
--   'sistema' — nasceu aqui, tem cláusulas, itens e token de assinatura.
--   'externo' — só a capa: título, cliente, data, e o documento (link OU
--               arquivo). Sem cláusulas, sem itens, sem fluxo de assinatura.
--
-- O `token` continua sendo gerado para os dois (é default da coluna), mas a
-- página pública `/contrato/[token]` só faz sentido para os do sistema — quem
-- abre um externo é mandado direto para o documento.
-- ============================================================================

alter table public.contratos
  add column if not exists origem text not null default 'sistema',
  add column if not exists arquivo_url text,
  add column if not exists arquivo_path text,
  add column if not exists assinado_fora_em date;

alter table public.contratos drop constraint if exists contratos_origem_check;
alter table public.contratos add constraint contratos_origem_check
  check (origem in ('sistema', 'externo'));

-- Um contrato externo sem documento nenhum seria uma linha dizendo "existe um
-- contrato em algum lugar" — exatamente a situação que isto veio resolver.
alter table public.contratos drop constraint if exists contratos_externo_tem_documento;
alter table public.contratos add constraint contratos_externo_tem_documento
  check (
    origem <> 'externo'
    or coalesce(btrim(arquivo_url), '') <> ''
    or coalesce(btrim(arquivo_path), '') <> ''
  );

comment on column public.contratos.origem is
  'sistema = gerado e assinado aqui (tem clausulas, itens e token). externo = assinado fora, so a capa mais o documento em arquivo_url ou arquivo_path.';
comment on column public.contratos.arquivo_url is
  'Link do documento assinado fora (Drive, Clicksign, DocuSign...). Exclusivo com arquivo_path na pratica, mas os dois sao aceitos.';
comment on column public.contratos.arquivo_path is
  'Caminho no bucket privado `contratos` quando o PDF foi enviado em vez de linkado. A leitura e sempre por URL assinada gerada no servidor.';
comment on column public.contratos.assinado_fora_em is
  'Data em que foi assinado fora do sistema. Para origem = sistema quem vale e assinado_em.';

-- A ficha do cliente e o painel dele pedem sempre "os contratos DESTE
-- cliente, mais recentes primeiro". Sem índice, isso é varredura na tabela
-- inteira da empresa a cada abertura de modal.
create index if not exists contratos_cliente_id_idx
  on public.contratos (cliente_id, created_at desc);

-- ============================================================================
-- Bucket do arquivo assinado fora
-- ============================================================================
-- PRIVADO. Um contrato tem CNPJ, endereço e valores das duas partes; um
-- bucket público seria um link adivinhável para isso. Quem lê (a ficha do
-- cliente e o painel do cliente) recebe sempre uma URL assinada de curta
-- duração, gerada no servidor.
--
-- 20 MB: um PDF de contrato assinado e escaneado passa longe disso, e o teto
-- barra o vídeo que alguém fatalmente vai tentar anexar aqui um dia.

insert into storage.buckets (id, name, public, file_size_limit)
values ('contratos', 'contratos', false, 20971520)
on conflict (id) do nothing;

-- Só a equipe escreve e lê direto. O cliente NÃO tem policy aqui de propósito:
-- ele nunca fala com o storage, só recebe a URL assinada que o servidor gerou
-- depois de conferir que aquele contrato é dele.
drop policy if exists "contratos_bucket_staff_select" on storage.objects;
create policy "contratos_bucket_staff_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'contratos' and public.is_staff());

drop policy if exists "contratos_bucket_staff_insert" on storage.objects;
create policy "contratos_bucket_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'contratos' and public.is_staff());

drop policy if exists "contratos_bucket_staff_update" on storage.objects;
create policy "contratos_bucket_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'contratos' and public.is_staff())
  with check (bucket_id = 'contratos' and public.is_staff());

drop policy if exists "contratos_bucket_staff_delete" on storage.objects;
create policy "contratos_bucket_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'contratos' and public.is_staff());
