import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";
import {
  CAMPOS_OPERACIONAIS_COMUNS,
  CLAUSULAS_DE_FECHAMENTO,
  CLAUSULA_ALTERACOES_DE_ESCOPO,
  CLAUSULA_APROVACAO_E_REFACOES,
  CLAUSULA_BACKUP,
  CLAUSULA_DIREITOS_AUTORAIS,
  CLAUSULA_DIREITO_DE_IMAGEM,
  CLAUSULA_ENTREGA,
  CLAUSULA_OBRIGACOES_DAS_PARTES,
  CLAUSULA_PORTFOLIO,
  CLAUSULA_PRAZOS_E_INSUMOS,
} from "./clausulas-comuns";
import {
  CAMPOS_MARCA,
  CAMPOS_SERVICO_CONTINUO,
  CAMPOS_TRAFEGO,
  CLAUSULAS_DE_ROTINA,
  CLAUSULA_ACESSOS_E_CONTAS,
  CLAUSULA_ARQUIVOS_ABERTOS,
  CLAUSULA_CESSAO_DE_MARCA,
  CLAUSULA_HOMOLOGACAO_TECNICA,
  CLAUSULA_PLATAFORMAS_TERCEIROS,
  CLAUSULA_ROTINA_E_ATENDIMENTO,
  CLAUSULA_VIGENCIA_E_RENOVACAO,
} from "./clausulas-continuas";


/**
 * Banco de modelos de contrato do perfil DESIGNER — v2, 7 tipos de serviço
 * (substitui a v1 de 5 tipos genéricos). Cláusulas específicas do nicho:
 * exclusão de responsabilidade do designer por conformidade regulatória de
 * rótulos, por erro aprovado em prova de impressão, por conflito de marca
 * sem busca prévia de disponibilidade contratada, e por divergência entre
 * design entregue e implementação técnica de terceiros (UI/UX).
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_DESIGNER: ModeloContratoServico[] = [
  {
    perfil: "designer",
    tipoServico: "design_redes_sociais",
    nome: "Design para Redes Sociais",
    descricao: "Criação mensal de peças gráficas para redes sociais, dentro da identidade visual já existente da marca, em regime de pacote mensal.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo de aprovação de pauta", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN PARA REDES SOCIAIS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de peças gráficas para as redes sociais da CONTRATANTE, em regime de contrato mensal contínuo, dentro da identidade visual já existente da marca.

2. DO ESCOPO MENSAL
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário: [CALENDARIO_DE_PAUTAS], aprovado em até [PRAZO_APROVACAO_PAUTA].
2.2. Peças fora do escopo mensal (materiais impressos, apresentações institucionais, embalagens) são orçadas à parte.

3. DO PRAZO DE ENTREGA
3.1. Cada peça entregue em até [PRAZO_DE_ENTREGA] dias corridos após aprovação do briefing/pauta.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste por peça. Rodadas adicionais cobradas à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão da produção do mês.

6. DA VIGÊNCIA E DA RESCISÃO
6.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

7. DO ARMAZENAMENTO PÓS-CONTRATO
7.1. Arquivos-fonte (editáveis) mantidos apenas durante a vigência, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento. Recuperação cobrada a [VALOR_TAXA_REENVIO].

8. DOS DIREITOS DE USO
8.1. Cedidos à CONTRATANTE os direitos de uso das peças, mediante pagamento integral. O(a) CONTRATADO(A) pode usar em portfólio, salvo vedação por escrito.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre calendário de lançamentos e informações internas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor da mensalidade do mês do fato gerador, excluída responsabilidade por resultado de engajamento/vendas.
12.2. A CONTRATANTE indeniza por: (i) informações/imagens fornecidas por ela sem direito de uso; (ii) publicidade enganosa decorrente de informação de sua responsabilidade; (iii) uso do material fora do combinado.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "design_embalagens_rotulos",
    nome: "Design de Embalagens e Rótulos",
    descricao: "Design de embalagem/rótulo, com responsabilidade regulatória (ANVISA/INPI, tabela nutricional etc.) exclusiva da contratante e transferência de responsabilidade após aprovação da prova de impressão.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_PRODUTO", label: "Nome do produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_DE_PROPOSTAS_INICIAIS", label: "Nº de propostas iniciais", tipo: "numero", exemplo: "2" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN DE EMBALAGENS E RÓTULOS

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de design de embalagem/rótulo para o produto [NOME_DO_PRODUTO], compreendendo [DESCRICAO_DOS_ENTREGAVEIS].

2. DO ESCOPO E DA RESPONSABILIDADE REGULATÓRIA
2.1. Etapas: briefing, [NUMERO_DE_PROPOSTAS_INICIAIS] propostas de conceito, refinamento, arquivo final pronto para impressão (print-ready).
2.2. Da conformidade regulatória (cláusula essencial): cabe exclusivamente à CONTRATANTE fornecer todas as informações obrigatórias por lei/regulamento para o rótulo do produto (ex.: tabela nutricional, registro em órgão sanitário/ANVISA, informações de composição, selo de certificação, avisos legais), bem como validar o layout final quanto ao cumprimento dessas exigências antes da aprovação de impressão. O(a) CONTRATADO(A) diagrama as informações fornecidas, mas não responde pela veracidade, completude ou conformidade regulatória do conteúdo técnico do rótulo.
2.3. A aprovação da "prova de impressão" (arquivo final revisado pela CONTRATANTE) transfere a esta a responsabilidade por qualquer erro remanescente não apontado nessa revisão.

3. DO PRAZO DE ENTREGA
3.1. Entrega do arquivo final em até [PRAZO_DE_ENTREGA] dias corridos após a aprovação do conceito e o fornecimento de todas as informações regulatórias pela CONTRATANTE.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste. Alterações após aprovação da prova de impressão (cláusula 2.3) são cobradas à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final liberado após quitação integral.

6. DA CESSÃO DE DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do design para o produto especificado, sem limitação de prazo, mediante pagamento integral. O(a) CONTRATADO(A) pode usar em portfólio, salvo vedação por escrito.

7. DA RESCISÃO
7.1. Desistência após início do trabalho: pagamento proporcional às etapas entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre a fórmula/produto não lançado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por conformidade regulatória do conteúdo do rótulo (cláusula 2.2) e por erros aprovados na prova de impressão (cláusula 2.3).
11.2. A CONTRATANTE indeniza por: (i) informações técnicas/regulatórias incorretas ou incompletas fornecidas por ela; (ii) autuação de órgão sanitário/de defesa do consumidor decorrente de informação de sua responsabilidade; (iii) uso do material fora da cessão concedida.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "design_editorial",
    nome: "Design Editorial (Catálogos, E-books, Revistas)",
    descricao: "Diagramação editorial, com responsabilidade sobre conteúdo textual/fotográfico exclusiva da contratante e transferência de responsabilidade após aprovação da prova final.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "TIPO_DE_MATERIAL_EDITORIAL", label: "Tipo de material editorial", tipo: "texto", exemplo: "e-book" },
      { tag: "TITULO_DA_PUBLICACAO", label: "Título da publicação", tipo: "texto" },
      { tag: "NUMERO_DE_PAGINAS", label: "Número de páginas aproximado", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN EDITORIAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Diagramação/design editorial de [TIPO_DE_MATERIAL_EDITORIAL] intitulado "[TITULO_DA_PUBLICACAO]", com [NUMERO_DE_PAGINAS] páginas aproximadas.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. O conteúdo textual, fotográfico e informativo da publicação é de responsabilidade e autoria da CONTRATANTE, cabendo ao(à) CONTRATADO(A) exclusivamente a diagramação/design gráfico do material fornecido.
2.2. Revisão ortográfica/gramatical do texto não está inclusa, salvo contratação expressa de serviço adicional de revisão textual.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após o recebimento de todo o conteúdo (texto final e imagens em alta resolução) pela CONTRATANTE.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste de diagramação. Alterações substanciais de conteúdo/texto após o início da diagramação, que exijam reestruturação do layout, são cobradas à parte.
4.2. A aprovação da prova final pela CONTRATANTE transfere a esta a responsabilidade por qualquer erro remanescente não apontado nessa revisão, inclusive em caso de impressão física.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final liberado após quitação integral.

6. DA CESSÃO DE DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do design diagramado, sem limitação de prazo, mediante pagamento integral. Os direitos autorais do conteúdo textual/fotográfico fornecido pela CONTRATANTE permanecem com esta ou com seus respectivos autores. O(a) CONTRATADO(A) pode usar o design em portfólio, salvo vedação por escrito.

7. DA RESCISÃO
7.1. Desistência após início do trabalho: pagamento proporcional às páginas já diagramadas, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o conteúdo da publicação não lançada pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por erros de conteúdo textual/informativo fornecido pela CONTRATANTE e por erro aprovado na prova final (cláusula 4.2).
11.2. A CONTRATANTE indeniza por: (i) violação de direitos autorais de terceiros no conteúdo textual/fotográfico fornecido por ela; (ii) informações incorretas de sua responsabilidade; (iii) uso do design fora da cessão concedida.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "ilustracao_personalizada",
    nome: "Ilustração Personalizada / Arte Autoral",
    descricao: "Criação de ilustração autoral com licenciamento de uso por prazo/meios definidos, autoria preservada nos termos da Lei nº 9.610/98 e vedação de alteração não autorizada da obra.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_TEMA", label: "Descrição do tema", tipo: "textarea" },
      { tag: "FINALIDADE_DA_ILUSTRACAO", label: "Finalidade da ilustração", tipo: "textarea", exemplo: "capa de livro, mascote de marca" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ESBOCO", label: "Prazo de entrega do esboço", tipo: "texto", exemplo: "5 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_RODADA_ADICIONAL", label: "Valor de rodada adicional", tipo: "moeda" },
      { tag: "EXCLUSIVA/NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de uso", tipo: "textarea" },
      { tag: "CRITERIO_LICENCA_AMPLIADA", label: "Critério de licença ampliada", tipo: "textarea" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ILUSTRAÇÃO PERSONALIZADA

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de ilustração(ões) autoral(is) sobre o tema [DESCRICAO_DO_TEMA], para a finalidade de [FINALIDADE_DA_ILUSTRACAO].

2. DO ESCOPO
2.1. Etapas: briefing/referências, esboço (thumbnail/rascunho), aprovação de linha e composição, finalização com cor/acabamento. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].

3. DO PRAZO DE ENTREGA
3.1. Entrega do esboço em até [PRAZO_ESBOCO] dias corridos após o briefing. Entrega final em até [PRAZO_DE_ENTREGA] dias corridos após a aprovação do esboço.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste sobre o esboço aprovado. Mudança de conceito/composição já aprovada é cobrada à parte no valor de [VALOR_RODADA_ADICIONAL].

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final em alta resolução liberado após quitação integral.

6. DA CESSÃO DE DIREITOS AUTORAIS E DA LICENÇA DE USO
6.1. O(a) CONTRATADO(A), autor(a) da obra, cede à CONTRATANTE licença de uso da ilustração, de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para os fins de [MEIOS_E_TERRITORIO]. Nos termos da Lei nº 9.610/98, a autoria da obra permanece do(a) CONTRATADO(A), sendo assegurado crédito autoral em toda utilização, salvo caso técnico que inviabilize a assinatura.
6.2. Uso além do prazo/meios pactuados (ex.: licenciamento para produtos derivados, merchandising, uso institucional perene) depende de negociação e pagamento adicional de licença ampliada, conforme [CRITERIO_LICENCA_AMPLIADA].
6.3. O(a) CONTRATADO(A) pode usar a ilustração em portfólio pessoal e divulgação profissional, salvo pedido expresso e por escrito de embargo de divulgação por prazo determinado.
6.4. É vedada a alteração da ilustração (recorte, distorção, adição de elementos) sem autorização do(a) CONTRATADO(A), ressalvadas adaptações técnicas de formato previamente combinadas (ex.: redimensionamento simples para diferentes aplicações).

7. DA RESCISÃO
7.1. Desistência após aprovação do esboço: pagamento proporcional às etapas entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o projeto/produto não lançado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por lucros cessantes ou danos indiretos.
11.2. A CONTRATANTE indeniza por: (i) uso da ilustração fora dos limites da licença concedida (cláusula 6.1/6.2); (ii) alteração não autorizada da obra (cláusula 6.4); (iii) informações/referências fornecidas que violem direitos de terceiros.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  /* ================================================================== */
  /* GRUPO 5 — DESIGNER · 1. IDENTIDADE VISUAL / BRANDING               */
  /* ================================================================== */
  {
    perfil: "designer",
    tipoServico: "identidade_visual_branding",
    nome: "Identidade Visual / Branding",
    descricao:
      "Criação de marca com cessão definitiva de direitos ao cliente, propostas contadas, arquivos vetoriais garantidos, ressalva sobre busca de anterioridade no INPI e crédito de autoria preservado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_MARCA,
      { tag: "SEGMENTO_DA_MARCA", label: "Segmento de atuação", tipo: "texto" },
      { tag: "ETAPAS_DO_PROJETO", label: "Etapas do projeto", tipo: "textarea", exemplo: "imersão e briefing, pesquisa e território criativo, propostas, refinamento, manual e entrega" },
      { tag: "PRAZO_ETAPA_PESQUISA", label: "Prazo da etapa de pesquisa", tipo: "texto", exemplo: "10 dias úteis" },
      { tag: "PRAZO_ETAPA_CRIACAO", label: "Prazo da etapa de criação", tipo: "texto", exemplo: "15 dias úteis" },
      { tag: "APLICACOES_INCLUSAS", label: "Aplicações inclusas", tipo: "textarea", exemplo: "cartão de visita, assinatura de e-mail, papel timbrado e avatar de redes" },
      { tag: "VALOR_APLICACAO_EXTRA", label: "Valor de aplicação extra", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE IDENTIDADE VISUAL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002, pela Lei nº 9.610/1998 e pela Lei nº 9.279/1996.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a criação da identidade visual da marca [NOME_DA_MARCA_OU_PRODUTO], atuante no segmento [SEGMENTO_DA_MARCA].

Parágrafo primeiro. O projeto observará as etapas: [ETAPAS_DO_PROJETO], com prazos de [PRAZO_ETAPA_PESQUISA] para a pesquisa e [PRAZO_ETAPA_CRIACAO] para a criação.

Parágrafo segundo. Os entregáveis compreendem: [ENTREGAVEIS_MARCA], além das aplicações [APLICACOES_INCLUSAS]. Aplicações adicionais serão orçadas a [VALOR_APLICACAO_EXTRA] cada.

Parágrafo terceiro. Serão apresentadas [NUMERO_PROPOSTAS_CONCEITO] propostas de conceito, entre as quais a CONTRATANTE escolherá UMA para refinamento. Não há apresentação de propostas adicionais dentro do preço contratado: cada nova rodada de conceito equivale a novo ciclo criativo e será orçada como alteração de escopo.

Parágrafo quarto. NÃO integram o objeto, salvo contratação apartada: naming e criação de nome; registro de marca no INPI e honorários de agente da propriedade industrial; busca de anterioridade marcária; embalagens, rótulos e materiais impressos; site, e-commerce e interfaces digitais; fotografia e vídeo; sinalização e ambientação; e material de campanha.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "processo_criativo_marca",
        titulo: "Do Processo Criativo, do Briefing e da Escolha da Proposta",
        essencial: true,
        protege: "Briefing ruim custa caro — e escolher uma proposta é fechar, não abrir a negociação.",
        texto: `O projeto parte do briefing preenchido e assinado pela CONTRATANTE, que declara que as informações nele prestadas — público, posicionamento, concorrência, valores da marca, referências e restrições — são verdadeiras e completas.

Parágrafo primeiro. Alteração substancial de briefing após o início da criação — mudança de público, de posicionamento, de nome, de segmento ou de referências — constitui alteração de escopo e enseja reorçamento da etapa afetada.

Parágrafo segundo. As propostas de conceito serão apresentadas em conjunto, acompanhadas da respectiva justificativa estratégica, e a CONTRATANTE escolherá UMA no prazo de [PRAZO_APROVACAO_CLIENTE]. A ESCOLHA É DEFINITIVA: escolhido o caminho, o trabalho segue para refinamento, não sendo admitido retomar proposta descartada, combinar elementos de propostas distintas ou solicitar nova rodada de conceitos dentro do preço.

Parágrafo terceiro. O refinamento comporta [NUMERO_REVISOES_INCLUSAS] rodadas de ajuste sobre a proposta escolhida, limitadas a proporção, cor, tipografia, espaçamento e variações de aplicação — não a mudança de conceito.

Parágrafo quarto. A submissão da marca a votação popular, enquete em redes sociais, pesquisa com clientes ou apreciação de terceiros não vincula o CONTRATADO e não substitui a decisão do responsável indicado pela CONTRATANTE; o tempo consumido nessas consultas corre por conta dela, na forma da cláusula Dos Prazos.

Parágrafo quinto. Propostas não escolhidas permanecem de titularidade do CONTRATADO, que poderá reaproveitá-las em outros projetos, vedado à CONTRATANTE utilizá-las sob qualquer forma.`,
      },
      CLAUSULA_CESSAO_DE_MARCA,
      CLAUSULA_ARQUIVOS_ABERTOS,
      {
        id: "manual_e_uso",
        titulo: "Do Manual de Marca e do Uso Correto",
        protege: "O manual é a regra da marca — e distorcer o logo depois não é problema do autor.",
        texto: `O manual de identidade entregue define as regras de aplicação da marca: versões autorizadas, área de proteção, tamanho mínimo, paleta, tipografia, usos indevidos e aplicação sobre fundos.

Parágrafo primeiro. A CONTRATANTE obriga-se a observar o manual em todas as aplicações, respondendo pela descaracterização decorrente de uso em desacordo com ele.

Parágrafo segundo. O CONTRATADO não responde por resultado estético, técnico ou de impressão de peças produzidas por terceiros a partir dos arquivos entregues, nem por adaptação, redesenho ou alteração da marca promovidos após a entrega.

Parágrafo terceiro. Alterada a marca por terceiro, a obra resultante não poderá ser apresentada como de autoria do CONTRATADO, e este poderá exigir a retirada do seu crédito.

Parágrafo quarto. Dúvidas pontuais sobre aplicação correta da marca serão respondidas pelo CONTRATADO, sem custo, pelo prazo de 90 (noventa) dias contados da entrega; suporte além disso será orçado à parte.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 5 — DESIGNER · 2. RETENÇÃO MENSAL                            */
  /* ================================================================== */
  {
    perfil: "designer",
    tipoServico: "retencao_mensal",
    nome: "Retenção Mensal (Design Recorrente)",
    descricao:
      "Pacote mensal de peças com volume fechado, fila de prioridade, prazo por peça, banco de horas que não acumula e vigência com renovação automática.",
    camposDinamicos: [
      { tag: "VALOR_CESSAO_ARQUIVOS_ABERTOS", label: "Valor da cessão de arquivos abertos", tipo: "moeda" },
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "TIPOS_DE_PECA", label: "Tipos de peça atendidos", tipo: "textarea", exemplo: "posts, stories, banners de e-commerce, apresentações e e-mails" },
      { tag: "PRAZO_ENTREGA_POR_PECA", label: "Prazo por peça", tipo: "texto", exemplo: "2 dias úteis" },
      { tag: "PRAZO_ENTREGA_URGENTE", label: "Prazo em regime de urgência", tipo: "texto", exemplo: "24 horas úteis, com acréscimo de 50%" },
      { tag: "FORMA_DE_SOLICITACAO", label: "Como as demandas são abertas", tipo: "texto", exemplo: "por formulário de briefing em quadro compartilhado" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE DESIGN

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de design gráfico, no volume mensal de [VOLUME_MENSAL_CONTRATADO], compreendendo os seguintes tipos de peça: [TIPOS_DE_PECA].

Parágrafo primeiro. As demandas serão abertas por [FORMA_DE_SOLICITACAO], acompanhadas de briefing, textos finais, imagens e referências, e atendidas por ordem de entrada, no prazo de [PRAZO_ENTREGA_POR_PECA] por peça.

Parágrafo segundo. NÃO integram o objeto, salvo contratação apartada: criação e revisão de identidade visual; ilustração autoral e infográfico complexo; motion design e animação; edição de vídeo; fotografia e tratamento avançado de imagem; redação e revisão de texto; impressão e acompanhamento gráfico; e desenvolvimento de site ou sistema.

Parágrafo terceiro. O valor mensal de [VALOR_MENSAL] remunera a reserva de agenda e o volume contratado, na forma da cláusula Do Volume Mensal.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "fila_e_prioridade",
        titulo: "Da Fila de Atendimento, da Prioridade e da Urgência",
        essencial: true,
        protege: "Ordem de chegada é o que impede que tudo seja urgente e nada tenha prazo.",
        texto: `As demandas são atendidas por ordem de entrada na fila, e o prazo de cada peça começa a correr do recebimento do briefing COMPLETO, com textos finais e materiais necessários.

Parágrafo primeiro. Briefing incompleto, texto não definitivo, imagem em baixa resolução ou ausência de arquivo de marca suspendem o prazo até o saneamento, na forma da cláusula Dos Prazos.

Parágrafo segundo. A CONTRATANTE poderá reordenar a prioridade das demandas em fila a qualquer momento, sem custo; a reordenação, contudo, desloca proporcionalmente o prazo das peças preteridas.

Parágrafo terceiro. Demandas em regime de URGÊNCIA — prazo de [PRAZO_ENTREGA_URGENTE] — dependem de aceite do CONTRATADO e importam o acréscimo previsto na cláusula Das Alterações de Escopo, dado que exigem a suspensão da fila e a realocação da agenda.

Parágrafo quarto. Peças aguardando insumo, aprovação ou resposta da CONTRATANTE por mais de 15 (quinze) dias saem da fila e retornam ao seu fim quando retomadas.

Parágrafo quinto. O CONTRATADO informará à CONTRATANTE, sempre que solicitado, a posição da fila e a previsão de entrega de cada demanda.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ARQUIVOS_ABERTOS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 5 — DESIGNER · 3. LANÇAMENTOS DIGITAIS                       */
  /* ================================================================== */
  {
    perfil: "designer",
    tipoServico: "lancamentos_digitais",
    nome: "Lançamentos Digitais",
    descricao:
      "Pacote de design para lançamento: criativos de anúncio, páginas e materiais de carrinho, com cronograma travado, banco de variações e responsabilidade do produtor pela promessa vendida.",
    camposDinamicos: [
      { tag: "VALOR_CESSAO_ARQUIVOS_ABERTOS", label: "Valor da cessão de arquivos abertos", tipo: "moeda" },
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_TRAFEGO,
      { tag: "NOME_DO_PRODUTO", label: "Produto lançado", tipo: "texto" },
      { tag: "DATA_ABERTURA_CARRINHO", label: "Abertura do carrinho", tipo: "data" },
      { tag: "DATA_FECHAMENTO_CARRINHO", label: "Fechamento do carrinho", tipo: "data" },
      { tag: "ENTREGAVEIS_LANCAMENTO", label: "Entregáveis", tipo: "textarea", exemplo: "1 identidade da campanha, 30 criativos estáticos, 10 criativos em vídeo curto, 2 páginas, 8 e-mails e kit de stories" },
      { tag: "NUMERO_VARIACOES_CRIATIVO", label: "Variações por criativo", tipo: "numero", exemplo: "3" },
      { tag: "PRAZO_ENTREGA_LOTE", label: "Prazo de entrega por lote", tipo: "texto", exemplo: "5 dias úteis" },
      { tag: "VALOR_CRIATIVO_EXCEDENTE", label: "Valor do criativo excedente", tipo: "moeda" },
      { tag: "VALOR_MULTA_ADIAMENTO", label: "Multa por adiamento", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN PARA LANÇAMENTO DIGITAL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a criação das peças de design do lançamento do produto [NOME_DO_PRODUTO], com carrinho aberto de [DATA_ABERTURA_CARRINHO] a [DATA_FECHAMENTO_CARRINHO].

Parágrafo primeiro. Os entregáveis compreendem: [ENTREGAVEIS_LANCAMENTO], organizados em lotes com prazo de [PRAZO_ENTREGA_LOTE] cada.

Parágrafo segundo. Cada criativo será entregue com até [NUMERO_VARIACOES_CRIATIVO] variações de formato ou de headline, contadas como UMA peça. Criativos além do volume contratado serão orçados a [VALOR_CRIATIVO_EXCEDENTE] cada.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: redação publicitária e copy; gestão de tráfego e configuração de campanhas; verba de mídia; edição de vídeo longo; captação de imagem; programação e integração de páginas em plataforma; configuração de e-mail marketing; e produção do produto vendido.

Parágrafo quarto. Este é contrato de PROJETO com data certa, não de trato sucessivo.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "cronograma_lancamento_design",
        titulo: "Do Cronograma, dos Lotes e do Adiamento",
        essencial: true,
        protege: "Criativo entregue depois do carrinho aberto não serve para nada — a data é essencial.",
        texto: `As datas de abertura e fechamento do carrinho são ESSENCIAIS: sobre elas se organizam a produção em lotes e a reserva da agenda do CONTRATADO.

Parágrafo primeiro. Cada lote depende do recebimento prévio, pela CONTRATANTE, dos textos finais, das imagens, do posicionamento da oferta e das aprovações do lote anterior. O atraso nesses insumos desloca o lote e, em consequência, os seguintes.

Parágrafo segundo. O adiamento do lançamento comunicado com menos de 15 (quinze) dias da abertura do carrinho sujeita a CONTRATANTE à multa de [VALOR_MULTA_ADIAMENTO], além do valor integral das etapas executadas.

Parágrafo terceiro. O cancelamento após a entrega do primeiro lote torna devido o valor integral do contrato.

Parágrafo quarto. Durante a semana de carrinho aberto, ajustes de headline, preço e prova social em criativos já entregues serão atendidos em regime de urgência, consumindo rodada de refação e, esgotadas, cobrados como peça excedente.

Parágrafo quinto. Os criativos são entregues nos formatos e nas especificações vigentes das plataformas na data da entrega; alterações posteriores de requisitos por elas impostas não constituem vício.`,
      },
      {
        id: "promessa_design",
        titulo: "Da Promessa Publicitária e da Conformidade das Peças",
        essencial: true,
        protege: "O designer desenha o que foi aprovado — quem promete resultado é quem vende.",
        texto: `Textos, ofertas, preços, garantias, depoimentos, números e promessas de resultado exibidos nas peças são fornecidos e aprovados pela CONTRATANTE, única responsável por sua veracidade e conformidade legal.

Parágrafo primeiro. O CONTRATADO não produzirá peça que contenha promessa de ganho garantido, resultado de saúde sem respaldo, prova social forjada, escassez inverídica ou selo, prêmio e certificação inexistentes; a exigência nesse sentido autoriza a recusa e, persistindo, a rescisão por justa causa.

Parágrafo segundo. Imagens, fotografias, ícones, fontes e mockups de terceiros utilizados observarão as licenças de seus titulares, na forma da cláusula Dos Arquivos Abertos, cabendo à CONTRATANTE arcar com as licenças necessárias ao uso continuado e à veiculação paga.

Parágrafo terceiro. Reprovação de anúncio, restrição de conta ou remoção de peça pelas plataformas por razões de política de conteúdo relativas à OFERTA são risco da CONTRATANTE; quando a reprovação decorrer exclusivamente de elemento gráfico corrigível, o CONTRATADO fará a adequação sem custo, uma vez por peça.

Parágrafo quarto. O CONTRATADO não responde por desempenho de campanha, custo por resultado, taxa de conversão ou faturamento, obrigação de meio na forma da cláusula Da Limitação de Responsabilidade.`,
      },
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ARQUIVOS_ABERTOS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 5 — DESIGNER · 4. MATERIAIS GRÁFICOS OFFLINE (PDV)           */
  /* ================================================================== */
  {
    perfil: "designer",
    tipoServico: "design_materiais_impressos",
    nome: "Materiais Gráficos Offline (PDV)",
    descricao:
      "Design para impressão e ponto de venda, com o que só existe no offline: prova de cor, fechamento de arquivo, sangria, acabamento, e a linha exata onde a responsabilidade do designer termina e a da gráfica começa.",
    camposDinamicos: [
      { tag: "VALOR_CESSAO_ARQUIVOS_ABERTOS", label: "Valor da cessão de arquivos abertos", tipo: "moeda" },
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "PECAS_CONTRATADAS", label: "Peças contratadas", tipo: "textarea", exemplo: "wobbler, faixa de gôndola, cartaz A2, adesivo de chão e testeira" },
      { tag: "ESPECIFICACOES_GRAFICAS", label: "Especificações fornecidas pela gráfica", tipo: "textarea", exemplo: "formato final, sangria de 3mm, perfil de cor, tipo de papel e acabamento" },
      { tag: "NOME_DA_GRAFICA", label: "Gráfica responsável", tipo: "texto" },
      { tag: "RESPONSAVEL_PROVA_DE_COR", label: "Quem aprova a prova de cor", tipo: "texto" },
      { tag: "VALOR_PECA_EXCEDENTE", label: "Valor da peça excedente", tipo: "moeda" },
      { tag: "VALOR_REFECHAMENTO_ARQUIVO", label: "Valor de refechamento de arquivo", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN GRÁFICO PARA MATERIAL IMPRESSO

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a criação e o fechamento de arquivos das seguintes peças gráficas destinadas a ponto de venda: [PECAS_CONTRATADAS].

Parágrafo primeiro. Os arquivos serão fechados conforme as especificações técnicas fornecidas pela gráfica [NOME_DA_GRAFICA]: [ESPECIFICACOES_GRAFICAS].

Parágrafo segundo. Peças excedentes serão orçadas a [VALOR_PECA_EXCEDENTE] cada.

Parágrafo terceiro. NÃO integram o objeto, em nenhuma hipótese: a IMPRESSÃO e os seus custos; corte, acabamento, aplicação e instalação; frete e logística; intermediação, cotação e negociação com gráficas; acompanhamento presencial de impressão; e revisão ortográfica ou de conteúdo dos textos fornecidos.

Parágrafo quarto. A CONTRATANTE contrata a gráfica diretamente e mantém com ela relação jurídica autônoma, à qual o CONTRATADO é estranho.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "fechamento_e_prova",
        titulo: "Do Fechamento de Arquivo, da Prova de Cor e da Responsabilidade da Gráfica",
        essencial: true,
        protege: "Cor de tela nunca é cor de papel — e essa é a briga mais comum do impresso.",
        texto: `O CONTRATADO entregará os arquivos fechados no padrão exigido pela gráfica, com sangria, marcas de corte, perfil de cor, conversão de fontes e resolução adequados, conforme as especificações por ela fornecidas.

Parágrafo primeiro. A CONTRATANTE obriga-se a obter da gráfica, e a repassar ao CONTRATADO ANTES do início do trabalho, as especificações técnicas completas. Especificação incorreta, incompleta ou desatualizada fornecida pela CONTRATANTE que exija o refechamento dos arquivos importará cobrança de [VALOR_REFECHAMENTO_ARQUIVO] por peça.

Parágrafo segundo. AS CORES EXIBIDAS EM TELA NÃO CORRESPONDEM ÀS CORES IMPRESSAS. Monitores trabalham em luz emitida e a impressão em pigmento sobre substrato; variações de tom decorrentes de papel, tinta, calibragem de máquina, tipo de impressão e acabamento são inerentes ao processo gráfico e NÃO constituem vício do serviço.

Parágrafo terceiro. A prova de cor física, quando desejada, será solicitada à gráfica pela CONTRATANTE e aprovada por [RESPONSAVEL_PROVA_DE_COR]. A aprovação da prova vincula a CONTRATANTE quanto ao resultado impresso. Dispensada a prova, a CONTRATANTE assume integralmente o risco da variação cromática.

Parágrafo quarto. Aprovado o arquivo pela CONTRATANTE e enviado à gráfica, cessa a responsabilidade do CONTRATADO. Erros de impressão, registro, corte, dobra, acabamento, gramatura, atraso e quantidade são de responsabilidade da gráfica.

Parágrafo quinto. ERRO DE TEXTO É RESPONSABILIDADE DE QUEM APROVOU: o CONTRATADO reproduz os textos fornecidos por escrito, não lhe cabendo revisá-los. A aprovação escrita da arte final pela CONTRATANTE, ou a aprovação tácita, valem como revisão final de conteúdo, e eventual reimpressão por erro de texto aprovado corre por conta dela.

Parágrafo sexto. Recomenda-se expressamente que a CONTRATANTE realize revisão ortográfica e de conteúdo antes de aprovar a arte final, providência cuja ausência é risco assumido por ela.`,
      },
      CLAUSULA_ARQUIVOS_ABERTOS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 5 — DESIGNER · 5. UI / WEB DESIGN                            */
  /* ================================================================== */
  {
    perfil: "designer",
    tipoServico: "ui_ux_design",
    nome: "UI / Web Design",
    descricao:
      "Design de interface e de site, com número de telas contado, ambiente de homologação definido, entrega de design system, e a fronteira clara entre desenhar e programar.",
    camposDinamicos: [
      { tag: "VALOR_CESSAO_ARQUIVOS_ABERTOS", label: "Valor da cessão de arquivos abertos", tipo: "moeda" },
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "NOME_DO_PROJETO_DIGITAL", label: "Nome do projeto", tipo: "texto" },
      { tag: "NUMERO_DE_TELAS", label: "Nº de telas/páginas", tipo: "numero", exemplo: "12" },
      { tag: "BREAKPOINTS", label: "Versões responsivas", tipo: "texto", exemplo: "desktop e mobile" },
      { tag: "ENTREGAVEIS_DIGITAIS", label: "Entregáveis", tipo: "textarea", exemplo: "wireframes, layout de 12 telas em desktop e mobile, protótipo navegável e design system com componentes" },
      { tag: "FERRAMENTA_DE_DESIGN", label: "Ferramenta de entrega", tipo: "texto", exemplo: "Figma, com acesso de visualização e exportação" },
      { tag: "AMBIENTE_DE_REFERENCIA", label: "Ambiente de homologação", tipo: "textarea", exemplo: "Chrome, Safari e Edge nas duas últimas versões; iOS e Android em suporte oficial" },
      { tag: "VALOR_TELA_EXCEDENTE", label: "Valor da tela excedente", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN DE INTERFACE DIGITAL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Tela é a unidade de medida — sem contá-las, o projeto não tem fim.",
        texto: `Constitui objeto deste contrato o design de interface do projeto [NOME_DO_PROJETO_DIGITAL], compreendendo [NUMERO_DE_TELAS] telas, nas versões [BREAKPOINTS].

Parágrafo primeiro. Os entregáveis compreendem: [ENTREGAVEIS_DIGITAIS], disponibilizados em [FERRAMENTA_DE_DESIGN].

Parágrafo segundo. Considera-se TELA cada layout único; estados de uma mesma tela — carregamento, erro, vazio, sucesso, aberto e fechado — quando expressamente contratados, contam como meia tela cada. Telas excedentes serão orçadas a [VALOR_TELA_EXCEDENTE] cada.

Parágrafo terceiro. NÃO INTEGRA O OBJETO A PROGRAMAÇÃO. Também não integram, salvo contratação apartada: desenvolvimento front-end e back-end; implementação em CMS, construtor de páginas ou e-commerce; integrações com sistemas, pagamentos e automações; hospedagem, domínio e certificado; SEO técnico e conteúdo; redação de textos; produção de fotografia, ilustração e vídeo; testes com usuários e pesquisa de campo; e manutenção evolutiva.

Parágrafo quarto. O CONTRATADO prestará suporte de esclarecimento à equipe de desenvolvimento da CONTRATANTE, por até 5 (cinco) horas, quanto à interpretação do layout entregue.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "fidelidade_implementacao",
        titulo: "Da Implementação por Terceiros e da Fidelidade ao Layout",
        essencial: true,
        protege: "Se o programador implementar diferente, o resultado não é responsabilidade do designer.",
        texto: `Entregue e aprovado o layout, a sua implementação será realizada pela CONTRATANTE ou por terceiro por ela contratado.

Parágrafo primeiro. O CONTRATADO NÃO responde pelo resultado da implementação, por divergências entre o layout e o produto publicado, por desempenho, tempo de carregamento, comportamento em dispositivos, erros de código, falhas de integração ou indisponibilidade.

Parágrafo segundo. A CONTRATANTE poderá contratar do CONTRATADO, à parte, o acompanhamento da implementação e a validação visual do resultado, atividade distinta do design e remunerada por hora ou por etapa.

Parágrafo terceiro. Alterações de layout promovidas na implementação — troca de fontes, cores, espaçamentos, componentes ou hierarquia — descaracterizam a obra, e o CONTRATADO poderá exigir a retirada do seu crédito e vedar a apresentação do resultado como de sua autoria.

Parágrafo quarto. Fontes, ícones, ilustrações e imagens de terceiros usados no layout dependem das licenças de seus titulares, na forma da cláusula Dos Arquivos Abertos, cabendo à CONTRATANTE adquiri-las para o uso em produção.

Parágrafo quinto. O design system entregue, quando previsto, é documento de referência: a sua manutenção após a entrega é da CONTRATANTE.`,
      },
      CLAUSULA_HOMOLOGACAO_TECNICA,
      CLAUSULA_ARQUIVOS_ABERTOS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
];
