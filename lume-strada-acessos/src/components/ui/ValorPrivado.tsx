"use client";

import { useValoresVisiveis } from "@/lib/valores-visiveis/ValoresVisiveisProvider";

interface ValorPrivadoProps {
  /** Valor já formatado (`fmtBRL`, `fmtPercent` etc.) — este componente só decide TEXTO vs máscara, não formata nada. */
  valor: string;
  className?: string;
  /** Máscara exibida enquanto oculto — largura fixa de propósito (não varia com o tamanho do valor real), pra não vazar magnitude. */
  mascara?: string;
}

/**
 * Substitui o texto de um valor financeiro por uma máscara enquanto
 * `ValoresVisiveisProvider` estiver oculto (estado padrão) — usado em todo
 * StatTile/linha/card com dinheiro no Financeiro e no card "Financeiro do
 * Mês" do Dashboard (ver `OlhoValoresToggle` pro botão que alterna). Só
 * troca o TEXTO — barras/meters de proporção continuam visíveis, decisão
 * deliberada documentada no Provider.
 */
export function ValorPrivado({ valor, className, mascara = "••••" }: ValorPrivadoProps) {
  const { visivel } = useValoresVisiveis();
  return <span className={className}>{visivel ? valor : mascara}</span>;
}
