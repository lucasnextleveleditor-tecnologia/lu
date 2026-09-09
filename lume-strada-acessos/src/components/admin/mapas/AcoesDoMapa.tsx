"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { IconDownload, IconBox, IconRotateCcw, IconTrash } from "@/components/ui/icons";
import { arquivarMapa, excluirMapa } from "@/app/admin/mapas/actions";

/**
 * Menu de três pontinhos de um mapa na lista.
 *
 * Arquivar vem antes de excluir, e excluir é o único item em vermelho e o
 * único que pergunta antes: um mapa é trabalho de pensamento de várias
 * pessoas, e a diferença entre "sai da minha lista" e "some para sempre"
 * precisa estar clara ANTES do clique, não depois.
 */
export function AcoesDoMapa({ mapaId, arquivado }: { mapaId: string; arquivado: boolean }) {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.mapaMental;
  const [aberto, setAberto] = useState(false);
  const [pendente, start] = useTransition();

  function fechar() {
    setAberto(false);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={t.acoes}
        title={t.acoes}
        onClick={(e) => {
          // O menu vive dentro de um link para o mapa — sem isto, abrir o
          // menu levaria a pessoa para dentro do mapa.
          e.preventDefault();
          e.stopPropagation();
          setAberto((a) => !a);
        }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-base-800/70 hover:text-ink-primary",
          aberto && "bg-base-800/70 text-ink-primary"
        )}
      >
        <span className="text-lg leading-none">···</span>
      </button>

      {aberto && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fechar();
            }}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-base-700 bg-base-900 py-1 shadow-xl">
            <ItemMenu
              icone={<IconDownload className="h-3.5 w-3.5" />}
              rotulo={t.baixarPdf}
              aoClicar={() => {
                // Rota de API, não Server Action: o navegador precisa
                // receber o arquivo e disparar o download sozinho.
                window.open(`/api/mapas/${mapaId}/pdf`, "_blank");
                fechar();
              }}
            />
            <ItemMenu
              icone={arquivado ? <IconRotateCcw className="h-3.5 w-3.5" /> : <IconBox className="h-3.5 w-3.5" />}
              rotulo={arquivado ? t.desarquivar : t.arquivar}
              desativado={pendente}
              aoClicar={() =>
                start(async () => {
                  await arquivarMapa(mapaId, !arquivado);
                  fechar();
                  router.refresh();
                })
              }
            />
            <span className="my-1 block h-px bg-base-800" aria-hidden />
            <ItemMenu
              icone={<IconTrash className="h-3.5 w-3.5" />}
              rotulo={t.excluir}
              perigo
              desativado={pendente}
              aoClicar={() => {
                if (!window.confirm(t.confirmarExclusao)) return;
                start(async () => {
                  await excluirMapa(mapaId);
                  fechar();
                  router.refresh();
                });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ItemMenu({
  icone,
  rotulo,
  aoClicar,
  perigo,
  desativado,
}: {
  icone: React.ReactNode;
  rotulo: string;
  aoClicar: () => void;
  perigo?: boolean;
  desativado?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={desativado}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        aoClicar();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition disabled:opacity-50",
        perigo ? "text-danger hover:bg-danger/10" : "text-ink-secondary hover:bg-base-800/70 hover:text-ink-primary"
      )}
    >
      {icone}
      {rotulo}
    </button>
  );
}
