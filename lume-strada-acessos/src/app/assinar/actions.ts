"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buscarPorToken, origemDaRequisicao } from "./acesso";

export type Resultado = { ok: true } | { ok: false; error: string };

/** Só dígitos — para comparar CPF sem tropeçar em ponto e traço. */
const soDigitos = (v: string) => v.replace(/\D/g, "");

/**
 * Registra que a pessoa ABRIU o documento.
 *
 * Vale como prova de que ela teve o texto à frente antes de assinar, e é o
 * mesmo evento que o Autentique mostra na trilha ("Abriu o documento, em tal
 * hora, pelo IP tal"). Só marca a primeira vez: reabrir o link não reescreve
 * o momento em que o documento foi visto pela primeira vez.
 */
export async function registrarVisualizacao(token: string): Promise<Resultado> {
  const acesso = await buscarPorToken(token);
  if (!acesso) return { ok: false, error: "Link inválido." };
  if (acesso.signatario.visualizado_em || acesso.signatario.status === "assinado") return { ok: true };

  const admin = createAdminClient();
  const { ip, userAgent } = await origemDaRequisicao();

  await admin
    .from("assinatura_signatarios")
    .update({ status: "visualizado", visualizado_em: new Date().toISOString(), ip, user_agent: userAgent })
    .eq("id", acesso.signatario.id);

  await admin.from("assinatura_eventos").insert({
    company_id: acesso.documento.company_id,
    documento_id: acesso.documento.id,
    signatario_id: acesso.signatario.id,
    tipo: "visualizado",
    descricao: `${acesso.signatario.nome || acesso.signatario.email} abriu o documento`,
    ip,
    user_agent: userAgent,
  });

  return { ok: true };
}

/**
 * Assina.
 *
 * Tudo o que identifica a pessoa é gravado numa tacada só, com a hora do
 * servidor — nunca a do navegador, que qualquer um ajusta.
 */
export async function assinar(
  token: string,
  input: { nome: string; cpf: string; imagem: string }
): Promise<Resultado> {
  const acesso = await buscarPorToken(token);
  if (!acesso) return { ok: false, error: "Link inválido ou documento indisponível." };
  if (acesso.signatario.status === "assinado") return { ok: false, error: "Este documento já foi assinado por você." };
  if (acesso.esperando) {
    return { ok: false, error: "Ainda falta a assinatura de quem vem antes de você na ordem." };
  }
  if (!input.nome.trim()) return { ok: false, error: "Informe seu nome completo." };
  if (!input.imagem) return { ok: false, error: "Desenhe ou escreva sua assinatura." };

  // Quando a agência informou o CPF esperado, o que a pessoa digita tem de
  // bater — é uma checagem a mais de que quem abriu o link é quem devia.
  const esperado = soDigitos(acesso.signatario.documento ?? "");
  if (esperado && soDigitos(input.cpf) !== esperado) {
    return { ok: false, error: "O CPF informado não confere com o cadastrado para este signatário." };
  }

  const admin = createAdminClient();
  const { ip, userAgent } = await origemDaRequisicao();
  const agora = new Date().toISOString();

  const { error } = await admin
    .from("assinatura_signatarios")
    .update({
      status: "assinado",
      assinado_em: agora,
      ip,
      user_agent: userAgent,
      nome_informado: input.nome.trim().slice(0, 120),
      cpf_informado: soDigitos(input.cpf).slice(0, 14) || null,
      assinatura_imagem: input.imagem.slice(0, 400_000),
    })
    .eq("id", acesso.signatario.id);

  if (error) return { ok: false, error: error.message };

  await admin.from("assinatura_eventos").insert({
    company_id: acesso.documento.company_id,
    documento_id: acesso.documento.id,
    signatario_id: acesso.signatario.id,
    tipo: "assinado",
    descricao: `${input.nome.trim()} assinou o documento`,
    ip,
    user_agent: userAgent,
  });

  // O documento só fica concluído quando NÃO SOBRA ninguém pendente — a
  // conta é feita aqui, no servidor, sobre o estado real da tabela, e não a
  // partir do que o navegador achava que faltava.
  const { data: pendentes } = await admin
    .from("assinatura_signatarios")
    .select("id")
    .eq("documento_id", acesso.documento.id)
    .neq("status", "assinado");

  if ((pendentes ?? []).length === 0) {
    await admin
      .from("assinatura_documentos")
      .update({ status: "assinado", concluido_em: agora, atualizado_em: agora })
      .eq("id", acesso.documento.id);

    await admin.from("assinatura_eventos").insert({
      company_id: acesso.documento.company_id,
      documento_id: acesso.documento.id,
      tipo: "concluido",
      descricao: "Todos os signatários assinaram",
    });
  }

  return { ok: true };
}

/**
 * Recusa.
 *
 * Existe porque um documento parado sem explicação é pior do que um
 * documento recusado com motivo: a agência descobre na hora que precisa
 * refazer, em vez de esperar uma semana achando que a pessoa esqueceu.
 */
export async function recusar(token: string, motivo: string): Promise<Resultado> {
  const acesso = await buscarPorToken(token);
  if (!acesso) return { ok: false, error: "Link inválido." };
  if (acesso.signatario.status === "assinado") return { ok: false, error: "Você já assinou este documento." };

  const admin = createAdminClient();
  const { ip, userAgent } = await origemDaRequisicao();

  const { error } = await admin
    .from("assinatura_signatarios")
    .update({ status: "recusado", ip, user_agent: userAgent })
    .eq("id", acesso.signatario.id);
  if (error) return { ok: false, error: error.message };

  await admin.from("assinatura_eventos").insert({
    company_id: acesso.documento.company_id,
    documento_id: acesso.documento.id,
    signatario_id: acesso.signatario.id,
    tipo: "recusado",
    descricao: `${acesso.signatario.nome || acesso.signatario.email} recusou: ${motivo.trim().slice(0, 300) || "sem motivo informado"}`,
    ip,
    user_agent: userAgent,
  });

  return { ok: true };
}
