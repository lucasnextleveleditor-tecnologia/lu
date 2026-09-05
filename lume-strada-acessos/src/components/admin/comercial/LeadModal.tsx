"use client";

import { useState, type FormEvent } from "react";
import type { TipoServicoRow } from "@/lib/types/producao";
import type { OrigemLead } from "@/lib/types/comercial";
import { criarLead } from "@/app/admin/comercial/actions";
import { ORIGEM_LEAD_META } from "@/lib/utils/comercial";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { GerenciarServicosModal } from "@/components/admin/comercial/GerenciarServicosModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ComercialDict } from "@/lib/i18n/dictionaries/pt/comercial";

interface LeadModalProps {
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

// "whatsapp" fica de fora daqui de propósito — só o botão "Adicionar ao CRM"
// do Inbox cria lead com essa origem; não faz sentido escolher manualmente
// ao criar um lead do zero (ainda não veio de conversa nenhuma).
const ORIGEM_OPCOES: OrigemLead[] = ["indicacao", "trafego_pago", "outbound", "outro"];

function origemLabel(dict: ComercialDict, origem: OrigemLead): string {
  const MAPA: Record<OrigemLead, string> = {
    indicacao: dict.origemIndicacao,
    trafego_pago: dict.origemTrafegoPago,
    outbound: dict.origemOutbound,
    outro: dict.origemOutro,
    whatsapp: dict.origemWhatsapp,
  };
  return MAPA[origem];
}

/** Criação de um novo lead. Edição completa (+ histórico de follow-up + conversão) acontece no painel de detalhe, depois de criado. */
export function LeadModal({ tiposServico, onClose }: LeadModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [origem, setOrigem] = useState<OrigemLead | "">("");
  const [tipoServicoId, setTipoServicoId] = useState("");
  const [valorEstimado, setValorEstimado] = useState(0);
  const [dataPrevistaFechamento, setDataPrevistaFechamento] = useState("");
  const [contratoAssinado, setContratoAssinado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gerenciarServicosAberto, setGerenciarServicosAberto] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await criarLead({
      nome,
      email: email || null,
      whatsapp: whatsapp || null,
      origem: origem || null,
      tipoServicoId: tipoServicoId || null,
      valorEstimado: valorEstimado > 0 ? valorEstimado : null,
      dataPrevistaFechamento: dataPrevistaFechamento || null,
      contratoAssinado,
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.comercial.novoLead}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.comercial.labelNomeLead}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.comercial.placeholderNomeLead} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.common.email}</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">WhatsApp</label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 90000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.comercial.origemLeadLabel}</label>
              <Select value={origem} onChange={(e) => setOrigem(e.target.value as OrigemLead)}>
                <option value="">{dict.comercial.naoInformado}</option>
                {ORIGEM_OPCOES.map((o) => (
                  <option key={o} value={o}>
                    {origemLabel(dict.comercial, o)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-ink-secondary">{dict.comercial.servicoInteresseLabel}</label>
                <button
                  type="button"
                  onClick={() => setGerenciarServicosAberto(true)}
                  className="text-[11px] text-ink-muted underline-offset-2 hover:text-ink-primary hover:underline"
                >
                  {dict.comercial.gerenciar}
                </button>
              </div>
              <Select value={tipoServicoId} onChange={(e) => setTipoServicoId(e.target.value)}>
                <option value="">{dict.comercial.naoInformado}</option>
                {tiposServico.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.comercial.valorEstimadoLabel}</label>
              <CurrencyInput value={valorEstimado} onChange={setValorEstimado} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.comercial.previsaoFechamentoLabel}</label>
              <DatePicker value={dataPrevistaFechamento} onChange={setDataPrevistaFechamento} clearable />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            <input
              type="checkbox"
              checked={contratoAssinado}
              onChange={(e) => setContratoAssinado(e.target.checked)}
              className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
            />
            {dict.comercial.contratoAssinadoLabel}
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.comercial.criando : dict.comercial.criarLead}
            </Button>
          </div>
        </form>
      </div>

      {gerenciarServicosAberto && <GerenciarServicosModal tiposServico={tiposServico} onClose={() => setGerenciarServicosAberto(false)} />}
    </div>
  );
}
