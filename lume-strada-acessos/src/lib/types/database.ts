/**
 * Tipos do banco de dados (escritos à mão — este projeto ainda não tem um
 * projeto Supabase real conectado). Assim que você rodar `supabase/schema.sql`
 * no seu projeto, o ideal é gerar o tipo `Database` oficial via:
 *
 *   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/lib/types/database.ts
 *
 * Decisão de projeto: os clientes em `lib/supabase/*` NÃO são parametrizados
 * com `createClient<Database>(...)`. O formato completo do tipo `Database`
 * exigido pelas versões atuais de `@supabase/supabase-js`/`@supabase/ssr`
 * mudou entre versões menores (o layout interno de tipos foi reestruturado),
 * e um `Database` escrito à mão pode ficar sutilmente incompatível de um
 * jeito difícil de depurar (toda query resolve silenciosamente para `never`).
 * Em vez disso, cada query usa `.overrideTypes<ProfileRow, { merge: false }>()`
 * (ver `lib/supabase/server.ts`/`admin.ts`/`middleware.ts`) — mais simples,
 * imune a esse tipo de quebra entre versões, e com o mesmo autocomplete no
 * call site. Assim que você gerar o `Database` real a partir do seu projeto,
 * é seguro voltar a parametrizar os clientes com ele.
 */

// "super_admin" foi adicionado pela migração multi-tenant (ver
// `supabase/multitenant-migration.sql` e `MIGRACAO-MULTI-TENANT.md`) — é
// você, dono do SaaS, sem `company_id`. Os outros 3 valores NÃO foram
// renomeados pra COMPANY_ADMIN/COMPANY_USER de propósito (ver o motivo no
// plano) — na prática 'admin' = dono da empresa compradora, 'funcionario' =
// funcionário dela, 'cliente' = cliente daquela empresa.
export type PapelUsuario = "admin" | "funcionario" | "cliente" | "super_admin";

/** Chaves possíveis dentro de `permissoes` — mesma lista de `ModuloChave` em `lib/auth/requireAdmin.ts`, duplicada aqui só como tipo de dado (evita import circular). */
export type PermissoesFuncionario = Partial<Record<"clientes" | "financeiro" | "producao" | "comercial" | "trafego" | "inventario" | "whatsapp", boolean>>;

/**
 * Chave de cada card/seção do Dashboard administrativo (`VisaoGeral.tsx`) —
 * mesma lista usada nos toggles do modal de Permissões (ver `CARDS_DASHBOARD`
 * em `lib/utils/cadastros.ts`). Ao contrário de `PermissoesFuncionario`
 * (onde chave ausente = SEM acesso, por segurança), aqui é o oposto: chave
 * ausente = card VISÍVEL. Essa configuração nunca é a barreira de segurança
 * de nada (o dado sensível já é barrado por módulo antes de chegar aqui,
 * ver `podeVerFinanceiro` etc. em `src/app/admin/dashboard/page.tsx`) — é
 * só "o que esse funcionário quer/precisa ver no dia a dia dele", então o
 * padrão seguro de sempre (deny-by-default) viraria uma dashboard vazia pra
 * todo mundo que já tinha acesso antes dessa configuração existir.
 */
export type DashboardCardChave =
  | "captacoesHoje"
  | "entregasHoje"
  | "tarefasAtrasadas"
  | "entregasAguardandoAprovacao"
  | "leadsEmAberto"
  | "followUpsAtrasados"
  | "valorPropostasAbertas"
  | "saldoConsolidado"
  | "contasVencidas"
  | "financeiroDoMes"
  | "resumoInventario"
  | "resumoTrafegoHoje"
  | "whatsapp"
  | "agendaDoDia";

export type PreferenciasDashboard = Partial<Record<DashboardCardChave, boolean>>;

export interface ProfileRow {
  id: string; // uuid — mesmo id de auth.users
  email: string;
  full_name: string | null;
  role: PapelUsuario;
  company_id: string | null; // uuid -> companies.id — null SOMENTE quando role = 'super_admin'
  active: boolean; // suspensão manual (independe da data de expiração)
  expires_at: string | null; // ISO timestamp — null = sem expiração definida
  // Só é lida/usada quando role = 'funcionario' — admin sempre tem acesso
  // total (bypass), cliente nunca acessa /admin. Chave ausente ou false =
  // sem acesso àquele módulo. Ver `lib/auth/requireAdmin.ts` (`requireModulo`).
  permissoes: PermissoesFuncionario;
  // Quais cards do Dashboard aparecem pra esse funcionário — ver
  // `DashboardCardChave` acima. Também só é lida/usada quando
  // role = 'funcionario' (admin sempre vê tudo).
  dashboard_config: PreferenciasDashboard;
  // true = ainda está com a senha padrão ("123") atribuída na criação da
  // conta — o middleware força a troca em /definir-senha antes de liberar
  // qualquer outra tela (ver `src/middleware.ts` e
  // `src/app/definir-senha/actions.ts`). Vira false assim que a pessoa
  // define a própria senha.
  senha_provisoria: boolean;
  created_at: string;
  updated_at: string;
}

/** Meta de performance de um cliente para UM dia específico (data em formato ISO, ex: "2026-08-12"). */
export interface MetaDiariaRow {
  id: string; // uuid
  cliente_id: string | null; // uuid -> profiles.id (role = 'cliente') — null pra cliente sem login (ver `cliente_cadastro_id`)
  cliente_cadastro_id: string | null; // uuid -> clientes.id — vínculo "de verdade", sempre preenchido, com ou sem login (mesmo padrão de `prod_tarefas`, ver supabase/cadastros.sql)
  data: string; // ISO date (yyyy-mm-dd)
  valor_investido_meta: number;
  leads_meta: number | null;
  objetivo: string | null;
  created_at: string;
  updated_at: string;
}

/** O que um lançamento de tráfego mediu como resultado — nem toda campanha gera lead, algumas geram venda direta. */
export type TipoResultadoTrafego = "leads" | "vendas";

/** Lançamento real de tráfego de um dia — sempre vinculado a uma MetaDiariaRow, nunca solto. */
export interface TrafegoRegistroRow {
  id: string; // uuid
  meta_id: string; // uuid -> metas_diarias.id
  nome_campanha: string | null;
  valor_investido: number;
  /** O que `quantidade_resultado` está contando nesse lançamento — leads OU vendas, nunca os dois juntos (um lançamento por tipo). */
  tipo_resultado: TipoResultadoTrafego;
  quantidade_resultado: number;
  cliques: number;
  visualizacoes: number;
  created_at: string;
  updated_at: string;
}

/** Categoria/tipo de bem do inventário (ex: Escritório, Equipamentos, Informática, Imóveis). */
export interface CategoriaInventarioRow {
  id: string; // uuid
  nome: string;
  descricao: string | null;
  codigo: string; // código de identificação da categoria — único (ex: "INFO", "EQP")
  created_at: string;
  updated_at: string;
}

export type StatusItemInventario = "ativo" | "manutencao" | "baixado" | "emprestado";

/** Um bem/etiqueta do patrimônio — sempre vinculado a uma categoria (nunca solto). */
export interface ItemInventarioRow {
  id: string; // uuid
  codigo_etiqueta: string; // número da etiqueta / código de barras — único
  categoria_id: string; // uuid -> categorias_inventario.id
  nome_item: string;
  status: StatusItemInventario;
  localizacao: string | null;
  data_aquisicao: string | null; // ISO date (yyyy-mm-dd)
  valor_pago: number | null; // quanto foi investido na aquisição (era `valor_estimado`)
  valor_atual: number | null; // valor de mercado hoje — junto com `valor_pago` alimenta o Dashboard Financeiro (depreciação)
  responsavel_atual: string | null; // colaborador ou setor — texto livre, nem todo bem tem um usuário do sistema como dono
  created_at: string;
  updated_at: string;
}

/** Item de inventário com o nome da categoria já resolvido, pra não ter que cruzar tabelas em tela. */
export interface ItemInventarioComCategoria extends ItemInventarioRow {
  categoria_nome: string;
}

export type LoginBgPreset = "grain" | "projector" | "film-strip" | "none";
export type LoginBoxPosition = "esquerda" | "direita" | "centro";
export type ThemePreset = "cinematic_dark" | "minimalist_clean" | "midnight_blue";

/** Tom do banner de destaque — mesmos 4 tons fixos do resto do app (`lib/utils/tone.ts`), nunca uma cor livre. */
export type BannerTone = "neutral" | "good" | "warning" | "critical";

/**
 * Linha SINGLETON (sempre uma só, id fixo — ver supabase/schema.sql seção
 * 7) com a identidade visual dinâmica do app: logos, favicon, cores, tela
 * de login e o padrão do menu lateral. Lida a cada request no layout raiz
 * e injetada como variáveis CSS + metadata — ver lib/branding/.
 */
export interface BrandingConfigRow {
  id: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  logo_light_url: string | null;
  favicon_url: string | null;
  primary_color: string; // hex, ex: "#d4a24e"
  accent_color: string; // hex
  login_bg_url: string | null;
  login_bg_preset: LoginBgPreset;
  login_title: string;
  login_subtitle: string;
  login_box_position: LoginBoxPosition;
  theme_preset: ThemePreset;
  sidebar_compacto_padrao: boolean;
  // Banner de destaque — UM banner só (mesmo conteúdo), com 3 chaves
  // independentes pra decidir ONDE ele aparece (ver supabase/banner.sql).
  // "Ativo" em qualquer uma delas + título preenchido é o que decide se
  // `AnnouncementBanner` renderiza alguma coisa (ver o componente).
  banner_ativo_login: boolean;
  banner_ativo_admin: boolean;
  banner_ativo_cliente: boolean;
  banner_titulo: string;
  banner_descricao: string;
  banner_link_url: string | null;
  banner_link_label: string;
  banner_img_url: string | null;
  banner_tone: BannerTone;
  banner_dispensavel: boolean;
  created_at: string;
  updated_at: string;
}
