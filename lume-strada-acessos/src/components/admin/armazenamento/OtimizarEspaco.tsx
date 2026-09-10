"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconDownload, IconTrash } from "@/components/ui/icons";
import { BackupDeArquivos, type AreaParaBackup } from "./BackupDeArquivos";
import { ApagarArquivos } from "./ApagarArquivos";

/**
 * As duas saídas para quem está sem espaço, na mesma caixa e nesta ordem:
 * primeiro tirar cópia, depois apagar.
 *
 * A ordem das abas é o conselho: "Baixar" abre por padrão, e a aba de apagar
 * repete que é para baixar antes. Ninguém apaga por engano lendo da esquerda
 * para a direita.
 *
 * A lista de arquivos da aba de apagar só é buscada quando alguém abre
 * aquela aba — é uma consulta que enumera o acervo inteiro, e não faz
 * sentido pagá-la para quem entrou aqui só para baixar.
 */
export function OtimizarEspaco({ areas }: { areas: AreaParaBackup[] }) {
  const { dict } = useLocale();
  const t = dict.armazenamento.backup;
  const [aba, setAba] = useState<"baixar" | "apagar">("baixar");

  return (
    <div>
      <div className="mb-4 inline-flex rounded-xl border border-base-700 bg-base-950/60 p-1">
        <Aba ativa={aba === "baixar"} onClick={() => setAba("baixar")} icone={<IconDownload className="h-3.5 w-3.5" />}>
          {t.abaBaixar}
        </Aba>
        <Aba ativa={aba === "apagar"} onClick={() => setAba("apagar")} icone={<IconTrash className="h-3.5 w-3.5" />}>
          {t.abaApagar}
        </Aba>
      </div>

      {aba === "baixar" ? <BackupDeArquivos areas={areas} /> : <ApagarArquivos areas={areas} />}
    </div>
  );
}

function Aba({
  ativa,
  onClick,
  icone,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition",
        ativa ? "bg-base-800 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
      )}
    >
      {icone}
      {children}
    </button>
  );
}
