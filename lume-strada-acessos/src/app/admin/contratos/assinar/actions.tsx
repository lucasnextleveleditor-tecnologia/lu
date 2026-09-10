"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import { requireModulo } from "@/lib/auth/requireAdmin";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { buscarLogoDoContrato } from "@/app/admin/contratos/data";
import { ContratoPdfDocument } from "@/lib/pdf/ContratoPdfDocument";
import { hashDeBytes } from "@/lib/pdf/carimbarAssinaturas";
import { calcularTotalContrato } from "@/lib/types/contratos";
import type { ContratoRow, ContratoItemRow } from "@/lib/types/contratos";
import { getDictionary } from "@/lib/i18n/getDictionary";

/**
 * Pega um contrato montado aqui dentro e o transforma num documento de
 * assinatura.
 *
 * O PDF é gerado AGORA e congelado no Storage — não é um link que renderiza
 * o contrato de novo a cada abertura. É o ponto inteiro da coisa: o hash é
 * tirado desses bytes, e é sobre esses bytes que cada pessoa vai assinar. Se
 * o contrato fosse renderizado ao vivo, mexer numa cláusula depois mudaria,
 * silenciosamente, o documento que alguém já tinha assinado.
 *
 * Por isso também o contrato de origem não é apagado nem travado: os dois
 * passam a existir lado a lado, e o que vale para a assinatura é a fotografia
 * que ficou aqui.
 */
export async function prepararContratoParaAssinatura(
  contratoId: string
): Promise<{ ok: true; documentoId: string } | { ok: false; error: string }> {
  try {
    const { supabase, user, companyId } = await requireModulo("orcamentos");
    if (!companyId) return { ok: false, error: "Sua conta não está ligada a uma empresa." };

    // A leitura passa pelo RLS: um id de contrato de outra empresa não
    // devolve linha, e nada é gerado.
    const { data: contrato } = await supabase
      .from("contratos")
      .select("*, clientes(nome)")
      .eq("id", contratoId)
      .maybeSingle<ContratoRow & { clientes: { nome: string } | null }>();
    if (!contrato) return { ok: false, error: "Contrato não encontrado." };

    const [{ data: itens }, nomeApp, logoUrl] = await Promise.all([
      supabase.from("contratos_itens").select("*").eq("contrato_id", contratoId).order("ordem"),
      getNomeApp(),
      buscarLogoDoContrato(),
    ]);
    const listaItens = (itens ?? []) as ContratoItemRow[];

    // `assinatura` vai vazia de proposito: quem vai assinar e o editor de
    // campos, e duas assinaturas na mesma folha — uma impressa pelo sistema,
    // outra desenhada por quem assinou — so confundiriam quem le depois.
    const { fmtMoeda } = await getDictionary();

    const buffer = await renderToBuffer(
      <ContratoPdfDocument
      fmtMoeda={fmtMoeda}
        empresaNome={nomeApp}
        logoUrl={logoUrl}
        titulo={contrato.titulo}
        nomeCliente={contrato.clientes?.nome ?? contrato.nome_cliente}
        itens={listaItens.map((i) => ({
          nome: i.nome,
          descricao: i.descricao,
          quantidade: i.quantidade,
          valorUnitario: i.valor_unitario,
        }))}
        total={calcularTotalContrato(listaItens)}
        clausulas={contrato.clausulas}
        assinatura={null}
      />
    );

    const bytes = new Uint8Array(buffer);
    const paginas = (await PDFDocument.load(bytes)).getPageCount();

    const seguro = `contrato-${contrato.titulo}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).toLowerCase();
    const arquivoNome = `${seguro || "contrato"}.pdf`;
    // O caminho começa pelo id da empresa vindo do SERVIDOR — é esse primeiro
    // segmento que a política do bucket confere.
    const caminho = `${companyId}/${crypto.randomUUID()}-${arquivoNome}`;

    const { error: erroUpload } = await supabase.storage
      .from("assinaturas")
      .upload(caminho, bytes, { contentType: "application/pdf", upsert: false });
    if (erroUpload) return { ok: false, error: erroUpload.message };

    const { data: documento, error } = await supabase
      .from("assinatura_documentos")
      .insert({
        titulo: contrato.titulo,
        arquivo_path: caminho,
        arquivo_nome: arquivoNome,
        paginas: Math.max(1, paginas),
        hash_original: await hashDeBytes(bytes),
        criado_por: user.id,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !documento) {
      // O PDF já subiu; sem a linha ele seria lixo invisível no bucket.
      await supabase.storage.from("assinaturas").remove([caminho]);
      return { ok: false, error: error?.message ?? "Não foi possível criar o documento." };
    }

    await supabase.from("assinatura_eventos").insert({
      company_id: companyId,
      documento_id: documento.id,
      tipo: "criado",
      descricao: `Gerado do contrato "${contrato.titulo}" do sistema`,
    });

    revalidatePath("/admin/assinaturas");
    return { ok: true, documentoId: documento.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
