/** Menu lateral do admin (`AdminShell.tsx`) — grupos e itens de navegação. */
export interface NavDict {
  painelAdministrativo: string;
  grupoVisaoGeral: string;
  grupoComercial: string;
  grupoGestao: string;
  grupoFinanceiro: string;
  dashboard: string;
  relatorios: string;
  crmVendas: string;
  whatsapp: string;
  cadastros: string;
  financeiro: string;
  producaoTarefas: string;
  trafegoMetas: string;
  inventarioPatrimonio: string;
  aparencia: string;
  expandirMenu: string;
  recolherMenu: string;
}

export const nav: NavDict = {
  painelAdministrativo: "Painel Administrativo",
  grupoVisaoGeral: "Visão Geral",
  grupoComercial: "Comercial",
  grupoGestao: "Gestão",
  grupoFinanceiro: "Financeiro",
  dashboard: "Dashboard",
  relatorios: "Relatórios",
  crmVendas: "CRM & Vendas",
  whatsapp: "WhatsApp",
  cadastros: "Cadastros",
  financeiro: "Financeiro",
  producaoTarefas: "Produção & Tarefas",
  trafegoMetas: "Tráfego & Metas",
  inventarioPatrimonio: "Inventário & Patrimônio",
  aparencia: "Aparência",
  expandirMenu: "Expandir menu",
  recolherMenu: "Recolher menu",
};
