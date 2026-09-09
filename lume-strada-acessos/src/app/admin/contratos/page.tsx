import Link from "next/link";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { IconClipboardList, IconCheckCircle, IconPercent, IconPlus, IconFileText, IconChevronRight } from "@/components/ui/icons";
import { ContratosManager } from "@/components/admin/contratos/ContratosManager";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosContratos } from "@/app/admin/contratos/data";

export const dynamic = "force-dynamic";

/** Tela principal do módulo de Contratos (Fase 3) — mesmo princípio de `/admin/orcamentos`: StatTiles sobre a lista inteira, filtro por busca/status client-side dentro de `ContratosManager`. */
export default async function ContratosPage() {
  const { dict } = await getDictionary();
  const { contratos, valorAguardandoAssinatura, valorAssinadoMes, totalAguardando, taxaAssinatura } = await buscarDadosContratos({});

  return (
    <div className="space-y-6">
      {/* Os dois caminhos de Contratos, lado a lado no topo. São coisas
          diferentes o bastante para não caberem numa aba escondida: um monta
          o contrato aqui dentro, o outro recebe um PDF que já veio pronto de
          fora. Quem chega precisa ver as duas antes de escolher. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-accent/30 bg-accent/[0.07] p-4">
          <p className="text-sm font-semibold text-ink-primary">Contrato do sistema</p>
          <p className="mt-1 text-xs leading-snug text-ink-muted">
            Monte o contrato aqui dentro, a partir dos seus modelos, e mande para o cliente assinar. É o que está nesta tela.
          </p>
        </div>
        <Link
          href="/admin/assinaturas"
          className="group rounded-2xl border border-base-700 bg-base-900/60 p-4 transition hover:border-base-600"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            Assinatura de PDF
            <IconChevronRight className="h-3.5 w-3.5 text-ink-muted transition group-hover:translate-x-0.5" />
          </p>
          <p className="mt-1 text-xs leading-snug text-ink-muted">
            Já tem o contrato pronto em PDF? Suba o arquivo, marque onde cada um assina e mande por link.
          </p>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.contratos.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.contratos.subtituloPagina}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/contratos/tipos">
            <Button variant="ghost" className="gap-1.5">
              <IconFileText className="h-4 w-4" />
              {dict.contratos.tiposBtn}
            </Button>
          </Link>
          <Link href="/admin/contratos/novo">
            <Button className="gap-1.5">
              <IconPlus className="h-4 w-4" />
              {dict.contratos.novoContratoBtn}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={IconClipboardList}
          label={dict.contratos.statAguardandoAssinatura}
          value={fmtBRL(valorAguardandoAssinatura)}
          hint={dict.contratos.hintAguardandoAssinatura.replace("{n}", String(totalAguardando))}
        />
        <StatTile icon={IconCheckCircle} label={dict.contratos.statAssinadoMes} value={fmtBRL(valorAssinadoMes)} tone="good" hint={dict.contratos.hintAssinadoMes} />
        <StatTile icon={IconPercent} label={dict.contratos.statTaxaAssinatura} value={fmtPercent(taxaAssinatura)} hint={dict.contratos.hintTaxaAssinatura} />
      </div>

      <ContratosManager contratos={contratos} />
    </div>
  );
}
