"use server";

import { requireModulo } from "@/lib/auth/requireAdmin";
import { STATUS_LEAD_META } from "@/lib/utils/comercial";
import { isTarefaAtrasada } from "@/lib/utils/producao";
import { PALETA_CATEGORIAS } from "@/lib/utils/financeiro";
import type { StatusLead } from "@/lib/types/comercial";
import type { StatusTarefa } from "@/lib/types/producao";
import type {
  RelatorioComercialData,
  RelatorioFinanceiroData,
  RelatorioInventarioData,
  RelatorioProducaoData,
  RelatorioTrafegoData,
} from "@/lib/types/relatorios";

export type RelatorioResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Todos os dias ISO entre `inicio` e `fim` (inclusive) — usado pra preencher com zero os dias sem lançamento, senão o gráfico de linha "pula" no eixo X em vez de mostrar o vale. */
function todosOsDiasEntre(inicio: string, fim: string): string[] {
  const dias: string[] = [];
  let atual = inicio;
  let guard = 0;
  while (atual <= fim && guard < 3660) {
    dias.push(atual);
    const d = new Date(`${atual}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    atual = d.toISOString().slice(0, 10);
    guard++;
  }
  return dias;
}

function diasEntre(isoA: string, isoB: string): number {
  const a = new Date(`${isoA}T00:00:00Z`).getTime();
  const b = new Date(`${isoB}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

// ----------------------------------------------------------------------------
// Financeiro — Fluxo de Caixa (série diária), Despesas por Categoria e DRE
// Simplificado (receitas - despesas). Mesmo recorte de `contexto` do card
// "Financeiro do Mês" do Dashboard: só `profissional` entra num relatório
// pensado pra dado da agência, nunca mistura com lançamento pessoal do admin.
// ----------------------------------------------------------------------------
export async function buscarRelatorioFinanceiro(dataInicio: string, dataFim: string): Promise<RelatorioResult<RelatorioFinanceiroData>> {
  try {
    const { supabase } = await requireModulo("financeiro");

    const [transacoesRes, categoriasRes] = await Promise.all([
      supabase
        .from("fin_transacoes")
        .select("tipo, valor, data_vencimento, categoria_id")
        .eq("contexto", "profissional")
        .in("tipo", ["receita", "despesa"])
        .gte("data_vencimento", dataInicio)
        .lte("data_vencimento", dataFim)
        .overrideTypes<{ tipo: "receita" | "despesa"; valor: number; data_vencimento: string; categoria_id: string | null }[], { merge: false }>(),
      supabase.from("fin_categorias").select("id, nome, cor, emoji").overrideTypes<{ id: string; nome: string; cor: string | null; emoji: string | null }[], { merge: false }>(),
    ]);

    if (transacoesRes.error) return { ok: false, error: transacoesRes.error.message };

    const transacoes = transacoesRes.data ?? [];
    const categorias = categoriasRes.data ?? [];
    const nomeCategoria = new Map(categorias.map((c) => [c.id, c]));

    const porDia = new Map<string, { receitas: number; despesas: number }>();
    for (const dia of todosOsDiasEntre(dataInicio, dataFim)) porDia.set(dia, { receitas: 0, despesas: 0 });
    for (const t of transacoes) {
      const bucket = porDia.get(t.data_vencimento);
      if (!bucket) continue; // fora do range por algum fuso de borda — ignora em vez de quebrar o gráfico
      if (t.tipo === "receita") bucket.receitas += t.valor;
      else bucket.despesas += t.valor;
    }

    const porCategoriaMap = new Map<string, number>();
    for (const t of transacoes) {
      if (t.tipo !== "despesa") continue;
      const chave = t.categoria_id ?? "sem-categoria";
      porCategoriaMap.set(chave, (porCategoriaMap.get(chave) ?? 0) + t.valor);
    }

    const porCategoria = Array.from(porCategoriaMap.entries())
      .map(([categoriaId, valor], i) => {
        const cat = nomeCategoria.get(categoriaId);
        return {
          nome: cat ? cat.nome : "Sem categoria",
          valor,
          // Cor cadastrada na categoria (`fin_categorias.cor`, já validada —
          // ver `financeiro-categorias.sql`); "Sem categoria" e categorias
          // sem cor própria caem na paleta categórica fixa, ciclando pela
          // posição no ranking (nunca uma cor inventada na hora).
          cor: cat?.cor ?? PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length]!,
          emoji: cat?.emoji ?? null,
        };
      })
      .sort((a, b) => b.valor - a.valor);

    const totalReceitas = transacoes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
    const totalDespesas = transacoes.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);

    return {
      ok: true,
      data: {
        serieDiaria: Array.from(porDia.entries())
          .map(([data, v]) => ({ data, ...v }))
          .sort((a, b) => a.data.localeCompare(b.data)),
        porCategoria,
        totalReceitas,
        totalDespesas,
        resultado: totalReceitas - totalDespesas,
        qtdTransacoes: transacoes.length,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Comercial & CRM — funil de leads criados no período, taxa de conversão e
// tempo médio de fechamento (dos que fecharam DENTRO do período).
// ----------------------------------------------------------------------------
export async function buscarRelatorioComercial(dataInicio: string, dataFim: string): Promise<RelatorioResult<RelatorioComercialData>> {
  try {
    const { supabase } = await requireModulo("comercial");

    const fimExclusivo = `${dataFim}T23:59:59.999`;
    const { data, error } = await supabase
      .from("crm_leads")
      .select("id, status, valor_estimado, created_at, convertido_em")
      .gte("created_at", `${dataInicio}T00:00:00`)
      .lte("created_at", fimExclusivo)
      .overrideTypes<{ id: string; status: StatusLead; valor_estimado: number | null; created_at: string; convertido_em: string | null }[], { merge: false }>();

    if (error) return { ok: false, error: error.message };

    const leads = data ?? [];
    const contagem = new Map<StatusLead, number>();
    for (const l of leads) contagem.set(l.status, (contagem.get(l.status) ?? 0) + 1);

    const funil = (Object.keys(STATUS_LEAD_META) as StatusLead[]).map((status) => ({
      status,
      label: STATUS_LEAD_META[status].label,
      total: contagem.get(status) ?? 0,
    }));

    const fechados = leads.filter((l) => l.status === "fechado_ganha");
    const perdidos = leads.filter((l) => l.status === "perdido");
    const taxaConversao = fechados.length + perdidos.length > 0 ? fechados.length / (fechados.length + perdidos.length) : null;

    const fechadosComTempo = fechados.filter((l) => l.convertido_em);
    const tempoMedioFechamentoDias =
      fechadosComTempo.length > 0
        ? fechadosComTempo.reduce((soma, l) => soma + diasEntre(l.created_at.slice(0, 10), l.convertido_em!.slice(0, 10)), 0) /
          fechadosComTempo.length
        : null;

    const valorFechadoNoPeriodo = fechados.reduce((soma, l) => soma + (l.valor_estimado ?? 0), 0);

    return {
      ok: true,
      data: {
        funil,
        totalLeadsNoPeriodo: leads.length,
        fechados: fechados.length,
        perdidos: perdidos.length,
        taxaConversao,
        tempoMedioFechamentoDias,
        valorFechadoNoPeriodo,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Produção & Tarefas — produtividade por funcionário (concluídas no
// período) e gargalos. "Atrasadas" é sempre o estado ATUAL (mesma definição
// de `isTarefaAtrasada`/card do Dashboard) — um gargalo é operacional, faz
// sentido "agora", não teria leitura útil filtrado por um período passado.
// ----------------------------------------------------------------------------
export async function buscarRelatorioProducao(dataInicio: string, dataFim: string): Promise<RelatorioResult<RelatorioProducaoData>> {
  try {
    const { supabase } = await requireModulo("producao");

    const [tarefasRes, funcionariosRes] = await Promise.all([
      supabase
        .from("prod_tarefas")
        .select("id, status, responsavel_id, data_entrega, created_at, updated_at")
        .overrideTypes<
          { id: string; status: StatusTarefa; responsavel_id: string | null; data_entrega: string | null; created_at: string; updated_at: string }[],
          { merge: false }
        >(),
      supabase.from("prod_funcionarios").select("id, nome").overrideTypes<{ id: string; nome: string }[], { merge: false }>(),
    ]);

    if (tarefasRes.error) return { ok: false, error: tarefasRes.error.message };

    const tarefas = tarefasRes.data ?? [];
    const funcionarios = funcionariosRes.data ?? [];
    const nomeFuncionario = new Map(funcionarios.map((f) => [f.id, f.nome]));

    const fimExclusivo = `${dataFim}T23:59:59.999`;
    const concluidasNoPeriodo = tarefas.filter(
      (t) => t.status === "concluida" && t.updated_at >= `${dataInicio}T00:00:00` && t.updated_at <= fimExclusivo
    );
    const criadasNoPeriodo = tarefas.filter((t) => t.created_at >= `${dataInicio}T00:00:00` && t.created_at <= fimExclusivo);

    const porFuncionario = new Map<string, number>();
    for (const t of concluidasNoPeriodo) {
      const chave = t.responsavel_id ?? "sem-responsavel";
      porFuncionario.set(chave, (porFuncionario.get(chave) ?? 0) + 1);
    }

    const produtividade = Array.from(porFuncionario.entries())
      .map(([funcionarioId, concluidas]) => ({
        funcionarioId,
        nome: funcionarioId === "sem-responsavel" ? "Sem responsável" : (nomeFuncionario.get(funcionarioId) ?? "Funcionário removido"),
        concluidas,
      }))
      .sort((a, b) => b.concluidas - a.concluidas);

    const tarefasAtrasadas = tarefas.filter((t) => isTarefaAtrasada({ data_entrega: t.data_entrega, status: t.status })).length;

    const comTempo = concluidasNoPeriodo.filter((t) => t.created_at);
    const tempoMedioConclusaoDias =
      comTempo.length > 0
        ? comTempo.reduce((soma, t) => soma + diasEntre(t.created_at.slice(0, 10), t.updated_at.slice(0, 10)), 0) / comTempo.length
        : null;

    return {
      ok: true,
      data: {
        produtividade,
        tarefasCriadasNoPeriodo: criadasNoPeriodo.length,
        tarefasConcluidasNoPeriodo: concluidasNoPeriodo.length,
        tarefasAtrasadas,
        tempoMedioConclusaoDias,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Tráfego & Metas — ROI/ROAS/Lucro Líquido vs Reembolsos vêm do tracking de
// Info-Produtos (`anuncios_tracking`/`fechamentos_semanais`), porque é a
// ÚNICA fonte do módulo que registra RECEITA (o fluxo por-cliente,
// `metas_diarias`/`trafego_registros`, só tem investimento + leads — sem
// receita não dá pra calcular ROI/ROAS de verdade). O investimento por
// cliente entra como um segundo bloco do mesmo relatório, complementando.
// ----------------------------------------------------------------------------
export async function buscarRelatorioTrafego(dataInicio: string, dataFim: string): Promise<RelatorioResult<RelatorioTrafegoData>> {
  try {
    const { supabase } = await requireModulo("trafego");

    const [anunciosRes, fechamentosRes, clientesRes] = await Promise.all([
      supabase
        .from("anuncios_tracking")
        .select("data, investimento, receita_bruta")
        .gte("data", dataInicio)
        .lte("data", dataFim)
        .overrideTypes<{ data: string; investimento: number; receita_bruta: number }[], { merge: false }>(),
      supabase
        .from("fechamentos_semanais")
        .select("semana_inicio, semana_fim, reembolsos, lucro_liquido_real")
        .gte("semana_inicio", dataInicio)
        .lte("semana_fim", dataFim)
        .order("semana_inicio", { ascending: true })
        .overrideTypes<{ semana_inicio: string; semana_fim: string; reembolsos: number; lucro_liquido_real: number }[], { merge: false }>(),
      supabase.from("profiles").select("id, full_name, email").eq("role", "cliente").overrideTypes<
        { id: string; full_name: string | null; email: string }[],
        { merge: false }
      >(),
    ]);

    if (anunciosRes.error) return { ok: false, error: anunciosRes.error.message };

    const anuncios = anunciosRes.data ?? [];
    const fechamentos = fechamentosRes.data ?? [];
    const clientes = clientesRes.data ?? [];
    const nomeCliente = new Map(clientes.map((c) => [c.id, c.full_name || c.email]));

    const porDia = new Map<string, { investimento: number; receitaBruta: number }>();
    for (const dia of todosOsDiasEntre(dataInicio, dataFim)) porDia.set(dia, { investimento: 0, receitaBruta: 0 });
    for (const a of anuncios) {
      const bucket = porDia.get(a.data);
      if (!bucket) continue;
      bucket.investimento += a.investimento;
      bucket.receitaBruta += a.receita_bruta;
    }

    const totalInvestimento = anuncios.reduce((s, a) => s + a.investimento, 0);
    const totalReceitaBruta = anuncios.reduce((s, a) => s + a.receita_bruta, 0);
    const totalReembolsos = fechamentos.reduce((s, f) => s + f.reembolsos, 0);

    // Clientes do fluxo por-cliente — busca metas + registros do período em
    // duas idas só (metas primeiro, registros depois, filtrando pelos ids
    // das metas encontradas), mesmo padrão de duas idas usado no Dashboard.
    const clienteIds = clientes.map((c) => c.id);
    const { data: metas } = clienteIds.length
      ? await supabase
          .from("metas_diarias")
          .select("id, cliente_id")
          .gte("data", dataInicio)
          .lte("data", dataFim)
          .in("cliente_id", clienteIds)
          .overrideTypes<{ id: string; cliente_id: string }[], { merge: false }>()
      : { data: [] as { id: string; cliente_id: string }[] };

    const clientePorMeta = new Map((metas ?? []).map((m) => [m.id, m.cliente_id]));
    const metaIds = (metas ?? []).map((m) => m.id);

    const { data: registros } = metaIds.length
      ? await supabase
          .from("trafego_registros")
          .select("meta_id, valor_investido, leads_gerados")
          .in("meta_id", metaIds)
          .overrideTypes<{ meta_id: string; valor_investido: number; leads_gerados: number }[], { merge: false }>()
      : { data: [] as { meta_id: string; valor_investido: number; leads_gerados: number }[] };

    const porCliente = new Map<string, { investido: number; leads: number }>();
    for (const r of registros ?? []) {
      const clienteId = clientePorMeta.get(r.meta_id);
      if (!clienteId) continue;
      const atual = porCliente.get(clienteId) ?? { investido: 0, leads: 0 };
      atual.investido += r.valor_investido;
      atual.leads += r.leads_gerados;
      porCliente.set(clienteId, atual);
    }

    const investimentoPorCliente = Array.from(porCliente.entries())
      .map(([clienteId, v]) => ({ clienteId, nome: nomeCliente.get(clienteId) ?? "Cliente removido", ...v }))
      .sort((a, b) => b.investido - a.investido);

    return {
      ok: true,
      data: {
        serieDiaria: Array.from(porDia.entries())
          .map(([data, v]) => ({ data, ...v }))
          .sort((a, b) => a.data.localeCompare(b.data)),
        totalInvestimento,
        totalReceitaBruta,
        roas: totalInvestimento > 0 ? totalReceitaBruta / totalInvestimento : null,
        roi: totalInvestimento > 0 ? (totalReceitaBruta - totalInvestimento) / totalInvestimento : null,
        totalReembolsos,
        lucroLiquido: totalReceitaBruta - totalInvestimento - totalReembolsos,
        fechamentosNoPeriodo: fechamentos.map((f) => ({
          semanaInicio: f.semana_inicio,
          semanaFim: f.semana_fim,
          lucroLiquidoReal: f.lucro_liquido_real,
          reembolsos: f.reembolsos,
        })),
        investimentoPorCliente,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ----------------------------------------------------------------------------
// Inventário — Depreciação do Patrimônio. É sempre uma FOTO do agora (mesma
// lógica de `/admin/inventario/dashboard`), não filtra por período — bem de
// patrimônio não "acontece" numa data, o valor atual É o valor de hoje.
// ----------------------------------------------------------------------------
export async function buscarRelatorioInventario(): Promise<RelatorioResult<RelatorioInventarioData>> {
  try {
    const { supabase } = await requireModulo("inventario");

    const { data, error } = await supabase
      .from("itens_inventario")
      .select("id, categoria_id, status, valor_pago, valor_atual, categorias_inventario(nome)")
      .overrideTypes<
        { id: string; categoria_id: string; status: string; valor_pago: number | null; valor_atual: number | null; categorias_inventario: { nome: string } | null }[],
        { merge: false }
      >();

    if (error) return { ok: false, error: error.message };

    const itens = data ?? [];
    const ativos = itens.filter((i) => i.status === "ativo");
    const comDados = ativos.filter((i) => i.valor_pago != null && i.valor_atual != null);

    const totalInvestido = comDados.reduce((s, i) => s + (i.valor_pago ?? 0), 0);
    const patrimonioAtual = comDados.reduce((s, i) => s + (i.valor_atual ?? 0), 0);
    const depreciacaoTotal = totalInvestido - patrimonioAtual;

    const porCategoria = new Map<string, { nome: string; valor: number }>();
    for (const item of comDados) {
      const nome = item.categorias_inventario?.nome ?? "Sem categoria";
      const atual = porCategoria.get(item.categoria_id);
      if (atual) atual.valor += item.valor_atual ?? 0;
      else porCategoria.set(item.categoria_id, { nome, valor: item.valor_atual ?? 0 });
    }

    return {
      ok: true,
      data: {
        totalInvestido,
        patrimonioAtual,
        depreciacaoTotal,
        percentualMedio: totalInvestido !== 0 ? depreciacaoTotal / totalInvestido : 0,
        itensConsiderados: comDados.length,
        distribuicao: Array.from(porCategoria.values())
          .map((c) => ({ categoriaNome: c.nome, valorAtual: c.valor }))
          .sort((a, b) => b.valorAtual - a.valorAtual),
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
