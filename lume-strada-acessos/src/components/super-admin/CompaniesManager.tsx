"use client";

import { useMemo, useState, useTransition } from "react";
import type { CompanyRow } from "@/lib/types/super-admin";
import { calcularStatusEmpresa, fmtData } from "@/lib/utils/status";
import { alternarStatusEmpresa, removerEmpresa } from "@/app/super-admin/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatTile } from "@/components/ui/StatTile";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IconBuilding, IconCheckCircle, IconPauseCircle, IconKey } from "@/components/ui/icons";
import { EmpresaModal } from "@/components/super-admin/EmpresaModal";
import { GerarAcessoCompanyAdminModal } from "@/components/super-admin/GerarAcessoCompanyAdminModal";
import { AcessosEmpresaModal } from "@/components/super-admin/AcessosEmpresaModal";

interface CompaniesManagerProps {
  companies: CompanyRow[];
  /** id da empresa -> quantidade de logins (admin/funcionário/cliente) já gerados nela. Empresa sem entrada aqui = zero acessos ainda. */
  acessosPorEmpresa: Record<string, number>;
}

export function CompaniesManager({ companies, acessosPorEmpresa }: CompaniesManagerProps) {
  const [busca, setBusca] = useState("");
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<CompanyRow | null>(null);
  const [empresaGerandoAcesso, setEmpresaGerandoAcesso] = useState<CompanyRow | null>(null);
  const [empresaVendoAcessos, setEmpresaVendoAcessos] = useState<CompanyRow | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resumo = useMemo(() => {
    let ativas = 0;
    let suspensas = 0;
    companies.forEach((c) => {
      if (calcularStatusEmpresa(c) === "ativo") ativas++;
      else suspensas++;
    });
    return { ativas, suspensas };
  }, [companies]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return companies;
    return companies.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [companies, busca]);

  function handleToggleStatus(empresa: CompanyRow) {
    setError(null);
    startTransition(async () => {
      const novoStatus = empresa.status === "ativo" ? "suspenso" : "ativo";
      const result = await alternarStatusEmpresa(empresa.id, novoStatus);
      if (!result.ok) setError(result.error);
    });
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerEmpresa(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar empresa..." />
        </div>
        <Button onClick={() => setModalCriacaoAberto(true)} className="shrink-0">
          + Nova empresa
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile icon={IconBuilding} label="Total de empresas" value={companies.length} hint="Licenças cadastradas" />
        <StatTile icon={IconCheckCircle} label="Ativas" value={resumo.ativas} tone="good" hint="Com acesso liberado agora" />
        <StatTile icon={IconPauseCircle} label="Suspensas ou expiradas" value={resumo.suspensas} tone="neutral" hint="Sem acesso ao painel" />
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <Card className="overflow-x-auto p-0">
        {filtradas.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {companies.length === 0 ? "Nenhuma empresa cadastrada ainda." : "Nenhuma empresa encontrada para essa busca."}
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">Empresa</th>
                <th className="px-0 py-3 font-medium">Status</th>
                <th className="px-0 py-3 font-medium">Expiração</th>
                <th className="px-0 py-3 font-medium">Acessos</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {filtradas.map((empresa) => (
                <tr key={empresa.id} className="border-b border-base-800 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-ink-primary">{empresa.nome}</p>
                    <p className="text-xs text-ink-muted">Cadastrada em {fmtData(empresa.created_at)}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={calcularStatusEmpresa(empresa)} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-ink-secondary">{fmtData(empresa.expires_at)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    {acessosPorEmpresa[empresa.id] ? (
                      <button
                        onClick={() => setEmpresaVendoAcessos(empresa)}
                        className="text-xs text-ink-secondary underline decoration-dotted hover:text-ink-primary"
                      >
                        {acessosPorEmpresa[empresa.id]} {acessosPorEmpresa[empresa.id] === 1 ? "acesso" : "acessos"}
                      </button>
                    ) : (
                      <span className="text-xs text-ink-muted">Nenhum acesso ainda</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {confirmandoExclusao === empresa.id ? (
                      <div className="flex justify-end gap-2">
                        <span className="text-xs text-ink-secondary">Excluir e apagar todos os dados da empresa?</span>
                        <button
                          onClick={() => handleExcluir(empresa.id)}
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
                        <Button variant="ghost" onClick={() => setEmpresaGerandoAcesso(empresa)} className="px-3 py-1.5 text-xs">
                          <IconKey className="h-3.5 w-3.5" /> Gerar acesso
                        </Button>
                        <Button variant="ghost" onClick={() => handleToggleStatus(empresa)} disabled={pending} className="px-3 py-1.5 text-xs">
                          {empresa.status === "ativo" ? "Suspender" : "Reativar"}
                        </Button>
                        <Button variant="ghost" onClick={() => setEmpresaEditando(empresa)} className="px-3 py-1.5 text-xs">
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setConfirmandoExclusao(empresa.id)}
                          disabled={pending}
                          className="px-3 py-1.5 text-xs"
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modalCriacaoAberto && <EmpresaModal onClose={() => setModalCriacaoAberto(false)} />}
      {empresaEditando && <EmpresaModal empresa={empresaEditando} onClose={() => setEmpresaEditando(null)} />}
      {empresaGerandoAcesso && <GerarAcessoCompanyAdminModal empresa={empresaGerandoAcesso} onClose={() => setEmpresaGerandoAcesso(null)} />}
      {empresaVendoAcessos && <AcessosEmpresaModal empresa={empresaVendoAcessos} onClose={() => setEmpresaVendoAcessos(null)} />}
    </div>
  );
}
