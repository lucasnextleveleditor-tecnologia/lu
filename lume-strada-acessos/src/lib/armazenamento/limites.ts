/**
 * Quanto espaço cada empresa tem, por padrão.
 *
 * Fica num arquivo próprio (e não em `uso.ts`, que é `server-only`) porque o
 * número é lido nos dois lados: o servidor calcula a barra com ele, e o
 * modal de empresa no Super Admin mostra ele como valor de referência.
 *
 * 5 GB e não 10 GB, e a razão é a soma de três coisas construídas depois de
 * o número original ter sido escolhido: vídeo agora entra por link e não
 * ocupa nada, existe um compressor dentro do sistema, e existe um backup que
 * baixa o acervo inteiro organizado por pasta. Encher deixou de ser um beco
 * sem saída — virou rotina —, então o teto pode ser menor sem apertar
 * ninguém. Na prática o que sobra guardado aqui é PDF, comprovante e foto:
 * 5 GB é muito mais do que uma produtora consome em um ano assim.
 *
 * O custo nunca foi o motivo: 10 GB cheios custam cerca de US$ 0,21/mês de
 * armazenamento. O que o limite protege é o acervo virar depósito de
 * material bruto, e a cota de DOWNLOAD (egress), que o backup consome de
 * verdade — cada cópia baixada é o acervo inteiro passando pela rede.
 *
 * Empresa por empresa, o valor vem de `companies.limite_armazenamento_mb`
 * (editável no Super Admin). Este número é só o que vale quando lá está
 * vazio.
 */
export const LIMITE_PADRAO_MB = 5 * 1024;
