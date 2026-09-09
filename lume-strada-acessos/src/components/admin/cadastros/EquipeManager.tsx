"use client";

import { useMemo, useState, useTransition } from "react";
import type { CargoRow, DepartamentoRow, EquipeMembroRow } from "@/lib/types/cadastros";
import type { ProfileRow } from "@/lib/types/database";
import { removerMembroEquipe } from "@/app/admin/actions";
import { calcularStatus } from "@/lib/utils/status";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatTile } from "@/components/ui/StatTile";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { MembroEquipeModal } from "@/components/admin/cadastros/MembroEquipeModal";
import { AcessoFuncionarioModal } from "@/components/admin/cadastros/AcessoFuncionarioModal";
import { OrganogramaView } from "@/components/admin/cadastros/organograma/OrganogramaView";
import { IconBriefcase, IconShieldCheck, IconPauseCircle, IconList, IconSitemap } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface EquipeManagerProps {
  equipeMembros: EquipeMembroRow[];
  profilesPorId: Record<string, ProfileRow>;
  departamentos: DepartamentoRow[];
  cargos: CargoRow[];
}

type SubAba = "lista" | "organograma";

/**
 * Aba Equipe — inteira admin-only (chamada só quando `souAdmin`, ver
 * `CadastrosWorkspace`); RLS de `equipe_membros` reforça isso de novo no
 * banco. Tem um segundo alternador aqui dentro (Lista/Organograma) — mesmo
 * espírito do alternador de layout do Kanban de Produção — pra caber o
 * Organograma sem precisar de um item de menu novo.
 */
export function EquipeManager({ equipeMembros, profilesPorId, departamentos, cargos }: EquipeManagerProps) {
  const { dict } = useLocale();
  const [subAba, setSubAba] = useState<SubAba>("lista");
  const [busca, setBusca] = useState("");
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(false);
  const [membroEditando, setMembroEditando] = useState<EquipeMembroRow | null>(null);
  const [membroAcesso, setMembroAcesso] = useState<EquipeMembroRow | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resumo = useMemo(() => {
    const comAcesso = equipeMembros.filter((m) => m.profile_id).length;
    return { comAcesso, semAcesso: equipeMembros.length - comAcesso };
  }, [equipeMembros]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return equipeMembros;
    return equipeMembros.filter(
      (m) => m.nome.toLowerCase().includes(termo) || m.cargo?.toLowerCase().includes(termo) || m.email?.toLowerCase().includes(termo)
    );
  }, [equipeMembros, busca]);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerMembroEquipe(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <div className="inline-flex rounded-xl border border-base-700/70 bg-gradient-to-b from-base-900 to-base-950 p-1 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.05)]">
          <button
            onClick={() => setSubAba("lista")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
              subAba === "lista" ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            <IconList className="h-3.5 w-3.5" />
            {dict.cadastros.abaListaEquipe}
          </button>
          <button
            onClick={() => setSubAba("organograma")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200",
              subAba === "organograma" ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
            )}
          >
            <IconSitemap className="h-3.5 w-3.5" />
            {dict.cadastros.abaOrganograma}
          </button>
        </div>
      </div>

      {subAba === "organograma" ? (
        <OrganogramaView departamentos={departamentos} cargos={cargos} equipeMembros={equipeMembros} />
      ) : (
        <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={dict.cadastros.buscarEquipePlaceholder} />
        </div>
        <Button onClick={() => setModalCriacaoAberto(true)} className="shrink-0">
          + {dict.cadastros.novoMembroBotao}
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile icon={IconBriefcase} label={dict.cadastros.totalNaEquipe} value={equipeMembros.length} hint={dict.cadastros.cadastradosNaBase} />
        <StatTile
          icon={IconShieldCheck}
          label={dict.cadastros.comAcesso}
          value={resumo.comAcesso}
          tone="good"
          hint={dict.cadastros.jaPodemLogarNoPainel}
        />
        <StatTile
          icon={IconPauseCircle}
          label={dict.cadastros.semAcesso}
          value={resumo.semAcesso}
          tone="neutral"
          hint={dict.cadastros.soCadastroSemLogin}
        />
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <Card className="overflow-x-auto p-0">
        {filtrados.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            {equipeMembros.length === 0 ? dict.cadastros.nenhumMembroCadastrado : dict.cadastros.nenhumMembroEncontrado}
          </div>
        ) : (
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">{dict.common.nome}</th>
                <th className="px-0 py-3 font-medium">{dict.cadastros.colunaCargo}</th>
                <th className="px-0 py-3 font-medium">{dict.cadastros.colunaContato}</th>
                <th className="px-0 py-3 font-medium">{dict.cadastros.colunaAcesso}</th>
                <th className="px-6 py-3 font-medium text-right">{dict.common.acoes}</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {filtrados.map((membro) => {
                const profile = membro.profile_id ? profilesPorId[membro.profile_id] : null;
                return (
                  <tr key={membro.id} className="border-b border-base-800 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-ink-primary">{membro.nome}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-ink-secondary">{membro.cargo || "—"}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-ink-secondary">{membro.email || "—"}</p>
                      <p className="text-xs text-ink-muted">{membro.telefone || "—"}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {profile ? <StatusBadge status={calcularStatus(profile)} /> : <Badge tone="neutral" label={dict.cadastros.semAcessoBadge} />}
                    </td>
                    <td className="py-3 text-right">
                      {confirmandoExclusao === membro.id ? (
                        <div className="flex justify-end gap-2">
                          <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                          <button
                            onClick={() => handleExcluir(membro.id)}
                            disabled={pending}
                            className="text-xs font-medium text-danger hover:underline"
                          >
                            {dict.common.sim}
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusao(null)}
                            disabled={pending}
                            className="text-xs text-ink-muted hover:text-ink-primary"
                          >
                            {dict.common.nao}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setMembroAcesso(membro)} className="px-3 py-1.5 text-xs">
                            {dict.cadastros.acessoEMenus}
                          </Button>
                          <Button variant="ghost" onClick={() => setMembroEditando(membro)} className="px-3 py-1.5 text-xs">
                            {dict.common.editar}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => setConfirmandoExclusao(membro.id)}
                            disabled={pending}
                            className="px-3 py-1.5 text-xs"
                          >
                            {dict.common.excluir}
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
        </>
      )}

      {modalCriacaoAberto && <MembroEquipeModal onClose={() => setModalCriacaoAberto(false)} />}
      {membroEditando && <MembroEquipeModal membro={membroEditando} onClose={() => setMembroEditando(null)} />}
      {membroAcesso && (
        <AcessoFuncionarioModal
          membro={membroAcesso}
          profile={membroAcesso.profile_id ? profilesPorId[membroAcesso.profile_id] ?? null : null}
          onClose={() => setMembroAcesso(null)}
        />
      )}
    </div>
  );
}
