import type { StatusTarefa } from "@/lib/types/producao";
import type { StatusLead } from "@/lib/types/comercial";

// Tipos ENXUTOS pro Dashboard/Calendário Geral — não os tipos completos de
// `TarefaComRelacoes`/`LeadComRelacoes` (que carregam campos que o
// Dashboard nunca usa, como briefing/subtarefas/valor_estimado). O
// Dashboard só precisa do suficiente pra listar e agrupar por dia.

export interface TarefaAgendaItem {
  id: string;
  titulo: string;
  cliente_nome: string | null;
  /**
   * Id do cliente cadastrado (`clientes.id`) e sua cor — OPCIONAIS de
   * propósito: só `app/admin/agenda/data.ts` os preenche hoje (pra colorir
   * os itens auto-surfados de Produção no calendário da Agenda por
   * cliente, mesmo espírito de `TarefaComRelacoes.cliente_cor`). Os outros
   * lugares que montam `TarefaAgendaItem` (Dashboard/Calendário Geral)
   * continuam sem preencher — undefined é tratado como "sem cor" por quem
   * consome.
   */
  cliente_id?: string | null;
  cliente_cor?: string | null;
  status: StatusTarefa;
  data_captacao: string | null;
  data_entrega: string | null;
}

export interface LeadAgendaItem {
  id: string;
  nome: string;
  status: StatusLead;
  proximo_contato_em: string | null;
}
