import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { CalculadoraPdfDocument, type CalculadoraPdfItem } from "@/lib/pdf/CalculadoraPdfDocument";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PDF da simulação da Calculadora de Margem.
 *
 * É POST, e não GET, porque a simulação NÃO EXISTE no banco: ela só vive na
 * tela de quem está simulando (ver o comentário no topo de
 * `CalculadoraMargem.tsx`). Não há id para buscar — os números vêm no corpo.
 *
 * Isso muda o que precisa ser checado: o conteúdo é do próprio usuário, não
 * de um registro de outra empresa, então não há o que vazar aqui. O que a
 * autorização protege é o uso da rota em si — daí `requireModulo`, o mesmo
 * do resto do módulo de Orçamentos. E como o corpo vem do navegador, todo
 * número é saneado antes de virar texto no documento: nada de `NaN`,
 * `Infinity` ou lista de dez mil itens.
 */

const MAX_ITENS = 300;
const MAX_NOME = 160;

function numero(valor: unknown, teto = 1_000_000_000): number {
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, -teto), teto);
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().slice(0, MAX_NOME) : "";
}

function itens(valor: unknown): CalculadoraPdfItem[] {
  if (!Array.isArray(valor)) return [];
  return valor.slice(0, MAX_ITENS).map((bruto) => {
    const item = (bruto ?? {}) as Record<string, unknown>;
    return {
      nome: texto(item.nome) || "Item sem nome",
      quantidade: numero(item.quantidade, 100_000),
      custoUnitario: numero(item.custoUnitario),
    };
  });
}

export async function POST(req: Request) {
  await requireModulo("orcamentos");

  let corpo: Record<string, unknown>;
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const nomeApp = await getNomeApp();
  const geradoEm = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const { fmtMoeda } = await getDictionary();

  const buffer = await renderToBuffer(
    <CalculadoraPdfDocument
      fmtMoeda={fmtMoeda}
      nomeApp={nomeApp}
      geradoEm={geradoEm}
      itensServico={itens(corpo.itensServico)}
      itensEquipamento={itens(corpo.itensEquipamento)}
      custoServicos={numero(corpo.custoServicos)}
      custoEquipamentos={numero(corpo.custoEquipamentos)}
      impostosAtivo={corpo.impostosAtivo === true}
      aliquotaImposto={numero(corpo.aliquotaImposto, 100)}
      custoFixoAtivo={corpo.custoFixoAtivo === true}
      custoFixoBase={numero(corpo.custoFixoBase)}
      custoFixoPercentual={numero(corpo.custoFixoPercentual, 100)}
      custoFixoRateado={numero(corpo.custoFixoRateado)}
      margemDesejada={numero(corpo.margemDesejada, 100)}
      custoOperacionalTotal={numero(corpo.custoOperacionalTotal)}
      impostoValor={numero(corpo.impostoValor)}
      lucroEstimado={numero(corpo.lucroEstimado)}
      valorFinalDoProjeto={numero(corpo.valorFinalDoProjeto)}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="simulacao-precificacao.pdf"`,
    },
  });
}
