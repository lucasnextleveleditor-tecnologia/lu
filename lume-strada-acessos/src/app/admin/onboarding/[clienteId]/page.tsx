import Link from "next/link";
import { notFound } from "next/navigation";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { OnboardingWizard } from "@/components/admin/onboarding/OnboardingWizard";
import { LinkDoOnboarding } from "@/components/admin/onboarding/LinkDoOnboarding";
import { IconChevronLeft, IconClipboardList, IconPrinter } from "@/components/ui/icons";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { OnboardingRow } from "@/lib/types/onboarding";

export const dynamic = "force-dynamic";

/**
 * O briefing de UM cliente.
 *
 * Página própria, e não mais um bloco dentro do modal de detalhe do cliente:
 * são cinco etapas e quarenta campos, e um overlay de 600px de largura
 * transforma isso numa rolagem infinita dentro de uma caixinha. Página
 * também dá endereço — dá pra mandar o link do briefing de um cliente pra
 * alguém da equipe.
 *
 * As duas leituras vêm do SERVIDOR, já com a RLS aplicada: o wizard nasce
 * preenchido, sem aquele pisca de tela vazia que um `useEffect` buscando
 * dados sempre produz.
 */
export default async function OnboardingDoClientePage({ params }: { params: Promise<{ clienteId: string }> }) {
  const { supabase } = await requireModuloOuRedirect("clientes");
  const { clienteId } = await params;
  const { dict } = await getDictionary();
  const t = dict.onboarding;

  const [clienteRes, onboardingRes] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("id", clienteId).maybeSingle<Pick<ClienteRow, "id" | "nome">>(),
    supabase.from("cliente_onboarding").select("*").eq("cliente_id", clienteId).maybeSingle<OnboardingRow>(),
  ]);

  // A RLS já limita à empresa de quem está logado: um id de outra agência
  // simplesmente não devolve linha, e aqui vira 404 — nunca "sem permissão",
  // que confirmaria que aquele cliente existe em algum lugar.
  if (!clienteRes.data) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin?aba=onboarding"
        className="mb-5 inline-flex items-center gap-1 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {t.voltarParaClientes}
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
          <IconClipboardList className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{clienteRes.data.nome}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
        </div>

        {/* `target="_blank"` e não download: o PDF abre na aba, que é onde se
            aperta Ctrl+P. Quem quer o arquivo salva de lá; quem quer imprimir
            não precisa baixar antes. */}
        <a
          href={`/api/onboarding/${clienteRes.data.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        >
          <IconPrinter className="h-3.5 w-3.5" />
          {t.baixarPdf}
        </a>
      </div>

      <LinkDoOnboarding
        clienteId={clienteRes.data.id}
        clienteNome={clienteRes.data.nome}
        token={onboardingRes.data?.token ?? null}
        linkEnviadoEm={onboardingRes.data?.link_enviado_em ?? null}
        whatsappAprovador={onboardingRes.data?.aprovador_whatsapp ?? null}
        respondidoPorNome={onboardingRes.data?.respondido_por_nome ?? null}
        respondidoEm={onboardingRes.data?.respondido_em ?? null}
      />

      <OnboardingWizard
        clienteId={clienteRes.data.id}
        clienteNome={clienteRes.data.nome}
        inicial={onboardingRes.data ?? null}
      />
    </div>
  );
}
