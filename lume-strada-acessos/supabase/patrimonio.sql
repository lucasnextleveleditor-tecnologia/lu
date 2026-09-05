-- ============================================================================
-- Lume Strada Filmes — Evolução do Inventário & Patrimônio (inteligência
-- financeira: valor pago, valor atual, depreciação).
-- ============================================================================
-- Rode isto no seu projeto Supabase JÁ EXISTENTE (que já tem `itens_inventario`
-- criado por `schema.sql`, com a coluna antiga `valor_estimado`). Idempotente
-- — seguro rodar de novo.
--
-- Se você está criando um projeto NOVO do zero, não precisa rodar este
-- arquivo: `schema.sql` já foi atualizado nesta entrega pra nascer
-- diretamente com `valor_pago`/`valor_atual`.
--
-- Escopo (mesma decisão de sempre): sem `company_id`/multi-tenant ainda —
-- os totais são calculados pro sistema inteiro, não por empresa.
-- ============================================================================

alter table public.itens_inventario add column if not exists valor_pago numeric(12, 2);
alter table public.itens_inventario add column if not exists valor_atual numeric(12, 2);

-- Migra os dados da coluna antiga (se ela ainda existir) e remove — `valor_estimado`
-- vira `valor_pago` (era, na prática, "quanto foi investido na aquisição").
-- `valor_atual` nasce vazio; edite os itens existentes pra preencher.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'itens_inventario' and column_name = 'valor_estimado'
  ) then
    update public.itens_inventario set valor_pago = valor_estimado where valor_pago is null;
    alter table public.itens_inventario drop column valor_estimado;
  end if;
end $$;
