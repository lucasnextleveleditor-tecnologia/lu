import Link from "next/link";
import { addMeses, mesParam } from "@/lib/utils/financeiro";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { MesAnoPopover } from "@/components/admin/financeiro/MesAnoPopover";

interface MesNavProps {
  referencia: Date;
  contexto: string;
  /** Rota base pros links de navegação — as telas de detalhe por categoria (`/receitas`, `/despesas`, `/contas`, `/cartoes`) reaproveitam este componente, então a navegação de mês precisa continuar NA MESMA tela, não voltar sempre pro Financeiro principal. */
  basePath?: string;
  /** Janela de projeção (15/30/60/90) da tela de Fluxo de Caixa — opcional, só usado lá (ver `PeriodoFluxoCaixaToggle`), pra trocar de mês sem resetar o período da "Projeção de Saldo" (seção independente, controlada por outro toggle). */
  dias?: number;
}

/** Navegação de mês — setas ‹ › continuam pura navegação por link (mesmo padrão de `DateNav`); o rótulo central agora abre o `MesAnoPopover` (client, ver esse arquivo) pra pular direto pra qualquer mês/ano. */
export async function MesNav({ referencia, contexto, basePath = "/admin/financeiro", dias }: MesNavProps) {
  const { dict } = await getDictionary();
  const anterior = addMeses(referencia, -1);
  const proximo = addMeses(referencia, 1);
  const hoje = new Date();
  const mesAtual = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
  const isMesAtual = mesParam(referencia) === mesParam(mesAtual);

  const sufixoContexto = (contexto !== "todos" ? `&contexto=${contexto}` : "") + (dias ? `&dias=${dias}` : "");
  const hrefFor = (ref: Date) => `${basePath}?mes=${mesParam(ref)}${sufixoContexto}`;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={hrefFor(anterior)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label={dict.financeiro.mesAnteriorAria}
      >
        ‹
      </Link>
      <div className="w-40 text-center">
        <MesAnoPopover referencia={referencia} contexto={contexto} basePath={basePath} dias={dias} />
        {!isMesAtual && (
          <Link
            href={`${basePath}${contexto !== "todos" || dias ? `?${[contexto !== "todos" ? `contexto=${contexto}` : "", dias ? `dias=${dias}` : ""].filter(Boolean).join("&")}` : ""}`}
            className="text-xs text-accent hover:underline"
          >
            {dict.financeiro.voltarParaHoje}
          </Link>
        )}
      </div>
      <Link
        href={hrefFor(proximo)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        aria-label={dict.financeiro.proximoMesAria}
      >
        ›
      </Link>
    </div>
  );
}
