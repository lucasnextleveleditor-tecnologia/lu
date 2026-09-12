-- Português de Portugal entra na lista de idiomas da empresa.
--
-- `companies.idioma_padrao` guarda com que língua o sistema ABRE para quem
-- ainda não escolheu nenhuma (ver `getDictionary`). O CHECK antigo listava os
-- três idiomas de então; com o quarto no código e não no banco, a tela de
-- Moeda & Idioma ofereceria "Português (PT)" e o salvar morreria com um erro
-- cru do Postgres — o pior tipo de bug, porque a interface promete algo que o
-- banco recusa.
--
-- O valor é `pt-PT`, na FORMA BCP-47 exata. A primeira versão desta migração
-- usou `pt_PT` com underscore, para não precisar de aspas nas chaves de
-- Record no TypeScript, e isso derrubou o app inteiro: este mesmo texto é
-- passado direto para `toLocaleDateString`/`toLocaleString` em dezenas de
-- telas, e o Node responde `RangeError: Incorrect locale information
-- provided` — página em branco, não número mal formatado. A conveniência de
-- sintaxe não vale uma classe inteira de erro em tempo de execução.
alter table public.companies drop constraint if exists companies_idioma_valido;

update public.companies set idioma_padrao = 'pt-PT' where idioma_padrao = 'pt_PT';

alter table public.companies
  add constraint companies_idioma_valido
  check (idioma_padrao = any (array['pt'::text, 'pt-PT'::text, 'en'::text, 'es'::text]));
