import Link from "next/link";
import { fmtBRL } from "@/lib/utils/format";
import { StatTile } from "@/components/ui/StatTile";
import { ValorPrivado } from "@/components/ui/ValorPrivado";
import { OlhoValoresToggle } from "@/components/ui/OlhoValoresToggle";
import { IconPiggyBank, IconChevronLeft, IconLayers } from "@/components/ui/icons";
import { CaixinhasGrid } from "@/components/admin/financeiro/caixinhas/CaixinhasGrid";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarCaixinhas } from "@/app/admin/financeiro/caixinhas/data";

export const dynamic = "force-dynamic";

/** Página principal do sub-módulo Caixinhas & Investimentos, dentro do Financeiro. */
export default async function CaixinhasPage() {
  const { dict } = await getDictionary();
  const t = dict.financeiro.caixinhas;
  const { caixinhas, contas } = await buscarCaixinhas();

  const saldoTotal = caixinhas.reduce((acc, c) => acc + c.saldo_atual, 0);
  const totalMetas = caixinhas.filter((c) => c.valor_meta != null && c.valor_meta > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/financeiro"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.financeiro.voltarParaFinanceiro}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
            <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
          </div>
          <OlhoValoresToggle />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconPiggyBank} label={t.statSaldoTotal} value={<ValorPrivado valor={fmtBRL(saldoTotal)} />} hint={t.hintCaixinhasQtd.replace("{n}", String(caixinhas.length))} />
        <StatTile icon={IconLayers} label={t.statComMeta} value={totalMetas} hint={t.hintComMetaDescricao} />
      </div>

      <CaixinhasGrid caixinhas={caixinhas} contas={contas} />
    </div>
  );
}
