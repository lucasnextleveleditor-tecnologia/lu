import "server-only";

/**
 * De onde veio quem assinou, em palavras.
 *
 * O IP sozinho não prova lugar nenhum para quem lê o documento: "189.4.12.7"
 * não é uma cidade. A leitura do IP em cidade/estado/país é feita NO ATO da
 * assinatura e guardada — depois não dá mais para refazer, porque o mesmo IP
 * já vai estar com outra pessoa.
 *
 * É aproximada por natureza (o IP entrega a região da operadora, não a rua),
 * e é por isso que o manifesto imprime o IP ao lado: o endereço é o dado
 * duro, o local é a leitura dele.
 *
 * Falhar aqui NÃO pode derrubar uma assinatura. Timeout curto, e qualquer
 * problema vira `null` — o documento continua com data, hora, IP e navegador.
 */

/** Rede local não tem localização pública — nem adianta perguntar. */
function ehPrivado(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown") return true;
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true;
  const bloco = /^172\.(\d{1,3})\./.exec(ip);
  if (bloco) {
    const n = Number(bloco[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

interface RespostaIp {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
}

export async function localizarIp(ip: string | null): Promise<string | null> {
  if (!ip || ehPrivado(ip)) return null;

  try {
    const resposta = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region,country`, {
      // Dois segundos e meio: quem está assinando espera esta requisição.
      // Passou disso, o local não vale o atraso.
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!resposta.ok) return null;

    const dados = (await resposta.json()) as RespostaIp;
    if (!dados?.success) return null;

    const limpo = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const cidade = limpo(dados.city);
    const regiao = limpo(dados.region);
    const pais = limpo(dados.country);

    const lugar = [cidade, regiao].filter(Boolean).join(" - ");
    const texto = [lugar, pais].filter(Boolean).join(", ");
    return texto ? texto.slice(0, 120) : null;
  } catch {
    return null;
  }
}
