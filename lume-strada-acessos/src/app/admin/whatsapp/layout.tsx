import { redirect } from "next/navigation";

// Módulo escondido do menu e desativado por completo dentro do app — pedido
// explícito do dono da conta. Código e dados (`whatsapp_*` no banco, os
// componentes e Server Actions deste módulo) continuam intactos de
// propósito, só o acesso pela UI foi bloqueado (incondicional, nem admin
// passa) — reversível bastando restaurar o `await requireModuloOuRedirect
// ("whatsapp")` que havia aqui (ver histórico do arquivo) e devolver o item
// no menu (`AdminShell.tsx`, grupo "grupoComercial").
export default function WhatsappLayout() {
  redirect("/admin/dashboard");
}
