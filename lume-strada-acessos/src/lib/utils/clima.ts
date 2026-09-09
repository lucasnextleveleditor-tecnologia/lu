import "server-only";

/**
 * Clima e sol da diária, sem cadastro e sem chave de API.
 *
 * Usa o Open-Meteo (open-meteo.com), que é aberto e não exige credencial —
 * decisão deliberada: uma chave a mais seria uma variável de ambiente a mais
 * para configurar em cada deploy, e um segredo a mais para vazar, tudo isso
 * para um dado que é público e não sensível.
 *
 * Duas chamadas, nesta ordem:
 *   1. geocodificar o endereço da locação -> latitude/longitude;
 *   2. buscar a previsão daquele ponto naquele dia.
 *
 * NUNCA lança: se a rede falhar, se o endereço não for encontrado ou se a
 * data estiver fora da janela de previsão (o Open-Meteo cobre ~16 dias à
 * frente), devolve `null` e a folha simplesmente não mostra o bloco de
 * clima. Uma ordem do dia tem que imprimir de qualquer jeito — ela é o
 * documento que a equipe leva para o set.
 */

const TIMEOUT_MS = 6000;

async function buscarComTimeout(url: string): Promise<Response | null> {
  try {
    const controlador = new AbortController();
    const t = setTimeout(() => controlador.abort(), TIMEOUT_MS);
    const resposta = await fetch(url, { signal: controlador.signal, cache: "no-store" });
    clearTimeout(t);
    return resposta.ok ? resposta : null;
  } catch {
    return null;
  }
}

export interface Coordenada {
  latitude: number;
  longitude: number;
  rotulo: string;
}

export async function geocodificar(endereco: string): Promise<Coordenada | null> {
  const termo = endereco.trim();
  if (termo.length < 3) return null;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(termo)}&count=1&language=pt&format=json`;
  const resposta = await buscarComTimeout(url);
  if (!resposta) return null;

  try {
    const dados = (await resposta.json()) as {
      results?: { latitude: number; longitude: number; name: string; admin1?: string; country_code?: string }[];
    };
    const primeiro = dados.results?.[0];
    if (!primeiro) return null;
    const partes = [primeiro.name, primeiro.admin1, primeiro.country_code].filter(Boolean);
    return { latitude: primeiro.latitude, longitude: primeiro.longitude, rotulo: partes.join(", ") };
  } catch {
    return null;
  }
}

export interface PrevisaoDia {
  resumo: string;
  max: number;
  min: number;
  chuvaMm: number;
  nascerDoSol: string | null;
  porDoSol: string | null;
}

/**
 * Códigos WMO -> uma frase curta em português. A tabela oficial tem ~28
 * códigos; aqui eles são agrupados no que muda a decisão de quem grava —
 * "vai chover?", "vai estar aberto?" — em vez de reproduzir a taxonomia
 * meteorológica inteira, que ninguém no set vai ler.
 */
function descreverTempo(codigo: number): string {
  if (codigo === 0) return "Céu limpo";
  if (codigo <= 2) return "Parcialmente nublado";
  if (codigo === 3) return "Nublado";
  if (codigo <= 48) return "Névoa";
  if (codigo <= 57) return "Garoa";
  if (codigo <= 67) return "Chuva";
  if (codigo <= 77) return "Neve";
  if (codigo <= 82) return "Pancadas de chuva";
  if (codigo <= 86) return "Pancadas de neve";
  return "Tempestade";
}

export async function buscarPrevisao(lat: number, lon: number, dataISO: string): Promise<PrevisaoDia | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset` +
    `&timezone=America%2FSao_Paulo&start_date=${dataISO}&end_date=${dataISO}`;

  const resposta = await buscarComTimeout(url);
  if (!resposta) return null;

  try {
    const dados = (await resposta.json()) as {
      daily?: {
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_sum?: number[];
        sunrise?: string[];
        sunset?: string[];
      };
    };
    const d = dados.daily;
    if (!d?.weather_code?.length) return null;

    // O Open-Meteo devolve "2026-09-10T06:12" — a folha só quer "06:12".
    const soHora = (iso: string | undefined) => (iso ? iso.slice(11, 16) : null);

    return {
      resumo: descreverTempo(d.weather_code[0] ?? 0),
      max: Math.round(d.temperature_2m_max?.[0] ?? 0),
      min: Math.round(d.temperature_2m_min?.[0] ?? 0),
      chuvaMm: d.precipitation_sum?.[0] ?? 0,
      nascerDoSol: soHora(d.sunrise?.[0]),
      porDoSol: soHora(d.sunset?.[0]),
    };
  } catch {
    return null;
  }
}
