import type { Metadata } from "next";
import "./globals.css";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { buildBrandingCssVars } from "@/lib/utils/color";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingConfig();

  return {
    title: "Lume Strada Filmes — Acessos",
    description: "Gestão de clientes, acessos, tráfego e patrimônio da Lume Strada Filmes",
    icons: branding.favicon_url ? { icon: branding.favicon_url } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getBrandingConfig();

  // Variáveis CSS de branding injetadas direto no `<html>`, renderizadas no
  // servidor — todo mundo (autenticado ou não, inclusive a tela de login)
  // recebe a identidade visual configurada já no primeiro HTML, sem flash
  // de cor errada nem JS extra no cliente. Ver `lib/utils/color.ts` pro
  // porquê do formato "r g b" (space-separated, sem `rgb()`) exigido pelo
  // Tailwind dinâmico em `tailwind.config.ts`.
  const brandingVars = buildBrandingCssVars({ primaryColor: branding.primary_color, accentColor: branding.accent_color });

  return (
    <html lang="pt-BR" className="dark" style={brandingVars as React.CSSProperties}>
      <body className="film-grain-bg min-h-screen bg-base-950 text-ink-primary antialiased">{children}</body>
    </html>
  );
}
