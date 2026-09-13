"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { PAUTA_PADRAO, FOLGA_DO_BOOM_MIN } from "@/lib/eventos/pautaPadrao";
import {
  aplicarAtraso,
  aplicarAtrasoDaAbertura,
  empurrarTambem,
  fimPelaDuracao,
  minutosDoPlay,
  type BlocoParaCascata,
  type Colisao,
} from "@/lib/eventos/cascata";
import type { AncoraBloco, BlocoRow, StatusCaptura, TipoBloco } from "@/lib/types/eventos";

/**
 * As ações de um evento.
 *
 * Duas regras que valem para o arquivo inteiro:
 *
 * 1. **Nada que mexe no relógio mexe só no relógio.** Mover um bloco move a
 *    pauta pendente dele e escreve no log. Um horário que muda sem deixar
 *    rastro é a planilha de novo, com outro nome.
 *
 * 2. **O sistema nunca resolve colisão sozinho.** `aplicarAtrasoNoBloco`
 *    devolve as colisões e para. Quem empurra a ativação do patrocinador é a
 *    pessoa, com um toque, em `empurrarBlocos`.
 */

const PATH = "/admin/eventos";

export type Resultado = { ok: true } | { ok: false; error: string };
export type ResultadoId = { ok: true; id: string } | { ok: false; error: string };
export type ResultadoAtraso = { ok: true; colisoes: Colisao[] } | { ok: false; error: string };
export type ResultadoContagem = { ok: true; quantos: number } | { ok: false; error: string };

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

function revalidar(eventoId: string) {
  revalidatePath(`${PATH}/${eventoId}`);
  revalidatePath(PATH);
}

const MINUTO = 60_000;
const somar = (iso: string, min: number) => new Date(new Date(iso).getTime() + min * MINUTO).toISOString();

/** O que a cascata precisa saber, tirado da linha do banco. */
function paraCascata(b: BlocoRow): BlocoParaCascata {
  return {
    id: b.id,
    ambiente_id: b.ambiente_id,
    titulo: b.titulo,
    tipo: b.tipo,
    ancora: b.ancora,
    inicio: b.inicio,
    fim: b.fim,
    ordem: b.ordem,
    responsavel_id: b.responsavel_id,
  };
}

// ----------------------------------------------------------------------------
// Blocos
// ----------------------------------------------------------------------------

export interface BlocoInput {
  ambienteId: string | null;
  titulo: string;
  tipo: TipoBloco;
  ancora: AncoraBloco;
  /** ISO. Para `encadeado`, a tela sugere o fim do bloco anterior. */
  inicio: string;
  /** Null para boom — instante não tem duração. */
  duracaoMin: number | null;
  responsavelId: string | null;
  observacoes: string | null;
}

/**
 * Cria o bloco E a pauta que o tipo dele pede.
 *
 * As duas coisas no mesmo passo porque é o que faz a tela valer a pena: um
 * bloco sem pauta é uma linha bonita que não cobra nada de ninguém no dia. A
 * pauta nasce do tipo (ver `pautaPadrao.ts`) e é editável — a pessoa apaga o
 * que não serve, que é muito mais rápido do que escrever o que serve.
 *
 * Se a pauta falhar, o bloco FICA. Perder a programação inteira porque quatro
 * linhas de sugestão não entraram seria trocar um problema pequeno por um
 * grande.
 */
export async function criarBloco(eventoId: string, input: BlocoInput): Promise<ResultadoId> {
  try {
    const { supabase } = await requireModulo("eventos");

    const titulo = input.titulo.trim();
    if (!titulo) return { ok: false, error: "BLOCO_SEM_TITULO" };
    if (!input.inicio) return { ok: false, error: "BLOCO_SEM_INICIO" };

    const ehBoom = input.tipo === "boom";
    const duracao = ehBoom ? null : input.duracaoMin && input.duracaoMin > 0 ? input.duracaoMin : 60;
    const fim = fimPelaDuracao(input.inicio, duracao);

    // Desempate estável dentro do ambiente: o próximo da fila.
    const { data: ultimo } = await supabase
      .from("ev_blocos")
      .select("ordem")
      .eq("evento_id", eventoId)
      .eq("ambiente_id", input.ambienteId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle<{ ordem: number }>();

    const { data, error } = await supabase
      .from("ev_blocos")
      .insert({
        evento_id: eventoId,
        ambiente_id: input.ambienteId,
        titulo,
        tipo: input.tipo,
        ancora: input.ancora,
        inicio: input.inicio,
        fim,
        duracao_min: duracao,
        responsavel_id: input.responsavelId,
        observacoes: input.observacoes?.trim() || null,
        ordem: (ultimo?.ordem ?? -1) + 1,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Erro desconhecido." };

    await semearPauta(supabase, eventoId, data.id, input);

    revalidar(eventoId);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** A pauta sugerida pelo tipo, já com a janela do bloco. Nunca derruba a criação. */
async function semearPauta(
  supabase: Awaited<ReturnType<typeof requireModulo>>["supabase"],
  eventoId: string,
  blocoId: string,
  input: BlocoInput
): Promise<void> {
  try {
    const modelo = PAUTA_PADRAO[input.tipo];
    if (!modelo?.length) return;

    const { dict } = await getDictionary();
    const titulos = dict.eventos.pautaPadrao;

    const ehBoom = input.tipo === "boom";
    const janelaInicio = ehBoom ? somar(input.inicio, -FOLGA_DO_BOOM_MIN) : input.inicio;
    const janelaFim = ehBoom
      ? somar(input.inicio, FOLGA_DO_BOOM_MIN)
      : fimPelaDuracao(input.inicio, input.duracaoMin && input.duracaoMin > 0 ? input.duracaoMin : 60);

    await supabase.from("ev_capturas").insert(
      modelo.map((item, i) => ({
        evento_id: eventoId,
        bloco_id: blocoId,
        ambiente_id: input.ambienteId,
        titulo: titulos[item.chave as keyof typeof titulos] ?? item.chave,
        categoria: item.categoria,
        precisa_foto: item.precisa_foto,
        precisa_video: item.precisa_video,
        obrigatorio: item.obrigatorio,
        janela_inicio: janelaInicio,
        janela_fim: janelaFim,
        responsavel_id: input.responsavelId,
        ordem: i,
      }))
    );
  } catch {
    // Silêncio de propósito: ver o comentário de `criarBloco`.
  }
}

export async function atualizarBloco(eventoId: string, blocoId: string, input: BlocoInput): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");

    const titulo = input.titulo.trim();
    if (!titulo) return { ok: false, error: "BLOCO_SEM_TITULO" };

    const ehBoom = input.tipo === "boom";
    const duracao = ehBoom ? null : input.duracaoMin && input.duracaoMin > 0 ? input.duracaoMin : 60;

    const { error } = await supabase
      .from("ev_blocos")
      .update({
        ambiente_id: input.ambienteId,
        titulo,
        tipo: input.tipo,
        ancora: input.ancora,
        inicio: input.inicio,
        fim: fimPelaDuracao(input.inicio, duracao),
        duracao_min: duracao,
        responsavel_id: input.responsavelId,
        observacoes: input.observacoes?.trim() || null,
      })
      .eq("id", blocoId);

    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Apaga o bloco. A pauta dele NÃO vai junto: `on delete set null` solta os itens, que continuam na lista sem âncora. Sumir com "foto do patrocinador" porque alguém apagou o bloco é a perda silenciosa que este módulo existe para evitar. */
export async function removerBloco(eventoId: string, blocoId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_blocos").delete().eq("id", blocoId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

// ----------------------------------------------------------------------------
// O atraso
// ----------------------------------------------------------------------------

/**
 * +15, +30, −15 no bloco. Move quem anda junto, move a pauta pendente, escreve
 * no log — e devolve as colisões sem tocar nelas.
 */
export async function aplicarAtrasoNoBloco(
  eventoId: string,
  blocoId: string,
  minutos: number
): Promise<ResultadoAtraso> {
  try {
    const { supabase, user } = await requireModulo("eventos");
    if (!minutos) return { ok: true, colisoes: [] };

    const { data: blocos } = await supabase
      .from("ev_blocos")
      .select("*")
      .eq("evento_id", eventoId)
      .overrideTypes<BlocoRow[], { merge: false }>();

    const lista = blocos ?? [];
    const alvo = lista.find((b) => b.id === blocoId);
    if (!alvo) return { ok: false, error: "BLOCO_NAO_ENCONTRADO" };

    const { deslocados, colisoes } = aplicarAtraso(lista.map(paraCascata), blocoId, minutos);
    await gravarDeslocamentos(supabase, lista, deslocados, minutos);

    const { dict } = await getDictionary();
    await supabase.from("ev_ocorrencias").insert({
      evento_id: eventoId,
      bloco_id: blocoId,
      ambiente_id: alvo.ambiente_id,
      tipo: "atraso",
      minutos,
      texto: dict.eventos.logAtraso
        .replace("{bloco}", alvo.titulo)
        .replace("{minutos}", String(Math.abs(minutos)))
        .replace("{n}", String(deslocados.length)),
      autor_profile_id: user.id,
    });

    revalidar(eventoId);
    return { ok: true, colisoes };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** "Empurro a Ativação B também?" — sim. Só acontece depois do toque na tela. */
export async function empurrarBlocos(eventoId: string, ids: string[], minutos: number): Promise<Resultado> {
  try {
    const { supabase, user } = await requireModulo("eventos");
    if (!ids.length || !minutos) return { ok: true };

    const { data: blocos } = await supabase
      .from("ev_blocos")
      .select("*")
      .eq("evento_id", eventoId)
      .overrideTypes<BlocoRow[], { merge: false }>();

    const lista = blocos ?? [];
    const deslocados = empurrarTambem(lista.map(paraCascata), ids, minutos);
    await gravarDeslocamentos(supabase, lista, deslocados, minutos);

    const { dict } = await getDictionary();
    const nomes = lista.filter((b) => ids.includes(b.id)).map((b) => b.titulo).join(", ");
    await supabase.from("ev_ocorrencias").insert({
      evento_id: eventoId,
      tipo: "atraso",
      minutos,
      texto: dict.eventos.logEmpurrado.replace("{blocos}", nomes).replace("{minutos}", String(Math.abs(minutos))),
      autor_profile_id: user.id,
    });

    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Escreve os horários novos, e leva junto a janela da pauta PENDENTE.
 *
 * Item já marcado ("captei" / "não rolou") fica com a hora que tem: aquilo
 * aconteceu de verdade, num minuto de verdade, e empurrar seria reescrever o
 * passado. É também o que mantém honesto o balanço do Fechamento.
 */
async function gravarDeslocamentos(
  supabase: Awaited<ReturnType<typeof requireModulo>>["supabase"],
  blocos: readonly BlocoRow[],
  deslocados: readonly { id: string; inicio: string; fim: string | null }[],
  minutos: number
): Promise<void> {
  if (!deslocados.length) return;

  const porId = new Map(blocos.map((b) => [b.id, b]));

  await Promise.all(
    deslocados.map((d) =>
      supabase
        .from("ev_blocos")
        .update({
          inicio: d.inicio,
          fim: d.fim,
          atraso_min: (porId.get(d.id)?.atraso_min ?? 0) + minutos,
        })
        .eq("id", d.id)
    )
  );

  const ids = deslocados.map((d) => d.id);
  const { data: capturas } = await supabase
    .from("ev_capturas")
    .select("id, bloco_id, janela_inicio, janela_fim")
    .in("bloco_id", ids)
    .eq("status", "pendente")
    .overrideTypes<{ id: string; bloco_id: string | null; janela_inicio: string | null; janela_fim: string | null }[], { merge: false }>();

  await Promise.all(
    (capturas ?? []).map((c) =>
      supabase
        .from("ev_capturas")
        .update({
          janela_inicio: c.janela_inicio ? somar(c.janela_inicio, minutos) : null,
          janela_fim: c.janela_fim ? somar(c.janela_fim, minutos) : null,
        })
        .eq("id", c.id)
    )
  );
}

// ----------------------------------------------------------------------------
// O play e o encerramento
// ----------------------------------------------------------------------------

/**
 * DAR O PLAY — trava a grade e liga o relógio.
 *
 * Marcado para 22h, play às 22h10: os 10 minutos entram em cascata em tudo que
 * é encadeado, e o que é hora cravada fica onde está. A partir daqui a linha
 * AGORA corre pelo relógio de verdade, e não pelo horário que estava no papel.
 */
export async function darPlay(eventoId: string): Promise<ResultadoAtraso> {
  try {
    const { supabase, user } = await requireModulo("eventos");

    const { data: evento } = await supabase
      .from("ev_eventos")
      .select("id, inicio, iniciado_em")
      .eq("id", eventoId)
      .maybeSingle<{ id: string; inicio: string; iniciado_em: string | null }>();

    if (!evento) return { ok: false, error: "EVENTO_NAO_ENCONTRADO" };
    // Play duas vezes não pode deslocar a grade duas vezes.
    if (evento.iniciado_em) return { ok: true, colisoes: [] };

    const agora = new Date().toISOString();
    const atraso = minutosDoPlay(evento.inicio, agora);

    const { data: blocos } = await supabase
      .from("ev_blocos")
      .select("*")
      .eq("evento_id", eventoId)
      .overrideTypes<BlocoRow[], { merge: false }>();

    const lista = blocos ?? [];
    const { deslocados, colisoes } = aplicarAtrasoDaAbertura(lista.map(paraCascata), atraso);
    await gravarDeslocamentos(supabase, lista, deslocados, atraso);

    await supabase.from("ev_eventos").update({ iniciado_em: agora, status: "ao_vivo" }).eq("id", eventoId);

    const { dict } = await getDictionary();
    await supabase.from("ev_ocorrencias").insert({
      evento_id: eventoId,
      tipo: "status",
      minutos: atraso,
      texto: atraso === 0 ? dict.eventos.logPlayNaHora : dict.eventos.logPlay.replace("{minutos}", String(Math.abs(atraso))),
      autor_profile_id: user.id,
    });

    revalidar(eventoId);
    return { ok: true, colisoes };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** ENCERRAR — a cobertura vira o balanço pronto. */
export async function encerrarEvento(eventoId: string): Promise<Resultado> {
  try {
    const { supabase, user } = await requireModulo("eventos");
    const agora = new Date().toISOString();

    const { error } = await supabase
      .from("ev_eventos")
      .update({ status: "pos", encerrado_em: agora })
      .eq("id", eventoId);
    if (error) return { ok: false, error: error.message };

    const { dict } = await getDictionary();
    await supabase.from("ev_ocorrencias").insert({
      evento_id: eventoId,
      tipo: "status",
      texto: dict.eventos.logEncerrado,
      autor_profile_id: user.id,
    });

    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

// ----------------------------------------------------------------------------
// Pauta e log
// ----------------------------------------------------------------------------

export async function marcarCaptura(
  eventoId: string,
  capturaId: string,
  status: StatusCaptura,
  motivo?: string | null
): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase
      .from("ev_capturas")
      .update({
        status,
        motivo: status === "nao_rolou" ? motivo?.trim() || null : null,
        marcado_em: status === "pendente" ? null : new Date().toISOString(),
      })
      .eq("id", capturaId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Ocorrência: dois toques, e fica no log com hora e autor. */
export async function registrarOcorrencia(
  eventoId: string,
  texto: string,
  blocoId: string | null
): Promise<Resultado> {
  try {
    const { supabase, user } = await requireModulo("eventos");
    const limpo = texto.trim();
    if (!limpo) return { ok: false, error: "OCORRENCIA_VAZIA" };

    const { error } = await supabase.from("ev_ocorrencias").insert({
      evento_id: eventoId,
      bloco_id: blocoId,
      tipo: "ocorrencia",
      texto: limpo,
      autor_profile_id: user.id,
    });
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}


// ----------------------------------------------------------------------------
// O Fechamento — os dois botões e o template
// ----------------------------------------------------------------------------

/**
 * CRIAR AS ENTREGAS. Cada destinatário vira uma tarefa na Produção, com a
 * lista do que existe no briefing.
 *
 * Uma tarefa POR DESTINATÁRIO, e não uma por material: quem edita abre uma
 * pasta por cliente, não um card por foto. Trinta cards de "foto do palco"
 * entupiriam o Kanban da semana inteira no domingo de manhã.
 *
 * O carimbo `entregas_criadas_em` existe para o botão não poder ser apertado
 * duas vezes. Duplicar a semana de trabalho da equipe com um clique repetido
 * seria um jeito rápido de fazer ninguém confiar no botão.
 */
export async function criarEntregas(eventoId: string): Promise<ResultadoContagem> {
  try {
    const { supabase } = await requireModulo("eventos");

    const { data: evento } = await supabase
      .from("ev_eventos")
      .select("id, nome, fim, entregas_criadas_em")
      .eq("id", eventoId)
      .maybeSingle<{ id: string; nome: string; fim: string; entregas_criadas_em: string | null }>();

    if (!evento) return { ok: false, error: "EVENTO_NAO_ENCONTRADO" };
    if (evento.entregas_criadas_em) return { ok: false, error: "ENTREGAS_JA_CRIADAS" };

    const { data: capturas } = await supabase
      .from("ev_capturas")
      .select("id, titulo, destinatario, cliente_id")
      .eq("evento_id", eventoId)
      .eq("status", "captado")
      .overrideTypes<{ id: string; titulo: string; destinatario: string | null; cliente_id: string | null }[], { merge: false }>();

    const lista = capturas ?? [];
    if (!lista.length) return { ok: false, error: "NADA_PARA_ENTREGAR" };

    const grupos = new Map<string, { destinatario: string | null; clienteId: string | null; itens: string[] }>();
    for (const c of lista) {
      const chave = c.cliente_id ?? c.destinatario ?? "";
      const g = grupos.get(chave) ?? { destinatario: c.destinatario, clienteId: c.cliente_id, itens: [] };
      g.itens.push(c.titulo);
      grupos.set(chave, g);
    }

    const { dict } = await getDictionary();
    const dataEntrega = evento.fim.slice(0, 10);

    const { error } = await supabase.from("prod_tarefas").insert(
      [...grupos.values()].map((g) => ({
        titulo: g.destinatario ? `${evento.nome} — ${g.destinatario}` : evento.nome,
        briefing: `${dict.eventos.entregaBriefing}\n\n${g.itens.map((i) => `• ${i}`).join("\n")}`,
        cliente_cadastro_id: g.clienteId,
        data_captacao: dataEntrega,
      }))
    );

    if (error) return { ok: false, error: error.message };

    await supabase.from("ev_eventos").update({ entregas_criadas_em: new Date().toISOString() }).eq("id", eventoId);
    revalidar(eventoId);
    return { ok: true, quantos: grupos.size };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * LANÇAR OS CUSTOS. A conta da escala mais os extras vira uma despesa no
 * Financeiro, com vencimento no dia do evento.
 *
 * UM lançamento, e não um por pessoa: no extrato da produtora, "Festival de
 * Verão — equipe" é uma linha que se entende; doze linhas de cachê no mesmo
 * dia são doze linhas para conferir. O detalhe por pessoa continua aqui, no
 * evento, que é onde ele faz sentido.
 */
export async function lancarCustos(eventoId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");

    const { data: evento } = await supabase
      .from("ev_eventos")
      .select("id, nome, fim, custos_lancados_em")
      .eq("id", eventoId)
      .maybeSingle<{ id: string; nome: string; fim: string; custos_lancados_em: string | null }>();

    if (!evento) return { ok: false, error: "EVENTO_NAO_ENCONTRADO" };
    if (evento.custos_lancados_em) return { ok: false, error: "CUSTOS_JA_LANCADOS" };

    const { data: equipe } = await supabase
      .from("ev_equipe")
      .select("cache, extras")
      .eq("evento_id", eventoId)
      .overrideTypes<{ cache: number | null; extras: number | null }[], { merge: false }>();

    const total = (equipe ?? []).reduce((s, p) => s + Number(p.cache ?? 0) + Number(p.extras ?? 0), 0);
    if (total <= 0) return { ok: false, error: "NADA_PARA_LANCAR" };

    const { dict } = await getDictionary();
    const { error } = await supabase.from("fin_transacoes").insert({
      tipo: "despesa",
      contexto: "profissional",
      descricao: `${evento.nome} — ${dict.eventos.custoEquipe}`,
      valor: total,
      data_vencimento: evento.fim.slice(0, 10),
      pago: false,
    });

    if (error) return { ok: false, error: error.message };

    await supabase.from("ev_eventos").update({ custos_lancados_em: new Date().toISOString() }).eq("id", eventoId);
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * SALVAR COMO TEMPLATE — o evento encerrado vira o ponto de partida do próximo.
 *
 * Copia ambientes e programação, e NÃO copia pauta marcada, equipe, ponto nem
 * ocorrências: aquilo aconteceu num sábado específico. O que se repete de um
 * festival para o outro é a forma — quatro palcos, a mesma sequência, os
 * mesmos booms —, e é isso que o template guarda.
 *
 * O modelo não aparece na lista de eventos. Ele existe só na hora de criar o
 * próximo, que é quando alguém quer um.
 */
export async function salvarComoTemplate(eventoId: string): Promise<ResultadoId> {
  try {
    const { supabase } = await requireModulo("eventos");

    const { data: evento } = await supabase
      .from("ev_eventos")
      .select("*")
      .eq("id", eventoId)
      .maybeSingle<{
        id: string;
        nome: string;
        local: string | null;
        inicio: string;
        fim: string;
        fuso: string;
        cliente_id: string | null;
        usa_kit: boolean;
        usa_realtime: boolean;
        usa_ponto: boolean;
        usa_cache: boolean;
        usa_entregas: boolean;
      }>();
    if (!evento) return { ok: false, error: "EVENTO_NAO_ENCONTRADO" };

    const { dict } = await getDictionary();

    const { data: modelo, error } = await supabase
      .from("ev_eventos")
      .insert({
        nome: `${evento.nome} — ${dict.eventos.templateSufixo}`,
        local: evento.local,
        cliente_id: evento.cliente_id,
        inicio: evento.inicio,
        fim: evento.fim,
        fuso: evento.fuso,
        modelo: true,
        duplicado_de: evento.id,
        // As chaves fazem parte da FORMA do evento: quem fez um festival com
        // kit e realtime vai fazer o próximo igual, e religar tudo na mão
        // seria o template cobrando pedágio justo de quem mais o usa.
        usa_kit: evento.usa_kit,
        usa_realtime: evento.usa_realtime,
        usa_ponto: evento.usa_ponto,
        usa_cache: evento.usa_cache,
        usa_entregas: evento.usa_entregas,
        status: "planejamento",
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !modelo) return { ok: false, error: error?.message ?? "Erro desconhecido." };

    const { data: ambientes } = await supabase
      .from("ev_ambientes")
      .select("id, nome, cor, ordem, modo_padrao")
      .eq("evento_id", eventoId)
      .overrideTypes<{ id: string; nome: string; cor: string | null; ordem: number; modo_padrao: string }[], { merge: false }>();

    const deParaAmbiente = new Map<string, string>();
    for (const a of ambientes ?? []) {
      const { data: novo } = await supabase
        .from("ev_ambientes")
        .insert({ evento_id: modelo.id, nome: a.nome, cor: a.cor, ordem: a.ordem, modo_padrao: a.modo_padrao })
        .select("id")
        .single<{ id: string }>();
      if (novo) deParaAmbiente.set(a.id, novo.id);
    }

    const { data: blocos } = await supabase
      .from("ev_blocos")
      .select("ambiente_id, titulo, tipo, ancora, inicio, fim, duracao_min, ordem")
      .eq("evento_id", eventoId)
      .overrideTypes<
        {
          ambiente_id: string | null;
          titulo: string;
          tipo: string;
          ancora: string;
          inicio: string;
          fim: string | null;
          duracao_min: number | null;
          ordem: number;
        }[],
        { merge: false }
      >();

    if (blocos?.length) {
      await supabase.from("ev_blocos").insert(
        blocos.map((b) => ({
          evento_id: modelo.id,
          ambiente_id: b.ambiente_id ? (deParaAmbiente.get(b.ambiente_id) ?? null) : null,
          titulo: b.titulo,
          tipo: b.tipo,
          ancora: b.ancora,
          inicio: b.inicio,
          fim: b.fim,
          duracao_min: b.duracao_min,
          ordem: b.ordem,
        }))
      );
    }

    revalidar(eventoId);
    return { ok: true, id: modelo.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}


// ----------------------------------------------------------------------------
// A gaveta de Equipe — a escala, o cachê e o link de cada um
// ----------------------------------------------------------------------------

export interface PessoaInput {
  /** Quando vem do cadastro da casa. Null = escrito à mão, que é a maioria num evento grande. */
  membroId: string | null;
  nome: string;
  funcao: string | null;
  telefone: string | null;
  cache: number;
}

/**
 * Escala alguém no evento e já cria o acesso pessoal dela.
 *
 * O token nasce junto, no DEFAULT da coluna: não existe "pessoa escalada sem
 * link". Ter que gerar o acesso num segundo passo garantiria que metade da
 * equipe chega no sábado sem ele — e aí a pauta não é marcada por ninguém.
 *
 * `membroId` NULO é o caminho normal, não a exceção. Num evento grande a maior
 * parte da equipe é freelancer que não está no cadastro da casa, e obrigar a
 * cadastrar cada um antes de escalar transformaria uma escala de dez minutos
 * numa tarde de digitação.
 */
export async function adicionarNaEquipe(eventoId: string, input: PessoaInput): Promise<ResultadoId> {
  try {
    const { supabase } = await requireModulo("eventos");

    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "PESSOA_SEM_NOME" };

    const { data: evento } = await supabase
      .from("ev_eventos")
      .select("fim")
      .eq("id", eventoId)
      .maybeSingle<{ fim: string }>();

    // O acesso vence 12 horas depois do fim previsto. Folga suficiente para o
    // evento virar a madrugada e atrasar, curta o bastante para o link não
    // ficar valendo na terça-feira.
    const expira = evento ? new Date(new Date(evento.fim).getTime() + 12 * 60 * 60_000).toISOString() : null;

    const { data, error } = await supabase
      .from("ev_equipe")
      .insert({
        evento_id: eventoId,
        equipe_membro_id: input.membroId,
        nome,
        funcao: input.funcao?.trim() || null,
        telefone: input.telefone?.trim() || null,
        cache: input.cache > 0 ? input.cache : 0,
        token_expira_em: expira,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Erro desconhecido." };

    revalidar(eventoId);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

export async function atualizarPessoaDaEquipe(
  eventoId: string,
  pessoaId: string,
  campos: { funcao?: string | null; cache?: number; extras?: number; ativo?: boolean }
): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_equipe").update(campos).eq("id", pessoaId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * O PONTO — chegou e saiu, num toque.
 *
 * Sem campo de hora: o ponto é o instante do toque, que é o único que a pessoa
 * não tem como errar. Digitar "cheguei às 19h40" no domingo é justamente o que
 * faz a conta do evento sair errada.
 */
export async function baterPonto(eventoId: string, pessoaId: string, qual: "entrada" | "saida"): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const agora = new Date().toISOString();
    const { error } = await supabase
      .from("ev_equipe")
      .update(qual === "entrada" ? { checkin_em: agora } : { checkout_em: agora })
      .eq("id", pessoaId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/** Tira a pessoa da escala. O que ela já marcou FICA: a marcação é registro do evento, não propriedade dela. */
export async function removerDaEquipe(eventoId: string, pessoaId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_equipe").delete().eq("id", pessoaId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}


// ----------------------------------------------------------------------------
// A gaveta de Kit — o que sai e o que volta
// ----------------------------------------------------------------------------

export interface ItemDeKitInput {
  /** Quando vem do Inventário da casa. Null = "tripé emprestado do João". */
  itemInventarioId: string | null;
  nome: string;
  quantidade: number;
  responsavelId: string | null;
}

export async function adicionarAoKit(eventoId: string, input: ItemDeKitInput): Promise<ResultadoId> {
  try {
    const { supabase } = await requireModulo("eventos");

    const nome = input.nome.trim();
    if (!nome) return { ok: false, error: "ITEM_SEM_NOME" };

    const { data: ultimo } = await supabase
      .from("ev_kit")
      .select("ordem")
      .eq("evento_id", eventoId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle<{ ordem: number }>();

    const { data, error } = await supabase
      .from("ev_kit")
      .insert({
        evento_id: eventoId,
        item_inventario_id: input.itemInventarioId,
        nome,
        quantidade: input.quantidade > 0 ? input.quantidade : 1,
        responsavel_id: input.responsavelId,
        ordem: (ultimo?.ordem ?? -1) + 1,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Erro desconhecido." };
    revalidar(eventoId);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Saiu e voltou, em dois toques independentes.
 *
 * "Voltou" não implica "saiu" e o contrário também não: equipamento que foi
 * direto do cliente para o evento nunca saiu da base, e o que sumiu no meio do
 * caminho saiu e não voltou. Amarrar um no outro criaria uma conta bonita e
 * errada — e a conta que importa nesta gaveta é justamente **o que não
 * voltou**.
 */
export async function marcarItemDoKit(
  eventoId: string,
  itemId: string,
  campos: { saiu?: boolean; voltou?: boolean }
): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_kit").update(campos).eq("id", itemId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

export async function removerDoKit(eventoId: string, itemId: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_kit").delete().eq("id", itemId);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}


// ----------------------------------------------------------------------------
// Entrega realtime — pedido → editor → link, com o prazo correndo
// ----------------------------------------------------------------------------

/**
 * O pedido nasce com PRAZO, não com data de entrega.
 *
 * "Para as 23h40" e "em 30 minutos" são a mesma informação e não são a mesma
 * cabeça: no meio de um evento ninguém calcula que horas são daqui a meia
 * hora. A tela pergunta em minutos e guarda o instante — e é esse instante que
 * vira o relógio correndo do lado do pedido.
 */
export async function criarPedidoRealtime(
  eventoId: string,
  input: { pedido: string; editorEquipeId: string | null; prazoMin: number }
): Promise<ResultadoId> {
  try {
    const { supabase } = await requireModulo("eventos");

    const pedido = input.pedido.trim();
    if (!pedido) return { ok: false, error: "PEDIDO_VAZIO" };

    const prazo = input.prazoMin > 0 ? new Date(Date.now() + input.prazoMin * 60_000).toISOString() : null;

    const { data, error } = await supabase
      .from("ev_realtime")
      .insert({ evento_id: eventoId, pedido, editor_equipe_id: input.editorEquipeId, prazo_em: prazo })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) return { ok: false, error: error?.message ?? "Erro desconhecido." };
    revalidar(eventoId);
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Anda o pedido. `entregue` sem link é permitido de propósito: no meio do
 * evento o material às vezes vai pelo WhatsApp e o link chega depois — barrar
 * a marcação por falta de URL faria a fila mentir sobre o que já foi feito.
 */
export async function mudarStatusRealtime(
  eventoId: string,
  id: string,
  status: "pedido" | "editando" | "entregue" | "cancelado",
  link?: string | null
): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase
      .from("ev_realtime")
      .update({ status, ...(link !== undefined ? { link: link?.trim() || null } : {}) })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * O pedido vira tarefa na Produção — o "→ Produção" do mapa.
 *
 * É para o que NÃO deu tempo: o corte pedido às duas da manhã que ninguém
 * entregou às duas e meia não pode simplesmente evaporar quando o evento
 * fecha. Aqui ele atravessa para o quadro da semana, com o evento no título,
 * em vez de virar uma mensagem perdida no grupo.
 */
export async function enviarRealtimeParaProducao(eventoId: string, id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");

    const { data: item } = await supabase
      .from("ev_realtime")
      .select("id, pedido, tarefa_id")
      .eq("id", id)
      .maybeSingle<{ id: string; pedido: string; tarefa_id: string | null }>();

    if (!item) return { ok: false, error: "PEDIDO_NAO_ENCONTRADO" };
    if (item.tarefa_id) return { ok: false, error: "PEDIDO_JA_NA_PRODUCAO" };

    const { data: evento } = await supabase
      .from("ev_eventos")
      .select("nome, cliente_id, fim")
      .eq("id", eventoId)
      .maybeSingle<{ nome: string; cliente_id: string | null; fim: string }>();

    const { data: tarefa, error } = await supabase
      .from("prod_tarefas")
      .insert({
        titulo: `${evento?.nome ?? ""} — ${item.pedido}`.trim(),
        cliente_cadastro_id: evento?.cliente_id ?? null,
        data_captacao: evento ? evento.fim.slice(0, 10) : null,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !tarefa) return { ok: false, error: error?.message ?? "Erro desconhecido." };

    await supabase.from("ev_realtime").update({ tarefa_id: tarefa.id }).eq("id", id);
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

export async function removerRealtime(eventoId: string, id: string): Promise<Resultado> {
  try {
    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase.from("ev_realtime").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

// ----------------------------------------------------------------------------
// Ajustes do evento
// ----------------------------------------------------------------------------

/** As chaves da gaveta de Ajustes. Lista fechada de propósito: nome errado não compila. */
export type ChaveDeUso = "usa_kit" | "usa_realtime" | "usa_ponto" | "usa_cache" | "usa_entregas";

const CHAVES_DE_USO: readonly ChaveDeUso[] = [
  "usa_kit",
  "usa_realtime",
  "usa_ponto",
  "usa_cache",
  "usa_entregas",
];

/**
 * Liga ou desliga um pedaço do módulo neste evento.
 *
 * A chave vem do cliente, então é conferida contra a lista antes de virar nome
 * de coluna — é a diferença entre um `update` e um `update` que o usuário
 * escreve. Desligar nunca apaga nada: o kit continua no banco, só sai da tela,
 * e volta inteiro se a chave voltar.
 */
export async function ajustarEvento(eventoId: string, chave: ChaveDeUso, valor: boolean): Promise<Resultado> {
  try {
    if (!CHAVES_DE_USO.includes(chave)) return { ok: false, error: "AJUSTE_DESCONHECIDO" };

    const { supabase } = await requireModulo("eventos");
    const { error } = await supabase
      .from("ev_eventos")
      .update({ [chave]: valor })
      .eq("id", eventoId);

    if (error) return { ok: false, error: error.message };
    revalidar(eventoId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
