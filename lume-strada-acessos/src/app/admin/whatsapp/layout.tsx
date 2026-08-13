import { WhatsappNav } from "@/components/admin/whatsapp/WhatsappNav";

export default function WhatsappLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">WhatsApp</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Atendimento via WhatsApp e conexão do número da agência.</p>
      </div>

      <WhatsappNav />
      {children}
    </div>
  );
}
