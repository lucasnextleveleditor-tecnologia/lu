"use client";

import { useState, type FormEvent } from "react";
import type { FinContexto } from "@/lib/types/financeiro";
import { criarConta } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function NovaContaModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [contexto, setContexto] = useState<FinContexto>("profissional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await criarConta({
      nome,
      tipo: tipo || null,
      saldoInicial: Number(saldoInicial) || 0,
      contexto,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">Nova Conta / Carteira</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome *</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Conta Corrente Nubank" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Tipo (opcional)</label>
              <Input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Corrente, Poupança..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Contexto</label>
              <Select value={contexto} onChange={(e) => setContexto(e.target.value as FinContexto)}>
                <option value="profissional">Profissional</option>
                <option value="pessoal">Pessoal</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Saldo Inicial (R$)</label>
            <Input type="number" step="0.01" value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} />
            <p className="mt-1 text-xs text-ink-muted">O saldo atual é sempre recalculado a partir das transações lançadas.</p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
