"use client";

import { useState, type FormEvent } from "react";
import type { EquipeMembroRow } from "@/lib/types/cadastros";
import { criarMembroEquipe, atualizarMembroEquipe } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MembroEquipeModalProps {
  membro?: EquipeMembroRow | null;
  onClose: () => void;
}

export function MembroEquipeModal({ membro, onClose }: MembroEquipeModalProps) {
  const [nome, setNome] = useState(membro?.nome ?? "");
  const [cargo, setCargo] = useState(membro?.cargo ?? "");
  const [email, setEmail] = useState(membro?.email ?? "");
  const [telefone, setTelefone] = useState(membro?.telefone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(membro);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = { nome, cargo: cargo || null, email: email || null, telefone: telefone || null };
    const result = membro ? await atualizarMembroEquipe(membro.id, input) : await criarMembroEquipe(input);

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
          <h3 className="text-base font-semibold">{editando ? "Editar Membro" : "Novo Membro da Equipe"}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome Completo *</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do funcionário" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Cargo / Função</label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Editor, Designer, Gestor de Tráfego" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">E-mail</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="funcionario@agencia.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Telefone</label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editando ? "Salvar Alterações" : "Criar Membro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
