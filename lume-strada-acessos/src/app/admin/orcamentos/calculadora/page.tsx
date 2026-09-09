import { redirect } from "next/navigation";

/**
 * A Calculadora de Margem virou a aba "Calculadora" do hub Comercial
 * unificado (`src/app/admin/comercial/page.tsx`) em vez de tela própria.
 * Mantido como redirect pra não quebrar quem tinha essa URL salva.
 */
export default function CalculadoraOrcamentosPageRedirect() {
  redirect("/admin/comercial?aba=calculadora");
}
