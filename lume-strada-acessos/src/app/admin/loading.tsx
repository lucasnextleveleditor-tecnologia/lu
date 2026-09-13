import { EsqueletoDeCabecalho, EsqueletoDeTiles, EsqueletoDeLista } from "@/components/ui/Esqueleto";

/**
 * O QUE A PESSOA VÊ ENTRE O CLIQUE E A TELA.
 *
 * Sem este arquivo, clicar num item do menu não muda **nada** na tela até o
 * servidor terminar de montar a página inteira — e as páginas deste painel
 * fazem de seis a dez consultas cada uma. Do lado de fora, meio segundo de
 * tela parada depois de um clique não se lê como "está carregando": se lê como
 * "não funcionou", e a pessoa clica de novo.
 *
 * Este `loading.tsx` mora na raiz de `/admin`, então vale para TODA rota do
 * painel que não tenha o seu próprio. A barra lateral não pisca: o
 * `layout.tsx` fica montado e só a área de conteúdo troca.
 *
 * E tem um ganho que não aparece no nome do arquivo: o `<Link>` do Next só
 * consegue pré-carregar uma rota dinâmica **até a fronteira de loading**.
 * Sem `loading.tsx` não há fronteira, e nada é pré-carregado; com ele, passar
 * o mouse pelo menu já adianta o trabalho.
 *
 * O arquivo é de propósito síncrono e sem dicionário: qualquer `await` aqui
 * dentro adiaria justamente a coisa que precisa aparecer no mesmo instante do
 * clique. Por isso também não tem texto — um "Carregando…" precisaria do
 * idioma da pessoa, e o idioma vem do banco.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <EsqueletoDeCabecalho />
      <EsqueletoDeTiles />
      <EsqueletoDeLista />
    </div>
  );
}
