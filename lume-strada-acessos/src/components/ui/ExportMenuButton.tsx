"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { exportarArrayComoCSV, exportarElementoComoPDF, exportarElementoComoPNG, ExportError, type ColunaCSV } from "@/lib/utils/export";
import { IconDownload, IconFileText, IconImage, IconTable, IconLoader } from "@/components/ui/icons";

interface ExportMenuButtonProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** `id` do elemento DOM que vai ser capturado pro PDF/PNG — precisa envolver TODO o conteúdo que deve sair no print (tabela, kanban, gráfico...). */
  targetId: string;
  /** Nome do arquivo, sem extensão — vira `${nomeArquivo}.pdf` / `.png` / `.csv`. */
  nomeArquivo: string;
  /** Linhas pra exportação em CSV — quando ausente, a opção "Exportar Planilha (CSV)" nem aparece (ex: Kanban, que não é uma lista tabular). */
  dadosCSV?: T[];
  colunasCSV?: ColunaCSV<T>[];
  className?: string;
}

type Formato = "pdf" | "png" | "csv";

/**
 * Botão universal de exportação — mesmo componente em toda tela do painel
 * (Financeiro, CRM, Produção, Tráfego, Relatórios...). Ícone minimalista de
 * download que abre um menu dropdown estilo glassmorphism (fundo
 * semitransparente + blur, mesma linguagem visual de `Card`/`StatTile`) com
 * as 3 opções: PDF, Imagem (PNG) e Planilha (CSV).
 *
 * PDF/PNG capturam a div inteira via `html2canvas` (ver `lib/utils/export`)
 * — por isso pedem um `targetId`, não os dados brutos. CSV não precisa de
 * captura de tela (é sempre mais fiel exportar os dados de verdade), por
 * isso recebe `dadosCSV` separado.
 */
export function ExportMenuButton<T extends Record<string, unknown> = Record<string, unknown>>({
  targetId,
  nomeArquivo,
  dadosCSV,
  colunasCSV,
  className,
}: ExportMenuButtonProps<T>) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState<Formato | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc);
    };
  }, []);

  async function exportar(formato: Formato) {
    setErro(null);
    setCarregando(formato);
    try {
      if (formato === "pdf") await exportarElementoComoPDF(targetId, nomeArquivo);
      else if (formato === "png") await exportarElementoComoPNG(targetId, nomeArquivo);
      else exportarArrayComoCSV(dadosCSV ?? [], nomeArquivo, colunasCSV);
      setAberto(false);
    } catch (err) {
      setErro(err instanceof ExportError ? err.message : "Não foi possível exportar. Tente novamente.");
    } finally {
      setCarregando(null);
    }
  }

  const opcoes: { formato: Formato; label: string; icon: typeof IconFileText }[] = [
    { formato: "pdf", label: "Exportar como PDF", icon: IconFileText },
    { formato: "png", label: "Exportar como Imagem (PNG)", icon: IconImage },
    ...(dadosCSV ? [{ formato: "csv" as const, label: "Exportar Planilha (CSV)", icon: IconTable }] : []),
  ];

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title="Exportar"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-base-700 text-ink-muted transition",
          "hover:border-ink-muted hover:text-ink-primary hover:bg-base-800",
          aberto && "border-ink-muted bg-base-800 text-ink-primary"
        )}
      >
        <IconDownload className="h-[17px] w-[17px]" />
      </button>

      {aberto && (
        <div
          role="menu"
          className={cn(
            // Glassmorphism premium — fundo bem escuro semitransparente + blur forte, borda quase invisível e glow suave (mesma família de sombra já usada em `StatTile`, aqui mais pronunciada por ser um elemento flutuante em cima do conteúdo).
            // z-50 — acima até da sidebar fixa (`z-40` em `AdminShell`), pra
            // nunca ficar obscurecido quando o botão de exportar está perto
            // da borda esquerda do conteúdo (ex: telas com sidebar expandida
            // em viewport mais estreito).
            "absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-base-700/80 bg-base-900/75 py-1.5 backdrop-blur-xl",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(0,0,0,0.85),0_0_40px_-12px_rgba(255,255,255,0.12)]"
          )}
        >
          {opcoes.map((op) => (
            <button
              key={op.formato}
              type="button"
              role="menuitem"
              disabled={carregando !== null}
              onClick={() => exportar(op.formato)}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink-secondary transition hover:bg-white/5 hover:text-ink-primary disabled:cursor-wait disabled:opacity-60"
            >
              {carregando === op.formato ? (
                <IconLoader className="h-4 w-4 shrink-0 animate-spin text-ink-muted" />
              ) : (
                <op.icon className="h-4 w-4 shrink-0 text-ink-muted" />
              )}
              {op.label}
            </button>
          ))}

          {erro && (
            <p role="alert" className="mx-3.5 mt-1 border-t border-base-800 pt-2 text-xs text-danger">
              {erro}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
