import { common, type CommonDict } from "./common";
import { nav, type NavDict } from "./nav";
import { login, type LoginDict } from "./login";
import { financeiro, type FinanceiroDict } from "./financeiro";
import { producao, type ProducaoDict } from "./producao";
import { comercial, type ComercialDict } from "./comercial";
import { trafego, type TrafegoDict } from "./trafego";
import { inventario, type InventarioDict } from "./inventario";
import { cadastros, type CadastrosDict } from "./cadastros";
import { whatsapp, type WhatsappDict } from "./whatsapp";
import { relatorios, type RelatoriosDict } from "./relatorios";
import { aparencia, type AparenciaDict } from "./aparencia";
import { dashboard, type DashboardDict } from "./dashboard";
import { cliente, type ClienteDict } from "./cliente";

/**
 * Formato COMPLETO do dicionário — cada idioma (`en/index.ts`, `es/index.ts`)
 * precisa satisfazer exatamente este shape. Qualquer chave faltando ou
 * escrita errada em outro idioma vira ERRO DE COMPILAÇÃO (`npx tsc
 * --noEmit`), nunca um texto quebrado silenciosamente em produção — é assim
 * que uma tradução desse tamanho (o app inteiro) fica segura de manter.
 */
export interface Dictionary {
  common: CommonDict;
  nav: NavDict;
  login: LoginDict;
  financeiro: FinanceiroDict;
  producao: ProducaoDict;
  comercial: ComercialDict;
  trafego: TrafegoDict;
  inventario: InventarioDict;
  cadastros: CadastrosDict;
  whatsapp: WhatsappDict;
  relatorios: RelatoriosDict;
  aparencia: AparenciaDict;
  dashboard: DashboardDict;
  cliente: ClienteDict;
}

export const pt: Dictionary = {
  common,
  nav,
  login,
  financeiro,
  producao,
  comercial,
  trafego,
  inventario,
  cadastros,
  whatsapp,
  relatorios,
  aparencia,
  dashboard,
  cliente,
};
