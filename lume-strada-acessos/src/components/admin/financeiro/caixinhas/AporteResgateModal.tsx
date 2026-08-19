"use client";

import { useState, type FormEvent } from "react";
import type { CaixinhaComSaldo, ContaComSaldo } from "@/lib/types/financeiro";
import { aportarCaixinha, resgatarCaixinha } from "@/app/admin/financeiro/caixinhas/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { fmtBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface AporteResgateModalProps {
  caixinha: CaixinhaComSaldo;
  contas: ContaComSaldo[];
  /** Tipo pré-selecionado ao abrir — o modal ainda deixa alternar entre os dois. */
  tipoInicial: "aporte" | "resgate";
  onClose: () => void;
}

/**
 * Aporte credita a caixinha debitando uma `fin_conta` escolhida; resgate faz
 * o inverso — as duas operações nascem sempre como um lançamento espelho em
 * `fin_transacoes` (ver `aportar_caixinha`/`resgatar_caixinha` no banco),
 * então esse modal só coleta conta + valor + descrição opcional, toda a
 * regra de negócio mora na função SQL (atômica, valida saldo etc.).
 */
export function AporteResgateModal({ caixinha, contas, tipoInicial, onClose }: AporteResgateModalProps) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;
  const [tipo, setTipo] = useState<"aporte" | "resgate">(tipoInicial);
  const contasDoContexto = contas.filter((c) => c.contexto === caixinha.contexto);
  const [contaId, setContaId] = useState(contasDoContexto[0]?.id ?? "");
  const [valor, setValor] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contaId) {
      setError(tipo === "aporte" ? t.selecioneContaOrigemErro : t.selecioneContaDestinoErro);
      return;
    }
    if (valor <= 0) {
      setError(dict.financeiro.valorObrigatorioLabel);
      return;
    }
    if (tipo === "resgate" && valor > caixinha.saldo_atual) {
      setError(t.saldoInsuficienteErro);
      return;
    }

    setLoading(true);
    const input = { caixinhaId: caixinha.id, contaId, valor, descricao };
    const result = tipo === "aporte" ? await aportarCaixinha(input) : await resgatarCaixinha(input);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{t.aporteResgateTitulo.replace("{nome}", caixinha.nome)}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="inline-flex w-full rounded-lg border border-base-700 bg-base-950/60 p-1">
            {(["aporte", "resgate"] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setTipo(opcao)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  tipo === opcao ? "bg-accent text-base-950" : "text-ink-muted hover:text-ink-primary"
                )}
              >
                {opcao === "aporte" ? t.aporteLabel : t.resgateLabel}
              </button>
            ))}
          </div>

          <p className="rounded-lg border border-base-700 bg-base-950/40 px-3 py-2 text-xs text-ink-secondary">
            {t.saldoDisponivelPrefixo} <span className="font-semibold text-ink-primary">{fmtBRL(caixinha.saldo_atual)}</span>
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{tipo === "aporte" ? t.contaOrigemAporteLabel : t.contaDestinoResgateLabel}</label>
            {contasDoContexto.length === 0 ? (
              <p className="text-xs text-ink-muted">{t.nenhumaContaCadastrada}</p>
            ) : (
              <Select required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                {contasDoContexto.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} — {fmtBRL(conta.saldo_atual)}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.valorObrigatorioLabel}</label>
            <CurrencyInput required value={valor} onChange={setValor} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.descricaoOpcionalLabel}</label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={tipo === "aporte" ? t.placeholderDescricaoAporte : t.placeholderDescricaoResgate} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading || contasDoContexto.length === 0}>
              {loading ? dict.common.salvando : tipo === "aporte" ? t.confirmarAporteBtn : t.confirmarResgateBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
