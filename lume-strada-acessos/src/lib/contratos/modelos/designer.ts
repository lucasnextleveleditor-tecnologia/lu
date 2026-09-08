import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/** Banco de modelos de contrato do perfil DESIGNER — 5 tipos de serviço. Ver aviso em `filmmaker.ts`. */
export const MODELOS_DESIGNER: ModeloContratoServico[] = [
  {
    perfil: "designer",
    tipoServico: "branding_identidade_visual",
    nome: "Branding/Identidade Visual",
    descricao: "Projeto completo de identidade visual — logotipo, paleta e manual de marca, com cessão definitiva após quitação.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_DE_PROPOSTAS_CRIATIVAS", label: "Nº de propostas conceituais", tipo: "numero", exemplo: "3" },
      { tag: "FORMATOS_DE_ARQUIVO_FINAIS", label: "Formatos de arquivo finais", tipo: "texto", exemplo: "AI, EPS, PNG, SVG, PDF" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por etapa", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_RODADA_ADICIONAL", label: "Valor da rodada adicional", tipo: "moeda" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE IDENTIDADE VISUAL (BRANDING)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Desenvolvimento de identidade visual completa para a marca [NOME_DA_MARCA_OU_PRODUTO], compreendendo pesquisa/briefing, conceituação, desenvolvimento de logotipo e manual de marca.

2. DO ESCOPO E DOS ENTREGÁVEIS
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Etapas: (i) briefing e pesquisa; (ii) apresentação de [NUMERO_DE_PROPOSTAS_CRIATIVAS] propostas conceituais distintas; (iii) desenvolvimento da proposta escolhida; (iv) finalização e entrega do manual de marca.
2.3. Formatos de arquivo finais entregues: [FORMATOS_DE_ARQUIVO_FINAIS].

3. DO PRAZO
3.1. Prazo total do projeto: [PRAZO_DE_ENTREGA] dias corridos, contados da aprovação do briefing, dividido conforme as etapas da cláusula 2.2.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por etapa (proposta conceitual e desenvolvimento final).
4.2. Solicitação de novo conceito após a escolha de uma das propostas, ou rodadas além das inclusas, são cobradas à parte, no valor de [VALOR_RODADA_ADICIONAL] por rodada excedente.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Os arquivos-fonte editáveis (AI/PSD) são entregues somente após a quitação integral; até lá, a CONTRATANTE recebe apenas os arquivos de uso final (PNG/PDF).

6. DA CESSÃO DE DIREITOS AUTORAIS
6.1. Mediante pagamento integral, o(a) CONTRATADO(A) cede à CONTRATANTE, em caráter definitivo e irrevogável, os direitos patrimoniais de uso da identidade visual desenvolvida, sem limitação de prazo ou território.
6.2. Propostas conceituais não escolhidas permanecem de propriedade do(a) CONTRATADO(A), vedado seu uso pela CONTRATANTE.
6.3. O(a) CONTRATADO(A) pode exibir o projeto finalizado em portfólio profissional, com crédito de autoria, salvo pedido de confidencialidade formalizado por escrito antes do lançamento da marca.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE após a etapa (ii) já entregue: pagamento proporcional às etapas concluídas, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.
7.2. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução dos valores de etapas não realizadas.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o projeto de marca não lançado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "designer",
    tipoServico: "retencao_mensal",
    nome: "Retenção Mensal",
    descricao: "Design gráfico/digital sob demanda, com volume mensal fixo e peças excedentes cobradas à parte.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "VOLUME_MENSAL_DE_PECAS", label: "Volume mensal de peças", tipo: "texto", exemplo: "até 15 peças/mês" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Tipos de peça incluídos", tipo: "textarea" },
      { tag: "VALOR_PECA_ADICIONAL", label: "Valor por peça excedente", tipo: "moeda" },
      { tag: "CANAL_DE_SOLICITACAO", label: "Canal de solicitação de demandas", tipo: "texto", exemplo: "formulário/planilha compartilhada" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSALIDADE", label: "Dia de vencimento da mensalidade", tipo: "numero", exemplo: "5" },
      { tag: "DIAS_TOLERANCIA_INADIMPLENCIA", label: "Dias de tolerância antes de suspender", tipo: "numero", exemplo: "5" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN — RETENÇÃO MENSAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação contínua de serviços de design gráfico/digital para a marca [NOME_DA_MARCA_OU_PRODUTO], em regime de mensalidade (retainer), dentro do volume mensal contratado.

2. DO ESCOPO
2.1. Volume mensal: [VOLUME_MENSAL_DE_PECAS], conforme [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Demandas que excedam o volume mensal são cobradas por peça adicional, no valor de [VALOR_PECA_ADICIONAL].
2.3. Pedidos de design devem ser abertos via [CANAL_DE_SOLICITACAO], com briefing mínimo preenchido; solicitações incompletas têm o prazo suspenso até a complementação.

3. DO PRAZO
3.1. Cada peça é entregue em até [PRAZO_DE_ENTREGA] dias úteis após a abertura da solicitação com briefing completo.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade fixa: [VALOR_DO_SERVIÇO], com vencimento todo dia [DIA_VENCIMENTO_MENSALIDADE], independentemente do volume efetivamente utilizado no mês.
5.2. Inadimplência superior a [DIAS_TOLERANCIA_INADIMPLENCIA] dias autoriza a suspensão das entregas até a regularização.

6. DOS DIREITOS DE USO
6.1. As peças entregues e quitadas pertencem à CONTRATANTE para uso irrestrito relacionado à sua marca.
6.2. O(a) CONTRATADO(A) pode usar as peças em portfólio, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso e as demandas já em produção.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "designer",
    tipoServico: "lancamentos_digitais",
    nome: "Lançamentos Digitais",
    descricao: "Peças gráficas digitais para lançamento (landing page, criativos, e-mail marketing), com sigilo reforçado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_LANCAMENTO", label: "Nome do lançamento", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "MARCOS_DO_CRONOGRAMA", label: "Cronograma do lançamento", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_NOVO_PEDIDO", label: "Prazo mínimo para novo pedido", tipo: "texto", exemplo: "48 horas" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN PARA LANÇAMENTO DIGITAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação das peças gráficas digitais para o lançamento "[NOME_DO_LANCAMENTO]", compreendendo materiais de aquecimento, venda e página de vendas, conforme escopo.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cronograma vinculado às datas do lançamento: [MARCOS_DO_CRONOGRAMA].

3. DO PRAZO
3.1. Datas fixas e não prorrogáveis unilateralmente; peças devem ser entregues até a data de início de cada fase prevista no cronograma.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça. Pedidos fora do escopo aprovado com menos de [PRAZO_MINIMO_NOVO_PEDIDO] de antecedência da respectiva fase podem não ser atendidos a tempo, sem responsabilidade do(a) CONTRATADO(A).

5. DO VALOR E PAGAMENTO
5.1. Valor total do pacote: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso das peças mediante quitação integral. Pode utilizá-las em portfólio após o lançamento oficial, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento pela CONTRATANTE: mais de 15 dias antes do início do aquecimento — retenção de 30%; entre 15 e 5 dias — 50%; menos de 5 dias — 100% do valor do pacote.

8. DA CONFIDENCIALIDADE
8.1. Sigilo absoluto sobre estratégia, datas e peças do lançamento antes de sua divulgação oficial, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "designer",
    tipoServico: "materiais_graficos_offline",
    nome: "Materiais Gráficos Offline",
    descricao: "Peças gráficas para impressos/sinalização/embalagem, entregues como arquivo pronto para impressão.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "FORMATO_ARQUIVO_IMPRESSAO", label: "Formato do arquivo de impressão", tipo: "texto", exemplo: "PDF com sangria e marcas de corte" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "2" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN GRÁFICO PARA MATERIAIS OFFLINE

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de peças gráficas para produção offline (impressos/sinalização/embalagem) para a marca [NOME_DA_MARCA_OU_PRODUTO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS], em arquivo pronto para impressão (formato [FORMATO_ARQUIVO_IMPRESSAO]).
2.2. A responsabilidade do(a) CONTRATADO(A) encerra-se na entrega do arquivo pronto para impressão; a contratação da gráfica, escolha de papel/acabamento e conferência da prova física são de responsabilidade da CONTRATANTE, salvo se expressamente incluída no escopo.

3. DO PRAZO
3.1. Entrega do arquivo final em até [PRAZO_DE_ENTREGA] dias corridos após a aprovação do briefing/referências.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça. Erros identificados após o envio do arquivo para impressão, já aprovado por escrito pela CONTRATANTE, são de sua responsabilidade.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. O arquivo em alta resolução pronto para impressão só é liberado após a quitação integral.

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso e reprodução das peças mediante quitação integral, sem limite de tiragem.
6.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento após início da produção: pagamento proporcional às etapas concluídas.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "designer",
    tipoServico: "web_design",
    nome: "Web Design",
    descricao: "Layout visual de site (sem desenvolvimento/programação), com etapas de wireframe e aplicação a demais páginas.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_SITE_OU_PROJETO", label: "Site/projeto", tipo: "texto" },
      { tag: "QUANTIDADE_DE_PAGINAS", label: "Quantidade de páginas", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por etapa", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE WEB DESIGN

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação do design (layout visual) do site/página [NOME_DO_SITE_OU_PROJETO], com [QUANTIDADE_DE_PAGINAS] página(s).
1.2. Este contrato compreende apenas o design/layout visual, não incluindo desenvolvimento/programação, hospedagem, domínio, ou manutenção técnica, salvo se expressamente listados em escopo adicional.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Etapas: (i) wireframe/estrutura; (ii) layout visual da página principal; (iii) aplicação do layout às demais páginas.

3. DO PRAZO
3.1. Prazo total: [PRAZO_DE_ENTREGA] dias corridos após aprovação do briefing/conteúdo (textos e imagens) fornecido pela CONTRATANTE — atraso na entrega de conteúdo pela CONTRATANTE suspende a contagem de prazo.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por etapa. Mudança de direção visual após aprovação do layout da página principal é tratada como novo projeto.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Os arquivos editáveis (Figma/fonte) são entregues somente após a quitação integral.

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do design mediante quitação integral, para implementação no site da CONTRATANTE.
6.2. O(a) CONTRATADO(A) pode usar o projeto em portfólio, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento após entrega de etapa: pagamento proporcional às etapas concluídas, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
];
