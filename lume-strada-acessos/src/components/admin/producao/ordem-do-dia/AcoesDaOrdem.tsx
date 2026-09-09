"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { IconBox, IconRotateCcw, IconTrash } from "@/components/ui/icons";
import { arquivarOrdemDoDia, excluirOrdemDoDia } from "@/app/admin/producao/ordem-do-dia/actions";

/**
 * Menu de três pontinhos de uma folha na lista.
 *
 * Arquivar antes de excluir, e excluir sozinho em vermelho e com pergunta:
 * uma ordem de externa é o registro de como um dia de trabalho foi
 * combinado, e a diferença entre "sai da lista" e "some para sempre"
 * precisa estar clara antes do clique.
 */
export function AcoesDaOrdem({ ordemId, arquivado }: { ordemId: string; arquivado: boolean }) {
  const router = useRouter();
  const { dict } = useLocale();
  const t = dict.ordemDoDia;
  const [aberto, setAberto] = useState(false);
  const [pendente, start] = useTransition();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={t.acoes}
        title={t.acoes}
        onClick={(e) => {
          // O menu vive dentro do link para a folha — sem isto, abri-lo
          // levaria a pessoa para dentro dela.
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
              setAberto(false);
            }}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border border-base-700 bg-base-900 py-1 shadow-xl">
            <Item
              icone={arquivado ? <IconRotateCcw className="h-3.5 w-3.5" /> : <IconBox className="h-3.5 w-3.5" />}
              rotulo={arquivado ? t.desarquivar : t.arquivar}
              desativado={pendente}
              aoClicar={() =>
                start(async () => {
                  await arquivarOrdemDoDia(ordemId, !arquivado);
                  setAberto(false);
                  router.refresh();
                })
              }
            />
            <span className="my-1 block h-px bg-base-800" aria-hidden />
            <Item
              icone={<IconTrash className="h-3.5 w-3.5" />}
              rotulo={t.excluir}
              perigo
              desativado={pendente}
              aoClicar={() => {
                if (!window.confirm(t.confirmarExclusao)) return;
                start(async () => {
                  await excluirOrdemDoDia(ordemId);
                  setAberto(false);
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

function Item({
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
