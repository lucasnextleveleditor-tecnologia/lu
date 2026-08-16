import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
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

  // `buscarPerfilComPermissoes` tem fallback pra quando `permissoes` ainda
  // não existe no banco (supabase/cadastros.sql não rodado) — sem isso, um
  // select pedindo essa coluna falharia por INTEIRO e expulsaria todo mundo
  // (inclusive o admin) pro /dashboard de cliente.
  const profile = await buscarPerfilComPermissoes(supabase, user.id);

  // Admin e funcionário passam — cliente é redirecionado pro portal dele.
  // A checagem FINA (qual módulo cada funcionário pode ver/usar) mora em
  // `requireModulo`/`requireModuloOuRedirect`, chamado em cada módulo; aqui
  // é só o portão geral do `/admin`.
  if (profile?.role !== "admin" && profile?.role !== "funcionario") redirect("/dashboard");

  const branding = await getBrandingConfig();

  const banner =
    branding.banner_ativo_admin && branding.banner_titulo.trim()
      ? {
          titulo: branding.banner_titulo,
          descricao: branding.banner_descricao,
          linkUrl: branding.banner_link_url,
          linkLabel: branding.banner_link_label,
          imgUrl: branding.banner_img_url,
          tone: branding.banner_tone,
          dispensavel: branding.banner_dispensavel,
          chaveDispensa: `${branding.banner_titulo}|${branding.banner_descricao}|${branding.updated_at}`,
        }
      : null;

  return (
    <AdminShell
      logoUrl={branding.logo_dark_url ?? branding.logo_url}
      nome={profile.full_name ?? ""}
      email={profile.email}
      colapsadoPadrao={branding.sidebar_compacto_padrao}
      papel={profile.role}
      permissoes={profile.permissoes ?? {}}
      banner={banner}
    >
      {children}
    </AdminShell>
  );
}
