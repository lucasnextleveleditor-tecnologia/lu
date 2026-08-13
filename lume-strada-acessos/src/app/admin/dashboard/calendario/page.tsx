import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import type { TarefaRow } from "@/lib/types/producao";
import type { LeadRow } from "@/lib/types/comercial";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { CalendarioGeral } from "@/components/admin/dashboard/CalendarioGeral";

export const dynamic = "force-dynamic";

type TarefaMin = Pick<TarefaRow, "id" | "titulo" | "cliente_id" | "status" | "prioridade" | "data_captacao" | "data_entrega">;
type LeadMin = Pick<LeadRow, "id" | "nome" | "status" | "proximo_contato_em">;

export default async function DashboardCalendarioPage() {
  const supabase = await createClient();

  const [tarefasRes, clientesRes, leadsRes] = await Promise.all([
    supabase
      .from("prod_tarefas")
      .select("id, titulo, cliente_id, status, prioridade, data_captacao, data_entrega")
      .overrideTypes<TarefaMin[], { merge: false }>(),
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "cliente")
      .overrideTypes<Pick<ProfileRow, "id" | "email" | "full_name">[], { merge: false }>(),
    supabase.from("crm_leads").select("id, nome, status, proximo_contato_em").overrideTypes<LeadMin[], { merge: false }>(),
  ]);

  const tarefas = tarefasRes.data ?? [];
  const clientes = clientesRes.data ?? [];
  const leads = leadsRes.data ?? [];

  const nomeCliente = new Map(clientes.map((c) => [c.id, c.full_name || c.email]));

  const tarefasAgenda: TarefaAgendaItem[] = tarefas.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    cliente_nome: t.cliente_id ? (nomeCliente.get(t.cliente_id) ?? null) : null,
    status: t.status,
    data_captacao: t.data_captacao,
    data_entrega: t.data_entrega,
  }));

  const leadsAgenda: LeadAgendaItem[] = leads.map((l) => ({
    id: l.id,
    nome: l.nome,
    status: l.status,
    proximo_contato_em: l.proximo_contato_em,
  }));

  return <CalendarioGeral tarefas={tarefasAgenda} leads={leadsAgenda} />;
}
