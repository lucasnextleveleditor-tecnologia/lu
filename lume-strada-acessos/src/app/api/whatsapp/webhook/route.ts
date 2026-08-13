import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Webhook do provedor de mensageria (Evolution API / Baileys / Z-API) —
 * onde novas mensagens, atualizações de QR Code e mudanças de status de
 * conexão chegam de fora pra dentro da plataforma.
 *
 * Endpoint PÚBLICO — protegido por um segredo compartilhado (query
 * `?secret=...` ou header `x-webhook-secret`), NUNCA por sessão de usuário
 * (quem chama aqui é o provedor externo, não um navegador logado). Defina
 * `WHATSAPP_WEBHOOK_SECRET` no `.env.local`/Vercel e cadastre a mesma URL +
 * segredo no painel do provedor escolhido. Sem o segredo configurado, TODA
 * requisição é recusada (falha fechado, nunca aberto).
 *
 * Usa a Service Role (`createAdminClient`) de propósito: a requisição não
 * tem cookie de sessão de admin, então RLS bloquearia tudo — a única
 * validação de segurança aqui é o segredo compartilhado, não RLS.
 *
 * O formato exato do payload muda de provedor pra provedor — `normalizarEvento`
 * abaixo cobre o formato da Evolution API (`{ event: "...", data: {...} }`),
 * com comentários indicando onde ajustar pra outro provedor. Eventos não
 * reconhecidos (ou que optamos por ignorar, como o eco da própria mensagem
 * que a gente mandou) retornam 200 — o provedor não deve ficar re-tentando
 * um evento que a gente decidiu não tratar.
 */

function validarSegredo(req: Request): boolean {
  const segredo = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!segredo) return false; // sem segredo configurado ainda -> recusa tudo, nunca abre em aberto

  const url = new URL(req.url);
  const doQuery = url.searchParams.get("secret");
  const doHeader = req.headers.get("x-webhook-secret");
  return doQuery === segredo || doHeader === segredo;
}

export async function POST(req: Request) {
  if (!validarSegredo(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const evento = normalizarEvento(payload);
  if (!evento) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const supabase = createAdminClient();

  if (evento.tipo === "qrcode") {
    const { error } = await supabase
      .from("whatsapp_sessoes")
      .update({ status: "aguardando_leitura", qr_code_base64: evento.qrCodeBase64, ultima_atualizacao: new Date().toISOString() })
      .eq("singleton", true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (evento.tipo === "conexao") {
    const atualizacao: Record<string, unknown> = {
      status: evento.status,
      ultima_atualizacao: new Date().toISOString(),
    };
    if (evento.status === "conectado") {
      atualizacao.numero_conectado = evento.numero ?? null;
      atualizacao.qr_code_base64 = null;
      atualizacao.conectado_em = new Date().toISOString();
    } else {
      atualizacao.numero_conectado = null;
      atualizacao.conectado_em = null;
    }
    if (evento.bateriaPercentual != null) atualizacao.bateria_percentual = evento.bateriaPercentual;

    const { error } = await supabase.from("whatsapp_sessoes").update(atualizacao).eq("singleton", true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (evento.tipo === "mensagem") {
    // Upsert do contato — cria na primeira mensagem desse número, ou só
    // atualiza o nome (pushName pode mudar) se já existir.
    const { data: contato, error: erroContato } = await supabase
      .from("whatsapp_contatos")
      .upsert({ telefone: evento.telefone, nome: evento.nomeContato ?? undefined }, { onConflict: "telefone" })
      .select("id")
      .single();
    if (erroContato || !contato) {
      return NextResponse.json({ error: erroContato?.message ?? "Falha ao registrar contato." }, { status: 500 });
    }

    // Idempotência: se essa mensagem (pelo id do provedor) já foi salva —
    // provedores costumam reentregar o mesmo evento mais de uma vez —, não duplica.
    if (evento.externalMessageId) {
      const { data: existente } = await supabase
        .from("whatsapp_mensagens")
        .select("id")
        .eq("external_message_id", evento.externalMessageId)
        .maybeSingle();
      if (existente) return NextResponse.json({ ok: true, duplicado: true });
    }

    const { error: erroMensagem } = await supabase.from("whatsapp_mensagens").insert({
      contato_id: contato.id,
      direcao: "recebida",
      tipo: evento.tipoMidia ?? "texto",
      conteudo: evento.conteudo ?? null,
      midia_url: evento.midiaUrl ?? null,
      external_message_id: evento.externalMessageId ?? null,
    });
    if (erroMensagem) return NextResponse.json({ error: erroMensagem.message }, { status: 500 });

    await supabase
      .from("whatsapp_contatos")
      .update({
        ultima_mensagem_preview: evento.conteudo?.slice(0, 120) || "Mensagem recebida",
        ultima_mensagem_em: new Date().toISOString(),
      })
      .eq("id", contato.id);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignorado: true });
}

// ----------------------------------------------------------------------------
// Normalização do payload — TODO: ajustar aqui pro formato exato do
// provedor escolhido. Como está, assume o formato da Evolution API.
// ----------------------------------------------------------------------------

type EventoNormalizado =
  | { tipo: "qrcode"; qrCodeBase64: string }
  | { tipo: "conexao"; status: "conectado" | "desconectado"; numero?: string; bateriaPercentual?: number }
  | {
      tipo: "mensagem";
      telefone: string;
      nomeContato?: string;
      conteudo?: string;
      tipoMidia?: "imagem" | "audio" | "video" | "documento" | "outro";
      midiaUrl?: string;
      externalMessageId?: string;
    };

function normalizarEvento(payload: unknown): EventoNormalizado | null {
  if (typeof payload !== "object" || payload === null) return null;
  const body = payload as Record<string, unknown>;
  const event = typeof body.event === "string" ? body.event : null;
  const data = (body.data ?? {}) as Record<string, unknown>;

  // Evolution API: evento de QR Code atualizado.
  if (event === "qrcode.updated" && typeof data.qrcode === "string") {
    return { tipo: "qrcode", qrCodeBase64: data.qrcode };
  }

  // Evolution API: evento de status de conexão (Baileys manda `state: "open"` quando conecta).
  if (event === "connection.update") {
    const conectado = data.state === "open";
    return {
      tipo: "conexao",
      status: conectado ? "conectado" : "desconectado",
      numero: typeof data.number === "string" ? data.number : undefined,
      bateriaPercentual: typeof data.battery === "number" ? data.battery : undefined,
    };
  }

  // Evolution API: nova mensagem recebida (formato Baileys por baixo).
  if (event === "messages.upsert") {
    const key = (data.key ?? {}) as Record<string, unknown>;
    const message = (data.message ?? {}) as Record<string, unknown>;

    // Mensagens com `fromMe: true` são as que o PRÓPRIO time mandou — essas
    // já são gravadas em `enviarMensagem()` no momento do envio, então
    // ignoramos aqui pra não duplicar.
    if (key.fromMe === true) return null;

    const remoteJid = typeof key.remoteJid === "string" ? key.remoteJid : null;
    if (!remoteJid) return null;
    const telefone = remoteJid.replace(/@s\.whatsapp\.net$/, "").replace(/\D/g, "");
    if (!telefone) return null;

    const texto = typeof message.conversation === "string" ? message.conversation : undefined;

    return {
      tipo: "mensagem",
      telefone,
      nomeContato: typeof data.pushName === "string" ? data.pushName : undefined,
      conteudo: texto,
      externalMessageId: typeof key.id === "string" ? key.id : undefined,
      // TODO: mapear tipoMidia/midiaUrl quando `message` trouxer imageMessage/
      // audioMessage/videoMessage/documentMessage em vez de `conversation`.
    };
  }

  return null;
}
