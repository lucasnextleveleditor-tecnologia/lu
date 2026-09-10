"use client";

import type { FluxoDiarioLinha } from "@/app/admin/financeiro/fluxo-caixa/data";
import { fmtDataCurta } from "@/lib/utils/format";
import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface FluxoDiarioTableProps {
  diario: FluxoDiarioLinha[];
}

// Mesmas cores fixas do sistema de status já usadas no resto do módulo —
// nunca uma cor nova (ver comentário em `FluxoCaixaChart`).
const COR_RECEITA = "#0ca30c";
const COR_DESPESA = "#d03b3b";
const COR_NEUTRO = "#8a8783";

function corSaldo(v: number): string {
  return v > 0 ? COR_RECEITA : v < 0 ? COR_DESPESA : COR_NEUTRO;
}

/**
 * Fluxo de caixa diário — entradas/saídas de cada dia COM movimentação
 * dentro do mês navegado (`MesNav`, ver `page.tsx`), mais o acumulado
 * corrido do mês e o total no rodapé. Pedido explícito do dono da conta:
 * "fluxo de caixa diário de entradas e saídas... saiba o quanto fechou
 * cada dia e cada mês". Tabela simples (não gráfico) de propósito — o que
 * importa aqui é o número exato de cada dia, não a forma de uma curva (essa
 * já existe na "Projeção de Saldo" acima, que é sobre o SALDO real das
 * contas daqui pra frente, não sobre entradas/saídas passadas do mês).
 */
export function FluxoDiarioTable({ diario }: FluxoDiarioTableProps) {
  const { dict, fmtMoeda } = useLocale();
  const { visivel } = useValoresVisiveis();
  const fmt = (v: number) => (visivel ? fmtMoeda(v) : "••••");
  const t = dict.financeiro.fluxoCaixa;

  if (diario.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-base-700 text-sm text-ink-muted">
        {t.diarioVazio}
      </div>
    );
  }

  const totalEntradas = diario.reduce((acc, l) => acc + l.entradas, 0);
  const totalSaidas = diario.reduce((acc, l) => acc + l.saidas, 0);
  const saldoMes = totalEntradas - totalSaidas;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-base-700 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            <th className="py-2 pr-3 font-semibold">{t.colDataLabel}</th>
            <th className="px-3 py-2 text-right font-semibold">{t.colEntradasLabel}</th>
            <th className="px-3 py-2 text-right font-semibold">{t.colSaidasLabel}</th>
            <th className="px-3 py-2 text-right font-semibold">{t.colSaldoDiaLabel}</th>
            <th className="py-2 pl-3 text-right font-semibold">{t.colAcumuladoLabel}</th>
          </tr>
        </thead>
        <tbody>
          {diario.map((linha) => (
            <tr key={linha.data} className="border-b border-base-800/70 last:border-0">
              <td className="py-2 pr-3 text-ink-secondary">{fmtDataCurta(linha.data)}</td>
              <td className="px-3 py-2 text-right text-ink-primary">{linha.entradas > 0 ? fmt(linha.entradas) : "—"}</td>
              <td className="px-3 py-2 text-right text-ink-primary">{linha.saidas > 0 ? fmt(linha.saidas) : "—"}</td>
              <td className="px-3 py-2 text-right font-medium" style={{ color: corSaldo(linha.saldoDia) }}>
                {fmt(linha.saldoDia)}
              </td>
              <td className="py-2 pl-3 text-right font-medium" style={{ color: corSaldo(linha.acumulado) }}>
                {fmt(linha.acumulado)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-base-700 font-semibold">
            <td className="py-2.5 pr-3 text-ink-primary">{t.totalDoMesLabel}</td>
            <td className="px-3 py-2.5 text-right text-ink-primary">{fmt(totalEntradas)}</td>
            <td className="px-3 py-2.5 text-right text-ink-primary">{fmt(totalSaidas)}</td>
            <td className="px-3 py-2.5 text-right" style={{ color: corSaldo(saldoMes) }}>
              {fmt(saldoMes)}
            </td>
            <td className="py-2.5 pl-3 text-right" style={{ color: corSaldo(saldoMes) }}>
              {fmt(saldoMes)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
