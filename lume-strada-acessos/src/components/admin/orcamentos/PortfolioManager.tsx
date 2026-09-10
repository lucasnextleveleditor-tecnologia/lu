"use client";

import { useRef, useState, useTransition } from "react";
import type { PortfolioItemComUrl } from "@/lib/types/orcamentos";
import { criarUploadAssinadoPortfolio, confirmarPortfolioItem, removerPortfolioItem } from "@/app/admin/orcamentos/portfolio-actions";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconUpload, IconTrash, IconPencil, IconImage, IconFilm, IconExternalLink } from "@/components/ui/icons";
import { PlayerDeMidia } from "@/components/ui/PlayerDeMidia";
import { Input } from "@/components/ui/Input";
import { resolverMidiaDeLink, ROTULO_ORIGEM, SERVICOS_ACEITOS } from "@/lib/utils/midia-link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PortfolioItemModal } from "@/components/admin/orcamentos/PortfolioItemModal";

const BUCKET_ORCAMENTOS_MIDIA = "orcamentos-midia";

interface PortfolioManagerProps {
  itens: PortfolioItemComUrl[];
}

/** Nome do arquivo sem extensão, usado como título inicial do item — o usuário pode renomear depois clicando em "Editar", mesmo espírito de não travar o upload atrás de um formulário antes de existir algo pra editar. */
function tituloInicialDoArquivo(nomeArquivo: string): string {
  const semExtensao = nomeArquivo.includes(".") ? nomeArquivo.slice(0, nomeArquivo.lastIndexOf(".")) : nomeArquivo;
  return semExtensao || nomeArquivo;
}

export function PortfolioManager({ itens }: PortfolioManagerProps) {
  const { dict } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<PortfolioItemComUrl | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [linkAberto, setLinkAberto] = useState(false);
  const [link, setLink] = useState("");
  const [tituloLink, setTituloLink] = useState("");

  function handleAdicionarLink() {
    setError(null);
    const midia = resolverMidiaDeLink(link);
    if (!midia) {
      setError(`Link não reconhecido. Aceitamos ${SERVICOS_ACEITOS}.`);
      return;
    }
    startTransition(async () => {
      const result = await confirmarPortfolioItem({
        titulo: tituloLink.trim() || ROTULO_ORIGEM[midia.origem],
        linkUrl: link.trim(),
        // Imagem só quando o link é mesmo uma imagem; todo o resto é vídeo,
        // que é o caso de uso inteiro deste campo.
        tipo: midia.tipo === "imagem" ? "imagem" : "video",
        categoriaProfissao: null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLink("");
      setTituloLink("");
      setLinkAberto(false);
    });
  }

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    startTransition(async () => {
      // 1/3 — pede a signed upload URL (também valida o tipo do arquivo).
      const assinado = await criarUploadAssinadoPortfolio(file.name, file.type);
      if (!assinado.ok) {
        setError(assinado.error);
        return;
      }

      // 2/3 — sobe direto pro Storage a partir do navegador.
      const supabase = createClient();
      const { error: erroUpload } = await supabase.storage
        .from(BUCKET_ORCAMENTOS_MIDIA)
        .uploadToSignedUrl(assinado.path, assinado.token, file, { contentType: file.type || undefined });
      if (erroUpload) {
        setError(erroUpload.message);
        return;
      }

      // 3/3 — cria o item de portfólio com um título derivado do nome do arquivo.
      const result = await confirmarPortfolioItem({
        titulo: tituloInicialDoArquivo(file.name),
        path: assinado.path,
        tipo: assinado.tipo,
        categoriaProfissao: null,
      });
      if (!result.ok) setError(result.error);
    });
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerPortfolioItem(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">{dict.orcamentos.portfolioTitulo}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{dict.orcamentos.portfolioSubtitulo}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {/* Vídeo por LINK vem primeiro de propósito: é o caminho que a
              gente quer que a pessoa use. Vídeo hospedado aqui ocupa
              armazenamento e, pior, gasta cota de tráfego a cada vez que um
              cliente assiste — todo mês, para sempre. */}
          <Button variant="ghost" onClick={() => setLinkAberto((v) => !v)} disabled={pending} className="gap-1.5">
            <IconExternalLink className="h-4 w-4" />
            {dict.orcamentos.portfolioLinkBtn}
          </Button>
          <Button onClick={() => inputRef.current?.click()} disabled={pending} className="gap-1.5">
            <IconUpload className="h-4 w-4" />
            {pending ? dict.orcamentos.portfolioEnviando : dict.orcamentos.portfolioAdicionarBtn}
          </Button>
        </div>
        <input ref={inputRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleArquivoSelecionado} />
      </div>

      {linkAberto && (
        <Card className="space-y-2">
          <p className="text-xs font-medium text-ink-secondary">{dict.orcamentos.portfolioLinkTitulo}</p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="min-w-[16rem] flex-[2] text-xs"
            />
            <Input
              value={tituloLink}
              onChange={(e) => setTituloLink(e.target.value)}
              placeholder={dict.orcamentos.portfolioLinkTituloPlaceholder}
              className="min-w-[10rem] flex-1 text-xs"
            />
            <Button onClick={handleAdicionarLink} disabled={pending || !link.trim()}>
              {pending ? dict.orcamentos.portfolioEnviando : dict.common.adicionar}
            </Button>
          </div>
          <p className="text-[11px] leading-snug text-ink-muted">{dict.orcamentos.portfolioLinkHint}</p>
        </Card>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {itens.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-14 text-center">
          <IconImage className="h-6 w-6 text-ink-muted" />
          <p className="text-sm text-ink-muted">{dict.orcamentos.portfolioVazioTitulo}</p>
          <p className="max-w-sm text-xs text-ink-muted">{dict.orcamentos.portfolioVazioDescricao}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {itens.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              <div className="relative aspect-video w-full bg-base-950">
                {item.ehLink ? (
                  <PlayerDeMidia url={item.url} mostrarLink={false} className="h-full" />
                ) : item.tipo_midia === "video" ? (
                  <video src={item.url} controls className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.titulo} className="h-full w-full object-cover" />
                )}
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white">
                  {item.tipo_midia === "video" ? <IconFilm className="h-3.5 w-3.5" /> : <IconImage className="h-3.5 w-3.5" />}
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-ink-primary" title={item.titulo}>
                  {item.titulo}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {item.categoria_profissao ? dict.orcamentos.categoriasProfissao[item.categoria_profissao as keyof typeof dict.orcamentos.categoriasProfissao] ?? item.categoria_profissao : dict.orcamentos.portfolioCategoriaNenhuma}
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-base-800 pt-2.5">
                  {confirmandoExclusao === item.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleExcluir(item.id)} disabled={pending} className="text-xs font-medium text-danger hover:underline">
                        {dict.common.confirmarExclusao}
                      </button>
                      <button onClick={() => setConfirmandoExclusao(null)} disabled={pending} className="text-xs text-ink-muted">
                        {dict.common.nao}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => setEditando(item)} className="flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-ink-primary">
                        <IconPencil className="h-3.5 w-3.5" />
                        {dict.common.editar}
                      </button>
                      <button onClick={() => setConfirmandoExclusao(item.id)} className="flex items-center gap-1 text-xs font-medium text-danger hover:underline">
                        <IconTrash className="h-3.5 w-3.5" />
                        {dict.common.excluir}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editando && <PortfolioItemModal item={editando} onClose={() => setEditando(null)} />}
    </div>
  );
}
