"use client";

import { useRef, useState, useTransition } from "react";
import { confirmarCriativo, criarUploadAssinadoCriativo, removerCriativo } from "@/app/admin/trafego/infoprodutos-actions";
import { CRIATIVO_TAMANHO_MAX_BYTES } from "@/lib/utils/infoprodutos";
import { createClient } from "@/lib/supabase/client";
import { IconUpload, IconTrash } from "@/components/ui/icons";

const BUCKET_INFOPRODUTOS = "infoprodutos";

interface CriativoUploaderProps {
  anuncioId: string;
  criativoUrl: string | null;
  criativoTipo: "imagem" | "video" | null;
}

/** Mesmo padrão de upload de `EntregasSection` (Produção): input escondido disparado por um botão, sem preview intermediário — aqui a diferença é que TEM preview, porque o criativo é justamente pra visualização rápida no card. */
export function CriativoUploader({ anuncioId, criativoUrl, criativoTipo }: CriativoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (file.size > CRIATIVO_TAMANHO_MAX_BYTES) {
      setError("Arquivo muito grande (máximo 80MB).");
      return;
    }

    startTransition(async () => {
      // 1/3 — pede a signed upload URL (também valida o tipo do arquivo).
      const assinado = await criarUploadAssinadoCriativo(anuncioId, file.name, file.type);
      if (!assinado.ok) {
        setError(assinado.error);
        return;
      }

      // 2/3 — sobe direto pro Storage a partir do navegador (ver comentário
      // em `criarUploadAssinadoCriativo` — contorna o limite de corpo da Vercel).
      const supabase = createClient();
      const { error: erroUpload } = await supabase.storage
        .from(BUCKET_INFOPRODUTOS)
        .uploadToSignedUrl(assinado.path, assinado.token, file, { contentType: file.type || undefined });
      if (erroUpload) {
        setError(erroUpload.message);
        return;
      }

      // 3/3 — confirma: grava o path/tipo no anúncio.
      const result = await confirmarCriativo(anuncioId, { path: assinado.path, tipo: assinado.tipo });
      if (!result.ok) setError(result.error);
    });
  }

  function handleRemover() {
    setError(null);
    startTransition(async () => {
      const result = await removerCriativo(anuncioId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleArquivoSelecionado} />

      {criativoUrl ? (
        <div className="group relative overflow-hidden rounded-xl border border-base-700 bg-base-950">
          {criativoTipo === "video" ? (
            <video src={criativoUrl} controls className="aspect-video w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={criativoUrl} alt="Criativo do anúncio" className="aspect-video w-full object-cover" />
          )}
          <button
            onClick={handleRemover}
            disabled={pending}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
            aria-label="Remover criativo"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-base-700 text-ink-muted transition hover:border-ink-muted hover:text-ink-secondary"
        >
          <IconUpload className="h-5 w-5" />
          <span className="text-xs">{pending ? "Enviando..." : "Enviar Print ou MP4"}</span>
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
