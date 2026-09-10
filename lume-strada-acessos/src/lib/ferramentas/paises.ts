/**
 * Códigos telefônicos de país (DDI), do mundo inteiro.
 *
 * O NOME de cada país NÃO está aqui — e isso é o ponto. Guardar 235 nomes em
 * três idiomas dentro do código seriam 705 strings para manter à mão, e
 * erradas na primeira vez que um país mudasse de nome. O navegador já sabe
 * disso: `Intl.DisplayNames` traduz "BR" para Brasil, Brazil ou Brasil
 * conforme o idioma de quem está olhando, de graça e sempre em dia. O que
 * fica aqui é só o que o navegador NÃO sabe: qual o código telefônico e
 * quantos dígitos tem o número depois dele.
 *
 * `local` é a faixa de dígitos do número SEM o DDI. Só está preenchida onde
 * eu tenho confiança — é com ela que se percebe que alguém colou um número
 * que já vinha com o código do país. Onde está ausente, a faixa vira
 * generosa e a correção automática simplesmente não dispara: num gerador de
 * link, errar corrigindo é muito pior do que não corrigir.
 *
 * Vários países dividem o mesmo DDI (+1 nos Estados Unidos, Canadá e boa
 * parte do Caribe; +7 na Rússia e no Cazaquistão; +44 no Reino Unido e nas
 * ilhas). Isso é correto e está mantido: o que vai no link é o DDI, e a
 * escolha do país serve para a pessoa se achar na lista.
 */

export interface Pais {
  /** ISO 3166-1 alfa-2 — a chave que o `Intl` entende e de onde sai a bandeira. */
  iso: string;
  /** Código telefônico, só dígitos, sem o "+". */
  ddi: string;
  /** Quantos dígitos o número tem sem o DDI. Ausente = não confio o bastante para automatizar nada com isso. */
  local?: readonly [number, number];
}

/** Os que aparecem todo dia por aqui — vão no topo da lista, antes da ordem alfabética. */
export const PAISES_FREQUENTES = ["BR", "PT", "US", "ES", "AR", "MX"];

/** Faixa usada quando o país não tem `local` definido: larga o bastante para nunca "corrigir" um número bom. */
export const FAIXA_LOCAL_PADRAO: readonly [number, number] = [4, 14];

export const PAISES: readonly Pais[] = [
  { iso: "BR", ddi: "55", local: [10, 11] },
  { iso: "AR", ddi: "54", local: [10, 11] },
  { iso: "BO", ddi: "591", local: [8, 8] },
  { iso: "CL", ddi: "56", local: [9, 9] },
  { iso: "CO", ddi: "57", local: [10, 10] },
  { iso: "EC", ddi: "593", local: [9, 9] },
  { iso: "FK", ddi: "500" },
  { iso: "GF", ddi: "594", local: [9, 9] },
  { iso: "GY", ddi: "592", local: [7, 7] },
  { iso: "PE", ddi: "51", local: [9, 9] },
  { iso: "PY", ddi: "595", local: [9, 9] },
  { iso: "SR", ddi: "597", local: [6, 7] },
  { iso: "UY", ddi: "598", local: [8, 8] },
  { iso: "VE", ddi: "58", local: [10, 10] },
  { iso: "BZ", ddi: "501" },
  { iso: "CR", ddi: "506", local: [8, 8] },
  { iso: "SV", ddi: "503", local: [8, 8] },
  { iso: "GT", ddi: "502", local: [8, 8] },
  { iso: "HN", ddi: "504", local: [8, 8] },
  { iso: "NI", ddi: "505", local: [8, 8] },
  { iso: "PA", ddi: "507", local: [8, 8] },
  { iso: "CU", ddi: "53", local: [8, 8] },
  { iso: "DO", ddi: "1", local: [10, 10] },
  { iso: "HT", ddi: "509", local: [8, 8] },
  { iso: "JM", ddi: "1", local: [10, 10] },
  { iso: "PR", ddi: "1", local: [10, 10] },
  { iso: "TT", ddi: "1", local: [10, 10] },
  { iso: "BS", ddi: "1", local: [10, 10] },
  { iso: "BB", ddi: "1", local: [10, 10] },
  { iso: "AG", ddi: "1", local: [10, 10] },
  { iso: "DM", ddi: "1", local: [10, 10] },
  { iso: "GD", ddi: "1", local: [10, 10] },
  { iso: "KN", ddi: "1", local: [10, 10] },
  { iso: "LC", ddi: "1", local: [10, 10] },
  { iso: "VC", ddi: "1", local: [10, 10] },
  { iso: "AI", ddi: "1", local: [10, 10] },
  { iso: "AW", ddi: "297", local: [7, 7] },
  { iso: "BM", ddi: "1", local: [10, 10] },
  { iso: "VG", ddi: "1", local: [10, 10] },
  { iso: "KY", ddi: "1", local: [10, 10] },
  { iso: "CW", ddi: "599" },
  { iso: "GP", ddi: "590", local: [9, 9] },
  { iso: "MQ", ddi: "596", local: [9, 9] },
  { iso: "MS", ddi: "1", local: [10, 10] },
  { iso: "TC", ddi: "1", local: [10, 10] },
  { iso: "VI", ddi: "1", local: [10, 10] },
  { iso: "US", ddi: "1", local: [10, 10] },
  { iso: "CA", ddi: "1", local: [10, 10] },
  { iso: "MX", ddi: "52", local: [10, 10] },
  { iso: "GL", ddi: "299", local: [6, 6] },
  { iso: "PM", ddi: "508", local: [6, 6] },
  { iso: "AL", ddi: "355" },
  { iso: "AD", ddi: "376", local: [6, 6] },
  { iso: "AT", ddi: "43" },
  { iso: "BY", ddi: "375", local: [9, 9] },
  { iso: "BE", ddi: "32", local: [8, 9] },
  { iso: "BA", ddi: "387", local: [8, 8] },
  { iso: "BG", ddi: "359", local: [8, 9] },
  { iso: "HR", ddi: "385", local: [8, 9] },
  { iso: "CY", ddi: "357", local: [8, 8] },
  { iso: "CZ", ddi: "420", local: [9, 9] },
  { iso: "DK", ddi: "45", local: [8, 8] },
  { iso: "EE", ddi: "372", local: [7, 8] },
  { iso: "FO", ddi: "298", local: [6, 6] },
  { iso: "FI", ddi: "358" },
  { iso: "FR", ddi: "33", local: [9, 9] },
  { iso: "GE", ddi: "995", local: [9, 9] },
  { iso: "DE", ddi: "49", local: [10, 11] },
  { iso: "GI", ddi: "350", local: [8, 8] },
  { iso: "GR", ddi: "30", local: [10, 10] },
  { iso: "HU", ddi: "36", local: [9, 9] },
  { iso: "IS", ddi: "354", local: [7, 7] },
  { iso: "IE", ddi: "353", local: [9, 9] },
  { iso: "IT", ddi: "39", local: [9, 10] },
  { iso: "XK", ddi: "383" },
  { iso: "LV", ddi: "371", local: [8, 8] },
  { iso: "LI", ddi: "423", local: [7, 7] },
  { iso: "LT", ddi: "370", local: [8, 8] },
  { iso: "LU", ddi: "352" },
  { iso: "MT", ddi: "356", local: [8, 8] },
  { iso: "MD", ddi: "373", local: [8, 8] },
  { iso: "MC", ddi: "377" },
  { iso: "ME", ddi: "382", local: [8, 8] },
  { iso: "NL", ddi: "31", local: [9, 9] },
  { iso: "MK", ddi: "389", local: [8, 8] },
  { iso: "NO", ddi: "47", local: [8, 8] },
  { iso: "PL", ddi: "48", local: [9, 9] },
  { iso: "PT", ddi: "351", local: [9, 9] },
  { iso: "RO", ddi: "40", local: [9, 9] },
  { iso: "RU", ddi: "7", local: [10, 10] },
  { iso: "SM", ddi: "378" },
  { iso: "RS", ddi: "381", local: [8, 9] },
  { iso: "SK", ddi: "421", local: [9, 9] },
  { iso: "SI", ddi: "386", local: [8, 8] },
  { iso: "ES", ddi: "34", local: [9, 9] },
  { iso: "SE", ddi: "46" },
  { iso: "CH", ddi: "41", local: [9, 9] },
  { iso: "TR", ddi: "90", local: [10, 10] },
  { iso: "UA", ddi: "380", local: [9, 9] },
  { iso: "GB", ddi: "44", local: [9, 10] },
  { iso: "VA", ddi: "39", local: [9, 10] },
  { iso: "JE", ddi: "44", local: [9, 10] },
  { iso: "GG", ddi: "44", local: [9, 10] },
  { iso: "IM", ddi: "44", local: [9, 10] },
  { iso: "AX", ddi: "358" },
  { iso: "DZ", ddi: "213", local: [9, 9] },
  { iso: "AO", ddi: "244", local: [9, 9] },
  { iso: "BJ", ddi: "229" },
  { iso: "BW", ddi: "267", local: [7, 8] },
  { iso: "BF", ddi: "226", local: [8, 8] },
  { iso: "BI", ddi: "257", local: [8, 8] },
  { iso: "CV", ddi: "238", local: [7, 7] },
  { iso: "CM", ddi: "237", local: [9, 9] },
  { iso: "CF", ddi: "236", local: [8, 8] },
  { iso: "TD", ddi: "235", local: [8, 8] },
  { iso: "KM", ddi: "269", local: [7, 7] },
  { iso: "CG", ddi: "242", local: [9, 9] },
  { iso: "CD", ddi: "243", local: [9, 9] },
  { iso: "DJ", ddi: "253", local: [8, 8] },
  { iso: "EG", ddi: "20", local: [10, 10] },
  { iso: "GQ", ddi: "240", local: [9, 9] },
  { iso: "ER", ddi: "291", local: [7, 7] },
  { iso: "SZ", ddi: "268", local: [8, 8] },
  { iso: "ET", ddi: "251", local: [9, 9] },
  { iso: "GA", ddi: "241" },
  { iso: "GM", ddi: "220", local: [7, 7] },
  { iso: "GH", ddi: "233", local: [9, 9] },
  { iso: "GN", ddi: "224", local: [9, 9] },
  { iso: "GW", ddi: "245", local: [9, 9] },
  { iso: "CI", ddi: "225", local: [10, 10] },
  { iso: "KE", ddi: "254", local: [9, 9] },
  { iso: "LS", ddi: "266", local: [8, 8] },
  { iso: "LR", ddi: "231" },
  { iso: "LY", ddi: "218", local: [9, 9] },
  { iso: "MG", ddi: "261", local: [9, 9] },
  { iso: "MW", ddi: "265", local: [9, 9] },
  { iso: "ML", ddi: "223", local: [8, 8] },
  { iso: "MR", ddi: "222", local: [8, 8] },
  { iso: "MU", ddi: "230", local: [8, 8] },
  { iso: "YT", ddi: "262", local: [9, 9] },
  { iso: "MA", ddi: "212", local: [9, 9] },
  { iso: "MZ", ddi: "258", local: [9, 9] },
  { iso: "NA", ddi: "264", local: [9, 9] },
  { iso: "NE", ddi: "227", local: [8, 8] },
  { iso: "NG", ddi: "234", local: [10, 10] },
  { iso: "RE", ddi: "262", local: [9, 9] },
  { iso: "RW", ddi: "250", local: [9, 9] },
  { iso: "ST", ddi: "239", local: [7, 7] },
  { iso: "SN", ddi: "221", local: [9, 9] },
  { iso: "SC", ddi: "248", local: [7, 7] },
  { iso: "SL", ddi: "232", local: [8, 8] },
  { iso: "SO", ddi: "252" },
  { iso: "ZA", ddi: "27", local: [9, 9] },
  { iso: "SS", ddi: "211", local: [9, 9] },
  { iso: "SD", ddi: "249", local: [9, 9] },
  { iso: "TZ", ddi: "255", local: [9, 9] },
  { iso: "TG", ddi: "228", local: [8, 8] },
  { iso: "TN", ddi: "216", local: [8, 8] },
  { iso: "UG", ddi: "256", local: [9, 9] },
  { iso: "EH", ddi: "212", local: [9, 9] },
  { iso: "ZM", ddi: "260", local: [9, 9] },
  { iso: "ZW", ddi: "263", local: [9, 9] },
  { iso: "SH", ddi: "290" },
  { iso: "IO", ddi: "246" },
  { iso: "AE", ddi: "971", local: [9, 9] },
  { iso: "BH", ddi: "973", local: [8, 8] },
  { iso: "IR", ddi: "98", local: [10, 10] },
  { iso: "IQ", ddi: "964", local: [10, 10] },
  { iso: "IL", ddi: "972", local: [9, 9] },
  { iso: "JO", ddi: "962", local: [9, 9] },
  { iso: "KW", ddi: "965", local: [8, 8] },
  { iso: "LB", ddi: "961", local: [7, 8] },
  { iso: "OM", ddi: "968", local: [8, 8] },
  { iso: "PS", ddi: "970", local: [9, 9] },
  { iso: "QA", ddi: "974", local: [8, 8] },
  { iso: "SA", ddi: "966", local: [9, 9] },
  { iso: "SY", ddi: "963", local: [9, 9] },
  { iso: "YE", ddi: "967", local: [9, 9] },
  { iso: "AF", ddi: "93", local: [9, 9] },
  { iso: "AM", ddi: "374", local: [8, 8] },
  { iso: "AZ", ddi: "994", local: [9, 9] },
  { iso: "BD", ddi: "880", local: [10, 10] },
  { iso: "BT", ddi: "975", local: [8, 8] },
  { iso: "BN", ddi: "673", local: [7, 7] },
  { iso: "KH", ddi: "855", local: [8, 9] },
  { iso: "CN", ddi: "86", local: [11, 11] },
  { iso: "HK", ddi: "852", local: [8, 8] },
  { iso: "IN", ddi: "91", local: [10, 10] },
  { iso: "ID", ddi: "62" },
  { iso: "JP", ddi: "81", local: [10, 10] },
  { iso: "KZ", ddi: "7", local: [10, 10] },
  { iso: "KP", ddi: "850" },
  { iso: "KR", ddi: "82", local: [9, 10] },
  { iso: "KG", ddi: "996", local: [9, 9] },
  { iso: "LA", ddi: "856" },
  { iso: "MO", ddi: "853", local: [8, 8] },
  { iso: "MY", ddi: "60", local: [9, 10] },
  { iso: "MV", ddi: "960", local: [7, 7] },
  { iso: "MN", ddi: "976", local: [8, 8] },
  { iso: "MM", ddi: "95" },
  { iso: "NP", ddi: "977", local: [10, 10] },
  { iso: "PK", ddi: "92", local: [10, 10] },
  { iso: "PH", ddi: "63", local: [10, 10] },
  { iso: "SG", ddi: "65", local: [8, 8] },
  { iso: "LK", ddi: "94", local: [9, 9] },
  { iso: "TW", ddi: "886", local: [9, 9] },
  { iso: "TJ", ddi: "992", local: [9, 9] },
  { iso: "TH", ddi: "66", local: [9, 9] },
  { iso: "TL", ddi: "670", local: [8, 8] },
  { iso: "TM", ddi: "993", local: [8, 8] },
  { iso: "UZ", ddi: "998", local: [9, 9] },
  { iso: "VN", ddi: "84", local: [9, 10] },
  { iso: "AU", ddi: "61", local: [9, 9] },
  { iso: "CK", ddi: "682" },
  { iso: "FJ", ddi: "679", local: [7, 7] },
  { iso: "PF", ddi: "689", local: [8, 8] },
  { iso: "GU", ddi: "1", local: [10, 10] },
  { iso: "KI", ddi: "686" },
  { iso: "MH", ddi: "692", local: [7, 7] },
  { iso: "FM", ddi: "691", local: [7, 7] },
  { iso: "NC", ddi: "687", local: [6, 6] },
  { iso: "NZ", ddi: "64" },
  { iso: "NU", ddi: "683" },
  { iso: "NF", ddi: "672" },
  { iso: "MP", ddi: "1", local: [10, 10] },
  { iso: "PW", ddi: "680", local: [7, 7] },
  { iso: "PG", ddi: "675", local: [8, 8] },
  { iso: "WS", ddi: "685" },
  { iso: "SB", ddi: "677" },
  { iso: "TK", ddi: "690" },
  { iso: "TO", ddi: "676" },
  { iso: "TV", ddi: "688" },
  { iso: "VU", ddi: "678" },
  { iso: "WF", ddi: "681" },
  { iso: "AS", ddi: "1", local: [10, 10] },];

const PORTAL: ReadonlyMap<string, Pais> = new Map(PAISES.map((p) => [p.iso, p]));

export function paisPorIso(iso: string): Pais | undefined {
  return PORTAL.get(iso);
}

/**
 * A faixa de dígitos de um DDI.
 *
 * Quando vários países dividem o código (+1, +7, +44), a faixa devolvida é a
 * UNIÃO das faixas deles. Tem que ser: uma faixa estreita demais faria a
 * checagem de "código repetido" mexer num número canadense achando que era
 * americano. Se qualquer um dos países que dividem o código não tem faixa
 * definida, o padrão largo vence e nada é corrigido.
 */
export function faixaLocalDoDdi(ddi: string): readonly [number, number] {
  const doCodigo = PAISES.filter((p) => p.ddi === ddi);
  if (doCodigo.length === 0 || doCodigo.some((p) => !p.local)) return FAIXA_LOCAL_PADRAO;
  const min = Math.min(...doCodigo.map((p) => p.local![0]));
  const max = Math.max(...doCodigo.map((p) => p.local![1]));
  return [min, max];
}

/**
 * A bandeira como emoji, montada a partir das duas letras do ISO.
 *
 * Cada letra vira o "indicador regional" correspondente (A = U+1F1E6), e o
 * par forma a bandeira. Em Windows não existe fonte de bandeiras: aparecem
 * as duas letras, "BR", que continua dizendo o que precisa dizer. Por isso a
 * bandeira nunca é a única informação na lista — o nome do país está sempre
 * ao lado.
 */
export function bandeiraDe(iso: string): string {
  if (iso.length !== 2) return "";
  return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const CACHE_DE_NOMES = new Map<string, Intl.DisplayNames | null>();

/**
 * O nome do país no idioma de quem está lendo.
 *
 * `Intl.DisplayNames` é caro de construir e barato de usar, então fica um por
 * idioma em cache. Se o navegador não tiver a API (ou não conhecer o código),
 * o retorno é o próprio ISO — feio, mas nunca vazio: uma linha em branco na
 * lista de países seria pior do que "XK".
 */
export function nomeDoPais(iso: string, locale: string): string {
  let formatador = CACHE_DE_NOMES.get(locale);
  if (formatador === undefined) {
    try {
      formatador = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      formatador = null;
    }
    CACHE_DE_NOMES.set(locale, formatador);
  }
  try {
    return formatador?.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

/**
 * A lista pronta para a tela: frequentes primeiro, o resto em ordem
 * alfabética do idioma de quem está lendo — "Alemanha" e "Germany" não ficam
 * no mesmo lugar do alfabeto, então ordenar uma vez no código e servir a
 * todos daria uma lista fora de ordem em dois dos três idiomas.
 */
export function paisesOrdenados(locale: string): { pais: Pais; nome: string; frequente: boolean }[] {
  const colador = new Intl.Collator(locale);
  const itens = PAISES.map((pais) => ({
    pais,
    nome: nomeDoPais(pais.iso, locale),
    frequente: PAISES_FREQUENTES.includes(pais.iso),
  }));
  return itens.sort((a, b) => {
    if (a.frequente !== b.frequente) return a.frequente ? -1 : 1;
    if (a.frequente && b.frequente) return PAISES_FREQUENTES.indexOf(a.pais.iso) - PAISES_FREQUENTES.indexOf(b.pais.iso);
    return colador.compare(a.nome, b.nome);
  });
}

/** Filtro da busca: casa por nome, por código ISO ou pelos dígitos do DDI (com ou sem "+"). */
export function combinaComBusca(item: { pais: Pais; nome: string }, busca: string): boolean {
  const alvo = busca.trim().toLowerCase().replace(/^\+/, "");
  if (!alvo) return true;
  const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const digitos = alvo.replace(/\D/g, "");
  return (
    semAcento(item.nome).includes(semAcento(alvo)) ||
    // O nome em inglês também conta, mesmo com a tela em português: "germany"
    // é digitado tanto quanto "alemanha", e quem não acha o país desiste.
    semAcento(nomeDoPais(item.pais.iso, "en")).includes(semAcento(alvo)) ||
    item.pais.iso.toLowerCase() === alvo ||
    (digitos !== "" && item.pais.ddi.startsWith(digitos))
  );
}
