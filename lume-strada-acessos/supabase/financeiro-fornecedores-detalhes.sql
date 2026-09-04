-- ============================================================================
-- Agência Hub — Financeiro: Fornecedores (dados de contato opcionais)
-- ============================================================================
-- Rode DEPOIS de `financeiro-fornecedores.sql`. Idempotente: seguro rodar de
-- novo.
--
-- Pedido do dono da conta: o cadastro rápido de fornecedor (só nome, feito
-- direto de dentro de "Nova Transação") continua exatamente como está — sem
-- burocracia nenhuma. Mas quando um fornecedor "merece mais seriedade" (por
-- exemplo, virou uma empresa formal), ele quer poder abrir esse fornecedor
-- depois (na tela `/admin/financeiro/fornecedores`) e completar e-mail,
-- CNPJ, endereço, telefone e responsável — TODOS opcionais, só `nome`
-- continua obrigatório (já é `not null` desde `financeiro-fornecedores.sql`,
-- nenhuma mudança aí).
-- ============================================================================

alter table public.fin_fornecedores add column if not exists email text;
alter table public.fin_fornecedores add column if not exists cnpj text;
alter table public.fin_fornecedores add column if not exists endereco text;
alter table public.fin_fornecedores add column if not exists telefone text;
alter table public.fin_fornecedores add column if not exists responsavel text;
