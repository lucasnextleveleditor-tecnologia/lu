import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";
import type { ClausulaModelo } from "./tipos";
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
} from "./clausulas-comuns";

/**
 * Cláusulas próprias da fotografia, comuns aos cinco contratos deste perfil.
 *
 * O que gera conflito em foto não é o mesmo que gera em vídeo: é a seleção
 * (quantas fotos entregues, quem escolhe), o tratamento (até onde vai o
 * retoque antes de virar outro serviço) e o arquivo original (o RAW, que o
 * cliente pede achando que é a "foto sem edição" e que na verdade é o
 * negativo do fotógrafo).
 */
const CLAUSULA_SELECAO_E_TRATAMENTO: ClausulaModelo = {
  id: "selecao_tratamento",
  titulo: "Da Seleção, do Tratamento das Imagens e dos Arquivos Originais",
  essencial: true,
  protege: "Diz quantas fotos saem, quem escolhe, até onde vai o retoque e por que o RAW não sai.",
  texto: `Serão entregues [QUANTIDADE_FOTOS_ENTREGUES] fotografias tratadas, selecionadas pelo CONTRATADO entre as imagens captadas, segundo critérios técnicos e estéticos de nitidez, exposição, enquadramento, expressão e composição.

Parágrafo primeiro. A seleção é ato de AUTORIA, e não mera triagem: escolher o que se mostra faz parte do trabalho contratado. Havendo interesse da CONTRATANTE em participar da seleção, será disponibilizada galeria de pré-visualização em baixa resolução e com marca d'água, na qual poderá escolher as imagens dentro do número contratado.

Parágrafo segundo. O TRATAMENTO INCLUSO compreende: correção de cor e de temperatura, ajuste de exposição, contraste e nitidez, enquadramento e alinhamento, e remoção de pequenas imperfeições momentâneas. NÃO estão inclusos, e constituem serviço adicional orçado à parte: retoque avançado de pele, alteração de silhueta ou de traços, troca de fundo, composição de imagens, remoção de objetos ou pessoas, inserção de elementos, e manipulação que altere a realidade do registro.

Parágrafo terceiro. Fotografias não selecionadas NÃO integram a entrega, não serão exibidas nem cedidas, e poderão ser eliminadas pelo CONTRATADO após o prazo da cláusula Do Backup.

Parágrafo quarto. OS ARQUIVOS ORIGINAIS DE CÂMERA (RAW) NÃO INTEGRAM A ENTREGA. Equivalem ao negativo fotográfico: contêm a matriz da obra, não representam o resultado final aprovado pelo autor, e a sua circulação permite a terceiros produzir versões que serão atribuídas ao CONTRATADO sem o seu controle. A cessão de RAW, quando desejada, será objeto de contratação e preço apartados, mediante o valor de [VALOR_CESSAO_BRUTOS].

Parágrafo quinto. As imagens serão entregues em alta resolução para uso digital e, quando previsto, em versão preparada para impressão. Reenquadramentos, versões em outras proporções e adequações a especificações de terceiros serão tratados como alteração de escopo.

Parágrafo sexto. A edição, a aplicação de filtros, o recorte e a alteração das imagens entregues pela CONTRATANTE ou por terceiros descaracterizam a obra e afastam a responsabilidade do CONTRATADO pelo resultado, aplicando-se a cláusula Dos Direitos Autorais quanto à integridade da obra.`,
};


/**
 * Banco de modelos de contrato do perfil FOTÓGRAFO — v2, 8 tipos de serviço
 * (substitui a v1 de 5 tipos genéricos). Cláusulas específicas do nicho:
 * quitação prévia obrigatória em serviços de data única, armazenamento
 * pós-entrega transferido ao cliente, tabela progressiva de retenção por
 * cancelamento, cláusula essencial de segurança em ensaios newborn, e
 * isenção de responsabilidade por autorização de imagem de terceiros
 * (convidados, palestrantes, colegas de turma) sempre atribuída ao cliente.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_FOTOGRAFO: ModeloContratoServico[] = [
  {
    perfil: "fotografo",
    tipoServico: "casamentos",
    nome: "Casamentos",
    descricao: "Cobertura fotográfica completa de cerimônia e festa de casamento, com quitação prévia obrigatória, tabela progressiva de retenção por cancelamento e armazenamento pós-entrega transferido aos contratantes.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_CONJUGE", label: "Nome do(a) cônjuge", tipo: "texto" },
      { tag: "CPF_CONJUGE", label: "CPF do(a) cônjuge", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do casamento", tipo: "data" },
      { tag: "LOCAL_DA_CERIMONIA", label: "Local da cerimônia", tipo: "texto" },
      { tag: "LOCAL_DA_FESTA", label: "Local da festa", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início da cobertura", tipo: "texto", exemplo: "14h" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término da cobertura", tipo: "texto", exemplo: "23h" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária total", tipo: "texto", exemplo: "9 horas" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea", exemplo: "making of, cerimônia, festa" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "texto", exemplo: "1 fotógrafo(a) + 1 assistente" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega da prévia rápida", tipo: "texto", exemplo: "48 horas" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup por liberalidade", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retenção acima de 12 meses", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção entre 12 e 6 meses", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção entre 6 e 3 meses", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção entre 3 meses e 30 dias", tipo: "percentual", exemplo: "80" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo mínimo de aviso para remarcação", tipo: "texto", exemplo: "60 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE CASAMENTO

CONTRATANTE(S): [NOME_DO_CLIENTE] e [NOME_DO_CONJUGE], CPFs nº [CPF_CNPJ_CLIENTE] e [CPF_CONJUGE], residentes em [ENDERECO_CLIENTE], denominados em conjunto CONTRATANTES (solidariamente responsáveis pelas obrigações financeiras).
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura fotográfica da cerimônia e festa de casamento dos CONTRATANTES, em [DATA_DO_EVENTO], cerimônia em [LOCAL_DA_CERIMONIA] e festa em [LOCAL_DA_FESTA].
1.2. O(a) CONTRATADO(A) não se responsabiliza por aspectos da organização do evento, de responsabilidade exclusiva dos CONTRATANTES e demais fornecedores.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO] ([CARGA_HORARIA_DIARIA]), compreendendo [MOMENTOS_COBERTOS].
2.2. Equipe: [COMPOSICAO_DA_EQUIPE]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.3. O(a) CONTRATADO(A) não se responsabiliza por captar momentos específicos não comunicados previamente pelos CONTRATANTES fora do roteiro combinado.

3. DO PRAZO DE ENTREGA
3.1. Prévia/seleção rápida entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o evento. Galeria completa tratada entregue em até [PRAZO_DE_ENTREGA] dias corridos após o evento.
3.2. Produção de álbum físico (quando contratada), incluindo prazo de seleção de fotos pelos CONTRATANTES e prazo de fabricação gráfica, segue cronograma à parte informado no momento da contratação, não incluído no prazo da cláusula 3.1.

4. DAS REVISÕES E DO TRATAMENTO DE IMAGEM
4.1. Está incluso o tratamento de cor/luz padrão em todas as fotos selecionadas. Está inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual sobre a seleção entregue (ex.: reenquadramento leve, correção pontual).
4.2. Edição avançada (retoque de pele extensivo, remoção de elementos indesejados do fundo, manipulação digital) além do tratamento padrão é cobrada à parte.
4.3. Não há, em qualquer hipótese, nova sessão fotográfica do casamento, por se tratar de evento único e irrepetível. O(a) CONTRATADO(A) responde apenas por defeito técnico comprovadamente causado por falha de seu equipamento ou operação, obrigando-se, nessa hipótese, a entregar o material humanamente possível de recuperar e a conceder abatimento proporcional relativo aos momentos efetivamente perdidos.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Cláusula essencial: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do casamento. O não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não comparecer, sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 7.
5.3. Atraso de parcela: multa de 2%, juros de 1% ao mês, correção pelo índice [INDICE_DE_CORRECAO]. Galeria em alta resolução liberada só após quitação.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega da galeria, cessa a responsabilidade do(a) CONTRATADO(A) pela guarda do material — armazenamento e backup passam a ser de exclusiva responsabilidade dos CONTRATANTES.
6.2. Backup por liberalidade mantido por até [PRAZO_MINIMO_GUARDA_BACKUP]; recuperação/reenvio dentro desse prazo é cobrada à parte no valor de [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Dada a reserva integral de agenda para data única, o cancelamento pelos CONTRATANTES segue a tabela: mais de 12 meses de antecedência — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre 12 e 6 meses — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 3 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 3 meses e 30 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 30 dias ou não comparecimento — retenção de 100%.
7.2. Adiamento comunicado com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade de agenda: valores pagos migram para a nova data, sem multa.
7.3. Cancelamento pelo(a) CONTRATADO(A) sem justa causa: devolução integral em até 5 dias úteis, sem prejuízo de indenização por danos comprovados.

8. DOS DIREITOS AUTORAIS E DE IMAGEM
8.1. Cedidos aos CONTRATANTES os direitos de uso pessoal e não comercial das fotos, sem limitação de prazo.
8.2. O(a) CONTRATADO(A) pode usar o material em portfólio/divulgação, com crédito, salvo pedido de privacidade por escrito antes do evento.
8.3. Direitos de imagem de convidados são de responsabilidade dos CONTRATANTES, que devem informá-los previamente sobre a cobertura; objeções posteriores não geram responsabilidade ao(à) CONTRATADO(A).

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto de nível equivalente mediante anuência dos CONTRATANTES; não sendo possível, devolução integral nos termos da cláusula 7.3.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito/força maior; comunicação em até 48h e remarcação conforme cláusula 7.2.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais/financeiros dos CONTRATANTES pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade do(a) CONTRATADO(A) limitada ao valor total pago, excluídos lucros cessantes, danos indiretos e danos morais/à imagem por fatores alheios à sua atuação técnica.
13.2. Os CONTRATANTES indenizam o(a) CONTRATADO(A) por: (i) objeção de imagem de convidados não informados sobre a cobertura; (ii) atos de terceiros fornecedores que atrapalhem a captação; (iii) uso do material fora do combinado.
13.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

14. DAS DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício/societário. Alterações somente por aditivo escrito. CONTRATANTES respondem solidariamente pelas obrigações financeiras.

15. DO FORO
15.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "fotografo",
    tipoServico: "ensaios_familia_gestante_newborn",
    nome: "Ensaios de Família, Gestante e Newborn",
    descricao: "Sessão fotográfica de família, gestante ou recém-nascido, com cláusula essencial de segurança do bebê em ensaios newborn e isenção por condição de saúde não informada previamente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TIPO_DE_ENSAIO", label: "Tipo de ensaio", tipo: "texto", exemplo: "newborn" },
      { tag: "DATA_DO_ENSAIO", label: "Data do ensaio", tipo: "data" },
      { tag: "LOCAL_DO_ENSAIO", label: "Local do ensaio", tipo: "texto" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Duração prevista", tipo: "texto", exemplo: "3 horas" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PRAZO_DE_ENTREGA", label: "Prazo de entrega da galeria", tipo: "texto", exemplo: "20 dias corridos" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup por liberalidade", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ENSAIO FOTOGRÁFICO (FAMÍLIA/GESTANTE/NEWBORN)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Realização de ensaio fotográfico do tipo [TIPO_DE_ENSAIO], em [DATA_DO_ENSAIO], no local [LOCAL_DO_ENSAIO].

2. DO ESCOPO E DAS CONDIÇÕES ESPECIAIS (NEWBORN)
2.1. Duração prevista: [CARGA_HORARIA_DIARIA]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cláusula essencial de segurança (ensaios newborn): quando o ensaio envolver recém-nascido, a prioridade absoluta do(a) CONTRATADO(A) é o bem-estar e a segurança do bebê, podendo interromper, pausar ou adiar poses específicas a seu critério técnico sempre que perceber desconforto, choro persistente, sinais de mal-estar ou qualquer risco à saúde do recém-nascido, sem que isso configure descumprimento contratual. Poses com props (adereços) que envolvam qualquer risco de queda, sufocamento ou desequilíbrio são realizadas apenas com apoio manual constante do(a) fotógrafo(a) ou de assistente, nunca deixando o bebê sem supervisão direta.
2.3. Cabe à CONTRATANTE informar previamente sobre condições de saúde do bebê/gestante relevantes para o ensaio (ex.: prematuridade, restrições médicas), isentando o(a) CONTRATADO(A) de responsabilidade por intercorrência de saúde não informada.

3. DO PRAZO DE ENTREGA
3.1. Entrega da galeria tratada em até [PRAZO_DE_ENTREGA] dias corridos após o ensaio.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual sobre a seleção entregue. Novo ensaio por insatisfação com poses/roupas já escolhidas no dia é cobrado como sessão adicional.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Galeria em alta resolução liberada após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a responsabilidade do(a) CONTRATADO(A) pela guarda do material; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DO REAGENDAMENTO
7.1. Cancelamento pela CONTRATANTE: mais de 5 dias de antecedência — retenção de 20%; entre 5 e 2 dias — retenção de 50%; menos de 48 horas ou não comparecimento — retenção de 100%.
7.2. Reagendamento por motivo de saúde do bebê/gestante (ex.: parto adiantado/atrasado) não se sujeita à retenção acima, sendo remarcado sem custo mediante disponibilidade de agenda.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Uso pessoal cedido à CONTRATANTE. O(a) CONTRATADO(A) pode usar as fotos em portfólio, com crédito, salvo pedido de privacidade formalizado por escrito antes do ensaio (especialmente relevante para fotos de recém-nascidos e crianças).

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto equivalente ou devolução integral.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito ou força maior, aplicando-se a remarcação sem ônus.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais e de saúde da CONTRATANTE/bebê pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados pessoais, incluindo eventuais dados sensíveis de saúde informados, conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade limitada ao valor total pago, excluídos danos indiretos e lucros cessantes.
13.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) informações de saúde não fornecidas previamente que resultem em intercorrência (cláusula 2.3); (ii) uso do material fora do combinado.
13.3. Avaliações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

14. DAS DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício, societário ou de representação.

15. DO FORO
15.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "fotografo",
    tipoServico: "fotografia_de_formatura",
    nome: "Fotografia de Formatura",
    descricao: "Cobertura fotográfica de colação de grau e/ou festa de formatura, contratável individualmente ou por comissão de formatura em nome da turma.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do contratante", tipo: "texto", exemplo: "formando(a)" },
      { tag: "NOME_DA_TURMA_OU_FORMANDO", label: "Nome da turma ou do(a) formando(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início da cobertura", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término da cobertura", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea", exemplo: "colação, entrega de diploma, festa" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega da prévia", tipo: "texto", exemplo: "48 horas" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup por liberalidade", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção acima de 60 dias", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção entre 60 e 15 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção entre 15 e 5 dias", tipo: "percentual", exemplo: "80" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE FORMATURA

CONTRATANTE: [NOME_DO_CLIENTE] ([QUALIFICACAO_CLIENTE] ou comissão de formatura), CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura fotográfica da colação de grau/festa de formatura de [NOME_DA_TURMA_OU_FORMANDO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Quando contratado por comissão de formatura em nome de múltiplos formandos, a comissão representa o grupo para fins de aprovações e comunicações, permanecendo cada formando responsável pela obtenção de sua própria autorização de uso de imagem perante os demais colegas retratados, quando aplicável.

3. DO PRAZO DE ENTREGA
3.1. Prévia em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o evento. Galeria completa em até [PRAZO_DE_ENTREGA] dias corridos.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual. Sem nova cobertura, por se tratar de evento único.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, a guarda do material passa à CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Mais de 60 dias de antecedência — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 60 e 15 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 15 e 5 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 5 dias ou não comparecimento — retenção de 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Uso pessoal cedido à CONTRATANTE. O(a) CONTRATADO(A) pode usar em portfólio, salvo vedação por escrito.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações do evento pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por caso fortuito ou força maior; indicação de substituto equivalente ou devolução integral.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Responsabilidade limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) ausência de autorização de imagem de formandos/participantes; (ii) atos de fornecedores do evento que atrapalhem a captação; (iii) uso do material fora do combinado.
12.3. Avaliações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação.

14. DO FORO
14.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "fotografo",
    tipoServico: "aniversarios_festas_sociais",
    nome: "Aniversários e Festas Sociais",
    descricao: "Cobertura fotográfica de aniversários e festas sociais, com quitação prévia obrigatória e tabela progressiva de retenção por cancelamento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TIPO_DE_FESTA", label: "Tipo de festa", tipo: "texto", exemplo: "aniversário de 15 anos" },
      { tag: "NOME_DO_ANIVERSARIANTE_OU_HOMENAGEADO", label: "Nome do(a) aniversariante/homenageado(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início da cobertura", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término da cobertura", tipo: "texto" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária total", tipo: "texto", exemplo: "5 horas" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra", tipo: "moeda" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup por liberalidade", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção acima de 6 meses", tipo: "percentual", exemplo: "15" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção entre 6 e 2 meses", tipo: "percentual", exemplo: "40" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção entre 2 meses e 15 dias", tipo: "percentual", exemplo: "70" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE FESTA SOCIAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura fotográfica da festa [TIPO_DE_FESTA] de [NOME_DO_ANIVERSARIANTE_OU_HOMENAGEADO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO] ([CARGA_HORARIA_DIARIA]): [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Horas excedentes cobradas a [VALOR_HORA_EXTRA] por hora.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após o evento.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual; sem nova cobertura, por se tratar de evento único.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes da festa, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A).

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, a guarda do material passa a ser da CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Mais de 6 meses de antecedência — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 2 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 2 meses e 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 15 dias ou não comparecimento — retenção de 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Uso pessoal cedido à CONTRATANTE; uso em portfólio ressalvado salvo pedido de privacidade. Imagem de convidados é de responsabilidade da CONTRATANTE.

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto equivalente ou devolução integral.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito ou força maior, aplicando-se a remarcação sem multa.

11. DA CONFIDENCIALIDADE
11.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade limitada ao valor pago, excluídos danos indiretos.
13.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por informações falsas, atos de terceiros convidados/contratados e uso do material fora da licença concedida.
13.3. Avaliações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

14. DAS DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício, societário ou de representação.

15. DO FORO
15.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "fotografo",
    tipoServico: "captacao_premium_diaria",
    nome: "Captação Premium (Diária)",
    descricao: "Contratação de fotógrafo por diária de reserva integral de agenda, para eventos ou ocasiões diversas não enquadradas nos demais tipos de serviço, com tabela progressiva de retenção por cancelamento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DO_EVENTO_OU_OCASIAO", label: "Descrição do evento/ocasião", tipo: "textarea" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "VALOR_HORA_EXCEDENTE", label: "Valor da hora excedente", tipo: "moeda" },
      { tag: "RAIO_DESLOCAMENTO_INCLUSO", label: "Raio de deslocamento incluso", tipo: "texto", exemplo: "30 km" },
      { tag: "CRITERIO_CUSTO_DESLOCAMENTO", label: "Critério de custo de deslocamento adicional", tipo: "texto", exemplo: "R$/km excedente" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup por liberalidade", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PRAZO_RETENCAO_FAIXA_1", label: "Prazo da 1ª faixa de retenção", tipo: "texto", exemplo: "90 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_2", label: "Prazo da 2ª faixa de retenção", tipo: "texto", exemplo: "45 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_3", label: "Prazo da 3ª faixa de retenção", tipo: "texto", exemplo: "15 dias" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retenção na 1ª faixa", tipo: "percentual", exemplo: "15" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção na 2ª faixa", tipo: "percentual", exemplo: "40" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção na 3ª faixa", tipo: "percentual", exemplo: "70" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção abaixo da 3ª faixa", tipo: "percentual", exemplo: "90" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo mínimo de aviso para remarcação gratuita", tipo: "texto", exemplo: "30 dias" },
      { tag: "EXCLUSIVA_NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "sem limite de prazo" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território da licença", tipo: "texto", exemplo: "internet, território nacional" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA POR DIÁRIA (CAPTAÇÃO PREMIUM)

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura fotográfica em regime de diária (reserva de agenda exclusiva), para [DESCRICAO_DO_EVENTO_OU_OCASIAO], em [DATA_DO_EVENTO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO].
1.2. Modalidade caracterizada pela reserva integral da agenda do(a) CONTRATADO(A) para a data, nos termos da cláusula 7.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Horas excedentes cobradas a [VALOR_HORA_EXCEDENTE] por hora, mediante acordo prévio de disponibilidade.
2.2. Deslocamento dentro de [RAIO_DESLOCAMENTO_INCLUSO] incluso; além disso, conforme [CRITERIO_CUSTO_DESLOCAMENTO].

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste. Nova captação por motivo não imputável a erro técnico é orçada como nova diária.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor da diária: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Para eventos com data certa e insubstituível: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material, que passa a ser de responsabilidade exclusiva da CONTRATANTE a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Mais de [PRAZO_RETENCAO_FAIXA_1] de antecedência — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre [PRAZO_RETENCAO_FAIXA_2] e [PRAZO_RETENCAO_FAIXA_1] — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre [PRAZO_RETENCAO_FAIXA_3] e [PRAZO_RETENCAO_FAIXA_2] — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; menos de [PRAZO_RETENCAO_FAIXA_3] — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; no dia do evento ou não comparecimento — retenção de 100%.
7.2. Uma remarcação gratuita, com aviso mínimo de [PRAZO_AVISO_REMARCACAO]; remarcações seguintes seguem a tabela acima.

8. DOS DIREITOS DE USO
8.1. Cedidos de forma [EXCLUSIVA_NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], nos meios [MEIOS_E_TERRITORIO]. Uso em portfólio ressalvado salvo vedação por escrito.

9. DA CONFIDENCIALIDADE
9.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por caso fortuito ou força maior; indicação de substituto de nível equivalente ou devolução integral.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Responsabilidade limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) informações falsas sobre o evento; (ii) atos de terceiros convidados/contratados; (iii) uso do material fora da licença concedida; (iv) ausência de autorização de terceiros para a captação.
12.3. Avaliações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação.

14. DO FORO
14.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  /* ================================================================== */
  /* GRUPO 6 — FOTÓGRAFO · 1. RETRATOS CORPORATIVOS                     */
  /* ================================================================== */
  {
    perfil: "fotografo",
    tipoServico: "retrato_profissional_headshots",
    nome: "Retratos Corporativos",
    descricao:
      "Headshots de equipe, com número de pessoas contado, regra de falta, padrão visual definido, autorização de imagem de cada retratado e licença de uso institucional delimitada.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "NUMERO_DE_PESSOAS", label: "Nº de pessoas a fotografar", tipo: "numero", exemplo: "25" },
      { tag: "FOTOS_POR_PESSOA", label: "Fotos tratadas por pessoa", tipo: "numero", exemplo: "2" },
      { tag: "QUANTIDADE_FOTOS_ENTREGUES", label: "Total de fotos entregues", tipo: "texto", exemplo: "50 (2 por pessoa)" },
      { tag: "LOCAL_DA_CAPTACAO", label: "Local da sessão", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Início da sessão", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Término da sessão", tipo: "texto" },
      { tag: "PADRAO_VISUAL", label: "Padrão visual acordado", tipo: "textarea", exemplo: "fundo cinza neutro, enquadramento até o peito, luz suave frontal, traje social" },
      { tag: "VALOR_PESSOA_EXCEDENTE", label: "Valor por pessoa excedente", tipo: "moeda" },
      { tag: "MIDIAS_LICENCIADAS", label: "Mídias licenciadas", tipo: "textarea", exemplo: "site institucional, LinkedIn, assinatura de e-mail e materiais internos" },
      { tag: "PRAZO_LICENCA", label: "Prazo da licença", tipo: "texto", exemplo: "prazo indeterminado, para uso institucional" },
      { tag: "VALOR_CESSAO_BRUTOS", label: "Valor da cessão de arquivos RAW", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA CORPORATIVA

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Pessoa é a unidade de medida — e é ela que define o tempo e o preço.",
        texto: `Constitui objeto deste contrato a produção de retratos corporativos de [NUMERO_DE_PESSOAS] pessoas, em sessão realizada em [LOCAL_DA_CAPTACAO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO].

Parágrafo primeiro. Serão entregues [FOTOS_POR_PESSOA] fotografias tratadas por pessoa, totalizando [QUANTIDADE_FOTOS_ENTREGUES], no padrão visual: [PADRAO_VISUAL].

Parágrafo segundo. Pessoas excedentes ao número contratado serão fotografadas mediante disponibilidade de tempo na sessão e cobrança de [VALOR_PESSOA_EXCEDENTE] por pessoa.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: maquiagem, cabelo e styling; figurino; fotografia de ambiente, instalações e equipe em situação de trabalho; retrato em locação externa; retoque avançado; e impressão ou emolduramento.

Parágrafo quarto. O padrão visual acordado é vinculante para todas as pessoas fotografadas, assegurando a unidade institucional do conjunto; pedidos individuais de estilo diverso não serão atendidos na mesma sessão.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "agenda_e_faltas",
        titulo: "Da Agenda da Sessão, das Faltas e da Reposição",
        essencial: true,
        protege: "Quem não aparece na hora marcada consome o tempo que outra pessoa usaria.",
        texto: `A CONTRATANTE elaborará e divulgará internamente a escala de horários individuais, respeitado o tempo médio por pessoa informado pelo CONTRATADO, e responsabilizar-se-á pelo seu cumprimento.

Parágrafo primeiro. A ausência de pessoa escalada, o atraso superior a 10 (dez) minutos ou a recusa a ser fotografada NÃO geram direito a extensão da sessão, e a respectiva vaga considera-se consumida.

Parágrafo segundo. Pessoas não fotografadas na sessão contratada poderão ser atendidas em NOVA sessão, orçada à parte, com valor mínimo correspondente a uma diária, ainda que se trate de uma única pessoa, dado que a mobilização de equipe e estúdio é a mesma.

Parágrafo terceiro. A CONTRATANTE providenciará, no local, ambiente com espaço mínimo compatível com a montagem de fundo e iluminação, ponto de energia, e sala reservada de espera; a inadequação do espaço que impeça a montagem no padrão acordado autoriza a adaptação do padrão ou a remarcação, sem ônus para o CONTRATADO.

Parágrafo quarto. Prorrogação da sessão além do horário contratado observa a cláusula Da Jornada.

Parágrafo quinto. A CONTRATANTE orientará previamente as pessoas quanto ao traje e à apresentação pessoal adequados ao padrão visual acordado.`,
      },
      {
        id: "imagem_dos_colaboradores",
        titulo: "Da Autorização de Imagem dos Retratados e do Desligamento",
        essencial: true,
        protege: "Retrato de pessoa exige autorização dela — e ex-funcionário pode pedir para sair do site.",
        texto: `Cabe à CONTRATANTE obter, previamente à sessão, autorização escrita de uso de imagem de cada pessoa fotografada, com indicação das finalidades, das mídias e do prazo, na forma da cláusula Do Direito de Imagem.

Parágrafo primeiro. Nenhuma pessoa poderá ser compelida a ser fotografada; a recusa deve ser respeitada pela CONTRATANTE e não gera obrigação ao CONTRATADO.

Parágrafo segundo. A imagem de pessoa natural é dado pessoal, e o seu tratamento observa a cláusula Da Proteção de Dados, atuando a CONTRATANTE como CONTROLADORA.

Parágrafo terceiro. Havendo desligamento, revogação da autorização ou pedido do titular, a retirada da imagem dos meios sob controle da CONTRATANTE é obrigação desta, cabendo ao CONTRATADO apenas cessar o uso em portfólio, quando comunicado.

Parágrafo quarto. A licença de uso concedida à CONTRATANTE compreende as mídias [MIDIAS_LICENCIADAS], pelo prazo de [PRAZO_LICENCA], vedada a cessão a terceiros, o uso em publicidade paga e a comercialização das imagens.

Parágrafo quinto. O uso das imagens em portfólio pelo CONTRATADO fica condicionado à existência de autorização individual da pessoa retratada, que a CONTRATANTE se obriga a obter ou, não a obtendo, a informar.`,
      },
      CLAUSULA_SELECAO_E_TRATAMENTO,
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
  /* GRUPO 6 — FOTÓGRAFO · 2. PRODUTOS E GASTRONOMIA                    */
  /* ================================================================== */
  {
    perfil: "fotografo",
    tipoServico: "fotografia_produtos_ecommerce",
    nome: "Produtos e Gastronomia",
    descricao:
      "Foto de produto e de prato, com contagem por item e por ângulo, regras de envio e devolução de amostras, prazo de vida do alimento em set, e licença comercial delimitada.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      { tag: "NUMERO_DE_ITENS", label: "Nº de produtos/pratos", tipo: "numero", exemplo: "20" },
      { tag: "ANGULOS_POR_ITEM", label: "Ângulos por item", tipo: "numero", exemplo: "3" },
      { tag: "QUANTIDADE_FOTOS_ENTREGUES", label: "Total de fotos entregues", tipo: "texto", exemplo: "60 (3 por item)" },
      { tag: "ESTILO_DE_FOTOGRAFIA", label: "Estilo", tipo: "textarea", exemplo: "fundo branco infinito para e-commerce e 5 imagens ambientadas para redes" },
      { tag: "LOCAL_DA_CAPTACAO", label: "Local da captação", tipo: "texto", exemplo: "estúdio do contratado" },
      { tag: "PRAZO_ENVIO_AMOSTRAS", label: "Prazo para envio das amostras", tipo: "texto", exemplo: "5 dias úteis antes da sessão" },
      { tag: "DESTINO_DAS_AMOSTRAS", label: "Destino das amostras após a sessão", tipo: "texto", exemplo: "devolução por conta da contratante em até 10 dias" },
      { tag: "VALOR_ITEM_EXCEDENTE", label: "Valor por item excedente", tipo: "moeda" },
      { tag: "MIDIAS_LICENCIADAS", label: "Mídias licenciadas", tipo: "textarea", exemplo: "e-commerce próprio, marketplaces, redes sociais e catálogo" },
      { tag: "PRAZO_LICENCA", label: "Prazo da licença", tipo: "texto", exemplo: "24 meses" },
      { tag: "VALOR_CESSAO_BRUTOS", label: "Valor da cessão de arquivos RAW", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE PRODUTO E GASTRONOMIA

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Item e ângulo são a unidade — sem isso o pacote nunca fecha.",
        texto: `Constitui objeto deste contrato a produção fotográfica de [NUMERO_DE_ITENS] itens, com [ANGULOS_POR_ITEM] ângulos por item, totalizando [QUANTIDADE_FOTOS_ENTREGUES], captados em [LOCAL_DA_CAPTACAO], no estilo: [ESTILO_DE_FOTOGRAFIA].

Parágrafo primeiro. Itens excedentes serão fotografados mediante cobrança de [VALOR_ITEM_EXCEDENTE] por item, condicionada à disponibilidade de tempo.

Parágrafo segundo. NÃO integram o objeto, salvo contratação apartada: food styling e preparo dos alimentos; compra de ingredientes, props, louças e cenário; modelos e mãos em cena; direção de arte elaborada; fotografia 360°, vídeo e animação; remoção de fundo além do padrão contratado; e cadastro das imagens em plataformas de venda.

Parágrafo terceiro. Tratando-se de gastronomia, a CONTRATANTE providenciará profissional responsável pelo preparo e pela montagem dos pratos, bem como porções de reposição, dado que alimentos perdem apelo visual em minutos sob luz de estúdio.

Parágrafo quarto. A ordem de captação será definida pelo CONTRATADO segundo critério técnico de montagem de set e de perecibilidade dos itens.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "amostras_e_produtos",
        titulo: "Do Envio, da Guarda e da Devolução das Amostras",
        essencial: true,
        protege: "Produto que chega atrasado, quebrado ou vencido é problema de quem enviou.",
        texto: `A CONTRATANTE enviará ao CONTRATADO os itens a serem fotografados até [PRAZO_ENVIO_AMOSTRAS], em condições de uso e apresentação, limpos, íntegros e, quando for o caso, dentro do prazo de validade.

Parágrafo primeiro. Itens recebidos com atraso, avariados, sujos, amassados, com etiqueta danificada, com embalagem violada ou fora de validade não serão fotografados, cabendo à CONTRATANTE providenciar a reposição; o prazo fica suspenso até o recebimento adequado, na forma da cláusula Dos Prazos.

Parágrafo segundo. O CONTRATADO manterá os itens em ambiente adequado durante a produção, respondendo por dano que lhes causar por culpa sua, limitada a responsabilidade ao valor de reposição do item, mediante comprovação. NÃO responde por: perecimento natural de alimentos e perecíveis; alteração de aparência decorrente da própria captação, notadamente derretimento, oxidação, murchamento e condensação; nem por variação de tonalidade entre lotes.

Parágrafo terceiro. Concluída a sessão, os itens terão o seguinte destino: [DESTINO_DAS_AMOSTRAS]. Não retirados nem reclamados no prazo de 30 (trinta) dias contados da comunicação de disponibilidade, poderão ser descartados ou doados pelo CONTRATADO, sem direito a indenização.

Parágrafo quarto. Alimentos preparados serão descartados ao fim da sessão por razões sanitárias, sem que isso gere qualquer obrigação de ressarcimento.

Parágrafo quinto. Itens de alto valor deverão ser previamente informados e, a critério do CONTRATADO, poderão exigir seguro específico, contratado pela CONTRATANTE, ou captação nas dependências desta.`,
      },
      {
        id: "fidelidade_do_produto",
        titulo: "Da Fidelidade da Imagem e da Publicidade do Produto",
        essencial: true,
        protege: "Foto bonita não pode virar propaganda enganosa — e quem vende responde por isso.",
        texto: `As fotografias representam o item efetivamente fornecido pela CONTRATANTE, captado com técnica profissional de iluminação, ótica e composição.

Parágrafo primeiro. Recursos legítimos de fotografia — escolha de lente, luz, ângulo, fundo e composição — realçam o produto sem alterar suas características essenciais. NÃO serão executadas manipulações que induzam o consumidor a erro quanto a tamanho, quantidade, cor real, composição ou conteúdo do produto, práticas vedadas pelo Código de Defesa do Consumidor.

Parágrafo segundo. A CONTRATANTE é a única responsável pelo uso publicitário das imagens e pela correspondência entre o produto fotografado e o efetivamente comercializado, inclusive quanto a alterações posteriores de fórmula, embalagem, tamanho ou apresentação.

Parágrafo terceiro. Marcas, embalagens, rótulos, personagens e elementos de terceiros presentes nos itens dependem de autorização dos respectivos titulares, obtida pela CONTRATANTE na forma da cláusula Do Direito de Imagem.

Parágrafo quarto. A licença de uso compreende as mídias [MIDIAS_LICENCIADAS], pelo prazo de [PRAZO_LICENCA], vedada a revenda das imagens, o licenciamento a banco de imagens e a cessão a terceiros que não sejam canais de venda do próprio produto fotografado.`,
      },
      CLAUSULA_SELECAO_E_TRATAMENTO,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
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
  /* GRUPO 6 — FOTÓGRAFO · 3. MODA / LOOKBOOKS                          */
  /* ================================================================== */
  {
    perfil: "fotografo",
    tipoServico: "moda_lookbooks",
    nome: "Moda / Lookbooks",
    descricao:
      "Editorial e lookbook de coleção, com looks contados, equipe de apoio definida, cachê e direito de imagem de modelo, embargo até o lançamento e licença por temporada.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_VIAGEM,
      { tag: "NOME_DA_COLECAO", label: "Nome da coleção", tipo: "texto" },
      { tag: "NUMERO_DE_LOOKS", label: "Nº de looks", tipo: "numero", exemplo: "18" },
      { tag: "FOTOS_POR_LOOK", label: "Fotos tratadas por look", tipo: "numero", exemplo: "4" },
      { tag: "QUANTIDADE_FOTOS_ENTREGUES", label: "Total de fotos entregues", tipo: "texto", exemplo: "72 (4 por look)" },
      { tag: "NUMERO_DE_MODELOS", label: "Nº de modelos", tipo: "numero", exemplo: "2" },
      { tag: "EQUIPE_DE_APOIO", label: "Equipe de apoio e por conta de quem", tipo: "textarea", exemplo: "beleza, styling e assistente de set por conta da contratante" },
      { tag: "LOCACOES_PREVISTAS", label: "Locações previstas", tipo: "textarea" },
      { tag: "QUANTIDADE_DIARIAS", label: "Diárias de captação", tipo: "numero", exemplo: "1" },
      { tag: "DATA_DE_LANCAMENTO", label: "Data de lançamento da coleção", tipo: "data" },
      { tag: "MIDIAS_LICENCIADAS", label: "Mídias licenciadas", tipo: "textarea" },
      { tag: "PRAZO_LICENCA", label: "Prazo da licença", tipo: "texto", exemplo: "12 meses, correspondentes à temporada da coleção" },
      { tag: "VALOR_LOOK_EXCEDENTE", label: "Valor por look excedente", tipo: "moeda" },
      { tag: "VALOR_CESSAO_BRUTOS", label: "Valor da cessão de arquivos RAW", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE MODA

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Look é a unidade — e é o número deles que define a diária.",
        texto: `Constitui objeto deste contrato a produção fotográfica do lookbook da coleção [NOME_DA_COLECAO], compreendendo [NUMERO_DE_LOOKS] looks, com [FOTOS_POR_LOOK] fotografias tratadas por look, totalizando [QUANTIDADE_FOTOS_ENTREGUES].

Parágrafo primeiro. A produção compreende [QUANTIDADE_DIARIAS] diária(s), nas locações [LOCACOES_PREVISTAS], com [NUMERO_DE_MODELOS] modelo(s), e a seguinte equipe de apoio: [EQUIPE_DE_APOIO].

Parágrafo segundo. Looks excedentes serão fotografados mediante disponibilidade de tempo e cobrança de [VALOR_LOOK_EXCEDENTE] cada.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada e expressa: contratação, agenciamento e cachê de modelos; beleza, maquiagem, cabelo e manicure; styling, produção de moda, passadoria e ajustes de peça; locação e taxas de uso de espaço; cenografia, props e mobiliário; catering de set; vídeo e making of; e diagramação do lookbook.

Parágrafo quarto. A direção fotográfica — luz, lente, ângulo, ritmo e direção de pose — é atribuição técnica e autoral do CONTRATADO, exercida em diálogo com a direção criativa da CONTRATANTE.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "modelos_e_set",
        titulo: "Dos Modelos, do Cachê e do Direito de Imagem",
        essencial: true,
        protege: "Modelo tem contrato próprio, prazo de uso próprio — e isso não é responsabilidade do fotógrafo.",
        texto: `A contratação dos modelos, o pagamento dos respectivos cachês e a celebração dos contratos de cessão de direito de imagem são de responsabilidade EXCLUSIVA da CONTRATANTE.

Parágrafo primeiro. A CONTRATANTE obriga-se a que a cessão de imagem obtida do modelo abranja, no mínimo, as mesmas mídias, o mesmo território e o mesmo prazo da licença concedida por este contrato, e a comprová-la ao CONTRATADO antes da captação.

Parágrafo segundo. O CONTRATADO NÃO responde por reclamação, notificação ou ação de modelo, agência ou sindicato relativa a cachê, prazo de uso, veiculação além do autorizado ou condições de trabalho, obrigando-se a CONTRATANTE a assumir o polo passivo e a mantê-lo indene.

Parágrafo terceiro. Sendo o modelo menor de idade, a autorização será firmada por representante legal, com observância das normas de proteção à criança e ao adolescente, e a presença do responsável no set é obrigatória.

Parágrafo quarto. A CONTRATANTE assegurará ao set condições dignas de trabalho a todos os envolvidos: local reservado e privativo para troca de roupa, água, alimentação na forma da cláusula Da Alimentação, temperatura adequada e intervalos. É vedada qualquer conduta de assédio, na forma da cláusula Da Conduta.

Parágrafo quinto. Atraso superior a 1 (uma) hora, ausência ou impossibilidade de trabalho de modelo ou de integrante da equipe de apoio contratada pela CONTRATANTE não prorroga a diária e observa a cláusula Da Jornada, podendo caracterizar diária perdida.`,
      },
      {
        id: "embargo_colecao",
        titulo: "Do Sigilo da Coleção e do Embargo até o Lançamento",
        essencial: true,
        protege: "Coleção vazada antes da hora é prejuízo real — e o embargo tem data para acabar.",
        texto: `A coleção fotografada constitui informação confidencial da CONTRATANTE até a data do seu lançamento oficial, prevista para [DATA_DE_LANCAMENTO].

Parágrafo primeiro. O CONTRATADO e sua equipe obrigam-se a não divulgar, exibir, publicar ou compartilhar qualquer imagem, peça, informação ou registro de bastidores da coleção antes do lançamento, sob pena da multa prevista na cláusula Da Confidencialidade.

Parágrafo segundo. É vedada a publicação de conteúdo de bastidores em redes sociais durante a produção, salvo autorização escrita e específica da CONTRATANTE quanto a cada publicação.

Parágrafo terceiro. A partir do lançamento oficial, fica liberado ao CONTRATADO o uso das imagens em portfólio, na forma da cláusula Do Uso em Portfólio, sem necessidade de nova autorização.

Parágrafo quarto. A licença concedida à CONTRATANTE compreende [MIDIAS_LICENCIADAS], pelo prazo de [PRAZO_LICENCA], correspondente à temporada da coleção; a reutilização das imagens em temporadas seguintes ou em campanha diversa depende de renovação onerosa.

Parágrafo quinto. A CONTRATANTE obriga-se a creditar o CONTRATADO nas publicações em que o formato o comportar, conforme praxe do mercado de moda.`,
      },
      CLAUSULA_SELECAO_E_TRATAMENTO,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      CLAUSULA_VIAGEM,
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
  /* GRUPO 6 — FOTÓGRAFO · 4. EVENTOS SOCIAIS E CORPORATIVOS            */
  /* ================================================================== */
  {
    perfil: "fotografo",
    tipoServico: "fotografia_eventos_corporativos",
    nome: "Eventos Sociais e Corporativos",
    descricao:
      "Cobertura fotográfica de evento com data certa: quitação prévia, tabela de retenção, limites do que dá para registrar ao vivo e prazo de entrega de galeria.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Início da cobertura", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Término da cobertura", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos a cobrir", tipo: "textarea" },
      { tag: "QUANTIDADE_FOTOS_ENTREGUES", label: "Fotos tratadas entregues", tipo: "texto", exemplo: "mínimo de 200 fotografias" },
      { tag: "PRAZO_PREVIA_SELECAO", label: "Prazo de entrega de prévia", tipo: "texto", exemplo: "48 horas, com 15 fotos" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — mais de 30 dias antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_15_DIAS", label: "% retido — entre 30 e 15 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_7_DIAS", label: "% retido — entre 15 e 7 dias", tipo: "percentual", exemplo: "80" },
      { tag: "PERCENTUAL_RETENCAO_VESPERA", label: "% retido — menos de 7 dias", tipo: "percentual", exemplo: "100" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Antecedência p/ remarcar sem multa", tipo: "texto", exemplo: "20 dias" },
      { tag: "VALOR_CESSAO_BRUTOS", label: "Valor da cessão de arquivos RAW", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA FOTOGRÁFICA DE EVENTO

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
        texto: `Constitui objeto deste contrato a cobertura fotográfica do evento "[NOME_DO_EVENTO]", em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO], compreendendo os momentos: [MOMENTOS_COBERTOS].

Parágrafo primeiro. Serão entregues [QUANTIDADE_FOTOS_ENTREGUES] fotografias tratadas, em galeria digital, no prazo de [PRAZO_DE_ENTREGA] dias. Uma prévia será disponibilizada em [PRAZO_PREVIA_SELECAO].

Parágrafo segundo. NÃO integram o objeto, salvo contratação apartada: fotografia com impressão no local; cabine de fotos; álbum, quadro e produto impresso; segundo fotógrafo; vídeo; drone, que observa cláusula própria; e cobertura de ambientes simultâneos.

Parágrafo terceiro. Evento é acontecimento único e irrepetível. O CONTRATADO empregará sua melhor técnica para registrar os momentos contratados, mas NÃO se obriga a fotografar a totalidade dos presentes, nem momentos simultâneos, inacessíveis, obstruídos por convidados ou não comunicados previamente.

Parágrafo quarto. A CONTRATANTE poderá indicar, com antecedência mínima de 5 (cinco) dias, lista de pessoas e momentos de registro obrigatório; a ausência dessa indicação transfere a ela o risco da não captação de registro específico.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "quitacao_e_cancelamento_foto",
        titulo: "Da Quitação Prévia, do Cancelamento e da Remarcação",
        essencial: true,
        protege: "A data foi bloqueada e paga — desistir perto dela custa o que a agenda perdeu.",
        texto: `A assinatura e o pagamento do sinal bloqueiam a agenda do CONTRATADO para a data, com recusa de outras propostas, e o saldo deverá estar quitado até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento.

Parágrafo primeiro. Não verificada a quitação, o CONTRATADO poderá liberar a agenda e não comparecer, retendo os valores pagos, sem que isso configure inadimplemento seu.

Parágrafo segundo. O cancelamento pela CONTRATANTE sujeita-a à retenção de: [PERCENTUAL_RETENCAO_30_DIAS]% com mais de 30 dias; [PERCENTUAL_RETENCAO_15_DIAS]% entre 30 e 15 dias; [PERCENTUAL_RETENCAO_7_DIAS]% entre 15 e 7 dias; e [PERCENTUAL_RETENCAO_VESPERA]% com menos de 7 dias, somadas as despesas não reembolsáveis.

Parágrafo terceiro. A remarcação com antecedência mínima de [PRAZO_AVISO_REMARCACAO], havendo disponibilidade de agenda, não sofrerá retenção, admitida uma única vez.

Parágrafo quarto. O adiamento por caso fortuito ou força maior preserva crédito por 12 (doze) meses, sujeito à agenda e ao ressarcimento das despesas incorridas.

Parágrafo quinto. A prorrogação do evento além do horário contratado observa a cláusula Da Jornada.`,
      },
      {
        id: "condicoes_do_evento_foto",
        titulo: "Das Condições do Evento e dos Limites Técnicos",
        protege: "Luz de festa, palco escuro e convidado na frente são condições do evento, não defeito.",
        texto: `A CONTRATANTE providenciará acesso da equipe com antecedência mínima de 1 (uma) hora, credenciamento, ponto de energia e posição de trabalho com visada dos momentos principais.

Parágrafo primeiro. A iluminação do ambiente é definida pela produção do evento. Ambientes de baixa luminosidade, luz colorida, estroboscópio, fumaça e contraluz produzem resultado esteticamente distinto do obtido em ambiente controlado, o que não constitui vício.

Parágrafo segundo. O uso de flash poderá ser restringido pela organização, pelo local ou pela natureza do evento; a restrição reduz proporcionalmente a expectativa de resultado em ambientes escuros.

Parágrafo terceiro. Convidados e outros profissionais em cena, celulares erguidos, decoração e estruturas do evento podem obstruir enquadramentos; o CONTRATADO buscará posições alternativas, sem que a obstrução configure descumprimento.

Parágrafo quarto. Restrições da organização, da casa ou de patrocinador quanto a posições e momentos reduzem a expectativa de material sem redução do preço.

Parágrafo quinto. Aplicam-se as cláusulas Das Condições Climáticas e Do Equipamento quanto à segurança da equipe e à integridade do material.`,
      },
      CLAUSULA_SELECAO_E_TRATAMENTO,
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
  /* GRUPO 6 — FOTÓGRAFO · 5. ARQUITETURA / INTERIORES                  */
  /* ================================================================== */
  {
    perfil: "fotografo",
    tipoServico: "arquitetura_interiores",
    nome: "Arquitetura / Interiores",
    descricao:
      "Fotografia de obra pronta, com preparação do ambiente, janela de luz natural, crédito ao projeto, cessão limitada e a divisão do uso entre arquiteto, construtora e fornecedores.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      ...CAMPOS_VIAGEM,
      { tag: "NOME_DO_PROJETO_ARQ", label: "Nome do projeto/obra", tipo: "texto" },
      { tag: "ENDERECO_DO_IMOVEL", label: "Endereço do imóvel", tipo: "texto" },
      { tag: "AMBIENTES_A_FOTOGRAFAR", label: "Ambientes a fotografar", tipo: "textarea", exemplo: "fachada, living, cozinha, 2 suítes, varanda e área de lazer" },
      { tag: "QUANTIDADE_FOTOS_ENTREGUES", label: "Fotos tratadas entregues", tipo: "texto", exemplo: "30 fotografias" },
      { tag: "QUANTIDADE_DIARIAS", label: "Diárias de captação", tipo: "numero", exemplo: "1" },
      { tag: "JANELA_DE_LUZ", label: "Janela de luz pretendida", tipo: "texto", exemplo: "manhã para os ambientes internos e fim de tarde para a fachada" },
      { tag: "AUTOR_DO_PROJETO", label: "Autor do projeto arquitetônico", tipo: "texto" },
      { tag: "TERCEIROS_LICENCIADOS", label: "Terceiros autorizados a usar as imagens", tipo: "textarea", exemplo: "marcenaria, iluminação e paisagismo do projeto, para uso em portfólio, com crédito" },
      { tag: "MIDIAS_LICENCIADAS", label: "Mídias licenciadas", tipo: "textarea" },
      { tag: "PRAZO_LICENCA", label: "Prazo da licença", tipo: "texto", exemplo: "prazo indeterminado, para portfólio e divulgação institucional" },
      { tag: "VALOR_CESSAO_BRUTOS", label: "Valor da cessão de arquivos RAW", tipo: "moeda" },
      { tag: "VALOR_DIARIA_EXTRA", label: "Valor da diária extra", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE ARQUITETURA E INTERIORES

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
        texto: `Constitui objeto deste contrato a produção fotográfica do projeto [NOME_DO_PROJETO_ARQ], situado em [ENDERECO_DO_IMOVEL], compreendendo os ambientes: [AMBIENTES_A_FOTOGRAFAR].

Parágrafo primeiro. Serão entregues [QUANTIDADE_FOTOS_ENTREGUES] fotografias tratadas, captadas em [QUANTIDADE_DIARIAS] diária(s), observada a janela de luz: [JANELA_DE_LUZ]. Diárias adicionais serão orçadas a [VALOR_DIARIA_EXTRA] cada.

Parágrafo segundo. NÃO integram o objeto, salvo contratação apartada: produção e styling do ambiente, incluindo compra ou locação de objetos, flores, roupa de cama e mesa posta; limpeza e organização do imóvel; remoção de mobiliário ou de obra; iluminação cênica adicional além do kit do CONTRATADO; captação com drone, que observa cláusula própria; vídeo e tour virtual; e composição digital de céu, vista ou vegetação.

Parágrafo terceiro. A fotografia registra o ambiente COMO ELE ESTÁ na data da captação: acabamentos inconclusos, sujeira de obra, fiação aparente, etiquetas, entulho, ausência de mobiliário e vista externa desfavorável aparecerão no registro, salvo se removidos pela CONTRATANTE antes da sessão.

Parágrafo quarto. A escolha dos enquadramentos, das alturas de câmera e dos horários de captação é atribuição técnica e autoral do CONTRATADO.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "preparo_do_ambiente",
        titulo: "Da Preparação do Ambiente e da Janela de Luz",
        essencial: true,
        protege: "Obra não pronta na hora marcada consome a luz do dia — e a luz não volta.",
        texto: `A CONTRATANTE entregará o imóvel pronto, limpo e liberado no horário agendado, com todos os ambientes acessíveis, energia ligada, luminárias funcionando e sem presença de equipes de obra ou de terceiros em atividade.

Parágrafo primeiro. A fotografia de arquitetura depende da LUZ NATURAL, cuja janela é curta e não se repete no mesmo dia. Atraso na liberação do imóvel, ambiente não finalizado, presença de terceiros ou necessidade de limpeza no local consomem irremediavelmente a janela de luz planejada, sem direito a extensão da diária, a reposição gratuita ou a abatimento.

Parágrafo segundo. Não sendo possível concluir a captação por causa imputável à CONTRATANTE, a continuação em nova data será remunerada como diária adicional, acrescida das despesas de deslocamento.

Parágrafo terceiro. Havendo condição climática adversa que comprometa a captação de fachada, área externa ou ambientes dependentes de luz natural, aplica-se a cláusula Das Condições Climáticas, e a CONTRATANTE poderá optar entre a captação parcial ou a remarcação onerosa.

Parágrafo quarto. Pequenos ajustes de cena — alinhamento de objetos, fechamento de portas, acendimento de luzes, remoção de itens soltos — serão feitos pelo CONTRATADO no curso da captação; produção de ambiente, contudo, é serviço distinto, na forma da cláusula Do Objeto.

Parágrafo quinto. Havendo moradores, hóspedes ou funcionários no imóvel, a CONTRATANTE providenciará a sua ciência e, se for o caso, a autorização de imagem, na forma da cláusula Do Direito de Imagem.`,
      },
      {
        id: "credito_e_terceiros",
        titulo: "Do Crédito ao Projeto, do Uso por Fornecedores e da Licença",
        essencial: true,
        protege: "Foto de arquitetura circula entre muitos — e cada um precisa de licença e dar crédito.",
        texto: `As partes reconhecem que a fotografia de arquitetura interessa a múltiplos agentes do mesmo projeto — autor do projeto, construtora, marcenaria, iluminação, paisagismo, fornecedores de acabamento e de mobiliário —, e que cada um deles pretende utilizá-la.

Parágrafo primeiro. A licença concedida à CONTRATANTE compreende [MIDIAS_LICENCIADAS], pelo prazo de [PRAZO_LICENCA], para uso próprio, institucional e de portfólio, com a obrigação de creditar o CONTRATADO como autor das fotografias e [AUTOR_DO_PROJETO] como autor do projeto arquitetônico.

Parágrafo segundo. Ficam adicionalmente autorizados a utilizar as imagens, nas mesmas condições e com os mesmos créditos: [TERCEIROS_LICENCIADOS]. Terceiros não listados deverão obter licença diretamente do CONTRATADO, mediante preço próprio.

Parágrafo terceiro. É VEDADO a qualquer licenciado: remover ou alterar créditos; recortar a imagem de modo a suprimir a assinatura; licenciar as imagens a bancos de imagem; ceder a veículos de mídia paga; ou utilizá-las em publicidade de produto que não integre o projeto fotografado, sem licença específica.

Parágrafo quarto. A publicação em veículos editoriais de arquitetura e decoração dependerá de acordo prévio entre as partes quanto a crédito e condições, sendo prática do setor a menção ao fotógrafo.

Parágrafo quinto. O CONTRATADO poderá utilizar as imagens em seu portfólio, na forma da cláusula Do Uso em Portfólio, creditando o autor do projeto.

Parágrafo sexto. A CONTRATANTE declara ter autorização do proprietário do imóvel para a captação e para a divulgação das imagens, respondendo perante o CONTRATADO por qualquer oposição posterior.`,
      },
      CLAUSULA_SELECAO_E_TRATAMENTO,
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
];
