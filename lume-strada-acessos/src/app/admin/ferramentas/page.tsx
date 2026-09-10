import { requireEquipeOuRedirect, buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { buscarContagensDasFerramentas } from "./data";
import { CartaoDeFerramenta } from "@/components/admin/ferramentas/CartaoDeFerramenta";
import {
  IconCalculator,
  IconClipboardList,
  IconFilePlus,
  IconSignature,
  IconSitemap,
  IconTool,
  IconMinimize,
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

  const plural = (n: number, um: string, muitos: string, nenhum: string) =>
    n === 0 ? nenhum : n === 1 ? `1 ${um}` : `${n} ${muitos}`;

  const ferramentas = [
    {
      chave: "producao" as const,
      href: "/admin/producao/ordem-do-dia",
      icone: IconClipboardList,
      cor: "#f59e0b",
      titulo: "Ordem de Externa",
      descricao:
        "A folha que todo mundo recebe na véspera: onde é, a que horas, quem vai estar e o que vai ser gravado.",
      meta: plural(contagens.ordensAtivas, "ordem ativa", "ordens ativas", "nenhuma ordem ativa"),
      destaque: contagens.ordensAtivas > 0,
    },
    {
      chave: null,
      href: "/admin/mapas",
      icone: IconSitemap,
      cor: "#8b5cf6",
      titulo: "Mapa Mental",
      descricao:
        "Pensar em conjunto e ao vivo: ideias, roteiro e estrutura de projeto, com a equipe editando o mesmo mapa.",
      meta: plural(contagens.mapas, "mapa", "mapas", "nenhum mapa ainda"),
      destaque: contagens.mapas > 0,
    },
    {
      chave: "orcamentos" as const,
      href: "/admin/orcamentos/calculadora",
      icone: IconCalculator,
      cor: "#22d3a7",
      titulo: "Calculadora de Orçamento",
      descricao:
        "Simule custo, imposto e margem antes de mandar o preço — o mesmo motor de cálculo usado nas propostas.",
      meta: "Simulação livre, nada é salvo",
      destaque: false,
    },
    {
      chave: "orcamentos" as const,
      href: "/admin/contratos/novo",
      icone: IconFilePlus,
      cor: "#38bdf8",
      titulo: "Criador de Contratos",
      descricao:
        "Monte o contrato cláusula a cláusula a partir dos modelos da sua profissão, com prévia paginada antes de enviar.",
      meta: plural(
        contagens.contratosAguardando,
        "contrato aguardando assinatura",
        "contratos aguardando assinatura",
        "nenhum contrato aguardando"
      ),
      destaque: contagens.contratosAguardando > 0,
    },
    {
      chave: null,
      href: "/admin/ferramentas/comprimir",
      icone: IconMinimize,
      cor: "#60a5fa",
      titulo: "Comprimir Arquivo",
      descricao:
        "Vídeo, PDF ou imagem grande demais para mandar? Escolha o tamanho final e a conversão acontece aqui mesmo, no seu navegador.",
      meta: "Não gasta armazenamento da conta",
      destaque: false,
    },
    {
      chave: "orcamentos" as const,
      href: "/admin/assinaturas",
      icone: IconSignature,
      cor: "#f472b6",
      titulo: "Assinatura de Contratos",
      descricao:
        "Suba um PDF pronto, marque onde cada pessoa assina e mande por link — com registro de IP, data e hash.",
      meta: plural(
        contagens.documentosAguardando,
        "documento aguardando",
        "documentos aguardando",
        "nenhum documento aguardando"
      ),
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
          <h1 className="text-lg font-semibold tracking-tight">Ferramentas</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            O que você abre para fazer uma coisa e fechar em seguida — separado dos módulos que você acompanha.
          </p>
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
