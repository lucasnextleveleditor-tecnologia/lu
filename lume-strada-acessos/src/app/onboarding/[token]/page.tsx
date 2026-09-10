import { getNomeApp } from "@/lib/branding/getNomeApp";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarOnboardingPorToken, paraOPublico } from "@/app/onboarding/acesso";
import { OnboardingWizard } from "@/components/admin/onboarding/OnboardingWizard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { IconClipboardList, IconLock } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * O briefing respondido pelo PRÓPRIO CLIENTE — sem login, só com o link.
 *
 * Mesma família de `/orcamento/[token]` e `/assinar/[token]`: quem responde
 * não tem conta e não vai criar uma para preencher um formulário. Toda a
 * conferência (token existe, link foi enviado, prazo não venceu) mora em
 * `acesso.ts`, e a resposta para os três casos de falha é a MESMA tela —
 * dizer "expirou" em vez de "não existe" contaria a quem está tentando
 * adivinhar que ele acertou um token válido.
 *
 * O wizard é o MESMO componente da tela da equipe, em modo `publico`. Manter
 * dois formulários com quarenta campos em paralelo seria garantir que um
 * deles ficasse desatualizado.
 */
export default async function OnboardingPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [acesso, nomeApp, { dict }] = await Promise.all([
    buscarOnboardingPorToken(token),
    getNomeApp(),
    getDictionary(),
  ]);
  const t = dict.onboarding;

  if (!acesso) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className="max-w-md text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-ink-muted">
            <IconLock className="h-5 w-5" />
          </span>
          <h1 className="text-base font-semibold tracking-tight">{t.linkInvalidoTitulo}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.linkInvalidoTexto}</p>
        </div>
      </div>
    );
  }

  const publico = paraOPublico(acesso);

  return (
    <div className="min-h-screen">
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
            <IconClipboardList className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{nomeApp}</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{publico.clienteNome}</h1>
          </div>
        </div>

        <p className="mb-6 rounded-2xl border border-base-700 bg-base-900/40 p-4 text-sm leading-relaxed text-ink-secondary">
          {t.publicoIntro}
        </p>

        <OnboardingWizard
          clienteNome={publico.clienteNome}
          inicial={publico.onboarding as never}
          publico={{ token }}
        />
      </div>
    </div>
  );
}
