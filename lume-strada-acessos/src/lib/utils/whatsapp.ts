import type { MensagemWhatsappRow, StatusSessaoWhatsapp } from "@/lib/types/whatsapp";
import type { Tone } from "@/lib/utils/tone";

// Módulo intencionalmente não importa helpers de outros módulos (mesma
// decisão de sempre: cada módulo é entregue separado e não deve depender de
// arquivo interno de outro).

export const STATUS_SESSAO_META: Record<StatusSessaoWhatsapp, { label: string; tone: Tone }> = {
  desconectado: { label: "Desconectado", tone: "critical" },
  aguardando_leitura: { label: "Aguardando Leitura", tone: "warning" },
  conectado: { label: "Conectado", tone: "good" },
};

const LABEL_POR_TIPO_MIDIA: Record<string, string> = {
  imagem: "📷 Imagem",
  audio: "🎤 Áudio",
  video: "🎬 Vídeo",
  documento: "📎 Documento",
  outro: "Anexo",
};

/** Preview de uma mensagem pra lista de conversas — texto direto, ou um rótulo curto quando é mídia sem legenda. */
export function fmtPreviewMensagem(msg: Pick<MensagemWhatsappRow, "tipo" | "conteudo">): string {
  if (msg.conteudo && msg.conteudo.trim()) return msg.conteudo;
  return LABEL_POR_TIPO_MIDIA[msg.tipo] ?? "Mensagem";
}

/** "14:32" se for hoje, "12/08" caso contrário — mesmo comportamento de hora/data do WhatsApp Web de verdade. */
export function fmtHoraOuData(iso: string): string {
  const data = new Date(iso);
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();
  return mesmoDia
    ? data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** "5511999998888" -> "+55 11 99999-8888" — só formatação visual, não altera o valor salvo. */
export function fmtTelefoneExibicao(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return telefone;
  const ddi = digitos.slice(0, digitos.length - 11) || "55";
  const ddd = digitos.slice(-11, -9);
  const parte1 = digitos.slice(-9, -4);
  const parte2 = digitos.slice(-4);
  return `+${ddi} ${ddd} ${parte1}-${parte2}`;
}

/** Iniciais pro avatar placeholder (cinza sólido) quando o contato não tem foto de perfil. */
export function iniciaisContato(nome: string | null, telefone: string): string {
  const base = nome?.trim() || telefone;
  const partes = base.split(/\s+/).filter(Boolean);
  const primeira = partes[0];
  const segunda = partes[1];
  if (primeira && segunda) return (primeira.slice(0, 1) + segunda.slice(0, 1)).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}
