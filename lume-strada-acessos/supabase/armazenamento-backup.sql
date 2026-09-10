-- ============================================================================
-- Backup do acervo ("Otimizar espaço", em /admin/armazenamento)
-- ============================================================================
--
-- Lista TODOS os arquivos da empresa, paginado. É o inventário que o
-- navegador usa para montar o ZIP: o servidor diz quais arquivos existem, o
-- navegador baixa cada um direto do Storage e vai escrevendo o ZIP no disco.
-- Nada disso passa pela aplicação — não passaria: o teto de corpo de resposta
-- de uma função serverless na Vercel é de poucos megabytes, e um acervo pode
-- ter gigabytes.
--
-- Sem parâmetro de empresa, como todas as outras funções de armazenamento
-- (armazenamento_da_empresa, armazenamento_por_area, maiores_arquivos): o
-- tenant vem de current_company_id(), nunca do cliente. Um parâmetro aqui
-- seria um convite a passar o id de outra empresa.
--
-- Diferente de maiores_arquivos — que mostra só os 25 maiores, serve de
-- diagnóstico e está aberta a qualquer membro da equipe — esta ENUMERA O
-- ACERVO INTEIRO, então exige admin: o backup leva junto contrato assinado e
-- comprovante do financeiro, e um funcionário com permissão só de Produção
-- não deveria conseguir levar isso embora num arquivo só. A action que
-- assina os links confere de novo, no servidor (requireAdmin) — esta é a
-- segunda tranca, para o caso de alguém chamar a RPC direto.
create or replace function public.todos_os_arquivos(p_offset integer default 0, p_limite integer default 1000)
returns table(bucket text, caminho text, bytes bigint, criado_em timestamptz)
language sql
stable
security definer
set search_path to 'public', 'storage'
as $$
  select o.bucket_id::text,
         o.name::text,
         coalesce((o.metadata->>'size')::bigint, 0)::bigint,
         o.created_at
  from storage.objects o
  where (storage.foldername(o.name))[1] = (public.current_company_id())::text
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  order by o.bucket_id, o.name
  offset greatest(coalesce(p_offset, 0), 0)
  limit least(greatest(coalesce(p_limite, 1000), 1), 1000);
$$;

revoke all on function public.todos_os_arquivos(integer, integer) from public;
-- `anon` PRECISA ser revogado à parte. O Supabase concede EXECUTE direto a
-- `anon` e `authenticated` por privilégio padrão em toda função nova do
-- schema public, e revogar do PUBLIC não desfaz uma concessão direta — o
-- linter do projeto pegou exatamente isso. Sem login a função devolveria zero
-- linhas de qualquer jeito (não há `auth.uid()`), mas uma função que ENUMERA
-- o acervo inteiro não deve nem ser chamável por visitante.
revoke execute on function public.todos_os_arquivos(integer, integer) from anon;
grant execute on function public.todos_os_arquivos(integer, integer) to authenticated;
