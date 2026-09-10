"use server";

import { revalidatePath } from "next/cache";
import { concluirPublico, salvarEtapaPublica, type ResultadoPublico } from "./acesso";
import type { CamposDoOnboarding } from "@/lib/types/onboarding";

/**
 * As duas ações do formulário público.
 *
 * São `"use server"` e não uma rota de API porque é assim que o resto do
 * sistema faz (`app/orcamento/actions.ts`, `app/assinar/actions.ts`) — mesmo
 * padrão, mesma leitura. Toda a conferência mora em `acesso.ts`; aqui só
 * chega o token e o que foi digitado.
 */

export async function salvarEtapaDoCliente(
  token: string,
  etapa: number,
  dados: Partial<CamposDoOnboarding>,
  respondidoPor: string
): Promise<ResultadoPublico> {
  const r = await salvarEtapaPublica(token, etapa, dados, respondidoPor);
  if (r.ok) revalidatePath(`/onboarding/${token}`);
  return r;
}

export async function concluirDoCliente(token: string, respondidoPor: string): Promise<ResultadoPublico> {
  const r = await concluirPublico(token, respondidoPor);
  if (r.ok) {
    revalidatePath(`/onboarding/${token}`);
    // A equipe vê o briefing mudar de "em andamento" para "concluído" sem
    // precisar recarregar nada na mão.
    revalidatePath("/admin");
  }
  return r;
}
