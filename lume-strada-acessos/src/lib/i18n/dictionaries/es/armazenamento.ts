import type { ArmazenamentoDict } from "../pt/armazenamento";

export const armazenamento: ArmazenamentoDict = {
  titulo: "Almacenamiento",
  subtitulo: "Cuánto ocupa tu cuenta y a dónde se está yendo ese espacio.",

  emUso: "En uso",
  de: "de",
  avisoTresQuartos: "Ya pasaste tres cuartos del espacio. Vale la pena mirar los archivos más grandes abajo.",
  avisoQuaseCheio:
    "La cuenta está casi llena. Cuando se llene, los envíos nuevos se detienen — mira los consejos de abajo antes de que pase.",

  ondeEstaIndo: "A dónde se está yendo",
  ondeEstaIndoSub: "Cada línea lleva a la pantalla donde viven esos archivos.",
  nenhumArquivo: "Todavía no hay archivos guardados.",
  arquivoUm: "1 archivo",
  arquivoMuitos: "{n} archivos",

  maioresTitulo: "Los archivos más grandes",
  maioresSub:
    "Aquí es donde se gana espacio. Borrar cien archivos de 20 KB no cambia nada; borrar tres de estos sí.",
  colArquivo: "Archivo",
  colArea: "Área",
  colEnviado: "Enviado",
  colTamanho: "Tamaño",

  comoGanharTitulo: "Cómo ganar espacio",
  comoGanharSub: "En orden, de lo que más rinde a lo que menos rinde.",
  dicaVideo: {
    titulo: "Video, siempre por enlace",
    texto:
      "Es lo que más pesa, de lejos. Súbelo a YouTube como “no listado” (gratis, ilimitado, se reproduce fluido) o a Drive, y pega el enlace en lugar de enviar el archivo. El video aparece dentro del sistema igual, y ocupa cero.",
    onde: "Portafolio, creativos de anuncio y entregas de producción ya aceptan enlace.",
  },
  dicaComprimir: {
    titulo: "Comprime antes de subir",
    texto:
      "Un PDF escaneado suele caer a un quinto de su tamaño sin perder legibilidad, y una foto de 4000px queda en 1600px sin que nadie lo note en pantalla. Vale sobre todo para comprobantes del financiero, que son volumen.",
    onde: "Herramientas → Comprimir Archivo lo hace aquí mismo, sin instalar nada.",
  },
  dicaApagar: {
    titulo: "Borra versiones viejas de entrega",
    texto:
      "Cada revisión enviada al cliente se vuelve un archivo nuevo, y la v1 rara vez se abre después de que la v4 fue aprobada. Es la limpieza que más rinde sin perder nada de valor.",
    onde: "Producción → la tarea → Entregas.",
  },
  dicaDrive: {
    titulo: "Material pesado de referencia, en Drive",
    texto:
      "Briefing con muchas imágenes, carpeta de referencias, material bruto de rodaje: nada de eso necesita vivir aquí. Guárdalo en Drive y trae el enlace.",
    onde: "Vale para todo lo que es consulta, no para lo que necesita firma.",
  },
  naoDaParaTirarLabel: "Lo que no se puede sacar de aquí:",
  naoDaParaTirarTexto:
    "PDF enviado para firma. La firma queda sellada dentro del archivo y el sistema guarda el original y la copia firmada — es el par que sostiene la prueba si alguien lo cuestiona. Esos se quedan.",

  areas: {
    assinaturas: {
      rotulo: "Documentos para firma",
      explicacao:
        "PDFs enviados para firmar y las copias firmadas. No se pueden cambiar por enlace: la firma queda sellada en el archivo.",
    },
    producao: {
      rotulo: "Entregas de producción",
      explicacao: "Versiones enviadas al cliente. Es lo que más crece — cada revisión es un archivo nuevo.",
    },
    financeiro: {
      rotulo: "Adjuntos del financiero",
      explicacao: "Comprobantes y facturas ligados a movimientos.",
    },
    "orcamentos-midia": {
      rotulo: "Portafolio y propuestas",
      explicacao: "Imágenes y videos que aparecen en las propuestas.",
    },
    infoprodutos: {
      rotulo: "Creativos de anuncio",
      explicacao: "Capturas y videos de los creativos lanzados.",
    },
    mapas: {
      rotulo: "Imágenes de mapa mental",
      explicacao: "Imágenes pegadas dentro de las burbujas.",
    },
    avatares: {
      rotulo: "Fotos de perfil",
      explicacao: "Una por persona del equipo. Ocupa casi nada.",
    },
    branding: {
      rotulo: "Marca y apariencia",
      explicacao: "Logo, fondo de acceso y banner.",
    },
  },

  backup: {
    titulo: "Optimizar espacio",
    descricao:
      "Descarga todos los archivos de la cuenta de una vez, ya separados en carpetas por área. Guárdalos en tu Drive y, cuando el espacio apriete otra vez, solo repite: los nombres de carpetas y archivos son siempre los mismos, así que la copia nueva encaja sobre la anterior sin duplicar nada.",
    comoFicaTitulo: "Cómo viene organizado el ZIP",
    comoFica:
      "Una carpeta por área, con los archivos dentro exactamente con el nombre que tienen aquí. Arriba va un LEEME.txt que dice qué es cada carpeta y de cuándo es la copia.",
    escolhaAreas: "Qué llevar",
    botao: "Descargar todo ({tamanho})",
    botaoVazio: "Elige al menos un área",
    cancelar: "Cancelar",
    fechar: "Cerrar",

    etapaListando: "Armando la lista de archivos…",
    etapaBaixando: "Descargando {n} de {total} — {tamanho}",
    etapaFinalizando: "Cerrando el archivo…",
    concluido: "Listo: {tamanho} guardados en tu computadora.",
    cancelado: "Descarga cancelada.",

    erroGenerico: "No pude armar la copia de seguridad.",
    nenhumArquivo: "No hay archivos para descargar en esta cuenta.",
    avisoTruncado:
      "Esta cuenta tiene demasiados archivos para una sola copia. Descarga por área, una a la vez, para no dejar nada atrás.",
    avisoSemStreaming:
      "En este navegador la copia se arma en memoria antes de guardarse, y un acervo grande puede trabar la pestaña. En Chrome o Edge se graba directo al disco. Si prefieres seguir aquí, descarga un área a la vez.",
    avisoNaoFeche: "No cierres esta pestaña hasta que termine la descarga.",
    nomeDoZip: "archivos-{data}",
    leiaMeNome: "LEEME.txt",
    leiaMeCorpo:
      "Copia de los archivos del sistema — {data}\n\nCada carpeta de abajo es un área del sistema, y los archivos vienen con el mismo nombre que tienen allí dentro.\n\n{pastas}\n\nPara guardar en Drive: extrae este ZIP y arrastra las carpetas a la misma carpeta de siempre. La próxima vez que descargues, los nombres serán los mismos y la copia nueva simplemente actualiza la anterior, sin crear duplicados.\n\nLos PDFs de firma están aquí como copia de seguridad. También siguen en el sistema: allí está la prueba, con la fecha, el IP y el registro de quién firmó.\n",
  },
};
