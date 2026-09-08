import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/**
 * Banco de modelos de contrato do perfil AGÊNCIA DE MARKETING — v2, 7 tipos de
 * serviço (substitui a v1 de 5 tipos genéricos). Taxonomia construída pela
 * lente "em que outras frentes uma agência de marketing também atua": gestão
 * contínua (redes sociais/mídia paga), projeto avulso (campanha publicitária,
 * lançamento de produto), consultoria (planejamento estratégico), assessoria
 * de imprensa e ativação de marca em eventos físicos.
 *
 * Cláusulas específicas do nicho: separação entre honorários da agência e
 * verba de mídia (não reembolsável quando já comprometida/reservada), regra
 * de "obrigação de meio" isentando a agência de garantir resultados de
 * negócio (vendas, ROI, engajamento, publicação de imprensa), atribuição
 * exclusiva à contratante pela veracidade de claims publicitários (CDC e
 * CONAR), papel de operadora de dados (LGPD) sobre leads/clientes tratados na
 * execução dos serviços, devolução de credenciais/acessos de contas ao fim do
 * contrato, e — para a ativação de marca em eventos físicos — responsabilidade
 * sobre danos ao local, seguro do evento e tabela de retenção por
 * cancelamento análoga à de outros serviços de data única.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_AGENCIA_MARKETING: ModeloContratoServico[] = [
  {
    perfil: "agencia_marketing",
    tipoServico: "gestao_redes_sociais_marketing_digital",
    nome: "Gestão de Redes Sociais e Marketing Digital (Retainer Mensal)",
    descricao: "Gestão contínua de marketing digital em regime de mensalidade, com cláusula de obrigação de meio, gestão de verba de mídia distinta dos honorários e devolução de credenciais ao término.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DO_ESCOPO_MENSAL", label: "Descrição do escopo mensal", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo de aprovação de pauta", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção anual", tipo: "texto", exemplo: "IPCA" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "MODELO_DE_GESTAO_DE_VERBA", label: "Modelo de gestão de verba de mídia", tipo: "texto", exemplo: "conta de anúncios da própria contratante" },
      { tag: "PRAZO_DEVOLUCAO_ACESSOS", label: "Prazo de devolução de acessos", tipo: "texto", exemplo: "5 dias úteis" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERIODO_BASE_LIMITACAO", label: "Período-base para cálculo do limite de responsabilidade", tipo: "texto", exemplo: "3 meses" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE MARKETING DIGITAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Prestação contínua de serviços de gestão de marketing digital, compreendendo [DESCRICAO_DO_ESCOPO_MENSAL].

2. DO ESCOPO MENSAL
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário e pautas aprovados em até [PRAZO_APROVACAO_PAUTA].
2.2. Serviços fora do escopo mensal (produção audiovisual avulsa, campanhas publicitárias com verba de mídia, assessoria de imprensa) são orçados à parte.

3. DA OBRIGAÇÃO DE MEIO
3.1. Cláusula essencial: a AGÊNCIA se obriga a empregar as melhores práticas de mercado e diligência técnica, mas não garante resultados específicos de alcance, engajamento, número de seguidores, leads ou vendas, por dependerem de fatores fora de seu controle (algoritmos de plataformas, comportamento de mercado, qualidade do produto/serviço da CONTRATANTE, atendimento comercial).

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Mensalidade: [VALOR_DO_SERVIÇO], vencimento todo dia [DIA_VENCIMENTO_MENSAL]. Reajuste anual pelo índice [INDICE_DE_CORRECAO].
4.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão dos serviços (incluindo pausa de campanhas em andamento) sem prejuízo da cobrança integral do mês.

5. DA GESTÃO DE VERBA DE MÍDIA (QUANDO APLICÁVEL)
5.1. Quando houver investimento em mídia paga, a verba de anúncios é distinta dos honorários da AGÊNCIA e deve ser aportada diretamente pela CONTRATANTE na plataforma de anúncios ou repassada previamente à AGÊNCIA, conforme [MODELO_DE_GESTAO_DE_VERBA].
5.2. A AGÊNCIA não se responsabiliza por bloqueios, suspensões ou políticas de conta impostas pelas plataformas de anúncios (Meta, Google e similares) alheios à sua conduta.

6. DAS CREDENCIAIS E DO ACESSO A CONTAS
6.1. Acessos a contas, senhas e credenciais de redes sociais/plataformas são de propriedade da CONTRATANTE. Ao término do contrato, a AGÊNCIA devolve o controle total das contas em até [PRAZO_DEVOLUCAO_ACESSOS], retendo apenas o histórico necessário para fins fiscais.
6.2. A CONTRATANTE é exclusivamente responsável por manter cadastro de pagamento válido e atualizado nas plataformas de anúncios.

7. DA CONFORMIDADE PUBLICITÁRIA
7.1. A CONTRATANTE é exclusivamente responsável pela veracidade de informações, dados, resultados, preços e afirmações sobre produtos/serviços fornecidos à AGÊNCIA para uso em peças publicitárias, respondendo por eventual infração ao Código de Defesa do Consumidor, ao Código Brasileiro de Autorregulamentação Publicitária (CONAR) ou a normas setoriais específicas.

8. DA PROPRIEDADE INTELECTUAL
8.1. Mediante pagamento em dia, os materiais criativos finais aprovados são de uso da CONTRATANTE para os fins deste contrato. A AGÊNCIA pode usar o material produzido em portfólio e divulgação profissional, com crédito, salvo vedação por escrito.
8.2. Metodologias, templates, processos e ferramentas proprietárias da AGÊNCIA não são cedidos, ainda que utilizados na execução dos serviços.

9. DA RESCISÃO E DA FIDELIDADE
9.1. Prazo de fidelidade mínima: [PRAZO_FIDELIDADE_MINIMA]. Rescisão antecipada pela CONTRATANTE sem justa causa dentro desse prazo sujeita-se a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.
9.2. Após o período de fidelidade, rescisão mediante aviso prévio de [PRAZO_AVISO_RESCISAO].

10. DA CONFIDENCIALIDADE
10.1. Sigilo sobre dados estratégicos, financeiros e de negócio da CONTRATANTE pelo prazo de [PRAZO_CONFIDENCIALIDADE].

11. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
11.1. A AGÊNCIA atua como operadora de dados pessoais de leads/clientes da CONTRATANTE eventualmente tratados na execução dos serviços, obrigando-se a tratá-los exclusivamente para as finalidades contratadas e conforme as instruções da CONTRATANTE, nos termos da Lei nº 13.709/2018.

12. DO CASO FORTUITO E FORÇA MAIOR
12.1. Nenhuma parte responde por descumprimento decorrente de caso fortuito ou força maior.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. A responsabilidade da AGÊNCIA fica limitada ao valor pago nos últimos [PERIODO_BASE_LIMITACAO] de contrato, excluídos lucros cessantes, danos indiretos e resultados de negócio não alcançados.
13.2. A CONTRATANTE se compromete a indenizar e manter a AGÊNCIA isenta de qualquer reclamação, multa ou processo decorrente de: (i) informações, dados ou afirmações falsas ou não verificadas sobre produtos/serviços fornecidas para uso publicitário; (ii) bloqueio/banimento de contas por violação de políticas de plataforma imputável à CONTRATANTE; (iii) uso do material fora do combinado.
13.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta da AGÊNCIA.

14. DAS DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício, societário ou de exclusividade, salvo cláusula em contrário.

15. DO FORO
15.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "gestao_trafego_pago",
    nome: "Gestão de Tráfego Pago (Mídia Paga)",
    descricao: "Gestão de campanhas de mídia paga (Meta Ads, Google Ads e similares), com honorários separados da verba de mídia e cláusula de obrigação de meio quanto a ROI e conversões.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "PLATAFORMAS_DE_ANUNCIO", label: "Plataformas de anúncio", tipo: "texto", exemplo: "Meta Ads, Google Ads" },
      { tag: "MODELO_DE_GESTAO_DE_VERBA", label: "Modelo de gestão de verba de mídia", tipo: "texto", exemplo: "conta de anúncios da própria contratante" },
      { tag: "VALOR_MINIMO_VERBA_MENSAL", label: "Valor mínimo de verba de mídia mensal recomendado", tipo: "moeda" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "3 meses" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PERIODO_BASE_LIMITACAO", label: "Período-base para cálculo do limite de responsabilidade", tipo: "texto", exemplo: "3 meses" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE TRÁFEGO PAGO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Gestão de campanhas de mídia paga (tráfego pago) nas plataformas [PLATAFORMAS_DE_ANUNCIO], compreendendo estruturação, otimização e relatórios de campanha.

2. DO ESCOPO E DA VERBA DE MÍDIA
2.1. Honorários de gestão: [VALOR_DO_SERVIÇO]. Verba de mídia (investimento em anúncios) é distinta dos honorários e deve ser aportada pela CONTRATANTE diretamente na plataforma de anúncios, salvo modelo de gestão de verba centralizada expressamente pactuado em [MODELO_DE_GESTAO_DE_VERBA].
2.2. Valor mínimo mensal de verba de mídia recomendado: [VALOR_MINIMO_VERBA_MENSAL], sem o qual a AGÊNCIA não garante volume mínimo de resultados por limitação orçamentária, não imputável a sua atuação técnica.

3. DA OBRIGAÇÃO DE MEIO
3.1. Cláusula essencial: a gestão de tráfego pago é obrigação de meio. A AGÊNCIA não garante custo por resultado, taxa de conversão, ROI (retorno sobre investimento) ou volume de vendas específicos, dependendo tais métricas de fatores externos (qualidade do produto/oferta, atendimento comercial da CONTRATANTE, sazonalidade, políticas e leilão das plataformas).

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Honorários mensais: [VALOR_DO_SERVIÇO], vencimento todo dia [DIA_VENCIMENTO_MENSAL].
4.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão ou pausa das campanhas ativas, sem responsabilidade da AGÊNCIA pela perda de desempenho decorrente da pausa.

5. DAS CONTAS DE ANÚNCIO
5.1. As contas de anúncio e formas de pagamento nas plataformas permanecem de titularidade e responsabilidade da CONTRATANTE, exceto quando expressamente pactuada conta gerenciada pela AGÊNCIA.
5.2. A AGÊNCIA não se responsabiliza por bloqueio, banimento, glosa de cartão ou suspensão de conta de anúncio determinados pela própria plataforma, alheios à sua conduta técnica.

6. DA CONFORMIDADE PUBLICITÁRIA
6.1. A CONTRATANTE é exclusivamente responsável pela veracidade das informações, preços, condições de oferta e demais afirmações usadas nos anúncios, inclusive quanto à conformidade com o Código de Defesa do Consumidor e políticas de anúncio das plataformas.

7. DA PROPRIEDADE INTELECTUAL
7.1. Criativos publicitários produzidos pela AGÊNCIA são de uso da CONTRATANTE mediante pagamento em dia. Metodologias e estruturas de campanha proprietárias da AGÊNCIA não são cedidas.

8. DA RESCISÃO
8.1. Rescisão mediante aviso prévio de [PRAZO_AVISO_RESCISAO], respeitado eventual prazo de fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], sujeito a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes em caso de rescisão antecipada sem justa causa.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre estratégias, orçamentos e dados de campanha pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. A AGÊNCIA atua como operadora de dados de leads/clientes eventualmente coletados via formulários e pixels de conversão, conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por instabilidade, alteração de política ou indisponibilidade das plataformas de anúncio.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Responsabilidade da AGÊNCIA limitada ao valor de honorários pago nos últimos [PERIODO_BASE_LIMITACAO], excluída a verba de mídia investida diretamente pela CONTRATANTE, lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza a AGÊNCIA por: (i) informações falsas usadas em anúncios; (ii) bloqueio de conta por violação de política imputável à CONTRATANTE; (iii) reclamações de consumidores decorrentes de oferta/produto da CONTRATANTE.
12.3. Avaliações públicas negativas de má-fé sujeitas a notificação extrajudicial, sem prejuízo do direito de resposta.

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício ou societário.

14. DO FORO
14.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "campanha_publicitaria",
    nome: "Criação e Execução de Campanha Publicitária (Projeto)",
    descricao: "Criação e execução de campanha publicitária avulsa, com verba de veiculação separada dos honorários criativos e não reembolsável quando já comprometida junto a veículos.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DA_CAMPANHA", label: "Nome da campanha", tipo: "texto" },
      { tag: "DESCRICAO_DO_ESCOPO_DA_CAMPANHA", label: "Descrição do escopo da campanha", tipo: "textarea" },
      { tag: "NUMERO_DE_PROPOSTAS_INICIAIS", label: "Nº de conceitos criativos iniciais", tipo: "numero", exemplo: "2" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PRAZO_PROPOSTAS_INICIAIS", label: "Prazo de entrega dos conceitos iniciais", tipo: "texto", exemplo: "10 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_RODADA_ADICIONAL", label: "Valor de rodada adicional", tipo: "moeda" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso dos materiais", tipo: "texto", exemplo: "12 meses" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória sobre o saldo remanescente", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE CAMPANHA PUBLICITÁRIA

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Criação e execução da campanha publicitária [NOME_DA_CAMPANHA], compreendendo [DESCRICAO_DO_ESCOPO_DA_CAMPANHA].

2. DO ESCOPO E DAS ETAPAS
2.1. Etapas: briefing, [NUMERO_DE_PROPOSTAS_INICIAIS] conceito(s) criativo(s), produção dos materiais aprovados e veiculação (quando incluída). Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Briefing incompleto ou aprovações tardias por parte da CONTRATANTE suspendem a contagem dos prazos de entrega.

3. DO PRAZO DE ENTREGA
3.1. Conceitos iniciais entregues em até [PRAZO_PROPOSTAS_INICIAIS] após o briefing. Materiais finais em até [PRAZO_DE_ENTREGA] dias corridos após aprovação do conceito.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste sobre o conceito aprovado. Mudança de conceito já aprovado, ou nova rodada de propostas após escolha, é cobrada à parte no valor de [VALOR_RODADA_ADICIONAL].

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Caso a campanha inclua verba de veiculação, esta é distinta dos honorários criativos e segue a cláusula 6.
5.2. Materiais finais em arquivo editável só são entregues após quitação integral.

6. DA VEICULAÇÃO E VERBA DE MÍDIA
6.1. Quando contratada a veiculação, a verba de mídia deve ser aportada previamente pela CONTRATANTE, sendo não reembolsável após reservada/comprometida junto aos veículos, dado que a reserva de espaço publicitário é geralmente irrevogável perante terceiros.

7. DA CONFORMIDADE PUBLICITÁRIA
7.1. A CONTRATANTE é exclusivamente responsável pela veracidade das informações e afirmações fornecidas para a campanha, respondendo por eventual infração ao Código de Defesa do Consumidor ou ao Código Brasileiro de Autorregulamentação Publicitária (CONAR).

8. DA CESSÃO DE DIREITOS
8.1. Mediante pagamento integral, a AGÊNCIA cede à CONTRATANTE os direitos de uso dos materiais publicitários finais aprovados, nos meios e pelo prazo de [PRAZO_DA_LICENCA_DE_USO].
8.2. A AGÊNCIA pode usar a campanha em portfólio e divulgação profissional, com crédito, salvo vedação por escrito (comum para campanhas de lançamento ainda não divulgadas).

9. DA RESCISÃO E DAS MULTAS
9.1. Desistência da CONTRATANTE após início do trabalho: pagamento proporcional às etapas já entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente, a título de reserva de agenda e equipe.
9.2. Rescisão por inadimplemento da AGÊNCIA sem justa causa: devolução dos valores de etapas não realizadas, sem prejuízo de indenização por danos comprovados.

10. DA CONFIDENCIALIDADE
10.1. Sigilo sobre a campanha e produto/lançamento não divulgado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

11. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
11.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

12. DO CASO FORTUITO E FORÇA MAIOR
12.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade da AGÊNCIA limitada ao valor total pago, excluídos lucros cessantes, danos indiretos e resultado comercial da campanha.
13.2. A CONTRATANTE indeniza a AGÊNCIA por: (i) informações/briefing falsos ou incompletos; (ii) uso do material fora da licença concedida; (iii) reclamações de consumidores decorrentes de oferta/produto da CONTRATANTE veiculado na campanha.
13.3. Avaliações públicas negativas de má-fé sujeitas a notificação extrajudicial, sem prejuízo do direito de resposta.

14. DAS DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício ou societário. Alterações somente por aditivo escrito.

15. DO FORO
15.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "consultoria_planejamento_estrategico",
    nome: "Consultoria e Planejamento Estratégico de Marketing",
    descricao: "Consultoria de marketing (diagnóstico e plano estratégico), com natureza de obrigação de meio e proteção da metodologia proprietária da agência.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DO_ESCOPO_DA_CONSULTORIA", label: "Descrição do escopo da consultoria", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PERIODICIDADE_DE_REUNIOES", label: "Periodicidade das reuniões de acompanhamento", tipo: "texto", exemplo: "quinzenal" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSULTORIA DE MARKETING

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Prestação de consultoria e planejamento estratégico de marketing para a CONTRATANTE, compreendendo [DESCRICAO_DO_ESCOPO_DA_CONSULTORIA].

2. DO ESCOPO E DA METODOLOGIA
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Reuniões de acompanhamento: [PERIODICIDADE_DE_REUNIOES].
2.2. A execução prática das recomendações (implementação de campanhas, contratação de fornecedores) não está incluída, salvo se contratada à parte.

3. DA NATUREZA DE OBRIGAÇÃO DE MEIO
3.1. Cláusula essencial: a consultoria constitui obrigação de meio, consistente na entrega de diagnóstico e recomendações tecnicamente fundamentadas. A AGÊNCIA não garante resultados de negócio (crescimento de receita, participação de mercado, redução de custos) decorrentes da adoção, total ou parcial, das recomendações pela CONTRATANTE.

4. DO PRAZO DE ENTREGA
4.1. Entrega do plano/diagnóstico em até [PRAZO_DE_ENTREGA] dias corridos após o levantamento de informações pela CONTRATANTE.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DA CONFIDENCIALIDADE E DA EXCLUSIVIDADE DE USO
6.1. Sigilo sobre dados estratégicos, financeiros e comerciais da CONTRATANTE pelo prazo de [PRAZO_CONFIDENCIALIDADE].
6.2. O plano/relatório entregue é de uso exclusivo da CONTRATANTE, vedada sua revenda ou repasse a terceiros sem autorização da AGÊNCIA.

7. DA PROPRIEDADE INTELECTUAL DA METODOLOGIA
7.1. Frameworks, metodologias proprietárias e templates utilizados na consultoria permanecem de titularidade da AGÊNCIA, sendo cedido à CONTRATANTE apenas o conteúdo específico do plano/diagnóstico entregue.

8. DA RESCISÃO
8.1. Cancelamento após início dos trabalhos: pagamento proporcional às etapas já realizadas.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais eventualmente acessados durante a consultoria conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade da AGÊNCIA limitada ao valor total pago, excluídos lucros cessantes e resultados de negócio não alcançados pela CONTRATANTE.
11.2. A CONTRATANTE indeniza a AGÊNCIA por: (i) informações falsas ou incompletas fornecidas durante o diagnóstico; (ii) uso do plano/relatório fora dos limites da cláusula 6.2; (iii) decisões de negócio tomadas unilateralmente com base parcial ou distorcida das recomendações.
11.3. Avaliações públicas negativas de má-fé sujeitas a notificação extrajudicial, sem prejuízo do direito de resposta.

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício ou societário.

13. DO FORO
13.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "assessoria_de_imprensa",
    nome: "Assessoria de Imprensa e Relações Públicas",
    descricao: "Assessoria de imprensa em regime mensal, com cláusula de obrigação de meio quanto à publicação/repercussão e isenção sobre veracidade de informações fornecidas para divulgação.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DO_ESCOPO_DE_ASSESSORIA", label: "Descrição do escopo de assessoria", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "PRAZO_ENVIO_INFORMACOES_PAUTA", label: "Prazo de envio de informações/pauta pelo cliente", tipo: "texto", exemplo: "5 dias úteis" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERIODO_BASE_LIMITACAO", label: "Período-base para cálculo do limite de responsabilidade", tipo: "texto", exemplo: "3 meses" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ASSESSORIA DE IMPRENSA

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Prestação de serviços de assessoria de imprensa e relações públicas, compreendendo [DESCRICAO_DO_ESCOPO_DE_ASSESSORIA].

2. DO ESCOPO MENSAL
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS]. Pauta e materiais de apoio fornecidos pela CONTRATANTE em até [PRAZO_ENVIO_INFORMACOES_PAUTA].

3. DA OBRIGAÇÃO DE MEIO
3.1. Cláusula essencial: a assessoria de imprensa é obrigação de meio. A AGÊNCIA não garante publicação, veiculação, aceite editorial ou repercussão de qualquer pauta enviada a veículos de imprensa, tratando-se de decisão exclusiva de cada veículo/jornalista.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Mensalidade: [VALOR_DO_SERVIÇO], vencimento todo dia [DIA_VENCIMENTO_MENSAL].

5. DA VERACIDADE DAS INFORMAÇÕES E DA GESTÃO DE CRISE
5.1. A CONTRATANTE é exclusivamente responsável pela veracidade de todas as informações, dados e declarações fornecidas à AGÊNCIA para divulgação à imprensa, respondendo por eventual conteúdo falso, difamatório a terceiros ou que viole direitos de terceiros.
5.2. Serviços de gestão de crise de imagem estão fora do escopo deste contrato, salvo se expressamente pactuados à parte, dada a natureza emergencial e de precificação diferenciada desse tipo de atuação.

6. DA CONFIDENCIALIDADE
6.1. Sigilo sobre informações estratégicas e pautas não divulgadas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

7. DA PROPRIEDADE INTELECTUAL
7.1. Releases, textos e materiais produzidos são de uso da CONTRATANTE mediante pagamento em dia. A AGÊNCIA pode citar a relação comercial e resultados de clipping em portfólio, salvo vedação por escrito.

8. DA RESCISÃO E DA FIDELIDADE
8.1. Prazo de fidelidade mínima: [PRAZO_FIDELIDADE_MINIMA]. Rescisão antecipada sem justa causa dentro desse prazo sujeita-se a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes. Após esse prazo, rescisão mediante aviso prévio de [PRAZO_AVISO_RESCISAO].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados de contatos de imprensa e demais dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito ou força maior.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade da AGÊNCIA limitada ao valor pago nos últimos [PERIODO_BASE_LIMITACAO] de contrato, excluídos lucros cessantes e resultados de exposição midiática não alcançados.
11.2. A CONTRATANTE indeniza a AGÊNCIA por: (i) informações falsas, difamatórias ou que violem direitos de terceiros divulgadas por meio da assessoria; (ii) reclamações de veículos de imprensa ou terceiros decorrentes de conteúdo fornecido pela CONTRATANTE.
11.3. Avaliações públicas negativas de má-fé sujeitas a notificação extrajudicial, sem prejuízo do direito de resposta.

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício ou societário.

13. DO FORO
13.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "ativacao_de_marca_eventos",
    nome: "Ativação de Marca e Eventos (Feiras, Lançamentos, Ativações Físicas)",
    descricao: "Planejamento e execução de ativações de marca em eventos físicos e feiras, com quitação prévia obrigatória, tabela progressiva de retenção por cancelamento e responsabilidade delimitada sobre danos ao local do evento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_EVENTO", label: "Nome do evento/feira", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe alocada", tipo: "texto" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "10 dias" },
      { tag: "PRAZO_RETIRADA_MATERIAIS", label: "Prazo para retirada de materiais físicos pós-evento", tipo: "texto", exemplo: "5 dias úteis" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup de registros por liberalidade", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio de registros", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção acima de 60 dias", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção entre 60 e 30 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção entre 30 e 10 dias", tipo: "percentual", exemplo: "80" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ATIVAÇÃO DE MARCA E EVENTOS

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Planejamento e execução de ativação de marca no evento/feira [NOME_DO_EVENTO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Equipe alocada: [COMPOSICAO_DA_EQUIPE].
2.2. Cabe à CONTRATANTE providenciar, às suas expensas, alvará, licenças de funcionamento, autorização do local e infraestrutura elétrica/estrutural do espaço, salvo se expressamente incluído no escopo.

3. DAS RESPONSABILIDADES NO LOCAL DO EVENTO
3.1. A AGÊNCIA e sua equipe respondem por danos que causarem culposamente ao espaço/estrutura do local durante a montagem, execução e desmontagem da ativação.
3.2. Danos causados por terceiros (público, outros expositores, prestadores da própria CONTRATANTE ou do organizador do evento) não são de responsabilidade da AGÊNCIA.
3.3. Cabe à CONTRATANTE contratar seguro de responsabilidade civil do evento quando exigido pelo organizador/local, salvo pactuação diversa por escrito.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Cláusula essencial: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data do evento, considerando que materiais, estrutura e equipe são reservados/adquiridos com antecedência. O não pagamento até esse prazo autoriza a AGÊNCIA a não executar a ativação, sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 6.

5. DO ARMAZENAMENTO DE MATERIAIS PÓS-EVENTO
5.1. Materiais e estruturas físicas produzidos para a ativação (banners, estandes, brindes remanescentes) são de responsabilidade de retirada/armazenamento da CONTRATANTE a partir de [PRAZO_RETIRADA_MATERIAIS] após o evento, sob pena de descarte pela AGÊNCIA sem direito a indenização.
5.2. Registros fotográficos/audiovisuais do evento, quando produzidos, seguem a regra de armazenamento pós-entrega padrão: guarda transferida à CONTRATANTE após a entrega, com backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP] e reenvio cobrado a [VALOR_TAXA_REENVIO].

6. DA RESCISÃO E DA TABELA DE RETENÇÃO
6.1. Dada a reserva de equipe, estrutura e fornecedores para data específica, o cancelamento pela CONTRATANTE segue a tabela: mais de 60 dias de antecedência — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 60 e 30 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 30 e 10 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 10 dias ou não realização por causa imputável à CONTRATANTE — retenção de 100%.

7. DOS DIREITOS DE USO E IMAGEM
7.1. Registros da ativação cedidos à CONTRATANTE para uso institucional/promocional. A AGÊNCIA pode usar em portfólio, salvo vedação por escrito.
7.2. Imagem de participantes/público captada no evento é de responsabilidade da CONTRATANTE quanto à eventual necessidade de autorização, conforme a política de privacidade do evento.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre estratégia de ativação e produto/lançamento não divulgado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais eventualmente coletados no evento (ex.: cadastro de leads) conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por cancelamento/adiamento do evento por determinação do organizador, autoridade pública, condições climáticas severas ou outro caso fortuito/força maior; valores pagos migram para nova data quando possível, ou são devolvidos proporcionalmente aos serviços não prestados.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade da AGÊNCIA limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
11.2. A CONTRATANTE indeniza a AGÊNCIA por: (i) ausência de alvará/licença do evento; (ii) danos causados por terceiros ou pelo próprio organizador do evento; (iii) informações falsas sobre o produto/marca divulgadas na ativação; (iv) uso do material fora do combinado.
11.3. Avaliações públicas negativas de má-fé sujeitas a notificação extrajudicial, sem prejuízo do direito de resposta.

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício ou societário.

13. DO FORO
13.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "agencia_marketing",
    tipoServico: "lancamento_de_produto_digital_launch",
    nome: "Lançamento de Produto / Campanha de Lançamento (Digital Launch)",
    descricao: "Campanha multicanal de lançamento de produto com data-alvo, quitação prévia obrigatória, verba de mídia não reembolsável quando comprometida e isenção sobre veracidade de claims de resultado/venda do cliente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_PRODUTO_OU_SERVICO", label: "Nome do produto/serviço lançado", tipo: "texto" },
      { tag: "DATA_DO_LANCAMENTO", label: "Data-alvo de lançamento", tipo: "data" },
      { tag: "DESCRICAO_DAS_FASES_DA_CAMPANHA", label: "Descrição das fases da campanha", tipo: "textarea", exemplo: "pré-lançamento, lançamento, pós-lançamento" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do lançamento", tipo: "texto", exemplo: "10 dias" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção acima de 60 dias", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção entre 60 e 30 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção entre 30 e 10 dias", tipo: "percentual", exemplo: "80" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAMPANHA DE LANÇAMENTO DE PRODUTO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADA: [NOME_CONTRATADO], CNPJ nº [CPF_CNPJ_CONTRATADO], sede em [ENDERECO_CONTRATADO], doravante AGÊNCIA.

1. DO OBJETO
1.1. Planejamento e execução multicanal da campanha de lançamento do produto/serviço [NOME_DO_PRODUTO_OU_SERVICO], com data-alvo de lançamento em [DATA_DO_LANCAMENTO].

2. DO ESCOPO E DO CRONOGRAMA
2.1. Fases da campanha: [DESCRICAO_DAS_FASES_DA_CAMPANHA]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Atraso na entrega de materiais/aprovações pela CONTRATANTE que comprometa a data-alvo de lançamento não gera responsabilidade da AGÊNCIA pelo eventual adiamento.

3. DA VERBA DE MÍDIA DE LANÇAMENTO
3.1. A verba de mídia paga do lançamento é distinta dos honorários da AGÊNCIA e deve ser aportada previamente pela CONTRATANTE, sendo não reembolsável a partir do momento em que reservada/comprometida junto às plataformas ou veículos.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Cláusula essencial: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data-alvo de lançamento, dado que grande parte dos recursos (mídia, equipe, fornecedores) é comprometida com antecedência. O não pagamento até esse prazo autoriza a AGÊNCIA a suspender a execução da campanha, sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 6.

5. DA OBRIGAÇÃO DE MEIO E DA VERACIDADE DAS CLAIMS
5.1. Cláusula essencial: a AGÊNCIA não garante volume de vendas, faturamento ou qualquer resultado financeiro do lançamento, dependendo estes de fatores fora de seu controle técnico (qualidade da oferta, capacidade de entrega da CONTRATANTE, mercado, concorrência).
5.2. A CONTRATANTE é exclusivamente responsável por todas as afirmações sobre o produto/serviço, resultados prometidos, prazos de entrega e condições comerciais utilizadas nos materiais de lançamento, isentando a AGÊNCIA de qualquer responsabilidade por reclamação de consumidores relativa a tais informações.

6. DA RESCISÃO E DA TABELA DE RETENÇÃO
6.1. Dada a reserva de agenda, verba comprometida e equipe alocada para a data-alvo, o cancelamento pela CONTRATANTE segue a tabela: mais de 60 dias de antecedência — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 60 e 30 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 30 e 10 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 10 dias ou cancelamento no dia do lançamento — retenção de 100%.

7. DA CESSÃO DE DIREITOS
7.1. Mediante pagamento integral, os materiais finais aprovados são cedidos à CONTRATANTE para os fins da campanha. A AGÊNCIA pode usar o material em portfólio, salvo vedação por escrito antes do lançamento ao público.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o produto/lançamento não divulgado pelo prazo de [PRAZO_CONFIDENCIALIDADE], especialmente crítico antes da data pública de lançamento.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais de leads/clientes captados na campanha conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito ou força maior; comunicação em até 48h e realinhamento de cronograma.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade da AGÊNCIA limitada ao valor total pago (excluída a verba de mídia aportada diretamente pela CONTRATANTE), excluídos lucros cessantes, danos indiretos e resultado comercial do lançamento.
11.2. A CONTRATANTE indeniza a AGÊNCIA por: (i) afirmações falsas ou não verificadas sobre o produto/serviço lançado (cláusula 5.2); (ii) reclamações de consumidores decorrentes da oferta; (iii) uso do material fora do combinado.
11.3. Avaliações públicas negativas de má-fé sujeitas a notificação extrajudicial, sem prejuízo do direito de resposta.

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício ou societário.

13. DO FORO
13.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
];
