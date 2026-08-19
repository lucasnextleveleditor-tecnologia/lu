/**
 * Tipo de retorno compartilhado por toda ação que GERA UM LOGIN via Admin API
 * (`gerarAcessoCliente`, `gerarAcessoFuncionario`, `gerarAcessoCompanyAdmin`,
 * `converterLeadEmCliente`) — todas usam `gerarLinkConvite` (ver
 * `lib/supabase/admin.ts`) e por isso todas devolvem o link pronto pra quem
 * chamou exibir com um botão "Copiar" / "Abrir no WhatsApp`, em vez de só um
 * `{ ok: true }` mudo. Ver nota grande em `lib/supabase/admin.ts` sobre por
 * que isso substituiu `inviteUserByEmail`.
 */
export type AcessoGeradoResult = { ok: true; link: string } | { ok: false; error: string };
