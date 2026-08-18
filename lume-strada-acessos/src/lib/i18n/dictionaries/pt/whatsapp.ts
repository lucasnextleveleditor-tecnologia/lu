/**
 * Módulo WhatsApp (`/admin/whatsapp`) — sub-nav (Inbox / Conexão), workspace
 * de conversas (lista + chat) e a tela de conexão do número (QR Code,
 * status, bateria). Rótulos de status da sessão (`STATUS_SESSAO_META`) e de
 * tipo de mídia ficam em `lib/utils/whatsapp.ts`, fora deste dicionário.
 */
export interface WhatsappDict {
  tituloPagina: string;
  descricaoPagina: string;
  abaInbox: string;
  abaConexao: string;
  erroCarregarSessao: string;
  sessaoNaoInicializadaPrefixo: string;
  sessaoNaoInicializadaSufixo: string;
  erroCarregarConversas: string;
  sessaoConectada: string;
  altQrCode: string;
  qrCodeInstrucao: string;
  baterianoAparelho: string;
  desconectando: string;
  desconectar: string;
  gerando: string;
  gerarQrCode: string;
  ultimaAtualizacao: string;
  nenhumaConversaSelecionada: string;
  falhaAoEnviar: string;
  falhaAoCriarLead: string;
  selecioneConversa: string;
  jaEhLead: string;
  adicionando: string;
  adicionarAoCrm: string;
  carregandoConversa: string;
  nenhumaMensagem: string;
  falhouEnvio: string;
  enviandoMensagem: string;
  anexoIndisponivel: string;
  digiteMensagem: string;
  buscarConversaPlaceholder: string;
  nenhumaConversaAinda: string;
  nenhumaConversaBusca: string;
  semMensagensAinda: string;
}

export const whatsapp: WhatsappDict = {
  tituloPagina: "WhatsApp",
  descricaoPagina: "Atendimento via WhatsApp e conexão do número da agência.",
  abaInbox: "Inbox",
  abaConexao: "Conexão",
  erroCarregarSessao: "Erro ao carregar a sessão:",
  sessaoNaoInicializadaPrefixo: "Sessão ainda não inicializada — rode",
  sessaoNaoInicializadaSufixo: "no seu projeto Supabase.",
  erroCarregarConversas: "Erro ao carregar as conversas:",
  sessaoConectada: "Sessão conectada",
  altQrCode: "QR Code do WhatsApp",
  qrCodeInstrucao: "Gere um QR Code pra conectar o número da empresa",
  baterianoAparelho: "{pct}% de bateria no aparelho",
  desconectando: "Desconectando...",
  desconectar: "Desconectar",
  gerando: "Gerando...",
  gerarQrCode: "Gerar QR Code",
  ultimaAtualizacao: "Última atualização:",
  nenhumaConversaSelecionada: "Nenhuma conversa selecionada.",
  falhaAoEnviar: "Falha ao enviar.",
  falhaAoCriarLead: "Falha ao criar o lead.",
  selecioneConversa: "Selecione uma conversa pra começar.",
  jaEhLead: "Já é um Lead",
  adicionando: "Adicionando...",
  adicionarAoCrm: "Adicionar ao CRM",
  carregandoConversa: "Carregando conversa...",
  nenhumaMensagem: "Nenhuma mensagem nesta conversa ainda.",
  falhouEnvio: "Falhou",
  enviandoMensagem: "Enviando...",
  anexoIndisponivel: "Envio de anexos depende do provedor de mensageria configurado — ver src/lib/whatsapp/provider.ts",
  digiteMensagem: "Digite uma mensagem...",
  buscarConversaPlaceholder: "Buscar conversa...",
  nenhumaConversaAinda: "Nenhuma conversa ainda.",
  nenhumaConversaBusca: "Nenhuma conversa corresponde à busca.",
  semMensagensAinda: "Sem mensagens ainda",
};
