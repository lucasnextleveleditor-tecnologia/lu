-- PDF profissional de Orçamento (capa institucional + proposta) — campos
-- novos de banco pro conteúdo que aparece no PDF de texto real gerado por
-- `src/lib/pdf/OrcamentoPdfDocument.tsx` (ver `src/app/api/orcamentos/[id]/pdf/route.tsx`).
--
-- Contexto: o "Baixar PDF" de Orçamento era uma captura de tela da página
-- (`exportarElementoComoPDF`, `src/lib/utils/export.ts`) — funcional, mas
-- fraco pra uma proposta comercial (não é texto real, não pagina, sem
-- capa). Este arquivo só adiciona as colunas necessárias pro novo PDF
-- multi-página (capa institucional + página de proposta), seguindo a mesma
-- convenção de prefixo `orc_*` já usada pra `orc_logo_path`/`orc_banner_path`/
-- `orc_rodape_path` (ver `supabase/orcamentos-portfolio-e-marca.sql`).

-- ----------------------------------------------------------------------------
-- 1) Conteúdo institucional da EMPRESA (companies) — reutilizável em todo
-- orçamento, preenchido uma vez só na tela `/admin/orcamentos/portfolio`
-- (mesmo lugar de logo/banner/rodapé). Ambos `null` até o admin preencher —
-- seção correspondente simplesmente some da capa do PDF, nunca é obrigatório.
-- ----------------------------------------------------------------------------
alter table public.companies add column if not exists orc_texto_institucional text;
comment on column public.companies.orc_texto_institucional is 'Texto de apresentação/pitch da empresa (ex: "Muito prazer, somos a empresa X, fazemos Y...") — aparece na capa institucional do PDF de orçamento (ver OrcamentoPdfDocument.tsx). Null = seção omitida.';

alter table public.companies add column if not exists orc_clientes_atendidos text;
comment on column public.companies.orc_clientes_atendidos is 'Lista livre de empresas/clientes já atendidos, uma por linha (texto puro, sem formatação) — exibida como bullets na capa do PDF de orçamento. Null = seção omitida.';

-- ----------------------------------------------------------------------------
-- 2) Conteúdo de PROPOSTA do orçamento específico (orcamentos) — diferente
-- do institucional acima, esses textos mudam por cliente/projeto, então
-- vivem no próprio orçamento, não como texto único global da empresa.
-- ----------------------------------------------------------------------------
alter table public.orcamentos add column if not exists texto_proposta text;
comment on column public.orcamentos.texto_proposta is 'Texto da proposta de trabalho deste orçamento específico — aparece na página de proposta do PDF (ver OrcamentoPdfDocument.tsx). Null = seção omitida.';

alter table public.orcamentos add column if not exists objetivos text;
comment on column public.orcamentos.objetivos is 'Objetivos que serão alcançados com este projeto/orçamento — aparece na página de proposta do PDF. Null = seção omitida.';
