import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/** Banco de modelos de contrato do perfil STORYMAKER — 5 tipos de serviço. Ver aviso em `filmmaker.ts`. */
export const MODELOS_STORYMAKER: ModeloContratoServico[] = [
  {
    perfil: "storymaker",
    tipoServico: "lancamento_de_varejo",
    nome: "Lançamento de Varejo",
    descricao: "Cobertura em stories, publicada em tempo real, de lançamento/abertura de loja ou produto.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_EVENTO_DE_LANCAMENTO", label: "Evento de lançamento", tipo: "texto" },
      { tag: "NOME_DO_NEGOCIO_OU_PRODUTO", label: "Negócio/produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões do compilado final", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING EM TEMPO REAL — LANÇAMENTO DE VAREJO

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em formato "stories" (conteúdo vertical, curto e sequencial, publicado em tempo real ou quase real) do lançamento/abertura [NOME_DO_EVENTO_DE_LANCAMENTO], do produto/loja [NOME_DO_NEGOCIO_OU_PRODUTO].

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Data e local: [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. Cabe à CONTRATANTE fornecer acesso às credenciais de publicação durante o evento, e liberar os produtos/ambientes necessários à captação.

3. DO PRAZO
3.1. Publicação em tempo real ocorre durante o próprio evento; eventual compilado/resumo final é entregue em até [PRAZO_DE_ENTREGA] dias corridos após o evento.

4. DAS REVISÕES
4.1. Não há rodada de revisão sobre o material já publicado durante o evento; o compilado final comporta [NUMERO_REVISOES_INCLUSAS] rodada de ajuste.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode reaproveitar trechos do material em portfólio, salvo vedação expressa por escrito.
6.3. Cabe à CONTRATANTE equacionar eventuais direitos de imagem de clientes/público presentes no ponto de venda durante a captação.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE: mais de 5 dias — retenção de 20%; entre 5 e 2 dias — 50%; menos de 48h ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre datas e detalhes do lançamento antes da divulgação oficial, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DISPOSIÇÕES GERAIS / 12. DO FORO
Sem vínculo empregatício, societário ou de representação. Foro eleito: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "storymaker",
    tipoServico: "rotina_clinicas_profissionais",
    nome: "Rotina de Clínicas/Profissionais",
    descricao: "Cobertura mensal recorrente de rotina profissional (clínicas/liberais), com cláusula reforçada de sigilo de pacientes.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_PROFISSIONAL_OU_CLINICA", label: "Profissional/clínica", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local(is) de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSALIDADE", label: "Dia de vencimento da mensalidade", tipo: "numero", exemplo: "5" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto", exemplo: "indeterminado" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING DE ROTINA — CLÍNICAS/PROFISSIONAIS LIBERAIS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura mensal recorrente da rotina profissional de [NOME_DO_PROFISSIONAL_OU_CLINICA], em formato de conteúdo curto (stories/reels), com visitas periódicas ao local de atendimento.

2. DO ESCOPO
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Local(is) de captação: [LOCAL_DE_CAPTACAO].
2.3. SIGILO DE DADOS DE PACIENTES/CLIENTES: é vedada a captação ou publicação de qualquer imagem, prontuário, conversa ou informação que identifique pacientes/clientes sem autorização expressa e específica destes, cabendo à CONTRATANTE (responsável técnico do estabelecimento) obter e apresentar tal autorização antes de qualquer captação que os envolva, nos termos da Lei nº 13.709/2018 (LGPD) e, quando aplicável, do sigilo profissional da área de atuação.

3. DO PRAZO
3.1. O calendário de conteúdo do mês é submetido para aprovação em até [PRAZO_DE_ENTREGA] dias antes do início de cada mês de veiculação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça do calendário mensal.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade: [VALOR_DO_SERVIÇO], com vencimento todo dia [DIA_VENCIMENTO_MENSALIDADE]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material, sem exclusividade, pelo prazo de [PRAZO_DA_LICENCA_DE_USO].
6.2. O(a) CONTRATADO(A) pode usar trechos em portfólio, desde que sem qualquer conteúdo identificável de pacientes/clientes, salvo vedação expressa por escrito.

7. DA RESCISÃO
7.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Aplicam-se os termos gerais.

11. DISPOSIÇÕES GERAIS / 12. DO FORO
Sem vínculo empregatício, societário ou de representação. Foro eleito: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "storymaker",
    tipoServico: "eventos_real_time",
    nome: "Eventos em Real-Time",
    descricao: "Cobertura de evento publicada em tempo real, sem rodada de revisão sobre o conteúdo já publicado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "CARGA_HORARIA_DIARIA", label: "Carga horária de cobertura", tipo: "texto", exemplo: "6 horas" },
      { tag: "VALOR_HORA_EXTRA", label: "Valor da hora extra", tipo: "moeda" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões do resumo final", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE EVENTO EM TEMPO REAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura, em tempo real, do evento [NOME_DO_EVENTO], a realizar-se em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO], com publicação direta durante o próprio evento.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Carga horária de cobertura: [CARGA_HORARIA_DIARIA]. Horas excedentes: [VALOR_HORA_EXTRA]/hora.
2.3. Cabe à CONTRATANTE viabilizar acesso, credenciamento e conexão de internet estável no local, isentando o(a) CONTRATADO(A) por falhas de publicação decorrentes de infraestrutura do local do evento.

3. DO PRAZO
3.1. Publicação ocorre em tempo real durante o evento; resumo/compilado final em até [PRAZO_DE_ENTREGA] dias corridos após o encerramento.

4. DAS REVISÕES
4.1. Não há revisão sobre conteúdo já publicado em tempo real. O resumo final comporta [NUMERO_REVISOES_INCLUSAS] rodada de ajuste.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO E IMAGEM
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode usar trechos em portfólio, ressalvado pedido de privacidade formalizado por escrito.
6.3. Cabe à CONTRATANTE equacionar direitos de imagem de convidados/participantes presentes.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento pela CONTRATANTE: mais de 15 dias — retenção de 20%; entre 15 e 5 dias — 50%; menos de 5 dias ou no-show — 100% do valor total.

8. DA CONFIDENCIALIDADE
8.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Inclui impossibilidade de realização do evento por determinação de autoridade, sem multa.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "storymaker",
    tipoServico: "bastidores_infoprodutos",
    nome: "Bastidores de Infoprodutos",
    descricao: "Cobertura de making-of da gravação/lançamento de infoproduto, sem captar o conteúdo didático em si.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_INFOPRODUTO", label: "Nome do infoproduto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "DATA_DE_CAPTACAO", label: "Data de captação", tipo: "data" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação", tipo: "texto" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões do compilado final", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING DE BASTIDORES — INFOPRODUTOS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Captação e publicação de conteúdo de bastidores (making of) da gravação/lançamento do infoproduto "[NOME_DO_INFOPRODUTO]", em formato curto (stories/reels).

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Data(s) e local: [DATA_DE_CAPTACAO], em [LOCAL_DE_CAPTACAO].
2.3. É vedada a captação/divulgação do conteúdo didático em si do infoproduto (aulas, método) sem autorização expressa da CONTRATANTE — o objeto deste contrato é o "making of", não o conteúdo do curso.

3. DO PRAZO
3.1. Publicação diária durante a captação; eventual compilado final em até [PRAZO_DE_ENTREGA] dias corridos após o encerramento.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste no compilado final.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material de bastidores conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode citar o projeto (nome do curso) e usar trechos de bastidores em portfólio, vedada a reprodução de qualquer conteúdo didático, salvo vedação adicional por escrito.

7. DA RESCISÃO
7.1. Cancelamento de diária já agendada: mais de 5 dias — 20% de retenção; entre 5 e 2 dias — 50%; menos de 48h — 100%.

8. DA CONFIDENCIALIDADE
8.1. Sigilo reforçado sobre método, estratégia e materiais não lançados do infoproduto, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

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
    perfil: "storymaker",
    tipoServico: "diarias_de_viagem",
    nome: "Diárias de Viagem",
    descricao: "Cobertura de viagem/expedição por diária, com logística (passagens/hospedagem) por conta do cliente.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_PROJETO", label: "Descrição da viagem/projeto", tipo: "textarea" },
      { tag: "DATAS_DA_VIAGEM", label: "Datas da viagem", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Destino(s)", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por diária", tipo: "textarea" },
      { tag: "PRAZO_ANTECEDENCIA_LOGISTICA", label: "Prazo de antecedência para logística", tipo: "texto", exemplo: "15 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões do compilado final", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MEIOS_TERRITORIO_LICENCA", label: "Prazo/meios/território da licença", tipo: "textarea" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE STORYTELLING DE VIAGEM (DIÁRIA)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Acompanhamento e cobertura em formato de stories da viagem/expedição [DESCRICAO_DO_PROJETO], no período de [DATAS_DA_VIAGEM], no(s) destino(s) [LOCAL_DE_CAPTACAO].

2. DO ESCOPO
2.1. Entregáveis por diária: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Correm por conta da CONTRATANTE: passagens, hospedagem, alimentação e seguro-viagem do(a) CONTRATADO(A) durante todo o período contratado, além do valor da(s) diária(s) prevista(s) na cláusula 5.
2.3. Cabe à CONTRATANTE providenciar, com antecedência mínima de [PRAZO_ANTECEDENCIA_LOGISTICA], toda a logística de deslocamento, sob pena de suspensão do cronograma sem ônus ao(à) CONTRATADO(A).

3. DO PRAZO
3.1. Publicação diária durante a viagem; compilado final (se contratado) em até [PRAZO_DE_ENTREGA] dias corridos após o retorno.

4. DAS REVISÕES
4.1. Não há revisão sobre conteúdo já publicado em tempo real durante a viagem. Eventual compilado final comporta [NUMERO_REVISOES_INCLUSAS] rodada de ajuste.

5. DO VALOR E PAGAMENTO
5.1. Valor por diária: [VALOR_DO_SERVIÇO], totalizando o período contratado. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. O(a) CONTRATADO(A) cede à CONTRATANTE os direitos de uso do material conforme [PRAZO_MEIOS_TERRITORIO_LICENCA].
6.2. O(a) CONTRATADO(A) pode usar o material em portfólio, salvo vedação expressa por escrito.

7. DA RESCISÃO E MULTAS
7.1. Cancelamento da viagem pela CONTRATANTE: mais de 20 dias — retenção de 20% do valor total; entre 20 e 7 dias — 50%; menos de 7 dias — 100% do valor total, sem prejuízo do ressarcimento de despesas de deslocamento já incorridas e não reembolsáveis.
7.2. Cancelamento pelo(a) CONTRATADO(A) sem justa causa: devolução integral dos valores recebidos e ressarcimento de despesas de logística já pagas pela CONTRATANTE.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre roteiro e detalhes da viagem pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Cancelamento de voos, fechamento de fronteiras, clima severo ou determinação de autoridade pública desobrigam ambas as partes quanto ao período afetado, sem multa, buscando-se remarcação sempre que possível.

11. DO FORO
11.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
];
