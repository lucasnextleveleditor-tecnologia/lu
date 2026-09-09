import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { TarefaRow } from "@/lib/types/producao";
import type { LeadRow } from "@/lib/types/comercial";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import type { Compromisso } from "@/lib/types/agenda";
import { leadEstaAberto } from "@/lib/utils/comercial";

type TarefaMin = Pick<TarefaRow, "id" | "titulo" | "cliente_id" | "cliente_cadastro_id" | "status" | "prioridade" | "data_captacao" | "data_entrega">;
type LeadMin = Pick<LeadRow, "id" | "nome" | "status" | "proximo_contato_em">;

/**
 * Busca TUDO que a tela de Agenda precisa: os compromissos MANUAIS (tabela
 * `compromissos`, CRUD completo + arrastar-pra-reagendar) + os mesmos dados
 * de Produção (captação/entrega) e Comercial (próximo contato) que o
 * Calendário Geral do Dashboard já agrega hoje — mesma query/shape de
 * `src/app/admin/dashboard/calendario/page.tsx`, duplicada aqui de propósito
 * (cada módulo busca o próprio dado, ver comentário no topo de
 * `lib/utils/dashboard.ts` — a Agenda NÃO importa o `data.ts` do Dashboard).
 * Também calcula, aqui no servidor, as 3 contagens do MÊS ATUAL usadas pelos
 * StatTiles do topo da página.
 */
export async function buscarDadosAgenda() {
  const { supabase } = await requireModuloOuRedirect("agenda");

  const [compromissosRes, tarefasRes, clientesRes, leadsRes] = await Promise.all([
    supabase.from("compromissos").select("*").order("data", { ascending: true }).overrideTypes<Compromisso[], { merge: false }>(),
    supabase
      .from("prod_tarefas")
      .select("id, titulo, cliente_id, cliente_cadastro_id, status, prioridade, data_captacao, data_entrega")
      .overrideTypes<TarefaMin[], { merge: false }>(),
    // Cadastro completo de clientes (Cadastros → Clientes) — antes esta
    // busca era em `profiles` (role='cliente'), só pegando quem já tinha
    // login. Trocado pelo cadastro de verdade pra dar nome+COR consistentes
    // com o resto do app (mesma fonte que Produção usa), habilitando o
    // filtro/legenda "Filtrar por Cliente" do calendário da Agenda.
    supabase.from("clientes").select("*").order("nome").overrideTypes<ClienteRow[], { merge: false }>(),
    supabase.from("crm_leads").select("id, nome, status, proximo_contato_em").overrideTypes<LeadMin[], { merge: false }>(),
  ]);

  const compromissos = compromissosRes.data ?? [];
  const tarefas = tarefasRes.data ?? [];
  const clientes = clientesRes.data ?? [];
  const leads = leadsRes.data ?? [];

  const clientePorId = new Map(clientes.map((c) => [c.id, c]));
  // Fallback pra tarefa antiga que só tem `cliente_id` (profiles.id) —
  // mesmo padrão de `app/admin/producao/page.tsx`.
  const clientePorProfileId = new Map(clientes.filter((c) => c.profile_id).map((c) => [c.profile_id as string, c]));

  const tarefasAgenda: TarefaAgendaItem[] = tarefas.map((t) => {
    const cliente = t.cliente_cadastro_id ? clientePorId.get(t.cliente_cadastro_id) : t.cliente_id ? clientePorProfileId.get(t.cliente_id) : undefined;
    return {
      id: t.id,
      titulo: t.titulo,
      cliente_nome: cliente?.nome ?? null,
      cliente_id: cliente?.id ?? null,
      cliente_cor: cliente?.cor ?? null,
      status: t.status,
      data_captacao: t.data_captacao,
      data_entrega: t.data_entrega,
    };
  });

  const leadsAgenda: LeadAgendaItem[] = leads.map((l) => ({
    id: l.id,
    nome: l.nome,
    status: l.status,
    proximo_contato_em: l.proximo_contato_em,
  }));

  // Contagens do mês ATUAL pros StatTiles — comparação simples de prefixo
  // "yyyy-mm" (as colunas de data já são ISO yyyy-mm-dd), sem precisar de
  // range de datas/timezone.
  const hoje = new Date();
  const anoMesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const noMesAtual = (iso: string | null) => !!iso && iso.startsWith(anoMesAtual);

  const compromissosManuaisNoMes = compromissos.filter((c) => noMesAtual(c.data)).length;
  const captacoesNoMes = tarefasAgenda.filter((t) => noMesAtual(t.data_captacao)).length;
  const entregasNoMes = tarefasAgenda.filter((t) => noMesAtual(t.data_entrega)).length;
  const followUpsNoMes = leadsAgenda.filter((l) => noMesAtual(l.proximo_contato_em) && leadEstaAberto(l)).length;
  const autoNoMes = captacoesNoMes + entregasNoMes + followUpsNoMes;

  return {
    compromissos,
    tarefasAgenda,
    leadsAgenda,
    clientes,
    eventosNoMes: compromissosManuaisNoMes + autoNoMes,
    compromissosManuaisNoMes,
    autoNoMes,
  };
}
