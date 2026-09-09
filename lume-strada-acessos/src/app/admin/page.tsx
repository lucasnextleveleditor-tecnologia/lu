import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ProfileRow } from "@/lib/types/database";
import type { ClienteRow } from "@/lib/types/cadastros";
import { CadastrosWorkspace } from "@/components/admin/cadastros/CadastrosWorkspace";

export const dynamic = "force-dynamic";

export default async function CadastrosPage() {
  // Só Clientes mora aqui agora — Equipe/permissões/organograma foram pra
  // `/admin/configuracoes?aba=empresa` (ver `CadastrosWorkspace`), e com
  // eles as consultas de `equipe_membros`/`departamentos`/`cargos` que esta
  // página fazia junto. Menos uma ida ao banco por visita a Cadastros.
  const { supabase, user } = await requireModuloOuRedirect("clientes");

  const { data: perfilAtual } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "role">, { merge: false }>();

  const [clientesRes, profilesRes] = await Promise.all([
    supabase.from("clientes").select("*").order("nome").overrideTypes<ClienteRow[], { merge: false }>(),
    // RLS ("profiles_select_admin") libera este SELECT retornar todo mundo
    // da empresa só porque quem está logado é staff — usado aqui só pra
    // resolver o status de acesso (Ativo/Expirado/Inativo) de cada cliente.
    supabase.from("profiles").select("*").overrideTypes<ProfileRow[], { merge: false }>(),
  ]);

  const clientes = clientesRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  return (
    <CadastrosWorkspace
      clientes={clientes}
      profilesPorId={Object.fromEntries(profiles.map((p) => [p.id, p]))}
      souAdmin={perfilAtual?.role === "admin"}
    />
  );
}
