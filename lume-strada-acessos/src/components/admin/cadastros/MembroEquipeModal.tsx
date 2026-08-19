"use client";

import { useState, type FormEvent } from "react";
import type { EquipeMembroRow } from "@/lib/types/cadastros";
import { criarMembroEquipe, atualizarMembroEquipe } from "@/app/admin/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MembroEquipeModalProps {
  membro?: EquipeMembroRow | null;
  onClose: () => void;
}

export function MembroEquipeModal({ membro, onClose }: MembroEquipeModalProps) {
  const { dict } = useLocale();
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
          <h3 className="text-base font-semibold">{editando ? dict.cadastros.editarMembro : dict.cadastros.novoMembroTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.nomeCompletoLabel}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.cadastros.nomeFuncionarioPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.cargoFuncaoLabel}</label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder={dict.cadastros.cargoPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.email}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.cadastros.emailFuncionarioPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.telefone}</label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder={dict.cadastros.telefonePlaceholder} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.cadastros.criarMembro}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
