"use client";

import { useEffect, useState } from "react";
import type { BannerTone } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { IconMegaphone, IconExternalLink } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Conteúdo já resolvido do banner — usado por `AdminShell`/`dashboard/layout.tsx` pra tipar a prop `banner` que recebem prontas do Server Component (`null` quando `banner_ativo_*` daquela superfície é falso ou o título está vazio). */
export interface BannerConfig {
  titulo: string;
  descricao: string;
  linkUrl: string | null;
  linkLabel: string;
  imgUrl: string | null;
  tone: BannerTone;
  dispensavel: boolean;
  /** Muda sempre que o CONTEÚDO do banner muda (`${titulo}|${descricao}|${updated_at}`) — editar o banner faz ele reaparecer pra quem já tinha fechado a versão anterior. */
  chaveDispensa: string;
}

interface AnnouncementBannerProps extends BannerConfig {
  className?: string;
}

// Mesmo espírito do badge sólido de ícone do `StatTile` (branco/status,
// nunca uma cor "decorativa" nova) — só reaproveitado aqui em vez de
// importado porque `StatTile` não exporta o mapa (é local ao componente).
const TONE_BADGE: Record<BannerTone, string> = {
  neutral: "bg-accent text-base-950",
  good: "bg-status-good text-base-950",
  warning: "bg-status-warning text-base-950",
  critical: "bg-status-critical text-white",
};

const STORAGE_KEY = "lsf_banner_dispensado";

/**
 * Banner de destaque configurável em Aparência — o mesmo componente é
 * reaproveitado nas 3 superfícies onde pode aparecer (Login, área
 * Admin/Funcionário, Portal do Cliente); quem decide SE aparece em cada uma
 * é o call site (`branding.banner_ativo_*`), este componente só decide
 * "tem conteúdo?" e "já foi dispensado nesse navegador?".
 *
 * Fica escondido no primeiro render (SSR não tem acesso a `localStorage`) e
 * só aparece depois do `useEffect` checar a dispensa — evita mismatch de
 * hidratação às custas de um pop-in de ~1 frame, aceitável pra um banner.
 */
export function AnnouncementBanner({
  titulo,
  descricao,
  linkUrl,
  linkLabel,
  imgUrl,
  tone,
  dispensavel,
  chaveDispensa,
  className,
}: AnnouncementBannerProps) {
  const { dict } = useLocale();
  const [hidratado, setHidratado] = useState(false);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    const salvo = dispensavel ? window.localStorage.getItem(STORAGE_KEY) : null;
    setDispensado(Boolean(salvo && salvo === chaveDispensa));
    setHidratado(true);
  }, [chaveDispensa, dispensavel]);

  if (!titulo.trim() || !hidratado || dispensado) return null;

  function handleDispensar() {
    window.localStorage.setItem(STORAGE_KEY, chaveDispensa);
    setDispensado(true);
  }

  if (imgUrl) {
    return (
      <div
        className={cn(
          "relative isolate flex min-h-[104px] items-center overflow-hidden rounded-2xl border border-base-700 p-5",
          "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05),0_20px_40px_-28px_rgb(var(--glow-rgb) / 0.35)]",
          className
        )}
        style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 -z-10 bg-base-950/70" />
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-white">{titulo}</p>
            {descricao && <p className="mt-1 text-sm text-white/80">{descricao}</p>}
          </div>
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-base-950 transition hover:bg-accent-strong"
            >
              {linkLabel}
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {dispensavel && (
          <button
            type="button"
            onClick={handleDispensar}
            aria-label={dict.aparencia.fecharBannerAriaLabel}
            className="ml-3 shrink-0 rounded-lg p-1 text-xl leading-none text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-2xl border border-base-700 bg-base-900/80 p-4 backdrop-blur-sm",
        "shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05),0_20px_40px_-28px_rgb(var(--glow-rgb) / 0.35)]",
        className
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONE_BADGE[tone])}>
        <IconMegaphone className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-primary">{titulo}</p>
        {descricao && <p className="mt-0.5 text-sm text-ink-secondary">{descricao}</p>}
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-ink-primary underline decoration-ink-muted underline-offset-2 hover:decoration-ink-primary"
          >
            {linkLabel}
            <IconExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {dispensavel && (
        <button
          type="button"
          onClick={handleDispensar}
          aria-label="Fechar banner"
          className="shrink-0 rounded-lg p-1 text-xl leading-none text-ink-muted transition hover:bg-base-800 hover:text-ink-primary"
        >
          ×
        </button>
      )}
    </div>
  );
}
