/**
 * Copia o worker do pdf.js para `public/`, na versão exata que está
 * instalada.
 *
 * Roda no `postinstall`, então acontece sozinho tanto aqui quanto na Vercel,
 * SEMPRE depois de o npm resolver as dependências. É o que impede o erro que
 * já aconteceu uma vez: o arquivo em `public/` era de uma versão e a
 * biblioteca instalada de outra, e o pdf.js recusava tudo com
 * "The API version X does not match the Worker version Y" — um erro que só
 * aparece em produção, porque no computador de quem programou as duas versões
 * batiam.
 *
 * O worker não pode ser importado pelo empacotador (ver `PaginaPdf.tsx`), daí
 * ele precisar existir como arquivo estático; e como precisa existir como
 * arquivo, precisa de alguém que o mantenha em dia. É este script.
 *
 * O arquivo continua versionado, mas como CÓPIA DESCARTÁVEL: este script o
 * sobrescreve a cada instalação, então o que vale é sempre a versão que o
 * npm resolveu, nunca a que alguém commitou meses atrás. Junto com a versão
 * fixa no package.json (sem `^`), são duas travas para o mesmo erro.
 *
 * Falhar aqui NÃO derruba a instalação: um `npm install` que quebra por causa
 * de uma cópia de arquivo é pior do que o próprio problema. O aviso fica no
 * log e o build seguinte reclama de forma legível.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origem = join(raiz, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destino = join(raiz, "public", "pdf.worker.min.mjs");

try {
  await mkdir(dirname(destino), { recursive: true });
  await copyFile(origem, destino);
  console.log("[pdf.js] worker copiado para public/pdf.worker.min.mjs");
} catch (erro) {
  console.warn("[pdf.js] não consegui copiar o worker:", erro instanceof Error ? erro.message : erro);
}
