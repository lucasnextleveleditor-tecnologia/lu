import { listarAprovacoesPendentes } from "@/app/dashboard/actions";
import { AprovacoesPendentes } from "@/components/dashboard/AprovacoesPendentes";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

/**
 * Dashboard do cliente — SÓ mostra materiais de Produção esperando a
 * aprovação/revisão dele (`prod_entrega_versoes.status_aprovacao = 'pendente'`,
 * ver `src/app/dashboard/actions.ts`). Decisão explícita: nenhum outro dado
 * (status de acesso, tráfego, saldo) aparece aqui — o cliente não tem
 * acesso a um "dashboard" no sentido do painel admin, só a essa fila de
 * revisão. Se um dia precisar reintroduzir outra informação pro cliente,
 * ela entra como uma seção nova, não como o padrão do que ele já vê hoje.
 */
export default async function DashboardPage() {
  const aprovacoes = await listarAprovacoesPendentes();
  const { dict } = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{dict.cliente.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.cliente.subtituloPagina}</p>
      </div>

      <AprovacoesPendentes aprovacoes={aprovacoes} />
    </div>
  );
}
