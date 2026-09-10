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


/* ==================================================================== */
/* ONDE O ESPAÇO ESTÁ INDO                                              */
/* ==================================================================== */

/**
 * O nome do bucket não diz nada a quem usa o sistema: "orcamentos-midia" e
 * "infoprodutos" são nomes de infraestrutura. Aqui cada um vira a tela onde
 * a pessoa reconhece o arquivo — e o caminho para chegar lá.
 */
export const AREAS_DE_ARMAZENAMENTO: Record<
  string,
  { rotulo: string; explicacao: string; href: string | null }
> = {
  assinaturas: {
    rotulo: "Documentos para assinatura",
    explicacao: "PDFs enviados para assinar e as vias assinadas. Não dá para trocar por link: a assinatura é carimbada no arquivo.",
    href: "/admin/assinaturas",
  },
  producao: {
    rotulo: "Entregas de produção",
    explicacao: "Versões enviadas ao cliente. É o que mais cresce — cada revisão é um arquivo novo.",
    href: "/admin/producao",
  },
  financeiro: {
    rotulo: "Anexos do financeiro",
    explicacao: "Comprovantes e notas presos a lançamentos.",
    href: "/admin/financeiro",
  },
  "orcamentos-midia": {
    rotulo: "Portfólio e propostas",
    explicacao: "Imagens e vídeos que aparecem nas propostas.",
    href: "/admin/orcamentos",
  },
  infoprodutos: {
    rotulo: "Criativos de anúncio",
    explicacao: "Prints e vídeos dos criativos lançados.",
    href: "/admin/trafego?fluxo=infoproduto",
  },
  mapas: {
    rotulo: "Imagens de mapa mental",
    explicacao: "Imagens coladas dentro dos balões.",
    href: "/admin/ferramentas",
  },
  avatares: {
    rotulo: "Fotos de perfil",
    explicacao: "Uma por pessoa da equipe. Ocupa quase nada.",
    href: "/admin/configuracoes?aba=conta",
  },
  branding: {
    rotulo: "Marca e aparência",
    explicacao: "Logo, fundo de login e banner.",
    href: "/admin/configuracoes?aba=aparencia",
  },
};

export interface AreaComUso {
  chave: string;
  rotulo: string;
  explicacao: string;
  href: string | null;
  arquivos: number;
  bytes: number;
  /** Fatia do total já usado — não do limite. É a resposta de "onde está indo". */
  fatia: number;
}

export interface ArquivoGrande {
  bucket: string;
  area: string;
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

      const areas: AreaComUso[] = linhas.map((l) => {
        const meta = AREAS_DE_ARMAZENAMENTO[l.bucket];
        return {
          chave: l.bucket,
          rotulo: meta?.rotulo ?? l.bucket,
          explicacao: meta?.explicacao ?? "",
          href: meta?.href ?? null,
          arquivos: Number(l.arquivos),
          bytes: Number(l.bytes),
          fatia: total > 0 ? Number(l.bytes) / total : 0,
        };
      });

      const maiores: ArquivoGrande[] = ((maioresRes.data ?? []) as {
        bucket: string;
        caminho: string;
        bytes: number;
        criado_em: string;
      }[]).map((l) => ({
        bucket: l.bucket,
        area: AREAS_DE_ARMAZENAMENTO[l.bucket]?.rotulo ?? l.bucket,
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
