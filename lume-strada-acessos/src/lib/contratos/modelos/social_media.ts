import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";
import {
  CAMPOS_OPERACIONAIS_COMUNS,
  CLAUSULAS_DE_FECHAMENTO,
  CLAUSULA_ALTERACOES_DE_ESCOPO,
  CLAUSULA_APROVACAO_E_REFACOES,
  CLAUSULA_BACKUP,
  CLAUSULA_DESLOCAMENTO,
  CLAUSULA_DIREITOS_AUTORAIS,
  CLAUSULA_DIREITO_DE_IMAGEM,
  CLAUSULA_ENTREGA,
  CLAUSULA_OBRIGACOES_DAS_PARTES,
  CLAUSULA_PORTFOLIO,
  CLAUSULA_PRAZOS_E_INSUMOS,
} from "./clausulas-comuns";
import {
  CAMPOS_SERVICO_CONTINUO,
  CAMPOS_TRAFEGO,
  CLAUSULAS_DE_ROTINA,
  CLAUSULA_ACESSOS_E_CONTAS,
  CLAUSULA_PLATAFORMAS_TERCEIROS,
  CLAUSULA_ROTINA_E_ATENDIMENTO,
  CLAUSULA_VERBA_DE_MIDIA,
  CLAUSULA_VIGENCIA_E_RENOVACAO,
} from "./clausulas-continuas";


/**
 * Banco de modelos de contrato do perfil SOCIAL MEDIA — v2, 8 tipos de
 * serviço (substitui a v1 de 5 tipos genéricos). O item "Casamentos" foi
 * incluído porque profissionais de social media também cobrem casamentos
 * (redes sociais do casal/dia do evento), distinto da filmagem/fotografia
 * profissional contratada separadamente.
 *
 * Padrão jurídico aprofundado, com cláusulas específicas do nicho: exclusão
 * de responsabilidade por resultados de engajamento/vendas (obrigação de
 * meio, não de resultado), indenização quando alegações de produto/resultado
 * são fornecidas pela própria contratante, tratamento de dados de clientes
 * (LGPD, papel de operador em SAC), e — nos serviços de evento com data fixa —
 * quitação prévia obrigatória e tabela de retenção por cancelamento.
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_SOCIAL_MEDIA: ModeloContratoServico[] = [
  {
    perfil: "social_media",
    tipoServico: "gestao_infoprodutores",
    nome: "Gestão para Infoprodutores",
    descricao: "Gestão mensal de redes sociais para infoprodutores, com regra clara de que alegações de resultado/ganho financeiro são de responsabilidade exclusiva da contratante.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "DESCRICAO_DOS_PRODUTOS", label: "Descrição dos produtos/cursos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE REDES SOCIAIS PARA INFOPRODUTORES

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Gestão contínua de redes sociais da CONTRATANTE, infoprodutora(o) digital com produto(s)/curso(s) recorrente(s) [DESCRICAO_DOS_PRODUTOS], em regime de contrato mensal contínuo.

2. DO ESCOPO MENSAL E DA RESPONSABILIDADE SOBRE ALEGAÇÕES DE RESULTADO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário editorial: [CALENDARIO_DE_PAUTAS].
2.2. Toda alegação de resultado, ganho financeiro, transformação pessoal ou eficácia do método/curso da CONTRATANTE, utilizada em conteúdo, deve ser fornecida e assumida expressamente pela própria CONTRATANTE, cabendo ao(à) CONTRATADO(A) apenas adaptar a linguagem, sem verificar ou validar a veracidade da alegação de resultado.
2.3. É expressamente vedado ao(à) CONTRATADO(A) criar, por iniciativa própria, alegações de ganho financeiro específico não fornecidas e aprovadas pela CONTRATANTE.

3. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
3.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
3.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza suspensão da produção do mês.

4. DA VIGÊNCIA E DA RESCISÃO
4.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

5. DO ARMAZENAMENTO PÓS-CONTRATO
5.1. Arquivos-fonte mantidos apenas durante a vigência, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento. Recuperação cobrada a [VALOR_TAXA_REENVIO].

6. DOS DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do conteúdo nas suas próprias redes, por prazo indeterminado, mediante pagamento integral. O(a) CONTRATADO(A) pode usar peças em portfólio, salvo vedação por escrito.

7. DA CONFIDENCIALIDADE
7.1. Sigilo sobre metodologia, faturamento e estratégia de vendas da CONTRATANTE pelo prazo de [PRAZO_CONFIDENCIALIDADE].

8. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
8.1. Tratamento de dados de leads/alunos conforme a Lei nº 13.709/2018.

9. DO CASO FORTUITO E FORÇA MAIOR
9.1. Instabilidade de plataformas alheia ao controle do(a) CONTRATADO(A) não gera sua responsabilidade.

10. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
10.1. Responsabilidade limitada ao valor da mensalidade do mês do fato gerador, excluída responsabilidade por resultado de vendas/engajamento e por veracidade de alegações de resultado do produto da CONTRATANTE.
10.2. A CONTRATANTE indeniza o(a) CONTRATADO(A) por: (i) alegações de resultado/ganho financeiro fornecidas por ela e publicadas conforme aprovado (cláusula 2.2); (ii) publicidade enganosa ou notificação de órgão regulador (ex.: CVM, no caso de promessas de investimento, ou vigilância sanitária, no caso de produtos de saúde) decorrente de conteúdo técnico de responsabilidade da CONTRATANTE; (iii) uso do material fora do combinado.
10.3. Avaliações públicas de má-fé sujeitas a notificação extrajudicial.

11. DISPOSIÇÕES GERAIS
11.1. Sem vínculo empregatício/societário.

12. DO FORO
12.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "cobertura_perfil_eventos",
    nome: "Cobertura de Perfil em Eventos",
    descricao: "Cobertura em tempo real do perfil da contratante durante um evento, publicando diretamente, com tabela de retenção por cancelamento e quitação prévia obrigatória.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_EVENTO", label: "Nome do evento", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do evento", tipo: "data" },
      { tag: "LOCAL_DO_EVENTO", label: "Local do evento", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega do resumo pós-evento", tipo: "texto", exemplo: "48 horas" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "7 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — mais de 15 dias antes", tipo: "percentual", exemplo: "20" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 15 e 5 dias antes", tipo: "percentual", exemplo: "50" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE REDES SOCIAIS EM EVENTO

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em tempo real das redes sociais da CONTRATANTE durante o evento [NOME_DO_EVENTO], em [DATA_DO_EVENTO], no local [LOCAL_DO_EVENTO], publicando conteúdo diretamente no perfil da CONTRATANTE durante a realização do evento.

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Por se tratar de publicação em tempo real diretamente no perfil da CONTRATANTE, a aprovação prévia de cada peça é dispensada, salvo diretriz específica combinada previamente (ex.: temas vedados, marcas concorrentes a evitar).
2.3. Cabe à CONTRATANTE viabilizar acesso à internet/conexão no local e credenciamento necessário; indisponibilidade de conexão no local que impeça a publicação em tempo real não gera responsabilidade ao(à) CONTRATADO(A), sendo o conteúdo publicado posteriormente assim que possível.

3. DO PRAZO
3.1. Resumo/compilado pós-evento (quando incluso), entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o evento.

4. DAS REVISÕES
4.1. Por se tratar de publicação em tempo real, não há rodadas de revisão sobre o conteúdo já publicado durante o evento; eventual erro flagrante pode ser corrigido/excluído mediante solicitação imediata da CONTRATANTE.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Quitação integral até [PRAZO_QUITACAO_ANTES_EVENTO] antes do evento, sob pena de não comparecimento sem ônus ao(à) CONTRATADO(A), aplicando-se a retenção da cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do resumo/compilado, guarda do material bruto passa à CONTRATANTE; backup por liberalidade até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E TABELA DE RETENÇÃO
7.1. Mais de 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; entre 15 e 5 dias — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; menos de 5 dias/no-show — 100%.

8. DOS DIREITOS DE USO E IMAGEM
8.1. Conteúdo publicado diretamente no perfil da CONTRATANTE já nasce sob titularidade desta. O(a) CONTRATADO(A) pode usar bastidores/making of em portfólio, salvo vedação por escrito. Imagem de participantes do evento é de responsabilidade da CONTRATANTE quanto à autorização de uso.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre informações do evento não divulgadas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais; substituto de nível equivalente ou devolução integral em caso de impedimento do(a) CONTRATADO(A).

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor total pago, excluídos lucros cessantes/danos indiretos.
12.2. A CONTRATANTE indeniza por: (i) ausência de conexão/estrutura no local para publicação em tempo real; (ii) ausência de autorização de imagem de participantes; (iii) instrução de conteúdo que gere reclamação de terceiros.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "social_media",
    tipoServico: "casamentos",
    nome: "Casamentos — Cobertura de Redes Sociais do Dia",
    descricao: "Cobertura em tempo real das redes sociais do casal durante o casamento, distinta da filmagem/fotografia profissional, com quitação prévia obrigatória e tabela progressiva de retenção.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "NOME_DO_CONJUGE", label: "Nome do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "CPF_CONJUGE", label: "CPF do(a) cônjuge/noivo(a)", tipo: "texto" },
      { tag: "DATA_DO_EVENTO", label: "Data do casamento", tipo: "data" },
      { tag: "LOCAL_DA_CERIMONIA", label: "Local da cerimônia", tipo: "texto" },
      { tag: "LOCAL_DA_FESTA", label: "Local da festa", tipo: "texto" },
      { tag: "HORARIO_DE_INICIO", label: "Horário de início", tipo: "texto" },
      { tag: "HORARIO_DE_TERMINO", label: "Horário de término", tipo: "texto" },
      { tag: "MOMENTOS_COBERTOS", label: "Momentos cobertos", tipo: "textarea" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ENTREGA_CONTEUDO_RAPIDO", label: "Prazo de entrega do resumo pós-evento", tipo: "texto", exemplo: "3 dias" },
      { tag: "PRAZO_QUITACAO_ANTES_EVENTO", label: "Prazo de quitação antes do evento", tipo: "texto", exemplo: "10 dias" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
      { tag: "PERCENTUAL_RETENCAO_6_MESES", label: "% retido — mais de 6 meses antes", tipo: "percentual", exemplo: "10" },
      { tag: "PERCENTUAL_RETENCAO_3_MESES", label: "% retido — entre 6 e 2 meses antes", tipo: "percentual", exemplo: "30" },
      { tag: "PERCENTUAL_RETENCAO_30_DIAS", label: "% retido — entre 2 meses e 15 dias antes", tipo: "percentual", exemplo: "60" },
      { tag: "PRAZO_AVISO_REMARCACAO", label: "Prazo de aviso para remarcação sem multa", tipo: "texto", exemplo: "30 dias" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COBERTURA DE REDES SOCIAIS DE CASAMENTO

CONTRATANTE(S): [NOME_DO_CLIENTE] e [NOME_DO_CONJUGE], CPFs nº [CPF_CNPJ_CLIENTE] e [CPF_CONJUGE], residentes em [ENDERECO_CLIENTE], denominados em conjunto CONTRATANTES (solidariamente responsáveis pelas obrigações financeiras).
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Cobertura em tempo real das redes sociais dos CONTRATANTES (ou de perfil especialmente criado para o casamento) durante a cerimônia e festa, em [DATA_DO_EVENTO], cerimônia em [LOCAL_DA_CERIMONIA] e festa em [LOCAL_DA_FESTA], distinta da filmagem/fotografia profissional do evento (contratada separadamente, quando houver).

2. DO ESCOPO
2.1. Cobertura de [HORARIO_DE_INICIO] a [HORARIO_DE_TERMINO]: [MOMENTOS_COBERTOS]. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].
2.2. Publicação em tempo real dispensa aprovação prévia de cada peça, ressalvadas diretrizes específicas combinadas previamente (ex.: não publicar determinados momentos íntimos/familiares).
2.3. O(a) CONTRATADO(A) não se responsabiliza por indisponibilidade de conexão/internet no local, publicando o conteúdo assim que possível após reestabelecida a conexão.

3. DO PRAZO DE ENTREGA
3.1. Resumo/compilado pós-evento entregue em até [PRAZO_ENTREGA_CONTEUDO_RAPIDO] após o casamento.

4. DAS REVISÕES
4.1. Não há revisão sobre conteúdo já publicado em tempo real; erro flagrante pode ser corrigido/excluído mediante solicitação imediata dos CONTRATANTES.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. CLÁUSULA ESSENCIAL: quitação integral obrigatória até [PRAZO_QUITACAO_ANTES_EVENTO] antes do casamento. O não pagamento até esse prazo autoriza o(a) CONTRATADO(A) a não comparecer, sem inadimplemento de sua parte, aplicando-se a retenção da cláusula 7ª.

6. DO ARMAZENAMENTO PÓS-ENTREGA
6.1. Após a entrega do resumo/compilado, a guarda do material bruto passa a ser de responsabilidade exclusiva dos CONTRATANTES; backup por liberalidade mantido por até [PRAZO_MINIMO_GUARDA_BACKUP], reenvio cobrado a [VALOR_TAXA_REENVIO].

7. DA RESCISÃO E DA TABELA DE RETENÇÃO
7.1. Por se tratar de evento de data única, com reserva integral de agenda: mais de 6 meses — retenção de [PERCENTUAL_RETENCAO_6_MESES]%; entre 6 e 2 meses — retenção de [PERCENTUAL_RETENCAO_3_MESES]%; entre 2 meses e 15 dias — retenção de [PERCENTUAL_RETENCAO_30_DIAS]%; menos de 15 dias ou não comparecimento — retenção de 100%.
7.2. Adiamento comunicado com antecedência mínima de [PRAZO_AVISO_REMARCACAO] e havendo disponibilidade de agenda: valores pagos migram para a nova data, sem multa.

8. DOS DIREITOS DE USO E DE IMAGEM
8.1. Conteúdo publicado diretamente no perfil dos CONTRATANTES já nasce sob titularidade destes. O(a) CONTRATADO(A) pode usar bastidores/making of em portfólio, com crédito, salvo pedido de privacidade por escrito antes do evento.
8.2. Direitos de imagem de convidados são de responsabilidade dos CONTRATANTES, que devem informá-los previamente sobre a cobertura ao vivo; objeções posteriores não geram responsabilidade ao(à) CONTRATADO(A).

9. DA SUBSTITUIÇÃO EM CASO DE IMPEDIMENTO
9.1. Impedimento por força maior: indicação de substituto de nível equivalente mediante anuência dos CONTRATANTES; não sendo possível, devolução integral em até 5 dias úteis.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por caso fortuito/força maior; comunicação em até 48h e remarcação conforme cláusula 7.2.

11. DA CONFIDENCIALIDADE
11.1. Sigilo sobre dados pessoais/financeiros dos CONTRATANTES pelo prazo de [PRAZO_CONFIDENCIALIDADE].

12. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
12.1. Tratamento de dados conforme a Lei nº 13.709/2018.

13. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
13.1. Responsabilidade do(a) CONTRATADO(A) limitada ao valor total pago, excluídos lucros cessantes, danos indiretos e danos morais/à imagem por fatores alheios à sua atuação técnica.
13.2. Os CONTRATANTES indenizam o(a) CONTRATADO(A) por: (i) objeção de imagem de convidados não informados sobre a cobertura ao vivo; (ii) instrução de publicação de conteúdo que gere reclamação de terceiros; (iii) atos de fornecedores do evento que atrapalhem a captação/publicação.
13.3. Manifestações públicas negativas de má-fé poderão ser objeto de notificação extrajudicial, sem prejuízo do direito de resposta.

14. DISPOSIÇÕES GERAIS
14.1. Sem vínculo empregatício/societário. CONTRATANTES respondem solidariamente pelas obrigações financeiras.

15. DO FORO
15.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  /* ================================================================== */
  /* GRUPO 3 — MÍDIAS SOCIAIS · 1. GESTÃO DE COMÉRCIO LOCAL             */
  /* ================================================================== */
  {
    perfil: "social_media",
    tipoServico: "gestao_comercio_local",
    nome: "Gestão de Comércio Local",
    descricao:
      "Gestão mensal do perfil de um negócio local, com volume fechado, pauta aprovada, captação no ponto de venda, responsabilidade do lojista pelas ofertas divulgadas e regras de atendimento a mensagens.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "NOME_DA_LOJA", label: "Nome do comércio", tipo: "texto" },
      { tag: "PERFIS_GERENCIADOS", label: "Perfis gerenciados", tipo: "textarea", exemplo: "@loja no Instagram, página no Facebook e ficha do Google Perfil da Empresa" },
      { tag: "FREQUENCIA_CAPTACAO", label: "Frequência de captação no ponto", tipo: "texto", exemplo: "1 visita mensal de até 3 horas" },
      { tag: "RESPONSAVEL_PELO_ATENDIMENTO", label: "Quem responde as mensagens", tipo: "texto", exemplo: "a própria loja" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE GESTÃO DE MÍDIAS SOCIAIS

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de gestão de mídias sociais do estabelecimento [NOME_DA_LOJA], nos perfis [PERFIS_GERENCIADOS].

Parágrafo primeiro. O serviço compreende: planejamento de pauta mensal; produção de conteúdo no volume de [VOLUME_MENSAL_CONTRATADO]; redação de legendas e escolha de marcações e hashtags; agendamento e publicação; captação de imagens no ponto de venda com frequência de [FREQUENCIA_CAPTACAO]; e relatório [PERIODICIDADE_RELATORIO].

Parágrafo segundo. NÃO integram o objeto, salvo contratação apartada: verba e gestão de mídia paga; atendimento a mensagens, comentários e avaliações, que observa a cláusula Do Atendimento; produção de vídeo de alta complexidade, comerciais e institucionais; fotografia profissional de produto em estúdio; identidade visual e branding; site, e-commerce e catálogo; disparo de e-mail e mensagens; e influenciadores, permutas e presentes a criadores.

Parágrafo terceiro. O valor mensal de [VALOR_MENSAL] remunera a disponibilidade da equipe, o planejamento e o volume contratado, e é devido integralmente ainda que a CONTRATANTE demande menos do que o contratado no período.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      {
        id: "oferta_local",
        titulo: "Da Oferta Divulgada e da Responsabilidade do Estabelecimento",
        essencial: true,
        protege: "Preço, estoque e promessa ao consumidor são de quem vende, não de quem publica.",
        texto: `Preços, promoções, condições de pagamento, prazos de entrega, disponibilidade de estoque e demais informações comerciais serão fornecidos pela CONTRATANTE por escrito e publicados pelo CONTRATADO conforme informados e aprovados na pauta.

Parágrafo primeiro. A CONTRATANTE é a única responsável pela veracidade, atualidade e exequibilidade das ofertas divulgadas, respondendo perante consumidores e órgãos de defesa do consumidor pelo seu integral cumprimento, na forma do Código de Defesa do Consumidor.

Parágrafo segundo. Publicações que envolvam produtos sujeitos a regulação específica — alimentos, bebidas alcoólicas, medicamentos, cosméticos, produtos de saúde, serviços financeiros, jogos e apostas — dependem de informação e de conformidade fornecidas pela CONTRATANTE, que responde pela adequação regulatória e pelas exigências dos conselhos e órgãos competentes.

Parágrafo terceiro. Havendo autuação, notificação ou reclamação relativa ao conteúdo comercial publicado, a CONTRATANTE assumirá a defesa e manterá o CONTRATADO indene, nos termos da cláusula Da Limitação de Responsabilidade.

Parágrafo quarto. A CONTRATANTE comunicará imediatamente o esgotamento de estoque, a suspensão de promoção ou qualquer alteração de oferta em vigor, para a retirada ou correção da publicação; a demora nessa comunicação é risco seu.`,
      },
      {
        id: "atendimento_mensagens",
        titulo: "Do Atendimento a Mensagens, Comentários e Avaliações",
        essencial: true,
        protege: "Separa publicar de atender — quem vende é quem responde, salvo contratação à parte.",
        texto: `O atendimento a mensagens diretas, comentários e avaliações caberá a [RESPONSAVEL_PELO_ATENDIMENTO].

Parágrafo primeiro. Não sendo o atendimento objeto deste contrato, o CONTRATADO limita-se a moderar comentários manifestamente ofensivos, discriminatórios, de spam ou de fraude, e a encaminhar à CONTRATANTE as mensagens que demandem resposta comercial.

Parágrafo segundo. O CONTRATADO não responde por venda perdida, cliente não atendido, reclamação não respondida, avaliação negativa ou queda de reputação decorrentes da demora ou da ausência de atendimento pela CONTRATANTE.

Parágrafo terceiro. Sendo o atendimento contratado à parte, aplicam-se os prazos de resposta da cláusula Da Rotina, e a CONTRATANTE fornecerá previamente as informações necessárias — política de trocas, prazos, formas de pagamento, respostas para dúvidas frequentes — sem as quais o CONTRATADO não tem como responder.

Parágrafo quarto. Situações de crise de imagem, exposição negativa ou viralização desfavorável serão comunicadas imediatamente à CONTRATANTE, e o seu tratamento — nota pública, resposta oficial, remoção de conteúdo — dependerá de orientação escrita desta, cabendo ao CONTRATADO a execução, e não a decisão.`,
      },
      {
        id: "captacao_no_ponto",
        titulo: "Da Captação no Ponto de Venda",
        protege: "Define quando, por quanto tempo, e em que condições a loja precisa estar pronta.",
        texto: `A captação de imagens ocorrerá com a frequência de [FREQUENCIA_CAPTACAO], em data e horário agendados com antecedência mínima de 5 (cinco) dias úteis.

Parágrafo primeiro. A CONTRATANTE providenciará, antes do horário agendado: organização e limpeza do ambiente; disponibilidade dos produtos a serem registrados; presença das pessoas que devem aparecer, com as respectivas autorizações de imagem; e ambiente com circulação compatível com a captação.

Parágrafo segundo. O não atendimento das condições acima, o cancelamento com menos de 24 (vinte e quatro) horas de aviso ou o impedimento de acesso caracterizam VISITA PERDIDA, que não gera direito a reposição dentro do mesmo mês nem a abatimento da mensalidade.

Parágrafo terceiro. Visitas adicionais serão orçadas à parte, observadas as cláusulas Do Deslocamento e Da Jornada.

Parágrafo quarto. Não havendo captação suficiente no período por causa imputável à CONTRATANTE, o CONTRATADO poderá compor a pauta com material de banco, com peças gráficas ou com conteúdo produzido a partir de material previamente existente, sem que isso reduza o volume devido nem configure descumprimento.`,
      },
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 3 — MÍDIAS SOCIAIS · 2. GESTÃO DE AUTORIDADE                 */
  /* ================================================================== */
  {
    perfil: "social_media",
    tipoServico: "gestao_de_autoridade",
    nome: "Gestão de Autoridade (Marca Pessoal)",
    descricao:
      "Construção de marca pessoal, onde o produto é a própria pessoa: exige presença dela, define quem fala em nome de quem, protege a reputação dos dois lados e trata o que acontece se ela sumir.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "NOME_DA_PESSOA_PUBLICA", label: "Nome da pessoa/autoridade", tipo: "texto" },
      { tag: "AREA_DE_ATUACAO", label: "Área de atuação", tipo: "texto", exemplo: "advocacia empresarial" },
      { tag: "PERFIS_GERENCIADOS", label: "Perfis gerenciados", tipo: "textarea" },
      { tag: "HORAS_GRAVACAO_MENSAL", label: "Horas mensais de gravação com a pessoa", tipo: "texto", exemplo: "4 horas, em 1 ou 2 encontros" },
      { tag: "LINHA_EDITORIAL", label: "Linha editorial e temas", tipo: "textarea" },
      { tag: "TEMAS_VEDADOS", label: "Temas vedados", tipo: "textarea", exemplo: "política partidária, religião, casos de clientes" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE GESTÃO DE MARCA PESSOAL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 9.610/1998.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de construção e gestão da marca pessoal de [NOME_DA_PESSOA_PUBLICA], profissional de [AREA_DE_ATUACAO], nos perfis [PERFIS_GERENCIADOS].

Parágrafo primeiro. O serviço compreende: definição e manutenção de linha editorial; planejamento de pauta; direção de gravação e captação com a pessoa, no volume de [HORAS_GRAVACAO_MENSAL]; edição e produção de [VOLUME_MENSAL_CONTRATADO]; redação de legendas e roteiros; publicação; e relatório [PERIODICIDADE_RELATORIO].

Parágrafo segundo. A linha editorial acordada é: [LINHA_EDITORIAL]. São temas EXPRESSAMENTE VEDADOS: [TEMAS_VEDADOS].

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: mídia paga; assessoria de imprensa e relacionamento com veículos; gestão de crise reputacional; produção de infoproduto, curso ou livro; palestras e agenda de eventos; e atendimento comercial a interessados.

Parágrafo quarto. O valor mensal de [VALOR_MENSAL] remunera a disponibilidade, o planejamento e o volume contratado.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "presenca_da_pessoa",
        titulo: "Da Indispensável Participação da Pessoa Retratada",
        essencial: true,
        protege: "Marca pessoal sem a pessoa não existe — e a ausência dela não pode virar culpa sua.",
        texto: `As partes reconhecem que o objeto deste contrato depende, por sua própria natureza, da PARTICIPAÇÃO PESSOAL E DIRETA de [NOME_DA_PESSOA_PUBLICA], insubstituível na gravação, no depoimento e na validação do conteúdo.

Parágrafo primeiro. A CONTRATANTE obriga-se a assegurar a disponibilidade de [HORAS_GRAVACAO_MENSAL] por mês, em datas agendadas com antecedência mínima de 7 (sete) dias, bem como a presença preparada da pessoa, com os temas previamente lidos e o vestuário adequado.

Parágrafo segundo. O cancelamento de sessão de gravação com menos de 24 (vinte e quatro) horas de aviso, o atraso superior a 30 (trinta) minutos ou a ausência caracterizam SESSÃO PERDIDA, sem direito a reposição no mesmo mês e sem abatimento da mensalidade, salvo motivo de saúde ou de força maior comprovado, hipótese em que a reposição observará a agenda do CONTRATADO.

Parágrafo terceiro. Não havendo material captado suficiente no período por indisponibilidade da pessoa, o CONTRATADO cumprirá o volume contratado com os formatos possíveis — peças gráficas, carrosséis, cortes de material anterior, conteúdo de texto —, o que a CONTRATANTE desde já aceita como cumprimento integral do mês.

Parágrafo quarto. A indisponibilidade reiterada, por 2 (dois) meses consecutivos, autoriza o CONTRATADO a rescindir o contrato por justa causa imputável à CONTRATANTE, dado que a continuidade sem a pessoa esvazia o objeto e compromete o resultado atribuído ao seu trabalho.`,
      },
      {
        id: "voz_e_reputacao",
        titulo: "Da Voz, da Opinião e da Reputação",
        essencial: true,
        protege: "O que a pessoa afirma é dela; o que o profissional escreve é aprovado antes de sair.",
        texto: `Todo conteúdo publicado é veiculado em nome e sob a responsabilidade de [NOME_DA_PESSOA_PUBLICA], que o aprova previamente na forma da cláusula Da Pauta e da cláusula Da Aprovação.

Parágrafo primeiro. Opiniões, posicionamentos, afirmações técnicas, promessas, orientações profissionais e alegações publicitárias veiculadas são de responsabilidade exclusiva da CONTRATANTE, que responde por sua veracidade, por sua conformidade com a legislação e com as normas do conselho profissional da sua categoria, e por eventual dano a terceiro.

Parágrafo segundo. O CONTRATADO redige e produz conteúdo a partir das informações e das diretrizes fornecidas, não lhe cabendo validar a correção técnica, jurídica, médica, financeira ou científica do que se afirma.

Parágrafo terceiro. O CONTRATADO poderá RECUSAR a produção ou a publicação de conteúdo que repute ilícito, discriminatório, difamatório, que incite violência, que veicule desinformação sabidamente falsa ou que viole normas de publicidade, sem que a recusa configure inadimplemento; persistindo a exigência, caracteriza-se justa causa para rescisão.

Parágrafo quarto. A CONTRATANTE não atribuirá ao CONTRATADO, pública ou privadamente, a autoria de posicionamento que ela própria aprovou, nem o responsabilizará por repercussão negativa de conteúdo aprovado.

Parágrafo quinto. Sobrevindo crise reputacional, o CONTRATADO comunicará imediatamente a CONTRATANTE e poderá suspender publicações programadas até orientação escrita; a gestão da crise, quando desejada, será contratada à parte.`,
      },
      ...CLAUSULAS_DE_ROTINA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_DESLOCAMENTO,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 3 — MÍDIAS SOCIAIS · 3. MENTORIA DE PERFIL                   */
  /* ================================================================== */
  {
    perfil: "social_media",
    tipoServico: "mentoria_de_perfil",
    nome: "Mentoria de Perfil",
    descricao:
      "Ensino e acompanhamento, não execução: encontros contados, prazo de validade, regra de falta, sigilo do método e a ressalva mais importante — quem executa é o mentorado, e o resultado depende dele.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "NUMERO_ENCONTROS", label: "Nº de encontros", tipo: "numero", exemplo: "8" },
      { tag: "DURACAO_ENCONTRO", label: "Duração de cada encontro", tipo: "texto", exemplo: "1 hora" },
      { tag: "PERIODICIDADE_ENCONTROS", label: "Periodicidade", tipo: "texto", exemplo: "quinzenal" },
      { tag: "PRAZO_VALIDADE_MENTORIA", label: "Prazo de validade para usar os encontros", tipo: "texto", exemplo: "6 meses" },
      { tag: "FORMATO_DOS_ENCONTROS", label: "Formato", tipo: "texto", exemplo: "on-line, por videochamada, com gravação disponibilizada" },
      { tag: "CANAL_DE_SUPORTE", label: "Canal de suporte entre encontros", tipo: "texto", exemplo: "mensagens assíncronas, respondidas em até 1 dia útil" },
      { tag: "MATERIAIS_INCLUSOS", label: "Materiais inclusos", tipo: "textarea", exemplo: "diagnóstico inicial de perfil, planilha de pauta, checklist de bio e roteiro-modelo" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MENTORIA E CONSULTORIA DE PERFIL

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE ou MENTORADA;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO ou MENTOR;

têm entre si justo e contratado o presente instrumento, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Mentoria é ensino e direção, não mão de obra — e essa distinção é o contrato inteiro.",
        texto: `Constitui objeto deste contrato a prestação de serviços de MENTORIA, consistente em orientação técnica, diagnóstico, direcionamento estratégico e acompanhamento da CONTRATANTE na gestão do seu próprio perfil.

Parágrafo primeiro. O programa compreende [NUMERO_ENCONTROS] encontros de [DURACAO_ENCONTRO] cada, com periodicidade [PERIODICIDADE_ENCONTROS], em formato [FORMATO_DOS_ENCONTROS], acompanhados de [MATERIAIS_INCLUSOS] e de suporte por [CANAL_DE_SUPORTE].

Parágrafo segundo. A MENTORIA NÃO COMPREENDE EXECUÇÃO. Não integram o objeto, em nenhuma hipótese e salvo contratação apartada de serviço distinto: criação de conteúdo, redação de legendas, edição de vídeo, design de peças, agendamento, publicação, atendimento a mensagens, gestão de tráfego e operação do perfil. O CONTRATADO orienta; quem executa é a CONTRATANTE.

Parágrafo terceiro. A CONTRATANTE reconhece que a mentoria é serviço de natureza intelectual e educacional, e que o seu aproveitamento depende diretamente do estudo, da dedicação e da APLICAÇÃO PRÁTICA das orientações por ela própria.

Parágrafo quarto. Os encontros poderão ser gravados e disponibilizados à CONTRATANTE para uso pessoal e exclusivo, vedada a reprodução, o compartilhamento, a revenda e a exibição a terceiros.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "encontros_e_faltas",
        titulo: "Dos Encontros, das Faltas e da Validade do Programa",
        essencial: true,
        protege: "Hora reservada é hora paga — e o programa não fica pendurado para sempre.",
        texto: `Os encontros serão agendados de comum acordo, observada a periodicidade pactuada, e a hora reservada é bloqueada na agenda do CONTRATADO com a consequente recusa de outros compromissos.

Parágrafo primeiro. O reagendamento é admitido mediante aviso com antecedência mínima de 24 (vinte e quatro) horas, limitado a 2 (duas) vezes ao longo do programa.

Parágrafo segundo. A ausência sem aviso, o aviso com menos de 24 (vinte e quatro) horas ou o atraso superior a 15 (quinze) minutos importam na CONSUMAÇÃO do encontro, que será computado como realizado, sem direito a reposição ou abatimento.

Parágrafo terceiro. Atraso do CONTRATADO importa na extensão equivalente do encontro ou, não sendo possível, na reposição integral em nova data.

Parágrafo quarto. O programa tem validade de [PRAZO_VALIDADE_MENTORIA] contados da assinatura. Encontros não realizados dentro desse prazo por causa imputável à CONTRATANTE consideram-se prestados e não geram crédito, restituição ou prorrogação, salvo motivo de saúde ou força maior comprovados, hipótese em que a prorrogação será de até 60 (sessenta) dias.

Parágrafo quinto. O suporte entre encontros observa o canal e os prazos pactuados, e destina-se a dúvidas objetivas sobre a execução das orientações — não substitui o encontro nem constitui atendimento permanente.`,
      },
      {
        id: "resultado_da_mentoria",
        titulo: "Da Ausência de Garantia de Resultado na Mentoria",
        essencial: true,
        protege: "Ninguém pode garantir seguidor nem faturamento — e aqui isso é explicado, não escondido.",
        texto: `A obrigação assumida pelo CONTRATADO é de MEIO: transmitir conhecimento, diagnosticar, orientar e acompanhar com técnica e diligência.

Parágrafo primeiro. NÃO HÁ garantia de crescimento de seguidores, alcance, engajamento, autoridade percebida, número de clientes, faturamento ou qualquer outro resultado, os quais dependem preponderantemente da execução, da constância, do posicionamento, do produto e do mercado da própria CONTRATANTE, além de fatores das plataformas descritos na cláusula Das Plataformas de Terceiros.

Parágrafo segundo. Casos, números e exemplos eventualmente apresentados referem-se a experiências específicas e NÃO constituem promessa de reprodução de resultado, nem representam desempenho médio.

Parágrafo terceiro. A não aplicação das orientações, a aplicação parcial, a descontinuidade ou a alteração unilateral da estratégia pela CONTRATANTE afastam qualquer pretensão de reexecução gratuita, de prorrogação ou de restituição.

Parágrafo quarto. A restituição de valores em razão de insatisfação subjetiva com o conteúdo transmitido não é devida, ressalvado o direito de arrependimento legalmente assegurado, quando aplicável à contratação a distância, exercido no prazo de 7 (sete) dias contados da assinatura e antes da realização do primeiro encontro.

Parágrafo quinto. Sendo a CONTRATANTE consumidora, nada nesta cláusula afasta os direitos que o Código de Defesa do Consumidor lhe assegura quanto a vício na prestação do serviço.`,
      },
      {
        id: "sigilo_do_metodo",
        titulo: "Do Método, do Material e da Proibição de Reprodução",
        protege: "Impede que a mentoria vire curso de outra pessoa na semana seguinte.",
        texto: `O método, a estrutura do programa, os diagnósticos, os modelos, as planilhas, os roteiros e os demais materiais fornecidos são de titularidade exclusiva do CONTRATADO, protegidos pela Lei nº 9.610/1998, e são licenciados à CONTRATANTE para uso pessoal, intransferível e não exclusivo.

Parágrafo primeiro. É VEDADO à CONTRATANTE: reproduzir, distribuir, compartilhar, revender, sublicenciar, exibir publicamente ou disponibilizar a terceiros o conteúdo dos encontros, as gravações e os materiais; utilizá-los para ministrar mentoria, curso, treinamento ou consultoria própria ou de terceiro; e utilizá-los para treinar sistemas de inteligência artificial.

Parágrafo segundo. A violação sujeita a CONTRATANTE à multa prevista na cláusula Da Confidencialidade, sem prejuízo das perdas e danos e da apuração de violação de direito autoral.

Parágrafo terceiro. As informações do negócio da CONTRATANTE reveladas ao CONTRATADO durante a mentoria — números, estratégias, dificuldades, planos — são igualmente confidenciais e recebem a mesma proteção, na forma da cláusula Da Confidencialidade.

Parágrafo quarto. Nada impede que o CONTRATADO utilize, em outros programas, o conhecimento, a experiência e as técnicas de que já era detentor, ou que venha a desenvolver de forma independente.`,
      },
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ROTINA_E_ATENDIMENTO,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 3 — MÍDIAS SOCIAIS · 4. SAC 2.0                              */
  /* ================================================================== */
  {
    perfil: "social_media",
    tipoServico: "sac_2_0",
    nome: "SAC 2.0 (Atendimento nas Redes)",
    descricao:
      "Atendimento ao consumidor pelas redes, com janela de operação, prazos de resposta, script aprovado, protocolo de crise e a fronteira exata entre responder e decidir.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      { tag: "CANAIS_ATENDIDOS", label: "Canais atendidos", tipo: "textarea", exemplo: "direct do Instagram, comentários, WhatsApp Business e avaliações do Google" },
      { tag: "VOLUME_MENSAL_ATENDIMENTOS", label: "Volume mensal de atendimentos incluso", tipo: "texto", exemplo: "até 600 interações" },
      { tag: "VALOR_ATENDIMENTO_EXCEDENTE", label: "Valor por interação excedente", tipo: "moeda" },
      { tag: "PRAZO_PRIMEIRA_RESPOSTA", label: "Prazo de primeira resposta", tipo: "texto", exemplo: "30 minutos dentro da janela de atendimento" },
      { tag: "NIVEL_DE_ALCADA", label: "Alçada do contratado", tipo: "textarea", exemplo: "informar, orientar e registrar; não conceder desconto, reembolso ou troca" },
      { tag: "RESPONSAVEL_ESCALONAMENTO", label: "Quem recebe os casos escalonados", tipo: "texto" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO CONTINUADA DE SERVIÇOS DE ATENDIMENTO EM MÍDIAS SOCIAIS

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], inscrita no CPF/CNPJ sob o nº [CPF_CNPJ_CLIENTE], com sede/domicílio em [ENDERECO_CLIENTE], doravante simplesmente CONTRATANTE;

CONTRATADO: [NOME_CONTRATADO], [QUALIFICACAO_CONTRATADO], inscrito no CPF/CNPJ sob o nº [CPF_CNPJ_CONTRATADO], com sede/domicílio em [ENDERECO_CONTRATADO], doravante simplesmente CONTRATADO;

têm entre si justo e contratado o presente instrumento de prestação de serviços de trato sucessivo, que se regerá pelas cláusulas a seguir e, no que for omisso, pela Lei nº 10.406/2002 e pela Lei nº 13.709/2018.`,
      },
      {
        id: "objeto",
        titulo: "Do Objeto",
        essencial: true,
        protege: "Delimita exatamente o que está incluso — e, por consequência, o que não está.",
        texto: `Constitui objeto deste contrato a prestação continuada de serviços de atendimento ao público da CONTRATANTE nos canais [CANAIS_ATENDIDOS], no volume de [VOLUME_MENSAL_ATENDIMENTOS] por mês.

Parágrafo primeiro. O atendimento ocorrerá em [HORARIO_DE_ATENDIMENTO], com prazo de primeira resposta de [PRAZO_PRIMEIRA_RESPOSTA], observando o script, a política e as respostas-padrão aprovados pela CONTRATANTE.

Parágrafo segundo. Interações que excedam o volume contratado serão cobradas a [VALOR_ATENDIMENTO_EXCEDENTE] por interação, faturadas com a mensalidade seguinte, ficando a CONTRATANTE previamente cientificada sempre que o volume atingir 80% (oitenta por cento) do contratado.

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: produção de conteúdo e gestão de pauta; mídia paga; atendimento telefônico e presencial; operação de pós-venda, logística, trocas e devoluções; emissão de documentos fiscais; e atendimento fora da janela contratada.

Parágrafo quarto. O CONTRATADO atua como CANAL de atendimento, transmitindo ao público as informações e as decisões da CONTRATANTE — não substitui a estrutura de atendimento, de suporte técnico ou de resolução de conflitos desta.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "alcada_e_escalonamento",
        titulo: "Da Alçada, do Script e do Escalonamento",
        essencial: true,
        protege: "Quem atende não decide sozinho — e o que não pode ser decidido sobe para o cliente.",
        texto: `A alçada do CONTRATADO limita-se a: [NIVEL_DE_ALCADA].

Parágrafo primeiro. Estão FORA da alçada, e serão escalonadas a [RESPONSAVEL_ESCALONAMENTO], as demandas que envolvam: concessão de desconto, cortesia, reembolso, troca ou cancelamento; assunção de responsabilidade por dano; informação técnica não constante do material aprovado; negociação de preço ou prazo; ameaça de ação judicial, notificação de órgão de defesa do consumidor ou exposição em imprensa; e qualquer situação não prevista no script.

Parágrafo segundo. A CONTRATANTE fornecerá, antes do início da operação e sempre que houver alteração, o script de atendimento, a política comercial, a política de trocas e devoluções, os prazos praticados e o banco de respostas às dúvidas frequentes. A ausência ou a desatualização desses insumos impede o atendimento adequado e suspende o prazo de resposta quanto às demandas afetadas.

Parágrafo terceiro. O CONTRATADO responderá pelo cumprimento do script; NÃO responde pelo mérito da política comercial, pelo produto, pelo serviço, pelo prazo de entrega, pela qualidade do atendimento presencial, nem pela decisão da CONTRATANTE de acolher ou recusar a demanda do consumidor.

Parágrafo quarto. Não havendo resposta da CONTRATANTE às demandas escalonadas dentro do prazo de [PRAZO_RESPOSTA_SLA], o CONTRATADO informará ao consumidor que o caso está em análise, ficando afastada a sua responsabilidade pelo decurso do prazo e pelas consequências dele.

Parágrafo quinto. É vedado à CONTRATANTE exigir do CONTRATADO a prestação de informação falsa, a omissão de informação obrigatória, a exclusão de reclamação legítima ou qualquer conduta que viole o Código de Defesa do Consumidor.`,
      },
      {
        id: "crise_e_moderacao",
        titulo: "Da Moderação, da Crise e da Preservação da Prova",
        protege: "Regra fria para o dia quente: o que se apaga, o que se responde e quem decide.",
        texto: `A moderação observará critérios objetivos previamente aprovados, sendo desde já autorizada a ocultação ou exclusão de conteúdo que contenha discurso de ódio, discriminação, ameaça, dado pessoal de terceiro, conteúdo sexual, spam, golpe ou divulgação de concorrente.

Parágrafo primeiro. É VEDADA a exclusão de reclamação legítima de consumidor pelo só fato de ser negativa, prática que expõe a CONTRATANTE a sanção e que o CONTRATADO não executará ainda que instruído nesse sentido.

Parágrafo segundo. Configurada crise — volume anormal de reclamações, viralização negativa, acusação grave, envolvimento de imprensa ou de autoridade —, o CONTRATADO comunicará imediatamente a CONTRATANTE pelo canal de urgência, suspenderá publicações programadas e aguardará orientação escrita.

Parágrafo terceiro. Manifestações públicas oficiais, notas de esclarecimento e pedidos de desculpa são atos da CONTRATANTE, redigidos ou revisados por quem ela indicar, cabendo ao CONTRATADO apenas a veiculação do texto aprovado.

Parágrafo quarto. O CONTRATADO manterá registro das interações atendidas pelo prazo de 6 (seis) meses, disponibilizando-o à CONTRATANTE quando solicitado, inclusive para instruir defesa perante órgão de defesa do consumidor ou juízo.

Parágrafo quinto. O tratamento dos dados pessoais dos consumidores observará a cláusula Da Proteção de Dados, sendo a CONTRATANTE a controladora e o CONTRATADO o operador.`,
      },
      CLAUSULA_ROTINA_E_ATENDIMENTO,
      CLAUSULA_VIGENCIA_E_RENOVACAO,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
  /* ================================================================== */
  /* GRUPO 3 — MÍDIAS SOCIAIS · 5. LANÇAMENTOS                          */
  /* ================================================================== */
  {
    perfil: "social_media",
    tipoServico: "lancamentos_digitais",
    nome: "Lançamentos",
    descricao:
      "Operação de lançamento com data marcada: cronograma travado, disponibilidade intensiva, remuneração fixa com bônus opcional por resultado, e o que acontece se o cliente adiar o carrinho na véspera.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      ...CAMPOS_OPERACIONAIS_COMUNS,
      ...CAMPOS_SERVICO_CONTINUO,
      ...CAMPOS_TRAFEGO,
      { tag: "NOME_DO_PRODUTO", label: "Produto lançado", tipo: "texto" },
      { tag: "MODELO_DE_LANCAMENTO", label: "Modelo de lançamento", tipo: "texto", exemplo: "lançamento semente com 3 aulas e carrinho de 5 dias" },
      { tag: "DATA_INICIO_CAPTACAO", label: "Início da captação de leads", tipo: "data" },
      { tag: "DATA_ABERTURA_CARRINHO", label: "Abertura do carrinho", tipo: "data" },
      { tag: "DATA_FECHAMENTO_CARRINHO", label: "Fechamento do carrinho", tipo: "data" },
      { tag: "ENTREGAVEIS_LANCAMENTO", label: "Entregáveis do lançamento", tipo: "textarea", exemplo: "40 peças de aquecimento, 12 criativos de anúncio, 30 stories por dia de carrinho, 8 e-mails" },
      { tag: "PERCENTUAL_BONUS_RESULTADO", label: "% de bônus sobre o faturamento (se houver)", tipo: "percentual", exemplo: "3" },
      { tag: "PRAZO_PAGAMENTO_BONUS", label: "Prazo de pagamento do bônus", tipo: "texto", exemplo: "15 dias após o fim do prazo de garantia" },
      { tag: "VALOR_MULTA_ADIAMENTO", label: "Multa por adiamento do lançamento", tipo: "moeda" },
    ],
    clausulas: [
      {
        id: "preambulo",
        titulo: "Qualificação das partes",
        essencial: true,
        protege: "Identifica quem se obriga — sem isso não há a quem cobrar.",
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE OPERAÇÃO DE LANÇAMENTO DIGITAL

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
        texto: `Constitui objeto deste contrato a operação de conteúdo do lançamento do produto [NOME_DO_PRODUTO], no modelo [MODELO_DE_LANCAMENTO], compreendendo o período de [DATA_INICIO_CAPTACAO] a [DATA_FECHAMENTO_CARRINHO].

Parágrafo primeiro. Os entregáveis compreendem: [ENTREGAVEIS_LANCAMENTO].

Parágrafo segundo. O cronograma-mestre é: início da captação em [DATA_INICIO_CAPTACAO]; abertura do carrinho em [DATA_ABERTURA_CARRINHO]; fechamento em [DATA_FECHAMENTO_CARRINHO].

Parágrafo terceiro. NÃO integram o objeto, salvo contratação apartada: verba de mídia, que observa a cláusula Da Verba; produção do produto e das aulas vendidas; plataforma de vendas, área de membros e integrações; ferramenta de e-mail e automação; suporte ao comprador e pós-venda; emissão fiscal, gateway e antifraude; e assessoria jurídica ou contábil da operação.

Parágrafo quarto. Este é contrato de PROJETO com data certa, e não de trato sucessivo: o preço remunera a operação do lançamento contratado, não período de tempo.`,
      },
      CLAUSULA_OBRIGACOES_DAS_PARTES,
      {
        id: "cronograma_travado",
        titulo: "Do Cronograma Travado e do Adiamento",
        essencial: true,
        protege: "Lançamento tem data — e mexer nela na véspera destrói agenda e custa dinheiro.",
        texto: `As datas do cronograma-mestre são ESSENCIAIS a este contrato: sobre elas se organizam a produção antecipada de peças, a reserva integral da agenda do CONTRATADO no período e a recusa de outros projetos concorrentes.

Parágrafo primeiro. O adiamento do lançamento por iniciativa da CONTRATANTE, comunicado com menos de 15 (quinze) dias da data de abertura do carrinho, sujeita-a ao pagamento da multa de [VALOR_MULTA_ADIAMENTO], destinada a compensar a agenda bloqueada e não realocável, sem prejuízo do valor integral das etapas já executadas.

Parágrafo segundo. Havendo adiamento, a retomada do projeto observará a próxima janela livre na agenda do CONTRATADO, que não se obriga a atender a nova data pretendida pela CONTRATANTE.

Parágrafo terceiro. O cancelamento do lançamento após o início da captação de leads torna devido o valor integral do contrato, dado que a operação foi mobilizada, as peças produzidas e a audiência já convocada.

Parágrafo quarto. Atrasos da CONTRATANTE na entrega de insumos essenciais — gravação das aulas, definição de oferta, preço, bônus, página de vendas, configuração da plataforma — que inviabilizem o cumprimento do cronograma equivalem a adiamento, com os efeitos desta cláusula.

Parágrafo quinto. Durante a semana de carrinho aberto, o CONTRATADO manterá disponibilidade estendida, e a CONTRATANTE, por sua vez, manterá pessoa com poderes de decisão acessível para aprovações imediatas, sob pena de o CONTRATADO seguir a última orientação escrita disponível.`,
      },
      {
        id: "oferta_e_promessa",
        titulo: "Da Oferta, da Promessa e da Conformidade da Publicidade",
        essencial: true,
        protege: "A promessa vendida é do infoprodutor — e ninguém aqui divulga promessa ilegal.",
        texto: `A definição da oferta, do preço, dos bônus, da garantia, da política de reembolso e das promessas de resultado veiculadas é de competência e de responsabilidade exclusivas da CONTRATANTE.

Parágrafo primeiro. A CONTRATANTE declara que o produto existe, que será entregue conforme anunciado, que dispõe de estrutura para atender os compradores, e que a sua publicidade observa o Código de Defesa do Consumidor, as normas do CONAR, as políticas das plataformas e, quando aplicável, a regulamentação do conselho profissional da área.

Parágrafo segundo. O CONTRATADO NÃO produzirá nem veiculará peça que contenha: promessa de ganho financeiro garantido; alegação de cura, tratamento ou resultado de saúde sem respaldo; depoimento falso ou fabricado; escassez ou urgência inverídicas; prova social forjada; ou omissão de informação essencial ao consumidor. A exigência nesse sentido autoriza a recusa e, persistindo, a rescisão por justa causa com direito ao valor integral do contrato.

Parágrafo terceiro. Depoimentos de alunos e casos de resultado apresentados serão fornecidos pela CONTRATANTE, que responde pela sua veracidade e pela existência de autorização de uso de imagem e voz.

Parágrafo quarto. Reprovações de anúncio, restrições de conta e bloqueios aplicados pelas plataformas em razão do conteúdo da oferta são risco da CONTRATANTE, na forma da cláusula Das Plataformas de Terceiros.`,
      },
      {
        id: "remuneracao_e_bonus",
        titulo: "Da Remuneração Fixa e do Bônus por Resultado",
        protege: "O fixo paga o trabalho; o bônus, quando existe, tem base, prazo e prova definidos.",
        texto: `A remuneração do CONTRATADO é FIXA, no valor de [VALOR_DO_SERVIÇO], devida integralmente pela operação contratada, independentemente do faturamento obtido no lançamento.

Parágrafo primeiro. Havendo pactuação de bônus por resultado, este corresponderá a [PERCENTUAL_BONUS_RESULTADO]% incidente sobre o faturamento LÍQUIDO do lançamento, assim entendido o valor efetivamente recebido pela CONTRATANTE, deduzidos exclusivamente: reembolsos concedidos dentro do prazo de garantia, chargebacks, taxas da plataforma e do meio de pagamento, e comissões de afiliados.

Parágrafo segundo. Não se deduzem da base de cálculo do bônus: verba de mídia, custos de equipe, tributos sobre a receita, despesas administrativas e demais custos da CONTRATANTE.

Parágrafo terceiro. O bônus será apurado com base nos relatórios nativos da plataforma de vendas, aos quais o CONTRATADO terá acesso de leitura, e pago em [PRAZO_PAGAMENTO_BONUS].

Parágrafo quarto. A CONTRATANTE obriga-se a não desviar vendas para meio de pagamento paralelo, cupom externo ou canal não rastreável com o fim de reduzir a base de cálculo, sob pena de o bônus ser apurado por arbitramento sobre a estimativa razoável do faturamento.

Parágrafo quinto. O bônus tem natureza de participação em resultado e NÃO transforma o CONTRATADO em sócio, coprodutor ou responsável pelo produto, tampouco lhe transfere risco do negócio.`,
      },
      CLAUSULA_VERBA_DE_MIDIA,
      CLAUSULA_ACESSOS_E_CONTAS,
      CLAUSULA_PLATAFORMAS_TERCEIROS,
      CLAUSULA_ROTINA_E_ATENDIMENTO,
      CLAUSULA_APROVACAO_E_REFACOES,
      CLAUSULA_ALTERACOES_DE_ESCOPO,
      CLAUSULA_PRAZOS_E_INSUMOS,
      CLAUSULA_ENTREGA,
      CLAUSULA_BACKUP,
      CLAUSULA_DIREITOS_AUTORAIS,
      CLAUSULA_DIREITO_DE_IMAGEM,
      CLAUSULA_PORTFOLIO,
      ...CLAUSULAS_DE_FECHAMENTO,
    ],
  },
];
