import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";
import {
  CAMPOS_SERVICO_CONTINUO,
  CLAUSULA_ROTINA_E_ATENDIMENTO,
  CLAUSULA_VIGENCIA_E_RENOVACAO,
  CLAUSULA_VOLUME_E_EXCEDENTE,
} from "./clausulas-continuas";

import {
  CAMPOS_DRONE,
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
  CLAUSULA_DRONE,
  CLAUSULA_ENTREGA,
  CLAUSULA_EQUIPAMENTO_E_SEGURO,
  CLAUSULA_JORNADA,
  CLAUSULA_OBRIGACOES_DAS_PARTES,
  CLAUSULA_PORTFOLIO,
  CLAUSULA_PRAZOS_E_INSUMOS,
  CLAUSULA_VIAGEM,
  comoOpcional,
} from "./clausulas-comuns";


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
  /* ================================================================== */
  /* GRUPO 2 — CINEGRAFISTA · 1. VAREJO / COMÉRCIO                      */
  /* ================================================================== */
  {
    perfil: "videomaker",
    tipoServico: "varejo_comercio",
    nome: "Varejo / Comércio",
    descricao:
      "Vídeos de oferta, vitrine e campanha para lojas e comércio, com ciclo curto de aprovação, responsabilidade do lojista pelo preço anunciado e regras de validade da peça promocional.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      { tag: "NOME_DA_LOJA", label: "Nome da loja/comércio", tipo: "texto" },
      { tag: "ENDERECO_DA_LOJA", label: "Endereço da captação", tipo: "texto" },
      { tag: "QUANTIDADE_PECAS", label: "Quantidade de peças", tipo: "numero", exemplo: "6" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "6 vídeos de 20s em 9:16 e 1:1, com legenda queimada e selo de preço" },
      { tag: "QUANTIDADE_DIARIAS", label: "Diárias de captação", tipo: "numero", exemplo: "1" },
      { tag: "PRODUTOS_A_FILMAR", label: "Produtos a filmar", tipo: "textarea" },
      { tag: "PERIODO_DE_VEICULACAO", label: "Período de veiculação da campanha", tipo: "texto", exemplo: "de 01/12 a 24/12" },
      { tag: "VALOR_PECA_EXCEDENTE", label: "Valor da peça excedente", tipo: "moeda" },
      { tag: "VALOR_DIARIA_EXTRA", label: "Valor da diária extra", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE VÍDEO PARA VAREJO

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
        texto: `Constitui objeto deste contrato a produção, pelo CONTRATADO, de [QUANTIDADE_PECAS] peças audiovisuais destinadas à divulgação comercial de [NOME_DA_LOJA], com captação em [ENDERECO_DA_LOJA].

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS], produzidos a partir de [QUANTIDADE_DIARIAS] diária(s) de captação, tendo por objeto os produtos [PRODUTOS_A_FILMAR].

Parágrafo segundo. Peças excedentes ao volume contratado serão orçadas a [VALOR_PECA_EXCEDENTE] cada; diárias adicionais, a [VALOR_DIARIA_EXTRA].

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: modelos, atores, figurantes e respectivos cachês; direção de arte, montagem de vitrine, cenografia e adereços; locução profissional; licenciamento de trilha; tradução e legendagem em outro idioma; impulsionamento, mídia paga e gestão de campanha; e publicação nos perfis da CONTRATANTE.

Parágrafo quarto. A organização do ponto de venda, a limpeza, a arrumação de prateleiras e a disponibilidade dos produtos em condições de filmagem são de responsabilidade da CONTRATANTE, e deverão estar prontas no horário de início da diária.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "oferta_e_preco",
        titulo: "Da Oferta Anunciada e da Responsabilidade pelo Conteúdo Comercial",
        essencial: true,
        protege: "Preço errado, estoque acabado e promessa de venda são responsabilidade de quem vende.",
        texto: `Preços, condições de pagamento, percentuais de desconto, prazos de validade da oferta, disponibilidade de estoque, especificações técnicas e quaisquer informações comerciais que constem das peças serão fornecidos pela CONTRATANTE, por escrito, e reproduzidos pelo CONTRATADO exatamente como informados.

Parágrafo primeiro. A CONTRATANTE é a única responsável pela veracidade, atualidade, legalidade e exequibilidade das informações comerciais divulgadas, respondendo perante consumidores, órgãos de defesa do consumidor, PROCON, CONAR e autoridades pelo cumprimento da oferta veiculada, na forma do Código de Defesa do Consumidor.

Parágrafo segundo. O CONTRATADO não responde por publicidade enganosa, oferta não honrada, ruptura de estoque, divergência de preço praticado no caixa, ausência de indicação de condições de financiamento ou omissão de informação obrigatória, salvo se houver reproduzido incorretamente dado fornecido por escrito — hipótese que constitui vício, sujeito à cláusula Da Garantia.

Parágrafo terceiro. A CONTRATANTE conferirá as informações comerciais na etapa de aprovação, e a sua aprovação escrita, ou a aprovação tácita, valem como conferência final do conteúdo comercial.

Parágrafo quarto. Alterações de preço ou de oferta após a aprovação exigem nova versão da peça, tratada como peça excedente ou rodada adicional, conforme o caso.

Parágrafo quinto. A veiculação de peça promocional após o [PERIODO_DE_VEICULACAO] é de exclusiva responsabilidade da CONTRATANTE, obrigando-se esta a retirá-la de circulação ao término da vigência da oferta.`,
      },
      {
        id: "ritmo_de_varejo",
        titulo: "Do Ritmo do Varejo e dos Prazos Curtos",
        protege: "Ajusta a expectativa do prazo relâmpago sem transformar urgência em regra grátis.",
        texto: `As partes reconhecem que a comunicação de varejo opera em ciclos curtos, e por isso ajustam prazos e ritos compatíveis com essa realidade.

Parágrafo primeiro. As peças serão entregues em [PRAZO_DE_ENTREGA] dias úteis contados da captação, e a CONTRATANTE se manifestará em [PRAZO_APROVACAO_CLIENTE], sob pena de aprovação tácita na forma da cláusula Da Aprovação.

Parágrafo segundo. Demandas de execução em regime de urgência — entrega em prazo inferior ao pactuado, captação com menos de 48 (quarenta e oito) horas de aviso, ou trabalho em fim de semana e feriado — dependem de aceite do CONTRATADO e, quando aceitas, importam acréscimo de urgência na forma da cláusula Das Alterações de Escopo.

Parágrafo terceiro. Campanhas sazonais de grande volume — datas comemorativas, liquidações e aniversários de loja — deverão ser comunicadas com antecedência mínima de 20 (vinte) dias para reserva de agenda, sem o que o CONTRATADO não se obriga a atendê-las.

Parágrafo quarto. A CONTRATANTE indicará uma única pessoa com poderes de aprovação, sendo vedado submeter a peça a apreciação sucessiva de sócios, gerentes e vendedores após a aprovação formal.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_DRONE,
      CLAUSULA_CONDICOES_CLIMATICAS,
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
  /* GRUPO 2 — CINEGRAFISTA · 2. AULAS / INFOPRODUTOS                   */
  /* ================================================================== */
  {
    perfil: "videomaker",
    tipoServico: "aulas_infoprodutos",
    nome: "Aulas / Infoprodutos",
    descricao:
      "Gravação e edição de curso online, com módulos e aulas contados um a um, regras de regravação por erro do apresentador, teleprompter, e o conteúdo pedagógico sob responsabilidade de quem ensina.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "NOME_DO_CURSO", label: "Nome do curso/infoproduto", tipo: "texto" },
      { tag: "NUMERO_MODULOS", label: "Nº de módulos", tipo: "numero", exemplo: "6" },
      { tag: "NUMERO_AULAS", label: "Nº total de aulas", tipo: "numero", exemplo: "40" },
      { tag: "DURACAO_TOTAL_ESTIMADA", label: "Duração total estimada", tipo: "texto", exemplo: "8 horas de vídeo final" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "40 aulas editadas em 1080p com vinheta, lower thirds, cortes secos e correção de cor" },
      { tag: "QUANTIDADE_DIARIAS", label: "Diárias de gravação", tipo: "numero", exemplo: "4" },
      { tag: "LOCAL_DA_GRAVACAO", label: "Local da gravação", tipo: "texto", exemplo: "estúdio do contratado" },
      { tag: "NOME_DO_APRESENTADOR", label: "Nome do apresentador/professor", tipo: "texto" },
      { tag: "VALOR_AULA_EXCEDENTE", label: "Valor da aula excedente", tipo: "moeda" },
      { tag: "VALOR_REGRAVACAO", label: "Valor da regravação por erro do apresentador", tipo: "moeda" },
      { tag: "PLATAFORMA_DE_HOSPEDAGEM", label: "Plataforma onde o curso será hospedado", tipo: "texto", exemplo: "Hotmart" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL DE CURSO ONLINE

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Conta módulo, aula e hora — é o que impede o curso de dobrar de tamanho no meio.",
        texto: `Constitui objeto deste contrato a gravação e a edição das videoaulas do curso "[NOME_DO_CURSO]", compreendendo [NUMERO_MODULOS] módulos e [NUMERO_AULAS] aulas, com duração total estimada de [DURACAO_TOTAL_ESTIMADA].

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS], produzidos em [QUANTIDADE_DIARIAS] diária(s) de gravação, realizadas em [LOCAL_DA_GRAVACAO], tendo como apresentador [NOME_DO_APRESENTADOR].

Parágrafo segundo. A UNIDADE DE MEDIÇÃO deste contrato é a aula finalizada. Aulas excedentes serão orçadas a [VALOR_AULA_EXCEDENTE] cada, e a duração média por aula será a resultante da divisão da duração total estimada pelo número de aulas contratado, admitida variação de até 20% (vinte por cento) para mais ou para menos no conjunto da obra.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: roteiro e estruturação pedagógica do conteúdo; slides, apostilas, planilhas e materiais de apoio; animações, infográficos e motion design além de vinheta e legendas de identificação; locução por terceiro; legendagem, transcrição e tradução; upload, configuração, montagem de área de membros e integração com [PLATAFORMA_DE_HOSPEDAGEM]; e produção de peças de lançamento e de vendas.

Parágrafo quarto. O CONTRATADO fornecerá orientação técnica de enquadramento, luz e áudio, não se obrigando a treinar o apresentador em oratória, dicção ou desenvoltura de câmera.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "gravacao_e_regravacao",
        titulo: "Da Gravação, do Apresentador e das Regravações",
        essencial: true,
        protege: "Erro de quem fala na frente da câmera não é refação de graça de quem está atrás.",
        texto: `A CONTRATANTE responsabiliza-se pela presença pontual do apresentador, pelo domínio do conteúdo a ser gravado e pela sua condição de apresentação, incluindo vestuário adequado, preparação prévia e descanso.

Parágrafo primeiro. O roteiro ou o script de cada aula deverá ser entregue ao CONTRATADO com antecedência mínima de 3 (três) dias úteis da gravação. Quando contratado o uso de teleprompter, o texto deverá estar consolidado e revisado, não cabendo ao CONTRATADO redigi-lo, revisá-lo ou corrigi-lo.

Parágrafo segundo. Erros de fala, hesitações, repetições e trocas de palavra ocorridos durante a gravação são tratados na própria diária, mediante repetição da tomada, sem custo adicional.

Parágrafo terceiro. Constitui REGRAVAÇÃO, e não refação, a necessidade de gravar novamente aula já captada e entregue, por qualquer das seguintes causas: mudança do conteúdo pelo apresentador; informação desatualizada; erro conceitual; desistência da abordagem; insatisfação do apresentador com a própria performance; ou alteração de identidade visual do curso. A regravação será cobrada a [VALOR_REGRAVACAO] por aula, acrescida das despesas de diária, estúdio e equipe.

Parágrafo quarto. O atraso do apresentador superior a 1 (uma) hora, a sua ausência ou a impossibilidade de gravação por condição sua caracterizam diária perdida por culpa da CONTRATANTE, devida integralmente.

Parágrafo quinto. O CONTRATADO poderá interromper a gravação quando as condições técnicas do local — ruído, iluminação, interferência, circulação de pessoas — comprometerem irremediavelmente a qualidade, comunicando o fato e propondo alternativa; não sendo possível saná-las por causa imputável à CONTRATANTE, aplica-se o parágrafo anterior.`,
      },
      {
        id: "conteudo_pedagogico",
        titulo: "Do Conteúdo Pedagógico e da Responsabilidade pelo Ensinado",
        essencial: true,
        protege: "Quem ensina responde pelo que ensina — o vídeo é a forma, não o conteúdo.",
        texto: `O conteúdo pedagógico, técnico, científico, jurídico, financeiro, terapêutico ou de qualquer outra natureza veiculado nas aulas é de autoria e de responsabilidade exclusivas da CONTRATANTE e do apresentador por ela indicado.

Parágrafo primeiro. O CONTRATADO atua exclusivamente na produção audiovisual, não revisando, validando, auditando nem endossando o conteúdo, e não respondendo por sua correção, atualidade, adequação regulatória, promessa de resultado ao aluno, ou por dano que a sua aplicação venha a causar a terceiros.

Parágrafo segundo. A CONTRATANTE declara deter os direitos sobre todo o material de apoio exibido nas aulas — textos, imagens, gráficos, marcas, obras de terceiros, trechos de livros e softwares —, respondendo regressivamente perante o CONTRATADO por qualquer pretensão de titular.

Parágrafo terceiro. A CONTRATANTE declara ainda que o curso, sua publicidade e sua forma de comercialização observam a legislação aplicável, inclusive o Código de Defesa do Consumidor e as normas dos conselhos profissionais eventualmente incidentes sobre a matéria ensinada.

Parágrafo quarto. Constatando o CONTRATADO que o conteúdo é manifestamente ilícito, incita a prática de crime, ou promove risco à saúde ou à segurança de terceiros, poderá recusar a produção e rescindir o contrato por justa causa, com direito à remuneração das etapas executadas.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
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
  /* GRUPO 2 — CINEGRAFISTA · 3. EVENTOS (SOCIAIS / CORPORATIVOS)       */
  /* ================================================================== */
  {
    perfil: "videomaker",
    tipoServico: "eventos_sociais_corporativos",
    nome: "Eventos (Sociais e Corporativos)",
    descricao:
      "Cobertura de evento com data certa — confraternização, congresso, formatura, inauguração —, com quitação prévia, tabela progressiva de retenção, regras de palco e som, e limites do que é possível registrar num evento ao vivo.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Início da cobertura", tipo: "texto", exemplo: "18h" },
      { tag: "HORARIO_DE_TERMINO", label: "Término da cobertura", tipo: "texto", exemplo: "1h" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos a cobrir", tipo: "textarea", exemplo: "credenciamento, abertura, palestras do auditório principal, coquetel, premiação" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "aftermovie de 3 min, 5 cortes de 60s para redes e 1 vídeo de depoimentos" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
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
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL DE EVENTO

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
        texto: `Constitui objeto deste contrato a cobertura audiovisual do evento "[NOME_DO_EVENTO]", a realizar-se em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO].

Parágrafo primeiro. A cobertura compreende os seguintes momentos: [MOMENTOS_COBERTOS], executada pela equipe [COMPOSICAO_DA_EQUIPE].

Parágrafo segundo. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: transmissão ao vivo e streaming; telão, projeção e operação de mídia do evento; captação e mixagem de áudio da mesa de som, que dependerá de disponibilização de sinal pela produção; registro fotográfico dedicado; entrega no mesmo dia; iluminação cênica do ambiente; e cobertura de ambientes simultâneos que exijam equipe adicional.

Parágrafo quarto. Evento é acontecimento único e irrepetível. O CONTRATADO obriga-se a empregar sua melhor técnica para registrar os momentos contratados, mas NÃO se obriga a registrar a integralidade dos fatos, das pessoas ou das falas ocorridos simultaneamente em locais distintos, nem aqueles que não puder alcançar em razão de posicionamento, de restrição da organização, de bloqueio por convidados ou de deslocamento entre ambientes.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "quitacao_e_reserva",
        titulo: "Da Reserva de Data e da Quitação Prévia",
        essencial: true,
        protege: "A data fica bloqueada porque foi paga — e a cobrança não vai para depois da festa.",
        texto: `A assinatura deste contrato e o pagamento do sinal implicam o bloqueio da agenda do CONTRATADO para a data contratada, com a consequente recusa de outras propostas para o mesmo dia.

Parágrafo primeiro. O saldo do preço deverá estar integralmente quitado até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data do evento. A cobrança de saldo depois do evento é notoriamente frágil, e a antecipação da quitação é condição do preço praticado.

Parágrafo segundo. Não verificada a quitação no prazo, o CONTRATADO poderá, mediante comunicação escrita, liberar a agenda e não comparecer, retendo os valores já pagos na forma da cláusula Do Cancelamento, sem que isso configure inadimplemento de sua parte.

Parágrafo terceiro. Havendo prorrogação do evento além do horário contratado, as horas excedentes observarão a cláusula Da Jornada, e o seu pagamento poderá ser exigido antes da entrega do material.

Parágrafo quarto. A reserva é personalíssima quanto à data e não pode ser transferida a terceiro ou convertida em crédito sem anuência escrita do CONTRATADO.`,
      },
      {
        id: "condicoes_do_evento",
        titulo: "Das Condições do Evento, do Palco e do Som",
        protege: "Luz baixa, som ruim e palco proibido são limites do evento, não defeito do vídeo.",
        texto: `A CONTRATANTE providenciará, às suas expensas, as condições necessárias à cobertura: acesso da equipe ao local com antecedência mínima de 1 (uma) hora do início, credenciamento, ponto de energia elétrica, posição de trabalho com visada do palco, e autorização junto à casa, à produção e aos demais fornecedores.

Parágrafo primeiro. A qualidade do registro de falas, apresentações e shows depende do sinal de áudio disponibilizado pela mesa de som do evento. Não havendo disponibilização de sinal, a captação será feita por microfone ambiente, com a limitação técnica inerente, o que a CONTRATANTE desde já reconhece e aceita.

Parágrafo segundo. A iluminação do ambiente é definida pela produção do evento. Ambientes de baixa luminosidade, luz colorida, estroboscópio, fumaça cênica e contraluz produzem resultado esteticamente distinto do obtido em ambiente controlado, o que não constitui vício do serviço.

Parágrafo terceiro. Restrições impostas pela organização, pela casa, por artista ou por patrocinador — vedação de filmagem em determinado bloco, limitação de posições, proibição de luz auxiliar — reduzem proporcionalmente a expectativa de material, sem redução do preço.

Parágrafo quarto. A CONTRATANTE informará ao CONTRATADO, com antecedência mínima de 5 (cinco) dias, o roteiro do evento, os momentos essenciais e as pessoas que devem obrigatoriamente ser registradas; a ausência dessa informação transfere a ela o risco da não captação de momento específico.

Parágrafo quinto. Aplicam-se à execução as cláusulas Das Condições Climáticas e, quando houver aglomeração, as cautelas de segurança nelas previstas.`,
      },
      {
        id: "cancelamento_evento",
        titulo: "Do Cancelamento e da Remarcação",
        essencial: true,
        protege: "Quanto mais perto da data, mais caro desistir — a agenda já foi perdida.",
        texto: `O cancelamento por iniciativa da CONTRATANTE sujeita-a à retenção dos seguintes percentuais do valor total do contrato:

(i) com mais de 30 (trinta) dias de antecedência: [PERCENTUAL_RETENCAO_30_DIAS]%;
(ii) entre 30 e 15 dias: [PERCENTUAL_RETENCAO_15_DIAS]%;
(iii) entre 15 e 7 dias: [PERCENTUAL_RETENCAO_7_DIAS]%;
(iv) com menos de 7 (sete) dias: [PERCENTUAL_RETENCAO_VESPERA]%.

Parágrafo primeiro. Somam-se à retenção as despesas já incorridas e não reembolsáveis, notadamente passagens, hospedagem, locação de equipamento e contratação de equipe de apoio.

Parágrafo segundo. A remarcação para nova data, solicitada com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade na agenda do CONTRATADO, não sofrerá retenção, admitida UMA única remarcação por contrato. Não havendo disponibilidade, a solicitação equivale a cancelamento.

Parágrafo terceiro. O adiamento do evento por determinação de autoridade, caso fortuito ou força maior observará a cláusula correspondente, preservando-se o crédito da CONTRATANTE para nova data dentro de 12 (doze) meses, sujeito à disponibilidade de agenda e ao ressarcimento das despesas não reembolsáveis.

Parágrafo quarto. O não comparecimento da CONTRATANTE, a não realização do evento por causa a ela imputável ou o impedimento de acesso da equipe equivalem a cancelamento com menos de 7 (sete) dias.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_VIAGEM,
      CLAUSULA_DRONE,
      CLAUSULA_CONDICOES_CLIMATICAS,
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
  /* GRUPO 2 — CINEGRAFISTA · 4. EDIÇÃO CONTÍNUA                        */
  /* ================================================================== */
  {
    perfil: "videomaker",
    tipoServico: "edicao_continua",
    nome: "Edição Contínua (Mensal)",
    descricao:
      "Pacote mensal de edição sobre material captado por terceiros, com volume fechado, prazo de resposta, regras claras sobre material bruto de má qualidade e vigência com renovação automática.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "FORMATO_DE_ENTREGA_BRUTOS", label: "Como o bruto será entregue", tipo: "texto", exemplo: "link de nuvem, arquivos originais de câmera, sem compactação" },
      { tag: "PRAZO_ENVIO_BRUTOS", label: "Prazo para o cliente enviar o bruto", tipo: "texto", exemplo: "até o dia 5 de cada mês" },
      { tag: "PRAZO_ENTREGA_POR_PECA", label: "Prazo de entrega por peça", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "PADRAO_DE_EDICAO", label: "Padrão de edição acordado", tipo: "textarea", exemplo: "cortes dinâmicos, legenda queimada, trilha de biblioteca licenciada, correção de cor básica" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE EDIÇÃO AUDIOVISUAL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Deixa claro que o serviço é edição — captação é outro contrato.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de EDIÇÃO e finalização de material audiovisual captado pela CONTRATANTE ou por terceiro por ela indicado, no volume mensal de [VOLUME_MENSAL_CONTRATADO].

Parágrafo primeiro. A edição observará o padrão acordado: [PADRAO_DE_EDICAO], e o prazo de entrega será de [PRAZO_ENTREGA_POR_PECA] por peça, contado do recebimento do material bruto em condições de uso e do respectivo roteiro ou orientação.

Parágrafo segundo. A CAPTAÇÃO NÃO INTEGRA O OBJETO. Também não integram, salvo contratação apartada: roteiro; locução; motion design, animação e computação gráfica; legendagem em outro idioma; licenciamento de trilha fora da biblioteca utilizada pelo CONTRATADO; publicação nos canais da CONTRATANTE; e gestão de campanhas.

Parágrafo terceiro. O valor mensal de [VALOR_MENSAL] remunera a disponibilidade da agenda de edição e o volume contratado, observada a cláusula Do Volume Mensal.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "material_bruto",
        titulo: "Do Material Bruto, da Sua Qualidade e do Seu Envio",
        essencial: true,
        protege: "Não se conserta na edição o que foi filmado errado — e isso precisa estar escrito.",
        texto: `A CONTRATANTE entregará o material bruto por meio de [FORMATO_DE_ENTREGA_BRUTOS], [PRAZO_ENVIO_BRUTOS], acompanhado da orientação do que se pretende em cada peça.

Parágrafo primeiro. O prazo de entrega de cada peça só começa a correr com o recebimento do material bruto COMPLETO e em condições de uso. Envio parcial, em formato inadequado, com arquivos corrompidos, sem áudio, sem os trechos essenciais ou sem orientação suspende o prazo, na forma da cláusula Dos Prazos.

Parágrafo segundo. A edição trabalha sobre o que foi captado, e não cria o que não existe. NÃO constituem obrigação do CONTRATADO, e não configuram vício quando não alcançados: recuperar imagem desfocada, tremida, subexposta, superexposta ou fora de enquadramento; remover ruído de áudio que inviabilize a inteligibilidade; reconstituir trecho não captado; substituir pessoa, produto ou cenário; ou eliminar elemento indesejado presente na cena, salvo quando contratada expressamente a limpeza digital como escopo adicional.

Parágrafo terceiro. Sendo o material bruto manifestamente inadequado ao resultado pretendido, o CONTRATADO comunicará o fato por escrito antes de iniciar a edição, cabendo à CONTRATANTE optar por nova captação ou por prosseguir com a limitação apontada — hipótese em que a peça será considerada entregue conforme contratado.

Parágrafo quarto. A guarda do material bruto é da CONTRATANTE. O CONTRATADO manterá cópia de trabalho apenas enquanto durar a edição e pelo prazo da cláusula Do Backup, findo o qual poderá eliminá-la.

Parágrafo quinto. Peças cujo material bruto não for enviado dentro do mês de referência não se acumulam para o mês seguinte, na forma da cláusula Do Volume Mensal.`,
      },
      CLAUSULA_VOLUME_E_EXCEDENTE,
      CLAUSULA_ROTINA_E_ATENDIMENTO,
      CLAUSULA_VIGENCIA_E_RENOVACAO,
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
  /* GRUPO 2 — CINEGRAFISTA · 5. EXPRESSO INSTITUCIONAL                 */
  /* ================================================================== */
  {
    perfil: "videomaker",
    tipoServico: "expresso_institucional",
    nome: "Expresso Institucional",
    descricao:
      "Vídeo institucional em formato enxuto e prazo curto: uma diária, escopo fechado, uma rodada de ajuste e nada de negociação de conceito — o preço baixo existe porque o processo é curto.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      { tag: "DURACAO_APROXIMADA", label: "Duração do vídeo final", tipo: "texto", exemplo: "até 2 minutos" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "1 vídeo institucional de até 2 min em 16:9 e 1 corte vertical de 30s" },
      { tag: "LOCAL_DA_CAPTACAO", label: "Local da captação", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Início da diária", tipo: "texto", exemplo: "9h" },
      { tag: "HORARIO_DE_TERMINO", label: "Término da diária", tipo: "texto", exemplo: "15h" },
      { tag: "NUMERO_ENTREVISTAS", label: "Nº de depoimentos", tipo: "numero", exemplo: "3" },
      { tag: "VALOR_DIARIA_EXTRA", label: "Valor da diária extra", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE VÍDEO INSTITUCIONAL — FORMATO EXPRESSO

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Escopo fechado é o que sustenta o preço — mexer nele muda o produto.",
        texto: `Constitui objeto deste contrato a produção de vídeo institucional em FORMATO EXPRESSO, com duração de [DURACAO_APROXIMADA], compreendendo uma única diária de captação em [LOCAL_DA_CAPTACAO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO], com até [NUMERO_ENTREVISTAS] depoimentos.

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo segundo. O formato expresso é um produto de escopo fechado, e o seu preço decorre justamente disso: captação em um único dia e local, estrutura enxuta, montagem a partir de estrutura narrativa pré-definida pelo CONTRATADO e ciclo curto de aprovação. A ampliação de qualquer desses elementos descaracteriza o formato e implica reorçamento integral do projeto, e não simples acréscimo.

Parágrafo terceiro. NÃO integram o objeto: roteiro autoral desenvolvido sob medida; pré-produção com apresentação de tratamento; direção de arte, cenografia e figurino; elenco e locução profissional; captação em mais de um local ou dia; motion design e computação gráfica; licenciamento de trilha fora da biblioteca do CONTRATADO; legendagem em outro idioma; e versionamento além do descrito.

Parágrafo quarto. Diárias adicionais, quando aceitas, serão remuneradas a [VALOR_DIARIA_EXTRA] cada, com as despesas das cláusulas Do Deslocamento e Da Alimentação.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "processo_expresso",
        titulo: "Do Processo Expresso e do Ciclo Único de Aprovação",
        essencial: true,
        protege: "Uma rodada de ajuste. Quem quiser mais, contrata o formato completo.",
        texto: `O formato expresso observa ciclo único de aprovação: entregue o corte, a CONTRATANTE apresentará, de uma só vez, a totalidade dos ajustes pretendidos, no prazo de [PRAZO_APROVACAO_CLIENTE].

Parágrafo primeiro. Está inclusa 1 (uma) rodada de refação, limitada a ajustes pontuais de corte, ordem de trechos, texto de tela e correção de informação. Rodadas adicionais serão cobradas a [VALOR_RODADA_ADICIONAL] cada.

Parágrafo segundo. NÃO cabem no formato expresso, e serão tratados como reorçamento do projeto: mudança de estrutura narrativa, substituição de depoimentos, regravação, mudança de trilha após aprovação, inclusão de material de arquivo não previsto e alteração de identidade visual.

Parágrafo terceiro. A CONTRATANTE indicará, antes da captação, uma única pessoa com poderes de aprovação, e reconhece que a submissão do material a apreciação sucessiva de diretoria, sócios ou comitês é incompatível com o formato contratado.

Parágrafo quarto. Decorrido o prazo de [PRAZO_INERCIA_APROVACAO] sem manifestação, o material reputa-se aprovado, encerrando-se o contrato quanto à obrigação de entrega.

Parágrafo quinto. A CONTRATANTE poderá, a qualquer tempo antes do início da edição, migrar para o formato completo, aproveitando-se integralmente os valores já pagos como crédito no novo orçamento.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_DRONE,
      CLAUSULA_CONDICOES_CLIMATICAS,
      CLAUSULA_EQUIPAMENTO_E_SEGURO,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
];
