"use client";

import { useState, type FormEvent } from "react";
import type { ProfileRow } from "@/lib/types/database";
import type { FuncionarioRow, PrioridadeTarefa, TipoServicoRow } from "@/lib/types/producao";
import { criarTarefa } from "@/app/admin/producao/actions";
import { PRIORIDADE_TAREFA_ORDEM } from "@/lib/utils/producao";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { RichTextEditor } from "@/components/admin/producao/RichTextEditor";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TarefaModalProps {
  clientes: Pick<ProfileRow, "id" | "email" | "full_name">[];
  funcionarios: FuncionarioRow[];
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

/** Criação de uma nova tarefa. Edição completa (+ subtarefas/entregas) acontece no painel de detalhe, depois de criada. */
export function TarefaModal({ clientes, funcionarios, tiposServico, onClose }: TarefaModalProps) {
  const { dict } = useLocale();
  const prioridadeLabel: Record<string, string> = {
    baixa: dict.producao.prioridadeBaixa,
    normal: dict.producao.prioridadeNormal,
    alta: dict.producao.prioridadeAlta,
    urgente: dict.producao.prioridadeUrgente,
  };
  const [titulo, setTitulo] = useState("");
  const [briefing, setBriefing] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [tipoServicoId, setTipoServicoId] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>("normal");
  const [dataCaptacao, setDataCaptacao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await criarTarefa({
      titulo,
      briefing: briefing || null,
      clienteId: clienteId || null,
      responsavelId: responsavelId || null,
      tipoServicoId: tipoServicoId || null,
      prioridade,
      dataCaptacao: dataCaptacao || null,
      dataEntrega: dataEntrega || null,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.producao.novaTarefa}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.tituloCampoLabel}</label>
            <Input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.producao.tituloPlaceholder} />
          </div>

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
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.tipoServicoLabel}</label>
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
              <Input type="date" value={dataCaptacao} onChange={(e) => setDataCaptacao(e.target.value)} />
              <p className="mt-1 text-[11px] text-ink-muted">{dict.producao.dataCaptacaoAjuda}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.prazoEntregaLabel}</label>
              <Input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
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

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.producao.criando : dict.producao.criarTarefa}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
