"use client";

import { useEffect, useMemo } from "react";
import { listarPlaceholdersPendentes } from "@/lib/contratos/modelos/tipos";
import { IconAlertTriangle, IconCopy, IconX } from "@/components/ui/icons";

/**
 * O contrato como o cliente vai ler.
 *
 * O checklist mostra a estrutura; esta janela mostra o RESULTADO. É a
 * diferença entre saber que a cláusula de rescisão está marcada e ver como
 * ela soa depois da cláusula de pagamento, com a numeração certa e os
 * campos já preenchidos.
 *
 * A prévia não grava nada: é montada na hora, a partir do que está marcado
 * neste instante. Fechar não desfaz nem aplica coisa alguma.
 */
export function PreviaDoContrato({
  titulo,
  texto,
  aoFechar,
}: {
  titulo: string;
  texto: string;
  aoFechar: () => void;
}) {
  // Esc fecha: é uma janela de leitura, e obrigar a mirar o × para sair de
  // uma leitura é atrito à toa.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  const pendentes = useMemo(() => listarPlaceholdersPendentes(texto), [texto]);
  const clausulas = useMemo(() => (texto.match(/^CLÁUSULA /gm) ?? []).length, [texto]);
  const palavras = useMemo(() => texto.split(/\s+/).filter(Boolean).length, [texto]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={aoFechar}>
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-base-700 bg-base-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-base-800 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-primary">{titulo || "Prévia do contrato"}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {clausulas} {clausulas === 1 ? "cláusula" : "cláusulas"} · {palavras.toLocaleString("pt-BR")} palavras
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="shrink-0 rounded-lg border border-base-700 p-1.5 text-ink-secondary transition hover:text-ink-primary"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>

        {/*
          O aviso de campos em branco fica aqui, e não escondido no fim: é
          exatamente na leitura que se percebe o "[VALOR_DO_SERVIÇO]" cru no
          meio da frase — e é aqui que dá tempo de resolver, antes de o
          contrato sair para o cliente com um colchete no lugar do preço.
        */}
        {pendentes.length > 0 && (
          <div className="flex items-start gap-2 border-b border-base-800 bg-status-warning/5 px-5 py-3">
            <IconAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" />
            <p className="text-[11px] leading-snug text-ink-secondary">
              <span className="font-medium text-status-warning">
                {pendentes.length} {pendentes.length === 1 ? "campo ainda em branco" : "campos ainda em branco"}:
              </span>{" "}
              {pendentes.slice(0, 8).join(", ").replace(/_/g, " ").toLowerCase()}
              {pendentes.length > 8 ? ` e mais ${pendentes.length - 8}` : ""}. Eles aparecem entre colchetes no texto —
              preencha antes de enviar.
            </p>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {texto.trim() ? (
            <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-ink-secondary">{texto}</pre>
          ) : (
            <p className="py-10 text-center text-sm text-ink-muted">
              Nenhuma cláusula marcada — o contrato está vazio.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-base-800 px-5 py-3">
          <p className="text-[11px] text-ink-muted">Esta é a leitura do que está marcado agora. Nada foi salvo.</p>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(texto).catch(() => undefined)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-base-700 px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:text-ink-primary"
          >
            <IconCopy className="h-3.5 w-3.5" /> Copiar texto
          </button>
        </div>
      </div>
    </div>
  );
}
