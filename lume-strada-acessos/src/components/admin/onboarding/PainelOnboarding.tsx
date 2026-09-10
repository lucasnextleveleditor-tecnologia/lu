import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fmtDataCurta } from "@/lib/utils/format";
import { IconChevronRight, IconCheck } from "@/components/ui/icons";
import { TOTAL_DE_ETAPAS, etapasPreenchidas, type OnboardingRow } from "@/lib/types/onboarding";
import type { ClienteRow } from "@/lib/types/cadastros";

/**
 * A lista de briefings — um por cliente da carteira.
 *
 * A lista é de CLIENTES, não de onboardings, e essa é a escolha que faz a
 * tela servir pra alguma coisa: quem abre aqui quer saber de quem AINDA NÃO
 * tem briefing, e um cliente sem briefing não tem linha na tabela de
 * onboarding pra aparecer. Por isso o `left join` em memória, e por isso os
 * não iniciados vêm primeiro.
 *
 * Server Component: não há interação nenhuma aqui além de links.
 */
export async function PainelOnboarding({
  clientes,
  onboardings,
}: {
  clientes: ClienteRow[];
  onboardings: OnboardingRow[];
}) {
  const { dict, locale } = await getDictionary();
  const t = dict.onboarding;

  const porCliente = new Map(onboardings.map((o) => [o.cliente_id, o]));

  const linhas = clientes
    .map((cliente) => {
      const row = porCliente.get(cliente.id) ?? null;
      return {
        cliente,
        row,
        etapas: etapasPreenchidas(row),
        concluido: Boolean(row?.concluido_em),
      };
    })
    // Não iniciados primeiro, concluídos por último: a tela existe pra
    // mostrar o que falta, não pra celebrar o que já foi feito.
    .sort((a, b) => {
      const peso = (x: typeof a) => (x.concluido ? 2 : x.etapas === 0 ? 0 : 1);
      const d = peso(a) - peso(b);
      return d !== 0 ? d : a.cliente.nome.localeCompare(b.cliente.nome, locale);
    });

  const concluidos = linhas.filter((l) => l.concluido).length;

  if (clientes.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-ink-muted">{t.semClientes}</p>
      </Card>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ink-muted">
        {substituir(t.resumoConcluidos, { n: concluidos, total: clientes.length })}
      </p>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-base-800 text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-2.5 font-medium">{t.colCliente}</th>
              <th className="px-4 py-2.5 font-medium">{t.colProgresso}</th>
              <th className="px-4 py-2.5 font-medium">{t.colStatus}</th>
              <th className="px-4 py-2.5 font-medium">{t.colAtualizado}</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ cliente, row, etapas, concluido }) => (
              <tr key={cliente.id} className="border-b border-base-800 last:border-0">
                <td className="max-w-[16rem] truncate px-4 py-3 text-sm text-ink-primary" title={cliente.nome}>
                  {cliente.nome}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-base-800">
                      <div
                        className={cn("h-full rounded-full", concluido ? "bg-status-good" : "bg-accent/70")}
                        style={{ width: `${(etapas / TOTAL_DE_ETAPAS) * 100}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap text-[11px] tabular-nums text-ink-muted">
                      {substituir(t.etapasDe, { n: etapas, total: TOTAL_DE_ETAPAS })}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {concluido ? (
                    <span className="inline-flex items-center gap-1 text-xs text-status-good">
                      <IconCheck className="h-3.5 w-3.5" />
                      {t.statusConcluido}
                    </span>
                  ) : (
                    <span className={cn("text-xs", etapas === 0 ? "text-ink-muted" : "text-ink-secondary")}>
                      {etapas === 0 ? t.statusNaoIniciado : t.statusEmAndamento}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-ink-muted">
                  {row ? fmtDataCurta(row.updated_at.slice(0, 10)) : "—"}
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/onboarding/${cliente.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-base-600 px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                  >
                    {etapas === 0 ? t.comecar : t.abrir}
                    <IconChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
