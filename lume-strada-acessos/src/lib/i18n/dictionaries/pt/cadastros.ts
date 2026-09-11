/**
 * Módulo Central de Cadastros (`/admin`) — abas Clientes e Equipe, seus
 * modais de cadastro (`ClienteModal`, `MembroEquipeModal`), os modais de
 * liberação de acesso (`GerarAcessoClienteModal`, `AcessoFuncionarioModal`,
 * `AcessoStatusControls`) e o checklist de Atividades & Tarefas do cliente
 * (`AtividadesManager`). Strings realmente genéricas (Salvar, Cancelar,
 * Editar, Excluir, Ações, Sim/Não...) ficam em `common`, não aqui.
 */
export interface CadastrosDict {
  tituloPagina: string;
  subtituloPagina: string;
  abaClientes: string;
  abaEquipe: string;

  // Lista de Clientes
  buscarClientesPlaceholder: string;
  novoCliente: string;
  totalClientes: string;
  cadastradosNaBase: string;
  comAcessoAtivo: string;
  dashboardLiberadoAgora: string;
  acessoGerado: string;
  jaReceberamConvite: string;
  semAcesso: string;
  soCadastroSemLogin: string;
  nenhumClienteCadastrado: string;
  nenhumClienteEncontrado: string;
  colunaCliente: string;
  colunaDocumento: string;
  colunaContato: string;
  colunaAcesso: string;
  respLabel: string;
  abrir: string;
  gerarAcesso: string;
  acessoEMenus: string;
  semAcessoBadge: string;

  // ClienteModal (criar/editar cadastro)
  editarCliente: string;
  razaoSocialLabel: string;
  razaoSocialPlaceholder: string;
  documentoLabel: string;
  documentoPlaceholder: string;
  telefoneWhatsappLabel: string;
  telefonePlaceholder: string;
  emailContatoLabel: string;
  emailContatoPlaceholder: string;
  nomeResponsavelLabel: string;
  nomeResponsavelPlaceholder: string;
  enderecoLabel: string;
  enderecoPlaceholder: string;

  // Cadastro completo do cliente: identificacao, endereco em campos
  // proprios e dados fiscais (ver supabase/cliente-dados-completos.sql).
  nomeClienteLabel: string;
  nomeClientePlaceholder: string;
  nomeClienteAjuda: string;
  razaoSocialAjuda: string;
  secaoIdentificacao: string;
  secaoContato: string;
  secaoEndereco: string;
  secaoFiscal: string;
  cepLabel: string;
  logradouroLabel: string;
  numeroLabel: string;
  complementoLabel: string;
  bairroLabel: string;
  inscricaoEstadualLabel: string;
  inscricaoMunicipalLabel: string;
  enderecoLegadoAviso: string;
  editarCadastro: string;
  semEnderecoCadastrado: string;

  // O contrato do cliente dentro da ficha dele: os gerados aqui e os
  // assinados fora (ver supabase/contrato-externo.sql).
  contratosTitulo: string;
  contratosVazio: string;
  contratoAbrir: string;
  contratoAssinadoEm: string;
  contratoNaoAssinado: string;
  contratoDoSistema: string;
  contratoExterno: string;
  vincularContrato: string;
  vincularContratoVazio: string;
  vincular: string;
  anexarContrato: string;
  anexar: string;
  contratoOuEntao: string;
  contratoTituloLabel: string;
  contratoTituloPlaceholder: string;
  contratoDataLabel: string;
  contratoLinkLabel: string;
  contratoLinkPlaceholder: string;
  contratoArquivoLabel: string;
  removerContrato: string;
  removerContratoPergunta: string;
  erroContratoSemTitulo: string;
  erroContratoSemDocumento: string;
  erroContratoLinkEArquivo: string;
  erroContratoLinkInvalido: string;
  erroContratoArquivoGrande: string;
  erroContratoArquivoTipo: string;
  erroContratoJaVinculado: string;
  erroContratoNaoEncontrado: string;
  corEtiquetaLabel: string;
  corEtiquetaAjuda: string;
  escolherCorAria: string;
  corPersonalizadaAria: string;
  criarCliente: string;

  // ClienteDetalheModal
  semDocumentoCadastrado: string;
  responsavelLabel: string;
  enderecoDetalheLabel: string;
  acessoDashboardClienteTitulo: string;
  semAcessoDashboardClienteTexto: string;
  atividadesTarefasTitulo: string;

  // GerarAcessoClienteModal / AcessoFuncionarioModal (acesso)
  emailLoginLabel: string;
  emailClientePlaceholder: string;
  conviteClienteAjuda: string;
  dataExpiracaoLabel: string;
  semExpiracaoAjuda: string;
  enviando: string;
  gerarAcessoEnviarConvite: string;
  linkAcessoTitulo: string;
  linkAcessoAjuda: string;
  senhaProvisoriaBadge: string;

  // AcessoStatusControls
  loginLabel: string;
  expiraEmLabel: string;
  suspenderAcesso: string;
  reativarAcesso: string;
  cadastradoEmLabel: string;

  // AtividadesManager
  novaAtividadeLabel: string;
  novaAtividadePlaceholder: string;
  tarefa: string;
  nota: string;
  nenhumaAtividade: string;
  marcarComoPendente: string;
  marcarComoConcluida: string;
  previstaParaLabel: string;

  // Lista de Equipe
  buscarEquipePlaceholder: string;
  novoMembroBotao: string;
  novoMembroTitulo: string;
  totalNaEquipe: string;
  comAcesso: string;
  jaPodemLogarNoPainel: string;
  nenhumMembroCadastrado: string;
  nenhumMembroEncontrado: string;
  colunaCargo: string;
  permissoes: string;

  // MembroEquipeModal (criar/editar cadastro)
  editarMembro: string;
  grupoIdentificacao: string;
  grupoContato: string;
  grupoVinculo: string;
  grupoEmergencia: string;
  nascimentoLabel: string;
  cidadeLabel: string;
  cidadePlaceholder: string;
  ufLabel: string;
  vinculoLabel: string;
  vinculoPlaceholder: string;
  valorDiariaLabel: string;
  entradaLabel: string;
  saidaLabel: string;
  chavePixLabel: string;
  chavePixPlaceholder: string;
  emergenciaNomeLabel: string;
  emergenciaNomePlaceholder: string;
  emergenciaTelefoneLabel: string;
  observacoesLabel: string;
  observacoesPlaceholder: string;
  nomeCompletoLabel: string;
  nomeFuncionarioPlaceholder: string;
  cargoFuncaoLabel: string;
  cargoPlaceholder: string;
  emailFuncionarioPlaceholder: string;
  criarMembro: string;

  // AcessoFuncionarioModal (permissões)
  conviteFuncionarioAjuda: string;
  modulosLiberadosTitulo: string;
  modulosLiberadosAjuda: string;
  cardsDashboardTitulo: string;
  cardsDashboardAjuda: string;
  informeEmailErro: string;
  alteracoesSalvas: string;

  // Organograma (sub-aba dentro de Equipe, `OrganogramaView.tsx`)
  abaListaEquipe: string;
  abaOrganograma: string;
  novoDepartamentoBotao: string;
  departamentoModalTituloNovo: string;
  departamentoModalTituloEditar: string;
  nomeDepartamentoLabel: string;
  nomeDepartamentoPlaceholder: string;
  criarDepartamentoBtn: string;
  corDepartamentoLabel: string;
  corPersonalizadaLabel: string;
  excluirDepartamentoAria: string;
  confirmarExclusaoDepartamento: string;
  organogramaVazio: string;
  novoCargoBotao: string;
  cargoModalTituloNovo: string;
  cargoModalTituloEditar: string;
  tituloCargoLabel: string;
  tituloCargoPlaceholder: string;
  criarCargoBtn: string;
  vinculoCargoLabel: string;
  vinculoVago: string;
  vinculoMembroEquipe: string;
  vinculoNomeLivre: string;
  membroEquipeSelectLabel: string;
  selecioneUmMembro: string;
  nomeLivreLabel: string;
  nomeLivrePlaceholder: string;
  cargoVagoBadge: string;
  nenhumCargoNoDepartamento: string;
  excluirCargoAria: string;
  confirmarExclusaoCargo: string;
}

export const cadastros: CadastrosDict = {
  tituloPagina: "Gestão de Clientes",
  subtituloPagina: "O cadastro de cada cliente e o briefing que orienta tudo o que a equipe produz para ele.",
  abaClientes: "Clientes",
  abaEquipe: "Equipe (Funcionários)",

  buscarClientesPlaceholder: "Buscar por nome, CNPJ/CPF ou e-mail...",
  novoCliente: "Novo Cliente",
  totalClientes: "Total de Clientes",
  cadastradosNaBase: "Cadastrados na base",
  comAcessoAtivo: "Com Acesso Ativo",
  dashboardLiberadoAgora: "Dashboard liberado agora",
  acessoGerado: "Acesso Gerado",
  jaReceberamConvite: "Já receberam convite",
  semAcesso: "Sem Acesso",
  soCadastroSemLogin: "Só cadastro, sem login",
  nenhumClienteCadastrado: "Nenhum cliente cadastrado ainda.",
  nenhumClienteEncontrado: "Nenhum cliente encontrado pra essa busca.",
  colunaCliente: "Cliente",
  colunaDocumento: "Documento",
  colunaContato: "Contato",
  colunaAcesso: "Acesso",
  respLabel: "Resp.:",
  abrir: "Abrir",
  gerarAcesso: "Gerar Acesso",
  acessoEMenus: "Acesso e menus",
  semAcessoBadge: "Sem acesso",

  editarCliente: "Editar Cliente",
  razaoSocialLabel: "Razão Social / Nome Completo *",
  razaoSocialPlaceholder: "Ex: Estúdio Aurora Filmes Ltda.",
  documentoLabel: "CNPJ / CPF",
  documentoPlaceholder: "00.000.000/0000-00",
  telefoneWhatsappLabel: "Telefone / WhatsApp",
  telefonePlaceholder: "(00) 00000-0000",
  emailContatoLabel: "E-mail de Contato",
  emailContatoPlaceholder: "contato@empresa.com",
  nomeResponsavelLabel: "Nome do Responsável",
  nomeResponsavelPlaceholder: "Quem fala pela conta",
  enderecoLabel: "Endereço Completo",
  enderecoPlaceholder: "Rua, número, bairro, cidade — UF, CEP",
  nomeClienteLabel: "Nome do Cliente *",
  nomeClientePlaceholder: "Como a equipe chama esse cliente",
  nomeClienteAjuda: "É este nome que aparece no calendário, nas tarefas e nos relatórios.",
  razaoSocialAjuda: "Quem assina o contrato, quando for diferente do nome acima.",
  secaoIdentificacao: "Identificação",
  secaoContato: "Contato",
  secaoEndereco: "Endereço",
  secaoFiscal: "Dados fiscais",
  cepLabel: "CEP",
  logradouroLabel: "Logradouro",
  numeroLabel: "Número",
  complementoLabel: "Complemento",
  bairroLabel: "Bairro",
  inscricaoEstadualLabel: "Inscrição Estadual",
  inscricaoMunicipalLabel: "Inscrição Municipal",
  enderecoLegadoAviso: "Endereço cadastrado antes dos campos separados: {endereco} — preencha os campos abaixo para substituí-lo.",
  editarCadastro: "Editar cadastro",
  semEnderecoCadastrado: "Sem endereço cadastrado",
  contratosTitulo: "Contrato",
  contratosVazio: "Nenhum contrato vinculado a este cliente.",
  contratoAbrir: "Abrir",
  contratoAssinadoEm: "Assinado em {data}",
  contratoNaoAssinado: "Ainda não assinado",
  contratoDoSistema: "Gerado aqui",
  contratoExterno: "Assinado fora",
  vincularContrato: "Vincular contrato do sistema",
  vincularContratoVazio: "Nenhum contrato sem cliente para vincular.",
  vincular: "Vincular",
  anexarContrato: "Anexar contrato assinado fora",
  anexar: "Anexar",
  contratoOuEntao: "ou",
  contratoTituloLabel: "Título do contrato",
  contratoTituloPlaceholder: "Contrato de social media 2026",
  contratoDataLabel: "Assinado em",
  contratoLinkLabel: "Link do documento",
  contratoLinkPlaceholder: "https://drive.google.com/...",
  contratoArquivoLabel: "Ou envie o arquivo (PDF ou imagem, até 20 MB)",
  removerContrato: "Remover contrato",
  removerContratoPergunta: "Remover da ficha?",
  erroContratoSemTitulo: "Dê um título ao contrato.",
  erroContratoSemDocumento: "Informe o link ou envie o arquivo do contrato.",
  erroContratoLinkEArquivo: "Escolha uma coisa só: o link ou o arquivo.",
  erroContratoLinkInvalido: "O link precisa começar com http:// ou https://.",
  erroContratoArquivoGrande: "O arquivo passa de 20 MB.",
  erroContratoArquivoTipo: "Aceita PDF, PNG, JPG ou WEBP.",
  erroContratoJaVinculado: "Este contrato já foi vinculado a outro cliente. Atualize a página.",
  erroContratoNaoEncontrado: "Contrato não encontrado. Atualize a página.",
  corEtiquetaLabel: "Cor da etiqueta",
  corEtiquetaAjuda: "Aparece na etiqueta deste cliente no Calendário de Produção — escolha uma cor pra identificar ele de relance.",
  escolherCorAria: "Escolher a cor {hex}",
  corPersonalizadaAria: "Escolher outra cor",
  criarCliente: "Criar Cliente",

  semDocumentoCadastrado: "Sem CNPJ/CPF cadastrado",
  responsavelLabel: "Responsável",
  enderecoDetalheLabel: "Endereço",
  acessoDashboardClienteTitulo: "Acesso ao Dashboard do Cliente",
  semAcessoDashboardClienteTexto: "Este cliente ainda não tem acesso ao dashboard (Tráfego, Aprovações, Boletos).",
  atividadesTarefasTitulo: "Atividades & Tarefas",

  emailLoginLabel: "E-mail de login *",
  emailClientePlaceholder: "cliente@empresa.com",
  conviteClienteAjuda:
    "Criamos o login já com uma senha provisória — você copia e-mail + senha e envia por onde preferir (WhatsApp, e-mail...). No primeiro acesso, o painel obriga a criar uma senha nova. Depois de entrar, o cliente vê só os dashboards dele (Tráfego, Aprovações, Boletos).",
  dataExpiracaoLabel: "Data de expiração (opcional)",
  semExpiracaoAjuda: "Deixe em branco para acesso sem prazo definido.",
  enviando: "Gerando...",
  gerarAcessoEnviarConvite: "Gerar Acesso",
  linkAcessoTitulo: "Acesso gerado",
  linkAcessoAjuda:
    "Copie e-mail + senha e envie manualmente (WhatsApp, e-mail, etc.). A pessoa loga com esses dados e o painel vai obrigar a trocar a senha assim que ela entrar.",
  senhaProvisoriaBadge: "Ainda com a senha provisória",

  loginLabel: "Login:",
  expiraEmLabel: "Expira em",
  suspenderAcesso: "Suspender Acesso",
  reativarAcesso: "Reativar Acesso",
  cadastradoEmLabel: "Cadastrado em",

  novaAtividadeLabel: "Nova atividade / tarefa",
  novaAtividadePlaceholder: "Ex: Ligar sobre renovação",
  tarefa: "Tarefa",
  nota: "Nota",
  nenhumaAtividade: "Nenhuma atividade registrada ainda.",
  marcarComoPendente: "Marcar como pendente",
  marcarComoConcluida: "Marcar como concluída",
  previstaParaLabel: "Prevista para",

  buscarEquipePlaceholder: "Buscar por nome, cargo ou e-mail...",
  novoMembroBotao: "Novo Membro",
  novoMembroTitulo: "Novo Membro da Equipe",
  totalNaEquipe: "Total na Equipe",
  comAcesso: "Com Acesso",
  jaPodemLogarNoPainel: "Já podem logar no painel",
  nenhumMembroCadastrado: "Nenhum membro da equipe cadastrado ainda.",
  nenhumMembroEncontrado: "Nenhum membro encontrado pra essa busca.",
  colunaCargo: "Cargo",
  permissoes: "Permissões",

  editarMembro: "Editar Membro",
  grupoIdentificacao: "Identificação",
  grupoContato: "Contato",
  grupoVinculo: "Vínculo e pagamento",
  grupoEmergencia: "Emergência e observações",
  nascimentoLabel: "Nascimento",
  cidadeLabel: "Cidade",
  cidadePlaceholder: "São Paulo",
  ufLabel: "UF",
  vinculoLabel: "Tipo de vínculo",
  vinculoPlaceholder: "Freelancer",
  valorDiariaLabel: "Valor da diária",
  entradaLabel: "Entrada",
  saidaLabel: "Saída",
  chavePixLabel: "Chave PIX",
  chavePixPlaceholder: "CPF, e-mail, telefone ou chave aleatória",
  emergenciaNomeLabel: "Quem avisar",
  emergenciaNomePlaceholder: "Nome e parentesco",
  emergenciaTelefoneLabel: "Telefone de emergência",
  observacoesLabel: "Observações",
  observacoesPlaceholder: "Restrições alimentares, equipamento próprio, disponibilidade...",

  nomeCompletoLabel: "Nome Completo *",
  nomeFuncionarioPlaceholder: "Nome do funcionário",
  cargoFuncaoLabel: "Cargo / Função",
  cargoPlaceholder: "Ex: Editor, Designer, Gestor de Tráfego",
  emailFuncionarioPlaceholder: "funcionario@agencia.com",
  criarMembro: "Criar Membro",

  conviteFuncionarioAjuda:
    "Criamos o login já com uma senha provisória — você copia e-mail + senha e envia por onde preferir (WhatsApp, e-mail...). No primeiro acesso, o painel obriga a criar uma senha nova.",
  modulosLiberadosTitulo: "Módulos Liberados",
  modulosLiberadosAjuda: 'Bloqueie ou libere cada área do menu pra esse funcionário — ex: "Bloquear Financeiro, Liberar Tarefas".',
  cardsDashboardTitulo: "Cards do Dashboard",
  cardsDashboardAjuda:
    "Escolha o que aparece na Visão Geral desse funcionário — os cards de módulo (Financeiro/Inventário/Tráfego/WhatsApp) só aparecem se o módulo acima também estiver liberado.",
  informeEmailErro: "Informe um e-mail para o acesso.",
  alteracoesSalvas: "Alterações salvas.",

  abaListaEquipe: "Lista",
  abaOrganograma: "Organograma",
  novoDepartamentoBotao: "+ Departamento",
  departamentoModalTituloNovo: "Novo Departamento",
  departamentoModalTituloEditar: "Editar Departamento",
  nomeDepartamentoLabel: "Nome do Departamento *",
  nomeDepartamentoPlaceholder: "Ex: Criação, Comercial, Atendimento",
  criarDepartamentoBtn: "Criar Departamento",
  corDepartamentoLabel: "Cor de destaque",
  corPersonalizadaLabel: "Cor personalizada",
  excluirDepartamentoAria: "Excluir departamento",
  confirmarExclusaoDepartamento: "Excluir este departamento e todos os cargos dentro dele?",
  organogramaVazio: "Nenhum departamento criado ainda — comece adicionando o primeiro.",
  novoCargoBotao: "+ Cargo",
  cargoModalTituloNovo: "Novo Cargo",
  cargoModalTituloEditar: "Editar Cargo",
  tituloCargoLabel: "Título do Cargo *",
  tituloCargoPlaceholder: "Ex: Editor de Vídeo, Social Media",
  criarCargoBtn: "Criar Cargo",
  vinculoCargoLabel: "Vínculo",
  vinculoVago: "Vago",
  vinculoMembroEquipe: "Membro da Equipe",
  vinculoNomeLivre: "Nome Livre (freelancer)",
  membroEquipeSelectLabel: "Selecione o membro",
  selecioneUmMembro: "Selecione...",
  nomeLivreLabel: "Nome",
  nomeLivrePlaceholder: "Ex: João (freelancer)",
  cargoVagoBadge: "Vago",
  nenhumCargoNoDepartamento: "Nenhum cargo neste departamento ainda.",
  excluirCargoAria: "Excluir cargo",
  confirmarExclusaoCargo: "Excluir este cargo?",
};
