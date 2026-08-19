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
}

export const cadastros: CadastrosDict = {
  tituloPagina: "Central de Cadastros",
  subtituloPagina: "Base de dados de clientes e da equipe da agência — cadastro e liberação de acesso.",
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
};
