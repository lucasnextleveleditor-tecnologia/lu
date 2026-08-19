/**
 * Tipo de retorno compartilhado por toda ação que GERA UM LOGIN via Admin API
 * (`gerarAcessoCliente`, `gerarAcessoFuncionario`, `gerarAcessoCompanyAdmin`,
 * `converterLeadEmCliente`) — todas usam `criarAcessoComSenhaPadrao` (ver
 * `lib/supabase/admin.ts`) e por isso todas devolvem o e-mail + a senha
 * provisória pra quem chamou exibir com um botão "Copiar" / "Abrir no
 * WhatsApp", em vez de só um `{ ok: true }` mudo. Ver nota grande em
 * `lib/supabase/admin.ts` sobre por que isso substituiu o fluxo de
 * convite por link/e-mail.
 */
export type AcessoGeradoResult = { ok: true; email: string; senhaPadrao: string } | { ok: false; error: string };
