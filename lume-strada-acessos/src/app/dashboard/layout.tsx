import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { LogoutButton } from "@/components/auth/LogoutButton";

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

  return (
    <div className="min-h-screen">
      <header className="border-b border-base-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <BrandingLogo logoUrl={branding.logo_dark_url ?? branding.logo_url} sizeClassName="h-8" />
            <p className="text-sm font-semibold tracking-tight">Lume Strada Filmes</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-muted">{profile?.full_name || profile?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
