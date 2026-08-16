"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { BRANDING_CONFIG_ID } from "@/lib/branding/constants";
import { ehImagemPermitida } from "@/lib/utils/upload";
import type { BannerTone, LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const BUCKET = "branding";
const TAMANHO_MAX_BYTES = 3 * 1024 * 1024; // 3MB — logo/favicon/fundo não precisam de mais que isso

export type CampoUpload = "logo_url" | "logo_dark_url" | "logo_light_url" | "favicon_url" | "login_bg_url" | "banner_img_url";

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
    if (!ehImagemPermitida(file.type)) return { ok: false, error: "Envie um arquivo de imagem (PNG, JPG, WEBP ou GIF). SVG não é permitido." };

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
  loginTitle: string;
  loginSubtitle: string;
  loginBoxPosition: LoginBoxPosition;
  loginBgPreset: LoginBgPreset;
  sidebarCompactoPadrao: boolean;
  bannerAtivoLogin: boolean;
  bannerAtivoAdmin: boolean;
  bannerAtivoCliente: boolean;
  bannerTitulo: string;
  bannerDescricao: string;
  bannerLinkUrl: string;
  bannerLinkLabel: string;
  bannerTone: BannerTone;
  bannerDispensavel: boolean;
}

/**
 * Salva textos/posição/fundo do login, o padrão do menu lateral e o banner
 * de destaque — os campos de upload já são salvos à parte, ver acima. Cores
 * (`primary_color`/`accent_color`/`theme_preset`) não são mais
 * configuráveis: a paleta preto/branco é fixa em toda a plataforma (ver
 * `globals.css` / `tailwind.config.ts`) — as colunas continuam existindo no
 * banco por compatibilidade, mas nada no app as lê mais.
 */
export async function salvarBranding(input: BrandingInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!input.loginTitle.trim()) return { ok: false, error: "Informe o título da tela de login." };

    // Ligar qualquer toggle de "onde aparece" sem preencher o título do
    // banner deixaria o admin achando que salvou algo que na prática nunca
    // vai aparecer pra ninguém (`AnnouncementBanner` exige título) — mais
    // seguro barrar aqui do que deixar o admin descobrir isso sozinho.
    const bannerAtivoEmAlgumLugar = input.bannerAtivoLogin || input.bannerAtivoAdmin || input.bannerAtivoCliente;
    if (bannerAtivoEmAlgumLugar && !input.bannerTitulo.trim()) {
      return { ok: false, error: "Preencha o título do banner antes de ativá-lo em algum lugar." };
    }

    const { error } = await supabase
      .from("branding_config")
      .update({
        login_title: input.loginTitle.trim(),
        login_subtitle: input.loginSubtitle.trim(),
        login_box_position: input.loginBoxPosition,
        login_bg_preset: input.loginBgPreset,
        sidebar_compacto_padrao: input.sidebarCompactoPadrao,
        banner_ativo_login: input.bannerAtivoLogin,
        banner_ativo_admin: input.bannerAtivoAdmin,
        banner_ativo_cliente: input.bannerAtivoCliente,
        banner_titulo: input.bannerTitulo.trim(),
        banner_descricao: input.bannerDescricao.trim(),
        banner_link_url: input.bannerLinkUrl.trim() || null,
        banner_link_label: input.bannerLinkLabel.trim() || "Saiba mais",
        banner_tone: input.bannerTone,
        banner_dispensavel: input.bannerDispensavel,
      })
      .eq("id", BRANDING_CONFIG_ID);

    if (error) return { ok: false, error: error.message };

    // Branding afeta o favicon, a sidebar do admin e o header do cliente —
    // invalidação ampla de propósito (login não usa mais nenhum campo de
    // branding além de título/subtítulo/fundo/banner, já cobertos aqui).
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
