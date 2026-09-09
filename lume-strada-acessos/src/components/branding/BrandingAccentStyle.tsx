import { clarear, hexParaTriploRgb } from "@/lib/branding/corDeMarca";

/**
 * Aplica a cor de marca da empresa por cima da paleta padrão do app.
 *
 * COMO: `globals.css` define `--color-accent`, `--color-accent-strong` e
 * `--color-accent-2` dentro de `.dark` e `.light` (as duas classes que o
 * layout raiz coloca no `<html>`). Este `<style>` redeclara as mesmas três
 * variáveis com o seletor `html.dark`/`html.light`, um passo mais específico
 * — então vence sem `!important` e sem tocar em `globals.css`. Os dois modos
 * recebem a mesma cor de propósito: é a cor da MARCA da agência, não uma
 * escolha de tema.
 *
 * ONDE: só nas áreas logadas (painel do admin e portal do cliente). A tela de
 * login continua com a paleta padrão da plataforma, porque ela é renderizada
 * antes de existir empresa conhecida (ver `supabase/branding-por-empresa.sql`).
 *
 * QUANDO NÃO FAZ NADA: cor ausente ou hex inválido no banco → devolve `null` e
 * o app fica com a paleta padrão. Branding nunca pode derrubar tela.
 */
export function BrandingAccentStyle({ primaryColor, accentColor }: { primaryColor: string | null; accentColor: string | null }) {
  const accent = primaryColor ? hexParaTriploRgb(primaryColor) : null;
  if (!accent || !primaryColor) return null;

  const strong = hexParaTriploRgb(clarear(primaryColor, 0.25));
  const accent2 = (accentColor ? hexParaTriploRgb(accentColor) : null) ?? hexParaTriploRgb(clarear(primaryColor, 0.42));

  const css = [
    "html.dark, html.light {",
    `  --color-accent: ${accent};`,
    strong ? `  --color-accent-strong: ${strong};` : "",
    accent2 ? `  --color-accent-2: ${accent2};` : "",
    "}",
  ]
    .filter(Boolean)
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
