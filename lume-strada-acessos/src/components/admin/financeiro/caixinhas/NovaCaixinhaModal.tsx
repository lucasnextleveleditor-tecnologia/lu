"use client";

import { useState, type FormEvent } from "react";
import type { CaixinhaLiquidez, CaixinhaRisco, CaixinhaRow, CaixinhaTaxaPeriodo, FinContexto } from "@/lib/types/financeiro";
import { atualizarCaixinha, criarCaixinha } from "@/app/admin/financeiro/caixinhas/actions";
import { PALETA_CATEGORIAS } from "@/lib/utils/financeiro";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface NovaCaixinhaModalProps {
  onClose: () => void;
  /** Presente = modo edição (pré-preenche os campos e chama `atualizarCaixinha` em vez de `criarCaixinha`). */
  caixinha?: CaixinhaRow;
  onCriada?: (id: string) => void;
}

export function NovaCaixinhaModal({ onClose, caixinha, onCriada }: NovaCaixinhaModalProps) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;
  const editando = !!caixinha;

  const [nome, setNome] = useState(caixinha?.nome ?? "");
  const [objetivo, setObjetivo] = useState(caixinha?.objetivo ?? "");
  const [valorMeta, setValorMeta] = useState(caixinha?.valor_meta ?? 0);
  const [temMeta, setTemMeta] = useState(!!caixinha?.valor_meta);
  const [dataAlvo, setDataAlvo] = useState(caixinha?.data_alvo ?? "");
  const [taxaRendimento, setTaxaRendimento] = useState(String(caixinha?.taxa_rendimento ?? 0));
  const [taxaPeriodo, setTaxaPeriodo] = useState<CaixinhaTaxaPeriodo>(caixinha?.taxa_rendimento_periodo ?? "mensal");
  const [nivelRisco, setNivelRisco] = useState<CaixinhaRisco>(caixinha?.nivel_risco ?? "baixo");
  const [liquidez, setLiquidez] = useState<CaixinhaLiquidez>(caixinha?.liquidez ?? "imediata");
  const [contexto, setContexto] = useState<FinContexto>(caixinha?.contexto ?? "profissional");
  const [emoji, setEmoji] = useState(caixinha?.emoji ?? "🐷");
  const [cor, setCor] = useState(caixinha?.cor ?? PALETA_CATEGORIAS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = {
      nome,
      objetivo: objetivo || null,
      valorMeta: temMeta ? valorMeta : null,
      dataAlvo: dataAlvo || null,
      taxaRendimento: Number(taxaRendimento) || 0,
      taxaRendimentoPeriodo: taxaPeriodo,
      nivelRisco,
      liquidez,
      contexto,
      emoji: emoji || null,
      cor,
    };
    const result = editando ? await atualizarCaixinha(caixinha.id, input) : await criarCaixinha(input);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!editando && "id" in result) onCriada?.((result as { id: string }).id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? t.editarCaixinhaTitulo : t.novaCaixinhaTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[72px_1fr] gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.emojiLabel}</label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} className="text-center text-lg" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.nomeObrigatorio}</label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.placeholderNome} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.objetivoLabel}</label>
            <Textarea value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder={t.placeholderObjetivo} rows={2} />
          </div>

          <div className="space-y-2 rounded-lg border border-base-700 bg-base-950/40 p-3">
            <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
              <input type="checkbox" checked={temMeta} onChange={(e) => setTemMeta(e.target.checked)} className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white" />
              {t.definirMetaLabel}
            </label>
            {temMeta && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.valorMetaLabel}</label>
                  <CurrencyInput value={valorMeta} onChange={setValorMeta} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.dataAlvoLabel}</label>
                  <DatePicker value={dataAlvo} onChange={setDataAlvo} clearable />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.taxaRendimentoLabel}</label>
              <div className="flex items-center rounded-lg border border-base-600 bg-base-900 px-3 focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxaRendimento}
                  onChange={(e) => setTaxaRendimento(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-ink-primary focus:outline-none"
                />
                <span className="ml-1.5 shrink-0 text-sm text-ink-muted">%</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.periodoLabel}</label>
              <Select value={taxaPeriodo} onChange={(e) => setTaxaPeriodo(e.target.value as CaixinhaTaxaPeriodo)}>
                <option value="mensal">{t.aoMes}</option>
                <option value="anual">{t.aoAno}</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.nivelRiscoLabel}</label>
              <Select value={nivelRisco} onChange={(e) => setNivelRisco(e.target.value as CaixinhaRisco)}>
                <option value="baixo">{t.riscoBaixo}</option>
                <option value="medio">{t.riscoMedio}</option>
                <option value="alto">{t.riscoAlto}</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.liquidezLabel}</label>
              <Select value={liquidez} onChange={(e) => setLiquidez(e.target.value as CaixinhaLiquidez)}>
                <option value="imediata">{t.liquidezImediata}</option>
                <option value="curto_prazo">{t.liquidezCurtoPrazo}</option>
                <option value="longo_prazo">{t.liquidezLongoPrazo}</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.contextoLabel}</label>
            <Select value={contexto} onChange={(e) => setContexto(e.target.value as FinContexto)}>
              <option value="profissional">{dict.financeiro.contextoProfissional}</option>
              <option value="pessoal">{dict.financeiro.contextoPessoal}</option>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.financeiro.corLabel}</label>
            <div className="flex flex-wrap gap-2">
              {PALETA_CATEGORIAS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCor(hex)}
                  aria-label={dict.financeiro.escolherCorAria.replace("{hex}", hex)}
                  className={cn("h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-base-900 transition", cor === hex ? "ring-white" : "ring-transparent")}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : t.criarCaixinhaBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
