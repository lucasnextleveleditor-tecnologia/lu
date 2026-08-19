"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconClipboardList, IconMessageCircle } from "@/components/ui/icons";

interface LinkAcessoGeradoProps {
  link: string;
  titulo?: string;
  ajuda?: string;
  copiarLabel?: string;
  copiadoLabel?: string;
  whatsappLabel?: string;
}

/**
 * Bloco reaproveitado em TODO modal de "Gerar acesso" (Cliente, Funcionário,
 * Dono de empresa no Super Admin, conversão de Lead em Cliente) — mostra o
 * link devolvido por `gerarLinkConvite` (ver `lib/supabase/admin.ts`) com um
 * campo pra copiar manualmente e dois atalhos (Copiar / Abrir no WhatsApp).
 *
 * Existe porque o e-mail automático do Supabase (serviço embutido, usado
 * antes via `inviteUserByEmail`) tem um rate limit baixíssimo — pensado só
 * pra teste — e depende de "Redirect URLs" configurada certinho no
 * dashboard; qualquer um dos dois quebrando derrubava o convite inteiro sem
 * nenhum jeito de recuperar (o token é de uso único). Agora o link SEMPRE
 * fica disponível aqui, pra copiar e mandar manualmente por onde for melhor
 * (WhatsApp, e-mail, etc.) — nunca falha por limite de e-mail.
 */
export function LinkAcessoGerado({
  link,
  titulo = "Link de acesso gerado",
  ajuda = "Copie esse link e envie manualmente (WhatsApp, e-mail, etc.) — a pessoa usa ele pra criar a senha e entrar no painel. É de uso único e não expira imediatamente, mas evite deixar parado por muito tempo.",
  copiarLabel = "Copiar link",
  copiadoLabel = "Copiado!",
  whatsappLabel = "Abrir no WhatsApp",
}: LinkAcessoGeradoProps) {
  const [copiado, setCopiado] = useState(false);

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard API pode falhar (contexto não seguro, permissão negada
      // pelo navegador etc.) — sem bloquear ninguém: o link continua ali,
      // selecionável/copiável à mão no campo abaixo.
    }
  }

  function handleWhatsapp() {
    const texto = `Aqui está seu link de acesso: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-xl border border-status-good/30 bg-status-good/5 p-4">
      <p className="mb-1 text-sm font-medium text-ink-primary">{titulo}</p>
      <p className="mb-3 text-xs text-ink-muted">{ajuda}</p>

      <input
        readOnly
        value={link}
        onFocus={(e) => e.target.select()}
        className="mb-3 w-full truncate rounded-lg border border-base-700 bg-base-950 px-3 py-2 text-xs text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={handleCopiar} className="px-3 py-1.5 text-xs">
          {copiado ? <IconCheck className="h-3.5 w-3.5" /> : <IconClipboardList className="h-3.5 w-3.5" />}
          {copiado ? copiadoLabel : copiarLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={handleWhatsapp} className="px-3 py-1.5 text-xs">
          <IconMessageCircle className="h-3.5 w-3.5" />
          {whatsappLabel}
        </Button>
      </div>
    </div>
  );
}
