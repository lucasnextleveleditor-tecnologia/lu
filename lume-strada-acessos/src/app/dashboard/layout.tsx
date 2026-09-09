import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { AnnouncementBanner } from "@/components/branding/AnnouncementBanner";
import { BrandingAccentStyle } from "@/components/branding/BrandingAccentStyle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "full_name" | "email" | "role">, { merge: false }>();

  // Segunda camada de proteção (a primeira é o middleware) — mesma dupla
  // checagem que `AdminLayout` e `SuperAdminLayout` já faziam, e que aqui
  // faltava: o portal é de quem é `cliente`. Sem isto, um super_admin ou um
  // admin que chegasse por um link antigo ficava vendo a área de membros
  // como se fosse um cliente.
  if (profile && profile.role !== "cliente") {
    redirect(profile.role === "super_admin" ? "/super-admin" : "/admin");
  }

  const branding = await getBrandingConfig();
  const nomeApp = await getNomeApp();

  return (
    <div className="min-h-screen">
      {/* Mesma cor de marca do painel da agência — o portal é a cara dela
          pro cliente final, então herda a cor da empresa dona do portal
          (resolvida pelo RLS de `branding_config`, ver
          `supabase/branding-por-empresa.sql`). */}
      <BrandingAccentStyle primaryColor={branding.primary_color} accentColor={branding.accent_color} />

      {/* Fixo no canto superior direito da viewport — mesma posição em toda
          tela do sistema (login, painel admin e portal do cliente). */}
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <header className="border-b border-base-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <BrandingLogo logoUrl={branding.logo_dark_url ?? branding.logo_url} sizeClassName="h-8" />
            <p className="text-sm font-semibold tracking-tight">{nomeApp}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-muted">{profile?.full_name || profile?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        {branding.banner_ativo_cliente && branding.banner_titulo.trim() && (
          <AnnouncementBanner
            titulo={branding.banner_titulo}
            descricao={branding.banner_descricao}
            linkUrl={branding.banner_link_url}
            linkLabel={branding.banner_link_label}
            imgUrl={branding.banner_img_url}
            tone={branding.banner_tone}
            dispensavel={branding.banner_dispensavel}
            chaveDispensa={`${branding.banner_titulo}|${branding.banner_descricao}|${branding.updated_at}`}
            className="mb-6"
          />
        )}
        {children}
      </main>
    </div>
  );
}
