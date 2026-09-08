import { CAMPOS_COMUNS_CONTRATO, type ModeloContratoServico } from "./tipos";

/**
 * Banco de modelos de contrato do perfil DESIGNER — v2, 7 tipos de serviço
 * (substitui a v1 de 5 tipos genéricos). Cláusulas específicas do nicho:
 * exclusão de responsabilidade do designer por conformidade regulatória de
 * rótulos, por erro aprovado em prova de impressão, por conflito de marca
 * sem busca prévia de disponibilidade contratada, e por divergência entre
 * design entregue e implementação técnica de terceiros (UI/UX).
 *
 * IMPORTANTE: estes textos foram redigidos com padrão jurídico profissional,
 * mas NÃO substituem a revisão de um advogado antes do uso em produção com
 * clientes reais.
 */
export const MODELOS_DESIGNER: ModeloContratoServico[] = [
  {
    perfil: "designer",
    tipoServico: "identidade_visual_branding",
    nome: "Identidade Visual / Branding",
    descricao: "Criação de logotipo e manual de marca, com cessão de direitos mediante quitação integral e isenção sobre busca de disponibilidade de marca no INPI, quando não contratada.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DA_MARCA", label: "Nome da marca", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_DE_PROPOSTAS_INICIAIS", label: "Nº de propostas iniciais", tipo: "numero", exemplo: "3" },
      { tag: "FORMATO_DE_APRESENTACAO", label: "Formato de apresentação", tipo: "texto", exemplo: "reunião online" },
      { tag: "PRAZO_PROPOSTAS_INICIAIS", label: "Prazo de entrega das propostas iniciais", tipo: "texto", exemplo: "10 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_RODADA_ADICIONAL", label: "Valor de rodada adicional", tipo: "moeda" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE IDENTIDADE VISUAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de identidade visual da marca [NOME_DA_MARCA], compreendendo [DESCRICAO_DOS_ENTREGAVEIS].

2. DO ESCOPO E DO PROCESSO CRIATIVO
2.1. Etapas: briefing, [NUMERO_DE_PROPOSTAS_INICIAIS] propostas iniciais de conceito, refinamento da opção escolhida, e entrega final. Etapa de briefing preenchido pela CONTRATANTE é pré-requisito para início do trabalho.
2.2. Apresentação das propostas conforme [FORMATO_DE_APRESENTACAO].

3. DO PRAZO DE ENTREGA
3.1. Entrega das propostas iniciais em até [PRAZO_PROPOSTAS_INICIAIS] dias corridos após o briefing. Entrega final em até [PRAZO_DE_ENTREGA] dias corridos após a aprovação do conceito escolhido.
3.2. Atrasos motivados pela CONTRATANTE (briefing incompleto, demora em aprovações) suspendem a contagem do prazo.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste sobre o conceito escolhido. Mudança de conceito já aprovado, ou nova rodada de propostas iniciais após a escolha, é cobrada à parte no valor de [VALOR_RODADA_ADICIONAL].
4.2. Comentários genéricos e não específicos (ex.: "não gostei", "quero algo diferente") sem direcionamento objetivo podem ser solicitados a ser detalhados pelo(a) CONTRATADO(A) antes de iniciar nova rodada, para preservar a rodada de revisão.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Os arquivos finais em alta resolução e formatos editáveis (vetoriais) só são entregues após a quitação integral do valor contratado.

6. DA CESSÃO DE DIREITOS AUTORAIS
6.1. Mediante pagamento integral, o(a) CONTRATADO(A) cede à CONTRATANTE os direitos patrimoniais de uso da identidade visual criada, para os fins comerciais da marca, sem limitação de prazo.
6.2. O(a) CONTRATADO(A) pode usar o material (incluindo processo criativo/bastidores) em portfólio e divulgação profissional, com crédito, salvo pedido expresso e por escrito de embargo de divulgação por prazo determinado.
6.3. Da busca prévia de disponibilidade de marca (cláusula essencial): salvo se expressamente contratada como serviço adicional, a pesquisa de disponibilidade e viabilidade de registro do nome/marca perante o INPI e órgãos correlatos NÃO está incluída neste contrato, sendo de responsabilidade exclusiva da CONTRATANTE verificar a disponibilidade do nome/marca escolhido antes do lançamento comercial. O(a) CONTRATADO(A) não se responsabiliza por eventual conflito com marca de terceiros já registrada.

7. DA RESCISÃO E DAS MULTAS
7.1. Desistência da CONTRATANTE após início do trabalho: pagamento proporcional às etapas já entregues (propostas iniciais, refinamento), acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente, a título de reserva de agenda.
7.2. Rescisão por inadimplemento do(a) CONTRATADO(A) sem justa causa: devolução dos valores de etapas não realizadas, sem prejuízo de indenização por danos comprovados.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre a marca/produto não lançado, propostas de conceito e briefing estratégico pelo prazo de [PRAZO_CONFIDENCIALIDADE], especialmente relevante para marcas ainda não divulgadas publicamente.

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Tratamento de dados pessoais conforme a Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Nenhuma parte responde por atraso decorrente de caso fortuito ou força maior.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. A responsabilidade do(a) CONTRATADO(A) fica limitada ao valor total pago, excluída responsabilidade por lucros cessantes, danos indiretos, ou por conflito de marca/registro decorrente da ausência de busca prévia (cláusula 6.3), quando não contratada.
11.2. A CONTRATANTE se compromete a indenizar e manter o(a) CONTRATADO(A) isento(a) de qualquer reclamação, multa ou processo decorrente de: (i) uso do nome/marca escolhido sem verificação prévia de disponibilidade; (ii) informações/briefing falsos ou incompletos; (iii) uso do material fora dos limites da cessão concedida neste contrato.
11.3. Manifestações públicas negativas feitas pela CONTRATANTE de forma comprovadamente inverídica ou de má-fé poderão ser objeto de notificação extrajudicial e das medidas cabíveis, sem prejuízo do direito de resposta do(a) CONTRATADO(A).

12. DAS DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício, societário ou de representação. Alterações somente por aditivo escrito.

13. DO FORO
13.1. Foro da Comarca de [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "design_redes_sociais",
    nome: "Design para Redes Sociais",
    descricao: "Criação mensal de peças gráficas para redes sociais, dentro da identidade visual já existente da marca, em regime de pacote mensal.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis mensais", tipo: "textarea" },
      { tag: "CALENDARIO_DE_PAUTAS", label: "Calendário de pautas", tipo: "textarea" },
      { tag: "PRAZO_APROVACAO_PAUTA", label: "Prazo de aprovação de pauta", tipo: "texto", exemplo: "3 dias úteis" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por peça", tipo: "numero", exemplo: "1" },
      { tag: "DIA_VENCIMENTO_MENSAL", label: "Dia de vencimento mensal", tipo: "texto", exemplo: "5" },
      { tag: "PRAZO_SUSPENSAO_POR_INADIMPLENCIA", label: "Prazo para suspensão por inadimplência", tipo: "texto", exemplo: "5 dias" },
      { tag: "PRAZO_FIDELIDADE_MINIMA", label: "Prazo de fidelidade mínima", tipo: "texto", exemplo: "6 meses" },
      { tag: "PRAZO_AVISO_RESCISAO", label: "Prazo de aviso para rescisão", tipo: "texto", exemplo: "30 dias" },
      { tag: "PERCENTUAL_MULTA_FIDELIDADE", label: "% multa por rescisão antecipada na fidelidade", tipo: "percentual", exemplo: "30" },
      { tag: "PRAZO_MINIMO_GUARDA_BACKUP", label: "Prazo mínimo de guarda de backup", tipo: "texto", exemplo: "30 dias" },
      { tag: "VALOR_TAXA_REENVIO", label: "Valor da taxa de reenvio", tipo: "moeda" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN PARA REDES SOCIAIS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de peças gráficas para as redes sociais da CONTRATANTE, em regime de contrato mensal contínuo, dentro da identidade visual já existente da marca.

2. DO ESCOPO MENSAL
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. Calendário: [CALENDARIO_DE_PAUTAS], aprovado em até [PRAZO_APROVACAO_PAUTA].
2.2. Peças fora do escopo mensal (materiais impressos, apresentações institucionais, embalagens) são orçadas à parte.

3. DO PRAZO DE ENTREGA
3.1. Cada peça entregue em até [PRAZO_DE_ENTREGA] dias corridos após aprovação do briefing/pauta.

4. DAS REVISÕES
4.1. Inclusa [NUMERO_REVISOES_INCLUSAS] rodada de ajuste por peça. Rodadas adicionais cobradas à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor mensal: [VALOR_DO_SERVIÇO], vencendo-se todo dia [DIA_VENCIMENTO_MENSAL]. Pagamento: [CONDICOES_DE_PAGAMENTO].
5.2. Atraso superior a [PRAZO_SUSPENSAO_POR_INADIMPLENCIA] autoriza a suspensão da produção do mês.

6. DA VIGÊNCIA E DA RESCISÃO
6.1. Contrato mensal renovável, com fidelidade mínima de [PRAZO_FIDELIDADE_MINIMA], quando pactuada. Rescisão mediante aviso de [PRAZO_AVISO_RESCISAO]; rescisão antecipada dentro da fidelidade sujeita a multa de [PERCENTUAL_MULTA_FIDELIDADE]% sobre as mensalidades remanescentes.

7. DO ARMAZENAMENTO PÓS-CONTRATO
7.1. Arquivos-fonte (editáveis) mantidos apenas durante a vigência, elimináveis a partir de [PRAZO_MINIMO_GUARDA_BACKUP] após o encerramento. Recuperação cobrada a [VALOR_TAXA_REENVIO].

8. DOS DIREITOS DE USO
8.1. Cedidos à CONTRATANTE os direitos de uso das peças, mediante pagamento integral. O(a) CONTRATADO(A) pode usar em portfólio, salvo vedação por escrito.

9. DA CONFIDENCIALIDADE
9.1. Sigilo sobre calendário de lançamentos e informações internas pelo prazo de [PRAZO_CONFIDENCIALIDADE].

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
10.1. Conforme Lei nº 13.709/2018.

11. DO CASO FORTUITO E FORÇA MAIOR
11.1. Termos gerais.

12. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
12.1. Limitada ao valor da mensalidade do mês do fato gerador, excluída responsabilidade por resultado de engajamento/vendas.
12.2. A CONTRATANTE indeniza por: (i) informações/imagens fornecidas por ela sem direito de uso; (ii) publicidade enganosa decorrente de informação de sua responsabilidade; (iii) uso do material fora do combinado.
12.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

13. DISPOSIÇÕES GERAIS
13.1. Sem vínculo empregatício/societário.

14. DO FORO
14.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "design_embalagens_rotulos",
    nome: "Design de Embalagens e Rótulos",
    descricao: "Design de embalagem/rótulo, com responsabilidade regulatória (ANVISA/INPI, tabela nutricional etc.) exclusiva da contratante e transferência de responsabilidade após aprovação da prova de impressão.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_PRODUTO", label: "Nome do produto", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_DE_PROPOSTAS_INICIAIS", label: "Nº de propostas iniciais", tipo: "numero", exemplo: "2" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN DE EMBALAGENS E RÓTULOS

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de design de embalagem/rótulo para o produto [NOME_DO_PRODUTO], compreendendo [DESCRICAO_DOS_ENTREGAVEIS].

2. DO ESCOPO E DA RESPONSABILIDADE REGULATÓRIA
2.1. Etapas: briefing, [NUMERO_DE_PROPOSTAS_INICIAIS] propostas de conceito, refinamento, arquivo final pronto para impressão (print-ready).
2.2. Da conformidade regulatória (cláusula essencial): cabe exclusivamente à CONTRATANTE fornecer todas as informações obrigatórias por lei/regulamento para o rótulo do produto (ex.: tabela nutricional, registro em órgão sanitário/ANVISA, informações de composição, selo de certificação, avisos legais), bem como validar o layout final quanto ao cumprimento dessas exigências antes da aprovação de impressão. O(a) CONTRATADO(A) diagrama as informações fornecidas, mas não responde pela veracidade, completude ou conformidade regulatória do conteúdo técnico do rótulo.
2.3. A aprovação da "prova de impressão" (arquivo final revisado pela CONTRATANTE) transfere a esta a responsabilidade por qualquer erro remanescente não apontado nessa revisão.

3. DO PRAZO DE ENTREGA
3.1. Entrega do arquivo final em até [PRAZO_DE_ENTREGA] dias corridos após a aprovação do conceito e o fornecimento de todas as informações regulatórias pela CONTRATANTE.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste. Alterações após aprovação da prova de impressão (cláusula 2.3) são cobradas à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final liberado após quitação integral.

6. DA CESSÃO DE DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do design para o produto especificado, sem limitação de prazo, mediante pagamento integral. O(a) CONTRATADO(A) pode usar em portfólio, salvo vedação por escrito.

7. DA RESCISÃO
7.1. Desistência após início do trabalho: pagamento proporcional às etapas entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre a fórmula/produto não lançado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por conformidade regulatória do conteúdo do rótulo (cláusula 2.2) e por erros aprovados na prova de impressão (cláusula 2.3).
11.2. A CONTRATANTE indeniza por: (i) informações técnicas/regulatórias incorretas ou incompletas fornecidas por ela; (ii) autuação de órgão sanitário/de defesa do consumidor decorrente de informação de sua responsabilidade; (iii) uso do material fora da cessão concedida.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "design_editorial",
    nome: "Design Editorial (Catálogos, E-books, Revistas)",
    descricao: "Diagramação editorial, com responsabilidade sobre conteúdo textual/fotográfico exclusiva da contratante e transferência de responsabilidade após aprovação da prova final.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "TIPO_DE_MATERIAL_EDITORIAL", label: "Tipo de material editorial", tipo: "texto", exemplo: "e-book" },
      { tag: "TITULO_DA_PUBLICACAO", label: "Título da publicação", tipo: "texto" },
      { tag: "NUMERO_DE_PAGINAS", label: "Número de páginas aproximado", tipo: "numero" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN EDITORIAL

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Diagramação/design editorial de [TIPO_DE_MATERIAL_EDITORIAL] intitulado "[TITULO_DA_PUBLICACAO]", com [NUMERO_DE_PAGINAS] páginas aproximadas.

2. DO ESCOPO
2.1. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS]. O conteúdo textual, fotográfico e informativo da publicação é de responsabilidade e autoria da CONTRATANTE, cabendo ao(à) CONTRATADO(A) exclusivamente a diagramação/design gráfico do material fornecido.
2.2. Revisão ortográfica/gramatical do texto não está inclusa, salvo contratação expressa de serviço adicional de revisão textual.

3. DO PRAZO DE ENTREGA
3.1. Entrega em até [PRAZO_DE_ENTREGA] dias corridos após o recebimento de todo o conteúdo (texto final e imagens em alta resolução) pela CONTRATANTE.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste de diagramação. Alterações substanciais de conteúdo/texto após o início da diagramação, que exijam reestruturação do layout, são cobradas à parte.
4.2. A aprovação da prova final pela CONTRATANTE transfere a esta a responsabilidade por qualquer erro remanescente não apontado nessa revisão, inclusive em caso de impressão física.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final liberado após quitação integral.

6. DA CESSÃO DE DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do design diagramado, sem limitação de prazo, mediante pagamento integral. Os direitos autorais do conteúdo textual/fotográfico fornecido pela CONTRATANTE permanecem com esta ou com seus respectivos autores. O(a) CONTRATADO(A) pode usar o design em portfólio, salvo vedação por escrito.

7. DA RESCISÃO
7.1. Desistência após início do trabalho: pagamento proporcional às páginas já diagramadas, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o conteúdo da publicação não lançada pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por erros de conteúdo textual/informativo fornecido pela CONTRATANTE e por erro aprovado na prova final (cláusula 4.2).
11.2. A CONTRATANTE indeniza por: (i) violação de direitos autorais de terceiros no conteúdo textual/fotográfico fornecido por ela; (ii) informações incorretas de sua responsabilidade; (iii) uso do design fora da cessão concedida.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "design_materiais_impressos",
    nome: "Design de Materiais Impressos",
    descricao: "Criação de peças gráficas para impressão, com transferência de responsabilidade à contratante após aprovação da prova de impressão.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "NUMERO_DE_PROPOSTAS_INICIAIS", label: "Nº de propostas iniciais", tipo: "numero", exemplo: "2" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN GRÁFICO PARA MATERIAIS IMPRESSOS

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de peças gráficas para impressão: [DESCRICAO_DOS_ENTREGAVEIS].

2. DO ESCOPO E DA PROVA DE IMPRESSÃO
2.1. Etapas: briefing, [NUMERO_DE_PROPOSTAS_INICIAIS] propostas, refinamento, arquivo final print-ready.
2.2. Cláusula essencial: a aprovação por escrito da "prova de impressão" (arquivo final, nas dimensões/sangria/cores especificadas) pela CONTRATANTE é condição para envio à gráfica; erros de conteúdo, texto ou especificação técnica (medidas, cores, sangria) não identificados pela CONTRATANTE nessa aprovação, e que resultem em problema na impressão física, são de responsabilidade exclusiva da CONTRATANTE, não gerando obrigação de reimpressão gratuita pelo(a) CONTRATADO(A).
2.3. O(a) CONTRATADO(A) não se responsabiliza pela qualidade de impressão realizada por gráfica de escolha da CONTRATANTE, salvo se o arquivo fornecido estiver comprovadamente fora das especificações técnicas informadas.

3. DO PRAZO DE ENTREGA
3.1. Entrega do arquivo final em até [PRAZO_DE_ENTREGA] dias corridos após aprovação do conceito.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste. Alterações após aprovação da prova de impressão são cobradas à parte, incluindo eventual retrabalho de arquivo para reimpressão.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final liberado após quitação integral.

6. DA CESSÃO DE DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso das peças, sem limitação de prazo, mediante pagamento integral. O(a) CONTRATADO(A) pode usar em portfólio, salvo vedação por escrito.

7. DA RESCISÃO
7.1. Desistência após início do trabalho: pagamento proporcional às etapas entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre material não divulgado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por erros aprovados na prova de impressão (cláusula 2.2) e por qualidade de impressão de gráfica de escolha da CONTRATANTE.
11.2. A CONTRATANTE indeniza por: (i) informações/imagens fornecidas sem direito de uso; (ii) aprovação de prova com erro não apontado; (iii) uso do material fora da cessão concedida.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "ui_ux_design",
    nome: "UI/UX Design",
    descricao: "Design de interface e experiência do usuário, com isenção sobre divergência entre design entregue e implementação técnica realizada por terceiros.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "QUALIFICACAO_CLIENTE", label: "Qualificação do cliente", tipo: "texto" },
      { tag: "NOME_DO_PRODUTO_DIGITAL", label: "Nome do produto digital", tipo: "texto" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "CRONOGRAMA_POR_ETAPAS", label: "Cronograma por etapas", tipo: "textarea" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas por etapa", tipo: "numero", exemplo: "2" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESIGN DE INTERFACE E EXPERIÊNCIA DO USUÁRIO (UI/UX)

CONTRATANTE: [NOME_DO_CLIENTE], [QUALIFICACAO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Design de interface e experiência do usuário (UI/UX) do produto digital [NOME_DO_PRODUTO_DIGITAL], compreendendo [DESCRICAO_DOS_ENTREGAVEIS].

2. DO ESCOPO E DA ENTREGA DE ARQUIVOS
2.1. Entrega em ferramenta de design colaborativa (ex.: Figma), com handoff de especificações (medidas, cores, componentes) para a equipe de desenvolvimento.
2.2. Da fidelidade de implementação (cláusula essencial): o(a) CONTRATADO(A) não se responsabiliza por divergências entre o design entregue e a implementação final realizada pela equipe de desenvolvimento (própria da CONTRATANTE ou terceirizada), sendo a responsabilidade pela fidelidade da implementação exclusiva de quem a executa.
2.3. Alterações de escopo (novas telas, funcionalidades não previstas no briefing inicial) são orçadas e formalizadas em aditivo.

3. DO PRAZO DE ENTREGA
3.1. Entrega por etapas conforme [CRONOGRAMA_POR_ETAPAS], observado prazo total de [PRAZO_DE_ENTREGA] dias corridos após o briefing.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste por etapa/tela. Mudanças de direção de produto após aprovação de wireframes (ex.: nova arquitetura de informação) são cobradas à parte.

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO], vinculado às etapas de entrega. Arquivos-fonte liberados após quitação integral.

6. DA CESSÃO DE DIREITOS DE USO
6.1. Cedidos à CONTRATANTE os direitos de uso do design para o produto especificado, sem limitação de prazo, mediante pagamento integral. O(a) CONTRATADO(A) pode usar telas/protótipo em portfólio (inclusive em plataformas como Behance/Dribbble), salvo vedação por escrito antes do lançamento do produto.

7. DA RESCISÃO
7.1. Desistência após início do trabalho: pagamento proporcional às etapas entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o produto digital não lançado, funcionalidades e estratégia de negócio pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais, incluindo indisponibilidade de ferramentas de design colaborativo por falha de terceiros.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por divergência de implementação (cláusula 2.2) e por decisões de produto tomadas pela CONTRATANTE após a entrega do design.
11.2. A CONTRATANTE indeniza por: (i) informações/briefing incorretos que gerem retrabalho ou reclamação de terceiros; (ii) uso do design fora da cessão concedida; (iii) implementação divergente atribuída ao(à) CONTRATADO(A) sem que este(a) tenha participado do desenvolvimento.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
  {
    perfil: "designer",
    tipoServico: "ilustracao_personalizada",
    nome: "Ilustração Personalizada / Arte Autoral",
    descricao: "Criação de ilustração autoral com licenciamento de uso por prazo/meios definidos, autoria preservada nos termos da Lei nº 9.610/98 e vedação de alteração não autorizada da obra.",
    camposDinamicos: [
      ...CAMPOS_COMUNS_CONTRATO,
      { tag: "DESCRICAO_DO_TEMA", label: "Descrição do tema", tipo: "textarea" },
      { tag: "FINALIDADE_DA_ILUSTRACAO", label: "Finalidade da ilustração", tipo: "textarea", exemplo: "capa de livro, mascote de marca" },
      { tag: "DESCRICAO_DOS_ENTREGAVEIS", label: "Entregáveis", tipo: "textarea" },
      { tag: "PRAZO_ESBOCO", label: "Prazo de entrega do esboço", tipo: "texto", exemplo: "5 dias" },
      { tag: "NUMERO_REVISOES_INCLUSAS", label: "Nº de revisões inclusas", tipo: "numero", exemplo: "2" },
      { tag: "VALOR_RODADA_ADICIONAL", label: "Valor de rodada adicional", tipo: "moeda" },
      { tag: "EXCLUSIVA/NAO_EXCLUSIVA", label: "Licença exclusiva ou não exclusiva", tipo: "texto", exemplo: "não exclusiva" },
      { tag: "PRAZO_DA_LICENCA_DE_USO", label: "Prazo da licença de uso", tipo: "texto" },
      { tag: "MEIOS_E_TERRITORIO", label: "Meios e território de uso", tipo: "textarea" },
      { tag: "CRITERIO_LICENCA_AMPLIADA", label: "Critério de licença ampliada", tipo: "textarea" },
      { tag: "PERCENTUAL_MULTA_RESCISORIA", label: "% multa rescisória", tipo: "percentual", exemplo: "30" },
    ],
    texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ILUSTRAÇÃO PERSONALIZADA

CONTRATANTE: [NOME_DO_CLIENTE], CPF/CNPJ nº [CPF_CNPJ_CLIENTE], domiciliado(a)/sede em [ENDERECO_CLIENTE].
CONTRATADO(A): [NOME_CONTRATADO], CPF/CNPJ nº [CPF_CNPJ_CONTRATADO], domiciliado(a) em [ENDERECO_CONTRATADO].

1. DO OBJETO
1.1. Criação de ilustração(ões) autoral(is) sobre o tema [DESCRICAO_DO_TEMA], para a finalidade de [FINALIDADE_DA_ILUSTRACAO].

2. DO ESCOPO
2.1. Etapas: briefing/referências, esboço (thumbnail/rascunho), aprovação de linha e composição, finalização com cor/acabamento. Entregáveis: [DESCRICAO_DOS_ENTREGAVEIS].

3. DO PRAZO DE ENTREGA
3.1. Entrega do esboço em até [PRAZO_ESBOCO] dias corridos após o briefing. Entrega final em até [PRAZO_DE_ENTREGA] dias corridos após a aprovação do esboço.

4. DAS REVISÕES
4.1. Inclusas [NUMERO_REVISOES_INCLUSAS] rodada(s) de ajuste sobre o esboço aprovado. Mudança de conceito/composição já aprovada é cobrada à parte no valor de [VALOR_RODADA_ADICIONAL].

5. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Valor total: [VALOR_DO_SERVIÇO]. Pagamento: [CONDICOES_DE_PAGAMENTO]. Arquivo final em alta resolução liberado após quitação integral.

6. DA CESSÃO DE DIREITOS AUTORAIS E DA LICENÇA DE USO
6.1. O(a) CONTRATADO(A), autor(a) da obra, cede à CONTRATANTE licença de uso da ilustração, de forma [EXCLUSIVA/NAO_EXCLUSIVA], pelo prazo de [PRAZO_DA_LICENCA_DE_USO], para os fins de [MEIOS_E_TERRITORIO]. Nos termos da Lei nº 9.610/98, a autoria da obra permanece do(a) CONTRATADO(A), sendo assegurado crédito autoral em toda utilização, salvo caso técnico que inviabilize a assinatura.
6.2. Uso além do prazo/meios pactuados (ex.: licenciamento para produtos derivados, merchandising, uso institucional perene) depende de negociação e pagamento adicional de licença ampliada, conforme [CRITERIO_LICENCA_AMPLIADA].
6.3. O(a) CONTRATADO(A) pode usar a ilustração em portfólio pessoal e divulgação profissional, salvo pedido expresso e por escrito de embargo de divulgação por prazo determinado.
6.4. É vedada a alteração da ilustração (recorte, distorção, adição de elementos) sem autorização do(a) CONTRATADO(A), ressalvadas adaptações técnicas de formato previamente combinadas (ex.: redimensionamento simples para diferentes aplicações).

7. DA RESCISÃO
7.1. Desistência após aprovação do esboço: pagamento proporcional às etapas entregues, acrescido de [PERCENTUAL_MULTA_RESCISORIA]% sobre o saldo remanescente.

8. DA CONFIDENCIALIDADE
8.1. Sigilo sobre o projeto/produto não lançado pelo prazo de [PRAZO_CONFIDENCIALIDADE].

9. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)
9.1. Conforme Lei nº 13.709/2018.

10. DO CASO FORTUITO E FORÇA MAIOR
10.1. Termos gerais.

11. DA LIMITAÇÃO DE RESPONSABILIDADE E DA INDENIZAÇÃO
11.1. Limitada ao valor total pago, excluída responsabilidade por lucros cessantes ou danos indiretos.
11.2. A CONTRATANTE indeniza por: (i) uso da ilustração fora dos limites da licença concedida (cláusula 6.1/6.2); (ii) alteração não autorizada da obra (cláusula 6.4); (iii) informações/referências fornecidas que violem direitos de terceiros.
11.3. Avaliações negativas de má-fé sujeitas a notificação extrajudicial.

12. DISPOSIÇÕES GERAIS
12.1. Sem vínculo empregatício/societário.

13. DO FORO
13.1. Foro: [FORO_COMARCA].

Local e data: [DATA_ASSINATURA].`,
  },
];
