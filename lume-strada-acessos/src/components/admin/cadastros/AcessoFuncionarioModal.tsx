"use client";

import { useState } from "react";
import type { EquipeMembroRow } from "@/lib/types/cadastros";
import type { ProfileRow, PermissoesFuncionario } from "@/lib/types/database";
import { gerarAcessoFuncionario, atualizarPermissoes } from "@/app/admin/actions";
import { MODULOS_PERMISSAO } from "@/lib/utils/cadastros";
import { AcessoStatusControls } from "@/components/admin/cadastros/AcessoStatusControls";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";

interface AcessoFuncionarioModalProps {
  membro: EquipeMembroRow;
  profile: ProfileRow | null;
  onClose: () => void;
}

/**
 * Combina as duas situações num modal só: se o membro AINDA não tem acesso,
 * mostra o formulário de convite (e-mail + expiração) junto com os toggles
 * de permissão iniciais; se já tem, mostra o status de acesso (reaproveita
 * `AcessoStatusControls`) e os mesmos toggles, agora editando as permissões
 * já gravadas. Sempre admin-only — chamado só de dentro da aba Equipe, que
 * já é admin-only por inteiro.
 */
export function AcessoFuncionarioModal({ membro, profile, onClose }: AcessoFuncionarioModalProps) {
  const [email, setEmail] = useState(membro.email ?? "");
  const [expiresAt, setExpiresAt] = useState("");
  const [permissoes, setPermissoes] = useState<PermissoesFuncionario>(profile?.permissoes ?? {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const jaTemAcesso = Boolean(profile);

  function alternarPermissao(chave: keyof PermissoesFuncionario) {
    setPermissoes((atual) => ({ ...atual, [chave]: !atual[chave] }));
  }

  async function handleGerarAcesso() {
    if (!email.trim()) {
      setError("Informe um e-mail para o acesso.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await gerarAcessoFuncionario(membro.id, { email, permissoes, expiresAt: expiresAt || null });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  async function handleSalvarPermissoes() {
    if (!profile) return;
    setLoading(true);
    setError(null);
    setSalvo(false);
    const result = await atualizarPermissoes(profile.id, permissoes);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSalvo(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {jaTemAcesso ? "Permissões" : "Gerar Acesso"} — {membro.nome}
          </h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        {jaTemAcesso && profile && (
          <div className="mb-5 rounded-xl border border-base-800 bg-base-950/40 p-4">
            <AcessoStatusControls profile={profile} editavel />
          </div>
        )}

        {!jaTemAcesso && (
          <div className="mb-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">E-mail de login *</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="funcionario@agencia.com" />
              <p className="mt-1 text-xs text-ink-muted">Um convite com senha vai ser enviado pra esse e-mail.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Data de expiração (opcional)</label>
              <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
        )}

        <div className="mb-5">
          <p className="mb-1 text-sm font-semibold text-ink-primary">Módulos Liberados</p>
          <p className="mb-3 text-xs text-ink-muted">
            Bloqueie ou libere cada área do menu pra esse funcionário — ex: &quot;Bloquear Financeiro, Liberar Tarefas&quot;.
          </p>
          <div className="divide-y divide-base-800 rounded-xl border border-base-800">
            {MODULOS_PERMISSAO.map((modulo) => (
              <div key={modulo.chave} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm text-ink-primary">{modulo.label}</p>
                  <p className="text-xs text-ink-muted">{modulo.hint}</p>
                </div>
                <Switch checked={Boolean(permissoes[modulo.chave])} onChange={() => alternarPermissao(modulo.chave)} label={modulo.label} />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        {salvo && <p className="mb-3 text-sm text-ink-secondary">Permissões atualizadas.</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          {jaTemAcesso ? (
            <Button type="button" onClick={handleSalvarPermissoes} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Permissões"}
            </Button>
          ) : (
            <Button type="button" onClick={handleGerarAcesso} disabled={loading}>
              {loading ? "Enviando..." : "Gerar Acesso e Enviar Convite"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
