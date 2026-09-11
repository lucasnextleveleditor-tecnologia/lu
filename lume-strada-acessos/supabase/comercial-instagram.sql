-- ============================================================================
-- O @ do Instagram no lead
-- ============================================================================
-- Rode DEPOIS de `comercial.sql`. Idempotente.
--
-- O campo faltava, e a falta aparecia no dado: leads cadastrados como
-- "Loja X | @loja" — o nome da empresa e o perfil espremidos na mesma coluna,
-- porque não havia outro lugar para pôr o @. Isso quebra tudo que depende do
-- nome ser só o nome: a busca, o CSV, o título do card e o `full_name` da
-- conta criada quando o lead vira cliente.
--
-- Guardado como o handle PURO ("lojacriativa"): sem arroba, sem URL, em
-- minúsculas. O @ é decoração da interface e o link se monta na hora
-- (`urlDoInstagram`, em `src/lib/utils/comercial.ts`); guardar "@loja" ou
-- "https://instagram.com/loja/?hl=pt" obrigaria a limpar a string em toda
-- tela que fosse usá-la, e uma delas esqueceria.
--
-- Sem CHECK de formato aqui: quem valida é `normalizarInstagram` na
-- aplicação, que também ACEITA as quatro formas que a pessoa realmente cola
-- (com @, sem @, instagram.com/loja e a URL inteira) e devolve o handle. Um
-- CHECK no banco rejeitaria a colagem em vez de consertá-la, e a regra de
-- formato é do Instagram, não do Postgres — se eles mudarem, muda um arquivo.

alter table public.crm_leads
  add column if not exists instagram text;

comment on column public.crm_leads.instagram is
  'Handle do Instagram SEM arroba e em minusculas (ex: lojacriativa). O @ e o link sao montados na UI (urlDoInstagram).';
