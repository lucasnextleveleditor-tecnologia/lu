"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MapaComentarioRow, MapaNoRow } from "@/lib/types/mapa-mental";
import { CORES_MAPA, ORDEM_CORES, corDoRamo } from "@/lib/types/mapa-mental";
import { caminhoLigacao, desenharMapa } from "@/lib/mapa-mental/layout";
import { useMapaAoVivo } from "@/lib/mapa-mental/aoVivo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconTrash, IconMessageCircle, IconRotateCcw, IconTarget, IconPalette, IconSend } from "@/components/ui/icons";

type Resultado = { ok: true } | { ok: false; error: string };
type ResultadoNo = { ok: true; no: MapaNoRow } | { ok: false; error: string };

export interface ApiDoMapa {
  adicionar: (paiId: string, valores?: Record<string, unknown>) => Promise<ResultadoNo>;
  salvar: (noId: string, valores: Record<string, unknown>) => Promise<Resultado>;
  remover: (noId: string) => Promise<Resultado>;
  reorganizar: () => Promise<Resultado>;
  comentar: (noId: string, autor: string, texto: string) => Promise<Resultado>;
}

interface Props {
  mapaId: string;
  nosIniciais: MapaNoRow[];
  comentariosIniciais: MapaComentarioRow[];
  meuNome: string;
  podeEditar: boolean;
  podeComentar: boolean;
  api: ApiDoMapa;
  /** Barra de cima da tela — muda entre o painel e o link público. */
  cabecalho?: ReactNode;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.5;

export function MapaCanvas({
  mapaId,
  nosIniciais,
  comentariosIniciais,
  meuNome,
  podeEditar,
  podeComentar,
  api,
  cabecalho,
}: Props) {
  const { dict } = useLocale();
  const t = dict.mapaMental;

  const [nos, setNos] = useState<MapaNoRow[]>(nosIniciais);
  const [comentarios, setComentarios] = useState<MapaComentarioRow[]>(comentariosIniciais);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [painelComentarios, setPainelComentarios] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const areaRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ---------------------------------------------------------------------
  // Tempo real
  // ---------------------------------------------------------------------
  // Cada mudança vira duas coisas: a gravação no banco (a verdade) e um aviso
  // no canal (a rapidez). Quem recebe o aviso aplica só aquele balão — nunca
  // recarrega o mapa —, então quem está digitando no outro ramo não perde o
  // cursor nem o texto pela metade.
  const { pessoas, avisar } = useMapaAoVivo({
    mapaId,
    meuNome,
    aoReceber: useCallback((evento) => {
      if (evento.tipo === "no") {
        setNos((atual) => {
          const existe = atual.some((n) => n.id === evento.no.id);
          return existe ? atual.map((n) => (n.id === evento.no.id ? evento.no : n)) : [...atual, evento.no];
        });
      } else if (evento.tipo === "remover") {
        setNos((atual) => atual.filter((n) => !evento.ids.includes(n.id)));
      } else if (evento.tipo === "reorganizar") {
        setNos((atual) => atual.map((n) => ({ ...n, desloc_x: null, desloc_y: null, lado: null })));
      }
    }, []),
  });

  const nosPorId = useMemo(() => new Map(nos.map((n) => [n.id, n])), [nos]);

  /** Aplica localmente, grava e avisa — nesta ordem, para a tela nunca esperar a rede. */
  const mudarNo = useCallback(
    (noId: string, valores: Partial<MapaNoRow>) => {
      let atualizado: MapaNoRow | undefined;
      setNos((atual) =>
        atual.map((n) => {
          if (n.id !== noId) return n;
          atualizado = { ...n, ...valores };
          return atualizado;
        })
      );
      void api.salvar(noId, valores as Record<string, unknown>).then((r) => {
        if (!r.ok) setErro(r.error);
      });
      // `setNos` é assíncrono, mas o objeto já foi montado acima.
      if (atualizado) avisar({ tipo: "no", no: atualizado });
      else {
        const base = nosPorId.get(noId);
        if (base) avisar({ tipo: "no", no: { ...base, ...valores } });
      }
    },
    [api, avisar, nosPorId]
  );

  const desenho = useMemo(() => desenharMapa(nos, corDoRamo), [nos]);
  const porId = useMemo(() => new Map(desenho.baloes.map((b) => [b.no.id, b])), [desenho]);

  const comentariosPorNo = useMemo(() => {
    const mapa = new Map<string, MapaComentarioRow[]>();
    for (const c of comentarios) {
      const lista = mapa.get(c.no_id);
      if (lista) lista.push(c);
      else mapa.set(c.no_id, [c]);
    }
    return mapa;
  }, [comentarios]);

  // ---------------------------------------------------------------------
  // Encaixar na tela
  // ---------------------------------------------------------------------
  const encaixar = useCallback(() => {
    const area = areaRef.current;
    if (!area || desenho.baloes.length === 0) return;
    const { minX, minY, maxX, maxY } = desenho.limites;
    const largura = maxX - minX;
    const altura = maxY - minY;
    const caixa = area.getBoundingClientRect();
    const margem = 64;
    const escala = Math.max(
      ZOOM_MIN,
      Math.min(ZOOM_MAX, Math.min((caixa.width - margem) / Math.max(largura, 1), (caixa.height - margem) / Math.max(altura, 1)))
    );
    setZoom(escala);
    // O centro do desenho vai para o centro da área visível.
    setPan({ x: -((minX + maxX) / 2) * escala, y: -((minY + maxY) / 2) * escala });
  }, [desenho]);

  // Encaixa uma vez, quando o mapa abre — depois disso a pessoa é dona do
  // enquadramento e não seria nada legal a tela pular sozinha a cada balão.
  const jaEncaixou = useRef(false);
  useEffect(() => {
    if (jaEncaixou.current || desenho.baloes.length === 0) return;
    jaEncaixou.current = true;
    encaixar();
  }, [desenho, encaixar]);

  // ---------------------------------------------------------------------
  // Editar texto
  // ---------------------------------------------------------------------
  function comecarEdicao(noId: string) {
    if (!podeEditar) return;
    setSelecionado(noId);
    setEditando(noId);
    setRascunho(nosPorId.get(noId)?.texto ?? "");
  }

  function confirmarEdicao() {
    if (!editando) return;
    const anterior = nosPorId.get(editando)?.texto ?? "";
    if (rascunho !== anterior) mudarNo(editando, { texto: rascunho });
    setEditando(null);
  }

  useEffect(() => {
    if (editando) textareaRef.current?.focus();
  }, [editando]);

  async function criarBalao(paiId: string, depoisDe?: string) {
    if (!podeEditar) return;
    const r = await api.adicionar(paiId, {});
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setNos((atual) => [...atual, r.no]);
    avisar({ tipo: "no", no: r.no });
    setSelecionado(r.no.id);
    setEditando(r.no.id);
    setRascunho("");
    void depoisDe;
  }

  function apagarBalao(noId: string) {
    if (!podeEditar) return;
    const no = nosPorId.get(noId);
    if (!no || no.pai_id === null) return; // o balão do meio não se apaga

    // Descobre o ramo inteiro para tirar da tela de uma vez — o banco já
    // apaga em cascata, mas quem está olhando não deveria ver os filhos
    // sobrarem soltos por um segundo.
    const paraApagar: string[] = [];
    const fila = [noId];
    while (fila.length) {
      const atual = fila.shift() as string;
      paraApagar.push(atual);
      for (const n of nos) if (n.pai_id === atual) fila.push(n.id);
    }

    setNos((atual) => atual.filter((n) => !paraApagar.includes(n.id)));
    setSelecionado(no.pai_id);
    avisar({ tipo: "remover", ids: paraApagar });
    void api.remover(noId).then((r) => {
      if (!r.ok) setErro(r.error);
    });
  }

  // ---------------------------------------------------------------------
  // Teclado — é o que faz um mapa mental ser rápido de montar
  // ---------------------------------------------------------------------
  function aoTeclar(e: React.KeyboardEvent) {
    if (!podeEditar) return;
    const alvo = selecionado;

    if (editando) {
      if (e.key === "Escape") {
        e.preventDefault();
        confirmarEdicao();
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Enter fecha e abre um irmão; Shift+Enter quebra a linha dentro do
        // balão — a mesma convenção de qualquer editor de mapa mental.
        e.preventDefault();
        const no = nosPorId.get(editando);
        confirmarEdicao();
        if (no?.pai_id) void criarBalao(no.pai_id);
      } else if (e.key === "Tab") {
        e.preventDefault();
        const id = editando;
        confirmarEdicao();
        void criarBalao(id);
      }
      return;
    }

    if (!alvo) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const no = nosPorId.get(alvo);
      if (no?.pai_id) void criarBalao(no.pai_id);
      else void criarBalao(alvo);
    } else if (e.key === "Tab") {
      e.preventDefault();
      void criarBalao(alvo);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      apagarBalao(alvo);
    } else if (e.key === "F2") {
      e.preventDefault();
      comecarEdicao(alvo);
    }
  }

  // ---------------------------------------------------------------------
  // Navegar pelo canvas: roda dá zoom, arrastar o fundo move
  // ---------------------------------------------------------------------
  function aoRolar(e: React.WheelEvent) {
    e.preventDefault();
    const area = areaRef.current;
    if (!area) return;
    const caixa = area.getBoundingClientRect();
    // O ponto sob o cursor tem de continuar sob o cursor depois do zoom —
    // sem isso, aproximar joga o mapa para fora da tela.
    const cx = e.clientX - caixa.left - caixa.width / 2;
    const cy = e.clientY - caixa.top - caixa.height / 2;
    const novo = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    const fator = novo / zoom;
    setPan((p) => ({ x: cx - (cx - p.x) * fator, y: cy - (cy - p.y) * fator }));
    setZoom(novo);
  }

  const arrastandoFundo = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const arrastandoNo = useRef<{ id: string; x: number; y: number; baseX: number; baseY: number } | null>(null);

  function fundoPressionado(e: React.PointerEvent) {
    if (e.button !== 0) return;
    arrastandoFundo.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelecionado(null);
    setPainelComentarios(false);
  }

  function ponteiroMoveu(e: React.PointerEvent) {
    if (arrastandoFundo.current) {
      const d = arrastandoFundo.current;
      setPan({ x: d.panX + (e.clientX - d.x), y: d.panY + (e.clientY - d.y) });
      return;
    }
    if (arrastandoNo.current) {
      const d = arrastandoNo.current;
      // Divide pelo zoom: arrastar 10px na tela com zoom 2 tem de deslocar
      // 5px no mapa, senão o balão foge do cursor.
      setNos((atual) =>
        atual.map((n) =>
          n.id === d.id
            ? { ...n, desloc_x: d.baseX + (e.clientX - d.x) / zoom, desloc_y: d.baseY + (e.clientY - d.y) / zoom }
            : n
        )
      );
    }
  }

  function ponteiroSoltou() {
    arrastandoFundo.current = null;
    const d = arrastandoNo.current;
    if (d) {
      arrastandoNo.current = null;
      const no = nosPorId.get(d.id);
      // Só grava se de fato saiu do lugar — um clique simples não deveria
      // virar um ajuste manual permanente.
      if (no && (no.desloc_x !== null || no.desloc_y !== null)) {
        mudarNo(d.id, { desloc_x: no.desloc_x, desloc_y: no.desloc_y });
      }
    }
  }

  function reorganizar() {
    setNos((atual) => atual.map((n) => ({ ...n, desloc_x: null, desloc_y: null, lado: null })));
    avisar({ tipo: "reorganizar" });
    void api.reorganizar().then((r) => {
      if (!r.ok) setErro(r.error);
    });
  }

  const noSelecionado = selecionado ? nosPorId.get(selecionado) : null;
  const comentariosDoSelecionado = selecionado ? (comentariosPorNo.get(selecionado) ?? []) : [];

  return (
    <div className="flex h-full flex-col">
      {/* ---------------------------------------------------------------- */}
      {/* Barra de cima                                                     */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {cabecalho}

        <div className="ml-auto flex items-center gap-3">
          {/* Quem está aqui agora. Mostrar isso é o que faz a edição junta
              parecer edição junta, e não um arquivo mudando sozinho. */}
          {pessoas.length > 0 && (
            <div className="flex items-center -space-x-2" title={pessoas.map((p) => p.nome).join(", ")}>
              {pessoas.slice(0, 5).map((p) => (
                <span
                  key={p.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-base-900 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: p.cor }}
                  aria-label={p.nome}
                >
                  {p.nome.trim().charAt(0).toUpperCase() || "?"}
                </span>
              ))}
              {pessoas.length > 5 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-base-900 bg-base-700 text-[10px] font-semibold text-ink-secondary">
                  +{pessoas.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 rounded-lg border border-base-700 px-1 py-0.5 text-xs text-ink-secondary">
            <button type="button" className="px-1.5 py-0.5 hover:text-ink-primary" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z / 1.2))} aria-label={t.afastar}>
              −
            </button>
            <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <button type="button" className="px-1.5 py-0.5 hover:text-ink-primary" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z * 1.2))} aria-label={t.aproximar}>
              +
            </button>
          </div>

          <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={encaixar} title={t.encaixar}>
            <IconTarget className="h-3.5 w-3.5" /> {t.encaixar}
          </Button>

          {podeEditar && (
            <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={reorganizar} title={t.reorganizarHint}>
              <IconRotateCcw className="h-3.5 w-3.5" /> {t.reorganizar}
            </Button>
          )}
        </div>
      </div>

      {erro && <p className="mb-2 text-xs text-danger">{erro}</p>}

      <div className="flex min-h-0 flex-1 gap-4">
        {/* -------------------------------------------------------------- */}
        {/* O CANVAS                                                        */}
        {/* -------------------------------------------------------------- */}
        <div
          ref={areaRef}
          tabIndex={0}
          onKeyDown={aoTeclar}
          onWheel={aoRolar}
          onPointerDown={fundoPressionado}
          onPointerMove={ponteiroMoveu}
          onPointerUp={ponteiroSoltou}
          onPointerCancel={ponteiroSoltou}
          className="relative min-h-0 flex-1 cursor-grab overflow-hidden rounded-2xl border border-base-700 bg-base-950/60 outline-none focus:border-base-600 active:cursor-grabbing"
          style={{
            // Grade de pontos: dá noção de movimento ao arrastar. Sem ela o
            // fundo é liso e o mapa parece pular em vez de deslizar.
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(var(--glow-rgb) / 0.06) 1px, transparent 0)",
            backgroundSize: `${26 * zoom}px ${26 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
          >
            {/* As ligações. `overflow-visible` num svg de 1×1 é o que permite
                desenhar em coordenadas negativas sem inventar um viewBox
                gigante que teria de crescer junto com o mapa. */}
            <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden>
              {desenho.ligacoes.map((l) => {
                const pai = porId.get(l.de);
                const filho = porId.get(l.para);
                if (!pai || !filho) return null;
                return (
                  <path
                    key={`${l.de}-${l.para}`}
                    d={caminhoLigacao(pai, filho)}
                    fill="none"
                    stroke={l.cor}
                    strokeWidth={filho.profundidade <= 1 ? 2.5 : 1.75}
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                );
              })}
            </svg>

            {desenho.baloes.map((balao) => {
              const ehRaiz = balao.no.pai_id === null;
              const estaSelecionado = selecionado === balao.no.id;
              const estaEditando = editando === balao.no.id;
              const qtdComentarios = comentariosPorNo.get(balao.no.id)?.length ?? 0;

              return (
                <div
                  key={balao.no.id}
                  className="absolute left-0 top-0"
                  style={{ transform: `translate(${balao.x}px, ${balao.y}px)`, width: balao.largura }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelecionado(balao.no.id);
                    if (!podeEditar || estaEditando) return;
                    arrastandoNo.current = {
                      id: balao.no.id,
                      x: e.clientX,
                      y: e.clientY,
                      baseX: balao.no.desloc_x ?? 0,
                      baseY: balao.no.desloc_y ?? 0,
                    };
                    (e.currentTarget.parentElement as HTMLElement | null)?.parentElement?.setPointerCapture?.(e.pointerId);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    comecarEdicao(balao.no.id);
                  }}
                >
                  <div
                    className={cn(
                      "relative rounded-xl px-3.5 py-2.5 text-sm leading-[19px] transition-shadow",
                      ehRaiz
                        ? "font-semibold text-white shadow-lg"
                        : "border-2 bg-base-900 font-medium text-ink-primary",
                      estaSelecionado && "ring-2 ring-offset-2 ring-offset-base-950",
                      podeEditar && "cursor-grab"
                    )}
                    style={{
                      minHeight: balao.altura,
                      // A raiz é preenchida, os ramos são contornados: o
                      // preenchimento é o que faz o olho achar o centro
                      // primeiro, sem precisar de tamanho muito maior.
                      backgroundColor: ehRaiz ? CORES_MAPA.azul : undefined,
                      borderColor: ehRaiz ? undefined : balao.cor,
                      ...(estaSelecionado ? { boxShadow: `0 0 0 2px ${ehRaiz ? CORES_MAPA.azul : balao.cor}` } : {}),
                    }}
                  >
                    {estaEditando ? (
                      <textarea
                        ref={textareaRef}
                        value={rascunho}
                        onChange={(e) => setRascunho(e.target.value)}
                        onBlur={confirmarEdicao}
                        onPointerDown={(e) => e.stopPropagation()}
                        rows={1}
                        className="w-full resize-none border-0 bg-transparent p-0 text-inherit leading-[19px] outline-none"
                        style={{ minHeight: balao.altura - 22 }}
                      />
                    ) : (
                      <span className="block whitespace-pre-wrap break-words">
                        {balao.no.texto || <span className="italic opacity-40">{t.baloVazio}</span>}
                      </span>
                    )}

                    {/* Contagem de comentários — some quando não há nenhum,
                        para não poluir um mapa que ninguém comentou. */}
                    {qtdComentarios > 0 && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          setSelecionado(balao.no.id);
                          setPainelComentarios(true);
                        }}
                        className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-base-800 px-1 text-[10px] font-semibold tabular-nums text-ink-secondary ring-1 ring-base-600"
                      >
                        {qtdComentarios}
                      </button>
                    )}
                  </div>

                  {/* Botão de abrir/fechar o ramo, colado na borda que aponta
                      para os filhos. */}
                  {balao.temFilhos && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => mudarNo(balao.no.id, { colapsado: !balao.no.colapsado })}
                      className="absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-base-600 bg-base-900 text-[11px] font-bold leading-none text-ink-secondary hover:text-ink-primary"
                      style={balao.lado === -1 ? { left: -10 } : { right: -10 }}
                      aria-label={balao.no.colapsado ? t.expandir : t.recolher}
                    >
                      {balao.no.colapsado ? balao.filhosOcultos || "+" : "−"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ajuda de teclado — fica no rodapé do canvas, discreta, porque
              atalho que ninguém descobre é atalho que não existe. */}
          {podeEditar && (
            <p className="pointer-events-none absolute bottom-3 left-4 text-[11px] text-ink-muted">{t.dicaTeclado}</p>
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Painel lateral do balão selecionado                             */}
        {/* -------------------------------------------------------------- */}
        {noSelecionado && (podeEditar || painelComentarios || comentariosDoSelecionado.length > 0) && (
          <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-base-700 bg-base-900/60 p-4">
            <p className="truncate text-xs font-medium text-ink-primary">{noSelecionado.texto || t.baloVazio}</p>

            {podeEditar && (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" className="px-2 py-1 text-[11px]" onClick={() => void criarBalao(noSelecionado.id)}>
                    <IconPlus className="h-3 w-3" /> {t.novoFilho}
                  </Button>
                  {noSelecionado.pai_id && (
                    <Button variant="ghost" className="px-2 py-1 text-[11px]" onClick={() => apagarBalao(noSelecionado.id)}>
                      <IconTrash className="h-3 w-3" /> {t.apagar}
                    </Button>
                  )}
                </div>

                {noSelecionado.pai_id && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                      <IconPalette className="h-3 w-3" /> {t.corDoRamo}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {/* Vazio = herda a cor do ramo. É a opção mais útil e
                          por isso vem primeiro. */}
                      <button
                        type="button"
                        onClick={() => mudarNo(noSelecionado.id, { cor: "" })}
                        className={cn(
                          "h-6 w-6 rounded-full border border-base-600 text-[9px] text-ink-muted",
                          !noSelecionado.cor && "ring-2 ring-accent ring-offset-2 ring-offset-base-900"
                        )}
                        title={t.corAutomatica}
                      >
                        A
                      </button>
                      {ORDEM_CORES.map((chave) => (
                        <button
                          key={chave}
                          type="button"
                          onClick={() => mudarNo(noSelecionado.id, { cor: chave })}
                          className={cn(
                            "h-6 w-6 rounded-full",
                            noSelecionado.cor === chave && "ring-2 ring-accent ring-offset-2 ring-offset-base-900"
                          )}
                          style={{ backgroundColor: CORES_MAPA[chave] }}
                          aria-label={chave}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Comentarios
              itens={comentariosDoSelecionado}
              podeComentar={podeComentar}
              meuNome={meuNome}
              rotulos={{
                titulo: t.comentarios,
                vazio: t.semComentarios,
                seuNome: t.seuNome,
                escreva: t.escrevaComentario,
                enviar: t.enviarComentario,
              }}
              aoEnviar={async (autor, texto) => {
                const r = await api.comentar(noSelecionado.id, autor, texto);
                if (!r.ok) {
                  setErro(r.error);
                  return false;
                }
                setComentarios((atual) => [
                  ...atual,
                  {
                    id: `local-${Date.now()}`,
                    mapa_id: mapaId,
                    no_id: noSelecionado.id,
                    autor: autor || meuNome,
                    texto,
                    created_at: new Date().toISOString(),
                  },
                ]);
                return true;
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function Comentarios({
  itens,
  podeComentar,
  meuNome,
  rotulos,
  aoEnviar,
}: {
  itens: MapaComentarioRow[];
  podeComentar: boolean;
  meuNome: string;
  rotulos: { titulo: string; vazio: string; seuNome: string; escreva: string; enviar: string };
  aoEnviar: (autor: string, texto: string) => Promise<boolean>;
}) {
  const [autor, setAutor] = useState(meuNome);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!podeComentar && itens.length === 0) return null;

  return (
    <div className="border-t border-base-800 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        <IconMessageCircle className="h-3 w-3" /> {rotulos.titulo}
      </p>

      {itens.length === 0 ? (
        <p className="text-[11px] text-ink-muted">{rotulos.vazio}</p>
      ) : (
        <ul className="mb-3 space-y-2.5">
          {itens.map((c) => (
            <li key={c.id} className="text-xs">
              <p className="font-medium text-ink-secondary">{c.autor}</p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-ink-primary">{c.texto}</p>
            </li>
          ))}
        </ul>
      )}

      {podeComentar && (
        <div className="space-y-2">
          {/* Quem chega pelo link não tem conta: o nome é o único jeito de a
              equipe saber de quem veio o recado. */}
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder={rotulos.seuNome}
            className="w-full rounded-lg border border-base-700 bg-base-950 px-2 py-1 text-xs text-ink-primary outline-none focus:border-accent"
          />
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={rotulos.escreva}
            rows={3}
            className="w-full resize-y rounded-lg border border-base-700 bg-base-950 px-2 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
          />
          <Button
            className="w-full px-2 py-1 text-[11px]"
            disabled={enviando || !texto.trim()}
            onClick={async () => {
              setEnviando(true);
              const ok = await aoEnviar(autor.trim(), texto.trim());
              setEnviando(false);
              if (ok) setTexto("");
            }}
          >
            <IconSend className="h-3 w-3" /> {rotulos.enviar}
          </Button>
        </div>
      )}
    </div>
  );
}
