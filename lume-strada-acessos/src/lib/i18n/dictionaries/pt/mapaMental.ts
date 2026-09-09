import type { FormaPlural } from "./ordemDoDia";

/**
 * Mapa Mental — o quadro colaborativo.
 *
 * Vocabulário deliberadamente sem jargão: "balão" e não "nó", "ramo" e não
 * "subárvore". Quem usa o sistema é filmmaker, fotógrafo e designer, não
 * gente que fala em estrutura de dados.
 */
export interface MapaMentalDict {
  tituloPagina: string;
  subtituloPagina: string;
  novoMapa: string;
  semMapasTitulo: string;
  semMapasDescricao: string;
  semTitulo: string;
  tituloExemplo: string;
  contagemBaloes: FormaPlural;
  excluir: string;
  confirmarExclusao: string;
  voltar: string;

  ativos: string;
  arquivados: string;
  arquivar: string;
  desarquivar: string;
  baixarPdf: string;
  semArquivadosTitulo: string;
  semArquivadosDescricao: string;
  acoes: string;

  // Canvas
  baloVazio: string;
  dicaTeclado: string;
  aproximar: string;
  afastar: string;
  encaixar: string;
  reorganizar: string;
  reorganizarHint: string;
  expandir: string;
  recolher: string;
  novoFilho: string;
  apagar: string;
  corDoRamo: string;
  corAutomatica: string;

  // Comentários
  comentarios: string;
  semComentarios: string;
  seuNome: string;
  escrevaComentario: string;
  enviarComentario: string;

  // Compartilhamento
  compartilhar: string;
  quemPodeAbrir: string;
  acessoPrivadoLabel: string;
  acessoPrivadoHint: string;
  acessoVerLabel: string;
  acessoVerHint: string;
  acessoComentarLabel: string;
  acessoComentarHint: string;
  acessoEditarLabel: string;
  acessoEditarHint: string;
  copiarLink: string;
  linkCopiado: string;
  privado: string;

  // Ferramentas e anexos
  ferramentaSelecionar: string;
  ferramentaSelecionarHint: string;
  ferramentaMao: string;
  ferramentaMaoHint: string;
  atalhos: string;
  atalhoRamo: string;
  atalhoVizinho: string;
  atalhoEditar: string;
  atalhoApagar: string;
  atalhoSair: string;
  atalhoZoom: string;
  atalhoArrastar: string;
  anexos: string;
  link: string;
  linkExemplo: string;
  abrirLink: string;
  imagem: string;
  enviarImagem: string;
  enviandoImagem: string;
  removerImagem: string;
  imagemGrande: string;

  fundoClaro: string;
  fundoEscuro: string;
  telaCheia: string;
  sairTelaCheia: string;
  salvar: string;
  tudoSalvo: string;
  salvandoLabel: string;
  confirmarSair: string;

  texto: string;
  fonte: string;
  tamanho: string;
  negrito: string;
  italico: string;

  desfazer: string;
  refazer: string;

  // Página pública
  linkInvalidoTitulo: string;
  linkInvalidoDescricao: string;
  somenteLeitura: string;
  podeComentarAviso: string;
  podeEditarAviso: string;
}

export const mapaMental: MapaMentalDict = {
  tituloPagina: "Mapas Mentais",
  subtituloPagina: "Pense em voz alta com a equipe. Todo mundo no mesmo mapa, ao mesmo tempo.",
  novoMapa: "Novo mapa",
  semMapasTitulo: "Nenhum mapa ainda",
  semMapasDescricao: "Crie o primeiro para destrinchar uma campanha, um roteiro ou a estrutura de um projeto.",
  semTitulo: "Mapa sem título",
  tituloExemplo: "Campanha de verão — estrutura",
  contagemBaloes: { um: "1 balão", muitos: "{n} balões" },
  excluir: "Excluir",
  confirmarExclusao: "Excluir este mapa e tudo que está nele?",
  voltar: "Mapas Mentais",

  ativos: "Ativos",
  arquivados: "Arquivados",
  arquivar: "Arquivar",
  desarquivar: "Desarquivar",
  baixarPdf: "Baixar PDF",
  semArquivadosTitulo: "Nenhum mapa arquivado",
  semArquivadosDescricao: "Mapas arquivados saem da lista principal, mas continuam inteiros — com link e tudo.",
  acoes: "Ações",

  baloVazio: "Sem texto",
  dicaTeclado: "Tab cria um ramo · Enter cria um vizinho · Delete apaga · duplo clique edita",
  aproximar: "Aproximar",
  afastar: "Afastar",
  encaixar: "Encaixar",
  reorganizar: "Reorganizar",
  reorganizarHint: "Desfaz os ajustes de posição e deixa o mapa se arrumar sozinho",
  expandir: "Abrir ramo",
  recolher: "Fechar ramo",
  novoFilho: "Novo ramo",
  apagar: "Apagar",
  corDoRamo: "Cor",
  corAutomatica: "Herda a cor do ramo",

  comentarios: "Comentários",
  semComentarios: "Nenhum comentário neste balão.",
  seuNome: "Seu nome",
  escrevaComentario: "Escreva um comentário...",
  enviarComentario: "Comentar",

  compartilhar: "Compartilhar",
  quemPodeAbrir: "Quem abrir o link pode",
  acessoPrivadoLabel: "Ninguém — só a equipe",
  acessoPrivadoHint: "O link para de funcionar sem trocar de endereço. Volte a ligar quando quiser.",
  acessoVerLabel: "Ver",
  acessoVerHint: "Abre, navega e fecha ramos. Não muda nada e não precisa de conta.",
  acessoComentarLabel: "Ver e comentar",
  acessoComentarHint: "Deixa recados nos balões, sem conta e sem poder alterar o mapa.",
  acessoEditarLabel: "Ver e editar",
  acessoEditarHint: "Edita o mapa inteiro. Cuidado: quem receber o link repassado edita também.",
  copiarLink: "Copiar link",
  linkCopiado: "Link copiado",
  privado: "Privado",

  ferramentaSelecionar: "Selecionar",
  ferramentaSelecionarHint: "Clique para editar e arraste o balão de lugar",
  ferramentaMao: "Mover",
  ferramentaMaoHint: "Arraste para navegar pelo mapa (ou segure espaço)",
  atalhos: "Atalhos",
  atalhoRamo: "cria um ramo",
  atalhoVizinho: "cria um vizinho",
  atalhoEditar: "edita o texto",
  atalhoApagar: "apaga o ramo",
  atalhoSair: "sai da edição",
  atalhoZoom: "dá zoom",
  atalhoArrastar: "arrasta a tela",
  anexos: "Anexos",
  link: "Link",
  linkExemplo: "https://...",
  abrirLink: "Abrir",
  imagem: "Imagem",
  enviarImagem: "Enviar imagem",
  enviandoImagem: "Enviando...",
  removerImagem: "Remover imagem",
  imagemGrande: "A imagem passa de 5 MB.",

  fundoClaro: "Fundo claro",
  fundoEscuro: "Fundo escuro",
  telaCheia: "Tela cheia",
  sairTelaCheia: "Sair da tela cheia",
  salvar: "Salvar",
  tudoSalvo: "Tudo salvo",
  salvandoLabel: "Salvando...",
  confirmarSair: "Você tem uma edição aberta que ainda não foi salva. Sair mesmo assim?",

  texto: "Texto",
  fonte: "Fonte",
  tamanho: "Tamanho",
  negrito: "Negrito",
  italico: "Itálico",

  desfazer: "Desfazer",
  refazer: "Refazer",

  linkInvalidoTitulo: "Mapa não encontrado",
  linkInvalidoDescricao: "Este link não existe mais ou o compartilhamento foi desligado. Peça um novo a quem enviou.",
  somenteLeitura: "Você está vendo este mapa pelo link — dá para navegar, mas não para editar.",
  podeComentarAviso: "Você pode comentar nos balões. Clique em um para começar.",
  podeEditarAviso: "Você pode editar este mapa pelo link.",
};
