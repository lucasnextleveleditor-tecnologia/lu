import type { BannerTone, BrandingConfigRow, LoginBgPreset, ThemePreset } from "@/lib/types/database";

/** Id fixo da linha singleton — o mesmo usado no `insert` do supabase/schema.sql. */
export const BRANDING_CONFIG_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Estado usado se a tabela `branding_config` ainda não existir (schema não
 * rodado) ou a query falhar por qualquer motivo — o app nunca deve quebrar
 * por causa de branding ausente; ele só volta pro visual padrão genérico do
 * App Gestão (nunca o nome de uma empresa específica).
 */
export const DEFAULT_BRANDING: BrandingConfigRow = {
  id: BRANDING_CONFIG_ID,
  logo_url: null,
  logo_dark_url: null,
  logo_light_url: null,
  favicon_url: null,
  // Azul da plataforma — o mesmo `--color-accent`/`--color-accent-2` que
  // `globals.css` já usa quando nenhuma cor de marca está aplicada, e o
  // preset "Azul" de `PRESETS_MARCA`. Os três precisam concordar: senão uma
  // empresa que nunca escolheu cor veria um tom no app (vindo daqui) e outro
  // marcado como selecionado no card de Aparência. O âmbar que estava aqui
  // era herança da paleta antiga, de quando branding era global.
  primary_color: "#4F7CFF",
  accent_color: "#22D3EE",
  login_bg_url: null,
  login_logo_url: null,
  login_logo_light_url: null,
  login_bg_preset: "grain",
  login_title: "Creator Suite",
  login_subtitle: "Acesso a clientes e projetos",
  login_box_position: "centro",
  theme_preset: "cinematic_dark",
  sidebar_compacto_padrao: false,
  banner_ativo_login: false,
  banner_ativo_admin: false,
  banner_ativo_cliente: false,
  banner_titulo: "",
  banner_descricao: "",
  banner_link_url: null,
  banner_link_label: "Saiba mais",
  banner_img_url: null,
  banner_tone: "neutral",
  banner_dispensavel: true,
  created_at: "1970-01-01T00:00:00Z",
  updated_at: "1970-01-01T00:00:00Z",
};

export interface ThemePresetDef {
  key: ThemePreset;
  label: string;
  descricao: string;
  primaryColor: string;
  accentColor: string;
}

/** Presets rápidos — clicar um só troca as cores locais no formulário (o admin ainda precisa salvar). */
export const THEME_PRESETS: ThemePresetDef[] = [
  {
    key: "cinematic_dark",
    label: "Cinematic Dark",
    descricao: "Padrão do sistema — âmbar sobre preto quase absoluto.",
    primaryColor: "#d4a24e",
    accentColor: "#e8bd72",
  },
  {
    key: "minimalist_clean",
    label: "Minimalist Clean",
    descricao: "Neutro e discreto — cinza-claro sobre grafite.",
    primaryColor: "#e4e2df",
    accentColor: "#a6a3a0",
  },
  {
    key: "midnight_blue",
    label: "Midnight Blue",
    descricao: "Azul profundo — visual mais corporativo.",
    primaryColor: "#5b8def",
    accentColor: "#8fb2f5",
  },
];

export interface LoginBgPresetDef {
  key: LoginBgPreset;
  label: string;
  className: string;
}

/**
 * A marca padrão da plataforma na tela de login.
 *
 * Vive em `public/`, versionada no repositório, e não numa coluna do banco:
 * é o arquivo que veste o produto quando ninguém subiu nada, então tem de
 * existir antes de qualquer configuração — inclusive num banco recém-criado.
 * Enviar uma logo no Super Admin grava a URL em `branding_config` e passa
 * na frente destes; remover volta para cá.
 */
export const LOGO_LOGIN_PADRAO = "/marca-login.png";
export const LOGO_LOGIN_PADRAO_CLARA = "/marca-login-clara.png";

/** Padrões cinematográficos sem depender de upload — usados quando `login_bg_url` está vazio. */
export const LOGIN_BG_PRESETS: LoginBgPresetDef[] = [
  { key: "grain", label: "Grão de Filme", className: "login-bg-grain" },
  { key: "projector", label: "Luz de Projetor", className: "login-bg-projector" },
  { key: "film-strip", label: "Rolo de Filme", className: "login-bg-film-strip" },
  { key: "none", label: "Sólido", className: "login-bg-none" },
];

/** Rótulo de cada tom do banner — mesmos 4 tons fixos de `lib/utils/tone.ts`, nunca uma cor livre. */
export const BANNER_TONE_LABELS: Record<BannerTone, string> = {
  neutral: "Neutro (aviso/informação)",
  good: "Bom (novidade/sucesso)",
  warning: "Atenção",
  critical: "Crítico/Urgente",
};
