"use client";

import { useState, type FormEvent } from "react";
import type { TipoServicoRow } from "@/lib/types/producao";
import type { OrigemLead } from "@/lib/types/comercial";
import { criarLead } from "@/app/admin/comercial/actions";
import { ORIGEM_LEAD_META } from "@/lib/utils/comercial";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface LeadModalProps {
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

// "whatsapp" fica de fora daqui de propósito — só o botão "Adicionar ao CRM"
// do Inbox cria lead com essa origem; não faz sentido escolher manualmente
// ao criar um lead do zero (ainda não veio de conversa nenhuma).
const ORIGEM_OPCOES: OrigemLead[] = ["indicacao", "trafego_pago", "outbound", "outro"];

/** Criação de um novo lead. Edição completa (+ histórico de follow-up + conversão) acontece no painel de detalhe, depois de criado. */
export function LeadModal({ tiposServico, onClose }: LeadModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [origem, setOrigem] = useState<OrigemLead | "">("");
  const [tipoServicoId, setTipoServicoId] = useState("");
  const [valorEstimado, setValorEstimado] = useState("");
  const [dataPrevistaFechamento, setDataPrevistaFechamento] = useState("");
  const [contratoAssinado, setContratoAssinado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      valorEstimado: valorEstimado.trim() === "" ? null : Number(valorEstimado),
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
          <h3 className="text-base font-semibold">Novo Lead</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome da Empresa/Pessoa *</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Studio Criativo Ltda" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">E-mail</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">WhatsApp</label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 90000-0000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Origem do Lead</label>
              <Select value={origem} onChange={(e) => setOrigem(e.target.value as OrigemLead)}>
                <option value="">Não informado</option>
                {ORIGEM_OPCOES.map((o) => (
                  <option key={o} value={o}>
                    {ORIGEM_LEAD_META[o].label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Serviço de Interesse</label>
              <Select value={tipoServicoId} onChange={(e) => setTipoServicoId(e.target.value)}>
                <option value="">Não informado</option>
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
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Valor Estimado (R$)</label>
              <Input type="number" min="0" step="0.01" value={valorEstimado} onChange={(e) => setValorEstimado(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Previsão de Fechamento</label>
              <Input type="date" value={dataPrevistaFechamento} onChange={(e) => setDataPrevistaFechamento(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            <input
              type="checkbox"
              checked={contratoAssinado}
              onChange={(e) => setContratoAssinado(e.target.checked)}
              className="h-4 w-4 rounded border-base-600 bg-base-900 accent-white"
            />
            Contrato já assinado
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
