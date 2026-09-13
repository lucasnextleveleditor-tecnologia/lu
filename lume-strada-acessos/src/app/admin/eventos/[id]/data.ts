import "server-only";
import { notFound } from "next/navigation";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type {
  EventoRow,
  AmbienteRow,
  BlocoRow,
  EquipeEventoRow,
  CapturaRow,
  KitRow,
  OcorrenciaRow,
  RealtimeRow,
} from "@/lib/types/eventos";

/**
 * Tudo de um evento, numa leitura só.
 *
 * Sete consultas disparadas JUNTAS e montadas aqui, em vez de cada tela buscar
 * o seu pedaço: o evento inteiro cabe em poucas centenas de linhas (um evento
 * grande tem 4 ambientes, 30 blocos, 60 itens de pauta e 12 pessoas), e a tela
 * troca de modo o tempo todo — Plano, Ao Vivo e Fechamento leem o MESMO
 * conjunto. Buscar por modo faria a mesma leitura três vezes e deixaria a troca
 * de modo com a lentidão de uma navegação.
 *
 * Os cadastros da casa (clientes, equipe, inventário) vêm junto porque cada
 * painel oferece escolher de lá OU escrever à mão — e quem abre a gaveta não
 * pode esperar uma segunda ida ao banco para ver a lista.
 */

export interface MembroDaCasa {
  id: string;
  nome: string;
  cargo: string | null;
  valor_diaria: number | null;
}

export interface ItemDaCasa {
  id: string;
  nome: string;
  etiqueta: string | null;
}

export interface EventoCompleto {
  evento: EventoRow;
  ambientes: AmbienteRow[];
  blocos: BlocoRow[];
  equipe: EquipeEventoRow[];
  capturas: CapturaRow[];
  kit: KitRow[];
  ocorrencias: OcorrenciaRow[];
  realtime: RealtimeRow[];
  /** Cadastros da casa — atalho, nunca pedágio. */
  clientes: { id: string; nome: string }[];
  /** Vem com `valor_diaria`: escalar alguém já traz o cachê preenchido. */
  membros: MembroDaCasa[];
  inventario: ItemDaCasa[];
}

export async function buscarEvento(id: string): Promise<EventoCompleto> {
  const { supabase } = await requireModuloOuRedirect("eventos");

  const { data: evento } = await supabase
    .from("ev_eventos")
    .select("*")
    .eq("id", id)
    .maybeSingle<EventoRow>();

  // Sem linha aqui são dois casos — id que não existe, e evento de outra
  // empresa que a RLS escondeu. Os dois devolvem a mesma coisa de propósito:
  // um 404 diferente do outro contaria a quem tentou que o evento existe.
  if (!evento) notFound();

  const [ambientes, blocos, equipe, capturas, kit, ocorrencias, realtime, clientes, membros, inventario] =
    await Promise.all([
      supabase.from("ev_ambientes").select("*").eq("evento_id", id).order("ordem").overrideTypes<AmbienteRow[], { merge: false }>(),
      supabase.from("ev_blocos").select("*").eq("evento_id", id).order("inicio").overrideTypes<BlocoRow[], { merge: false }>(),
      supabase.from("ev_equipe").select("*").eq("evento_id", id).order("nome").overrideTypes<EquipeEventoRow[], { merge: false }>(),
      supabase.from("ev_capturas").select("*").eq("evento_id", id).order("ordem").overrideTypes<CapturaRow[], { merge: false }>(),
      supabase.from("ev_kit").select("*").eq("evento_id", id).order("ordem").overrideTypes<KitRow[], { merge: false }>(),
      supabase
        .from("ev_ocorrencias")
        .select("*")
        .eq("evento_id", id)
        .order("created_at", { ascending: false })
        .limit(200)
        .overrideTypes<OcorrenciaRow[], { merge: false }>(),
      supabase
        .from("ev_realtime")
        .select("*")
        .eq("evento_id", id)
        .order("created_at", { ascending: false })
        .overrideTypes<RealtimeRow[], { merge: false }>(),
      supabase.from("clientes").select("id, nome").order("nome").overrideTypes<{ id: string; nome: string }[], { merge: false }>(),
      // `valor_diaria` vem junto: escalar alguém do cadastro já preenche o
      // cachê do dia, que é a única conta do evento que ninguém gosta de
      // refazer.
      supabase
        .from("equipe_membros")
        .select("id, nome, cargo, valor_diaria")
        .order("nome")
        .overrideTypes<MembroDaCasa[], { merge: false }>(),
      // A coluna do inventário é `nome_item`; aqui ela vira `nome` porque toda
      // a tela de Eventos fala "nome".
      supabase
        .from("itens_inventario")
        .select("id, nome_item, codigo_etiqueta")
        .order("nome_item")
        .limit(300)
        .overrideTypes<{ id: string; nome_item: string; codigo_etiqueta: string | null }[], { merge: false }>(),
    ]);

  return {
    evento,
    ambientes: ambientes.data ?? [],
    blocos: blocos.data ?? [],
    equipe: equipe.data ?? [],
    capturas: capturas.data ?? [],
    kit: kit.data ?? [],
    ocorrencias: ocorrencias.data ?? [],
    realtime: realtime.data ?? [],
    clientes: clientes.data ?? [],
    membros: membros.data ?? [],
    inventario: (inventario.data ?? []).map((i) => ({ id: i.id, nome: i.nome_item, etiqueta: i.codigo_etiqueta })),
  };
}
