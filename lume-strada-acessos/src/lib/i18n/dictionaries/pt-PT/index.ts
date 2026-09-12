import { pt, type Dictionary } from "../pt";
import { adaptarParaPortugal } from "./adaptar";

/**
 * O dicionário de Portugal — derivado do de Brasil na primeira vez que
 * alguém pede, e guardado dali em diante.
 *
 * É FUNÇÃO e não constante de propósito: como uma constante, a travessia do
 * dicionário inteiro aconteceria no carregamento do módulo, em toda instância
 * do servidor, inclusive nas que nunca vão servir uma pessoa em Portugal.
 * Assim o custo só existe para quem usa — e acontece uma vez por instância.
 */
let memoria: Dictionary | null = null;

export function ptPT(): Dictionary {
  return (memoria ??= adaptarParaPortugal(pt));
}
