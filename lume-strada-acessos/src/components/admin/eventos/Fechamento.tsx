"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useRelogio } from "@/components/admin/eventos/Grade";
import { montarBalanco } from "@/lib/eventos/balanco";
import { estadoDaCaptura, type BlocoRow, type CapturaRow, type EquipeEventoRow, type EventoRow } from "@/lib/types/eventos";
import { criarEntregas, lancarCustos, salvarComoTemplate } from "@/app/admin/eventos/[id]/actions";

/**
 * O FECHAMENTO — o balanço, e os dois botões que devolvem trabalho.
 *
 * Esta tela existe para matar o domingo de manhã. Hoje, depois de um evento,
 * alguém abre uma planilha, soma cachê, confere no grupo do WhatsApp o que foi
 * captado e escreve à mão a lista de entregas. Aqui isso já está pronto quando
 * o evento acaba, porque foi sendo escrito durante — cada "captei" no celular
 * de quem estava lá é uma linha desta tela.
 *
 * A ORDEM DAS TRÊS COLUNAS é a ordem da conversa real: primeiro o que existe
 * (é o que se entrega), depois o que não existe (é o que se explica), e só
 * então a conta. Começar pela conta seria dizer que o dinheiro é a pergunta
 * principal do dia seguinte; não é — a pergunta é "temos o material?".
 */

interface Props {
  evento: EventoRow;
  capturas: CapturaRow[];
  equipe: EquipeEventoRow[];
  blocos: BlocoRow[];
}

export function Fechamento({ evento, capturas, equipe, blocos }: Props) {
  const { dict, fmtMoeda } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<{ tom: "bom" | "ruim"; texto: string } | null>(null);

  // O balanço depende do relógio (janela fechada = perdido), então ele só é
  // montado depois que o relógio existe — mesma razão da linha AGORA.
  const agora = useRelogio();
  const balanco = useMemo(
    () => montarBalanco(capturas, equipe, blocos, new Date(agora ?? 0).toISOString(), t.balancoSemDestinatario),
    [capturas, equipe, blocos, agora, t.balancoSemDestinatario]
  );

  const ERROS: Record<string, string> = {
    ENTREGAS_JA_CRIADAS: t.erroEntregasJaCriadas,
    CUSTOS_JA_LANCADOS: t.erroCustosJaLancados,
    NADA_PARA_ENTREGAR: t.erroNadaParaEntregar,
    NADA_PARA_LANCAR: t.erroNadaParaLancar,
    EVENTO_NAO_ENCONTRADO: t.erroEventoNaoEncontrado,
  };

  function entregas() {
    iniciar(async () => {
      const r = await criarEntregas(evento.id);
      setAviso(
        r.ok
          ? { tom: "bom", texto: t.entregasCriadas.replace("{n}", String(r.quantos)) }
          : { tom: "ruim", texto: ERROS[r.error] ?? r.error }
      );
      router.refresh();
    });
  }

  function custos() {
    iniciar(async () => {
      const r = await lancarCustos(evento.id);
      setAviso(r.ok ? { tom: "bom", texto: t.custosLancados } : { tom: "ruim", texto: ERROS[r.error] ?? r.error });
      router.refresh();
    });
  }

  function template() {
    iniciar(async () => {
      const r = await salvarComoTemplate(evento.id);
      setAviso(r.ok ? { tom: "bom", texto: t.templateSalvo } : { tom: "ruim", texto: ERROS[r.error] ?? r.error });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {aviso && (
        <p
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            aviso.tom === "bom" ? "border-status-good/40 bg-status-good/10 text-status-good" : "border-danger/40 bg-danger/10 text-danger"
          )}
        >
          {aviso.texto}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Painel titulo={t.balancoExiste} contador={`${balanco.totalCaptadas}/${balanco.totalCapturas}`}>
          {balanco.existe.length === 0 ? (
            <Vazio texto={t.balancoVazio} />
          ) : (
            <ul className="space-y-2">
              {balanco.existe.map((g) => (
                <li key={g.destinatario} className="rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[14px] font-medium text-white">{g.destinatario}</p>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-status-good">{g.itens.length}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {g.itens.map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-[12px] text-white/55">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-status-good shadow-[0_0_6px_rgb(34_197_94/0.8)]" />
                        <span className="truncate">{item.titulo}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Painel>

        <Painel titulo={t.balancoNaoExiste} contador={String(balanco.naoExiste.length)} alerta>
          {balanco.naoExiste.length === 0 ? (
            <Vazio texto={t.balancoTudoCaptado} />
          ) : (
            <ul className="space-y-1.5">
              {balanco.naoExiste.map((c) => {
                const estado = estadoDaCaptura(c, new Date(agora ?? 0).toISOString());
                return (
                  <li key={c.id} className="rounded-lg border border-danger/25 bg-danger/[0.06] px-3.5 py-2.5">
                    <p className="truncate text-[13px] text-white/85">{c.titulo}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
                      {c.motivo || (estado === "perdido" ? t.motivoJanelaFechou : t.motivoSemMotivo)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Painel>
      </div>

      <Painel titulo={t.balancoConta}>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4">
          <Tile rotulo={t.balancoPrevisto} valor={fmtMoeda(balanco.conta.previsto)} />
          <Tile rotulo={t.balancoRealizado} valor={fmtMoeda(balanco.conta.realizado)} destaque />
          <Tile
            rotulo={t.balancoDiferenca}
            valor={fmtMoeda(balanco.conta.diferenca)}
            alerta={balanco.conta.diferenca > 0}
          />
          <Tile
            rotulo={t.balancoAtraso}
            valor={`${balanco.conta.atrasoMin} min`}
            alerta={balanco.conta.atrasoMin > 0}
          />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
          {t.balancoPessoas.replace("{n}", String(balanco.conta.pessoas))} ·{" "}
          {t.balancoHoras.replace("{n}", balanco.conta.horas.toFixed(1))}
        </p>
      </Painel>

      <Painel titulo={t.balancoDoisBotoes}>
        {/* Os dois botões são os Ajustes do evento em forma de ação: quem não
            liga entregas não vai querer o botão que cria tarefa na Produção. */}
        {(evento.usa_entregas || evento.usa_cache) && (
          <div className="grid gap-2 sm:grid-cols-2">
            {evento.usa_entregas && (
              <Botao
                titulo={t.botaoCriarEntregas}
                texto={t.botaoCriarEntregasAjuda}
                destino="Produção"
                feito={!!evento.entregas_criadas_em}
                ocupado={pendente}
                onClick={entregas}
              />
            )}
            {evento.usa_cache && (
              <Botao
                titulo={t.botaoLancarCustos}
                texto={t.botaoLancarCustosAjuda}
                destino="Financeiro"
                feito={!!evento.custos_lancados_em}
                ocupado={pendente}
                onClick={custos}
              />
            )}
          </div>
        )}

        {!evento.usa_entregas && !evento.usa_cache && (
          <p className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-4 text-center text-[11.5px] leading-relaxed text-white/35">
            {t.balancoNadaLigado}
          </p>
        )}

        <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35">{t.balancoProximoEvento}</p>
        <button
          type="button"
          onClick={template}
          disabled={pendente}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left transition hover:border-accent/40 disabled:opacity-40"
        >
          <span className="block text-[14px] font-medium text-white">{t.botaoSalvarTemplate}</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-white/45">{t.botaoSalvarTemplateAjuda}</span>
        </button>
      </Painel>
    </div>
  );
}

// ----------------------------------------------------------------------------

function Painel({
  titulo,
  contador,
  alerta,
  children,
}: {
  titulo: string;
  contador?: string;
  alerta?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("ev-console relative overflow-hidden rounded-2xl border", alerta ? "border-danger/25" : "border-white/10")}>
      <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.24em]",
              alerta ? "text-danger/80" : "text-white/45"
            )}
          >
            {titulo}
          </p>
          {contador && <span className="font-mono text-[11px] tabular-nums text-white/40">{contador}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="py-6 text-center text-xs text-white/35">{texto}</p>;
}

function Tile({ rotulo, valor, destaque, alerta }: { rotulo: string; valor: string; destaque?: boolean; alerta?: boolean }) {
  return (
    <div className="bg-base-950 px-4 py-3.5">
      <p
        className={cn("font-mono text-lg font-semibold tabular-nums", alerta ? "text-danger" : "text-white")}
        style={destaque ? { color: "rgb(var(--color-accent))", textShadow: "0 0 18px rgb(var(--color-accent) / 0.5)" } : undefined}
      >
        {valor}
      </p>
      <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">{rotulo}</p>
    </div>
  );
}

/** Botão que já foi apertado vira estado, não some: a pessoa precisa ver que aquilo já aconteceu. */
function Botao({
  titulo,
  texto,
  destino,
  feito,
  ocupado,
  onClick,
}: {
  titulo: string;
  texto: string;
  destino: string;
  feito: boolean;
  ocupado: boolean;
  onClick: () => void;
}) {
  const { dict } = useLocale();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={ocupado || feito}
      className={cn(
        "relative overflow-hidden rounded-xl border px-4 py-3.5 text-left transition",
        feito ? "border-status-good/30 bg-status-good/[0.06]" : "border-white/10 bg-black/40 hover:border-accent/40",
        ocupado && "opacity-50"
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={cn("text-[14px] font-medium", feito ? "text-status-good" : "text-white")}>{titulo}</span>
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">→ {destino}</span>
      </span>
      <span className="mt-1 block text-[11px] leading-relaxed text-white/45">
        {feito ? dict.eventos.botaoJaFeito : texto}
      </span>
    </button>
  );
}
