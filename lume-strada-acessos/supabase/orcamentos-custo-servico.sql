-- Custo estimado por serviço do catálogo — base pra Calculadora de Margem
-- (`/admin/orcamentos/calculadora`). Opcional e independente do preço de
-- venda (`valor_padrao`): sem custo cadastrado, a calculadora simplesmente
-- deixa o campo de custo em branco/zero pro usuário preencher na hora.

alter table public.orc_servicos add column if not exists custo_padrao numeric(12, 2) not null default 0;
comment on column public.orc_servicos.custo_padrao is 'Custo estimado (mão de obra, equipamento, terceirizados...) desse serviço — usado só pra sugerir a margem na Calculadora de Margem, nunca aparece pro cliente nem entra no PDF/proposta. 0 = custo não cadastrado ainda.';
