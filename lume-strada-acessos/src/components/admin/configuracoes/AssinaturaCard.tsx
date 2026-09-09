import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconCreditCard, IconExternalLink, IconPauseCircle } from "@/components/ui/icons";
import type { Tone } from "@/lib/utils/tone";
import type { ConfiguracoesDict } from "@/lib/i18n/dictionaries/pt/configuracoes";
import type { Locale } from "@/lib/i18n/locales";

interface AssinaturaCardProps {
  nomeEmpresa: string;
  /** `companies.status` — 'ativo' | 'suspenso'. Quem muda isso é o super_admin em `/super-admin`, nunca esta tela. */
  status: string;
  /** `companies.expires_at` — data de término da licença, `null` quando não expira. */
  expiraEm: string | null;
  checkoutUrl: string | null;
  dict: ConfiguracoesDict;
  locale: Locale;
}

const LOCALE_INTL: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

/**
 * Aba "Assinatura" — deliberadamente mínima. NÃO existe processador de
 * pagamento integrado nesta fase: o botão só abre um link de checkout
 * externo (`NEXT_PUBLIC_CHECKOUT_URL`) e a liberação depois do pagamento é
 * feita à mão pelo dono do SaaS, em `/super-admin`.
 *
 * Por isso o card é SOMENTE LEITURA e não inventa colunas novas: ele mostra
 * exatamente o que já governa o acesso hoje — `companies.status` e
 * `companies.expires_at`, os mesmos dois campos que o middleware consulta
 * pra mandar a empresa inteira pra `/acesso-expirado`. Ter um segundo lugar
 * pra registrar "plano" só criaria dois relógios discordando.
 */
export function AssinaturaCard({ nomeEmpresa, status, expiraEm, checkoutUrl, dict, locale }: AssinaturaCardProps) {
  const expirada = expiraEm ? new Date(expiraEm).getTime() < Date.now() : false;
  const suspensa = status !== "ativo";

  const { tone, rotulo }: { tone: Tone; rotulo: string } = suspensa
    ? { tone: "critical", rotulo: dict.assinaturaSuspensa }
    : expirada
      ? { tone: "critical", rotulo: dict.assinaturaExpirada }
      : { tone: "good", rotulo: dict.assinaturaAtiva };

  const validade = expiraEm
    ? new Date(expiraEm).toLocaleDateString(LOCALE_INTL[locale], { day: "2-digit", month: "2-digit", year: "numeric" })
    : dict.assinaturaSemValidade;

  return (
    <div className="space-y-5">
      <Card>
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          <IconCreditCard className="h-3.5 w-3.5" /> {dict.assinaturaTitulo}
        </p>
        <p className="mb-5 text-sm text-ink-muted">{dict.assinaturaDescricao}</p>

        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-ink-muted">{dict.assinaturaPlanoLabel}</dt>
            <dd className="mt-1 text-sm font-medium text-ink-primary">{nomeEmpresa}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{dict.assinaturaSituacaoLabel}</dt>
            <dd className="mt-1">
              <Badge tone={tone} label={rotulo} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{dict.assinaturaValidaAte}</dt>
            <dd className="mt-1 text-sm font-medium text-ink-primary">{validade}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-10px_rgb(var(--color-accent)/0.7)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950"
          >
            {dict.assinaturaBotao}
            <IconExternalLink className="h-4 w-4" />
          </a>
        ) : (
          // Sem `NEXT_PUBLIC_CHECKOUT_URL`, o botão continua aparecendo —
          // desabilitado e dizendo "Em breve". É mais honesto do que um
          // parágrafo solto: quem abre a aba entende que a contratação existe
          // e ainda não está pronta, em vez de achar que a tela está pela
          // metade. `disabled` (e não um link para "#") garante que ele não
          // recebe foco nem clique enquanto não houver para onde ir.
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-base-600 px-4 py-2 text-sm font-medium text-ink-muted opacity-70"
          >
            <IconPauseCircle className="h-4 w-4" />
            {dict.assinaturaBotaoEmBreve}
          </button>
        )}
        <p className="mt-3 text-xs text-ink-muted">
          {checkoutUrl ? dict.assinaturaAvisoManual : dict.assinaturaAvisoEmBreve}
        </p>
      </Card>
    </div>
  );
}
