/** Telas públicas de autenticação: login, acesso expirado, definir senha — e os componentes compartilhados (`LoginForm`, `LogoutButton`, `SetPasswordForm`). */
export interface LoginDict {
  convitePrompt: string;
  emailLabel: string;
  senhaLabel: string;
  emailPlaceholder: string;
  senhaPlaceholder: string;
  entrar: string;
  entrando: string;
  sair: string;
  saindo: string;
  credenciaisInvalidas: string;
  conviteInvalidoErro: string;
  acessoExpiradoTitulo: string;
  acessoExpiradoPadrao: string;
  acessoExpiradoData: string;
  acessoSuspenso: string;
  faleComAgencia: string;
  definirSenhaTitulo: string;
  definirSenhaSubtitulo: string;
  novaSenha: string;
  confirmarSenha: string;
  novaSenhaPlaceholder: string;
  confirmarSenhaPlaceholder: string;
  definirSenhaBotao: string;
  senhaMinimoCaracteres: string;
  senhasNaoCoincidem: string;
  mostrarSenhaAria: string;
  ocultarSenhaAria: string;
}

export const login: LoginDict = {
  convitePrompt: "Primeiro acesso? Entre com o e-mail cadastrado e a senha provisória que você recebeu. Você vai poder criar uma senha nova assim que entrar.",
  emailLabel: "E-mail",
  senhaLabel: "Senha",
  emailPlaceholder: "voce@lumestrada.com",
  senhaPlaceholder: "••••••••",
  entrar: "Entrar",
  entrando: "Entrando...",
  sair: "Sair",
  saindo: "Saindo...",
  credenciaisInvalidas: "E-mail ou senha incorretos.",
  conviteInvalidoErro: "Esse link de convite já foi usado ou expirou. Peça pra quem te convidou gerar um link novo.",
  acessoExpiradoTitulo: "Acesso Expirado",
  acessoExpiradoPadrao: "Seu acesso não está disponível no momento.",
  acessoExpiradoData: "Seu acesso expirou em {data}.",
  acessoSuspenso: "Seu acesso foi suspenso pela agência.",
  faleComAgencia: "Fale com a sua agência para renovar ou reativar o acesso.",
  definirSenhaTitulo: "Bem-vindo(a)",
  definirSenhaSubtitulo: "Defina uma senha para concluir seu cadastro",
  novaSenha: "Nova senha",
  confirmarSenha: "Confirmar senha",
  novaSenhaPlaceholder: "Mínimo de 8 caracteres",
  confirmarSenhaPlaceholder: "Repita a senha",
  definirSenhaBotao: "Definir senha e entrar",
  senhaMinimoCaracteres: "A senha precisa ter pelo menos 8 caracteres.",
  senhasNaoCoincidem: "As senhas não coincidem.",
  mostrarSenhaAria: "Mostrar senha",
  ocultarSenhaAria: "Ocultar senha",
};
