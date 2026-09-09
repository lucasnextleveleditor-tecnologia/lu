"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listarPlaceholdersPendentes } from "@/lib/contratos/modelos/tipos";
import { IconAlertTriangle, IconCopy, IconX } from "@/components/ui/icons";

/* ==================================================================== */
/* A FOLHA A4, NAS MESMAS MEDIDAS DO PDF                                 */
/* ==================================================================== */

/**
 * O PDF é montado em PONTOS (72 por polegada); o navegador desenha em
 * PIXELS de CSS (96 por polegada). Todas as medidas abaixo são as do
 * `ContratoPdfDocument` convertidas por esse fator — é o que faz a quebra de
 * página da prévia cair no mesmo lugar em que vai cair no arquivo. Chutar
 * "uma folha branca alta" daria uma prévia bonita e mentirosa, que é pior do
 * que não ter prévia nenhuma.
 */
const PT = 96 / 72;
const A4_LARGURA = Math.round(595 * PT); // 793
const A4_ALTURA = Math.round(842 * PT); // 1123
const MARGEM = Math.round(48 * PT); // `page.padding` do PDF
const MARGEM_INFERIOR = Math.round(64 * PT); // `page.paddingBottom`, que abre espaço para o rodapé
const AREA_UTIL = A4_ALTURA - MARGEM - MARGEM_INFERIOR;
const LARGURA_UTIL = A4_LARGURA - MARGEM * 2;

export function PreviaDoContrato({
  titulo,
  texto,
  logoUrl,
  aoFechar,
}: {
  titulo: string;
  texto: string;
  logoUrl?: string | null;
  aoFechar: () => void;
}) {
  const medidorRef = useRef<HTMLDivElement | null>(null);
  const [alturaConteudo, setAlturaConteudo] = useState(0);
  const [escala, setEscala] = useState(1);
  const areaRef = useRef<HTMLDivElement | null>(null);

  // Esc fecha: é uma janela de leitura, e obrigar a mirar o × para sair de
  // uma leitura é atrito à toa.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  // Mede o texto já renderizado na largura real da folha. É dessa altura que
  // sai o número de páginas — não de uma estimativa por caractere, que erra
  // feio quando o contrato tem parágrafos curtos.
  //
  // A medição fica sob observação em vez de acontecer uma vez só porque a
  // logo carrega depois do primeiro render: medir antes dela chegar daria um
  // contrato com uma página a menos, e a prévia inteira existe justamente
  // para acertar essa conta.
  useEffect(() => {
    const alvo = medidorRef.current;
    if (!alvo) return;

    const medir = () => setAlturaConteudo(alvo.scrollHeight);
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(alvo);

    // Fontes carregam depois do primeiro pintar e mudam a altura do texto.
    void document.fonts?.ready.then(medir).catch(() => undefined);

    return () => observador.disconnect();
  }, [texto, logoUrl, titulo]);

  // A folha inteira tem 793px de largura e a janela nem sempre tem: encolhe
  // proporcionalmente para caber, em vez de cortar a margem direita.
  useEffect(() => {
    function ajustar() {
      const disponivel = areaRef.current?.clientWidth ?? A4_LARGURA;
      setEscala(Math.min(1, (disponivel - 8) / A4_LARGURA));
    }
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  const pendentes = useMemo(() => listarPlaceholdersPendentes(texto), [texto]);
  const clausulas = useMemo(() => (texto.match(/^CLÁUSULA /gm) ?? []).length, [texto]);
  const paginas = Math.max(1, Math.ceil(alturaConteudo / AREA_UTIL));

  const conteudo = (
    <>
      {logoUrl && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 * PT }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem do bucket do próprio projeto, e o preview precisa medir o tamanho real */}
          <img src={logoUrl} alt="" style={{ maxWidth: 170 * PT, maxHeight: 56 * PT, objectFit: "contain" }} />
        </div>
      )}
      <div style={{ borderBottom: "1px solid #ccc", paddingBottom: 12 * PT, marginBottom: 16 * PT }}>
        <p style={{ fontSize: 9 * PT, color: "#666" }}>{titulo || "Contrato"}</p>
      </div>
      <div style={{ fontSize: 9.5 * PT, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {texto || "Nenhuma cláusula marcada — o contrato está vazio."}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={aoFechar}>
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-base-700 bg-base-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-base-800 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-primary">{titulo || "Prévia do contrato"}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {paginas} {paginas === 1 ? "página" : "páginas"} · {clausulas} {clausulas === 1 ? "cláusula" : "cláusulas"}
              {logoUrl ? " · com logo" : " · sem logo"}
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
              {pendentes.length > 8 ? ` e mais ${pendentes.length - 8}` : ""}. Aparecem entre colchetes no texto —
              preencha antes de enviar.
            </p>
          </div>
        )}

        <div ref={areaRef} className="min-h-0 flex-1 overflow-y-auto bg-base-950/60 px-4 py-5">
          {/*
            O medidor: a MESMA marcação das folhas, fora da tela, para saber
            quanto o texto ocupa de verdade. Sem ele não há como dizer onde a
            página quebra.
          */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              width: LARGURA_UTIL,
              left: -99999,
              top: 0,
              color: "#1a1a1a",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            <div ref={medidorRef}>{conteudo}</div>
          </div>

          <div className="flex flex-col items-center gap-5" style={{ transform: `scale(${escala})`, transformOrigin: "top center" }}>
            {Array.from({ length: paginas }, (_, i) => (
              <div
                key={i}
                className="relative shrink-0 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
                style={{ width: A4_LARGURA, height: A4_ALTURA, background: "#ffffff", color: "#1a1a1a" }}
              >
                {/*
                  Cada folha mostra a MESMA peça de texto, deslocada para
                  cima pela altura de uma página. É assim que se vê onde a
                  quebra realmente cai: se um parágrafo é cortado no meio, ele
                  aparece cortado aqui também.
                */}
                <div
                  style={{
                    position: "absolute",
                    left: MARGEM,
                    top: MARGEM,
                    width: LARGURA_UTIL,
                    height: AREA_UTIL,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ transform: `translateY(-${i * AREA_UTIL}px)`, fontFamily: "Helvetica, Arial, sans-serif" }}>{conteudo}</div>
                </div>

                <p
                  style={{
                    position: "absolute",
                    bottom: 24 * PT,
                    left: MARGEM,
                    right: MARGEM,
                    textAlign: "center",
                    fontSize: 8 * PT,
                    color: "#999",
                    fontFamily: "Helvetica, Arial, sans-serif",
                  }}
                >
                  Página {i + 1} de {paginas}
                </p>
              </div>
            ))}
          </div>

          {/* Compensa a altura que o `scale` tira do fluxo — sem isto, a rolagem para antes da última folha. */}
          <div style={{ height: (1 - escala) * paginas * (A4_ALTURA + 20) }} aria-hidden />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-base-800 px-5 py-3">
          <p className="text-[11px] text-ink-muted">
            Folha A4 nas medidas reais do PDF. Nada foi salvo — isto é só a leitura do que está marcado agora.
          </p>
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
