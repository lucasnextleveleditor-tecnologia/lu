"use server";

import { revalidatePath } from "next/cache";
import { requireModulo } from "@/lib/auth/requireAdmin";
import type { StatusContrato } from "@/lib/types/contratos";

/**
 * Os contratos vistos de dentro da ficha do cliente.
 *
 * Separado de `actions.ts` (que é o CRUD do contrato em si — cláusulas,
 * itens, envio, status) porque aqui a pergunta é outra: "o que este cliente
 * assinou?". Quem abre a ficha não quer editar o contrato, quer achá-lo.
 *
 * São três caminhos para um contrato chegar aqui:
 *   1. Nasceu no sistema JÁ com cliente — `criarContrato` grava `cliente_id`.
 *   2. Nasceu no sistema sem cliente (avulso, de um lead) e é vinculado
 *      depois, por `vincularContratoAoCliente`.
 *   3. Foi assinado fora (papel, Clicksign, DocuSign) e entra como
 *      `origem = 'externo'`: só a capa mais o link ou o PDF.
 */

const PATHS = ["/admin", "/admin/contratos/lista"];
const revalidar = () => PATHS.forEach((p) => revalidatePath(p));

const BUCKET_CONTRATOS = "contratos";
/** 20 MB — o mesmo teto do bucket, conferido aqui para a pessoa ouvir "grande demais" em vez de um erro do storage. */
const TAMANHO_MAX_BYTES = 20 * 1024 * 1024;
const TIPOS_ACEITOS = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

export type ResultadoContratoCliente = { ok: true } | { ok: false; error: string };

/** Um contrato do cliente, já resolvido para a tela: rótulo, data que vale e para onde o botão leva. */
export interface ContratoDoCliente {
  id: string;
  titulo: string;
  origem: "sistema" | "externo";
  status: StatusContrato;
  /** `assinado_em` para o do sistema, `assinado_fora_em` para o externo. `null` = ainda não assinado. */
  assinadoEm: string | null;
  criadoEm: string;
  /**
   * Onde o documento abre. Contrato do sistema vai para a página pública dele
   * (`/contrato/<token>`); externo vai para o link ou para uma URL assinada
   * do arquivo. `null` só acontece se o arquivo sumiu do storage.
   */
  href: string | null;
}

/** Contrato do sistema ainda sem dono — o que o botão "vincular" oferece. */
export interface ContratoVinculavel {
  id: string;
  titulo: string;
  nomeCliente: string;
  status: StatusContrato;
  criadoEm: string;
}

function mensagem(err: unknown): string {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}

interface LinhaContrato {
  id: string;
  titulo: string;
  origem: "sistema" | "externo";
  status: StatusContrato;
  token: string;
  assinado_em: string | null;
  assinado_fora_em: string | null;
  arquivo_url: string | null;
  arquivo_path: string | null;
  created_at: string;
}

export async function listarContratosDoCliente(clienteId: string): Promise<ContratoDoCliente[]> {
  try {
    const { supabase } = await requireModulo("clientes");

    const { data, error } = await supabase
      .from("contratos")
      .select("id, titulo, origem, status, token, assinado_em, assinado_fora_em, arquivo_url, arquivo_path, created_at")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })
      .overrideTypes<LinhaContrato[], { merge: false }>();

    if (error || !data) return [];

    // Uma URL assinada por arquivo, de uma hora. O bucket é privado porque um
    // contrato traz CNPJ, endereço e valores das duas partes — link público
    // aqui seria um documento dessas pessoas exposto a quem adivinhasse o
    // caminho.
    const comArquivo = data.filter((c) => c.arquivo_path);
    const assinadas = new Map<string, string>();
    await Promise.all(
      comArquivo.map(async (c) => {
        const { data: assinada } = await supabase.storage.from(BUCKET_CONTRATOS).createSignedUrl(c.arquivo_path!, 3600);
        if (assinada?.signedUrl) assinadas.set(c.id, assinada.signedUrl);
      })
    );

    return data.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      origem: c.origem,
      status: c.status,
      assinadoEm: c.origem === "externo" ? c.assinado_fora_em : c.assinado_em,
      criadoEm: c.created_at,
      href:
        c.origem === "sistema"
          ? `/contrato/${c.token}`
          : (c.arquivo_url?.trim() || assinadas.get(c.id) || null),
    }));
  } catch {
    return [];
  }
}

/**
 * Os contratos do sistema que ainda não têm cliente.
 *
 * Só os órfãos aparecem: oferecer um contrato que já é de OUTRO cliente
 * convidaria a roubar o documento de alguém com dois cliques, e desfazer isso
 * depois exige saber de quem era antes.
 */
export async function listarContratosSemCliente(): Promise<ContratoVinculavel[]> {
  try {
    const { supabase } = await requireModulo("clientes");
    const { data, error } = await supabase
      .from("contratos")
      .select("id, titulo, nome_cliente, status, created_at")
      .is("cliente_id", null)
      .eq("origem", "sistema")
      .order("created_at", { ascending: false })
      .limit(50)
      .overrideTypes<{ id: string; titulo: string; nome_cliente: string; status: StatusContrato; created_at: string }[], { merge: false }>();

    if (error || !data) return [];
    return data.map((c) => ({
      id: c.id,
      titulo: c.titulo,
      nomeCliente: c.nome_cliente,
      status: c.status,
      criadoEm: c.created_at,
    }));
  } catch {
    return [];
  }
}

export async function vincularContratoAoCliente(contratoId: string, clienteId: string): Promise<ResultadoContratoCliente> {
  try {
    const { supabase } = await requireModulo("clientes");

    // `.is("cliente_id", null)` na própria escrita: se alguém vinculou esse
    // contrato enquanto a lista estava aberta na tela, o update não pega nada
    // em vez de passar por cima do vínculo do outro.
    const { data, error } = await supabase
      .from("contratos")
      .update({ cliente_id: clienteId })
      .eq("id", contratoId)
      .is("cliente_id", null)
      .select("id");

    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) return { ok: false, error: "CONTRATO_JA_VINCULADO" };

    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Tira o contrato da ficha. Contrato do sistema só perde o vínculo (ele
 * continua na lista de Contratos); contrato EXTERNO é apagado, porque fora da
 * ficha do cliente ele não existe em lugar nenhum — seria uma linha invisível
 * para sempre.
 */
export async function desvincularContrato(contratoId: string): Promise<ResultadoContratoCliente> {
  try {
    const { supabase } = await requireModulo("clientes");

    const { data: contrato, error: erroLer } = await supabase
      .from("contratos")
      .select("id, origem, arquivo_path")
      .eq("id", contratoId)
      .maybeSingle<{ id: string; origem: "sistema" | "externo"; arquivo_path: string | null }>();
    if (erroLer) return { ok: false, error: erroLer.message };
    if (!contrato) return { ok: false, error: "CONTRATO_NAO_ENCONTRADO" };

    if (contrato.origem === "externo") {
      if (contrato.arquivo_path) {
        await supabase.storage.from(BUCKET_CONTRATOS).remove([contrato.arquivo_path]);
      }
      const { error } = await supabase.from("contratos").delete().eq("id", contratoId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("contratos").update({ cliente_id: null }).eq("id", contratoId);
      if (error) return { ok: false, error: error.message };
    }

    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}

/**
 * Anexa um contrato assinado FORA do sistema.
 *
 * Vem por `FormData` porque o arquivo vem por `FormData` — e ter um caminho só
 * para link e arquivo evita a versão em que os dois divergem e um contrato
 * entra sem documento nenhum.
 *
 * `clausulas` fica vazio de propósito: o texto do contrato externo está no
 * PDF, e copiá-lo para cá criaria uma segunda versão do documento que ninguém
 * mantém. `status` nasce 'assinado' — um contrato que veio de fora veio
 * assinado; é por isso que ele está sendo anexado.
 */
export async function anexarContratoExterno(formData: FormData): Promise<ResultadoContratoCliente> {
  try {
    const { supabase, companyId } = await requireModulo("clientes");

    const clienteId = String(formData.get("clienteId") ?? "").trim();
    const titulo = String(formData.get("titulo") ?? "").trim();
    const link = String(formData.get("link") ?? "").trim();
    const assinadoEm = String(formData.get("assinadoEm") ?? "").trim();
    const arquivo = formData.get("arquivo");

    if (!companyId) return { ok: false, error: "SEM_EMPRESA" };
    if (!clienteId) return { ok: false, error: "CONTRATO_SEM_CLIENTE" };

    // `nome_cliente` é `not null` na tabela e é o que a lista de Contratos
    // mostra. Vem do cadastro (razão social quando existe, senão o nome de
    // exibição) e não do título, que é o nome do DOCUMENTO.
    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .select("nome, razao_social")
      .eq("id", clienteId)
      .maybeSingle<{ nome: string; razao_social: string | null }>();
    if (erroCliente) return { ok: false, error: erroCliente.message };
    if (!cliente) return { ok: false, error: "CONTRATO_SEM_CLIENTE" };
    const nomeCliente = cliente.razao_social?.trim() || cliente.nome;
    if (!titulo) return { ok: false, error: "CONTRATO_SEM_TITULO" };

    const temArquivo = arquivo instanceof File && arquivo.size > 0;
    if (!link && !temArquivo) return { ok: false, error: "CONTRATO_SEM_DOCUMENTO" };
    if (link && temArquivo) return { ok: false, error: "CONTRATO_LINK_E_ARQUIVO" };

    if (link && !/^https?:\/\//i.test(link)) return { ok: false, error: "CONTRATO_LINK_INVALIDO" };

    let arquivoPath: string | null = null;
    if (temArquivo) {
      const file = arquivo as File;
      if (file.size > TAMANHO_MAX_BYTES) return { ok: false, error: "CONTRATO_ARQUIVO_GRANDE" };
      if (!TIPOS_ACEITOS.includes(file.type)) return { ok: false, error: "CONTRATO_ARQUIVO_TIPO" };

      // Caminho por empresa e por cliente, com um sufixo aleatório: dois PDFs
      // chamados "contrato.pdf" não podem se sobrescrever.
      const extensao = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase().slice(0, 5) : "pdf";
      arquivoPath = `${companyId}/${clienteId}/${crypto.randomUUID()}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from(BUCKET_CONTRATOS)
        .upload(arquivoPath, file, { contentType: file.type, upsert: false });
      if (erroUpload) return { ok: false, error: erroUpload.message };
    }

    const { error } = await supabase.from("contratos").insert({
      titulo,
      cliente_id: clienteId,
      nome_cliente: nomeCliente,
      origem: "externo",
      status: "assinado",
      clausulas: "",
      arquivo_url: link || null,
      arquivo_path: arquivoPath,
      assinado_fora_em: assinadoEm || null,
    });

    if (error) {
      // Insert falhou depois do upload: o arquivo ficaria órfão no bucket,
      // ocupando a cota da empresa sem nenhuma linha apontando para ele.
      if (arquivoPath) await supabase.storage.from(BUCKET_CONTRATOS).remove([arquivoPath]);
      return { ok: false, error: error.message };
    }

    revalidar();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mensagem(err) };
  }
}
