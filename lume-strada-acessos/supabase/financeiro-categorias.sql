-- ============================================================================
-- Agência Hub — Financeiro: categorias padrão (emoji + cor)
-- ============================================================================
-- ATENÇÃO: este arquivo semeava a lista padrão UMA VEZ, globalmente, antes
-- da migração multi-tenant (`multitenant-migration.sql`). Depois dela,
-- `fin_categorias` passou a ter `company_id`, e este insert sozinho não
-- cobre empresa nenhuma nova. A semeadura por empresa (gatilho + backfill +
-- lista atualizada, com Vestuário e Presentes & Doações a mais) está em
-- `financeiro-categorias-por-empresa.sql` — é esse arquivo que roda hoje,
-- este aqui fica só como histórico de como a lista original nasceu.
--
-- Rode DEPOIS de `financeiro.sql` (e de preferência depois de
-- `correcoes-auditoria.sql`, só pra manter a ordem de sempre — não há
-- dependência real entre os dois). Idempotente: seguro rodar de novo.
--
-- O que faz:
--   1. Adiciona a coluna `emoji` em `fin_categorias` (não existia).
--   2. Trava `(nome, tipo)` como único, pra "+ Nova" nunca duplicar sem
--      querer uma categoria que já veio no pacote padrão.
--   3. Semeia ~22 categorias comuns de agência + pessoa física (água,
--      energia, aluguel, alimentação, combustível, tráfego pago...), cada
--      uma com emoji e — só as de despesa — uma cor da paleta categórica
--      já validada pela skill de dataviz (mesmos 7 hex do preview em
--      `financeiro-preview-mock.ts`, ver `PALETA_CATEGORIAS` em
--      `src/lib/utils/financeiro.ts`).
--
-- Sobre a cor se repetir a cada 7 categorias: é esperado, não é bug. A cor
-- aqui NUNCA é a única portadora de identidade da categoria — o emoji + o
-- nome já bastam sozinhos. É uma lista de etiquetas (como tags do Notion),
-- não a legenda de um gráfico onde cada série precisaria de uma cor
-- exclusiva — por isso não faz sentido inventar mais de 7 hex só pra evitar
-- repetição (a skill de dataviz É clara: nunca gerar uma cor nova fora do
-- conjunto validado). Receita não leva cor própria — fica sempre no verde de
-- "entrada de dinheiro" que a UI já usa (ver `CategoriasCard.tsx`).
-- ============================================================================

alter table public.fin_categorias add column if not exists emoji text;

alter table public.fin_categorias drop constraint if exists fin_categorias_nome_tipo_key;
alter table public.fin_categorias add constraint fin_categorias_nome_tipo_key unique (nome, tipo);

insert into public.fin_categorias (nome, tipo, cor, emoji) values
  -- Despesa — cor cicla de 7 em 7 (ver comentário acima)
  ('Aluguel', 'despesa', '#3987e5', '🏠'),
  ('Água', 'despesa', '#d95926', '💧'),
  ('Energia', 'despesa', '#199e70', '⚡'),
  ('Internet & Telefone', 'despesa', '#c98500', '📶'),
  ('Alimentação', 'despesa', '#d55181', '🍽️'),
  ('Combustível & Transporte', 'despesa', '#008300', '⛽'),
  ('Salários & Pró-labore', 'despesa', '#9085e9', '💼'),
  ('Freelancers & Terceirizados', 'despesa', '#3987e5', '🎬'),
  ('Equipamentos & Manutenção', 'despesa', '#d95926', '🎥'),
  ('Software & Assinaturas', 'despesa', '#199e70', '💻'),
  ('Tráfego Pago (Ads)', 'despesa', '#c98500', '📈'),
  ('Marketing & Publicidade', 'despesa', '#d55181', '📣'),
  ('Impostos & Taxas', 'despesa', '#008300', '🧾'),
  ('Contabilidade & Jurídico', 'despesa', '#9085e9', '⚖️'),
  ('Saúde', 'despesa', '#3987e5', '🏥'),
  ('Lazer', 'despesa', '#d95926', '🎉'),
  ('Educação', 'despesa', '#199e70', '📚'),
  ('Outras Despesas', 'despesa', '#c98500', '🗂️'),
  -- Receita — sem cor própria (fica no verde padrão de receita da UI)
  ('Serviços Prestados', 'receita', null, '💰'),
  ('Consultoria', 'receita', null, '🎯'),
  ('Salário', 'receita', null, '💵'),
  ('Outras Receitas', 'receita', null, '➕')
on conflict (nome, tipo) do nothing;
