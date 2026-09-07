import type { Tone } from "@/lib/utils/tone";
import type { StatusContrato } from "@/lib/types/contratos";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";

/** Só o tone — o rótulo por extenso vem do dicionário (`dict.contratos.statusXxx`), pra sair traduzido em pt/en/es. Mesmo princípio de `STATUS_ORCAMENTO_TONE`. */
export const STATUS_CONTRATO_TONE: Record<StatusContrato, Tone> = {
  rascunho: "neutral",
  enviado: "neutral",
  visualizado: "warning",
  assinado: "good",
  recusado: "critical",
  cancelado: "critical",
};

/** Gera uma URL absoluta do link público a partir do token — mesmo padrão de `urlPublicaOrcamento`. */
export function urlPublicaContrato(token: string, origem?: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || origem || "";
  return `${base.replace(/\/$/, "")}/contrato/${token}`;
}

export interface PlaceholdersContrato {
  empresa: string;
  cliente: string;
  titulo: string;
  valorTotal: string;
  condicoesPagamento: string;
  data: string;
}

/**
 * Substitui `{{chave}}` pelo valor correspondente no texto do modelo —
 * chamada uma única vez, na criação do contrato, pra gravar o texto final
 * em `contratos.clausulas` (edições depois nunca reaplicam essa troca, ver
 * comentário na migração). Chave que não existir no mapa é deixada como
 * está no texto (nunca lança) — evita que uma variável nova adicionada aqui
 * quebre um modelo antigo digitado à mão pelo usuário.
 */
export function substituirPlaceholders(texto: string, valores: PlaceholdersContrato): string {
  const mapa: Record<string, string> = {
    empresa: valores.empresa,
    cliente: valores.cliente,
    titulo: valores.titulo,
    valor_total: valores.valorTotal,
    condicoes_pagamento: valores.condicoesPagamento,
    data: valores.data,
  };
  return texto.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, chave: string) => {
    const valor = mapa[chave.toLowerCase()];
    return valor !== undefined ? valor : match;
  });
}

// ----------------------------------------------------------------------------
// Rascunhos padrão de cláusulas por perfil profissional — só um PONTO DE
// PARTIDA (o admin edita à vontade em `/admin/contratos/tipos` antes de usar
// com clientes reais). Cobrem objeto, prazo, pagamento, direitos de uso/
// imagem, revisões, cancelamento, confidencialidade e foro — mas isso É UM
// MODELO GENÉRICO, não aconselhamento jurídico: o texto não conhece a
// legislação do estado/país de quem usa o app nem as particularidades de
// cada negócio. Recomendação (mostrada na tela de Tipos de Contrato):
// revisar com um advogado antes do primeiro envio a um cliente.
// ----------------------------------------------------------------------------

const OBJETO_POR_PERFIL: Record<PerfilOrcamento, string> = {
  filmmaker:
    "A CONTRATADA prestará à CONTRATANTE serviços de produção audiovisual referentes a \"{{titulo}}\", incluindo (conforme escopo detalhado nos itens do orçamento/proposta que originou este contrato) pré-produção, captação de imagens e edição do material.",
  videomaker:
    "A CONTRATADA prestará à CONTRATANTE serviços de gravação e edição de vídeo referentes a \"{{titulo}}\", conforme escopo, quantidade de entregas e formatos detalhados nos itens do orçamento/proposta que originou este contrato.",
  social_media:
    "A CONTRATADA prestará à CONTRATANTE serviços de gestão e produção de conteúdo para redes sociais referentes a \"{{titulo}}\", incluindo planejamento de calendário editorial, criação de conteúdo e publicação, conforme escopo detalhado nos itens do orçamento/proposta que originou este contrato.",
  storymaker:
    "A CONTRATADA prestará à CONTRATANTE serviços de criação de conteúdo em formato de stories/vídeos curtos referentes a \"{{titulo}}\", conforme escopo, periodicidade e quantidade de entregas detalhados nos itens do orçamento/proposta que originou este contrato.",
  designer:
    "A CONTRATADA prestará à CONTRATANTE serviços de design gráfico/visual referentes a \"{{titulo}}\", conforme escopo, peças e quantidade de revisões detalhados nos itens do orçamento/proposta que originou este contrato.",
  fotografo:
    "A CONTRATADA prestará à CONTRATANTE serviços de fotografia referentes a \"{{titulo}}\", incluindo sessão(ões) fotográfica(s), seleção e tratamento de imagens, conforme escopo e quantidade de fotos entregues detalhados nos itens do orçamento/proposta que originou este contrato.",
  agencia_marketing:
    "A CONTRATADA prestará à CONTRATANTE serviços de marketing referentes a \"{{titulo}}\", incluindo planejamento estratégico, execução de campanhas e/ou gestão de mídia, conforme escopo e indicadores detalhados nos itens do orçamento/proposta que originou este contrato.",
};

const DIREITOS_USO_POR_PERFIL: Record<PerfilOrcamento, string> = {
  filmmaker:
    "Concluído o pagamento integral, a CONTRATANTE recebe os direitos de uso do material audiovisual finalizado para os fins descritos no objeto deste contrato. A CONTRATADA mantém o direito de exibir o material (ou trechos) em seu portfólio e redes sociais para fins de divulgação profissional, salvo restrição expressa e por escrito da CONTRATANTE. Direitos autorais sobre material bruto (brutos/rushes) não utilizado na entrega final permanecem com a CONTRATADA.",
  videomaker:
    "Concluído o pagamento integral, a CONTRATANTE recebe os direitos de uso dos vídeos finalizados para os fins descritos no objeto deste contrato. A CONTRATADA mantém o direito de exibir o material em seu portfólio e redes sociais para fins de divulgação profissional, salvo restrição expressa e por escrito da CONTRATANTE.",
  social_media:
    "O conteúdo produzido é de uso da CONTRATANTE nos canais e para os fins acordados. A CONTRATADA mantém o direito de exibir peças/campanhas em seu portfólio para fins de divulgação profissional, salvo restrição expressa e por escrito da CONTRATANTE.",
  storymaker:
    "O conteúdo produzido é de uso da CONTRATANTE nos canais e para os fins acordados. A CONTRATADA mantém o direito de exibir peças em seu portfólio para fins de divulgação profissional, salvo restrição expressa e por escrito da CONTRATANTE.",
  designer:
    "Concluído o pagamento integral, os arquivos finais e direitos de uso das peças de design passam à CONTRATANTE para os fins descritos no objeto deste contrato. Arquivos-fonte (editáveis) são entregues apenas se expressamente incluídos no escopo contratado. A CONTRATADA mantém o direito de exibir as peças em seu portfólio, salvo restrição expressa e por escrito da CONTRATANTE.",
  fotografo:
    "Concluído o pagamento integral, a CONTRATANTE recebe os direitos de uso das fotografias tratadas e entregues para os fins descritos no objeto deste contrato. A CONTRATADA mantém a autoria das imagens e o direito de exibi-las em seu portfólio e redes sociais para fins de divulgação profissional, salvo restrição expressa e por escrito da CONTRATANTE. Imagens brutas não selecionadas na entrega final permanecem com a CONTRATADA.",
  agencia_marketing:
    "Peças, campanhas e materiais produzidos são de uso da CONTRATANTE nos canais e para os fins acordados, uma vez quitados os valores devidos. A CONTRATADA mantém o direito de citar o trabalho e exibir peças/resultados (de forma anonimizada quando aplicável) em seu portfólio, salvo restrição expressa e por escrito da CONTRATANTE.",
};

/**
 * Monta o rascunho inicial completo (objeto + direitos de uso variam por
 * perfil; as demais cláusulas são o mesmo esqueleto genérico pra todos) —
 * usado como sugestão ao abrir `/admin/contratos/tipos` pela primeira vez
 * pra um perfil ainda sem modelo salvo. Sempre editável antes de salvar.
 */
export function montarClausulasPadrao(perfil: PerfilOrcamento): string {
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{cliente}}
CONTRATADA: {{empresa}}

1. OBJETO
${OBJETO_POR_PERFIL[perfil]}

2. PRAZO
Os prazos de entrega seguem o cronograma combinado entre as partes ao longo da execução do serviço, podendo ser ajustados de comum acordo em caso de solicitações adicionais da CONTRATANTE ou de força maior.

3. VALOR E FORMA DE PAGAMENTO
O valor total dos serviços descritos neste contrato é de {{valor_total}}. Condições de pagamento: {{condicoes_pagamento}}. Em caso de atraso no pagamento, a CONTRATADA pode suspender a execução dos serviços até a regularização.

4. DIREITOS DE USO
${DIREITOS_USO_POR_PERFIL[perfil]}

5. REVISÕES E ALTERAÇÕES
Alterações de escopo não previstas originalmente podem gerar ajuste de prazo e/ou de valor, a ser acordado entre as partes antes de sua execução.

6. CANCELAMENTO
Em caso de cancelamento pela CONTRATANTE após o início da execução dos serviços, os valores referentes às etapas já realizadas são devidos à CONTRATADA, sem devolução.

7. CONFIDENCIALIDADE
As partes se comprometem a manter sigilo sobre informações confidenciais trocadas em razão deste contrato, salvo quando a divulgação for exigida por lei.

8. DISPOSIÇÕES GERAIS
Este contrato é regido pela legislação brasileira. Qualquer alteração deve ser feita por escrito e com aceite de ambas as partes. Fica eleito o foro do domicílio da CONTRATADA para dirimir eventuais controvérsias, salvo disposição diversa acordada entre as partes.

Contrato gerado em {{data}}.`;
}

/** As mesmas condições de pagamento sugeridas nos modelos de Orçamento (Fase 2) servem de ponto de partida aqui também — reaproveitado só como default de exibição, cada empresa edita o próprio modelo de Tipos de Contrato livremente. */
export const CONDICOES_PAGAMENTO_PADRAO_SUGERIDA = "50% de sinal para início dos trabalhos, 50% na entrega final.";
