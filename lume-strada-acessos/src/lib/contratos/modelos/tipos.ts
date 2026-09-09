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
  /**
   * Texto completo das cláusulas num bloco só, com marcadores `[TAG]`.
   *
   * Forma ANTIGA, mantida para os modelos que ainda não foram reescritos
   * cláusula a cláusula — `obterClausulas` quebra este texto sozinho, então
   * eles funcionam no checklist sem nenhuma mudança. Modelo novo não usa
   * este campo: usa `clausulas`.
   */
  texto?: string;
  /** As cláusulas separadas, na ordem em que devem aparecer. Quando presente, manda — `texto` é ignorado. */
  clausulas?: ClausulaModelo[];
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

/* ==================================================================== */
/* CLÁUSULA A CLÁUSULA                                                   */
/* ==================================================================== */

/**
 * Uma cláusula isolada de um modelo.
 *
 * O contrato deixou de ser um bloco único de texto e passou a ser uma LISTA
 * de cláusulas, porque é assim que ele é negociado na vida real: o cliente
 * não recusa "o contrato", recusa a cláusula de exclusividade, ou pede para
 * tirar a multa de remarcação. Com o texto num bloco só, mexer numa cláusula
 * significava reescrever o documento inteiro à mão e torcer para a numeração
 * continuar batendo.
 *
 * O número NÃO fica guardado aqui. Ele é calculado na montagem, sobre as
 * cláusulas que sobraram — se a quinta sai, a sexta vira quinta sozinha. É
 * por isso também que nenhuma cláusula deve se referir a outra pelo número
 * ("nos termos da Cláusula Sexta"): cita-se pelo nome ("na cláusula Do
 * Objeto"), que não muda quando alguém desmarca uma caixa acima.
 */
export interface ClausulaModelo {
  /** Slug estável dentro do modelo — é o que fica marcado/desmarcado no checklist. */
  id: string;
  /** Título da cláusula, sem o número: "Do Objeto", "Da Rescisão". */
  titulo: string;
  /** Corpo da cláusula, com `[TAG]`s. Sem o cabeçalho "CLÁUSULA X — ..." (ele é gerado). */
  texto: string;
  /**
   * Cláusula que sustenta o contrato de pé — quem são as partes, o que foi
   * contratado, quanto custa, onde se discute. Vem marcada e não pode ser
   * desmarcada: sem ela não sobra contrato, sobra carta de intenções.
   */
  essencial?: boolean;
  /** Nasce DESMARCADA: só entra quando o caso pede (drone, viagem, exclusividade). */
  opcional?: boolean;
  /** Uma linha dizendo o que essa cláusula protege — aparece ao lado da caixa, para a escolha ser informada. */
  protege?: string;
  /**
   * Cláusula escrita pelo próprio profissional dentro de um contrato, e não
   * vinda do banco de modelos. Existe porque nenhum modelo cobre tudo: falta
   * a regra de estacionamento daquele condomínio, a exigência do jurídico do
   * cliente, o combinado que só aquele trabalho tem. A marca serve à tela —
   * é ela que libera renomear e excluir a cláusula, o que não faz sentido
   * para as do banco.
   */
  personalizada?: boolean;
}

/** Ordinais por extenso, em maiúsculas, como se escreve em contrato. */
const ORDINAIS = [
  "PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA", "SEXTA", "SÉTIMA", "OITAVA", "NONA", "DÉCIMA",
  "DÉCIMA PRIMEIRA", "DÉCIMA SEGUNDA", "DÉCIMA TERCEIRA", "DÉCIMA QUARTA", "DÉCIMA QUINTA",
  "DÉCIMA SEXTA", "DÉCIMA SÉTIMA", "DÉCIMA OITAVA", "DÉCIMA NONA", "VIGÉSIMA",
  "VIGÉSIMA PRIMEIRA", "VIGÉSIMA SEGUNDA", "VIGÉSIMA TERCEIRA", "VIGÉSIMA QUARTA", "VIGÉSIMA QUINTA",
  "VIGÉSIMA SEXTA", "VIGÉSIMA SÉTIMA", "VIGÉSIMA OITAVA", "VIGÉSIMA NONA", "TRIGÉSIMA",
  "TRIGÉSIMA PRIMEIRA", "TRIGÉSIMA SEGUNDA", "TRIGÉSIMA TERCEIRA", "TRIGÉSIMA QUARTA", "TRIGÉSIMA QUINTA",
];

/** "PRIMEIRA" para 1, "DÉCIMA SEGUNDA" para 12. Acima da tabela, cai no número mesmo — é feio, mas é melhor do que quebrar. */
export function ordinalDeClausula(posicao: number): string {
  return ORDINAIS[posicao - 1] ?? `${posicao}ª`;
}

/**
 * Quebra um texto corrido em cláusulas, achando os cabeçalhos
 * "CLÁUSULA PRIMEIRA — Do Objeto".
 *
 * Existe para os modelos ainda escritos como bloco único: eles entram no
 * checklist sem precisar ser reescritos de uma vez. O que vier antes do
 * primeiro cabeçalho (título do contrato e qualificação das partes) vira uma
 * cláusula de abertura, marcada como essencial — não é cláusula numerada, e
 * por isso ganha `id: "preambulo"`, que a montagem trata à parte.
 */
export function dividirTextoEmClausulas(texto: string): ClausulaModelo[] {
  // Dois feitios de cabeçalho convivem no banco: os modelos escritos por
  // extenso ("CLÁUSULA PRIMEIRA — Do Objeto") e os mais antigos, numerados
  // ("1. DO OBJETO"). Tenta o primeiro; não achando nada, tenta o segundo,
  // para que nenhum modelo caia no bloco único só por causa da grafia.
  const porExtenso = /^CL[ÁA]USULA\s+([A-ZÀ-Ú\s]+?)\s*[—–-]\s*(.+)$/gm;
  const numerado = /^(\d{1,2})\.\s+([A-ZÀ-Ú][^\n]*)$/gm;

  const cabecalhos: { indice: number; tamanho: number; titulo: string }[] = [];
  const coletar = (marcador: RegExp) => {
    let achado: RegExpExecArray | null;
    while ((achado = marcador.exec(texto)) !== null) {
      cabecalhos.push({ indice: achado.index, tamanho: achado[0].length, titulo: (achado[2] ?? "Cláusula").trim() });
    }
  };

  coletar(porExtenso);
  if (cabecalhos.length === 0) coletar(numerado);

  if (cabecalhos.length === 0) {
    return [{ id: "documento", titulo: "Texto do contrato", texto: texto.trim(), essencial: true }];
  }

  const clausulas: ClausulaModelo[] = [];
  const abertura = texto.slice(0, cabecalhos[0]!.indice).trim();
  if (abertura) clausulas.push({ id: "preambulo", titulo: "Qualificação das partes", texto: abertura, essencial: true });

  cabecalhos.forEach((c, i) => {
    const inicio = c.indice + c.tamanho;
    const fim = i + 1 < cabecalhos.length ? cabecalhos[i + 1]!.indice : texto.length;
    clausulas.push({
      id: `c${i + 1}`,
      titulo: c.titulo,
      texto: texto.slice(inicio, fim).trim(),
      essencial: i === 0,
    });
  });

  return clausulas;
}

/** As cláusulas de um modelo, venha ele já em lista ou ainda como bloco único. */
export function obterClausulas(modelo: ModeloContratoServico): ClausulaModelo[] {
  if (modelo.clausulas && modelo.clausulas.length > 0) return modelo.clausulas;
  return dividirTextoEmClausulas(modelo.texto ?? "");
}

/** As que já nascem marcadas: tudo menos as `opcional`. */
export function clausulasPadraoSelecionadas(modelo: ModeloContratoServico): string[] {
  return obterClausulas(modelo)
    .filter((c) => !c.opcional)
    .map((c) => c.id);
}

/**
 * Monta o contrato final a partir das cláusulas escolhidas.
 *
 * A numeração sai daqui, e só daqui: conta as que sobraram, na ordem do
 * modelo. `sobrescritas` são os textos que a pessoa editou na tela — o
 * modelo não é alterado, o que muda é o que vai para ESTE contrato.
 */
export function montarTextoDoContrato(
  modelo: ModeloContratoServico,
  idsSelecionados: readonly string[],
  sobrescritas: Record<string, string> = {}
): string {
  return montarTextoDeClausulas(obterClausulas(modelo), idsSelecionados, sobrescritas);
}

/**
 * A mesma montagem, mas a partir de uma lista de cláusulas montada por fora.
 *
 * É esta que a tela usa, porque lá a lista não é mais a do modelo: pode ter
 * sido reordenada com o arraste e pode conter cláusulas escritas pela própria
 * pessoa. A ORDEM DA LISTA MANDA — a numeração sai da posição em que cada
 * cláusula está aqui, não de onde ela nasceu no modelo.
 */
export function montarTextoDeClausulas(
  clausulas: readonly ClausulaModelo[],
  idsSelecionados: readonly string[],
  sobrescritas: Record<string, string> = {}
): string {
  const escolhidas = new Set(idsSelecionados);
  const partes: string[] = [];
  let numero = 0;

  for (const clausula of clausulas) {
    if (!escolhidas.has(clausula.id)) continue;
    const corpo = (sobrescritas[clausula.id] ?? clausula.texto).trim();
    if (!corpo) continue;

    // O preâmbulo abre o documento e não recebe número: ele é a
    // qualificação das partes, não uma obrigação pactuada.
    if (clausula.id === "preambulo" || clausula.id === "documento") {
      partes.push(corpo);
      continue;
    }

    numero += 1;
    partes.push(`CLÁUSULA ${ordinalDeClausula(numero)} — ${clausula.titulo}\n\n${corpo}`);
  }

  return partes.join("\n\n");
}
