"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ehMoeda } from "@/lib/types/moeda";
import { isLocale } from "@/lib/i18n/locales";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Código de erro previsível, traduzido no cliente — nunca texto cru do Supabase (que vem só em inglês). */
export type ErroSenha = "senha-atual" | "senha-curta" | "senha-igual";

const TAMANHO_MINIMO_SENHA = 8;

/**
 * Atualiza os dados PESSOAIS de quem está logado (`profiles.full_name` e o
 * telefone do cadastro de equipe). Diferente de tudo em `admin/actions.ts`,
 * esta ação NÃO exige `admin`: qualquer pessoa autenticada mexe no próprio
 * registro, e só nele — o `.eq("id", user.id)` é redundante com a policy
 * `profiles_select_own`/o trigger `profiles_prevent_privilege_escalation`
 * (que bloqueia mudança de `role`/`company_id` por quem não é super_admin),
 * mas fica explícito porque quem lê o código não deveria precisar consultar
 * o RLS pra ter certeza do escopo.
 */
export async function atualizarMeuNome(nome: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado." };

    const limpo = nome.trim();
    if (!limpo) return { ok: false, error: "Informe seu nome." };
    if (limpo.length > 120) return { ok: false, error: "Nome muito longo (máximo 120 caracteres)." };

    // Service Role, escopado ao PRÓPRIO id — mesmo padrão de
    // `definir-senha/actions.ts`. Pelo cliente de sessão isto não funcionava
    // para funcionário: `profiles` só tem policy de UPDATE para admin, então
    // a gravação não dava erro, apenas não acertava linha nenhuma — a pessoa
    // via "salvo" e o nome continuava o mesmo. Uma policy de "editar o
    // próprio perfil" não resolveria: RLS não limita COLUNA, e o funcionário
    // passaria a poder mexer em `permissoes`, `active` e `expires_at` —
    // liberar todos os módulos para si mesmo.
    const { error } = await createAdminClient().from("profiles").update({ full_name: limpo }).eq("id", user.id);
    if (error) return { ok: false, error: error.message };

    // O nome aparece no rodapé da sidebar do admin (`AdminShell`), que é
    // renderizada pelo layout — invalidação ampla, mesmo padrão do branding.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Telefone mora em `equipe_membros`, não em `profiles` — é o cadastro de RH
 * que já existe. Só grava se ESTE usuário estiver vinculado a um membro de
 * equipe (`profile_id`); um admin criado direto pelo super_admin pode não
 * ter registro em `equipe_membros`, e nesse caso o campo simplesmente não
 * aparece na tela (ver `MinhaContaForm`), então esta ação nunca é chamada.
 */
export async function atualizarMeuTelefone(telefone: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado." };

    const limpo = telefone.trim();
    if (limpo.length > 40) return { ok: false, error: "Telefone muito longo." };

    const { error } = await supabase
      .from("equipe_membros")
      .update({ telefone: limpo || null })
      .eq("profile_id", user.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/configuracoes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Troca VOLUNTÁRIA de senha — a que faltava. A troca FORÇADA (primeiro
 * login, `profiles.senha_provisoria` -> `/definir-senha`) continua existindo
 * à parte e não muda.
 *
 * A senha atual é conferida re-autenticando com `signInWithPassword` antes
 * de chamar `updateUser`: o Supabase permite trocar a senha só com a sessão
 * válida, sem pedir a antiga, e isso deixaria uma máquina destravada virar
 * sequestro de conta. Como a re-autenticação acontece no MESMO cliente de
 * servidor da sessão atual, um acerto só renova os cookies da própria
 * pessoa (não derruba ninguém); um erro devolve o código `senha-atual` sem
 * ter tocado em nada.
 *
 * Devolve `error` como CÓDIGO (ver `ErroSenha`), não como frase — quem
 * chama traduz pelo dicionário, senão a mensagem chegaria em inglês pra
 * quem está usando o app em português ou espanhol.
 */
export async function alterarMinhaSenha(senhaAtual: string, senhaNova: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { ok: false, error: "Não autenticado." };

    if (senhaNova.length < TAMANHO_MINIMO_SENHA) return { ok: false, error: "senha-curta" satisfies ErroSenha };
    if (senhaNova === senhaAtual) return { ok: false, error: "senha-igual" satisfies ErroSenha };

    const { error: erroLogin } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaAtual,
    });
    if (erroLogin) return { ok: false, error: "senha-atual" satisfies ErroSenha };

    const { error } = await supabase.auth.updateUser({ password: senhaNova });
    if (error) return { ok: false, error: error.message };

    // Quem tinha senha provisória (acesso recém-gerado) e trocou por aqui
    // não deve mais cair na tela de troca forçada no próximo login.
    await supabase.from("profiles").update({ senha_provisoria: false }).eq("id", user.id);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}


/**
 * A moeda e o idioma padrão da conta.
 *
 * Só admin: é configuração da EMPRESA, não preferência de quem está usando.
 * `requireAdmin` já resolve a empresa no servidor — o `companyId` nunca vem
 * do navegador, senão bastaria trocar o id no formulário para mexer na
 * configuração de outra agência.
 *
 * Nenhum valor lançado é tocado. Trocar a moeda muda o símbolo e o formato,
 * e só: a cotação de cada dia era outra, e converter o histórico pela
 * cotação de hoje falsificaria o passado.
 */
export async function definirMoedaEIdioma(moeda: string, idioma: string): Promise<ActionResult> {
  try {
    const { supabase, companyId } = await requireAdmin();

    if (!ehMoeda(moeda)) return { ok: false, error: "Moeda inválida." };
    if (!isLocale(idioma)) return { ok: false, error: "Idioma inválido." };

    const { error } = await supabase
      .from("companies")
      .update({ moeda, idioma_padrao: idioma })
      .eq("id", companyId);
    if (error) return { ok: false, error: error.message };

    // O dinheiro aparece em quase toda tela do painel — revalidar só
    // `/admin/configuracoes` deixaria o resto com o símbolo antigo até a
    // próxima navegação completa.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}


/* ==================================================================== */
/* FOTO DE PERFIL                                                        */
/* ==================================================================== */

const BUCKET_AVATARES = "avatares";
const TAMANHO_MAX_AVATAR = 2 * 1024 * 1024;
const TIPOS_AVATAR = ["image/png", "image/jpeg", "image/webp"];

/**
 * A foto de perfil de quem está logado.
 *
 * Qualquer pessoa autenticada mexe na PRÓPRIA foto — admin, funcionário ou
 * o dono da conta. Não há checagem de papel porque não há nada de
 * privilegiado aqui; o que segura o escopo é o `user.id`, que vem da sessão
 * e nunca do formulário.
 *
 * SVG fica de fora como no resto do sistema: é documento executável, e o
 * bucket é público.
 */
export async function atualizarMinhaFoto(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione uma imagem." };
    if (file.size > TAMANHO_MAX_AVATAR) return { ok: false, error: "Imagem muito grande (máximo 2 MB)." };
    if (!TIPOS_AVATAR.includes(file.type)) return { ok: false, error: "Envie PNG, JPG ou WEBP." };

    const admin = createAdminClient();
    const { data: perfil } = await admin
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle<{ company_id: string | null }>();

    const extensao = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    // `<empresa>/<pessoa>.<ext>`: o primeiro segmento isola a empresa, o
    // segundo amarra o arquivo à pessoa — é o que impede um funcionário de
    // sobrescrever a foto de um colega (ver as policies do bucket).
    const caminho = `${perfil?.company_id ?? "sem-empresa"}/${user.id}.${extensao}`;

    const { error: erroUpload } = await admin.storage
      .from(BUCKET_AVATARES)
      .upload(caminho, file, { upsert: true, contentType: file.type });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    // `?v=` com a hora: o caminho é sempre o mesmo (uma foto por pessoa),
    // então sem isso o navegador continuaria mostrando a foto antiga do
    // cache depois de trocar.
    const { data: urlData } = admin.storage.from(BUCKET_AVATARES).getPublicUrl(caminho);
    const url = `${urlData.publicUrl}?v=${Date.now()}`;

    const { error } = await admin.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/", "layout");
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerMinhaFoto(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado." };

    const { error } = await createAdminClient().from("profiles").update({ avatar_url: null }).eq("id", user.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
