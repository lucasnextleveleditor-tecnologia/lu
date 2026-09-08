import type { PerfilOrcamento } from "@/lib/types/orcamentos";

/**
 * Banco de modelos de contrato "ricos" — um por combinação Profissão × Tipo de
 * Serviço (ex.: filmmaker + videoclipe), com texto jurídico completo e
 * marcadores `[TAG]` (colchetes) para substituição automática via formulário
 * lateral no editor.
 *
 * Convenção de placeholder DIFERENTE da usada hoje em `montarClausulasPadrao`
 * (`src/lib/utils/contratos.ts`), que usa `{{tag}}` (chave única por perfil,
 * 5 variáveis fixas: cliente/empresa/valor_total/condicoes_pagamento/data).
 * Aqui cada modelo carrega seu próprio conjunto de `[TAG]` (dezenas de
 * variáveis, específicas por tipo de serviço) — ver `substituirPlaceholders`
 * abaixo. As duas convenções podem conviver: um contrato criado a partir de
 * um `ModeloContratoServico` já nasce com `[TAG]`s; um contrato "avulso" sem
 * tipo de serviço específico continua caindo no fallback antigo de
 * `montarClausulasPadrao` (`{{tag}}`).
 */
export interface CampoDinamicoModelo {
  /** Nome do marcador SEM colchetes, ex.: "NOME_DO_CLIENTE" (aparece no texto como `[NOME_DO_CLIENTE]`). */
  tag: string;
  /** Rótulo exibido no formulário lateral do editor. */
  label: string;
  tipo: "texto" | "numero" | "data" | "moeda" | "percentual" | "textarea";
  /** Texto de apoio/exemplo mostrado como placeholder do campo. */
  exemplo?: string;
  /** Se marcado, o campo já vem preenchido a partir de dados do orçamento/cliente de origem (ver integração no wizard). */
  autoPreenchivel?: boolean;
}

export interface ModeloContratoServico {
  /** Perfil profissional — mesmo enum já usado em Orçamentos (`PerfilOrcamento`). */
  perfil: PerfilOrcamento;
  /** Slug estável do tipo de serviço dentro do perfil (não traduzir/renomear depois de em uso — vira FK de fato). */
  tipoServico: string;
  /** Rótulo exibido no segundo dropdown ("Tipo de Serviço"). */
  nome: string;
  /** Descrição curta usada como subtítulo/tooltip do card de seleção. */
  descricao: string;
  /** Texto completo das cláusulas, com marcadores `[TAG]`. */
  texto: string;
  /** Campos que o formulário lateral deve renderizar para preencher os `[TAG]` deste modelo, na ordem de exibição. */
  camposDinamicos: CampoDinamicoModelo[];
}

/** Campos que aparecem em praticamente todo modelo — cada arquivo de perfil importa e concatena os específicos do tipo de serviço depois destes. */
export const CAMPOS_COMUNS_CONTRATO: CampoDinamicoModelo[] = [
  { tag: "NOME_DO_CLIENTE", label: "Nome do cliente/contratante", tipo: "texto", autoPreenchivel: true },
  { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto", exemplo: "pessoa jurídica de direito privado" },
  { tag: "CPF_CNPJ_CLIENTE", label: "CPF/CNPJ do cliente", tipo: "texto", autoPreenchivel: true },
  { tag: "ENDERECO_CLIENTE", label: "Endereço do cliente", tipo: "texto", autoPreenchivel: true },
  { tag: "NOME_CONTRATADO", label: "Nome do contratado (você/empresa)", tipo: "texto", autoPreenchivel: true },
  { tag: "QUALIFICACAO_CONTRATADO", label: "Qualificação do contratado", tipo: "texto", exemplo: "empresário individual" },
  { tag: "CPF_CNPJ_CONTRATADO", label: "CPF/CNPJ do contratado", tipo: "texto", autoPreenchivel: true },
  { tag: "ENDERECO_CONTRATADO", label: "Endereço do contratado", tipo: "texto", autoPreenchivel: true },
  { tag: "VALOR_DO_SERVIÇO", label: "Valor total do serviço", tipo: "moeda", autoPreenchivel: true },
  { tag: "CONDICOES_DE_PAGAMENTO", label: "Condições de pagamento", tipo: "textarea", exemplo: "50% de sinal, 50% na entrega" },
  { tag: "PRAZO_DE_ENTREGA", label: "Prazo de entrega (dias corridos)", tipo: "numero", exemplo: "15" },
  { tag: "FORO_COMARCA", label: "Comarca do foro", tipo: "texto", autoPreenchivel: true },
  { tag: "DATA_ASSINATURA", label: "Data de assinatura", tipo: "data", autoPreenchivel: true },
  { tag: "PRAZO_CONFIDENCIALIDADE", label: "Prazo de confidencialidade", tipo: "texto", exemplo: "24 meses" },
];

/**
 * Substitui todos os `[TAG]` presentes no texto pelos valores informados.
 * Tags sem valor preenchido permanecem no texto (destacadas na UI do editor
 * para o usuário perceber o que falta preencher antes de enviar ao cliente).
 */
export function substituirPlaceholders(texto: string, valores: Record<string, string>): string {
  return Object.entries(valores).reduce((acc, [tag, valor]) => {
    if (!valor) return acc;
    return acc.split(`[${tag}]`).join(valor);
  }, texto);
}

/** Lista, em ordem de aparição no texto, quais `[TAG]` ainda não foram substituídas — usado para o aviso "faltam N campos" no editor. */
export function listarPlaceholdersPendentes(texto: string): string[] {
  const matches = texto.match(/\[[A-ZÀ-Ú0-9_]+\]/g) ?? [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}
