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

-- ============================================================================
-- CORREÇÃO — a coluna passa a aceitar NULL
-- ============================================================================
--
-- Sintoma: criar empresa no Super Admin sem preencher o limite falhava com
-- "null value in column limite_armazenamento_mb violates not-null constraint".
--
-- Causa: a coluna nasceu `not null default 10240`, e o Super Admin manda NULL
-- DE PROPÓSITO quando o campo fica em branco (ver `limiteEmMb` em
-- `src/app/super-admin/actions.ts`). Um NULL explícito não cai no default da
-- coluna — ele bate direto no `not null`. O default só vale quando a coluna é
-- OMITIDA do insert, e não quando alguém escreve nulo nela.
--
-- O `default` sai junto, e isso é o mais importante da correção. Com
-- `default 10240`, deixar em branco gravaria 10240 na linha — um número
-- CONGELADO. A tela promete outra coisa: "em branco = 5 GB, o padrão do
-- sistema, e acompanha o padrão se ele mudar". Quem cumpre essa promessa é o
-- NULL, resolvido na leitura por `LIMITE_PADRAO_MB`
-- (`src/lib/armazenamento/limites.ts`). Um número gravado ficaria para trás no
-- dia em que o padrão mudasse — que é exatamente o que aconteceu quando o
-- padrão caiu de 10 GB para 5 GB.
--
-- Linhas existentes NÃO são mexidas: empresa com valor gravado continua com
-- ele. Zerá-las aqui seria cortar o espaço de um cliente por efeito colateral
-- de uma migração. Para uma empresa passar a acompanhar o padrão, é limpar o
-- campo no Super Admin.

alter table public.companies
  alter column limite_armazenamento_mb drop not null;

alter table public.companies
  alter column limite_armazenamento_mb drop default;

comment on column public.companies.limite_armazenamento_mb is
  'Limite em MB desta empresa. NULL = acompanha LIMITE_PADRAO_MB (lib/armazenamento/limites.ts), hoje 5 GB. Preenchido = valor fixo, vendido a este cliente.';
