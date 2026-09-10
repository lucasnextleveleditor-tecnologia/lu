import { requireEquipeOuRedirect, buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarContagensDasFerramentas } from "./data";
import { CartaoDeFerramenta } from "@/components/admin/ferramentas/CartaoDeFerramenta";
import {
  IconCalculator,
  IconClipboardList,
  IconFilePlus,
  IconMessageCircle,
  IconMinimize,
  IconSignature,
  IconSitemap,
  IconTool,
} from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * Ferramentas: o que se USA, separado do que se GERENCIA.
 *
 * O menu lateral vinha crescendo com dois tipos de coisa misturados —
 * módulos que a pessoa acompanha (Financeiro, Produção, Comercial) e
 * ferramentas que ela abre para fazer uma tarefa e fecha em seguida (uma
 * ordem de externa, um mapa, uma simulação de preço). Numa lista vertical
 * as duas naturezas competem pelo mesmo espaço, e a barra fica longa demais
 * para varrer com o olho.
 *
 * Aqui as ferramentas ganham uma vitrine própria: grade, cor por
 * ferramenta, e o estado de cada uma à vista. A Ordem de Externa mantém o
 * atalho dentro de Produção — quem chega pelo quadro de tarefas continua
 * achando a folha do dia sem passar por aqui.
 */
export default async function FerramentasPage() {
  const { supabase, user } = await requireEquipeOuRedirect();
  const { dict, locale } = await getDictionary();
  const t = dict.ferramentas;
  const [perfil, contagens] = await Promise.all([
    buscarPerfilComPermissoes(supabase, user.id),
    buscarContagensDasFerramentas(supabase),
  ]);

  // Admin vê tudo; funcionário vê o que a permissão do módulo dono da
  // ferramenta liberar. O mapa mental não tem chave de propósito (ver
  // `requireEquipe`): é de quem trabalha na empresa, como o Dashboard.
  const ehAdmin = perfil?.role === "admin";
  const pode = (chave: "producao" | "orcamentos" | null) =>
    chave === null || ehAdmin || perfil?.permissoes?.[chave] === true;

  // Plural resolvido aqui, e não no dicionário: arquivo de tradução só pode
  // conter dado puro (ver a trava de serialização em `pt/index.ts`).
  const plural = (n: number, forma: { um: string; muitos: string; nenhum: string }) =>
    n === 0 ? forma.nenhum : n === 1 ? forma.um : forma.muitos.replace("{n}", n.toLocaleString(locale));

  const ferramentas = [
    {
      chave: "producao" as const,
      href: "/admin/producao/ordem-do-dia",
      icone: IconClipboardList,
      cor: "#f59e0b",
      titulo: t.ordemExternaTitulo,
      descricao: t.ordemExternaDescricao,
      meta: plural(contagens.ordensAtivas, t.ordensAtivas),
      destaque: contagens.ordensAtivas > 0,
    },
    {
      chave: null,
      href: "/admin/mapas",
      icone: IconSitemap,
      cor: "#8b5cf6",
      titulo: t.mapaMentalTitulo,
      descricao: t.mapaMentalDescricao,
      meta: plural(contagens.mapas, t.mapasCriados),
      destaque: contagens.mapas > 0,
    },
    {
      chave: "orcamentos" as const,
      href: "/admin/orcamentos/calculadora",
      icone: IconCalculator,
      cor: "#22d3a7",
      titulo: t.calculadoraTitulo,
      descricao: t.calculadoraDescricao,
      meta: t.calculadoraMeta,
      destaque: false,
    },
    {
      chave: "orcamentos" as const,
      href: "/admin/contratos/novo",
      icone: IconFilePlus,
      cor: "#38bdf8",
      titulo: t.criadorContratosTitulo,
      descricao: t.criadorContratosDescricao,
      meta: plural(contagens.contratosAguardando, t.contratosAguardando),
      destaque: contagens.contratosAguardando > 0,
    },
    {
      chave: null,
      href: "/admin/ferramentas/comprimir",
      icone: IconMinimize,
      cor: "#60a5fa",
      titulo: t.comprimirTitulo,
      descricao: t.comprimirDescricao,
      meta: t.comprimirMeta,
      destaque: false,
    },
    {
      chave: null,
      href: "/admin/ferramentas/link-whatsapp",
      icone: IconMessageCircle,
      cor: "#25d366",
      titulo: t.linkWhatsappTitulo,
      descricao: t.linkWhatsappDescricao,
      meta: t.linkWhatsappMeta,
      destaque: false,
    },
    {
      chave: "orcamentos" as const,
      href: "/admin/assinaturas",
      icone: IconSignature,
      cor: "#f472b6",
      titulo: t.assinaturaTitulo,
      descricao: t.assinaturaDescricao,
      meta: plural(contagens.documentosAguardando, t.documentosAguardando),
      destaque: contagens.documentosAguardando > 0,
    },
  ].filter((f) => pode(f.chave));

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
          <IconTool className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ferramentas.map((f) => (
          <CartaoDeFerramenta
            key={f.href}
            href={f.href}
            icone={f.icone}
            cor={f.cor}
            titulo={f.titulo}
            descricao={f.descricao}
            meta={f.meta}
            destaque={f.destaque}
          />
        ))}
      </div>
    </div>
  );
}
