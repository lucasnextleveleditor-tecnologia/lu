import Link from "next/link";
import { StatTile } from "@/components/ui/StatTile";
import { Button } from "@/components/ui/Button";
import { IconClipboardList, IconCheckCircle, IconPercent, IconPlus, IconLayers } from "@/components/ui/icons";
import { OrcamentosManager } from "@/components/admin/orcamentos/OrcamentosManager";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosOrcamentos } from "@/app/admin/orcamentos/data";

export const dynamic = "force-dynamic";

/**
 * Tela principal do módulo — StatTiles com os totais SEMPRE calculados sobre
 * a lista inteira (não filtrada), pra não confundir "quanto tá em aberto no
 * total" com o resultado de uma busca pontual; o filtro por busca/status é
 * inteiramente client-side dentro de `OrcamentosManager`, sobre essa mesma
 * lista completa.
 */
export default async function OrcamentosPage() {
  const { dict } = await getDictionary();
  const { orcamentos, valorEmAberto, valorAprovadoMes, totalAbertos, taxaAprovacao } = await buscarDadosOrcamentos({});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.orcamentos.subtituloPagina}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/orcamentos/catalogo">
            <Button variant="ghost" className="gap-1.5">
              <IconLayers className="h-4 w-4" />
              {dict.orcamentos.catalogoBtn}
            </Button>
          </Link>
          <Link href="/admin/orcamentos/novo">
            <Button className="gap-1.5">
              <IconPlus className="h-4 w-4" />
              {dict.orcamentos.novoOrcamentoBtn}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={IconClipboardList}
          label={dict.orcamentos.statEmAberto}
          value={fmtBRL(valorEmAberto)}
          hint={dict.orcamentos.hintOrcamentosAbertos.replace("{n}", String(totalAbertos))}
        />
        <StatTile
          icon={IconCheckCircle}
          label={dict.orcamentos.statAprovadoMes}
          value={fmtBRL(valorAprovadoMes)}
          tone="good"
          hint={dict.orcamentos.hintAprovadosDescricao}
        />
        <StatTile
          icon={IconPercent}
          label={dict.orcamentos.statTaxaAprovacao}
          value={fmtPercent(taxaAprovacao)}
          hint={dict.orcamentos.hintTaxaAprovacaoDescricao}
        />
      </div>

      <OrcamentosManager orcamentos={orcamentos} />
    </div>
  );
}
