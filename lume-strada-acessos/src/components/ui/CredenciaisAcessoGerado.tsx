"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconClipboardList, IconMessageCircle } from "@/components/ui/icons";

interface CredenciaisAcessoGeradoProps {
  email: string;
  senhaPadrao: string;
  titulo?: string;
  ajuda?: string;
  copiarLabel?: string;
  copiadoLabel?: string;
  whatsappLabel?: string;
}

/**
 * Bloco reaproveitado em TODO modal de "Gerar acesso" (Cliente, Funcionário,
 * Dono de empresa no Super Admin, conversão de Lead em Cliente) — mostra o
 * e-mail + a senha provisória devolvidos por `criarAcessoComSenhaPadrao`
 * (ver `lib/supabase/admin.ts`), com um campo pra copiar e um atalho pra
 * abrir no WhatsApp.
 *
 * Substitui o antigo `LinkAcessoGerado` (link de convite via `generateLink`)
 * de propósito: depois de VÁRIAS rodadas de bugs encadeados só nesse fluxo
 * de convite (rate limit do e-mail embutido do Supabase, link caindo em
 * localhost, token de uso único queimado por pré-visualização de link no
 * WhatsApp/navegador, e por fim um bug real na rota de callback que fazia
 * TODO convite nunca terminar em "definir senha" — ver
 * `MIGRACAO-MULTI-TENANT.md` §8.1), o pedido explícito foi abandonar
 * token/link/e-mail de vez: toda conta nova já nasce com e-mail confirmado
 * e a senha padrão (`senha_provisoria = true` no profile). A pessoa loga
 * direto — sem link, sem token, sem depender de e-mail — e o próprio
 * `src/middleware.ts` obriga a trocar a senha em `/definir-senha` antes de
 * liberar qualquer outra tela.
 */
export function CredenciaisAcessoGerado({
  email,
  senhaPadrao,
  titulo = "Acesso gerado",
  ajuda = "Copie e envie manualmente (WhatsApp, e-mail, etc.). A pessoa loga com esse e-mail e essa senha, e o próprio painel vai obrigar a trocar a senha assim que ela entrar.",
  copiarLabel = "Copiar dados de acesso",
  copiadoLabel = "Copiado!",
  whatsappLabel = "Abrir no WhatsApp",
}: CredenciaisAcessoGeradoProps) {
  const [copiado, setCopiado] = useState(false);

  // URL do próprio painel, montada no navegador — sempre correta (nunca cai
  // em `localhost` por engano, o bug que já mordeu esse fluxo antes quando
  // dependia da env var `NEXT_PUBLIC_SITE_URL`).
  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

  const texto = `Seu acesso ao painel:\nLink: ${loginUrl}\nE-mail: ${email}\nSenha provisória: ${senhaPadrao}\n\nNo primeiro acesso, o próprio painel vai pedir pra você criar uma senha nova.`;

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard API pode falhar (contexto não seguro, permissão negada
      // pelo navegador etc.) — sem bloquear ninguém: e-mail/senha continuam
      // visíveis ali embaixo pra copiar à mão.
    }
  }

  function handleWhatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-xl border border-status-good/30 bg-status-good/5 p-4">
      <p className="mb-1 text-sm font-medium text-ink-primary">{titulo}</p>
      <p className="mb-3 text-xs text-ink-muted">{ajuda}</p>

      <div className="mb-3 space-y-2">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">E-mail</p>
          <input
            readOnly
            value={email}
            onFocus={(e) => e.target.select()}
            className="w-full truncate rounded-lg border border-base-700 bg-base-950 px-3 py-2 text-xs text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">Senha provisória</p>
          <input
            readOnly
            value={senhaPadrao}
            onFocus={(e) => e.target.select()}
            className="w-full truncate rounded-lg border border-base-700 bg-base-950 px-3 py-2 text-xs text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          />
        </div>
      </div>

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
