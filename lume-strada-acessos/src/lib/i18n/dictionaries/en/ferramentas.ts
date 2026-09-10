import type { FerramentasDict } from "../pt/ferramentas";

export const ferramentas: FerramentasDict = {
  tituloPagina: "Tools",
  subtituloPagina:
    "The things you open to get one job done and then close — kept apart from the modules you keep an eye on.",
  voltar: "Tools",

  ordemExternaTitulo: "Call Sheet",
  ordemExternaDescricao:
    "The sheet everyone gets the night before: where it is, what time, who will be there and what gets shot.",
  ordensAtivas: { um: "1 active call sheet", muitos: "{n} active call sheets", nenhum: "no active call sheets" },

  mapaMentalTitulo: "Mind Map",
  mapaMentalDescricao:
    "Think together, live: ideas, script and project structure, with the whole team editing the same map.",
  mapasCriados: { um: "1 map", muitos: "{n} maps", nenhum: "no maps yet" },

  calculadoraTitulo: "Quote Calculator",
  calculadoraDescricao:
    "Try out cost, tax and margin before you send a price — the same engine that runs behind your proposals.",
  calculadoraMeta: "Free simulation, nothing is saved",

  criadorContratosTitulo: "Contract Builder",
  criadorContratosDescricao:
    "Build the contract clause by clause from the templates for your trade, with a paged preview before you send it.",
  contratosAguardando: {
    um: "1 contract awaiting signature",
    muitos: "{n} contracts awaiting signature",
    nenhum: "no contracts awaiting signature",
  },

  assinaturaTitulo: "Contract Signing",
  assinaturaDescricao:
    "Upload a finished PDF, mark where each person signs and send it as a link — with IP, date and hash on record.",
  documentosAguardando: {
    um: "1 document awaiting",
    muitos: "{n} documents awaiting",
    nenhum: "no documents awaiting",
  },

  comprimirTitulo: "Compress File",
  comprimirDescricao:
    "Video, PDF or image too big to send? Pick the final size and the conversion happens right here, in your browser.",
  comprimirMeta: "Uses none of your storage",

  linkWhatsappTitulo: "WhatsApp Link Generator",
  linkWhatsappDescricao:
    "A link that opens the chat with the message already typed. Put it in your bio, your site, an ad — whoever clicks just hits send.",
  linkWhatsappMeta: "Ready in ten seconds",

  comprimir: {
    subtitulo:
      "Pick the file and the size it needs to be. The conversion runs in your own browser — nothing is sent to the internet and nothing takes up your account's storage.",
    arrasteAqui: "Drag a file here, or",
    escolherArquivo: "Choose file",
    limitesAceitos: "Video up to 500 MB · PDF up to 150 MB · Image up to 60 MB",
    trocarArquivo: "Change file",
    tipoDesconhecido: "I don't know how to compress this kind of file. For now the tool handles video, PDF and images.",
    acimaDoLimite:
      "This file is {tamanho} and the limit is {limite}. Past that the work happens in the browser's memory and the tab freezes halfway through.",
    avisoArquivoPesado:
      "Large file: the conversion can take several minutes and the tab has to stay open the whole time. For video, publishing by link (YouTube, Drive) is usually better than compressing.",
    rotuloVideo: "Video",
    rotuloPdf: "PDF",
    rotuloImagem: "Image",
    rotuloDesconhecido: "Unknown",

    tamanhoFinal: "Final size",
    outroTamanho: "other",
    unidadeMb: "MB",

    comoReduzir: "How to shrink it",
    preservarTitulo: "Keep the document's text",
    preservarDescricao:
      "Shrinks only the images inside the PDF. You can still search and copy the text — the right choice for contracts, proposals and invoices.",
    rasterizarTitulo: "Flatten the pages",
    rasterizarDescricao:
      "Every page becomes a photo. Shrinks far more and works on any PDF, but the document loses searchable text — use it on scans.",

    botaoComprimir: "Compress",
    comprimindo: "Compressing…",
    naoSaiDoComputador: "The file never leaves your computer — the conversion happens here in the browser.",
    naoFecheAba: "Don't close this tab until the bar finishes.",
    baixar: "Download",

    quandoValeTitulo: "When it's worth it",
    dicaVideoLead: "Video",
    dicaVideo:
      "compressing is for sending by e-mail or WhatsApp. To deliver to a client inside the system, publishing on YouTube or Drive and pasting the link is still better: no quality lost and no storage used.",
    dicaPdfEscaneadoLead: "Scanned PDF",
    dicaPdfEscaneado:
      "this is where you gain the most. A scanned 50 MB contract usually comes out at 5 to 10 MB with no harm to reading it.",
    dicaPdfTextoLead: "Computer-generated PDF",
    dicaPdfTexto:
      "proposals, contracts and reports made here in the system are already small. Compressing gains little and can cost you search inside the document.",
    dicaImagemLead: "Image",
    dicaImagem: "a 10 MB camera photo or screenshot becomes less than 1 MB with no visible difference on screen.",

    motor: {
      sufixoArquivo: "-smaller",

      erroCanvas: "This browser couldn't open the drawing area.",
      erroGerarImagem: "I couldn't produce the compressed image.",

      etapaAbrindoImagem: "Opening the image…",
      etapaTestandoQualidade: "Finding the best balance between size and quality…",
      erroImagemNaoAbre:
        "I couldn't open this image in this browser. Formats like the iPhone's HEIC only open in Safari — save it as JPG or PNG and try again.",
      erroImagemGenerico: "I couldn't compress this image.",
      avisoMenorPossivel:
        "This is the smallest it can go without destroying the image — it came out above the size you asked for.",
      avisoVirouJpg: "The image became a JPG: if it had a transparent background, that background is now white.",
      avisoJaOtimizado: "The original file was already well optimised — compressing it again gained nothing.",

      etapaProcurandoImagens: "Looking for the images inside the PDF…",
      etapaRecomprimindoImagem: "Recompressing image {n} of {total}…",
      etapaRemontandoPdf: "Rebuilding the PDF…",
      etapaAbrindoDocumento: "Opening the document…",
      etapaCalculandoQualidade: "Working out the quality that fits the target…",
      etapaConvertendoPagina: "Converting page {n} of {total}…",
      etapaMontandoArquivo: "Assembling the final file…",
      erroConverterPagina: "I couldn't turn the page into an image.",
      avisoPdfSoTexto:
        "This PDF is almost all text — there's no heavy image to shrink, so it can't be reduced without turning the text into a picture. If you can live without searching inside the document, switch to “Flatten the pages”.",
      avisoAlvoImpossivelPdf:
        "That target is impossible while keeping the text: the document's structure alone takes {kb} KB. Pick a larger target or use “Flatten the pages”.",
      avisoImagensJaMinimas: "The images in this PDF were already as small as they get.",
      avisoNaoChegouMantendoTexto:
        "I couldn't reach the target while keeping the document's text. If you can give up searching inside the PDF, try “Flatten the pages”.",
      avisoDevolviMenor: "The original file was already optimised — I gave you back the smaller of the two.",
      avisoTextoVirouImagem: "The text became an image: the PDF can no longer be searched or copied.",
      avisoAcimaDoAlvo: "Even at the lowest usable quality the file came out above the target.",
      avisoRasterizarPiora:
        "Flattening would make this PDF BIGGER than it already is — a sign that it's made of text, which takes far less space than photos. I gave the original back untouched.",

      etapaBaixandoConversor: "Downloading the video converter (first time only)…",
      etapaPreparandoArquivo: "Preparing the file…",
      etapaConvertendoVideo: "Converting the video…",
      etapaAjustando: "Adjusting to fit the size you asked for…",
      etapaFinalizando: "Finishing up…",
      erroBaixarConversor: "I couldn't download the video converter. Check your connection and try again.{detalhe}",
      erroDuracao: "I couldn't read this video's duration.",
      erroFormatoVideo: "This video format doesn't open in this browser. Convert it to MP4 or MOV before compressing.",
      erroAlvoImpossivelVideo:
        "{mb} MB for {min} min of video is far too little — it would come out unrecognisable. Pick a larger target.",
      erroConversor: "The converter couldn't process this video. It may be corrupted or in an unusual format.",
      erroRespostaConversor: "Unexpected response from the video converter.",
      avisoVideoAcimaDoAlvo: "It came out slightly above the target: that's the least this video takes without turning to mush.",
      avisoResolucaoCaiu:
        "Resolution dropped to {altura}p — at the size you asked for, keeping the original would have left the picture blocky.",
      avisoVideoJaComprimido: "The original video was already well compressed; recompressing gained no space.",
    },
  },

  linkWhatsapp: {
    subtitulo:
      "Pick the number, write the message the person will send, and take the link. Whoever clicks lands in the chat with the text already typed — all that's left is hitting send.",
    paisLabel: "Country",
    buscarPais: "Search country, code or dialing code",
    nenhumPais: "No country with that name or code.",
    numeroLabel: "Number with area code",
    numeroPlaceholder: "11 99999-9999",
    mensagemLabel: "Message that comes pre-typed",
    mensagemPlaceholder: "I came from your website",
    mensagemDica: "Optional. With no message, the link just opens an empty chat.",
    sugestoesLabel: "Examples",
    sugestao1: "I came from your website",
    sugestao2: "Hi! I'd like a quote.",
    sugestao3: "I saw your work on Instagram and wanted to talk.",

    gerar: "Generate link",
    seuLink: "Your link",
    copiar: "Copy",
    copiado: "Copied!",
    abrir: "Test it",
    baixarQr: "Download QR code",
    qrLegenda: "Point a camera at it and the chat opens. Works on a card, a flyer, the end of a video.",
    limpar: "Clear",

    avisoDdiRepetido: "That number already had the country code in it. I removed the duplicate so the link doesn't come out wrong.",
    avisoZeroRemovido: "I dropped the leading zero from the area code — it's for domestic long distance and doesn't exist in an international number.",
    avisoNonoDigito:
      "This number has 8 digits after the area code. If it's a mobile, the ninth digit (a leading 9) is missing; if it's a landline, it's fine as is.",
    avisoCurto: "That number looks too short. Check that the area code is there.",
    avisoLongo: "That number went past 15 digits, the worldwide maximum. Check you didn't repeat the country code.",
    numeroInvalido: "Type the number with its area code to generate the link.",

    comoUsarTitulo: "Where to paste it",
    comoUsar1: "In your Instagram and TikTok bio — the contact button that doesn't depend on the algorithm.",
    comoUsar2: "On your site's “Contact us” button, instead of a form nobody answers.",
    comoUsar3: "On a printed QR code: business card, PDF quote, sticker on the camera, end of a video.",
  },
};
