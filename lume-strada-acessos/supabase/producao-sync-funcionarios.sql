-- ============================================================================
-- Lume Strada Filmes — Sincroniza Equipe (Cadastros) → Responsável (Produção)
-- ============================================================================
-- Rode DEPOIS de `schema.sql`, `cadastros.sql` e `producao.sql` já terem
-- rodado (precisa de `public.equipe_membros` e `public.prod_funcionarios`
-- existindo). Idempotente — seguro rodar de novo.
--
-- Contexto: `prod_funcionarios` (a lista simples de "Responsável" das
-- tarefas de Produção) e `equipe_membros` (o cadastro completo de RH/acesso
-- da equipe, em Cadastros → Equipe) nasceram como cadastros DELIBERADAMENTE
-- separados (ver comentário em `cadastros.sql`). Na prática isso significava
-- que registrar alguém em Cadastros não fazia essa pessoa aparecer como
-- opção de Responsável em Produção — o admin precisava cadastrar o nome de
-- novo, manualmente, nas Configurações de Produção. Este script resolve
-- isso: toda vez que um membro da equipe é criado/renomeado em
-- `equipe_membros`, um `prod_funcionarios` correspondente é criado/atualizado
-- automaticamente (via trigger), e a query abaixo faz esse mesmo "espelho"
-- pra quem já estava cadastrado ANTES deste script rodar.
--
-- `prod_funcionarios` continua existindo como tabela própria (nenhuma FK
-- existente em `prod_tarefas.responsavel_id` muda de lugar) — só passa a
-- ser preenchida automaticamente a partir de `equipe_membros`, em vez de só
-- manualmente. Cadastrar um funcionário "avulso" direto nas Configurações
-- de Produção (sem passar por Cadastros → Equipe) continua funcionando
-- normalmente, sem vínculo com `equipe_membros`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Coluna de vínculo — `on delete cascade` de propósito: se o membro da
--    equipe for removido em Cadastros, o "espelho" em `prod_funcionarios`
--    some junto (e qualquer tarefa que tinha essa pessoa como Responsável
--    simplesmente fica sem Responsável — `on delete set null`, já existente
--    em `prod_tarefas.responsavel_id` — nunca bloqueia a exclusão).
-- ----------------------------------------------------------------------------
alter table public.prod_funcionarios
  add column if not exists equipe_membro_id uuid references public.equipe_membros(id) on delete cascade;

create unique index if not exists prod_funcionarios_equipe_membro_idx
  on public.prod_funcionarios (equipe_membro_id) where equipe_membro_id is not null;

-- ----------------------------------------------------------------------------
-- 2. Trigger — mantém o nome sincronizado dali pra frente. `security
--    definer` pelo mesmo motivo de `is_admin()`/`is_staff()` (ver
--    `schema.sql`): o trigger roda como dono da tabela, então grava em
--    `prod_funcionarios` mesmo que o funcionário que renomeou a si mesmo em
--    Cadastros não tenha (e não precise ter) permissão de escrita direta
--    ali.
-- ----------------------------------------------------------------------------
create or replace function public.sync_prod_funcionario_from_equipe_membro()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.prod_funcionarios (nome, ativo, equipe_membro_id)
  values (new.nome, true, new.id)
  on conflict (equipe_membro_id) do update set nome = excluded.nome;
  return new;
end;
$$;

drop trigger if exists equipe_membros_sync_prod_funcionario on public.equipe_membros;
create trigger equipe_membros_sync_prod_funcionario
  after insert or update of nome on public.equipe_membros
  for each row execute function public.sync_prod_funcionario_from_equipe_membro();

-- ----------------------------------------------------------------------------
-- 3. Backfill — cria o "espelho" pra quem já estava cadastrado em
--    `equipe_membros` ANTES deste script rodar (é isso que faz o
--    funcionário que você já cadastrou aparecer no Responsável sem precisar
--    editar o cadastro dele de novo). Seguro rodar de novo a qualquer
--    momento (`on conflict` sempre atualiza em vez de duplicar).
-- ----------------------------------------------------------------------------
insert into public.prod_funcionarios (nome, ativo, equipe_membro_id)
select nome, true, id from public.equipe_membros
on conflict (equipe_membro_id) do update set nome = excluded.nome;
