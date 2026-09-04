export type StatusTarefa = "backlog" | "a_fazer" | "em_producao" | "revisao_interna" | "preview_cliente" | "concluida";
export type PrioridadeTarefa = "baixa" | "normal" | "alta" | "urgente";
export type TipoVersaoEntrega = "arquivo" | "link";
export type StatusAprovacaoVersao = "pendente" | "aprovado" | "alteracao_solicitada";

export interface FuncionarioRow {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export interface TipoServicoRow {
  id: string;
  nome: string;
  created_at: string;
}

export interface TarefaRow {
  id: string;
  titulo: string;
  briefing: string | null; // HTML (rich text)
  cliente_id: string | null; // uuid -> profiles.id — só quando o cliente vinculado TEM login (ver `resolverVinculoCliente` em app/admin/producao/actions.ts)
  cliente_cadastro_id: string | null; // uuid -> clientes.id — vínculo "de verdade", sempre preenchido quando um cliente é escolhido, com ou sem login
  responsavel_id: string | null;
  tipo_servico_id: string | null;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  data_captacao: string | null; // ISO date — dia da gravação/filmagem (ver módulo Dashboard/Calendário)
  data_entrega: string | null; // ISO date
  created_at: string;
  updated_at: string;
}

/** Tarefa enriquecida com os nomes relacionados (join em memória) e contagem de subtarefas. */
export type TarefaComRelacoes = TarefaRow & {
  cliente_nome: string | null;
  cliente_cor: string | null; // hex do cadastro do cliente (`clientes.cor`) — etiqueta colorida no Calendário
  responsavel_nome: string | null;
  tipo_servico_nome: string | null;
  subtarefas_total: number;
  subtarefas_concluidas: number;
};

export interface SubtarefaRow {
  id: string;
  tarefa_id: string;
  titulo: string;
  concluida: boolean;
  created_at: string;
}

export interface EntregaRow {
  id: string;
  tarefa_id: string;
  nome: string;
  created_at: string;
}

export interface EntregaVersaoRow {
  id: string;
  entrega_id: string;
  versao: number;
  tipo: TipoVersaoEntrega;
  storage_path: string | null;
  link_url: string | null;
  nome_arquivo: string;
  tamanho_bytes: number | null;
  tipo_mime: string | null;
  status_aprovacao: StatusAprovacaoVersao;
  observacao_aprovacao: string | null;
  enviado_por: string | null;
  aprovado_por: string | null;
  aprovado_em: string | null;
  created_at: string;
}

/** Entrega com o histórico completo de versões (mais recente primeiro) — usado no painel de detalhe da tarefa. */
export type EntregaComVersoes = EntregaRow & { versoes: EntregaVersaoRow[] };
