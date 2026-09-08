import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/** Banco de modelos de contrato do perfil SOCIAL MEDIA — 5 tipos de serviço. Ver aviso em `filmmaker.ts`. */
export const MODELOS_SOCIAL_MEDIA: ModeloContratoServico[] = [
  {
    perfil: "social_media",
    tipoServico: "gestao_comercio_local",
    nome: "Gestão de Comércio Local",
    descricao: "Gestão mensal de redes sociais para comércio/estabelecimento local, com calendário de conteúdo aprovado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_NEGOCIO", label: "Nome do negócio", tipo: "texto" },
      { tag: "PLATAFORMAS_GERENCIADAS", label: "Plataformas gerenciadas", tipo: "texto", exemplo: "Instagram e Google Meu Negócio" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "LOCAL_DE_CAPTACAO", label: "Local de captação mensal", tipo: "texto" },
      { tag: "PRAZO_APROVACAO_CALENDARIO", label: "Prazo de aprovação do calendário", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSALIDADE", label: "Dia de vencimento da mensalidade", tipo: "numero", exemplo: "5" },
      { tag: "DIAS_TOLERANCIA_INADIMPLENCIA", label: "Dias de tolerância antes de suspender", tipo: "numero", exemplo: "5" },
      { tag: "PRAZO_DEVOLUCAO_ACESSOS", label: "Prazo de devolução de acessos ao fim do contrato", tipo: "texto", exemplo: "5 dias úteis" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS — COMÉRCIO LOCAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Gestão e produção de conteúdo para as redes sociais do estabelecimento [NOME_DO_NEGOCIO], nas plataformas: [PLATAFORMAS_GERENCIADAS].

2. DO ESCOPO
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. A produção de conteúdo em vídeo/foto depende de visita mensal de captação em [LOCAL_DE_CAPTACAO], em data a combinar.
2.3. Não estão incluídos: investimento em tráfego pago (pago à parte, diretamente às plataformas), produção fora do calendário mensal aprovado, e atendimento fora do horário comercial.

3. DO PRAZO
3.1. O calendário de conteúdo do mês é submetido para aprovação em até [PRAZO_DE_ENTREGA] dias antes do início de cada mês de veiculação.
3.2. A ausência de aprovação/feedback em até [PRAZO_APROVACAO_CALENDARIO] autoriza a publicação do conteúdo conforme originalmente submetido.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça do calendário mensal. Pedidos de conteúdo adicional fora do calendário aprovado são orçados à parte.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade: [VALOR_DO_SERVIÇO], com vencimento todo dia [DIA_VENCIMENTO_MENSALIDADE]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Inadimplência superior a [DIAS_TOLERANCIA_INADIMPLENCIA] dias autoriza a suspensão de publicações e do acesso às contas até a regularização.

6. DO ACESSO ÀS CONTAS E DA PROPRIEDADE
6.1. As contas de redes sociais, seguidores, histórico e credenciais de acesso são e permanecem de propriedade exclusiva da CONTRATANTE, inclusive após o término deste contrato.
6.2. O(a) CONTRATADO(A) atua apenas como gestor(a) autorizado(a) durante a vigência contratual, devolvendo/revogando todos os acessos administrativos em até [PRAZO_DEVOLUCAO_ACESSOS] após o encerramento.

7. DOS DIREITOS DE USO E PORTFÓLIO
7.1. As peças produzidas podem ser usadas pelo(a) CONTRATADO(A) em portfólio profissional, salvo vedação expressa por escrito da CONTRATANTE.

8. DA RESCISÃO
8.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso integralmente.

9. DA CONFIDENCIALIDADE
9.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Aplicam-se os termos gerais.

12. DISPOSIÇÕES GERAIS / 13. DO FORO
Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito. Foro eleito: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "social_media",
    tipoServico: "gestao_autoridade",
    nome: "Gestão de Autoridade",
    descricao: "Gestão estratégica de conteúdo para posicionamento de autoridade digital de profissional/marca.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_PROFISSIONAL_OU_MARCA", label: "Profissional/marca", tipo: "texto" },
      { tag: "PLATAFORMAS_GERENCIADAS", label: "Plataformas gerenciadas", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_DEVOLUCAO_ACESSOS", label: "Prazo de devolução de acessos ao fim do contrato", tipo: "texto", exemplo: "5 dias úteis" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS — POSICIONAMENTO DE AUTORIDADE

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Gestão estratégica de conteúdo para posicionamento de autoridade digital de [NOME_DO_PROFISSIONAL_OU_MARCA] nas plataformas [PLATAFORMAS_GERENCIADAS].

2. DO ESCOPO
2.1. Entregáveis mensais: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. A CONTRATANTE se compromete a fornecer insumos de conteúdo (referências técnicas, cases, opiniões, participação em gravações) dentro do prazo combinado, sob pena de suspensão do cronograma enquanto perdurar a pendência.

3. DO PRAZO
3.1. Calendário mensal submetido para aprovação em até [PRAZO_DE_ENTREGA] dias antes do início do mês de veiculação.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça, restritas a correções de forma; alterações de linha editorial após aprovação do planejamento mensal são tratadas como novo escopo.

5. DO VALOR E PAGAMENTO
5.1. Mensalidade: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DO ACESSO ÀS CONTAS E DA PROPRIEDADE
6.1. Contas, seguidores e credenciais pertencem exclusivamente à CONTRATANTE, cabendo devolução de acessos em até [PRAZO_DEVOLUCAO_ACESSOS] após o término do contrato.

7. DOS DIREITOS AUTORAIS SOBRE O CONTEÚDO OPINATIVO
7.1. Roteiros e falas de opinião/autoridade elaborados a partir de insumos técnicos fornecidos pela CONTRATANTE são de titularidade da CONTRATANTE; a edição/produção audiovisual permanece sujeita à cessão de uso da cláusula 7.2.
7.2. O(a) CONTRATADO(A) pode usar as peças produzidas em portfólio, salvo vedação expressa por escrito.

8. DA RESCISÃO
8.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso.

9. DA CONFIDENCIALIDADE
9.1. Sigilo pelo prazo de [PRAZO_CONFIDENCIALIDADE], especialmente relevante por envolver opiniões/posicionamento profissional sensível.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Aplicam-se os termos gerais.

12. DISPOSIÇÕES GERAIS / 13. DO FORO
Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito. Foro eleito: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "social_media",
    tipoServico: "mentoria_de_perfil",
    nome: "Mentoria de Perfil",
    descricao: "Consultoria/mentoria de redes sociais por sessões, sem execução direta de postagens.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NUMERO_DE_SESSOES", label: "Número de sessões", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "FORMATO_DAS_SESSOES", label: "Formato das sessões", tipo: "texto", exemplo: "videochamada" },
      { tag: "DURACAO_POR_SESSAO", label: "Duração por sessão", tipo: "texto", exemplo: "1 hora" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões do plano de ação", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcar sessão", tipo: "texto", exemplo: "24 horas" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MENTORIA/CONSULTORIA DE REDES SOCIAIS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de mentoria/consultoria em gestão de redes sociais, em [NUMERO_DE_SESSOES] sessão(ões) de acompanhamento, sem execução direta de postagens pelo(a) CONTRATADO(A) — a CONTRATANTE permanece responsável pela execução do que for orientado.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Sessões via [FORMATO_DAS_SESSOES], com duração de [DURACAO_POR_SESSAO] cada.

3. DO PRAZO
3.1. Diagnóstico e plano de ação inicial entregues em até [PRAZO_DE_ENTREGA] dias corridos após a primeira sessão.

4. DAS REVISÕES
4.1. O plano de ação escrito comporta [NUMERO_REVISOES_INCLUSAS] rodada de ajuste. A mentoria não garante resultado específico de crescimento/engajamento, dependendo diretamente da execução pela CONTRATANTE.

5. DO VALOR E PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DA PROPRIEDADE INTELECTUAL DO MÉTODO
6.1. Metodologias, frameworks e materiais próprios do(a) CONTRATADO(A) permanecem de sua exclusiva propriedade intelectual; a CONTRATANTE recebe licença de uso pessoal, vedada a revenda, reprodução ou ensino a terceiros do material recebido.

7. DA RESCISÃO
7.1. Sessões não realizadas por ausência da CONTRATANTE sem aviso de [PRAZO_AVISO_REMARCACAO] são consideradas realizadas para fins de cobrança.
7.2. Cancelamento do pacote fechado após a primeira sessão: sem devolução da(s) sessão(ões) já realizada(s).

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
    perfil: "social_media",
    tipoServico: "sac_2_0",
    nome: "SAC 2.0",
    descricao: "Atendimento ao cliente via redes sociais/canais digitais, com tratamento de dados de clientes finais como operador (LGPD).",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "CANAIS_DE_ATENDIMENTO", label: "Canais de atendimento", tipo: "textarea", exemplo: "Instagram Direct, WhatsApp Business" },
      { tag: "HORARIO_DE_COBERTURA", label: "Horário de cobertura", tipo: "texto", exemplo: "seg. a sex., 9h às 18h" },
      { tag: "TEMPO_MEDIO_RESPOSTA", label: "Tempo médio de primeira resposta", tipo: "texto", exemplo: "até 2 horas úteis" },
      { tag: "PRAZO_ESCALADA_INTERNA", label: "Prazo de escalada de dúvidas técnicas", tipo: "texto", exemplo: "24 horas" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ATENDIMENTO AO CLIENTE EM REDES SOCIAIS (SAC 2.0)

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Prestação de serviços de atendimento ao cliente (SAC 2.0) via canais digitais da CONTRATANTE: [CANAIS_DE_ATENDIMENTO].

2. DO ESCOPO
2.1. Horário de cobertura: [HORARIO_DE_COBERTURA]. Fora desse horário, mensagens são respondidas no próximo período útil, salvo acordo de plantão à parte.
2.2. Tempo médio de primeira resposta comprometido: [TEMPO_MEDIO_RESPOSTA].
2.3. Compete à CONTRATANTE fornecer script/tom de voz de atendimento, tabela de preços/políticas vigentes e escalar ao(à) CONTRATADO(A), em até [PRAZO_ESCALADA_INTERNA], respostas a dúvidas técnicas fora do escopo padrão.
2.4. O(a) CONTRATADO(A) não se responsabiliza por decisões comerciais tomadas com base em informações desatualizadas fornecidas pela CONTRATANTE.

3. DO PRAZO
3.1. Serviço contínuo/mensal, sem entrega pontual, vigente conforme cláusula de rescisão.

4. DO VALOR E PAGAMENTO
4.1. Mensalidade: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

5. DA CONFIDENCIALIDADE E DADOS DE CLIENTES
5.1. O(a) CONTRATADO(A) terá acesso a dados pessoais de clientes finais da CONTRATANTE exclusivamente para fins de atendimento, comprometendo-se a não os utilizar para outra finalidade, não compartilhá-los com terceiros e eliminá-los ao término do contrato (ressalvados prazos legais de guarda), atuando como operador (Lei nº 13.709/2018) enquanto a CONTRATANTE é a controladora.
5.2. A CONTRATANTE é responsável por garantir base legal adequada para o tratamento dos dados de seus clientes finais repassados ao(à) CONTRATADO(A).

6. DA RESCISÃO
6.1. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO], quitando-se o mês em curso.

7. DO CASO FORTUITO E FORÇA MAIOR
7.1. Aplicam-se os termos gerais.

8. DO FORO
8.1. Fica eleito o foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].

[NOME_DO_CLIENTE] — CONTRATANTE
[NOME_CONTRATADO] — CONTRATADO(A)`,
  },
  {
    perfil: "social_media",
    tipoServico: "lancamentos",
    nome: "Lançamentos",
    descricao: "Gestão de redes sociais para lançamento digital (aquecimento, carrinho, pós-lançamento), com sigilo reforçado.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_LANCAMENTO", label: "Nome do lançamento", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis por fase", tipo: "textarea" },
      { tag: "MARCOS_DO_CRONOGRAMA", label: "Cronograma do lançamento", tipo: "textarea" },
      { tag: "PRAZO_AVISO_MUDANCA_DATA", label: "Prazo de aviso para mudança de data", tipo: "texto", exemplo: "5 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "PRAZO_MINIMO_NOVO_PEDIDO", label: "Prazo mínimo para novo pedido", tipo: "texto", exemplo: "48 horas" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS PARA LANÇAMENTO DIGITAL

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a) em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Gestão de redes sociais para o lançamento do produto/infoproduto "[NOME_DO_LANCAMENTO]", compreendendo aquecimento (pré-lançamento), carrinho aberto (venda) e pós-lançamento.

2. DO ESCOPO
2.1. Entregáveis por fase: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Cronograma do lançamento: [MARCOS_DO_CRONOGRAMA].
2.3. A CONTRATANTE é integralmente responsável pela estratégia de oferta, precificação, condições comerciais e cumprimento de promessas feitas no lançamento perante os consumidores finais (Código de Defesa do Consumidor), atuando o(a) CONTRATADO(A) apenas na execução do conteúdo conforme orientado.

3. DO PRAZO
3.1. Datas fixas e não prorrogáveis unilateralmente; alteração de datas pela CONTRATANTE deve ser comunicada com [PRAZO_AVISO_MUDANCA_DATA] de antecedência, sob pena de cobrança integral pelo período originalmente reservado.

4. DAS REVISÕES
4.1. Inclusa(s) [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por peça do cronograma. Pedidos fora do cronograma aprovado com menos de [PRAZO_MINIMO_NOVO_PEDIDO] de antecedência podem não ser atendidos a tempo, sem responsabilidade do(a) CONTRATADO(A).

5. DO VALOR E PAGAMENTO
5.1. Valor total do pacote: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].

6. DOS DIREITOS DE USO
6.1. As peças produzidas podem ser usadas pelo(a) CONTRATADO(A) em portfólio, salvo vedação expressa por escrito, especialmente durante o período de embargo de lançamento, quando solicitado.

7. DA RESCISÃO
7.1. Cancelamento do pacote pela CONTRATANTE: mais de 15 dias antes do início do aquecimento — retenção de 30%; entre 15 e 5 dias — 50%; menos de 5 dias — 100% do valor do pacote.

8. DA CONFIDENCIALIDADE
8.1. Sigilo absoluto sobre estratégia, datas, valores e conteúdo do lançamento antes de sua divulgação oficial, pelo prazo de [PRAZO_CONFIDENCIALIDADE].

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
