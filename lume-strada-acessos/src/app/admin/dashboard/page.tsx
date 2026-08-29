import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import type { DashboardCardChave, ProfileRow } from "@/lib/types/database";
import type { TarefaRow } from "@/lib/types/producao";
import type { LeadRow } from "@/lib/types/comercial";
import type { StatusSessaoWhatsapp } from "@/lib/types/whatsapp";
import type { TarefaAgendaItem, LeadAgendaItem } from "@/lib/types/dashboard";
import { isTarefaAtrasada } from "@/lib/utils/producao";
import { leadEstaAberto, isFollowUpAtrasado } from "@/lib/utils/comercial";
import { hojeISO } from "@/lib/utils/dashboard";
import { limitesDoMes } from "@/lib/utils/financeiro";
import { somarRegistros, type RegistroParaSoma } from "@/lib/utils/trafego";
import { VisaoGeral } from "@/components/admin/dashboard/VisaoGeral";

export const dynamic = "force-dynamic";

type TarefaMin = Pick<TarefaRow, "id" | "titulo" | "cliente_id" | "status" | "prioridade" | "data_captacao" | "data_entrega">;
type LeadMin = Pick<LeadRow, "id" | "nome" | "status" | "proximo_contato_em" | "valor_estimado">;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Dashboard é o único módulo aberto a QUALQUER membro da equipe (admin ou
  // funcionário, mesmo sem nenhuma permissão extra — ver comentário em
  // `src/middleware.ts`). Produção e Comercial seguem esse mesmo espírito:
  // agenda/números operacionais básicos são visíveis a qualquer um da
  // equipe, sem checagem fina de módulo (igual sempre foi).
  //
  // Financeiro, Inventário, Tráfego e WhatsApp são diferentes: carregam
  // dado sensível (saldo, valor patrimonial, verba de anúncio, acesso a
  // conversa) — cada card só aparece pra quem tem aquele módulo liberado
  // (ou é admin), mesmo turnover a policy de RLS só checar "é da equipe?"
  // (a checagem fina de módulo é sempre da aplicação, não do banco — ver
  // `requireModulo`). Mesmo padrão já usado pro card de Saldo Consolidado.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const perfil = user ? await buscarPerfilComPermissoes(supabase, user.id) : null;
  const podeVerFinanceiro = perfil?.role === "admin" || perfil?.permissoes?.financeiro === true;
  const podeVerInventario = perfil?.role === "admin" || perfil?.permissoes?.inventario === true;
  const podeVerTrafego = perfil?.role === "admin" || perfil?.permissoes?.trafego === true;
  const podeVerWhatsapp = perfil?.role === "admin" || perfil?.permissoes?.whatsapp === true;

  // Além do módulo (segurança), cada funcionário pode ter cards individuais
  // escondidos por preferência do admin (`dashboard_config` — NUNCA é
  // segurança, só "o que aparece pra essa pessoa" — ver comentário em
  // `DashboardCardChave`). Admin sempre vê todos os cards que o módulo
  // permitir, independente de qualquer configuração salva.
  const dashboardConfig = perfil?.dashboard_config ?? {};
  function cardVisivel(chave: DashboardCardChave): boolean {
    if (perfil?.role === "admin") return true;
    return dashboardConfig[chave] !== false;
  }

  const hoje = hojeISO();
  const { inicio: inicioMes, fim: fimMes } = limitesDoMes(new Date());
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [tarefasRes, clientesRes, leadsRes, versoesRes, contasRes, transacoesMesRes, contasVencidasRes, itensInventarioRes] =
    await Promise.all([
      supabase
        .from("prod_tarefas")
        .select("id, titulo, cliente_id, status, prioridade, data_captacao, data_entrega")
        .overrideTypes<TarefaMin[], { merge: false }>(),
      supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("role", "cliente")
        .overrideTypes<Pick<ProfileRow, "id" | "email" | "full_name">[], { merge: false }>(),
      supabase.from("crm_leads").select("id, nome, status, proximo_contato_em, valor_estimado").overrideTypes<LeadMin[], { merge: false }>(),
      // Entregas aguardando aprovação do cliente — mesmo espírito operacional
      // de "tarefas atrasadas", não é dado sensível, então não é gated.
      supabase.from("prod_entrega_versoes").select("id", { count: "exact", head: true }).eq("status_aprovacao", "pendente"),
      podeVerFinanceiro
        ? supabase
            .from("fin_contas_saldo")
            .select("saldo_atual")
            .eq("contexto", "profissional") // saldo "pessoal" nunca entra no card da equipe, mesmo pra quem pode ver Financeiro
            .overrideTypes<{ saldo_atual: number }[], { merge: false }>()
        : Promise.resolve({ data: null as { saldo_atual: number }[] | null }),
      podeVerFinanceiro
        ? supabase
            .from("fin_transacoes")
            .select("tipo, valor")
            .eq("contexto", "profissional")
            .in("tipo", ["receita", "despesa"])
            .gte("data_vencimento", inicioMes)
            .lte("data_vencimento", fimMes)
            .overrideTypes<{ tipo: "receita" | "despesa"; valor: number }[], { merge: false }>()
        : Promise.resolve({ data: null as { tipo: "receita" | "despesa"; valor: number }[] | null }),
      podeVerFinanceiro
        ? supabase
            .from("fin_transacoes")
            .select("id", { count: "exact", head: true })
            .eq("contexto", "profissional")
            .eq("pago", false)
            .lt("data_vencimento", hoje)
        : Promise.resolve({ count: null as number | null }),
      podeVerInventario
        ? supabase.from("itens_inventario").select("status").overrideTypes<{ status: string }[], { merge: false }>()
        : Promise.resolve({ data: null as { status: string }[] | null }),
    ]);

  const tarefas = tarefasRes.data ?? [];
  const clientes = clientesRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const contas = contasRes.data;

  // Tráfego e WhatsApp dependem do resultado de queries anteriores (ids de
  // cliente / metas do dia) — rodam depois, só quando o usuário tem o
  // módulo liberado (evita query desnecessária pra quem nunca vai ver o card).
  const clienteIds = clientes.map((c) => c.id);

  const [metasHojeRes, sessaoRes] = await Promise.all([
    podeVerTrafego && clienteIds.length > 0
      ? supabase
          .from("metas_diarias")
          .select("id")
          .eq("data", hoje)
          .in("cliente_id", clienteIds)
          .overrideTypes<{ id: string }[], { merge: false }>()
      : Promise.resolve({ data: null as { id: string }[] | null }),
    podeVerWhatsapp
      ? // Sem `.eq("singleton", ...)`: essa coluna não existe mais desde a
        // migração multi-tenant (`whatsapp_sessoes` virou 1 linha por
        // empresa) — RLS já restringe à sessão da própria empresa.
        supabase
          .from("whatsapp_sessoes")
          .select("status")
          .maybeSingle()
          .overrideTypes<{ status: StatusSessaoWhatsapp } | null, { merge: false }>()
      : Promise.resolve({ data: null as { status: StatusSessaoWhatsapp } | null }),
  ]);

  const metaIds = (metasHojeRes.data ?? []).map((m) => m.id);

  const [registrosHojeRes, conversasHojeRes] = await Promise.all([
    podeVerTrafego && metaIds.length > 0
      ? supabase
          .from("trafego_registros")
          .select("valor_investido, tipo_resultado, quantidade_resultado, cliques, visualizacoes")
          .in("meta_id", metaIds)
          .overrideTypes<RegistroParaSoma[], { merge: false }>()
      : Promise.resolve({ data: null as RegistroParaSoma[] | null }),
    podeVerWhatsapp
      ? supabase
          .from("whatsapp_contatos")
          .select("id", { count: "exact", head: true })
          .gte("ultima_mensagem_em", `${hoje}T00:00:00`)
          .lt("ultima_mensagem_em", `${amanha}T00:00:00`)
      : Promise.resolve({ count: null as number | null }),
  ]);

  const nomeCliente = new Map(clientes.map((c) => [c.id, c.full_name || c.email]));

  const tarefasAgenda: TarefaAgendaItem[] = tarefas.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    cliente_nome: t.cliente_id ? (nomeCliente.get(t.cliente_id) ?? null) : null,
    status: t.status,
    data_captacao: t.data_captacao,
    data_entrega: t.data_entrega,
  }));

  const leadsAgenda: LeadAgendaItem[] = leads.map((l) => ({
    id: l.id,
    nome: l.nome,
    status: l.status,
    proximo_contato_em: l.proximo_contato_em,
  }));

  const captacoesHoje = tarefasAgenda.filter((t) => t.data_captacao === hoje);
  const entregasHoje = tarefasAgenda.filter((t) => t.data_entrega === hoje);
  const followUpsHoje = leadsAgenda.filter((l) => l.proximo_contato_em === hoje && leadEstaAberto(l));

  const tarefasAtrasadas = tarefas.filter(isTarefaAtrasada).length;
  const leadsEmAberto = leads.filter(leadEstaAberto).length;
  const followUpsAtrasados = leads.filter(isFollowUpAtrasado).length;
  const valorPropostasAbertas = leads.filter(leadEstaAberto).reduce((soma, l) => soma + (l.valor_estimado ?? 0), 0);
  const entregasAguardandoAprovacao = versoesRes.count ?? 0;

  const saldoConsolidado = contas ? contas.reduce((soma, c) => soma + (c.saldo_atual ?? 0), 0) : null;

  const transacoesMes = transacoesMesRes.data;
  const financeiroDoMes = transacoesMes
    ? {
        receitas: transacoesMes.filter((t) => t.tipo === "receita").reduce((soma, t) => soma + t.valor, 0),
        despesas: transacoesMes.filter((t) => t.tipo === "despesa").reduce((soma, t) => soma + t.valor, 0),
      }
    : null;
  const contasVencidas = podeVerFinanceiro ? (contasVencidasRes.count ?? 0) : null;

  const itensInventario = itensInventarioRes.data;
  const resumoInventario = itensInventario
    ? {
        manutencao: itensInventario.filter((i) => i.status === "manutencao").length,
        emprestados: itensInventario.filter((i) => i.status === "emprestado").length,
      }
    : null;

  const registrosTrafegoHoje = registrosHojeRes.data;
  const resumoTrafegoHoje = podeVerTrafego ? somarRegistros(registrosTrafegoHoje ?? []) : null;

  const whatsapp = podeVerWhatsapp
    ? {
        status: sessaoRes.data?.status ?? null,
        conversasHoje: conversasHojeRes.count ?? 0,
      }
    : null;

  return (
    <VisaoGeral
      captacoesHoje={cardVisivel("captacoesHoje") ? captacoesHoje.length : null}
      entregasHoje={cardVisivel("entregasHoje") ? entregasHoje.length : null}
      tarefasAtrasadas={cardVisivel("tarefasAtrasadas") ? tarefasAtrasadas : null}
      entregasAguardandoAprovacao={cardVisivel("entregasAguardandoAprovacao") ? entregasAguardandoAprovacao : null}
      leadsEmAberto={cardVisivel("leadsEmAberto") ? leadsEmAberto : null}
      followUpsAtrasados={cardVisivel("followUpsAtrasados") ? followUpsAtrasados : null}
      valorPropostasAbertas={cardVisivel("valorPropostasAbertas") ? valorPropostasAbertas : null}
      saldoConsolidado={cardVisivel("saldoConsolidado") ? saldoConsolidado : null}
      contasVencidas={cardVisivel("contasVencidas") ? contasVencidas : null}
      financeiroDoMes={cardVisivel("financeiroDoMes") ? financeiroDoMes : null}
      resumoInventario={cardVisivel("resumoInventario") ? resumoInventario : null}
      resumoTrafegoHoje={cardVisivel("resumoTrafegoHoje") ? resumoTrafegoHoje : null}
      whatsapp={cardVisivel("whatsapp") ? whatsapp : null}
      agendaHoje={cardVisivel("agendaDoDia") ? { captacoes: captacoesHoje, entregas: entregasHoje, followUps: followUpsHoje } : null}
    />
  );
}
