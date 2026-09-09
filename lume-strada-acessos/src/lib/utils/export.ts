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

/**
 * Fundo da captura = o mesmo fundo de página do tema ATIVO (`--color-base-950`,
 * ver `globals.css`) — preto absoluto no escuro, quase-branco no claro. Nunca
 * hardcoded: antes disso existir um só tema fixo, "nunca branco" bastava; com
 * dois temas, o certo é o print sair igual ao que a pessoa está vendo na
 * tela, nunca forçado pro preto quando ela está no modo claro.
 */
function corFundoExportacao(): string {
  const bruto = getComputedStyle(document.documentElement).getPropertyValue("--color-base-950").trim();
  if (!bruto) return "#000000";
  const [r, g, b] = bruto.split(/\s+/);
  return `rgb(${r}, ${g}, ${b})`;
}

export class ExportError extends Error {}

async function capturarElemento(elementId: string): Promise<HTMLCanvasElement> {
  const elemento = document.getElementById(elementId);
  if (!elemento) {
    throw new ExportError("Não foi possível localizar o conteúdo desta tela para exportar.");
  }

  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(elemento, {
    backgroundColor: corFundoExportacao(),
    scale: 2, // retina — texto/gráfico nítido no PNG e no PDF
    useCORS: true,
    logging: false,
    onclone: darArAosNumeros,
  });
}

/**
 * Conserta o número grande saindo com a barriga cortada no PNG e no PDF.
 *
 * O navegador desenha o texto usando as métricas reais da fonte; o
 * html2canvas redesenha tudo num canvas calculando a linha por conta
 * própria, a partir do `line-height`. Com uma fonte de exibição, cujos
 * traços transbordam a caixa da linha, o baseline calculado cai um pouco
 * mais baixo — e aí basta o elemento ter `overflow: hidden` (que é
 * exatamente o que o `truncate` liga, e todo cartão de KPI usa) para a parte
 * de baixo dos algarismos ser aparada. Na tela nada acontece; no arquivo
 * exportado, "R$ 65.216,40" sai sem a metade de baixo.
 *
 * A correção acontece só na CÓPIA que o html2canvas fotografa — a tela do
 * usuário não é tocada. E é cirúrgica: mexe apenas em quem é texto de uma
 * linha só com corte ligado, dando altura de linha e uma folga embaixo. Como
 * `overflow` apara na borda do padding, essa folga vira exatamente o espaço
 * que faltava, sem alterar o alinhamento nem desligar as reticências.
 */
function darArAosNumeros(documentoClonado: Document): void {
  const janela = documentoClonado.defaultView;
  if (!janela) return;

  documentoClonado.querySelectorAll<HTMLElement>("*").forEach((elemento) => {
    const estilo = janela.getComputedStyle(elemento);
    if (estilo.whiteSpace !== "nowrap" || estilo.overflow !== "hidden") return;

    const tamanho = parseFloat(estilo.fontSize);
    if (!Number.isFinite(tamanho) || tamanho <= 0) return;

    // 1,4 é folgado o bastante para caber a descida da fonte, e ainda assim
    // discreto: num texto de uma linha só, a diferença não desloca nada em
    // volta. A folga embaixo é proporcional ao tamanho da fonte, para valer
    // igual no número de 30px e no rótulo de 11px.
    elemento.style.lineHeight = String(Math.max(tamanho * 1.4, parseFloat(estilo.lineHeight) || 0)) + "px";
    elemento.style.paddingBottom = `${Math.ceil(tamanho * 0.18)}px`;
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
