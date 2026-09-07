import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { mesParam } from "@/lib/utils/financeiro";
import { getDictionary } from "@/lib/i18n/getDictionary";

interface ContextoToggleProps {
  referencia: Date;
  contexto: string;
  /** Rota base — ver mesmo comentário em `MesNav`. */
  basePath?: string;
}

/** Alterna o filtro Pessoal/Profissional/Todos — mesmo padrão de navegação por link (sem JS no cliente). */
export async function ContextoToggle({ referencia, contexto, basePath = "/admin/financeiro" }: ContextoToggleProps) {
  const { dict } = await getDictionary();
  const OPCOES = [
    { value: "todos", label: dict.common.todos },
    { value: "profissional", label: dict.financeiro.contextoProfissional },
    { value: "pessoal", label: dict.financeiro.contextoPessoal },
  ] as const;

  return (
    <div className="inline-flex rounded-lg border border-base-700 bg-base-900/60 p-1">
      {OPCOES.map((opcao) => {
        const active = contexto === opcao.value;
        const href = `${basePath}?mes=${mesParam(referencia)}${opcao.value !== "todos" ? `&contexto=${opcao.value}` : ""}`;
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
