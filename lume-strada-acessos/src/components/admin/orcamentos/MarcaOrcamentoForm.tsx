// Descontinuado — Marca da Agência (logo/banner/rodapé) agora é editada
// direto no construtor de orçamento (`OrcamentoBuilder.tsx`), dentro do
// card `MarcaApresentacaoCard.tsx`, junto do conteúdo institucional e da
// nova mensagem de encerramento. Antes vivia numa aba separada
// (`/admin/orcamentos/portfolio`), o que deixava o fluxo de montar um
// orçamento confuso — ver pedido do usuário sobre juntar isso na mesma tela.
//
// Este arquivo não é mais importado em lugar nenhum (mantido só pra não
// quebrar builds locais que ainda referenciem o path antigo por engano;
// pode ser removido do projeto com segurança).
export {};
