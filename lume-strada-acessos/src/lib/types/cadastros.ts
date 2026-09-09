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
  /** Token do link fixo do Portal do Cliente (Fase 4) — ver `supabase/portal.sql`. Sempre preenchido (default no banco), nunca null. */
  portal_token: string;
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

  // ---- Cadastro completo -------------------------------------------------
  // Campos escolhidos pelo que uma agência de audiovisual de fato usa, não
  // por completude burocrática: PIX e valor de diária porque freelancer se
  // paga por fora da folha; contato de emergência porque quem vai para uma
  // externa precisa ter isso à mão.
  documento: string | null; // CPF ou CNPJ
  nascimento: string | null;
  vinculo: string | null; // CLT, PJ, Freelancer, Estágio, Sócio
  entrada: string | null;
  saida: string | null;
  valor_diaria: number | null;
  chave_pix: string | null;
  cidade: string | null;
  uf: string | null;
  emergencia_nome: string | null;
  emergencia_telefone: string | null;
  observacoes: string | null;

  created_at: string;
  updated_at: string;
}

/** Sugestões de vínculo — o campo é texto livre, para caber o que não estiver aqui. */
export const VINCULOS_EQUIPE = ["CLT", "PJ", "Freelancer", "Estágio", "Sócio"] as const;

/**
 * Departamento do Organograma (sub-aba dentro de Cadastros → Equipe, ver
 * `OrganogramaView.tsx`) — uma coluna colorida agrupando cargos. A cor é
 * hex livre; a UI sugere por padrão a mesma paleta categórica de Financeiro
 * (`PALETA_CATEGORIAS`) em vez de uma paleta nova só pra isso.
 */
export interface DepartamentoRow {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  created_at: string;
  updated_at: string;
}

/**
 * Cargo dentro de um departamento do Organograma. Três estados possíveis:
 * "Vago" (`funcionario_id` e `nome_livre` ambos null), vinculado a um
 * membro real da equipe (`funcionario_id -> equipe_membros.id`) ou
 * preenchido com um nome livre pra freelancer/parceiro externo sem
 * cadastro completo (`nome_livre`, `funcionario_id` null).
 */
export interface CargoRow {
  id: string;
  departamento_id: string;
  titulo: string;
  funcionario_id: string | null;
  nome_livre: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
}

/** Cargo enriquecido com o nome do membro vinculado (join em memória), quando houver. */
export type CargoComRelacoes = CargoRow & { funcionario_nome: string | null };

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
