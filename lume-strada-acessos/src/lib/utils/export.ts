// ============================================================================
// Helper de exportação — usado pelo `ExportMenuButton` (componente global,
// ver `src/components/ui/ExportMenuButton.tsx`) em TODA tela que precisa de
// "Exportar como PDF / Imagem (PNG) / Planilha (CSV)".
//
// `html2canvas`/`jspdf` só existem no navegador (mexem com `document`,
// `canvas`, etc.) — por isso o import de cada um é feito com `await
// import(...)` DENTRO da função, nunca no topo do arquivo. Isso garante que
// o Next nunca tenta incluir/executar esse código no bundle do servidor (as
// funções aqui só são chamadas a partir de `onClick` em componente client) e
// também faz o code-splitting: quem nunca clica em "Exportar" nunca baixa
// essas duas bibliotecas.
// ============================================================================

const FUNDO_EXPORTACAO = "#000000"; // mesmo preto absoluto do fundo do app (ver tailwind.config.ts) — nunca branco, pra não "clarear" o print

export class ExportError extends Error {}

async function capturarElemento(elementId: string): Promise<HTMLCanvasElement> {
  const elemento = document.getElementById(elementId);
  if (!elemento) {
    throw new ExportError("Não foi possível localizar o conteúdo desta tela para exportar.");
  }

  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(elemento, {
    backgroundColor: FUNDO_EXPORTACAO,
    scale: 2, // retina — texto/gráfico nítido no PNG e no PDF
    useCORS: true,
    logging: false,
  });
}

function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Captura a div `elementId` inteira (tabela, dashboard, kanban...) e baixa como PNG. */
export async function exportarElementoComoPNG(elementId: string, nomeArquivo: string): Promise<void> {
  const canvas = await capturarElemento(elementId);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new ExportError("Falha ao gerar a imagem.");
  baixarBlob(blob, `${nomeArquivo}.png`);
}

/**
 * Captura a div `elementId` e gera um PDF de UMA página, com o tamanho da
 * página ajustado à proporção da captura (nunca corta nem sobra margem
 * branca) — mais previsível que tentar encaixar num A4 fixo quando o
 * conteúdo pode ser uma tabela larga ou um dashboard bem alto.
 */
export async function exportarElementoComoPDF(elementId: string, nomeArquivo: string): Promise<void> {
  const canvas = await capturarElemento(elementId);
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${nomeArquivo}.pdf`);
}

export interface ColunaCSV<T> {
  chave: keyof T;
  rotulo: string;
}

/** Escapa um valor pra célula de CSV — aspas duplas quando o valor tem vírgula, aspas ou quebra de linha, RFC 4180. */
function escaparCelulaCSV(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  if (/[",\n;]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

/**
 * Converte um array de objetos em CSV e dispara o download — sem
 * dependência externa (é só template string + Blob). `colunas` é opcional:
 * sem ela, usa as chaves do primeiro objeto como cabeçalho, na ordem em que
 * aparecem.
 */
export function exportarArrayComoCSV<T extends Record<string, unknown>>(dados: T[], nomeArquivo: string, colunas?: ColunaCSV<T>[]): void {
  if (dados.length === 0) {
    throw new ExportError("Não há dados para exportar nesta tela.");
  }

  const colunasFinais: ColunaCSV<T>[] = colunas ?? (Object.keys(dados[0]!) as (keyof T)[]).map((chave) => ({ chave, rotulo: String(chave) }));

  const cabecalho = colunasFinais.map((c) => escaparCelulaCSV(c.rotulo)).join(";");
  const linhas = dados.map((linha) => colunasFinais.map((c) => escaparCelulaCSV(linha[c.chave])).join(";"));

  // BOM (﻿) no início — sem isso o Excel no Windows abre acentuação
  // (ç, ã, é...) quebrada por assumir Latin-1 em vez de UTF-8.
  const conteudo = "﻿" + [cabecalho, ...linhas].join("\n");
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  baixarBlob(blob, `${nomeArquivo}.csv`);
}
