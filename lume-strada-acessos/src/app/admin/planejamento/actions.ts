"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import {
  CAMPOS_EDITAVEIS,
  JA_EXISTE_ATIVO,
  hojeISO,
  normalizarRegua,
  type CamposDoPlano,
  type PlanoRow,
  type StatusDoPlano,
} from "@/lib/types/planejamento";

/**
 * Planejamento estratégico — leitura e gravação.
 *
 * Tudo passa por `requireModulo("clientes")`, como o onboarding: quem pode
 * ver a ficha do cliente pode ver o plano dele. A RLS da tabela já limita à
 * empresa; a checagem aqui barra ANTES de tentar.
 *
 * Nada de Service Role. Não há uma linha aqui que a própria pessoa logada
 * não pudesse escrever pelo cliente do Supabase.
 */

export type ResultadoPlano = { ok: true; row: PlanoRow } | { ok: false; error: string };
export type ResultadoSimples = { ok: true } | { ok: false; error: string };

// `JA_EXISTE_ATIVO` vem de `lib/types/planejamento` porque um módulo
// `"use server"` só pode EXPORTAR funções async. O servidor devolve o código
// e quem escreve a frase em português, inglês ou espanhol é a tela — mesmo
// padrão do `faltando` do onboarding, que devolve as chaves dos campos e não
// os rótulos.

const PATHS = ["/admin", "/admin/planejamento"];
const revalidar = () => PATHS.forEach((p) => revalidatePath(p));

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

/**
 * Abre um ciclo em branco para o cliente e devolve o id, para a tela levar
 * a pessoa direto ao formulário.
 *
 * Nasce como `rascunho` começando hoje e durando um mês — e nasce assim de
 * propósito, em vez de abrir um modal perguntando as datas antes de criar.
 * O modal seria uma pergunta feita no pior momento: quem clica em "criar
 * ciclo" ainda está decidindo o que vai no ciclo. Rascunho não dispara aviso
 * nenhum e não ocupa a vaga do ciclo ativo, então errar aqui não custa nada.
 */
export async function criarCiclo(
  clienteId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    const { data, error } = await supabase
      .from("planos_estrategicos")
      .insert({
        cliente_id: clienteId,
        data_inicio: hojeISO(),
        duracao_meses: 1,
        status: "rascunho",
        criado_por: user.id,
        atualizado_por: user.id,
      })
      .select("id")
      .single<{ id: string }>();

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Grava o formulário.
 *
 * O `pick` contra `CAMPOS_EDITAVEIS` é a tranca: `status` e `data_fim` não
 * estão na lista, então não há requisição capaz de ativar um ciclo por aqui
 * nem de gravar uma data de fim que não bata com a conta do banco.
 */
export async function salvarPlano(
  planoId: string,
  dados: Partial<CamposDoPlano>
): Promise<ResultadoPlano> {
  try {
    const { supabase, user } = await requireModulo("clientes");

    const payload: Record<string, unknown> = {};
    for (const campo of CAMPOS_EDITAVEIS) {
      if (campo in dados) payload[campo] = dados[campo] ?? null;
    }

    // Campos com `not null default` no banco não aceitam nulo: campo em
    // branco na tela significa "nenhum", que é zero, e não "não informado".
    if (payload.qtd_posts_social === null) payload.qtd_posts_social = 0;
    if (payload.qtd_campanhas_trafego === null) payload.qtd_campanhas_trafego = 0;
    if (payload.pecas_extras === null) payload.pecas_extras = [];

    // A régua é conferida AQUI, e não só na tela: nada impede alguém de
    // chamar esta action direto com "faltando 9000 dias" ou com uma lista de
    // duzentos marcos — e cada marco vira uma notificação por pessoa da
    // equipe. `normalizarRegua` corta fora do intervalo, tira repetidos,
    // ordena e limita a 12.
    if ("dias_de_aviso" in payload) {
      const bruto = payload.dias_de_aviso;
      payload.dias_de_aviso = normalizarRegua(Array.isArray(bruto) ? (bruto as number[]) : []);
    }

    payload.atualizado_por = user.id;

    const { data, error } = await supabase
      .from("planos_estrategicos")
      .update(payload)
      .eq("id", planoId)
      .select("*")
      .single<PlanoRow>();

    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Muda o estado do ciclo — o único caminho para `status`.
 *
 * A colisão do índice único parcial (`um ativo por cliente`) chega aqui como
 * o código 23505 do Postgres, e vira um código nosso em vez de vazar
 * "duplicate key value violates unique constraint" para a tela. Essa
 * conferência NÃO é feita antes com um `select`: entre o select e o update
 * cabe outra aba fazendo a mesma coisa. Quem garante é o banco; o que a
 * aplicação faz é traduzir o "não".
 */
export async function mudarStatusDoPlano(
  planoId: string,
  status: StatusDoPlano
): Promise<ResultadoPlano> {
  try {
    const { supabase, user } = await requireModulo("clientes");
    const { data, error } = await supabase
      .from("planos_estrategicos")
      .update({ status, atualizado_por: user.id })
      .eq("id", planoId)
      .select("*")
      .single<PlanoRow>();

    if (error) {
      if (error.code === "23505" || /planos_estrategicos_um_ativo_por_cliente/.test(error.message)) {
        return { ok: false, error: JA_EXISTE_ATIVO };
      }
      return { ok: false, error: error.message };
    }

    revalidar();
    return { ok: true, row: data };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Apaga — e só apaga rascunho e cancelado.
 *
 * Ciclo `ativo` ou `encerrado` é histórico: é a prova do que foi combinado
 * com o cliente naquele período, e apagar isso por engano não tem volta. Se
 * a intenção é tirar da frente, o caminho é cancelar (que preserva a linha) e
 * aí sim apagar, com a decisão tomada duas vezes.
 *
 * O filtro vai no `.in()` da própria consulta, e não num `if` antes: assim a
 * regra vale mesmo se alguém chamar a action direto, sem passar pela tela.
 */
export async function excluirPlano(planoId: string): Promise<ResultadoSimples> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { error } = await supabase
      .from("planos_estrategicos")
      .delete()
      .eq("id", planoId)
      .in("status", ["rascunho", "cancelado"]);
    if (error) return { ok: false, error: error.message };
    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
