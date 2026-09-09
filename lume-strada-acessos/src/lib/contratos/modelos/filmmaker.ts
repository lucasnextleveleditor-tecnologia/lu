import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";
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
  CLAUSULA_PORTFOLIO,
  CLAUSULA_PRAZOS_E_INSUMOS,
  CLAUSULA_VIAGEM,
  comoOpcional,
} from "./clausulas-comuns";

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
  /* ================================================================== */
  /* GRUPO 1 — CINEASTA · 1. PRODUÇÃO COMERCIAL / FASHION FILM          */
  /* ================================================================== */
  {
    perfil: "filmmaker",
    tipoServico: "producao_comercial_fashion_film",
    nome: "Produção Comercial / Fashion Film",
    descricao:
      "Comercial publicitário ou fashion film para marca, com licença de uso delimitada por praça, mídia e prazo, exclusividade de categoria opcional, controle de aprovação em três etapas e indenização por uso fora do licenciado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      ...CAMPOS_VIAGEM,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca ou produto anunciado", tipo: "texto" },
      { tag: "TIPO_DE_PECA", label: "Tipo de peça", tipo: "texto", exemplo: "fashion film de 60s + 3 cortes verticais" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis (formatos, durações, proporções)", tipo: "textarea", exemplo: "1 filme master 16:9 de 60s; 3 cortes 9:16 de 15s; 1 corte 1:1 de 30s; todos em H.264 e ProRes" },
      { tag: "QUANTIDADE_DIARIAS", label: "Quantidade de diárias de captação", tipo: "numero", exemplo: "2" },
      { tag: "LOCACOES_PREVISTAS", label: "Locações previstas", tipo: "textarea" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea", exemplo: "direção, DOP, 1º AC, gaffer, produção de set" },
      { tag: "MIDIAS_LICENCIADAS", label: "Mídias licenciadas", tipo: "textarea", exemplo: "redes sociais próprias da marca e site institucional" },
      { tag: "TERRITORIO_LICENCA", label: "Território da licença", tipo: "texto", exemplo: "território nacional" },
      { tag: "PRAZO_LICENCA", label: "Prazo da licença de uso", tipo: "texto", exemplo: "12 meses" },
      { tag: "CATEGORIA_EXCLUSIVIDADE", label: "Categoria de exclusividade (se houver)", tipo: "texto", exemplo: "moda feminina premium" },
      { tag: "PRAZO_EXCLUSIVIDADE", label: "Prazo de exclusividade de categoria", tipo: "texto", exemplo: "6 meses" },
      { tag: "VALOR_EXCLUSIVIDADE", label: "Valor da exclusividade de categoria", tipo: "moeda" },
      { tag: "VALOR_RENOVACAO_LICENCA", label: "Valor de renovação da licença", tipo: "moeda" },
      { tag: "VALOR_DIARIA_EXTRA", label: "Valor da diária extra de captação", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL PUBLICITÁRIA

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], neste ato representada na forma de seus atos constitutivos, doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas e condições a seguir, e, no que for omisso, pela Lei nº 10.406/2002 (Código Civil) e pela Lei nº 9.610/1998 (Lei de Direitos Autorais).`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a prestação, pelo CONTRATADO, dos serviços de direção, produção, captação e finalização de peça audiovisual publicitária do tipo [TIPO_DE_PECA], para a marca ou produto [NOME_DA_MARCA_OU_PRODUTO].

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo segundo. A produção compreende [QUANTIDADE_DIARIAS] diária(s) de captação, nas locações [LOCACOES_PREVISTAS], com a seguinte equipe: [COMPOSICAO_DA_EQUIPE].

Parágrafo terceiro. Diárias de captação excedentes serão remuneradas ao valor de [VALOR_DIARIA_EXTRA] cada, acrescidas das despesas de deslocamento, alimentação e equipe, na forma das cláusulas correspondentes.

Parágrafo quarto. NÃO integram o objeto, salvo contratação apartada e expressa: elenco, casting, cachês e direitos de imagem de modelos e talentos; direção de arte, cenografia, figurino, beleza e styling; locação e taxas de filmagem; licenciamento de trilha sonora e direitos musicais; locução, tradução, legendagem e closed caption; motion design e computação gráfica além do necessário à finalização básica; mídia, veiculação e impulsionamento; e versionamento para especificações técnicas de veículos ou plataformas de terceiros.

Parágrafo quinto. A concepção criativa, o roteiro, o storyboard, a decupagem e a direção são atividades intelectuais do CONTRATADO, executadas com autonomia técnica e artística dentro do briefing aprovado.`,
      },
      {
        id: "etapas_producao",
        titulo: "Das Etapas de Produção e dos Marcos de Aprovação",
        protege: "Cria pontos de aprovação formais — depois de aprovado, mudar é escopo novo e pago.",
        texto: `A produção observará as seguintes etapas, cada qual dependente da aprovação escrita da anterior: (i) briefing e alinhamento criativo; (ii) pré-produção, com apresentação de tratamento, roteiro e referências; (iii) captação; (iv) edição e apresentação de corte para aprovação; (v) finalização, com correção de cor, tratamento de som e masterização; e (vi) entrega.

Parágrafo primeiro. Cada etapa será submetida à aprovação da CONTRATANTE na forma da cláusula Da Aprovação, e a aprovação de uma etapa CONSOLIDA as decisões nela tomadas, tornando definitivo o que foi aprovado.

Parágrafo segundo. A alteração de premissa consolidada em etapa anterior — notadamente conceito, roteiro, decupagem, locação, seleção de takes, trilha ou identidade — constitui alteração de escopo, e não refação, sujeitando-se a novo orçamento, ainda que restem rodadas de refação inclusas.

Parágrafo terceiro. A captação não será iniciada sem a aprovação escrita da pré-produção e sem a comprovação, pela CONTRATANTE, das autorizações previstas na cláusula Do Direito de Imagem.

Parágrafo quarto. A correção de cor e o tratamento de som integram a etapa de finalização e não comportam refação isolada após a aprovação do corte, salvo como rodada adicional onerosa.`,
      },
      {
        id: "licenca_publicitaria",
        titulo: "Da Licença Publicitária, das Mídias e do Território",
        essencial: true,
        protege: "O uso é vendido por praça, mídia e prazo — passou disso, renova ou indeniza.",
        texto: `A licença de uso concedida à CONTRATANTE, condicionada à quitação integral do preço, compreende exclusivamente: as mídias [MIDIAS_LICENCIADAS]; o território [TERRITORIO_LICENCA]; e o prazo de [PRAZO_LICENCA] contados da data da entrega final.

Parágrafo primeiro. Ao término do prazo, a CONTRATANTE deverá cessar toda veiculação e promover a retirada da peça dos meios sob seu controle em até 15 (quinze) dias, salvo renovação formalizada por escrito mediante o pagamento de [VALOR_RENOVACAO_LICENCA] por período equivalente.

Parágrafo segundo. Permanecem excluídos da licença, salvo ajuste apartado: veiculação em televisão aberta ou fechada, cinema, mídia exterior e mídia paga; uso por franqueados, distribuidores, revendedores, marketplaces e empresas do mesmo grupo; participação em festivais e premiações em nome da CONTRATANTE; e reutilização da peça, ou de trechos dela, em campanha diversa.

Parágrafo terceiro. Material captado e não utilizado na peça final, bem como takes alternativos e brutos, NÃO integram a licença e não poderão ser aproveitados pela CONTRATANTE em nenhuma hipótese.

Parágrafo quarto. A veiculação em desacordo com esta cláusula sujeita a CONTRATANTE ao disposto na cláusula Dos Direitos Autorais, sem prejuízo da imediata suspensão da licença remanescente.`,
      },
      {
        id: "exclusividade_categoria",
        titulo: "Da Exclusividade de Categoria",
        opcional: true,
        protege: "Se o cliente quer você fora dos concorrentes dele, isso se paga à parte.",
        texto: `Mediante o pagamento adicional de [VALOR_EXCLUSIVIDADE], o CONTRATADO obriga-se a não prestar serviços de mesma natureza a empresas concorrentes da CONTRATANTE atuantes na categoria [CATEGORIA_EXCLUSIVIDADE], pelo prazo de [PRAZO_EXCLUSIVIDADE] contados da data da entrega final.

Parágrafo primeiro. A exclusividade restringe-se à categoria expressamente indicada, não alcançando outros segmentos, marcas ou linhas de produto, tampouco trabalhos de natureza diversa.

Parágrafo segundo. Não havendo o pagamento previsto no caput, NÃO HÁ EXCLUSIVIDADE, permanecendo o CONTRATADO livre para atender qualquer cliente, inclusive concorrentes, sem que isso configure violação contratual, conflito de interesses ou quebra de confiança.

Parágrafo terceiro. A exclusividade não implica reserva de agenda: a disponibilidade do CONTRATADO para novos trabalhos da CONTRATANTE dependerá de contratação específica.`,
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
  /* GRUPO 1 — CINEASTA · 2. VIDEOCLIPES                                */
  /* ================================================================== */
  {
    perfil: "filmmaker",
    tipoServico: "videoclipes",
    nome: "Videoclipes",
    descricao:
      "Direção e produção de videoclipe musical, com declaração obrigatória de titularidade do fonograma, crédito de direção assegurado, regras de set noturno e divisão clara entre o que é da gravadora e o que é do diretor.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      ...CAMPOS_VIAGEM,
      { tag: "NOME_DO_ARTISTA", label: "Nome do artista/banda", tipo: "texto" },
      { tag: "NOME_DA_MUSICA", label: "Nome da música", tipo: "texto" },
      { tag: "GRAVADORA_OU_SELO", label: "Gravadora/selo (se houver)", tipo: "texto" },
      { tag: "DURACAO_APROXIMADA", label: "Duração aproximada do clipe", tipo: "texto", exemplo: "3 min 40s" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "clipe master 16:9 4K; 3 teasers verticais de 15s; 10 stills de set" },
      { tag: "QUANTIDADE_DIARIAS", label: "Diárias de captação", tipo: "numero", exemplo: "1" },
      { tag: "LOCACOES_PREVISTAS", label: "Locações previstas", tipo: "textarea" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "DATA_DE_LANCAMENTO", label: "Data prevista de lançamento", tipo: "data" },
      { tag: "PRAZO_EMBARGO_PORTFOLIO", label: "Embargo de divulgação até o lançamento", tipo: "texto", exemplo: "até a estreia oficial" },
      { tag: "VALOR_DIARIA_EXTRA", label: "Valor da diária extra", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DIREÇÃO E PRODUÇÃO DE VIDEOCLIPE

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
        texto: `Constitui objeto deste contrato a prestação, pelo CONTRATADO, dos serviços de direção, produção, captação e finalização do videoclipe da obra musical "[NOME_DA_MUSICA]", de interpretação de [NOME_DO_ARTISTA], com duração aproximada de [DURACAO_APROXIMADA].

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo segundo. A produção compreende [QUANTIDADE_DIARIAS] diária(s) de captação, nas locações [LOCACOES_PREVISTAS], com a equipe [COMPOSICAO_DA_EQUIPE]. Diárias excedentes serão remuneradas a [VALOR_DIARIA_EXTRA] cada.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: elenco, figurantes, dançarinos e respectivos cachês; direção de arte, cenografia, figurino, maquiagem e caracterização; locação e taxas; efeitos visuais complexos, rotoscopia e computação gráfica; playback, equipamento de som e técnico de áudio em set; registro fotográfico profissional de bastidores; e distribuição, cadastro em plataformas, submissão a canais e mídia.

Parágrafo quarto. A concepção audiovisual, o roteiro, o storyboard e a direção são criação intelectual do CONTRATADO, executados com autonomia artística dentro do conceito aprovado.`,
      },
      {
        id: "titularidade_musical",
        titulo: "Da Titularidade da Obra Musical e do Fonograma",
        essencial: true,
        protege: "Se a música não estiver liberada, o problema é de quem contratou — não seu.",
        texto: `A CONTRATANTE DECLARA, sob as penas da lei, ser titular ou legítima licenciada de todos os direitos necessários à sincronização audiovisual da obra musical e do respectivo fonograma objeto deste contrato, incluindo os direitos de autor da composição e da letra, os direitos conexos de intérprete, de músicos acompanhantes e de produtor fonográfico, bem como as autorizações de eventuais samples, interpolações, arranjos e participações especiais.

Parágrafo primeiro. Compete exclusivamente à CONTRATANTE o cadastro da obra junto às associações de gestão coletiva e ao ECAD, o recolhimento de direitos autorais e conexos devidos, e a obtenção da anuência de gravadora, editora ou selo [GRAVADORA_OU_SELO], quando aplicável.

Parágrafo segundo. O CONTRATADO NÃO responde, sob nenhum fundamento, por reclamação, notificação, bloqueio de monetização, remoção de conteúdo, claim automatizado, suspensão de canal ou ação judicial decorrente de vício na titularidade musical, obrigando-se a CONTRATANTE a assumir o polo passivo, a requerer a exclusão do CONTRATADO da lide e a ressarci-lo integralmente.

Parágrafo terceiro. Constatando o CONTRATADO indício de irregularidade na cadeia de direitos, poderá suspender a execução ou a entrega até a comprovação documental, sem que a suspensão configure atraso de sua parte.

Parágrafo quarto. A obra audiovisual produzida é obra AUTÔNOMA em relação à obra musical: a titularidade da música não confere à CONTRATANTE a autoria do videoclipe, cuja disciplina é a da cláusula Dos Direitos Autorais.`,
      },
      {
        id: "credito_de_direcao",
        titulo: "Do Crédito de Direção e da Divulgação",
        protege: "Garante seu nome na peça — é isso que gera o próximo trabalho.",
        texto: `A CONTRATANTE obriga-se a consignar, de forma legível e em posição de destaque compatível com a prática do mercado, o crédito de direção e de produção audiovisual em favor do CONTRATADO, na cartela final do videoclipe e na descrição de todas as publicações oficiais em plataformas de vídeo e redes sociais.

Parágrafo primeiro. O crédito adotará a grafia indicada pelo CONTRATADO e não poderá ser suprimido, abreviado a ponto de descaracterizar, nem substituído pelo nome da CONTRATANTE, de gravadora, de agência ou de terceiro que não tenha exercido a função.

Parágrafo segundo. A supressão do crédito viola direito moral de autor, na forma do art. 24, inciso II, da Lei nº 9.610/1998, e sujeita a CONTRATANTE à obrigação de correção imediata e ao pagamento de multa equivalente a 30% (trinta por cento) do valor do contrato, sem prejuízo das perdas e danos.

Parágrafo terceiro. Em versões de duração reduzida, teasers e cortes verticais, o crédito poderá constar apenas da descrição da publicação.

Parágrafo quarto. O CONTRATADO observará embargo de divulgação [PRAZO_EMBARGO_PORTFOLIO], liberando-se o uso em portfólio a partir do lançamento oficial previsto para [DATA_DE_LANCAMENTO], ou antes disso mediante autorização escrita.`,
      },
      {
        id: "set_e_talento",
        titulo: "Do Set, do Artista e da Disponibilidade de Talento",
        protege: "Atraso, ausência ou artista sem condições de gravar não vira prejuízo seu.",
        texto: `A CONTRATANTE responsabiliza-se pela presença pontual do artista, do elenco e dos demais talentos no local e horário previstos na ordem do dia, bem como por sua adequada condição para a execução das cenas planejadas.

Parágrafo primeiro. Atraso superior a 2 (duas) horas, ausência injustificada ou impossibilidade de gravação por condição do talento — inclusive por indisposição decorrente do consumo de álcool ou de substâncias — caracteriza DIÁRIA PERDIDA por culpa da CONTRATANTE, devida integralmente, com todos os custos de equipe, equipamento e locação, sem direito a reexecução gratuita.

Parágrafo segundo. É vedado à CONTRATANTE, ao artista e a terceiros determinar a captação em desacordo com as recomendações de segurança do CONTRATADO, notadamente em altura, água, via pública sem interdição, proximidade de fogo, pirotecnia, animais ou veículos em movimento; a insistência autoriza a interrupção imediata, permanecendo devida a diária.

Parágrafo terceiro. A gravação em período noturno, quando prevista, observará o adicional da cláusula Da Jornada, e a alteração do plano de filmagem no próprio dia, por conveniência da CONTRATANTE, corre por conta e risco desta.

Parágrafo quarto. O CONTRATADO poderá registrar imagens de bastidores para fins da cláusula Do Uso em Portfólio, respeitado o embargo de divulgação pactuado.`,
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
  /* GRUPO 1 — CINEASTA · 3. DOCUMENTÁRIOS                              */
  /* ================================================================== */
  {
    perfil: "filmmaker",
    tipoServico: "documentarios",
    nome: "Documentários",
    descricao:
      "Produção documental por etapas, com releases de entrevistados, liberdade editorial pactuada, tratamento de material de arquivo de terceiros, festivais e crédito de direção assegurado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      ...CAMPOS_VIAGEM,
      { tag: "TEMA_DO_DOCUMENTARIO", label: "Tema do documentário", tipo: "texto" },
      { tag: "DURACAO_APROXIMADA", label: "Duração aproximada", tipo: "texto", exemplo: "26 min" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea", exemplo: "1 documentário de 26 min; 1 trailer de 90s; 5 cortes de 60s para redes" },
      { tag: "NUMERO_ENTREVISTAS", label: "Nº de entrevistas previstas", tipo: "numero", exemplo: "8" },
      { tag: "QUANTIDADE_DIARIAS", label: "Diárias de captação", tipo: "numero", exemplo: "5" },
      { tag: "LOCACOES_PREVISTAS", label: "Locações/cidades previstas", tipo: "textarea" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "PRAZO_ETAPA_PESQUISA", label: "Prazo da etapa de pesquisa", tipo: "texto", exemplo: "20 dias" },
      { tag: "PRAZO_ETAPA_CAPTACAO", label: "Prazo da etapa de captação", tipo: "texto", exemplo: "30 dias" },
      { tag: "PRAZO_ETAPA_MONTAGEM", label: "Prazo da etapa de montagem", tipo: "texto", exemplo: "45 dias" },
      { tag: "VALOR_DIARIA_EXTRA", label: "Valor da diária extra", tipo: "moeda" },
      { tag: "PERCENTUAL_PREMIACAO", label: "% do prêmio devido ao contratado em festivais", tipo: "percentual", exemplo: "50" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DOCUMENTAL

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
        texto: `Constitui objeto deste contrato a pesquisa, a direção, a produção, a captação e a montagem de obra documental sobre o tema [TEMA_DO_DOCUMENTARIO], com duração aproximada de [DURACAO_APROXIMADA].

Parágrafo primeiro. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo segundo. A produção compreende até [NUMERO_ENTREVISTAS] entrevistas e [QUANTIDADE_DIARIAS] diária(s) de captação, nas locações [LOCACOES_PREVISTAS], com a equipe [COMPOSICAO_DA_EQUIPE]. Entrevistas e diárias excedentes serão orçadas à parte, à razão de [VALOR_DIARIA_EXTRA] por diária.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: licenciamento de material de arquivo de terceiros; trilha original e licenciamento musical; narração e locução profissional; tradução, legendagem e closed caption; produção executiva de captação de recursos, leis de incentivo e prestação de contas; inscrição em festivais e taxas correspondentes; distribuição e exibição.

Parágrafo quarto. A obra documental é criação intelectual do CONTRATADO, executada com autonomia editorial e artística dentro do tema e do recorte pactuados.`,
      },
      {
        id: "etapas_documental",
        titulo: "Das Etapas, dos Marcos e do Pagamento por Etapa",
        protege: "Cada fase é paga ao ser entregue — o cliente não segura tudo até o fim.",
        texto: `A execução observará as etapas de (i) pesquisa e roteiro, no prazo de [PRAZO_ETAPA_PESQUISA]; (ii) captação, no prazo de [PRAZO_ETAPA_CAPTACAO]; e (iii) montagem e finalização, no prazo de [PRAZO_ETAPA_MONTAGEM], contados na forma da cláusula Dos Prazos.

Parágrafo primeiro. Cada etapa constitui marco autônomo de aprovação e de pagamento: concluída e aprovada a etapa, ou operada a aprovação tácita, torna-se exigível a parcela a ela vinculada, ainda que as etapas seguintes não tenham sido iniciadas.

Parágrafo segundo. A aprovação do roteiro e do recorte editorial consolida a linha narrativa. Mudança posterior de tema, de personagens, de recorte ou de tese constitui alteração de escopo, ainda que motivada por fato superveniente.

Parágrafo terceiro. Material captado e não aproveitado na montagem final permanece na esfera do CONTRATADO, não integra a entrega e não poderá ser exigido pela CONTRATANTE, salvo contratação apartada de cessão de brutos.

Parágrafo quarto. A interrupção do projeto por decisão da CONTRATANTE após o início da captação obriga ao pagamento integral das etapas iniciadas e das diárias já reservadas, na forma da cláusula Da Rescisão.`,
      },
      {
        id: "releases_entrevistados",
        titulo: "Das Autorizações de Entrevistados e do Material de Arquivo",
        essencial: true,
        protege: "Documentário sem release liberado é processo esperando acontecer — e não é seu.",
        texto: `Toda pessoa entrevistada ou retratada firmará termo de autorização de uso de imagem, voz e depoimento (release), previamente à captação, cabendo à CONTRATANTE providenciar, coletar e arquivar os termos, salvo se expressamente atribuída essa tarefa ao CONTRATADO mediante remuneração específica.

Parágrafo primeiro. Tratando-se de menor de idade, pessoa com deficiência ou pessoa em situação de vulnerabilidade, o termo será firmado por representante legal, com observância das cautelas éticas aplicáveis.

Parágrafo segundo. A CONTRATANTE responde pela licitude e pela suficiência do licenciamento de todo material de arquivo, fotografia, documento, obra de arte, trecho audiovisual ou fonograma de terceiro que fornecer ou solicitar que seja incorporado à obra, respondendo regressivamente perante o CONTRATADO por qualquer pretensão de titular.

Parágrafo terceiro. Havendo revogação de autorização por entrevistado após a montagem, a substituição, a supressão ou a reedição do trecho constitui alteração de escopo onerosa, salvo se a revogação decorrer de conduta imputável ao CONTRATADO.

Parágrafo quarto. O CONTRATADO poderá recusar a inclusão de material cuja origem não seja documentalmente comprovada, sem que a recusa configure inadimplemento.`,
      },
      {
        id: "liberdade_editorial",
        titulo: "Da Liberdade Editorial e da Integridade da Obra",
        protege: "Impede que o cliente transforme documentário em publicidade depois de pronto.",
        texto: `As partes reconhecem que a obra documental possui natureza editorial e autoral, e que a sua credibilidade depende da integridade do tratamento dado ao tema.

Parágrafo primeiro. A CONTRATANTE poderá apontar imprecisões factuais, riscos jurídicos concretos e inadequações de ordem técnica, que serão examinados pelo CONTRATADO de boa-fé. Não constitui apontamento válido, contudo, a exigência de supressão de conteúdo verídico, de inclusão de mensagem publicitária não pactuada, de alteração de depoimento fora de contexto ou de qualquer intervenção que desfigure o sentido da obra.

Parágrafo segundo. A imposição de alteração que viole o disposto no parágrafo anterior autoriza o CONTRATADO a: (i) recusar a alteração; (ii) exigir a supressão do seu crédito de direção, mantida a remuneração integral; ou (iii) rescindir o contrato por justa causa imputável à CONTRATANTE.

Parágrafo terceiro. É assegurado ao CONTRATADO o crédito de direção e de roteiro na obra, em cartela e em toda divulgação oficial, sendo a supressão do crédito violação de direito moral de autor.

Parágrafo quarto. A inscrição da obra em festivais, mostras e premiações dependerá de acordo escrito entre as partes; havendo premiação em dinheiro atribuída à obra, caberá ao CONTRATADO o percentual de [PERCENTUAL_PREMIACAO]%, salvo se o regulamento do festival dispuser de forma diversa.`,
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
  /* GRUPO 1 — CINEASTA · 4. TURNÊS E SHOWS                             */
  /* ================================================================== */
  {
    perfil: "filmmaker",
    tipoServico: "turnes_e_shows",
    nome: "Turnês e Shows",
    descricao:
      "Cobertura audiovisual de turnê multi-data, com logística e credenciamento por conta do contratante, segurança em ambiente de multidão, entregas em fluxo durante a estrada e tabela de retenção por data cancelada.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      ...CAMPOS_VIAGEM,
      { tag: "NOME_DO_ARTISTA", label: "Artista/banda", tipo: "texto" },
      { tag: "NOME_DA_TURNE", label: "Nome da turnê", tipo: "texto" },
      { tag: "NUMERO_DE_DATAS", label: "Nº de datas contratadas", tipo: "numero", exemplo: "8" },
      { tag: "CIDADES_DA_TURNE", label: "Cidades e datas", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por data", tipo: "textarea", exemplo: "1 aftermovie de 90s em até 24h; 5 cortes verticais; 20 stills selecionados" },
      { tag: "PRAZO_ENTREGA_EM_ESTRADA", label: "Prazo de entrega do material do dia", tipo: "texto", exemplo: "24 horas" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "VALOR_POR_DATA", label: "Valor por data", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — cancelamento com mais de 30 dias", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_15_DIAS", label: "% retido — entre 30 e 15 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_7_DIAS", label: "% retido — entre 15 e 7 dias", tipo: "percentual", exemplo: "80" },
      { tag: "PERCENTUAL_RETENCAO_VESPERA", label: "% retido — menos de 7 dias", tipo: "percentual", exemplo: "100" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL DE TURNÊ

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
        texto: `Constitui objeto deste contrato a cobertura audiovisual da turnê "[NOME_DA_TURNE]", de [NOME_DO_ARTISTA], compreendendo [NUMERO_DE_DATAS] datas, nas seguintes cidades: [CIDADES_DA_TURNE].

Parágrafo primeiro. Os entregáveis, por data, compreendem: [DESCRICAO_DOS_ENTREGAVEIS], com a equipe [COMPOSICAO_DA_EQUIPE].

Parágrafo segundo. O valor por data é de [VALOR_POR_DATA], e datas acrescidas à turnê após a assinatura serão contratadas ao mesmo valor, sujeitas à disponibilidade de agenda do CONTRATADO, que não se obriga a aceitá-las.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: transmissão ao vivo, streaming e switching multicâmera; captação e mixagem de áudio da mesa de som, que dependerá de disponibilização de sinal pela produção da turnê; registro fotográfico dedicado; documentário de turnê; e material de divulgação anterior às datas.

Parágrafo quarto. O CONTRATADO tem liberdade de posicionamento e de escolha de planos, respeitadas as restrições de palco e de segurança comunicadas previamente pela produção.`,
      },
      {
        id: "logistica_turne",
        titulo: "Da Logística, do Credenciamento e do Acesso",
        essencial: true,
        protege: "Sem credencial e acesso liberado não há filmagem — e a diária continua devida.",
        texto: `Correrão por conta exclusiva da CONTRATANTE, para toda a equipe do CONTRATADO e em todas as datas: transporte entre cidades, hospedagem, alimentação, translado local entre hotel, aeroporto e local do show, e as respectivas taxas.

Parágrafo primeiro. A CONTRATANTE providenciará, com antecedência mínima de 48 (quarenta e oito) horas de cada data, credenciamento nominal com acesso a palco, fosso, backstage, camarim e área técnica, conforme necessário à execução, bem como a inclusão da equipe nas listas de acesso da casa de espetáculo, do promotor local e da equipe de segurança.

Parágrafo segundo. A ausência, o atraso ou a insuficiência de credenciamento que impeça, restrinja ou reduza a cobertura NÃO exonera a CONTRATANTE do pagamento da data, tampouco autoriza reclamação quanto à extensão do material entregue.

Parágrafo terceiro. Restrições impostas pela produção, pela casa de espetáculo, pelo artista, por patrocinador ou por emissora — vedação de filmagem em determinado bloco, limitação de posições, proibição de luz auxiliar, embargo de trechos — serão comunicadas ao CONTRATADO com a maior antecedência possível e reduzem proporcionalmente a expectativa de material, sem redução do preço.

Parágrafo quarto. Alterações de roteiro da turnê, cancelamento ou remarcação de datas serão comunicadas imediatamente, aplicando-se a cláusula Do Cancelamento de Datas.

Parágrafo quinto. A CONTRATANTE assegurará à equipe local seguro para guarda e carregamento de equipamento, ponto de energia, e acesso a áreas de trabalho compatíveis com a operação de câmera.`,
      },
      {
        id: "seguranca_multidao",
        titulo: "Da Segurança em Ambiente de Show e Multidão",
        essencial: true,
        protege: "Ambiente de show tem risco real — e a decisão de recuar é técnica, não negociável.",
        texto: `As partes reconhecem que a execução se dá em ambiente de aglomeração, com riscos inerentes de tumulto, empurrões, pirotecnia, efeitos de palco, estruturas em altura, pisos molhados, fumaça cênica e iluminação estroboscópica.

Parágrafo primeiro. A CONTRATANTE, por si ou pela produção local, obriga-se a manter plano de segurança, brigada, rotas de fuga sinalizadas, controle de lotação e equipe de apoio, na forma da legislação e das normas do corpo de bombeiros aplicáveis, respondendo pelo cumprimento dessas obrigações.

Parágrafo segundo. O CONTRATADO e sua equipe poderão recuar, reposicionar-se ou interromper a captação, a qualquer momento e a critério técnico exclusivo, diante de risco concreto à integridade física ou ao equipamento, sem que isso configure descumprimento contratual nem gere direito a abatimento.

Parágrafo terceiro. Danos ao equipamento causados por público, por efeitos de palco, por estrutura da produção ou por falha de segurança serão ressarcidos pela CONTRATANTE, na forma da cláusula Do Equipamento.

Parágrafo quarto. É vedada à CONTRATANTE a determinação de posicionamento em local interditado, em estrutura sem laudo, em altura sem ancoragem ou em área de circulação de público sem isolamento; a insistência autoriza a interrupção imediata, permanecendo devida a data.

Parágrafo quinto. Havendo interrupção do show por caso fortuito, força maior, determinação de autoridade ou decisão da produção, a data será considerada realizada para fins de pagamento, entregando-se o material efetivamente captado.`,
      },
      {
        id: "entregas_em_estrada",
        titulo: "Das Entregas em Fluxo Durante a Turnê",
        protege: "Define prazo real de estrada e impede cobrança de edição feita em ônibus.",
        texto: `O material de cada data será entregue no prazo de [PRAZO_ENTREGA_EM_ESTRADA] contados do encerramento do show, observadas as condições reais de conectividade e deslocamento durante a turnê.

Parágrafo primeiro. O prazo do caput fica automaticamente suspenso enquanto a equipe estiver em deslocamento aéreo ou rodoviário, ou em local sem conexão de internet com velocidade de upload compatível com o volume do material, retomando-se a fluência quando cessada a causa.

Parágrafo segundo. As entregas em fluxo têm caráter de material de divulgação imediata e comportam, no máximo, 1 (uma) rodada de ajuste pontual por data, a ser solicitada em até 12 (doze) horas do recebimento. Findo esse prazo, o material reputa-se aprovado.

Parágrafo terceiro. O material consolidado da turnê, quando contratado, observará o prazo geral da cláusula Dos Prazos, contado do encerramento da última data.

Parágrafo quarto. A CONTRATANTE se obriga a realizar o download integral de cada entrega em até 30 (trinta) dias, sob pena de aplicar-se o disposto na cláusula Do Backup.`,
      },
      {
        id: "cancelamento_datas",
        titulo: "Do Cancelamento e da Remarcação de Datas",
        essencial: true,
        protege: "Data cancelada em cima da hora é agenda perdida — e agenda perdida se paga.",
        texto: `O cancelamento de data por iniciativa da CONTRATANTE, do artista, da produção ou do promotor local sujeita-a à retenção dos seguintes percentuais do valor da data cancelada, a título de compensação pela reserva de agenda e pela recusa de outras contratações no período:

(i) cancelamento com mais de 30 (trinta) dias de antecedência: [PERCENTUAL_RETENCAO_30_DIAS]%;
(ii) entre 30 e 15 dias de antecedência: [PERCENTUAL_RETENCAO_15_DIAS]%;
(iii) entre 15 e 7 dias de antecedência: [PERCENTUAL_RETENCAO_7_DIAS]%;
(iv) com menos de 7 (sete) dias de antecedência: [PERCENTUAL_RETENCAO_VESPERA]%.

Parágrafo primeiro. Aos percentuais acima somam-se, integralmente, as despesas já incorridas e não reembolsáveis — passagens, hospedagem, locações e contratações de equipe —, ainda que a retenção seja parcial.

Parágrafo segundo. A remarcação de data para novo dia em que o CONTRATADO tenha disponibilidade, comunicada com antecedência mínima de 15 (quinze) dias, não sofrerá retenção, correndo por conta da CONTRATANTE apenas as diferenças de custo logístico. Não havendo disponibilidade de agenda, a remarcação equivale a cancelamento.

Parágrafo terceiro. O cancelamento de mais de 30% (trinta por cento) das datas contratadas autoriza o CONTRATADO a considerar rescindido o contrato quanto ao saldo, aplicando-se a cláusula Da Rescisão.

Parágrafo quarto. Cancelamento por caso fortuito ou força maior devidamente comprovados observará a cláusula correspondente, ressalvado o ressarcimento das despesas não reembolsáveis.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ALIMENTACAO,
      CLAUSULA_JORNADA,
      comoOpcional(CLAUSULA_VIAGEM, false),
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
  /* GRUPO 1 — CINEASTA · 5. CAPTAÇÃO PREMIUM (DIÁRIA)                  */
  /* ================================================================== */
  {
    perfil: "filmmaker",
    tipoServico: "captacao_premium_diaria",
    nome: "Captação Premium (Diária)",
    descricao:
      "Reserva de agenda por diária para data certa, com quitação prévia obrigatória, tabela progressiva de retenção por cancelamento, hora extra definida e material bruto fora da entrega.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_DRONE,
      ...CAMPOS_VIAGEM,
      { tag: "DATA_DO_EVENTO", label: "Data da diária", tipo: "data" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto", exemplo: "8h" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário previsto de término", tipo: "texto", exemplo: "18h" },
      { tag: "LOCAL_DA_CAPTACAO", label: "Local da captação", tipo: "texto" },
      { tag: "FINALIDADE_DA_CAPTACAO", label: "Finalidade da captação", tipo: "textarea", exemplo: "captação de imagens institucionais da fábrica para uso interno e site" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "COMPOSICAO_DA_EQUIPE", label: "Composição da equipe", tipo: "textarea" },
      { tag: "EQUIPAMENTO_PREVISTO", label: "Equipamento previsto", tipo: "textarea", exemplo: "1 corpo cinema, 3 lentes primes, tripé, slider, kit de LED, 2 lapelas" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes da data", tipo: "texto", exemplo: "5 dias" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — mais de 30 dias antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_15_DIAS", label: "% retido — entre 30 e 15 dias", tipo: "percentual", exemplo: "50" },
      { tag: "PERCENTUAL_RETENCAO_7_DIAS", label: "% retido — entre 15 e 7 dias", tipo: "percentual", exemplo: "80" },
      { tag: "PERCENTUAL_RETENCAO_VESPERA", label: "% retido — menos de 7 dias", tipo: "percentual", exemplo: "100" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Antecedência p/ remarcar sem multa", tipo: "texto", exemplo: "15 dias" },
      { tag: "VALOR_CESSAO_BRUTOS", label: "Valor da cessão de arquivos brutos", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO AUDIOVISUAL POR DIÁRIA

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
        texto: `Constitui objeto deste contrato a prestação de serviços de captação audiovisual em regime de diária, no dia [DATA_DO_EVENTO], das [HORARIO_DE_INICIO] às [HORARIO_DE_TERMINO], no local [LOCAL_DA_CAPTACAO], com a seguinte finalidade: [FINALIDADE_DA_CAPTACAO].

Parágrafo primeiro. A execução compreende a equipe [COMPOSICAO_DA_EQUIPE] e o equipamento [EQUIPAMENTO_PREVISTO], podendo o CONTRATADO substituir itens por outros de especificação equivalente ou superior.

Parágrafo segundo. Os entregáveis compreendem: [DESCRICAO_DOS_ENTREGAVEIS].

Parágrafo terceiro. A diária destina-se à CAPTAÇÃO. Edição, montagem, correção de cor, tratamento de som, motion design e versionamento somente integram o objeto se expressamente descritos no parágrafo anterior; do contrário, serão orçados à parte.

Parágrafo quarto. NÃO integram o objeto, salvo contratação apartada: elenco, locução, cenografia, locação, alimentação de convidados, transmissão ao vivo e registro fotográfico dedicado.`,
      },
      {
        id: "reserva_de_agenda",
        titulo: "Da Reserva de Agenda e da Quitação Prévia",
        essencial: true,
        protege: "A data só fica bloqueada com o valor pago — reserva sem pagamento não existe.",
        texto: `A assinatura deste contrato e o pagamento do sinal implicam o BLOQUEIO da agenda do CONTRATADO para a data contratada, com a consequente recusa de outras propostas para o mesmo dia, razão pela qual a data reservada tem valor econômico autônomo.

Parágrafo primeiro. O saldo do preço deverá estar integralmente quitado até [PRAZO_QUITACAO_ANTES_EVENTO] antes da data contratada.

Parágrafo segundo. Não verificada a quitação no prazo do parágrafo anterior, o CONTRATADO poderá, a seu exclusivo critério e mediante simples comunicação escrita, LIBERAR A AGENDA e não comparecer, hipótese em que os valores já pagos serão retidos a título de compensação, na forma da cláusula Do Cancelamento, sem que disso decorra inadimplemento de sua parte.

Parágrafo terceiro. A reserva é personalíssima quanto à data e ao objeto, e não pode ser transferida a terceiro, cedida ou convertida em crédito para outra finalidade sem anuência escrita do CONTRATADO.

Parágrafo quarto. Havendo contratação de diárias adicionais, cada uma observará, isoladamente, o regime desta cláusula.`,
      },
      {
        id: "cancelamento_diaria",
        titulo: "Do Cancelamento, da Remarcação e da Retenção",
        essencial: true,
        protege: "Quanto mais perto da data, mais caro desistir — porque a agenda já foi perdida.",
        texto: `O cancelamento por iniciativa da CONTRATANTE sujeita-a à retenção dos seguintes percentuais do valor total do contrato:

(i) com mais de 30 (trinta) dias de antecedência da data: [PERCENTUAL_RETENCAO_30_DIAS]%;
(ii) entre 30 e 15 dias: [PERCENTUAL_RETENCAO_15_DIAS]%;
(iii) entre 15 e 7 dias: [PERCENTUAL_RETENCAO_7_DIAS]%;
(iv) com menos de 7 (sete) dias: [PERCENTUAL_RETENCAO_VESPERA]%.

Parágrafo primeiro. Somam-se à retenção, integralmente, as despesas já incorridas e não reembolsáveis, notadamente passagens, hospedagem, locação de equipamento e contratação de equipe de apoio.

Parágrafo segundo. A remarcação para nova data, solicitada com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade na agenda do CONTRATADO, não sofrerá retenção, admitida UMA única remarcação por contrato; a segunda remarcação equivale a cancelamento. Não havendo disponibilidade, a solicitação de remarcação equivale a cancelamento.

Parágrafo terceiro. O não comparecimento da CONTRATANTE, a ausência de acesso ao local, a indisponibilidade das pessoas ou dos bens a serem filmados, ou a impossibilidade de execução por causa a ela imputável, no dia contratado, equivalem a cancelamento com menos de 7 (sete) dias, sendo devido o valor integral.

Parágrafo quarto. Cancelamento por caso fortuito ou força maior comprovados observará a cláusula correspondente, ressalvado o ressarcimento das despesas não reembolsáveis e das diárias de equipe já contratadas.`,
      },
      {
        id: "brutos_e_cessao",
        titulo: "Do Material Bruto e da Cessão Opcional",
        protege: "Bruto é instrumento de trabalho: só sai se for vendido, e vendido com regra.",
        texto: `Os arquivos brutos de captação, os projetos de edição, as timelines, os presets e os LUTs constituem instrumento de trabalho do CONTRATADO e NÃO integram a entrega.

Parágrafo primeiro. Havendo interesse da CONTRATANTE, a cessão dos arquivos brutos poderá ser contratada à parte, pelo valor de [VALOR_CESSAO_BRUTOS], mediante disponibilização em mídia física ou transferência digital, correndo por conta da CONTRATANTE o custo da mídia.

Parágrafo segundo. A cessão de brutos NÃO transfere direitos autorais sobre a obra, não autoriza a sua reedição por terceiros com atribuição de autoria diversa, e obriga a CONTRATANTE a não divulgar material bruto de forma que possa comprometer a reputação técnica do CONTRATADO.

Parágrafo terceiro. Cedidos os brutos, cessa toda e qualquer responsabilidade do CONTRATADO pela guarda, integridade, legibilidade e backup desse material, aplicando-se, no que couber, a cláusula Do Backup.

Parágrafo quarto. Não contratada a cessão, os arquivos brutos poderão ser eliminados pelo CONTRATADO após o prazo previsto na cláusula Do Backup.`,
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
];
