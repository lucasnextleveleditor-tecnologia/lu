"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMarcaOrcamento, removerMarcaOrcamento, type CampoMarcaOrcamento } from "@/app/admin/orcamentos/portfolio-actions";
import { Button } from "@/components/ui/Button";
import { IconUpload } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface MarcaOrcamentoUploadFieldProps {
  label: string;
  hint?: string;
  /** Dimensões/formato/tamanho recomendados (ex: "Quadrada, mínimo 400×400px... até 3MB") — mostrado numa linha própria, abaixo do hint, pra quem for exportar a imagem certa já saber o que preparar. */
  specs?: string;
  campo: CampoMarcaOrcamento;
  valorAtual: string | null;
  onChange: (url: string | null) => void;
  /** "square" pro logo (preview quadrado), "wide" pro banner/rodapé (preview retangular). */
  formato?: "square" | "wide";
}

/**
 * Mesmo padrão de `UploadField.tsx` (Aparência) — upload "salva sozinho"
 * (sem depender de um botão "Salvar" separado), aqui apontado pras Server
 * Actions de marca do orçamento (`portfolio-actions.ts`), que escrevem em
 * `companies` em vez de `branding_config`.
 *
 * Layout em COLUNA (preview em cima, botões/hint embaixo, sempre 100% de
 * largura) de propósito, não lado a lado — este campo vive dentro do
 * construtor de orçamento (`MarcaApresentacaoCard.tsx`), numa coluna bem
 * mais estreita que a antiga tela cheia de Portfólio; um layout horizontal
 * com 3 campos lado a lado nessa largura sobrepunha texto/botões.
 */
export function MarcaOrcamentoUploadField({ label, hint, specs, campo, valorAtual, onChange, formato = "square" }: MarcaOrcamentoUploadFieldProps) {
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
      const result = await uploadMarcaOrcamento(campo, formData);
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
      const result = await removerMarcaOrcamento(campo);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange(null);
    });
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-base-800 bg-base-950/30 p-3">
      <div
        className={
          formato === "square"
            ? "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-600 bg-base-950"
            : "flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-600 bg-base-950"
        }
      >
        {valorAtual ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview de um arquivo recém-enviado ao bucket do próprio projeto Supabase do cliente
          <img src={valorAtual} alt={label} className="h-full w-full object-contain" />
        ) : (
          <IconUpload className="h-5 w-5 text-ink-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-ink-secondary">{label}</label>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => inputRef.current?.click()} disabled={pending}>
              {pending ? dict.aparencia.enviando : valorAtual ? dict.aparencia.trocar : dict.aparencia.enviarImagem}
            </Button>
            {valorAtual && (
              <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={handleRemover} disabled={pending}>
                {dict.common.remover}
              </Button>
            )}
          </div>
        </div>
        {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        {specs && <p className="mt-0.5 text-[11px] text-ink-muted/70">{specs}</p>}
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
