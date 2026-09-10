/**
 * Tela única de Configurações (`/admin/configuracoes`) — a "engrenagem" que
 * reúne o que antes estava espalhado: Empresa & Equipe (que morava dentro de
 * Cadastros), Aparência (que tinha rota própria em `/admin/aparencia`),
 * Minha Conta (nova) e Assinatura (nova).
 *
 * A moldura de Aparência continua no dicionário `aparencia` — este arquivo
 * só cobre a casca (abas, cabeçalho) e as três seções novas. Nada de texto
 * digitado pelo admin mora aqui.
 */
export interface ConfiguracoesDict {
  tituloPagina: string;
  subtituloPagina: string;

  abaEmpresa: string;
  abaConta: string;
  abaAparencia: string;
  abaAssinatura: string;

  // --- Empresa & Equipe ---
  empresaCardTitulo: string;
  empresaCardDescricao: string;
  moedaIdiomaTitulo: string;
  moedaIdiomaDescricao: string;
  moedaLabel: string;
  moedaAviso: string;
  idiomaPadraoLabel: string;
  idiomaPadraoAviso: string;
  moedaIdiomaSalvo: string;
  empresaMembrosAtivos: string;
  empresaSemAcessoTitulo: string;
  empresaSemAcessoDescricao: string;

  // --- Minha Conta ---
  contaDadosTitulo: string;
  contaNomeLabel: string;
  contaNomeHint: string;
  contaEmailLabel: string;
  contaEmailHint: string;
  contaTelefoneLabel: string;
  contaTelefonePlaceholder: string;
  contaTelefoneHint: string;
  contaSenhaTitulo: string;
  contaSenhaDescricao: string;
  contaSenhaAtualLabel: string;
  contaSenhaNovaLabel: string;
  contaSenhaConfirmarLabel: string;
  contaSenhaBotao: string;
  contaSenhaMostrar: string;
  contaSenhaOcultar: string;
  contaSalvo: string;
  contaSenhaAlterada: string;
  contaErroSenhaCurta: string;
  contaErroSenhaDiferente: string;
  contaErroSenhaIgualAtual: string;
  contaErroSenhaAtual: string;
  contaPonteiroEmpresa: string;
  /** Mostrado em Cadastros, onde a aba Equipe morava antes de virar parte das Configurações. */
  cadastrosPonteiroEquipe: string;

  // --- Cor da marca (aba Aparência) ---
  corTitulo: string;
  corDescricao: string;
  corPresetsLabel: string;
  corLivreLabel: string;
  corLivreHint: string;
  corPreviewLabel: string;
  corPreviewBotao: string;
  corPreviewLink: string;
  corPreviewItemMenu: string;
  corInvalida: string;
  corPresetAzul: string;
  corPresetVerde: string;
  corPresetAmbar: string;
  corPresetVinho: string;
  corPresetVioleta: string;
  corPresetGrafite: string;

  // --- Assinatura ---
  assinaturaTitulo: string;
  assinaturaDescricao: string;
  assinaturaPlanoLabel: string;
  assinaturaSituacaoLabel: string;
  assinaturaValidaAte: string;
  assinaturaSemValidade: string;
  assinaturaAtiva: string;
  assinaturaSuspensa: string;
  assinaturaExpirada: string;
  assinaturaBotao: string;
  /** Rótulo do botão enquanto o link de contratação ainda não existe — o botão aparece, desabilitado, em vez de sumir. */
  assinaturaBotaoEmBreve: string;
  assinaturaAvisoManual: string;
  assinaturaAvisoEmBreve: string;
}

export const configuracoes: ConfiguracoesDict = {
  tituloPagina: "Configurações",
  subtituloPagina: "Sua empresa, sua equipe, seus dados e a identidade visual do sistema.",

  abaEmpresa: "Empresa & Equipe",
  abaConta: "Minha Conta",
  abaAparencia: "Aparência",
  abaAssinatura: "Assinatura",

  empresaCardTitulo: "Empresa",
  empresaCardDescricao: "O nome que aparece no topo do menu e no portal dos seus clientes. Edite-o na aba Aparência.",
  moedaIdiomaTitulo: "Moeda e idioma",
  moedaIdiomaDescricao: "A unidade em que a empresa mede o faturamento e a língua com que o sistema abre.",
  moedaLabel: "Moeda do sistema",
  moedaAviso: "Vale para o time inteiro. Trocar a moeda muda o símbolo e o formato dos números — nenhum valor já lançado é convertido, porque a cotação de cada dia era outra.",
  idiomaPadraoLabel: "Idioma de partida",
  idiomaPadraoAviso: "É com esta língua que o sistema abre para quem ainda não escolheu. Cada pessoa continua trocando o idioma no canto da tela, e a escolha dela vale por cima desta.",
  moedaIdiomaSalvo: "Salvo. A troca já vale em todas as telas.",
  empresaMembrosAtivos: "membros com acesso",
  empresaSemAcessoTitulo: "Só o administrador vê esta aba",
  empresaSemAcessoDescricao: "Quem tem acesso ao quê é decidido por quem administra a conta.",

  contaDadosTitulo: "Seus dados",
  contaNomeLabel: "Nome completo",
  contaNomeHint: "É como seu nome aparece pra você e pro resto da equipe.",
  contaEmailLabel: "E-mail",
  contaEmailHint: "É com este e-mail que você entra no sistema. Para trocá-lo, fale com quem administra a conta.",
  contaTelefoneLabel: "Telefone",
  contaTelefonePlaceholder: "(00) 00000-0000",
  contaTelefoneHint: "Usado só para contato interno da equipe.",
  contaSenhaTitulo: "Senha",
  contaSenhaDescricao: "Troque quando quiser, sem precisar sair do sistema.",
  contaSenhaAtualLabel: "Senha atual",
  contaSenhaNovaLabel: "Nova senha",
  contaSenhaConfirmarLabel: "Repita a nova senha",
  contaSenhaBotao: "Alterar senha",
  contaSenhaMostrar: "Mostrar senha",
  contaSenhaOcultar: "Ocultar senha",
  contaSalvo: "Salvo.",
  contaSenhaAlterada: "Senha alterada.",
  contaErroSenhaCurta: "A nova senha precisa ter pelo menos 8 caracteres.",
  contaErroSenhaDiferente: "As duas senhas novas não são iguais.",
  contaErroSenhaIgualAtual: "A nova senha precisa ser diferente da atual.",
  contaErroSenhaAtual: "A senha atual não confere.",
  contaPonteiroEmpresa: "Procurando o nome da empresa ou o logo? Estão na aba Aparência.",
  cadastrosPonteiroEquipe: "Equipe, permissões e organograma agora ficam em Configurações → Empresa & Equipe.",

  corTitulo: "Cor da marca",
  corDescricao: "Vale para o painel e para o portal dos seus clientes — botões, links e o item ativo do menu. A tela de login mantém a cor padrão da plataforma.",
  corPresetsLabel: "Escolha rápida",
  corLivreLabel: "Ou use a cor exata da sua marca",
  corLivreHint: "Cole o código hexadecimal, por exemplo #4F7CFF.",
  corPreviewLabel: "Prévia",
  corPreviewBotao: "Botão",
  corPreviewLink: "Um link",
  corPreviewItemMenu: "Item ativo do menu",
  corInvalida: "Código de cor inválido.",
  corPresetAzul: "Azul",
  corPresetVerde: "Verde",
  corPresetAmbar: "Âmbar",
  corPresetVinho: "Vinho",
  corPresetVioleta: "Violeta",
  corPresetGrafite: "Grafite",

  assinaturaTitulo: "Assinatura",
  assinaturaDescricao: "A situação da sua licença e o link para contratar ou renovar.",
  assinaturaPlanoLabel: "Empresa",
  assinaturaSituacaoLabel: "Situação",
  assinaturaValidaAte: "Válida até",
  assinaturaSemValidade: "Sem data de término",
  assinaturaAtiva: "Ativa",
  assinaturaSuspensa: "Suspensa",
  assinaturaExpirada: "Expirada",
  assinaturaBotao: "Ir para o carrinho",
  assinaturaBotaoEmBreve: "Em breve",
  assinaturaAvisoManual:
    "O pagamento é processado fora do sistema. Depois de pagar, a liberação é feita manualmente — pode levar algumas horas.",
  assinaturaAvisoEmBreve:
    "A página de contratação ainda está sendo preparada. Quando ficar pronta, este botão leva direto ao carrinho.",
};
