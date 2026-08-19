-- ============================================================================
-- Agência Hub — Financeiro: categorias padrão SEMPRE presentes, por empresa
-- ============================================================================
-- Rode DEPOIS de `multitenant-migration.sql` (precisa de `public.companies`,
-- `fin_categorias.company_id` e do índice único
-- `fin_categorias_company_nome_tipo_idx` já existindo). Idempotente: seguro
-- rodar de novo.
--
-- Contexto: `financeiro-categorias.sql` semeou ~22 categorias padrão UMA
-- VEZ, antes da migração multi-tenant — quando só existia "a empresa" (sem
-- `company_id`). Depois da migração isso não acompanhou empresas novas: toda
-- empresa criada por `criarEmpresa` (super-admin) nasce com ZERO categorias,
-- e o próprio dono só descobre isso na hora de lançar a primeira despesa.
--
-- O que este arquivo faz:
--   1. Define `public.seed_fin_categorias_empresa(p_company_id)` — insere o
--      pacote padrão (24 categorias: água, energia, internet, combustível,
--      vestuário, tráfego pago, etc. — ver lista abaixo) para UMA empresa,
--      `on conflict (company_id, nome, tipo) do nothing`. Chamável de novo
--      sem duplicar nada.
--   2. Gatilho `companies_seed_fin_categorias` (mesmo padrão de
--      `companies_seed_whatsapp_sessao` em `multitenant-migration.sql`):
--      toda empresa NOVA já nasce com a base completa, sem nenhum código de
--      aplicação envolvido — nem o cadastro do super-admin, nem o primeiro
--      acesso do dono da empresa precisam "lembrar" de semear nada.
--   3. Backfill: roda a mesma semeadura pra TODA empresa que já existe hoje.
--      Como é `on conflict ... do nothing` por `(company_id, nome, tipo)`,
--      uma empresa que já tiver alguma dessas categorias (criada na mão, com
--      o mesmo nome) não é duplicada — só as que faltam são adicionadas. Uma
--      empresa que apagou de propósito uma categoria padrão não a recupera
--      depois desta rodada única (o gatilho só semeia empresa NOVA a partir
--      daqui em diante).
--
-- A opção "+ Nova categoria" continua funcionando exatamente como antes
-- (`criarCategoria` em `src/app/admin/financeiro/actions.ts`) — isto só
-- garante que a lista nunca começa vazia.
-- ============================================================================

create or replace function public.seed_fin_categorias_empresa(p_company_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.fin_categorias (company_id, nome, tipo, cor, emoji) values
    -- Despesa — cor cicla de 7 em 7 (ver `financeiro-categorias.sql`: o
    -- emoji + nome já identificam a categoria sozinhos, a cor não precisa
    -- ser exclusiva por categoria).
    (p_company_id, 'Aluguel', 'despesa', '#3987e5', '🏠'),
    (p_company_id, 'Água', 'despesa', '#d95926', '💧'),
    (p_company_id, 'Energia', 'despesa', '#199e70', '⚡'),
    (p_company_id, 'Internet & Telefone', 'despesa', '#c98500', '📶'),
    (p_company_id, 'Alimentação', 'despesa', '#d55181', '🍽️'),
    (p_company_id, 'Combustível & Transporte', 'despesa', '#008300', '⛽'),
    (p_company_id, 'Salários & Pró-labore', 'despesa', '#9085e9', '💼'),
    (p_company_id, 'Freelancers & Terceirizados', 'despesa', '#3987e5', '🎬'),
    (p_company_id, 'Equipamentos & Manutenção', 'despesa', '#d95926', '🎥'),
    (p_company_id, 'Software & Assinaturas', 'despesa', '#199e70', '💻'),
    (p_company_id, 'Tráfego Pago (Ads)', 'despesa', '#c98500', '📈'),
    (p_company_id, 'Marketing & Publicidade', 'despesa', '#d55181', '📣'),
    (p_company_id, 'Impostos & Taxas', 'despesa', '#008300', '🧾'),
    (p_company_id, 'Contabilidade & Jurídico', 'despesa', '#9085e9', '⚖️'),
    (p_company_id, 'Saúde', 'despesa', '#3987e5', '🏥'),
    (p_company_id, 'Lazer', 'despesa', '#d95926', '🎉'),
    (p_company_id, 'Educação', 'despesa', '#199e70', '📚'),
    (p_company_id, 'Vestuário', 'despesa', '#c98500', '👕'),
    (p_company_id, 'Presentes & Doações', 'despesa', '#d55181', '🎁'),
    (p_company_id, 'Outras Despesas', 'despesa', '#008300', '🗂️'),
    -- Receita — sem cor própria (fica no verde padrão de receita da UI)
    (p_company_id, 'Serviços Prestados', 'receita', null, '💰'),
    (p_company_id, 'Consultoria', 'receita', null, '🎯'),
    (p_company_id, 'Salário', 'receita', null, '💵'),
    (p_company_id, 'Outras Receitas', 'receita', null, '➕')
  on conflict (company_id, nome, tipo) do nothing;
$$;

-- Garante que toda empresa NOVA já nasce com a base completa de categorias
-- (mesmo padrão de `seed_whatsapp_sessao_nova_empresa`).
create or replace function public.seed_fin_categorias_nova_empresa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_fin_categorias_empresa(new.id);
  return new;
end;
$$;

drop trigger if exists companies_seed_fin_categorias on public.companies;
create trigger companies_seed_fin_categorias
  after insert on public.companies
  for each row execute function public.seed_fin_categorias_nova_empresa();

-- `seed_fin_categorias_empresa` recebe `company_id` como parâmetro direto e
-- roda como SECURITY DEFINER (bypassa RLS) — sem o revoke abaixo, qualquer
-- usuário autenticado (de QUALQUER empresa) poderia chamar
-- `/rest/v1/rpc/seed_fin_categorias_empresa` com o `company_id` de outra
-- empresa e inserir categorias lá. Revogar de anon/authenticated não quebra
-- o gatilho acima: a checagem de EXECUTE não se aplica a chamadas internas
-- feitas pelo disparo automático do trigger (só quem CRIA o gatilho precisa
-- ter EXECUTE na função; quem dispara o INSERT que aciona o gatilho, não).
-- Confirmado via `get_advisors` (segurança) depois de aplicado: os dois
-- avisos "SECURITY DEFINER exposto" que essas duas funções geravam
-- desaparecem, sem nenhum efeito colateral no cadastro de empresa novo.
revoke execute on function public.seed_fin_categorias_empresa(uuid) from public;
revoke execute on function public.seed_fin_categorias_empresa(uuid) from anon;
revoke execute on function public.seed_fin_categorias_empresa(uuid) from authenticated;

revoke execute on function public.seed_fin_categorias_nova_empresa() from public;
revoke execute on function public.seed_fin_categorias_nova_empresa() from anon;
revoke execute on function public.seed_fin_categorias_nova_empresa() from authenticated;

-- Backfill — toda empresa que já existe hoje (inclusive quem já usa o
-- sistema) recebe agora a base completa; categorias com o mesmo nome+tipo
-- que a empresa já tenha são preservadas, nunca duplicadas.
do $$
declare
  r record;
begin
  for r in select id from public.companies loop
    perform public.seed_fin_categorias_empresa(r.id);
  end loop;
end;
$$;
