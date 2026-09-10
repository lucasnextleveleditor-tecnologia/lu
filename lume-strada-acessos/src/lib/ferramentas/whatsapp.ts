/**
 * Gerador de link de WhatsApp — a parte que não é tela.
 *
 * Fica separado do componente porque é a parte que dá pra conferir sozinha:
 * o link é uma string montada por regras chatas (só dígitos, DDI na frente,
 * zero do DDD fora, mensagem codificada) e cada uma dessas regras já foi
 * motivo de link quebrado em algum lugar do mundo.
 *
 * O endereço usado é `wa.me`, o oficial da Meta. `api.whatsapp.com/send` faz
 * a mesma coisa, mas passa por uma tela intermediária no celular; `wa.me`
 * abre a conversa direto.
 */

import { faixaLocalDoDdi } from "./paises";

export type AvisoDoNumero = "zeroRemovido" | "ddiRepetido" | "possivelNonoDigito" | "curto" | "longo";

export interface NumeroAnalisado {
  /** Só dígitos, DDI incluído — é o que vai no link. */
  digitos: string;
  /** Dá pra gerar um link com isto? */
  valido: boolean;
  avisos: AvisoDoNumero[];
}

const soDigitos = (t: string) => t.replace(/\D/g, "");

/**
 * Limpa e confere o número.
 *
 * Duas armadilhas brasileiras tratadas aqui, as duas por experiência de
 * link que não abre:
 *
 * 1. O ZERO do DDD. Muita gente escreve "(011) 99999-9999" ou dita
 *    "zero onze". Esse zero é de discagem interurbana dentro do Brasil e não
 *    existe em número internacional — mantido, o WhatsApp não acha ninguém.
 *
 * 2. O NONO DÍGITO. Celular no Brasil tem 9 dígitos depois do DDD desde
 *    2016; agenda antiga ainda guarda com 8. Aqui isso vira AVISO e não
 *    correção automática: fixo comercial tem 8 dígitos e é legítimo — chutar
 *    um 9 na frente de um fixo quebraria um número que estava certo.
 */
export function analisarNumero(ddi: string, numero: string): NumeroAnalisado {
  const codigo = soDigitos(ddi);
  let local = soDigitos(numero);
  const avisos: AvisoDoNumero[] = [];

  if (local.startsWith("0")) {
    local = local.replace(/^0+/, "");
    avisos.push("zeroRemovido");
  }

  // DDI digitado DUAS vezes: a pessoa escolheu Brasil na lista e colou um
  // número que já vinha com o +55. Sem tratar, o link sai com 5555... e
  // parece perfeitamente válido — falha silenciosa, a pior de todas aqui.
  //
  // A checagem não é "começa com o DDI", porque isso sozinho erraria feio:
  // DDD 55 existe (Rio Grande do Sul), e um celular de lá começa com 55 de
  // direito. O que decide é o TAMANHO — só remove quando o número está longo
  // demais para o país E fica do tamanho certo depois de tirar o DDI.
  const [minLocal, maxLocal] = faixaLocalDoDdi(codigo);
  if (local.length > maxLocal && local.startsWith(codigo)) {
    const semDdi = local.slice(codigo.length);
    if (semDdi.length >= minLocal && semDdi.length <= maxLocal) {
      local = semDdi;
      avisos.push("ddiRepetido");
    }
  }

  // 10 dígitos no Brasil = DDD (2) + 8. Pode ser fixo (certo) ou celular
  // antigo (errado) — quem sabe é quem está digitando.
  if (codigo === "55" && local.length === 10) avisos.push("possivelNonoDigito");

  const digitos = codigo + local;
  // E.164: no máximo 15 dígitos no mundo todo, contando o DDI. O piso de 8 é
  // folgado de propósito — há países com número curto, e recusar um número
  // válido é pior do que gerar um link que a pessoa testa e vê que não abre.
  if (local.length > 0 && digitos.length < 8) avisos.push("curto");
  if (digitos.length > 15) avisos.push("longo");

  return {
    digitos,
    valido: local.length >= 6 && digitos.length >= 8 && digitos.length <= 15,
    avisos,
  };
}

/**
 * O link.
 *
 * `encodeURIComponent` e não `encodeURI`: o texto pode conter `&`, `#` e `+`,
 * que em URL significam outra coisa. Sem codificar, uma mensagem com "R$ 500
 * & entrega" chega cortada no "&" — e o pedaço perdido vira parâmetro de URL.
 */
export function montarLinkWhatsapp(digitos: string, mensagem: string): string {
  const texto = mensagem.trim();
  return `https://wa.me/${digitos}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}

/** "(11) 99999-9999" / "(11) 3333-4444" — só para MOSTRAR; o link usa os dígitos crus. */
export function formatarNumeroBr(local: string): string {
  const d = soDigitos(local);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}
