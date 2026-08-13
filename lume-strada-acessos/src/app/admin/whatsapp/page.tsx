import { createClient } from "@/lib/supabase/server";
import type { ContatoWhatsappRow } from "@/lib/types/whatsapp";
import { InboxWorkspace } from "@/components/admin/whatsapp/InboxWorkspace";

export const dynamic = "force-dynamic";

export default async function WhatsappInboxPage() {
  const supabase = await createClient();

  const { data: contatos, error } = await supabase
    .from("whatsapp_contatos")
    .select("id, telefone, nome, foto_url, lead_id, cliente_id, ultima_mensagem_preview, ultima_mensagem_em, created_at, updated_at")
    .order("ultima_mensagem_em", { ascending: false, nullsFirst: false })
    .overrideTypes<ContatoWhatsappRow[], { merge: false }>();

  if (error) {
    return <p className="text-sm text-danger">Erro ao carregar as conversas: {error.message}</p>;
  }

  return <InboxWorkspace contatosIniciais={contatos ?? []} />;
}
