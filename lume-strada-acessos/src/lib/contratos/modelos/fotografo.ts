import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

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
    tipoServico: "fotografia_eventos_corporativos",
    nome: "Fotografia de Eventos Corporativos",
    descricao: "Cobertura fotográfica de eventos corporativos, com licença de uso institucional/promocional por prazo determinado e responsabilidade do cliente sobre autorização de imagem de palestrantes e participantes.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_EVENTO_CORPORATIVO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início da cobertura", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término da cobertura", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega da prévia", tipo: "texto", exemplo: "48 horas" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup por liberalidade", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retenção acima de 60 dias", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retenção entre 60 e 15 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retenção entre 15 e 5 dias", tipo: "percentual", exemplo: "80" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso institucional", tipo: "texto", exemplo: "24 meses" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE EVENTO CORPORATIVO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura fotográfica do evento [NOME_DO_EVENTO_CORPORATIVO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cabe à CONTRATANTE viabilizar credenciamento e cronograma do evento com antecedência. Captação de palestrantes/convidados especiais está sujeita à autorização destes, de responsabilidade da CONTRATANTE.

3. DO PRAZO DE ENTREGA
3.1. Prévia em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO]. Galeria completa em até [PRAZO_DE_ENTREGA] dias corridos após o evento.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual. Sem nova cobertura de momentos não captados por motivo alheio ao(à) CONTRATADO(A).

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, a guarda do material passa à CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Mais de 60 dias de antecedência — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 60 e 15 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 15 e 5 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 5 dias ou não comparecimento — retenção de 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Cedidos à CONTRATANTE os direitos de uso institucional/promocional pelo prazo de [PRAZO_DA_LICENCA_DE_USO]. O(a) CONTRATADO(A) pode usar em portfólio, salvo confidencialidade formalizada.
8.2. Imagem de palestrantes/participantes é de responsabilidade da CONTRATANTE.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre conteúdo do evento não divulgado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por caso fortuito ou força maior.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Responsabilidade limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) ausência de autorização de imagem de palestrantes/participantes; (ii) informações de cronograma incorretas; (iii) uso do material fora da licença concedida.
12.3. Avaliações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação.

14. DO FORO
14.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "fotografo",
    tipoServico: "fotografia_produtos_ecommerce",
    nome: "Fotografia de Produtos e E-commerce",
    descricao: "Fotografia comercial de produtos para lojas virtuais e marketplaces, com responsabilidade do cliente sobre condição e seguro dos produtos fornecidos para captação.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DOS_PRODUTOS", label: "Descrição dos produtos", tipo: "textarea" },
      { tag: "PLATAFORMAS_DE_DESTINO", label: "Plataformas de destino", tipo: "texto", exemplo: "site próprio, marketplace" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "DATA_DE_CAPTACAO", label: "Data da captação", tipo: "data" },
      { tag: "PRAZO_ENTREGA_PRODUTOS_PARA_CAPTACAO", label: "Prazo mínimo de entrega dos produtos para captação", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas por produto", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda do material bruto", tipo: "texto", exemplo: "15 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
      { tag: "EXCLUSIVA_NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "sem limite de prazo" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território da licença", tipo: "texto", exemplo: "internet, território nacional" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE PRODUTOS

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Fotografia dos produtos [DESCRICAO_DOS_PRODUTOS], para uso em [PLATAFORMAS_DE_DESTINO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Captação em [LOCAL_DE_CAPTACAO], na data de [DATA_DE_CAPTACAO].
2.2. Cabe à CONTRATANTE disponibilizar os produtos em condições adequadas de apresentação, com antecedência mínima de [PRAZO_ENTREGA_PRODUTOS_PARA_CAPTACAO]; produto danificado ou incompleto pode acarretar novo agendamento cobrado como diária adicional.
2.3. Danos a produtos de terceiros durante a captação, quando não decorrentes de culpa comprovada do(a) CONTRATADO(A), são de responsabilidade da CONTRATANTE, que deve providenciar seguro próprio para itens de alto valor.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste por produto. Nova captação por troca/adição de produtos não previstos é cobrada à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivos finais liberados após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material bruto, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO
7.1. Cedidos à CONTRATANTE os direitos de uso comercial das fotos, de forma [EXCLUSIVA_NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], nos meios [MEIOS_E_TERRITORIO].
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação por escrito (comum para lançamentos ainda não divulgados).

8. DA RESCISÃO E DAS MULTAS
8.1. Cancelamento de captação já agendada: mais de 5 dias de antecedência — retenção de 20%; entre 5 e 2 dias — retenção de 50%; menos de 48 horas ou não comparecimento — retenção de 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre produtos não lançados pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por caso fortuito ou força maior.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Responsabilidade limitada ao valor total pago, excluídos lucros cessantes e danos indiretos (ex.: baixa conversão de vendas).
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) produtos de terceiros sem autorização de uso de imagem/marca; (ii) informações incorretas sobre o produto; (iii) uso do material fora da licença concedida.
12.3. Avaliações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação.

14. DO FORO
14.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "fotografo",
    tipoServico: "retrato_profissional_headshots",
    nome: "Retrato Profissional / Corporativo (Headshots)",
    descricao: "Sessão de headshots profissionais de colaboradores, com licença de uso institucional e obrigação da contratante de obter consentimento de cada colaborador retratado, conforme a LGPD.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NUMERO_DE_PESSOAS_FOTOGRAFADAS", label: "Nº de pessoas fotografadas", tipo: "numero", exemplo: "10" },
      { tag: "DATA_DO_ENSAIO", label: "Data da sessão", tipo: "data" },
      { tag: "LOCAL_DO_ENSAIO", label: "Local da sessão", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Descrição dos entregáveis", tipo: "textarea" },
      { tag: "TEMPO_POR_PESSOA", label: "Tempo previsto por pessoa", tipo: "texto", exemplo: "10 minutos" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de ajuste inclusas por pessoa", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda do material bruto", tipo: "texto", exemplo: "15 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso institucional", tipo: "texto", exemplo: "sem limite de prazo" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE RETRATO PROFISSIONAL (HEADSHOTS)

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Realização de sessão de retratos profissionais (headshots) de [NUMERO_DE_PESSOAS_FOTOGRAFADAS] pessoa(s)/colaborador(es) da CONTRATANTE, em [DATA_DO_ENSAIO], no local [LOCAL_DO_ENSAIO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Duração prevista por pessoa: [TEMPO_POR_PESSOA].
2.2. Reagendamento de pessoas ausentes no dia é tratado como nova diária, salvo se cabível dentro da mesma janela contratada.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a sessão.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste de tratamento por pessoa. Nova sessão por insatisfação com pose/roupa já escolhida no dia é cobrada à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivos liberados após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a obrigação de guarda do material bruto, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP]. Recuperação cobrada a [VALOR_TAXA_REENVIO].

7. DOS DIREITOS DE USO E IMAGEM
7.1. Cedidos à CONTRATANTE os direitos de uso institucional das fotos (site, LinkedIn corporativo, materiais internos) pelo prazo de [PRAZO_DA_LICENCA_DE_USO]. Cada colaborador retratado mantém direito de uso pessoal de sua própria foto.
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação por escrito.

8. DA RESCISÃO
8.1. Cancelamento pela CONTRATANTE: mais de 5 dias de antecedência — retenção de 20%; entre 5 e 2 dias — retenção de 50%; menos de 48 horas ou não comparecimento — retenção de 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações internas da CONTRATANTE pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de imagem de colaboradores conforme a Lei nº 13.709/2018; cabe à CONTRATANTE obter o consentimento de cada colaborador retratado para uso institucional das imagens.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por caso fortuito ou força maior.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Responsabilidade limitada ao valor total pago, excluídos lucros cessantes e danos indiretos.
12.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) ausência de consentimento de colaboradores para uso institucional da imagem (cláusula 10.1); (ii) uso do material fora da licença concedida.
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
];
