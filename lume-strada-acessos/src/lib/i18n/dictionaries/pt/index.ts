import { common, type CommonDict } from "./common";
import { nav, type NavDict } from "./nav";
import { login, type LoginDict } from "./login";
import { financeiro, type FinanceiroDict } from "./financeiro";
import { producao, type ProducaoDict } from "./producao";
import { comercial, type ComercialDict } from "./comercial";
import { orcamentos, type OrcamentosDict } from "./orcamentos";
import { contratos, type ContratosDict } from "./contratos";
import { portal, type PortalDict } from "./portal";
import { trafego, type TrafegoDict } from "./trafego";
import { inventario, type InventarioDict } from "./inventario";
import { cadastros, type CadastrosDict } from "./cadastros";
import { whatsapp, type WhatsappDict } from "./whatsapp";
import { relatorios, type RelatoriosDict } from "./relatorios";
import { aparencia, type AparenciaDict } from "./aparencia";
import { configuracoes, type ConfiguracoesDict } from "./configuracoes";
import { dashboard, type DashboardDict } from "./dashboard";
import { cliente, type ClienteDict } from "./cliente";
import { agenda, type AgendaDict } from "./agenda";
import { objetivos, type ObjetivosDict } from "./objetivos";
import { ordemDoDia, type OrdemDoDiaDict } from "./ordemDoDia";
import { mapaMental, type MapaMentalDict } from "./mapaMental";
import { ferramentas, type FerramentasDict } from "./ferramentas";
import { armazenamento, type ArmazenamentoDict } from "./armazenamento";
import { onboarding, type OnboardingDict } from "./onboarding";
import { planejamento, type PlanejamentoDict } from "./planejamento";
import { historico, type HistoricoDict } from "./historico";
import { notificacoes, type NotificacoesDict } from "./notificacoes";

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
  orcamentos: OrcamentosDict;
  contratos: ContratosDict;
  portal: PortalDict;
  trafego: TrafegoDict;
  inventario: InventarioDict;
  cadastros: CadastrosDict;
  whatsapp: WhatsappDict;
  relatorios: RelatoriosDict;
  aparencia: AparenciaDict;
  configuracoes: ConfiguracoesDict;
  dashboard: DashboardDict;
  cliente: ClienteDict;
  agenda: AgendaDict;
  objetivos: ObjetivosDict;
  ordemDoDia: OrdemDoDiaDict;
  mapaMental: MapaMentalDict;
  ferramentas: FerramentasDict;
  armazenamento: ArmazenamentoDict;
  onboarding: OnboardingDict;
  planejamento: PlanejamentoDict;
  historico: HistoricoDict;
  notificacoes: NotificacoesDict;
}

export const pt: Dictionary = {
  common,
  nav,
  login,
  financeiro,
  producao,
  comercial,
  orcamentos,
  contratos,
  portal,
  trafego,
  inventario,
  cadastros,
  whatsapp,
  relatorios,
  aparencia,
  configuracoes,
  dashboard,
  cliente,
  agenda,
  objetivos,
  ordemDoDia,
  mapaMental,
  ferramentas,
  armazenamento,
  onboarding,
  planejamento,
  historico,
  notificacoes,
};

// ----------------------------------------------------------------------------
// Trava de segurança: o dicionário precisa ser SERIALIZÁVEL
// ----------------------------------------------------------------------------
// O dicionário inteiro é montado no servidor e entregue a um provider CLIENTE
// no layout raiz (`app/layout.tsx` → `LocaleProvider`). Tudo que atravessa
// essa fronteira precisa ser dado puro: uma única função em qualquer canto de
// qualquer arquivo de tradução derruba o APP INTEIRO em produção com
// "Application error: a server-side exception has occurred" — e não só a tela
// que usa aquele texto, o que torna o erro difícil de localizar.
//
// Para plural, use um objeto `{ um, muitos }` com `{n}` no lugar do número e
// resolva no componente (ver `contar()` em `FolhaOrdemDoDia.tsx`).

/** Troca por `never` qualquer função escondida na árvore de `T`. */
type ApenasDados<T> = T extends (...args: never[]) => unknown
  ? never
  : T extends readonly (infer U)[]
    ? readonly ApenasDados<U>[]
    : T extends object
      ? { [K in keyof T]: ApenasDados<T[K]> }
      : T;

/**
 * Esta atribuição É o teste. Se alguém adicionar uma função a um dicionário,
 * o `tsc` para aqui — em vez de o erro aparecer só em produção.
 */
export const DICIONARIO_SERIALIZAVEL: ApenasDados<Dictionary> = pt;
