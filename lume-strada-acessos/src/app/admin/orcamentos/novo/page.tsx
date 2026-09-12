import Link from "next/link";
import { redirect } from "next/navigation";
import type { SVGProps } from "react";
import { IconChevronLeft } from "@/components/ui/icons";
import { ICONE_DO_PERFIL } from "@/components/ui/icons-perfis";
import { CabecalhoDaEscolha, GradeDeEscolha, type OpcaoDeEscolha } from "@/components/admin/orcamentos/EscolhaEmCartoes";
import { OrcamentoBuilder } from "@/components/admin/orcamentos/OrcamentoBuilder";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosConstrutor } from "@/app/admin/orcamentos/data";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";
import { listarModelosPorPerfil } from "@/lib/contratos/modelos";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";

export const dynamic = "force-dynamic";

/**
 * Orçamento novo, em três telas: profissão → tipo de trabalho → construtor.
 *
 * Antes era uma tela só, e a profissão era uma fileira de pílulas perdida no
 * meio do formulário — do lado de "validade em dias". Só que a profissão
 * decide o catálogo, os textos e o modelo de contrato do orçamento inteiro;
 * ela não é um campo, é a primeira decisão. Duas telas de escolha antes do
 * formulário deixam isso na cara e ainda tiram dois campos de um formulário
 * que já era longo.
 *
 * O passo mora na URL (`?perfil=...&servico=...`), e não em estado de React,
 * de propósito: o botão voltar do navegador funciona, dá para mandar o link
 * de um passo pra alguém, e recarregar não perde nada.
 *
 * As duas primeiras telas NÃO tocam o banco — a lista de profissões e a de
 * tipos são constantes do código. Elas abrem instantâneas; a única consulta
 * do fluxo (`buscarDadosConstrutor`) só acontece quando o construtor entra.
 */

const CAMINHO = "/admin/orcamentos/novo";

/** "Do zero" não é um modelo: é a saída para quem não quer nenhum. */
const SERVICO_LIVRE = "livre";

function ehPerfil(valor: string | undefined): valor is PerfilOrcamento {
  return !!valor && (CATEGORIAS_PORTFOLIO as readonly string[]).includes(valor);
}

/** A folha em branco. Traço interrompido: é o único cartão que não traz nada pronto. */
function IconDoZero(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.4" strokeDasharray="3 3" />
      <path d="M12 8.6 V15.4" />
      <path d="M8.6 12 H15.4" />
    </svg>
  );
}

export default async function NovoOrcamentoPage({ searchParams }: { searchParams: Promise<{ perfil?: string; servico?: string }> }) {
  const { dict } = await getDictionary();
  const t = dict.orcamentos;
  const { perfil: perfilParam, servico: servicoParam } = await searchParams;

  const perfil = ehPerfil(perfilParam) ? perfilParam : null;

  // ---------------------------------------------------------------------------
  // Passo 1 — a profissão
  // ---------------------------------------------------------------------------
  if (!perfil) {
    const opcoes: OpcaoDeEscolha[] = CATEGORIAS_PORTFOLIO.map((p) => ({
      href: `${CAMINHO}?perfil=${p}`,
      titulo: t.categoriasProfissao[p],
      texto: t.escolhaPerfilTextos[p],
      Icone: ICONE_DO_PERFIL[p],
    }));

    return (
      <div>
        <VoltarPara href="/admin/orcamentos" texto={t.voltarParaOrcamentos} />
        <CabecalhoDaEscolha
          etiqueta={t.escolhaEtiqueta}
          passo={t.escolhaPasso1}
          titulo={t.escolhaPerfilTitulo}
          destaque={t.escolhaPerfilTituloDestaque}
          subtitulo={t.escolhaPerfilSubtitulo}
        />
        <GradeDeEscolha opcoes={opcoes} rotuloAcao={t.escolhaAcao} />
      </div>
    );
  }

  const modelos = listarModelosPorPerfil(perfil);
  const servicoValido =
    servicoParam === SERVICO_LIVRE || (!!servicoParam && modelos.some((m) => m.tipoServico === servicoParam)) ? servicoParam! : null;

  // ---------------------------------------------------------------------------
  // Passo 2 — o tipo de trabalho dentro da profissão
  // ---------------------------------------------------------------------------
  if (!servicoValido) {
    // Profissão sem nenhum modelo pronto não ganha uma tela com um cartão só
    // dizendo "do zero": seria pedir um clique para não oferecer escolha
    // nenhuma. Ela pula direto para o construtor.
    if (modelos.length === 0) redirect(`${CAMINHO}?perfil=${perfil}&servico=${SERVICO_LIVRE}`);

    const opcoes: OpcaoDeEscolha[] = [
      ...modelos.map((m) => ({
        href: `${CAMINHO}?perfil=${perfil}&servico=${m.tipoServico}`,
        titulo: m.nome,
        texto: m.descricao,
        Icone: ICONE_DO_PERFIL[perfil],
      })),
      {
        href: `${CAMINHO}?perfil=${perfil}&servico=${SERVICO_LIVRE}`,
        titulo: t.escolhaServicoLivreTitulo,
        texto: t.escolhaServicoLivreTexto,
        Icone: IconDoZero,
      },
    ];

    return (
      <div>
        <VoltarPara href={CAMINHO} texto={t.escolhaTrocarPerfil} />
        <CabecalhoDaEscolha
          etiqueta={t.categoriasProfissao[perfil]}
          passo={t.escolhaPasso2}
          titulo={t.escolhaServicoTitulo}
          destaque={t.escolhaServicoTituloDestaque}
          subtitulo={t.escolhaServicoSubtitulo}
        />
        <GradeDeEscolha opcoes={opcoes} rotuloAcao={t.escolhaAcao} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Passo 3 — o construtor, já sabendo para quem e para quê
  // ---------------------------------------------------------------------------
  const { categorias, servicosComCategoria, clientes, tiposOrcamento, portfolioItens, institucional } = await buscarDadosConstrutor();

  return (
    <div className="space-y-6">
      <div>
        <VoltarPara href={`${CAMINHO}?perfil=${perfil}`} texto={t.escolhaVoltarParaTipos} />
        <h1 className="text-lg font-semibold tracking-tight">{t.novoOrcamentoBtn}</h1>
      </div>

      <OrcamentoBuilder
        categorias={categorias}
        servicosComCategoria={servicosComCategoria}
        clientes={clientes}
        tiposOrcamento={tiposOrcamento}
        portfolioItens={portfolioItens}
        institucional={institucional}
        perfilInicial={perfil}
        servicoInicial={servicoValido === SERVICO_LIVRE ? null : servicoValido}
      />
    </div>
  );
}

function VoltarPara({ href, texto }: { href: string; texto: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-ink-primary">
      <IconChevronLeft className="h-3.5 w-3.5" />
      {texto}
    </Link>
  );
}
