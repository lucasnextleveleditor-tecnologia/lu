/**
 * Tela de Armazenamento: quanto a conta ocupa, onde o espaço está indo, como
 * ganhar espaço — e o backup que leva tudo pro Drive de quem usa.
 *
 * As áreas são as MESMAS chaves de bucket usadas em
 * `lib/armazenamento/uso.ts` (`HREF_DA_AREA`). O rótulo mora aqui e a rota
 * mora lá: um é texto que se lê, o outro é infraestrutura que não se traduz.
 */
export interface AreaTextoDict {
  rotulo: string;
  explicacao: string;
}

export interface DicaDeEspacoDict {
  titulo: string;
  texto: string;
  onde: string;
}

export interface ArmazenamentoDict {
  titulo: string;
  subtitulo: string;

  emUso: string;
  /** "10 MB {de} 10,0 GB" */
  de: string;
  avisoTresQuartos: string;
  avisoQuaseCheio: string;

  ondeEstaIndo: string;
  ondeEstaIndoSub: string;
  nenhumArquivo: string;
  arquivoUm: string;
  /** `{n}` = quantidade. */
  arquivoMuitos: string;

  maioresTitulo: string;
  maioresSub: string;
  colArquivo: string;
  colArea: string;
  colEnviado: string;
  colTamanho: string;

  comoGanharTitulo: string;
  comoGanharSub: string;
  dicaVideo: DicaDeEspacoDict;
  dicaComprimir: DicaDeEspacoDict;
  dicaApagar: DicaDeEspacoDict;
  dicaDrive: DicaDeEspacoDict;
  naoDaParaTirarLabel: string;
  naoDaParaTirarTexto: string;

  areas: {
    assinaturas: AreaTextoDict;
    producao: AreaTextoDict;
    financeiro: AreaTextoDict;
    "orcamentos-midia": AreaTextoDict;
    infoprodutos: AreaTextoDict;
    mapas: AreaTextoDict;
    avatares: AreaTextoDict;
    branding: AreaTextoDict;
  };

  backup: {
    titulo: string;
    descricao: string;
    comoFicaTitulo: string;
    comoFica: string;
    escolhaAreas: string;
    /** `{tamanho}` = peso total selecionado. */
    botao: string;
    botaoVazio: string;
    cancelar: string;
    fechar: string;

    etapaListando: string;
    /** `{n}` de `{total}` arquivos, `{tamanho}` já baixado. */
    etapaBaixando: string;
    etapaFinalizando: string;
    /** `{tamanho}` = peso do que foi salvo. */
    concluido: string;
    cancelado: string;

    erroGenerico: string;
    nenhumArquivo: string;
    avisoTruncado: string;
    avisoSemStreaming: string;
    avisoNaoFeche: string;
    /** Nome do arquivo: `{data}` vira 2026-09-10. */
    nomeDoZip: string;
    leiaMeNome: string;
    /** `{data}` = data do backup; `{pastas}` = lista das pastas, uma por linha. */
    leiaMeCorpo: string;
  };
}

export const armazenamento: ArmazenamentoDict = {
  titulo: "Armazenamento",
  subtitulo: "Quanto a sua conta ocupa e onde esse espaço está indo.",

  emUso: "Em uso",
  de: "de",
  avisoTresQuartos: "Você já passou de três quartos do espaço. Vale olhar os maiores arquivos abaixo.",
  avisoQuaseCheio:
    "A conta está quase cheia. Quando encher, novos envios param — veja as dicas abaixo antes disso acontecer.",

  ondeEstaIndo: "Onde está indo",
  ondeEstaIndoSub: "Cada linha leva à tela onde esses arquivos vivem.",
  nenhumArquivo: "Nenhum arquivo guardado ainda.",
  arquivoUm: "1 arquivo",
  arquivoMuitos: "{n} arquivos",

  maioresTitulo: "Os maiores arquivos",
  maioresSub: "É aqui que se ganha espaço. Apagar cem arquivos de 20 KB não muda nada; apagar três destes muda.",
  colArquivo: "Arquivo",
  colArea: "Área",
  colEnviado: "Enviado",
  colTamanho: "Tamanho",

  comoGanharTitulo: "Como ganhar espaço",
  comoGanharSub: "Em ordem do que mais rende para o que menos rende.",
  dicaVideo: {
    titulo: "Vídeo, sempre por link",
    texto:
      "É o que mais pesa, de longe. Suba no YouTube como “não listado” (grátis, ilimitado, toca liso) ou no Drive, e cole o link no lugar de enviar o arquivo. O vídeo aparece dentro do sistema do mesmo jeito, e ocupa zero.",
    onde: "Portfólio, criativos de anúncio e entregas de produção já aceitam link.",
  },
  dicaComprimir: {
    titulo: "Comprima antes de subir",
    texto:
      "Um PDF escaneado costuma cair a um quinto do tamanho sem perder leitura, e uma foto de 4000px vira 1600px sem ninguém notar na tela. Vale sobretudo para comprovante do financeiro, que é volume.",
    onde: "Ferramentas → Comprimir Arquivo faz isso aqui mesmo, sem instalar nada.",
  },
  dicaApagar: {
    titulo: "Apague versão antiga de entrega",
    texto:
      "Cada revisão enviada ao cliente vira um arquivo novo, e a v1 raramente é aberta depois que a v4 foi aprovada. É a limpeza que mais rende sem perder nada de valor.",
    onde: "Produção → a tarefa → Entregas.",
  },
  dicaDrive: {
    titulo: "Material pesado de referência, no Drive",
    texto:
      "Briefing com muita imagem, pasta de referências, arquivo bruto de captação: nada disso precisa morar aqui. Guarde no Drive e traga o link.",
    onde: "Vale para tudo que é consulta, não para o que precisa de assinatura.",
  },
  naoDaParaTirarLabel: "O que não dá para tirar daqui:",
  naoDaParaTirarTexto:
    "PDF enviado para assinatura. A assinatura é carimbada dentro do arquivo e o sistema guarda o original e a via assinada — é o par que sustenta a prova se alguém contestar. Esses ficam.",

  areas: {
    assinaturas: {
      rotulo: "Documentos para assinatura",
      explicacao:
        "PDFs enviados para assinar e as vias assinadas. Não dá para trocar por link: a assinatura é carimbada no arquivo.",
    },
    producao: {
      rotulo: "Entregas de produção",
      explicacao: "Versões enviadas ao cliente. É o que mais cresce — cada revisão é um arquivo novo.",
    },
    financeiro: {
      rotulo: "Anexos do financeiro",
      explicacao: "Comprovantes e notas presos a lançamentos.",
    },
    "orcamentos-midia": {
      rotulo: "Portfólio e propostas",
      explicacao: "Imagens e vídeos que aparecem nas propostas.",
    },
    infoprodutos: {
      rotulo: "Criativos de anúncio",
      explicacao: "Prints e vídeos dos criativos lançados.",
    },
    mapas: {
      rotulo: "Imagens de mapa mental",
      explicacao: "Imagens coladas dentro dos balões.",
    },
    avatares: {
      rotulo: "Fotos de perfil",
      explicacao: "Uma por pessoa da equipe. Ocupa quase nada.",
    },
    branding: {
      rotulo: "Marca e aparência",
      explicacao: "Logo, fundo de login e banner.",
    },
  },

  backup: {
    titulo: "Otimizar espaço",
    descricao:
      "Baixe todos os arquivos da conta de uma vez, já separados em pastas por área. Guarde no seu Drive e, quando o espaço apertar de novo, é só repetir: os nomes das pastas e dos arquivos são sempre os mesmos, então a nova cópia se encaixa por cima da antiga sem duplicar nada.",
    comoFicaTitulo: "Como o ZIP vem organizado",
    comoFica:
      "Uma pasta por área, com os arquivos dentro exatamente com o nome que têm aqui. No topo vai um LEIA-ME.txt dizendo o que é cada pasta e de quando é a cópia.",
    escolhaAreas: "O que levar",
    botao: "Baixar tudo ({tamanho})",
    botaoVazio: "Escolha ao menos uma área",
    cancelar: "Cancelar",
    fechar: "Fechar",

    etapaListando: "Montando a lista de arquivos…",
    etapaBaixando: "Baixando {n} de {total} — {tamanho}",
    etapaFinalizando: "Fechando o arquivo…",
    concluido: "Pronto: {tamanho} salvos no seu computador.",
    cancelado: "Download cancelado.",

    erroGenerico: "Não consegui montar o backup.",
    nenhumArquivo: "Não há arquivos para baixar nesta conta.",
    avisoTruncado:
      "Esta conta tem arquivos demais para um backup só. Baixe por área, uma de cada vez, para não deixar nada para trás.",
    avisoSemStreaming:
      "Neste navegador o backup é montado na memória antes de salvar, e um acervo grande pode travar a aba. No Chrome ou no Edge ele é gravado direto no disco. Se preferir seguir aqui, baixe uma área de cada vez.",
    avisoNaoFeche: "Não feche esta aba enquanto o download não terminar.",
    nomeDoZip: "arquivos-{data}",
    leiaMeNome: "LEIA-ME.txt",
    leiaMeCorpo:
      "Cópia dos arquivos do sistema — {data}\n\nCada pasta abaixo é uma área do sistema, e os arquivos vêm com o mesmo nome que têm lá dentro.\n\n{pastas}\n\nPara guardar no Drive: extraia este ZIP e arraste as pastas para a mesma pasta de sempre. Na próxima vez que você baixar, os nomes serão os mesmos e a cópia nova simplesmente atualiza a antiga, sem criar duplicata.\n\nOs PDFs de assinatura estão aqui como cópia de segurança. Eles continuam no sistema também: é lá que fica a prova com a data, o IP e o registro de quem assinou.\n",
  },
};
