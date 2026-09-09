import Link from "next/link";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { buscarDadosContratos } from "@/app/admin/contratos/data";
import { EscolherOrigemAssinatura } from "@/components/admin/contratos/EscolherOrigemAssinatura";
import { IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * De onde vem o contrato que vai ser assinado.
 *
 * Os dois caminhos terminam no MESMO editor de assinatura — marcar onde cada
 * um assina, mandar os links, receber o PDF carimbado com o manifesto. O que
 * muda é só a origem do arquivo: um contrato montado aqui, que vira PDF na
 * hora, ou um PDF que já veio pronto de fora.
 */
export default async function AssinarContratoPage() {
  await requireModuloOuRedirect("orcamentos");
  const { contratos } = await buscarDadosContratos({});

  return (
    <div className="mx-auto max-w-3xl py-6">
      <Link
        href="/admin/contratos"
        className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        Contratos
      </Link>

      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight">Assinar contrato</h1>
        <p className="mt-0.5 text-sm text-ink-muted">De onde vem o contrato?</p>
      </div>

      <EscolherOrigemAssinatura
        contratos={contratos.map((c) => ({
          id: c.id,
          titulo: c.titulo,
          cliente: c.cliente_nome ?? c.nome_cliente,
          status: c.status,
          total: c.total,
          criadoEm: c.created_at,
        }))}
      />
    </div>
  );
}
