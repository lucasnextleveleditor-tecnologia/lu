import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { limitesDoAno, limitesDoMes } from "@/lib/utils/financeiro";

interface EmpresaMetasRow {
  obj_meta_faturamento_mensal: number | null;
  obj_meta_faturamento_anual: number | null;
}

export interface PontoMensalObjetivo {
  /** Primeiro dia do mês (UTC) — só usado pra derivar o rótulo (`fmtMesCurto`) e a posição no eixo. */
  mes: Date;
  receita: number;
  /** Mês ainda não começou (é depois de hoje) — o gráfico de ritmo trata esses meses como "em branco", nunca como uma barra zerada (zero pareceria uma meta perdida, não "ainda não chegou"). */
  futuro: boolean;
  atual: boolean;
}

export interface DadosObjetivos {
  ano: number;
  metaMensal: number | null;
  metaAnual: number | null;
  faturadoMes: number;
  faturadoAno: number;
  restanteMes: number | null;
  restanteAno: number | null;
  pctMes: number;
  pctAno: number;
  /** Faturamento médio diário do mês (até hoje) projetado pros dias que faltam — não é IA nem adivinhação, só regra de três com o ritmo observado. */
  projecaoMes: number;
  projecaoAno: number;
  diaDoMes: number;
  totalDiasMes: number;
  diaDoAno: number;
  totalDiasAno: number;
  mesesDoAno: PontoMensalObjetivo[];
  mesAtualIdx: number;
  metaMensalPorMes: number | null;
}

/**
 * Fonte de verdade do módulo Objetivos — reaproveita EXATAMENTE a mesma
 * tabela/coluna/filtro já usados pra "faturamento" no Dashboard
 * (`app/admin/dashboard/page.tsx`) e no Financeiro (`financeiro/data.ts`):
 * `fin_transacoes`, `tipo = 'receita'`, `contexto = 'profissional'`, range
 * em `data_vencimento`. Nenhum filtro de `pago` — pendente e pago contam
 * igual pro "faturado" aqui, mesmo critério do resto do app. Uma ÚNICA
 * consulta cobrindo o ano inteiro alimenta tanto o card do mês quanto o do
 * ano quanto o gráfico mês a mês, pra nunca divergir entre si.
 */
export async function buscarDadosObjetivos(): Promise<DadosObjetivos> {
  const { supabase } = await requireModuloOuRedirect("financeiro");

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mesAtualIdx = hoje.getMonth();

  const { inicio: inicioAno, fim: fimAno } = limitesDoAno(hoje);

  const [{ data: empresa }, { data: transacoesAno }] = await Promise.all([
    supabase.from("companies").select("obj_meta_faturamento_mensal, obj_meta_faturamento_anual").maybeSingle<EmpresaMetasRow>(),
    supabase
      .from("fin_transacoes")
      .select("valor, data_vencimento")
      .eq("contexto", "profissional")
      .eq("tipo", "receita")
      .gte("data_vencimento", inicioAno)
      .lte("data_vencimento", fimAno)
      .overrideTypes<{ valor: number; data_vencimento: string }[], { merge: false }>(),
  ]);

  const linhas = transacoesAno ?? [];

  const mesesDoAno: PontoMensalObjetivo[] = Array.from({ length: 12 }, (_, i) => {
    const mesData = new Date(Date.UTC(ano, i, 1));
    const { inicio, fim } = limitesDoMes(mesData);
    const receita = linhas.filter((t) => t.data_vencimento >= inicio && t.data_vencimento <= fim).reduce((soma, t) => soma + t.valor, 0);
    return { mes: mesData, receita, futuro: i > mesAtualIdx, atual: i === mesAtualIdx };
  });

  const faturadoAno = linhas.reduce((soma, t) => soma + t.valor, 0);
  const faturadoMes = mesesDoAno[mesAtualIdx]!.receita;

  const diaDoMes = hoje.getDate();
  const totalDiasMes = new Date(Date.UTC(ano, mesAtualIdx + 1, 0)).getUTCDate();

  const inicioAnoMs = Date.UTC(ano, 0, 1);
  const fimAnoMs = Date.UTC(ano, 11, 31);
  const diaDoAno = Math.floor((Date.UTC(ano, hoje.getMonth(), hoje.getDate()) - inicioAnoMs) / 86_400_000) + 1;
  const totalDiasAno = Math.round((fimAnoMs - inicioAnoMs) / 86_400_000) + 1;

  const projecaoMes = diaDoMes > 0 ? (faturadoMes / diaDoMes) * totalDiasMes : 0;
  const projecaoAno = diaDoAno > 0 ? (faturadoAno / diaDoAno) * totalDiasAno : 0;

  const metaMensal = empresa?.obj_meta_faturamento_mensal ?? null;
  const metaAnual = empresa?.obj_meta_faturamento_anual ?? null;

  return {
    ano,
    metaMensal,
    metaAnual,
    faturadoMes,
    faturadoAno,
    restanteMes: metaMensal != null ? Math.max(0, metaMensal - faturadoMes) : null,
    restanteAno: metaAnual != null ? Math.max(0, metaAnual - faturadoAno) : null,
    pctMes: metaMensal && metaMensal > 0 ? faturadoMes / metaMensal : 0,
    pctAno: metaAnual && metaAnual > 0 ? faturadoAno / metaAnual : 0,
    projecaoMes,
    projecaoAno,
    diaDoMes,
    totalDiasMes,
    diaDoAno,
    totalDiasAno,
    mesesDoAno,
    mesAtualIdx,
    metaMensalPorMes: metaAnual != null ? metaAnual / 12 : null,
  };
}
