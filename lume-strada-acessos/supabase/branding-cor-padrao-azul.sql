-- ============================================================================
-- Azul como cor de marca padrão
-- ============================================================================
--
-- Roda DEPOIS de `branding-por-empresa.sql`.
--
-- Os defaults de `primary_color`/`accent_color` eram o âmbar `#d4a24e`/
-- `#e8bd72` — herança da paleta antiga, de quando `branding_config` era
-- global. Como o app renderiza o azul `#4F7CFF`/`#22D3EE` quando nenhuma cor
-- está aplicada (ver `globals.css`) e esse é o preset "Azul" do card de
-- Aparência, o âmbar guardado no banco era um terceiro valor que ninguém via
-- — mas que ficaria marcado como "selecionado" pra quem nunca escolheu nada.
--
-- Aqui os três passam a concordar. `DEFAULT_BRANDING`
-- (`src/lib/branding/constants.ts`) mudou junto, no mesmo commit.
-- ============================================================================

begin;

alter table public.branding_config alter column primary_color set default '#4F7CFF';
alter table public.branding_config alter column accent_color  set default '#22D3EE';

-- Empresas que ainda estão no âmbar antigo nunca escolheram cor — é o estado
-- "recém-criada", então passam pro padrão novo. Quem já customizou (qualquer
-- valor diferente do âmbar antigo) NÃO é tocado.
--
-- Se você preferir deixar as empresas atuais como estão e mudar só as
-- próximas, apague este UPDATE e rode só os dois ALTER acima.
update public.branding_config
   set primary_color = '#4F7CFF',
       accent_color  = '#22D3EE'
 where lower(primary_color) = '#d4a24e'
   and lower(accent_color)  = '#e8bd72';

commit;
