-- ============================================================================
-- Legenda da versão
-- ============================================================================
--
-- O texto que acompanha a peça quando ela chega no portal do cliente.
--
-- Fica na VERSÃO e não na tarefa, de propósito: a legenda muda a cada corte.
-- O V1 vai com um texto, o cliente pede ajuste, o V2 vai com outro — e o que
-- foi aprovado tem que ser o par PEÇA + LEGENDA daquela versão, não o texto
-- mais recente que alguém digitou depois. Numa coluna da tarefa, aprovar o V1
-- e reescrever a legenda no V2 mudaria retroativamente o que o cliente aprovou.
alter table public.prod_entrega_versoes
  add column if not exists legenda text;

comment on column public.prod_entrega_versoes.legenda is
  'Texto que acompanha a peca no portal do cliente. Por versao, porque a legenda muda a cada corte.';

-- ============================================================================
-- O preview dentro da plataforma — nada de novo no banco
-- ============================================================================
--
-- O cliente clicava no nome do arquivo e o navegador abria o Google Drive numa
-- aba nova. O momento mais importante do fluxo — ele decidir se aprova —
-- acontecia FORA do sistema, numa tela que não tem a legenda, não tem o botão
-- de aprovar e não tem a marca da agência.
--
-- Isso se resolveu sem coluna nova, e vale registrar por quê:
--
--   LINK: `PlayerDeMidia` (src/components/ui/PlayerDeMidia.tsx) já existia,
--   servindo ao portfólio de orçamentos e aos criativos de tráfego. Ele
--   conhece YouTube, Vimeo, Loom, Streamable, Instagram, TikTok, Google Drive,
--   Dropbox e link direto. O portal passou a usar o MESMO componente — ensinar
--   um serviço novo lá dentro passa a valer para o sistema inteiro de uma vez.
--
--   ARQUIVO: o bucket `producao` é privado e continua privado. O que mudou é
--   QUANDO a URL assinada é criada: antes, depois de um clique (e por isso
--   abria em outra aba); agora, junto com a listagem, para o vídeo poder tocar
--   já no primeiro render. Continua sendo link temporário de 1 hora, gerado
--   com Service Role depois de conferir que a versão é daquele cliente.
--
--   As URLs saem todas de uma vez (`createSignedUrls`, no plural): uma lista
--   de dez entregas viraria dez idas encadeadas ao Storage antes de a página
--   aparecer.
--
-- O tipo do preview vem de `tipo_mime`, com a extensão do nome como plano B —
-- alguns navegadores enviam arquivo sem MIME, e aí o nome é a única pista.
-- Vídeo toca, imagem aparece, PDF abre no leitor do próprio navegador. O que
-- não tem preview (um .aep, um .zip) vira botão de baixar, e não um quadro
-- vazio fingindo que carrega.
