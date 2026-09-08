"use client";

import { useState } from "react";
import type { Compromisso, CompromissoInput, TipoCompromisso } from "@/lib/types/agenda";
import { TIPO_COMPROMISSO_META, TIPO_COMPROMISSO_ORDEM } from "@/lib/utils/agenda";
import { atualizarCompromisso, criarCompromisso, removerCompromisso } from "@/app/admin/agenda/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Textarea } from "@/components/ui/Textarea";

interface NovoCompromissoModalProps {
  /** Presente = edição (título/botões mudam, ganha "Excluir"); ausente/null = criação. */
  compromisso?: Compromisso | null;
  /** Só usado na criação, quando o modal abre a partir do clique numa célula vazia do grid (ver `onNovaTarefa`-like em `CalendarioTarefas.tsx`). */
  dataInicial?: string;
  onClose: () => void;
}

/**
 * Modal de criar/editar compromisso — mesmo shell visual de
 * `AcessoFuncionarioModal.tsx` (overlay `bg-black/70`, painel
 * `rounded-2xl border border-base-700 bg-base-900`, clique fora fecha).
 * Sem "Hora" nativa própria no design system — `<input type="time">` puro,
 * mesmo visual de `Input`/`Select` aplicado via classe.
 */
export function NovoCompromissoModal({ compromisso, dataInicial, onClose }: NovoCompromissoModalProps) {
  const { dict } = useLocale();
  const { theme } = useTheme();
  const editando = Boolean(compromisso);

  const [titulo, setTitulo] = useState(compromisso?.titulo ?? "");
  const [tipo, setTipo] = useState<TipoCompromisso>(compromisso?.tipo ?? "captacao");
  const [data, setData] = useState(compromisso?.data ?? dataInicial ?? "");
  const [hora, setHora] = useState(compromisso?.hora ? compromisso.hora.slice(0, 5) : "");
  const [clienteNome, setClienteNome] = useState(compromisso?.cliente_nome ?? "");
  const [notas, setNotas] = useState(compromisso?.notas ?? "");
  const [loading, setLoading] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelPorTipo: Record<TipoCompromisso, string> = {
    captacao: dict.agenda.tipoCaptacao,
    reuniao: dict.agenda.tipoReuniao,
    entrega: dict.agenda.tipoEntrega,
    pagamento: dict.agenda.tipoPagamento,
  };
  const corTipoSelecionado = theme === "dark" ? TIPO_COMPROMISSO_META[tipo].corDark : TIPO_COMPROMISSO_META[tipo].corLight;

  async function handleSalvar() {
    if (!titulo.trim()) {
      setError(dict.agenda.erroTituloObrigatorio);
      return;
    }
    if (!data) {
      setError(dict.agenda.erroDataObrigatoria);
      return;
    }

    setLoading(true);
    setError(null);
    const input: CompromissoInput = {
      titulo,
      tipo,
      data,
      hora: hora || null,
      clienteNome: clienteNome || null,
      notas: notas || null,
    };
    const result = editando && compromisso ? await atualizarCompromisso(compromisso.id, input) : await criarCompromisso(input);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || dict.agenda.erroSalvar);
      return;
    }
    onClose();
  }

  async function handleExcluir() {
    if (!compromisso) return;
    setExcluindo(true);
    setError(null);
    const result = await removerCompromisso(compromisso.id);
    setExcluindo(false);
    if (!result.ok) {
      setError(result.error || dict.agenda.erroExcluir);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? dict.agenda.modalTituloEditar : dict.agenda.modalTituloNovo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.agenda.campoTitulo}</label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.agenda.placeholderTitulo} required />
          </div>

          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.agenda.campoTipo}</label>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCompromisso)}>
                {TIPO_COMPROMISSO_ORDEM.map((t) => (
                  <option key={t} value={t}>
                    {labelPorTipo[t]}
                  </option>
                ))}
              </Select>
            </div>
            {/* Reforço visual (nunca a única pista — o `Select` já é a fonte de verdade) de qual cor esse tipo carrega no calendário. */}
            <span className="mb-2.5 h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: corTipoSelecionado }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.agenda.campoData}</label>
              <DatePicker value={data} onChange={setData} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.agenda.campoHora}</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary transition focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.agenda.campoCliente}</label>
            <Input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder={dict.agenda.placeholderCliente} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.agenda.campoNotas}</label>
            <Textarea rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder={dict.agenda.placeholderNotas} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex items-center justify-between gap-2">
          {editando ? (
            <Button type="button" variant="danger" onClick={handleExcluir} disabled={loading || excluindo}>
              {excluindo ? dict.agenda.excluindo : dict.agenda.excluirBtn}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading || excluindo}>
              {dict.agenda.cancelarBtn}
            </Button>
            <Button type="button" onClick={handleSalvar} disabled={loading || excluindo}>
              {loading ? dict.agenda.salvando : dict.agenda.salvarBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
