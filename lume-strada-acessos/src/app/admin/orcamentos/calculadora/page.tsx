import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/icons";
import { CalculadoraMargem } from "@/components/admin/orcamentos/CalculadoraMargem";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosCatalogo } from "@/app/admin/orcamentos/data";

export const dynamic = "force-dynamic";

/**
 * Simulador de preço/custo/margem, separado do construtor de orçamento de
 * verdade — pensado pra fase de negociação/precificação, antes de existir um
 * orçamento formal. Não salva nada no banco (ver aviso na própria tela); o
 * único jeito de uma simulação virar algo real é o botão "Criar orçamento
 * com esses itens", que manda os itens pro construtor via `sessionStorage`
 * (ver `CALCULADORA_HANDOFF_KEY` em `src/lib/utils/orcamentos.ts` e a leitura
 * em `OrcamentoBuilder.tsx`).
 */
export default async function CalculadoraMargemPage() {
  const { dict } = await getDictionary();
  const { categorias, servicosComCategoria } = await buscarDadosCatalogo();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orcamentos" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
          <IconChevronLeft className="h-3.5 w-3.5" />
          {dict.orcamentos.voltarParaOrcamentos}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">{dict.orcamentos.calculadoraTitulo}</h1>
        <p className="mt-1 text-xs text-ink-muted">{dict.orcamentos.calculadoraSubtitulo}</p>
      </div>

      <CalculadoraMargem categorias={categorias} servicosComCategoria={servicosComCategoria} />
    </div>
  );
}
