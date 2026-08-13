import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { mesParam } from "@/lib/utils/financeiro";

const OPCOES = [
  { value: "todos", label: "Todos" },
  { value: "profissional", label: "Profissional" },
  { value: "pessoal", label: "Pessoal" },
] as const;

/** Alterna o filtro Pessoal/Profissional/Todos — mesmo padrão de navegação por link (sem JS no cliente). */
export function ContextoToggle({ referencia, contexto }: { referencia: Date; contexto: string }) {
  return (
    <div className="inline-flex rounded-lg border border-base-700 bg-base-900/60 p-1">
      {OPCOES.map((opcao) => {
        const active = contexto === opcao.value;
        const href = `/admin/financeiro?mes=${mesParam(referencia)}${opcao.value !== "todos" ? `&contexto=${opcao.value}` : ""}`;
        return (
          <Link
            key={opcao.value}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition",
              active ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            {opcao.label}
          </Link>
        );
      })}
    </div>
  );
}
