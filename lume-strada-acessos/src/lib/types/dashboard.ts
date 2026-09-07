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
