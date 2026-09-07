import "server-only";

/**
 * Abstração do provedor de mensageria externo. DOIS provedores suportados
 * — `getWhatsAppProvider()` no fim do arquivo escolhe qual usar com base
 * nas variáveis de ambiente configuradas (Cloud API tem prioridade se as
 * duas estiverem configuradas ao mesmo tempo, o que não deveria acontecer
 * na prática):
 *
 * 1. WHATSAPP CLOUD API (oficial da Meta) — RECOMENDADO. Não usa QR Code:
 *    o número é autorizado direto no painel da Meta (Meta for Developers /
 *    WhatsApp Business Platform), então "conectar" aqui só confirma que o
 *    token configurado é válido. Sem risco de bloqueio/banimento do
 *    número — é a via oficial. Tem custo por conversa iniciada pela
 *    empresa (fora da janela de 24h) e exige verificação da empresa na
 *    Meta Business Manager.
 *    Variáveis: `WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_CLOUD_API_PHONE_NUMBER_ID`,
 *    `WHATSAPP_CLOUD_API_VERIFY_TOKEN`. Webhook: `src/app/api/whatsapp/
 *    webhook-meta/route.ts` (cadastre a URL + verify token no painel da
 *    Meta: WhatsApp -> Configuration -> Webhook).
 *
 * 2. EVOLUTION API (self-hosted, não-oficial) — mantida como alternativa
 *    gratuita, mas a Meta vem bloqueando ativamente esse tipo de conexão
 *    desde jan/2026 (a mensagem "não é possível conectar novos
 *    dispositivos no momento" ao escanear o QR Code é exatamente esse
 *    bloqueio, não um bug daqui). Use por sua conta e risco.
 *    Variáveis: `WHATSAPP_PROVIDER_URL`, `WHATSAPP_PROVIDER_API_KEY`.
 *    Webhook: `src/app/api/whatsapp/webhook/route.ts`.
 *
 * MULTI-TENANT (limitação atual, de propósito): a Cloud API está
 * implementada hoje como CONFIGURAÇÃO ÚNICA por variável de ambiente (um
 * número só, o da agência dona deste deploy) — não uma instância por
 * empresa como a Evolution API. Pra virar multi-tenant de verdade
 * (cada empresa cliente com o próprio número Cloud API), o caminho é
 * guardar `cloud_api_token`/`cloud_api_phone_number_id` por linha em
 * `whatsapp_sessoes` em vez de env var — não implementado ainda porque
 * não é a necessidade de hoje.
 */

export type ConexaoResult =
  | { modo: "qrcode"; qrCodeBase64: string }
  | { modo: "conectado_direto"; numero: string | null };

export interface EnvioResult {
  externalMessageId: string;
}

export interface WhatsAppProvider {
  /** Inicia a conexão. Provedores QR Code (Evolution) retornam o QR pra leitura; provedores já autorizados (Cloud API) só confirmam e retornam o número. */
  iniciarConexao(): Promise<ConexaoResult>;
  /** Encerra a sessão ativa. */
  desconectar(): Promise<void>;
  /** Envia uma mensagem de texto pro número informado (E.164 sem "+", ex: "5511999998888"). */
  enviarMensagemTexto(telefone: string, conteudo: string): Promise<EnvioResult>;
}

/**
 * Implementação padrão — usada enquanto nenhum dos dois provedores está
 * configurado. Toda chamada falha com uma mensagem clara em vez de fingir
 * sucesso.
 */
class ProviderNaoConfigurado implements WhatsAppProvider {
  private erro(): Error {
    return new Error(
      "Nenhum provedor de mensageria configurado ainda. Configure a WhatsApp Cloud API (WHATSAPP_CLOUD_API_TOKEN + WHATSAPP_CLOUD_API_PHONE_NUMBER_ID) ou a Evolution API (WHATSAPP_PROVIDER_URL + WHATSAPP_PROVIDER_API_KEY) nas variáveis de ambiente."
    );
  }

  async iniciarConexao(): Promise<ConexaoResult> {
    throw this.erro();
  }

  async desconectar(): Promise<void> {
    throw this.erro();
  }

  async enviarMensagemTexto(): Promise<EnvioResult> {
    throw this.erro();
  }
}

/** Timeout de rede pras chamadas aos provedores — evita ficar pendurado pra sempre se o servidor estiver fora do ar. */
const TIMEOUT_MS = 20_000;

// ----------------------------------------------------------------------------
// WhatsApp Cloud API (oficial da Meta) — recomendado
// ----------------------------------------------------------------------------

class MetaCloudApiProvider implements WhatsAppProvider {
  private readonly graphVersion = "v21.0";

  constructor(
    private readonly token: string,
    private readonly phoneNumberId: string
  ) {}

  private headers(): HeadersInit {
    return { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" };
  }

  private url(path: string): string {
    return `https://graph.facebook.com/${this.graphVersion}/${this.phoneNumberId}${path}`;
  }

  async iniciarConexao(): Promise<ConexaoResult> {
    // Cloud API não usa QR Code — a autorização já foi feita no painel da
    // Meta. Aqui só CONFIRMAMOS que o token/Phone Number ID configurados
    // são válidos, lendo os dados públicos do próprio número.
    const resposta = await fetch(this.url("?fields=display_phone_number,verified_name"), {
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resposta.ok) {
      throw new Error(
        `WhatsApp Cloud API: token ou Phone Number ID inválidos (HTTP ${resposta.status}). Confira WHATSAPP_CLOUD_API_TOKEN/WHATSAPP_CLOUD_API_PHONE_NUMBER_ID.`
      );
    }
    const corpo = (await resposta.json()) as Record<string, unknown>;
    const numero = typeof corpo.display_phone_number === "string" ? corpo.display_phone_number : null;
    return { modo: "conectado_direto", numero };
  }

  async desconectar(): Promise<void> {
    // A Cloud API não tem "logout" via API igual uma sessão de WhatsApp
    // Web — o número fica autorizado até você revogar o acesso direto no
    // Meta Business Manager (ou apagar/trocar o token). Aqui não há
    // chamada externa a fazer; a Server Action que chama isso já limpa o
    // status no banco normalmente.
  }

  async enviarMensagemTexto(telefone: string, conteudo: string): Promise<EnvioResult> {
    const resposta = await fetch(this.url("/messages"), {
      method: "POST",
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: telefone,
        type: "text",
        text: { preview_url: false, body: conteudo },
      }),
    });
    if (!resposta.ok) {
      const corpoErro = await resposta.text();
      throw new Error(`WhatsApp Cloud API: falha ao enviar mensagem (HTTP ${resposta.status}). ${corpoErro.slice(0, 200)}`);
    }
    const corpo = (await resposta.json()) as Record<string, unknown>;
    const mensagens = corpo.messages as Array<Record<string, unknown>> | undefined;
    const externalMessageId = typeof mensagens?.[0]?.id === "string" ? (mensagens[0].id as string) : `meta-${Date.now()}`;
    return { externalMessageId };
  }
}

// ----------------------------------------------------------------------------
// Evolution API (self-hosted, não-oficial) — alternativa
// ----------------------------------------------------------------------------

class EvolutionApiProvider implements WhatsAppProvider {
  private readonly instanceName: string;

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly companyId: string
  ) {
    // Nome de instância isolado por empresa — a Evolution API roda UM
    // servidor só, mas suporta várias instâncias nomeadas dentro dele.
    this.instanceName = `empresa-${companyId}`;
  }

  private headers(): HeadersInit {
    return { "Content-Type": "application/json", apikey: this.apiKey };
  }

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, "")}${path}`;
  }

  private webhookUrl(): string {
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? "";
    return `${site}/api/whatsapp/webhook?company_id=${encodeURIComponent(this.companyId)}&secret=${encodeURIComponent(secret)}`;
  }

  /** Garante que a instância da empresa existe no servidor Evolution — cria (com webhook já configurado) se ainda não existir. */
  private async garantirInstanciaCriada(): Promise<void> {
    const estado = await fetch(this.url(`/instance/connectionState/${encodeURIComponent(this.instanceName)}`), {
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (estado.ok) return; // instância já existe (conectada ou não — tanto faz aqui)
    if (estado.status !== 404) {
      throw new Error(`Evolution API: falha ao consultar a instância (HTTP ${estado.status}). Confira WHATSAPP_PROVIDER_URL/WHATSAPP_PROVIDER_API_KEY.`);
    }

    const criar = await fetch(this.url("/instance/create"), {
      method: "POST",
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        instanceName: this.instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: {
          url: this.webhookUrl(),
          byEvents: false,
          base64: true,
          events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"],
        },
      }),
    });
    if (!criar.ok) {
      throw new Error(`Evolution API: falha ao criar a instância "${this.instanceName}" (HTTP ${criar.status}).`);
    }
  }

  async iniciarConexao(): Promise<ConexaoResult> {
    await this.garantirInstanciaCriada();

    const resposta = await fetch(this.url(`/instance/connect/${encodeURIComponent(this.instanceName)}`), {
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resposta.ok) {
      throw new Error(`Evolution API: falha ao gerar QR Code (HTTP ${resposta.status}).`);
    }

    const corpo = (await resposta.json()) as Record<string, unknown>;
    const qrcodeAninhado = corpo.qrcode as Record<string, unknown> | undefined;
    const base64 =
      typeof corpo.base64 === "string" ? corpo.base64 : typeof qrcodeAninhado?.base64 === "string" ? qrcodeAninhado.base64 : null;

    if (!base64) {
      throw new Error("Evolution API: resposta sem QR Code — o número já pode estar conectado (tente desconectar e gerar de novo).");
    }
    return { modo: "qrcode", qrCodeBase64: base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}` };
  }

  async desconectar(): Promise<void> {
    const resposta = await fetch(this.url(`/instance/logout/${encodeURIComponent(this.instanceName)}`), {
      method: "DELETE",
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resposta.ok && resposta.status !== 404) {
      throw new Error(`Evolution API: falha ao desconectar (HTTP ${resposta.status}).`);
    }
  }

  async enviarMensagemTexto(telefone: string, conteudo: string): Promise<EnvioResult> {
    const resposta = await fetch(this.url(`/message/sendText/${encodeURIComponent(this.instanceName)}`), {
      method: "POST",
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({ number: telefone, text: conteudo }),
    });
    if (!resposta.ok) {
      throw new Error(`Evolution API: falha ao enviar mensagem (HTTP ${resposta.status}).`);
    }

    const corpo = (await resposta.json()) as Record<string, unknown>;
    const key = corpo.key as Record<string, unknown> | undefined;
    const externalMessageId = typeof key?.id === "string" ? key.id : typeof corpo.id === "string" ? corpo.id : `evolution-${Date.now()}`;
    return { externalMessageId };
  }
}

/** `companyId` da empresa de quem está logado — só é usado pela Evolution API (isolamento por instância); a Cloud API ignora, ver nota multi-tenant no topo do arquivo. */
export function getWhatsAppProvider(companyId: string): WhatsAppProvider {
  const cloudToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const cloudPhoneId = process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID;
  if (cloudToken && cloudPhoneId) return new MetaCloudApiProvider(cloudToken, cloudPhoneId);

  const baseUrl = process.env.WHATSAPP_PROVIDER_URL;
  const apiKey = process.env.WHATSAPP_PROVIDER_API_KEY;
  if (baseUrl && apiKey) return new EvolutionApiProvider(baseUrl, apiKey, companyId);

  return new ProviderNaoConfigurado();
}
