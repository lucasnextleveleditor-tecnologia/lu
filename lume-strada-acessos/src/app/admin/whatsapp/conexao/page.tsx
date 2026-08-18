import { createClient } from "@/lib/supabase/server";
import type { SessaoWhatsappRow } from "@/lib/types/whatsapp";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { ConexaoWhatsapp } from "@/components/admin/whatsapp/ConexaoWhatsapp";

export const dynamic = "force-dynamic";

export default async function WhatsappConexaoPage() {
  const supabase = await createClient();
  const { dict } = await getDictionary();

  const { data: sessao, error } = await supabase
    .from("whatsapp_sessoes")
    .select("id, status, numero_conectado, qr_code_base64, bateria_percentual, ultima_atualizacao, conectado_em, created_at, updated_at")
    .eq("singleton", true)
    .maybeSingle()
    .overrideTypes<SessaoWhatsappRow | null, { merge: false }>();

  if (error) {
    return (
      <p className="text-sm text-danger">
        {dict.whatsapp.erroCarregarSessao} {error.message}
      </p>
    );
  }

  if (!sessao) {
    return (
      <p className="text-sm text-ink-muted">
        {dict.whatsapp.sessaoNaoInicializadaPrefixo} <span className="font-mono text-xs">supabase/whatsapp.sql</span>{" "}
        {dict.whatsapp.sessaoNaoInicializadaSufixo}
      </p>
    );
  }

  return <ConexaoWhatsapp sessaoInicial={sessao} />;
}
