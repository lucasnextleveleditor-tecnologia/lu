import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";
import {
  CAMPOS_OPERACIONAIS_COMUNS,
  CAMPOS_VIAGEM,
  CLAUSULAS_DE_FECHAMENTO,
  CLAUSULA_ALIMENTACAO,
  CLAUSULA_ALTERACOES_DE_ESCOPO,
  CLAUSULA_APROVACAO_E_REFACOES,
  CLAUSULA_BACKUP,
  CLAUSULA_CONDICOES_CLIMATICAS,
  CLAUSULA_DESLOCAMENTO,
  CLAUSULA_DIREITOS_AUTORAIS,
  CLAUSULA_DIREITO_DE_IMAGEM,
  CLAUSULA_ENTREGA,
  CLAUSULA_EQUIPAMENTO_E_SEGURO,
  CLAUSULA_JORNADA,
  CLAUSULA_OBRIGACOES_DAS_PARTES,
  CLAUSULA_PORTFOLIO,
  CLAUSULA_PRAZOS_E_INSUMOS,
  CLAUSULA_VIAGEM,
  comoOpcional,
} from "./clausulas-comuns";
import {
  CAMPOS_SERVICO_CONTINUO,
  CLAUSULAS_DE_ROTINA,
  CLAUSULA_ACESSOS_E_CONTAS,
  CLAUSULA_PLATAFORMAS_TERCEIROS,
  CLAUSULA_ROTINA_E_ATENDIMENTO,
  CLAUSULA_VIGENCIA_E_RENOVACAO,
} from "./clausulas-continuas";


/**
 * Banco de modelos de contrato do perfil STORYMAKER — v2, 6 tipos de serviço
 * (substitui a v1 de 5 tipos genéricos). Foco na especialidade do
 * storymaker: narrativa sequencial em Stories (arco, gancho, chamada para
 * ação), com prazos de aprovação sensíveis à natureza efêmera do formato
 * (expiração em 24h).
 *
 * Mesmo padrão jurídico aprofundado das demais profissões: exclusão de
 * responsabilidade por resultado de engajamento/vendas (obrigação de meio),
 * indenização quando alegações de produto são fornecidas pela contratante, e
 * — nos serviços de evento com data fixa — quitação prévia obrigatória e
 * tabela de retenção por cancelamento.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_STORYMAKER: ModeloContratoServico[] = [
  {
    perfil: "storymaker",
    tipoServico: "gestao_de_stories",
    nome: "Gestão de Stories (Pacote Mensal)",
    descricao: "Roteirização e produção mensal de sequências de Stories, com exclusão de responsabilidade por resultado de engajamento e atenção à natureza efêmera do formato.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo de aprovação de pauta", tipo: "texto", exemplo: "2 dias úteis" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING PARA REDES SOCIAIS

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de roteirização, produção e/ou direção de conteúdo sequencial para Stories (Instagram/Facebook) da CONTRATANTE, em regime de contrato mensal contínuo.

2. DO ESCOPO MENSAL
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário editorial: [CALENDARIO_DE_PAUTAS], aprovado em até [PRAZO_APROVACAO_PAUTA].
2.2. Por se tratar de conteúdo com expiração de 24 horas na própria natureza do formato, os prazos de aprovação e publicação são especialmente sensíveis: atraso da CONTRATANTE na aprovação de uma sequência pode inviabilizar sua publicação na janela planejada (ex.: contagem regressiva para evento do dia), sem responsabilidade ao(à) CONTRATADO(A).
2.3. O resultado de engajamento/conversão do storytelling depende de fatores de mercado, algoritmo e da própria audiência da CONTRATANTE, tratando-se de prestação de serviço de meio, não de resultado.

3. DO ACESSO ÀS CONTAS
3.1. Acesso concedido preferencialmente via ferramenta de gestão compartilhada, sem compartilhamento de senha principal, permanecendo a titularidade da conta com a CONTRATANTE.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão da produção do mês, sem caracterizar inadimplemento do(a) CONTRATADO(A).

5. DA VIGÊNCIA E DA RESCISÃO
5.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

6. DO ARMAZENAMENTO PÓS-CONTRATO
6.1. Roteiros, artes-fonte e gravações brutas usadas na produção dos stories são mantidos apenas durante a vigência, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso do conteúdo publicado, por prazo indeterminado, mediante pagamento integral. O(a) CONTRATADO(A) pode usar roteiros/artes (sem dados sensíveis do negócio) em portfólio, salvo vedação por escrito.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre estratégia de conteúdo, calendário de lançamentos e dados internos pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Instabilidade das plataformas, mudança de algoritmo/formato do recurso de Stories, ou eventos de força maior, não geram responsabilidade ao(à) CONTRATADO(A).

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade limitada ao valor da mensalidade do mês do fato gerador, excluída responsabilidade por resultado de engajamento/vendas.
11.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) informações, promoções ou alegações fornecidas pela própria CONTRATANTE e publicadas conforme briefing; (ii) uso de imagens/depoimentos de terceiros sem autorização, fornecidos pela CONTRATANTE; (iii) publicidade enganosa decorrente de informação de responsabilidade da CONTRATANTE.
11.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "storymaker",
    tipoServico: "storytelling_lancamentos_digitais",
    nome: "Storytelling para Lançamentos Digitais",
    descricao: "Roteirização de sequências de Stories para campanha de lançamento com datas fixas, quitação prévia obrigatória e indenização por alegações de resultado fornecidas pela contratante.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_PRODUTO_OU_LANCAMENTO", label: "Nome do produto/lançamento", tipo: "texto" },
      { tag: "DATA_DE_ABERTURA", label: "Data de abertura de vendas", tipo: "data" },
      { tag: "DATA_DE_ENCERRAMENTO", label: "Data de encerramento de vendas", tipo: "data" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por fase", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PECA_LANCAMENTO", label: "Prazo de aprovação de sequência", tipo: "texto", exemplo: "24 horas" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do aquecimento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_1", label: "Antecedência — faixa 1 (maior)", tipo: "texto", exemplo: "30 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_2", label: "Antecedência — faixa 2 (menor)", tipo: "texto", exemplo: "10 dias" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — faixa 1", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — faixa 2", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — abaixo da faixa 2", tipo: "percentual", exemplo: "80" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING PARA LANÇAMENTO DIGITAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Roteirização e produção de sequências de Stories para a campanha de lançamento de [NOME_DO_PRODUTO_OU_LANCAMENTO], com abertura de vendas prevista para [DATA_DE_ABERTURA] e encerramento em [DATA_DE_ENCERRAMENTO].

2. DO ESCOPO E DAS FASES
2.1. Entregáveis por fase: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cronograma de aprovações: cada sequência deve ser aprovada com antecedência mínima de [PRAZO_APROVACAO_PECA_LANCAMENTO] em relação à publicação prevista, dada a natureza efêmera do formato (expiração em 24h), sob pena de a publicação ser adiada/reduzida sem responsabilidade ao(à) CONTRATADO(A).
2.3. Alegações de resultado, garantias, preços e prazos do produto/infoproduto são de responsabilidade exclusiva da CONTRATANTE, cabendo ao(à) CONTRATADO(A) apenas a adaptação narrativa desse conteúdo ao formato de stories.

3. DA CRITICIDADE DE DATA (CLÁUSULA ESSENCIAL)
3.1. Quitação integral do valor deve ocorrer até [PRAZO_QUITACAO_ANTES_EVENTO] antes do início da fase de aquecimento; o não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não iniciar a prestação do serviço, sem caracterizar inadimplemento de sua parte.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

5. DA RESCISÃO E DO CANCELAMENTO DO LANÇAMENTO
5.1. Cancelamento/adiamento pela CONTRATANTE após início da produção: mais de [PRAZO_RETENCAO_FAIXA_1] antes da abertura — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre [PRAZO_RETENCAO_FAIXA_2] e [PRAZO_RETENCAO_FAIXA_1] — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; menos de [PRAZO_RETENCAO_FAIXA_2] — retenção de [PERCENTUAL_RETENCAO_3_MESES]%.

6. DO ARMAZENAMENTO PÓS-CAMPANHA
6.1. Arquivos-fonte mantidos por até [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento da campanha, elimináveis depois disso sem aviso prévio. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso do material da campanha, sem prazo determinado. O(a) CONTRATADO(A) pode usar roteiros (sem dados de faturamento) em portfólio, salvo vedação por escrito.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre estratégia de lançamento, precificação e resultados de venda pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados de leads/compradores conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Instabilidade de plataformas de anúncio/pagamento/hospedagem, fora do controle do(a) CONTRATADO(A), não gera sua responsabilidade.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade limitada ao valor total pago, excluída responsabilidade por resultado de vendas/faturamento da campanha.
11.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) alegações de resultado/garantias do produto fornecidas por ela; (ii) descumprimento de promessas comerciais aos compradores; (iii) publicidade enganosa decorrente de conteúdo técnico fornecido pela CONTRATANTE.
11.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "storymaker",
    tipoServico: "storytelling_institucional_corporativo",
    nome: "Storytelling Institucional/Corporativo",
    descricao: "Roteirização e produção de conteúdo narrativo institucional/corporativo, com pré-produção obrigatória e indenização por ausência de release de colaboradores.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "FINALIDADE_DO_VIDEO", label: "Finalidade do conteúdo", tipo: "textarea", exemplo: "cultura interna, bastidores, employer branding" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING INSTITUCIONAL/CORPORATIVO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Roteirização e produção de conteúdo narrativo (stories/vídeos curtos sequenciais) para fins institucionais/corporativos da CONTRATANTE, com finalidade de [FINALIDADE_DO_VIDEO].

2. DO ESCOPO E DA PRÉ-PRODUÇÃO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Captação em [LOCAL_DE_CAPTACAO], na(s) data(s) [DATA_DE_CAPTACAO].
2.2. Roteiro/briefing aprovado por escrito antes da captação; captação sem essa aprovação corre por conta e risco da CONTRATANTE.
2.3. Cabe à CONTRATANTE viabilizar acesso às instalações e colaboradores necessários.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação/aprovação do roteiro.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste pontual. Nova captação por decisão da CONTRATANTE é cobrada à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivos finais liberados após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material bruto, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DA CESSÃO DE DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso institucional pelo prazo de [PRAZO_DA_LICENCA_DE_USO]. Cabe à CONTRATANTE providenciar autorização de imagem de colaboradores que apareçam no conteúdo, isentando o(a) CONTRATADO(A) de reclamações de imagem.
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo cláusula de confidencialidade formalizada por escrito.

8. DA RESCISÃO E DAS MULTAS
8.1. Cancelamento de captação já agendada: mais de 7 dias — retenção de 30%; entre 7 e 2 dias — 50%; menos de 48h/no-show — 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações estratégicas e corporativas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos.
12.2. A CONTRATANTE indeniza por: (i) ausência de autorização de imagem de colaboradores; (ii) informações corporativas falsas/incompletas; (iii) uso do material fora da licença concedida.
12.3. Divulgações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "storymaker",
    tipoServico: "casamentos",
    nome: "Casamentos — Stories do Dia",
    descricao: "Cobertura em tempo real do casamento em formato de stories com narrativa sequencial, distinta da filmagem/fotografia profissional, com quitação prévia obrigatória e tabela de retenção.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_CONJUGE", label: "Nome do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "CPF_CONJUGE", label: "CPF do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do casamento", tipo: "data" },
      { tag: "LOCAL_DA_CERIMONIA", label: "Local da cerimônia", tipo: "texto" },
      { tag: "LOCAL_DA_FESTA", label: "Local da festa", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega do resumo pós-evento", tipo: "texto", exemplo: "3 dias" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "10 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — mais de 6 meses antes", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 6 e 2 meses antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 2 meses e 15 dias antes", tipo: "percentual", exemplo: "60" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação sem multa", tipo: "texto", exemplo: "30 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING DE CASAMENTO (STORIES DO DIA)

CONTRATANTE(S): [NOME_DO_CLIENTE] e [NOME_DO_CONJUGE], CPFs nº [CPF_CNPJ_CLIENTE] e [CPF_CONJUGE], residentes em [ENDERECO_CLIENTE], denominados em conjunto CONTRATANTES (solidariamente responsáveis pelas obrigações financeiras).
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em tempo real, em formato de stories com narrativa sequencial, das redes sociais dos CONTRATANTES durante a cerimônia e festa, em [DATA_DO_EVENTO], cerimônia em [LOCAL_DA_CERIMONIA] e festa em [LOCAL_DA_FESTA], distinta da filmagem/fotografia profissional do evento.

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Publicação em tempo real dispensa aprovação prévia de cada sequência, ressalvadas diretrizes específicas combinadas previamente (ex.: não publicar momentos íntimos/familiares).

3. DO PRAZO DE ENTREGA
3.1. Resumo/compilado pós-evento entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o casamento.

4. DAS REVISÕES
4.1. Não há revisão sobre conteúdo já publicado em tempo real, dada sua natureza efêmera.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. CLÁUSULA ESSENCIAL: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do casamento. O não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não comparecer, sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do resumo, guarda do material bruto passa aos CONTRATANTES; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Mais de 6 meses — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 2 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 2 meses e 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 15 dias ou não comparecimento — retenção de 100%.
7.2. Adiamento comunicado com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade de agenda: valores pagos migram para a nova data, sem multa.

8. DOS DIREITOS DE USO E DE IMAGEM
8.1. Conteúdo publicado no perfil dos CONTRATANTES já nasce sob titularidade destes. O(a) CONTRATADO(A) pode usar bastidores em portfólio, com crédito, salvo pedido de privacidade por escrito antes do evento.
8.2. Direitos de imagem de convidados são de responsabilidade dos CONTRATANTES; objeções posteriores não geram responsabilidade ao(à) CONTRATADO(A).

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto de nível equivalente mediante anuência dos CONTRATANTES; não sendo possível, devolução integral em até 5 dias úteis.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito/força maior; comunicação em até 48h e remarcação conforme cláusula 7.2.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais/financeiros dos CONTRATANTES pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade limitada ao valor total pago, excluídos lucros cessantes, danos indiretos e danos morais/à imagem por fatores alheios à sua atuação técnica.
13.2. Os CONTRATANTES indenizam o(a) CONTRATADO(A) por: (i) objeção de imagem de convidados não informados; (ii) instrução de publicação que gere reclamação de terceiros; (iii) atos de fornecedores do evento que atrapalhem a captação/publicação.
13.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial.

14. DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício/societário. CONTRATANTES respondem solidariamente pelas obrigações financeiras.

15. DO FORO
15.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "storymaker",
    tipoServico: "mentoria_de_storytelling",
    nome: "Mentoria/Consultoria de Storytelling",
    descricao: "Mentoria/consultoria em técnicas de storytelling, sem criação direta de conteúdo, com propriedade intelectual da metodologia preservada e obrigação de meio.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "FORMATO_DA_MENTORIA", label: "Formato da mentoria", tipo: "textarea", exemplo: "6 sessões individuais de 1h" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_AVISO_REAGENDAMENTO_SESSAO", label: "Prazo de aviso para reagendamento de sessão", tipo: "texto", exemplo: "24 horas" },
      { tag: "PRAZO_DO_PROGRAMA", label: "Duração do programa", tipo: "texto", exemplo: "2 meses" },
      { tag: "DATA_INICIO_PROGRAMA", label: "Data de início do programa", tipo: "data" },
      { tag: "PERCENTUAL_TAXA_ADMINISTRATIVA", label: "% taxa administrativa em desistência", tipo: "percentual", exemplo: "10" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MENTORIA/CONSULTORIA DE STORYTELLING

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de mentoria/consultoria em técnicas de storytelling e narrativa para redes sociais, no formato de [FORMATO_DA_MENTORIA], sem que o(a) CONTRATADO(A) assuma a criação/publicação direta de conteúdo da CONTRATANTE.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. A implementação prática das recomendações é de responsabilidade exclusiva da CONTRATANTE; o(a) CONTRATADO(A) não garante resultado específico de engajamento ou vendas.
2.3. Faltas a sessões agendadas com menos de [PRAZO_AVISO_REAGENDAMENTO_SESSAO] de antecedência contam como sessão realizada, salvo caso fortuito/força maior.

3. DO PRAZO
3.1. Programa com duração de [PRAZO_DO_PROGRAMA], iniciando-se em [DATA_INICIO_PROGRAMA].

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

5. DA PROPRIEDADE INTELECTUAL DOS MATERIAIS
5.1. Metodologia, roteiros-modelo e materiais de apoio permanecem de propriedade intelectual do(a) CONTRATADO(A), cedidos apenas para uso pessoal/interno da CONTRATANTE, vedada reprodução, revenda ou repasse a terceiros.

6. DA RESCISÃO
6.1. Desistência da CONTRATANTE após início do programa: reembolso proporcional às sessões/módulos não realizados, descontada taxa administrativa de [PERCENTUAL_TAXA_ADMINISTRATIVA]%.
6.2. Impedimento do(a) CONTRATADO(A): reembolso proporcional ou indicação de mentor(a) substituto(a) equivalente.

7. DA CONFIDENCIALIDADE
7.1. Sigilo recíproco sobre estratégias e informações de negócio discutidos, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

8. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
8.1. Conforme Lei nº 13.709/2018.

9. DO CASO FORTUITO E FORÇA MAIOR
9.1. Impedimentos de saúde ou força maior ensejam reagendamento das sessões afetadas, sem multa.

10. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
10.1. Responsabilidade limitada ao valor total pago, excluída responsabilidade por resultado de negócio da CONTRATANTE, obrigação de meio, não de resultado.
10.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por uso/repasse não autorizado dos materiais protegidos pela cláusula 5.
10.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício/societário.

12. DO FORO
12.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  /* ================================================================== */
  /* GRUPO 4 — CRIADOR DE HISTÓRIAS · 1. LANÇAMENTO DE VAREJO           */
  /* ================================================================== */
  {
    perfil: "storymaker",
    tipoServico: "lancamento_de_varejo",
    nome: "Lançamento de Varejo",
    descricao:
      "Narrativa em stories para lançamento de coleção, promoção ou inauguração: janela curta e intensa, presença no ponto de venda, publicação em tempo real e responsabilidade do lojista pela oferta anunciada.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "NOME_DA_LOJA", label: "Nome do comércio", tipo: "texto" },
      { tag: "NOME_DA_ACAO", label: "Nome da ação/lançamento", tipo: "texto", exemplo: "lançamento coleção verão" },
      { tag: "PERIODO_DA_ACAO", label: "Período da ação", tipo: "texto", exemplo: "de 05/01 a 12/01" },
      { tag: "DIAS_DE_PRESENCA", label: "Dias de presença no ponto", tipo: "numero", exemplo: "3" },
      { tag: "HORAS_POR_DIA", label: "Horas por dia no ponto", tipo: "numero", exemplo: "5" },
      { tag: "QUANTIDADE_STORIES_DIA", label: "Stories por dia", tipo: "numero", exemplo: "20" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "20 stories por dia, 2 reels por dia, 1 destaque organizado ao fim da ação" },
      { tag: "PERFIS_GERENCIADOS", label: "Perfis em que será publicado", tipo: "textarea" },
      { tag: "VALOR_DIA_EXTRA", label: "Valor do dia extra", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE NARRATIVA EM STORIES PARA AÇÃO DE VAREJO

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
        texto: `Constitui objeto deste contrato a criação e a veiculação de narrativa em stories para a ação "[NOME_DA_ACAO]" do estabelecimento [NOME_DA_LOJA], no período de [PERIODO_DA_ACAO], nos perfis [PERFIS_GERENCIADOS].

Parágrafo primeiro. O serviço compreende [DIAS_DE_PRESENCA] dias de presença no ponto de venda, de [HORAS_POR_DIA] horas cada, com produção e publicação de [QUANTIDADE_STORIES_DIA] stories por dia de presença.

Parágrafo segundo. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: mídia paga e impulsionamento; atendimento a mensagens e comentários; produção de peças de feed fora do descrito; fotografia profissional de produto em estúdio; identidade visual da campanha; e presença em dias além dos contratados, que serão orçados a [VALOR_DIA_EXTRA] cada.

Parágrafo quarto. A natureza do serviço é a NARRATIVA EM TEMPO REAL: o material é captado, editado e publicado no próprio dia, com a estética e a espontaneidade próprias do formato, o que a CONTRATANTE reconhece e aceita como característica, e não como limitação.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "tempo_real_e_aprovacao",
        titulo: "Da Publicação em Tempo Real e da Aprovação Simplificada",
        essencial: true,
        protege: "Story tem hora — aprovação lenta mata o formato, e isso precisa estar combinado.",
        texto: `As partes reconhecem que a publicação em stories é imediata por natureza, e que submeter cada peça a aprovação prévia inviabilizaria o formato contratado.

Parágrafo primeiro. A CONTRATANTE aprova PREVIAMENTE, na assinatura deste contrato, a linha narrativa, o tom de voz, os temas e os elementos de identidade a serem utilizados, autorizando o CONTRATADO a publicar em tempo real dentro desses limites, sem aprovação peça a peça.

Parágrafo segundo. A CONTRATANTE poderá, a qualquer momento, solicitar a remoção de story já publicado, o que será atendido em até 30 (trinta) minutos dentro da janela de trabalho. A remoção não gera reposição da peça nem abatimento.

Parágrafo terceiro. Preferindo a CONTRATANTE a aprovação peça a peça, deverá manter pessoa disponível com resposta em até 10 (dez) minutos durante toda a janela de trabalho; a demora superior autoriza a publicação, considerando-se aprovada a peça, sob pena de a narrativa perder a sequência e o contexto.

Parágrafo quarto. Erro de informação em story publicado será corrigido de imediato mediante nova peça, sem custo, quando decorrente de falha do CONTRATADO na reprodução de dado fornecido por escrito.

Parágrafo quinto. Não se aplica a este contrato o regime de rodadas de refação previsto para peças editadas, salvo quanto aos entregáveis pós-ação — reels compilados, destaques e material de arquivo.`,
      },
      {
        id: "oferta_varejo_stories",
        titulo: "Da Oferta Anunciada e da Responsabilidade do Estabelecimento",
        essencial: true,
        protege: "Preço, estoque e promessa ao consumidor são de quem vende, não de quem narra.",
        texto: `Preços, promoções, condições, prazos de validade da oferta e disponibilidade de estoque serão fornecidos pela CONTRATANTE e veiculados conforme informados.

Parágrafo primeiro. A CONTRATANTE é a única responsável pela veracidade e pelo cumprimento das ofertas divulgadas, na forma do Código de Defesa do Consumidor, respondendo perante consumidores e órgãos de fiscalização.

Parágrafo segundo. A CONTRATANTE comunicará imediatamente o esgotamento de estoque ou o encerramento antecipado da promoção, para retirada ou correção das peças em veiculação.

Parágrafo terceiro. O CONTRATADO não responde por venda não realizada, por movimento aquém do esperado na loja, nem por resultado comercial da ação, obrigação de meio na forma da cláusula Da Limitação de Responsabilidade.

Parágrafo quarto. Clientes, funcionários e demais pessoas registradas nos stories deverão ter sua imagem autorizada pela CONTRATANTE, na forma da cláusula Do Direito de Imagem; cabe a ela sinalizar no ponto de venda a existência de captação em curso.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_CONDICOES_CLIMATICAS,
      CLAUSULA_EQUIPAMENTO_E_SEGURO,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 4 — CRIADOR DE HISTÓRIAS · 2. ROTINA DE CLÍNICAS             */
  /* ================================================================== */
  {
    perfil: "storymaker",
    tipoServico: "rotina_clinicas_profissionais",
    nome: "Rotina de Clínicas e Profissionais",
    descricao:
      "Bastidores de clínica ou consultório, onde a regra não é só de imagem: sigilo profissional, dados de saúde, publicidade regulada por conselho e o que jamais pode ser filmado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "NOME_DA_CLINICA", label: "Nome da clínica/consultório", tipo: "texto" },
      { tag: "ESPECIALIDADE", label: "Especialidade", tipo: "texto", exemplo: "odontologia estética" },
      { tag: "CONSELHO_PROFISSIONAL", label: "Conselho profissional", tipo: "texto", exemplo: "CRO" },
      { tag: "NUMERO_REGISTRO_PROFISSIONAL", label: "Nº de registro do responsável técnico", tipo: "texto" },
      { tag: "FREQUENCIA_CAPTACAO", label: "Frequência de visitas", tipo: "texto", exemplo: "1 visita semanal de 3 horas" },
      { tag: "AMBIENTES_AUTORIZADOS", label: "Ambientes autorizados para captação", tipo: "textarea", exemplo: "recepção, sala de espera e uma sala clínica previamente higienizada e sem pacientes" },
      { tag: "AMBIENTES_VEDADOS", label: "Ambientes vedados", tipo: "textarea", exemplo: "prontuários, recepção durante atendimento, sala de procedimentos em uso" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE CONTEÚDO PARA ESTABELECIMENTO DE SAÚDE

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002, pela Lei nº 9.610/1998 e pela Lei nº 13.709/2018.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de produção de conteúdo em formato de bastidores e rotina para [NOME_DA_CLINICA], estabelecimento de [ESPECIALIDADE].

Parágrafo primeiro. O serviço compreende visitas com frequência de [FREQUENCIA_CAPTACAO], produção de [VOLUME_MENSAL_CONTRATADO], publicação e relatório [PERIODICIDADE_RELATORIO].

Parágrafo segundo. A captação ocorrerá exclusivamente nos ambientes autorizados: [AMBIENTES_AUTORIZADOS]. São ambientes e situações EXPRESSAMENTE VEDADOS: [AMBIENTES_VEDADOS].

Parágrafo terceiro. NÃO integram o objeto: mídia paga; atendimento a mensagens e agendamento de pacientes; produção de material científico; consultoria de marketing médico; e adequação do estabelecimento às normas sanitárias e do conselho.

Parágrafo quarto. O valor mensal de [VALOR_MENSAL] remunera a disponibilidade e o volume contratado.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "sigilo_paciente",
        titulo: "Do Sigilo Profissional, do Paciente e dos Dados de Saúde",
        essencial: true,
        protege: "Dado de saúde é dado sensível — e imagem de paciente sem termo é risco grave para os dois.",
        texto: `As partes reconhecem que a atividade da CONTRATANTE é submetida a sigilo profissional e que dados de saúde constituem DADOS PESSOAIS SENSÍVEIS, na forma do art. 5º, inciso II, da Lei nº 13.709/2018.

Parágrafo primeiro. É ABSOLUTAMENTE VEDADA a captação, ainda que acidental, de: prontuários, fichas, exames, telas de sistema, agendas com nomes, receituários, etiquetas de identificação e quaisquer documentos de pacientes; rostos, tatuagens, marcas ou características identificáveis de pacientes; conversas de atendimento; e procedimentos em curso.

Parágrafo segundo. A imagem de paciente somente poderá ser veiculada mediante TERMO ESPECÍFICO E ESCRITO de autorização, obtido pela CONTRATANTE, com indicação expressa da finalidade publicitária, das mídias e do prazo, e com a possibilidade de revogação a qualquer tempo. O termo genérico de atendimento não supre essa exigência.

Parágrafo terceiro. Havendo revogação da autorização por paciente, a CONTRATANTE comunicará imediatamente o CONTRATADO, que promoverá a retirada do conteúdo em até 24 (vinte e quatro) horas, sem custo para a CONTRATANTE e sem que a retirada configure inadimplemento.

Parágrafo quarto. O CONTRATADO obriga-se a: não armazenar material que contenha dado sensível fora do estritamente necessário; eliminar imediatamente captação acidental de conteúdo vedado; não utilizar tal material em portfólio, ainda que anonimizado, salvo autorização escrita e específica; e observar as demais obrigações da cláusula Da Proteção de Dados na condição de OPERADOR.

Parágrafo quinto. A CONTRATANTE, na condição de CONTROLADORA, responde pela base legal do tratamento, pela obtenção dos termos, pelo atendimento aos titulares e pela comunicação de incidentes às autoridades.

Parágrafo sexto. A violação desta cláusula por qualquer das partes constitui justa causa para rescisão imediata, sem prejuízo das responsabilidades civis, administrativas e criminais cabíveis.`,
      },
      {
        id: "publicidade_regulada",
        titulo: "Da Publicidade Regulada pelo Conselho Profissional",
        essencial: true,
        protege: "O que pode ser dito é definido pelo conselho — e quem responde por isso é o profissional.",
        texto: `A CONTRATANTE declara que sua atividade é regulada pelo [CONSELHO_PROFISSIONAL], sob a responsabilidade técnica do profissional inscrito sob o nº [NUMERO_REGISTRO_PROFISSIONAL], e que a publicidade do estabelecimento se submete às normas éticas e publicitárias daquele órgão.

Parágrafo primeiro. Compete EXCLUSIVAMENTE à CONTRATANTE, por meio do seu responsável técnico, validar previamente todo conteúdo quanto à conformidade com as normas do conselho, notadamente quanto a: divulgação de antes e depois; promessa ou garantia de resultado; sensacionalismo; concurso, sorteio e promoção de procedimentos; autopromoção vedada; divulgação de preços e condições; e menção a técnicas não reconhecidas.

Parágrafo segundo. O CONTRATADO produz o conteúdo a partir das informações e da validação fornecidas, NÃO lhe cabendo conhecer, interpretar ou aplicar as normas do conselho, e não respondendo por processo ético-disciplinar, sanção administrativa ou notificação decorrente do conteúdo aprovado pela CONTRATANTE.

Parágrafo terceiro. Toda peça será submetida à validação do responsável técnico antes da publicação, na forma da cláusula Da Pauta, e a sua aprovação escrita — ou a aprovação tácita nela prevista — vale como declaração de conformidade ética.

Parágrafo quarto. O CONTRATADO poderá recusar a produção de conteúdo que repute manifestamente contrário à saúde pública, que incentive automedicação ou que faça promessa de cura, sem que a recusa configure inadimplemento.

Parágrafo quinto. A CONTRATANTE manterá o CONTRATADO indene de qualquer sanção, condenação ou despesa decorrente de inobservância das normas do seu conselho profissional.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      comoOpcional(CLAUSULA_PORTFOLIO, true),
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 4 — CRIADOR DE HISTÓRIAS · 3. EVENTOS EM TEMPO REAL          */
  /* ================================================================== */
  {
    perfil: "storymaker",
    tipoServico: "cobertura_eventos_stories",
    nome: "Eventos em Tempo Real",
    descricao:
      "Cobertura de evento publicando ao vivo: janela de trabalho, dependência de internet no local, autorização prévia da linha narrativa e retenção progressiva se a data cair.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Início da cobertura", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Término da cobertura", tipo: "texto" },
      { tag: "PERFIS_GERENCIADOS", label: "Perfis em que será publicado", tipo: "textarea" },
      { tag: "QUANTIDADE_STORIES_DIA", label: "Stories previstos", tipo: "numero", exemplo: "40" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "cobertura ao vivo, 3 reels no dia seguinte, destaque organizado e pasta com o material bruto selecionado" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "5 dias" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — mais de 30 dias antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_15_DIAS", label: "% retido — entre 30 e 15 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_7_DIAS", label: "% retido — entre 15 e 7 dias", tipo: "percentual", exemplo: "80" },
      { tag: "PERCENTUAL_RETENCAO_VESPERA", label: "% retido — menos de 7 dias", tipo: "percentual", exemplo: "100" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Antecedência p/ remarcar sem multa", tipo: "texto", exemplo: "20 dias" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE EVENTO EM TEMPO REAL

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
        texto: `Constitui objeto deste contrato a cobertura narrativa em tempo real do evento "[NOME_DO_EVENTO]", em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO], com publicação nos perfis [PERFIS_GERENCIADOS].

Parágrafo primeiro. Estão previstos aproximadamente [QUANTIDADE_STORIES_DIA] stories ao longo da janela contratada, número estimado e não vinculante, dado que o volume real depende do que acontece no evento.

Parágrafo segundo. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo terceiro. NÃO integram o objeto: transmissão ao vivo em vídeo contínuo; fotografia profissional dedicada; vídeo institucional ou aftermovie de alta produção; atendimento a mensagens durante o evento; e cobertura de ambientes simultâneos que exijam profissional adicional.

Parágrafo quarto. Evento é acontecimento irrepetível: o CONTRATADO empregará sua melhor técnica para narrar os momentos combinados, mas não se obriga a registrar a integralidade dos fatos, pessoas ou falas, especialmente os simultâneos ou inacessíveis.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "ao_vivo_e_internet",
        titulo: "Da Publicação ao Vivo e da Dependência de Conectividade",
        essencial: true,
        protege: "Sem internet no salão não há tempo real — e isso é do local, não do profissional.",
        texto: `A publicação em tempo real depende de conexão de internet estável no local do evento, cuja disponibilidade é de responsabilidade da CONTRATANTE ou da casa que sedia o evento.

Parágrafo primeiro. A CONTRATANTE providenciará acesso a rede sem fio com senha, ou confirmará previamente a existência de sinal de dados móveis compatível com o envio de vídeo no local.

Parágrafo segundo. Havendo ausência, instabilidade ou saturação de conexão — situação comum em locais com grande concentração de pessoas —, o CONTRATADO seguirá captando e publicará o material assim que a conexão permitir, ou, não sendo possível, no primeiro momento seguinte ao evento. A publicação diferida por essa causa NÃO configura descumprimento, não gera abatimento e não autoriza recusa do material.

Parágrafo terceiro. A CONTRATANTE aprova previamente, na assinatura, a linha narrativa e o tom da cobertura, autorizando a publicação em tempo real sem aprovação peça a peça, aplicando-se, no que couber, o regime de remoção imediata mediante solicitação.

Parágrafo quarto. O acesso ao perfil se dará por permissão delegada, na forma da cláusula Dos Acessos, e será revogado pela CONTRATANTE ao término da cobertura.

Parágrafo quinto. Bateria, armazenamento e equipamento reserva são responsabilidade do CONTRATADO; ponto de energia acessível na janela de trabalho é responsabilidade da CONTRATANTE.`,
      },
      {
        id: "cancelamento_evento_stories",
        titulo: "Do Cancelamento e da Remarcação",
        essencial: true,
        protege: "Quanto mais perto da data, mais caro desistir — a agenda já foi perdida.",
        texto: `O saldo do preço deverá estar quitado até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data, e o cancelamento por iniciativa da CONTRATANTE sujeita-a à retenção dos seguintes percentuais do valor total:

(i) com mais de 30 (trinta) dias de antecedência: [PERCENTUAL_RETENCAO_30_DIAS]%;
(ii) entre 30 e 15 dias: [PERCENTUAL_RETENCAO_15_DIAS]%;
(iii) entre 15 e 7 dias: [PERCENTUAL_RETENCAO_7_DIAS]%;
(iv) com menos de 7 (sete) dias: [PERCENTUAL_RETENCAO_VESPERA]%.

Parágrafo primeiro. Somam-se à retenção as despesas incorridas e não reembolsáveis.

Parágrafo segundo. A remarcação com antecedência mínima de [PRAZO_AVISO_REMARCACAO], havendo disponibilidade de agenda, não sofrerá retenção, admitida uma única vez.

Parágrafo terceiro. O adiamento por caso fortuito ou força maior preserva crédito por 12 (doze) meses, sujeito à agenda e ao ressarcimento de despesas.

Parágrafo quarto. O impedimento de acesso da equipe ao evento equivale a cancelamento com menos de 7 (sete) dias.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_VIAGEM,
      CLAUSULA_CONDICOES_CLIMATICAS,
      CLAUSULA_EQUIPAMENTO_E_SEGURO,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 4 — CRIADOR DE HISTÓRIAS · 4. BASTIDORES DE INFOPRODUTOS     */
  /* ================================================================== */
  {
    perfil: "storymaker",
    tipoServico: "bastidores_infoprodutos",
    nome: "Bastidores de Infoprodutos",
    descricao:
      "Narrativa de bastidores para aquecer audiência de lançamento: acompanhamento do produtor, sigilo reforçado sobre a operação, promessa publicitária sob responsabilidade de quem vende e janela intensiva de carrinho.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "NOME_DO_PRODUTO", label: "Produto lançado", tipo: "texto" },
      { tag: "NOME_DA_PESSOA_PUBLICA", label: "Pessoa acompanhada", tipo: "texto" },
      { tag: "PERIODO_DA_ACAO", label: "Período da operação", tipo: "texto", exemplo: "de 10/03 a 05/04" },
      { tag: "DATA_ABERTURA_CARRINHO", label: "Abertura do carrinho", tipo: "data" },
      { tag: "DATA_FECHAMENTO_CARRINHO", label: "Fechamento do carrinho", tipo: "data" },
      { tag: "DIAS_DE_PRESENCA", label: "Dias de acompanhamento presencial", tipo: "numero", exemplo: "6" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "narrativa diária em stories, 3 reels por semana e 1 compilado de bastidores ao fim" },
      { tag: "VALOR_DIA_EXTRA", label: "Valor do dia extra de acompanhamento", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE NARRATIVA DE BASTIDORES PARA LANÇAMENTO DIGITAL

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
        texto: `Constitui objeto deste contrato a produção de narrativa de bastidores do lançamento do produto [NOME_DO_PRODUTO], acompanhando [NOME_DA_PESSOA_PUBLICA] no período de [PERIODO_DA_ACAO], com abertura de carrinho em [DATA_ABERTURA_CARRINHO] e fechamento em [DATA_FECHAMENTO_CARRINHO].

Parágrafo primeiro. O serviço compreende [DIAS_DE_PRESENCA] dias de acompanhamento presencial e os seguintes entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Dias adicionais serão orçados a [VALOR_DIA_EXTRA] cada.

Parágrafo segundo. NÃO integram o objeto: verba e gestão de mídia paga; produção das aulas e do produto vendido; páginas, plataforma e integrações; e-mail marketing; atendimento a leads e compradores; e criação da oferta.

Parágrafo terceiro. A CONTRATANTE reconhece que a narrativa de bastidores exige ACESSO REAL à rotina, às reuniões e aos momentos de preparação, e obriga-se a franqueá-lo nos dias contratados.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "sigilo_da_operacao",
        titulo: "Do Sigilo Reforçado sobre a Operação",
        essencial: true,
        protege: "Quem entra nos bastidores vê número, estratégia e oferta antes do mercado.",
        texto: `Em razão do acesso privilegiado à operação, o CONTRATADO assume dever de sigilo REFORÇADO sobre tudo o que presenciar, em complemento à cláusula Da Confidencialidade.

Parágrafo primeiro. São confidenciais, ainda que presenciados de forma incidental: faturamento, número de leads e de vendas, taxas de conversão, custo por lead, verba investida, margem, estrutura de comissionamento, dados de afiliados, estratégia de oferta e de precificação, bônus não anunciados, calendário de lançamento não divulgado, e conteúdo do produto ainda não lançado.

Parágrafo segundo. O CONTRATADO não publicará, sem aprovação escrita e específica, nenhum número, print de painel, tela de plataforma ou dado de resultado, ainda que a pedido verbal feito no calor do lançamento.

Parágrafo terceiro. O dever de sigilo desta cláusula vigora pelo prazo de [PRAZO_CONFIDENCIALIDADE] contados do encerramento, e a sua violação sujeita o infrator à multa da cláusula Da Confidencialidade.

Parágrafo quarto. O uso em portfólio observará o disposto na cláusula Do Uso em Portfólio, restrito ao material publicamente veiculado e sem revelação de dados da operação.

Parágrafo quinto. A CONTRATANTE, por sua vez, não divulgará valores, condições comerciais ou métodos do CONTRATADO sem igual autorização.`,
      },
      {
        id: "promessa_do_produto",
        titulo: "Da Promessa Publicitária e da Responsabilidade do Produtor",
        essencial: true,
        protege: "O bastidor narra; quem promete resultado é quem vende — e responde por isso.",
        texto: `A definição da oferta, do preço, da garantia e das promessas de resultado é de competência e responsabilidade exclusivas da CONTRATANTE.

Parágrafo primeiro. O CONTRATADO NÃO produzirá nem veiculará conteúdo que contenha promessa de ganho garantido, prova social forjada, escassez inverídica, depoimento fabricado ou omissão de informação essencial ao consumidor, ainda que instruído nesse sentido; a insistência caracteriza justa causa para rescisão com direito ao valor integral.

Parágrafo segundo. A CONTRATANTE declara que o produto existe, será entregue conforme anunciado, e que dispõe de estrutura de atendimento aos compradores.

Parágrafo terceiro. Depoimentos e casos de resultado exibidos nos bastidores serão fornecidos pela CONTRATANTE, que responde por sua veracidade e pelas autorizações de imagem correspondentes.

Parágrafo quarto. Reprovação de anúncio, restrição de conta ou remoção de conteúdo pelas plataformas em razão da oferta observam a cláusula Das Plataformas de Terceiros.

Parágrafo quinto. O CONTRATADO não responde por faturamento, número de vendas, conversão ou qualquer resultado do lançamento, obrigação de meio na forma da cláusula Da Limitação de Responsabilidade.`,
      },
      CLAUSULA_ROTINA_E_ATENDIMENTO,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_VIAGEM,
      CLAUSULA_EQUIPAMENTO_E_SEGURO,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 4 — CRIADOR DE HISTÓRIAS · 5. DIÁRIAS DE VIAGEM              */
  /* ================================================================== */
  {
    perfil: "storymaker",
    tipoServico: "diarias_de_viagem",
    nome: "Diárias de Viagem",
    descricao:
      "Acompanhamento em viagem, onde o contrato precisa tratar do que ninguém lembra: dia de deslocamento, hospedagem, seguro, bagagem de equipamento, jornada em fuso diferente e o que acontece se o roteiro mudar no aeroporto.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_VIAGEM,
      { tag: "DESTINO_DA_VIAGEM", label: "Destino", tipo: "texto" },
      { tag: "PERIODO_DA_VIAGEM", label: "Período da viagem", tipo: "texto", exemplo: "de 10/07 a 17/07" },
      { tag: "NUMERO_DIARIAS_TRABALHO", label: "Diárias de trabalho", tipo: "numero", exemplo: "6" },
      { tag: "NUMERO_DIARIAS_DESLOCAMENTO", label: "Diárias de deslocamento", tipo: "numero", exemplo: "2" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "narrativa diária em stories, 1 reels por dia e 1 filme-resumo de 3 min ao fim" },
      { tag: "VALOR_DIARIA_TRABALHO", label: "Valor da diária de trabalho", tipo: "moeda" },
      { tag: "SEGURO_VIAGEM_RESPONSAVEL", label: "Quem contrata o seguro viagem", tipo: "texto", exemplo: "a contratante, incluindo cobertura médica e de bagagem" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL EM VIAGEM

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Separa dia de trabalho de dia de avião — os dois existem e os dois se pagam.",
        texto: `Constitui objeto deste contrato a cobertura audiovisual da viagem a [DESTINO_DA_VIAGEM], no período de [PERIODO_DA_VIAGEM], compreendendo [NUMERO_DIARIAS_TRABALHO] diárias de trabalho e [NUMERO_DIARIAS_DESLOCAMENTO] diárias de deslocamento.

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo segundo. A diária de trabalho é remunerada a [VALOR_DIARIA_TRABALHO] e observa a jornada da cláusula Da Jornada. A diária de deslocamento, ainda que sem captação, é remunerada a 50% (cinquenta por cento) desse valor, dado que o dia fica integralmente indisponível para outro trabalho.

Parágrafo terceiro. NÃO integram o objeto: produção de roteiro de viagem; reservas, ingressos e passeios; tradução e intérprete; taxas de filmagem em atrativos, parques, museus e áreas protegidas; e autorizações de captação exigidas por autoridade local.

Parágrafo quarto. O CONTRATADO não é acompanhante, assistente pessoal ou guia: sua atuação limita-se à cobertura audiovisual contratada.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "logistica_da_viagem",
        titulo: "Da Logística, do Seguro e do Equipamento em Viagem",
        essencial: true,
        protege: "Passagem, hotel, seguro e bagagem de equipamento por conta de quem contratou a viagem.",
        texto: `Correrão por conta exclusiva da CONTRATANTE: transporte de ida e volta, hospedagem, alimentação, translados locais, taxas de embarque e turismo, e vistos ou autorizações de entrada, para toda a equipe do CONTRATADO, observados os padrões [PADRAO_TRANSPORTE_AEREO] e [PADRAO_HOSPEDAGEM].

Parágrafo primeiro. O seguro viagem, com cobertura médica, de repatriação e de bagagem, será contratado por [SEGURO_VIAGEM_RESPONSAVEL], com antecedência mínima de 7 (sete) dias do embarque, e a apólice será enviada ao CONTRATADO.

Parágrafo segundo. O transporte de equipamento técnico será feito como bagagem de mão sempre que possível; a CONTRATANTE arcará com bagagem adicional, excesso de peso e, quando necessário, com o seguro específico do equipamento. Extravio, avaria ou retenção alfandegária de equipamento durante o transporte custeado pela CONTRATANTE será por esta ressarcido, na forma da cláusula Do Equipamento, ressalvado o que for coberto pelo seguro.

Parágrafo terceiro. Documentação pessoal válida — passaporte, visto, certificados sanitários exigidos pelo destino — é responsabilidade de cada profissional, e a sua ausência autoriza a substituição do integrante por outro de qualificação equivalente.

Parágrafo quarto. Alterações de itinerário, remarcações e cancelamentos determinados pela CONTRATANTE correm por sua conta, incluindo multas e diferenças tarifárias, além das diárias bloqueadas e não aproveitadas.

Parágrafo quinto. Havendo destino sob alerta oficial de segurança, epidemia, conflito ou desastre natural, o CONTRATADO poderá recusar o embarque sem penalidade, restituindo os valores de diárias não realizadas, retidas as despesas incorridas.`,
      },
      {
        id: "jornada_em_viagem",
        titulo: "Da Jornada em Viagem, do Descanso e do Roteiro",
        essencial: true,
        protege: "Estar hospedado junto não é estar trabalhando 24 horas — e roteiro muda, mas tem custo.",
        texto: `A permanência do CONTRATADO no mesmo destino ou hospedagem da CONTRATANTE NÃO significa disponibilidade integral: a jornada diária contratada é a da cláusula Da Jornada, e o tempo excedente observa o regime de horas extras.

Parágrafo primeiro. É assegurado descanso mínimo de [INTERVALO_ENTRE_DIARIAS] entre jornadas, e ao menos 1 (um) período de folga a cada 6 (seis) dias consecutivos de trabalho em viagem, no qual não haverá captação nem publicação.

Parágrafo segundo. Fusos horários e horários locais não ampliam a jornada: a diária é contada pelo tempo efetivo de trabalho no destino.

Parágrafo terceiro. O roteiro previsto poderá ser ajustado no curso da viagem por conveniência da CONTRATANTE, desde que preservados a jornada, o descanso e o número de diárias contratadas. Alterações que aumentem dias, deslocamentos internos, cidades ou atividades constituem alteração de escopo e serão remuneradas como diária adicional.

Parágrafo quarto. A publicação em tempo real depende de conectividade no destino; a sua ausência difere a publicação sem configurar descumprimento, aplicando-se, no que couber, a cláusula Da Publicação ao Vivo.

Parágrafo quinto. Condições climáticas, restrições locais, fechamento de atrativos e determinações de autoridade estrangeira observam as cláusulas Das Condições Climáticas e Do Caso Fortuito, sem direito a abatimento.`,
      },
      CLAUSULA_VIAGEM,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_CONDICOES_CLIMATICAS,
      CLAUSULA_EQUIPAMENTO_E_SEGURO,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
];
