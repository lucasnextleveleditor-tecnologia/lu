-- ============================================================================
-- Creator Suite — Menções (@) e notificação de tarefa atribuída
-- ============================================================================
--
-- A tabela `notifications` já existia, mas NINGUÉM escrevia nela fora dos
-- avisos da empresa: os tipos `task_assignment` e `mention` estavam
-- declarados e nunca eram criados. Este arquivo fecha esse buraco.
--
-- POR QUE UMA FUNÇÃO E NÃO UM INSERT DIRETO
--
-- Notificar é, por definição, escrever na linha DE OUTRA PESSOA. As policies
-- de `notifications` são todas `user_id = auth.uid()` — e isso está certo:
-- ninguém deve poder ler nem apagar o sino alheio. Um `insert` direto do
-- app esbarraria nessa mesma regra, e afrouxá-la para permitir escrita
-- abriria a porta para qualquer usuário autenticado plantar notificação em
-- qualquer caixa do sistema.
--
-- `security definer` resolve isso sem afrouxar nada: a função é a ÚNICA
-- porta de entrada, e ela impõe as três regras que importam —
--   1. quem chama tem de ser da equipe (`is_staff()`);
--   2. quem recebe tem de ser da MESMA empresa de quem chama;
--   3. o tipo tem de ser um dos dois que esta porta serve.
-- Fora disso ela não escreve, e devolve 0 em silêncio.
--
-- NOTIFICAR A SI MESMO É PROPOSITAL
--
-- O caminho óbvio seria pular `p.id = auth.uid()`: "não avise a pessoa do
-- que ela mesma acabou de fazer". Mas quem administra também executa — cria
-- a própria tarefa numa segunda-feira e vai fazê-la na quinta. Sem a
-- notificação, a tarefa some da cabeça junto com a tela onde foi criada, e o
-- sino passa a ser uma lista incompleta do que essa pessoa tem para fazer.
-- Um sino em que "não está lá" não significa "não tem nada" não serve para
-- nada. Quem não quiser o eco tem o botão de marcar como lida.
-- ============================================================================

create or replace function public.criar_notificacoes(
  p_user_ids      uuid[],
  p_tipo          text,
  p_titulo        text,
  p_mensagem      text default null,
  p_href          text default null,
  p_reference_id  uuid default null,
  p_reference_type text default null
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa   uuid := public.current_company_id();
  v_ator      uuid := auth.uid();
  v_ator_nome text;
  v_criadas   integer := 0;
begin
  if v_empresa is null or v_ator is null then return 0; end if;
  if not public.is_staff() then return 0; end if;
  if p_tipo not in ('task_assignment', 'mention') then return 0; end if;
  if p_user_ids is null or array_length(p_user_ids, 1) is null then return 0; end if;

  -- O nome do ator é um retrato, pela mesma razão da trilha de eventos: quem
  -- sai da equipe tem o perfil apagado, e "alguém te mencionou" não ajuda
  -- ninguém seis meses depois.
  select coalesce(nullif(trim(full_name), ''), email) into v_ator_nome
  from public.profiles where id = v_ator;

  insert into public.notifications (
    company_id, user_id, tipo, titulo, mensagem, href,
    reference_id, reference_type, ator_id, ator_nome
  )
  select v_empresa, p.id, p_tipo, p_titulo, p_mensagem, p_href,
         p_reference_id, p_reference_type, v_ator, v_ator_nome
  from public.profiles p
  where p.id = any(p_user_ids)
    and p.company_id = v_empresa
    and p.active;

  get diagnostics v_criadas = row_count;
  return v_criadas;
end $$;

-- O Supabase concede EXECUTE a `anon` e `authenticated` por padrão em toda
-- função nova, e `revoke ... from public` NÃO tira essas duas — cada uma
-- precisa ser revogada pelo nome. Sem isto, um visitante não autenticado
-- poderia chamar a função (ela devolveria 0, mas a porta estaria aberta).
revoke execute on function public.criar_notificacoes(uuid[], text, text, text, text, uuid, text) from public;
revoke execute on function public.criar_notificacoes(uuid[], text, text, text, text, uuid, text) from anon;
grant  execute on function public.criar_notificacoes(uuid[], text, text, text, text, uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- Índice: o sino pede sempre a mesma coisa — as últimas N linhas desta pessoa.
-- ----------------------------------------------------------------------------
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
