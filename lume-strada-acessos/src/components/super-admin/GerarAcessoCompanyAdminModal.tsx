"use client";

import { useState, type FormEvent } from "react";
import type { CompanyRow } from "@/lib/types/super-admin";
import { gerarAcessoCompanyAdmin } from "@/app/super-admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function GerarAcessoCompanyAdminModal({ empresa, onClose }: { empresa: CompanyRow; onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await gerarAcessoCompanyAdmin(empresa.id, { email, nome });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">Gerar acesso — {empresa.nome}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome do responsável</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome de quem vai logar como dono da empresa" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">E-mail de login</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dono@empresa.com" />
            <p className="mt-1 text-xs text-ink-muted">
              Enviamos um convite por e-mail para essa pessoa definir a própria senha. Ela entra com acesso total ao painel, restrito aos dados
              desta empresa.
            </p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Gerar acesso e enviar convite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
