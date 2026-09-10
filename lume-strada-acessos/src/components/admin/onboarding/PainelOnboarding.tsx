import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fmtDataCurta } from "@/lib/utils/format";
import { IconChevronRight, IconCheck, IconPencil } from "@/components/ui/icons";
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
        // "Começado" é a EXISTÊNCIA da linha, não ter campo preenchido. Quem
        // clicou em Começar e fechou a tela sem escrever nada começou — e
        // continuar dizendo "não iniciado" ali faria a pessoa achar que o
        // clique dela se perdeu. A barra de progresso, essa sim, mede
        // conteúdo: são duas perguntas diferentes ("mexi nisso?" e "quanto
        // já tem?") e cada coluna responde a uma.
        comecado: row !== null,
      };
    })
    // Não iniciados primeiro, concluídos por último: a tela existe pra
    // mostrar o que falta, não pra celebrar o que já foi feito.
    .sort((a, b) => {
      const peso = (x: typeof a) => (x.concluido ? 2 : x.comecado ? 1 : 0);
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
            {linhas.map(({ cliente, row, etapas, concluido, comecado }) => (
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
                    <span className={cn("text-xs", comecado ? "text-ink-secondary" : "text-ink-muted")}>
                      {comecado ? t.statusEmAndamento : t.statusNaoIniciado}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-ink-muted">
                  {row ? fmtDataCurta(row.updated_at.slice(0, 10)) : "—"}
                </td>

                <td className="px-4 py-3 text-right">
                  {/* Três estados, três convites diferentes. Um botão que diz
                      sempre "Abrir" não conta nada; "Continuar" diz que há
                      coisa começada esperando, e o lápis diz que um briefing
                      fechado ainda pode ser corrigido — que é o que mais
                      acontece: a marca muda o tom de voz, a meta do ano vira
                      outra. */}
                  <Link
                    href={`/admin/onboarding/${cliente.id}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                      concluido
                        ? "border-base-700 text-ink-muted hover:border-base-600 hover:text-ink-secondary"
                        : "border-base-600 text-ink-secondary hover:border-ink-muted hover:text-ink-primary"
                    )}
                  >
                    {comecado && <IconPencil className="h-3.5 w-3.5" />}
                    {concluido ? t.editar : comecado ? t.continuar : t.comecar}
                    {!comecado && <IconChevronRight className="h-3.5 w-3.5" />}
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
