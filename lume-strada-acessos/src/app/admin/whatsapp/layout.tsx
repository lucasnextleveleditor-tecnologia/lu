import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { WhatsappNav } from "@/components/admin/whatsapp/WhatsappNav";

export default async function WhatsappLayout({ children }: { children: React.ReactNode }) {
  await requireModuloOuRedirect("whatsapp");
  const { dict } = await getDictionary();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{dict.whatsapp.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.whatsapp.descricaoPagina}</p>
      </div>

      <WhatsappNav />
      {children}
    </div>
  );
}
