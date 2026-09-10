import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fmtDataCurta } from "@/lib/utils/format";
import { IconChevronRight } from "@/components/ui/icons";
import { diasAte, estaVencendo, progressoDoCiclo, type PlanoRow } from "@/lib/types/planejamento";
import type { ClienteRow } from "@/lib/types/cadastros";
import { BotaoNovoCiclo } from "./BotaoNovoCiclo";

/**
 * A lista de planejamentos — um ciclo ativo por cliente da carteira.
 *
 * A lista é de CLIENTES, não de planos, pelo mesmo motivo do onboarding:
 * quem abre aqui quer saber de quem está SEM ciclo, e um cliente sem plano
 * não tem linha na tabela de planos para aparecer.
 *
 * A ordem não é alfabética de propósito. Ela é a ordem em que se resolve:
 * primeiro os ciclos que estão vencendo (o mais perto do fim no topo), depois
 * os clientes sem ciclo nenhum, e por último os ciclos com folga — que são
 * justamente os que não precisam de ninguém hoje. Uma lista alfabética
 * obrigaria a ler os 40 clientes para achar os 3 que importam.
 *
 * Server Component: não há interação aqui além de links e do botão de criar,
 * que é o único pedaço cliente.
 */
export async function PainelPlanejamento({
  clientes,
  planos,
}: {
  clientes: ClienteRow[];
  planos: PlanoRow[];
}) {
  const { dict, locale } = await getDictionary();
  const t = dict.planejamento;

  const ativoPorCliente = new Map<string, PlanoRow>();
  // O rascunho mais recente do cliente. Existe por um motivo prático: sem
  // ele, um cliente que já tem um ciclo em montagem continuava mostrando
  // "Criar ciclo" — porque a linha só olhava para o ATIVO — e cada visita à
  // tela virava um rascunho novo. Rascunho não ocupa a vaga do ativo no
  // banco (o índice único é parcial), então quem tem que lembrar dele é esta
  // tela.
  const rascunhoPorCliente = new Map<string, PlanoRow>();
  const encerradosPorCliente = new Map<string, number>();
  for (const plano of planos) {
    if (plano.status === "ativo") ativoPorCliente.set(plano.cliente_id, plano);
    if (plano.status === "rascunho" && !rascunhoPorCliente.has(plano.cliente_id)) {
      // Os planos chegam ordenados por `data_inicio` decrescente, então o
      // primeiro rascunho que aparece é o mais recente.
      rascunhoPorCliente.set(plano.cliente_id, plano);
    }
    if (plano.status === "encerrado") {
      encerradosPorCliente.set(plano.cliente_id, (encerradosPorCliente.get(plano.cliente_id) ?? 0) + 1);
    }
  }

  const linhas = clientes
    .map((cliente) => {
      const ativo = ativoPorCliente.get(cliente.id) ?? null;
      const rascunho = ativo ? null : (rascunhoPorCliente.get(cliente.id) ?? null);
      const dias = ativo ? diasAte(ativo.data_fim) : null;
      return {
        cliente,
        ativo,
        rascunho,
        dias,
        encerrados: encerradosPorCliente.get(cliente.id) ?? 0,
      };
    })
    .sort((a, b) => {
      const peso = (x: typeof a) => (x.ativo && x.dias !== null && estaVencendo(x.dias) ? 0 : x.ativo ? 2 : 1);
      const d = peso(a) - peso(b);
      if (d !== 0) return d;
      if (a.dias !== null && b.dias !== null) return a.dias - b.dias;
      return a.cliente.nome.localeCompare(b.cliente.nome, locale);
    });

  const comCiclo = linhas.filter((l) => l.ativo).length;

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
        {substituir(t.resumoAtivos, { n: comCiclo, total: clientes.length })}
      </p>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-base-800 text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-2.5 font-medium">{t.colCliente}</th>
              <th className="px-4 py-2.5 font-medium">{t.colCiclo}</th>
              <th className="px-4 py-2.5 font-medium">{t.colVencimento}</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ cliente, ativo, rascunho, dias, encerrados }) => (
              <tr key={cliente.id} className="border-b border-base-800 last:border-0">
                <td className="max-w-[16rem] px-4 py-3" title={cliente.nome}>
                  <p className="truncate text-sm text-ink-primary">{cliente.nome}</p>
                  {encerrados > 0 && (
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {substituir(encerrados === 1 ? t.ciclosEncerrados.um : t.ciclosEncerrados.muitos, {
                        n: encerrados,
                      })}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-ink-secondary">
                  {ativo ? (
                    substituir(t.periodo, {
                      inicio: fmtDataCurta(ativo.data_inicio),
                      fim: fmtDataCurta(ativo.data_fim),
                    })
                  ) : rascunho ? (
                    <span className="text-ink-muted">{t.statusRascunho}</span>
                  ) : (
                    <span className="text-ink-muted">{t.semCicloAtivo}</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {ativo && dias !== null ? (
                    <div className="flex items-center gap-2">
                      {/* A barra mostra o ciclo DECORRIDO, não o que falta:
                          cheia é "acabou", que é a leitura que o olho faz
                          sozinho num prazo. */}
                      <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-base-800">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            dias <= 5 ? "bg-status-critical" : estaVencendo(dias) ? "bg-status-warning" : "bg-accent/70"
                          )}
                          style={{ width: `${Math.round(progressoDoCiclo(ativo.data_inicio, ativo.data_fim) * 100)}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "whitespace-nowrap text-[11px] tabular-nums",
                          dias <= 5 ? "text-danger" : estaVencendo(dias) ? "text-status-warning" : "text-ink-muted"
                        )}
                      >
                        {dias < 0
                          ? t.venceu
                          : dias === 0
                            ? t.venceHoje
                            : substituir(dias === 1 ? t.faltamDias.um : t.faltamDias.muitos, { n: dias })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-ink-muted">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  {ativo || rascunho ? (
                    <Link
                      href={`/admin/planejamento/${(ativo ?? rascunho)!.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-base-600 px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                    >
                      {ativo ? t.abrir : t.continuarRascunho}
                      <IconChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <BotaoNovoCiclo clienteId={cliente.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
