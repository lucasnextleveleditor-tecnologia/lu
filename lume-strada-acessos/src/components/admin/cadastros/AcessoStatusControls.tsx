"use client";

import { useState, useTransition } from "react";
import type { ProfileRow } from "@/lib/types/database";
import { calcularStatus, fmtDataHora } from "@/lib/utils/status";
import { atualizarExpiracao, alternarAtivo } from "@/app/admin/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** yyyy-mm-dd para o <input type="date"> — vazio se não houver expiração. */
function paraInputDate(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

interface AcessoStatusControlsProps {
  profile: ProfileRow;
  /** Só admin pode editar (suspender/reativar, mudar expiração) — quem só tem a permissão do módulo vê o status mas não mexe nele. */
  editavel: boolean;
}

/** Bloco reaproveitado tanto no detalhe de um Cliente quanto no modal de Acesso de um Funcionário — mesma lógica que já existia em `UserRow`, extraída pra um componente só (agora usado nos dois lugares). */
export function AcessoStatusControls({ profile, editavel }: AcessoStatusControlsProps) {
  const { dict } = useLocale();
  const [expiresAtInput, setExpiresAtInput] = useState(paraInputDate(profile.expires_at));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const status = calcularStatus(profile);

  function handleExpiracaoBlur() {
    if (paraInputDate(profile.expires_at) === expiresAtInput) return;
    setError(null);
    startTransition(async () => {
      const result = await atualizarExpiracao(profile.id, expiresAtInput || null);
      if (!result.ok) setError(result.error);
    });
  }

  function handleToggleAtivo() {
    setError(null);
    startTransition(async () => {
      const result = await alternarAtivo(profile.id, !profile.active);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={status} />
        <span className="text-xs text-ink-muted">
          {dict.cadastros.loginLabel} {profile.email}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.expiraEmLabel}</label>
          <Input
            type="date"
            value={expiresAtInput}
            onChange={(e) => setExpiresAtInput(e.target.value)}
            onBlur={handleExpiracaoBlur}
            disabled={pending || !editavel}
            className="w-40"
          />
        </div>
        {editavel && (
          <Button variant={profile.active ? "danger" : "ghost"} onClick={handleToggleAtivo} disabled={pending} className="px-3 py-2 text-xs">
            {pending ? "..." : profile.active ? dict.cadastros.suspenderAcesso : dict.cadastros.reativarAcesso}
          </Button>
        )}
      </div>

      <p className="text-xs text-ink-muted">
        {dict.cadastros.cadastradoEmLabel} {fmtDataHora(profile.created_at)}
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
