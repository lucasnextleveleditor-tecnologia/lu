import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/** Banco de modelos de contrato do perfil VIDEOMAKER — 5 tipos de serviço. Ver aviso em `filmmaker.ts`. */
export const MODELOS_VIDEOMAKER: ModeloContratoServico[] = [
  {
    perfil: "videomaker",
    tipoServico: "varejo_comercio",
    nome: "Varejo/Comércio",
    descricao: "Vídeos curtos para divulgação de comércio local, em pacote mensal ou avulso.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_NEGOCIO_OU_PRODUTO", label: "Negócio/produto", tipo: "texto" },
      { tag: "QUANTIDADE_DE_VIDEOS", label: "Quantidade de vídeos", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por vídeo", tipo: "numero", exemplo: "1" },
      { tag: "DIAS_TOLERANCIA_INADIMPLENCIA", label: "Dias de tolerância antes de suspender", tipo: "numero", exemplo: "5" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "indeterminado" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE VÍDEO PARA VAREJO/COMÉRCIO

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de vídeos para divulgação comercial do estabelecimento/produto [NOME_DO_NEGOCIO_OU_PRODUTO], em pacote de [QUANTIDADE_DE_VIDEOS] vídeo(s).

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Captação em [LOCAL_DE_CAPTACAO], em datas a combinar dentro do período de referência.
2.3. Cabe à CONTRATANTE liberar acesso ao local, produtos/mercadorias e, quando aplicável, colaboradores que apareçam no vídeo, com as respectivas autorizações de imagem já providenciadas.

3. DO PRAZO
3.1. Entrega de cada vídeo em até [PRAZO_DE_ENTREGA] dias corridos após a respectiva captação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por vídeo (corte, legenda, trilha). Pedido de nova captação por insatisfação não relacionada a erro técnico é cobrado como diária avulsa adicional.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Em contratos recorrentes, o não pagamento por [DIAS_TOLERANCIA_INADIMPLENCIA] dias autoriza a suspensão da produção seguinte até a regularização.

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso comercial dos vídeos, sem exclusividade, pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para os canais/redes da CONTRATANTE.
6.2. O(a) CONTRATADO(A) pode usar o material em portfólio próprio, salvo pedido em contrário por escrito.

7. DA RESCISÃO
7.1. Contrato recorrente: rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], sem multa, quitando-se o período em curso integralmente.
7.2. Cancelamento de diária já agendada com menos de 48h: retenção de 100% do valor da diária correspondente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais de suspensão de prazo sem multa em caso de força maior.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "videomaker",
    tipoServico: "aulas_infoprodutos",
    nome: "Aulas/Infoprodutos",
    descricao: "Captação e edição de aulas gravadas, com cessão total dos direitos do vídeo para o infoproduto do cliente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_INFOPRODUTO", label: "Nome do infoproduto/curso", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por aula", tipo: "numero", exemplo: "1" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CAPTAÇÃO E EDIÇÃO DE INFOPRODUTO

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Captação e edição de aulas/módulos do infoproduto "[NOME_DO_INFOPRODUTO]", de titularidade e autoria de conteúdo exclusivos da CONTRATANTE.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Captação em [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. O conteúdo didático (roteiro, slides, exercícios) é de responsabilidade exclusiva da CONTRATANTE; o(a) CONTRATADO(A) responde apenas pela qualidade técnica de captação e edição.

3. DO PRAZO
3.1. Entrega das aulas editadas em até [PRAZO_DE_ENTREGA] dias corridos após a captação de cada bloco/módulo.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por aula. Regravação por erro do apresentador/instrutor não constitui erro técnico do(a) CONTRATADO(A) e é cobrada como nova diária.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS AUTORAIS
6.1. Os direitos patrimoniais sobre as aulas finalizadas pertencem integralmente à CONTRATANTE após a quitação, para exploração comercial do infoproduto sem limitação de prazo/território, tratando-se de obra por encomenda (cessão total).
6.2. O(a) CONTRATADO(A) pode citar o projeto em portfólio (nome do curso e print de tela), vedada a reprodução de trechos de conteúdo didático sem autorização.

7. DA RESCISÃO
7.1. Cancelamento de diária de captação: mais de 5 dias — 20% de retenção; entre 5 e 2 dias — 50%; menos de 48h — 100%.

8. DA CONFIDENCIALIDADE
8.1. Sigilo reforçado sobre o conteúdo do infoproduto (método, estratégia, materiais não lançados) pelo prazo de [PRAZO_CONFIDENCIALIDADE], dado o valor comercial da antecipação do lançamento.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "videomaker",
    tipoServico: "eventos_sociais_corporativos",
    nome: "Eventos (Sociais/Corporativos)",
    descricao: "Cobertura de evento único (social ou corporativo), sem possibilidade de recaptação de momentos perdidos.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária de cobertura", tipo: "texto", exemplo: "6 horas" },
      { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra", tipo: "moeda" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA AUDIOVISUAL DE EVENTO SOCIAL/CORPORATIVO

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura audiovisual do evento [NOME_DO_EVENTO], a realizar-se em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Carga horária de cobertura: [CARGA_HORARIA_DIARIA]. Horas excedentes cobradas como hora extra de [VALOR_HORA_EXTRA].

3. DO PRAZO
3.1. Entrega do material final em até [PRAZO_DE_ENTREGA] dias corridos após o evento.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste no vídeo final. Por se tratar de evento único e não repetível, não há possibilidade de nova captação de momentos perdidos por qualquer motivo alheio a falha de equipamento do(a) CONTRATADO(A).

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. A reserva de data somente se efetiva após o pagamento do sinal; sem sinal, a data permanece disponível para outros clientes.

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material para fins pessoais/institucionais, conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode usar o material em portfólio, ressalvado pedido de privacidade da CONTRATANTE formalizado por escrito.
6.3. Cabe à CONTRATANTE informar convidados/participantes sobre a cobertura audiovisual e equacionar eventuais objeções de imagem de terceiros presentes.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE: mais de 30 dias — retenção de 20% do sinal; entre 30 e 7 dias — 50% do valor total; menos de 7 dias ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Inclui impossibilidade de realização do próprio evento por determinação de autoridade pública, buscando-se remarcação sem multa adicional.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "videomaker",
    tipoServico: "edicao_continua",
    nome: "Edição Contínua",
    descricao: "Retainer mensal de edição sobre material bruto fornecido pelo cliente (sem captação).",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUANTIDADE_DE_VIDEOS", label: "Volume mensal de vídeos", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Especificação dos entregáveis", tipo: "textarea" },
      { tag: "FORMA_DE_ENTREGA_DO_MATERIAL_BRUTO", label: "Forma de entrega do material bruto", tipo: "texto", exemplo: "link de nuvem" },
      { tag: "VALOR_VIDEO_ADICIONAL", label: "Valor por vídeo excedente", tipo: "moeda" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por vídeo", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSALIDADE", label: "Dia de vencimento da mensalidade", tipo: "numero", exemplo: "5" },
      { tag: "DIAS_TOLERANCIA_INADIMPLENCIA", label: "Dias de tolerância antes de suspender", tipo: "numero", exemplo: "5" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE EDIÇÃO DE VÍDEO CONTÍNUA (RETAINER MENSAL)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação contínua de serviços de edição de vídeo sobre material bruto fornecido pela CONTRATANTE, em regime de mensalidade (retainer), sem captação pelo(a) CONTRATADO(A).

2. DO ESCOPO
2.1. Volume mensal contratado: [QUANTIDADE_DE_VIDEOS] vídeo(s) editado(s) por mês, conforme [DESCRICAO_DOS_ENTREGAVEIS].
2.2. O material bruto é entregue pela CONTRATANTE via [FORMA_DE_ENTREGA_DO_MATERIAL_BRUTO]; a contagem de prazo de cada vídeo só se inicia após o recebimento do material completo correspondente.
2.3. Demandas que excedam o volume mensal contratado são cobradas por vídeo adicional, no valor de [VALOR_VIDEO_ADICIONAL].

3. DO PRAZO
3.1. Cada vídeo é entregue em até [PRAZO_DE_ENTREGA] dias úteis após o recebimento do material bruto correspondente.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por vídeo. Demandas de reedição completa por mudança de direcionamento após aprovação são tratadas como novo vídeo para fins de contagem do volume mensal.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade fixa: [VALOR_DO_SERVIÇO], com vencimento todo dia [DIA_VENCIMENTO_MENSALIDADE], independentemente do volume efetivamente utilizado no mês (não cumulativo para o mês seguinte, salvo acordo em contrário).
5.2. Inadimplência superior a [DIAS_TOLERANCIA_INADIMPLENCIA] dias autoriza a suspensão das entregas até a regularização, sem prejuízo da cobrança integral da mensalidade vencida.

6. DOS DIREITOS DE USO
6.1. O material bruto permanece de propriedade da CONTRATANTE em todos os momentos; o(a) CONTRATADO(A) apenas o processa/edita, sem ceder ou reter direitos sobre o conteúdo original.
6.2. Os vídeos editados entregues e quitados pertencem à CONTRATANTE para uso irrestrito. O(a) CONTRATADO(A) pode usar trechos editados (não o material bruto) em portfólio técnico, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Qualquer parte pode rescindir mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso e as demandas já em produção.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "videomaker",
    tipoServico: "institucional_express",
    nome: "Institucional Express",
    descricao: "Vídeo institucional de escopo fechado e entrega rápida, captação concentrada em um único dia.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/empresa", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE VÍDEO INSTITUCIONAL EXPRESS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Produção de vídeo institucional de curta metragem sobre a empresa/marca [NOME_DA_MARCA_OU_PRODUTO], em regime expresso (entrega rápida, escopo fechado).

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Captação em [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO], em turno único.

3. DO PRAZO
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após a captação — prazo reduzido em razão da natureza expressa do pacote.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste pontual. Dado o prazo reduzido e o valor fechado deste pacote, novas rodadas ou nova captação são cobradas integralmente à parte, como projeto avulso adicional.

5. DO VALOR E PAGAMENTO
5.1. Valor total (fechado): [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso institucional irrestrito do vídeo, sem limite de prazo, mediante quitação integral.
6.2. Cabe à CONTRATANTE providenciar autorizações de imagem de colaboradores/depoentes que apareçam no vídeo.
6.3. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento após confirmação de agenda: mais de 3 dias — retenção de 30%; menos de 3 dias ou no-show — 100% do valor total, dado o regime expresso de agenda bloqueada em curtíssimo prazo.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

12. DO FORO
12.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
];
