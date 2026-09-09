import type { CampoDinamicoModelo, ClausulaModelo } from "./tipos";

/**
 * Banco de cláusulas reaproveitáveis.
 *
 * São 35 contratos no sistema, e boa parte do que protege o profissional é a
 * MESMA coisa em todos eles: quem paga o deslocamento, quantas refações estão
 * inclusas, o que acontece quando o cliente some no meio da aprovação, quem
 * responde pelo backup depois da entrega, o que se pode publicar no
 * portfólio. Escrever isso 35 vezes garantiria 35 versões ligeiramente
 * diferentes — e a versão fraca seria descoberta no pior dia possível.
 *
 * Aqui cada uma dessas cláusulas é escrita UMA vez, no melhor texto que
 * conseguimos, e cada contrato escolhe as que usa. Corrigir uma brecha passa
 * a ser corrigir um arquivo, não caçar 35.
 *
 * As cláusulas ESPECÍFICAS de cada serviço (o objeto, os entregáveis, as
 * particularidades do videoclipe, do lançamento, da diária) continuam
 * morando no arquivo do perfil — só o que é comum vive aqui.
 *
 * AVISO: texto redigido em padrão jurídico profissional, mas nenhum modelo
 * substitui a leitura de um advogado antes do uso com clientes reais.
 */

/* ==================================================================== */
/* CAMPOS QUE AS CLÁUSULAS COMUNS PEDEM                                  */
/* ==================================================================== */

/** Tags usadas pelo banco comum — cada modelo espalha isto junto dos campos próprios. */
export const CAMPOS_OPERACIONAIS_COMUNS: CampoDinamicoModelo[] = [
  { tag: "PRAZO_APROVACAO_CLIENTE", label: "Prazo do cliente para aprovar ou apontar ajustes", tipo: "texto", exemplo: "5 dias úteis" },
  { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de rodadas de refação inclusas", tipo: "numero", exemplo: "2" },
  { tag: "VALOR_RODADA_ADICIONAL", label: "Valor de cada rodada de refação adicional", tipo: "moeda" },
  { tag: "PRAZO_INERCIA_APROVACAO", label: "Prazo de inércia p/ aprovação tácita", tipo: "texto", exemplo: "10 dias corridos" },
  { tag: "RAIO_KM_SEM_COBRANCA", label: "Raio de deslocamento sem cobrança (km)", tipo: "numero", exemplo: "30" },
  { tag: "VALOR_KM_EXCEDENTE", label: "Valor por km excedente", tipo: "moeda", exemplo: "3,00" },
  { tag: "CIDADE_BASE", label: "Cidade-base do contratado", tipo: "texto", autoPreenchivel: true },
  { tag: "VALOR_DIARIA_ALIMENTACAO", label: "Valor de diária de alimentação por profissional", tipo: "moeda", exemplo: "80,00" },
  { tag: "JORNADA_DIARIA_HORAS", label: "Jornada diária contratada (horas)", tipo: "numero", exemplo: "10" },
  { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra por profissional", tipo: "moeda" },
  { tag: "INTERVALO_ENTRE_DIARIAS", label: "Intervalo mínimo entre diárias", tipo: "texto", exemplo: "10 horas" },
  { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo de guarda do backup após a entrega", tipo: "texto", exemplo: "90 dias" },
  { tag: "VALOR_TAXA_REENVIO", label: "Taxa de recuperação/reenvio de arquivos", tipo: "moeda", exemplo: "300,00" },
  { tag: "PRAZO_CONFIDENCIALIDADE", label: "Prazo de confidencialidade", tipo: "texto", exemplo: "24 meses" },
  { tag: "MULTA_CONFIDENCIALIDADE", label: "Multa por quebra de confidencialidade", tipo: "moeda" },
  { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
  { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% de multa rescisória", tipo: "percentual", exemplo: "30" },
  { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso prévio para rescisão", tipo: "texto", exemplo: "30 dias" },
  { tag: "VALOR_EMBARGO_PORTFOLIO", label: "Valor do embargo de portfólio (sigilo total)", tipo: "moeda" },
  { tag: "MULTA_ALICIAMENTO", label: "Multa por aliciamento de equipe", tipo: "moeda" },
  { tag: "PRAZO_NAO_ALICIAMENTO", label: "Prazo de não aliciamento", tipo: "texto", exemplo: "12 meses" },
  { tag: "EMAIL_OFICIAL_CONTRATADO", label: "E-mail oficial do contratado", tipo: "texto", autoPreenchivel: true },
  { tag: "EMAIL_OFICIAL_CLIENTE", label: "E-mail oficial do cliente", tipo: "texto", autoPreenchivel: true },
  { tag: "NOME_APROVADOR", label: "Nome do responsável por aprovar pelo cliente", tipo: "texto" },
];

/** Tags adicionais de quem opera drone. */
export const CAMPOS_DRONE: CampoDinamicoModelo[] = [
  { tag: "CODIGO_SISANT", label: "Código SISANT da aeronave", tipo: "texto", exemplo: "PP-XXXXXXXXX" },
  { tag: "NOME_PILOTO_REMOTO", label: "Nome do piloto remoto responsável", tipo: "texto" },
  { tag: "PRAZO_AUTORIZACAO_DRONE", label: "Antecedência p/ solicitar autorização de voo", tipo: "texto", exemplo: "15 dias" },
  { tag: "VELOCIDADE_MAXIMA_VENTO", label: "Vento máximo para operar (km/h)", tipo: "numero", exemplo: "35" },
];

/** Tags de quem viaja para trabalhar. */
export const CAMPOS_VIAGEM: CampoDinamicoModelo[] = [
  { tag: "PADRAO_HOSPEDAGEM", label: "Padrão de hospedagem", tipo: "texto", exemplo: "hotel 3 estrelas ou superior, quarto individual" },
  { tag: "PADRAO_TRANSPORTE_AEREO", label: "Padrão de passagem aérea", tipo: "texto", exemplo: "classe econômica, voo direto quando houver, com bagagem despachada de 23 kg por profissional" },
  { tag: "PRAZO_ANTECEDENCIA_COMPRA", label: "Antecedência mínima de compra das passagens", tipo: "texto", exemplo: "21 dias" },
];

/* ==================================================================== */
/* EXECUÇÃO, APROVAÇÃO E REFAÇÕES                                        */
/* ==================================================================== */

/**
 * A cláusula que resolve o problema mais caro da profissão criativa: o
 * "só mais um ajustinho" infinito. Ela faz três coisas — limita o número de
 * rodadas, exige que os apontamentos venham de uma pessoa só e por escrito,
 * e cria aprovação tácita quando o cliente simplesmente para de responder.
 */
export const CLAUSULA_APROVACAO_E_REFACOES: ClausulaModelo = {
  id: "aprovacao_refacoes",
  titulo: "Da Aprovação, das Refações e da Aprovação Tácita",
  protege: "Fecha o ciclo de ajustes infinitos e cria aprovação automática pelo silêncio do cliente.",
  texto: `O material será submetido à apreciação da CONTRATANTE em versão de pré-visualização, cabendo a esta, no prazo de [PRAZO_APROVACAO_CLIENTE] contados do envio, manifestar-se de forma expressa e por escrito, aprovando integralmente o material ou apresentando, de uma única vez e de modo consolidado, a totalidade dos ajustes pretendidos.

Parágrafo primeiro. Estão inclusas no preço avençado [NUMERO_REVISOES_INCLUSAS] rodadas de refação. Entende-se por rodada de refação o conjunto de apontamentos entregues de uma só vez pela CONTRATANTE e a respectiva devolutiva do material ajustado pelo CONTRATADO, não se admitindo o fracionamento de apontamentos de uma mesma etapa em solicitações sucessivas com o fim de multiplicar as rodadas inclusas.

Parágrafo segundo. Esgotadas as rodadas inclusas, cada nova rodada de refação será orçada e cobrada à parte, ao valor de [VALOR_RODADA_ADICIONAL] por rodada, sendo a sua execução condicionada à aprovação prévia e escrita do respectivo custo pela CONTRATANTE e ao adiantamento integral do valor.

Parágrafo terceiro. Os apontamentos deverão ser objetivos, técnicos e exequíveis, formulados exclusivamente por [NOME_APROVADOR], única pessoa com poderes de aprovação para os fins deste contrato. Apontamentos oriundos de terceiros, ainda que integrantes do quadro da CONTRATANTE, somente serão considerados se por aquele consolidados e reencaminhados. Manifestações de natureza subjetiva desacompanhadas de indicação concreta do que deve ser alterado ("não gostei", "não é isso", "está estranho") não constituem apontamento válido e não deflagram rodada de refação, facultado ao CONTRATADO solicitar o esclarecimento correspondente, ficando o prazo suspenso até que seja prestado.

Parágrafo quarto. Alterações que modifiquem premissas já aprovadas em etapa anterior — notadamente roteiro, conceito, decupagem, seleção de material, trilha, identidade visual ou linha editorial aprovados — NÃO se qualificam como refação, e sim como alteração de escopo, sujeitando-se ao disposto na cláusula Das Alterações de Escopo, independentemente de haver rodadas inclusas remanescentes.

Parágrafo quinto. Decorrido o prazo de [PRAZO_INERCIA_APROVACAO] sem manifestação escrita da CONTRATANTE acerca de material submetido à sua apreciação, o material reputar-se-á TACITAMENTE APROVADO para todos os fins de direito, considerando-se cumprida a obrigação do CONTRATADO, encerrando-se o ciclo de refações e tornando-se exigível a parcela vinculada àquela etapa. A retomada posterior de apontamentos sobre material tacitamente aprovado será tratada como rodada adicional onerosa.`,
};

export const CLAUSULA_PRAZOS_E_INSUMOS: ClausulaModelo = {
  id: "prazos_insumos",
  titulo: "Dos Prazos e da Dependência de Insumos da Contratante",
  protege: "Impede que o atraso do cliente vire atraso seu — o relógio para quando o insumo não chega.",
  texto: `O prazo de entrega é de [PRAZO_DE_ENTREGA] dias, contados do primeiro dia útil seguinte ao evento gerador previsto para cada etapa, considerando-se dias úteis para todos os efeitos deste contrato, salvo disposição expressa em contrário.

Parágrafo primeiro. Os prazos aqui pactuados pressupõem que a CONTRATANTE forneça, tempestivamente e em condições de uso, todos os insumos, acessos, autorizações, materiais de marca, textos, aprovações intermediárias e informações necessários à execução. São considerados insumos, exemplificativamente: manuais e arquivos de identidade visual, logotipos em formato vetorial, acessos a plataformas e perfis, autorizações de uso de imagem, liberação de locação, disponibilidade de pessoas a serem filmadas ou fotografadas e definição de produtos, textos ou ofertas.

Parágrafo segundo. A ausência, o atraso, a incompletude ou a inadequação de qualquer insumo SUSPENDE automaticamente a fluência do prazo, que volta a correr, pelo saldo remanescente, no primeiro dia útil seguinte ao efetivo recebimento do insumo em condições de uso, independentemente de notificação. A suspensão não gera direito a desconto, abatimento, multa ou indenização em favor da CONTRATANTE.

Parágrafo terceiro. Suspensão superior a [PRAZO_INERCIA_APROVACAO] por causa imputável à CONTRATANTE autoriza o CONTRATADO, a seu exclusivo critério, a (i) realocar a sua agenda produtiva, hipótese em que a retomada observará a próxima janela livre, sem que isso configure inadimplemento ou atraso de sua parte; (ii) reajustar o preço remanescente pela variação do [INDICE_DE_CORRECAO] no período; ou (iii) considerar o contrato rescindido por culpa da CONTRATANTE, com os efeitos da cláusula Da Rescisão.

Parágrafo quarto. Os prazos referentes a etapas de aprovação da CONTRATANTE não se somam ao prazo do CONTRATADO: o tempo consumido em aprovação corre por conta de quem aprova.`,
};

export const CLAUSULA_ALTERACOES_DE_ESCOPO: ClausulaModelo = {
  id: "alteracoes_escopo",
  titulo: "Das Alterações de Escopo",
  protege: "Toda tarefa que não estava combinada vira orçamento novo, não favor.",
  texto: `Constitui alteração de escopo toda e qualquer demanda não expressamente descrita na cláusula Do Objeto, aí incluídas, exemplificativamente: acréscimo de entregáveis, formatos, versões, idiomas, cortes, peças ou canais de veiculação; acréscimo de diárias, locações, horas de captação ou pessoas retratadas; mudança de conceito, roteiro ou direção de arte após aprovação; antecipação de prazo; e reexecução de etapa já aprovada.

Parágrafo primeiro. Nenhuma alteração de escopo será executada sem prévio orçamento escrito do CONTRATADO e aceite igualmente escrito da CONTRATANTE, do qual constarão o preço adicional, a nova data de entrega e as condições de pagamento. Aceite manifestado por qualquer dos canais oficiais previstos na cláusula Das Comunicações produz plenos efeitos.

Parágrafo segundo. A execução de alteração de escopo NÃO se presume incluída no preço original ainda que iniciada de boa-fé pelo CONTRATADO para não paralisar o cronograma; nesta hipótese, o valor será apurado pelos parâmetros da proposta vigente e cobrado com a parcela seguinte.

Parágrafo terceiro. A recusa da CONTRATANTE em custear alteração de escopo por ela própria solicitada não autoriza a exigir a entrega ampliada, permanecendo o CONTRATADO obrigado exclusivamente ao objeto originalmente contratado.

Parágrafo quarto. Pedidos de antecipação de prazo, quando aceitos, importarão acréscimo de urgência de até 50% (cinquenta por cento) sobre o valor da etapa antecipada, destinado a custear a realocação de agenda e o eventual trabalho em regime noturno, de fim de semana ou feriado.`,
};

/* ==================================================================== */
/* LOGÍSTICA: DESLOCAMENTO, ALIMENTAÇÃO, JORNADA                         */
/* ==================================================================== */

export const CLAUSULA_DESLOCAMENTO: ClausulaModelo = {
  id: "deslocamento",
  titulo: "Do Deslocamento e da Logística",
  protege: "Quilômetro rodado, pedágio e estacionamento saem do bolso do cliente, não do seu cachê.",
  texto: `Estão inclusos no preço os deslocamentos realizados dentro do raio de [RAIO_KM_SEM_COBRANCA] km contados do centro da cidade de [CIDADE_BASE], base operacional do CONTRATADO.

Parágrafo primeiro. Deslocamentos que excedam o raio previsto no caput serão remunerados à razão de [VALOR_KM_EXCEDENTE] por quilômetro excedente, computados os trechos de ida e de volta, acrescidos do reembolso integral de pedágios, estacionamentos, travessias, taxas de acesso e demais despesas comprovadas mediante apresentação de comprovante.

Parágrafo segundo. O tempo de deslocamento superior a 1 (uma) hora por trecho será computado como tempo de trabalho para efeito da jornada prevista na cláusula Da Jornada, ainda que nele não haja captação ou execução de serviço.

Parágrafo terceiro. Quando o local de execução exigir credenciamento, autorização de acesso, cadastro prévio, taxa de filmagem, alvará, seguro específico, integração de segurança do trabalho ou acompanhamento de brigadista ou técnico, a obtenção e o custeio caberão exclusivamente à CONTRATANTE, que deverá comprová-los ao CONTRATADO com antecedência mínima de 5 (cinco) dias úteis da data de execução.

Parágrafo quarto. A impossibilidade de acesso ao local por ausência das providências do parágrafo anterior, por atraso na liberação, por interdição, por obra, ou por qualquer outra causa não imputável ao CONTRATADO, caracteriza diária perdida por culpa da CONTRATANTE, devida integralmente, sem prejuízo da remarcação da execução em nova data disponível na agenda do CONTRATADO, mediante o pagamento das despesas de novo deslocamento.

Parágrafo quinto. O CONTRATADO não se obriga a transportar equipamento, cenografia, mobiliário ou material da CONTRATANTE, salvo ajuste escrito específico e remunerado.`,
};

export const CLAUSULA_ALIMENTACAO: ClausulaModelo = {
  id: "alimentacao",
  titulo: "Da Alimentação e dos Intervalos",
  protege: "Equipe alimentada e com intervalo garantido — e o custo disso é do cliente.",
  texto: `Nas execuções cuja permanência no local ultrapasse 6 (seis) horas, a CONTRATANTE fornecerá, às suas expensas, alimentação adequada e água potável a todos os integrantes da equipe do CONTRATADO, em quantidade e qualidade equivalentes às oferecidas à sua própria equipe.

Parágrafo primeiro. Não havendo fornecimento in loco, a CONTRATANTE pagará ao CONTRATADO diária de alimentação no valor de [VALOR_DIARIA_ALIMENTACAO] por profissional envolvido, devida por dia de execução e cobrável junto à parcela seguinte, independentemente de o CONTRATADO ter ou não realizado a refeição.

Parágrafo segundo. É assegurado à equipe intervalo mínimo de 1 (uma) hora para refeição a cada 6 (seis) horas de trabalho contínuo. O intervalo não é computado como suspensão da jornada contratada, tampouco autoriza desconto no preço, e a sua supressão por conveniência da CONTRATANTE importará no pagamento de hora extra correspondente, nos termos da cláusula Da Jornada.

Parágrafo terceiro. Restrições alimentares comunicadas pelo CONTRATADO com antecedência mínima de 48 (quarenta e oito) horas deverão ser observadas pela CONTRATANTE; a inobservância equivale à ausência de fornecimento, com o efeito do parágrafo primeiro.

Parágrafo quarto. A CONTRATANTE disponibilizará à equipe local reservado e seguro para guarda de equipamento, bem como acesso a instalações sanitárias e, sempre que a execução ocorrer a céu aberto, área de sombra ou abrigo.`,
};

export const CLAUSULA_JORNADA: ClausulaModelo = {
  id: "jornada",
  titulo: "Da Jornada, das Horas Extras e do Intervalo entre Diárias",
  protege: "Define onde a diária acaba e a hora extra começa — e garante descanso entre dias seguidos.",
  texto: `A diária contratada compreende [JORNADA_DIARIA_HORAS] horas de trabalho, computadas do horário de chegada da equipe ao local designado até o encerramento das atividades, incluindo montagem e desmontagem de equipamento.

Parágrafo primeiro. Ultrapassada a jornada contratada, cada hora ou fração excedente será remunerada à razão de [VALOR_HORA_EXTRA] por profissional, com acréscimo de 50% (cinquenta por cento) sobre esse valor quando a prorrogação se der entre 22h e 6h, em domingos ou em feriados.

Parágrafo segundo. A prorrogação depende de anuência do CONTRATADO, que poderá recusá-la quando comprometer a segurança da operação, a integridade do material captado, o cumprimento de compromisso subsequente ou o intervalo de descanso previsto no parágrafo seguinte, sem que a recusa configure inadimplemento.

Parágrafo terceiro. Entre o encerramento de uma diária e o início da diária seguinte será observado intervalo mínimo de [INTERVALO_ENTRE_DIARIAS]. A supressão do intervalo por exigência da CONTRATANTE, quando aceita pelo CONTRATADO, importará no pagamento de adicional equivalente a 50% (cinquenta por cento) do valor da diária subsequente.

Parágrafo quarto. Atraso da CONTRATANTE, de seus prepostos, de talentos, de fornecedores ou de terceiros por ela convocados NÃO prorroga a jornada contratada: o tempo de espera é computado como tempo de trabalho, e a extensão do horário de término, se necessária, seguirá o regime de horas extras deste instrumento.`,
};

export const CLAUSULA_VIAGEM: ClausulaModelo = {
  id: "viagem",
  titulo: "Das Viagens, Hospedagem e Diárias de Deslocamento",
  opcional: true,
  protege: "Passagem, hotel e dia de viagem por conta do cliente, com padrão definido por escrito.",
  texto: `Quando a execução exigir pernoite fora da cidade-base, correrão por conta exclusiva da CONTRATANTE, sem qualquer repasse ao preço do serviço, as despesas de transporte, hospedagem, alimentação e translado local de toda a equipe do CONTRATADO.

Parágrafo primeiro. O transporte aéreo observará o padrão [PADRAO_TRANSPORTE_AEREO], com emissão de bilhetes com antecedência mínima de [PRAZO_ANTECEDENCIA_COMPRA] da data de embarque. A CONTRATANTE arcará com o custo de bagagem adicional destinada ao transporte de equipamento técnico, bem como com eventual taxa de excesso de peso.

Parágrafo segundo. A hospedagem observará o padrão [PADRAO_HOSPEDAGEM], vedada a acomodação compartilhada entre profissionais sem anuência escrita destes.

Parágrafo terceiro. Os dias destinados exclusivamente a deslocamento, ainda que sem captação, serão remunerados como diária de deslocamento, correspondente a 50% (cinquenta por cento) do valor da diária de execução, por profissional.

Parágrafo quarto. Equipamento técnico não será despachado como bagagem comum quando o CONTRATADO entender haver risco à sua integridade; nesta hipótese, a CONTRATANTE custeará o transporte em regime adequado ou o seguro correspondente.

Parágrafo quinto. Alterações de itinerário, remarcações e cancelamentos determinados pela CONTRATANTE, bem como as multas e diferenças tarifárias deles decorrentes, correrão por sua conta, assim como as diárias de agenda bloqueadas e não aproveitadas pelo CONTRATADO.`,
};

/* ==================================================================== */
/* OPERAÇÃO AÉREA E CONDIÇÕES DE CAMPO                                   */
/* ==================================================================== */

/**
 * A cláusula de drone.
 *
 * Ela existe para duas coisas ao mesmo tempo: colocar no papel que a operação
 * segue a regulamentação aeronáutica (ANAC, DECEA e ANATEL), e — o que
 * realmente protege o profissional — deixar escrito que o piloto pode SE
 * RECUSAR A VOAR sem que isso vire quebra de contrato. Sem esse parágrafo, o
 * cliente insiste no voo com vento de 50 km/h, o drone cai, e a discussão
 * sobre de quem é a culpa acontece depois do prejuízo.
 *
 * As normas são citadas nominalmente e com a ressalva "ou as que vierem a
 * substituí-las", porque a regulamentação de drones muda com frequência — o
 * RBAC nº 100 sucedeu o antigo RBAC-E nº 94, e o contrato não pode envelhecer
 * junto com a numeração.
 */
export const CLAUSULA_DRONE: ClausulaModelo = {
  id: "drone",
  titulo: "Da Operação com Aeronave Remotamente Pilotada (Drone)",
  opcional: true,
  protege: "Enquadra o voo na ANAC/DECEA e garante o direito de não decolar quando não é seguro.",
  texto: `A captação aérea, quando integrante do objeto, será realizada por meio de aeronave remotamente pilotada devidamente cadastrada perante a Agência Nacional de Aviação Civil sob o código [CODIGO_SISANT], operada por piloto remoto habilitado, [NOME_PILOTO_REMOTO], observada integralmente a regulamentação aeronáutica aplicável.

Parágrafo primeiro. A operação observará, no que couber: o Regulamento Brasileiro da Aviação Civil aplicável a aeronaves não tripuladas (RBAC nº 100, que sucedeu o RBAC-E nº 94), o cadastro da aeronave no SISANT, as normas do Departamento de Controle do Espaço Aéreo — DECEA, notadamente a ICA 100-40, com solicitação de acesso ao espaço aéreo pelo sistema SARPAS quando exigível, a homologação do equipamento perante a ANATEL, bem como as demais normas expedidas pelos órgãos reguladores do tráfego aéreo, ou aquelas que venham a substituí-las.

Parágrafo segundo. A CONTRATANTE declara ciência de que determinadas áreas são de voo restrito, condicionado ou proibido — notadamente as proximidades de aeródromos, heliportos, unidades militares, presídios, usinas, hospitais com helipontos, áreas de proteção ambiental e locais sob restrição temporária — e que a autorização de acesso ao espaço aéreo é ato discricionário da autoridade competente, podendo ser negada, condicionada ou revogada, inclusive na véspera ou no próprio dia da operação, sem que disso decorra qualquer responsabilidade do CONTRATADO.

Parágrafo terceiro. A solicitação de autorização será protocolada com antecedência mínima de [PRAZO_AUTORIZACAO_DRONE] da data prevista, desde que a CONTRATANTE informe local exato, data, horário e finalidade com pelo menos 5 (cinco) dias úteis de antecedência do protocolo. Informação prestada a menor tempo, ou alteração de local após o protocolo, transfere à CONTRATANTE o risco integral da não obtenção da autorização.

Parágrafo quarto. NÃO SERÁ REALIZADA DECOLAGEM, sendo o voo cancelado ou interrompido a qualquer tempo, nas hipóteses de: chuva, neblina, cerração ou visibilidade reduzida; vento sustentado ou rajada superior a [VELOCIDADE_MAXIMA_VENTO] km/h; descargas atmosféricas ou tempestade em formação a distância que o piloto repute insegura; interferência eletromagnética, perda de sinal ou instabilidade de telemetria; presença de aglomeração de pessoas não anuentes sob a rota de voo; proximidade de redes elétricas, cabos, torres, guindastes ou obstáculos não mapeados; presença de aeronave tripulada nas imediações; ou qualquer outra circunstância que, a critério técnico e exclusivo do piloto remoto, comprometa a segurança de pessoas, bens ou da aeronave.

Parágrafo quinto. A decisão de não decolar ou de interromper o voo é PRERROGATIVA TÉCNICA E INDELEGÁVEL do piloto remoto, não configura descumprimento contratual, não gera direito a abatimento, desconto, multa, reexecução gratuita ou indenização em favor da CONTRATANTE, e prevalece sobre qualquer orientação, insistência ou pressão desta ou de seus prepostos.

Parágrafo sexto. Impossibilitada a captação aérea por qualquer das causas acima, as partes acordarão nova data para a execução exclusiva do módulo aéreo, correndo por conta da CONTRATANTE as despesas de novo deslocamento e a diária correspondente. Não havendo interesse na remarcação, o valor destacado para o módulo aéreo será restituído à CONTRATANTE, deduzidos os custos já incorridos, permanecendo íntegro o restante do contrato.

Parágrafo sétimo. A CONTRATANTE responde pela veracidade das informações que prestar sobre o local, pela obtenção da autorização do proprietário ou possuidor da área sobrevoada e pela anuência das pessoas presentes, respondendo regressivamente perante o CONTRATADO por qualquer autuação, embargo, multa ou pretensão de terceiro decorrente de informação falsa, omissa ou desatualizada.

Parágrafo oitavo. Determinando a CONTRATANTE, por escrito, a realização de voo em desacordo com a regulamentação ou com a recomendação técnica do piloto, o CONTRATADO recusará a execução; a insistência caracteriza justa causa para rescisão imediata por culpa da CONTRATANTE, com os efeitos da cláusula Da Rescisão.`,
};

export const CLAUSULA_CONDICOES_CLIMATICAS: ClausulaModelo = {
  id: "condicoes_climaticas",
  titulo: "Das Condições Climáticas e da Segurança em Campo",
  protege: "Chuva, tempestade e local inseguro não viram culpa sua nem serviço refeito de graça.",
  texto: `As captações em ambiente externo estão sujeitas às condições meteorológicas do dia e do local, fato alheio à vontade e ao controle das partes.

Parágrafo primeiro. Sobrevindo chuva, tempestade, descarga atmosférica, vendaval, granizo, calor ou frio extremos, alagamento, fumaça densa, qualidade do ar comprometida ou qualquer condição que coloque em risco a integridade física da equipe, de terceiros ou do equipamento, o CONTRATADO poderá suspender ou interromper a execução, sem que isso configure inadimplemento.

Parágrafo segundo. A suspensão por condição climática não gera direito a desconto, restituição, multa ou reexecução gratuita. As partes acordarão nova data, correndo por conta da CONTRATANTE as despesas de novo deslocamento e a diária correspondente, salvo se a própria CONTRATANTE houver contratado dia de contingência, hipótese em que este será utilizado sem custo adicional.

Parágrafo terceiro. Cabe à CONTRATANTE indicar plano B de locação coberta sempre que a execução depender de condição climática favorável; a ausência de plano B é risco assumido por ela.

Parágrafo quarto. O CONTRATADO poderá recusar a execução em local que apresente risco concreto à segurança — instabilidade estrutural, ausência de saída de emergência, superlotação, obra em andamento sem isolamento, altura sem proteção, animais soltos, ausência de aterramento elétrico, tumulto ou conflito em curso — sem prejuízo do direito à remuneração da diária mobilizada.

Parágrafo quinto. Em execuções realizadas em meio a público, a CONTRATANTE providenciará área delimitada de trabalho, controle de acesso e, quando necessário, apoio de segurança, respondendo por danos que a ausência dessas providências causar à equipe ou ao equipamento.`,
};

export const CLAUSULA_EQUIPAMENTO_E_SEGURO: ClausulaModelo = {
  id: "equipamento_seguro",
  titulo: "Do Equipamento, do Risco e do Seguro",
  protege: "Quem danificar seu equipamento paga por ele, e a falha de um item não derruba o contrato.",
  texto: `O CONTRATADO executará os serviços com equipamento próprio ou locado, mantido em condições adequadas de uso e conservação, cabendo-lhe a escolha técnica dos meios, marcas e modelos empregados, desde que atendido o resultado contratado.

Parágrafo primeiro. Danos, extravios ou subtrações de equipamento do CONTRATADO causados pela CONTRATANTE, por seus prepostos, convidados, talentos, fornecedores ou pelo público presente serão integralmente ressarcidos por aquela, pelo valor de reposição do bem por outro de igual espécie e qualidade, acrescido do custo de locação de equipamento substituto pelo período necessário à reposição.

Parágrafo segundo. Ocorrendo falha, avaria ou perda de equipamento por caso fortuito durante a execução, o CONTRATADO envidará seus melhores esforços para substituí-lo de imediato, mediante equipamento reserva ou locação emergencial; frustrada a substituição, a execução será remarcada sem ônus adicional para a CONTRATANTE, limitando-se a responsabilidade do CONTRATADO ao disposto na cláusula Da Limitação de Responsabilidade.

Parágrafo terceiro. A contratação de seguro específico exigido pela locação, pelo evento ou pela CONTRATANTE, bem como a emissão de certificados, ART, laudos ou documentos de acesso, correrá por conta desta.`,
};

/* ==================================================================== */
/* ENTREGA, BACKUP E GUARDA                                              */
/* ==================================================================== */

export const CLAUSULA_ENTREGA: ClausulaModelo = {
  id: "entrega",
  titulo: "Da Entrega e dos Formatos",
  protege: "Define o que é entrega válida e a partir de quando o prazo está cumprido.",
  texto: `A entrega será realizada por meio digital, mediante disponibilização de link de acesso ou transferência de arquivos, nos formatos, resoluções e proporções descritos na cláusula Do Objeto.

Parágrafo primeiro. Considera-se cumprida a obrigação de entregar no momento da disponibilização do link ou do arquivo à CONTRATANTE, no canal oficial previsto neste contrato, independentemente de a CONTRATANTE efetuar o download naquele momento.

Parágrafo segundo. Salvo previsão expressa na cláusula Do Objeto, NÃO integram a entrega: arquivos brutos de captação, projetos editáveis, camadas, timelines, presets, LUTs, arquivos de projeto de edição, matrizes vetoriais de trabalho, bancos de material não utilizado e demais elementos de processo, que constituem instrumento de trabalho do CONTRATADO. A sua cessão, quando desejada, será objeto de negociação e preço apartados.

Parágrafo terceiro. Entrega em mídia física, hospedagem em plataforma da CONTRATANTE, conversão para formatos não previstos, legendagem, closed caption, versionamento por canal e adequação a especificações técnicas de veículos ou plataformas de terceiros somente serão realizadas se expressamente contratadas.

Parágrafo quarto. Recebido o material, a CONTRATANTE deverá conferi-lo e comunicar qualquer vício aparente no prazo de [PRAZO_APROVACAO_CLIENTE], findo o qual o recebimento será tido por regular e definitivo.`,
};

/**
 * A cláusula do backup — pedida explicitamente e por bom motivo: o cliente
 * perde o arquivo meses depois e volta cobrando do profissional como se ele
 * fosse um serviço de armazenamento vitalício e gratuito. Aqui a guarda passa
 * a ser dele na entrega, mas fica aberta uma porta paga: se ainda existir
 * cópia, recupera-se mediante taxa.
 */
export const CLAUSULA_BACKUP: ClausulaModelo = {
  id: "backup",
  titulo: "Do Backup, da Guarda e da Recuperação de Arquivos",
  protege: "Depois da entrega a guarda é do cliente — e reenvio de arquivo perdido é serviço cobrado.",
  texto: `A CONTRATANTE é a única e exclusiva responsável pela guarda, pelo armazenamento e pela realização de cópias de segurança do material que lhe for entregue, a partir do momento da entrega.

Parágrafo primeiro. O CONTRATADO manterá, por mera liberalidade e como cortesia, cópia de segurança do material entregue pelo prazo de [PRAZO_MINIMO_GUARDA_BACKUP] contados da entrega, findo o qual poderá eliminá-la definitivamente, independentemente de aviso, sem que disso decorra qualquer responsabilidade.

Parágrafo segundo. Dentro do prazo do parágrafo anterior, e desde que a cópia ainda exista e esteja íntegra, a CONTRATANTE poderá solicitar nova disponibilização do material, mediante pagamento da taxa de recuperação e reenvio no valor de [VALOR_TAXA_REENVIO], destinada a custear a recuperação de mídias, o tempo técnico e a transferência.

Parágrafo terceiro. O CONTRATADO NÃO garante a existência, a integridade ou a legibilidade de cópias após o prazo de cortesia, nem responde por perda de material decorrente de falha de mídia, corrupção de arquivo, obsolescência tecnológica, sinistro, furto, falha de terceiro prestador de serviço de nuvem ou qualquer outro evento alheio ao seu controle.

Parágrafo quarto. Arquivos brutos de captação, quando não integrantes da entrega, poderão ser eliminados pelo CONTRATADO após [PRAZO_MINIMO_GUARDA_BACKUP] da aprovação final, salvo contratação apartada de guarda estendida.

Parágrafo quinto. A entrega de qualquer material mediante link de acesso temporário obriga a CONTRATANTE a realizar o download integral e a constituir os próprios backups dentro do prazo de validade do link, sendo de sua exclusiva responsabilidade a perda de acesso por expiração.`,
};

/* ==================================================================== */
/* PROPRIEDADE INTELECTUAL E IMAGEM                                      */
/* ==================================================================== */

export const CLAUSULA_DIREITOS_AUTORAIS: ClausulaModelo = {
  id: "direitos_autorais",
  titulo: "Dos Direitos Autorais e da Licença de Uso",
  essencial: true,
  protege: "Você licencia o uso, não entrega a autoria — e uso fora do combinado tem preço.",
  texto: `A obra resultante deste contrato é protegida pela Lei nº 9.610/1998. Os direitos morais de autor são inalienáveis e irrenunciáveis, permanecendo integralmente com o CONTRATADO e com os demais autores envolvidos, na forma da lei.

Parágrafo primeiro. Mediante o pagamento integral do preço avençado, o CONTRATADO concede à CONTRATANTE licença de uso da obra final, nos limites de finalidade, território, mídias e prazo descritos na cláusula Do Objeto. A licença é onerosa, e a sua eficácia fica CONDICIONADA À QUITAÇÃO INTEGRAL: enquanto houver parcela em aberto, a CONTRATANTE não está autorizada a veicular, publicar, exibir ou explorar a obra, sob qualquer forma ou meio.

Parágrafo segundo. Salvo estipulação expressa em contrário na cláusula Do Objeto, a licença é NÃO EXCLUSIVA e não compreende: cessão ou sublicenciamento a terceiros, inclusive a empresas do mesmo grupo econômico, franqueados, distribuidores, revendedores e parceiros comerciais; veiculação em mídia paga; uso em campanha diversa daquela para a qual a obra foi produzida; revenda; licenciamento a bancos de imagem; uso para treinamento, ajuste fino ou alimentação de sistemas de inteligência artificial; nem a criação de obras derivadas.

Parágrafo terceiro. É vedada à CONTRATANTE a modificação, o recorte, a recoloração, a sobreposição, a remontagem, a alteração de trilha, a mutilação ou qualquer outra forma de deformação da obra que possa atingir a honra ou a reputação do autor, salvo adaptações de formato expressamente autorizadas por escrito.

Parágrafo quarto. O uso da obra fora dos limites licenciados sujeita a CONTRATANTE ao pagamento de indenização correspondente a 3 (três) vezes o valor de mercado da licença que seria devida para o uso efetivamente praticado, apurado por arbitramento, sem prejuízo da cessação imediata do uso, das perdas e danos e das medidas judiciais cabíveis.

Parágrafo quinto. Findo o prazo de licença, a CONTRATANTE promoverá, no prazo de 15 (quinze) dias, a retirada da obra de todos os meios sob seu controle, respondendo pelo uso posterior.

Parágrafo sexto. A CONTRATANTE se obriga a consignar o crédito autoral do CONTRATADO nas veiculações em que o formato o comportar, na forma usual do mercado.`,
};

export const CLAUSULA_DIREITO_DE_IMAGEM: ClausulaModelo = {
  id: "direito_de_imagem",
  titulo: "Do Direito de Imagem e das Autorizações de Terceiros",
  essencial: true,
  protege: "Transfere ao cliente a responsabilidade por liberar imagem, marca, música e local.",
  texto: `Cabe exclusivamente à CONTRATANTE obter, antes do início da execução, e manter arquivadas, todas as autorizações de uso de imagem, voz e nome das pessoas retratadas, na forma do art. 20 do Código Civil e do art. 5º, incisos V e X, da Constituição Federal, inclusive as de menores de idade, firmadas por seus representantes legais.

Parágrafo primeiro. Cabe igualmente à CONTRATANTE obter as autorizações relativas a: uso de locação e de propriedade privada; uso de marcas, logotipos, personagens, embalagens e produtos de terceiros; uso de obras musicais, fonogramas, obras de arte, cenografia, mobiliário de design e projetos arquitetônicos protegidos; e recolhimento de direitos autorais e conexos perante o ECAD ou entidades equivalentes, quando devidos.

Parágrafo segundo. A CONTRATANTE declara, sob as penas da lei, que as pessoas a serem retratadas estão cientes e anuentes com a captação e com a destinação do material, e que não há vedação judicial, contratual ou administrativa a essa utilização.

Parágrafo terceiro. O CONTRATADO NÃO responde, em nenhuma hipótese, por reclamação, notificação, ação judicial, medida cautelar, remoção de conteúdo ou sanção decorrente da ausência, da insuficiência ou da invalidade de qualquer das autorizações acima, obrigando-se a CONTRATANTE a assumir o polo passivo da demanda, a requerer a exclusão do CONTRATADO da lide e a ressarci-lo integralmente por custas, honorários advocatícios, condenações e prejuízos, inclusive de imagem.

Parágrafo quarto. Verificando o CONTRATADO, a qualquer tempo, indício de ausência de autorização, poderá suspender a captação ou a entrega até a comprovação documental, sem que a suspensão configure atraso de sua parte.`,
};

export const CLAUSULA_PORTFOLIO: ClausulaModelo = {
  id: "portfolio",
  titulo: "Do Uso em Portfólio e da Divulgação Profissional",
  protege: "Garante o direito de mostrar o trabalho — e cobra caro de quem quer proibir.",
  texto: `A CONTRATANTE autoriza o CONTRATADO, em caráter gratuito, irrevogável e por prazo indeterminado, a utilizar a obra produzida, no todo ou em parte, bem como imagens dos bastidores da produção, para fins exclusivos de divulgação do seu próprio trabalho — portfólio, site, redes sociais, apresentações comerciais, propostas, inscrição em festivais, prêmios e mostras, material de imprensa e ensino.

Parágrafo primeiro. O uso a que se refere o caput observará a mesma classificação de sigilo do material e não incluirá dados sensíveis, informações estratégicas, resultados financeiros ou qualquer conteúdo protegido pela cláusula Da Confidencialidade.

Parágrafo segundo. Havendo interesse da CONTRATANTE em postergar a divulgação, poderá ser pactuado embargo temporário, mediante comunicação escrita indicando a data de liberação, que não poderá exceder 12 (doze) meses contados da entrega.

Parágrafo terceiro. A vedação DEFINITIVA ao uso em portfólio, por interesse da CONTRATANTE, será admitida mediante o pagamento de sobrepreço de sigilo no valor de [VALOR_EMBARGO_PORTFOLIO], pactuado por escrito, dado que a impossibilidade de exibir o trabalho realizado subtrai do CONTRATADO parte relevante do seu retorno profissional.

Parágrafo quarto. Nada neste contrato impede o CONTRATADO de mencionar, factualmente e sem revelar conteúdo sigiloso, a existência da relação profissional com a CONTRATANTE.`,
};

/* ==================================================================== */
/* SIGILO E DADOS                                                        */
/* ==================================================================== */

export const CLAUSULA_CONFIDENCIALIDADE: ClausulaModelo = {
  id: "confidencialidade",
  titulo: "Da Confidencialidade",
  protege: "NDA recíproco, com prazo, exceções claras e multa em valor certo.",
  texto: `As partes obrigam-se, reciprocamente, a manter em absoluto sigilo toda informação confidencial a que tiverem acesso em razão deste contrato, pelo prazo de sua vigência e por mais [PRAZO_CONFIDENCIALIDADE] contados do seu término, qualquer que seja o motivo da extinção.

Parágrafo primeiro. Considera-se informação confidencial, independentemente de estar assim rotulada: estratégias comerciais e de comunicação, lançamentos e datas não divulgadas, produtos e serviços não lançados, preços, margens, custos, tabelas, propostas, contratos, resultados, métricas, bases de clientes e de leads, dados de campanhas, senhas e acessos, roteiros, conceitos criativos, material captado e não divulgado, e a própria negociação entre as partes.

Parágrafo segundo. Não se sujeitam ao dever de sigilo as informações que: (i) já fossem de domínio público na data da revelação, ou nele ingressarem sem culpa da parte receptora; (ii) já estivessem legitimamente na posse da parte receptora, comprovadamente, antes da revelação; (iii) forem desenvolvidas de forma independente, sem uso da informação confidencial; ou (iv) tiverem de ser reveladas por determinação legal, judicial ou de autoridade competente, hipótese em que a parte receptora comunicará imediatamente a outra, quando lícito fazê-lo, e limitará a revelação ao estritamente exigido.

Parágrafo terceiro. Cada parte responde pelos atos de seus sócios, empregados, prepostos, subcontratados e prestadores, obrigando-se a estender-lhes o dever de sigilo por instrumento equivalente.

Parágrafo quarto. A violação do dever de sigilo sujeita a parte infratora ao pagamento de multa não compensatória de [MULTA_CONFIDENCIALIDADE], sem prejuízo da apuração de perdas e danos que a excederem e das medidas judiciais cabíveis, inclusive de natureza inibitória.

Parágrafo quinto. Extinto o contrato, cada parte devolverá ou destruirá, mediante confirmação escrita, o material confidencial da outra em seu poder, ressalvadas as cópias de backup de retenção automática e aquelas cuja guarda seja exigida por lei ou necessária à defesa de direitos.`,
};

export const CLAUSULA_LGPD: ClausulaModelo = {
  id: "lgpd",
  titulo: "Da Proteção de Dados Pessoais",
  protege: "Delimita o papel de cada um sob a LGPD e afasta responsabilidade pela base do cliente.",
  texto: `As partes obrigam-se a observar a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais) no tratamento de dados pessoais a que tiverem acesso em razão deste contrato.

Parágrafo primeiro. A CONTRATANTE atua como CONTROLADORA dos dados pessoais de seus clientes, leads, colaboradores e demais titulares, cabendo-lhe definir as finalidades e os meios do tratamento, assegurar base legal adequada, prestar informação aos titulares e atender às requisições destes e da autoridade nacional.

Parágrafo segundo. O CONTRATADO atua como OPERADOR, tratando os dados exclusivamente conforme as instruções documentadas da CONTRATANTE e na estrita medida necessária à execução deste contrato, obrigando-se a adotar medidas técnicas e administrativas de segurança compatíveis, a não compartilhar dados com terceiros sem instrução escrita, e a eliminá-los ou devolvê-los ao término do tratamento, ressalvadas as hipóteses legais de conservação.

Parágrafo terceiro. A CONTRATANTE responde exclusivamente pela licitude da origem das bases de dados que fornecer e pela existência de consentimento ou outra base legal adequada, respondendo regressivamente perante o CONTRATADO por qualquer sanção, indenização ou despesa decorrente de vício nessa origem.

Parágrafo quarto. Havendo incidente de segurança envolvendo dados tratados em razão deste contrato, a parte que dele tomar conhecimento comunicará a outra em até 48 (quarenta e oito) horas, colaborando na apuração, na mitigação e no cumprimento dos deveres legais de comunicação.

Parágrafo quinto. O acesso a perfis, plataformas e ferramentas da CONTRATANTE dar-se-á, sempre que tecnicamente possível, por credenciais individuais e revogáveis, vedado o compartilhamento de senha pessoal; a CONTRATANTE se obriga a revogar os acessos concedidos em até 5 (cinco) dias úteis do término do contrato.`,
};

/* ==================================================================== */
/* DINHEIRO: PAGAMENTO, INADIMPLEMENTO, RESCISÃO                         */
/* ==================================================================== */

export const CLAUSULA_PAGAMENTO: ClausulaModelo = {
  id: "pagamento",
  titulo: "Do Preço, das Condições de Pagamento e do Inadimplemento",
  essencial: true,
  protege: "Juros, multa, correção e — o que mais funciona — suspensão da entrega e da licença.",
  texto: `Pela prestação dos serviços descritos na cláusula Do Objeto, a CONTRATANTE pagará ao CONTRATADO o valor total de [VALOR_DO_SERVIÇO], nas seguintes condições: [CONDICOES_DE_PAGAMENTO].

Parágrafo primeiro. O sinal, quando previsto, destina-se à reserva de agenda e ao custeio da mobilização inicial, tendo natureza de princípio de pagamento e confirmação do negócio, e não será restituído em caso de desistência da CONTRATANTE, ressalvado o disposto na cláusula Da Rescisão.

Parágrafo segundo. O atraso no pagamento de qualquer parcela sujeita a CONTRATANTE, independentemente de notificação, a: multa moratória de 2% (dois por cento) sobre o valor em atraso; juros de mora de 1% (um por cento) ao mês, pro rata die; e correção monetária pelo [INDICE_DE_CORRECAO] desde o vencimento até o efetivo pagamento.

Parágrafo terceiro. O atraso superior a 10 (dez) dias autoriza o CONTRATADO, independentemente de interpelação e sem que isso configure inadimplemento de sua parte, a SUSPENDER a execução dos serviços, a retenção da entrega do material pendente e a suspensão da eficácia da licença de uso já concedida, ficando a CONTRATANTE obrigada a cessar imediatamente qualquer veiculação em curso.

Parágrafo quarto. O atraso superior a 30 (trinta) dias autoriza o CONTRATADO a considerar antecipadamente vencidas todas as demais parcelas, a rescindir o contrato por justa causa e a promover a cobrança pelos meios cabíveis, inclusive protesto do título, inscrição em cadastros de inadimplentes e execução, valendo este instrumento, assinado pelas partes, como TÍTULO EXECUTIVO EXTRAJUDICIAL, na forma do art. 784, inciso III, do Código de Processo Civil.

Parágrafo quinto. Os valores previstos neste contrato não incluem tributos incidentes sobre a operação que sejam de responsabilidade da CONTRATANTE, nem taxas de intermediação financeira, de parcelamento ou de conversão cambial, que a esta serão repassadas.

Parágrafo sexto. Contratos de execução continuada por prazo superior a 12 (doze) meses terão os valores reajustados anualmente pela variação acumulada do [INDICE_DE_CORRECAO], ou por outro índice que venha a substituí-lo.

Parágrafo sétimo. A tolerância de qualquer das partes quanto ao descumprimento de obrigação da outra constitui mera liberalidade e não importa em novação, renúncia, alteração contratual ou precedente exigível.`,
};

export const CLAUSULA_RESCISAO: ClausulaModelo = {
  id: "rescisao",
  titulo: "Da Rescisão e das Penalidades",
  essencial: true,
  protege: "Saída ordenada, com aviso prévio e multa — e desistir na véspera custa caro.",
  texto: `O presente contrato poderá ser rescindido: (i) por acordo entre as partes, formalizado por escrito; (ii) imotivadamente, por qualquer das partes, mediante aviso prévio escrito de [PRAZO_AVISO_RESCISAO]; ou (iii) por justa causa, imediatamente, na hipótese de descumprimento de obrigação essencial não sanado no prazo de 10 (dez) dias contados da notificação escrita.

Parágrafo primeiro. Em qualquer hipótese de rescisão, serão devidos ao CONTRATADO: os valores correspondentes às etapas executadas, ainda que não entregues; os custos comprovadamente incorridos com terceiros, locações, deslocamentos e reservas não canceláveis; e as diárias de agenda já bloqueadas e não realocáveis.

Parágrafo segundo. A rescisão imotivada promovida pela CONTRATANTE, ou a rescisão por justa causa a ela imputável, sujeita-a ao pagamento de multa rescisória de [PERCENTUAL_MULTA_RESCISORIA]% incidente sobre o saldo remanescente do contrato, além dos valores do parágrafo anterior, a título de compensação pela desmobilização, pela recusa de outras contratações no período reservado e pela frustração da expectativa contratual.

Parágrafo terceiro. A rescisão imotivada promovida pelo CONTRATADO obriga-o a entregar à CONTRATANTE o material referente às etapas já quitadas, no estado em que se encontrar, e a restituir os valores recebidos por etapas não iniciadas, sem outras penalidades.

Parágrafo quarto. Constituem justa causa para a rescisão imediata pelo CONTRATADO, sem prejuízo da multa do parágrafo segundo: o inadimplemento na forma da cláusula Do Preço; a exigência de conduta ilícita, antiética ou contrária à regulamentação aplicável; o tratamento desrespeitoso, discriminatório, assediador ou intimidatório dirigido ao CONTRATADO ou à sua equipe; a violação do dever de sigilo; e o uso da obra fora dos limites licenciados.

Parágrafo quinto. A rescisão não afeta as obrigações de confidencialidade, de proteção de dados, de limitação de uso da obra, de não aliciamento e de foro, que sobrevivem ao término do contrato pelos prazos nelas previstos.

Parágrafo sexto. Rescindido o contrato por culpa da CONTRATANTE, a licença de uso da obra fica automaticamente revogada quanto às etapas não quitadas, obrigando-se a CONTRATANTE a cessar a veiculação correspondente em até 5 (cinco) dias.`,
};

export const CLAUSULA_LIMITACAO_RESPONSABILIDADE: ClausulaModelo = {
  id: "limitacao_responsabilidade",
  titulo: "Da Limitação de Responsabilidade e da Indenização",
  protege: "Põe teto no que você pode ser cobrado e afasta lucro cessante e dano indireto.",
  texto: `A obrigação assumida pelo CONTRATADO é de MEIO quanto ao desempenho comercial, ao alcance, ao engajamento, à conversão, à repercussão pública e a quaisquer resultados de mercado, e de RESULTADO exclusivamente quanto à entrega do material descrito na cláusula Do Objeto, nas condições ali pactuadas.

Parágrafo primeiro. A responsabilidade total do CONTRATADO por qualquer perda, dano ou prejuízo decorrente deste contrato, seja qual for o fundamento, fica limitada ao valor efetivamente recebido pela etapa que houver dado causa ao evento, e, em qualquer caso, ao valor total deste contrato.

Parágrafo segundo. O CONTRATADO não responde por danos indiretos, lucros cessantes, perda de chance, danos de imagem, perda de faturamento, custos de recall ou de reposicionamento, ainda que previsíveis.

Parágrafo terceiro. O CONTRATADO não responde por: falhas, instabilidades, mudanças de política, bloqueios, quedas de alcance, suspensões ou banimentos praticados por plataformas de terceiros; alterações de algoritmo; comportamento do público; decisões editoriais, comerciais ou de posicionamento da CONTRATANTE; nem por informações, dados ou materiais por esta fornecidos.

Parágrafo quarto. A CONTRATANTE obriga-se a indenizar e a manter indene o CONTRATADO de toda e qualquer reclamação, autuação, notificação extrajudicial, ação judicial ou arbitral, custas, honorários e condenações decorrentes de: ausência de autorizações de terceiros; uso da obra fora dos limites licenciados; conteúdo, alegação publicitária ou informação por ela fornecida; irregularidade de sua atividade, produto ou serviço; e violação de direito de terceiro.

Parágrafo quinto. As limitações deste instrumento não se aplicam às hipóteses de dolo ou de culpa grave devidamente comprovados.`,
};

/* ==================================================================== */
/* RELAÇÃO ENTRE AS PARTES E FECHAMENTO                                  */
/* ==================================================================== */

export const CLAUSULA_FORCA_MAIOR: ClausulaModelo = {
  id: "forca_maior",
  titulo: "Do Caso Fortuito e da Força Maior",
  protege: "Suspende obrigações no imprevisível sem transformar o profissional em devedor.",
  texto: `Nenhuma das partes responderá pelo descumprimento de obrigação decorrente de caso fortuito ou de força maior, na forma do art. 393 do Código Civil, aí compreendidos, exemplificativamente: eventos da natureza, calamidade pública, epidemia ou pandemia e as medidas restritivas correspondentes, guerra, comoção civil, greve geral, interdição de vias, falta prolongada de energia elétrica ou de conectividade, ato de autoridade e falha grave de infraestrutura de terceiros.

Parágrafo primeiro. A parte afetada comunicará à outra, em até 48 (quarenta e oito) horas, a ocorrência e os seus efeitos previsíveis sobre o cronograma, propondo, sempre que possível, alternativa de execução.

Parágrafo segundo. As obrigações ficarão suspensas enquanto perdurar o evento, retomando-se o cronograma pelo saldo remanescente. Perdurando o impedimento por mais de 60 (sessenta) dias, qualquer das partes poderá resolver o contrato, hipótese em que serão devidos ao CONTRATADO os valores das etapas executadas e os custos comprovadamente incorridos, sem multa a qualquer título.

Parágrafo terceiro. Doença, acidente ou impedimento pessoal grave do CONTRATADO ou de integrante essencial da sua equipe autoriza a substituição por profissional de qualificação equivalente ou a remarcação da execução, sem penalidade, comunicada a CONTRATANTE tão logo seja possível.`,
};

export const CLAUSULA_EQUIPE_E_SUBCONTRATACAO: ClausulaModelo = {
  id: "equipe_subcontratacao",
  titulo: "Da Equipe, da Subcontratação e da Ausência de Vínculo",
  protege: "Deixa claro que não há vínculo empregatício e libera o uso de equipe de apoio.",
  texto: `O CONTRATADO executará os serviços com autonomia técnica, sem subordinação, pessoalidade obrigatória ou controle de jornada por parte da CONTRATANTE, inexistindo entre as partes, ou entre a CONTRATANTE e os prepostos do CONTRATADO, qualquer vínculo empregatício, societário, de representação, de agência ou de consórcio.

Parágrafo primeiro. O CONTRATADO poderá valer-se de assistentes, operadores, editores, colaboradores e demais profissionais de apoio, próprios ou subcontratados, permanecendo integralmente responsável perante a CONTRATANTE pela qualidade e pelo cumprimento do objeto, e respondendo pelos encargos trabalhistas, previdenciários e fiscais dessas relações.

Parágrafo segundo. Cada parte responde exclusivamente pelos tributos e encargos incidentes sobre a sua própria atividade, obrigando-se a manter a outra indene de qualquer cobrança nesse sentido.

Parágrafo terceiro. A CONTRATANTE não dirigirá ordens diretas aos prepostos do CONTRATADO, canalizando toda demanda por meio deste ou de quem por ele indicado.`,
};

export const CLAUSULA_NAO_ALICIAMENTO: ClausulaModelo = {
  id: "nao_aliciamento",
  titulo: "Da Não Contratação Direta da Equipe",
  opcional: true,
  protege: "Impede que o cliente contrate por fora a equipe que você apresentou a ele.",
  texto: `Durante a vigência deste contrato e por [PRAZO_NAO_ALICIAMENTO] após o seu término, a CONTRATANTE obriga-se a não contratar, direta ou indiretamente, por si, por empresa do seu grupo, por interposta pessoa ou por intermédio de terceiro, qualquer profissional, fornecedor, talento ou prestador que lhe tenha sido apresentado pelo CONTRATADO em razão deste contrato, para a execução de serviços da mesma natureza, sem a anuência escrita deste.

Parágrafo primeiro. A vedação abrange a contratação sob qualquer regime — emprego, prestação de serviços, pessoa jurídica, freelance ou estágio — e a mera intermediação para que a contratação se dê por terceiro.

Parágrafo segundo. A infração ao disposto nesta cláusula sujeita a CONTRATANTE ao pagamento de multa não compensatória no valor de [MULTA_ALICIAMENTO] por profissional aliciado, sem prejuízo das perdas e danos que a excederem.

Parágrafo terceiro. Não caracteriza infração a contratação de profissional que já mantinha relação comercial comprovada e anterior com a CONTRATANTE, ou que tenha se candidatado espontaneamente a processo seletivo público desta.`,
};

export const CLAUSULA_COMUNICACOES: ClausulaModelo = {
  id: "comunicacoes",
  titulo: "Das Comunicações entre as Partes",
  protege: "Define o canal válido — e acaba com a aprovação combinada por áudio que ninguém acha depois.",
  texto: `Todas as comunicações relativas a este contrato — aprovações, apontamentos, solicitações, notificações, orçamentos de escopo adicional e avisos de rescisão — serão realizadas por escrito e endereçadas aos seguintes canais oficiais: para o CONTRATADO, [EMAIL_OFICIAL_CONTRATADO]; para a CONTRATANTE, [EMAIL_OFICIAL_CLIENTE].

Parágrafo primeiro. Mensagens trocadas por aplicativos de mensageria instantânea, quando partirem dos números informados pelas partes, produzem efeito para fins de aprovação e de instrução operacional, ressalvadas as notificações de rescisão e de constituição em mora, que exigirão comunicação por escrito com comprovante de recebimento.

Parágrafo segundo. Mensagens de voz NÃO constituem aprovação válida, salvo se confirmadas por escrito no canal oficial, dada a impossibilidade prática de arquivamento e conferência posterior.

Parágrafo terceiro. Presume-se recebida a comunicação eletrônica enviada ao canal oficial que não retorne erro de entrega, contando-se os prazos do primeiro dia útil seguinte ao envio.

Parágrafo quarto. A alteração de canal oficial somente produz efeitos após comunicação escrita à outra parte.`,
};

export const CLAUSULA_DISPOSICOES_FINAIS: ClausulaModelo = {
  id: "disposicoes_finais",
  titulo: "Das Disposições Finais e do Foro",
  essencial: true,
  protege: "Fecha o contrato: forma escrita para mudanças, título executivo e foro definido.",
  texto: `Este instrumento constitui o acordo integral entre as partes quanto ao seu objeto, substituindo quaisquer tratativas, propostas, mensagens ou ajustes verbais anteriores, e somente poderá ser alterado por termo aditivo escrito e assinado por ambas.

Parágrafo primeiro. A eventual nulidade ou ineficácia de qualquer cláusula não prejudicará as demais, que permanecerão em pleno vigor, obrigando-se as partes a substituir a disposição viciada por outra de efeito econômico equivalente.

Parágrafo segundo. As partes reconhecem a validade e a eficácia da assinatura eletrônica deste instrumento, na forma do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001, sendo suficiente, para a sua comprovação, o registro eletrônico de autoria, data, hora e endereço IP mantido pela plataforma utilizada, ainda que sem certificado ICP-Brasil, o que desde já convencionam como meio idôneo de prova.

Parágrafo terceiro. Este contrato obriga as partes, seus herdeiros e sucessores a qualquer título, e constitui título executivo extrajudicial, na forma do art. 784, inciso III, do Código de Processo Civil.

Parágrafo quarto. É vedada a cessão da posição contratual por qualquer das partes sem anuência escrita da outra.

Parágrafo quinto. As partes elegem o foro da comarca de [FORO_COMARCA] para dirimir as controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justas e contratadas, firmam o presente instrumento, em via eletrônica, para que produza os seus jurídicos e legais efeitos.

[FORO_COMARCA], [DATA_ASSINATURA].


_______________________________________
[NOME_DO_CLIENTE]
CPF/CNPJ [CPF_CNPJ_CLIENTE]
CONTRATANTE


_______________________________________
[NOME_CONTRATADO]
CPF/CNPJ [CPF_CNPJ_CONTRATADO]
CONTRATADO`,
};

/** Muda o id de uma cláusula reaproveitada, quando o modelo precisa de duas variações dela. */
export function comId(clausula: ClausulaModelo, id: string): ClausulaModelo {
  return { ...clausula, id };
}

/** Devolve a cláusula com `opcional` ligado ou desligado — mesma redação, outro padrão de marcação. */
export function comoOpcional(clausula: ClausulaModelo, opcional = true): ClausulaModelo {
  return { ...clausula, opcional };
}

/* ==================================================================== */
/* EQUILÍBRIO: O QUE O CLIENTE TAMBÉM LEVA                               */
/* ==================================================================== */

/**
 * Um contrato que só protege um lado não é forte — é frágil.
 *
 * O cliente que lê trinta cláusulas de proteção do prestador e nenhuma
 * obrigação dele em troca desconfia, negocia tudo, ou assina de má vontade e
 * cria caso na primeira divergência. As cláusulas desta seção existem para
 * que o documento diga, com a mesma clareza, o que CADA UM deve — e é isso
 * que faz o cliente assinar rápido.
 */
export const CLAUSULA_OBRIGACOES_DAS_PARTES: ClausulaModelo = {
  id: "obrigacoes_das_partes",
  titulo: "Das Obrigações das Partes",
  essencial: true,
  protege: "Diz por escrito o que cada lado deve — é o que faz o cliente assinar sem desconfiar.",
  texto: `São obrigações do CONTRATADO, além das demais previstas neste instrumento:

(i) executar os serviços com zelo, diligência e padrão técnico compatível com o praticado por profissionais qualificados do seu mercado, empregando equipamento adequado e mantido em condições de uso;
(ii) cumprir os prazos pactuados, ressalvadas as hipóteses de suspensão previstas neste contrato, e comunicar imediatamente à CONTRATANTE qualquer fato que possa comprometê-los;
(iii) manter a CONTRATANTE informada sobre o andamento da execução, respondendo às comunicações nos prazos da cláusula Das Comunicações;
(iv) submeter o material à aprovação nas etapas pactuadas e realizar as refações inclusas sem custo adicional;
(v) corrigir, às suas expensas, os vícios e defeitos que lhe sejam imputáveis, na forma da cláusula Da Garantia;
(vi) guardar sigilo sobre as informações da CONTRATANTE, nos termos da cláusula Da Confidencialidade;
(vii) responder pelos encargos trabalhistas, previdenciários, fiscais e securitários da sua própria equipe;
(viii) portar-se, e fazer com que sua equipe se porte, com urbanidade e discrição nos ambientes da CONTRATANTE, observando as normas internas que lhe forem previamente comunicadas.

São obrigações da CONTRATANTE, além das demais previstas neste instrumento:

(i) efetuar os pagamentos nas datas e formas pactuadas;
(ii) fornecer tempestivamente os insumos, acessos, informações, autorizações e aprovações necessários à execução, na forma da cláusula Dos Prazos;
(iii) indicar e manter um responsável com poderes de aprovação, consolidando por meio dele os apontamentos de toda a sua estrutura;
(iv) garantir as condições de acesso, segurança e trabalho no local de execução;
(v) responder pela veracidade das informações, pela licitude do conteúdo que fornecer e pela obtenção das autorizações de terceiros, na forma da cláusula Do Direito de Imagem;
(vi) utilizar a obra nos limites licenciados;
(vii) tratar o CONTRATADO e sua equipe com respeito, sendo vedada qualquer conduta discriminatória, assediadora ou intimidatória.

Parágrafo único. O descumprimento reiterado de qualquer das obrigações acima, não sanado em 10 (dez) dias contados de notificação escrita, caracteriza justa causa para a rescisão pela parte prejudicada, na forma da cláusula Da Rescisão.`,
};

export const CLAUSULA_GARANTIA: ClausulaModelo = {
  id: "garantia",
  titulo: "Da Garantia e da Correção de Vícios",
  protege: "Dá segurança real ao cliente e, ao mesmo tempo, fecha a porta do conserto eterno e de graça.",
  texto: `O CONTRATADO garante que o material entregue estará livre de vícios técnicos que lhe sejam imputáveis, comprometendo-se a corrigi-los sem qualquer custo adicional para a CONTRATANTE.

Parágrafo primeiro. Consideram-se vícios técnicos, exemplificativamente: arquivo corrompido ou ilegível; formato, resolução ou proporção diversos dos contratados; erro de exportação, de sincronismo de áudio ou de codificação; ausência de entregável expressamente descrito na cláusula Do Objeto; e erro de grafia em texto fornecido por escrito pela CONTRATANTE e reproduzido incorretamente pelo CONTRATADO.

Parágrafo segundo. A garantia vigora por 30 (trinta) dias corridos contados da entrega, devendo o vício ser comunicado por escrito, com a descrição objetiva do problema, dentro desse prazo. A correção será realizada em prazo proporcional à sua extensão, não superior ao prazo original da etapa correspondente.

Parágrafo terceiro. NÃO constituem vício, e portanto não são objeto de garantia: mudança de gosto, de conceito, de estratégia ou de preferência estética; alteração de premissa já aprovada; desempenho comercial do material; incompatibilidade com especificação técnica não informada previamente por escrito; alteração posterior de requisitos de plataformas de terceiros; e dano decorrente de manipulação, reexportação, compressão ou edição do arquivo por terceiros após a entrega.

Parágrafo quarto. Impossibilitada a correção por causa não imputável ao CONTRATADO — notadamente quando dependa de nova captação de evento não repetível —, a responsabilidade observará o limite da cláusula Da Limitação de Responsabilidade.

Parágrafo quinto. A correção de vício não reabre o ciclo de refações nem transfere para o CONTRATADO o ônus de novas rodadas de ajuste estético.`,
};

export const CLAUSULA_CONDUTA_E_ANTICORRUPCAO: ClausulaModelo = {
  id: "conduta_anticorrupcao",
  titulo: "Da Conduta, da Integridade e do Ambiente de Trabalho",
  protege: "Compromisso dos dois lados: nada de propina, trabalho irregular ou assédio no set.",
  texto: `As partes declaram conhecer e obrigam-se a observar a Lei nº 12.846/2013 e demais normas aplicáveis ao combate à corrupção, abstendo-se de oferecer, prometer, dar ou aceitar vantagem indevida a agente público ou privado, direta ou indiretamente, em razão deste contrato.

Parágrafo primeiro. As partes declaram não utilizar, em suas cadeias produtivas, trabalho infantil, trabalho análogo ao de escravo, ou qualquer forma de exploração degradante, obrigando-se a comunicar imediatamente à outra qualquer indício em contrário de que tomem conhecimento.

Parágrafo segundo. As partes repudiam qualquer forma de discriminação por raça, cor, etnia, origem, gênero, identidade de gênero, orientação sexual, religião, idade, deficiência ou condição social, bem como qualquer forma de assédio moral ou sexual, comprometendo-se a assegurar ambiente de trabalho respeitoso a todos os envolvidos na execução.

Parágrafo terceiro. A ocorrência de assédio, discriminação ou violência praticada por qualquer das partes, seus prepostos ou convidados contra integrante da outra constitui JUSTA CAUSA para rescisão imediata, sem prejuízo das medidas cíveis e criminais cabíveis e da multa rescisória prevista na cláusula Da Rescisão.

Parágrafo quarto. A parte que tomar conhecimento de conduta vedada por esta cláusula comunicará a outra por escrito, assegurada a apuração de boa-fé e a preservação de quem comunicar.`,
};

export const CLAUSULA_SOLUCAO_DE_CONFLITOS: ClausulaModelo = {
  id: "solucao_de_conflitos",
  titulo: "Da Solução Amigável de Controvérsias",
  opcional: true,
  protege: "Obriga a uma conversa antes do processo — resolve barato o que viraria caro.",
  texto: `Surgindo divergência quanto à interpretação ou à execução deste contrato, as partes obrigam-se a, antes de qualquer medida judicial, buscar a solução amigável por meio de tratativa direta e documentada.

Parágrafo primeiro. A parte que se considerar prejudicada notificará a outra por escrito, expondo objetivamente o fato, o fundamento e a solução pretendida. A parte notificada responderá no prazo de 10 (dez) dias.

Parágrafo segundo. Não havendo composição em 30 (trinta) dias contados da notificação inicial, as partes poderão, de comum acordo, submeter a controvérsia a mediação perante câmara especializada, rateando-se as custas em partes iguais.

Parágrafo terceiro. O disposto nesta cláusula não impede a adoção imediata de medidas urgentes destinadas a evitar dano irreparável, nem a cobrança de valores incontroversos vencidos e não pagos.

Parágrafo quarto. A tentativa de solução amigável suspende os prazos contratuais de execução relativos ao ponto controvertido, mas não os prazos de pagamento de parcelas incontroversas.`,
};

/**
 * O bloco de fechamento que praticamente todo contrato repete, na ordem em
 * que costuma fazer sentido ler: primeiro o que o cliente ganha (garantia),
 * depois sigilo e dados, então dinheiro, saída, limites, e o fecho.
 *
 * Fica no FIM do arquivo de propósito: é um array que referencia as
 * constantes acima, e um array declarado antes delas quebraria na
 * inicialização do módulo.
 */
export const CLAUSULAS_DE_FECHAMENTO: ClausulaModelo[] = [
  CLAUSULA_GARANTIA,
  CLAUSULA_CONFIDENCIALIDADE,
  CLAUSULA_LGPD,
  CLAUSULA_PAGAMENTO,
  CLAUSULA_RESCISAO,
  CLAUSULA_LIMITACAO_RESPONSABILIDADE,
  CLAUSULA_FORCA_MAIOR,
  CLAUSULA_EQUIPE_E_SUBCONTRATACAO,
  CLAUSULA_NAO_ALICIAMENTO,
  CLAUSULA_CONDUTA_E_ANTICORRUPCAO,
  CLAUSULA_SOLUCAO_DE_CONFLITOS,
  CLAUSULA_COMUNICACOES,
  CLAUSULA_DISPOSICOES_FINAIS,
];
