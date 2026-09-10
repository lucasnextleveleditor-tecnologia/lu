import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { substituir } from "@/lib/utils/texto";
import { FichaPdfDocument, type SecaoPdf } from "@/lib/pdf/FichaPdfDocument";
import { CANAIS_COMUNICACAO, OBJETIVOS_ONBOARDING, REDES_SOCIAIS, type OnboardingRow } from "@/lib/types/onboarding";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * O briefing em PDF — pra imprimir, arquivar ou mandar por e-mail.
 *
 * Mesmo padrão das outras rotas de PDF do sistema (`api/contratos/[id]/pdf`,
 * `api/producao/tarefas/[id]/pdf`): `@react-pdf/renderer`, texto de verdade,
 * protegida pelo mesmo `requireModuloOuRedirect` — a sessão vem do cookie e
 * a RLS escopa a consulta por empresa, então um id de outra agência
 * simplesmente não devolve linha.
 *
 * O CONTEÚDO é montado aqui, e não no componente do PDF. É aqui que existe o
 * dicionário e o formatador de moeda; o componente recebe rótulos e valores
 * já prontos e não precisa saber nem o idioma nem o que é um ROAS.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ clienteId: string }> }) {
  const { clienteId } = await params;
  const { supabase } = await requireModuloOuRedirect("clientes");
  const { dict, locale, fmtMoeda } = await getDictionary();
  const nomeApp = await getNomeApp();
  const t = dict.onboarding;

  const [clienteRes, onbRes] = await Promise.all([
    supabase.from("clientes").select("nome").eq("id", clienteId).maybeSingle<{ nome: string }>(),
    supabase.from("cliente_onboarding").select("*").eq("cliente_id", clienteId).maybeSingle<OnboardingRow>(),
  ]);

  if (!clienteRes.data) return new NextResponse("Cliente não encontrado.", { status: 404 });
  const o = onbRes.data;

  const data = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(locale) : null);
  const num = (n: number | null) => (n === null || n === undefined ? null : n.toLocaleString(locale));
  const moeda = (n: number | null) => (n === null || n === undefined ? null : fmtMoeda(n));

  const rotuloObjetivo = (v: string | null) => {
    if (!v || !OBJETIVOS_ONBOARDING.includes(v as (typeof OBJETIVOS_ONBOARDING)[number])) return null;
    return v === "leads" ? t.objetivoLeads
      : v === "vendas" ? t.objetivoVendas
      : v === "branding" ? t.objetivoBranding
      : v === "comunidade" ? t.objetivoComunidade
      : t.objetivoOutro;
  };
  const rotuloCanal = (v: string | null) => {
    if (!v || !CANAIS_COMUNICACAO.includes(v as (typeof CANAIS_COMUNICACAO)[number])) return null;
    return v === "whatsapp" ? t.canalWhatsapp
      : v === "slack" ? t.canalSlack
      : v === "email" ? t.canalEmail
      : v === "telefone" ? t.canalTelefone
      : v === "teams" ? t.canalTeams
      : v === "discord" ? t.canalDiscord
      : t.canalOutro;
  };

  const secoes: SecaoPdf[] = [
    {
      titulo: t.etapa1Titulo,
      campos: [
        { rotulo: t.ofertaPrincipal, valor: o?.oferta_principal ?? null },
        { rotulo: t.ticketMedio, valor: moeda(o?.ticket_medio ?? null) },
        { rotulo: t.propostaUnicaValor, valor: o?.proposta_unica_valor ?? null },
        { rotulo: t.publicoAlvo, valor: o?.publico_alvo ?? null },
        { rotulo: t.personas, valor: o?.personas ?? null },
        { rotulo: t.jornadaVendas, valor: o?.jornada_vendas ?? null },
        { rotulo: t.concorrentes, valor: null, tipo: "lista", itens: o?.concorrentes ?? [] },
      ],
    },
    {
      titulo: t.etapa2Titulo,
      campos: [
        { rotulo: t.manualMarcaUrl, valor: o?.manual_marca_url ?? null, tipo: "link" },
        // As cores viram etiquetas com o hex escrito. Desenhar o quadradinho
        // colorido seria bonito e inútil no papel: o que se copia daqui é o
        // código, não a cor.
        { rotulo: t.paletaCores, valor: null, tipo: "lista", itens: o?.paleta_cores ?? [] },
        { rotulo: t.tomDeVoz, valor: o?.tom_de_voz ?? null },
        { rotulo: t.diretrizesMarca, valor: o?.diretrizes_marca ?? null },
        { rotulo: t.driveAtivosUrl, valor: o?.drive_ativos_url ?? null, tipo: "link" },
      ],
    },
    {
      titulo: t.etapa3Titulo,
      campos: [
        { rotulo: t.objetivoPrincipal, valor: rotuloObjetivo(o?.objetivo_principal ?? null) },
        { rotulo: t.objetivoDescricao, valor: o?.objetivo_descricao ?? null },
        { rotulo: t.roasAlvo, valor: num(o?.roas_alvo ?? null) },
        { rotulo: t.cpaAlvo, valor: moeda(o?.cpa_alvo ?? null) },
        { rotulo: t.metaLeadsMes, valor: num(o?.meta_leads_mes ?? null) },
        { rotulo: t.metaFaturamentoMes, valor: moeda(o?.meta_faturamento_mes ?? null) },
        { rotulo: t.historicoMarketing, valor: o?.historico_marketing ?? null },
      ],
    },
    {
      titulo: t.etapa4Titulo,
      campos: [
        { rotulo: t.metaAdsId, valor: o?.meta_ads_id ?? null },
        { rotulo: t.googleAdsId, valor: o?.google_ads_id ?? null },
        { rotulo: t.ga4Id, valor: o?.ga4_id ?? null },
        { rotulo: t.pixelId, valor: o?.pixel_id ?? null },
        {
          rotulo: t.redesSociais,
          valor: null,
          tipo: "lista",
          itens: REDES_SOCIAIS.map((rede) => {
            const url = (o?.redes_sociais ?? {})[rede];
            return url ? `${rede}: ${url}` : "";
          }).filter(Boolean),
        },
        { rotulo: t.siteUrl, valor: o?.site_url ?? null, tipo: "link" },
        { rotulo: t.cmsUtilizado, valor: o?.cms_utilizado ?? null },
        { rotulo: t.cmsObservacoes, valor: o?.cms_observacoes ?? null },
        { rotulo: t.crmUtilizado, valor: o?.crm_utilizado ?? null },
        { rotulo: t.ferramentasObservacoes, valor: o?.ferramentas_observacoes ?? null },
      ],
    },
    {
      titulo: t.etapa5Titulo,
      campos: [
        { rotulo: t.decisorNome, valor: o?.decisor_nome ?? null },
        { rotulo: t.decisorCargo, valor: o?.decisor_cargo ?? null },
        { rotulo: t.decisorEmail, valor: o?.decisor_email ?? null },
        { rotulo: t.aprovadorWhatsapp, valor: o?.aprovador_whatsapp ?? null },
        { rotulo: t.canalComunicacao, valor: rotuloCanal(o?.canal_comunicacao ?? null) },
        { rotulo: t.observacoesOperacionais, valor: o?.observacoes_operacionais ?? null },
      ],
    },
  ];

  const meta: { rotulo: string; valor: string }[] = [];
  const concluido = data(o?.concluido_em ?? null);
  if (concluido) meta.push({ rotulo: t.statusConcluido, valor: concluido });
  if (o?.respondido_por_nome) {
    meta.push({
      rotulo: t.seuNome,
      valor: o.respondido_por_nome + (data(o.respondido_em) ? ` (${data(o.respondido_em)})` : ""),
    });
  }
  meta.push({ rotulo: t.colAtualizado, valor: data(o?.updated_at ?? null) ?? "—" });

  const buffer = await renderToBuffer(
    <FichaPdfDocument
      clienteNome={clienteRes.data.nome}
      eyebrow={t.tituloPagina}
      subtitulo={t.subtituloPagina}
      meta={meta}
      secoes={secoes}
      textoVazio={t.statusNaoIniciado}
      rodape={substituir(t.pdfRodape, { app: nomeApp, data: new Date().toLocaleDateString(locale) })}
    />
  );

  // `inline` abre na aba, que é onde se aperta Ctrl+P. Quem quer o arquivo
  // salva de lá; quem quer imprimir não precisa baixar antes.
  const nome = clienteRes.data.nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .toLowerCase();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="briefing-${nome || "cliente"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
