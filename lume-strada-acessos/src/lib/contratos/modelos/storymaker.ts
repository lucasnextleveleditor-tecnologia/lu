import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

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
    tipoServico: "cobertura_eventos_stories",
    nome: "Cobertura de Eventos em Stories",
    descricao: "Cobertura em tempo real de eventos em formato de stories, com tabela de retenção por cancelamento e quitação prévia obrigatória.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega do resumo pós-evento", tipo: "texto", exemplo: "48 horas" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — mais de 15 dias antes", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 15 e 5 dias antes", tipo: "percentual", exemplo: "50" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE EVENTO EM STORIES

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em tempo real, em formato de stories com narrativa sequencial, do evento [NOME_DO_EVENTO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Publicação em tempo real dispensa aprovação prévia de cada sequência, ressalvadas diretrizes específicas combinadas previamente.
2.3. Cabe à CONTRATANTE viabilizar acesso à internet/conexão no local; indisponibilidade que impeça a publicação em tempo real não gera responsabilidade ao(à) CONTRATADO(A).

3. DO PRAZO
3.1. Resumo/compilado pós-evento (quando incluso) entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o evento.

4. DAS REVISÕES
4.1. Não há revisão sobre conteúdo já publicado em tempo real, dada sua natureza efêmera.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do resumo, guarda do material bruto passa à CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E TABELA DE RETENÇÃO
7.1. Mais de 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; entre 15 e 5 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; menos de 5 dias/no-show — 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Conteúdo publicado no perfil da CONTRATANTE já nasce sob sua titularidade. O(a) CONTRATADO(A) pode usar bastidores em portfólio, salvo vedação por escrito. Imagem de participantes é de responsabilidade da CONTRATANTE.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações do evento não divulgadas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais; substituto de nível equivalente ou devolução integral.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos.
12.2. A CONTRATANTE indeniza por: (i) ausência de conexão/estrutura no local; (ii) ausência de autorização de imagem de participantes; (iii) instrução de conteúdo que gere reclamação de terceiros.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

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
];
