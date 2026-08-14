"use client";

import { useMemo, useState, useTransition } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { ProfileRow } from "@/lib/types/database";
import { removerCliente } from "@/app/admin/actions";
import { calcularStatus } from "@/lib/utils/status";
import { temAcessoGerado } from "@/lib/utils/cadastros";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatTile } from "@/components/ui/StatTile";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { ClienteModal } from "@/components/admin/cadastros/ClienteModal";
import { ClienteDetalheModal } from "@/components/admin/cadastros/ClienteDetalheModal";
import { GerarAcessoClienteModal } from "@/components/admin/cadastros/GerarAcessoClienteModal";
import { IconUsers, IconKey, IconCheckCircle, IconPauseCircle } from "@/components/ui/icons";

interface ClientesManagerProps {
  clientes: ClienteRow[];
  profilesPorId: Record<string, ProfileRow>;
  souAdmin: boolean;
}

export function ClientesManager({ clientes, profilesPorId, souAdmin }: ClientesManagerProps) {
  const [busca, setBusca] = useState("");
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteRow | null>(null);
  const [clienteDetalhe, setClienteDetalhe] = useState<ClienteRow | null>(null);
  const [clienteGerandoAcesso, setClienteGerandoAcesso] = useState<ClienteRow | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resumo = useMemo(() => {
    let comAcesso = 0;
    let ativos = 0;
    clientes.forEach((c) => {
      if (temAcessoGerado(c)) {
        comAcesso++;
        const profile = profilesPorId[c.profile_id as string];
        if (profile && calcularStatus(profile) === "ativo") ativos++;
      }
    });
    return { comAcesso, semAcesso: clientes.length - comAcesso, ativos };
  }, [clientes, profilesPorId]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(termo) || c.documento?.toLowerCase().includes(termo) || c.email?.toLowerCase().includes(termo)
    );
  }, [clientes, busca]);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerCliente(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, CNPJ/CPF ou e-mail..." />
        </div>
        <Button onClick={() => setModalCriacaoAberto(true)} className="shrink-0">
          + Novo Cliente
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconUsers} label="Total de Clientes" value={clientes.length} hint="Cadastrados na base" />
        <StatTile icon={IconCheckCircle} label="Com Acesso Ativo" value={resumo.ativos} tone="good" hint="Dashboard liberado agora" />
        <StatTile icon={IconKey} label="Acesso Gerado" value={resumo.comAcesso} hint="Já receberam convite" />
        <StatTile icon={IconPauseCircle} label="Sem Acesso" value={resumo.semAcesso} tone="neutral" hint="Só cadastro, sem login" />
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <Card className="overflow-x-auto p-0">
        {filtrados.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {clientes.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado pra essa busca."}
          </div>
        ) : (
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-0 py-3 font-medium">Documento</th>
                <th className="px-0 py-3 font-medium">Contato</th>
                <th className="px-0 py-3 font-medium">Acesso</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {filtrados.map((cliente) => {
                const profile = cliente.profile_id ? profilesPorId[cliente.profile_id] : null;
                return (
                  <tr key={cliente.id} className="border-b border-base-800 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-ink-primary">{cliente.nome}</p>
                      {cliente.nome_responsavel && <p className="text-xs text-ink-muted">Resp.: {cliente.nome_responsavel}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{cliente.documento || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-ink-secondary">{cliente.email || "—"}</p>
                      <p className="text-xs text-ink-muted">{cliente.telefone || "—"}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {profile ? <StatusBadge status={calcularStatus(profile)} /> : <Badge tone="neutral" label="Sem acesso" />}
                    </td>
                    <td className="py-3 text-right">
                      {confirmandoExclusao === cliente.id ? (
                        <div className="flex justify-end gap-2">
                          <span className="text-xs text-ink-secondary">Excluir?</span>
                          <button
                            onClick={() => handleExcluir(cliente.id)}
                            disabled={pending}
                            className="text-xs font-medium text-danger hover:underline"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusao(null)}
                            disabled={pending}
                            className="text-xs text-ink-muted hover:text-ink-primary"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setClienteDetalhe(cliente)} className="px-3 py-1.5 text-xs">
                            Abrir
                          </Button>
                          {!cliente.profile_id && souAdmin && (
                            <Button variant="ghost" onClick={() => setClienteGerandoAcesso(cliente)} className="px-3 py-1.5 text-xs">
                              Gerar Acesso
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => setClienteEditando(cliente)} className="px-3 py-1.5 text-xs">
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setConfirmandoExclusao(cliente.id)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                          >
                            Excluir
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {modalCriacaoAberto && <ClienteModal onClose={() => setModalCriacaoAberto(false)} />}
      {clienteEditando && <ClienteModal cliente={clienteEditando} onClose={() => setClienteEditando(null)} />}
      {clienteDetalhe && (
        <ClienteDetalheModal
          cliente={clienteDetalhe}
          profile={clienteDetalhe.profile_id ? profilesPorId[clienteDetalhe.profile_id] ?? null : null}
          souAdmin={souAdmin}
          onClose={() => setClienteDetalhe(null)}
        />
      )}
      {clienteGerandoAcesso && <GerarAcessoClienteModal cliente={clienteGerandoAcesso} onClose={() => setClienteGerandoAcesso(null)} />}
    </div>
  );
}
