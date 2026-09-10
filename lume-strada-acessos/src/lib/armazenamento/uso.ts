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



/* ==================================================================== */
/* ONDE O ESPAÇO ESTÁ INDO                                              */
/* ==================================================================== */

/**
 * O nome do bucket não diz nada a quem usa o sistema: "orcamentos-midia" e
 * "infoprodutos" são nomes de infraestrutura. A CHAVE mapeia cada um para a
 * tela onde a pessoa reconhece aquele arquivo.
 *
 * O rótulo e a explicação de cada área moram no dicionário
 * (`i18n/dictionaries/<idioma>/armazenamento.ts`), não aqui: é texto que a
 * pessoa lê, e o painel inteiro fala três idiomas. Aqui fica só o que não
 * se traduz — a rota.
 */
export const HREF_DA_AREA: Record<string, string | null> = {
  assinaturas: "/admin/assinaturas",
  producao: "/admin/producao",
  financeiro: "/admin/financeiro",
  "orcamentos-midia": "/admin/orcamentos",
  infoprodutos: "/admin/trafego?fluxo=infoproduto",
  mapas: "/admin/ferramentas",
  avatares: "/admin/configuracoes?aba=conta",
  branding: "/admin/configuracoes?aba=aparencia",
};

export interface AreaComUso {
  /** Id do bucket — a chave para achar o texto da área no dicionário. */
  chave: string;
  href: string | null;
  arquivos: number;
  bytes: number;
  /** Fatia do total já usado — não do limite. É a resposta de "onde está indo". */
  fatia: number;
}

export interface ArquivoGrande {
  bucket: string;
  nome: string;
  bytes: number;
  criadoEm: string;
}

export const buscarDetalheDoArmazenamento = cache(
  async (): Promise<{ areas: AreaComUso[]; maiores: ArquivoGrande[] } | null> => {
    try {
      const supabase = await createClient();
      const [areasRes, maioresRes] = await Promise.all([
        supabase.rpc("armazenamento_por_area"),
        supabase.rpc("maiores_arquivos", { p_limite: 25 }),
      ]);

      const linhas = (areasRes.data ?? []) as { bucket: string; arquivos: number; bytes: number }[];
      const total = linhas.reduce((soma, l) => soma + Number(l.bytes), 0);

      const areas: AreaComUso[] = linhas.map((l) => ({
        chave: l.bucket,
        href: HREF_DA_AREA[l.bucket] ?? null,
        arquivos: Number(l.arquivos),
        bytes: Number(l.bytes),
        fatia: total > 0 ? Number(l.bytes) / total : 0,
      }));

      const maiores: ArquivoGrande[] = ((maioresRes.data ?? []) as {
        bucket: string;
        caminho: string;
        bytes: number;
        criado_em: string;
      }[]).map((l) => ({
        bucket: l.bucket,
        // Só o nome do arquivo: o caminho inteiro começa com o uuid da
        // empresa e da pasta, que não dizem nada a quem está lendo.
        nome: l.caminho.split("/").pop() || l.caminho,
        bytes: Number(l.bytes),
        criadoEm: l.criado_em,
      }));

      return { areas, maiores };
    } catch {
      return null;
    }
  }
);
