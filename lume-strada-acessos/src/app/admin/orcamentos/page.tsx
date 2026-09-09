import { redirect } from "next/navigation";

/**
 * `/admin/orcamentos` virou a aba "Propostas" do hub Comercial unificado —
 * ver `src/app/admin/comercial/page.tsx`. Mantido como redirect (em vez de
 * simplesmente apagar a rota) pra não quebrar favoritos/links antigos e os
 * vários "Voltar" espalhados pelas telas de apoio (`catalogo`, `tipos`,
 * `portfolio`, detalhe de orçamento...), que continuam apontando pra cá.
 */
export default function OrcamentosPageRedirect() {
  redirect("/admin/comercial?aba=propostas");
}
