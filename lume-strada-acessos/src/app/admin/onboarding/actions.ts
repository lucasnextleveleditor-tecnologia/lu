"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { registrar } from "@/lib/eventos/registrar";
import {
  CAMPOS_POR_ETAPA,
  TOTAL_DE_ETAPAS,
  faltamEssenciais,
  type CamposDoOnboarding,
  type OnboardingRow,
} from "@/lib/types/onboarding";

/**
 * Onboarding do cliente — leitura e gravação.
 *
 * Tudo passa por `requireModulo("clientes")`: quem pode ver a ficha do
 * cliente pode ver o briefing dele. A RLS da tabela já limita à empresa; a
 * checagem aqui barra ANTES de tentar, que é o mesmo padrão do resto do
 * sistema.
 *
 * Não usa Service Role em lugar nenhum. É tudo com a sessão de quem está
 * logado — não há nada aqui que a própria pessoa não pudesse fazer.
 */

export type ResultadoOnboarding = { ok: true; row: OnboardingRow } | { ok: false; error: string };
export type ResultadoSimples = { ok: true } | { ok: false; error: string };

const PATHS = ["/admin", "/admin/onboarding"];
const revalidar = () => PATHS.forEach((p) => revalidatePath(p));

export async function buscarOnboarding(clienteId: string): Promise<{ ok: true; row: OnboardingRow | null } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { data, error } = await supabase
      .from("cliente_onboarding")
      .select("*")
      .eq("cliente_id", clienteId)
      .maybeSingle<OnboardingRow>();
    if (error) return { ok: false, error: error.message };
    return { ok: true, row: data ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Salva UMA etapa.
 *
 * O `pick` contra `CAMPOS_POR_ETAPA` não é organização, é segurança: sem
 * ele, o navegador poderia mandar `concluido_em` junto com os campos da
 * etapa 1 e dar o briefing por pronto sem passar pela validação. A RLS
 * impede escrever na empresa errada; ela não impede escrever na coluna
 * errada — isso é trabalho daqui.
 *
 * `upsert` por `cliente_id` (a tabela tem `unique`): dois cliques rápidos em
 * salvar não criam dois onboardings do mesmo cliente.
 */
export async function salvarEtapaOnboarding(
  clienteId: string,
  etapa: number,
  dados: Partial<CamposDoOnboarding>
): Promise<ResultadoOnboarding> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    if (!Number.isInteger(etapa) || etapa < 1 || etapa > TOTAL_DE_ETAPAS) {
      return { ok: false, error: "Etapa inválida." };
    }

    const permitidos = CAMPOS_POR_ETAPA[etapa] ?? [];
    const payload: Record<string, unknown> = {};
    for (const campo of permitidos) {
      if (campo in dados) payload[campo] = dados[campo] ?? null;
    }

    // A etapa gravada é sempre a MAIOR já alcançada. Voltar pra revisar a
    // etapa 2 não pode fazer o formulário "esquecer" que a pessoa já tinha
    // chegado na 5 — senão ela reabre amanhã no lugar errado.
    const { data: atual } = await supabase
      .from("cliente_onboarding")
      .select("etapa_atual")
      .eq("cliente_id", clienteId)
      .maybeSingle<{ etapa_atual: number }>();

    payload.cliente_id = clienteId;
    payload.etapa_atual = Math.max(atual?.etapa_atual ?? 1, etapa);
    payload.atualizado_por = user.id;
    if (!atual) payload.criado_por = user.id;

    const { data, error } = await supabase
      .from("cliente_onboarding")
      .upsert(payload, { onConflict: "cliente_id" })
      .select("*")
      .single<OnboardingRow>();
    if (error) return { ok: false, error: error.message };

    await registrar(supabase, user.id, {
      acao: "onboarding_salvo",
      entidade: "onboarding",
      entidadeId: data.id,
      clienteId: clienteId,
      detalhe: { etapa },
    });

    revalidar();
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Dá o briefing por concluído.
 *
 * A checagem dos essenciais acontece AQUI, sobre a linha do banco, e não
 * sobre o que o formulário acha que tem. É a diferença entre validar e
 * conferir: a tela pode estar desatualizada, a linha não.
 *
 * Devolve as CHAVES dos campos que faltam, nunca a frase pronta — quem
 * mostra é a tela, no idioma de quem está olhando.
 */
export async function concluirOnboarding(
  clienteId: string
): Promise<{ ok: true; row: OnboardingRow } | { ok: false; error: string; faltando?: string[] }> {
  try {
    const { supabase, user } = await requireModulo("clientes");

    const { data: atual, error: erroLeitura } = await supabase
      .from("cliente_onboarding")
      .select("*")
      .eq("cliente_id", clienteId)
      .maybeSingle<OnboardingRow>();
    if (erroLeitura) return { ok: false, error: erroLeitura.message };
    if (!atual) return { ok: false, error: "Preencha o formulário antes de concluir.", faltando: [] };

    const faltando = faltamEssenciais(atual);
    if (faltando.length > 0) return { ok: false, error: "", faltando: faltando as string[] };

    const { data, error } = await supabase
      .from("cliente_onboarding")
      .update({ concluido_em: new Date().toISOString(), atualizado_por: user.id })
      .eq("cliente_id", clienteId)
      .select("*")
      .single<OnboardingRow>();
    if (error) return { ok: false, error: error.message };

    await registrar(supabase, user.id, {
      acao: "onboarding_concluido",
      entidade: "onboarding",
      entidadeId: data.id,
      clienteId: clienteId,
    });

    revalidar();
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Volta pra rascunho — o briefing continua lá, só deixa de estar "fechado". */
export async function reabrirOnboarding(clienteId: string): Promise<ResultadoSimples> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    const { error } = await supabase
      .from("cliente_onboarding")
      .update({ concluido_em: null, atualizado_por: user.id })
      .eq("cliente_id", clienteId);
    if (error) return { ok: false, error: error.message };
    await registrar(supabase, user.id, {
      acao: "onboarding_reaberto",
      entidade: "onboarding",
      clienteId: clienteId,
    });
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/* ==================================================================== */
/* O LINK PARA O CLIENTE PREENCHER                                      */
/* ==================================================================== */

/**
 * Liga o link público e devolve o token para a tela montar o endereço.
 *
 * O token já nasce com a linha (default no banco), mas o link só COMEÇA A
 * VALER quando `link_enviado_em` é preenchido — que é o que esta action faz.
 * Sem essa separação, todo briefing criado pela equipe nasceria com uma
 * porta pública aberta que ninguém pediu.
 *
 * `dias = null` é sem prazo, e existe porque briefing às vezes leva semanas
 * para o cliente responder. Mas o padrão da tela é 30 dias: link de briefing
 * passa por WhatsApp, é encaminhado, fica no histórico de um celular que
 * trocou de dono.
 */
export async function enviarLinkOnboarding(
  clienteId: string,
  dias: number | null
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireModulo("clientes");

    const expira =
      dias === null ? null : new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();

    // Upsert: se a equipe ainda não abriu o formulário, a linha (e o token)
    // nascem aqui — dá pra mandar o briefing pro cliente sem ter preenchido
    // nada antes, que é justamente o caso mais comum.
    const { data, error } = await supabase
      .from("cliente_onboarding")
      .upsert(
        {
          cliente_id: clienteId,
          link_enviado_em: new Date().toISOString(),
          token_expira_em: expira,
          atualizado_por: user.id,
        },
        { onConflict: "cliente_id" }
      )
      .select("token")
      .single<{ token: string | null }>();

    if (error) return { ok: false, error: error.message };
    if (!data?.token) return { ok: false, error: "Este briefing ainda não tem link. Rode a migração de onboarding." };

    await registrar(supabase, user.id, {
      acao: "onboarding_link_enviado",
      entidade: "onboarding",
      clienteId: clienteId,
      detalhe: { dias },
    });

    revalidar();
    return { ok: true, token: data.token };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Desliga o link.
 *
 * Zera `link_enviado_em` em vez de trocar o token: o token continua o mesmo,
 * então reativar depois devolve o MESMO endereço — e o link que o cliente já
 * tinha salvo volta a funcionar em vez de virar um 404 sem explicação.
 */
export async function desativarLinkOnboarding(clienteId: string): Promise<ResultadoSimples> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    const { error } = await supabase
      .from("cliente_onboarding")
      .update({ link_enviado_em: null, atualizado_por: user.id })
      .eq("cliente_id", clienteId);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
