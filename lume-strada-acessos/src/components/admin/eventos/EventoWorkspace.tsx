"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconChevronLeft } from "@/components/ui/icons";
import { Grade, useRelogio } from "@/components/admin/eventos/Grade";
import { PainelDoBloco, type ValoresDoBloco } from "@/components/admin/eventos/PainelDoBloco";
import { fusoValido } from "@/lib/utils/fusos";
import { modoDoStatus, type BlocoRow, type ModoEvento } from "@/lib/types/eventos";
import type { EventoCompleto } from "@/app/admin/eventos/[id]/data";
import type { Colisao } from "@/lib/eventos/cascata";
import {
  aplicarAtrasoNoBloco,
  atualizarBloco,
  criarBloco,
  darPlay,
  empurrarBlocos,
  encerrarEvento,
  removerBloco,
} from "@/app/admin/eventos/[id]/actions";

/**
 * A tela do evento — três modos, uma grade.
 *
 * O modo ABRE pelo status (ver `modoDoStatus`) e continua trocável na mão: o
 * sistema já sabe se o evento é daqui a duas semanas ou está acontecendo
 * agora, então perguntar seria fazer a pessoa responder o que ele já sabe —
 * mas quem quer conferir a grade no meio do show tem que conseguir.
 *
 * O ATRASO no Ao Vivo não abre formulário. Toca no bloco, aparece uma barra
 * embaixo — onde o polegar está, não onde o mouse está — com −15, +15 e +30.
 * Um toque, e a grade inteira já andou. Era esse o pedido do mapa: "um clique
 * no bloco. O que é hora cravada não se mexe".
 */

export function EventoWorkspace({ dados, modoInicial }: { dados: EventoCompleto; modoInicial: ModoEvento }) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, startTransition] = useTransition();

  const { evento, ambientes, blocos, capturas, equipe } = dados;
  const zona = fusoValido(evento.fuso);

  const [modo, setModo] = useState<ModoEvento>(modoInicial);
  const [selecionado, setSelecionado] = useState<BlocoRow | null>(null);
  const [painelAberto, setPainelAberto] = useState(false);
  const [rascunho, setRascunho] = useState<{ ambienteId: string; inicio: string } | null>(null);
  const [colisoes, setColisoes] = useState<{ minutos: number; lista: Colisao[] } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const rodando = !!evento.iniciado_em;

  function traduzirErro(codigo: string): string {
    const mapa: Record<string, string> = {
      BLOCO_SEM_TITULO: t.erroBlocoSemTitulo,
      BLOCO_SEM_INICIO: t.erroBlocoSemInicio,
      BLOCO_NAO_ENCONTRADO: t.erroBlocoNaoEncontrado,
      EVENTO_NAO_ENCONTRADO: t.erroEventoNaoEncontrado,
      OCORRENCIA_VAZIA: t.erroOcorrenciaVazia,
    };
    return mapa[codigo] ?? codigo;
  }

  function fecharPainel() {
    setPainelAberto(false);
    setRascunho(null);
  }

  function salvarBloco(valores: ValoresDoBloco) {
    setErro(null);
    startTransition(async () => {
      const r = selecionado
        ? await atualizarBloco(evento.id, selecionado.id, {
            ambienteId: valores.ambienteId,
            titulo: valores.titulo,
            tipo: valores.tipo,
            ancora: valores.ancora,
            inicio: valores.inicio,
            duracaoMin: valores.duracaoMin,
            responsavelId: valores.responsavelId,
            observacoes: valores.observacoes,
          })
        : await criarBloco(evento.id, {
            ambienteId: valores.ambienteId,
            titulo: valores.titulo,
            tipo: valores.tipo,
            ancora: valores.ancora,
            inicio: valores.inicio,
            duracaoMin: valores.duracaoMin,
            responsavelId: valores.responsavelId,
            observacoes: valores.observacoes,
          });

      if (!r.ok) {
        setErro(traduzirErro(r.error));
        return;
      }
      fecharPainel();
      setSelecionado(null);
      router.refresh();
    });
  }

  function apagarBloco() {
    if (!selecionado) return;
    startTransition(async () => {
      await removerBloco(evento.id, selecionado.id);
      fecharPainel();
      setSelecionado(null);
      router.refresh();
    });
  }

  function atrasar(minutos: number) {
    if (!selecionado) return;
    setErro(null);
    startTransition(async () => {
      const r = await aplicarAtrasoNoBloco(evento.id, selecionado.id, minutos);
      if (!r.ok) {
        setErro(traduzirErro(r.error));
        return;
      }
      // As colisões não param nada: a grade já andou. Elas são a pergunta que
      // vem depois, e a resposta padrão é "deixa como está".
      if (r.colisoes.length) setColisoes({ minutos, lista: r.colisoes });
      setSelecionado(null);
      router.refresh();
    });
  }

  function play() {
    startTransition(async () => {
      const r = await darPlay(evento.id);
      if (r.ok && r.colisoes.length) setColisoes({ minutos: 0, lista: r.colisoes });
      setModo("aovivo");
      router.refresh();
    });
  }

  function encerrar() {
    startTransition(async () => {
      await encerrarEvento(evento.id);
      setModo("fechamento");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {t.voltarParaEventos}
      </Link>

      <Cabecalho
        nome={evento.nome}
        local={evento.local}
        zona={zona}
        rodando={rodando}
        modo={modo}
        onModo={setModo}
        onPlay={play}
        onEncerrar={encerrar}
        ocupado={pendente}
      />

      {erro && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">{erro}</p>
      )}

      {modo !== "fechamento" && (
        <Grade
          ambientes={ambientes}
          blocos={blocos}
          capturas={capturas}
          fuso={evento.fuso}
          inicio={evento.inicio}
          fim={evento.fim}
          modo={modo === "aovivo" ? "aovivo" : "plano"}
          blocoSelecionadoId={selecionado?.id ?? null}
          onAbrirBloco={(b) => {
            setSelecionado(b);
            // No Plano o toque já abre a edição. No Ao Vivo ele arma a barra
            // de atraso — abrir um formulário no meio do show seria pedir
            // para a pessoa parar de olhar o palco.
            setPainelAberto(modo === "plano");
          }}
          onCriarAqui={
            modo === "plano"
              ? (ambienteId, inicio) => {
                  setSelecionado(null);
                  setRascunho({ ambienteId, inicio });
                  setPainelAberto(true);
                }
              : undefined
          }
        />
      )}

      {modo === "plano" && ambientes.length > 0 && (
        <p className="px-1 text-[11px] text-ink-muted">{t.gradeCliqueParaCriar}</p>
      )}

      {modo === "aovivo" && !rodando && (
        <p className="px-1 text-[11px] text-ink-muted">{t.eventoNaoComecou}</p>
      )}

      {modo === "fechamento" && <EmConstrucaoDoModo />}

      {modo === "aovivo" && selecionado && !painelAberto && (
        <BarraDeAtraso
          titulo={selecionado.titulo}
          ocupado={pendente}
          onAtraso={atrasar}
          onAbrir={() => setPainelAberto(true)}
          onFechar={() => setSelecionado(null)}
        />
      )}

      {painelAberto && (
        <PainelDoBloco
          bloco={selecionado}
          rascunho={rascunho}
          ambientes={ambientes}
          equipe={equipe}
          fuso={evento.fuso}
          salvando={pendente}
          onSalvar={salvarBloco}
          onRemover={apagarBloco}
          onFechar={fecharPainel}
        />
      )}

      {colisoes && (
        <DialogoDeColisao
          minutos={colisoes.minutos}
          lista={colisoes.lista}
          ocupado={pendente}
          onEmpurrar={(ids) => {
            startTransition(async () => {
              await empurrarBlocos(evento.id, ids, colisoes.minutos);
              setColisoes(null);
              router.refresh();
            });
          }}
          onFechar={() => setColisoes(null)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------

function Cabecalho({
  nome,
  local,
  zona,
  rodando,
  modo,
  onModo,
  onPlay,
  onEncerrar,
  ocupado,
}: {
  nome: string;
  local: string | null;
  zona: string;
  rodando: boolean;
  modo: ModoEvento;
  onModo: (m: ModoEvento) => void;
  onPlay: () => void;
  onEncerrar: () => void;
  ocupado: boolean;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const agora = useRelogio();

  const relogio =
    agora === null
      ? "--:--:--"
      : new Intl.DateTimeFormat("pt-BR", {
          timeZone: zona,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date(agora));

  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full opacity-[0.14] blur-[90px]"
        style={{ background: "rgb(var(--color-accent))" }}
      />

      <div className="relative px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">{nome}</h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {local || t.eventoSemLocal}
            </p>
          </div>

          <div className="text-right">
            <p
              className="font-mono text-2xl tabular-nums leading-none"
              style={{ color: "rgb(var(--color-accent))", textShadow: "0 0 20px rgb(var(--color-accent) / 0.5)" }}
            >
              {relogio}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
              {zona.split("/").pop()?.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Modo chave="plano" atual={modo} onClick={onModo} rotulo={t.modoPlano} quando={t.modoPlanoQuando} />
          <Modo chave="aovivo" atual={modo} onClick={onModo} rotulo={t.modoAoVivo} quando={t.modoAoVivoQuando} />
          <Modo chave="fechamento" atual={modo} onClick={onModo} rotulo={t.modoFechamento} quando={t.modoFechamentoQuando} />

          <span className="ml-auto flex items-center gap-2">
            {!rodando ? (
              <button
                type="button"
                onClick={onPlay}
                disabled={ocupado}
                title={t.darOPlayAjuda}
                className="rounded-full px-4 py-2 text-xs font-semibold text-black transition disabled:opacity-40"
                style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.5)" }}
              >
                {t.darOPlay}
              </button>
            ) : (
              <button
                type="button"
                onClick={onEncerrar}
                disabled={ocupado}
                title={t.encerrarAjuda}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-40"
              >
                {t.encerrar}
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function Modo({
  chave,
  atual,
  onClick,
  rotulo,
  quando,
}: {
  chave: ModoEvento;
  atual: ModoEvento;
  onClick: (m: ModoEvento) => void;
  rotulo: string;
  quando: string;
}) {
  const ativo = atual === chave;
  return (
    <button
      type="button"
      onClick={() => onClick(chave)}
      className={cn(
        "relative overflow-hidden rounded-xl border px-3.5 py-2 text-left transition",
        ativo ? "border-accent/50 bg-accent/[0.08]" : "border-white/10 hover:border-white/25"
      )}
    >
      {ativo && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 10px rgb(var(--color-accent))" }}
        />
      )}
      <span className={cn("block text-[13px] font-medium", ativo ? "text-white" : "text-white/60")}>{rotulo}</span>
      <span className="block font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/30">{quando}</span>
    </button>
  );
}

/** A barra do polegar: −15, +15, +30. Fixa embaixo, porque é onde a mão está com o celular na mão no meio do show. */
function BarraDeAtraso({
  titulo,
  ocupado,
  onAtraso,
  onAbrir,
  onFechar,
}: {
  titulo: string;
  ocupado: boolean;
  onAtraso: (min: number) => void;
  onAbrir: () => void;
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-4 sm:px-6">
      <div className="ev-console mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-white/15 px-4 py-3 shadow-2xl">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">{t.atrasouTitulo}</p>
          <p className="truncate text-[13px] font-medium text-white">{titulo}</p>
        </div>

        {[-15, 15, 30].map((min) => (
          <button
            key={min}
            type="button"
            disabled={ocupado}
            onClick={() => onAtraso(min)}
            className={cn(
              "rounded-lg border px-3.5 py-2 font-mono text-sm tabular-nums transition disabled:opacity-40",
              min < 0
                ? "border-white/15 text-white/60 hover:border-white/35 hover:text-white"
                : "border-accent/50 text-accent hover:bg-accent/10"
            )}
          >
            {min > 0 ? `+${min}` : min}
          </button>
        ))}

        <button
          type="button"
          onClick={onAbrir}
          className="rounded-lg border border-white/12 px-3 py-2 text-xs text-white/60 transition hover:text-white"
        >
          {t.atrasoAbrirBloco}
        </button>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg px-2 py-2 text-xs text-white/40 transition hover:text-white"
        >
          {dict.common.fechar}
        </button>
      </div>
    </div>
  );
}

/** O app aponta e pergunta. Nunca decide sozinho. */
function DialogoDeColisao({
  minutos,
  lista,
  ocupado,
  onEmpurrar,
  onFechar,
}: {
  minutos: number;
  lista: Colisao[];
  ocupado: boolean;
  onEmpurrar: (ids: string[]) => void;
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;

  function frase(c: Colisao): string {
    const modelo =
      c.tipo === "sobreposicao"
        ? t.colisaoSobreposicao
        : c.tipo === "mesma_pessoa"
          ? t.colisaoMesmaPessoa
          : t.colisaoOrdemTrocada;
    return modelo.replace("{a}", c.titulo).replace("{b}", c.contraTitulo);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-[1px] sm:items-center">
      <div className="ev-console relative w-full max-w-lg overflow-hidden rounded-2xl border border-danger/30 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />
        <div className="relative px-5 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-danger">{t.colisaoTitulo}</p>

          <ul className="mt-4 space-y-2">
            {lista.map((c) => (
              <li key={`${c.tipo}-${c.blocoId}-${c.contraId}`} className="rounded-lg border border-white/10 bg-black/40 px-3.5 py-3">
                <p className="text-[13px] leading-snug text-white/85">{frase(c)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {minutos !== 0 && (
              <button
                type="button"
                disabled={ocupado}
                onClick={() => onEmpurrar(lista.map((c) => c.blocoId))}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
                style={{ background: "rgb(var(--color-accent))" }}
              >
                {t.colisaoEmpurrarTambem}
              </button>
            )}
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 transition hover:text-white"
            >
              {t.colisaoDeixarComoEsta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmConstrucaoDoModo() {
  const { dict } = useLocale();
  return (
    <div className="ev-console relative overflow-hidden rounded-2xl border border-white/10 px-6 py-10 text-center">
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />
      <p className="relative font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
        {dict.eventos.emConstrucaoTitulo}
      </p>
    </div>
  );
}
