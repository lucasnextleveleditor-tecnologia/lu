/**
 * Troca `{chave}` pelos valores dados.
 *
 * Existe porque arquivo de dicionário só pode conter dado puro (ver a trava
 * de serialização em `i18n/dictionaries/pt/index.ts`): uma frase com número
 * no meio precisa viajar como `"Baixando {n} de {total}"` e ser resolvida em
 * quem renderiza. Chave sem valor correspondente passa intacta — melhor
 * mostrar `{total}` na tela e alguém notar do que sumir com o número.
 */
export function substituir(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (inteiro, chave: string) =>
    chave in valores ? String(valores[chave]) : inteiro
  );
}
