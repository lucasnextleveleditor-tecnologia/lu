"use client";

import { useMemo, useState } from "react";
import type { ProfileRow } from "@/lib/types/database";
import { calcularStatus } from "@/lib/utils/status";
import { UserRow } from "@/components/admin/UserRow";
import { InviteClientModal } from "@/components/admin/InviteClientModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { IconUsers, IconCheckCircle, IconAlertTriangle, IconPauseCircle } from "@/components/ui/icons";

export function UsersTable({ users }: { users: ProfileRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  // Contagem por status é sempre derivada (nunca gravada) — mesma regra de
  // `calcularStatus` usada linha a linha na tabela, só agregada aqui pros
  // KPIs do topo.
  const resumo = useMemo(() => {
    const contagem = { ativo: 0, inativo: 0, expirado: 0 };
    users.forEach((u) => {
      contagem[calcularStatus(u)]++;
    });
    return contagem;
  }, [users]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Clientes & Acessos</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Convidar Cliente</Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconUsers} label="Total de Usuários" value={users.length} />
        <StatTile icon={IconCheckCircle} label="Ativos" value={resumo.ativo} tone="good" />
        <StatTile icon={IconAlertTriangle} label="Expirados" value={resumo.expirado} tone="critical" />
        <StatTile icon={IconPauseCircle} label="Inativos" value={resumo.inativo} tone="neutral" />
      </div>

      <Card className="overflow-x-auto p-0">
        {users.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">Nenhum usuário cadastrado ainda.</div>
        ) : (
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">Usuário</th>
                <th className="px-0 py-3 font-medium">Papel</th>
                <th className="px-0 py-3 font-medium">Status</th>
                <th className="px-0 py-3 font-medium">Expira em</th>
                <th className="px-0 py-3 font-medium">Cadastrado em</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {users.map((profile) => (
                <UserRow key={profile.id} profile={profile} />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modalOpen && <InviteClientModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
