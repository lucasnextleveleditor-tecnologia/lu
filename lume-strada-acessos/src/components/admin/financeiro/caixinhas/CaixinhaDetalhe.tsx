"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CaixinhaComSaldo, CaixinhaTransacaoRow, ContaComSaldo } from "@/lib/types/financeiro";
import { arquivarCaixinha } from "@/app/admin/financeiro/caixinhas/actions";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { ProgressRing } from "@/components/admin/financeiro/caixinhas/ProgressRing";
import { ProjecaoChart } from "@/components/admin/financeiro/caixinhas/ProjecaoChart";
import { CaixinhaHistorico } from "@/components/admin/financeiro/caixinhas/CaixinhaHistorico";
import { NovaCaixinhaModal } from "@/components/admin/financeiro/caixinhas/NovaCaixinhaModal";
import { AporteResgateModal } from "@/components/admin/financeiro/caixinhas/AporteResgateModal";
import { LancarRendimentoModal } from "@/components/admin/financeiro/caixinhas/LancarRendimentoModal";
import { IconTarget, IconTrendingUp } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CaixinhaDetalheProps {
  caixinha: CaixinhaComSaldo;
  contas: ContaComSaldo[];
  historico: CaixinhaTransacaoRow[];
}

const RISCO_LABEL: Record<string, string> = { baixo: "riscoBaixo", medio: "riscoMedio", alto: "riscoAlto" };
const LIQUIDEZ_LABEL: Record<string, string> = { imediata: "liquidezImediata", curto_prazo: "liquidezCurtoPrazo", longo_prazo: "liquidezLongoPrazo" };

export function CaixinhaDetalhe({ caixinha, contas, historico }: CaixinhaDetalheProps) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [modalMovimentacao, setModalMovimentacao] = useState<"aporte" | "resgate" | null>(null);
  const [modalRendimento, setModalRendimento] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [confirmandoArquivar, setConfirmandoArquivar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const temMeta = caixinha.valor_meta != null && caixinha.valor_meta > 0;
  const pct = temMeta ? caixinha.saldo_atual / (caixinha.valor_meta as number) : 0;
  const atingida = temMeta && pct >= 1;

  function handleArquivar() {
    setError(null);
    startTransition(async () => {
      const result = await arquivarCaixinha(caixinha.id);
      if (!result.ok) {
        setError(result.error);
        setConfirmandoArquivar(false);
        return;
      }
      router.push("/admin/financeiro/caixinhas");
    });
  }

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xl font-semibold text-ink-primary">
              {caixinha.emoji ? `${caixinha.emoji} ` : ""}
              {caixinha.nome}
            </p>
            {caixinha.objetivo && <p className="mt-1 max-w-md text-sm text-ink-muted">{caixinha.objetivo}</p>}

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.saldoAtualLabel}</p>
              <ValorPrivado valor={fmtBRL(caixinha.saldo_atual)} className="mt-1 block text-4xl font-bold tracking-tight text-ink-primary" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {caixinha.taxa_rendimento > 0 && (
                <span className="rounded-full border border-status-good/30 bg-status-good/10 px-2.5 py-1 text-xs font-medium text-ink-primary">
                  {caixinha.taxa_rendimento.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% {caixinha.taxa_rendimento_periodo === "mensal" ? t.aoMes : t.aoAno}
                </span>
              )}
              <span className="rounded-full border border-base-600 bg-base-950/60 px-2.5 py-1 text-xs font-medium text-ink-secondary">{t[RISCO_LABEL[caixinha.nivel_risco] as keyof typeof t] as string}</span>
              <span className="rounded-full border border-base-600 bg-base-950/60 px-2.5 py-1 text-xs font-medium text-ink-secondary">{t[LIQUIDEZ_LABEL[caixinha.liquidez] as keyof typeof t] as string}</span>
              {caixinha.data_alvo && (
                <span className="rounded-full border border-base-600 bg-base-950/60 px-2.5 py-1 text-xs font-medium text-ink-secondary">
                  {t.dataAlvoLabel}: {fmtDataCurta(caixinha.data_alvo)}
                </span>
              )}
            </div>
          </div>

          {temMeta && (
            <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
              <ProgressRing pct={pct} size={128} strokeWidth={9} atingida={atingida} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-ink-primary">{Math.round(Math.min(1, pct) * 100)}%</span>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-muted">
                  <IconTarget className="h-3 w-3" />
                  <ValorPrivado valor={fmtBRL(caixinha.valor_meta as number)} />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => setModalMovimentacao("aporte")}>{t.aporteBtn}</Button>
          <Button variant="ghost" onClick={() => setModalMovimentacao("resgate")} disabled={caixinha.saldo_atual <= 0}>
            {t.resgateBtn}
          </Button>
          <Button variant="ghost" onClick={() => setModalRendimento(true)}>
            <IconTrendingUp className="h-4 w-4" />
            {t.lancarRendimentoBtn}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => setModalEditar(true)}>
              {dict.common.editar}
            </Button>
            {confirmandoArquivar ? (
              <div className="flex items-center gap-2 rounded-lg border border-status-critical/30 bg-status-critical/10 px-3 py-1.5">
                <span className="text-xs text-ink-secondary">{t.confirmarArquivarPergunta}</span>
                <button onClick={handleArquivar} disabled={pending} className="text-xs font-medium text-danger hover:underline">
                  {dict.common.sim}
                </button>
                <button onClick={() => setConfirmandoArquivar(false)} disabled={pending} className="text-xs text-ink-muted hover:text-ink-primary">
                  {dict.common.nao}
                </button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmandoArquivar(true)}>
                {t.arquivarBtn}
              </Button>
            )}
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-ink-primary">{t.projecaoTitulo}</h2>
        <p className="mb-4 text-xs text-ink-muted">{t.projecaoSubtitulo}</p>
        <ProjecaoChart saldoAtual={caixinha.saldo_atual} taxaRendimento={caixinha.taxa_rendimento} taxaRendimentoPeriodo={caixinha.taxa_rendimento_periodo} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-ink-primary">{t.historicoTitulo}</h2>
        <CaixinhaHistorico historico={historico} />
      </Card>

      {modalMovimentacao && (
        <AporteResgateModal caixinha={caixinha} contas={contas} tipoInicial={modalMovimentacao} onClose={() => setModalMovimentacao(null)} />
      )}
      {modalRendimento && <LancarRendimentoModal caixinha={caixinha} onClose={() => setModalRendimento(false)} />}
      {modalEditar && <NovaCaixinhaModal caixinha={caixinha} onClose={() => setModalEditar(false)} />}
    </div>
  );
}
