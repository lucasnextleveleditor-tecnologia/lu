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
