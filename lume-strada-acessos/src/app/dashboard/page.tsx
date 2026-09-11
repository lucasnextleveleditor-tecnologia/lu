import Link from "next/link";
import { listarAprovacoesPendentes, listarContratosDoClienteLogado } from "@/app/dashboard/actions";
import { AprovacoesPendentes } from "@/components/dashboard/AprovacoesPendentes";
import { ContratosDoClienteLogado } from "@/components/dashboard/ContratosDoClienteLogado";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { cn } from "@/lib/utils/cn";
import { IconCheckCircle, IconFileText } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

type Aba = "aprovacoes" | "contratos";

/**
 * A área do cliente — duas abas, e só duas.
 *
 * **Aprovações** é o que ele vem fazer aqui: a fila de materiais de Produção
 * esperando revisão. **Contrato** é o que ele vem PROCURAR: o documento que
 * assinou, que hoje ele só tem no e-mail de meses atrás ou no WhatsApp de
 * alguém. As duas são leitura para ele; a de contrato é leitura pura — nada
 * ali é editável, nem o documento nem os dados dele.
 *
 * Segue valendo a decisão de origem desta tela: nenhum outro dado do cliente
 * aparece aqui (status de acesso, tráfego, saldo). Se um dia precisar de mais
 * alguma coisa, ela entra como uma aba nova, não espalhada dentro destas.
 *
 * A aba fica na URL (`?aba=`), mesma mecânica de Configurações e do hub
 * Comercial: sobrevive a um F5 e pode ser mandada por link ("abre a aba
 * Contrato e confere a cláusula 4").
 */
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { dict } = await getDictionary();
  const t = dict.cliente;

  const { aba: abaParam } = await searchParams;
  const aba: Aba = abaParam === "contratos" ? "contratos" : "aprovacoes";

  // Busca só o que a aba escolhida precisa — abrir "Contrato" não dispara a
  // consulta da fila de aprovações, e vice-versa.
  const aprovacoes = aba === "aprovacoes" ? await listarAprovacoesPendentes() : [];
  const contratos = aba === "contratos" ? await listarContratosDoClienteLogado() : [];

  const abas: { valor: Aba; label: string; icone: typeof IconCheckCircle }[] = [
    { valor: "aprovacoes", label: t.abaAprovacoes, icone: IconCheckCircle },
    { valor: "contratos", label: t.abaContratos, icone: IconFileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {aba === "contratos" ? t.contratosTitulo : t.tituloPagina}
        </h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          {aba === "contratos" ? t.contratosSubtitulo : t.subtituloPagina}
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-base-800">
        {abas.map((item) => (
          <Link
            key={item.valor}
            href={`/dashboard?aba=${item.valor}`}
            aria-current={aba === item.valor ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
              aba === item.valor
                ? "border-accent text-ink-primary"
                : "border-transparent text-ink-muted hover:text-ink-secondary"
            )}
          >
            <item.icone className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      {aba === "aprovacoes" && <AprovacoesPendentes aprovacoes={aprovacoes} />}
      {aba === "contratos" && <ContratosDoClienteLogado contratos={contratos} />}
    </div>
  );
}
