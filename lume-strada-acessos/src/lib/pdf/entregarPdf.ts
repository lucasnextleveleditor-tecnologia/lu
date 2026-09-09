import "server-only";

/**
 * Nome do arquivo que o navegador vai salvar.
 *
 * Sai do título do documento, não do nome do arquivo enviado: "Contrato
 * Fulano - Ensaio.pdf" diz o que é; "scan_0031.pdf", que foi como o PDF
 * chegou, não diz nada na pasta de downloads de quem assinou.
 */
export function nomeDeArquivo(titulo: string, assinado: boolean): string {
  const base =
    titulo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "documento";
  return `${base}${assinado ? "-assinado" : ""}.pdf`;
}

/**
 * O PDF em si.
 *
 * `inline` para abrir na aba (é o que se espera ao clicar num contrato) e
 * `no-store` porque a URL é sempre a mesma: sem isso, o navegador serviria a
 * versão de antes das assinaturas depois que o documento fechasse.
 */
export function respostaPdf(bytes: ArrayBuffer, nome: string): Response {
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
