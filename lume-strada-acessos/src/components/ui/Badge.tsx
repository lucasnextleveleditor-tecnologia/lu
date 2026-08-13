import { cn } from "@/lib/utils/cn";
import { TONE_META, type Tone } from "@/lib/utils/tone";

/**
 * Badge genérico de estado — usado tanto pro status de acesso (Ativo/
 * Inativo/Expirado) quanto pro status de tráfego (Abaixo da Meta/No
 * Caminho/Meta Batida). O texto SEMPRE fica em `ink-primary` (nunca na cor
 * do tone) — só a bolinha, a borda e o fundo (bem sutil, /15) carregam a
 * cor. Cor nunca é a única portadora de significado: sempre vem com rótulo.
 */
export function Badge({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  const meta = TONE_META[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", meta.badgeClassName, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dotClassName)} />
      {label}
    </span>
  );
}
