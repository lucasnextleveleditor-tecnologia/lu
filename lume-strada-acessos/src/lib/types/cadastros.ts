/** Cadastro completo de um cliente (dados cadastrais) — independente de ter ou não login no sistema. */
export interface ClienteRow {
  id: string;
  nome: string; // Razão Social / Nome Completo
  documento: string | null; // CNPJ / CPF
  email: string | null;
  telefone: string | null; // Telefone / WhatsApp
  nome_responsavel: string | null;
  endereco: string | null;
  profile_id: string | null; // uuid -> profiles.id — null até "Gerar Acesso" ser usado
  cor: string | null; // hex ("#RRGGBB") escolhido no cadastro — usado nas etiquetas do Calendário (Produção) pra identificar o cliente visualmente
  created_at: string;
  updated_at: string;
}

/**
 * Cadastro de um membro da equipe (RH/acesso) — INTENCIONALMENTE separado
 * de `prod_funcionarios` (o dropdown simples "Responsável" das tarefas de
 * Produção, que continua existindo do jeito que está). Este é o cadastro
 * completo de quem trabalha na agência, usado pra liberar login com
 * permissões.
 */
export interface EquipeMembroRow {
  id: string;
  nome: string;
  cargo: string | null; // Cargo / Função — ex: Editor, Designer, Gestor de Tráfego
  email: string | null;
  telefone: string | null;
  profile_id: string | null; // uuid -> profiles.id — null até "Gerar Acesso" ser usado
  created_at: string;
  updated_at: string;
}

export type TipoAtividadeCliente = "tarefa" | "nota";

/**
 * Atividade/tarefa registrada DENTRO do cadastro de um cliente — checklist
 * leve de acompanhamento comercial (ex: "Ligar sobre renovação"), separado
 * de propósito do board de Produção (`prod_tarefas`). Ver comentário em
 * `supabase/cadastros.sql` seção 5.
 */
export interface ClienteAtividadeRow {
  id: string;
  cliente_id: string;
  tipo: TipoAtividadeCliente;
  titulo: string;
  descricao: string | null;
  concluida: boolean; // só relevante quando tipo = "tarefa"
  data_prevista: string | null; // ISO date (yyyy-mm-dd)
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}
