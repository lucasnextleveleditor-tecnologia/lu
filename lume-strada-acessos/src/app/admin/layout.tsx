import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Segunda camada de proteção (a primeira é o middleware): mesmo que
  // alguém chegasse aqui sem passar pelo middleware, o layout re-confirma
  // que quem está vendo é de fato um admin antes de renderizar qualquer
  // dado de outros usuários.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role" | "full_name" | "email">, { merge: false }>();

  if (profile?.role !== "admin") redirect("/dashboard");

  const branding = await getBrandingConfig();

  return (
    <AdminShell
      logoUrl={branding.logo_dark_url ?? branding.logo_url}
      nome={profile.full_name ?? ""}
      email={profile.email}
      colapsadoPadrao={branding.sidebar_compacto_padrao}
    >
      {children}
    </AdminShell>
  );
}
