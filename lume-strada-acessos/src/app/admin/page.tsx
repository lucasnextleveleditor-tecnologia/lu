import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  // RLS ("profiles_select_admin", ver supabase/schema.sql) libera este
  // SELECT retornar TODAS as linhas só porque quem está logado é admin —
  // não precisamos da Service Role para simplesmente listar usuários.
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .overrideTypes<ProfileRow[], { merge: false }>();

  if (error) {
    return <p className="text-sm text-danger">Erro ao carregar usuários: {error.message}</p>;
  }

  return <UsersTable users={users ?? []} />;
}
