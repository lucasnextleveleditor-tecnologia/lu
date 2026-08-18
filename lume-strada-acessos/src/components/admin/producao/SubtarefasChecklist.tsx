"use client";

import { useState, useTransition } from "react";
import type { SubtarefaRow } from "@/lib/types/producao";
import { criarSubtarefa, removerSubtarefa, toggleSubtarefa } from "@/app/admin/producao/actions";
import { calcularProgressoSubtarefas } from "@/lib/utils/producao";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function SubtarefasChecklist({ tarefaId, subtarefas }: { tarefaId: string; subtarefas: SubtarefaRow[] }) {
  const { dict } = useLocale();
  const [novoTitulo, setNovoTitulo] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const progresso = calcularProgressoSubtarefas(subtarefas);

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await criarSubtarefa(tarefaId, novoTitulo);
      if (!result.ok) setError(result.error);
      else setNovoTitulo("");
    });
  }

  function handleToggle(id: string, concluida: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleSubtarefa(id, concluida);
      if (!result.ok) setError(result.error);
    });
  }

  function handleRemover(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerSubtarefa(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.producao.subtarefas}</p>
        {progresso.total > 0 && (
          <span className="text-xs text-ink-secondary">
            {progresso.concluidas}/{progresso.total}
          </span>
        )}
      </div>

      {subtarefas.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {subtarefas.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg border border-base-700 bg-base-950/40 px-3 py-2">
              <input
                type="checkbox"
                checked={s.concluida}
                onChange={(e) => handleToggle(s.id, e.target.checked)}
                disabled={pending}
                className="h-4 w-4 shrink-0 rounded border-base-600 bg-base-900 accent-white"
              />
              <span className={s.concluida ? "flex-1 text-sm text-ink-muted line-through" : "flex-1 text-sm text-ink-primary"}>
                {s.titulo}
              </span>
              <button onClick={() => handleRemover(s.id)} disabled={pending} className="shrink-0 text-ink-muted transition hover:text-danger" aria-label={dict.producao.removerSubtarefaAria}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdicionar} className="flex gap-2">
        <Input
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          placeholder={dict.producao.subtarefaPlaceholder}
          className="flex-1"
        />
        <Button type="submit" variant="ghost" disabled={pending} className="shrink-0 px-3 py-2 text-xs">
          {dict.producao.adicionarAbrev}
        </Button>
      </form>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
