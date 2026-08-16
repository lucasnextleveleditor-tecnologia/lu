import sanitizeHtml from "sanitize-html";

/**
 * Sanitiza o HTML salvo pelo `RichTextEditor` (campo `prod_tarefas.briefing`)
 * antes de persistir no banco. O editor usa `document.execCommand` com um
 * conjunto fixo de comandos (negrito, itálico, sublinhado, listas) — a
 * allowlist abaixo cobre exatamente as tags que esses comandos produzem nos
 * navegadores modernos, mais o básico de parágrafo/quebra de linha que o
 * `contentEditable` insere sozinho.
 *
 * Isso existe porque `TarefaDetalheModal` renderiza esse HTML com
 * `dangerouslySetInnerHTML` — sem sanitizar, qualquer usuário com permissão
 * de escrita no módulo Produção (não só admin — `requireModulo("producao")`
 * também libera `funcionario`) poderia gravar `<img src=x onerror=...>` ou
 * `<script>` no briefing e ter esse código executado no navegador de quem
 * abrir a tarefa depois (incluindo um admin) — um caminho de
 * escalação de privilégio via XSS armazenado.
 */
const TAGS_PERMITIDAS = ["b", "strong", "i", "em", "u", "ul", "ol", "li", "br", "p", "div", "span"];

export function sanitizarBriefingHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: TAGS_PERMITIDAS,
    allowedAttributes: {},
    // Remove completamente o conteúdo de tags perigosas (script/style) em vez
    // de só desembrulhar a tag e manter o texto interno.
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed"],
    disallowedTagsMode: "discard",
  });
}
