import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/**
 * Banco de modelos de contrato do perfil FILMMAKER — v2, 8 tipos de serviço
 * (substitui a v1 de 5 tipos genéricos). Cada tipo de serviço agora tem seu
 * próprio contrato dedicado, redigido em padrão jurídico aprofundado, com:
 *  - tabela progressiva de retenção por cancelamento vinculada à proximidade
 *    da data do evento (quando aplicável);
 *  - cláusula de armazenamento pós-entrega (a guarda do material passa a ser
 *    responsabilidade do cliente após a entrega, com taxa opcional de
 *    reenvio caso o(a) profissional ainda disponha de backup);
 *  - cláusula de quitação integral antes da data do evento;
 *  - cláusula "Da Limitação de Responsabilidade e da Indenização", que limita
 *    a responsabilidade do(a) profissional e prevê indenização por parte do
 *    cliente em cenários específicos de má-fé/uso indevido;
 *  - cláusulas específicas de segurança (voo de drone, ambiente de show).
 *
 * Ver `tipos.ts` para a convenção de `[TAG]` e o formulário lateral.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_FILMMAKER: ModeloContratoServico[] = [
  {
    perfil: "filmmaker",
    tipoServico: "casamentos",
    nome: "Casamentos",
    descricao: "Filmagem de casamento com tabela progressiva de retenção por cancelamento, quitação prévia obrigatória e responsabilidade de armazenamento transferida ao casal após a entrega.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_CONJUGE", label: "Nome do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "CPF_CONJUGE", label: "CPF do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do casamento", tipo: "data" },
      { tag: "LOCAL_DA_CERIMONIA", label: "Local da cerimônia", tipo: "texto" },
      { tag: "LOCAL_DA_FESTA", label: "Local da recepção/festa", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início da cobertura", tipo: "texto", exemplo: "14h" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término da cobertura", tipo: "texto", exemplo: "23h" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária total de cobertura", tipo: "texto", exemplo: "9 horas" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea", exemplo: "making of, cerimônia, sessão pós-cerimônia, recepção, primeira dança, corte do bolo" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea", exemplo: "1 videomaker principal + 1 assistente" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "filme editado de até 15 min, trailer de até 3 min, highlights brutos selecionados" },
      { tag: "PRAZO_AUTORIZACAO_DRONE", label: "Prazo p/ autorização de drone (se contratado)", tipo: "texto", exemplo: "15 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "VALOR_RODADA_ADICIONAL", label: "Valor de rodada de revisão adicional", tipo: "moeda" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "15 dias" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "90 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda", exemplo: "300 a 800" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — mais de 12 meses antes", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — entre 12 e 6 meses antes", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 6 e 3 meses antes", tipo: "percentual", exemplo: "40" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 3 meses e 30 dias antes", tipo: "percentual", exemplo: "70" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação sem multa", tipo: "texto", exemplo: "60 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FILMAGEM DE CASAMENTO

Pelo presente instrumento particular de prestação de serviços, as partes abaixo qualificadas:

CONTRATANTE(S): [NOME_DO_CLIENTE] e [NOME_DO_CONJUGE], portadores dos CPFs nº [CPF_CNPJ_CLIENTE] e [CPF_CONJUGE], residentes e domiciliados em [ENDERECO_CLIENTE], doravante denominados em conjunto simplesmente CONTRATANTES (respondendo solidariamente por todas as obrigações financeiras deste contrato);

CONTRATADO(A): [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito(a) no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante denominado(a) simplesmente CONTRATADO(A);

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas seguintes.

1. DO OBJETO
1.1. O presente contrato tem por objeto a prestação, pelo(a) CONTRATADO(A), de serviços de filmagem e produção audiovisual da cerimônia e festa de casamento dos CONTRATANTES, a realizar-se em [DATA_DO_EVENTO], com cerimônia em [LOCAL_DA_CERIMONIA] e recepção/festa em [LOCAL_DA_FESTA].
1.2. O(a) CONTRATADO(A) atua como profissional autônomo de captação e edição audiovisual, não se responsabilizando por qualquer aspecto da organização do evento em si (cerimonial, buffet, decoração, som ambiente, iluminação do local), cuja responsabilidade é exclusiva dos CONTRATANTES e demais fornecedores contratados por eles.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Cobertura do dia: captação com início em [HORARIO_DE_INICIO] e término em [HORARIO_DE_TERMINO], totalizando [CARGA_HORARIA_DIARIA] de cobertura, compreendendo: [MOMENTOS_COBERTOS].
2.2. Equipe: [COMPOSICAO_DA_EQUIPE]. Alteração no número de profissionais presentes no dia (para mais ou para menos) altera o valor do contrato e deve ser formalizada por aditivo antes do evento.
2.3. Entregáveis finais: [DESCRICAO_DOS_ENTREGAVEIS].
2.4. Diária de drone (quando contratada): a captação aérea com drone está sujeita à autorização do local do evento (espaço de eventos, igreja, sítio) e às normas da ANAC e da legislação de sobrevoo vigente, incluindo restrições de proximidade com aeroportos e áreas urbanas densas. Cabe aos CONTRATANTES obter e apresentar, com antecedência mínima de [PRAZO_AUTORIZACAO_DRONE], a autorização do local para o uso de drone; a ausência dessa autorização exime o(a) CONTRATADO(A) da captação aérea, sem redução do valor do contrato, salvo se o drone for o objeto principal contratado.
2.5. O(a) CONTRATADO(A) não se responsabiliza por captar momentos específicos não comunicados previamente pelos CONTRATANTES (ex.: uma homenagem surpresa, presença de convidado específico) caso não estejam no roteiro/briefing combinado antes do evento — recomenda-se fortemente o alinhamento prévio de um roteiro do dia ("timeline") com a equipe.

3. DO PRAZO DE ENTREGA
3.1. Dada a complexidade de edição de material de casamento (volume de horas captadas, sincronização de múltiplas câmeras, correção de cor, mixagem de áudio), o filme principal editado será entregue em até [PRAZO_DE_ENTREGA] dias corridos após a data do evento.
3.2. O trailer/teaser (quando incluso) é entregue em prazo reduzido, conforme cláusula 2.3, justamente para atender à expectativa de compartilhamento rápido nas redes sociais dos CONTRATANTES.
3.3. Atrasos motivados por caso fortuito, força maior, ou por demora dos CONTRATANTES em aprovar seleção de trilha sonora/depoimentos (quando solicitada sua participação no processo) suspendem a contagem do prazo.

4. DAS REVISÕES
4.1. Está inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual sobre o filme principal entregue (ex.: troca de trilha sonora, correção de nome grafado incorretamente em créditos, ajuste de ritmo em trecho específico), que não implique remontagem estrutural da narrativa.
4.2. Pedidos de reedição completa, mudança de conceito de montagem, ou inclusão de cenas não previamente selecionadas para edição são cobrados à parte, no valor de [VALOR_RODADA_ADICIONAL] por rodada.
4.3. Não há, em qualquer hipótese, nova captação (refilmagem) do casamento, por se tratar de evento único e irrepetível. O(a) CONTRATADO(A) responde apenas por defeitos técnicos comprovadamente causados por falha de seu equipamento ou operação (ex.: cartão de memória corrompido por mau manuseio da equipe), obrigando-se, nessa hipótese específica, a entregar o material humanamente possível de recuperar e a conceder abatimento proporcional no valor do contrato relativo aos trechos efetivamente perdidos.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Pela prestação dos serviços ora contratados, os CONTRATANTES pagarão ao(à) CONTRATADO(A) o valor total de [VALOR_DO_SERVIÇO], da seguinte forma: [CONDICOES_DE_PAGAMENTO].
5.2. CLÁUSULA ESSENCIAL — QUITAÇÃO PRÉVIA AO EVENTO: o serviço somente será prestado mediante a quitação integral do valor contratado até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data do casamento. Caso o pagamento integral não seja confirmado até essa data, o(a) CONTRATADO(A) está expressamente autorizado(a) a não comparecer ao evento e a considerar o contrato rescindido por inadimplemento dos CONTRATANTES, aplicando-se a cláusula 7ª (retenção conforme a tabela de cancelamento vigente na data do não pagamento), sem prejuízo da cobrança judicial do saldo devedor.
5.3. Atraso no pagamento de qualquer parcela intermediária gera multa de 2% sobre o valor em atraso, juros de mora de 1% ao mês e correção monetária pelo índice [INDICE_DE_CORRECAO], pro rata die, sem prejuízo do disposto na cláusula 5.2.
5.4. O arquivo final em alta resolução (master) e os arquivos brutos selecionados somente são entregues/liberados após a quitação integral do valor contratado.

6. DA ENTREGA, DO ARMAZENAMENTO E DA RESPONSABILIDADE PÓS-ENTREGA (CLÁUSULA ESSENCIAL)
6.1. Uma vez entregue o material final aos CONTRATANTES (por link de download, HD/pendrive físico ou plataforma de entrega), cessa integralmente a responsabilidade do(a) CONTRATADO(A) pela guarda, backup e integridade do material entregue. A partir desse momento, o armazenamento, a realização de cópias de segurança (backup) e a preservação do material são de responsabilidade exclusiva dos CONTRATANTES.
6.2. O(a) CONTRATADO(A) não garante prazo de retenção de backup próprio dos arquivos brutos e do projeto de edição após a entrega, podendo eliminá-los de seus sistemas de armazenamento a qualquer momento a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após a entrega final, sem necessidade de aviso prévio.
6.3. Caso, dentro do prazo em que ainda mantenha backup por mera liberalidade (não obrigação), o(a) CONTRATADO(A) venha a localizar e puder restaurar arquivos que os CONTRATANTES tenham perdido por qualquer motivo (perda de HD, exclusão acidental, dano ao dispositivo próprio), o(a) CONTRATADO(A) poderá, a seu exclusivo critério e mediante disponibilidade, reabrir o projeto e reenviar o material, cobrando por esse serviço avulso de recuperação/reenvio o valor de [VALOR_TAXA_REENVIO], não estando obrigado(a) a prestar esse serviço caso o material já tenha sido eliminado de seus sistemas nos termos da cláusula 6.2.
6.4. Fica expressamente ressalvado que o(a) CONTRATADO(A) não se responsabiliza, em qualquer hipótese, por perda, dano, roubo, furto, corrupção de arquivo ou qualquer outro sinistro que afete o material após sua entrega aos CONTRATANTES, recomendando-se a estes a realização de, no mínimo, duas cópias de segurança em locais/dispositivos distintos (ex.: nuvem + HD externo) imediatamente após o recebimento.

7. DA RESCISÃO E DA TABELA DE RETENÇÃO POR CANCELAMENTO (CLÁUSULA ESSENCIAL)
7.1. O casamento é um evento de data única, incerta de remarcação, para o qual o(a) CONTRATADO(A) reserva integralmente sua agenda, deixando de aceitar outros trabalhos na mesma data desde a assinatura deste contrato. Por essa razão, o cancelamento pelos CONTRATANTES sujeita-se à seguinte tabela de retenção progressiva, calculada sobre o valor total do contrato (cláusula 5.1), a título de cláusula penal compensatória pela reserva de agenda e pela perda de oportunidade comercial do(a) CONTRATADO(A): mais de 12 meses de antecedência — retenção de [PERCENTUAL_RETENCAO_12_MESES]% do valor total; entre 12 e 6 meses — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 3 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 3 meses e 30 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 30 dias, ou não comparecimento dos CONTRATANTES ao próprio evento — retenção de 100%.
7.2. A retenção acima incide sobre os valores já pagos; caso o valor pago até a data do cancelamento seja inferior ao percentual de retenção devido conforme a tabela, os CONTRATANTES permanecem obrigados a pagar a diferença até completar o percentual retido.
7.3. Adiamento (remarcação para nova data, sem cancelamento definitivo): tratando-se de mera remarcação comunicada com antecedência mínima de [PRAZO_AVISO_REMARCACAO] da data original, e havendo disponibilidade de agenda do(a) CONTRATADO(A) para a nova data, não incide a multa da cláusula 7.1, sendo os valores já pagos migrados integralmente para a nova data. Inexistindo disponibilidade de agenda do(a) CONTRATADO(A) para a nova data pretendida, aplica-se a tabela de retenção da cláusula 7.1 com base na antecedência em relação à data original.
7.4. Cancelamento ou impossibilidade de comparecimento por parte do(a) CONTRATADO(A) sem justa causa (força maior, tratada na cláusula 10ª): devolução integral de todos os valores pagos pelos CONTRATANTES, em até 5 dias úteis, sem prejuízo de eventual indenização por danos comprovados, e obrigação de auxiliar na indicação de profissional substituto, quando possível.

8. DA CESSÃO DE DIREITOS AUTORAIS E DE USO DE IMAGEM
8.1. Mediante a quitação integral do valor pactuado, o(a) CONTRATADO(A) cede aos CONTRATANTES os direitos de uso pessoal e não comercial do material produzido, sem limitação de prazo, para uso privado, familiar e compartilhamento em redes sociais pessoais.
8.2. O(a) CONTRATADO(A) resguarda para si o direito de utilizar o material produzido (filme completo, trailer ou trechos/still frames) em seu portfólio profissional, site, redes sociais e materiais de divulgação, com direito a crédito autoral, salvo se os CONTRATANTES solicitarem expressamente e por escrito, antes do evento, a não divulgação do material (cláusula de privacidade), hipótese em que o(a) CONTRATADO(A) se absterá de publicá-lo.
8.3. Direitos de imagem de convidados: cabe aos CONTRATANTES informar previamente seus convidados sobre a presença de cobertura audiovisual profissional no evento. O(a) CONTRATADO(A) não se responsabiliza por eventual objeção de imagem manifestada por convidados após o evento, sendo tal questão de relacionamento exclusivo entre os CONTRATANTES e seus convidados.
8.4. Uso de trilha sonora: quando o filme final incluir música de terceiros não licenciada especificamente para esse fim (uso comum no mercado, mediante licenças de bibliotecas de música para casamento, quando aplicável), os CONTRATANTES reconhecem que plataformas como YouTube, Instagram e Facebook podem aplicar bloqueio, monetização por terceiro ("Content ID") ou remoção de áudio ao material publicado, não se responsabilizando o(a) CONTRATADO(A) por essas ações das plataformas, alheias ao seu controle. Recomenda-se aos CONTRATANTES o uso de cópias de backup sem essas restrições para arquivo pessoal.

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO DO(A) CONTRATADO(A)
9.1. Em caso de impedimento do(a) CONTRATADO(A) para comparecer ao evento por motivo de força maior (doença súbita, acidente, luto, entre outros), o(a) CONTRATADO(A) se compromete a envidar seus melhores esforços para indicar profissional substituto de nível técnico equivalente, mediante prévia anuência dos CONTRATANTES.
9.2. Não sendo possível a substituição em tempo hábil, aplica-se a devolução integral prevista na cláusula 7.4, sem prejuízo de eventual indenização por danos comprovados, observados os limites da força maior (cláusula 10ª).

10. DO CASO FORTUITO E DA FORÇA MAIOR
10.1. Nenhuma das partes será responsabilizada por descumprimento decorrente de caso fortuito ou força maior alheios à sua vontade (condições climáticas severas que impeçam o deslocamento ou o próprio evento, desastres naturais, determinação de autoridade pública, greves gerais, pandemias/epidemias, falecimento de familiar próximo, entre outros), devendo a parte afetada comunicar a outra assim que possível.
10.2. Cancelamento do próprio evento por motivo alheio às partes (ex.: interdição do local, determinação de autoridade pública) segue a lógica de remarcação da cláusula 7.3, sem incidência de multa, sempre que possível.

11. DA CONFIDENCIALIDADE
11.1. O(a) CONTRATADO(A) mantém sigilo sobre informações pessoais e financeiras dos CONTRATANTES obtidas em razão deste contrato, pelo prazo de [PRAZO_CONFIDENCIALIDADE], podendo, entretanto, salvo pedido de privacidade nos termos da cláusula 8.2, utilizar o material audiovisual do evento livremente para os fins ali previstos.

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. O tratamento de dados pessoais e de imagem coletados em razão deste contrato observa a Lei nº 13.709/2018 (LGPD), sendo utilizados exclusivamente para a prestação do serviço e finalidades aqui previstas.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. A responsabilidade do(a) CONTRATADO(A) por qualquer dano direto comprovadamente causado por sua atuação neste contrato fica limitada ao valor total pago pelos CONTRATANTES, excluída, em qualquer hipótese, a responsabilidade por lucros cessantes, danos indiretos, ou danos morais/à imagem decorrentes de fatores alheios à sua atuação técnica direta (organização do evento, atuação de outros fornecedores, comportamento de convidados).
13.2. Os CONTRATANTES se comprometem a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo ou prejuízo decorrente de: (i) objeção de imagem de convidados que não tenham sido previamente informados sobre a cobertura audiovisual, nos termos da cláusula 8.3; (ii) uso de trilha sonora não licenciada e eventual bloqueio/restrição por plataformas digitais, nos termos da cláusula 8.4; (iii) ausência de autorização do local para uso de drone, quando essa obtenção era de responsabilidade dos CONTRATANTES, nos termos da cláusula 2.4; (iv) atos de terceiros contratados pelos CONTRATANTES (cerimonialista, buffet, casa de festas) que atrapalhem ou impeçam a captação.
13.3. Manifestações públicas negativas (avaliações, comentários, publicações) feitas pelos CONTRATANTES de forma comprovadamente inverídica ou de má-fé, em descumprimento aos fatos e aos termos deste contrato, poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

14. DISPOSIÇÕES GERAIS
14.1. Este contrato não gera vínculo empregatício, societário ou de representação entre as partes.
14.2. Alterações a este contrato somente serão válidas se realizadas por escrito e assinadas por ambas as partes (aditivo contratual) — recomenda-se fortemente formalizar por aditivo qualquer alteração de escopo (nova diária, drone, hora extra, segundo operador) combinada em conversa informal.
14.3. A tolerância de uma parte quanto ao descumprimento de qualquer cláusula pela outra não implicará novação ou renúncia de direitos.
14.4. Os CONTRATANTES respondem solidariamente por todas as obrigações financeiras deste contrato, independentemente de qual dos dois tenha efetuado a assinatura ou o pagamento de determinada parcela.

15. DO FORO
15.1. Fica eleito o foro da Comarca de [FORO_COMARCA] para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E, por estarem justas e contratadas, as partes assinam o presente instrumento em duas vias de igual teor, na presença de duas testemunhas, em [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_DO_CONJUGE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)

Testemunha 1: _______________ CPF: _______________
Testemunha 2: _______________ CPF: _______________`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "aniversarios_festas_sociais",
    nome: "Aniversários e Festas Sociais",
    descricao: "Filmagem de debutante, bodas e aniversários, com quitação prévia obrigatória, armazenamento pós-entrega transferido ao cliente e tabela de retenção por cancelamento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TIPO_DE_FESTA", label: "Tipo de festa", tipo: "texto", exemplo: "debutante de 15 anos" },
      { tag: "NOME_DO_ANIVERSARIANTE_OU_HOMENAGEADO", label: "Nome do(a) aniversariante/homenageado(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início da cobertura", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término da cobertura", tipo: "texto" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária total de cobertura", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea", exemplo: "making of, entrada, valsa/coreografia, homenagens, festa" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra", tipo: "moeda" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "10 dias" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — mais de 6 meses antes", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 6 e 2 meses antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 2 meses e 15 dias antes", tipo: "percentual", exemplo: "60" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação sem multa", tipo: "texto", exemplo: "30 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FILMAGEM DE FESTA SOCIAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de filmagem e produção audiovisual da festa [TIPO_DE_FESTA] de [NOME_DO_ANIVERSARIANTE_OU_HOMENAGEADO], a realizar-se em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Cobertura com início em [HORARIO_DE_INICIO] e término em [HORARIO_DE_TERMINO], totalizando [CARGA_HORARIA_DIARIA], compreendendo: [MOMENTOS_COBERTOS].
2.2. Equipe: [COMPOSICAO_DA_EQUIPE].
2.3. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.4. Horas excedentes ao combinado são cobradas como hora extra, no valor de [VALOR_HORA_EXTRA] por hora ou fração superior a 30 minutos.

3. DO PRAZO DE ENTREGA
3.1. Filme editado entregue em até [PRAZO_DE_ENTREGA] dias corridos após o evento. Highlights/teaser (quando incluso) em prazo reduzido, conforme cláusula 2.3.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual sobre o filme entregue. Não há nova captação do evento, por se tratar de data única e irrepetível; o(a) CONTRATADO(A) responde apenas por defeito técnico comprovadamente atribuível a falha de seu equipamento/operação, com abatimento proporcional do trecho perdido.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. O serviço somente será prestado mediante quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes da festa; o não pagamento nesse prazo autoriza o(a) CONTRATADO(A) a não comparecer, aplicando-se a tabela de retenção da cláusula 7ª.
5.3. Atraso de parcela: multa de 2%, juros de mora de 1% ao mês, correção pelo índice [INDICE_DE_CORRECAO].
5.4. Arquivos finais liberados somente após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, cessa a responsabilidade do(a) CONTRATADO(A) pela guarda do material — armazenamento e backup passam a ser responsabilidade exclusiva da CONTRATANTE.
6.2. O(a) CONTRATADO(A) pode manter backup próprio por mera liberalidade por até [PRAZO_MINIMO_GUARDA_BACKUP], podendo eliminá-lo depois disso sem aviso prévio.
6.3. Recuperação/reenvio de material dentro do prazo de guarda, quando ainda disponível, é cobrada à parte no valor de [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Por se tratar de evento de data única, com reserva integral de agenda do(a) CONTRATADO(A), o cancelamento pela CONTRATANTE segue a tabela: mais de 6 meses de antecedência — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 2 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 2 meses e 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 15 dias ou no-show — retenção de 100%.
7.2. Remarcação com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e disponibilidade de agenda: valores pagos migram para a nova data, sem multa.
7.3. Cancelamento pelo(a) CONTRATADO(A) sem justa causa: devolução integral em até 5 dias úteis, sem prejuízo de indenização por danos comprovados.

8. DOS DIREITOS DE USO E IMAGEM
8.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso pessoal do material, sem limitação de prazo.
8.2. O(a) CONTRATADO(A) pode usar o material em portfólio, com crédito autoral, salvo pedido de privacidade formalizado por escrito antes do evento.
8.3. Cabe à CONTRATANTE informar convidados sobre a cobertura audiovisual; objeções de imagem de convidados são de relacionamento exclusivo entre estes e a CONTRATANTE.

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: o(a) CONTRATADO(A) envida esforços para indicar substituto de nível equivalente, mediante anuência da CONTRATANTE; não sendo possível, aplica-se a devolução da cláusula 7.3.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais, incluindo impossibilidade de realização da festa por determinação de autoridade pública, seguindo-se a lógica de remarcação da cláusula 7.2.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais e financeiros da CONTRATANTE pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. A responsabilidade do(a) CONTRATADO(A) por qualquer dano direto comprovadamente causado por sua atuação neste contrato fica limitada ao valor total pago pela CONTRATANTE, excluída, em qualquer hipótese, a responsabilidade por lucros cessantes, danos indiretos ou danos à imagem/reputação decorrentes de fatores alheios à sua atuação técnica direta.
13.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo ou prejuízo decorrente de: (i) informações falsas, incompletas ou materiais fornecidos pela CONTRATANTE; (ii) atos de terceiros convidados/contratados pela CONTRATANTE; (iii) uso do material entregue de forma diversa da licenciada neste contrato.
13.3. Manifestações públicas negativas (avaliações, comentários, publicações) feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé, em descumprimento aos fatos e aos termos deste contrato, poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

14. DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito. Tolerância não implica renúncia de direitos.

15. DO FORO
15.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "captacao_de_drone",
    nome: "Captação de Drone",
    descricao: "Captação aérea com drone, com cláusula essencial de segurança de voo (condições climáticas/obstáculos), enquadramento regulatório ANAC/SISANT/DECEA e isenção por suspensão de voo por segurança.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_PROJETO", label: "Descrição do projeto", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO AÉREA COM DRONE

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO], piloto remoto devidamente cadastrado no SISANT/ANAC quando exigido pela legislação vigente.

1. DO OBJETO
1.1. Prestação de serviço de captação de imagens e vídeos aéreos por meio de aeronave remotamente pilotada (drone), para o projeto [DESCRICAO_DO_PROJETO], no local [LOCAL_DE_CAPTACAO], na data de [DATA_DE_CAPTACAO].

2. DO ESCOPO E DA REGULAMENTAÇÃO APLICÁVEL
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Autorizações e restrições regulatórias (cláusula essencial): a operação está sujeita às normas da ANAC (Resolução nº 419/2017 e atualizações), do DECEA (espaço aéreo) e da ANATEL, incluindo, conforme o caso: cadastro da aeronave no SISANT, limite de altura de voo, distância mínima de aeroportos/aeródromos, restrição sobre aglomerações de pessoas não relacionadas ao evento, e necessidade de autorização do proprietário/administrador do local sobrevoado.
2.3. Cabe à CONTRATANTE informar, com antecedência, qualquer restrição de espaço aéreo local (proximidade de aeroportos, bases militares, áreas de segurança) e obter, quando exigível, a autorização do local para o sobrevoo; a ausência dessas informações que impeça ou restrinja o voo não gera responsabilidade ao(à) CONTRATADO(A) pela captação não realizada.
2.4. DA SEGURANÇA DE VOO (CLÁUSULA ESSENCIAL): o(a) CONTRATADO(A) reserva-se o direito de suspender, adiar ou não realizar o voo, a seu critério técnico exclusivo e de forma soberana e inapelável, sempre que as condições no momento não forem consideradas seguras, incluindo, mas não se limitando a: (i) ventos acima do limite operacional seguro da aeronave (tipicamente acima de 25-30 km/h, a critério técnico do piloto); (ii) chuva, garoa ou qualquer precipitação; (iii) fumaça, neblina, poeira ou qualquer condição que reduza a visibilidade; (iv) presença de obstáculos (fiação elétrica, árvores, estruturas, aglomeração de pessoas, animais) que ofereçam risco de colisão; (v) qualquer outra condição climática, ambiental ou de segurança que, a juízo técnico do(a) CONTRATADO(A), possa colocar em risco pessoas, animais, o ambiente, estruturas do local ou o próprio equipamento.
2.5. A decisão de não voar ou de interromper o voo por qualquer dos motivos da cláusula 2.4 não constitui inadimplemento contratual, nem gera direito a desconto, indenização ou reagendamento gratuito além do já previsto na cláusula 4.1 — o(a) CONTRATADO(A), entretanto, envidará esforços razoáveis para propor nova janela de captação dentro do mesmo evento/período contratado, quando tecnicamente viável, sem custo adicional.
2.6. A CONTRATANTE reconhece que a operação de aeronaves remotamente pilotadas envolve risco inerente e que a prioridade absoluta do(a) CONTRATADO(A), em qualquer circunstância, é a segurança de pessoas, bens e do próprio equipamento, prevalecendo essa prioridade sobre qualquer expectativa de entrega de material aéreo.

3. DO PRAZO
3.1. Entrega do material tratado/editado em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste sobre o material entregue. Nova captação por suspensão do voo por clima ou segurança (cláusula 2.4) é reagendada sem multa, na primeira janela de disponibilidade compatível entre as partes.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DO SEGURO E DA RESPONSABILIDADE POR DANOS A TERCEIROS
6.1. O(a) CONTRATADO(A) declara operar equipamento com seguro de responsabilidade civil compatível com a atividade, quando aplicável, respondendo por eventuais danos a terceiros diretamente causados por falha comprovada de sua operação.
6.2. A CONTRATANTE é responsável por isolar/sinalizar a área de pouso/decolagem e por manter pessoas não autorizadas afastadas durante a operação, conforme orientação do(a) CONTRATADO(A) no local.

7. DOS DIREITOS DE USO E IMAGEM
7.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
7.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação expressa por escrito.
7.3. Imagens aéreas que capturem propriedades ou pessoas de terceiros não relacionados ao projeto são tratadas com razoável cuidado de enquadramento pelo(a) CONTRATADO(A), mas a CONTRATANTE reconhece a limitação técnica de captação aérea em ambientes urbanos/rurais compartilhados.

8. DA RESCISÃO
8.1. Cancelamento pela CONTRATANTE: mais de 5 dias — retenção de 20%; entre 5 e 2 dias — 50%; menos de 48h ou no-show — 100% do valor total.

9. DA CONFIDENCIALIDADE
9.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Além dos termos gerais, inclui-se expressamente restrição de espaço aéreo imposta por autoridade (NOTAM, interdição temporária) como causa de reagendamento sem multa.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. A responsabilidade do(a) CONTRATADO(A) por qualquer dano direto comprovadamente causado por sua atuação neste contrato fica limitada ao valor total pago pela CONTRATANTE, excluída a responsabilidade por lucros cessantes ou danos indiretos.
12.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo ou prejuízo decorrente de: (i) informações falsas ou incompletas sobre restrições de espaço aéreo ou do local; (ii) ausência de autorização do local para o sobrevoo quando essa obtenção era de sua responsabilidade; (iii) atos de terceiros presentes no local (convidados, colaboradores) que interfiram na operação.
12.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis.

13. DO FORO
13.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "producao_comercial_fashion_film",
    nome: "Produção Comercial / Fashion Film",
    descricao: "Comerciais publicitários e fashion films para marcas, com licença de uso por prazo/mídia definidos, armazenamento pós-entrega e indenização por uso fora do escopo licenciado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TIPO_DE_PECA", label: "Tipo de peça", tipo: "texto", exemplo: "fashion film" },
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_CUSTO_REFACAO", label: "% custo de refação adicional", tipo: "percentual", exemplo: "30" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
      { tag: "EXCLUSIVA/NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "24 meses" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de veiculação", tipo: "textarea", exemplo: "mídias digitais próprias e pagas, território nacional" },
      { tag: "CRITERIO_LICENCA_AMPLIADA", label: "Critério de licença ampliada", tipo: "textarea", exemplo: "percentual do cachê original por período adicional" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "10 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL COMERCIAL/FASHION FILM

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a)/sede em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de produção audiovisual do tipo [TIPO_DE_PECA], para a marca/produto [NOME_DA_MARCA_OU_PRODUTO], compreendendo pré-produção, captação e pós-produção (edição, color grading, finalização).

2. DO ESCOPO, DOS ENTREGÁVEIS E DA PRÉ-PRODUÇÃO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Captação prevista para [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO], com equipe de [COMPOSICAO_DA_EQUIPE].
2.3. Etapa de pré-produção obrigatória: aprovação por escrito de roteiro/moodboard/lista de referências antes da captação; captação sem aprovação prévia expressa é realizada por conta e risco da CONTRATANTE.
2.4. Itens fora do escopo (talentos adicionais, casting, still photography avulsa, direção de arte cenográfica, trilha licenciada) são orçados e formalizados em aditivo à parte.
2.5. Cabe à CONTRATANTE liberar ambientes, produtos e talentos necessários no horário agendado; atraso na liberação reduz proporcionalmente o tempo útil de captação, sem prorrogação gratuita.

3. DO PRAZO DE ENTREGA
3.1. Entrega do material finalizado em até [PRAZO_DE_ENTREGA] dias corridos, contados da captação ou da aprovação do roteiro/moodboard, o que ocorrer por último.
3.2. Atrasos motivados pela CONTRATANTE (aprovação, materiais, locais/talentos) suspendem a contagem do prazo.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste pontual (ritmo, trilha, cor, legendas) sobre o corte entregue, sem nova captação nem reestruturação da narrativa já aprovada.
4.2. Rodadas adicionais ou nova captação por motivo não imputável a erro técnico (mudança de direção criativa, troca de talento já aprovado, alteração de briefing pós-aprovação) são cobradas à parte, no mínimo [PERCENTUAL_CUSTO_REFACAO]% do valor total por rodada/diária adicional.
4.3. Erro técnico comprovadamente atribuível ao(à) CONTRATADO(A) é corrigido sem custo, respeitada a disponibilidade de agenda para reagendamento.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. O não pagamento do sinal autoriza o(a) CONTRATADO(A) a não iniciar/suspender a pré-produção, sem caracterizar inadimplemento de sua parte.
5.3. Atraso de parcela gera multa de 2%, juros de mora de 1% ao mês, correção pelo índice [INDICE_DE_CORRECAO].
5.4. Os arquivos finais (masters) só são liberados após quitação integral.

6. DO ARMAZENAMENTO E DA GUARDA DE MATERIAL BRUTO
6.1. Após a entrega dos masters finalizados, cessa a obrigação do(a) CONTRATADO(A) de guardar o material bruto (raw footage) da captação, podendo eliminá-lo a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após a entrega, sem aviso prévio.
6.2. Recuperação de material bruto dentro do prazo de guarda, quando ainda disponível, é cobrada à parte no valor de [VALOR_TAXA_REENVIO].

7. DA CESSÃO DE DIREITOS AUTORAIS E DE USO DE IMAGEM
7.1. Mediante pagamento integral, o(a) CONTRATADO(A) cede à CONTRATANTE os direitos patrimoniais de uso da obra, de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para veiculação em [MEIOS_E_TERRITORIO].
7.2. Extensão de licença: usos além do prazo/território/meios pactuados (ex.: renovação por mais 12 meses, expansão para TV aberta, uso institucional perene) dependem de negociação e pagamento adicional de licença ampliada, calculado com base em [CRITERIO_LICENCA_AMPLIADA].
7.3. O(a) CONTRATADO(A) pode usar o material (ou trechos/stills) em portfólio, site e divulgação profissional, com crédito autoral, salvo pedido expresso e por escrito de embargo de divulgação por prazo determinado.
7.4. Cabe à CONTRATANTE providenciar, antes da captação, os termos de autorização de uso de imagem ("releases") de modelos/atores/figurantes, isentando o(a) CONTRATADO(A) de responsabilidade por reclamação de imagem de terceiros da produção.
7.5. Fica reconhecida ao(à) CONTRATADO(A), nos termos da Lei nº 9.610/98, a autoria da obra, vedada alteração da montagem final que a associe, sem consentimento, ao seu nome profissional de forma depreciativa.

8. DA RESCISÃO E DAS MULTAS
8.1. Rescisão por qualquer parte mediante aviso por escrito com [PRAZO_AVISO_RESCISAO] de antecedência, respeitadas obrigações já vencidas.
8.2. Cancelamento pela CONTRATANTE após confirmação de agenda: mais de 7 dias — retenção de 30% do sinal; entre 7 e 2 dias — retenção de 50% do valor total; menos de 48h ou no-show — retenção de 100% do valor total.
8.3. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução dos valores de etapas não realizadas, sem prejuízo de indenização por danos comprovados.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre briefing, roteiro, estratégia de campanha e material não lançado pelo prazo de [PRAZO_CONFIDENCIALIDADE], relevante para campanhas ainda não veiculadas publicamente.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior. A parte afetada comunica a outra em até 48h e propõe nova data, sem multa.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. A responsabilidade do(a) CONTRATADO(A) por qualquer dano direto comprovadamente causado por sua atuação fica limitada ao valor total pago pela CONTRATANTE, excluída a responsabilidade por lucros cessantes, danos indiretos ou danos à imagem/reputação decorrentes de fatores alheios à sua atuação técnica direta.
12.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo ou prejuízo decorrente de: (i) informações falsas, incompletas ou materiais fornecidos pela CONTRATANTE (incluindo releases de imagem de talentos/modelos); (ii) atos de terceiros contratados/convidados pela CONTRATANTE; (iii) uso do material entregue fora dos limites da licença concedida neste contrato (ex.: veiculação além do prazo/meios/território pactuados sem pagamento da licença ampliada).
12.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

14. DO FORO
14.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "videoclipes",
    nome: "Videoclipes",
    descricao: "Direção e produção de videoclipe musical, com declaração de titularidade musical obrigatória, crédito de direção garantido e armazenamento pós-entrega.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MUSICA", label: "Nome da música", tipo: "texto" },
      { tag: "NOME_DO_ARTISTA", label: "Nome do artista", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_DIARIA_ADICIONAL", label: "Valor da diária adicional de recaptação", tipo: "moeda" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "indeterminado, mediante pagamento integral" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DIREÇÃO E PRODUÇÃO DE VIDEOCLIPE

CONTRATANTE: [NOME_DO_CLIENTE] (artista/selo/representante), CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Direção, produção, captação e pós-produção de videoclipe para a obra musical "[NOME_DA_MUSICA]", do(a) artista [NOME_DO_ARTISTA].

2. DO ESCOPO E DA TITULARIDADE MUSICAL
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Captação prevista para [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.2. Declaração de titularidade musical (cláusula essencial): a CONTRATANTE declara, sob as penas da lei, ser titular ou possuir licença de sincronização válida sobre "[NOME_DA_MUSICA]" para associação com a peça audiovisual, assumindo integral responsabilidade por qualquer violação de direitos autorais musicais de terceiros, isentando o(a) CONTRATADO(A) de qualquer reclamação, multa ou indenização decorrente.

3. DO PRAZO
3.1. Entrega do corte final em até [PRAZO_DE_ENTREGA] dias corridos após a captação e aprovação da trilha/letra timada, quando aplicável.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste de edição/color/efeitos. Nova captação por mudança de conceito criativo pós-aprovação de roteiro/storyboard é cobrada como diária adicional de [VALOR_DIARIA_ADICIONAL].

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Master em alta resolução liberado somente após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega, o armazenamento do master e do material bruto passa a ser de responsabilidade da CONTRATANTE. O(a) CONTRATADO(A) pode manter backup por liberalidade por até [PRAZO_MINIMO_GUARDA_BACKUP], cobrando [VALOR_TAXA_REENVIO] por eventual recuperação dentro desse prazo.

7. DOS DIREITOS AUTORAIS, CRÉDITO E IMAGEM
7.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso e exploração comercial do videoclipe (YouTube, redes sociais, streaming, TV) pelo prazo de [PRAZO_DA_LICENCA_DE_USO].
7.2. É assegurado ao(à) CONTRATADO(A) crédito de direção ("Dirigido por [NOME_CONTRATADO]") em toda veiculação oficial, inclusive submissões a festivais e premiações.
7.3. Fica facultado ao(à) CONTRATADO(A) submeter a obra a festivais e usá-la em portfólio, ressalvado pedido de embargo por prazo determinado, solicitado por escrito antes do lançamento oficial.
7.4. Direitos de imagem de artista(s), dançarinos e figurantes devem ser previamente equacionados pela CONTRATANTE (ou pelo(a) CONTRATADO(A), mediante acordo e custo adicional), com coleta das respectivas autorizações.

8. DA RESCISÃO E MULTAS
8.1. Cancelamento pela CONTRATANTE: mais de 7 dias — retenção de 30% do sinal; entre 7 e 2 dias — 50% do valor total; menos de 48h ou no-show — 100% do valor total.
8.2. Descumprimento pelo(a) CONTRATADO(A) sem justa causa: devolução dos valores de etapas não realizadas, sem prejuízo de indenização por danos comprovados.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre lançamento não divulgado, conceito criativo e datas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior. A parte afetada comunica a outra em até 48h e propõe nova data, sem multa.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor total pago pela CONTRATANTE, excluída responsabilidade por lucros cessantes ou danos indiretos.
12.2. A CONTRATANTE indeniza e mantém o(a) CONTRATADO(A) isento(a) de reclamações decorrentes de: (i) falsa declaração de titularidade musical (cláusula 2.2); (ii) ausência de releases de imagem de artistas/figurantes; (iii) uso do material fora dos limites da licença concedida.
12.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

14. DO FORO
14.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "documentarios",
    nome: "Documentários",
    descricao: "Produção documental por marcos/etapas, com releases de entrevistados, crédito de direção assegurado e armazenamento de material de arquivo transferido ao cliente após a entrega.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TEMA_DO_DOCUMENTARIO", label: "Tema do documentário", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "MARCOS_DO_CRONOGRAMA", label: "Marcos do cronograma", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "90 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE OBRA DOCUMENTAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de obra documental sobre o tema "[TEMA_DO_DOCUMENTARIO]", compreendendo pesquisa, roteirização, captação de entrevistas/depoimentos e imagens de apoio, e pós-produção.

2. DO ESCOPO E DO CRONOGRAMA POR MARCOS
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Cronograma por marcos: [MARCOS_DO_CRONOGRAMA], dada a natureza de produção continuada.
2.2. Compete à CONTRATANTE viabilizar acesso a locações, fontes e entrevistados necessários.

3. DO PRAZO
3.1. Prazo total: [PRAZO_DE_ENTREGA], contado da aprovação do roteiro/tratamento inicial, dividido em entregas parciais por marco.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste na montagem final. Reestruturação de narrativa após aprovação do corte de exibição, novas entrevistas não previstas, ou nova captação por decisão editorial da CONTRATANTE são orçadas à parte.
4.2. Erros técnicos atribuíveis ao(à) CONTRATADO(A) são corrigidos sem custo, na medida do tecnicamente possível (ressalvados depoimentos/eventos históricos irrepetíveis).

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO], pago em parcelas vinculadas aos marcos de entrega: [CONDICOES_DE_PAGAMENTO].

6. DO ARMAZENAMENTO DE MATERIAL BRUTO E ARQUIVO HISTÓRICO
6.1. Após a entrega final, o armazenamento do material bruto (incluindo depoimentos e imagens de arquivo) passa a ser de responsabilidade da CONTRATANTE, especialmente relevante tratando-se de registro histórico irrepetível.
6.2. O(a) CONTRATADO(A) pode manter backup por liberalidade por até [PRAZO_MINIMO_GUARDA_BACKUP], cobrando [VALOR_TAXA_REENVIO] por recuperação dentro desse prazo.

7. DOS DIREITOS AUTORAIS, DEPOIMENTOS E IMAGEM
7.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de exploração da obra conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
7.2. Cabe à CONTRATANTE (ou, mediante acordo, ao(à) CONTRATADO(A) durante a captação) coletar releases de imagem e depoimento de todas as pessoas entrevistadas/identificáveis, sem os quais os respectivos trechos não podem ser usados/exibidos.
7.3. É assegurado ao(à) CONTRATADO(A) crédito de direção/produção e o direito de submeter a obra a festivais, mostras e premiações, e usá-la em portfólio, ressalvado embargo por prazo determinado antes do lançamento oficial.
7.4. Direitos de distribuição comercial pertencem à CONTRATANTE, salvo coprodução formalizada em aditivo específico.
7.5. Material de arquivo, fotos históricas ou imagens de terceiros necessários à obra têm seus direitos de uso equacionados e custeados pela CONTRATANTE.

8. DA RESCISÃO E MULTAS
8.1. Rescisão unilateral pela CONTRATANTE após início da pesquisa/captação: pagamento proporcional aos marcos cumpridos, acrescido de multa de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.
8.2. Cancelamento de diária já agendada: mais de 7 dias — 30% de retenção; entre 7 e 2 dias — 50%; menos de 48h ou no-show — 100%.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre conteúdo sensível de entrevistas e material não editado pelo prazo de [PRAZO_CONFIDENCIALIDADE], especialmente relevante quando o tema envolver dados sensíveis dos entrevistados.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais e depoimentos conforme a Lei nº 13.709/2018, com consentimento específico para uso de imagem e voz.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior. A parte afetada comunica a outra em até 48h e propõe nova data, sem multa.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor total pago pela CONTRATANTE, excluída responsabilidade por lucros cessantes ou danos indiretos.
12.2. A CONTRATANTE indeniza e mantém o(a) CONTRATADO(A) isento(a) de reclamações decorrentes de: (i) ausência de releases de imagem/depoimento dos entrevistados, cuja obtenção é responsabilidade da CONTRATANTE nos termos da cláusula 7.2; (ii) uso indevido de material de arquivo/imagens de terceiros cujos direitos não tenham sido equacionados pela CONTRATANTE; (iii) uso do material fora dos limites da licença concedida.
12.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação.

14. DO FORO
14.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "turnes_e_shows",
    nome: "Turnês e Shows",
    descricao: "Cobertura audiovisual de turnês multi-data, com logística de deslocamento a cargo do contratante, cláusula de segurança em ambiente de show/multidão e tabela progressiva de retenção por cancelamento.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_ARTISTA_OU_BANDA", label: "Nome do artista/banda", tipo: "texto" },
      { tag: "LISTA_DE_DATAS_E_CIDADES", label: "Lista de datas e cidades (anexo)", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por data/consolidados", tipo: "textarea" },
      { tag: "PRAZO_ANTECEDENCIA_LOGISTICA", label: "Prazo de antecedência para logística", tipo: "texto", exemplo: "10 dias" },
      { tag: "NUMERO_DE_DATAS", label: "Número de datas da turnê", tipo: "numero" },
      { tag: "VALOR_DIARIA_ADICIONAL", label: "Valor de diária adicional", tipo: "moeda" },
      { tag: "VALOR_ADIANTAMENTO_DESPESAS", label: "Valor de adiantamento de despesas por data", tipo: "moeda" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega de conteúdo rápido", tipo: "texto", exemplo: "48 horas" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas (aftermovie)", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
      { tag: "PRAZO_RETENCAO_FAIXA_1", label: "Antecedência — faixa 1 (maior)", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_RETENCAO_FAIXA_2", label: "Antecedência — faixa 2", tipo: "texto", exemplo: "3 meses" },
      { tag: "PRAZO_RETENCAO_FAIXA_3", label: "Antecedência — faixa 3 (menor)", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — faixa 1", tipo: "percentual", exemplo: "15" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — faixa 2", tipo: "percentual", exemplo: "35" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — faixa 3", tipo: "percentual", exemplo: "60" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — abaixo da faixa 3", tipo: "percentual", exemplo: "85" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de veiculação", tipo: "textarea" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL DE TURNÊ/SHOWS

CONTRATANTE: [NOME_DO_CLIENTE] (artista/banda/produtora/empresário), CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de captação e produção audiovisual das apresentações de [NOME_DO_ARTISTA_OU_BANDA], compreendendo as datas/cidades listadas no Anexo de Roteiro de Turnê ([LISTA_DE_DATAS_E_CIDADES]), com entregáveis de [DESCRICAO_DOS_ENTREGAVEIS].
1.2. O presente contrato rege a totalidade das datas listadas no Anexo; alterações de roteiro (inclusão/exclusão de datas) são formalizadas por aditivo, com impacto proporcional no valor total.

2. DO ESCOPO, DA LOGÍSTICA E DAS CONDIÇÕES DE TRABALHO
2.1. Entregáveis por data e entregáveis consolidados de turnê (aftermovie): [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Da logística de deslocamento e hospedagem (cláusula essencial): transporte, hospedagem, alimentação e credenciamento/acesso (passes de palco, camarim, backstage, fosso) do(a) CONTRATADO(A) e de sua equipe em cada cidade são de responsabilidade e custo da CONTRATANTE, providenciados com antecedência mínima de [PRAZO_ANTECEDENCIA_LOGISTICA]. A ausência de credenciamento válido que impeça a captação em determinada data não gera reembolso nem desconto, sendo a diária correspondente devida integralmente.
2.3. Da segurança em ambiente de show e multidão (cláusula essencial): a captação em fosso, meio de plateia, pit ou proximidades do palco fica condicionada à existência de estrutura de segurança adequada fornecida pela produção do evento/CONTRATANTE (isolamento, seguranças, sinalização). O(a) CONTRATADO(A) tem o direito de recusar-se a captar, ou de interromper a captação, em posições que ofereçam risco à sua integridade física ou de sua equipe/equipamento (aglomeração excessiva, ausência de rota de fuga, atos de violência, estrutura de palco/som insegura, pirotecnia sem distância de segurança), sem que isso configure inadimplemento ou gere desconto/multa.
2.4. Equipamentos sensíveis (câmeras, drones, gimbals) permanecem sob responsabilidade e seguro do(a) CONTRATADO(A); danos causados por terceiros (público, seguranças, staff do evento) não imputáveis ao(à) CONTRATADO(A) não geram responsabilidade deste(a), cabendo à CONTRATANTE, quando aplicável, acionar seguro do evento ou responsabilizar o causador direto.
2.5. Cabe à CONTRATANTE viabilizar autorização/registro do artista com a casa de show, gravadora, empresário ou produtora local para a captação, isentando o(a) CONTRATADO(A) de qualquer restrição de acesso ou direito autoral de terceiros da produção do evento.

3. DO PRAZO DE ENTREGA
3.1. Conteúdo para redes sociais/stories: entrega em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após cada data, quando esse entregável fizer parte do escopo.
3.2. Aftermovie/material consolidado da turnê: entrega em até [PRAZO_DE_ENTREGA] dias corridos após o encerramento da turnê ou da última data contratada.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste no aftermovie/material consolidado. Datas de show não realizadas por motivo não imputável ao(à) CONTRATADO(A) (cancelamento do show, adiamento pela produção, condições de segurança da cláusula 2.3) não geram obrigação de reposição gratuita em outra data, sem prejuízo do disposto na cláusula 7.
4.2. Falhas técnicas comprovadamente atribuíveis ao(à) CONTRATADO(A) em uma data específica não geram direito a desconto sobre as demais datas da turnê, sendo tratadas isoladamente.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total da turnê: [VALOR_DO_SERVIÇO], correspondente a [NUMERO_DE_DATAS] data(s), à razão de [VALOR_DIARIA_ADICIONAL] por data adicional eventualmente incluída.
5.2. Condições de pagamento: [CONDICOES_DE_PAGAMENTO]. Cada bloco de datas (ex.: por mês/etapa da turnê) deve estar quitado antes do início do respectivo bloco; o não pagamento de bloco vencido autoriza a suspensão da cobertura das datas subsequentes, sem caracterizar inadimplemento do(a) CONTRATADO(A) e sem prejuízo da retenção prevista na cláusula 7 sobre as datas já realizadas ou disponibilizadas.
5.3. Despesas de deslocamento, hospedagem e alimentação, quando não fornecidas in natura pela CONTRATANTE nos termos da cláusula 2.2, são reembolsadas mediante apresentação de comprovantes ou pagas via adiantamento de valor fixo de [VALOR_ADIANTAMENTO_DESPESAS] por data/cidade.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do aftermovie e dos conteúdos de cada data, cessa a obrigação do(a) CONTRATADO(A) de guardar o material bruto, podendo eliminá-lo a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após a entrega final da turnê, sem aviso prévio.
6.2. Recuperação de material bruto ainda disponível dentro do prazo de guarda é cobrada à parte no valor de [VALOR_TAXA_REENVIO].

7. DA RESCISÃO, DO CANCELAMENTO DE DATAS E DAS MULTAS
7.1. Cancelamento da turnê como um todo pela CONTRATANTE: aplica-se a tabela progressiva de retenção sobre o valor total, conforme antecedência em relação à primeira data da turnê: mais de [PRAZO_RETENCAO_FAIXA_1] de antecedência — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre [PRAZO_RETENCAO_FAIXA_2] e [PRAZO_RETENCAO_FAIXA_1] — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre [PRAZO_RETENCAO_FAIXA_3] e [PRAZO_RETENCAO_FAIXA_2] — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; menos de [PRAZO_RETENCAO_FAIXA_3] — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; cancelamento de data isolada com menos de 72h, ou no-show em data confirmada — retenção de 100% do valor correspondente àquela data.
7.2. A retenção acima se justifica pela reserva exclusiva da agenda do(a) CONTRATADO(A) para as datas da turnê, com recusa de outras oportunidades de trabalho no período, constituindo perda financeira direta e não uma penalidade arbitrária.
7.3. Cancelamento de show individual dentro da turnê por caso fortuito/força maior (cláusula 11) não sofre a retenção acima, sendo apenas descontado do valor total o custo proporcional da data não realizada, ressalvadas despesas de deslocamento/hospedagem já incorridas e não reembolsáveis por terceiros.
7.4. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução dos valores de datas não realizadas, sem prejuízo de indenização por danos comprovados.

8. DOS DIREITOS AUTORAIS, CRÉDITO E IMAGEM
8.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material captado, pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para os fins de [MEIOS_E_TERRITORIO].
8.2. É assegurado ao(à) CONTRATADO(A) crédito nas publicações oficiais ("Registro audiovisual: [NOME_CONTRATADO]"), bem como o direito de uso do material em portfólio e divulgação profissional, ressalvado embargo por prazo determinado solicitado por escrito.
8.3. Imagens de músicos convidados, banda de apoio, staff e público presente: o(a) CONTRATADO(A) não se responsabiliza por eventuais objeções posteriores de terceiros presentes no evento, cabendo à CONTRATANTE (produção/artista) a gestão de tais autorizações junto ao público e à equipe do show.
8.4. Uso de trilha sonora executada ao vivo (composições de terceiros) segue as regras de execução pública já equacionadas pela casa de show/produtora junto ao ECAD; o(a) CONTRATADO(A) não responde por eventual bloqueio de plataforma (ex.: YouTube/Instagram) decorrente de identificação de conteúdo de terceiros ("Content ID") sobre a trilha executada, cabendo à CONTRATANTE gerenciar eventuais disputas de direitos autorais musicais perante as plataformas.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre roteiro de turnê não divulgado, setlist, bastidores e questões contratuais entre CONTRATANTE e casas de show/produtoras, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por cancelamento/adiamento de data decorrente de caso fortuito ou força maior (incluindo cancelamento do show pela casa/produtora, condições climáticas que impeçam a realização do evento, ou motivo de saúde do artista). A parte afetada comunica a outra em até 48h.
11.2. Impedimento pessoal do(a) CONTRATADO(A) para comparecer a uma ou mais datas autoriza a indicação de profissional substituto de nível técnico equivalente, mediante aprovação prévia da CONTRATANTE, sem prejuízo do valor contratado; a recusa injustificada de substituto tecnicamente qualificado pela CONTRATANTE transfere a esta o ônus de eventual dano decorrente da não cobertura da data.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. A responsabilidade do(a) CONTRATADO(A) por qualquer dano direto comprovadamente causado por sua atuação fica limitada ao valor total pago pela CONTRATANTE, excluída responsabilidade por lucros cessantes, danos indiretos ou danos à imagem/reputação decorrentes de fatores alheios à sua atuação técnica direta.
12.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo ou prejuízo decorrente de: (i) ausência ou inadequação da estrutura de segurança do evento referida na cláusula 2.3; (ii) ausência de credenciamento/autorização da casa de show ou produtora referida na cláusula 2.5; (iii) danos ao equipamento do(a) CONTRATADO(A) causados por público, staff ou terceiros do evento; (iv) uso do material fora dos limites da licença concedida neste contrato; (v) disputas de direitos autorais musicais decorrentes da trilha executada ao vivo.
12.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação com a CONTRATANTE, o artista, a banda, a produtora ou a casa de show. Alterações somente por aditivo escrito.

14. DO FORO
14.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "captacao_premium_diaria",
    nome: "Captação Premium (Diária)",
    descricao: "Reserva de agenda por diária para eventos com data certa, com quitação prévia obrigatória, tabela progressiva de retenção por cancelamento e armazenamento pós-entrega transferido ao cliente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_EVENTO_OU_OCASIAO", label: "Descrição do evento/ocasião", tipo: "textarea" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "VALOR_HORA_EXCEDENTE", label: "Valor da hora excedente", tipo: "moeda" },
      { tag: "RAIO_DESLOCAMENTO_INCLUSO", label: "Raio de deslocamento incluso", tipo: "texto", exemplo: "30 km" },
      { tag: "CRITERIO_CUSTO_DESLOCAMENTO", label: "Critério de custo de deslocamento adicional", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "INDICE_DE_CORRECAO", label: "Índice de correção monetária", tipo: "texto", exemplo: "IPCA-E" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "60 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de recuperação/reenvio", tipo: "moeda" },
      { tag: "PRAZO_RETENCAO_FAIXA_1", label: "Antecedência — faixa 1 (maior)", tipo: "texto", exemplo: "90 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_2", label: "Antecedência — faixa 2", tipo: "texto", exemplo: "45 dias" },
      { tag: "PRAZO_RETENCAO_FAIXA_3", label: "Antecedência — faixa 3 (menor)", tipo: "texto", exemplo: "15 dias" },
      { tag: "PERCENTUAL_RETENCAO_12_MESES", label: "% retido — faixa 1", tipo: "percentual", exemplo: "15" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — faixa 2", tipo: "percentual", exemplo: "35" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — faixa 3", tipo: "percentual", exemplo: "60" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — abaixo da faixa 3", tipo: "percentual", exemplo: "85" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação gratuita", tipo: "texto", exemplo: "20 dias" },
      { tag: "EXCLUSIVA/NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de veiculação", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO AUDIOVISUAL POR DIÁRIA (CAPTAÇÃO PREMIUM)

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de captação audiovisual em regime de diária (reserva de agenda exclusiva por período fechado), para o evento/ocasião [DESCRICAO_DO_EVENTO_OU_OCASIAO], na data de [DATA_DO_EVENTO], no horário de [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO].
1.2. A presente modalidade caracteriza-se pela reserva integral da agenda do(a) CONTRATADO(A) para a data contratada, independentemente da duração efetiva de uso durante o período, nos termos da cláusula 7.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Horas excedentes ao período contratado na cláusula 1.1 são cobradas à parte, à razão de [VALOR_HORA_EXCEDENTE] por hora ou fração, mediante acordo prévio de disponibilidade — o(a) CONTRATADO(A) não é obrigado(a) a permanecer além do horário contratado na ausência desse acordo.
2.3. Equipamentos, deslocamento dentro do perímetro de [RAIO_DESLOCAMENTO_INCLUSO] e ajudante(s) de câmera, quando aplicável, estão inclusos no valor da diária; deslocamentos além desse perímetro são cobrados à parte conforme [CRITERIO_CUSTO_DESLOCAMENTO].

3. DO PRAZO DE ENTREGA
3.1. Entrega do material finalizado em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste pontual sobre o material entregue. Nova captação por motivo não imputável a erro técnico do(a) CONTRATADO(A) é orçada como nova diária.
4.2. Erro técnico comprovadamente atribuível ao(à) CONTRATADO(A) é corrigido sem custo adicional, quando tecnicamente possível dada a natureza do evento (eventos únicos e irrepetíveis limitam a correção ao material efetivamente captado).

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total da diária: [VALOR_DO_SERVIÇO]. Condições de pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Da quitação prévia ao evento (cláusula essencial): quando a diária destinar-se a evento com data certa e insubstituível (formatura, lançamento, evento corporativo com data fixa, etc.), o pagamento integral deve estar quitado em até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data do evento. O não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não comparecer e a não prestar o serviço, sem que isso configure inadimplemento de sua parte, e sujeita a CONTRATANTE à retenção prevista na cláusula 7 como se cancelamento fosse.
5.3. Atraso de parcela gera multa de 2%, juros de mora de 1% ao mês, correção pelo índice [INDICE_DE_CORRECAO]. O material bruto/editado só é liberado após quitação integral.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do material finalizado, cessa a obrigação do(a) CONTRATADO(A) de manter cópia do material bruto e do material entregue, podendo eliminá-los a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após a entrega, sem aviso prévio, tornando-se o armazenamento de exclusiva responsabilidade da CONTRATANTE a partir desse momento.
6.2. Caso o(a) CONTRATADO(A) ainda disponha do material dentro do prazo acima, a recuperação/reenvio é cobrada à parte no valor de [VALOR_TAXA_REENVIO], sem que a ausência de backup, decorrido o prazo, gere qualquer responsabilidade ao(à) CONTRATADO(A).

7. DA RESCISÃO, DO CANCELAMENTO E DAS MULTAS
7.1. Por se tratar de reserva exclusiva de agenda em data certa — período durante o qual o(a) CONTRATADO(A) recusa outras propostas de trabalho —, o cancelamento pela CONTRATANTE sujeita-se à seguinte tabela progressiva de retenção, calculada sobre o valor total da diária, conforme a antecedência em relação à data do evento: mais de [PRAZO_RETENCAO_FAIXA_1] de antecedência — retenção de [PERCENTUAL_RETENCAO_12_MESES]%; entre [PRAZO_RETENCAO_FAIXA_2] e [PRAZO_RETENCAO_FAIXA_1] — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre [PRAZO_RETENCAO_FAIXA_3] e [PRAZO_RETENCAO_FAIXA_2] — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; menos de [PRAZO_RETENCAO_FAIXA_3] — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; no dia do evento ou não comparecimento da CONTRATANTE ("no-show") — retenção de 100%.
7.2. Remarcação da data, quando solicitada com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e aceita pelo(a) CONTRATADO(A) mediante disponibilidade de agenda, não se sujeita à tabela de retenção acima, mas apenas uma remarcação gratuita é admitida; remarcações subsequentes seguem a tabela de retenção como novo cancelamento.
7.3. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução integral dos valores pagos, sem prejuízo de indenização por danos comprovados.

8. DOS DIREITOS AUTORAIS E DE USO DE IMAGEM
8.1. Mediante pagamento integral, o(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material entregue, de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para os fins de [MEIOS_E_TERRITORIO].
8.2. O(a) CONTRATADO(A) pode utilizar o material (ou trechos/stills) em portfólio, site e divulgação profissional, com crédito autoral, salvo pedido expresso e por escrito de embargo de divulgação por prazo determinado.
8.3. Imagens de convidados e terceiros presentes no evento: cabe à CONTRATANTE gerenciar eventuais objeções de terceiros presentes, não respondendo o(a) CONTRATADO(A) por tais reclamações.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações do evento não divulgadas publicamente pelo prazo de [PRAZO_CONFIDENCIALIDADE], especialmente relevante em eventos corporativos, lançamentos de produto ou eventos com cláusula de embargo de imprensa.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Nenhuma parte responde por atraso/cancelamento decorrente de caso fortuito ou força maior. A parte afetada comunica a outra em até 48h e propõe nova data, sem multa.
11.2. Impedimento pessoal do(a) CONTRATADO(A) para comparecer autoriza a indicação de profissional substituto de nível técnico equivalente, mediante aprovação prévia da CONTRATANTE; caso não haja substituto disponível e/ou aprovado, os valores pagos são integralmente restituídos, sem incidência de multa.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. A responsabilidade do(a) CONTRATADO(A) por qualquer dano direto comprovadamente causado por sua atuação fica limitada ao valor total pago pela CONTRATANTE, excluída responsabilidade por lucros cessantes, danos indiretos ou danos à imagem/reputação decorrentes de fatores alheios à sua atuação técnica direta.
12.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa, processo ou prejuízo decorrente de: (i) informações falsas ou incompletas sobre o evento fornecidas pela CONTRATANTE; (ii) atos de terceiros convidados/contratados pela CONTRATANTE presentes no evento; (iii) uso do material entregue fora dos limites da licença concedida neste contrato; (iv) ausência de autorização de terceiros (local do evento, outros fornecedores) para a realização da captação.
12.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

13. DAS DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

14. DO FORO
14.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA]. Assinaturas: [NOME_DO_CLIENTE] (CONTRATANTE) / [NOME_CONTRATADO] (CONTRATADO(A)).`,
  },
];
