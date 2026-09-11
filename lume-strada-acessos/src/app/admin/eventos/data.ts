import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { EventoRow, EventoComResumo } from "@/lib/types/eventos";

/**
 * A lista de eventos, com o resumo que a tela mostra sem precisar abrir cada um.
 *
 * Quatro consultas e a junção em memória, em vez de uma view com subquery por
 * linha: são quatro tabelas pequenas (ambientes, equipe e pauta de um punhado
 * de eventos), o Postgres devolve tudo de uma vez, e o agrupamento aqui custa
 * menos do que uma consulta que o banco tem que replanejar a cada abertura da
 * tela. É o mesmo padrão de `portal/data.ts`.
 *
 * O número que a lista existe para mostrar é `capturas_perdidas`: pendentes
 * cuja janela já fechou. É o único que não dá para consertar depois.
 */
export async function listarEventos(): Promise<EventoComResumo[]> {
  const supabase = await createClient();

  const { data: eventos } = await supabase
    .from("ev_eventos")
    .select("*, clientes(nome)")
    .order("inicio", { ascending: false })
    .limit(100)
    .overrideTypes<(EventoRow & { clientes: { nome: string } | null })[], { merge: false }>();

  const lista = eventos ?? [];
  if (lista.length === 0) return [];

  const ids = lista.map((e) => e.id);
  const agora = new Date().toISOString();

  const [{ data: ambientes }, { data: equipe }, { data: capturas }] = await Promise.all([
    supabase.from("ev_ambientes").select("evento_id").in("evento_id", ids).overrideTypes<{ evento_id: string }[], { merge: false }>(),
    supabase
      .from("ev_equipe")
      .select("evento_id")
      .in("evento_id", ids)
      .eq("ativo", true)
      .overrideTypes<{ evento_id: string }[], { merge: false }>(),
    supabase
      .from("ev_capturas")
      .select("evento_id, status, janela_fim")
      .in("evento_id", ids)
      .overrideTypes<{ evento_id: string; status: string; janela_fim: string | null }[], { merge: false }>(),
  ]);

  const conta = (linhas: { evento_id: string }[] | null) => {
    const mapa = new Map<string, number>();
    for (const l of linhas ?? []) mapa.set(l.evento_id, (mapa.get(l.evento_id) ?? 0) + 1);
    return mapa;
  };

  const porAmbiente = conta(ambientes);
  const porEquipe = conta(equipe);

  const capturasPorEvento = new Map<string, { total: number; captadas: number; perdidas: number }>();
  for (const c of capturas ?? []) {
    const atual = capturasPorEvento.get(c.evento_id) ?? { total: 0, captadas: 0, perdidas: 0 };
    atual.total += 1;
    if (c.status === "captado") atual.captadas += 1;
    // "Perdido" é conclusão do relógio, não coluna no banco — ver
    // `estadoDaCaptura` em `lib/types/eventos.ts`.
    else if (c.status === "pendente" && c.janela_fim && c.janela_fim < agora) atual.perdidas += 1;
    capturasPorEvento.set(c.evento_id, atual);
  }

  return lista.map((e) => {
    const cap = capturasPorEvento.get(e.id) ?? { total: 0, captadas: 0, perdidas: 0 };
    const { clientes, ...evento } = e;
    return {
      ...evento,
      cliente_nome: clientes?.nome ?? null,
      ambientes: porAmbiente.get(e.id) ?? 0,
      equipe: porEquipe.get(e.id) ?? 0,
      capturas_total: cap.total,
      capturas_captadas: cap.captadas,
      capturas_perdidas: cap.perdidas,
    };
  });
}

/** Os clientes que o formulário de evento oferece — o mesmo cadastro de sempre. */
export async function listarClientesParaEvento(): Promise<{ id: string; nome: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("id, nome")
    .order("nome")
    .overrideTypes<{ id: string; nome: string }[], { merge: false }>();
  return data ?? [];
}
