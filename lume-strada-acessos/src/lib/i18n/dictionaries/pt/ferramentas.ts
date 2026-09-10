import type { TextosDoCompressor } from "@/lib/ferramentas/comprimir/nucleo";

/**
 * Vitrine de Ferramentas (`/admin/ferramentas`) e o Compressor de Arquivos.
 *
 * O import de `TextosDoCompressor` é SÓ DE TIPO — some na compilação. O
 * dicionário continua sendo dado puro, como exige a trava de serialização em
 * `pt/index.ts`; o que esse tipo faz é garantir que nenhuma frase que as
 * três estratégias de compressão mostram fique de fora da tradução. Se
 * alguém acrescentar uma etapa nova em `video.ts` e esquecer do texto, o
 * `tsc` para aqui, nos três idiomas.
 *
 * Contagens seguem o padrão `{ um, muitos, nenhum }` com `{n}` no lugar do
 * número, resolvido em quem renderiza — função nenhuma pode entrar num
 * arquivo de dicionário.
 */
export interface ContagemDict {
  um: string;
  muitos: string;
  nenhum: string;
}

export interface FerramentasDict {
  tituloPagina: string;
  subtituloPagina: string;
  voltar: string;

  ordemExternaTitulo: string;
  ordemExternaDescricao: string;
  ordensAtivas: ContagemDict;

  mapaMentalTitulo: string;
  mapaMentalDescricao: string;
  mapasCriados: ContagemDict;

  calculadoraTitulo: string;
  calculadoraDescricao: string;
  calculadoraMeta: string;

  criadorContratosTitulo: string;
  criadorContratosDescricao: string;
  contratosAguardando: ContagemDict;

  assinaturaTitulo: string;
  assinaturaDescricao: string;
  documentosAguardando: ContagemDict;

  comprimirTitulo: string;
  comprimirDescricao: string;
  comprimirMeta: string;

  comprimir: {
    subtitulo: string;
    arrasteAqui: string;
    escolherArquivo: string;
    limitesAceitos: string;
    trocarArquivo: string;
    tipoDesconhecido: string;
    /** `{tamanho}` = peso do arquivo, `{limite}` = teto do tipo. */
    acimaDoLimite: string;
    avisoArquivoPesado: string;
    rotuloVideo: string;
    rotuloPdf: string;
    rotuloImagem: string;
    rotuloDesconhecido: string;

    tamanhoFinal: string;
    outroTamanho: string;
    unidadeMb: string;

    comoReduzir: string;
    preservarTitulo: string;
    preservarDescricao: string;
    rasterizarTitulo: string;
    rasterizarDescricao: string;

    botaoComprimir: string;
    comprimindo: string;
    naoSaiDoComputador: string;
    naoFecheAba: string;
    baixar: string;

    quandoValeTitulo: string;
    dicaVideoLead: string;
    dicaVideo: string;
    dicaPdfEscaneadoLead: string;
    dicaPdfEscaneado: string;
    dicaPdfTextoLead: string;
    dicaPdfTexto: string;
    dicaImagemLead: string;
    dicaImagem: string;

    /** Tudo que as três estratégias de compressão podem mostrar. */
    motor: TextosDoCompressor;
  };
}

export const ferramentas: FerramentasDict = {
  tituloPagina: "Ferramentas",
  subtituloPagina:
    "O que você abre para fazer uma coisa e fechar em seguida — separado dos módulos que você acompanha.",
  voltar: "Ferramentas",

  ordemExternaTitulo: "Ordem de Externa",
  ordemExternaDescricao:
    "A folha que todo mundo recebe na véspera: onde é, a que horas, quem vai estar e o que vai ser gravado.",
  ordensAtivas: { um: "1 ordem ativa", muitos: "{n} ordens ativas", nenhum: "nenhuma ordem ativa" },

  mapaMentalTitulo: "Mapa Mental",
  mapaMentalDescricao:
    "Pensar em conjunto e ao vivo: ideias, roteiro e estrutura de projeto, com a equipe editando o mesmo mapa.",
  mapasCriados: { um: "1 mapa", muitos: "{n} mapas", nenhum: "nenhum mapa ainda" },

  calculadoraTitulo: "Calculadora de Orçamento",
  calculadoraDescricao:
    "Simule custo, imposto e margem antes de mandar o preço — o mesmo motor de cálculo usado nas propostas.",
  calculadoraMeta: "Simulação livre, nada é salvo",

  criadorContratosTitulo: "Criador de Contratos",
  criadorContratosDescricao:
    "Monte o contrato cláusula a cláusula a partir dos modelos da sua profissão, com prévia paginada antes de enviar.",
  contratosAguardando: {
    um: "1 contrato aguardando assinatura",
    muitos: "{n} contratos aguardando assinatura",
    nenhum: "nenhum contrato aguardando",
  },

  assinaturaTitulo: "Assinatura de Contratos",
  assinaturaDescricao:
    "Suba um PDF pronto, marque onde cada pessoa assina e mande por link — com registro de IP, data e hash.",
  documentosAguardando: {
    um: "1 documento aguardando",
    muitos: "{n} documentos aguardando",
    nenhum: "nenhum documento aguardando",
  },

  comprimirTitulo: "Comprimir Arquivo",
  comprimirDescricao:
    "Vídeo, PDF ou imagem grande demais para mandar? Escolha o tamanho final e a conversão acontece aqui mesmo, no seu navegador.",
  comprimirMeta: "Não gasta armazenamento da conta",

  comprimir: {
    subtitulo:
      "Escolha o arquivo e o tamanho que ele precisa ter. A conversão acontece no seu próprio navegador — nada é enviado para a internet e nada ocupa o armazenamento da sua conta.",
    arrasteAqui: "Arraste um arquivo aqui, ou",
    escolherArquivo: "Escolher arquivo",
    limitesAceitos: "Vídeo até 500 MB · PDF até 150 MB · Imagem até 60 MB",
    trocarArquivo: "Trocar de arquivo",
    tipoDesconhecido: "Não sei comprimir este tipo de arquivo. Por enquanto a ferramenta trata vídeo, PDF e imagem.",
    acimaDoLimite:
      "Este arquivo tem {tamanho} e o limite é {limite}. Acima disso a conta é feita na memória do navegador e a aba trava no meio do caminho.",
    avisoArquivoPesado:
      "Arquivo grande: a conversão pode levar vários minutos e a aba precisa ficar aberta o tempo todo. Para vídeo, publicar por link (YouTube, Drive) costuma ser melhor do que comprimir.",
    rotuloVideo: "Vídeo",
    rotuloPdf: "PDF",
    rotuloImagem: "Imagem",
    rotuloDesconhecido: "Desconhecido",

    tamanhoFinal: "Tamanho final",
    outroTamanho: "outro",
    unidadeMb: "MB",

    comoReduzir: "Como reduzir",
    preservarTitulo: "Manter o texto do documento",
    preservarDescricao:
      "Encolhe só as imagens de dentro do PDF. Continua dando pra buscar e copiar o texto — é o certo para contrato, proposta e nota fiscal.",
    rasterizarTitulo: "Rasterizar as páginas",
    rasterizarDescricao:
      "Cada página vira uma foto. Reduz muito mais e funciona em qualquer PDF, mas o documento deixa de ter texto buscável — use em escaneados.",

    botaoComprimir: "Comprimir",
    comprimindo: "Comprimindo…",
    naoSaiDoComputador: "O arquivo não sai do seu computador — a conversão acontece aqui no navegador.",
    naoFecheAba: "Não feche esta aba enquanto a barra não terminar.",
    baixar: "Baixar",

    quandoValeTitulo: "Quando vale a pena",
    dicaVideoLead: "Vídeo",
    dicaVideo:
      "comprimir serve para mandar por e-mail ou WhatsApp. Para entregar ao cliente dentro do sistema, publicar no YouTube ou no Drive e colar o link continua sendo melhor: não perde qualidade e não gasta armazenamento nenhum.",
    dicaPdfEscaneadoLead: "PDF escaneado",
    dicaPdfEscaneado:
      "é o caso onde mais se ganha. Um contrato digitalizado de 50 MB costuma sair com 5 a 10 MB sem atrapalhar a leitura.",
    dicaPdfTextoLead: "PDF gerado por computador",
    dicaPdfTexto:
      "proposta, contrato e relatório feitos aqui no sistema já são pequenos. Comprimir ganha pouco e pode custar a busca dentro do documento.",
    dicaImagemLead: "Imagem",
    dicaImagem: "foto de câmera ou print de 10 MB vira menos de 1 MB sem diferença visível na tela.",

    motor: {
      sufixoArquivo: "-menor",

      erroCanvas: "Este navegador não conseguiu abrir a área de desenho.",
      erroGerarImagem: "Não consegui gerar a imagem comprimida.",

      etapaAbrindoImagem: "Abrindo a imagem…",
      etapaTestandoQualidade: "Testando o melhor equilíbrio entre tamanho e qualidade…",
      erroImagemNaoAbre:
        "Não consegui abrir esta imagem neste navegador. Formatos como HEIC do iPhone só abrem no Safari — salve como JPG ou PNG e tente de novo.",
      erroImagemGenerico: "Não consegui comprimir esta imagem.",
      avisoMenorPossivel:
        "Este foi o menor tamanho possível sem destruir a imagem — ficou acima do alvo que você pediu.",
      avisoVirouJpg: "A imagem virou JPG: se ela tinha fundo transparente, agora ele está branco.",
      avisoJaOtimizado: "O arquivo original já estava bem otimizado — comprimir de novo não ganhou espaço.",

      etapaProcurandoImagens: "Procurando as imagens dentro do PDF…",
      etapaRecomprimindoImagem: "Recomprimindo imagem {n} de {total}…",
      etapaRemontandoPdf: "Remontando o PDF…",
      etapaAbrindoDocumento: "Abrindo o documento…",
      etapaCalculandoQualidade: "Calculando a qualidade que cabe no alvo…",
      etapaConvertendoPagina: "Convertendo página {n} de {total}…",
      etapaMontandoArquivo: "Montando o arquivo final…",
      erroConverterPagina: "Não consegui converter a página em imagem.",
      avisoPdfSoTexto:
        "Este PDF é quase todo texto — não há imagem pesada pra encolher, então não dá pra reduzir sem transformar o texto em foto. Se você aceitar perder a busca dentro do documento, troque para “Rasterizar as páginas”.",
      avisoAlvoImpossivelPdf:
        "Esse alvo é impossível mantendo o texto: só a estrutura do documento já ocupa {kb} KB. Escolha um alvo maior ou use “Rasterizar as páginas”.",
      avisoImagensJaMinimas: "As imagens deste PDF já estavam no menor tamanho possível.",
      avisoNaoChegouMantendoTexto:
        "Não deu pra chegar no alvo mantendo o texto do documento. Se puder abrir mão da busca dentro do PDF, tente “Rasterizar as páginas”.",
      avisoDevolviMenor: "O arquivo original já estava otimizado — devolvi o menor dos dois.",
      avisoTextoVirouImagem: "O texto virou imagem: o PDF não pode mais ser buscado nem copiado.",
      avisoAcimaDoAlvo: "Mesmo na menor qualidade utilizável o arquivo ficou acima do alvo pedido.",
      avisoRasterizarPiora:
        "Rasterizar deixaria este PDF MAIOR do que ele já é — é sinal de que ele é feito de texto, que ocupa muito menos espaço que foto. Devolvi o original intacto.",

      etapaBaixandoConversor: "Baixando o conversor de vídeo (só na primeira vez)…",
      etapaPreparandoArquivo: "Preparando o arquivo…",
      etapaConvertendoVideo: "Convertendo o vídeo…",
      etapaAjustando: "Ajustando pra caber no tamanho pedido…",
      etapaFinalizando: "Finalizando…",
      erroBaixarConversor: "Não consegui baixar o conversor de vídeo. Verifique a conexão e tente de novo.{detalhe}",
      erroDuracao: "Não consegui ler a duração deste vídeo.",
      erroFormatoVideo:
        "Este formato de vídeo não abre neste navegador. Converta para MP4 ou MOV antes de comprimir.",
      erroAlvoImpossivelVideo:
        "{mb} MB para {min} min de vídeo é pouco demais — sairia irreconhecível. Escolha um alvo maior.",
      erroConversor:
        "O conversor não conseguiu processar este vídeo. Ele pode estar corrompido ou num formato incomum.",
      erroRespostaConversor: "Resposta inesperada do conversor de vídeo.",
      avisoVideoAcimaDoAlvo: "Ficou um pouco acima do alvo: é o mínimo que este vídeo aceita sem virar borrão.",
      avisoResolucaoCaiu:
        "A resolução caiu para {altura}p — no tamanho que você pediu, manter a original deixaria a imagem quadriculada.",
      avisoVideoJaComprimido: "O vídeo original já estava bem comprimido; recomprimir não ganhou espaço.",
    },
  },
};
