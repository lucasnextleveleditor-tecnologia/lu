-- ============================================================================
-- Limite de armazenamento por empresa
-- ============================================================================
--
-- O teto de espaço deixa de ser um número fixo no código e passa a ser um
-- campo da licença, editável no Super Admin (modal de empresa). É o que
-- permite vender espaço extra pra um cliente específico sem mudar o padrão
-- de todo mundo.
--
-- `null` NÃO significa "sem limite": significa "usa o padrão do sistema"
-- (`LIMITE_PADRAO_MB`, hoje 5 GB, em `src/lib/armazenamento/limites.ts`).
-- A diferença importa: uma empresa com null acompanha o padrão se ele mudar;
-- uma empresa com o número gravado fica congelada no valor do dia do
-- cadastro. Por isso o formulário deixa o campo vazio por padrão em vez de
-- pré-preencher com 5120.
--
-- `if not exists` porque a coluna pode já existir de uma versão anterior —
-- rodar isto duas vezes não faz nada de errado.
alter table public.companies
  add column if not exists limite_armazenamento_mb integer;

comment on column public.companies.limite_armazenamento_mb is
  'Teto de armazenamento da empresa, em MB. NULL = usa o padrão do sistema (LIMITE_PADRAO_MB).';

-- Sanidade: nada de zero ou negativo, que faria a barra de uso dividir por
-- zero e mostrar infinito.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'companies_limite_armazenamento_mb_positivo'
  ) then
    alter table public.companies
      add constraint companies_limite_armazenamento_mb_positivo
      check (limite_armazenamento_mb is null or limite_armazenamento_mb > 0);
  end if;
end $$;
