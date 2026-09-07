"use client";

import { useState } from "react";
import type { ClienteRow, EquipeMembroRow } from "@/lib/types/cadastros";
import type { ProfileRow } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ClientesManager } from "@/components/admin/cadastros/ClientesManager";
import { EquipeManager } from "@/components/admin/cadastros/EquipeManager";
import { IconUsers, IconBriefcase } from "@/components/ui/icons";

interface CadastrosWorkspaceProps {
  clientes: ClienteRow[];
  equipeMembros: EquipeMembroRow[];
  profilesPorId: Record<string, ProfileRow>;
  souAdmin: boolean;
}

type Aba = "clientes" | "equipe";

/**
 * Módulo Central de Cadastros — duas abas: Clientes (cadastro + Atividades &
 * Tarefas + Gerar Acesso ao dashboard do cliente) e Equipe (cadastro de RH +
 * Gerar Acesso/Permissões RBAC dos funcionários). A aba Equipe só aparece
 * pra admin — pra um funcionário (mesmo com a permissão "clientes" ligada),
 * gerenciar QUEM tem acesso ao quê nunca é delegável (ver
 * `lib/auth/requireAdmin.ts`).
 */
export function CadastrosWorkspace({ clientes, equipeMembros, profilesPorId, souAdmin }: CadastrosWorkspaceProps) {
  const [aba, setAba] = useState<Aba>("clientes");
  const { dict } = useLocale();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight">{dict.cadastros.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{dict.cadastros.subtituloPagina}</p>
      </div>

      <div className="mb-6 flex gap-1.5 border-b border-base-800">
        <button
          onClick={() => setAba("clientes")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
            aba === "clientes" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          <IconUsers className="h-4 w-4" /> {dict.cadastros.abaClientes}
        </button>
        {souAdmin && (
          <button
            onClick={() => setAba("equipe")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
              aba === "equipe" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
            )}
          >
            <IconBriefcase className="h-4 w-4" /> {dict.cadastros.abaEquipe}
          </button>
        )}
      </div>

      {aba === "clientes" || !souAdmin ? (
        <ClientesManager clientes={clientes} profilesPorId={profilesPorId} souAdmin={souAdmin} />
      ) : (
        <EquipeManager equipeMembros={equipeMembros} profilesPorId={profilesPorId} />
      )}
    </div>
  );
}
