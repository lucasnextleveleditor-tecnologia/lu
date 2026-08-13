"use client";

import { useState, useTransition } from "react";
import type { ProfileRow } from "@/lib/types/database";
import { calcularStatus, fmtDataHora } from "@/lib/utils/status";
import { atualizarExpiracao, alternarAtivo } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** yyyy-mm-dd para o <input type="date"> — vazio se não houver expiração. */
function paraInputDate(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function UserRow({ profile }: { profile: ProfileRow }) {
  const [expiresAtInput, setExpiresAtInput] = useState(paraInputDate(profile.expires_at));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const status = calcularStatus(profile);

  function handleExpiracaoBlur() {
    if (paraInputDate(profile.expires_at) === expiresAtInput) return; // nada mudou
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
    <tr className="border-b border-base-800 last:border-0">
      <td className="py-3 pr-4">
        <p className="text-sm font-medium text-ink-primary">{profile.full_name || "Sem nome"}</p>
        <p className="text-xs text-ink-muted">{profile.email}</p>
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs capitalize text-ink-secondary">{profile.role === "admin" ? "Administrador" : "Cliente"}</span>
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={status} />
      </td>
      <td className="py-3 pr-4">
        <Input
          type="date"
          value={expiresAtInput}
          onChange={(e) => setExpiresAtInput(e.target.value)}
          onBlur={handleExpiracaoBlur}
          disabled={pending || profile.role === "admin"}
          className="w-40"
        />
      </td>
      <td className="py-3 pr-4">
        <p className="text-xs text-ink-muted">{fmtDataHora(profile.created_at)}</p>
      </td>
      <td className="py-3 text-right">
        {profile.role !== "admin" && (
          <Button
            variant={profile.active ? "danger" : "ghost"}
            onClick={handleToggleAtivo}
            disabled={pending}
            className="text-xs px-3 py-1.5"
          >
            {pending ? "..." : profile.active ? "Suspender" : "Reativar"}
          </Button>
        )}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}
