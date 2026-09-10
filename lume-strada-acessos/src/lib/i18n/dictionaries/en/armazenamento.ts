import type { ArmazenamentoDict } from "../pt/armazenamento";

export const armazenamento: ArmazenamentoDict = {
  titulo: "Storage",
  subtitulo: "How much your account takes up, and where that space is going.",

  emUso: "In use",
  de: "of",
  avisoTresQuartos: "You're past three quarters of your space. Worth a look at the largest files below.",
  avisoQuaseCheio:
    "The account is nearly full. Once it fills up, new uploads stop — look at the tips below before that happens.",

  ondeEstaIndo: "Where it's going",
  ondeEstaIndoSub: "Each line takes you to the screen where those files live.",
  nenhumArquivo: "No files stored yet.",
  arquivoUm: "1 file",
  arquivoMuitos: "{n} files",

  maioresTitulo: "The largest files",
  maioresSub:
    "This is where space is won. Deleting a hundred 20 KB files changes nothing; deleting three of these does.",
  colArquivo: "File",
  colArea: "Area",
  colEnviado: "Uploaded",
  colTamanho: "Size",

  comoGanharTitulo: "How to free up space",
  comoGanharSub: "In order, from what pays off most to what pays off least.",
  dicaVideo: {
    titulo: "Video, always by link",
    texto:
      "It's the heaviest thing by far. Upload it to YouTube as “unlisted” (free, unlimited, plays smoothly) or to Drive, and paste the link instead of uploading the file. The video shows up inside the system just the same, and takes up nothing.",
    onde: "Portfolio, ad creatives and production deliveries already accept links.",
  },
  dicaComprimir: {
    titulo: "Compress before uploading",
    texto:
      "A scanned PDF usually drops to a fifth of its size with no loss of readability, and a 4000px photo becomes 1600px without anyone noticing on screen. It matters most for finance receipts, which come in volume.",
    onde: "Tools → Compress File does it right here, with nothing to install.",
  },
  dicaApagar: {
    titulo: "Delete old delivery versions",
    texto:
      "Every revision sent to the client becomes a new file, and v1 is rarely opened once v4 has been approved. It's the cleanup that pays off most without losing anything of value.",
    onde: "Production → the task → Deliveries.",
  },
  dicaDrive: {
    titulo: "Heavy reference material belongs on Drive",
    texto:
      "Image-heavy briefs, reference folders, raw footage: none of that needs to live here. Keep it on Drive and bring the link.",
    onde: "Applies to anything you only consult, not to anything that needs signing.",
  },
  naoDaParaTirarLabel: "What can't be moved out of here:",
  naoDaParaTirarTexto:
    "PDFs sent for signature. The signature is stamped inside the file and the system keeps both the original and the signed copy — that pair is what holds up as proof if anyone disputes it. Those stay.",

  areas: {
    assinaturas: {
      rotulo: "Documents for signature",
      explicacao:
        "PDFs sent out to be signed and the signed copies. These can't be swapped for a link: the signature is stamped into the file.",
    },
    producao: {
      rotulo: "Production deliveries",
      explicacao: "Versions sent to the client. This is what grows fastest — every revision is a new file.",
    },
    financeiro: {
      rotulo: "Finance attachments",
      explicacao: "Receipts and invoices attached to entries.",
    },
    "orcamentos-midia": {
      rotulo: "Portfolio and proposals",
      explicacao: "Images and videos that appear in your proposals.",
    },
    infoprodutos: {
      rotulo: "Ad creatives",
      explicacao: "Screenshots and videos of the creatives you've launched.",
    },
    mapas: {
      rotulo: "Mind map images",
      explicacao: "Images pasted inside the bubbles.",
    },
    avatares: {
      rotulo: "Profile photos",
      explicacao: "One per person on the team. Takes up almost nothing.",
    },
    branding: {
      rotulo: "Brand and appearance",
      explicacao: "Logo, login background and banner.",
    },
  },

  backup: {
    titulo: "Free up space",
    descricao:
      "Download every file in the account at once, already sorted into folders by area. Keep it on your Drive and, when space runs short again, just repeat: folder and file names are always the same, so the new copy lands on top of the old one without duplicating anything.",
    comoFicaTitulo: "How the ZIP is organised",
    comoFica:
      "One folder per area, with the files inside under exactly the names they have here. At the top there's a README.txt saying what each folder is and when the copy was made.",
    escolhaAreas: "What to include",
    botao: "Download everything ({tamanho})",
    botaoVazio: "Pick at least one area",
    cancelar: "Cancel",
    fechar: "Close",

    etapaListando: "Building the file list…",
    etapaBaixando: "Downloading {n} of {total} — {tamanho}",
    etapaFinalizando: "Closing the archive…",
    concluido: "Done: {tamanho} saved to your computer.",
    cancelado: "Download cancelled.",

    erroGenerico: "I couldn't put the backup together.",
    nenhumArquivo: "There are no files to download in this account.",
    avisoTruncado:
      "This account has too many files for a single backup. Download one area at a time so nothing gets left behind.",
    avisoSemStreaming:
      "In this browser the backup is assembled in memory before saving, and a large archive can freeze the tab. Chrome and Edge write it straight to disk. If you'd rather stay here, download one area at a time.",
    avisoNaoFeche: "Don't close this tab until the download finishes.",
    nomeDoZip: "files-{data}",
    leiaMeNome: "README.txt",
    leiaMeCorpo:
      "Copy of the system's files — {data}\n\nEach folder below is an area of the system, and the files come with the same names they have in there.\n\n{pastas}\n\nTo keep this on Drive: unzip it and drag the folders into the same folder you always use. Next time you download, the names will be the same and the new copy simply updates the old one, without creating duplicates.\n\nThe signature PDFs are here as a safety copy. They also stay in the system: that's where the proof lives, with the date, the IP and the record of who signed.\n",
  },
};
