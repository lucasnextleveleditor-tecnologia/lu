export type StatusSessaoWhatsapp = "desconectado" | "aguardando_leitura" | "conectado";

/** Linha SINGLETON (sempre uma só — ver `supabase/whatsapp.sql`) com o status da conexão do número da agência. */
export interface SessaoWhatsappRow {
  id: string;
  status: StatusSessaoWhatsapp;
  numero_conectado: string | null;
  qr_code_base64: string | null;
  bateria_percentual: number | null;
  ultima_atualizacao: string | null;
  conectado_em: string | null;
  created_at: string;
  updated_at: string;
}

/** Um número que já trocou mensagem com a agência — uma "conversa" na lista do Inbox. */
export interface ContatoWhatsappRow {
  id: string;
  telefone: string;
  nome: string | null;
  foto_url: string | null;
  lead_id: string | null;
  cliente_id: string | null;
  ultima_mensagem_preview: string | null;
  ultima_mensagem_em: string | null;
  created_at: string;
  updated_at: string;
}

export type DirecaoMensagemWhatsapp = "recebida" | "enviada";
export type TipoMensagemWhatsapp = "texto" | "imagem" | "audio" | "video" | "documento" | "outro";
export type StatusEntregaMensagemWhatsapp = "enviando" | "enviado" | "entregue" | "lido" | "falhou";

export interface MensagemWhatsappRow {
  id: string;
  contato_id: string;
  direcao: DirecaoMensagemWhatsapp;
  tipo: TipoMensagemWhatsapp;
  conteudo: string | null;
  midia_url: string | null;
  status_entrega: StatusEntregaMensagemWhatsapp | null;
  external_message_id: string | null;
  enviado_por: string | null;
  created_at: string;
}
