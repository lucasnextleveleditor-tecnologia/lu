import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import type { ProfileRow } from "@/lib/types/database";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { OnboardingRow } from "@/lib/types/onboarding";
import type { PlanoRow } from "@/lib/types/planejamento";
import { CadastrosWorkspace } from "@/components/admin/cadastros/CadastrosWorkspace";
import { PainelOnboarding } from "@/components/admin/onboarding/PainelOnboarding";
import { PainelPlanejamento } from "@/components/admin/planejamento/PainelPlanejamento";
import { cn } from "@/lib/utils/cn";
import { IconUsers, IconClipboardList, IconCalendar } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * Gestão de Clientes — duas abas: o cadastro e o briefing.
 *
 * A barra de abas tinha sumido daqui quando Equipe migrou pra Configurações
 * e sobrou só Clientes (ver `CadastrosWorkspace`). Ela volta agora porque
 * voltou a haver duas coisas de naturezas diferentes no mesmo lugar:
 * Clientes é o CADASTRO (quem é, como contatar, tem acesso ao portal?) e
 * Onboarding é o BRIEFING (o que vende, pra quem, com que tom de voz).
 *
 * Aba por `?aba=`, como no hub Comercial e em Configurações — e não por
 * estado local — pra que o endereço leve de volta ao mesmo lugar: o botão
 * "voltar" do wizard aponta pra `?aba=onboarding` e cai onde a pessoa estava.
 *
 * Cada aba busca SÓ o que precisa, e é por isso que a consulta é escolhida
 * depois de saber a aba: `profiles` (que só serve pro status de acesso na
 * tabela de clientes) não é lida quando se está no Onboarding, e os
 * briefings não são lidos quando se está em Clientes.
 */
export default async function GestaoDeClientesPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { supabase, user } = await requireModuloOuRedirect("clientes");
  const { dict } = await getDictionary();
  const { aba } = await searchParams;
  const abaAtiva = aba === "onboarding" ? "onboarding" : aba === "planejamento" ? "planejamento" : "clientes";
  const t = dict.onboarding;

  const [perfilRes, clientesRes] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single().overrideTypes<Pick<ProfileRow, "role">, { merge: false }>(),
    supabase.from("clientes").select("*").order("nome").overrideTypes<ClienteRow[], { merge: false }>(),
  ]);

  const clientes = clientesRes.data ?? [];
  const souAdmin = perfilRes.data?.role === "admin";

  const profilesPorId =
    abaAtiva === "clientes"
      ? Object.fromEntries(
          ((await supabase.from("profiles").select("*").overrideTypes<ProfileRow[], { merge: false }>()).data ?? []).map(
            (p) => [p.id, p]
          )
        )
      : {};

  const onboardings =
    abaAtiva === "onboarding"
      ? (await supabase.from("cliente_onboarding").select("*").overrideTypes<OnboardingRow[], { merge: false }>()).data ?? []
      : [];

  // A lista de planejamento precisa dos ciclos ENCERRADOS também (é o que
  // vira "3 ciclos no histórico" embaixo do nome), então não dá para filtrar
  // por `status = 'ativo'` na consulta. A RLS já limita à empresa, e a
  // separação entre ativo e histórico acontece no painel.
  const planos =
    abaAtiva === "planejamento"
      ? (
          await supabase
            .from("planos_estrategicos")
            .select("*")
            .order("data_inicio", { ascending: false })
            .overrideTypes<PlanoRow[], { merge: false }>()
        ).data ?? []
      : [];

  const abas = [
    { valor: "clientes", label: t.abaClientes, icone: IconUsers },
    { valor: "onboarding", label: t.abaOnboarding, icone: IconClipboardList },
    { valor: "planejamento", label: dict.planejamento.abaPlanejamento, icone: IconCalendar },
  ] as const;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-tight">{dict.cadastros.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.cadastros.subtituloPagina}</p>
      </div>

      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-base-800">
        {abas.map((item) => (
          <Link
            key={item.valor}
            href={`/admin?aba=${item.valor}`}
            aria-current={abaAtiva === item.valor ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
              abaAtiva === item.valor
                ? "border-accent text-ink-primary"
                : "border-transparent text-ink-muted hover:text-ink-secondary"
            )}
          >
            <item.icone className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      {abaAtiva === "clientes" ? (
        <CadastrosWorkspace clientes={clientes} profilesPorId={profilesPorId} souAdmin={souAdmin} />
      ) : abaAtiva === "onboarding" ? (
        <PainelOnboarding clientes={clientes} onboardings={onboardings} />
      ) : (
        <PainelPlanejamento clientes={clientes} planos={planos} />
      )}
    </div>
  );
}
