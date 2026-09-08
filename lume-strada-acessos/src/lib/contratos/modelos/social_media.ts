import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/**
 * Banco de modelos de contrato do perfil SOCIAL MEDIA — v2, 8 tipos de
 * serviço (substitui a v1 de 5 tipos genéricos). O item "Casamentos" foi
 * incluído porque profissionais de social media também cobrem casamentos
 * (redes sociais do casal/dia do evento), distinto da filmagem/fotografia
 * profissional contratada separadamente.
 *
 * Padrão jurídico aprofundado, com cláusulas específicas do nicho: exclusão
 * de responsabilidade por resultados de engajamento/vendas (obrigação de
 * meio, não de resultado), indenização quando alegações de produto/resultado
 * são fornecidas pela própria contratante, tratamento de dados de clientes
 * (LGPD, papel de operador em SAC), e — nos serviços de evento com data fixa —
 * quitação prévia obrigatória e tabela de retenção por cancelamento.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_SOCIAL_MEDIA: ModeloContratoServico[] = [
  {
    perfil: "social_media",
    tipoServico: "gestao_comercio_local",
    nome: "Gestão de Comércio Local",
    descricao: "Gestão mensal de redes sociais de comércio local, com calendário editorial, acesso a contas e exclusão de responsabilidade por resultado de vendas/engajamento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_ESTABELECIMENTO", label: "Nome do estabelecimento", tipo: "texto" },
      { tag: "REDES_SOCIAIS_GERENCIADAS", label: "Redes sociais gerenciadas", tipo: "texto", exemplo: "Instagram e Facebook" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo de aprovação de pauta", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "PRAZO_DEVOLUCAO_ACESSOS", label: "Prazo de devolução de acessos", tipo: "texto", exemplo: "5 dias" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS PARA COMÉRCIO LOCAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de gestão de redes sociais ([REDES_SOCIAIS_GERENCIADAS]) do estabelecimento [NOME_DO_ESTABELECIMENTO], em regime de contrato mensal contínuo, renovável automaticamente.

2. DO ESCOPO MENSAL
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Calendário editorial aprovado previamente pela CONTRATANTE: [CALENDARIO_DE_PAUTAS], com prazo de aprovação de até [PRAZO_APROVACAO_PAUTA].
2.3. A ausência de aprovação/feedback da CONTRATANTE dentro do prazo da cláusula 2.2 é interpretada como aprovação tácita da pauta proposta, para não travar o cronograma mensal.
2.4. Serviços não inclusos no escopo mensal (impulsionamento pago/tráfego, produção de vídeo institucional, fotografia profissional de produtos, gestão de crise) são orçados à parte.

3. DO ACESSO ÀS CONTAS E CREDENCIAIS
3.1. A CONTRATANTE concede ao(à) CONTRATADO(A) acesso de administrador(a)/editor(a) às contas geridas, preferencialmente via ferramenta de gestão compartilhada (sem compartilhamento de senha principal), sendo de responsabilidade da CONTRATANTE a titularidade e segurança das contas.
3.2. Ao término do contrato, os acessos concedidos são revogados/devolvidos em até [PRAZO_DEVOLUCAO_ACESSOS] após o encerramento, permanecendo a conta e seu conteúdo de propriedade exclusiva da CONTRATANTE.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL], antecipadamente ao mês de prestação do serviço. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão da produção/publicação do mês, sem caracterizar inadimplemento do(a) CONTRATADO(A), e sem prejuízo da cobrança do valor devido.

5. DA VIGÊNCIA E DA RESCISÃO
5.1. Contrato por prazo indeterminado, renovado mensalmente, salvo fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada.
5.2. Rescisão por qualquer parte mediante aviso com [PRAZO_AVISO_RESCISAO] de antecedência do próximo ciclo mensal. Rescisão dentro do período de fidelidade mínima sujeita a CONTRATANTE ao pagamento de multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes do período.
5.3. Encerramento do contrato não obriga o(a) CONTRATADO(A) a manter cópias do material produzido além do prazo da cláusula 6.

6. DO ARMAZENAMENTO E DA PROPRIEDADE DO CONTEÚDO
6.1. O conteúdo publicado nas redes da CONTRATANTE permanece nelas hospedado, sob titularidade da CONTRATANTE. Arquivos brutos/fontes de edição não publicados são mantidos pelo(a) CONTRATADO(A) apenas durante a vigência do contrato, podendo ser eliminados a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento, sem aviso prévio.
6.2. Recuperação de arquivos-fonte dentro do prazo de guarda é cobrada à parte no valor de [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. O(a) CONTRATADO(A) pode usar peças produzidas (com identidade visual da CONTRATANTE dissimulada/anonimizada quando necessário) em portfólio e divulgação profissional, salvo vedação por escrito.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre estratégia comercial, calendário de promoções, dados de fornecedores e informações de acesso às contas, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais de clientes/seguidores obtidos via caixa de mensagens/comentários conforme a Lei nº 13.709/2018, exclusivamente para fins de atendimento e gestão de redes, vedado uso para finalidade diversa.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Instabilidade ou indisponibilidade das plataformas (Meta, TikTok, etc.), alteração de algoritmo, suspensão/bloqueio de conta por decisão da própria plataforma alheia a erro do(a) CONTRATADO(A), ou eventos de força maior, não geram responsabilidade ao(à) CONTRATADO(A) pela publicação/resultado não realizado no período afetado.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor da mensalidade do mês em que ocorreu o fato gerador, excluída expressamente qualquer responsabilidade por resultados de vendas, engajamento, alcance, número de seguidores ou conversão, que dependem de fatores de mercado, algoritmo das plataformas e da própria operação comercial da CONTRATANTE, alheios ao controle do(a) CONTRATADO(A).
11.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo (inclusive de órgãos de defesa do consumidor ou publicidade) decorrente de: (i) informações, preços, promoções, fotos de produtos ou alegações fornecidas pela própria CONTRATANTE e publicadas conforme briefing; (ii) uso de imagens/depoimentos de clientes/terceiros sem autorização, quando fornecidos pela CONTRATANTE; (iii) publicidade enganosa ou abusiva decorrente de informação de responsabilidade da CONTRATANTE.
11.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

13. DO FORO
13.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "gestao_de_autoridade",
    nome: "Gestão de Autoridade (Personal Branding)",
    descricao: "Gestão de redes pessoais/profissionais para construção de autoridade, com aprovação de imagem pessoal e limite de responsabilidade sobre conteúdo técnico.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NICHO_DE_ATUACAO", label: "Nicho de atuação", tipo: "texto", exemplo: "direito, medicina, finanças, coaching" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo de aprovação de pauta", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS PARA CONSTRUÇÃO DE AUTORIDADE

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Gestão de redes sociais pessoais/profissionais da CONTRATANTE, voltada à construção de autoridade e posicionamento no nicho de [NICHO_DE_ATUACAO], em regime de contrato mensal contínuo.

2. DO ESCOPO MENSAL E DA IMAGEM PESSOAL
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário editorial: [CALENDARIO_DE_PAUTAS], aprovado com prazo de até [PRAZO_APROVACAO_PAUTA].
2.2. Por envolver a imagem pessoal da própria CONTRATANTE, toda peça que utilize sua imagem, voz ou depoimento deve ser aprovada expressamente antes da publicação, ressalvado fluxo de aprovação tácita definido em conjunto.
2.3. Quando o conteúdo envolver opinião técnica/profissional da CONTRATANTE em sua área de atuação (ex.: orientação jurídica, médica, financeira), a responsabilidade pelo conteúdo técnico da mensagem é exclusiva da CONTRATANTE, cabendo ao(à) CONTRATADO(A) apenas a produção e adequação da peça à linguagem das redes sociais.

3. DO ACESSO ÀS CONTAS
3.1. Acesso concedido nos mesmos termos de segurança e devolução previstos em contratos desta natureza, preferencialmente via ferramenta de gestão compartilhada, sem necessidade de compartilhamento da senha principal da conta pessoal.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza suspensão da produção do mês.

5. DA VIGÊNCIA E DA RESCISÃO
5.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

6. DO ARMAZENAMENTO PÓS-CONTRATO
6.1. Arquivos-fonte mantidos apenas durante a vigência, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO E DE IMAGEM
7.1. O material produzido é de titularidade da CONTRATANTE quanto à publicação nas suas próprias redes. O(a) CONTRATADO(A) pode usar peças (sem depoimentos/opiniões pessoais sensíveis) em portfólio, salvo vedação por escrito.
7.2. Imagem e voz da CONTRATANTE são usadas exclusivamente nas peças por ela aprovadas, não podendo o(a) CONTRATADO(A) republicá-las fora do combinado.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre estratégia de posicionamento, informações de clientes/pacientes/casos da CONTRATANTE eventualmente mencionados em briefing, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018, com atenção redobrada quando o nicho da CONTRATANTE envolver dados sensíveis de terceiros (ex.: saúde) eventualmente mencionados em conteúdo.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Instabilidade de plataformas, alteração de algoritmo ou bloqueio de conta alheio a erro do(a) CONTRATADO(A) não geram responsabilidade deste(a).

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Responsabilidade limitada ao valor da mensalidade do mês do fato gerador, excluída responsabilidade por resultados de engajamento/autoridade/captação de clientes, que dependem de fatores de mercado e da própria atuação profissional da CONTRATANTE.
11.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) conteúdo técnico/profissional equivocado de sua própria autoria publicado conforme aprovado; (ii) eventual violação de sigilo profissional (ex.: segredo médico/advocatício) por informação fornecida pela própria CONTRATANTE para uso em conteúdo; (iii) uso do material fora do combinado.
11.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "mentoria_de_perfil",
    nome: "Mentoria de Perfil",
    descricao: "Mentoria/consultoria estratégica de redes sociais, sem criação direta de conteúdo, com propriedade intelectual da metodologia preservada e obrigação de meio (não de resultado).",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "FORMATO_DA_MENTORIA", label: "Formato da mentoria", tipo: "textarea", exemplo: "8 sessões individuais de 1h" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_AVISO_REAGENDAMENTO_SESSAO", label: "Prazo de aviso para reagendamento de sessão", tipo: "texto", exemplo: "24 horas" },
      { tag: "PRAZO_DO_PROGRAMA", label: "Duração do programa", tipo: "texto", exemplo: "3 meses" },
      { tag: "DATA_INICIO_PROGRAMA", label: "Data de início do programa", tipo: "data" },
      { tag: "PERCENTUAL_TAXA_ADMINISTRATIVA", label: "% taxa administrativa em desistência", tipo: "percentual", exemplo: "10" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MENTORIA/CONSULTORIA DE REDES SOCIAIS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de mentoria/consultoria estratégica em redes sociais, no formato de [FORMATO_DA_MENTORIA], sem que o(a) CONTRATADO(A) assuma a criação/publicação direta de conteúdo da CONTRATANTE.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. A implementação prática das recomendações é de responsabilidade exclusiva da CONTRATANTE; o(a) CONTRATADO(A) não garante resultado específico de crescimento, engajamento ou faturamento decorrente da aplicação da mentoria.
2.3. Faltas da CONTRATANTE a sessões agendadas com menos de [PRAZO_AVISO_REAGENDAMENTO_SESSAO] de antecedência são contabilizadas como sessão realizada, sem direito a reposição, salvo caso fortuito/força maior.

3. DO PRAZO
3.1. Programa com duração de [PRAZO_DO_PROGRAMA], iniciando-se em [DATA_INICIO_PROGRAMA].

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Acesso a sessões/materiais subsequentes condicionado à quitação das parcelas vencidas.

5. DA PROPRIEDADE INTELECTUAL DOS MATERIAIS
5.1. Metodologia, templates, planilhas e materiais de apoio fornecidos permanecem de propriedade intelectual do(a) CONTRATADO(A), cedidos à CONTRATANTE apenas para uso pessoal/interno, vedada a reprodução, revenda ou repasse a terceiros sem autorização expressa.

6. DA RESCISÃO
6.1. Desistência da CONTRATANTE após o início do programa: reembolso proporcional apenas às sessões/módulos ainda não realizados/liberados, descontada eventual taxa administrativa de [PERCENTUAL_TAXA_ADMINISTRATIVA]%.
6.2. Impedimento do(a) CONTRATADO(A) para concluir o programa: reembolso proporcional às sessões não realizadas, ou indicação de mentor(a) substituto(a) de nível equivalente, mediante anuência da CONTRATANTE.

7. DA CONFIDENCIALIDADE
7.1. Sigilo recíproco sobre estratégias, números e informações de negócio discutidos nas sessões, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

8. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
8.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

9. DO CASO FORTUITO E FORÇA MAIOR
9.1. Impedimentos de saúde ou força maior de qualquer das partes ensejam reagendamento das sessões afetadas, sem multa.

10. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
10.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor total pago, excluída expressamente qualquer responsabilidade por resultados de negócio da CONTRATANTE decorrentes da aplicação (ou não aplicação) do conteúdo da mentoria, tratando-se de obrigação de meio, não de resultado.
10.2. A CONTRATANTE se compromete a indenizar o(a) CONTRATADO(A) por uso ou repasse não autorizado dos materiais/metodologia protegidos pela cláusula 5, inclusive divulgação a terceiros concorrentes do(a) CONTRATADO(A).
10.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício/societário.

12. DO FORO
12.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "sac_2_0",
    nome: "SAC 2.0 (Atendimento ao Cliente via Redes Sociais)",
    descricao: "Atendimento e moderação de comentários/DMs, com SLA de resposta, tratamento de dados de consumidores como operador (LGPD) e indenização por política comercial fornecida pela contratante.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "REDES_SOCIAIS_GERENCIADAS", label: "Redes sociais gerenciadas", tipo: "texto" },
      { tag: "HORARIO_DE_ATENDIMENTO", label: "Horário de atendimento", tipo: "texto", exemplo: "9h às 18h, dias úteis" },
      { tag: "TEMPO_MEDIO_DE_RESPOSTA", label: "Tempo médio de resposta comprometido", tipo: "texto", exemplo: "até 2 horas úteis" },
      { tag: "FLUXO_DE_ESCALONAMENTO", label: "Fluxo de escalonamento", tipo: "textarea" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "CRITERIO_CUSTO_ATENDIMENTO_EXTRAORDINARIO", label: "Critério de custo de atendimento extraordinário", tipo: "textarea" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "3 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ATENDIMENTO AO CLIENTE EM REDES SOCIAIS (SAC 2.0)

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de atendimento e moderação de comentários/mensagens diretas nas redes sociais [REDES_SOCIAIS_GERENCIADAS] da CONTRATANTE, em regime de contrato mensal contínuo.

2. DO ESCOPO E DO NÍVEL DE SERVIÇO (SLA)
2.1. Horário de atendimento: [HORARIO_DE_ATENDIMENTO]. Tempo médio de resposta comprometido: [TEMPO_MEDIO_DE_RESPOSTA], em dias/horários úteis, ressalvados picos de demanda excepcionais (viralização, crise) que serão comunicados e tratados com prioridade combinada à parte.
2.2. O atendimento é prestado com base em roteiro/FAQ e políticas comerciais (trocas, devoluções, prazos, garantias) fornecidos pela CONTRATANTE, que devem ser mantidos atualizados por ela; desatualização do roteiro fornecido pela CONTRATANTE que gere resposta incorreta ao consumidor não é imputável ao(à) CONTRATADO(A).
2.3. Casos fora do roteiro/alçada de atendimento (reclamações formais, questões jurídicas, valores de reembolso não previstos) são escalados à CONTRATANTE conforme fluxo definido em [FLUXO_DE_ESCALONAMENTO], não cabendo ao(à) CONTRATADO(A) decidir ou prometer solução fora de sua alçada.

3. DO ACESSO ÀS CONTAS E AOS DADOS DE CLIENTES
3.1. Acesso concedido via ferramenta de gestão compartilhada sempre que disponível pela plataforma, preservando a titularidade das contas com a CONTRATANTE.
3.2. Dados pessoais de consumidores obtidos durante o atendimento (nome, telefone, pedido, CPF quando informado) são tratados exclusivamente para a finalidade do atendimento, não podendo ser armazenados fora dos sistemas indicados pela CONTRATANTE nem utilizados para qualquer outra finalidade.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
4.2. Volume de mensagens muito acima da média histórica combinada (ex.: crise, viralização negativa) que exija dedicação extraordinária é tratado como serviço adicional, cobrado à parte conforme [CRITERIO_CUSTO_ATENDIMENTO_EXTRAORDINARIO].

5. DA VIGÊNCIA E DA RESCISÃO
5.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

6. DA CONFIDENCIALIDADE
6.1. Sigilo sobre reclamações, dados de clientes e questões internas de atendimento pelo prazo de [PRAZO_CONFIDENCIALIDADE], inclusive após o encerramento do contrato.

7. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
7.1. O(a) CONTRATADO(A) atua como operador(a) de dados pessoais de consumidores nos termos da Lei nº 13.709/2018, obrigando-se a tratá-los apenas conforme instruções da CONTRATANTE (controladora), adotar medidas de segurança compatíveis e eliminá-los/devolvê-los ao término do contrato, salvo obrigação legal de guarda.

8. DO CASO FORTUITO E FORÇA MAIOR
8.1. Instabilidade das plataformas ou eventos de força maior que impeçam o atendimento no SLA combinado não geram responsabilidade ao(à) CONTRATADO(A), mediante comunicação tempestiva à CONTRATANTE.

9. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
9.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor da mensalidade do mês do fato gerador, e restrita a erros de atendimento diretamente atribuíveis à sua atuação (fora do roteiro/política fornecidos), excluídos danos indiretos e lucros cessantes.
9.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa (inclusive de órgão de defesa do consumidor, como PROCON) ou processo decorrente de: (i) informações, políticas ou roteiros de atendimento desatualizados ou incorretos fornecidos pela própria CONTRATANTE; (ii) decisões/promessas feitas diretamente pela CONTRATANTE fora do canal de atendimento gerido pelo(a) CONTRATADO(A); (iii) descumprimento pela CONTRATANTE de compromissos assumidos (trocas, reembolsos) que o(a) CONTRATADO(A) apenas comunicou conforme instrução recebida.
9.3. Manifestações públicas negativas feitas pela CONTRATANTE, de forma comprovadamente inverídica ou de má-fé, atribuindo ao(à) CONTRATADO(A) falhas de política comercial que são de responsabilidade da própria CONTRATANTE, poderão ser objeto de notificação extrajudicial e das medidas cabíveis.

10. DAS DISPOSIÇÕES GERAIS
10.1. Sem vínculo empregatício/societário.

11. DO FORO
11.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "lancamentos_digitais",
    nome: "Lançamentos Digitais",
    descricao: "Gestão de redes sociais para campanha de lançamento com datas fixas de abertura/fechamento, quitação prévia obrigatória e indenização por alegações de resultado do produto fornecidas pela contratante.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_PRODUTO_OU_LANCAMENTO", label: "Nome do produto/lançamento", tipo: "texto" },
      { tag: "DATA_DE_ABERTURA", label: "Data de abertura de vendas", tipo: "data" },
      { tag: "DATA_DE_ENCERRAMENTO", label: "Data de encerramento de vendas", tipo: "data" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por fase", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PECA_LANCAMENTO", label: "Prazo de aprovação de peça", tipo: "texto", exemplo: "48 horas" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do aquecimento", tipo: "texto", exemplo: "7 dias" },
      { tag: "CRITERIO_REMUNERACAO_VARIAVEL", label: "Critério de remuneração variável (se houver)", tipo: "textarea" },
      { tag: "PRAZO_RETENCAO_FAIXA_1", label: "Antecedência — faixa 1 (maior)", tipo: "texto", exemplo: "30 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_2", label: "Antecedência — faixa 2 (menor)", tipo: "texto", exemplo: "10 dias" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — faixa 1", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — faixa 2", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — abaixo da faixa 2", tipo: "percentual", exemplo: "80" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS PARA LANÇAMENTO DIGITAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de gestão de redes sociais e conteúdo para a campanha de lançamento de [NOME_DO_PRODUTO_OU_LANCAMENTO], com abertura de carrinho/vendas prevista para [DATA_DE_ABERTURA] e encerramento em [DATA_DE_ENCERRAMENTO].

2. DO ESCOPO E DAS FASES DO LANÇAMENTO
2.1. Entregáveis por fase: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cronograma de aprovações: toda peça deve ser aprovada pela CONTRATANTE com antecedência mínima de [PRAZO_APROVACAO_PECA_LANCAMENTO] em relação à data de publicação prevista, sob pena de a publicação ser adiada sem responsabilidade ao(à) CONTRATADO(A).
2.3. Cabe exclusivamente à CONTRATANTE a responsabilidade pelo conteúdo técnico das promessas do produto/infoproduto (resultados, garantias, valores, prazos de entrega do produto em si), limitando-se o(a) CONTRATADO(A) à adequação desse conteúdo, fornecido pela CONTRATANTE, à linguagem das redes sociais.

3. DA CRITICIDADE DE DATA (CLÁUSULA ESSENCIAL)
3.1. Por se tratar de campanha vinculada a datas fixas de abertura e fechamento de vendas, a CONTRATANTE reconhece que atrasos na aprovação de peças, no fornecimento de materiais (roteiros, gravações, ofertas, preços) ou na liberação de acesso às contas podem comprometer o cronograma da campanha, hipótese em que o(a) CONTRATADO(A) não responde por publicações não realizadas nas datas originalmente previstas.
3.2. Quitação integral do valor do serviço deve ocorrer até [PRAZO_QUITACAO_ANTES_EVENTO] antes do início da fase de aquecimento; o não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não iniciar a prestação do serviço, sem caracterizar inadimplemento de sua parte.

4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
4.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Eventual componente variável (ex.: percentual sobre vendas), quando pactuado, segue os critérios de [CRITERIO_REMUNERACAO_VARIAVEL], com apuração e comprovação de vendas fornecida pela CONTRATANTE.

5. DA RESCISÃO E DO CANCELAMENTO DO LANÇAMENTO
5.1. Cancelamento ou adiamento do lançamento pela CONTRATANTE após o início da produção de peças: mais de [PRAZO_RETENCAO_FAIXA_1] antes da abertura — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre [PRAZO_RETENCAO_FAIXA_2] e [PRAZO_RETENCAO_FAIXA_1] — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; menos de [PRAZO_RETENCAO_FAIXA_2] — retenção de [PERCENTUAL_RETENCAO_3_MESES]%, tendo em vista a reserva de agenda e a produção já iniciada.
5.2. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução dos valores de fases não realizadas, sem prejuízo de indenização por danos comprovados.

6. DO ARMAZENAMENTO PÓS-CAMPANHA
6.1. Após o encerramento da campanha e entrega de relatório final, arquivos-fonte são mantidos por até [PRAZO_MINIMO_GUARDA_BACKUP], podendo ser eliminados depois disso sem aviso prévio. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso do material produzido para a campanha, sem prazo determinado, mediante pagamento integral. O(a) CONTRATADO(A) pode usar peças (sem dados de resultado/faturamento) em portfólio, salvo vedação por escrito.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre estratégia de lançamento, precificação, número de vendas e dados financeiros da campanha pelo prazo de [PRAZO_CONFIDENCIALIDADE], inclusive perante concorrentes do(a) CONTRATADO(A).

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados de leads/compradores captados na campanha conforme a Lei nº 13.709/2018, o(a) CONTRATADO(A) atuando como operador(a) quando aplicável.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Instabilidade de plataformas de anúncio/pagamento/hospedagem do produto, fora do controle do(a) CONTRATADO(A), não gera sua responsabilidade por queda de resultado ou falha de publicação.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor total pago, excluída expressamente qualquer responsabilidade por resultado de vendas/faturamento da campanha, que depende de fatores de mercado, qualidade e entrega do produto/infoproduto, precificação e demais decisões de responsabilidade exclusiva da CONTRATANTE.
11.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa ou processo (inclusive de órgão de defesa do consumidor, publicidade ou órgãos reguladores do setor) decorrente de: (i) alegações de resultado, garantias, valores ou prazos do próprio produto/infoproduto fornecidas pela CONTRATANTE; (ii) descumprimento de promessas comerciais feitas pela CONTRATANTE aos compradores; (iii) uso de depoimentos/imagens de terceiros sem autorização, fornecidos pela CONTRATANTE; (iv) publicidade enganosa ou abusiva decorrente de conteúdo técnico fornecido pela CONTRATANTE (ex.: promessas de resultado financeiro, de saúde ou de emprego).
11.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "gestao_infoprodutores",
    nome: "Gestão para Infoprodutores",
    descricao: "Gestão mensal de redes sociais para infoprodutores, com regra clara de que alegações de resultado/ganho financeiro são de responsabilidade exclusiva da contratante.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DOS_PRODUTOS", label: "Descrição dos produtos/cursos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS PARA INFOPRODUTORES

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Gestão contínua de redes sociais da CONTRATANTE, infoprodutora(o) digital com produto(s)/curso(s) recorrente(s) [DESCRICAO_DOS_PRODUTOS], em regime de contrato mensal contínuo.

2. DO ESCOPO MENSAL E DA RESPONSABILIDADE SOBRE ALEGAÇÕES DE RESULTADO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário editorial: [CALENDARIO_DE_PAUTAS].
2.2. Toda alegação de resultado, ganho financeiro, transformação pessoal ou eficácia do método/curso da CONTRATANTE, utilizada em conteúdo, deve ser fornecida e assumida expressamente pela própria CONTRATANTE, cabendo ao(à) CONTRATADO(A) apenas adaptar a linguagem, sem verificar ou validar a veracidade da alegação de resultado.
2.3. É expressamente vedado ao(à) CONTRATADO(A) criar, por iniciativa própria, alegações de ganho financeiro específico não fornecidas e aprovadas pela CONTRATANTE.

3. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
3.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
3.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza suspensão da produção do mês.

4. DA VIGÊNCIA E DA RESCISÃO
4.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

5. DO ARMAZENAMENTO PÓS-CONTRATO
5.1. Arquivos-fonte mantidos apenas durante a vigência, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento. Recuperação cobrada a [VALOR_TAXA_REENVIO].

6. DOS DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do conteúdo nas suas próprias redes, por prazo indeterminado, mediante pagamento integral. O(a) CONTRATADO(A) pode usar peças em portfólio, salvo vedação por escrito.

7. DA CONFIDENCIALIDADE
7.1. Sigilo sobre metodologia, faturamento e estratégia de vendas da CONTRATANTE pelo prazo de [PRAZO_CONFIDENCIALIDADE].

8. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
8.1. Tratamento de dados de leads/alunos conforme a Lei nº 13.709/2018.

9. DO CASO FORTUITO E FORÇA MAIOR
9.1. Instabilidade de plataformas alheia ao controle do(a) CONTRATADO(A) não gera sua responsabilidade.

10. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
10.1. Responsabilidade limitada ao valor da mensalidade do mês do fato gerador, excluída responsabilidade por resultado de vendas/engajamento e por veracidade de alegações de resultado do produto da CONTRATANTE.
10.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) alegações de resultado/ganho financeiro fornecidas por ela e publicadas conforme aprovado (cláusula 2.2); (ii) publicidade enganosa ou notificação de órgão regulador (ex.: CVM, no caso de promessas de investimento, ou vigilância sanitária, no caso de produtos de saúde) decorrente de conteúdo técnico de responsabilidade da CONTRATANTE; (iii) uso do material fora do combinado.
10.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício/societário.

12. DO FORO
12.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "cobertura_perfil_eventos",
    nome: "Cobertura de Perfil em Eventos",
    descricao: "Cobertura em tempo real do perfil da contratante durante um evento, publicando diretamente, com tabela de retenção por cancelamento e quitação prévia obrigatória.",
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
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE REDES SOCIAIS EM EVENTO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em tempo real das redes sociais da CONTRATANTE durante o evento [NOME_DO_EVENTO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO], publicando conteúdo diretamente no perfil da CONTRATANTE durante a realização do evento.

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Por se tratar de publicação em tempo real diretamente no perfil da CONTRATANTE, a aprovação prévia de cada peça é dispensada, salvo diretriz específica combinada previamente (ex.: temas vedados, marcas concorrentes a evitar).
2.3. Cabe à CONTRATANTE viabilizar acesso à internet/conexão no local e credenciamento necessário; indisponibilidade de conexão no local que impeça a publicação em tempo real não gera responsabilidade ao(à) CONTRATADO(A), sendo o conteúdo publicado posteriormente assim que possível.

3. DO PRAZO
3.1. Resumo/compilado pós-evento (quando incluso), entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o evento.

4. DAS REVISÕES
4.1. Por se tratar de publicação em tempo real, não há rodadas de revisão sobre o conteúdo já publicado durante o evento; eventual erro flagrante pode ser corrigido/excluído mediante solicitação imediata da CONTRATANTE.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do resumo/compilado, guarda do material bruto passa à CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E TABELA DE RETENÇÃO
7.1. Mais de 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; entre 15 e 5 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; menos de 5 dias/no-show — 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Conteúdo publicado diretamente no perfil da CONTRATANTE já nasce sob titularidade desta. O(a) CONTRATADO(A) pode usar bastidores/making of em portfólio, salvo vedação por escrito. Imagem de participantes do evento é de responsabilidade da CONTRATANTE quanto à autorização de uso.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações do evento não divulgadas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais; substituto de nível equivalente ou devolução integral em caso de impedimento do(a) CONTRATADO(A).

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos.
12.2. A CONTRATANTE indeniza por: (i) ausência de conexão/estrutura no local para publicação em tempo real; (ii) ausência de autorização de imagem de participantes; (iii) instrução de conteúdo que gere reclamação de terceiros.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "casamentos",
    nome: "Casamentos — Cobertura de Redes Sociais do Dia",
    descricao: "Cobertura em tempo real das redes sociais do casal durante o casamento, distinta da filmagem/fotografia profissional, com quitação prévia obrigatória e tabela progressiva de retenção.",
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
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE REDES SOCIAIS DE CASAMENTO

CONTRATANTE(S): [NOME_DO_CLIENTE] e [NOME_DO_CONJUGE], CPFs nº [CPF_CNPJ_CLIENTE] e [CPF_CONJUGE], residentes em [ENDERECO_CLIENTE], denominados em conjunto CONTRATANTES (solidariamente responsáveis pelas obrigações financeiras).
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em tempo real das redes sociais dos CONTRATANTES (ou de perfil especialmente criado para o casamento) durante a cerimônia e festa, em [DATA_DO_EVENTO], cerimônia em [LOCAL_DA_CERIMONIA] e festa em [LOCAL_DA_FESTA], distinta da filmagem/fotografia profissional do evento (contratada separadamente, quando houver).

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Publicação em tempo real dispensa aprovação prévia de cada peça, ressalvadas diretrizes específicas combinadas previamente (ex.: não publicar determinados momentos íntimos/familiares).
2.3. O(a) CONTRATADO(A) não se responsabiliza por indisponibilidade de conexão/internet no local, publicando o conteúdo assim que possível após reestabelecida a conexão.

3. DO PRAZO DE ENTREGA
3.1. Resumo/compilado pós-evento entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o casamento.

4. DAS REVISÕES
4.1. Não há revisão sobre conteúdo já publicado em tempo real; erro flagrante pode ser corrigido/excluído mediante solicitação imediata dos CONTRATANTES.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. CLÁUSULA ESSENCIAL: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do casamento. O não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não comparecer, sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do resumo/compilado, a guarda do material bruto passa a ser de responsabilidade exclusiva dos CONTRATANTES; backup por liberalidade mantido por até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Por se tratar de evento de data única, com reserva integral de agenda: mais de 6 meses — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 2 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 2 meses e 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 15 dias ou não comparecimento — retenção de 100%.
7.2. Adiamento comunicado com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade de agenda: valores pagos migram para a nova data, sem multa.

8. DOS DIREITOS DE USO E DE IMAGEM
8.1. Conteúdo publicado diretamente no perfil dos CONTRATANTES já nasce sob titularidade destes. O(a) CONTRATADO(A) pode usar bastidores/making of em portfólio, com crédito, salvo pedido de privacidade por escrito antes do evento.
8.2. Direitos de imagem de convidados são de responsabilidade dos CONTRATANTES, que devem informá-los previamente sobre a cobertura ao vivo; objeções posteriores não geram responsabilidade ao(à) CONTRATADO(A).

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto de nível equivalente mediante anuência dos CONTRATANTES; não sendo possível, devolução integral em até 5 dias úteis.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito/força maior; comunicação em até 48h e remarcação conforme cláusula 7.2.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais/financeiros dos CONTRATANTES pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade do(a) CONTRATADO(A) limitada ao valor total pago, excluídos lucros cessantes, danos indiretos e danos morais/à imagem por fatores alheios à sua atuação técnica.
13.2. Os CONTRATANTES indenizam o(a) CONTRATADO(A) por: (i) objeção de imagem de convidados não informados sobre a cobertura ao vivo; (ii) instrução de publicação de conteúdo que gere reclamação de terceiros; (iii) atos de fornecedores do evento que atrapalhem a captação/publicação.
13.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

14. DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício/societário. CONTRATANTES respondem solidariamente pelas obrigações financeiras.

15. DO FORO
15.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
];
