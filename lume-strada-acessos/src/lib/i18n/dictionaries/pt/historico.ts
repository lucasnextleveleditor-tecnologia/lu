import type { AcaoEvento } from "@/lib/eventos/registrar";

/**
 * A trilha — quem fez o que, e quando.
 *
 * Os rótulos são frases de acontecimento, não nomes de coluna: "Versão
 * enviada para preview" e não "versao_enviada". Quem lê uma trilha está
 * reconstruindo uma história, e nomes técnicos obrigam a traduzir de cabeça.
 */
export interface HistoricoDict {
  abaHistorico: string;
  tituloPagina: string;
  subtituloPagina: string;
  semEventos: string;
  semClientes: string;
  todosOsClientes: string;
  atorCliente: string;
  atorSistema: string;
  atorDesconhecido: string;
  /** `{de}` → `{para}` */
  transicao: string;
  /** `{n}` itens */
  quantos: string;
  verMais: string;
  acoes: Record<AcaoEvento, string>;
}

export const historico: HistoricoDict = {
  abaHistorico: "Histórico",
  tituloPagina: "Histórico",
  subtituloPagina: "Cada passo do fluxo, com quem fez e quando.",
  semEventos: "Nada registrado ainda para este cliente.",
  semClientes: "Cadastre um cliente para começar a registrar.",
  todosOsClientes: "Todos os clientes",
  atorCliente: "cliente",
  atorSistema: "sistema",
  atorDesconhecido: "—",
  transicao: "{de} → {para}",
  quantos: "{n} itens",
  verMais: "Ver mais",
  acoes: {
    onboarding_salvo: "Onboarding salvo",
    onboarding_concluido: "Onboarding concluído",
    onboarding_reaberto: "Onboarding reaberto",
    onboarding_link_enviado: "Link do briefing enviado ao cliente",
    onboarding_respondido_cliente: "Briefing respondido pelo cliente",
    plano_criado: "Planejamento criado",
    plano_editado: "Planejamento editado",
    plano_ativado: "Ciclo ativado",
    plano_encerrado: "Ciclo encerrado",
    plano_cancelado: "Ciclo cancelado",
    pauta_criada: "Pauta criada",
    pauta_removida: "Pauta excluída",
    pauta_subiu: "Pautas enviadas para a produção",
    pauta_devolvida: "Pauta devolvida ao planejamento",
    tarefa_criada: "Tarefa criada",
    tarefa_status: "Status alterado",
    tarefa_removida: "Tarefa excluída",
    versao_enviada: "Versão enviada para preview",
    versao_aprovada: "Versão aprovada",
    versao_alteracao_solicitada: "Alteração solicitada",
  },
};
