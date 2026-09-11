"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContratoRow } from "@/lib/types/contratos";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Toda ação aqui é chamada SEM LOGIN, a partir da página pública
 * `/contrato/[token]` — o token é a única credencial. Cada função REFAZ a
 * checagem de estado no servidor, mesmo padrão de `app/orcamento/actions.ts`.
 */
async function buscarContratoAtivoPorToken(token: string): Promise<{ ok: true; admin: ReturnType<typeof createAdminClient>; contrato: ContratoRow } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { data: contrato } = await admin.from("contratos").select("*").eq("token", token).single<ContratoRow>();
  if (!contrato) return { ok: false, error: "Contrato não encontrado." };

  if (contrato.status !== "enviado" && contrato.status !== "visualizado") {
    return { ok: false, error: "Este contrato não está mais disponível pra assinatura." };
  }
  return { ok: true, admin, contrato };
}

/** IP de quem está assinando, pra registro junto com nome/data — melhor esforço: cai pra `null` se o cabeçalho não vier (nunca bloqueia a assinatura por causa disso). */
async function ipDoRequisitante(): Promise<string | null> {
  try {
    const h = await headers();
    const encaminhado = h.get("x-forwarded-for");
    if (encaminhado) return encaminhado.split(",")[0]?.trim() || null;
    return h.get("x-real-ip");
  } catch {
    return null;
  }
}

/**
 * Garante que existe um cliente no cadastro para este contrato, e devolve o id.
 *
 * É o que fecha o buraco entre vender e atender: um contrato assinado vira
 * cliente na hora, sem alguém lembrar de copiar nome, e-mail e telefone à mão
 * para o cadastro — que é o passo que ninguém dá, e por isso a agência
 * termina com contrato assinado de gente que não existe no sistema.
 *
 * A ordem de busca importa e é deliberada:
 *   1. `contrato.cliente_id` — o contrato já nasceu de um cliente cadastrado.
 *      Nada a fazer.
 *   2. E-mail igual, na mesma empresa. O contrato não guarda CNPJ (só nome,
 *      e-mail e WhatsApp), então o e-mail é o melhor identificador que existe
 *      aqui.
 *   3. Não achou: cria, e o CNPJ é preenchido depois na ficha.
 *
 * Duplicar cliente é o erro caro aqui — dois cadastros do mesmo cliente
 * espalham as tarefas, os contratos e o financeiro dele em dois lugares, e
 * juntar de volta depois é trabalho manual. Por isso a criação é o ÚLTIMO
 * recurso, nunca o primeiro.
 *
 * Falhar aqui NÃO pode derrubar a assinatura: o cliente já clicou em assinar,
 * e o contrato está assinado. Se o cadastro não der certo, a assinatura vale
 * do mesmo jeito e o vínculo pode ser feito depois, na ficha do cliente.
 */
async function garantirClienteDoContrato(
  admin: ReturnType<typeof createAdminClient>,
  contrato: ContratoRow
): Promise<string | null> {
  try {
    if (contrato.cliente_id) return contrato.cliente_id;
    if (!contrato.company_id) return null;

    const email = contrato.email_cliente?.trim().toLowerCase() || null;

    if (email) {
      const { data } = await admin
        .from("clientes")
        .select("id")
        .eq("company_id", contrato.company_id)
        .ilike("email", email)
        .limit(1)
        .maybeSingle<{ id: string }>();
      if (data?.id) return data.id;
    }

    const nome = contrato.nome_cliente?.trim();
    if (!nome) return null;

    // `company_id` explícito: esta função roda pela Service Role, SEM sessão
    // nenhuma, então `current_company_id()` (o default da coluna) não teria de
    // onde tirar a empresa. O valor vem do próprio contrato.
    const { data: criado, error } = await admin
      .from("clientes")
      .insert({
        company_id: contrato.company_id,
        nome,
        razao_social: nome,
        email: contrato.email_cliente?.trim() || null,
        telefone: contrato.whatsapp_cliente?.trim() || null,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !criado) return null;
    return criado.id;
  } catch {
    return null;
  }
}

/** Aceite simples — sem certificado digital: nome informado + data/hora do servidor + IP (melhor esforço) ficam gravados no contrato como registro da assinatura. */
export async function assinarContratoPublico(token: string, nomeAssinante: string): Promise<ActionResult> {
  try {
    if (!nomeAssinante.trim()) return { ok: false, error: "Informe seu nome pra confirmar a assinatura." };

    const contexto = await buscarContratoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, contrato } = contexto;

    const ip = await ipDoRequisitante();

    // O cadastro do cliente vem ANTES do update para entrar no mesmo write: o
    // contrato assinado já sai com dono, e a ficha do cliente mostra o
    // contrato na primeira vez que alguém a abrir. `null` aqui não é erro —
    // ver a nota em `garantirClienteDoContrato`.
    const clienteId = await garantirClienteDoContrato(admin, contrato);

    const patch: Record<string, unknown> = {
      status: "assinado",
      assinado_em: new Date().toISOString(),
      assinado_nome: nomeAssinante.trim(),
      assinado_ip: ip,
    };
    if (clienteId && !contrato.cliente_id) patch.cliente_id = clienteId;

    const { error } = await admin.from("contratos").update(patch).eq("id", contrato.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/contrato/${token}`);
    // A ficha do cliente e a lista de Clientes acabaram de mudar para quem
    // está do lado de dentro.
    revalidatePath("/admin");
    revalidatePath("/admin/contratos/lista");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function recusarContratoPublico(token: string, motivo: string | null): Promise<ActionResult> {
  try {
    const contexto = await buscarContratoAtivoPorToken(token);
    if (!contexto.ok) return contexto;
    const { admin, contrato } = contexto;

    const { error } = await admin.from("contratos").update({ status: "recusado", recusado_em: new Date().toISOString(), motivo_recusa: motivo?.trim() || null }).eq("id", contrato.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath(`/contrato/${token}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
