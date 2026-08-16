import type { DashboardCardChave, PermissoesFuncionario } from "@/lib/types/database";

/** Lista fixa dos módulos que podem ser liberados/bloqueados por funcionário — mesma ordem que aparece no modal de Permissões. Rótulo bate com o nome do item no menu lateral. */
export const MODULOS_PERMISSAO: { chave: keyof PermissoesFuncionario; label: string; hint: string }[] = [
  { chave: "clientes", label: "Clientes", hint: "Ver e editar o cadastro de clientes" },
  { chave: "comercial", label: "CRM & Vendas", hint: "Funil comercial e leads" },
  { chave: "whatsapp", label: "WhatsApp", hint: "Inbox e conexão do número" },
  { chave: "financeiro", label: "Financeiro", hint: "Contas, cartões e transações" },
  { chave: "producao", label: "Produção & Tarefas", hint: "Board de tarefas e entregas" },
  { chave: "trafego", label: "Tráfego & Metas", hint: "Metas e lançamentos de tráfego" },
  { chave: "inventario", label: "Inventário & Patrimônio", hint: "Bens e depreciação" },
];

/**
 * Lista fixa dos cards do Dashboard (`VisaoGeral.tsx`) que podem ser
 * escondidos por funcionário — mesmo rótulo exibido no card em si, pra não
 * ter que adivinhar o que é o quê. Cards que já dependem de um módulo
 * liberado (Financeiro/Inventário/Tráfego/WhatsApp) não repetem o nome do
 * módulo no rótulo (o aviso já aparece uma vez, acima da lista, no modal) —
 * o toggle aqui só faz efeito pra quem JÁ tem aquele módulo liberado;
 * combinam com "E", nunca "OU" (ver `src/app/admin/dashboard/page.tsx`).
 */
export const CARDS_DASHBOARD: { chave: DashboardCardChave; label: string }[] = [
  { chave: "captacoesHoje", label: "Captações Hoje" },
  { chave: "entregasHoje", label: "Entregas Hoje" },
  { chave: "tarefasAtrasadas", label: "Tarefas Atrasadas" },
  { chave: "entregasAguardandoAprovacao", label: "Aguardando Aprovação" },
  { chave: "leadsEmAberto", label: "Leads em Aberto" },
  { chave: "followUpsAtrasados", label: "Follow-ups Atrasados" },
  { chave: "valorPropostasAbertas", label: "Propostas Abertas" },
  { chave: "saldoConsolidado", label: "Saldo Consolidado" },
  { chave: "contasVencidas", label: "Contas Vencidas" },
  { chave: "financeiroDoMes", label: "Financeiro do Mês" },
  { chave: "resumoInventario", label: "Itens em Manutenção" },
  { chave: "resumoTrafegoHoje", label: "Investido em Ads Hoje" },
  { chave: "whatsapp", label: "WhatsApp" },
  { chave: "agendaDoDia", label: "Agenda de Hoje" },
];

export function temAcessoGerado(registro: { profile_id: string | null }): boolean {
  return registro.profile_id !== null;
}
