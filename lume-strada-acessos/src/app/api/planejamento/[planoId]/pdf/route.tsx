import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { substituir } from "@/lib/utils/texto";
import { FichaPdfDocument, type SecaoPdf } from "@/lib/pdf/FichaPdfDocument";
import type { PlanoRow, StatusDoPlano } from "@/lib/types/planejamento";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * O ciclo de planejamento em PDF — para imprimir, arquivar ou mandar ao
 * cliente junto com a proposta do próximo ciclo.
 *
 * Mesmo padrão das outras rotas de PDF do sistema: `@react-pdf/renderer`,
 * texto de verdade, protegida pelo mesmo `requireModuloOuRedirect`. A sessão
 * vem do cookie e a RLS escopa a consulta por empresa, então um id de outra
 * agência simplesmente não devolve linha.
 *
 * O CONTEÚDO é montado aqui, e não no componente do PDF — é aqui que existe o
 * dicionário e o formatador de moeda. O componente recebe rótulos e valores
 * prontos e não precisa saber nem o idioma nem o que é um go live.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ planoId: string }> }) {
  const { planoId } = await params;
  const { supabase } = await requireModuloOuRedirect("clientes");
  const { dict, locale, fmtMoeda } = await getDictionary();
  const nomeApp = await getNomeApp();
  const t = dict.planejamento;

  const { data: plano } = await supabase
    .from("planos_estrategicos")
    .select("*")
    .eq("id", planoId)
    .maybeSingle<PlanoRow>();

  if (!plano) return new NextResponse("Plano não encontrado.", { status: 404 });

  const { data: cliente } = await supabase
    .from("clientes")
    .select("nome")
    .eq("id", plano.cliente_id)
    .maybeSingle<{ nome: string }>();

  const data = (iso: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(locale) : null);
  // Zero não é impresso: uma linha "Posts de social media: 0" ocupa espaço
  // para dizer que aquilo não faz parte do ciclo, e o que não faz parte
  // simplesmente não aparece.
  const quantidade = (n: number) => (n > 0 ? n.toLocaleString(locale) : null);

  const rotuloStatus: Record<StatusDoPlano, string> = {
    rascunho: t.statusRascunho,
    ativo: t.statusAtivo,
    encerrado: t.statusEncerrado,
    cancelado: t.statusCancelado,
  };

  const secoes: SecaoPdf[] = [
    {
      titulo: t.blocoResumo,
      campos: [
        {
          rotulo: t.duracao,
          valor: substituir(plano.duracao_meses === 1 ? t.duracaoMeses.um : t.duracaoMeses.muitos, {
            n: plano.duracao_meses,
          }),
        },
        { rotulo: t.dataInicio, valor: data(plano.data_inicio) },
        { rotulo: t.dataFim, valor: data(plano.data_fim) },
        {
          rotulo: t.orcamentoMidia,
          valor: plano.orcamento_midia_total === null ? null : fmtMoeda(plano.orcamento_midia_total),
        },
        { rotulo: t.focoEstrategico, valor: plano.foco_estrategico },
      ],
    },
    {
      titulo: t.blocoEscopo,
      campos: [
        { rotulo: t.postsSocial, valor: quantidade(plano.qtd_posts_social) },
        { rotulo: t.campanhasTrafego, valor: quantidade(plano.qtd_campanhas_trafego) },
        { rotulo: t.pecasExtras, valor: null, tipo: "lista", itens: plano.pecas_extras ?? [] },
        { rotulo: t.escopoObservacoes, valor: plano.escopo_observacoes },
      ],
    },
    {
      titulo: t.blocoCronograma,
      campos: [
        { rotulo: t.dataLimitePautas, valor: data(plano.data_limite_pautas) },
        { rotulo: t.dataLimiteArtes, valor: data(plano.data_limite_artes) },
        { rotulo: t.dataGoLive, valor: data(plano.data_go_live) },
        { rotulo: t.dataReuniaoResultados, valor: data(plano.data_reuniao_resultados) },
      ],
    },
  ];

  const meta = [
    { rotulo: t.colStatus, valor: rotuloStatus[plano.status] },
    {
      rotulo: t.colCiclo,
      valor: substituir(t.periodo, {
        inicio: data(plano.data_inicio) ?? "—",
        fim: data(plano.data_fim) ?? "—",
      }),
    },
  ];

  const buffer = await renderToBuffer(
    <FichaPdfDocument
      clienteNome={cliente?.nome ?? ""}
      eyebrow={t.pdfEyebrow}
      subtitulo={t.subtituloPagina}
      meta={meta}
      secoes={secoes}
      textoVazio={t.statusRascunho}
      rodape={substituir(t.pdfRodape, { app: nomeApp, data: new Date().toLocaleDateString(locale) })}
    />
  );

  const nome = (cliente?.nome ?? "cliente")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .toLowerCase();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="planejamento-${nome || "cliente"}-${plano.data_inicio}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
