import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/** Banco de modelos de contrato do perfil AGÊNCIA DE MARKETING — 5 tipos de serviço. Ver aviso em `filmmaker.ts`. */
export const MODELOS_AGENCIA_MARKETING: ModeloContratoServico[] = [
  {
    perfil: "agencia_marketing",
    tipoServico: "full_service",
    nome: "Full-Service",
    descricao: "Gestão de marketing full-service (múltiplas frentes), com verba de mídia e ferramentas de terceiros fora do fee mensal.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "FRENTES_CONTRATADAS", label: "Frentes contratadas", tipo: "textarea", exemplo: "estratégia, conteúdo, tráfego pago, e-mail marketing, relatórios" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "PERIODICIDADE_REUNIOES", label: "Periodicidade das reuniões", tipo: "texto", exemplo: "quinzenal" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por entregável", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSALIDADE", label: "Dia de vencimento da mensalidade", tipo: "numero", exemplo: "5" },
      { tag: "DIAS_TOLERANCIA_INADIMPLENCIA", label: "Dias de tolerância antes de suspender", tipo: "numero", exemplo: "5" },
      { tag: "PRAZO_DEVOLUCAO_ACESSOS", label: "Prazo de devolução de acessos ao fim do contrato", tipo: "texto", exemplo: "5 dias úteis" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING FULL-SERVICE

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de marketing full-service para a marca [NOME_DA_MARCA_OU_PRODUTO], compreendendo as frentes: [FRENTES_CONTRATADAS].

2. DO ESCOPO
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Reuniões de acompanhamento: [PERIODICIDADE_REUNIOES], com apresentação de relatório de resultados.
2.3. Verbas de mídia, ferramentas de terceiros e produção audiovisual avulsa não estão inclusas na mensalidade, sendo custeadas à parte pela CONTRATANTE, conforme cláusula 6.

3. DO PRAZO
3.1. Serviço contínuo/mensal; entregáveis pontuais seguem o cronograma aprovado no planejamento de cada mês.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por entregável do mês.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade (fee de agência): [VALOR_DO_SERVIÇO], com vencimento todo dia [DIA_VENCIMENTO_MENSALIDADE]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Inadimplência superior a [DIAS_TOLERANCIA_INADIMPLENCIA] dias autoriza a suspensão de todos os serviços, incluindo eventual pausa de campanhas ativas, até a regularização.

6. DA VERBA DE MÍDIA E CUSTOS DE TERCEIROS
6.1. O investimento em mídia paga é de responsabilidade e titularidade da CONTRATANTE, que deve manter meio de pagamento próprio cadastrado diretamente nas plataformas, salvo se expressamente acordada a gestão do cartão/verba pela CONTRATADA mediante repasse antecipado.
6.2. A CONTRATADA não garante resultado específico de campanhas (CPA, ROAS, número de vendas ou leads), por depender de fatores de mercado, concorrência, oferta e políticas das plataformas de anúncio, alheias ao seu controle.

7. DA PROPRIEDADE DOS ATIVOS DIGITAIS
7.1. Contas de anúncio, pixels, domínios, listas de e-mail/CRM e demais ativos digitais criados ou geridos em nome da CONTRATANTE permanecem de sua propriedade, cabendo à CONTRATADA devolver/revogar acessos administrativos em até [PRAZO_DEVOLUCAO_ACESSOS] após o término do contrato.

8. DA RESCISÃO
8.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso.

9. DA CONFIDENCIALIDADE
9.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Aplicam-se os termos gerais.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "gestao_de_trafego",
    nome: "Gestão de Tráfego",
    descricao: "Gestão de campanhas de tráfego pago, com verba de mídia separada do fee e sem garantia de resultado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "PLATAFORMAS_DE_ANUNCIO", label: "Plataformas de anúncio", tipo: "texto", exemplo: "Meta Ads, Google Ads" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "PERIODO_MINIMO_TESTE", label: "Período mínimo de teste/aprendizado", tipo: "texto", exemplo: "30 a 45 dias" },
      { tag: "PERCENTUAL_FEE_SOBRE_VERBA", label: "% de fee sobre a verba (se aplicável)", tipo: "percentual", exemplo: "10" },
      { tag: "DIAS_TOLERANCIA_INADIMPLENCIA", label: "Dias de tolerância antes de pausar campanhas", tipo: "numero", exemplo: "5" },
      { tag: "PRAZO_DEVOLUCAO_ACESSOS", label: "Prazo de devolução de acessos ao fim do contrato", tipo: "texto", exemplo: "5 dias úteis" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE TRÁFEGO PAGO

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de planejamento, criação e gestão de campanhas de tráfego pago nas plataformas [PLATAFORMAS_DE_ANUNCIO] para a marca [NOME_DA_MARCA_OU_PRODUTO].

2. DO ESCOPO
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. A verba de mídia é integralmente separada do fee de gestão e de responsabilidade da CONTRATANTE, que deve manter saldo/cartão próprio cadastrado nas plataformas de anúncio; a CONTRATADA não se responsabiliza por bloqueio de conta por dívida da CONTRATANTE junto às plataformas.
2.3. Compete à CONTRATANTE conceder acesso de administrador às contas de anúncio, ao Business Manager/Google Ads e ao pixel/tag de conversão do site, sob pena de suspensão do início/continuidade da gestão até a liberação.

3. DO PRAZO
3.1. Serviço contínuo/mensal; período mínimo de teste e aprendizado de campanha recomendado: [PERIODO_MINIMO_TESTE], necessário para maturação de algoritmo das plataformas antes de otimizações relevantes.

4. DA AUSÊNCIA DE GARANTIA DE RESULTADO
4.1. A CONTRATADA envidará seus melhores esforços técnicos, mas não garante resultado específico de campanha (custo por resultado, ROAS, volume de vendas/leads), por depender de fatores de mercado, oferta, produto, atendimento e políticas das plataformas, alheios ao seu controle direto.
4.2. Rejeição de anúncios, restrição ou banimento de conta por violação de políticas de conteúdo das próprias plataformas (quando o conteúdo/oferta é de responsabilidade da CONTRATANTE) não constitui falha da CONTRATADA.

5. DO VALOR E PAGAMENTO
5.1. Fee de gestão: [VALOR_DO_SERVIÇO] (fixo mensal) ou [PERCENTUAL_FEE_SOBRE_VERBA]% sobre a verba de mídia investida no mês, conforme aplicável. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Inadimplência superior a [DIAS_TOLERANCIA_INADIMPLENCIA] dias autoriza a pausa das campanhas até a regularização, sem responsabilidade da CONTRATADA por eventual queda de desempenho decorrente da pausa.

6. DA PROPRIEDADE DOS ATIVOS
6.1. Contas de anúncio, pixels e dados de conversão permanecem de propriedade da CONTRATANTE, cabendo devolução/revogação de acessos administrativos em até [PRAZO_DEVOLUCAO_ACESSOS] após o término do contrato.

7. DA RESCISÃO
7.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso e eventual fee proporcional sobre verba já investida.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "coproducao_lancamentos",
    nome: "Coprodução (Lançamentos)",
    descricao: "Coprodução de lançamento com remuneração vinculada a percentual do faturamento (revenue share), sem garantia de resultado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_LANCAMENTO", label: "Nome do lançamento", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "MARCOS_DO_CRONOGRAMA", label: "Cronograma do lançamento", tipo: "textarea" },
      { tag: "RESPONSAVEL_PELA_VERBA", label: "Responsável pela verba de tráfego", tipo: "texto", exemplo: "PRODUTORA" },
      { tag: "PRAZO_ANTECIPACAO_VERBA", label: "Prazo de antecipação da verba", tipo: "texto", exemplo: "5 dias" },
      { tag: "PERCENTUAL_COPRODUCAO", label: "% de participação no faturamento", tipo: "percentual", exemplo: "20" },
      { tag: "DATAS_DO_CARRINHO", label: "Datas do carrinho (abertura/fechamento)", tipo: "textarea" },
      { tag: "VALOR_FIXO_MINIMO", label: "Valor fixo mínimo (garantia de honorários)", tipo: "moeda" },
      { tag: "PRAZO_APURACAO_PAGAMENTO", label: "Prazo de apuração e pagamento", tipo: "texto", exemplo: "15 dias" },
    ],
    texto: `CONTRATO DE COPRODUÇÃO DE LANÇAMENTO DIGITAL

CONTRATANTE (PRODUTOR/A): [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO/A (COPRODUTORA): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Coprodução do lançamento digital "[NOME_DO_LANCAMENTO]", mediante a qual a COPRODUTORA presta serviços de estratégia, tráfego pago e gestão de todo o funil de vendas, em parceria de risco compartilhado com remuneração vinculada ao resultado de vendas (cláusula 5).

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cronograma do lançamento: [MARCOS_DO_CRONOGRAMA].
2.3. A PRODUTORA é responsável pelo conteúdo/produto vendido, atendimento pós-venda, suporte a alunos/clientes e cumprimento de toda obrigação legal decorrente da venda (Código de Defesa do Consumidor, emissão de nota fiscal, garantia).

3. DA VERBA DE TRÁFEGO
3.1. A verba de mídia é de responsabilidade financeira de [RESPONSAVEL_PELA_VERBA], disponibilizada com antecedência mínima de [PRAZO_ANTECIPACAO_VERBA] do início do período de aquecimento, sob pena de redução proporcional de escopo/resultado esperado, sem responsabilidade da COPRODUTORA.

4. DA AUSÊNCIA DE GARANTIA DE RESULTADO
4.1. A COPRODUTORA envida seus melhores esforços técnicos e estratégicos, mas não garante faturamento, número de vendas ou ROAS específico, dado que o resultado depende de fatores fora de seu controle (qualidade do produto/oferta, mercado, sazonalidade, reputação prévia da PRODUTORA).

5. DA REMUNERAÇÃO POR PARTICIPAÇÃO NO RESULTADO
5.1. A remuneração da COPRODUTORA corresponde a [PERCENTUAL_COPRODUCAO]% do faturamento líquido de vendas geradas durante o período de carrinho aberto ([DATAS_DO_CARRINHO]), descontados taxas de gateway de pagamento, impostos incidentes sobre a venda e reembolsos/estornos concedidos.
5.2. Adicionalmente, poderá ser pactuado um valor fixo mínimo de [VALOR_FIXO_MINIMO], não reembolsável, a título de garantia mínima de honorários pela estruturação estratégica, compensável com a participação percentual da cláusula 5.1 quando esta a superar.
5.3. Apuração e pagamento da participação em até [PRAZO_APURACAO_PAGAMENTO] após o encerramento do carrinho, mediante prestação de contas com relatório de vendas.

6. DA PRESTAÇÃO DE CONTAS
6.1. A PRODUTORA se compromete a fornecer, de boa-fé, acesso a relatórios de vendas da plataforma de pagamento/checkout utilizada, para fins de conferência da base de cálculo da cláusula 5.

7. DOS DIREITOS DE USO E CRÉDITO
7.1. Materiais estratégicos e de copy desenvolvidos pela COPRODUTORA para este lançamento específico têm uso licenciado à PRODUTORA apenas para esta edição do lançamento, salvo acordo de reutilização em relançamentos futuros mediante nova negociação.
7.2. É facultado à COPRODUTORA citar o resultado do lançamento (sem dados financeiros específicos, salvo autorização) como case em portfólio institucional.

8. DA RESCISÃO
8.1. Cancelamento do lançamento pela PRODUTORA após início da fase de aquecimento: pagamento do valor fixo mínimo da cláusula 5.2 (se pactuado) integralmente, a título de honorários pela estruturação já realizada, independentemente da não realização das vendas.

9. DA CONFIDENCIALIDADE
9.1. Sigilo absoluto sobre estratégia, números de faturamento e dados do lançamento, pelo prazo de [PRAZO_CONFIDENCIALIDADE], inclusive entre lançamentos de terceiros que a COPRODUTORA venha a atender.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Aplicam-se os termos gerais.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — PRODUTORA
[NOME_CONTRATADO] — COPRODUTORA`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "inbound_leads",
    nome: "Inbound/Leads",
    descricao: "Marketing de atração e geração de leads (conteúdo, SEO, automação), sem garantia de volume de leads.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "META_DE_LEADS_MENSAL", label: "Meta de leads/mês (estimativa)", tipo: "texto" },
      { tag: "PRAZO_MATURACAO_ESTRATEGIA", label: "Prazo de maturação da estratégia", tipo: "texto", exemplo: "90 dias" },
      { tag: "DIA_VENCIMENTO_MENSALIDADE", label: "Dia de vencimento da mensalidade", tipo: "numero", exemplo: "5" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DE ATRAÇÃO E GERAÇÃO DE LEADS (INBOUND)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de marketing de atração (inbound marketing) e geração de leads para a marca [NOME_DA_MARCA_OU_PRODUTO], compreendendo produção de conteúdo, automação e captação de contatos qualificados.

2. DO ESCOPO
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Meta de geração de leads (quando pactuada): [META_DE_LEADS_MENSAL], tratada como estimativa de planejamento, não como garantia contratual de resultado (ver cláusula 4).
2.3. Compete à CONTRATANTE fornecer acesso a ferramentas próprias (CRM, plataforma de e-mail, site) quando a operação ocorrer sobre ferramentas da CONTRATANTE.

3. DO PRAZO
3.1. Serviço contínuo/mensal; resultados de SEO/inbound são cumulativos e tipicamente mensuráveis a partir de [PRAZO_MATURACAO_ESTRATEGIA] de execução contínua.

4. DA AUSÊNCIA DE GARANTIA DE RESULTADO
4.1. A CONTRATADA não garante volume específico de leads, posição de ranqueamento em buscadores ou taxa de conversão, por dependerem de fatores de mercado, concorrência e algoritmos de terceiros alheios ao seu controle.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade: [VALOR_DO_SERVIÇO], com vencimento todo dia [DIA_VENCIMENTO_MENSALIDADE]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO E PROPRIEDADE DOS LEADS
6.1. Os contatos/leads captados, bem como o conteúdo publicado nos canais da CONTRATANTE, pertencem integralmente à CONTRATANTE.
6.2. Materiais de conteúdo podem ser citados como case em portfólio da CONTRATADA, vedada a reprodução do conteúdo integral, salvo autorização por escrito.

7. DA PROTEÇÃO DE DADOS DOS LEADS (LGPD)
7.1. O tratamento de dados pessoais dos leads captados observa a Lei nº 13.709/2018, cabendo à CONTRATANTE, como controladora, garantir base legal adequada de coleta, e à CONTRATADA, como operadora quando aplicável, tratá-los apenas conforme instruído.

8. DA RESCISÃO
8.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso.

9. DA CONFIDENCIALIDADE
9.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "terceirizacao_b2b_white_label",
    nome: "Terceirização B2B (White Label)",
    descricao: "Prestação white label para outra agência, com sigilo de marca reforçado e cláusula de não solicitação do cliente final.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Serviços objeto da terceirização", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por entrega", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_NAO_SOLICITACAO", label: "Prazo de não solicitação pós-contrato", tipo: "texto", exemplo: "24 meses" },
      { tag: "VALOR_MULTA_NAO_SOLICITACAO", label: "Multa por violação de não solicitação", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING SOB REGIME DE TERCEIRIZAÇÃO B2B (WHITE LABEL)

CONTRATANTE (AGÊNCIA CONTRATANTE): [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliada em [ENDERECO_CLIENTE].
CONTRATADO/A (PRESTADORA WHITE LABEL): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação, pela PRESTADORA, de serviços de marketing sob regime de terceirização (white label) em favor de clientes finais da AGÊNCIA CONTRATANTE, sem qualquer contato direto ou identificação perante o cliente final, que reconhece exclusivamente a marca da AGÊNCIA CONTRATANTE.

2. DO ESCOPO
2.1. Serviços objeto da terceirização: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Toda comunicação, relatório e material entregue ao cliente final deve ser produzido/embalado sob a identidade visual da AGÊNCIA CONTRATANTE, sem qualquer menção, marca d'água ou identificação da PRESTADORA.
2.3. A AGÊNCIA CONTRATANTE é a única responsável pelo relacionamento comercial, contratual e de suporte perante o cliente final, respondendo integralmente perante este por qualquer questão de atendimento.

3. DA CONFIDENCIALIDADE E DO SIGILO DE MARCA
3.1. A PRESTADORA se obriga a manter sigilo absoluto e permanente sobre: (i) a existência desta parceria de terceirização; (ii) a identidade dos clientes finais atendidos; (iii) informações estratégicas, financeiras e operacionais da AGÊNCIA CONTRATANTE e de seus clientes finais a que tiver acesso.
3.2. É vedado à PRESTADORA se identificar, direta ou indiretamente, perante qualquer cliente final da AGÊNCIA CONTRATANTE como executora dos serviços, inclusive em portfólio público — casos entregues sob este contrato só podem ser citados de forma agregada/anônima, sem identificar o cliente final, e mediante autorização prévia por escrito da AGÊNCIA CONTRATANTE.
3.3. Este dever de sigilo permanece vigente pelo prazo de [PRAZO_CONFIDENCIALIDADE] após o término do contrato.

4. DA NÃO SOLICITAÇÃO (NON-SOLICITATION)
4.1. A PRESTADORA se compromete a não contatar, prospectar, oferecer serviços diretamente, ou aceitar contratação direta de qualquer cliente final apresentado pela AGÊNCIA CONTRATANTE no âmbito deste contrato, durante sua vigência e por [PRAZO_NAO_SOLICITACAO] após seu término, sob pena de multa de [VALOR_MULTA_NAO_SOLICITACAO] por infração, sem prejuízo de perdas e danos.

5. DO PRAZO E DA DEMANDA
5.1. A alocação de demanda é definida por pedido específico da AGÊNCIA CONTRATANTE, com prazo de entrega de [PRAZO_DE_ENTREGA] dias úteis por demanda, a contar do briefing completo.

6. DAS REVISÕES
6.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por entrega, antes do repasse ao cliente final pela AGÊNCIA CONTRATANTE.

7. DO VALOR E PAGAMENTO
7.1. Valor: [VALOR_DO_SERVIÇO] (por cliente final/mês, ou conforme tabela em anexo). Pagamento: [CONDICOES_DE_PAGAMENTO].

8. DA RESPONSABILIDADE TÉCNICA
8.1. A PRESTADORA responde tecnicamente perante a AGÊNCIA CONTRATANTE pela qualidade dos serviços entregues, cabendo a esta a responsabilidade final perante o cliente final.

9. DA RESCISÃO
9.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], permanecendo em vigor as obrigações de confidencialidade e não solicitação das cláusulas 3 e 4 independentemente do término.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Aplicam-se os termos gerais.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — AGÊNCIA CONTRATANTE
[NOME_CONTRATADO] — PRESTADORA WHITE LABEL`,
  },
];
