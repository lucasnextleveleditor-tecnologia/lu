"use client";

import { useRef, useState, useTransition } from "react";
import { uploadCapaOrcamento, removerArquivoCapaOrcamento } from "@/app/admin/orcamentos/portfolio-actions";
import { Button } from "@/components/ui/Button";
import { IconUpload } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CapaOrcamentoUploadFieldProps {
  path: string | null;
  url: string | null;
  onChange: (value: { path: string | null; url: string | null }) => void;
}

/**
 * Upload da imagem de fundo (tela inteira) da CAPA desta proposta —
 * diferente de `MarcaOrcamentoUploadField` (logo/banner/rodapé, fixos da
 * agência em `companies`): aqui o path/url vivem só no estado do
 * `OrcamentoBuilder` (não em `companies`) e só são gravados de fato no
 * orçamento quando o formulário inteiro é salvo. Mesmo padrão "salva
 * sozinho ao trocar o arquivo" de `MarcaOrcamentoUploadField`, mas apagando
 * o arquivo antigo do bucket a cada troca/remoção (`removerArquivoCapaOrcamento`)
 * pra não acumular imagem órfã a cada re-upload durante a edição.
 */
export function CapaOrcamentoUploadField({ path, url, onChange }: CapaOrcamentoUploadFieldProps) {
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
    const pathAntigo = path;

    startTransition(async () => {
      const result = await uploadCapaOrcamento(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange({ path: result.path, url: result.url });
      if (pathAntigo) removerArquivoCapaOrcamento(pathAntigo);
    });
  }

  function handleRemover() {
    setError(null);
    const pathAtual = path;
    onChange({ path: null, url: null });
    if (pathAtual) startTransition(() => { void removerArquivoCapaOrcamento(pathAtual); });
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-base-800 bg-base-950/30 p-3">
      <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-600 bg-base-950">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview de um arquivo recém-enviado ao bucket do próprio projeto Supabase do cliente
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <IconUpload className="h-5 w-5 text-ink-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-ink-secondary">{dict.orcamentos.capaImagemLabel}</label>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => inputRef.current?.click()} disabled={pending}>
              {pending ? dict.aparencia.enviando : url ? dict.aparencia.trocar : dict.aparencia.enviarImagem}
            </Button>
            {url && (
              <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={handleRemover} disabled={pending}>
                {dict.common.remover}
              </Button>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-muted">{dict.orcamentos.capaImagemHint}</p>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
