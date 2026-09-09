import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { SubtarefaRow, TarefaRow } from "@/lib/types/producao";
import { PRIORIDADE_TAREFA_META, STATUS_TAREFA_META } from "@/lib/utils/producao";
import { TarefaPdfDocument } from "@/lib/pdf/TarefaPdfDocument";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PDF de texto real de UMA tarefa de Produção — "ficha de produção" pra
 * imprimir e levar pro set/estúdio na captação (ver `TarefaPdfDocument.tsx`).
 * Mesmo padrão de `@react-pdf/renderer` já usado em
 * `api/orcamentos/[id]/pdf` e `api/contratos/[id]/pdf`: protegido pelo mesmo
 * `requireModuloOuRedirect` (sessão via cookie + RLS por empresa) — sem
 * sessão válida redireciona pro login, nunca vaza a tarefa de outra empresa;
 * a própria query por `id` já é escopada pela RLS de `prod_tarefas`.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const { supabase } = await requireModuloOuRedirect("producao");

  const { data: tarefa } = await supabase.from("prod_tarefas").select("*").eq("id", id).maybeSingle<TarefaRow>();
  if (!tarefa) return new NextResponse("Tarefa não encontrada.", { status: 404 });

  const [clienteRes, tipoServicoRes, responsavelRes, subtarefasRes] = await Promise.all([
    tarefa.cliente_cadastro_id
      ? supabase.from("clientes").select("nome").eq("id", tarefa.cliente_cadastro_id).maybeSingle<{ nome: string }>()
      : Promise.resolve({ data: null as { nome: string } | null }),
    tarefa.tipo_servico_id
      ? supabase.from("prod_tipos_servico").select("nome").eq("id", tarefa.tipo_servico_id).maybeSingle<{ nome: string }>()
      : Promise.resolve({ data: null as { nome: string } | null }),
    tarefa.responsavel_id
      ? supabase.from("prod_funcionarios").select("nome").eq("id", tarefa.responsavel_id).maybeSingle<{ nome: string }>()
      : Promise.resolve({ data: null as { nome: string } | null }),
    supabase.from("prod_subtarefas").select("*").eq("tarefa_id", id).order("created_at").overrideTypes<SubtarefaRow[], { merge: false }>(),
  ]);

  const buffer = await renderToBuffer(
    <TarefaPdfDocument
      titulo={tarefa.titulo}
      clienteNome={clienteRes.data?.nome ?? null}
      tipoServicoNome={tipoServicoRes.data?.nome ?? null}
      responsavelNome={responsavelRes.data?.nome ?? null}
      prioridadeLabel={PRIORIDADE_TAREFA_META[tarefa.prioridade].label}
      statusLabel={STATUS_TAREFA_META[tarefa.status].label}
      dataCaptacao={tarefa.data_captacao}
      dataEntregaV1={tarefa.data_entrega_v1}
      dataEntregaFinal={tarefa.data_entrega}
      referenciasEstilo={tarefa.referencias_estilo}
      formatosExportacao={tarefa.formatos_exportacao}
      briefingHtml={tarefa.briefing}
      subtarefas={(subtarefasRes.data ?? []).map((s) => ({ titulo: s.titulo, concluida: s.concluida }))}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="tarefa-${tarefa.titulo.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
