"use client";

import { useRef, useState } from "react";
import type { MapaNoRow } from "@/lib/types/mapa-mental";
import { urlImagemMapa } from "@/lib/mapa-mental/imagem";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { IconPaperclip, IconImage, IconTrash, IconLoader, IconExternalLink } from "@/components/ui/icons";

/** 5 MB — o mesmo teto configurado no bucket `mapas`. Barrar aqui poupa o envio inteiro só para receber erro no fim. */
const LIMITE_BYTES = 5 * 1024 * 1024;

/**
 * Link e imagem de um balão.
 *
 * O link é salvo ao sair do campo, não a cada tecla: uma URL sendo digitada
 * passa por dezenas de estados inválidos, e gravar todos eles seria pura
 * ida e volta à rede.
 */
export function AnexosDoBalao({
  no,
  podeEnviarImagem,
  aoMudarLink,
  aoEnviarImagem,
  aoRemoverImagem,
}: {
  no: MapaNoRow;
  podeEnviarImagem: boolean;
  aoMudarLink: (link: string) => void;
  aoEnviarImagem: (arquivo: File) => Promise<void>;
  aoRemoverImagem: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.mapaMental;

  const [link, setLink] = useState(no.link);
  const [enviando, setEnviando] = useState(false);
  const [avisoTamanho, setAvisoTamanho] = useState(false);
  const inputArquivo = useRef<HTMLInputElement | null>(null);
  const imagem = urlImagemMapa(no.imagem_path);

  return (
    <div className="border-t border-base-800 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        <IconPaperclip className="h-3 w-3" /> {t.anexos}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={() => {
              const limpo = link.trim();
              if (limpo !== no.link) aoMudarLink(limpo);
            }}
            placeholder={t.linkExemplo}
            aria-label={t.link}
            className="min-w-0 flex-1 rounded-lg border border-base-700 bg-base-950 px-2 py-1 text-xs text-ink-primary outline-none focus:border-accent"
          />
          {no.link && (
            <a
              href={no.link}
              target="_blank"
              rel="noopener noreferrer"
              title={t.abrirLink}
              className="shrink-0 rounded-lg border border-base-700 p-1.5 text-ink-secondary transition hover:text-ink-primary"
            >
              <IconExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {imagem ? (
          <div className="relative overflow-hidden rounded-lg border border-base-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagem} alt="" className="h-24 w-full object-cover" />
            <button
              type="button"
              onClick={aoRemoverImagem}
              title={t.removerImagem}
              aria-label={t.removerImagem}
              className="absolute right-1.5 top-1.5 rounded-md bg-base-950/80 p-1 text-ink-secondary backdrop-blur-sm transition hover:text-danger"
            >
              <IconTrash className="h-3 w-3" />
            </button>
          </div>
        ) : (
          podeEnviarImagem && (
            <>
              <input
                ref={inputArquivo}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const arquivo = e.target.files?.[0];
                  e.target.value = "";
                  if (!arquivo) return;
                  if (arquivo.size > LIMITE_BYTES) {
                    setAvisoTamanho(true);
                    return;
                  }
                  setAvisoTamanho(false);
                  setEnviando(true);
                  await aoEnviarImagem(arquivo);
                  setEnviando(false);
                }}
              />
              <Button
                variant="ghost"
                className="w-full px-2 py-1 text-[11px]"
                disabled={enviando}
                onClick={() => inputArquivo.current?.click()}
              >
                {enviando ? <IconLoader className="h-3 w-3 animate-spin" /> : <IconImage className="h-3 w-3" />}
                {enviando ? t.enviandoImagem : t.enviarImagem}
              </Button>
              {avisoTamanho && <p className="text-[11px] text-danger">{t.imagemGrande}</p>}
            </>
          )
        )}
      </div>
    </div>
  );
}
