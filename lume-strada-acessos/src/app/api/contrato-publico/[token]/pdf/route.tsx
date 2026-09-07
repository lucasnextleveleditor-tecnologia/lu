import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContratoRow, ContratoItemRow } from "@/lib/types/contratos";
import { calcularTotalContrato } from "@/lib/types/contratos";
import { ContratoPdfDocument } from "@/lib/pdf/ContratoPdfDocument";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * PDF de texto real do link público — mesma lógica de acesso de
 * `app/contrato/data.ts` (Service Role, token na URL é o único controle de
 * acesso), mas SEM o efeito colateral de marcar como visualizado: baixar o
 * PDF não é a mesma coisa que abrir a página, e chamar isso não deveria por
 * si só mudar o status do contrato.
 */
export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: contrato } = await admin.from("contratos").select("*, companies(nome)").eq("token", token).single<ContratoRow & { companies: { nome: string } | null }>();
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 });
  }

  const { data: itens } = await admin.from("contratos_itens").select("*").eq("contrato_id", contrato.id).order("ordem").overrideTypes<ContratoItemRow[], { merge: false }>();
  const itensResolvidos = itens ?? [];

  const buffer = await renderToBuffer(
    <ContratoPdfDocument
      empresaNome={contrato.companies?.nome ?? "Empresa"}
      titulo={contrato.titulo}
      nomeCliente={contrato.nome_cliente}
      itens={itensResolvidos.map((i) => ({ nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valor_unitario }))}
      total={calcularTotalContrato(itensResolvidos)}
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
