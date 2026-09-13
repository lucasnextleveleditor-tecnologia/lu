"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconX, IconCheck } from "@/components/ui/icons";
import { CATEGORIAS_CUSTO, type CategoriaCusto, type CustoRow, type EquipeEventoRow } from "@/lib/types/eventos";
import { criarCusto, atualizarCusto, conferirCusto, conferirTodosOsCustos, removerCusto } from "@/app/admin/eventos/[id]/actions";

/**
 * A GAVETA DE CUSTOS — o dinheiro lançado ANTES do fechamento.
 *
 * O fechamento só sabia somar cachê, porque cachê nasce da escala. Todo o
 * resto do dinheiro de um evento — van, gerador, alimentação, estacionamento,
 * locação de lente, pedágio, alvará — não tinha onde morar, e o balanço
 * fechava com metade da conta.
 *
 * O QUANDO importa mais do que o quê. Quem produz evento sabe o valor da van
 * na terça, o do gerador na quarta e o da alimentação na quinta. Obrigar tudo
 * a ser digitado na madrugada de domingo, junto com o balanço, é a receita
 * para perder nota e chutar número. Então a gaveta existe o tempo todo, e o
 * fechamento vira o que sempre deveria ter sido: conferir o que já está aqui e
 * acrescentar o imprevisto que apareceu no dia.
 *
 * Por isso a despesa nasce PREVISTA. Na terça ainda é orçamento; quando o
 * valor real chega, a mesma linha vira realizada. Sem essa distinção o total
 * mente das duas formas possíveis — ou some com o que ainda não confirmou, ou
 * finge que uma estimativa é um fato.
 *
 * O CACHÊ CONTINUA VINDO DA ESCALA e aparece aqui como uma linha de leitura,
 * não como item editável. Duplicar o número em dois lugares é como ele passa a
 * divergir; quem quer mudar cachê muda na Equipe, que é onde ele significa
 * alguma coisa.
 */

const CAMPO =
  "w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 transition focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/25";
const ROTULO = "font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40";

export function GavetaCustos({
  eventoId,
  custos,
  equipe,
  usaCache,
  onFechar,
}: {
  eventoId: string;
  custos: CustoRow[];
  equipe: EquipeEventoRow[];
  /** Sem cachê ligado nos Ajustes, a linha da equipe não faz sentido nenhum. */
  usaCache: boolean;
  onFechar: () => void;
}) {
  const { dict, fmtMoeda } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaCusto>("transporte");
  const [valor, setValor] = useState("");
  const [previsto, setPrevisto] = useState(true);

  const ERROS: Record<string, string> = {
    CUSTO_SEM_DESCRICAO: t.erroCustoSemDescricao,
    CUSTO_CATEGORIA_INVALIDA: t.erroCustoCategoria,
  };

  function reportar(r: { ok: true } | { ok: true; id: string } | { ok: false; error: string }): boolean {
    if (r.ok) {
      setErro(null);
      return true;
    }
    setErro(ERROS[r.error] ?? r.error);
    return false;
  }

  const daEquipe = usaCache
    ? equipe.reduce((s, p) => s + Number(p.cache ?? 0) + Number(p.extras ?? 0), 0)
    : 0;
  const daProducao = custos.reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const porConferir = custos.filter((c) => !c.conferido_em).length;

  function lancar() {
    const numero = Number(valor.replace(",", "."));
    iniciar(async () => {
      const r = await criarCusto(eventoId, {
        descricao,
        categoria,
        valor: Number.isFinite(numero) ? numero : 0,
        previsto,
      });
      if (!reportar(r)) return;
      setDescricao("");
      setValor("");
      router.refresh();
    });
  }

  // Agrupado por categoria: é como a conta é lida no fim ("quanto foi de
  // transporte?"), e não como ela é digitada.
  const porCategoria = CATEGORIAS_CUSTO.map((c) => ({
    categoria: c,
    itens: custos.filter((x) => x.categoria === c),
  })).filter((g) => g.itens.length > 0);

  return (
    <>
      <button
        type="button"
        aria-label={dict.common.fechar}
        onClick={onFechar}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
      />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.custosTitulo}</p>
            <button
              type="button"
              onClick={onFechar}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white"
            >
              {dict.common.fechar}
            </button>
          </div>

          {/* --- a conta, em cima --- */}
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <p className="font-mono text-lg tabular-nums text-white">{fmtMoeda(daEquipe + daProducao)}</p>
            <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">{t.custosTotal}</p>

            <div className="mt-3 grid gap-2 border-t border-white/[0.07] pt-3 sm:grid-cols-2">
              {usaCache && (
                <Parcela rotulo={t.custosDaEquipe} valor={fmtMoeda(daEquipe)} />
              )}
              <Parcela rotulo={t.custosDeProducao} valor={fmtMoeda(daProducao)} acento />
            </div>
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-white/35">{t.custosAjuda}</p>

          {erro && (
            <p className="mt-3 rounded-lg border border-danger/35 bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
              {erro}
            </p>
          )}

          {/* --- lançar --- */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <p className={ROTULO}>{t.custosNovo}</p>

            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={t.custosDescricaoPlaceholder}
              className={cn(CAMPO, "mt-2")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (descricao.trim()) lancar();
                }
              }}
            />

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {CATEGORIAS_CUSTO.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoria(c)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition",
                    categoria === c
                      ? "border-accent/55 bg-accent/10 text-accent"
                      : "border-white/[0.09] text-white/40 hover:border-white/25 hover:text-white/75"
                  )}
                >
                  {t.categoriasCusto[c]}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={valor}
                onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder={t.custosValor}
                inputMode="decimal"
                className={cn(CAMPO, "w-32 shrink-0 text-center font-mono tabular-nums")}
              />

              {/* A linha nasce prevista, e desmarcar aqui é dizer "este valor
                  já é o real". É a única decisão do formulário que muda o
                  significado do número. */}
              <button
                type="button"
                onClick={() => setPrevisto((v) => !v)}
                className={cn(
                  "rounded-lg border px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.1em] transition",
                  previsto
                    ? "border-status-warning/45 text-status-warning"
                    : "border-status-good/45 text-status-good"
                )}
              >
                {previsto ? t.custosEhPrevisto : t.custosRealizado}
              </button>

              <button
                type="button"
                onClick={lancar}
                disabled={pendente || !descricao.trim()}
                className="ml-auto rounded-full px-4 py-2 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-30"
                style={{ background: "rgb(var(--color-accent))" }}
              >
                {dict.common.adicionar}
              </button>
            </div>
          </div>

          {/* --- a lista --- */}
          {custos.length > 0 && porConferir > 0 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-status-warning">
                {substituir(t.custosPorConferir, { n: porConferir })}
              </span>
              <button
                type="button"
                disabled={pendente}
                onClick={() =>
                  iniciar(async () => {
                    if (!reportar(await conferirTodosOsCustos(eventoId))) return;
                    router.refresh();
                  })
                }
                className="rounded-full border border-white/15 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/60 transition hover:border-white/35 hover:text-white disabled:opacity-40"
              >
                {t.custosConferirTodos}
              </button>
            </div>
          )}

          {custos.length === 0 ? (
            <p className="py-10 text-center text-xs text-white/35">{t.custosVazio}</p>
          ) : (
            <div className="mt-3 space-y-4">
              {porCategoria.map((g) => (
                <div key={g.categoria}>
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">
                      {t.categoriasCusto[g.categoria]}
                    </p>
                    <span className="font-mono text-[10px] tabular-nums text-white/35">
                      {fmtMoeda(g.itens.reduce((s, c) => s + Number(c.valor ?? 0), 0))}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {g.itens.map((c) => (
                      <Linha key={c.id} eventoId={eventoId} custo={c} ocupado={pendente} onErro={reportar} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Parcela({ rotulo, valor, acento }: { rotulo: string; valor: string; acento?: boolean }) {
  return (
    <span className="block">
      <span
        className={cn("block font-mono text-[13px] tabular-nums", acento ? "text-accent" : "text-white/80")}
      >
        {valor}
      </span>
      <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{rotulo}</span>
    </span>
  );
}

/**
 * Uma despesa.
 *
 * O valor é editável no lugar e grava ao sair do campo — no meio da semana
 * alguém descobre que a van custou 40 a mais, e abrir um formulário para
 * corrigir 40 reais é o tipo de atrito que faz a pessoa não corrigir.
 */
function Linha({
  eventoId,
  custo,
  ocupado,
  onErro,
}: {
  eventoId: string;
  custo: CustoRow;
  ocupado: boolean;
  onErro: (r: { ok: true } | { ok: false; error: string }) => boolean;
}) {
  const { dict, fmtMoeda } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [valor, setValor] = useState(String(custo.valor));
  const [editando, setEditando] = useState(false);

  const conferido = !!custo.conferido_em;

  function gravarValor() {
    setEditando(false);
    const numero = Number(valor.replace(",", "."));
    if (!Number.isFinite(numero) || numero === Number(custo.valor)) {
      setValor(String(custo.valor));
      return;
    }
    iniciar(async () => {
      if (!onErro(await atualizarCusto(eventoId, custo.id, { valor: numero }))) {
        setValor(String(custo.valor));
        return;
      }
      router.refresh();
    });
  }

  function alternar(campos: Partial<{ previsto: boolean; pago: boolean }>) {
    iniciar(async () => {
      if (!onErro(await atualizarCusto(eventoId, custo.id, campos))) return;
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "rounded-lg border px-3.5 py-2.5 transition",
        conferido ? "border-white/[0.07] bg-black/30" : "border-status-warning/25 bg-status-warning/[0.04]"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-white/90">{custo.descricao}</span>
          <span className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[9px] uppercase tracking-[0.1em]">
            <span className={custo.previsto ? "text-status-warning" : "text-status-good"}>
              {custo.previsto ? t.custosPrevisto : t.custosRealizado}
            </span>
            {custo.pago && <span className="text-white/35">{t.custosPago}</span>}
            {conferido && <span className="text-white/25">{t.custosConferido}</span>}
          </span>
        </span>

        {editando ? (
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
            onBlur={gravarValor}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setValor(String(custo.valor));
                setEditando(false);
              }
            }}
            inputMode="decimal"
            className="w-24 shrink-0 rounded-md border border-accent/50 bg-black/60 px-2 py-1 text-right font-mono text-[13px] tabular-nums text-white focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="shrink-0 rounded-md px-2 py-1 font-mono text-[13px] tabular-nums text-white/85 transition hover:bg-white/[0.06]"
          >
            {fmtMoeda(Number(custo.valor))}
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Mini
          ativo={!custo.previsto}
          rotulo={t.custosRealizado}
          ocupado={ocupado}
          onClick={() => alternar({ previsto: !custo.previsto })}
        />
        <Mini ativo={custo.pago} rotulo={t.custosPago} ocupado={ocupado} onClick={() => alternar({ pago: !custo.pago })} />
        <Mini
          ativo={conferido}
          rotulo={t.custosConferir}
          ocupado={ocupado}
          onClick={() =>
            iniciar(async () => {
              if (!onErro(await conferirCusto(eventoId, custo.id, !conferido))) return;
              router.refresh();
            })
          }
        />

        <button
          type="button"
          disabled={ocupado}
          onClick={() =>
            iniciar(async () => {
              if (!onErro(await removerCusto(eventoId, custo.id))) return;
              router.refresh();
            })
          }
          className="ml-auto rounded-md p-1.5 text-white/20 transition hover:text-danger disabled:opacity-40"
          aria-label={dict.common.remover}
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function Mini({
  ativo,
  rotulo,
  ocupado,
  onClick,
}: {
  ativo: boolean;
  rotulo: string;
  ocupado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={ocupado}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition disabled:opacity-40",
        ativo ? "border-status-good/45 text-status-good" : "border-white/[0.09] text-white/35 hover:text-white/70"
      )}
    >
      {ativo && <IconCheck className="h-2.5 w-2.5" />}
      {rotulo}
    </button>
  );
}
