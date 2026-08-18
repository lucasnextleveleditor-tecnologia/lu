"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { ProfileRow } from "@/lib/types/database";
import type { EntregaComVersoes, FuncionarioRow, PrioridadeTarefa, StatusTarefa, SubtarefaRow, TarefaComRelacoes, TipoServicoRow } from "@/lib/types/producao";
import { atualizarTarefa, moverStatusTarefa, removerTarefa } from "@/app/admin/producao/actions";
import { PRIORIDADE_TAREFA_ORDEM, STATUS_TAREFA_ORDEM, isTarefaAtrasada } from "@/lib/utils/producao";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/admin/producao/RichTextEditor";
import { SubtarefasChecklist } from "@/components/admin/producao/SubtarefasChecklist";
import { EntregasSection } from "@/components/admin/producao/EntregasSection";
import { GerenciarTiposServicoModal } from "@/components/admin/producao/GerenciarTiposServicoModal";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TarefaDetalheModalProps {
  tarefa: TarefaComRelacoes;
  subtarefas: SubtarefaRow[];
  entregas: EntregaComVersoes[];
  clientes: Pick<ProfileRow, "id" | "email" | "full_name">[];
  funcionarios: FuncionarioRow[];
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

export function TarefaDetalheModal({ tarefa, subtarefas, entregas, clientes, funcionarios, tiposServico, onClose }: TarefaDetalheModalProps) {
  const { dict } = useLocale();
  const statusLabel: Record<StatusTarefa, string> = {
    backlog: dict.producao.statusBacklog,
    a_fazer: dict.producao.statusAFazer,
    em_producao: dict.producao.statusEmProducao,
    revisao_interna: dict.producao.statusRevisaoInterna,
    preview_cliente: dict.producao.statusPreviewCliente,
    concluida: dict.producao.statusConcluida,
  };
  const prioridadeLabel: Record<string, string> = {
    baixa: dict.producao.prioridadeBaixa,
    normal: dict.producao.prioridadeNormal,
    alta: dict.producao.prioridadeAlta,
    urgente: dict.producao.prioridadeUrgente,
  };
  const [titulo, setTitulo] = useState(tarefa.titulo);
  const [briefing, setBriefing] = useState(tarefa.briefing ?? "");
  const [clienteId, setClienteId] = useState(tarefa.cliente_id ?? "");
  const [responsavelId, setResponsavelId] = useState(tarefa.responsavel_id ?? "");
  const [tipoServicoId, setTipoServicoId] = useState(tarefa.tipo_servico_id ?? "");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>(tarefa.prioridade);
  const [dataCaptacao, setDataCaptacao] = useState(tarefa.data_captacao ?? "");
  const [dataEntrega, setDataEntrega] = useState(tarefa.data_entrega ?? "");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [gerenciarServicosAberto, setGerenciarServicosAberto] = useState(false);

  const atrasada = isTarefaAtrasada(tarefa);

  function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSalvo(false);
    startTransition(async () => {
      const result = await atualizarTarefa(tarefa.id, {
        titulo,
        briefing: briefing || null,
        clienteId: clienteId || null,
        responsavelId: responsavelId || null,
        tipoServicoId: tipoServicoId || null,
        prioridade,
        dataCaptacao: dataCaptacao || null,
        dataEntrega: dataEntrega || null,
      });
      if (!result.ok) setError(result.error);
      else {
        setSalvo(true);
        setTimeout(() => setSalvo(false), 2000);
      }
    });
  }

  function handleMudarStatus(status: StatusTarefa) {
    setError(null);
    startTransition(async () => {
      const result = await moverStatusTarefa(tarefa.id, status);
      if (!result.ok) setError(result.error);
    });
  }

  function handleExcluir() {
    setError(null);
    startTransition(async () => {
      const result = await removerTarefa(tarefa.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border-none bg-transparent px-0 text-base font-semibold focus:ring-0"
            />
            {atrasada && <p className="mt-1 text-xs font-medium text-danger">{dict.producao.tarefaAtrasada}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        {/* Status — colunas do Kanban, clicáveis direto daqui */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {STATUS_TAREFA_ORDEM.map((status) => {
            const ativo = tarefa.status === status;
            return (
              <button
                key={status}
                onClick={() => handleMudarStatus(status)}
                disabled={pending}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  ativo ? "border-accent bg-accent text-base-950" : "border-base-700 text-ink-secondary hover:border-ink-muted hover:text-ink-primary"
                )}
              >
                {statusLabel[status]}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSalvar} className="mb-6 space-y-4 border-b border-base-800 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.clienteLabel}</label>
              <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">{dict.producao.clienteSemVinculo}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-ink-secondary">{dict.producao.tipoServicoLabel}</label>
                <button
                  type="button"
                  onClick={() => setGerenciarServicosAberto(true)}
                  className="text-[11px] text-ink-muted underline-offset-2 hover:text-ink-primary hover:underline"
                >
                  {dict.producao.gerenciar}
                </button>
              </div>
              <Select value={tipoServicoId} onChange={(e) => setTipoServicoId(e.target.value)}>
                <option value="">{dict.common.semCategoria}</option>
                {tiposServico.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.responsavelLabel}</label>
            <Select value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)}>
              <option value="">{dict.producao.responsavelSemVinculo}</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.dataCaptacaoLabel}</label>
              <DatePicker value={dataCaptacao} onChange={setDataCaptacao} required />
              <p className="mt-1 text-[11px] text-ink-muted">{dict.producao.dataCaptacaoAjuda}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.prazoEntregaLabel}</label>
              <DatePicker value={dataEntrega} onChange={setDataEntrega} required />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.prioridadeLabel}</label>
            <div className="inline-flex w-full rounded-lg border border-base-700 bg-base-950/60 p-1">
              {PRIORIDADE_TAREFA_ORDEM.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridade(p)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                    prioridade === p ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                  )}
                >
                  {prioridadeLabel[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.briefingLabel}</label>
            <RichTextEditor value={briefing} onChange={setBriefing} placeholder={dict.producao.briefingPlaceholder} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              {confirmandoExclusao ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-ink-secondary">{dict.producao.confirmarExclusaoTarefa}</span>
                  <button type="button" onClick={handleExcluir} disabled={pending} className="font-medium text-danger hover:underline">
                    {dict.producao.simExcluir}
                  </button>
                  <button type="button" onClick={() => setConfirmandoExclusao(false)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                    {dict.common.cancelar}
                  </button>
                </div>
              ) : (
                <Button type="button" variant="danger" onClick={() => setConfirmandoExclusao(true)} className="px-3 py-1.5 text-xs">
                  {dict.producao.excluirTarefaBotao}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {salvo && <Badge tone="good" label={dict.producao.salvo} />}
              <Button type="submit" disabled={pending} className="px-4 py-1.5 text-xs">
                {pending ? dict.common.salvando : dict.common.salvarAlteracoes}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>

        <div className="space-y-6">
          <SubtarefasChecklist tarefaId={tarefa.id} subtarefas={subtarefas} />
          <EntregasSection tarefaId={tarefa.id} entregas={entregas} />
        </div>
      </div>

      {gerenciarServicosAberto && (
        <GerenciarTiposServicoModal tiposServico={tiposServico} onClose={() => setGerenciarServicosAberto(false)} />
      )}
    </div>
  );
}
