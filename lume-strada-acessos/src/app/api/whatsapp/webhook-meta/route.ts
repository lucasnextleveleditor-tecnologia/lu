import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Webhook da API OFICIAL da Meta (WhatsApp Cloud API) — formato de payload
 * totalmente diferente do webhook da Evolution API
 * (`src/app/api/whatsapp/webhook/route.ts`), por isso é uma rota separada.
 *
 * Dois métodos:
 * - GET: handshake de verificação que a Meta faz UMA VEZ, quando você
 *   cadastra a URL no painel do App (Meta for Developers -> WhatsApp ->
 *   Configuration -> Webhook). Precisa responder com o valor de
 *   `hub.challenge` se `hub.verify_token` bater com
 *   `WHATSAPP_CLOUD_API_VERIFY_TOKEN`.
 * - POST: eventos de verdade (mensagem recebida, status de entrega/leitura).
 *
 * MULTI-TENANT (mesma limitação de propósito documentada em
 * `src/lib/whatsapp/provider.ts`): a Cloud API está implementada hoje como
 * configuração única (env vars, um número só). Por isso, assim como no
 * outro webhook, a URL cadastrada no painel da Meta precisa incluir
 * `?company_id=<id da empresa dona do número>` — sem isso, recusa (falha
 * fechado, nunca aberto).
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const esperado = process.env.WHATSAPP_CLOUD_API_VERIFY_TOKEN;
  if (mode === "subscribe" && esperado && token === esperado && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verificação falhou." }, { status: 403 });
}

/** `?company_id=` da URL cadastrada no painel da Meta — ver nota multi-tenant no topo do arquivo. `null` se ausente ou com formato inválido. */
function obterCompanyId(req: Request): string | null {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("company_id");
  return companyId && UUID_REGEX.test(companyId) ? companyId : null;
}

export async function POST(req: Request) {
  const companyId = obterCompanyId(req);
  if (!companyId) {
    return NextResponse.json({ error: "URL do webhook sem ?company_id= válido." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const eventos = extrairEventos(payload);

  for (const evento of eventos) {
    if (evento.tipo === "mensagem") {
      // Upsert do contato — mesmo padrão do webhook da Evolution API:
      // único por (company_id, telefone), nunca só telefone.
      const { data: contato, error: erroContato } = await supabase
        .from("whatsapp_contatos")
        .upsert({ company_id: companyId, telefone: evento.telefone, nome: evento.nomeContato ?? undefined }, { onConflict: "company_id,telefone" })
        .select("id")
        .single();
      if (erroContato || !contato) continue;

      // Idempotência — a Meta pode reentregar o mesmo evento.
      if (evento.externalMessageId) {
        const { data: existente } = await supabase
          .from("whatsapp_mensagens")
          .select("id")
          .eq("company_id", companyId)
          .eq("external_message_id", evento.externalMessageId)
          .maybeSingle();
        if (existente) continue;
      }

      const { error: erroMensagem } = await supabase.from("whatsapp_mensagens").insert({
        company_id: companyId,
        contato_id: contato.id,
        direcao: "recebida",
        tipo: "texto",
        conteudo: evento.conteudo ?? null,
        external_message_id: evento.externalMessageId ?? null,
      });
      if (erroMensagem) continue;

      await supabase
        .from("whatsapp_contatos")
        .update({
          ultima_mensagem_preview: evento.conteudo?.slice(0, 120) || "Mensagem recebida",
          ultima_mensagem_em: new Date().toISOString(),
        })
        .eq("id", contato.id)
        .eq("company_id", companyId);
    }

    if (evento.tipo === "status") {
      const mapa: Record<string, string> = { sent: "enviado", delivered: "entregue", read: "lido", failed: "falhou" };
      const statusEntrega = mapa[evento.status];
      if (statusEntrega) {
        await supabase
          .from("whatsapp_mensagens")
          .update({ status_entrega: statusEntrega })
          .eq("company_id", companyId)
          .eq("external_message_id", evento.externalMessageId);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// ----------------------------------------------------------------------------
// Normalização do payload da Meta Cloud API — formato oficial e estável
// (entry[].changes[].value.{messages,contacts,statuses}), ao contrário do
// da Evolution API que muda entre versões.
// ----------------------------------------------------------------------------

type EventoMeta =
  | { tipo: "mensagem"; telefone: string; nomeContato?: string; conteudo?: string; externalMessageId?: string }
  | { tipo: "status"; externalMessageId: string; status: string };

function extrairEventos(payload: unknown): EventoMeta[] {
  const eventos: EventoMeta[] = [];
  if (typeof payload !== "object" || payload === null) return eventos;

  const entry = (payload as Record<string, unknown>).entry;
  if (!Array.isArray(entry)) return eventos;

  for (const item of entry) {
    const changes = (item as Record<string, unknown>)?.changes;
    if (!Array.isArray(changes)) continue;

    for (const mudanca of changes) {
      const value = (mudanca as Record<string, unknown>)?.value as Record<string, unknown> | undefined;
      if (!value) continue;

      const contatos = Array.isArray(value.contacts) ? (value.contacts as Record<string, unknown>[]) : [];
      const perfil = contatos[0]?.profile as Record<string, unknown> | undefined;
      const nomeContato = typeof perfil?.name === "string" ? perfil.name : undefined;

      const mensagens = Array.isArray(value.messages) ? (value.messages as Record<string, unknown>[]) : [];
      for (const msg of mensagens) {
        const telefone = typeof msg.from === "string" ? msg.from : null;
        if (!telefone) continue;
        const texto = (msg.text as Record<string, unknown> | undefined)?.body;
        eventos.push({
          tipo: "mensagem",
          telefone,
          nomeContato,
          conteudo: typeof texto === "string" ? texto : undefined,
          externalMessageId: typeof msg.id === "string" ? msg.id : undefined,
        });
      }

      const statuses = Array.isArray(value.statuses) ? (value.statuses as Record<string, unknown>[]) : [];
      for (const st of statuses) {
        const id = typeof st.id === "string" ? st.id : null;
        const status = typeof st.status === "string" ? st.status : null;
        if (id && status) eventos.push({ tipo: "status", externalMessageId: id, status });
      }
    }
  }

  return eventos;
}
