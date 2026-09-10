import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { SeletorDeCliente } from "@/components/admin/planejamento/SeletorDeCliente";
import type { EventoRow } from "@/lib/eventos/registrar";
import type { StatusTarefa } from "@/lib/types/producao";

/**
 * A linha do tempo de um cliente — a trilha inteira, do mais recente para o
 * mais antigo.
 *
 * Uma tela só para os quatro módulos, porque a pergunta que se faz é "o que
 * aconteceu com este cliente?" e ela atravessa onboarding, planejamento,
 * conteúdo e produção. Um histórico por módulo obrigaria a abrir quatro telas
 * e juntar as datas de cabeça — que é exatamente o trabalho que a trilha
 * existe para evitar.
 *
 * Ordem decrescente porque a pergunta quase sempre é "o que aconteceu por
 * último". Quem quer a história desde o começo rola até o fim; quem quer saber
 * onde a peça parou vê na primeira linha.
 *
 * Server Component: aqui não se edita nada. E não se edita por desenho — a
 * tabela `eventos` não tem política de update nem de delete.
 */
export async function PainelHistorico({
  clientes,
  clienteAtual,
  eventos,
}: {
  clientes: { id: string; nome: string }[];
  clienteAtual: string | null;
  eventos: EventoRow[];
}) {
  const { dict, locale } = await getDictionary();
  const t = dict.historico;

  const rotuloStatus: Record<string, string> = {
    backlog: dict.producao.statusBacklog,
    a_fazer: dict.producao.statusAFazer,
    em_producao: dict.producao.statusEmProducao,
    revisao_interna: dict.producao.statusRevisaoInterna,
    preview_cliente: dict.producao.statusPreviewCliente,
    concluida: dict.producao.statusConcluida,
    rascunho: dict.planejamento.statusRascunho,
    ativo: dict.planejamento.statusAtivo,
    encerrado: dict.planejamento.statusEncerrado,
    cancelado: dict.planejamento.statusCancelado,
  };
  const nomeDoEstado = (v: string | null) => (v ? (rotuloStatus[v as StatusTarefa] ?? v) : null);

  if (clientes.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-ink-muted">{t.semClientes}</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SeletorDeCliente clientes={clientes} atual={clienteAtual ?? clientes[0]!.id} aba="historico" />
        <p className="pb-2 text-xs text-ink-muted">{substituir(t.quantos, { n: eventos.length })}</p>
      </div>

      {eventos.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">{t.semEventos}</p>
        </Card>
      ) : (
        <Card className="p-0">
          <ol className="divide-y divide-base-800">
            {eventos.map((e) => {
              const quando = new Date(e.created_at);
              const transicao =
                e.de || e.para
                  ? substituir(t.transicao, {
                      de: nomeDoEstado(e.de) ?? "—",
                      para: nomeDoEstado(e.para) ?? "—",
                    })
                  : null;

              return (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-3">
                  {/* Um ponto colorido por origem: azul é a equipe, verde é o
                      próprio cliente. "Aprovado pelo cliente" e "aprovado pela
                      agência" são fatos diferentes, e essa é a distinção que
                      alguém procura ao abrir a trilha meses depois. */}
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      e.ator_tipo === "cliente" ? "bg-status-good" : e.ator_tipo === "sistema" ? "bg-base-600" : "bg-accent"
                    )}
                  />

                  <span className="text-sm text-ink-primary">{t.acoes[e.acao] ?? e.acao}</span>

                  {e.titulo && (
                    <span className="max-w-[20rem] truncate text-sm text-ink-secondary" title={e.titulo}>
                      — {e.titulo}
                    </span>
                  )}

                  {transicao && (
                    <span className="rounded-full border border-base-700 px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                      {transicao}
                    </span>
                  )}

                  {/* Data e hora completas, sempre. "Há 3 dias" é agradável no
                      sino e inútil aqui: numa trilha, o que se quer é a hora
                      exata para cruzar com o que o cliente diz ter recebido. */}
                  <span className="ml-auto shrink-0 whitespace-nowrap text-[11px] tabular-nums text-ink-muted">
                    {quando.toLocaleDateString(locale)} · {quando.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  <span className="w-full pl-3.5 text-[11px] text-ink-muted">
                    {e.ator_nome ?? t.atorDesconhecido}
                    {e.ator_tipo !== "equipe" && ` · ${e.ator_tipo === "cliente" ? t.atorCliente : t.atorSistema}`}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}
