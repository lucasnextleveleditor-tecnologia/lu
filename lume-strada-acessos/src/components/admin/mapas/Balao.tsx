"use client";

import { memo, type CSSProperties } from "react";
import { ALTURA_IMAGEM, CORES_MAPA, fonteCss, type MapaNoRow } from "@/lib/types/mapa-mental";
import type { BalaoPosicionado } from "@/lib/mapa-mental/layout";
import { urlImagemMapa } from "@/lib/mapa-mental/imagem";
import { cn } from "@/lib/utils/cn";
import { IconExternalLink } from "@/components/ui/icons";

/**
 * Um balão.
 *
 * Componente próprio e MEMOIZADO por um motivo de desempenho, não de
 * organização: num mapa de duzentos balões, arrastar um deles disparava o
 * redesenho dos duzentos a cada movimento do mouse. Isolado e com `memo`,
 * só o balão cujas props mudaram é redesenhado — o resto do mapa fica
 * parado, e o arraste deixa de engasgar.
 *
 * Por isso as props são todas valores simples e as funções vêm estáveis do
 * pai (`useCallback`): um objeto novo a cada render anularia o `memo`.
 */

/**
 * O estilo de cada forma.
 *
 * O tamanho da caixa já veio calculado pelo layout, com a folga que a forma
 * cobra (ver `FORMAS_MAPA`); aqui é só o desenho. `clip-path` para o
 * hexágono, raio total para pílula e elipse, e o sublinhado sem caixa
 * nenhuma — só o texto sobre o traço da cor do ramo.
 */
function estiloDaForma(forma: string, cor: string, ehRaiz: boolean): { classe: string; estilo: CSSProperties } {
  if (ehRaiz) return { classe: "rounded-xl", estilo: {} };

  switch (forma) {
    case "reto":
      return { classe: "rounded-none", estilo: {} };
    case "pilula":
      return { classe: "rounded-full", estilo: {} };
    case "elipse":
      return { classe: "", estilo: { borderRadius: "50%" } };
    case "hexagono":
      return {
        classe: "rounded-none",
        // A borda não acompanha o `clip-path`, então o hexágono usa a cor do
        // ramo como fundo esmaecido em vez de contorno — senão a forma
        // apareceria cortada pela metade.
        estilo: {
          clipPath: "polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%)",
        },
      };
    case "sublinhado":
      return {
        classe: "rounded-none",
        estilo: { borderWidth: 0, borderBottomWidth: 2.5, borderBottomColor: cor, backgroundColor: "transparent" },
      };
    default:
      return { classe: "rounded-xl", estilo: {} };
  }
}

export interface BalaoProps {
  balao: BalaoPosicionado;
  selecionado: boolean;
  editando: boolean;
  rascunho: string;
  podeEditar: boolean;
  qtdComentarios: number;
  aoPressionar: (e: React.PointerEvent, noId: string) => void;
  aoDuploClique: (noId: string) => void;
  aoDigitar: (valor: string) => void;
  aoConfirmar: () => void;
  aoAlternarRamo: (noId: string, colapsado: boolean) => void;
  registrarRef: (noId: string, el: HTMLDivElement | null) => void;
}

/** Bate com `medirBalao`: se divergir, a caixa não cabe o texto que ela reservou. */
function estiloDoTexto(no: MapaNoRow, ehRaiz: boolean): CSSProperties {
  const corpo = no.tamanho || (ehRaiz ? 16 : 14);
  return {
    fontFamily: fonteCss(no.fonte),
    fontSize: corpo,
    lineHeight: `${Math.round(corpo * 1.36)}px`,
    fontWeight: no.negrito || ehRaiz ? 600 : 500,
    fontStyle: no.italico ? "italic" : "normal",
  };
}

export const Balao = memo(function Balao({
  balao,
  selecionado,
  editando,
  rascunho,
  podeEditar,
  qtdComentarios,
  aoPressionar,
  aoDuploClique,
  aoDigitar,
  aoConfirmar,
  aoAlternarRamo,
  registrarRef,
}: BalaoProps) {
  const no = balao.no;
  const ehRaiz = no.pai_id === null;
  const imagem = urlImagemMapa(no.imagem_path);
  const { classe, estilo } = estiloDaForma(no.forma, balao.cor, ehRaiz);
  const semCaixa = !ehRaiz && no.forma === "sublinhado";
  const hexagono = !ehRaiz && no.forma === "hexagono";
  const centrado = !ehRaiz && (no.forma === "elipse" || no.forma === "hexagono" || no.forma === "pilula");

  return (
    <div
      ref={(el) => registrarRef(no.id, el)}
      className="absolute left-0 top-0"
      style={{ transform: `translate(${balao.x}px, ${balao.y}px)`, width: balao.largura }}
      onPointerDown={(e) => aoPressionar(e, no.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        aoDuploClique(no.id);
      }}
    >
      <div
        className={cn(
          "relative flex flex-col justify-center overflow-hidden transition-shadow",
          classe,
          ehRaiz
            ? "bg-accent text-white shadow-[0_8px_28px_-6px_rgb(var(--color-accent)/0.55)]"
            : semCaixa
              ? "text-ink-primary"
              : hexagono
                ? "text-ink-primary"
                : "border border-base-700 bg-base-900/95 text-ink-primary shadow-[0_2px_10px_-4px_rgb(0_0_0/0.5)]",
          !ehRaiz && !semCaixa && !hexagono && balao.profundidade === 1 && "bg-base-850/95",
          podeEditar && "cursor-grab active:cursor-grabbing",
          centrado && "items-center text-center"
        )}
        style={{
          minHeight: balao.altura,
          ...estilo,
          // O hexágono não pode ter borda (o recorte a cortaria ao meio):
          // ele se distingue pelo preenchimento na cor do ramo.
          ...(hexagono ? { backgroundColor: `${balao.cor}26`, boxShadow: `inset 0 0 0 2px ${balao.cor}` } : {}),
          ...(selecionado ? { boxShadow: `0 0 0 2px ${ehRaiz ? CORES_MAPA.azul : balao.cor}` } : {}),
        }}
      >
        {/* O filete do ramo, no lado que aponta para o pai. Só nas formas com
            caixa retangular — numa elipse ou num hexágono ele sairia torto. */}
        {!ehRaiz && !semCaixa && !hexagono && no.forma !== "elipse" && no.forma !== "pilula" && (
          <span
            className="absolute inset-y-0 w-[3px]"
            style={{ backgroundColor: balao.cor, ...(balao.lado === -1 ? { right: 0 } : { left: 0 }) }}
            aria-hidden
          />
        )}

        <div
          className={cn(
            "w-full",
            semCaixa ? "px-1 pb-1.5 pt-0.5" : "px-3.5 py-2.5",
            !ehRaiz && !semCaixa && !hexagono && no.forma !== "elipse" && no.forma !== "pilula" && (balao.lado === -1 ? "pr-4" : "pl-4")
          )}
        >
          {imagem && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagem}
              alt=""
              draggable={false}
              className="mb-2 w-full rounded-lg object-cover"
              style={{ height: ALTURA_IMAGEM }}
            />
          )}

          {editando ? (
            <textarea
              autoFocus
              value={rascunho}
              onChange={(e) => aoDigitar(e.target.value)}
              onBlur={aoConfirmar}
              onPointerDown={(e) => e.stopPropagation()}
              rows={1}
              className={cn("w-full resize-none border-0 bg-transparent p-0 text-inherit outline-none", centrado && "text-center")}
              style={{ ...estiloDoTexto(no, ehRaiz), minHeight: 19 }}
            />
          ) : (
            <span className="block whitespace-pre-wrap break-words" style={estiloDoTexto(no, ehRaiz)}>
              {no.texto || <span className="italic opacity-40">…</span>}
            </span>
          )}

          {no.link && (
            <a
              href={no.link}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "mt-1.5 flex items-center gap-1 truncate text-[11px] underline-offset-2 hover:underline",
                ehRaiz ? "text-white/80" : "text-accent"
              )}
            >
              <IconExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{no.link.replace(/^https?:\/\//, "")}</span>
            </a>
          )}
        </div>

        {qtdComentarios > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-base-800 px-1 text-[9px] font-semibold tabular-nums text-ink-secondary ring-1 ring-base-600">
            {qtdComentarios}
          </span>
        )}
      </div>

      {balao.temFilhos && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => aoAlternarRamo(no.id, !no.colapsado)}
          className="absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-base-600 bg-base-900 text-[11px] font-bold leading-none text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          style={balao.lado === -1 ? { left: -10 } : { right: -10 }}
          aria-label={no.colapsado ? "Abrir ramo" : "Fechar ramo"}
        >
          {no.colapsado ? balao.filhosOcultos || "+" : "−"}
        </button>
      )}
    </div>
  );
});
