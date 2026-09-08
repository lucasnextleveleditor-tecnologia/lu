import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/**
 * Banco de modelos de contrato do perfil VIDEOMAKER — v2, 8 tipos de serviço.
 * Mesmo padrão jurídico aprofundado do banco de Filmmaker (ver `filmmaker.ts`):
 * tabela progressiva de retenção por cancelamento em eventos de data certa,
 * cláusula de armazenamento pós-entrega, quitação prévia obrigatória em
 * eventos, e cláusula de Limitação de Responsabilidade e Indenização.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_VIDEOMAKER: ModeloContratoServico[] = [
  {
    perfil: "videomaker",
    tipoServico: "casamentos",
    nome: "Casamentos",
    descricao: "Filmagem de casamento (videomaker), com quitação prévia obrigatória, tabela progressiva de retenção por cancelamento e armazenamento pós-entrega transferido ao casal.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_CONJUGE", label: "Nome do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "CPF_CONJUGE", label: "CPF do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do casamento", tipo: "data" },
      { tag: "LOCAL_DA_CERIMONIA", label: "Local da cerimônia", tipo: "texto" },
      { tag: "LOCAL_DA_FESTA", label: "Local da festa", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária total", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega de highlights", tipo: "texto", exemplo: "5 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "15 dias" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "90 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — mais de 12 meses antes", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — entre 12 e 6 meses antes", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 6 e 3 meses antes", tipo: "percentual", exemplo: "40" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 3 meses e 30 dias antes", tipo: "percentual", exemplo: "70" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação sem multa", tipo: "texto", exemplo: "60 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FILMAGEM DE CASAMENTO (VIDEOMAKER)

CONTRATANTE(S): [NOME_DO_CLIENTE] e [NOME_DO_CONJUGE], CPFs nº [CPF_CNPJ_CLIENTE] e [CPF_CONJUGE], residentes em [ENDERECO_CLIENTE], denominados em conjunto CONTRATANTES (solidariamente responsáveis pelas obrigações financeiras).
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Filmagem e edição audiovisual da cerimônia e festa de casamento dos CONTRATANTES, em [DATA_DO_EVENTO], cerimônia em [LOCAL_DA_CERIMONIA] e festa em [LOCAL_DA_FESTA].
1.2. O(a) CONTRATADO(A) não se responsabiliza por aspectos da organização do evento (cerimonial, buffet, som, iluminação), de responsabilidade exclusiva dos CONTRATANTES e demais fornecedores.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO] ([CARGA_HORARIA_DIARIA]), compreendendo [MOMENTOS_COBERTOS].
2.2. Equipe: [COMPOSICAO_DA_EQUIPE].
2.3. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.4. O(a) CONTRATADO(A) não se responsabiliza por captar momentos não informados previamente pelos CONTRATANTES fora do roteiro/briefing combinado.

3. DO PRAZO DE ENTREGA
3.1. Entrega do vídeo editado em até [PRAZO_DE_ENTREGA] dias corridos após o evento. Highlights, quando inclusos, em prazo reduzido de [PRAZO_ENTREGA_CONTEUDO_RAPIDO].

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual. Não há refilmagem em nenhuma hipótese, por se tratar de evento único; defeito técnico comprovadamente atribuível ao(à) CONTRATADO(A) gera abatimento proporcional do trecho perdido.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. CLÁUSULA ESSENCIAL: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do casamento. Não pagamento até esse prazo autoriza o não comparecimento do(a) CONTRATADO(A), sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 7ª.
5.3. Atraso de parcela: multa de 2%, juros de 1% ao mês, correção pelo índice [INDICE_DE_CORRECAO]. Arquivos finais liberados só após quitação.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a responsabilidade do(a) CONTRATADO(A) pela guarda do material — armazenamento passa a ser de exclusiva responsabilidade dos CONTRATANTES.
6.2. Backup por liberalidade mantido por até [PRAZO_MINIMO_GUARDA_BACKUP]; recuperação/reenvio dentro desse prazo é cobrada à parte, valor de [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Dada a reserva integral de agenda para data única, o cancelamento pelos CONTRATANTES segue a tabela: mais de 12 meses — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre 12 e 6 meses — [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 3 meses — [PERCENTUAL_RETENCAO_3_MESES]%; entre 3 meses e 30 dias — [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 30 dias ou não comparecimento — 100%.
7.2. Adiamento comunicado com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade de agenda: valores pagos migram para a nova data, sem multa.
7.3. Cancelamento pelo(a) CONTRATADO(A) sem justa causa: devolução integral em até 5 dias úteis, sem prejuízo de indenização por danos comprovados.

8. DOS DIREITOS AUTORAIS E DE IMAGEM
8.1. Cedidos aos CONTRATANTES os direitos de uso pessoal e não comercial do material, sem limitação de prazo.
8.2. O(a) CONTRATADO(A) pode usar o material em portfólio/divulgação, com crédito, salvo pedido de privacidade por escrito antes do evento.
8.3. Direitos de imagem de convidados são de responsabilidade dos CONTRATANTES, informando-os previamente sobre a cobertura; objeções posteriores não geram responsabilidade ao(à) CONTRATADO(A).
8.4. Uso de trilha sonora de terceiros pode gerar bloqueio/restrição em plataformas digitais (Content ID), não se responsabilizando o(a) CONTRATADO(A) por essas ações alheias ao seu controle.

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto de nível equivalente mediante anuência dos CONTRATANTES; não sendo possível, devolução integral nos termos da cláusula 7.3.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito/força maior; comunicação em até 48h e remarcação conforme cláusula 7.2.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais/financeiros pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade do(a) CONTRATADO(A) limitada ao valor total pago, excluídos lucros cessantes, danos indiretos e danos morais/à imagem por fatores alheios à sua atuação técnica.
13.2. Os CONTRATANTES indenizam e mantêm o(a) CONTRATADO(A) isento(a) de reclamações decorrentes de: (i) objeção de imagem de convidados não informados sobre a cobertura; (ii) uso de trilha não licenciada e bloqueio por plataformas; (iii) atos de terceiros fornecedores que atrapalhem a captação.
13.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

14. DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício/societário. Alterações somente por aditivo escrito. CONTRATANTES respondem solidariamente pelas obrigações financeiras.

15. DO FORO
15.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "aniversarios_festas_sociais",
    nome: "Aniversários e Festas Sociais",
    descricao: "Filmagem de debutante, bodas e aniversários, com quitação prévia obrigatória, armazenamento pós-entrega transferido ao cliente e tabela de retenção por cancelamento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TIPO_DE_FESTA", label: "Tipo de festa", tipo: "texto" },
      { tag: "NOME_DO_ANIVERSARIANTE_OU_HOMENAGEADO", label: "Nome do(a) aniversariante/homenageado(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária total", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra", tipo: "moeda" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "10 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — mais de 6 meses antes", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 6 e 2 meses antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 2 meses e 15 dias antes", tipo: "percentual", exemplo: "60" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FILMAGEM DE FESTA SOCIAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Filmagem da festa [TIPO_DE_FESTA] de [NOME_DO_ANIVERSARIANTE_OU_HOMENAGEADO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO] ([CARGA_HORARIA_DIARIA]): [MOMENTOS_COBERTOS].
2.2. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Horas excedentes cobradas a [VALOR_HORA_EXTRA]/hora ou fração.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após o evento.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual; sem refilmagem, por evento único.

5. DO VALOR E PAGAMENTO
5.1. Valor: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes da festa, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A).

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, guarda do material passa a ser da CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E TABELA DE RETENÇÃO
7.1. Mais de 6 meses — [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 2 meses — [PERCENTUAL_RETENCAO_3_MESES]%; entre 2 meses e 15 dias — [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 15 dias/no-show — 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Uso pessoal cedido à CONTRATANTE; portfólio ressalvado salvo pedido de privacidade. Imagem de convidados sob responsabilidade da CONTRATANTE.

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Indicação de substituto equivalente ou devolução integral.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais, com remarcação sem multa.

11. DA CONFIDENCIALIDADE
11.1. Prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Conforme Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Limitada ao valor pago, excluídos danos indiretos. A CONTRATANTE indeniza por informações falsas, atos de terceiros convidados/contratados, uso fora da licença.
13.2. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

14. DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício/societário.

15. DO FORO
15.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "videos_institucionais_corporativos",
    nome: "Vídeos Institucionais e Corporativos",
    descricao: "Produção de vídeos institucionais/corporativos, com pré-produção obrigatória, cessão de direitos por prazo definido e indenização por ausência de release de colaboradores.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DA_EMPRESA_CLIENTE", label: "Nome da empresa cliente", tipo: "texto" },
      { tag: "FINALIDADE_DO_VIDEO", label: "Finalidade do vídeo", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_CUSTO_REFACAO", label: "% custo de refação adicional", tipo: "percentual", exemplo: "30" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de veiculação", tipo: "textarea" },
      { tag: "CRITERIO_LICENCA_AMPLIADA", label: "Critério de licença ampliada", tipo: "textarea" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "10 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE VÍDEO INSTITUCIONAL/CORPORATIVO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de vídeo institucional/corporativo para [NOME_DA_EMPRESA_CLIENTE], com finalidade de [FINALIDADE_DO_VIDEO].

2. DO ESCOPO E DA PRÉ-PRODUÇÃO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Captação em [LOCAL_DE_CAPTACAO], na(s) data(s) [DATA_DE_CAPTACAO].
2.2. Roteiro/briefing deve ser aprovado por escrito antes da captação; captação sem essa aprovação corre por conta e risco da CONTRATANTE.
2.3. Cabe à CONTRATANTE viabilizar acesso às instalações, colaboradores e informações necessárias no horário agendado.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação/aprovação do roteiro.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste pontual. Mudança de direção criativa pós-aprovação ou nova captação por decisão da CONTRATANTE são cobradas à parte, no mínimo [PERCENTUAL_CUSTO_REFACAO]% do valor total.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Atraso: multa de 2%, juros de 1% ao mês, correção pelo índice [INDICE_DE_CORRECAO]. Masters liberados após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material bruto pelo(a) CONTRATADO(A), que pode eliminá-lo a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação dentro do prazo é cobrada a [VALOR_TAXA_REENVIO].

7. DA CESSÃO DE DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso institucional/comercial pelo prazo de [PRAZO_DA_LICENCA_DE_USO], nos meios [MEIOS_E_TERRITORIO]. Uso além do pactuado depende de licença ampliada, conforme [CRITERIO_LICENCA_AMPLIADA].
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo cláusula de confidencialidade/embargo formalizada por escrito.
7.3. Cabe à CONTRATANTE providenciar autorização de imagem de colaboradores/terceiros que apareçam no vídeo, isentando o(a) CONTRATADO(A) de reclamações de imagem.

8. DA RESCISÃO E DAS MULTAS
8.1. Aviso de rescisão com [PRAZO_AVISO_RESCISAO] de antecedência. Cancelamento após confirmação de agenda: mais de 7 dias — 30% de retenção; entre 7 e 2 dias — 50%; menos de 48h/no-show — 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações estratégicas e corporativas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais; comunicação em até 48h.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) ausência de autorização de imagem de colaboradores; (ii) informações corporativas falsas/incompletas; (iii) uso do material fora da licença concedida.
12.3. Divulgações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "conteudo_redes_sociais",
    nome: "Conteúdo para Redes Sociais",
    descricao: "Produção recorrente de vídeos/reels para redes sociais, em pacote mensal ou avulso, com cláusula que exclui responsabilidade por engajamento/alcance.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "PERIODICIDADE", label: "Periodicidade", tipo: "texto", exemplo: "pacote mensal" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por vídeo", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão do pacote", tipo: "texto", exemplo: "15 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE VÍDEOS PARA REDES SOCIAIS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de conteúdo audiovisual em vídeo (reels/vídeos curtos) para as redes sociais da CONTRATANTE, em regime de [PERIODICIDADE].

2. DO ESCOPO E DO CALENDÁRIO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário/pauta aprovada previamente: [CALENDARIO_DE_PAUTAS].
2.2. Alterações de pauta após início da produção do mês corrente, fora do calendário aprovado, contam como vídeo adicional cobrado à parte.
2.3. Cabe à CONTRATANTE fornecer briefing, materiais de marca e aprovar roteiros/pautas nos prazos combinados, sob pena de suspensão do cronograma sem penalidade ao(à) CONTRATADO(A).

3. DO PRAZO DE ENTREGA
3.1. Cada vídeo é entregue em até [PRAZO_DE_ENTREGA] dias corridos após a captação/aprovação de roteiro.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste por vídeo. Mudança de conceito pós-aprovação ou nova captação é cobrada como vídeo adicional.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor mensal/pacote: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO], vencendo-se antecipadamente ao início de cada ciclo mensal, quando aplicável.
5.2. Atraso de pagamento superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão da produção do mês, sem caracterizar inadimplemento do(a) CONTRATADO(A).

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega/publicação de cada vídeo, cessa a obrigação de guarda do material bruto correspondente, podendo ser eliminado a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação, quando ainda disponível, cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso do conteúdo nas próprias redes sociais e site, por prazo indeterminado, mediante pagamento integral. Uso em campanhas de mídia paga ampliada depende de acordo específico.
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, com crédito, salvo vedação por escrito.

8. DA RESCISÃO E DAS MULTAS
8.1. Rescisão do pacote mensal mediante aviso com [PRAZO_AVISO_RESCISAO] de antecedência do próximo ciclo, sem multa retroativa sobre ciclos já executados.
8.2. Cancelamento de captação avulsa já agendada: mais de 5 dias — retenção de 20%; entre 5 e 2 dias — 50%; menos de 48h/no-show — 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre estratégia de conteúdo e calendário de lançamentos pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor do ciclo mensal em curso, excluídos lucros cessantes e danos indiretos (ex.: baixo engajamento, alcance ou conversão do conteúdo, que dependem de fatores fora do controle do(a) CONTRATADO(A), como algoritmo das plataformas).
12.2. A CONTRATANTE indenizará o(a) CONTRATADO(A) por: (i) materiais/informações de marca fornecidos de forma incorreta ou sem direito de uso; (ii) publicação do conteúdo fora do escopo/marca acordado gerando reclamação de terceiros; (iii) uso de trilha/elementos de terceiros fornecidos pela própria CONTRATANTE sem licença.
12.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "cobertura_eventos_corporativos",
    nome: "Cobertura de Eventos Corporativos e Congressos",
    descricao: "Cobertura audiovisual de eventos corporativos/congressos, com quitação prévia obrigatória, tabela de retenção por cancelamento e indenização por ausência de autorização de palestrantes.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_EVENTO_CORPORATIVO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega de conteúdo rápido", tipo: "texto", exemplo: "48 horas" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "10 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — mais de 60 dias antes", tipo: "percentual", exemplo: "15" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 60 e 15 dias antes", tipo: "percentual", exemplo: "40" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 15 e 5 dias antes", tipo: "percentual", exemplo: "70" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL DE EVENTO CORPORATIVO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura audiovisual do evento [NOME_DO_EVENTO_CORPORATIVO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cabe à CONTRATANTE viabilizar credenciamento, acesso a palcos/backstage e cronograma atualizado do evento com antecedência.
2.3. Captação de palestras/painéis está sujeita à autorização dos palestrantes quanto à gravação e uso de imagem, cuja obtenção é de responsabilidade da CONTRATANTE (organizadora do evento).

3. DO PRAZO DE ENTREGA
3.1. Conteúdo "quente" (stories/redes sociais): [PRAZO_ENTREGA_CONTEUDO_RAPIDO]. Vídeo consolidado do evento (aftermovie): [PRAZO_DE_ENTREGA] dias corridos após o evento.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste sobre o aftermovie. Sem refilmagem de falas/palestras não captadas por motivo alheio ao(à) CONTRATADO(A).

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A) e retenção conforme cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, guarda do material passa à CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E TABELA DE RETENÇÃO
7.1. Por se tratar de evento com data certa e reserva de agenda: mais de 60 dias — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 60 e 15 dias — [PERCENTUAL_RETENCAO_3_MESES]%; entre 15 e 5 dias — [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 5 dias/no-show — 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Cedidos à CONTRATANTE os direitos de uso institucional/promocional pelo prazo de [PRAZO_DA_LICENCA_DE_USO]. O(a) CONTRATADO(A) pode usar em portfólio, salvo confidencialidade formalizada.
8.2. Imagem de palestrantes/participantes é de responsabilidade da CONTRATANTE, que declara ter obtido as autorizações necessárias.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre conteúdo de palestras não divulgadas e estratégia do evento pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais, incluindo cancelamento do evento por determinação de autoridade.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) ausência de autorização de imagem/gravação de palestrantes e participantes; (ii) informações de cronograma incorretas que impeçam a cobertura de determinado momento; (iii) uso do material fora da licença concedida.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "captacao_de_drone",
    nome: "Captação de Drone",
    descricao: "Captação aérea com drone, com cláusula essencial de segurança de voo, enquadramento regulatório ANAC/SISANT/DECEA e isenção por suspensão de voo por segurança.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_PROJETO", label: "Descrição do projeto", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO AÉREA COM DRONE (VIDEOMAKER)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO], piloto remoto cadastrado no SISANT/ANAC quando exigido.

1. DO OBJETO
1.1. Captação de imagens/vídeos aéreos por drone, projeto [DESCRICAO_DO_PROJETO], local [LOCAL_DE_CAPTACAO], data [DATA_DE_CAPTACAO].

2. DO ESCOPO E DA REGULAMENTAÇÃO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Operação sujeita às normas ANAC (Resolução nº 419/2017), DECEA e ANATEL (SISANT, altura, distância de aeroportos, restrição de aglomerações).
2.2. Cabe à CONTRATANTE informar restrições de espaço aéreo e obter autorização do local sobrevoado; ausência dessas informações que restrinja o voo não gera responsabilidade ao(à) CONTRATADO(A).
2.3. DA SEGURANÇA DE VOO (CLÁUSULA ESSENCIAL): o(a) CONTRATADO(A) pode suspender/adiar/não realizar o voo, a seu critério técnico soberano e inapelável, sempre que as condições não forem seguras, incluindo: (i) ventos acima de 25-30 km/h; (ii) chuva, garoa ou qualquer precipitação; (iii) fumaça, neblina, poeira ou baixa visibilidade; (iv) obstáculos (fiação, árvores, estruturas, aglomeração de pessoas/animais) com risco de colisão; (v) qualquer condição que, a critério técnico, coloque em risco pessoas, animais, ambiente, estruturas ou o equipamento.
2.4. A decisão de não voar não constitui inadimplemento nem gera desconto/indenização além do previsto na cláusula 4.1; o(a) CONTRATADO(A) envidará esforços para nova janela dentro do mesmo período, sem custo adicional.
2.5. A CONTRATANTE reconhece que a operação de drones envolve risco inerente, prevalecendo a segurança de pessoas/bens/equipamento sobre qualquer expectativa de entrega de material aéreo.

3. DO PRAZO
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste. Nova captação por suspensão do voo (cláusula 2.3) é reagendada sem multa.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DO SEGURO E RESPONSABILIDADE POR DANOS A TERCEIROS
6.1. O(a) CONTRATADO(A) declara operar com seguro de responsabilidade civil compatível, quando aplicável.
6.2. A CONTRATANTE isola/sinaliza a área de pouso/decolagem e mantém pessoas não autorizadas afastadas.

7. DOS DIREITOS DE USO
7.1. Cedidos conforme [PRAZO_MEIOS_TERRITORIO_LICENCA]. Portfólio ressalvado salvo vedação por escrito.

8. DA RESCISÃO
8.1. Cancelamento pela CONTRATANTE: mais de 5 dias — 20%; entre 5 e 2 dias — 50%; menos de 48h/no-show — 100%.

9. DA CONFIDENCIALIDADE
9.1. Prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Inclui restrição de espaço aéreo por autoridade (NOTAM) como causa de reagendamento sem multa.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos.
12.2. A CONTRATANTE indeniza por: (i) informações falsas sobre restrições de espaço aéreo/local; (ii) ausência de autorização do local para sobrevoo; (iii) interferência de terceiros presentes na operação.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "videos_produtos_ecommerce",
    nome: "Vídeos para Produtos e E-commerce",
    descricao: "Produção de vídeos de produto para lojas virtuais/marketplaces, com responsabilidade da contratante sobre disponibilização e seguro dos produtos.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DOS_PRODUTOS", label: "Descrição dos produtos", tipo: "textarea" },
      { tag: "PLATAFORMAS_DE_DESTINO", label: "Plataformas de destino", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "PRAZO_ENTREGA_PRODUTOS_PARA_CAPTACAO", label: "Prazo de entrega dos produtos para captação", tipo: "texto", exemplo: "3 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "EXCLUSIVA/NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de veiculação", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE VÍDEO DE PRODUTO/E-COMMERCE

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de vídeo(s) de demonstração/venda dos produtos [DESCRICAO_DOS_PRODUTOS], para uso em [PLATAFORMAS_DE_DESTINO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Captação em [LOCAL_DE_CAPTACAO], na data de [DATA_DE_CAPTACAO].
2.2. Cabe à CONTRATANTE disponibilizar os produtos físicos em condições adequadas de apresentação, com antecedência mínima de [PRAZO_ENTREGA_PRODUTOS_PARA_CAPTACAO]; atraso ou produto em condição inadequada (danificado, sujo, incompleto) pode acarretar novo agendamento cobrado como diária adicional.
2.3. Danos ou perda de produtos de terceiros (protótipos, amostras, peças de coleção) durante a captação, quando não decorrentes de culpa comprovada do(a) CONTRATADO(A) ou de sua equipe, são de responsabilidade da CONTRATANTE, que deve providenciar seguro próprio para itens de alto valor.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste por vídeo. Nova captação por troca/adição de produtos não previstos no escopo original é cobrada à parte.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivos finais liberados após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material bruto, podendo ser eliminado a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso comercial dos vídeos, de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], nos meios [MEIOS_E_TERRITORIO].
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação por escrito.

8. DA RESCISÃO E DAS MULTAS
8.1. Cancelamento de captação já agendada: mais de 5 dias — 20% de retenção; entre 5 e 2 dias — 50%; menos de 48h/no-show — 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre produtos não lançados e estratégia de venda pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos (ex.: baixa conversão de vendas do vídeo, fator alheio à atuação técnica do(a) CONTRATADO(A)).
12.2. A CONTRATANTE indeniza por: (i) produtos de terceiros sem autorização de uso de imagem/marca; (ii) informações incorretas sobre o produto que gerem publicidade enganosa; (iii) uso do material fora da licença concedida.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "videomaker",
    tipoServico: "captacao_premium_diaria",
    nome: "Captação Premium (Diária)",
    descricao: "Reserva de agenda por diária, com quitação prévia obrigatória para eventos com data certa, tabela progressiva de retenção e armazenamento pós-entrega transferido ao cliente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DO_EVENTO_OU_OCASIAO", label: "Descrição do evento/ocasião", tipo: "textarea" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "VALOR_HORA_EXCEDENTE", label: "Valor da hora excedente", tipo: "moeda" },
      { tag: "RAIO_DESLOCAMENTO_INCLUSO", label: "Raio de deslocamento incluso", tipo: "texto", exemplo: "20 km" },
      { tag: "CRITERIO_CUSTO_DESLOCAMENTO", label: "Critério de custo de deslocamento adicional", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PRAZO_RETENCAO_FAIXA_1", label: "Antecedência — faixa 1 (maior)", tipo: "texto", exemplo: "60 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_2", label: "Antecedência — faixa 2", tipo: "texto", exemplo: "30 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_3", label: "Antecedência — faixa 3 (menor)", tipo: "texto", exemplo: "10 dias" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — faixa 1", tipo: "percentual", exemplo: "15" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — faixa 2", tipo: "percentual", exemplo: "35" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — faixa 3", tipo: "percentual", exemplo: "60" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — abaixo da faixa 3", tipo: "percentual", exemplo: "85" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação gratuita", tipo: "texto", exemplo: "15 dias" },
      { tag: "EXCLUSIVA/NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de veiculação", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO AUDIOVISUAL POR DIÁRIA (VIDEOMAKER)

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Captação audiovisual em regime de diária (reserva de agenda exclusiva), para [DESCRICAO_DO_EVENTO_OU_OCASIAO], em [DATA_DO_EVENTO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO].
1.2. Modalidade caracterizada pela reserva integral da agenda do(a) CONTRATADO(A) para a data, nos termos da cláusula 7.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Horas excedentes cobradas a [VALOR_HORA_EXCEDENTE]/hora, mediante acordo prévio de disponibilidade.
2.2. Deslocamento dentro de [RAIO_DESLOCAMENTO_INCLUSO] incluso; além disso, conforme [CRITERIO_CUSTO_DESLOCAMENTO].

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste. Nova captação por motivo não imputável a erro técnico é orçada como nova diária.

5. DO VALOR E PAGAMENTO
5.1. Valor da diária: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Para eventos com data certa e insubstituível: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material, que passa a ser de responsabilidade exclusiva da CONTRATANTE a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E TABELA DE RETENÇÃO
7.1. Mais de [PRAZO_RETENCAO_FAIXA_1] — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre [PRAZO_RETENCAO_FAIXA_2] e [PRAZO_RETENCAO_FAIXA_1] — [PERCENTUAL_RETENCAO_6_MESES]%; entre [PRAZO_RETENCAO_FAIXA_3] e [PRAZO_RETENCAO_FAIXA_2] — [PERCENTUAL_RETENCAO_3_MESES]%; menos de [PRAZO_RETENCAO_FAIXA_3] — [PERCENTUAL_RETENCAO_30_DIAS]%; no dia/no-show — 100%.
7.2. Uma remarcação gratuita, com aviso mínimo de [PRAZO_AVISO_REMARCACAO]; remarcações seguintes seguem a tabela acima.

8. DOS DIREITOS DE USO
8.1. Cedidos de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], meios [MEIOS_E_TERRITORIO]. Portfólio ressalvado salvo vedação por escrito.

9. DA CONFIDENCIALIDADE
9.1. Prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais; substituto de nível equivalente ou devolução integral.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos.
12.2. A CONTRATANTE indeniza por: (i) informações falsas sobre o evento; (ii) atos de terceiros convidados/contratados; (iii) uso fora da licença concedida; (iv) ausência de autorização de terceiros para a captação.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
];
