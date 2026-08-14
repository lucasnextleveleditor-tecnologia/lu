import type { PermissoesFuncionario } from "@/lib/types/database";

/** Lista fixa dos módulos que podem ser liberados/bloqueados por funcionário — mesma ordem que aparece no modal de Permissões. Rótulo bate com o nome do item no menu lateral. */
export const MODULOS_PERMISSAO: { chave: keyof PermissoesFuncionario; label: string; hint: string }[] = [
  { chave: "clientes", label: "Clientes", hint: "Ver e editar o cadastro de clientes" },
  { chave: "comercial", label: "CRM & Vendas", hint: "Funil comercial e leads" },
  { chave: "whatsapp", label: "WhatsApp", hint: "Inbox e conexão do número" },
  { chave: "financeiro", label: "Financeiro", hint: "Contas, cartões e transações" },
  { chave: "producao", label: "Produção & Tarefas", hint: "Board de tarefas e entregas" },
  { chave: "trafego", label: "Tráfego & Metas", hint: "Metas e lançamentos de tráfego" },
  { chave: "inventario", label: "Inventário & Patrimônio", hint: "Bens e depreciação" },
];

export function temAcessoGerado(registro: { profile_id: string | null }): boolean {
  return registro.profile_id !== null;
}
