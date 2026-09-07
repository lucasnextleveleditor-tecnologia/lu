"use client";

import { useRef, useState, useTransition } from "react";
import { uploadBrandingAsset, removerBrandingAsset, type CampoUpload } from "@/app/admin/aparencia/actions";
import { Button } from "@/components/ui/Button";
import { IconUpload } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface UploadFieldProps {
  label: string;
  hint?: string;
  campo: CampoUpload;
  valorAtual: string | null;
  onChange: (url: string | null) => void;
  /** "square" pra logo/favicon (preview quadrado), "wide" pro fundo do login (preview retangular). */
  formato?: "square" | "wide";
}

export function UploadField({ label, hint, campo, valorAtual, onChange, formato = "square" }: UploadFieldProps) {
  const { dict } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois de trocar/remover
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadBrandingAsset(campo, formData);
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
      const result = await removerBrandingAsset(campo);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange(null);
    });
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className={
            formato === "square"
              ? "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-600 bg-base-950"
              : "flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-600 bg-base-950"
          }
        >
          {valorAtual ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview de um arquivo recém-enviado ao bucket do próprio projeto Supabase do cliente
            <img src={valorAtual} alt={label} className="h-full w-full object-contain" />
          ) : (
            <IconUpload className="h-5 w-5 text-ink-muted" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => inputRef.current?.click()} disabled={pending}>
              {pending ? dict.aparencia.enviando : valorAtual ? dict.aparencia.trocar : dict.aparencia.enviarImagem}
            </Button>
            {valorAtual && (
              <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={handleRemover} disabled={pending}>
                {dict.common.remover}
              </Button>
            )}
          </div>
          {hint && <p className="text-xs text-ink-muted">{hint}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
