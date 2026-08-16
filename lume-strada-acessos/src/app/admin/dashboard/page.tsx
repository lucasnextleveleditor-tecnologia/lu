import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import type { ProfileRow } from "@/lib/types/database";
import type { TarefaRow } from "@/lib/types/producao";
import type { LeadRow } from "@/lib/types/comercial";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { isTarefaAtrasada } from "@/lib/utils/producao";
import { leadEstaAberto, isFollowUpAtrasado } from "@/lib/utils/comercial";
import { hojeISO } from "@/lib/utils/dashboard";
import { VisaoGeral } from "@/components/admin/dashboard/VisaoGeral";

export const dynamic = "force-dynamic";

type TarefaMin = Pick<TarefaRow, "id" | "titulo" | "cliente_id" | "status" | "prioridade" | "data_captacao" | "data_entrega">;
type LeadMin = Pick<LeadRow, "id" | "nome" | "status" | "proximo_contato_em">;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Dashboard é o único módulo aberto a QUALQUER membro da equipe (admin ou
  // funcionário, mesmo sem nenhuma permissão extra — ver comentário em
  // `src/middleware.ts`). O card de Saldo Consolidado, porém, é dado
  // financeiro — antes desse fix, a query rodava incondicionalmente pra
  // qualquer funcionário logado (a policy de RLS só checa "é staff?", não
  // "tem o módulo Financeiro liberado?" — essa checagem fina é da aplicação,
  // igual documentado em `requireModulo`), então um funcionário sem acesso
  // ao módulo Financeiro via a lista de módulos ainda via o saldo total
  // (inclusive de contas "pessoal") só de abrir o Dashboard.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const perfil = user ? await buscarPerfilComPermissoes(supabase, user.id) : null;
  const podeVerFinanceiro = perfil?.role === "admin" || perfil?.permissoes?.financeiro === true;

  const [tarefasRes, clientesRes, leadsRes, contasRes] = await Promise.all([
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
    podeVerFinanceiro
      ? supabase
          .from("fin_contas_saldo")
          .select("saldo_atual")
          .eq("contexto", "profissional") // saldo "pessoal" nunca entra no card da equipe, mesmo pra quem pode ver Financeiro
          .overrideTypes<{ saldo_atual: number }[], { merge: false }>()
      : Promise.resolve({ data: null as { saldo_atual: number }[] | null }),
  ]);

  const tarefas = tarefasRes.data ?? [];
  const clientes = clientesRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const contas = contasRes.data;

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

  const hoje = hojeISO();

  const captacoesHoje = tarefasAgenda.filter((t) => t.data_captacao === hoje);
  const entregasHoje = tarefasAgenda.filter((t) => t.data_entrega === hoje);
  const followUpsHoje = leadsAgenda.filter((l) => l.proximo_contato_em === hoje && leadEstaAberto(l));

  const tarefasAtrasadas = tarefas.filter(isTarefaAtrasada).length;
  const leadsEmAberto = leads.filter(leadEstaAberto).length;
  const followUpsAtrasados = leads.filter(isFollowUpAtrasado).length;
  const saldoConsolidado = contas ? contas.reduce((soma, c) => soma + (c.saldo_atual ?? 0), 0) : null;

  return (
    <VisaoGeral
      captacoesHoje={captacoesHoje.length}
      entregasHoje={entregasHoje.length}
      tarefasAtrasadas={tarefasAtrasadas}
      leadsEmAberto={leadsEmAberto}
      followUpsAtrasados={followUpsAtrasados}
      saldoConsolidado={saldoConsolidado}
      agendaHoje={{ captacoes: captacoesHoje, entregas: entregasHoje, followUps: followUpsHoje }}
    />
  );
}
