"use client";

import { useRef, useState, useTransition } from "react";
import { uploadLogoClienteOrcamento, removerLogoClienteOrcamento } from "@/app/admin/orcamentos/portfolio-actions";
import { IconUpload, IconTrash } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LogoClienteUploadFieldProps {
  slot: number;
  url: string | null;
  onChange: (url: string | null) => void;
}

/**
 * Um dos 6 slots de "Logos de Clientes" (Quem Somos) — mesmo padrão
 * "salva sozinho" de `MarcaOrcamentoUploadField`, mas indexado por posição
 * (`orc_clientes_logos_paths[slot]`, ver `uploadLogoClienteOrcamento`) em
 * vez de um campo fixo — vários slots pequenos lado a lado numa grade, não
 * um campo largo sozinho.
 */
export function LogoClienteUploadField({ slot, url, onChange }: LogoClienteUploadFieldProps) {
  const { dict } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadLogoClienteOrcamento(slot, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange(result.url);
    });
  }

  function handleRemover() {
    setError(null);
    startTransition(async () => {
      const result = await removerLogoClienteOrcamento(slot);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange(null);
    });
  }

  return (
    <div className="group relative flex h-16 items-center justify-center overflow-hidden rounded-lg border border-dashed border-base-700 bg-base-950/40">
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-contain p-1.5" />
          <button
            type="button"
            onClick={handleRemover}
            disabled={pending}
            className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
            aria-label={dict.common.remover}
          >
            <IconTrash className="h-3 w-3" />
          </button>
        </>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-muted hover:text-ink-secondary">
          <IconUpload className="h-4 w-4" />
          <span className="text-[10px]">{dict.orcamentos.logoClienteSlotLabel.replace("{n}", String(slot + 1))}</span>
        </button>
      )}
      {error && <p className="absolute -bottom-4 left-0 text-[10px] text-danger">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
