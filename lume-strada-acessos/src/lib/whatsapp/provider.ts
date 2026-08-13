import "server-only";

/**
 * Abstração do provedor de mensageria externo (Evolution API, Baileys ou
 * Z-API — o time escolhe qual usar). Este projeto NÃO inclui uma conexão
 * viva com o WhatsApp: aqui está o CONTRATO que a Tela de Conexão
 * (`ConexaoWhatsapp`) e as Server Actions (`src/app/admin/whatsapp/
 * actions.ts`) esperam, com uma implementação stub que já funciona hoje —
 * ela só devolve um erro amigável até alguém plugar um provedor de verdade.
 *
 * Pra ligar de verdade:
 * 1. Suba uma instância do provedor escolhido (ex: Evolution API — tem
 *    imagem Docker oficial, é o mais simples de self-host).
 * 2. Configure `WHATSAPP_PROVIDER_URL` e `WHATSAPP_PROVIDER_API_KEY` no
 *    `.env.local` (e nas envs da Vercel).
 * 3. Implemente uma classe abaixo (ex: `EvolutionApiProvider`) chamando a
 *    API REST do provedor:
 *      - Evolution API: `POST /instance/connect/{instance}` gera o QR Code,
 *        `POST /instance/logout/{instance}` desconecta, `POST /message/
 *        sendText/{instance}` envia mensagem de texto.
 *      - Baileys puro: não tem API REST própria — normalmente roda atrás
 *        de um wrapper (a própria Evolution API é um wrapper de Baileys).
 *      - Z-API: `POST /instances/{id}/token/{token}/qr-code`, `POST .../
 *        send-text`, etc — ver a documentação da conta.
 * 4. Troque `getWhatsAppProvider()` no fim deste arquivo pra retornar a
 *    implementação nova.
 *
 * O Webhook (`src/app/api/whatsapp/webhook/route.ts`) é o caminho inverso
 * (provedor -> nossa aplicação) e é independente deste arquivo — ele já
 * grava eventos recebidos direto no banco, sem passar por essa interface.
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
 * Implementação padrão — usada enquanto nenhum provedor real foi
 * configurado. Toda chamada falha com uma mensagem clara em vez de fingir
 * sucesso (nunca inventamos um QR Code ou um envio que não aconteceu).
 */
class ProviderNaoConfigurado implements WhatsAppProvider {
  private erro(): Error {
    return new Error(
      "Nenhum provedor de mensageria configurado ainda. Defina WHATSAPP_PROVIDER_URL e WHATSAPP_PROVIDER_API_KEY e implemente src/lib/whatsapp/provider.ts (ver o comentário no topo do arquivo)."
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

export function getWhatsAppProvider(): WhatsAppProvider {
  // TODO: quando o provedor for escolhido e configurado, trocar por uma
  // implementação real, ex:
  //   if (process.env.WHATSAPP_PROVIDER_URL) return new EvolutionApiProvider(...);
  return new ProviderNaoConfigurado();
}
