"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Carrega o pdf.js e aponta o worker para o arquivo servido em `/public`.
 *
 * O worker NÃO passa pelo empacotador de propósito. Referenciá-lo por
 * `new URL(..., import.meta.url)` faz o webpack tentar processar um arquivo
 * de 1,3 MB já minificado, e o build quebra despejando o arquivo inteiro na
 * saída de erro. Servido como asset estático, ele é só um endereço — que é
 * exatamente o que o pdf.js espera.
 *
 * O arquivo vive no repositório (`public/pdf.worker.min.mjs`) e precisa ser
 * trocado junto quando a versão do `pdfjs-dist` mudar, senão o worker fica
 * numa versão e a biblioteca em outra — que é um erro difícil de ler.
 */
async function carregarPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

/**
 * Uma página do PDF desenhada num canvas.
 *
 * O pdf.js entra por `import()` dinâmico, não no topo do arquivo: ele pesa
 * mais de um megabyte e não tem por que viajar junto com o resto do painel
 * para quem nunca vai abrir um contrato. Aqui ele só é baixado quando alguém
 * de fato abre um documento.
 *
 * Cada página é desenhada UMA vez, na largura em que aparece — e redesenhada
 * quando essa largura muda. Renderizar a cada rolagem transformaria um
 * contrato de trinta páginas num travamento.
 */
export function PaginaPdf({
  url,
  pagina,
  largura,
  aoMedir,
}: {
  url: string;
  /** Base 0 — o pdf.js conta a partir de 1, a conversão fica aqui dentro. */
  pagina: number;
  largura: number;
  /** Avisa a proporção real da página, para o invólucro reservar a altura certa. */
  aoMedir?: (proporcao: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelado = false;
    // Guarda a tarefa de renderização para poder cancelá-la: sem isso, mudar
    // a largura no meio de um desenho faz o pdf.js reclamar de duas
    // renderizações no mesmo canvas.
    let tarefa: { cancel: () => void } | null = null;

    async function desenhar() {
      try {
        const pdfjs = await carregarPdfjs();

        const doc = await pdfjs.getDocument({ url, isEvalSupported: false }).promise;
        if (cancelado) return;

        const page = await doc.getPage(pagina + 1);
        const escala1 = page.getViewport({ scale: 1 });
        aoMedir?.(escala1.height / escala1.width);

        const canvas = canvasRef.current;
        if (!canvas || cancelado) return;

        // `devicePixelRatio` para o texto não sair borrado em tela retina —
        // um contrato precisa ser LIDO antes de ser assinado.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: (largura / escala1.width) * dpr });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${largura}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = page.render({ canvasContext: ctx, viewport });
        tarefa = render;
        await render.promise;
      } catch {
        if (!cancelado) setErro(true);
      }
    }

    void desenhar();
    return () => {
      cancelado = true;
      tarefa?.cancel();
    };
  }, [url, pagina, largura, aoMedir]);

  if (erro) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-base-700 p-8 text-xs text-ink-muted">
        Não consegui desenhar esta página.
      </div>
    );
  }

  return <canvas ref={canvasRef} className="block rounded-lg bg-white shadow-lg" />;
}

/** Quantas páginas o PDF tem — lido no navegador, na hora do envio. */
export async function contarPaginas(arquivo: File): Promise<number> {
  const pdfjs = await carregarPdfjs();
  const buffer = await arquivo.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer, isEvalSupported: false }).promise;
  return doc.numPages;
}

/**
 * SHA-256 do arquivo, calculado no navegador.
 *
 * É a impressão digital do PDF no momento em que foi enviado. Guardada junto
 * com o documento, é o que permite provar depois que o arquivo assinado é o
 * mesmo que foi apresentado a quem assinou — se um byte mudar, o hash muda.
 */
export async function calcularHash(arquivo: File): Promise<string> {
  const buffer = await arquivo.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
