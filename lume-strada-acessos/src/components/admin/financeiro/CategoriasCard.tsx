"use client";

import { useState, useTransition } from "react";
import type { CategoriaRow } from "@/lib/types/financeiro";
import { removerCategoria } from "@/app/admin/financeiro/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconTag } from "@/components/ui/icons";
import { NovaCategoriaModal } from "@/components/admin/financeiro/NovaCategoriaModal";
import { cn } from "@/lib/utils/cn";

/**
 * Chip de categoria — diferente do `Badge` genérico de status (só 4 tones
 * fixos): categoria usa uma cor arbitrária (`categoria.cor`, da paleta de
 * `PALETA_CATEGORIAS`) + emoji, escolhidos por categoria. Receita nunca leva
 * `cor` própria (fica sempre no verde de "entrada de dinheiro", igual antes
 * dessa mudança) — só despesa varia de cor. Emoji + nome sempre visíveis
 * junto da cor, então a cor nunca é a única portadora de identidade.
 */
function CategoriaChip({ categoria }: { categoria: CategoriaRow }) {
  const cor = categoria.tipo === "despesa" ? categoria.cor : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-ink-primary",
        !cor && (categoria.tipo === "receita" ? "border-status-good/30 bg-status-good/10" : "border-base-600 bg-base-800/50")
      )}
      style={cor ? { borderColor: `${cor}66`, backgroundColor: `${cor}22` } : undefined}
    >
      {categoria.emoji && <span aria-hidden>{categoria.emoji}</span>}
      {categoria.nome}
    </span>
  );
}

export function CategoriasCard({ categorias }: { categorias: CategoriaRow[] }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerCategoria(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTag className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold">Categorias</h2>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setModalAberto(true)}>
          + Nova
        </Button>
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      {categorias.length === 0 ? (
        <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
          Nenhuma categoria cadastrada ainda.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="group relative">
              {confirmando === categoria.id ? (
                <div className="flex items-center gap-1.5 rounded-full border border-status-critical/30 bg-status-critical/10 px-2.5 py-1 text-xs">
                  <span className="text-ink-primary">Excluir?</span>
                  <button onClick={() => handleExcluir(categoria.id)} disabled={pending} className="font-medium text-danger hover:underline">
                    Sim
                  </button>
                  <button onClick={() => setConfirmando(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                    Não
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmando(categoria.id)} className="block" title="Clique para excluir">
                  <CategoriaChip categoria={categoria} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAberto && <NovaCategoriaModal onClose={() => setModalAberto(false)} />}
    </Card>
  );
}
