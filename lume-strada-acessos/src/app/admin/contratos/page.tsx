import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { IconFilePlus, IconSignature, IconChevronRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * A porta de Contratos.
 *
 * São dois trabalhos diferentes, e quem chega aqui já sabe qual dos dois
 * veio fazer: montar um contrato novo, ou pôr um contrato para assinar.
 * Abrir direto na lista obrigava quem vinha assinar a entender primeiro uma
 * tela de histórico que não tem nada a ver com o que ele queria.
 *
 * Por isso a escolha vem antes, e é só ela: dois caminhos, sem números nem
 * lista por baixo competindo pela atenção.
 */
export default async function ContratosPage() {
  await requireModuloOuRedirect("orcamentos");

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight">Contratos</h1>
        <p className="mt-0.5 text-sm text-ink-muted">O que você quer fazer?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CaminhoCard
          href="/admin/contratos/lista"
          icone={<IconFilePlus className="h-5 w-5" />}
          titulo="Criar contrato"
          texto="Monte o contrato aqui dentro a partir dos seus modelos, com itens, valores e cláusulas — e veja os que você já criou."
        />
        <CaminhoCard
          href="/admin/contratos/assinar"
          icone={<IconSignature className="h-5 w-5" />}
          titulo="Assinar contrato"
          texto="Ponha um contrato para assinar: um que você criou aqui, ou um PDF que já veio pronto de fora."
        />
      </div>
    </div>
  );
}

function CaminhoCard({
  href,
  icone,
  titulo,
  texto,
}: {
  href: string;
  icone: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-base-700 bg-base-900/60 p-5 transition hover:border-accent/40 hover:bg-base-900"
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-base-800 text-accent transition group-hover:bg-accent/10">
        {icone}
      </span>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
        {titulo}
        <IconChevronRight className="h-3.5 w-3.5 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{texto}</p>
    </Link>
  );
}
