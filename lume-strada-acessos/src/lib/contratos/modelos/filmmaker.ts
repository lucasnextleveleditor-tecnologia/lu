import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/**
 * Banco de modelos de contrato do perfil FILMMAKER — 5 tipos de serviço.
 * Ver `tipos.ts` para a convenção de `[TAG]` e o formulário lateral.
 *
 * IMPORTANTE (mesmo aviso do arquivo .md entregue ao usuário): estes textos
 * foram redigidos com padrão jurídico profissional, mas NÃO substituem a
 * revisão de um advogado antes do uso em produção com clientes reais.
 */
export const MODELOS_FILMMAKER: ModeloContratoServico[] = [
  {
    perfil: "filmmaker",
    tipoServico: "producao_comercial_fashion_film",
    nome: "Produção Comercial / Fashion Film",
    descricao: "Comerciais publicitários e fashion films para marcas, com licença de uso por prazo/mídia definidos.",
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
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "10 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL COMERCIAL/FASHION FILM

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrito(a) no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE.

CONTRATADO(A): [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito(a) no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO(A).

As partes têm entre si justo e contratado o presente instrumento, regido pelas cláusulas a seguir.

1. DO OBJETO
1.1. Prestação, pelo(a) CONTRATADO(A), de serviços de produção audiovisual do tipo [TIPO_DE_PECA], para a marca/produto [NOME_DA_MARCA_OU_PRODUTO], compreendendo pré-produção, captação e pós-produção (edição, color grading e finalização).

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Captação prevista para [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO], com equipe técnica de [COMPOSICAO_DA_EQUIPE].
2.3. Itens não listados no escopo (talentos adicionais, casting, still photography avulsa, direção de arte, trilha licenciada) serão orçados e formalizados em aditivo à parte.
2.4. Cabe à CONTRATANTE fornecer briefing, aprovar moodboard/roteiro e liberar ambientes/modelos necessários, sob pena de suspensão dos prazos enquanto perdurar a pendência.

3. DO PRAZO DE ENTREGA
3.1. Entrega do material finalizado em até [PRAZO_DE_ENTREGA] dias corridos, contados da captação ou da aprovação do roteiro/moodboard, o que ocorrer por último.
3.2. Atrasos motivados pela CONTRATANTE (aprovação, materiais, locais/talentos) suspendem a contagem do prazo, sem penalidade ao(à) CONTRATADO(A).

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste pontual (ritmo, trilha, cor, legendas) sobre o corte entregue, sem nova captação nem reestruturação da narrativa já aprovada.
4.2. Rodadas adicionais ou nova captação por motivo não imputável a erro técnico (mudança de direção criativa, troca de talento já aprovado, alteração de briefing pós-aprovação) serão cobradas à parte, no mínimo [PERCENTUAL_CUSTO_REFACAO]% do valor total por rodada/diária adicional.
4.3. Erro técnico comprovadamente atribuível ao(à) CONTRATADO(A) é corrigido sem custo à CONTRATANTE, respeitada a disponibilidade de agenda para reagendamento.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. O não pagamento do sinal autoriza o(a) CONTRATADO(A) a não iniciar/suspender a pré-produção, sem caracterizar inadimplemento de sua parte.
5.3. Atraso de qualquer parcela gera multa de 2%, juros de mora de 1% ao mês e correção monetária pelo índice [INDICE_DE_CORRECAO], pro rata die.
5.4. Os arquivos finais em alta resolução só são liberados após quitação integral.

6. DA CESSÃO DE DIREITOS AUTORAIS E DE USO DE IMAGEM
6.1. Mediante pagamento integral, o(a) CONTRATADO(A) cede à CONTRATANTE os direitos patrimoniais de uso da obra, de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para veiculação em [MEIOS_E_TERRITORIO].
6.2. Usos além do prazo/território/meios acima dependem de negociação e pagamento adicional de licença ampliada.
6.3. O(a) CONTRATADO(A) pode usar o material (ou trechos/still frames) em portfólio, site, redes sociais e divulgação profissional, com crédito autoral, salvo pedido expresso e por escrito de embargo de divulgação por prazo determinado, formulado pela CONTRATANTE antes da entrega.
6.4. Cabe à CONTRATANTE providenciar e apresentar, antes da captação, os termos de autorização de uso de imagem ("releases") de modelos/atores/figurantes, isentando o(a) CONTRATADO(A) de responsabilidade por reclamação de imagem de terceiros da produção.
6.5. Fica reconhecida ao(à) CONTRATADO(A), nos termos da Lei nº 9.610/98, a autoria da obra, vedada alteração da montagem final que a associe, sem consentimento, ao nome profissional do(a) CONTRATADO(A) de forma depreciativa.

7. DA RESCISÃO E DAS MULTAS
7.1. Rescisão por qualquer parte mediante aviso por escrito com [PRAZO_AVISO_RESCISAO] de antecedência, respeitadas obrigações já vencidas.
7.2. Cancelamento pela CONTRATANTE após confirmação de agenda: mais de 7 dias — retenção de 30% do sinal; entre 7 e 2 dias — retenção de 50% do valor total; menos de 48h ou no-show — retenção de 100% do valor total, a título de multa compensatória.
7.3. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução dos valores de etapas não realizadas, sem prejuízo de indenização por danos comprovados.
7.4. A rescisão não desobriga a CONTRATANTE do pagamento pelos serviços já prestados até a data da rescisão.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre informações estratégicas, comerciais, criativas e de bastidores pelo prazo de [PRAZO_CONFIDENCIALIDADE] após o encerramento do contrato.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais compartilhados em razão deste contrato conforme a Lei nº 13.709/2018, exclusivamente para as finalidades aqui previstas, com eliminação/anonimização ao término da finalidade, ressalvadas obrigações legais de guarda.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior (clima severo, desastres, falhas de infraestrutura pública, determinação governamental, pandemias). A parte afetada comunica a outra em até 48h e propõe nova data, sem multa.

11. DISPOSIÇÕES GERAIS
11.1. Este contrato não gera vínculo empregatício, societário ou de representação entre as partes.
11.2. Alterações só valem por escrito, assinadas por ambas as partes (aditivo).
11.3. Tolerância quanto a descumprimento não implica novação ou renúncia de direitos.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA], com renúncia a qualquer outro, por mais privilegiado que seja.

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)
Testemunha 1: _______________
Testemunha 2: _______________`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "videoclipes",
    nome: "Videoclipes",
    descricao: "Direção e produção de videoclipe musical, com licença de sincronização de responsabilidade do cliente e crédito de direção garantido.",
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
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DIREÇÃO E PRODUÇÃO DE VIDEOCLIPE

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Direção, produção, captação e pós-produção de videoclipe para a obra musical "[NOME_DA_MUSICA]", do(a) artista [NOME_DO_ARTISTA].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Captação prevista para [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. Declaração de titularidade musical: a CONTRATANTE declara, sob as penas da lei, ser titular ou possuir a devida licença de sincronização sobre a música "[NOME_DA_MUSICA]" para associação com a peça audiovisual, isentando o(a) CONTRATADO(A) de responsabilidade por violação de direitos autorais musicais de terceiros.

3. DO PRAZO
3.1. Entrega do corte final em até [PRAZO_DE_ENTREGA] dias corridos após a captação e aprovação da trilha/letra timada, quando aplicável.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste de edição/color/efeitos. Nova captação por mudança de conceito criativo pós-aprovação de roteiro/storyboard é cobrada como diária adicional de [VALOR_DIARIA_ADICIONAL].

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Master em alta resolução liberado somente após quitação integral.

6. DOS DIREITOS AUTORAIS, CRÉDITO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso e exploração comercial do videoclipe (YouTube, redes sociais, streaming, TV) pelo prazo de [PRAZO_DA_LICENCA_DE_USO].
6.2. É assegurado ao(à) CONTRATADO(A) crédito de direção ("Dirigido por [NOME_CONTRATADO]") em toda veiculação oficial, inclusive submissões a festivais e premiações.
6.3. Fica facultado ao(à) CONTRATADO(A) submeter a obra a festivais e usá-la em portfólio, ressalvado pedido de embargo por prazo determinado, solicitado por escrito antes do lançamento oficial.
6.4. Direitos de imagem de artista(s), dançarinos e figurantes devem ser previamente equacionados pela CONTRATANTE (ou pelo(a) CONTRATADO(A), mediante acordo e custo adicional), com coleta das respectivas autorizações.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE: mais de 7 dias — retenção de 30% do sinal; entre 7 e 2 dias — 50% do valor total; menos de 48h ou no-show — 100% do valor total.
7.2. Descumprimento pelo(a) CONTRATADO(A) sem justa causa: devolução dos valores de etapas não realizadas, sem prejuízo de indenização por danos comprovados.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre lançamento não divulgado, conceito criativo e datas pelo prazo de [PRAZO_CONFIDENCIALIDADE], dada a sensibilidade de estratégias de lançamento musical.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018, restrito às finalidades deste contrato.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os mesmos termos do modelo geral, incluindo intempéries que impeçam locação externa.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito. Tolerância não implica renúncia de direitos.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "documentarios",
    nome: "Documentários",
    descricao: "Produção documental por marcos/etapas, com releases de entrevistados e crédito de direção assegurado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "TEMA_DO_DOCUMENTARIO", label: "Tema do documentário", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "MARCOS_DO_CRONOGRAMA", label: "Marcos do cronograma", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO DE OBRA DOCUMENTAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de obra documental sobre o tema "[TEMA_DO_DOCUMENTARIO]", compreendendo pesquisa, roteirização, captação de entrevistas/depoimentos e imagens de apoio, e pós-produção.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cronograma por marcos: [MARCOS_DO_CRONOGRAMA], dada a natureza de produção continuada deste tipo de projeto.
2.3. Compete à CONTRATANTE viabilizar acesso a locações, fontes e entrevistados necessários.

3. DO PRAZO
3.1. Prazo total de produção: [PRAZO_DE_ENTREGA], contado da aprovação do roteiro/tratamento inicial, podendo ser dividido em entregas parciais por marco.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste na montagem final. Reestruturação de narrativa após aprovação do corte de exibição, novas entrevistas não previstas, ou nova captação por decisão editorial da CONTRATANTE são orçadas à parte.
4.2. Erros técnicos de captação atribuíveis ao(à) CONTRATADO(A) são corrigidos sem custo, na medida do tecnicamente possível (ressalvados depoimentos/eventos históricos irrepetíveis).

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO], pago em parcelas vinculadas aos marcos de entrega: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS AUTORAIS, DEPOIMENTOS E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de exploração da obra conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. Cabe à CONTRATANTE (ou, mediante acordo, ao(à) CONTRATADO(A) durante a captação) coletar releases de imagem e depoimento de todas as pessoas entrevistadas/identificáveis, sem os quais os respectivos trechos não podem ser usados/exibidos.
6.3. É assegurado ao(à) CONTRATADO(A) crédito de direção/produção e o direito de submeter a obra a festivais, mostras e premiações, e usá-la em portfólio, ressalvado embargo por prazo determinado antes do lançamento oficial.
6.4. Direitos de distribuição comercial pertencem à CONTRATANTE, salvo coprodução formalizada em aditivo específico.
6.5. Material de arquivo, fotos históricas ou imagens de terceiros necessários à obra têm seus direitos de uso equacionados e custeados pela CONTRATANTE.

7. DA RESCISÃO E MULTAS
7.1. Rescisão unilateral pela CONTRATANTE após início da pesquisa/captação: pagamento proporcional aos marcos cumpridos, acrescido de multa de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.
7.2. Cancelamento de diária já agendada: mais de 7 dias — 30% de retenção; entre 7 e 2 dias — 50%; menos de 48h ou no-show — 100%.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre conteúdo sensível de entrevistas e material não editado pelo prazo de [PRAZO_CONFIDENCIALIDADE], especialmente quando o tema envolver dados sensíveis dos entrevistados.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e depoimentos conforme a Lei nº 13.709/2018, com consentimento específico para uso de imagem e voz.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os mesmos termos do modelo geral.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "turnes_e_shows",
    nome: "Turnês e Shows",
    descricao: "Cobertura audiovisual multi-data de turnês/shows, com diária de deslocamento e regras específicas de cancelamento por data.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_ARTISTA_OU_EVENTO", label: "Artista/evento", tipo: "texto" },
      { tag: "DATAS_DA_TURNE", label: "Datas da turnê", tipo: "textarea" },
      { tag: "QUANTIDADE_DE_DATAS", label: "Quantidade de datas", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por data", tipo: "textarea" },
      { tag: "VALOR_DIARIA_DESLOCAMENTO", label: "Valor da diária de deslocamento", tipo: "moeda" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_QUENTE", label: "Prazo de entrega do conteúdo \"quente\"", tipo: "texto", exemplo: "48 horas" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas (aftermovie)", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória (cancelamento da turnê)", tipo: "percentual", exemplo: "40" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL DE TURNÊ/SHOWS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura audiovisual (registro, direção e edição) dos eventos da turnê/shows de [NOME_DO_ARTISTA_OU_EVENTO], nas datas e locais listados em anexo.

2. DO ESCOPO
2.1. Datas contratadas: [DATAS_DA_TURNE], totalizando [QUANTIDADE_DE_DATAS] apresentações.
2.2. Entregáveis por data: [DESCRICAO_DOS_ENTREGAVEIS].
2.3. Correm por conta da CONTRATANTE, salvo disposição em contrário: transporte, hospedagem e alimentação da equipe nas datas fora da cidade-sede do(a) CONTRATADO(A), a título de diária de deslocamento de [VALOR_DIARIA_DESLOCAMENTO], além de credenciamento/acesso.
2.4. Compete à CONTRATANTE viabilizar junto à produção do evento os acessos e autorizações necessários, isentando o(a) CONTRATADO(A) por restrições impostas por terceiros.

3. DO PRAZO DE ENTREGA
3.1. Conteúdo para redes sociais: entrega em até [PRAZO_ENTREGA_CONTEUDO_QUENTE] após cada data.
3.2. Aftermovie/material final consolidado: entrega em até [PRAZO_DE_ENTREGA] dias corridos após o encerramento da turnê.

4. DAS REVISÕES E REFAÇÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste no aftermovie final. Não há refilmagem de momentos não captados por indisponibilidade de acesso, falha de terceiros ou imprevistos do show; o(a) CONTRATADO(A) responde apenas por falhas de equipamento/operação sob seu controle direto.

5. DO VALOR E PAGAMENTO
5.1. Valor total do pacote: [VALOR_DO_SERVIÇO], pago conforme [CONDICOES_DE_PAGAMENTO], acrescido das diárias de deslocamento previstas na cláusula 2.

6. DOS DIREITOS AUTORAIS E DE IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA], para fins promocionais do(a) artista/evento.
6.2. É assegurado ao(à) CONTRATADO(A) crédito e uso do material em portfólio, ressalvado embargo por prazo determinado solicitado por escrito.
6.3. Direitos de imagem do público presente seguem os termos gerais do próprio evento, cabendo à CONTRATANTE assegurar sua existência junto ao promotor local.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento de data(s) já confirmada(s): mais de 15 dias — retenção de 20% do valor da(s) data(s); entre 15 e 5 dias — 50%; menos de 5 dias ou no-show — 100%.
7.2. Cancelamento de toda a turnê após a assinatura: retenção de [PERCENTUAL_MULTA_RESCISORIA]% do valor total do pacote.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre setlist, bastidores, itinerário e informações de segurança pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Cancelamento do show pela produção/casa de eventos, clima, segurança ou determinação de autoridade desobrigam ambas as partes quanto à data afetada, sem multa, buscando-se remarcação sempre que possível.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "filmmaker",
    tipoServico: "captacao_premium_diaria",
    nome: "Captação Premium (Diária)",
    descricao: "Serviço avulso de captação por diária — entrega padrão é material bruto (raw), edição é opcional e cobrada à parte.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_PROJETO", label: "Descrição do projeto/evento", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária da diária", tipo: "texto", exemplo: "até 8 horas" },
      { tag: "COMPOSICAO_DA_EQUIPE_E_EQUIPAMENTO", label: "Equipe e equipamento", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS_EDICAO", label: "Entregáveis da edição (se contratada)", tipo: "textarea" },
      { tag: "VALOR_ADICIONAL_EDICAO", label: "Valor adicional de edição", tipo: "moeda" },
      { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra", tipo: "moeda" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO AUDIOVISUAL POR DIÁRIA (PREMIUM)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Serviço avulso de captação audiovisual premium, por diária, para o projeto [DESCRICAO_DO_PROJETO], na data de [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].

2. DO ESCOPO
2.1. A diária compreende [CARGA_HORARIA_DIARIA] de captação com [COMPOSICAO_DA_EQUIPE_E_EQUIPAMENTO].
2.2. O entregável contratual padrão desta modalidade é o material bruto (raw footage) captado no dia, salvo contratação expressa da etapa de edição (cláusula 2.3).
2.3. Havendo contratação de edição: entregável de [DESCRICAO_DOS_ENTREGAVEIS_EDICAO], mediante acréscimo de [VALOR_ADICIONAL_EDICAO] ao valor da diária.
2.4. Horas excedentes são cobradas como hora extra, no valor de [VALOR_HORA_EXTRA] por hora ou fração superior a 30 minutos.

3. DO PRAZO DE ENTREGA
3.1. Entrega do material bruto selecionado (ou editado, se contratado): em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES E REFAÇÕES
4.1. Por se tratar de material bruto ou edição simplificada, esta modalidade não prevê rodadas de revisão de conteúdo criativo; ajustes técnicos pontuais (cor, estabilização, corte de pontas) podem ser negociados à parte.
4.2. Não há reagendamento gratuito de diária já realizada; captações adicionais são cobradas como nova diária integral.

5. DO VALOR E PAGAMENTO
5.1. Valor da diária: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS AUTORAIS E DE IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. Fica ressalvado ao(à) CONTRATADO(A) o direito de uso do material em portfólio, salvo pedido de confidencialidade formalizado por escrito antes da diária.
6.3. Cabe à CONTRATANTE providenciar autorizações de imagem de terceiros presentes no local que não sejam convidados/prepostos da própria CONTRATANTE.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE: mais de 5 dias — retenção de 20% do valor da diária; entre 5 e 2 dias — 50%; menos de 48h ou no-show — 100%.
7.2. Intercorrência do lado do(a) CONTRATADO(A) que impeça o comparecimento: indicação de profissional substituto de nível técnico equivalente, mediante aprovação da CONTRATANTE, ou devolução integral de eventual sinal pago.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o conteúdo captado até sua divulgação oficial pela CONTRATANTE, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Clima severo que impeça captação externa, ou determinação de autoridade, autorizam reagendamento sem multa, mediante comunicação em até 24h antes da diária.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
];
