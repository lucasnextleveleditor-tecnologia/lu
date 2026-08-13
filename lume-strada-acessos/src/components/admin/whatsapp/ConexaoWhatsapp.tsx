"use client";

import { useEffect, useState, useTransition } from "react";
import type { SessaoWhatsappRow } from "@/lib/types/whatsapp";
import { desconectarSessao, gerarQrCode } from "@/app/admin/whatsapp/actions";
import { STATUS_SESSAO_META } from "@/lib/utils/whatsapp";
import { fmtDataHora } from "@/lib/utils/status";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconQrCode, IconCheckCircle, IconBattery } from "@/components/ui/icons";

/**
 * Tela de Conexão (Device Management) — card centralizado com QR Code,
 * status e bateria. Se atualiza sozinha via Supabase Realtime (ver
 * `supabase/whatsapp.sql`, seção 5): quando o webhook do provedor grava um
 * novo QR Code ou muda o status da sessão, esse componente recebe o evento
 * e re-renderiza sem precisar de F5 — mesmo em outra aba/dispositivo.
 */
export function ConexaoWhatsapp({ sessaoInicial }: { sessaoInicial: SessaoWhatsappRow }) {
  const [sessao, setSessao] = useState(sessaoInicial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel(`whatsapp-sessao-${sessaoInicial.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "whatsapp_sessoes", filter: `id=eq.${sessaoInicial.id}` },
        (payload) => setSessao(payload.new as SessaoWhatsappRow)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [sessaoInicial.id]);

  function handleGerarQrCode() {
    setError(null);
    startTransition(async () => {
      const result = await gerarQrCode();
      if (!result.ok) setError(result.error);
    });
  }

  function handleDesconectar() {
    setError(null);
    startTransition(async () => {
      const result = await desconectarSessao();
      if (!result.ok) setError(result.error);
    });
  }

  const meta = STATUS_SESSAO_META[sessao.status];

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6 text-center">
        <div className="mb-4 flex items-center justify-center">
          <Badge tone={meta.tone} label={meta.label} />
        </div>

        <div className="mx-auto mb-5 flex h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border border-base-700 bg-base-950/60">
          {sessao.status === "conectado" ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center text-ink-secondary">
              <IconCheckCircle className="h-10 w-10 text-status-good" />
              <p className="text-sm">Sessão conectada</p>
            </div>
          ) : sessao.status === "aguardando_leitura" && sessao.qr_code_base64 ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL vinda do provedor, não faz sentido passar por next/image
            <img src={sessao.qr_code_base64} alt="QR Code do WhatsApp" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 text-center text-ink-muted">
              <IconQrCode className="h-10 w-10" />
              <p className="text-xs">Gere um QR Code pra conectar o número da empresa</p>
            </div>
          )}
        </div>

        {sessao.status === "conectado" && (
          <div className="mb-5 space-y-1.5 text-sm">
            {sessao.numero_conectado && <p className="text-ink-primary">{sessao.numero_conectado}</p>}
            {sessao.bateria_percentual != null && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
                <IconBattery className="h-3.5 w-3.5" />
                {sessao.bateria_percentual}% de bateria no aparelho
              </p>
            )}
          </div>
        )}

        {error && <p className="mb-3 text-xs text-danger">{error}</p>}

        <div className="flex justify-center gap-2">
          {sessao.status === "conectado" ? (
            <Button variant="danger" onClick={handleDesconectar} disabled={pending}>
              {pending ? "Desconectando..." : "Desconectar"}
            </Button>
          ) : (
            <Button onClick={handleGerarQrCode} disabled={pending}>
              {pending ? "Gerando..." : "Gerar QR Code"}
            </Button>
          )}
        </div>

        {sessao.ultima_atualizacao && (
          <p className="mt-4 text-[11px] text-ink-muted">Última atualização: {fmtDataHora(sessao.ultima_atualizacao)}</p>
        )}
      </Card>
    </div>
  );
}
