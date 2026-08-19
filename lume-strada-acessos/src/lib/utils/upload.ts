/**
 * Allowlists de `Content-Type` para upload em buckets PÚBLICOS do Supabase
 * Storage (`branding`, `infoprodutos`). Propositalmente SEM `image/svg+xml`:
 * um SVG pode conter `<script>`/`onload` embutido, e como esses buckets são
 * públicos e servidos com o content-type original, um upload de SVG malicioso
 * vira um XSS armazenado servido do próprio domínio da aplicação (ex: como
 * logo em `branding` ou criativo de anúncio em `infoprodutos`) — atingindo
 * qualquer visitante que carregue a imagem, incluindo admins.
 *
 * Checagem por allowlist explícita (`===` numa lista fixa), não por prefixo
 * (`startsWith("image/")`) — prefixo aceitaria justamente `image/svg+xml`.
 */
export const TIPOS_IMAGEM_PERMITIDOS = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
export const TIPOS_VIDEO_PERMITIDOS = ["video/mp4", "video/webm", "video/quicktime"] as const;

export function ehImagemPermitida(contentType: string): boolean {
  return (TIPOS_IMAGEM_PERMITIDOS as readonly string[]).includes(contentType);
}

export function ehVideoPermitido(contentType: string): boolean {
  return (TIPOS_VIDEO_PERMITIDOS as readonly string[]).includes(contentType);
}

/**
 * Denylist (não allowlist) de extensão pra upload de ENTREGA de produção
 * (`prod_entrega_versoes`, bucket privado "producao"). Diferente dos
 * buckets públicos acima, aqui não dá pra usar uma allowlist fechada de
 * tipo — uma entrega de produção legitimamente é vídeo, imagem, PSD, AI,
 * ZIP, PDF, DOCX... qualquer coisa que o cliente peça de volta. O único
 * tipo que precisa ser bloqueado é o que pode executar como página quando
 * aberto (HTML/SVG) — mesmo o bucket sendo privado (signed URL, nunca link
 * público fixo), o navegador ainda RENDERIZA esse conteúdo ao abrir a URL
 * assinada (`window.open`), o que é uma superfície de XSS armazenado
 * evitável sem custo nenhum de funcionalidade real.
 */
const EXTENSOES_PERIGOSAS_ENTREGA = ["html", "htm", "xhtml", "shtml", "svg"];

export function ehExtensaoPerigosaParaEntrega(nomeArquivo: string): boolean {
  const extensao = nomeArquivo.includes(".") ? nomeArquivo.split(".").pop()?.toLowerCase() : null;
  return !!extensao && EXTENSOES_PERIGOSAS_ENTREGA.includes(extensao);
}
