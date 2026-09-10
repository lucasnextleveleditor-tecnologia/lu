import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import { BANCO_DE_MODELOS, type ModeloContratoServico } from "./index";
import type { FormatadorMoeda } from "@/lib/types/moeda";

/**
 * Ponte entre os dados já conhecidos pelo banco (cliente, empresa, orçamento
 * de origem) e a convenção `[TAG]` do banco de modelos ricos
 * (`BANCO_DE_MODELOS`, ver `tipos.ts`). `listarModelosPorPerfil`/`buscarModelo`
 * aqui só reexportam os de `index.ts` com uma variante null-safe pra facilitar
 * o uso direto no wizard (`ContratoBuilder.tsx`), sem cada chamador precisar
 * checar `perfil` antes.
 */

/** Igual a `buscarModelo` de `./index`, só documentando o par (perfil, tipoServico) como a chave de busca do wizard. */
export function buscarModelo(perfil: PerfilOrcamento, tipoServico: string): ModeloContratoServico | undefined {
  return BANCO_DE_MODELOS[perfil]?.find((m) => m.tipoServico === tipoServico);
}

/** Variante null-safe de `listarModelosPorPerfil` (`./index`) — devolve `[]` quando nenhum perfil foi escolhido ainda, pro <Select> de Tipo de Serviço do wizard não precisar checar antes de renderizar. */
export function listarModelosPorPerfil(perfil: PerfilOrcamento | null | undefined): ModeloContratoServico[] {
  if (!perfil) return [];
  return BANCO_DE_MODELOS[perfil] ?? [];
}

export interface ContextoAutoPreenchimento {
  cliente?: { nome?: string | null; documento?: string | null; endereco?: string | null } | null;
  nomeDestinatario?: string | null;
  empresa?: { nome?: string | null; cpfCnpj?: string | null; endereco?: string | null } | null;
  valorTotal?: number;
  condicoesPagamento?: string | null;
  dataAssinatura?: string;
  /** Formatador já amarrado na moeda da empresa — vem de quem chama (`useLocale()`), porque uma lib pura não lê configuração. */
  fmtMoeda: FormatadorMoeda;
}

/**
 * Monta o mapa `{ TAG: valor }` dos campos `autoPreenchivel` (ver
 * `CAMPOS_COMUNS_CONTRATO` em `tipos.ts`) a partir de dados já disponíveis no
 * wizard — cliente selecionado, empresa (CONTRATADO, sempre `companies.nome`
 * real, nunca `nome_app`/branding — ver nota em `ContratoBuilder.tsx`), total
 * calculado dos itens, condições de pagamento e data. Só inclui uma chave
 * quando o valor de origem é verdadeiro/não-vazio: `substituirPlaceholders`
 * (`tipos.ts`) ignora chaves ausentes/vazias e deixa o `[TAG]` intacto no
 * texto, o que é exatamente o comportamento desejado aqui — campo sem dado
 * conhecido cai no formulário de pendências pro usuário preencher na mão.
 */
export function montarValoresAutoPreenchiveis(ctx: ContextoAutoPreenchimento): Record<string, string> {
  const valores: Record<string, string> = {};

  const nomeCliente = ctx.cliente?.nome || ctx.nomeDestinatario;
  if (nomeCliente) valores.NOME_DO_CLIENTE = nomeCliente;
  if (ctx.cliente?.documento) valores.CPF_CNPJ_CLIENTE = ctx.cliente.documento;
  if (ctx.cliente?.endereco) valores.ENDERECO_CLIENTE = ctx.cliente.endereco;

  if (ctx.empresa?.nome) valores.NOME_CONTRATADO = ctx.empresa.nome;
  if (ctx.empresa?.cpfCnpj) valores.CPF_CNPJ_CONTRATADO = ctx.empresa.cpfCnpj;
  if (ctx.empresa?.endereco) valores.ENDERECO_CONTRATADO = ctx.empresa.endereco;

  // O formatador vem de fora porque a moeda é da empresa e esta função é
  // uma lib pura — não tem como (nem deve) ler configuração sozinha.
  if (typeof ctx.valorTotal === "number" && ctx.valorTotal > 0) valores["VALOR_DO_SERVIÇO"] = ctx.fmtMoeda(ctx.valorTotal);
  if (ctx.condicoesPagamento) valores.CONDICOES_DE_PAGAMENTO = ctx.condicoesPagamento;

  valores.DATA_ASSINATURA = ctx.dataAssinatura || new Date().toLocaleDateString("pt-BR");

  return valores;
}
