import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { buscarContratoPorId, buscarLogoDoContrato } from "@/app/admin/contratos/data";
import { calcularTotalContrato } from "@/lib/types/contratos";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { ContratoPdfDocument } from "@/lib/pdf/ContratoPdfDocument";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PDF de texto real (ver comentário em `ContratoPdfDocument.tsx`) de um
 * contrato do painel admin — protegido pelo mesmo `requireModuloOuRedirect`
 * já usado dentro de `buscarContratoPorId` (sessão via cookie + RLS por
 * empresa); sem sessão válida, essa chamada redireciona pro login, nunca
 * vaza o PDF de outra empresa.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const [contrato, nomeEmpresa, logoUrl] = await Promise.all([buscarContratoPorId(id), getNomeApp(), buscarLogoDoContrato()]);

  const buffer = await renderToBuffer(
    <ContratoPdfDocument
      empresaNome={nomeEmpresa}
      logoUrl={logoUrl}
      titulo={contrato.titulo}
      nomeCliente={contrato.cliente_nome ?? contrato.nome_cliente}
      itens={contrato.itens.map((i) => ({ nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valor_unitario }))}
      total={calcularTotalContrato(contrato.itens)}
      clausulas={contrato.clausulas}
      assinatura={
        contrato.assinado_nome && contrato.assinado_em
          ? { nome: contrato.assinado_nome, data: new Date(contrato.assinado_em).toLocaleDateString("pt-BR"), ip: contrato.assinado_ip }
          : null
      }
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${contrato.titulo.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
