import type { Metadata } from "next";
import "./globals.css";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingConfig();

  return {
    title: "Lume Strada Filmes — Acessos",
    description: "Gestão de clientes, acessos, tráfego e patrimônio da Lume Strada Filmes",
    icons: branding.favicon_url ? { icon: branding.favicon_url } : undefined,
  };
}

// Identidade visual (preto absoluto + acento branco/zinc) é FIXA em todo o
// app — ver `:root` em `globals.css`. Nada é mais injetado por request a
// partir de `branding_config`; a única personalização por cliente é a
// logotipo, aplicada seletivamente em `app/admin/layout.tsx` e
// `app/dashboard/layout.tsx` (nunca aqui, nunca em `app/login/page.tsx`).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="film-grain-bg min-h-screen bg-base-950 text-ink-primary antialiased">{children}</body>
    </html>
  );
}
