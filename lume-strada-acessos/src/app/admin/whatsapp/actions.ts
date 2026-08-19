"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { getWhatsAppProvider } from "@/lib/whatsapp/provider";
import type { ContatoWhatsappRow, MensagemWhatsappRow, SessaoWhatsappRow } from "@/lib/types/whatsapp";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

const PATH_INBOX = "/admin/whatsapp";
const PATH_CONEXAO = "/admin/whatsapp/conexao";

/**
 * `company_id` da empresa de quem está logado — necessário pra montar o
 * provedor certo (a instância Evolution API é uma por empresa, ver
 * `src/lib/whatsapp/provider.ts`). Lido de `whatsapp_sessoes` (RLS já
 * restringe a UMA linha, a da própria empresa) em vez de `profiles` só pra
 * reaproveitar uma tabela que todo chamador já tem permissão de ler.
 */
async function obterCompanyIdAtual(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase.from("whatsapp_sessoes").select("company_id").maybeSingle<{ company_id: string }>();
  if (!data?.company_id) throw new Error("Sessão do WhatsApp não encontrada para esta empresa.");
  return data.company_id;
}

// ----------------------------------------------------------------------------
// Sessão / Conexão
// ----------------------------------------------------------------------------

/**
 * Busca a sessão de WhatsApp da EMPRESA atual — usado tanto pela página
 * quanto pelo polling defensivo do client. `whatsapp_sessoes` deixou de ser
 * singleton global na migração multi-tenant (virou uma linha por empresa,
 * ver `multitenant-migration.sql` §5) — a RLS (`whatsapp_sessoes_admin_all`)
 * já restringe a UMA linha só (a da própria empresa de quem está logado),
 * então não precisa (nem dá: a coluna `singleton` não existe mais) filtrar
 * por nada extra aqui.
 */
export async function consultarSessaoAtual(): Promise<SessaoWhatsappRow | null> {
  const { supabase } = await requireModulo("whatsapp");
  const { data } = await supabase
    .from("whatsapp_sessoes")
    .select("id, status, numero_conectado, qr_code_base64, bateria_percentual, ultima_atualizacao, conectado_em, created_at, updated_at")
    .maybeSingle()
    .overrideTypes<SessaoWhatsappRow | null, { merge: false }>();
  return data ?? null;
}

export async function gerarQrCode(): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("whatsapp");
    const companyId = await obterCompanyIdAtual(supabase);
    const provider = getWhatsAppProvider(companyId);
    const resultado = await provider.gerarQrCode();

    // `.eq("company_id", ...)` é OBRIGATÓRIO aqui — mesmo a RLS já
    // restringindo a UMA linha só (a da própria empresa), o PostgREST
    // recusa qualquer UPDATE/DELETE sem filtro explícito na query
    // ("UPDATE requires a WHERE clause"), como proteção contra update em
    // massa por engano. `companyId` já foi resolvido acima.
    const { error } = await supabase
      .from("whatsapp_sessoes")
      .update({
        status: "aguardando_leitura",
        qr_code_base64: resultado.qrCodeBase64,
        ultima_atualizacao: new Date().toISOString(),
      })
      .eq("company_id", companyId);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH_CONEXAO);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function desconectarSessao(): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("whatsapp");
    const companyId = await obterCompanyIdAtual(supabase);
    const provider = getWhatsAppProvider(companyId);
    await provider.desconectar();

    // Mesmo motivo do `.eq(...)` em `gerarQrCode` acima — obrigatório pro
    // PostgREST aceitar o UPDATE, independente da RLS já isolar por empresa.
    const { error } = await supabase
      .from("whatsapp_sessoes")
      .update({
        status: "desconectado",
        qr_code_base64: null,
        numero_conectado: null,
        conectado_em: null,
        ultima_atualizacao: new Date().toISOString(),
      })
      .eq("company_id", companyId);

    if (error) return { ok: false, error: error.message };
    revalidatePath(PATH_CONEXAO);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Inbox — contatos e mensagens
// ----------------------------------------------------------------------------

/** Mensagens de UM contato, mais antigas primeiro — buscadas sob demanda quando o atendente abre a conversa (nunca todo o histórico de todo mundo de uma vez). */
export async function listarMensagens(contatoId: string): Promise<MensagemWhatsappRow[]> {
  const { supabase } = await requireModulo("whatsapp");
  const { data } = await supabase
    .from("whatsapp_mensagens")
    .select("id, contato_id, direcao, tipo, conteudo, midia_url, status_entrega, external_message_id, enviado_por, created_at")
    .eq("contato_id", contatoId)
    .order("created_at", { ascending: true })
    .overrideTypes<MensagemWhatsappRow[], { merge: false }>();
  return data ?? [];
}

export async function enviarMensagem(contatoId: string, conteudo: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireModulo("whatsapp");
    const texto = conteudo.trim();
    if (!texto) return { ok: false, error: "Digite uma mensagem." };

    const { data: contato, error: erroContato } = await supabase
      .from("whatsapp_contatos")
      .select("telefone")
      .eq("id", contatoId)
      .single()
      .overrideTypes<Pick<ContatoWhatsappRow, "telefone">, { merge: false }>();
    if (erroContato || !contato) return { ok: false, error: "Contato não encontrado." };

    // Salva primeiro como "enviando" — se o provedor falhar, a mensagem
    // continua visível na conversa marcada como falha, em vez de sumir.
    const { data: mensagem, error: erroInsert } = await supabase
      .from("whatsapp_mensagens")
      .insert({
        contato_id: contatoId,
        direcao: "enviada",
        tipo: "texto",
        conteudo: texto,
        status_entrega: "enviando",
        enviado_por: user.id,
      })
      .select("id")
      .single();
    if (erroInsert || !mensagem) return { ok: false, error: erroInsert?.message ?? "Falha ao registrar a mensagem." };

    const companyId = await obterCompanyIdAtual(supabase);
    const provider = getWhatsAppProvider(companyId);
    try {
      const resultado = await provider.enviarMensagemTexto(contato.telefone, texto);
      await supabase
        .from("whatsapp_mensagens")
        .update({ status_entrega: "enviado", external_message_id: resultado.externalMessageId })
        .eq("id", mensagem.id);
    } catch (erroEnvio) {
      await supabase.from("whatsapp_mensagens").update({ status_entrega: "falhou" }).eq("id", mensagem.id);
      return { ok: false, error: erroEnvio instanceof Error ? erroEnvio.message : "Falha ao enviar pelo provedor." };
    }

    await supabase
      .from("whatsapp_contatos")
      .update({ ultima_mensagem_preview: texto.slice(0, 120), ultima_mensagem_em: new Date().toISOString() })
      .eq("id", contatoId);

    revalidatePath(PATH_INBOX);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Vínculo com o CRM
// ----------------------------------------------------------------------------

/** Cria um Lead no CRM a partir de uma conversa desconhecida — "Adicionar ao CRM" na tela de chat. */
export async function criarLeadDoContato(contatoId: string): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("whatsapp");

    const { data: contato, error: erroContato } = await supabase
      .from("whatsapp_contatos")
      .select("nome, telefone, lead_id")
      .eq("id", contatoId)
      .single()
      .overrideTypes<Pick<ContatoWhatsappRow, "nome" | "telefone" | "lead_id">, { merge: false }>();
    if (erroContato || !contato) return { ok: false, error: "Contato não encontrado." };
    if (contato.lead_id) return { ok: false, error: "Esta conversa já está vinculada a um lead." };

    const { data: lead, error: erroLead } = await supabase
      .from("crm_leads")
      .insert({
        nome: contato.nome?.trim() || contato.telefone,
        whatsapp: contato.telefone,
        origem: "whatsapp",
        status: "lead_frio",
      })
      .select("id")
      .single();
    if (erroLead || !lead) return { ok: false, error: erroLead?.message ?? "Falha ao criar o lead." };

    const { error: erroVinculo } = await supabase.from("whatsapp_contatos").update({ lead_id: lead.id }).eq("id", contatoId);
    if (erroVinculo) return { ok: false, error: erroVinculo.message };

    revalidatePath(PATH_INBOX);
    revalidatePath("/admin/comercial");
    return { ok: true, id: lead.id as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
