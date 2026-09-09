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
  comoOpcional,
} from "./clausulas-comuns";
import {
  CAMPOS_SERVICO_CONTINUO,
  CAMPOS_TRAFEGO,
  CLAUSULAS_DE_ROTINA,
  CLAUSULA_ACESSOS_E_CONTAS,
  CLAUSULA_PLATAFORMAS_TERCEIROS,
  CLAUSULA_ROTINA_E_ATENDIMENTO,
  CLAUSULA_VERBA_DE_MIDIA,
  CLAUSULA_VIGENCIA_E_RENOVACAO,
} from "./clausulas-continuas";


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
  /* ================================================================== */
  /* GRUPO 7 — AGÊNCIA · 1. ASSESSORIA — SERVIÇO COMPLETO               */
  /* ================================================================== */
  {
    perfil: "agencia_marketing",
    tipoServico: "gestao_redes_sociais_marketing_digital",
    nome: "Assessoria de Marketing — Serviço Completo",
    descricao:
      "Retainer completo: estratégia, conteúdo, tráfego e relatório sob um mesmo contrato, com escopo por frentes, governança de aprovação, exclusividade de segmento opcional e transição ordenada na saída.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      ...CAMPOS_TRAFEGO,
      { tag: "FRENTES_CONTRATADAS", label: "Frentes contratadas", tipo: "textarea", exemplo: "estratégia, social media, tráfego pago, e-mail marketing e relatórios" },
      { tag: "PERFIS_GERENCIADOS", label: "Canais gerenciados", tipo: "textarea" },
      { tag: "EQUIPE_ALOCADA", label: "Equipe alocada", tipo: "textarea", exemplo: "1 gestor de conta, 1 social media, 1 designer e 1 gestor de tráfego, em regime compartilhado" },
      { tag: "CATEGORIA_EXCLUSIVIDADE", label: "Segmento de exclusividade (se houver)", tipo: "texto" },
      { tag: "VALOR_EXCLUSIVIDADE", label: "Valor da exclusividade de segmento", tipo: "moeda" },
      { tag: "PRAZO_TRANSICAO", label: "Prazo de transição na saída", tipo: "texto", exemplo: "15 dias" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE ASSESSORIA DE MARKETING

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADA: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADA;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002, pela Lei nº 9.610/1998 e pela Lei nº 13.709/2018.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Frentes contratadas por escrito — o que não está listado não está incluído.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de assessoria de marketing, compreendendo as seguintes frentes: [FRENTES_CONTRATADAS], nos canais [PERFIS_GERENCIADOS].

Parágrafo primeiro. O volume mensal contratado é de [VOLUME_MENSAL_CONTRATADO], executado pela equipe [EQUIPE_ALOCADA], alocada em REGIME COMPARTILHADO — a CONTRATADA atende outros clientes com a mesma estrutura, e a dedicação exclusiva de profissional, quando desejada, será contratada à parte.

Parágrafo segundo. NÃO integram o objeto, salvo contratação apartada: verba de mídia, que observa a cláusula Da Verba; produção audiovisual de alta complexidade; fotografia profissional; identidade visual e rebranding; desenvolvimento de site, e-commerce e sistemas; licenças de ferramentas, plataformas e bancos de imagem; assessoria de imprensa; eventos e ativações físicas; influenciadores e permutas; e consultoria jurídica, contábil ou fiscal.

Parágrafo terceiro. O valor mensal de [VALOR_MENSAL] remunera a disponibilidade da equipe, o planejamento e o volume contratado, e é devido integralmente ainda que a CONTRATANTE demande menos no período.

Parágrafo quarto. A execução observa obrigação de MEIO, na forma da cláusula Das Plataformas de Terceiros.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "governanca",
        titulo: "Da Governança, do Interlocutor Único e da Cadeia de Aprovação",
        essencial: true,
        protege: "Um interlocutor, uma decisão — é o que impede o retrabalho por comitê.",
        texto: `A CONTRATANTE designará UM interlocutor com poderes de decisão e de aprovação para todos os efeitos deste contrato, e a CONTRATADA designará um gestor de conta como ponto único de contato.

Parágrafo primeiro. Todas as demandas, aprovações e apontamentos transitarão entre esses dois interlocutores. Solicitações formuladas por outras pessoas da CONTRATANTE diretamente a integrantes da equipe da CONTRATADA não serão executadas, e deverão ser consolidadas pelo interlocutor designado.

Parágrafo segundo. Apontamentos divergentes vindos de pessoas distintas da CONTRATANTE serão devolvidos para consolidação, ficando o prazo suspenso até a manifestação única, na forma da cláusula Dos Prazos.

Parágrafo terceiro. A substituição do interlocutor será comunicada por escrito, e o novo interlocutor recebe o projeto no estado em que se encontra: decisões já aprovadas não se reabrem, e a sua revisão constitui alteração de escopo.

Parágrafo quarto. A CONTRATADA poderá substituir integrantes da sua equipe a qualquer tempo, por profissionais de qualificação equivalente, mantida a responsabilidade pelo resultado, na forma da cláusula Da Equipe.

Parágrafo quinto. Reuniões observam a periodicidade da cláusula Da Rotina, e as decisões nelas tomadas serão registradas em ata enviada pela CONTRATADA, reputando-se aceita se não impugnada em 2 (dois) dias úteis.`,
      },
      {
        id: "exclusividade_segmento",
        titulo: "Da Exclusividade de Segmento",
        opcional: true,
        protege: "Se o cliente quer a agência longe dos concorrentes dele, isso se paga.",
        texto: `Mediante o pagamento adicional de [VALOR_EXCLUSIVIDADE] mensais, a CONTRATADA obriga-se a não prestar serviços de mesma natureza a empresas concorrentes da CONTRATANTE no segmento [CATEGORIA_EXCLUSIVIDADE] e na mesma praça de atuação, enquanto vigorar este contrato.

Parágrafo primeiro. A exclusividade restringe-se ao segmento e à praça expressamente indicados, não alcançando outros setores, linhas de produto ou regiões.

Parágrafo segundo. Não havendo o pagamento previsto no caput, NÃO HÁ EXCLUSIVIDADE, permanecendo a CONTRATADA livre para atender qualquer cliente, inclusive concorrentes, sem que isso configure conflito de interesses ou quebra de confiança — ressalvado, sempre, o dever de sigilo da cláusula Da Confidencialidade, que se aplica integralmente a cada cliente.

Parágrafo terceiro. Clientes do segmento já atendidos pela CONTRATADA na data de assinatura estão ressalvados, e serão informados à CONTRATANTE antes da contratação da exclusividade.

Parágrafo quarto. A exclusividade cessa automaticamente com o término deste contrato, sem período residual, salvo pactuação escrita em contrário e onerosa.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_VERBA_DE_MIDIA,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      {
        id: "transicao_saida",
        titulo: "Da Transição na Saída",
        protege: "Saída organizada protege os dois: o cliente não fica parado, a agência não fica refém.",
        texto: `Encerrado o contrato por qualquer motivo, a CONTRATADA promoverá transição ordenada no prazo de [PRAZO_TRANSICAO], contados do último dia de vigência.

Parágrafo primeiro. A transição compreende: devolução ou revogação de acessos; entrega dos materiais produzidos e já quitados, em formato de uso; entrega dos relatórios do período; e uma reunião de repasse de até 2 (duas) horas com o interlocutor da CONTRATANTE ou com o novo prestador por ela indicado.

Parágrafo segundo. NÃO integram a transição, por constituírem instrumento de trabalho e conhecimento próprio da CONTRATADA: metodologias, processos internos, planilhas de gestão, modelos, estruturas de campanha proprietárias, ferramentas licenciadas em seu nome, treinamento do novo prestador e consultoria além da reunião prevista.

Parágrafo terceiro. Campanhas em veiculação na data do encerramento serão pausadas ou transferidas conforme instrução escrita da CONTRATANTE; não havendo instrução até o último dia, serão pausadas, sem responsabilidade da CONTRATADA pelo resultado dessa pausa.

Parágrafo quarto. A CONTRATADA não reterá ativos, contas ou dados da CONTRATANTE como meio de coerção para pagamento, na forma da cláusula Dos Acessos, o que não afasta a cobrança do débito pelos meios próprios.

Parágrafo quinto. Solicitações de suporte após o prazo de transição serão orçadas por hora técnica.`,
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
  /* GRUPO 7 — AGÊNCIA · 2. GESTÃO DE TRÁFEGO PAGO                      */
  /* ================================================================== */
  {
    perfil: "agencia_marketing",
    tipoServico: "gestao_trafego_pago",
    nome: "Gestão de Tráfego Pago",
    descricao:
      "Gestão de mídia paga com verba separada da remuneração, contas no nome do cliente, relatório nativo como fonte da verdade, ausência de garantia de resultado e regras de bloqueio de conta.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      ...CAMPOS_TRAFEGO,
      { tag: "OBJETIVOS_DE_CAMPANHA", label: "Objetivos de campanha", tipo: "textarea", exemplo: "geração de leads qualificados e vendas no e-commerce" },
      { tag: "INDICADORES_ACOMPANHADOS", label: "Indicadores acompanhados", tipo: "textarea", exemplo: "custo por lead, custo por aquisição, ROAS e taxa de conversão" },
      { tag: "RESPONSAVEL_CRIATIVOS", label: "Quem produz os criativos", tipo: "texto", exemplo: "a contratante" },
      { tag: "RESPONSAVEL_PAGINAS", label: "Quem mantém páginas e formulários", tipo: "texto", exemplo: "a contratante" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE GESTÃO DE MÍDIA PAGA

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADA: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADA;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 13.709/2018.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Gestão de campanha é o serviço — criativo e página são outra coisa.",
        texto: `Constitui objeto deste contrato a gestão de campanhas de mídia paga da CONTRATANTE nas plataformas [PLATAFORMAS_DE_MIDIA], com os objetivos [OBJETIVOS_DE_CAMPANHA].

Parágrafo primeiro. O serviço compreende: planejamento de estrutura de campanhas; configuração de públicos, segmentações e orçamentos; subida e gestão de anúncios; acompanhamento e otimização; testes de variações; e relatório [PERIODICIDADE_RELATORIO] com os indicadores [INDICADORES_ACOMPANHADOS].

Parágrafo segundo. A produção dos criativos é de responsabilidade de [RESPONSAVEL_CRIATIVOS]; a manutenção de páginas de destino, formulários, checkout e integrações é de responsabilidade de [RESPONSAVEL_PAGINAS].

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: verba de mídia; criação de peças e redação; desenvolvimento e correção de páginas; implementação de pixels, tags e eventos em ambiente da CONTRATANTE, cabendo à CONTRATADA apenas orientar tecnicamente; CRM e automação; atendimento e qualificação dos leads gerados; e vendas.

Parágrafo quarto. A remuneração da CONTRATADA é o valor mensal de [VALOR_MENSAL] e/ou o percentual de [PERCENTUAL_SOBRE_VERBA]% sobre a verba investida, conforme a cláusula Da Verba, e NÃO se confunde com a verba de mídia.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      CLAUSULA_VERBA_DE_MIDIA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      {
        id: "dados_e_mensuracao",
        titulo: "Da Mensuração, dos Dados e da Fonte da Verdade",
        essencial: true,
        protege: "Define de onde vem o número — e evita a discussão de painel contra planilha.",
        texto: `Os relatórios nativos das plataformas de mídia e as ferramentas de análise da CONTRATANTE constituem a FONTE DA VERDADE para apuração de investimento, alcance, cliques, conversões e demais indicadores, prevalecendo sobre qualquer planilha, apresentação ou estimativa.

Parágrafo primeiro. As partes reconhecem que plataformas distintas medem de formas distintas, com janelas de atribuição, modelos e critérios próprios, e que divergências entre elas — bem como entre elas e o sistema interno da CONTRATANTE — são inerentes à mensuração digital e não constituem erro da CONTRATADA.

Parágrafo segundo. A qualidade da mensuração depende de implementação correta de pixels, eventos, parâmetros e consentimento de cookies no ambiente da CONTRATANTE. Falhas, bloqueios de navegador, restrições de privacidade e alterações de política que degradem a mensuração são alheias ao controle da CONTRATADA.

Parágrafo terceiro. A CONTRATANTE manterá a CONTRATADA informada sobre o resultado comercial efetivo — vendas fechadas, leads qualificados, ticket médio e devoluções —, sem o que a otimização opera às cegas e a CONTRATADA não responde pela eficiência do investimento.

Parágrafo quarto. A CONTRATADA terá acesso de leitura permanente aos relatórios, e a CONTRATANTE poderá auditá-los a qualquer tempo diretamente na plataforma.

Parágrafo quinto. O tratamento de dados de usuários observará a cláusula Da Proteção de Dados, atuando a CONTRATANTE como controladora.`,
      },
      {
        id: "bloqueio_de_conta",
        titulo: "Do Bloqueio de Conta e da Reprovação de Anúncios",
        essencial: true,
        protege: "Conta bloqueada é fato das plataformas — o contrato diz o que cada um faz nessa hora.",
        texto: `As plataformas podem reprovar anúncios, restringir, suspender ou banir contas e perfis por decisão unilateral, com base em políticas próprias, muitas vezes sem indicação precisa do motivo e sem canal efetivo de revisão.

Parágrafo primeiro. Ocorrendo bloqueio, a CONTRATADA envidará seus melhores esforços para: identificar a causa provável, protocolar os recursos disponíveis, adequar as peças e, sendo possível, restabelecer a veiculação por estrutura alternativa regular. NÃO garante, contudo, o desbloqueio, que é ato exclusivo da plataforma.

Parágrafo segundo. A CONTRATADA não responde pela verba retida em conta bloqueada, pela perda de histórico de aprendizado das campanhas, pela queda de resultado no período nem por qualquer prejuízo comercial decorrente.

Parágrafo terceiro. Bloqueios decorrentes de irregularidade cadastral, fiscal ou documental da CONTRATANTE, de histórico anterior da conta, do produto anunciado ou do conteúdo por ela aprovado são de sua exclusiva responsabilidade.

Parágrafo quarto. É VEDADA à CONTRATADA a utilização de contas de terceiros, perfis falsos, estruturas irregulares ou qualquer artifício para contornar bloqueio, prática que exporia a CONTRATANTE a risco maior; a solicitação da CONTRATANTE nesse sentido será recusada.

Parágrafo quinto. Persistindo o bloqueio por mais de 30 (trinta) dias sem alternativa regular, qualquer das partes poderá suspender a execução, com a correspondente suspensão da mensalidade, ou rescindir sem multa.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 7 — AGÊNCIA · 3. COPRODUÇÃO (LANÇAMENTOS)                    */
  /* ================================================================== */
  {
    perfil: "agencia_marketing",
    tipoServico: "coproducao_lancamentos",
    nome: "Coprodução (Lançamentos)",
    descricao:
      "Parceria com participação no faturamento: define quem entra com o quê, como se apura o resultado, quem paga a verba, o que acontece com reembolso e chargeback, e que isso não é sociedade.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      ...CAMPOS_TRAFEGO,
      { tag: "NOME_DO_PRODUTO", label: "Produto lançado", tipo: "texto" },
      { tag: "APORTE_DO_PRODUTOR", label: "O que o produtor entrega", tipo: "textarea", exemplo: "produto, aulas, autoridade, atendimento e estrutura de entrega" },
      { tag: "APORTE_DA_COPRODUTORA", label: "O que a coprodutora entrega", tipo: "textarea", exemplo: "estratégia, gestão de tráfego, criativos, copy, páginas e operação do lançamento" },
      { tag: "PERCENTUAL_COPRODUCAO", label: "% da coprodutora sobre o faturamento líquido", tipo: "percentual", exemplo: "30" },
      { tag: "RESPONSAVEL_VERBA_MIDIA", label: "Quem aporta a verba de mídia", tipo: "texto", exemplo: "a contratante, integralmente" },
      { tag: "PRAZO_REPASSE", label: "Prazo de repasse da participação", tipo: "texto", exemplo: "até o dia 10 do mês seguinte à liberação pela plataforma" },
      { tag: "PRAZO_GARANTIA_PRODUTO", label: "Prazo de garantia do produto ao comprador", tipo: "texto", exemplo: "7 dias" },
      { tag: "PLATAFORMA_DE_HOSPEDAGEM", label: "Plataforma de vendas", tipo: "texto", exemplo: "Hotmart" },
      { tag: "PRAZO_DA_PARCERIA", label: "Prazo da parceria", tipo: "texto", exemplo: "12 meses, abrangendo os lançamentos realizados no período" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE COPRODUÇÃO DE PRODUTO DIGITAL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE (PRODUTORA): [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], titular do produto e responsável pela sua entrega;

CONTRATADA (COPRODUTORA): [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO];

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto e da Natureza da Parceria",
        essencial: true,
        protege: "Coprodução não é sociedade — e essa distinção evita passivo que ninguém quer.",
        texto: `Constitui objeto deste contrato a parceria entre as partes para a exploração comercial do produto digital [NOME_DO_PRODUTO], mediante participação da COPRODUTORA no resultado, pelo prazo de [PRAZO_DA_PARCERIA].

Parágrafo primeiro. Cabe à PRODUTORA aportar: [APORTE_DO_PRODUTOR]. Cabe à COPRODUTORA aportar: [APORTE_DA_COPRODUTORA].

Parágrafo segundo. Este contrato NÃO constitui sociedade, sociedade em conta de participação, consórcio, joint venture, franquia ou vínculo empregatício entre as partes. Cada parte mantém personalidade, patrimônio, clientela e responsabilidade tributária próprios, e responde exclusivamente pelos encargos da sua própria atividade e equipe.

Parágrafo terceiro. A PRODUTORA é a titular do produto e a fornecedora perante o consumidor, respondendo integralmente pela entrega, pelo suporte, pela garantia e pelas obrigações do Código de Defesa do Consumidor. A COPRODUTORA não é fornecedora do produto e não responde perante o comprador pelo seu conteúdo ou pela sua entrega.

Parágrafo quarto. Nenhuma das partes poderá obrigar a outra perante terceiros, assumir dívida em seu nome ou representá-la sem procuração escrita e específica.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "apuracao_e_repasse",
        titulo: "Da Apuração do Resultado, da Participação e do Repasse",
        essencial: true,
        protege: "Diz exatamente o que entra e o que sai da conta — é onde a parceria costuma azedar.",
        texto: `A COPRODUTORA fará jus a [PERCENTUAL_COPRODUCAO]% do FATURAMENTO LÍQUIDO do produto, apurado na plataforma [PLATAFORMA_DE_HOSPEDAGEM].

Parágrafo primeiro. Entende-se por faturamento líquido o valor efetivamente recebido pela PRODUTORA, deduzidos EXCLUSIVAMENTE: reembolsos concedidos dentro do prazo de garantia; chargebacks e estornos; taxas da plataforma e do meio de pagamento; e comissões de afiliados.

Parágrafo segundo. NÃO se deduzem da base de cálculo: verba de mídia; custos de equipe, ferramentas e estrutura de qualquer das partes; tributos incidentes sobre a receita da PRODUTORA; despesas administrativas; investimentos em produto; e pró-labore.

Parágrafo terceiro. Sempre que a plataforma permitir, a participação será configurada como SPLIT AUTOMÁTICO de pagamento em favor da COPRODUTORA, forma preferencial de repasse. Não sendo possível, o repasse ocorrerá [PRAZO_REPASSE], acompanhado do relatório de apuração.

Parágrafo quarto. A COPRODUTORA terá acesso de leitura permanente aos relatórios da plataforma, e poderá auditar a apuração a qualquer tempo. A PRODUTORA obriga-se a não desviar vendas para meio de pagamento paralelo, cupom externo, link não rastreável ou pessoa jurídica diversa com o fim de reduzir a base de cálculo, sob pena de a participação ser apurada por arbitramento e de configurar-se justa causa para rescisão.

Parágrafo quinto. Reembolsos e chargebacks ocorridos APÓS o repasse serão compensados no repasse seguinte; não havendo repasse seguinte, serão restituídos pela COPRODUTORA em 15 (quinze) dias, limitada a devolução ao valor efetivamente recebido por ela em relação àquelas vendas.

Parágrafo sexto. O prazo de garantia ao comprador é de [PRAZO_GARANTIA_PRODUTO], e a apuração definitiva de cada ciclo ocorrerá após o seu decurso.`,
      },
      {
        id: "verba_e_risco",
        titulo: "Da Verba de Mídia e da Divisão de Riscos",
        essencial: true,
        protege: "Quem paga a mídia e o que acontece se o lançamento não pagar a conta.",
        texto: `A verba de mídia será aportada por [RESPONSAVEL_VERBA_MIDIA], não integra a remuneração de nenhuma das partes e observa, no que couber, a cláusula Da Verba de Mídia.

Parágrafo primeiro. Havendo aporte pela COPRODUTORA, ainda que parcial, o respectivo valor será reembolsado com PRIORIDADE sobre a distribuição de resultado, antes do cálculo da participação, mediante comprovação.

Parágrafo segundo. As partes reconhecem expressamente que lançamento digital envolve RISCO, e que o resultado pode ser inferior ao investimento. Não havendo faturamento, ou sendo ele insuficiente, a COPRODUTORA não fará jus a remuneração mínima, e a PRODUTORA não terá direito a ressarcimento da verba investida — cada parte suporta o custo do próprio aporte, salvo o previsto no parágrafo primeiro.

Parágrafo terceiro. Nenhuma das partes garante à outra faturamento, número de vendas, retorno sobre investimento ou qualquer resultado, aplicando-se integralmente a cláusula Das Plataformas de Terceiros.

Parágrafo quarto. Decisões que impactem materialmente o resultado — alteração de preço, de oferta, de data, de política de garantia ou de comissionamento de afiliados — serão tomadas de comum acordo e por escrito; a alteração unilateral pela PRODUTORA que reduza o faturamento não reduz a base de cálculo da participação já apurada.

Parágrafo quinto. A PRODUTORA declara que o produto existe, que será entregue conforme anunciado e que dispõe de estrutura de atendimento; a COPRODUTORA declara que não veiculará promessa ilícita, prova social forjada ou informação enganosa, na forma da cláusula Da Conduta.`,
      },
      {
        id: "encerramento_coproducao",
        titulo: "Do Encerramento da Parceria e dos Efeitos Residuais",
        essencial: true,
        protege: "Depois da saída ainda entra dinheiro — o contrato diz até quando e de quanto.",
        texto: `Encerrada a parceria, por decurso do prazo ou por rescisão, a COPRODUTORA fará jus à participação sobre as vendas realizadas ATÉ a data do encerramento, ainda que o pagamento pela plataforma ocorra depois, inclusive nas vendas parceladas e recorrentes já contratadas.

Parágrafo primeiro. A COPRODUTORA NÃO fará jus a participação sobre vendas realizadas após o encerramento, nem sobre lançamentos futuros, salvo pactuação expressa em contrário.

Parágrafo segundo. Encerrada a parceria, a COPRODUTORA devolverá acessos e cessará o uso das marcas e dos materiais da PRODUTORA; a PRODUTORA, por sua vez, poderá continuar utilizando as peças produzidas e já remuneradas pela participação, na forma da cláusula Dos Direitos Autorais.

Parágrafo terceiro. Estruturas de campanha, públicos, criativos e ativos publicitários criados pela COPRODUTORA em contas da PRODUTORA permanecem nestas; metodologias, processos e ferramentas próprias da COPRODUTORA não são transferidos.

Parágrafo quarto. A base de leads e de compradores é da PRODUTORA, controladora dos dados na forma da cláusula Da Proteção de Dados, obrigando-se a COPRODUTORA a eliminar as cópias em seu poder ao término, ressalvada a guarda legalmente exigida.

Parágrafo quinto. Sobrevivem ao encerramento, pelos prazos nelas previstos, as obrigações de confidencialidade, de proteção de dados, de não aliciamento e de apuração e repasse do resultado residual.`,
      },
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ROTINA_E_ATENDIMENTO,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 7 — AGÊNCIA · 4. ENTRADA / LEADS B2B                         */
  /* ================================================================== */
  {
    perfil: "agencia_marketing",
    tipoServico: "entrada_leads_b2b",
    nome: "Entrada / Leads B2B",
    descricao:
      "Prospecção e geração de reuniões B2B, com definição escrita do que é lead qualificado, meta como estimativa e não promessa, regras de LGPD na prospecção fria e obrigação do cliente de atender rápido.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      ...CAMPOS_TRAFEGO,
      { tag: "PERFIL_CLIENTE_IDEAL", label: "Perfil de cliente ideal (ICP)", tipo: "textarea", exemplo: "indústrias de 50 a 300 funcionários no Sudeste, decisor: diretor industrial" },
      { tag: "DEFINICAO_LEAD_QUALIFICADO", label: "Definição de lead qualificado", tipo: "textarea", exemplo: "empresa dentro do ICP, com dor identificada, orçamento declarado e decisor presente na reunião" },
      { tag: "CANAIS_DE_PROSPECCAO", label: "Canais de prospecção", tipo: "textarea", exemplo: "e-mail, LinkedIn, telefone e anúncios segmentados" },
      { tag: "META_MENSAL_REUNIOES", label: "Meta mensal estimada de reuniões", tipo: "numero", exemplo: "12" },
      { tag: "PRAZO_ATENDIMENTO_LEAD", label: "Prazo do cliente para atender o lead", tipo: "texto", exemplo: "1 dia útil" },
      { tag: "FERRAMENTAS_UTILIZADAS", label: "Ferramentas e por conta de quem", tipo: "textarea", exemplo: "CRM e ferramenta de cadência, licenciados em nome da contratante" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE GERAÇÃO DE OPORTUNIDADES COMERCIAIS

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADA: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADA;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 13.709/2018.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "O serviço é gerar oportunidade — quem fecha a venda é o time comercial do cliente.",
        texto: `Constitui objeto deste contrato a prospecção e a geração de oportunidades comerciais para a CONTRATANTE, junto ao perfil de cliente ideal: [PERFIL_CLIENTE_IDEAL], pelos canais [CANAIS_DE_PROSPECCAO].

Parágrafo primeiro. O serviço compreende: construção e higienização de listas; elaboração de cadências e abordagens; execução da prospecção; qualificação inicial; agendamento de reuniões na agenda da CONTRATANTE; registro no CRM; e relatório [PERIODICIDADE_RELATORIO].

Parágrafo segundo. NÃO integram o objeto: a realização das reuniões comerciais; a elaboração de proposta e de precificação; a negociação e o fechamento; o pós-venda; e a cobrança. A VENDA É DA CONTRATANTE.

Parágrafo terceiro. As ferramentas utilizadas são [FERRAMENTAS_UTILIZADAS]; as licenças correm por conta de quem ali indicado, e os dados nelas contidos são de titularidade da CONTRATANTE.

Parágrafo quarto. O valor mensal de [VALOR_MENSAL] remunera a operação de prospecção — a estrutura, o tempo e o método —, e não o número de reuniões efetivamente realizadas.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "lead_qualificado",
        titulo: "Do Conceito de Lead Qualificado e da Meta",
        essencial: true,
        protege: "Sem definição escrita do que é lead bom, toda entrega vira discussão.",
        texto: `Considera-se LEAD QUALIFICADO, para todos os efeitos deste contrato: [DEFINICAO_LEAD_QUALIFICADO].

Parágrafo primeiro. A meta mensal ESTIMADA é de [META_MENSAL_REUNIOES] reuniões qualificadas. A meta constitui projeção de planejamento, e NÃO obrigação de resultado: o volume depende de mercado, sazonalidade, reputação da marca, atratividade da oferta, preço e capacidade de resposta da própria CONTRATANTE.

Parágrafo segundo. A CONTRATANTE poderá recusar lead que não atenda à definição do caput, mediante justificativa objetiva apresentada em até 3 (três) dias úteis do agendamento; leads recusados sem justificativa, ou fora do prazo, computam-se como entregues.

Parágrafo terceiro. Não comparecimento do prospect à reunião agendada (no-show) não é imputável à CONTRATADA, que promoverá uma tentativa de reagendamento; o lead computa-se como entregue.

Parágrafo quarto. Divergências reiteradas sobre qualificação ensejarão revisão conjunta e escrita da definição do caput, com efeitos para o período seguinte, e não retroativos.

Parágrafo quinto. Não há remuneração variável por lead, salvo pactuação expressa; havendo, a apuração observará o registro no CRM e a definição desta cláusula.`,
      },
      {
        id: "prospeccao_e_lgpd",
        titulo: "Da Prospecção Fria, do Consentimento e da Legislação Aplicável",
        essencial: true,
        protege: "Prospectar B2B tem regra — e fazer errado dá multa e queima o domínio do cliente.",
        texto: `A prospecção observará a Lei nº 13.709/2018 e as políticas dos canais utilizados, sendo a CONTRATANTE a CONTROLADORA dos dados tratados e a CONTRATADA a OPERADORA.

Parágrafo primeiro. A prospecção de contatos profissionais fundada em legítimo interesse observará: pertinência do contato ao exercício da atividade profissional do titular; identificação clara do remetente e da finalidade; canal simples e efetivo de descadastramento em toda comunicação; e atendimento imediato aos pedidos de oposição, que serão registrados em lista de supressão permanente.

Parágrafo segundo. É VEDADO à CONTRATADA: adquirir bases de dados de origem ilícita ou não comprovada; utilizar dados pessoais sensíveis; extrair dados em violação aos termos de uso das plataformas; disparar mensagens sem mecanismo de opt-out; e utilizar identidade falsa ou remetente enganoso.

Parágrafo terceiro. A CONTRATANTE responde pela licitude das bases que fornecer e pela conformidade da sua política de privacidade, e obriga-se a honrar os pedidos de descadastramento em todos os seus canais.

Parágrafo quarto. Danos à reputação de domínio, bloqueios de e-mail, restrições de conta em redes profissionais e sanções decorrentes de instrução expressa da CONTRATANTE contrária a esta cláusula são de responsabilidade dela; decorrentes de conduta própria da CONTRATADA, dela.

Parágrafo quinto. Havendo incidente de segurança ou reclamação de titular, as partes observarão os prazos e os deveres da cláusula Da Proteção de Dados.`,
      },
      {
        id: "atendimento_do_lead",
        titulo: "Da Obrigação da Contratante de Atender o Lead",
        essencial: true,
        protege: "Lead esfria em horas — se o comercial do cliente não atende, o resultado não é da agência.",
        texto: `A CONTRATANTE obriga-se a atender cada oportunidade gerada no prazo de [PRAZO_ATENDIMENTO_LEAD], mantendo equipe comercial disponível, agenda aberta para agendamentos e CRM atualizado.

Parágrafo primeiro. As partes reconhecem que a taxa de conversão em B2B cai acentuadamente com o tempo de resposta, e que a demora no atendimento inutiliza o trabalho de prospecção já executado e remunerado.

Parágrafo segundo. A CONTRATANTE registrará no CRM o desfecho de cada oportunidade, com motivo de perda quando for o caso, insumo indispensável à calibragem da prospecção. A ausência desse registro afasta qualquer alegação de baixa qualidade dos leads.

Parágrafo terceiro. Reuniões perdidas por indisponibilidade, atraso ou cancelamento da CONTRATANTE computam-se como entregues.

Parágrafo quarto. A CONTRATADA não responde por vendas não realizadas, por desempenho comercial, por preço, por proposta, por capacidade de entrega da CONTRATANTE nem por qualquer resultado além da geração das oportunidades contratadas, obrigação de meio na forma da cláusula Da Limitação de Responsabilidade.

Parágrafo quinto. A CONTRATANTE fornecerá à CONTRATADA material comercial atualizado, faixa de preço, diferenciais e objeções frequentes, sem o que a qualificação opera com informação incompleta.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_VERBA_DE_MIDIA,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      comoOpcional(CLAUSULA_PORTFOLIO, true),
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 7 — AGÊNCIA · 5. TERCEIRIZAÇÃO B2B (WHITE LABEL)             */
  /* ================================================================== */
  {
    perfil: "agencia_marketing",
    tipoServico: "white_label_b2b",
    nome: "Terceirização B2B (White Label)",
    descricao:
      "Execução em nome de outra agência: anonimato do executor, proibição de contato com o cliente final, não aliciamento reforçado, prazos em cascata e portfólio bloqueado por padrão.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "SERVICOS_TERCEIRIZADOS", label: "Serviços terceirizados", tipo: "textarea", exemplo: "gestão de tráfego e produção de criativos para a carteira da contratante" },
      { tag: "NUMERO_DE_CONTAS", label: "Nº de contas atendidas", tipo: "numero", exemplo: "5" },
      { tag: "VALOR_POR_CONTA", label: "Valor por conta atendida", tipo: "moeda" },
      { tag: "PRAZO_INTERNO_ENTREGA", label: "Prazo interno de entrega à contratante", tipo: "texto", exemplo: "2 dias úteis antes do prazo prometido ao cliente final" },
      { tag: "PRAZO_NAO_ALICIAMENTO", label: "Prazo de não aliciamento", tipo: "texto", exemplo: "24 meses" },
      { tag: "MULTA_ALICIAMENTO", label: "Multa por aliciamento/desvio de cliente", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS EM REGIME DE TERCEIRIZAÇÃO (WHITE LABEL)

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], agência responsável perante os clientes finais, doravante simplesmente CONTRATANTE;

CONTRATADA: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], executora dos serviços, doravante simplesmente CONTRATADA;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto e do Regime White Label",
        essencial: true,
        protege: "Deixa claro que a relação é entre as duas empresas — o cliente final é da contratante.",
        texto: `Constitui objeto deste contrato a execução, pela CONTRATADA, dos seguintes serviços em nome e sob a marca da CONTRATANTE: [SERVICOS_TERCEIRIZADOS], para até [NUMERO_DE_CONTAS] contas da carteira desta.

Parágrafo primeiro. A remuneração é de [VALOR_POR_CONTA] por conta atendida, totalizando [VALOR_MENSAL] mensais, devidos independentemente do recebimento da CONTRATANTE junto ao cliente final — a inadimplência do cliente final NÃO é oponível à CONTRATADA.

Parágrafo segundo. A relação jurídica existe EXCLUSIVAMENTE entre CONTRATANTE e CONTRATADA. O cliente final é cliente da CONTRATANTE, que perante ele responde integralmente pela prestação, pelo prazo, pela qualidade e pelas obrigações contratuais e consumeristas.

Parágrafo terceiro. A CONTRATADA executa sem identificação própria: as entregas, os relatórios e os materiais serão produzidos sem marca, assinatura ou menção à CONTRATADA, e em modelo fornecido pela CONTRATANTE quando houver.

Parágrafo quarto. NÃO integram o objeto: atendimento ao cliente final; reuniões com o cliente final; comercial, proposta e cobrança; e decisões estratégicas que caibam à CONTRATANTE.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "anonimato_e_contato",
        titulo: "Do Anonimato, da Vedação de Contato Direto e do Sigilo da Carteira",
        essencial: true,
        protege: "A carteira é da contratante — o executor não aparece nem se aproxima do cliente dela.",
        texto: `A CONTRATADA obriga-se a manter absoluto anonimato perante o cliente final e terceiros quanto à sua participação na execução.

Parágrafo primeiro. É VEDADO à CONTRATADA, salvo autorização escrita e específica da CONTRATANTE: contatar o cliente final por qualquer meio; participar de reuniões sem a presença da CONTRATANTE; identificar-se como executora; enviar materiais com sua marca; e divulgar a existência da relação com aquele cliente.

Parágrafo segundo. Havendo necessidade de participação técnica em reunião, a CONTRATADA poderá ser apresentada como integrante da equipe da CONTRATANTE, sem revelar a terceirização, desde que previamente autorizado.

Parágrafo terceiro. A identidade dos clientes finais, os valores por eles pagos à CONTRATANTE, os contratos e a composição da carteira são informação confidencial da CONTRATANTE, protegida pela cláusula Da Confidencialidade.

Parágrafo quarto. A CONTRATADA obriga-se a não prospectar, abordar, contratar ou atender, direta ou indiretamente, por si ou por interposta pessoa, qualquer cliente final da carteira da CONTRATANTE ao qual tenha tido acesso em razão deste contrato, durante a sua vigência e por [PRAZO_NAO_ALICIAMENTO] após o término.

Parágrafo quinto. A violação do parágrafo anterior sujeita a CONTRATADA à multa não compensatória de [MULTA_ALICIAMENTO] por cliente desviado, sem prejuízo das perdas e danos que a excederem, e constitui justa causa para rescisão imediata.

Parágrafo sexto. A vedação não alcança cliente com quem a CONTRATADA já mantinha relação comercial comprovada e anterior a este contrato, nem quem a procure espontaneamente sem qualquer iniciativa sua — hipótese em que a CONTRATADA comunicará previamente a CONTRATANTE por escrito.`,
      },
      {
        id: "prazos_em_cascata",
        titulo: "Dos Prazos em Cascata e da Responsabilidade pela Cadeia",
        essencial: true,
        protege: "A agência precisa de folga entre receber e entregar — e o executor precisa de briefing a tempo.",
        texto: `Os prazos deste contrato são INTERNOS, e correm em cascata: a CONTRATADA entregará à CONTRATANTE em [PRAZO_INTERNO_ENTREGA], reservando a esta o tempo necessário à revisão e à entrega ao cliente final.

Parágrafo primeiro. A CONTRATANTE repassará à CONTRATADA os briefings, insumos, acessos e aprovações do cliente final com antecedência compatível com o prazo interno pactuado. Repasse tardio desloca o prazo interno na mesma medida, sem que isso configure atraso da CONTRATADA, ainda que gere atraso da CONTRATANTE perante o seu cliente.

Parágrafo segundo. A CONTRATADA NÃO responde perante a CONTRATANTE por multa, desconto, perda de contrato ou dano de imagem que esta venha a sofrer perante o cliente final, salvo quando decorrente de atraso ou vício exclusivamente imputável à CONTRATADA, hipótese em que a responsabilidade observa o limite da cláusula Da Limitação de Responsabilidade.

Parágrafo terceiro. A CONTRATANTE é responsável pela revisão final e pela aprovação do material antes da entrega ao cliente final; entregue o material ao cliente final, considera-se aceito pela CONTRATANTE para os efeitos deste contrato.

Parágrafo quarto. Demandas de urgência do cliente final não se transferem automaticamente à CONTRATADA: dependem de aceite desta e observam o acréscimo da cláusula Das Alterações de Escopo.

Parágrafo quinto. O encerramento de contrato entre a CONTRATANTE e cliente final reduz proporcionalmente o número de contas e o valor mensal, mediante aviso de 30 (trinta) dias, observada a cláusula Da Vigência quanto ao mínimo contratado.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      comoOpcional(CLAUSULA_PORTFOLIO, true),
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
];
