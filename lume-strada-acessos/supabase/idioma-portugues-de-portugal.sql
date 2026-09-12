-- Português de Portugal entra na lista de idiomas da empresa.
--
-- `companies.idioma_padrao` guarda com que língua o sistema ABRE para quem
-- ainda não escolheu nenhuma (ver `getDictionary`). O CHECK antigo listava os
-- três idiomas de então; com o quarto no código e não no banco, a tela de
-- Moeda & Idioma ofereceria "Português (PT)" e o salvar morreria com um erro
-- cru do Postgres — o pior tipo de bug, porque a interface promete algo que o
-- banco recusa.
--
-- O valor é `pt_PT` com sublinhado, e não `pt-PT`: é o mesmo texto que o
-- cookie de idioma guarda e que vira chave de Record no TypeScript (ver
-- `lib/i18n/locales.ts`). A forma BCP-47 de verdade só existe na hora de
-- formatar data e dinheiro.
alter table public.companies drop constraint if exists companies_idioma_valido;

alter table public.companies
  add constraint companies_idioma_valido
  check (idioma_padrao = any (array['pt'::text, 'pt_PT'::text, 'en'::text, 'es'::text]));
