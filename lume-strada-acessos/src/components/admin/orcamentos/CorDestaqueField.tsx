"use client";

import { isValidHex, CORES_DESTAQUE_SUGERIDAS } from "@/lib/utils/color";
import { Input } from "@/components/ui/Input";
import { IconPalette } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

interface CorDestaqueFieldProps {
  /** String vazia = "sem cor customizada", usa o padrão do app. */
  value: string;
  onChange: (hex: string) => void;
}

/**
 * Seletor de cor de destaque DESTA proposta — hex livre + paleta rápida de
 * atalho (`CORES_DESTAQUE_SUGERIDAS`), mesma ideia de `THEME_PRESETS` em
 * Aparência mas escopada a uma cor só (aplicada via `buildPropostaAccentVars`
 * só dentro do preview/página pública, nunca no resto do painel admin).
 */
export function CorDestaqueField({ value, onChange }: CorDestaqueFieldProps) {
  const { dict } = useLocale();
  const hexValido = value.trim().length > 0 && isValidHex(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-base-600" style={{ backgroundColor: hexValido ? value : "transparent" }}>
          {!hexValido && (
            <div className="flex h-full w-full items-center justify-center bg-base-950">
              <IconPalette className="h-4 w-4 text-ink-muted" />
            </div>
          )}
          <input
            type="color"
            value={hexValido ? value : "#d946ef"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={dict.orcamentos.corDestaqueLabel}
          />
        </div>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#D946EF" className="max-w-[140px] font-mono" />
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs font-medium text-ink-muted hover:text-ink-primary">
            {dict.orcamentos.corDestaqueLimparBtn}
          </button>
        )}
      </div>
      <p className="text-xs text-ink-muted">{dict.orcamentos.corDestaqueHint}</p>
      <div>
        <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.corDestaquePaletaLabel}</p>
        <div className="flex flex-wrap gap-2">
          {CORES_DESTAQUE_SUGERIDAS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => onChange(hex)}
              className={cn("h-7 w-7 rounded-full border-2 transition", value.toLowerCase() === hex.toLowerCase() ? "border-ink-primary" : "border-transparent")}
              style={{ backgroundColor: hex }}
              aria-label={hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
