import Link from "next/link";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { IconClipboardList, IconCheckCircle, IconPercent, IconPlus, IconFileText } from "@/components/ui/icons";
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
