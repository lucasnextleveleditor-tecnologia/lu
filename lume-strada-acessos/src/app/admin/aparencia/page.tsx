import { redirect } from "next/navigation";

/**
 * Aparência deixou de ter tela própria: virou uma aba dentro da engrenagem
 * de Configurações (`/admin/configuracoes?aba=aparencia`), junto de Empresa
 * & Equipe, Minha Conta e Assinatura.
 *
 * A rota continua existindo só como redirecionamento, pra não quebrar link
 * antigo, favorito do navegador ou qualquer referência espalhada. As Server
 * Actions continuam onde estavam (`./actions.ts`) — só a tela mudou de
 * lugar, o back-end de branding não se mexeu.
 */
export default function AparenciaRedirectPage() {
  redirect("/admin/configuracoes?aba=aparencia");
}
