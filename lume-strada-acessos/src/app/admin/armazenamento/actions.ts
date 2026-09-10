"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * O backup ("Otimizar espaço") da tela de Armazenamento.
 *
 * O ZIP é montado NO NAVEGADOR de quem pediu, não aqui. Duas razões, e as
 * duas são impeditivas: a Vercel tem teto de corpo de resposta em função
 * serverless, e o acervo pode ter gigabytes — nenhuma função ia sobreviver a
 * isso. Aqui o servidor faz só as duas coisas que só ele pode fazer: dizer
 * QUAIS arquivos existem e assinar links temporários pra eles. O download em
 * si vai direto do Storage do Supabase pro computador da pessoa, sem passar
 * pela nossa aplicação.
 *
 * Tudo aqui é `requireAdmin`, nunca `requireEquipe`: um backup carrega junto
 * contrato assinado e comprovante do financeiro. Um funcionário que só tem
 * permissão de Produção não pode levar isso pra casa num arquivo só.
 */

const TETO_DE_ARQUIVOS = 20_000;
const PAGINA = 1000;
const POR_LOTE_DE_ASSINATURA = 60;
/** Seis horas: um acervo grande leva tempo pra baixar, e link vencido no meio derruba o ZIP inteiro. */
const VALIDADE_DO_LINK = 60 * 60 * 6;

export interface ArquivoDoBackup {
  bucket: string;
  /** Caminho completo no bucket, começando pelo id da empresa. */
  caminho: string;
  bytes: number;
  criadoEm: string;
}

export type ListaDoBackup =
  | { ok: true; arquivos: ArquivoDoBackup[]; truncado: boolean }
  | { ok: false; error: string };

/**
 * O inventário: todo arquivo da empresa, em todos os buckets.
 *
 * Paginado de mil em mil porque o PostgREST corta silenciosamente em mil
 * linhas — um acervo de 1.500 arquivos viraria um backup de 1.000 sem que
 * ninguém percebesse, que é o pior tipo de bug num backup.
 */
export async function listarArquivosDoBackup(): Promise<ListaDoBackup> {
  try {
    const { supabase } = await requireAdmin();
    const arquivos: ArquivoDoBackup[] = [];

    for (let offset = 0; offset < TETO_DE_ARQUIVOS; offset += PAGINA) {
      const { data, error } = await supabase.rpc("todos_os_arquivos", {
        p_offset: offset,
        p_limite: PAGINA,
      });
      if (error) return { ok: false, error: error.message };

      const linhas = (data ?? []) as { bucket: string; caminho: string; bytes: number; criado_em: string }[];
      for (const l of linhas) {
        arquivos.push({
          bucket: l.bucket,
          caminho: l.caminho,
          bytes: Number(l.bytes) || 0,
          criadoEm: l.criado_em,
        });
      }
      if (linhas.length < PAGINA) return { ok: true, arquivos, truncado: false };
    }

    // Chegou no teto: melhor avisar do que entregar um backup incompleto
    // fingindo que está inteiro.
    return { ok: true, arquivos, truncado: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export type LoteAssinado = { ok: true; urls: (string | null)[] } | { ok: false; error: string };

/**
 * Links temporários para um lote de arquivos, na MESMA ordem em que vieram.
 *
 * Usa a Service Role porque um backup atravessa todos os buckets de uma vez,
 * e cada um tem política própria de leitura — depender de RLS aqui faria o
 * backup sair furado de um jeito difícil de perceber. Em troca, cada caminho
 * é conferido contra o id da empresa de quem pediu ANTES de assinar: é essa
 * checagem, e não a RLS, que impede alguém de assinar arquivo de outra
 * empresa passando um caminho inventado.
 *
 * Uma URL pode voltar `null` (arquivo apagado entre a listagem e o
 * download); quem chama pula esse item em vez de abortar o ZIP.
 */
export async function assinarArquivosDoBackup(
  itens: { bucket: string; caminho: string }[]
): Promise<LoteAssinado> {
  try {
    const { companyId } = await requireAdmin();
    if (!companyId) return { ok: false, error: "Conta sem empresa vinculada." };
    if (itens.length === 0) return { ok: true, urls: [] };
    if (itens.length > POR_LOTE_DE_ASSINATURA) {
      return { ok: false, error: `Peça no máximo ${POR_LOTE_DE_ASSINATURA} arquivos por vez.` };
    }

    const prefixo = `${companyId}/`;
    if (itens.some((i) => !i.caminho.startsWith(prefixo) || i.caminho.includes("..")))
      return { ok: false, error: "Caminho fora da sua empresa." };

    const admin = createAdminClient();
    const urls: (string | null)[] = new Array(itens.length).fill(null);

    // Um `createSignedUrls` por bucket: a API assina em lote, mas só dentro
    // de um bucket de cada vez.
    const porBucket = new Map<string, number[]>();
    itens.forEach((item, i) => {
      const lista = porBucket.get(item.bucket);
      if (lista) lista.push(i);
      else porBucket.set(item.bucket, [i]);
    });

    for (const [bucket, indices] of porBucket) {
      const caminhos = indices.map((i) => itens[i]!.caminho);
      const { data, error } = await admin.storage.from(bucket).createSignedUrls(caminhos, VALIDADE_DO_LINK);
      if (error) return { ok: false, error: error.message };
      (data ?? []).forEach((assinado, posicao) => {
        const destino = indices[posicao];
        if (destino !== undefined && assinado?.signedUrl && !assinado.error) urls[destino] = assinado.signedUrl;
      });
    }

    return { ok: true, urls };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
