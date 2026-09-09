"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

    const { error } = await supabase.from("profiles").update({ full_name: limpo }).eq("id", user.id);
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
