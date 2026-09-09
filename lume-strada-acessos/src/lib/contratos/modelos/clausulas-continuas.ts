import type { CampoDinamicoModelo, ClausulaModelo } from "./tipos";

/**
 * Cláusulas de quem presta serviço TODO MÊS, e não por projeto.
 *
 * Gestão de redes, tráfego pago, retenção de design, SAC, assessoria — são
 * contratos de trato sucessivo, e o que os quebra não é o que quebra um
 * projeto. Aqui os problemas são outros: o cliente que some e depois cobra o
 * mês inteiro de uma vez; a demanda que cresce sem o preço crescer; a conta
 * de anúncio no nome do prestador; a expectativa de resultado tratada como
 * promessa; o cancelamento na véspera do décimo mês.
 *
 * Estas cláusulas respondem a isso. As de projeto continuam em
 * `clausulas-comuns.ts`, e os dois bancos se somam num mesmo contrato.
 */

export const CAMPOS_SERVICO_CONTINUO: CampoDinamicoModelo[] = [
  { tag: "VIGENCIA_MESES", label: "Vigência inicial (meses)", tipo: "numero", exemplo: "6" },
  { tag: "DIA_DE_VENCIMENTO", label: "Dia do vencimento mensal", tipo: "numero", exemplo: "5" },
  { tag: "VALOR_MENSAL", label: "Valor mensal", tipo: "moeda" },
  { tag: "HORARIO_DE_ATENDIMENTO", label: "Horário de atendimento", tipo: "texto", exemplo: "segunda a sexta, das 9h às 18h" },
  { tag: "PRAZO_RESPOSTA_SLA", label: "Prazo de resposta a solicitações", tipo: "texto", exemplo: "1 dia útil" },
  { tag: "PRAZO_RESPOSTA_URGENCIA", label: "Prazo de resposta em urgência", tipo: "texto", exemplo: "4 horas úteis" },
  { tag: "VOLUME_MENSAL_CONTRATADO", label: "Volume mensal contratado", tipo: "textarea", exemplo: "12 posts estáticos, 8 reels, 20 stories" },
  { tag: "VALOR_PECA_EXCEDENTE", label: "Valor da peça excedente", tipo: "moeda" },
  { tag: "DIA_ENVIO_PAUTA", label: "Dia de envio da pauta do mês seguinte", tipo: "texto", exemplo: "dia 20" },
  { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo do cliente para aprovar a pauta", tipo: "texto", exemplo: "3 dias úteis" },
  { tag: "PRAZO_AVISO_NAO_RENOVACAO", label: "Aviso prévio de não renovação", tipo: "texto", exemplo: "30 dias" },
  { tag: "PERIODICIDADE_RELATORIO", label: "Periodicidade do relatório", tipo: "texto", exemplo: "mensal" },
  { tag: "PERIODICIDADE_REUNIAO", label: "Periodicidade das reuniões", tipo: "texto", exemplo: "quinzenal, 1 hora" },
];

export const CAMPOS_TRAFEGO: CampoDinamicoModelo[] = [
  { tag: "PLATAFORMAS_DE_MIDIA", label: "Plataformas de mídia", tipo: "textarea", exemplo: "Meta Ads e Google Ads" },
  { tag: "VERBA_MENSAL_MIDIA", label: "Verba mensal de mídia prevista", tipo: "moeda" },
  { tag: "PERCENTUAL_SOBRE_VERBA", label: "% de gestão sobre a verba (se houver)", tipo: "percentual", exemplo: "15" },
  { tag: "PRAZO_APORTE_VERBA", label: "Antecedência do aporte da verba", tipo: "texto", exemplo: "5 dias úteis" },
];

export const CAMPOS_MARCA: CampoDinamicoModelo[] = [
  { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Nome da marca", tipo: "texto" },
  { tag: "NUMERO_PROPOSTAS_CONCEITO", label: "Nº de propostas de conceito", tipo: "numero", exemplo: "2" },
  { tag: "ENTREGAVEIS_MARCA", label: "Entregáveis da marca", tipo: "textarea", exemplo: "logo principal, versões monocromática e reduzida, paleta, tipografia, manual em PDF, arquivos abertos" },
  { tag: "VALOR_CESSAO_ARQUIVOS_ABERTOS", label: "Valor da cessão de arquivos abertos", tipo: "moeda" },
];

/* ==================================================================== */
/* ROTINA E VOLUME                                                       */
/* ==================================================================== */

export const CLAUSULA_ROTINA_E_ATENDIMENTO: ClausulaModelo = {
  id: "rotina_atendimento",
  titulo: "Da Rotina de Trabalho, do Atendimento e dos Prazos de Resposta",
  protege: "Dá previsibilidade ao cliente e devolve ao prestador o direito de ter fim de semana.",
  texto: `O atendimento ocorrerá em [HORARIO_DE_ATENDIMENTO], pelos canais oficiais indicados na cláusula Das Comunicações.

Parágrafo primeiro. O CONTRATADO responderá às solicitações da CONTRATANTE no prazo de [PRAZO_RESPOSTA_SLA], contado do primeiro horário útil seguinte ao recebimento. Situações classificadas de comum acordo como urgentes — notadamente crise de imagem, conteúdo publicado com erro e queda de campanha em veiculação — observarão o prazo de [PRAZO_RESPOSTA_URGENCIA].

Parágrafo segundo. Mensagens enviadas fora do horário de atendimento, em finais de semana ou feriados serão tratadas no primeiro horário útil seguinte, salvo urgência na forma do parágrafo anterior. A ausência de resposta imediata fora do horário NÃO configura descumprimento contratual.

Parágrafo terceiro. São previstas reuniões de alinhamento com periodicidade [PERIODICIDADE_REUNIAO], agendadas com antecedência mínima de 48 (quarenta e oito) horas. Reuniões adicionais, ou reuniões que excedam a duração pactuada por conveniência da CONTRATANTE, poderão ser cobradas à parte, mediante aviso prévio.

Parágrafo quarto. O CONTRATADO apresentará relatório [PERIODICIDADE_RELATORIO] com o que foi executado no período e os indicadores acompanhados, documento que serve de prestação de contas à CONTRATANTE e de registro do cumprimento deste contrato.

Parágrafo quinto. Períodos de férias ou recesso do CONTRATADO serão comunicados com antecedência mínima de 30 (trinta) dias, com indicação de cobertura ou de reprogramação das entregas do período, sem redução do valor mensal quando o volume contratado for integralmente cumprido no mês.`,
};

export const CLAUSULA_VOLUME_E_EXCEDENTE: ClausulaModelo = {
  id: "volume_excedente",
  titulo: "Do Volume Mensal Contratado e das Peças Excedentes",
  essencial: true,
  protege: "Impede o escopo de inchar de graça — o que passa do combinado é orçado.",
  texto: `O volume mensal contratado é de [VOLUME_MENSAL_CONTRATADO], compreendendo concepção, produção, revisão e publicação ou entrega, conforme o caso.

Parágrafo primeiro. O volume é apurado por mês-calendário e NÃO É CUMULATIVO: peças não solicitadas ou não aprovadas dentro do mês não se transferem para o mês seguinte, tampouco geram crédito, abatimento ou restituição, dado que a disponibilidade da equipe foi reservada e remunerada naquele período.

Parágrafo segundo. Peças que excedam o volume contratado serão produzidas mediante solicitação escrita e cobrança adicional de [VALOR_PECA_EXCEDENTE] por peça, faturadas junto com a mensalidade do mês subsequente.

Parágrafo terceiro. A CONTRATANTE poderá solicitar, uma vez por trimestre e por escrito, a redistribuição do volume entre os formatos contratados, desde que preservado o esforço técnico equivalente e comunicada a alteração com antecedência mínima de 10 (dez) dias do início do mês de referência.

Parágrafo quarto. A ampliação permanente do volume será formalizada por termo aditivo, com o correspondente ajuste do valor mensal.

Parágrafo quinto. A ausência de demanda da CONTRATANTE em determinado mês não reduz nem suspende a mensalidade, que remunera a disponibilidade, a reserva de equipe e a estrutura mantida à sua disposição.`,
};

export const CLAUSULA_PAUTA_E_APROVACAO_MENSAL: ClausulaModelo = {
  id: "pauta_mensal",
  titulo: "Da Pauta, do Calendário e da Aprovação Mensal",
  protege: "Sem pauta aprovada não há publicação — e o silêncio do cliente não trava o mês.",
  texto: `O CONTRATADO submeterá à CONTRATANTE, até [DIA_ENVIO_PAUTA] de cada mês, a pauta do mês subsequente, contendo temas, formatos, datas de publicação e responsabilidades de cada parte.

Parágrafo primeiro. A CONTRATANTE manifestar-se-á no prazo de [PRAZO_APROVACAO_PAUTA], aprovando a pauta ou apresentando ajustes de uma só vez. Decorrido o prazo sem manifestação, a pauta reputa-se APROVADA e o CONTRATADO fica autorizado a executá-la, não podendo a CONTRATANTE, depois, recusar peça produzida em conformidade com ela.

Parágrafo segundo. Insumos de responsabilidade da CONTRATANTE — fotos de produto, informações de promoção, preços, disponibilidade de estoque, agenda de eventos, aprovação de campanhas sazonais — deverão ser entregues até 5 (cinco) dias úteis antes da data de publicação prevista. A entrega intempestiva desloca a publicação, sem que isso configure atraso do CONTRATADO nem reduza o volume devido no mês.

Parágrafo terceiro. Alterações de pauta solicitadas após a aprovação, quando implicarem refazer peça já produzida, consomem rodada de refação e, esgotadas estas, são tratadas como peça excedente.

Parágrafo quarto. Datas comemorativas, sazonalidades e campanhas institucionais da CONTRATANTE deverão ser informadas com antecedência mínima de 30 (trinta) dias para que integrem a pauta do mês correspondente.`,
};

export const CLAUSULA_VIGENCIA_E_RENOVACAO: ClausulaModelo = {
  id: "vigencia_renovacao",
  titulo: "Da Vigência, da Renovação e do Encerramento",
  essencial: true,
  protege: "Contrato de trato sucessivo com prazo, renovação automática e saída avisada.",
  texto: `Este contrato vigorará pelo prazo inicial de [VIGENCIA_MESES] meses, contados da data de assinatura, renovando-se automaticamente por períodos iguais e sucessivos caso nenhuma das partes manifeste, por escrito, a intenção de não renovar com antecedência mínima de [PRAZO_AVISO_NAO_RENOVACAO] do termo final.

Parágrafo primeiro. O prazo inicial existe porque serviço de trato sucessivo exige montagem: estudo do negócio, definição de linha editorial, calibragem de campanhas e construção de audiência produzem resultado ao longo do tempo, e não no primeiro mês. Por isso a rescisão dentro do prazo inicial observa a multa da cláusula Da Rescisão.

Parágrafo segundo. A mensalidade de [VALOR_MENSAL] vence todo dia [DIA_DE_VENCIMENTO], independentemente do volume efetivamente demandado no período, e o primeiro mês é devido integralmente ainda que o contrato inicie no curso dele, salvo pactuação de proporcionalidade.

Parágrafo terceiro. Encerrado o contrato, por qualquer motivo, o CONTRATADO: (i) entregará, em até 10 (dez) dias, os materiais produzidos e já quitados; (ii) devolverá acessos, senhas e ferramentas da CONTRATANTE; e (iii) prestará informações necessárias à transição para novo prestador, limitadas ao que produziu, sem obrigação de treinar terceiros ou de entregar métodos, processos e ferramentas próprios.

Parágrafo quarto. Peças produzidas e não veiculadas até o encerramento serão entregues à CONTRATANTE se já quitadas; do contrário, permanecem com o CONTRATADO até a quitação.

Parágrafo quinto. Nenhuma parte poderá exigir da outra a continuidade do vínculo após o encerramento regular, ressalvadas as obrigações que sobrevivem por força da cláusula Da Rescisão.`,
};

/* ==================================================================== */
/* ACESSOS, VERBA E PLATAFORMAS                                          */
/* ==================================================================== */

export const CLAUSULA_ACESSOS_E_CONTAS: ClausulaModelo = {
  id: "acessos_contas",
  titulo: "Dos Acessos, das Contas e da Titularidade dos Perfis",
  essencial: true,
  protege: "A conta é do cliente e continua sendo — e ninguém fica refém de senha de ninguém.",
  texto: `Os perfis, páginas, contas de anúncio, gerenciadores de negócio, domínios, listas e demais ativos digitais da CONTRATANTE são e permanecem de sua exclusiva titularidade, ainda que criados ou configurados pelo CONTRATADO no curso deste contrato.

Parágrafo primeiro. A CONTRATANTE concederá ao CONTRATADO acesso por meio de permissão delegada em gerenciador próprio — e não por compartilhamento de senha pessoal —, no nível estritamente necessário à execução, obrigando-se a mantê-lo ativo enquanto durar o contrato.

Parágrafo segundo. O CONTRATADO obriga-se a: não alterar titularidade, e-mail de recuperação, telefone ou administradores das contas sem autorização escrita; não vincular os ativos da CONTRATANTE a estruturas de sua propriedade de forma que impeça a transferência; e devolver ou revogar todos os acessos em até 5 (cinco) dias úteis do encerramento do contrato.

Parágrafo terceiro. Quando, por exigência da plataforma, algum ativo tiver de ser criado sob estrutura do CONTRATADO, este se obriga a transferi-lo à CONTRATANTE ao término do contrato, no prazo e na forma que a plataforma permitir, sendo vedada a retenção de ativo como meio de coerção para pagamento — o que não afasta a cobrança do débito pelos meios próprios.

Parágrafo quarto. A CONTRATANTE responde pela conformidade dos seus ativos com as políticas das plataformas e pela regularidade cadastral e fiscal exigida por elas, bem como pelas consequências de bloqueio, suspensão ou banimento decorrentes de fatos anteriores a este contrato ou de conduta sua.

Parágrafo quinto. Cada parte responde pelo sigilo das credenciais sob sua guarda, comunicando imediatamente à outra qualquer suspeita de comprometimento.`,
};

export const CLAUSULA_VERBA_DE_MIDIA: ClausulaModelo = {
  id: "verba_de_midia",
  titulo: "Da Verba de Mídia e da Sua Natureza",
  essencial: true,
  protege: "Deixa claro que a verba não é receita do prestador — e que sem aporte não há campanha.",
  texto: `A verba destinada ao investimento em mídia nas plataformas [PLATAFORMAS_DE_MIDIA] é de responsabilidade exclusiva da CONTRATANTE, NÃO INTEGRA a remuneração do CONTRATADO e não constitui receita sua, ainda que transite por meio de cartão, conta ou instrumento por ele operado.

Parágrafo primeiro. A verba mensal prevista é de [VERBA_MENSAL_MIDIA], devendo estar disponível na conta de anúncio com antecedência mínima de [PRAZO_APORTE_VERBA] do início do período de veiculação. A ausência ou insuficiência de verba suspende a veiculação, sem que isso configure descumprimento do CONTRATADO nem reduza a sua remuneração.

Parágrafo segundo. Sempre que possível, o pagamento da mídia será feito por meio de cartão ou conta de titularidade da própria CONTRATANTE. Havendo adiantamento pelo CONTRATADO, a título excepcional e mediante ajuste escrito, o valor será reembolsado integralmente em até 5 (cinco) dias úteis da apresentação do comprovante, acrescido dos encargos financeiros incorridos, aplicando-se em caso de atraso a cláusula Do Preço.

Parágrafo terceiro. Sendo a remuneração calculada como percentual sobre a verba, no montante de [PERCENTUAL_SOBRE_VERBA]%, a base de cálculo é o valor efetivamente investido no período, apurado pelo relatório da própria plataforma.

Parágrafo quarto. A CONTRATANTE terá acesso permanente aos relatórios nativos das plataformas, que prevalecem sobre qualquer planilha ou apresentação, e reconhece que os números ali constantes são apurados pela plataforma, não pelo CONTRATADO.

Parágrafo quinto. Reprovações de anúncio, bloqueios de conta, alterações de política, variações de leilão, de custo por resultado e de alcance são fatos próprios das plataformas, alheios ao controle do CONTRATADO, e observam a cláusula Das Plataformas de Terceiros.`,
};

export const CLAUSULA_PLATAFORMAS_TERCEIROS: ClausulaModelo = {
  id: "plataformas_terceiros",
  titulo: "Das Plataformas de Terceiros e da Ausência de Garantia de Resultado",
  essencial: true,
  protege: "Nenhum profissional sério promete número — e aqui isso fica escrito e explicado.",
  texto: `As partes reconhecem que a execução depende de plataformas operadas por terceiros, cujas regras, algoritmos, políticas de conteúdo, mecanismos de leilão, preços e disponibilidade são definidos unilateralmente por elas e podem mudar a qualquer tempo, sem aviso.

Parágrafo primeiro. A obrigação do CONTRATADO é de MEIO: executar o serviço com técnica, diligência e boas práticas do mercado. NÃO HÁ, e não poderia haver, garantia de alcance, seguidores, engajamento, cliques, leads, vendas, faturamento, retorno sobre investimento, posicionamento em busca ou aprovação de anúncio — resultados que dependem de fatores fora do controle das partes, como concorrência, sazonalidade, preço, qualidade do produto, capacidade de atendimento da CONTRATANTE e comportamento do público.

Parágrafo segundo. Projeções, estimativas, metas e cenários eventualmente apresentados têm caráter meramente ilustrativo e de planejamento, não constituindo promessa, garantia ou obrigação de resultado, e assim devem ser lidos por ambas as partes.

Parágrafo terceiro. O CONTRATADO não responde por queda de alcance, reprovação de anúncio, restrição de conta, suspensão, banimento, exclusão de conteúdo, perda de dados ou indisponibilidade praticados pelas plataformas, ainda que decorrentes de erro delas.

Parágrafo quarto. A CONTRATANTE obriga-se a fornecer informação verídica e a não exigir do CONTRATADO conteúdo, alegação publicitária ou prática que viole a legislação aplicável, o Código de Defesa do Consumidor, as normas do CONAR ou as políticas das plataformas; a exigência nesse sentido autoriza a recusa e, persistindo, a rescisão por justa causa.

Parágrafo quinto. Havendo penalidade aplicada pela plataforma em razão de conteúdo, produto, promoção ou informação fornecidos pela CONTRATANTE, esta responderá integralmente, inclusive perante terceiros.`,
};

/* ==================================================================== */
/* MARCA E ARQUIVOS ABERTOS                                              */
/* ==================================================================== */

export const CLAUSULA_CESSAO_DE_MARCA: ClausulaModelo = {
  id: "cessao_de_marca",
  titulo: "Da Cessão de Direitos sobre a Marca Criada",
  essencial: true,
  protege: "O cliente precisa ser dono do logo de verdade — e o autor mantém crédito e portfólio.",
  texto: `Diferentemente das demais obras deste banco de contratos, a identidade visual criada destina-se a identificar permanentemente a CONTRATANTE no mercado, razão pela qual, mediante o pagamento integral do preço, o CONTRATADO CEDE E TRANSFERE à CONTRATANTE, em caráter definitivo, universal, irrevogável e por prazo indeterminado, a totalidade dos direitos patrimoniais de autor sobre os elementos aprovados da marca [NOME_DA_MARCA_OU_PRODUTO].

Parágrafo primeiro. A cessão abrange o uso em qualquer meio, suporte, território e finalidade, inclusive comercial, publicitária e institucional, bem como o direito de registrar a marca perante o INPI e órgãos equivalentes no exterior, de licenciá-la, de franqueá-la e de transferi-la a terceiros junto com o negócio.

Parágrafo segundo. A cessão alcança exclusivamente os elementos APROVADOS e entregues. Propostas não escolhidas, estudos, rascunhos, alternativas descartadas e material de processo permanecem com o CONTRATADO e não poderão ser utilizados pela CONTRATANTE — utilizá-los equivale a uso de obra não licenciada, na forma da cláusula Dos Direitos Autorais.

Parágrafo terceiro. A cessão patrimonial não alcança os direitos morais, que são inalienáveis: fica assegurado ao CONTRATADO o direito de ser reconhecido como autor da criação e de exibi-la em portfólio, na forma da cláusula Do Uso em Portfólio.

Parágrafo quarto. O CONTRATADO declara que a criação é original e de sua autoria, e que não reproduz conscientemente obra de terceiro, respondendo por dolo ou culpa grave nesse sentido. NÃO SE OBRIGA, contudo, a realizar busca de anterioridade marcária, atividade técnica e jurídica autônoma, cabendo à CONTRATANTE promovê-la antes do registro e do lançamento, por profissional habilitado.

Parágrafo quinto. Indeferimento, oposição ou nulidade de registro perante o INPI decorrentes de colidência com marca de terceiro não constituem vício do serviço nem geram direito a restituição, ressalvada a hipótese do parágrafo anterior; havendo necessidade de adequação, esta será orçada como alteração de escopo, com desconto do trabalho já aproveitado.`,
};

export const CLAUSULA_ARQUIVOS_ABERTOS: ClausulaModelo = {
  id: "arquivos_abertos",
  titulo: "Dos Arquivos Abertos e Editáveis",
  protege: "Separa o que é entrega do que é ferramenta de trabalho, sem deixar o cliente na mão.",
  texto: `Integram a entrega os arquivos finais, nos formatos de uso descritos na cláusula Do Objeto, aptos a serem aplicados pela CONTRATANTE sem necessidade de software especializado, salvo quando a natureza do material exigir o contrário.

Parágrafo primeiro. Os arquivos ABERTOS e editáveis — projetos de camadas, arquivos vetoriais de trabalho, bibliotecas de componentes, arquivos de prototipagem e demais elementos de processo — constituem instrumento de trabalho do CONTRATADO e somente integram a entrega quando expressamente previsto na cláusula Do Objeto ou mediante contratação apartada, pelo valor de [VALOR_CESSAO_ARQUIVOS_ABERTOS].

Parágrafo segundo. Tratando-se de identidade visual, integram OBRIGATORIAMENTE a entrega, independentemente de contratação adicional, os arquivos vetoriais da marca aprovada em formato editável e universal, sem o que a CONTRATANTE ficaria impedida de aplicar a própria marca — o que contrariaria a finalidade da cessão.

Parágrafo terceiro. Entregues os arquivos abertos, cessa a responsabilidade do CONTRATADO por alterações neles promovidas por terceiros, e a obra alterada não poderá ser apresentada como de sua autoria.

Parágrafo quarto. Fontes tipográficas, imagens de banco, ícones, mockups e plugins de terceiros utilizados na criação estão sujeitos às licenças de seus titulares, que não são transferidas por este contrato: o CONTRATADO informará quais foram empregados e as respectivas condições, cabendo à CONTRATANTE adquirir as licenças necessárias ao uso continuado.`,
};

export const CLAUSULA_HOMOLOGACAO_TECNICA: ClausulaModelo = {
  id: "homologacao_tecnica",
  titulo: "Da Homologação Técnica e do Ambiente de Referência",
  opcional: true,
  protege: "Define onde o trabalho tem de funcionar — e impede a cobrança por navegador do ano passado.",
  texto: `O material digital será homologado nos ambientes de referência descritos na cláusula Do Objeto, considerando-se as duas versões estáveis mais recentes dos navegadores de maior participação de mercado e os sistemas operacionais móveis em suporte oficial do fabricante na data da entrega.

Parágrafo primeiro. Comportamentos divergentes em navegadores, dispositivos, sistemas ou versões fora do ambiente de referência não constituem vício e serão tratados, se desejada a adequação, como alteração de escopo.

Parágrafo segundo. O CONTRATADO empregará boas práticas de acessibilidade e de desempenho compatíveis com o escopo contratado; auditoria formal de acessibilidade, certificação e testes automatizados de conformidade não integram o objeto, salvo contratação expressa.

Parágrafo terceiro. A integração com serviços de terceiros — meios de pagamento, ferramentas de automação, CRM, sistemas legados da CONTRATANTE — depende de documentação, credenciais e ambiente de teste fornecidos por ela, e o mau funcionamento decorrente de limitação, alteração ou indisponibilidade desses serviços não é imputável ao CONTRATADO.

Parágrafo quarto. Hospedagem, domínio, certificado, licenças de software, manutenção evolutiva e suporte técnico continuado não integram o objeto, salvo contratação apartada.`,
};

/** Bloco que os contratos de trato sucessivo repetem. */
export const CLAUSULAS_DE_ROTINA: ClausulaModelo[] = [
  CLAUSULA_VOLUME_E_EXCEDENTE,
  CLAUSULA_PAUTA_E_APROVACAO_MENSAL,
  CLAUSULA_ROTINA_E_ATENDIMENTO,
  CLAUSULA_VIGENCIA_E_RENOVACAO,
];
