import type { AparenciaDict } from "../pt/aparencia";

export const aparencia: AparenciaDict = {
  tituloPagina: "Appearance & White-Label",
  subtituloPagina: "Logo, colors and the login screen's visual identity — applied to everyone as soon as you save.",

  nomeAppCardTitulo: "App Name",
  nomeAppCardDescricao: "Shown at the top of the admin sidebar and in the client portal header — starts as \"App Gestão\" and can be changed to your company's name whenever you like.",
  nomeAppLabel: "Displayed name",
  nomeAppPlaceholder: "E.g.: My Agency",

  logoCardTitulo: "Logo & Favicon",
  logoCardDescricao:
    "Used in the admin sidebar and the client (member area) header — the login screen always shows the default App Gestão brand, by design. The app is currently fixed in Dark Mode — the “light” version is ready for whenever a light mode exists.",
  logoPrincipalLabel: "Main logo",
  faviconLabel: "Favicon",
  faviconHint: "Browser tab.",
  logoDarkLabel: "Logo — Dark Mode version",
  logoDarkHint: "Light/white version — used now (the app is dark).",
  logoLightLabel: "Logo — Light Mode version",
  logoLightHint: "Dark/black version — reserved for a future light mode.",

  loginCardTitulo: "Login Screen",
  loginCardDescricao: "Title, subtitle, background and position of the login box — see the preview alongside.",
  tituloLabel: "Title",
  tituloPlaceholder: "E.g.: Exclusive Area - App Gestão",
  subtituloLabel: "Subtitle",
  subtituloPlaceholder: "E.g.: Access for clients and projects",
  posicaoLabel: "Login box position",
  posicaoEsquerda: "Left",
  posicaoCentro: "Centered",
  posicaoDireita: "Right",
  fundoLabel: "Background — cinematic preset",
  fundoDesativeHint: "Disable by removing the background image below to use a preset.",
  fundoCustomLabel: "Or upload a custom background image",
  fundoCustomHint: "Takes priority over the cinematic preset chosen above.",
  previewTituloFallback: "Login title",

  bannerCardTitulo: "Announcement Banner",
  bannerCardDescricao:
    "A notice at the top of the screen — to announce news, scheduled maintenance, a campaign, etc. Same content everywhere you enable it below; each person can dismiss it (if you allow it) and it only reappears for them if you edit the text afterward.",
  bannerLoginTitulo: "Show on Login Screen",
  bannerLoginDescricao: "Before anyone signs in — visible to people who aren't clients/team yet.",
  bannerAdminTitulo: "Show in Admin/Staff Area",
  bannerAdminDescricao: "At the top of every page inside /admin — Dashboard and all modules.",
  bannerClienteTitulo: "Show in Client Portal",
  bannerClienteDescricao: "At the top of the portal (member area) clients access.",
  bannerTituloPlaceholder: "E.g.: Scheduled maintenance on Saturday",
  bannerDescricaoLabel: "Description (optional)",
  bannerDescricaoPlaceholder: "E.g.: The system will be unavailable from 2am to 4am for an update.",
  bannerLinkLabelLabel: "Link text (optional)",
  bannerLinkUrlLabel: "Link URL (optional)",
  bannerTomLabel: "Tone",
  bannerTomHint: "Only affects the icon — text always stays legible, never colored.",
  bannerPermitirFechar: "Allow dismissing the banner",
  bannerPermitirFecharTexto: "Allow the person to close the banner (×)",
  bannerImgLabel: "Or upload a background image for the banner (optional)",
  bannerImgHint: "When uploaded, the banner becomes a strip with that background image instead of the plain card.",
  fecharBannerAriaLabel: "Close banner",

  sidebarCardTitulo: "Sidebar Menu",
  sidebarCardDescricao:
    "Every admin can expand/collapse their own sidebar at any time (button at the bottom of the menu) — this only sets the starting state for a new session.",
  sidebarCheckboxLabel: "Start with the sidebar menu collapsed (mini sidebar) by default",

  alteracoesSalvas: "Changes saved.",

  previewCardTitulo: "Live Preview",
  previewCardDescricao: "Reflects text that hasn't been saved yet — uploads are already real.",
  previewLoginLabel: "Login Screen",
  previewBannerPlaceholder: "Fill in the banner title to see the preview.",
  previewBannerAvisoNenhumToggle: "No toggle is enabled above — the banner won't appear anywhere yet.",
  previewBotoesLabel: "Buttons & Highlights (fixed across the whole platform)",
  previewAcaoPrimaria: "Primary Action",
  previewSecundaria: "Secondary",
  previewLinkDestaque: "A highlighted link",
  previewCardDestaque: "Card with highlighted border",

  enviarImagem: "Upload image",
  trocar: "Change",
  enviando: "Uploading...",

  logoAlt: "Logo",
};
