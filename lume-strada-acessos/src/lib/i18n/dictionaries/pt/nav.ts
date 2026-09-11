/** Menu lateral do admin (`AdminShell.tsx`) — grupos e itens de navegação. */
export interface NavDict {
  painelAdministrativo: string;
  grupoVisaoGeral: string;
  armazenamento: string;
  armazenamentoDica: string;
  grupoComercial: string;
  grupoGestao: string;
  grupoFinanceiro: string;
  grupoEventos: string;
  eventos: string;
  /** Etiqueta ao lado do item de menu de um modulo ainda em construcao. */
  emBreveEtiqueta: string;
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
  objetivos: string;
  producaoTarefas: string;
  /** Vitrine das ferramentas soltas (Ordem de Externa, Mapa Mental, Calculadora, Contratos). */
  ferramentas: string;
  ordemDeExterna: string;
  mapasMentais: string;
  contratos: string;
  trafegoMetas: string;
  inventarioPatrimonio: string;
  aparencia: string;
  /** Engrenagem fixa no rodapé do menu — abre `/admin/configuracoes` (Empresa & Equipe, Minha Conta, Aparência, Assinatura). */
  configuracoes: string;
  expandirMenu: string;
  recolherMenu: string;
}

export const nav: NavDict = {
  painelAdministrativo: "Painel Administrativo",
  grupoVisaoGeral: "Visão Geral",
  armazenamento: "Armazenamento",
  armazenamentoDica: "Ver onde o espaço está sendo usado",
  grupoComercial: "Comercial",
  grupoGestao: "Gestão",
  grupoFinanceiro: "Financeiro",
  grupoEventos: "Eventos",
  eventos: "Eventos",
  emBreveEtiqueta: "Em breve",
  dashboard: "Dashboard",
  relatorios: "Relatórios",
  agenda: "Agenda",
  crmVendas: "CRM & Vendas",
  orcamentos: "Orçamentos",
  comercialHub: "Comercial",
  whatsapp: "WhatsApp",
  cadastros: "Gestão de Clientes",
  financeiro: "Financeiro",
  objetivos: "Objetivos",
  producaoTarefas: "Produção & Tarefas",
  ferramentas: "Ferramentas",
  ordemDeExterna: "Ordem de Externa",
  mapasMentais: "Mapas Mentais",
  contratos: "Contratos",
  trafegoMetas: "Tráfego & Metas",
  inventarioPatrimonio: "Inventário & Patrimônio",
  aparencia: "Aparência",
  configuracoes: "Configurações",
  expandirMenu: "Expandir menu",
  recolherMenu: "Recolher menu",
};
