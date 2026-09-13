import { estadoDaCaptura, type CapturaRow, type EquipeEventoRow, type BlocoRow } from "@/lib/types/eventos";

/**
 * O BALANÇO — o que o Fechamento mostra.
 *
 * Três perguntas, e é para responder as três que o módulo existe:
 *
 *   EXISTE      o que foi captado, POR DESTINATÁRIO. Por destinatário e não
 *               por ambiente porque é assim que o material sai daqui: três
 *               ativações no mesmo palco podem ser de três patrocinadores, e
 *               cada um recebe a sua pasta.
 *
 *   NÃO EXISTE  o que não rolou, com o motivo. Esta é a coluna desconfortável,
 *               e é a mais importante: é ela que troca "por que não tem foto
 *               disso?" na segunda-feira por uma linha escrita no sábado, com
 *               hora e autor. Some aqui tanto o que alguém marcou como "não
 *               rolou" quanto o que a janela fechou em cima.
 *
 *   CONTA       previsto × realizado, já somada da escala e do ponto. Ninguém
 *               abre calculadora no domingo.
 *
 * Função pura: recebe as linhas, devolve números. Sem banco e sem React, então
 * dá para conferir a conta sem abrir a tela.
 */

export interface GrupoDoBalanco {
  destinatario: string;
  clienteId: string | null;
  itens: CapturaRow[];
}

export interface ContaDoEvento {
  /** Soma dos cachês combinados — o que estava na escala. */
  previsto: number;
  /** Cachês + extras do dia — o que a produtora vai pagar de verdade. */
  realizado: number;
  /** Quanto o dia custou a mais do que o combinado. Negativo quando sobrou. */
  diferenca: number;
  /** Horas de ponto somadas, quando houve check-in e check-out. */
  horas: number;
  pessoas: number;
  /** Atraso acumulado da programação, em minutos. */
  atrasoMin: number;
}

export interface Balanco {
  existe: GrupoDoBalanco[];
  naoExiste: CapturaRow[];
  conta: ContaDoEvento;
  totalCapturas: number;
  totalCaptadas: number;
}

const HORA = 3_600_000;

export function montarBalanco(
  capturas: readonly CapturaRow[],
  equipe: readonly EquipeEventoRow[],
  blocos: readonly BlocoRow[],
  agoraISO: string,
  semDestinatario: string
): Balanco {
  const captadas = capturas.filter((c) => c.status === "captado");

  // Agrupa por destinatário; o cliente do cadastro manda quando existe, porque
  // é ele que leva a entrega para a pasta certa lá na Produção.
  const grupos = new Map<string, GrupoDoBalanco>();
  for (const c of captadas) {
    const chave = c.cliente_id ?? c.destinatario ?? "";
    const grupo = grupos.get(chave) ?? {
      destinatario: c.destinatario ?? semDestinatario,
      clienteId: c.cliente_id,
      itens: [],
    };
    grupo.itens.push(c);
    grupos.set(chave, grupo);
  }

  // "Não existe" é quem alguém marcou como não rolou MAIS quem a janela pegou.
  // Os dois contam igual no domingo: o material não está lá.
  const naoExiste = capturas.filter((c) => {
    const estado = estadoDaCaptura(c, agoraISO);
    return estado === "nao_rolou" || estado === "perdido";
  });

  const previsto = equipe.reduce((soma, p) => soma + Number(p.cache ?? 0), 0);
  const extras = equipe.reduce((soma, p) => soma + Number(p.extras ?? 0), 0);
  const horas = equipe.reduce((soma, p) => {
    if (!p.checkin_em || !p.checkout_em) return soma;
    const dif = new Date(p.checkout_em).getTime() - new Date(p.checkin_em).getTime();
    return soma + Math.max(0, dif) / HORA;
  }, 0);

  // O atraso do evento é o do bloco que mais andou, não a soma de todos: dez
  // blocos encadeados que andaram 30 minutos juntos atrasaram 30, não 300.
  const atrasoMin = blocos.reduce((maior, b) => Math.max(maior, b.atraso_min ?? 0), 0);

  return {
    existe: [...grupos.values()].sort((a, b) => b.itens.length - a.itens.length),
    naoExiste,
    conta: {
      previsto,
      realizado: previsto + extras,
      diferenca: extras,
      horas,
      pessoas: equipe.length,
      atrasoMin,
    },
    totalCapturas: capturas.length,
    totalCaptadas: captadas.length,
  };
}
