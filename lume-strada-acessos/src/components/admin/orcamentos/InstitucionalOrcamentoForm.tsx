// Descontinuado — o texto institucional (apresentação, clientes atendidos)
// e a mensagem de encerramento agora são editados direto no construtor de
// orçamento (`OrcamentoBuilder.tsx`), dentro do card
// `MarcaApresentacaoCard.tsx`, junto da Marca da Agência. Antes vivia numa
// aba separada (`/admin/orcamentos/portfolio`), o que deixava o fluxo de
// montar um orçamento confuso — ver pedido do usuário sobre juntar isso na
// mesma tela.
//
// Este arquivo não é mais importado em lugar nenhum (mantido só pra não
// quebrar builds locais que ainda referenciem o path antigo por engano;
// pode ser removido do projeto com segurança).
export {};
