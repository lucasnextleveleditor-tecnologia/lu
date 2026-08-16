"use client";

import { useState, type FormEvent } from "react";
import { criarCategoria } from "@/app/admin/financeiro/actions";
import { PALETA_CATEGORIAS } from "@/lib/utils/financeiro";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";

export function NovaCategoriaModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [emoji, setEmoji] = useState("");
  const [cor, setCor] = useState<string | null>(PALETA_CATEGORIAS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await criarCategoria({ nome, tipo, cor: tipo === "receita" ? null : cor, emoji: emoji || null });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">Nova Categoria</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_4.5rem] gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome *</label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Software & Assinaturas" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Emoji</label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🏷️" className="text-center text-base" maxLength={4} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Tipo *</label>
            <Select required value={tipo} onChange={(e) => setTipo(e.target.value as "receita" | "despesa")}>
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </Select>
          </div>

          {tipo === "despesa" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Cor</label>
              <div className="flex flex-wrap gap-2">
                {PALETA_CATEGORIAS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setCor(hex)}
                    aria-label={`Escolher cor ${hex}`}
                    className={cn("h-7 w-7 rounded-full transition", cor === hex && "ring-2 ring-ink-primary ring-offset-2 ring-offset-base-900")}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
