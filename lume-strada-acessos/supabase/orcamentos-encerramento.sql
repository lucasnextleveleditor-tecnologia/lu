-- Mensagem de encerramento/agradecimento da proposta — última peça do
-- conteúdo institucional (ver `supabase/orcamentos-pdf-institucional.sql`),
-- exibida no fim da proposta (PDF e página pública, depois do rodapé de
-- marca) — ex: "Foi um prazer te atender, esperamos ter sucesso juntos!".
-- Mesma convenção de coluna `orc_*` em `companies`, POR EMPRESA (não por
-- orçamento) — configurada uma vez, aplicada em todo orçamento enviado.

alter table public.companies add column if not exists orc_texto_encerramento text;
comment on column public.companies.orc_texto_encerramento is 'Mensagem de encerramento/agradecimento exibida no fim da proposta (capa final do PDF e página pública), depois do rodapé de marca (orc_rodape_path) — ex: "Foi um prazer te atender, esperamos ter sucesso juntos!". Padrão pra todos os orçamentos da empresa. Null = seção omitida.';
