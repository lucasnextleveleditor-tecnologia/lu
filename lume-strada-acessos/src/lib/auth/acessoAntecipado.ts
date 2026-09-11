/**
 * Quem enxerga um módulo ANTES de ele ficar pronto.
 *
 * O módulo de Eventos vai ficar meses em construção, e durante esse tempo ele
 * precisa estar em duas situações ao mesmo tempo: **visível** para todo mundo,
 * como promessa ("em breve vai ter isso"), e **utilizável** só por quem está
 * construindo. Sem isso, ou o módulo fica escondido até o último dia — e
 * ninguém sabe que vem —, ou uma agência pagante abre uma tela pela metade e
 * conclui que o sistema é frágil.
 *
 * A lista é de E-MAIL e não de empresa de propósito: é uma liberação para uma
 * PESSOA, a que está construindo. Se um dia virar um recurso liberado por
 * cliente (beta fechado, por exemplo), o certo é sair daqui e virar coluna em
 * `companies` — este arquivo é o lugar de uma coisa temporária, e existir num
 * lugar só é o que torna essa troca barata.
 *
 * A porta de verdade é sempre no SERVIDOR: `page.tsx` decide o que renderizar
 * antes de mandar qualquer coisa para o navegador. O menu usa o mesmo cálculo
 * só para escolher se mostra a etiqueta "Em breve" ao lado do item — nunca
 * como autorização.
 */
// Os dois e-mails sao da MESMA pessoa: a conta de super admin e a conta que
// trabalha dentro de uma agencia. Como a checagem e por e-mail, as duas
// precisam estar aqui -- estar logado como super admin nao faz o painel da
// agencia reconhecer a pessoa.
const EMAILS_ACESSO_ANTECIPADO: ReadonlySet<string> = new Set([
  "suportelucasfilmmaker@gmail.com",
  "lucasmelo748@icloud.com",
]);

export function temAcessoAntecipado(email: string | null | undefined): boolean {
  if (!email) return false;
  return EMAILS_ACESSO_ANTECIPADO.has(email.trim().toLowerCase());
}
