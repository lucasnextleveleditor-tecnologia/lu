"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { BRANDING_CONFIG_ID } from "@/lib/branding/constants";
import { isValidHex } from "@/lib/utils/color";
import type { LoginBgPreset, LoginBoxPosition, ThemePreset } from "@/lib/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const BUCKET = "branding";
const TAMANHO_MAX_BYTES = 3 * 1024 * 1024; // 3MB — logo/favicon/fundo não precisam de mais que isso

export type CampoUpload = "logo_url" | "logo_dark_url" | "logo_light_url" | "favicon_url" | "login_bg_url";

/**
 * Envia um arquivo pro bucket `branding` (Supabase Storage) e já grava a
 * URL pública no campo correspondente de `branding_config` — o upload
 * "salva sozinho", diferente dos campos de texto/cor (que só persistem
 * quando o admin clica em "Salvar Alterações" em `salvarBranding`).
 */
export async function uploadBrandingAsset(campo: CampoUpload, formData: FormData): Promise<UploadResult> {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione um arquivo." };
    if (file.size > TAMANHO_MAX_BYTES) return { ok: false, error: "Arquivo muito grande (máximo 3MB)." };
    if (!file.type.startsWith("image/")) return { ok: false, error: "Envie um arquivo de imagem." };

    const extensao = file.name.split(".").pop()?.toLowerCase() || "png";
    const caminho = `${campo}/${Date.now()}.${extensao}`;

    const { error: erroUpload } = await supabase.storage.from(BUCKET).upload(caminho, file, {
      upsert: true,
      contentType: file.type,
    });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
    const url = urlData.publicUrl;

    const { error: erroUpdate } = await supabase.from("branding_config").update({ [campo]: url }).eq("id", BRANDING_CONFIG_ID);
    if (erroUpdate) return { ok: false, error: erroUpdate.message };

    revalidatePath("/", "layout");
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Desvincula um asset (volta pro padrão da Lume) sem apagar o arquivo do
 * bucket — como só a URL pública é guardada (não o caminho do objeto),
 * remover o arquivo em si fica pra uma limpeza manual do bucket no painel
 * do Supabase, se o admin quiser; a aplicação nunca aponta mais pra ele.
 */
export async function removerBrandingAsset(campo: CampoUpload): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("branding_config").update({ [campo]: null }).eq("id", BRANDING_CONFIG_ID);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export interface BrandingInput {
  primaryColor: string;
  accentColor: string;
  loginTitle: string;
  loginSubtitle: string;
  loginBoxPosition: LoginBoxPosition;
  loginBgPreset: LoginBgPreset;
  themePreset: ThemePreset;
  sidebarCompactoPadrao: boolean;
}

/** Salva cores, textos/posição do login, tema selecionado e o padrão do menu lateral — os campos de upload já são salvos à parte, ver acima. */
export async function salvarBranding(input: BrandingInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!isValidHex(input.primaryColor)) return { ok: false, error: "Cor primária inválida." };
    if (!isValidHex(input.accentColor)) return { ok: false, error: "Cor de acentuação inválida." };
    if (!input.loginTitle.trim()) return { ok: false, error: "Informe o título da tela de login." };

    const { error } = await supabase
      .from("branding_config")
      .update({
        primary_color: input.primaryColor,
        accent_color: input.accentColor,
        login_title: input.loginTitle.trim(),
        login_subtitle: input.loginSubtitle.trim(),
        login_box_position: input.loginBoxPosition,
        login_bg_preset: input.loginBgPreset,
        theme_preset: input.themePreset,
        sidebar_compacto_padrao: input.sidebarCompactoPadrao,
      })
      .eq("id", BRANDING_CONFIG_ID);

    if (error) return { ok: false, error: error.message };

    // Branding afeta o layout raiz (CSS vars/favicon), a sidebar do admin,
    // o header do cliente e a tela de login — invalidação ampla de propósito.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
