import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/** Banco de modelos de contrato do perfil FOTÓGRAFO — 5 tipos de serviço. Ver aviso em `filmmaker.ts`. */
export const MODELOS_FOTOGRAFO: ModeloContratoServico[] = [
  {
    perfil: "fotografo",
    tipoServico: "retratos_corporativos",
    nome: "Retratos Corporativos",
    descricao: "Sessão de retratos institucionais de colaboradores, com autorização de imagem coletiva para fins corporativos.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUANTIDADE_DE_PESSOAS", label: "Quantidade de pessoas", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de fotos selecionadas por pessoa", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_FOTO_ADICIONAL", label: "Valor por foto extra", tipo: "moeda" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "indeterminado" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA — RETRATOS CORPORATIVOS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Realização de sessão fotográfica de retratos corporativos de [QUANTIDADE_DE_PESSOAS] colaborador(es) da CONTRATANTE, para uso institucional.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Data e local: [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. Cabe à CONTRATANTE organizar a agenda dos colaboradores para comparecimento pontual; atrasos de colaboradores que reduzam o tempo de sessão não geram direito a extensão gratuita da diária.

3. DO PRAZO
3.1. Entrega das fotos tratadas em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] foto(s) selecionada(s) por pessoa para tratamento; seleção adicional é cobrada por foto extra, no valor de [VALOR_FOTO_ADICIONAL].
4.2. Não há nova sessão gratuita para colaboradores ausentes na data marcada; o reagendamento individual é cobrado como mini diária avulsa.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso institucional das fotos, sem exclusividade, pelo prazo de [PRAZO_DA_LICENCA_DE_USO].
6.2. Cada colaborador fotografado autoriza, ao participar da sessão, o uso de sua imagem para fins institucionais, cabendo à CONTRATANTE informar previamente os colaboradores sobre a finalidade da sessão.
6.3. O(a) CONTRATADO(A) pode usar as fotos (sem dados de contato dos colaboradores) em portfólio técnico, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento pela CONTRATANTE: mais de 5 dias — retenção de 20%; entre 5 e 2 dias — 50%; menos de 48h ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "fotografo",
    tipoServico: "produtos_gastronomia",
    nome: "Produtos/Gastronomia",
    descricao: "Fotografia de produtos ou pratos para catálogo/cardápio/redes sociais.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca/produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "indeterminado" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA — PRODUTOS/GASTRONOMIA

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Realização de sessão fotográfica de produtos/pratos da marca [NOME_DA_MARCA_OU_PRODUTO], para uso em catálogo/cardápio/redes sociais.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Data e local: [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. Compete à CONTRATANTE providenciar os produtos/pratos em condições adequadas de apresentação no horário da sessão.

3. DO PRAZO
3.1. Entrega das fotos tratadas em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de tratamento por lote de fotos selecionadas. Produtos não apresentados adequadamente no dia não geram direito a nova diária gratuita.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso comercial das fotos, sem exclusividade, pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para os canais/meios da CONTRATANTE.
6.2. O(a) CONTRATADO(A) pode usar as fotos em portfólio, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento pela CONTRATANTE: mais de 5 dias — retenção de 20%; entre 5 e 2 dias — 50%; menos de 48h ou no-show — 100% do valor total.

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
    perfil: "fotografo",
    tipoServico: "moda_lookbooks",
    nome: "Moda/Lookbooks",
    descricao: "Fotografia de moda/lookbook com modelos, releases de imagem sob responsabilidade do cliente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DA_COLECAO", label: "Nome da coleção", tipo: "texto" },
      { tag: "NOME_DA_MARCA_OU_PRODUTO", label: "Marca", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE MODA/LOOKBOOK

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Realização de sessão fotográfica de moda/lookbook da coleção "[NOME_DA_COLECAO]", da marca [NOME_DA_MARCA_OU_PRODUTO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Data e local: [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. Cabe à CONTRATANTE providenciar modelo(s), produção de moda e as respectivas autorizações de uso de imagem dos modelos antes da captação, isentando o(a) CONTRATADO(A) de responsabilidade por reclamação de imagem de terceiros da produção.

3. DO PRAZO
3.1. Entrega das fotos tratadas em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de tratamento por lote selecionado. Nova sessão por troca de modelo, figurino não aprovado previamente ou mudança de conceito após aprovação do moodboard é cobrada como nova diária.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso comercial das fotos, conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode usar as fotos em portfólio (créditos ao fotógrafo, produção e modelo), salvo vedação expressa por escrito.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE após confirmação de agenda: mais de 7 dias — retenção de 30% do sinal; entre 7 e 2 dias — 50% do valor total; menos de 48h ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE], relevante para coleções ainda não lançadas.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "fotografo",
    tipoServico: "eventos",
    nome: "Eventos",
    descricao: "Cobertura fotográfica de evento único, sem possibilidade de recaptação de momentos perdidos.",
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
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE EVENTOS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura fotográfica do evento [NOME_DO_EVENTO], a realizar-se em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Carga horária de cobertura: [CARGA_HORARIA_DIARIA]. Horas excedentes cobradas como hora extra de [VALOR_HORA_EXTRA].

3. DO PRAZO
3.1. Entrega das fotos tratadas em até [PRAZO_DE_ENTREGA] dias corridos após o evento; prévia/seleção não tratada pode ser disponibilizada em até 48 horas, quando contratada à parte.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste de tratamento sobre a seleção entregue. Por se tratar de evento único, não há possibilidade de nova captação de momentos perdidos por qualquer motivo alheio a falha de equipamento do(a) CONTRATADO(A).

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. A reserva de data somente se efetiva após o pagamento do sinal.

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode usar o material em portfólio, ressalvado pedido de privacidade da CONTRATANTE formalizado por escrito.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE: mais de 30 dias — retenção de 20% do sinal; entre 30 e 7 dias — 50% do valor total; menos de 7 dias ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais e de imagem conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "fotografo",
    tipoServico: "arquitetura_interiores",
    nome: "Arquitetura/Interiores",
    descricao: "Fotografia de projetos de arquitetura/interiores, com reagendamento sem multa em caso de clima desfavorável.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_PROJETO_ARQUITETONICO", label: "Nome do projeto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "indeterminado" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FOTOGRAFIA DE ARQUITETURA/INTERIORES

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Realização de sessão fotográfica do projeto de arquitetura/interiores [NOME_DO_PROJETO_ARQUITETONICO], localizado em [LOCAL_DE_CAPTACAO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Data e horário: [DATA_DE_CAPTACAO] — recomenda-se horário de luz favorável (golden hour), a combinar conforme orientação técnica do(a) CONTRATADO(A).
2.3. Compete à CONTRATANTE deixar o ambiente pronto para fotografar no horário agendado; tempo perdido com arrumação do ambiente é descontado da carga horária contratada, sem prorrogação gratuita.

3. DO PRAZO
3.1. Entrega das fotos tratadas em até [PRAZO_DE_ENTREGA] dias corridos após a captação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de tratamento sobre a seleção entregue. Nova visita por condições climáticas desfavoráveis pode ser reagendada sem multa, mediante comunicação prévia.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso comercial das fotos, pelo prazo de [PRAZO_DA_LICENCA_DE_USO].
6.2. O(a) CONTRATADO(A) pode usar as fotos em portfólio próprio, com crédito ao projeto/arquiteto quando aplicável, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Cancelamento pela CONTRATANTE: mais de 5 dias — retenção de 20%; entre 5 e 2 dias — 50%; menos de 48h ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Condições climáticas severas são causa específica de reagendamento sem multa nesta modalidade.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
];
