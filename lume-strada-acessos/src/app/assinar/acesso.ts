import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AssinaturaDocumentoRow,
  CampoAssinaturaRow,
  SignatarioRow,
} from "@/lib/types/assinatura";

/**
 * Quem abre um link de assinatura.
 *
 * Aqui NÃO se exige conta, e isso é uma decisão, não um esquecimento: um
 * contrato vai para o cliente que ainda não é cadastrado, para a produtora
 * parceira, para o modelo que trabalhou um dia. Obrigar cada um a criar
 * login antes de assinar mataria o uso.
 *
 * O que sustenta o documento no lugar do login é o CONJUNTO registrado no
 * ato: token único por pessoa (32 caracteres aleatórios, um por signatário),
 * e-mail para quem foi enviado, IP, data e hora, navegador, CPF digitado — e
 * o hash do arquivo, tirado no envio. Nenhum desses sozinho prova nada;
 * juntos e imutáveis, são o que se apresenta se alguém contestar.
 */
export interface AcessoAssinatura {
  documento: AssinaturaDocumentoRow;
  signatario: SignatarioRow;
  campos: CampoAssinaturaRow[];
  /** Quem vem antes na fila e ainda não assinou, quando a ordem é obrigatória. */
  esperando: SignatarioRow | null;
}

export async function buscarPorToken(token: string): Promise<AcessoAssinatura | null> {
  const admin = createAdminClient();

  const { data: signatario } = await admin
    .from("assinatura_signatarios")
    .select("*")
    .eq("token", token)
    .maybeSingle<SignatarioRow>();
  if (!signatario) return null;

  const { data: documento } = await admin
    .from("assinatura_documentos")
    .select("*")
    .eq("id", signatario.documento_id)
    .maybeSingle<AssinaturaDocumentoRow>();
  // Rascunho não abre: o link só vale depois de o documento ser enviado.
  if (!documento || documento.status === "rascunho" || documento.status === "cancelado") return null;

  const [camposRes, filaRes] = await Promise.all([
    admin.from("assinatura_campos").select("*").eq("signatario_id", signatario.id).order("pagina"),
    admin
      .from("assinatura_signatarios")
      .select("*")
      .eq("documento_id", documento.id)
      .lt("ordem", signatario.ordem)
      .order("ordem"),
  ]);

  const esperando = documento.ordem_obrigatoria
    ? ((filaRes.data ?? []) as SignatarioRow[]).find((s) => s.status !== "assinado") ?? null
    : null;

  return {
    documento,
    signatario,
    campos: (camposRes.data ?? []) as CampoAssinaturaRow[],
    esperando,
  };
}

/**
 * De onde veio quem está acessando.
 *
 * `x-forwarded-for` traz a cadeia de proxies; o PRIMEIRO endereço é o do
 * visitante, os seguintes são a infraestrutura pelo caminho. Pegar o último
 * registraria o servidor da Vercel em todos os documentos — inútil como
 * prova.
 */
export async function origemDaRequisicao(): Promise<{ ip: string | null; userAgent: string | null }> {
  const h = await headers();
  const encadeado = h.get("x-forwarded-for");
  const ip = encadeado?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  return { ip, userAgent: h.get("user-agent") };
}

/** URL assinada de validade curta para o PDF — o bucket é privado. */
export async function urlDoArquivo(caminho: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.storage.from("assinaturas").createSignedUrl(caminho, 60 * 60);
  return data?.signedUrl ?? null;
}
