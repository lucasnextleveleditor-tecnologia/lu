import "server-only";

/**
 * Abstração do provedor de mensageria externo. Provedor escolhido: Evolution
 * API (self-hosted, open source, wrapper REST em cima do Baileys/WhatsApp
 * Web) — `EvolutionApiProvider` abaixo é a implementação real.
 *
 * MULTI-TENANT: a Evolution API roda UM servidor só, mas suporta várias
 * "instâncias" nomeadas dentro dele — cada empresa deste sistema tem a
 * própria instância (`empresa-<company_id>`), criada automaticamente na
 * primeira vez que alguém daquela empresa clica em "Gerar QR Code". Não
 * precisa self-host um servidor por empresa: um único `WHATSAPP_PROVIDER_URL`
 * atende todo mundo, isolado por instância.
 *
 * Pra ligar de verdade:
 * 1. Suba uma instância da Evolution API (imagem Docker oficial —
 *    https://doc.evolution-api.com — é o jeito mais simples de self-host;
 *    dá pra rodar num VPS pequeno, Railway, Render etc).
 * 2. Configure no `.env.local` (e nas envs da Vercel):
 *    - `WHATSAPP_PROVIDER_URL` — URL base do servidor, sem barra no final
 *      (ex: `https://evolution.suaagencia.com`).
 *    - `WHATSAPP_PROVIDER_API_KEY` — a `AUTHENTICATION_API_KEY` configurada
 *      no servidor Evolution (chave global, autentica todas as instâncias).
 *    - `WHATSAPP_WEBHOOK_SECRET` — qualquer string secreta seu; usada pra
 *      validar `src/app/api/whatsapp/webhook/route.ts`.
 *    - `NEXT_PUBLIC_SITE_URL` — já deve estar configurada; é usada aqui pra
 *      montar a URL de webhook registrada automaticamente em cada instância.
 * 3. Pronto — ao clicar "Gerar QR Code" pela primeira vez, a instância da
 *    empresa é criada no servidor Evolution com o webhook já apontando pra
 *    `NEXT_PUBLIC_SITE_URL/api/whatsapp/webhook?company_id=...&secret=...`,
 *    escutando `QRCODE_UPDATED`, `CONNECTION_UPDATE` e `MESSAGES_UPSERT`
 *    (os três eventos que `normalizarEvento()` no webhook já sabe ler).
 *
 * Se a versão do servidor Evolution não aceitar o campo `webhook` embutido
 * em `POST /instance/create` (mudou entre versões), configure manualmente
 * no painel do Evolution: Webhook -> URL = a mesma acima, eventos = os
 * três listados. O resto (QR Code, envio de mensagem, desconexão) continua
 * funcionando normalmente por essa classe independente do webhook.
 */

export interface QrCodeResult {
  qrCodeBase64: string; // data URL pronta pra <img src="...">, ex: "data:image/png;base64,..."
}

export interface EnvioResult {
  externalMessageId: string;
}

export interface WhatsAppProvider {
  /** Inicia (ou reinicia) o pareamento e retorna o QR Code atual pra leitura no app do celular. */
  gerarQrCode(): Promise<QrCodeResult>;
  /** Encerra a sessão ativa — o número precisa escanear um novo QR Code pra reconectar. */
  desconectar(): Promise<void>;
  /** Envia uma mensagem de texto pro número informado (E.164 sem "+", ex: "5511999998888"). */
  enviarMensagemTexto(telefone: string, conteudo: string): Promise<EnvioResult>;
}

/**
 * Implementação padrão — usada enquanto `WHATSAPP_PROVIDER_URL`/
 * `WHATSAPP_PROVIDER_API_KEY` não estão configuradas. Toda chamada falha com
 * uma mensagem clara em vez de fingir sucesso (nunca inventamos um QR Code
 * ou um envio que não aconteceu).
 */
class ProviderNaoConfigurado implements WhatsAppProvider {
  private erro(): Error {
    return new Error(
      "Nenhum provedor de mensageria configurado ainda. Defina WHATSAPP_PROVIDER_URL e WHATSAPP_PROVIDER_API_KEY (do seu servidor Evolution API) nas variáveis de ambiente."
    );
  }

  async gerarQrCode(): Promise<QrCodeResult> {
    throw this.erro();
  }

  async desconectar(): Promise<void> {
    throw this.erro();
  }

  async enviarMensagemTexto(): Promise<EnvioResult> {
    throw this.erro();
  }
}

/** Timeout de rede pras chamadas à Evolution API — evita ficar pendurado pra sempre se o servidor estiver fora do ar. */
const TIMEOUT_MS = 20_000;

class EvolutionApiProvider implements WhatsAppProvider {
  private readonly instanceName: string;

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly companyId: string
  ) {
    // Nome de instância isolado por empresa — ver nota multi-tenant no topo do arquivo.
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
        // Webhook embutido na criação — ver nota no topo do arquivo sobre
        // versões da Evolution API que não aceitam este campo aqui.
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

  async gerarQrCode(): Promise<QrCodeResult> {
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
    return { qrCodeBase64: base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}` };
  }

  async desconectar(): Promise<void> {
    const resposta = await fetch(this.url(`/instance/logout/${encodeURIComponent(this.instanceName)}`), {
      method: "DELETE",
      headers: this.headers(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 404 aqui só significa "já estava desconectado/sem instância" — não é falha do ponto de vista de quem clicou em Desconectar.
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

/** `companyId` da empresa de quem está logado — necessário pra isolar a instância Evolution certa (ver nota multi-tenant no topo do arquivo). */
export function getWhatsAppProvider(companyId: string): WhatsAppProvider {
  const baseUrl = process.env.WHATSAPP_PROVIDER_URL;
  const apiKey = process.env.WHATSAPP_PROVIDER_API_KEY;
  if (baseUrl && apiKey) return new EvolutionApiProvider(baseUrl, apiKey, companyId);
  return new ProviderNaoConfigurado();
}
