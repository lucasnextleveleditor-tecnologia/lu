import { createClient } from "@/lib/supabase/server";
import type { SessaoWhatsappRow } from "@/lib/types/whatsapp";
import { ConexaoWhatsapp } from "@/components/admin/whatsapp/ConexaoWhatsapp";

export const dynamic = "force-dynamic";

export default async function WhatsappConexaoPage() {
  const supabase = await createClient();

  const { data: sessao, error } = await supabase
    .from("whatsapp_sessoes")
    .select("id, status, numero_conectado, qr_code_base64, bateria_percentual, ultima_atualizacao, conectado_em, created_at, updated_at")
    .eq("singleton", true)
    .maybeSingle()
    .overrideTypes<SessaoWhatsappRow | null, { merge: false }>();

  if (error) {
    return <p className="text-sm text-danger">Erro ao carregar a sessão: {error.message}</p>;
  }

  if (!sessao) {
    return (
      <p className="text-sm text-ink-muted">
        Sessão ainda não inicializada — rode <span className="font-mono text-xs">supabase/whatsapp.sql</span> no seu projeto Supabase.
      </p>
    );
  }

  return <ConexaoWhatsapp sessaoInicial={sessao} />;
}
