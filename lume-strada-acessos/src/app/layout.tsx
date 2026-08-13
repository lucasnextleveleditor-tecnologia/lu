import type { Metadata } from "next";
import "./globals.css";
// Fonte fixa da plataforma — geométrica/arredondada, mesmo espírito da
// referência visual aprovada (títulos em negrito, bem legível em telas de
// dashboard), nunca customizável por branding, igual à paleta de cores.
// Usamos @fontsource (arquivos da fonte empacotados no próprio projeto) em
// vez de `next/font/google`: assim o build NUNCA depende de baixar nada da
// internet no momento do deploy — evita builds falharem por causa de rede.
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
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
      {/* Fundo liso/sólido — sem textura de grão (era um efeito "cinematográfico" antigo, removido a pedido). */}
      <body className="min-h-screen bg-base-950 text-ink-primary antialiased">{children}</body>
    </html>
  );
}
