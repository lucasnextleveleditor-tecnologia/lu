"use client";

import { useState, type FormEvent } from "react";
import type { CompanyRow } from "@/lib/types/super-admin";
import { criarEmpresa, atualizarEmpresa } from "@/app/super-admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { LIMITE_PADRAO_MB } from "@/lib/armazenamento/limites";

interface EmpresaModalProps {
  empresa?: CompanyRow | null;
  onClose: () => void;
}

/** yyyy-mm-dd pro DatePicker — vazio se não houver expiração. */
function paraInputDate(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function EmpresaModal({ empresa, onClose }: EmpresaModalProps) {
  const [nome, setNome] = useState(empresa?.nome ?? "");
  const [expiresAt, setExpiresAt] = useState(paraInputDate(empresa?.expires_at ?? null));
  // Vazio = segue o padrão do sistema. Guardado em GB porque é assim que se
  // fala com o cliente ("cinco giga"), não em MB.
  const [limiteGb, setLimiteGb] = useState(
    empresa?.limite_armazenamento_mb ? String(empresa.limite_armazenamento_mb / 1024) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(empresa);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const digitado = Number(limiteGb.replace(",", "."));
    const input = {
      nome,
      expiresAt: expiresAt || null,
      limiteGb: limiteGb.trim() === "" || !Number.isFinite(digitado) ? null : digitado,
    };
    const result = empresa ? await atualizarEmpresa(empresa.id, input) : await criarEmpresa(input);

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
          <h3 className="text-base font-semibold">{editando ? "Editar empresa" : "Nova empresa"}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome da empresa</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Agência Horizonte" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Data de expiração da licença</label>
            <DatePicker value={expiresAt} onChange={setExpiresAt} clearable />
            <p className="mt-1 text-xs text-ink-muted">Deixe em branco para uma licença sem data de expiração.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Limite de armazenamento (GB)</label>
            <Input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={limiteGb}
              onChange={(e) => setLimiteGb(e.target.value)}
              placeholder={`Padrão: ${LIMITE_PADRAO_MB / 1024} GB`}
            />
            <p className="mt-1 text-xs text-ink-muted">
              Em branco = {LIMITE_PADRAO_MB / 1024} GB, o padrão do sistema (e acompanha o padrão se ele mudar).
              Preencha só para vender espaço extra a um cliente específico.
            </p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editando ? "Salvar alterações" : "Criar empresa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
