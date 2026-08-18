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
}

export const login: LoginDict = {
  convitePrompt: "Recebeu um convite por e-mail? Abra o link da mensagem para definir sua senha antes do primeiro acesso.",
  emailLabel: "E-mail",
  senhaLabel: "Senha",
  emailPlaceholder: "voce@lumestrada.com",
  senhaPlaceholder: "••••••••",
  entrar: "Entrar",
  entrando: "Entrando...",
  sair: "Sair",
  saindo: "Saindo...",
  credenciaisInvalidas: "E-mail ou senha incorretos.",
  acessoExpiradoTitulo: "Acesso Expirado",
  acessoExpiradoPadrao: "Seu acesso não está disponível no momento.",
  acessoExpiradoData: "Seu acesso expirou em {data}.",
  acessoSuspenso: "Seu acesso foi suspenso pela agência.",
  faleComAgencia: "Fale com a sua produtora, a Lume Strada Filmes, para renovar ou reativar o acesso.",
  definirSenhaTitulo: "Bem-vindo(a) à Lume Strada",
  definirSenhaSubtitulo: "Defina uma senha para concluir seu cadastro",
  novaSenha: "Nova senha",
  confirmarSenha: "Confirmar senha",
  novaSenhaPlaceholder: "Mínimo de 8 caracteres",
  confirmarSenhaPlaceholder: "Repita a senha",
  definirSenhaBotao: "Definir senha e entrar",
  senhaMinimoCaracteres: "A senha precisa ter pelo menos 8 caracteres.",
  senhasNaoCoincidem: "As senhas não coincidem.",
};
