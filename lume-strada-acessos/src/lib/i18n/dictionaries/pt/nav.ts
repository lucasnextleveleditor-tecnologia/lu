/** Menu lateral do admin (`AdminShell.tsx`) — grupos e itens de navegação. */
export interface NavDict {
  painelAdministrativo: string;
  grupoVisaoGeral: string;
  grupoComercial: string;
  grupoGestao: string;
  grupoFinanceiro: string;
  dashboard: string;
  relatorios: string;
  agenda: string;
  crmVendas: string;
  orcamentos: string;
  /** Item único do menu que substituiu `crmVendas`+`orcamentos` — abre o hub unificado em `/admin/comercial` (Leads, Funil, Calculadora e Propostas numa tela só, ver `ComercialHubTabs.tsx`). As duas chaves antigas continuam aqui (não usadas no menu) só pra não quebrar nada que ainda referencie o texto. */
  comercialHub: string;
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
  agenda: "Agenda",
  crmVendas: "CRM & Vendas",
  orcamentos: "Orçamentos",
  comercialHub: "Comercial",
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
