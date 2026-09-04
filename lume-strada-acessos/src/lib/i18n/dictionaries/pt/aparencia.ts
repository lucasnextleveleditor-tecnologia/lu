/**
 * Módulo "Aparência" (`/admin/aparencia`) — página de branding/white-label:
 * formulário (`AparenciaForm.tsx`), upload de imagens (`UploadField.tsx`),
 * preview em miniatura da tela de login (`LoginPreview.tsx`) e o banner de
 * destaque reaproveitado em Login/Admin/Portal (`AnnouncementBanner.tsx`).
 * Conteúdo digitado pelo admin (título/descrição do banner, título/subtítulo
 * do login) NÃO mora aqui — só a "moldura" fixa da UI ao redor dele.
 */
export interface AparenciaDict {
  tituloPagina: string;
  subtituloPagina: string;

  nomeAppCardTitulo: string;
  nomeAppCardDescricao: string;
  nomeAppLabel: string;
  nomeAppPlaceholder: string;

  logoCardTitulo: string;
  logoCardDescricao: string;
  logoPrincipalLabel: string;
  faviconLabel: string;
  faviconHint: string;
  logoDarkLabel: string;
  logoDarkHint: string;
  logoLightLabel: string;
  logoLightHint: string;

  loginCardTitulo: string;
  loginCardDescricao: string;
  tituloLabel: string;
  tituloPlaceholder: string;
  subtituloLabel: string;
  subtituloPlaceholder: string;
  posicaoLabel: string;
  posicaoEsquerda: string;
  posicaoCentro: string;
  posicaoDireita: string;
  fundoLabel: string;
  fundoDesativeHint: string;
  fundoCustomLabel: string;
  fundoCustomHint: string;
  previewTituloFallback: string;

  bannerCardTitulo: string;
  bannerCardDescricao: string;
  bannerLoginTitulo: string;
  bannerLoginDescricao: string;
  bannerAdminTitulo: string;
  bannerAdminDescricao: string;
  bannerClienteTitulo: string;
  bannerClienteDescricao: string;
  bannerTituloPlaceholder: string;
  bannerDescricaoLabel: string;
  bannerDescricaoPlaceholder: string;
  bannerLinkLabelLabel: string;
  bannerLinkUrlLabel: string;
  bannerTomLabel: string;
  bannerTomHint: string;
  bannerPermitirFechar: string;
  bannerPermitirFecharTexto: string;
  bannerImgLabel: string;
  bannerImgHint: string;
  fecharBannerAriaLabel: string;

  sidebarCardTitulo: string;
  sidebarCardDescricao: string;
  sidebarCheckboxLabel: string;

  alteracoesSalvas: string;

  previewCardTitulo: string;
  previewCardDescricao: string;
  previewLoginLabel: string;
  previewBannerPlaceholder: string;
  previewBannerAvisoNenhumToggle: string;
  previewBotoesLabel: string;
  previewAcaoPrimaria: string;
  previewSecundaria: string;
  previewLinkDestaque: string;
  previewCardDestaque: string;

  enviarImagem: string;
  trocar: string;
  enviando: string;

  logoAlt: string;
}

export const aparencia: AparenciaDict = {
  tituloPagina: "Aparência & White-Label",
  subtituloPagina: "Logotipo, cores e a identidade visual da tela de login — aplicado pra todo mundo assim que você salvar.",

  nomeAppCardTitulo: "Nome do App",
  nomeAppCardDescricao: "Mostrado no topo do menu lateral do admin e no header do portal do cliente — comece como \"App Gestão\" e troque pelo nome da sua empresa quando quiser.",
  nomeAppLabel: "Nome exibido",
  nomeAppPlaceholder: "Ex: Minha Agência",

  logoCardTitulo: "Logotipo & Favicon",
  logoCardDescricao:
    "Usados no menu lateral do admin e no header do cliente (área de membros) — a tela de login sempre exibe a marca padrão do App Gestão, por design. O app hoje é fixo em Dark Mode — a versão “clara” fica pronta pra quando existir um modo claro.",
  logoPrincipalLabel: "Logo principal",
  faviconLabel: "Favicon",
  faviconHint: "Aba do navegador.",
  logoDarkLabel: "Logo — versão Dark Mode",
  logoDarkHint: "Versão clara/branca — usada agora (app é dark).",
  logoLightLabel: "Logo — versão Light Mode",
  logoLightHint: "Versão escura/preta — reservada p/ um modo claro futuro.",

  loginCardTitulo: "Tela de Login",
  loginCardDescricao: "Título, subtítulo, fundo e posição da caixa de login — veja o preview ao lado.",
  tituloLabel: "Título",
  tituloPlaceholder: "Ex: Área Exclusiva - App Gestão",
  subtituloLabel: "Subtítulo",
  subtituloPlaceholder: "Ex: Acesso a clientes e projetos",
  posicaoLabel: "Posição da caixa de login",
  posicaoEsquerda: "Esquerda",
  posicaoCentro: "Centralizada",
  posicaoDireita: "Direita",
  fundoLabel: "Fundo — padrão cinematográfico",
  fundoDesativeHint: "Desative removendo a imagem de fundo abaixo pra usar um padrão.",
  fundoCustomLabel: "Ou envie uma imagem de fundo customizada",
  fundoCustomHint: "Tem prioridade sobre o padrão cinematográfico escolhido acima.",
  previewTituloFallback: "Título do login",

  bannerCardTitulo: "Banner de Destaque",
  bannerCardDescricao:
    "Um aviso no topo da tela — pra anunciar novidade, manutenção programada, campanha etc. Mesmo conteúdo em qualquer lugar que você ligar abaixo; cada pessoa pode fechar (se você permitir) e ele só volta a aparecer pra ela se você editar o texto depois.",
  bannerLoginTitulo: "Exibir na Tela de Login",
  bannerLoginDescricao: "Antes de qualquer um entrar — visível pra quem ainda não é cliente/equipe.",
  bannerAdminTitulo: "Exibir na Área Admin/Funcionário",
  bannerAdminDescricao: "No topo de toda página de dentro de /admin — Dashboard e todos os módulos.",
  bannerClienteTitulo: "Exibir no Portal do Cliente",
  bannerClienteDescricao: "No topo do portal (área de membros) que os clientes acessam.",
  bannerTituloPlaceholder: "Ex: Manutenção programada no sábado",
  bannerDescricaoLabel: "Descrição (opcional)",
  bannerDescricaoPlaceholder: "Ex: O sistema fica indisponível das 2h às 4h pra atualização.",
  bannerLinkLabelLabel: "Texto do link (opcional)",
  bannerLinkUrlLabel: "URL do link (opcional)",
  bannerTomLabel: "Tom",
  bannerTomHint: "Só afeta o ícone — texto continua sempre legível, nunca colorido.",
  bannerPermitirFechar: "Permitir fechar o banner",
  bannerPermitirFecharTexto: "Permitir que a pessoa feche o banner (×)",
  bannerImgLabel: "Ou envie uma imagem de fundo pro banner (opcional)",
  bannerImgHint: "Quando enviada, o banner vira uma faixa com essa imagem de fundo em vez do cartão simples.",
  fecharBannerAriaLabel: "Fechar banner",

  sidebarCardTitulo: "Menu Lateral",
  sidebarCardDescricao:
    "Cada admin pode expandir/recolher a própria sidebar a qualquer momento (botão no rodapé do menu) — isto só define o estado inicial de uma sessão nova.",
  sidebarCheckboxLabel: "Iniciar com o menu lateral recolhido (mini sidebar) por padrão",

  alteracoesSalvas: "Alterações salvas.",

  previewCardTitulo: "Pré-visualização em Tempo Real",
  previewCardDescricao: "Reflete os textos ainda não salvos — os uploads já são reais.",
  previewLoginLabel: "Tela de Login",
  previewBannerPlaceholder: "Preencha o título do banner pra ver o preview.",
  previewBannerAvisoNenhumToggle: "Nenhum toggle ligado acima — o banner não vai aparecer em lugar nenhum ainda.",
  previewBotoesLabel: "Botões & Destaques (fixos em toda a plataforma)",
  previewAcaoPrimaria: "Ação Primária",
  previewSecundaria: "Secundária",
  previewLinkDestaque: "Um link de destaque",
  previewCardDestaque: "Card com borda de destaque",

  enviarImagem: "Enviar imagem",
  trocar: "Trocar",
  enviando: "Enviando...",

  logoAlt: "Logo",
};
