import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { AnnouncementBanner } from "@/components/branding/AnnouncementBanner";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "full_name" | "email">, { merge: false }>();

  const branding = await getBrandingConfig();
  const nomeApp = await getNomeApp();

  return (
    <div className="min-h-screen">
      {/* Fixo no canto superior direito da viewport — mesma posição em toda
          tela do sistema (login, painel admin e portal do cliente). */}
      <div className="fixed right-4 top-4 z-30">
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
