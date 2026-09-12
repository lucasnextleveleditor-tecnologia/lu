/**
 * Português de Portugal, derivado do de Brasil.
 *
 * POR QUE DERIVAR EM VEZ DE TRADUZIR: o dicionário tem mais de sete mil
 * linhas. Uma quarta pasta copiada à mão significaria, a cada texto novo do
 * produto, lembrar de escrever a versão portuguesa — e no dia em que alguém
 * esquecesse, o `tsc` quebraria o build inteiro por causa de uma frase. Aqui
 * o pt-PT NASCE do pt-BR: toda chave nova aparece nas duas línguas no mesmo
 * instante, já adaptada quando cai numa das regras abaixo, e nunca faltando.
 *
 * O que a adaptação cobre, em ordem de importância:
 *
 *   1. O gerúndio. É a marca sonora mais forte da diferença — "Carregando…"
 *      soa brasileiro a um metro de distância, e "A carregar…" soa de casa.
 *   2. O vocabulário de informática, que divergiu de verdade: ficheiro, ecrã,
 *      utilizador, palavra-passe, guardar, eliminar, separador, definições.
 *   3. A acentuação de /e/ e /o/ fechados antes de nasal (prémio, bónus,
 *      económico) — um "prêmio" num painel português é um erro de escrita,
 *      não um sotaque.
 *
 * O que NÃO é mexido, de propósito: pessoa do discurso ("você"), que exigiria
 * reescrever frase por frase e erra feio quando automatizado; e os termos
 * brasileiros que são NOME DE COISA e não palavra (Pix, CNPJ, boleto) —
 * traduzir o nome de um documento é pior do que deixá-lo.
 *
 * Para uma frase que a tabela não resolve bem, `AJUSTES_EXATOS` troca o texto
 * inteiro, e ganha de tudo. É a válvula de escape: nada aqui obriga ninguém a
 * conviver com uma tradução torta.
 */

const LETRA = "A-Za-zÀ-ÖØ-öø-ÿ";

/** Género do SUBSTITUTO — só é declarado quando ele difere do da palavra trocada. */
type Genero = "m" | "f";

interface Troca {
  de: string;
  para: string;
  genero?: Genero;
}

/** Frase inteira, quando a troca palavra a palavra não dá conta. Comparada antes de qualquer regra. */
// Vazio por enquanto -- a tabela abaixo tem dado conta. Existe para o dia em
// que uma frase precisar de reescrita inteira, e nao de troca de palavra.
const AJUSTES_EXATOS: Record<string, string> = {};

/**
 * Pares na ordem em que são aplicados — o mais LONGO primeiro, sempre: se
 * "tela" passasse antes de "tela cheia", sobraria "ecrã cheia".
 */
const TROCAS: readonly Troca[] = [
  // --- gerúndio: "-ndo" vira "a + infinitivo" -------------------------------
  { de: "tela cheia", para: "ecrã inteiro" },
  // Concordância à distância: o adjetivo vem DEPOIS e não é alcançado pela
  // regra do determinante. São poucos casos e cada um entra inteiro aqui, com
  // o género declarado para o artigo à frente também ser corrigido.
  { de: "time inteiro", para: "equipa inteira", genero: "f" },
  { de: "tela inteira", para: "ecrã inteiro", genero: "m" },
  { de: "compartilhamento foi desligado", para: "partilha foi desligada", genero: "f" },
  { de: "a aba precisa ficar aberta", para: "o separador precisa ficar aberto" },
  { de: "folha de pagamento", para: "folha salarial" },
  { de: "carregando", para: "a carregar" },
  { de: "salvando", para: "a guardar" },
  { de: "enviando", para: "a enviar" },
  { de: "processando", para: "a processar" },
  { de: "buscando", para: "a procurar" },
  { de: "gerando", para: "a gerar" },
  { de: "excluindo", para: "a eliminar" },
  { de: "atualizando", para: "a atualizar" },
  { de: "criando", para: "a criar" },
  { de: "calculando", para: "a calcular" },
  { de: "sincronizando", para: "a sincronizar" },
  { de: "publicando", para: "a publicar" },
  { de: "aguardando", para: "a aguardar" },
  { de: "baixando", para: "a transferir" },
  { de: "cadastrando", para: "a registar" },
  { de: "abrindo", para: "a abrir" },

  // --- vocabulário de informática ------------------------------------------
  { de: "usuários", para: "utilizadores" },
  { de: "usuário", para: "utilizador" },
  { de: "usuárias", para: "utilizadoras" },
  { de: "usuária", para: "utilizadora" },
  { de: "arquivos", para: "ficheiros" },
  { de: "arquivo", para: "ficheiro" },
  { de: "telas", para: "ecrãs", genero: "m" },
  { de: "tela", para: "ecrã", genero: "m" },
  { de: "equipes", para: "equipas" },
  { de: "equipe", para: "equipa" },
  { de: "times", para: "equipas", genero: "f" },
  { de: "time", para: "equipa", genero: "f" },
  { de: "celulares", para: "telemóveis" },
  { de: "celular", para: "telemóvel" },
  { de: "planilhas", para: "folhas de cálculo" },
  { de: "planilha", para: "folha de cálculo" },
  { de: "estoques", para: "stocks" },
  { de: "estoque", para: "stock" },
  { de: "abas", para: "separadores", genero: "m" },
  { de: "aba", para: "separador", genero: "m" },
  { de: "configurações", para: "definições" },
  { de: "configuração", para: "definição" },
  { de: "aplicativos", para: "aplicações", genero: "f" },
  { de: "aplicativo", para: "aplicação", genero: "f" },
  { de: "sobrenome", para: "apelido" },
  { de: "CEP", para: "Código postal" },

  // --- verbos e formas derivadas -------------------------------------------
  { de: "compartilhamento", para: "partilha", genero: "f" },
  { de: "compartilhados", para: "partilhados" },
  { de: "compartilhado", para: "partilhado" },
  { de: "compartilhar", para: "partilhar" },
  { de: "gerenciamento", para: "gestão", genero: "f" },
  { de: "gerenciador", para: "gestor" },
  { de: "gerenciar", para: "gerir" },
  { de: "salvar", para: "guardar" },
  { de: "salvas", para: "guardadas" },
  { de: "salvos", para: "guardados" },
  { de: "salva", para: "guardada" },
  { de: "salvo", para: "guardado" },
  { de: "exclusão", para: "eliminação" },
  { de: "excluídos", para: "eliminados" },
  { de: "excluídas", para: "eliminadas" },
  { de: "excluído", para: "eliminado" },
  { de: "excluída", para: "eliminada" },
  { de: "excluir", para: "eliminar" },
  { de: "deletar", para: "eliminar" },
  { de: "baixar", para: "transferir" },
  { de: "cadastrados", para: "registados" },
  { de: "cadastradas", para: "registadas" },
  { de: "cadastrado", para: "registado" },
  { de: "cadastrada", para: "registada" },
  { de: "cadastrar", para: "registar" },
  { de: "cadastros", para: "registos" },
  { de: "cadastro", para: "registo" },
  { de: "registros", para: "registos" },
  { de: "registro", para: "registo" },
  { de: "faturamento", para: "faturação", genero: "f" },

  // --- ortografia: /e/ e /o/ fechados antes de nasal ------------------------
  { de: "senhas", para: "palavras-passe" },
  { de: "senha", para: "palavra-passe" },
  { de: "contatos", para: "contactos" },
  { de: "contato", para: "contacto" },
  { de: "fatos", para: "factos" },
  { de: "fato", para: "facto" },
  { de: "prêmios", para: "prémios" },
  { de: "prêmio", para: "prémio" },
  { de: "bônus", para: "bónus" },
  { de: "anônimo", para: "anónimo" },
  { de: "anônima", para: "anónima" },
  { de: "econômico", para: "económico" },
  { de: "econômica", para: "económica" },
  { de: "eletrônico", para: "eletrónico" },
  { de: "eletrônica", para: "eletrónica" },
  { de: "acadêmico", para: "académico" },
  { de: "gênero", para: "género" },
  { de: "gêneros", para: "géneros" },
  { de: "câmeras", para: "câmaras" },
  { de: "câmera", para: "câmara" },
] as const;

/**
 * Os determinantes que precisam acompanhar a troca de género.
 *
 * Sem isto, "a aba" viraria "a separador" e "o aplicativo" viraria "o
 * aplicação" — erro de escola primária, e logo no rótulo de um menu. Como a
 * palavra trocada quase sempre vem colada no artigo, resolver o par
 * (determinante + palavra) de uma vez cobre a esmagadora maioria dos casos.
 *
 * O que ISTO NÃO RESOLVE, e é bom estar dito: o adjetivo DEPOIS do
 * substantivo ("a aba precisa ficar aberta" → "o separador precisa ficar
 * aberta"). Concordância à distância não se automatiza sem análise
 * gramatical a sério. Para essas frases existe `AJUSTES_EXATOS`, que troca o
 * texto inteiro e ganha de tudo.
 */
const DETERMINANTES: Record<string, readonly [masculino: string, feminino: string]> = {
  o: ["o", "a"], a: ["o", "a"], os: ["os", "as"], as: ["os", "as"],
  um: ["um", "uma"], uma: ["um", "uma"], uns: ["uns", "umas"], umas: ["uns", "umas"],
  do: ["do", "da"], da: ["do", "da"], dos: ["dos", "das"], das: ["dos", "das"],
  no: ["no", "na"], na: ["no", "na"], nos: ["nos", "nas"], nas: ["nos", "nas"],
  ao: ["ao", "à"], "à": ["ao", "à"], aos: ["aos", "às"], "às": ["aos", "às"],
  pelo: ["pelo", "pela"], pela: ["pelo", "pela"], pelos: ["pelos", "pelas"], pelas: ["pelos", "pelas"],
  este: ["este", "esta"], esta: ["este", "esta"], estes: ["estes", "estas"], estas: ["estes", "estas"],
  esse: ["esse", "essa"], essa: ["esse", "essa"], esses: ["esses", "essas"], essas: ["esses", "essas"],
  aquele: ["aquele", "aquela"], aquela: ["aquele", "aquela"],
  seu: ["seu", "sua"], sua: ["seu", "sua"], seus: ["seus", "suas"], suas: ["seus", "suas"],
  meu: ["meu", "minha"], minha: ["meu", "minha"],
  nosso: ["nosso", "nossa"], nossa: ["nosso", "nossa"],
  todo: ["todo", "toda"], toda: ["todo", "toda"], todos: ["todos", "todas"], todas: ["todos", "todas"],
  outro: ["outro", "outra"], outra: ["outro", "outra"], outros: ["outros", "outras"], outras: ["outros", "outras"],
  nenhum: ["nenhum", "nenhuma"], nenhuma: ["nenhum", "nenhuma"],
  algum: ["algum", "alguma"], alguma: ["algum", "alguma"],
};

const ALTERNATIVA_DETERMINANTE = Object.keys(DETERMINANTES)
  .sort((a, b) => b.length - a.length)
  .join("|");

interface Regra {
  regex: RegExp;
  para: string;
  genero?: Genero;
}

const REGRAS: readonly Regra[] = TROCAS.map(({ de, para, genero }) => ({
  regex: genero
    ? new RegExp(`(?<![${LETRA}])((?:(?:${ALTERNATIVA_DETERMINANTE})\\s+){1,2})?${de}(?![${LETRA}])`, "gi")
    : new RegExp(`(?<![${LETRA}])${de}(?![${LETRA}])`, "gi"),
  para,
  genero,
}));

/**
 * Mantém a caixa do original: TUDO EM CAIXA segue em caixa, Capitalizado segue
 * capitalizado.
 *
 * A regra de caixa alta só vale quando a substituição é UMA palavra. "CEP"
 * virando "CÓDIGO POSTAL" no meio de um formulário é um grito; capitalizado
 * ("Código postal") é o que a pessoa espera ler num rótulo.
 */
function comACaixaDoOriginal(original: string, novo: string): string {
  const umaPalavraSo = !novo.includes(" ");
  if (umaPalavraSo && original.length > 1 && original === original.toUpperCase() && original !== original.toLowerCase()) {
    return novo.toUpperCase();
  }
  if (original[0] && original[0] === original[0].toUpperCase()) {
    return novo.charAt(0).toUpperCase() + novo.slice(1);
  }
  return novo;
}

function adaptarTexto(texto: string): string {
  const exato = AJUSTES_EXATOS[texto];
  if (exato !== undefined) return exato;

  let saida = texto;
  for (const { regex, para, genero } of REGRAS) {
    saida = saida.replace(regex, (achado, determinante?: string) => {
      if (!genero || !determinante) return comACaixaDoOriginal(achado, para);

      // O determinante vem com o espaço colado (`"a "`, `"Na "`) — o espaço é
      // devolvido como veio para não achatar uma quebra de linha.
      // Podem vir DOIS ("todas as telas") — cada um leva o género novo, senão
      // sobra "todas os ecrãs", que é pior do que não ter mexido.
      const corrigidos = determinante
        .trimEnd()
        .split(/(\\s+)/)
        .map((pedaco) => {
          const par = DETERMINANTES[pedaco.toLowerCase()];
          return par ? comACaixaDoOriginal(pedaco, par[genero === "m" ? 0 : 1]) : pedaco;
        })
        .join("");

      const espaco = determinante.slice(determinante.trimEnd().length);
      const palavra = achado.slice(determinante.length);
      return corrigidos + espaco + comACaixaDoOriginal(palavra, para);
    });
  }
  return saida;
}

/**
 * Percorre o dicionário inteiro e devolve a MESMA forma, com os textos
 * adaptados. O tipo genérico é o que garante que nada se perde no caminho:
 * o que entra `Dictionary`, sai `Dictionary` — o `tsc` continua sendo o
 * guarda da estrutura, exatamente como nos outros idiomas.
 */
export function adaptarParaPortugal<T>(valor: T): T {
  if (typeof valor === "string") return adaptarTexto(valor) as unknown as T;
  if (Array.isArray(valor)) return valor.map((item) => adaptarParaPortugal(item)) as unknown as T;
  if (valor && typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      saida[chave] = adaptarParaPortugal(item);
    }
    return saida as unknown as T;
  }
  return valor;
}
