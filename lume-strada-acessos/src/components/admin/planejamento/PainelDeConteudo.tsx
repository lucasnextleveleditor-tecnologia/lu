import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { substituir } from "@/lib/utils/texto";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fmtDataCurta } from "@/lib/utils/format";
import { IconChevronRight } from "@/components/ui/icons";
import { CalendarioDeConteudo } from "@/components/admin/planejamento/CalendarioDeConteudo";
import { SeletorDeCliente } from "@/components/admin/planejamento/SeletorDeCliente";
import type { PlanoRow } from "@/lib/types/planejamento";
import type { PostFormatoRow, TarefaRow } from "@/lib/types/producao";

/**
 * A aba Conteúdo — o calendário fora da página do ciclo.
 *
 * O calendário nasceu dentro do ciclo, e sair de lá foi a coisa certa: quem
 * monta o mês de conteúdo abre esta tela TODO DIA, enquanto o ciclo é
 * preenchido uma vez a cada um a três meses. Fazer a social media passar por
 * uma página de escopo, verba e cronograma para chegar no lugar onde ela
 * trabalha era cobrar um pedágio diário por uma decisão trimestral.
 *
 * O ciclo continua sendo o dono dos números — o escopo vendido vive lá, e é
 * dele que os indicadores do topo descontam. O que mudou foi só o caminho.
 */
export async function PainelDeConteudo({
  clientes,
  clienteAtual,
  plano,
  posts,
  funcionarios,
  tiposServico,
  formatos,
}: {
  /** Só os clientes que TÊM ciclo — quem não tem não tem o que pautar. */
  clientes: { id: string; nome: string }[];
  clienteAtual: string | null;
  plano: PlanoRow | null;
  posts: TarefaRow[];
  funcionarios: { id: string; nome: string }[];
  tiposServico: { id: string; nome: string }[];
  /** Os formatos em uso da empresa — o seletor de formato de cada linha. */
  formatos: PostFormatoRow[];
}) {
  const { dict } = await getDictionary();
  const t = dict.planejamento;

  if (clientes.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-ink-muted">{t.semClientesComCiclo}</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SeletorDeCliente clientes={clientes} atual={clienteAtual ?? clientes[0]!.id} />

        {plano && (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs text-ink-muted">
              {substituir(t.cicloEmEdicao, {
                inicio: fmtDataCurta(plano.data_inicio),
                fim: fmtDataCurta(plano.data_fim),
              })}
            </span>
            {/* O caminho de volta para o escopo. Os indicadores mostram o
                número; quando ele está errado, é lá que se corrige. */}
            <Link
              href={`/admin/planejamento/${plano.id}`}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-accent transition hover:underline"
            >
              {t.irParaOCiclo}
              <IconChevronRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {!plano ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">{t.semCicloParaConteudo}</p>
        </Card>
      ) : (
        <CalendarioDeConteudo
          planoId={plano.id}
          inicio={plano.data_inicio}
          fim={plano.data_fim}
          meta={{
            posts: plano.qtd_posts_social,
            campanhas: plano.qtd_campanhas_trafego,
            extras: (plano.pecas_extras ?? []).length,
          }}
          pautaInicial={posts.filter((p) => p.em_pauta)}
          produzindoInicial={posts.filter((p) => !p.em_pauta)}
          funcionarios={funcionarios}
          tiposServico={tiposServico}
          formatos={formatos}
        />
      )}
    </div>
  );
}
