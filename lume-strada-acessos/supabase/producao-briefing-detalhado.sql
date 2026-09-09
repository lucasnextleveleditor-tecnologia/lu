-- Amplia o briefing/entregáveis da tarefa de Produção (ver `TarefaModal.tsx` /
-- `TarefaDetalheModal.tsx`), a pedido do usuário, mantendo tudo que já
-- existia (título, cliente, tipo de serviço, responsável, datas, prioridade,
-- briefing em rich text, subtarefas, entregas & aprovação) e ACRESCENTANDO:
--
--   objetivo_material     — pra que serve o material (ex: campanha paga,
--                           conteúdo orgânico, cobertura de evento, editorial,
--                           portfólio...). Texto livre de propósito: a base
--                           atende agências/filmmakers/videomakers/social
--                           medias/storymakers/fotógrafos, então travar isso
--                           num enum de "tipos de vídeo" excluiria quem
--                           entrega foto, arte estática, texto etc.
--   referencias_estilo    — 1+ links de referência de estilo/mood (Reels,
--                           TikTok, Pinterest, portfólio de terceiros...).
--                           Texto livre (um link por linha na UI) em vez de
--                           tabela separada: é sempre um punhado de URLs de
--                           consulta rápida, não precisa de CRUD próprio.
--   formatos_exportacao   — specs de exportação esperadas (proporção,
--                           duração, com/sem legenda, resolução, formato de
--                           arquivo etc.), também texto livre por variar
--                           demais entre foto/vídeo/design/texto.
--   data_entrega_v1       — data do primeiro corte/rascunho, SEPARADA da
--                           data_entrega já existente (que passa a ser lida
--                           na UI como "Data de Entrega Final" — nenhuma
--                           mudança de schema nela, só o rótulo). Mantida
--                           como campo simples de acompanhamento manual: não
--                           participa de `isTarefaAtrasada` nem aparece nos
--                           demais módulos (Kanban/Lista/Calendário/Agenda/
--                           Dashboard/Relatórios) — escopo desta leva é só o
--                           formulário da tarefa, sem alterar os outros
--                           consumidores de `prod_tarefas`.
alter table public.prod_tarefas
  add column if not exists objetivo_material text,
  add column if not exists referencias_estilo text,
  add column if not exists formatos_exportacao text,
  add column if not exists data_entrega_v1 date;

comment on column public.prod_tarefas.objetivo_material is 'Objetivo do material (ex: conversão em anúncio, engajamento orgânico, cobertura de evento) — texto livre, profissão-agnóstico.';
comment on column public.prod_tarefas.referencias_estilo is 'Links de referência de estilo/mood (um por linha) — texto livre.';
comment on column public.prod_tarefas.formatos_exportacao is 'Formatos/specs de exportação esperados (ex: proporção, duração, com/sem legenda) — texto livre.';
comment on column public.prod_tarefas.data_entrega_v1 is 'Data de entrega do primeiro corte/rascunho (V1) — separada de data_entrega, que é a entrega final.';
