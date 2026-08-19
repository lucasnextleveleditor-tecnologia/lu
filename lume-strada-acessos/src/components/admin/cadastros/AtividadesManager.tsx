"use client";

import { useEffect, useState, useTransition } from "react";
import type { ClienteAtividadeRow, TipoAtividadeCliente } from "@/lib/types/cadastros";
import { listarAtividades, criarAtividade, alternarConcluida, removerAtividade } from "@/app/admin/actions";
import { fmtData, fmtDataHora } from "@/lib/utils/status";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { IconCheck, IconTrash, IconClipboardList } from "@/components/ui/icons";

/**
 * Checklist leve de atividades/tarefas DENTRO do cadastro do cliente — ver
 * nota em `supabase/cadastros.sql` seção 5: isto NÃO é o board de Produção
 * (`prod_tarefas`), é um acompanhamento comercial simples do cadastro em si
 * (ex: "Ligar sobre renovação"). Busca sob demanda quando o painel de
 * detalhe é aberto, mesmo padrão de `listarMensagens` no Inbox do WhatsApp.
 */
export function AtividadesManager({ clienteId }: { clienteId: string }) {
  const { dict } = useLocale();
  const [atividades, setAtividades] = useState<ClienteAtividadeRow[] | null>(null);
  const [tipo, setTipo] = useState<TipoAtividadeCliente>("tarefa");
  const [titulo, setTitulo] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarAtividades(clienteId).then((data) => {
      if (ativo) setAtividades(data);
    });
    return () => {
      ativo = false;
    };
  }, [clienteId]);

  function handleAdicionar() {
    if (!titulo.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await criarAtividade(clienteId, { tipo, titulo, descricao: null, dataPrevista: dataPrevista || null });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitulo("");
      setDataPrevista("");
      const atualizado = await listarAtividades(clienteId);
      setAtividades(atualizado);
    });
  }

  function handleToggle(atividade: ClienteAtividadeRow) {
    setError(null);
    startTransition(async () => {
      const result = await alternarConcluida(atividade.id, !atividade.concluida);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAtividades((atual) => atual?.map((a) => (a.id === atividade.id ? { ...a, concluida: !a.concluida } : a)) ?? null);
    });
  }

  function handleRemover(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerAtividade(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAtividades((atual) => atual?.filter((a) => a.id !== id) ?? null);
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.novaAtividadeLabel}</label>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.cadastros.novaAtividadePlaceholder} />
        </div>
        <div className="w-28">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAtividadeCliente)}>
            <option value="tarefa">{dict.cadastros.tarefa}</option>
            <option value="nota">{dict.cadastros.nota}</option>
          </Select>
        </div>
        {tipo === "tarefa" && (
          <div className="w-36">
            <DatePicker value={dataPrevista} onChange={setDataPrevista} />
          </div>
        )}
        <Button type="button" onClick={handleAdicionar} disabled={pending || !titulo.trim()} className="px-4 py-2 text-sm">
          + {dict.common.adicionar}
        </Button>
      </div>

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {atividades === null ? (
        <p className="py-4 text-center text-xs text-ink-muted">{dict.common.carregando}</p>
      ) : atividades.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-base-700 py-8 text-center">
          <IconClipboardList className="h-6 w-6 text-ink-muted" />
          <p className="text-xs text-ink-muted">{dict.cadastros.nenhumaAtividade}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {atividades.map((atividade) => (
            <li
              key={atividade.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-base-700 bg-base-900/60 px-3.5 py-3"
            >
              <div className="flex flex-1 items-start gap-3">
                {atividade.tipo === "tarefa" ? (
                  <button
                    onClick={() => handleToggle(atividade)}
                    disabled={pending}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                      atividade.concluida
                        ? "border-accent bg-accent text-base-950"
                        : "border-base-600 text-transparent hover:border-ink-muted"
                    )}
                    aria-label={atividade.concluida ? dict.cadastros.marcarComoPendente : dict.cadastros.marcarComoConcluida}
                  >
                    <IconCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                ) : (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-muted" />
                )}
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium text-ink-primary", atividade.concluida && "text-ink-muted line-through")}>
                    {atividade.titulo}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {atividade.tipo === "tarefa" ? dict.cadastros.tarefa : dict.cadastros.nota}
                    {atividade.data_prevista && ` · ${dict.cadastros.previstaParaLabel} ${fmtData(atividade.data_prevista)}`}
                    {` · ${fmtDataHora(atividade.created_at)}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemover(atividade.id)}
                disabled={pending}
                className="shrink-0 text-ink-muted transition hover:text-danger"
                aria-label={dict.common.remover}
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
