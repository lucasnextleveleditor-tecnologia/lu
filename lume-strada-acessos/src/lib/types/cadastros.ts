/** Cadastro completo de um cliente (dados cadastrais) — independente de ter ou não login no sistema. */
export interface ClienteRow {
  id: string;
  /** Nome de EXIBIÇÃO — o que aparece no calendário, nas tarefas e nos relatórios. */
  nome: string;
  /**
   * Quem assina o contrato, quando é diferente do nome de exibição
   * ("Só Crazy - MC Pedrinho" na tela, "Crazy Produções LTDA" no contrato).
   * `null` = os dois são a mesma coisa.
   */
  razao_social: string | null;
  documento: string | null; // CNPJ / CPF
  inscricao_estadual: string | null;
  inscricao_municipal: string | null;
  email: string | null;
  telefone: string | null; // Telefone / WhatsApp
  nome_responsavel: string | null;

  // Endereço em campos próprios — o que um contrato e uma nota fiscal exigem.
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null; // sempre em maiúsculas (normalizado no banco)

  /**
   * O endereço em UMA linha, COMPOSTO pelo banco a partir dos campos acima
   * (gatilho `clientes_compor_endereco`, ver `supabase/cliente-dados-completos.sql`).
   * Nunca escreva aqui: a próxima gravação sobrescreve. Existe porque o
   * contrato e o orçamento precisam da linha pronta, e remontá-la em cada um
   * deles seria a mesma concatenação em dois lugares que vão divergir.
   *
   * Cliente cadastrado antes dos campos separados mantém aqui o texto livre
   * original, e o gatilho não encosta nele até alguém preencher os campos.
   */
  endereco: string | null;
  profile_id: string | null; // uuid -> profiles.id — null até "Gerar Acesso" ser usado
  cor: string | null; // hex ("#RRGGBB") escolhido no cadastro — usado nas etiquetas do Calendário (Produção) pra identificar o cliente visualmente
  /** Token do link fixo do Portal do Cliente (Fase 4) — ver `supabase/portal.sql`. Sempre preenchido (default no banco), nunca null. */
  portal_token: string;
  created_at: string;
  updated_at: string;
}

/**
 * Completa um `ClienteRow` a partir do que o `ClienteModal` devolve ao criar
 * (só id, nome e cor).
 *
 * Existe porque as telas que abrem o cadastro "por dentro" — Agenda e Produção
 * — inserem o cliente novo na lista local sem recarregar a página, e cada uma
 * montava esse objeto na mão. Toda coluna nova no cadastro quebrava as duas de
 * uma vez, e a segunda só era descoberta depois de consertar a primeira.
 *
 * Os campos vêm vazios porque eles ESTÃO vazios: o cliente acabou de nascer
 * com nome e cor. A linha correta chega no próximo carregamento da página.
 */
export function clienteRecemCriado(novo: Pick<ClienteRow, "id" | "nome" | "cor">): ClienteRow {
  return {
    ...novo,
    razao_social: null,
    documento: null,
    inscricao_estadual: null,
    inscricao_municipal: null,
    email: null,
    telefone: null,
    nome_responsavel: null,
    cep: null,
    logradouro: null,
    numero: null,
    complemento: null,
    bairro: null,
    cidade: null,
    uf: null,
    endereco: null,
    profile_id: null,
    portal_token: "",
    created_at: "",
    updated_at: "",
  };
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
