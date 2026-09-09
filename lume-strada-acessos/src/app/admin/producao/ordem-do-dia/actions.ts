"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { buscarPrevisao, geocodificar } from "@/lib/utils/clima";

export type ActionResult = { ok: true } | { ok: false; error: string };
/** O que a folha mostra na faixa de clima — devolvido para a tela pintar na hora. */
export interface ClimaSalvo {
  clima_resumo: string;
  clima_max: number | null;
  clima_min: number | null;
  clima_chuva_mm: number | null;
  nascer_do_sol: string | null;
  por_do_sol: string | null;
  clima_atualizado_em: string;
}

export type ActionResultId = { ok: true; id: string } | { ok: false; error: string };

const ROTA = "/admin/producao/ordem-do-dia";

/**
 * Cria uma folha nova. Quando vem de uma captação já agendada em Produção,
 * herda projeto, cliente e data — a ordem do dia de uma diária que já existe
 * na agenda não deveria ser digitada do zero.
 */
export async function criarOrdemDoDia(tarefaId?: string): Promise<ActionResultId> {
  try {
    const { supabase } = await requireModulo("producao");

    let projeto = "";
    let clienteId: string | null = null;
    let data: string | null = null;

    if (tarefaId) {
      const { data: tarefa } = await supabase
        .from("prod_tarefas")
        .select("titulo, cliente_cadastro_id, data_captacao")
        .eq("id", tarefaId)
        .maybeSingle<{ titulo: string; cliente_cadastro_id: string | null; data_captacao: string | null }>();
      if (tarefa) {
        projeto = tarefa.titulo;
        clienteId = tarefa.cliente_cadastro_id;
        data = tarefa.data_captacao;
      }
    }

    const { data: criada, error } = await supabase
      .from("ordens_do_dia")
      .insert({ projeto, cliente_id: clienteId, tarefa_id: tarefaId ?? null, data })
      .select("id")
      .single<{ id: string }>();

    if (error || !criada) return { ok: false, error: error?.message ?? "Não foi possível criar a ordem do dia." };

    revalidatePath(ROTA);
    return { ok: true, id: criada.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export interface CabecalhoInput {
  projeto: string;
  clienteId: string | null;
  tipo: string;
  data: string | null;
  diariaNumero: number;
  diariaTotal: number;
  crewCall: string | null;
  wrap: string | null;
  observacoes: string;
}

export async function salvarCabecalho(id: string, input: CabecalhoInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");

    const { error } = await supabase
      .from("ordens_do_dia")
      .update({
        projeto: input.projeto.trim(),
        cliente_id: input.clienteId,
        tipo: input.tipo.trim(),
        data: input.data || null,
        // `Math.max(1, ...)` porque "diária 0 de 0" não existe — e um campo
        // numérico vazio no navegador chega como NaN.
        diaria_numero: Math.max(1, Number(input.diariaNumero) || 1),
        diaria_total: Math.max(1, Number(input.diariaTotal) || 1),
        crew_call: input.crewCall || null,
        wrap: input.wrap || null,
        observacoes: input.observacoes,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    // Sem `revalidatePath` aqui de proposito: quem digitou JA esta vendo o
    // valor novo na tela. Revalidar obrigaria a pagina inteira a ser
    // remontada (mais de dez consultas) a cada campo que perde o foco — era
    // exatamente isso que deixava a folha lenta de digitar.
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function excluirOrdemDoDia(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from("ordens_do_dia").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath(ROTA);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Linhas (locações, cronograma, equipe)
// ----------------------------------------------------------------------------
// As três listas têm a MESMA forma — adicionar no fim, editar campos, apagar,
// reordenar — então compartilham três ações genéricas em vez de nove quase
// iguais. A tabela alvo nunca vem crua do cliente: ela é escolhida por uma
// chave fixa, senão bastaria mandar "profiles" no lugar e escrever onde não
// devia.

type ListaOrdemDia = "locacoes" | "cronograma" | "equipe";

const TABELA: Record<ListaOrdemDia, string> = {
  locacoes: "ordem_dia_locacoes",
  cronograma: "ordem_dia_cronograma",
  equipe: "ordem_dia_equipe",
};

/** Campos que cada lista aceita — mesma proteção: um campo fora desta lista é ignorado. */
const CAMPOS: Record<ListaOrdemDia, string[]> = {
  locacoes: ["nome", "endereco", "notas", "ordem"],
  cronograma: ["hora", "atividade", "local", "ordem"],
  equipe: ["membro_id", "funcao", "nome", "contato", "horario_chamada", "ordem"],
};

/**
 * Cria a linha e DEVOLVE ela pronta.
 *
 * Devolver a linha (em vez de só "deu certo") é o que permite a tela
 * acrescentá-la na lista sem recarregar a página: o `id` gerado pelo banco
 * vem junto, que era a única coisa que faltava do lado do navegador.
 */
export async function adicionarLinha(
  lista: ListaOrdemDia,
  ordemId: string,
  valores: Record<string, unknown> = {}
): Promise<{ ok: true; linha: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("producao");

    const { count } = await supabase
      .from(TABELA[lista])
      .select("id", { count: "exact", head: true })
      .eq("ordem_id", ordemId);

    const permitidos = Object.fromEntries(Object.entries(valores).filter(([chave]) => CAMPOS[lista].includes(chave)));

    const { data, error } = await supabase
      .from(TABELA[lista])
      .insert({ ordem_id: ordemId, ordem: count ?? 0, ...permitidos })
      .select("*")
      .single();

    if (error || !data) return { ok: false, error: error?.message ?? "Não foi possível adicionar a linha." };

    return { ok: true, linha: data as Record<string, unknown> };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function salvarLinha(
  lista: ListaOrdemDia,
  ordemId: string,
  linhaId: string,
  valores: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");

    const permitidos = Object.fromEntries(
      Object.entries(valores)
        .filter(([chave]) => CAMPOS[lista].includes(chave))
        // Campo de hora vazio precisa virar NULL: "" não é um `time` válido.
        .map(([chave, valor]) => [chave, valor === "" && (chave === "hora" || chave === "horario_chamada") ? null : valor])
    );
    if (Object.keys(permitidos).length === 0) return { ok: true };

    const { error } = await supabase.from(TABELA[lista]).update(permitidos).eq("id", linhaId).eq("ordem_id", ordemId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removerLinha(lista: ListaOrdemDia, ordemId: string, linhaId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireModulo("producao");
    const { error } = await supabase.from(TABELA[lista]).delete().eq("id", linhaId).eq("ordem_id", ordemId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Busca clima e sol da primeira locação com endereço preenchido e GUARDA o
 * resultado na folha.
 *
 * Guardar (em vez de buscar toda vez que a página abre) é o ponto: a ordem do
 * dia é um documento. Reabrir a de três meses atrás tem que mostrar a
 * previsão que a equipe leu naquele dia — e, de quebra, imprimir não depende
 * de a API estar no ar.
 */
export async function atualizarClima(ordemId: string): Promise<{ ok: true; clima: ClimaSalvo } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireModulo("producao");

    const { data: ordem } = await supabase
      .from("ordens_do_dia")
      .select("data")
      .eq("id", ordemId)
      .maybeSingle<{ data: string | null }>();

    if (!ordem?.data) return { ok: false, error: "Defina a data da diária antes de buscar a previsão." };

    const { data: locacoes } = await supabase
      .from("ordem_dia_locacoes")
      .select("id, endereco, latitude, longitude")
      .eq("ordem_id", ordemId)
      .order("ordem");

    const primeira = (locacoes ?? []).find((l) => (l.endereco ?? "").trim().length > 2);
    if (!primeira) return { ok: false, error: "Preencha o endereço de pelo menos uma locação." };

    let lat = primeira.latitude;
    let lon = primeira.longitude;

    if (lat == null || lon == null) {
      const coord = await geocodificar(primeira.endereco);
      if (!coord) return { ok: false, error: "Não encontrei esse endereço. Tente incluir a cidade." };
      lat = coord.latitude;
      lon = coord.longitude;
      await supabase.from("ordem_dia_locacoes").update({ latitude: lat, longitude: lon }).eq("id", primeira.id);
    }

    const previsao = await buscarPrevisao(lat, lon, ordem.data);
    if (!previsao) {
      return { ok: false, error: "Sem previsão para esta data — o serviço cobre cerca de 16 dias à frente." };
    }

    const salvo: ClimaSalvo = {
      clima_resumo: previsao.resumo,
      clima_max: previsao.max,
      clima_min: previsao.min,
      clima_chuva_mm: previsao.chuvaMm,
      nascer_do_sol: previsao.nascerDoSol,
      por_do_sol: previsao.porDoSol,
      clima_atualizado_em: new Date().toISOString(),
    };

    const { error } = await supabase.from("ordens_do_dia").update(salvo).eq("id", ordemId);

    if (error) return { ok: false, error: error.message };
    return { ok: true, clima: salvo };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
