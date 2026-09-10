import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { buscarOrcamentoPorId, buscarDadosInstitucionaisEmpresa } from "@/app/admin/orcamentos/data";
import { OrcamentoPdfDocument, type OrcamentoPdfItem, type OrcamentoPdfPortfolioItem } from "@/lib/pdf/OrcamentoPdfDocument";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PDF de texto real, multi-página (capa institucional + proposta) de um
 * orçamento do painel admin — ver comentário em `OrcamentoPdfDocument.tsx`.
 * Protegido pelo mesmo `requireModuloOuRedirect` já usado dentro de
 * `buscarOrcamentoPorId`/`buscarDadosInstitucionaisEmpresa` (sessão via
 * cookie + RLS por empresa); sem sessão válida, essa chamada redireciona
 * pro login, nunca vaza o PDF de outra empresa. Mesmo padrão de
 * `src/app/api/contratos/[id]/pdf/route.tsx`.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const [orcamento, institucional] = await Promise.all([buscarOrcamentoPorId(id), buscarDadosInstitucionaisEmpresa()]);

  const itensObrigatorios: OrcamentoPdfItem[] = orcamento.itens
    .filter((i) => !i.opcional)
    .map((i) => ({ nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valor_unitario }));

  const itensOpcionaisSelecionados: OrcamentoPdfItem[] = orcamento.itens
    .filter((i) => i.opcional && i.selecionado)
    .map((i) => ({ nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valor_unitario }));

  // Só imagens (vídeo não embute em PDF) — limitado a 9 pra não estourar a
  // página da capa (grid de 100x75pt cada, ver `OrcamentoPdfDocument.tsx`).
  const portfolio: OrcamentoPdfPortfolioItem[] = orcamento.portfolio
    .filter((item) => item.tipo_midia !== "video")
    .slice(0, 9)
    .map((item) => ({ url: item.url, titulo: item.titulo }));

  const { fmtMoeda } = await getDictionary();

  const buffer = await renderToBuffer(
    <OrcamentoPdfDocument
      fmtMoeda={fmtMoeda}
      institucional={institucional}
      titulo={orcamento.titulo}
      nomeDestinatario={orcamento.nome_destinatario}
      clienteNome={orcamento.cliente_nome}
      emailDestinatario={orcamento.email_destinatario}
      whatsappDestinatario={orcamento.whatsapp_destinatario}
      textoProposta={orcamento.texto_proposta}
      objetivos={orcamento.objetivos}
      itensObrigatorios={itensObrigatorios}
      itensOpcionaisSelecionados={itensOpcionaisSelecionados}
      subtotal={orcamento.subtotal}
      desconto={orcamento.desconto}
      total={orcamento.total}
      condicoesPagamento={orcamento.condicoes_pagamento}
      dataExpiracao={orcamento.data_expiracao}
      observacoes={orcamento.observacoes}
      portfolio={portfolio}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orcamento-${orcamento.titulo.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
