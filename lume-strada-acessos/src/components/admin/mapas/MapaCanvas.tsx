"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ALTURA_IMAGEM,
  CORES_MAPA,
  ORDEM_CORES,
  corDoRamo,
  fonteCss,
  type MapaComentarioRow,
  type MapaNoRow,
} from "@/lib/types/mapa-mental";
import { caminhoLigacao, desenharMapa } from "@/lib/mapa-mental/layout";
import { urlImagemMapa } from "@/lib/mapa-mental/imagem";
import { useMapaAoVivo } from "@/lib/mapa-mental/aoVivo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import {
  IconPlus,
  IconTrash,
  IconMessageCircle,
  IconRotateCcw,
  IconTarget,
  IconPalette,
  IconSend,
  IconExternalLink,
  IconLoader,
  IconSun,
  IconMoon,
  IconCheck,
} from "@/components/ui/icons";
import { PainelAtalhos } from "./PainelAtalhos";
import { AnexosDoBalao } from "./AnexosDoBalao";
import { FormatoDoTexto } from "./FormatoDoTexto";
import { PaletaFerramentas, type ItemPaleta } from "./PaletaFerramentas";

type Resultado = { ok: true } | { ok: false; error: string };
type ResultadoNo = { ok: true; no: MapaNoRow } | { ok: false; error: string };

export interface ApiDoMapa {
  adicionar: (paiId: string, valores?: Record<string, unknown>) => Promise<ResultadoNo>;
  salvar: (noId: string, valores: Record<string, unknown>) => Promise<Resultado>;
  remover: (noId: string) => Promise<Resultado>;
  reorganizar: () => Promise<Resultado>;
  comentar: (noId: string, autor: string, texto: string) => Promise<Resultado>;
  /** Só existe no painel: quem edita pelo link público não envia arquivo. */
  enviarImagem?: (arquivo: File) => Promise<{ ok: true; caminho: string } | { ok: false; error: string }>;
}

interface Props {
  mapaId: string;
  nosIniciais: MapaNoRow[];
  comentariosIniciais: MapaComentarioRow[];
  meuNome: string;
  podeEditar: boolean;
  podeComentar: boolean;
  api: ApiDoMapa;
  cabecalho?: ReactNode;
  /** Avisa o pai quando há edição aberta ou gravação em voo — quem tem o botão "voltar" usa isto para perguntar antes de sair. */
  aoMudarPendencias?: (temPendencias: boolean) => void;
}

type Ferramenta = "selecionar" | "mao";

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
  aoMudarPendencias,
}: Props) {
  const { dict } = useLocale();
  const t = dict.mapaMental;

  const [nos, setNos] = useState<MapaNoRow[]>(nosIniciais);
  const [comentarios, setComentarios] = useState<MapaComentarioRow[]>(comentariosIniciais);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const [ferramenta, setFerramenta] = useState<Ferramenta>("selecionar");
  const [fundoClaro, setFundoClaro] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  // Quantas gravações estão em voo agora. O mapa salva sozinho a cada
  // alteração — este contador existe para a pessoa VER isso acontecendo, em
  // vez de ter de acreditar.
  const [emVoo, setEmVoo] = useState(0);
  const [espacoPressionado, setEspacoPressionado] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const areaRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // A ferramenta em uso agora: o espaço vira mãozinha temporária, que é como
  // todo editor de canvas funciona — sem isso, quem está no modo de editar
  // teria de trocar de ferramenta só para deslizar dois centímetros.
  const modoMao = ferramenta === "mao" || espacoPressionado;

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

  const mudarNo = useCallback(
    (noId: string, valores: Partial<MapaNoRow>) => {
      const base = nosPorId.get(noId);
      setNos((atual) => atual.map((n) => (n.id === noId ? { ...n, ...valores } : n)));
      setEmVoo((n) => n + 1);
      void api
        .salvar(noId, valores as Record<string, unknown>)
        .then((r) => {
          if (!r.ok) setErro(r.error);
        })
        .finally(() => setEmVoo((n) => n - 1));
      if (base) avisar({ tipo: "no", no: { ...base, ...valores } });
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

  const encaixar = useCallback(() => {
    const area = areaRef.current;
    if (!area || desenho.baloes.length === 0) return;
    const { minX, minY, maxX, maxY } = desenho.limites;
    const caixa = area.getBoundingClientRect();
    const margem = 72;
    const escala = Math.max(
      ZOOM_MIN,
      Math.min(
        ZOOM_MAX,
        Math.min((caixa.width - margem) / Math.max(maxX - minX, 1), (caixa.height - margem) / Math.max(maxY - minY, 1))
      )
    );
    setZoom(escala);
    setPan({ x: -((minX + maxX) / 2) * escala, y: -((minY + maxY) / 2) * escala });
  }, [desenho]);

  const jaEncaixou = useRef(false);
  useEffect(() => {
    if (jaEncaixou.current || desenho.baloes.length === 0) return;
    jaEncaixou.current = true;
    encaixar();
  }, [desenho, encaixar]);

  // Espaço = mãozinha temporária. Fica no `window` porque a tecla precisa
  // valer mesmo quando o foco está num campo do painel lateral.
  useEffect(() => {
    function desceu(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      const digitando = alvo && (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA");
      if (e.code === "Space" && !digitando) {
        e.preventDefault();
        setEspacoPressionado(true);
      }
    }
    function subiu(e: KeyboardEvent) {
      if (e.code === "Space") setEspacoPressionado(false);
    }
    window.addEventListener("keydown", desceu);
    window.addEventListener("keyup", subiu);
    return () => {
      window.removeEventListener("keydown", desceu);
      window.removeEventListener("keyup", subiu);
    };
  }, []);

  // ---------------------------------------------------------------------
  // Pendências, aviso de saída e tela cheia
  // ---------------------------------------------------------------------
  const temPendencias = editando !== null || emVoo > 0;

  useEffect(() => {
    aoMudarPendencias?.(temPendencias);
  }, [temPendencias, aoMudarPendencias]);

  // Fechar a aba com uma edição aberta perderia o que está no campo — o
  // navegador só deixa avisar, não impedir, e é o suficiente.
  useEffect(() => {
    if (!temPendencias) return;
    function avisar(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [temPendencias]);

  const raizRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function mudou() {
      setTelaCheia(document.fullscreenElement === raizRef.current);
    }
    document.addEventListener("fullscreenchange", mudou);
    return () => document.removeEventListener("fullscreenchange", mudou);
  }, []);

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await raizRef.current?.requestFullscreen();
    } catch {
      // Navegador ou permissão sem tela cheia: o mapa continua funcionando
      // do mesmo jeito, então não vale interromper com um erro.
    }
  }

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

  async function criarBalao(paiId: string) {
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
  }

  function apagarBalao(noId: string) {
    if (!podeEditar) return;
    const no = nosPorId.get(noId);
    if (!no || no.pai_id === null) return;

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

  function aoTeclar(e: React.KeyboardEvent) {
    if (!podeEditar) return;

    if (editando) {
      if (e.key === "Escape") {
        e.preventDefault();
        confirmarEdicao();
      } else if (e.key === "Enter" && !e.shiftKey) {
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

    const alvo = selecionado;
    if (!alvo) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const no = nosPorId.get(alvo);
      void criarBalao(no?.pai_id ?? alvo);
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

  function aoRolar(e: React.WheelEvent) {
    e.preventDefault();
    const area = areaRef.current;
    if (!area) return;
    const caixa = area.getBoundingClientRect();
    const cx = e.clientX - caixa.left - caixa.width / 2;
    const cy = e.clientY - caixa.top - caixa.height / 2;
    const novo = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    const fator = novo / zoom;
    setPan((p) => ({ x: cx - (cx - p.x) * fator, y: cy - (cy - p.y) * fator }));
    setZoom(novo);
  }

  const arrastandoFundo = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const arrastandoNo = useRef<{ id: string; x: number; y: number; baseX: number; baseY: number; moveu: boolean } | null>(null);

  function fundoPressionado(e: React.PointerEvent) {
    // Botão do meio sempre navega, seja qual for a ferramenta — é o gesto que
    // todo mundo já traz de outros programas.
    const navegar = modoMao || e.button === 1;
    if (e.button !== 0 && e.button !== 1) return;
    if (navegar) {
      arrastandoFundo.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    setSelecionado(null);
  }

  function ponteiroMoveu(e: React.PointerEvent) {
    if (arrastandoFundo.current) {
      const d = arrastandoFundo.current;
      setPan({ x: d.panX + (e.clientX - d.x), y: d.panY + (e.clientY - d.y) });
      return;
    }
    const d = arrastandoNo.current;
    if (d) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      // Só vira arraste depois de 3px: sem essa folga, todo clique para
      // selecionar deixaria o balão um fio de cabelo fora do lugar.
      if (!d.moveu && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      d.moveu = true;
      setNos((atual) =>
        atual.map((n) => (n.id === d.id ? { ...n, desloc_x: d.baseX + dx / zoom, desloc_y: d.baseY + dy / zoom } : n))
      );
    }
  }

  function ponteiroSoltou() {
    arrastandoFundo.current = null;
    const d = arrastandoNo.current;
    arrastandoNo.current = null;
    if (d?.moveu) {
      const no = nosPorId.get(d.id);
      if (no) mudarNo(d.id, { desloc_x: no.desloc_x, desloc_y: no.desloc_y });
    }
  }

  function reorganizar() {
    setNos((atual) => atual.map((n) => ({ ...n, desloc_x: null, desloc_y: null, lado: null })));
    avisar({ tipo: "reorganizar" });
    void api.reorganizar().then((r) => {
      if (!r.ok) setErro(r.error);
    });
  }

  // A paleta: como se aponta, como se enxerga, como a tela se comporta.
  const gruposDaPaleta: ItemPaleta[][] = [
    [
      {
        chave: "selecionar",
        rotulo: t.ferramentaSelecionar,
        dica: t.ferramentaSelecionarHint,
        icone: <IconSeta />,
        ativo: ferramenta === "selecionar" && !espacoPressionado,
        aoClicar: () => setFerramenta("selecionar"),
      },
      {
        chave: "mao",
        rotulo: t.ferramentaMao,
        dica: t.ferramentaMaoHint,
        icone: <IconMao />,
        ativo: modoMao,
        aoClicar: () => setFerramenta("mao"),
      },
    ],
    [
      { chave: "encaixar", rotulo: t.encaixar, icone: <IconTarget className="h-4 w-4" />, aoClicar: encaixar },
      ...(podeEditar
        ? [
            {
              chave: "reorganizar",
              rotulo: t.reorganizar,
              dica: t.reorganizarHint,
              icone: <IconRotateCcw className="h-4 w-4" />,
              aoClicar: reorganizar,
            },
          ]
        : []),
    ],
    [
      {
        chave: "fundo",
        rotulo: fundoClaro ? t.fundoEscuro : t.fundoClaro,
        icone: fundoClaro ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />,
        aoClicar: () => setFundoClaro((c) => !c),
      },
      {
        chave: "telaCheia",
        rotulo: telaCheia ? t.sairTelaCheia : t.telaCheia,
        icone: <IconTelaCheia saindo={telaCheia} />,
        ativo: telaCheia,
        aoClicar: () => void alternarTelaCheia(),
      },
    ],
  ];

  const noSelecionado = selecionado ? nosPorId.get(selecionado) : null;
  const comentariosDoSelecionado = selecionado ? (comentariosPorNo.get(selecionado) ?? []) : [];

  return (
    // A classe de fundo envolve TUDO (barra e painel juntos, não só a tela do
    // mapa): meia interface clara e meia escura seria pior do que qualquer
    // uma das duas.
    <div ref={raizRef} className={cn("mapa-area flex h-full flex-col", fundoClaro ? "mapa-claro" : "mapa-escuro")}>
      {/* ================================================================ */}
      {/* BARRA DE FERRAMENTAS                                              */}
      {/* ================================================================ */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {cabecalho}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {pessoas.length > 0 && (
            <div className="mr-1 flex items-center -space-x-2" title={pessoas.map((p) => p.nome).join(", ")}>
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

          <div className="flex items-center gap-1 rounded-lg border border-base-700 bg-base-900/70 px-1 py-0.5 text-xs text-ink-secondary">
            <button type="button" className="px-1.5 py-1 hover:text-ink-primary" onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z / 1.2))} aria-label={t.afastar}>
              −
            </button>
            <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <button type="button" className="px-1.5 py-1 hover:text-ink-primary" onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z * 1.2))} aria-label={t.aproximar}>
              +
            </button>
          </div>

          {podeEditar && (
            // O mapa já salva sozinho a cada alteração. Este botão fecha a
            // edição aberta e confirma que não sobrou nada em voo — é a
            // tranquilidade de "está salvo", não um segundo jeito de salvar,
            // e por isso ele diz "Tudo salvo" quando não há o que fazer.
            <Button
              variant="ghost"
              className="px-2.5 py-1 text-xs"
              onClick={confirmarEdicao}
              disabled={!temPendencias}
              title={t.salvar}
            >
              {emVoo > 0 ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconCheck className="h-3.5 w-3.5 text-status-good" />}
              {emVoo > 0 ? t.salvandoLabel : temPendencias ? t.salvar : t.tudoSalvo}
            </Button>
          )}
        </div>
      </div>

      {erro && <p className="mb-2 text-xs text-danger">{erro}</p>}

      <div className="flex min-h-0 flex-1 gap-4">
        {/* ============================================================== */}
        {/* O CANVAS                                                        */}
        {/* ============================================================== */}
        <div
          ref={areaRef}
          tabIndex={0}
          onKeyDown={aoTeclar}
          onWheel={aoRolar}
          onPointerDown={fundoPressionado}
          onPointerMove={ponteiroMoveu}
          onPointerUp={ponteiroSoltou}
          onPointerCancel={ponteiroSoltou}
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-base-700 bg-base-950/60 outline-none transition-colors focus:border-base-600",
            modoMao ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          )}
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(var(--glow-rgb) / 0.055) 1px, transparent 0)",
            backgroundSize: `${26 * zoom}px ${26 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          <div
            className="absolute left-1/2 top-1/2"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
          >
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
                    opacity={0.9}
                  />
                );
              })}
            </svg>

            {desenho.baloes.map((balao) => {
              const ehRaiz = balao.no.pai_id === null;
              const estaSelecionado = selecionado === balao.no.id;
              const estaEditando = editando === balao.no.id;
              const qtdComentarios = comentariosPorNo.get(balao.no.id)?.length ?? 0;
              const imagem = urlImagemMapa(balao.no.imagem_path);

              return (
                <div
                  key={balao.no.id}
                  className="absolute left-0 top-0"
                  style={{ transform: `translate(${balao.x}px, ${balao.y}px)`, width: balao.largura }}
                  onPointerDown={(e) => {
                    if (modoMao) return; // com a mãozinha, o balão não sai do lugar
                    e.stopPropagation();
                    setSelecionado(balao.no.id);
                    if (!podeEditar || estaEditando) return;
                    arrastandoNo.current = {
                      id: balao.no.id,
                      x: e.clientX,
                      y: e.clientY,
                      baseX: balao.no.desloc_x ?? 0,
                      baseY: balao.no.desloc_y ?? 0,
                      moveu: false,
                    };
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    comecarEdicao(balao.no.id);
                  }}
                >
                  {/* ------------------------------------------------------ */}
                  {/* O BALÃO                                                 */}
                  {/* ------------------------------------------------------ */}
                  {/* Cartão da plataforma, não adesivo colorido: a mesma
                      borda, o mesmo raio e o mesmo fundo dos cards do resto
                      do sistema. A cor do ramo entra como um filete de 3px na
                      lateral — o mesmo recurso dos blocos da Ordem de Externa
                      —, o que separa os ramos de relance sem que cada balão
                      vire um retângulo pintado. */}
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-xl transition-shadow",
                      ehRaiz
                        ? "bg-accent text-white shadow-[0_8px_28px_-6px_rgb(var(--color-accent)/0.55)]"
                        : "border border-base-700 bg-base-900/95 text-ink-primary shadow-[0_2px_10px_-4px_rgb(0_0_0/0.5)]",
                      !ehRaiz && balao.profundidade === 1 && "bg-base-850/95",
                      estaSelecionado && !ehRaiz && "border-transparent",
                      !modoMao && podeEditar && "cursor-grab active:cursor-grabbing"
                    )}
                    style={{
                      minHeight: balao.altura,
                      ...(estaSelecionado ? { boxShadow: `0 0 0 2px ${ehRaiz ? CORES_MAPA.azul : balao.cor}` } : {}),
                    }}
                  >
                    {/* O filete do ramo, colado no lado que aponta para o pai. */}
                    {!ehRaiz && (
                      <span
                        className="absolute inset-y-0 w-[3px]"
                        style={{ backgroundColor: balao.cor, ...(balao.lado === -1 ? { right: 0 } : { left: 0 }) }}
                        aria-hidden
                      />
                    )}

                    <div className={cn("px-3.5 py-2.5", !ehRaiz && (balao.lado === -1 ? "pr-4" : "pl-4"))}>
                      {imagem && (
                        // Miniatura por cima do texto: quem anexou uma
                        // referência visual quer vê-la sem clicar.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagem}
                          alt=""
                          draggable={false}
                          className="mb-2 w-full rounded-lg object-cover"
                          style={{ height: ALTURA_IMAGEM }}
                        />
                      )}

                      {estaEditando ? (
                        <textarea
                          ref={textareaRef}
                          value={rascunho}
                          onChange={(e) => setRascunho(e.target.value)}
                          onBlur={confirmarEdicao}
                          onPointerDown={(e) => e.stopPropagation()}
                          rows={1}
                          className="w-full resize-none border-0 bg-transparent p-0 text-inherit outline-none"
                          style={{ ...estiloDoTexto(balao.no, ehRaiz), minHeight: 19 }}
                        />
                      ) : (
                        <span
                          className="block whitespace-pre-wrap break-words"
                          style={estiloDoTexto(balao.no, ehRaiz)}
                        >
                          {balao.no.texto || <span className="italic opacity-40">{t.baloVazio}</span>}
                        </span>
                      )}

                      {balao.no.link && (
                        <a
                          href={balao.no.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onPointerDown={(e) => e.stopPropagation()}
                          className={cn(
                            "mt-1.5 flex items-center gap-1 truncate text-[11px] underline-offset-2 hover:underline",
                            ehRaiz ? "text-white/80" : "text-accent"
                          )}
                        >
                          <IconExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{balao.no.link.replace(/^https?:\/\//, "")}</span>
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
                      onClick={() => mudarNo(balao.no.id, { colapsado: !balao.no.colapsado })}
                      className="absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-base-600 bg-base-900 text-[11px] font-bold leading-none text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
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

          <PaletaFerramentas grupos={gruposDaPaleta} />

          {/* A legenda de atalhos, escrita na página. */}
          {podeEditar && <PainelAtalhos />}
        </div>

        {/* ============================================================== */}
        {/* PAINEL DO BALÃO                                                 */}
        {/* ============================================================== */}
        {noSelecionado && (podeEditar || podeComentar || comentariosDoSelecionado.length > 0) && (
          <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-base-700 bg-base-900/70 p-4 backdrop-blur-sm">
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

                <FormatoDoTexto no={noSelecionado} aoMudar={(valores) => mudarNo(noSelecionado.id, valores)} />

                <AnexosDoBalao
                  key={noSelecionado.id}
                  no={noSelecionado}
                  podeEnviarImagem={Boolean(api.enviarImagem)}
                  aoMudarLink={(link) => mudarNo(noSelecionado.id, { link })}
                  aoEnviarImagem={async (arquivo) => {
                    if (!api.enviarImagem) return;
                    const r = await api.enviarImagem(arquivo);
                    if (!r.ok) setErro(r.error);
                    else mudarNo(noSelecionado.id, { imagem_path: r.caminho });
                  }}
                  aoRemoverImagem={() => mudarNo(noSelecionado.id, { imagem_path: null })}
                />
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

/**
 * O estilo do texto de um balão.
 *
 * Vive junto do desenho porque tem de bater com o que o cálculo de posição
 * assumiu (ver `medirBalao`): se aqui o corpo fosse um e lá outro, o balão
 * ficaria maior que o espaço reservado para ele e passaria por cima do
 * vizinho.
 */
function estiloDoTexto(no: MapaNoRow, ehRaiz: boolean): React.CSSProperties {
  const corpo = no.tamanho || (ehRaiz ? 16 : 14);
  return {
    fontFamily: fonteCss(no.fonte),
    fontSize: corpo,
    lineHeight: `${Math.round(corpo * 1.36)}px`,
    fontWeight: no.negrito || ehRaiz ? 600 : 500,
    fontStyle: no.italico ? "italic" : "normal",
  };
}

/** A seta do cursor, para o botão parecer o que ele faz. */
function IconSeta() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M5.5 2.8a1 1 0 0 1 1.6-.75l11.2 8.6a1 1 0 0 1-.5 1.79l-4.9.5a1 1 0 0 0-.75.46l-2.7 4.3a1 1 0 0 1-1.85-.4L5.5 2.8Z" />
    </svg>
  );
}

/** Setas para fora (entrar) ou para dentro (sair) da tela cheia. */
function IconTelaCheia({ saindo }: { saindo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {saindo ? (
        <>
          <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
        </>
      ) : (
        <>
          <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
        </>
      )}
    </svg>
  );
}

/** A mãozinha de arrastar. */
function IconMao() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M15 11.5V7a1.5 1.5 0 0 1 3 0v6.5a7 7 0 0 1-7 7h-1a6 6 0 0 1-5.2-3l-1.6-2.8a1.5 1.5 0 0 1 2.5-1.6L9 15.5V11" />
    </svg>
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

