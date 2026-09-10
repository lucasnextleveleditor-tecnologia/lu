import type { FerramentasDict } from "../pt/ferramentas";

export const ferramentas: FerramentasDict = {
  tituloPagina: "Herramientas",
  subtituloPagina:
    "Lo que abres para hacer una cosa y cerrar enseguida — separado de los módulos que sigues a diario.",
  voltar: "Herramientas",

  ordemExternaTitulo: "Orden de Rodaje",
  ordemExternaDescricao:
    "La hoja que todos reciben la víspera: dónde es, a qué hora, quién estará y qué se va a grabar.",
  ordensAtivas: { um: "1 orden activa", muitos: "{n} órdenes activas", nenhum: "ninguna orden activa" },

  mapaMentalTitulo: "Mapa Mental",
  mapaMentalDescricao:
    "Pensar juntos y en vivo: ideas, guion y estructura del proyecto, con el equipo editando el mismo mapa.",
  mapasCriados: { um: "1 mapa", muitos: "{n} mapas", nenhum: "ningún mapa todavía" },

  calculadoraTitulo: "Calculadora de Presupuesto",
  calculadoraDescricao:
    "Simula costo, impuesto y margen antes de enviar el precio — el mismo motor de cálculo de las propuestas.",
  calculadoraMeta: "Simulación libre, no se guarda nada",

  criadorContratosTitulo: "Creador de Contratos",
  criadorContratosDescricao:
    "Arma el contrato cláusula por cláusula con las plantillas de tu profesión, con vista previa paginada antes de enviarlo.",
  contratosAguardando: {
    um: "1 contrato esperando firma",
    muitos: "{n} contratos esperando firma",
    nenhum: "ningún contrato esperando",
  },

  assinaturaTitulo: "Firma de Contratos",
  assinaturaDescricao:
    "Sube un PDF ya listo, marca dónde firma cada persona y envíalo por enlace — con registro de IP, fecha y hash.",
  documentosAguardando: {
    um: "1 documento esperando",
    muitos: "{n} documentos esperando",
    nenhum: "ningún documento esperando",
  },

  comprimirTitulo: "Comprimir Archivo",
  comprimirDescricao:
    "¿Video, PDF o imagen demasiado grande para enviar? Elige el tamaño final y la conversión ocurre aquí mismo, en tu navegador.",
  comprimirMeta: "No gasta almacenamiento de la cuenta",

  comprimir: {
    subtitulo:
      "Elige el archivo y el tamaño que necesita tener. La conversión ocurre en tu propio navegador — nada se envía a internet y nada ocupa el almacenamiento de tu cuenta.",
    arrasteAqui: "Arrastra un archivo aquí, o",
    escolherArquivo: "Elegir archivo",
    limitesAceitos: "Video hasta 500 MB · PDF hasta 150 MB · Imagen hasta 60 MB",
    trocarArquivo: "Cambiar de archivo",
    tipoDesconhecido: "No sé comprimir este tipo de archivo. Por ahora la herramienta trata video, PDF e imagen.",
    acimaDoLimite:
      "Este archivo pesa {tamanho} y el límite es {limite}. Por encima de eso el trabajo se hace en la memoria del navegador y la pestaña se traba a mitad de camino.",
    avisoArquivoPesado:
      "Archivo grande: la conversión puede tardar varios minutos y la pestaña debe quedar abierta todo el tiempo. Para video, publicar por enlace (YouTube, Drive) suele ser mejor que comprimir.",
    rotuloVideo: "Video",
    rotuloPdf: "PDF",
    rotuloImagem: "Imagen",
    rotuloDesconhecido: "Desconocido",

    tamanhoFinal: "Tamaño final",
    outroTamanho: "otro",
    unidadeMb: "MB",

    comoReduzir: "Cómo reducirlo",
    preservarTitulo: "Mantener el texto del documento",
    preservarDescricao:
      "Encoge solo las imágenes dentro del PDF. El texto se sigue pudiendo buscar y copiar — es lo correcto para contrato, propuesta y factura.",
    rasterizarTitulo: "Rasterizar las páginas",
    rasterizarDescricao:
      "Cada página se vuelve una foto. Reduce mucho más y funciona en cualquier PDF, pero el documento deja de tener texto buscable — úsalo en escaneados.",

    botaoComprimir: "Comprimir",
    comprimindo: "Comprimiendo…",
    naoSaiDoComputador: "El archivo no sale de tu computadora — la conversión ocurre aquí en el navegador.",
    naoFecheAba: "No cierres esta pestaña hasta que la barra termine.",
    baixar: "Descargar",

    quandoValeTitulo: "Cuándo vale la pena",
    dicaVideoLead: "Video",
    dicaVideo:
      "comprimir sirve para enviar por correo o WhatsApp. Para entregar al cliente dentro del sistema, publicar en YouTube o Drive y pegar el enlace sigue siendo mejor: no pierde calidad y no gasta nada de almacenamiento.",
    dicaPdfEscaneadoLead: "PDF escaneado",
    dicaPdfEscaneado:
      "es donde más se gana. Un contrato digitalizado de 50 MB suele quedar en 5 a 10 MB sin estorbar la lectura.",
    dicaPdfTextoLead: "PDF generado por computadora",
    dicaPdfTexto:
      "propuesta, contrato e informe hechos aquí en el sistema ya son pequeños. Comprimir gana poco y puede costarte la búsqueda dentro del documento.",
    dicaImagemLead: "Imagen",
    dicaImagem: "una foto de cámara o captura de 10 MB queda en menos de 1 MB sin diferencia visible en pantalla.",

    motor: {
      sufixoArquivo: "-menor",

      erroCanvas: "Este navegador no pudo abrir el área de dibujo.",
      erroGerarImagem: "No pude generar la imagen comprimida.",

      etapaAbrindoImagem: "Abriendo la imagen…",
      etapaTestandoQualidade: "Buscando el mejor equilibrio entre tamaño y calidad…",
      erroImagemNaoAbre:
        "No pude abrir esta imagen en este navegador. Formatos como HEIC del iPhone solo abren en Safari — guárdala como JPG o PNG e inténtalo de nuevo.",
      erroImagemGenerico: "No pude comprimir esta imagen.",
      avisoMenorPossivel:
        "Este fue el menor tamaño posible sin destruir la imagen — quedó por encima del objetivo que pediste.",
      avisoVirouJpg: "La imagen se volvió JPG: si tenía fondo transparente, ahora es blanco.",
      avisoJaOtimizado: "El archivo original ya estaba bien optimizado — comprimirlo otra vez no ganó espacio.",

      etapaProcurandoImagens: "Buscando las imágenes dentro del PDF…",
      etapaRecomprimindoImagem: "Recomprimiendo imagen {n} de {total}…",
      etapaRemontandoPdf: "Rearmando el PDF…",
      etapaAbrindoDocumento: "Abriendo el documento…",
      etapaCalculandoQualidade: "Calculando la calidad que cabe en el objetivo…",
      etapaConvertendoPagina: "Convirtiendo página {n} de {total}…",
      etapaMontandoArquivo: "Armando el archivo final…",
      erroConverterPagina: "No pude convertir la página en imagen.",
      avisoPdfSoTexto:
        "Este PDF es casi todo texto — no hay imagen pesada que encoger, así que no se puede reducir sin convertir el texto en foto. Si aceptas perder la búsqueda dentro del documento, cambia a “Rasterizar las páginas”.",
      avisoAlvoImpossivelPdf:
        "Ese objetivo es imposible manteniendo el texto: solo la estructura del documento ya ocupa {kb} KB. Elige un objetivo mayor o usa “Rasterizar las páginas”.",
      avisoImagensJaMinimas: "Las imágenes de este PDF ya estaban en el menor tamaño posible.",
      avisoNaoChegouMantendoTexto:
        "No logré llegar al objetivo manteniendo el texto del documento. Si puedes renunciar a la búsqueda dentro del PDF, prueba “Rasterizar las páginas”.",
      avisoDevolviMenor: "El archivo original ya estaba optimizado — te devolví el menor de los dos.",
      avisoTextoVirouImagem: "El texto se volvió imagen: el PDF ya no se puede buscar ni copiar.",
      avisoAcimaDoAlvo: "Incluso en la menor calidad utilizable el archivo quedó por encima del objetivo.",
      avisoRasterizarPiora:
        "Rasterizar dejaría este PDF MÁS GRANDE de lo que ya es — señal de que está hecho de texto, que ocupa mucho menos espacio que una foto. Te devolví el original intacto.",

      etapaBaixandoConversor: "Descargando el conversor de video (solo la primera vez)…",
      etapaPreparandoArquivo: "Preparando el archivo…",
      etapaConvertendoVideo: "Convirtiendo el video…",
      etapaAjustando: "Ajustando para que quepa en el tamaño pedido…",
      etapaFinalizando: "Finalizando…",
      erroBaixarConversor: "No pude descargar el conversor de video. Revisa la conexión e inténtalo de nuevo.{detalhe}",
      erroDuracao: "No pude leer la duración de este video.",
      erroFormatoVideo: "Este formato de video no abre en este navegador. Conviértelo a MP4 o MOV antes de comprimir.",
      erroAlvoImpossivelVideo:
        "{mb} MB para {min} min de video es demasiado poco — saldría irreconocible. Elige un objetivo mayor.",
      erroConversor: "El conversor no pudo procesar este video. Puede estar dañado o en un formato poco común.",
      erroRespostaConversor: "Respuesta inesperada del conversor de video.",
      avisoVideoAcimaDoAlvo: "Quedó un poco por encima del objetivo: es lo mínimo que este video acepta sin volverse un borrón.",
      avisoResolucaoCaiu:
        "La resolución bajó a {altura}p — en el tamaño que pediste, mantener la original habría dejado la imagen cuadriculada.",
      avisoVideoJaComprimido: "El video original ya estaba bien comprimido; recomprimir no ganó espacio.",
    },
  },
};
