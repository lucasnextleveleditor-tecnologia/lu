import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Quanto a empresa já ocupou, e quanto pode ocupar.
 *
 * A conta é feita no banco (`armazenamento_da_empresa`), somando os arquivos
 * cujo caminho começa com o id da empresa — em todos os buckets de uma vez.
 * `cache()` do React: uma leitura por requisição, mesmo que a barra apareça
 * em mais de um lugar.
 *
 * Nunca lança. Uma barra de uso é informação de apoio; falhar aqui não pode
 * derrubar o painel inteiro — sem número, a barra some e o resto segue.
 */

const MB = 1024 * 1024;

export interface UsoDeArmazenamento {
  bytesUsados: number;
  bytesLimite: number;
  /** 0 a 1, com teto em 1 — a tela mostra "cheio", nunca 110%. */
  fracao: number;
}

export const buscarUsoDeArmazenamento = cache(async (): Promise<UsoDeArmazenamento | null> => {
  try {
    const supabase = await createClient();
    const [usoRes, empresaRes] = await Promise.all([
      supabase.rpc("armazenamento_da_empresa"),
      supabase.from("companies").select("limite_armazenamento_mb").maybeSingle<{ limite_armazenamento_mb: number | null }>(),
    ]);

    const bytesUsados = Number(usoRes.data ?? 0);
    if (!Number.isFinite(bytesUsados)) return null;

    const limiteMb = empresaRes.data?.limite_armazenamento_mb || 10240;
    const bytesLimite = limiteMb * MB;

    return { bytesUsados, bytesLimite, fracao: bytesLimite > 0 ? Math.min(1, bytesUsados / bytesLimite) : 0 };
  } catch {
    return null;
  }
});

/** "1,2 GB" / "340 MB" / "8 KB" — com vírgula, como se lê em português. */
export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0).replace(".", ",")} MB`;
  return `${(bytes / (1024 * MB)).toFixed(1).replace(".", ",")} GB`;
}
