import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ProfileRow } from "@/lib/types/database";
import type { ClienteRow, EquipeMembroRow } from "@/lib/types/cadastros";
import { CadastrosWorkspace } from "@/components/admin/cadastros/CadastrosWorkspace";

export const dynamic = "force-dynamic";

export default async function CadastrosPage() {
  // Entrada da aba Clientes é liberável por permissão (`requireModuloOuRedirect`
  // já deixa admin passar sempre); a aba Equipe, dentro do workspace, some
  // do próprio componente pra quem não é admin — RLS (`equipe_membros_admin_all`)
  // garante isso de novo no banco, então mesmo uma tentativa direta de
  // Server Action não vaza dado de equipe pra um funcionário.
  const { supabase, user } = await requireModuloOuRedirect("clientes");

  const { data: perfilAtual } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role">, { merge: false }>();

  const [clientesRes, equipeRes, profilesRes] = await Promise.all([
    supabase.from("clientes").select("*").order("nome").overrideTypes<ClienteRow[], { merge: false }>(),
    supabase.from("equipe_membros").select("*").order("nome").overrideTypes<EquipeMembroRow[], { merge: false }>(),
    // RLS ("profiles_select_admin") libera este SELECT retornar todo mundo
    // só porque quem está logado é staff — usado aqui só pra resolver o
    // status de acesso (Ativo/Expirado/Inativo) de cada registro vinculado.
    supabase.from("profiles").select("*").overrideTypes<ProfileRow[], { merge: false }>(),
  ]);

  const clientes = clientesRes.data ?? [];
  const equipeMembros = equipeRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  const profilesPorId = new Map(profiles.map((p) => [p.id, p]));

  return (
    <CadastrosWorkspace
      clientes={clientes}
      equipeMembros={equipeMembros}
      profilesPorId={Object.fromEntries(profilesPorId)}
      souAdmin={perfilAtual?.role === "admin"}
    />
  );
}
