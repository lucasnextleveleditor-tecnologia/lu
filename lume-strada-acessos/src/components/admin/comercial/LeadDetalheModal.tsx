"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { AnotacaoRow, LeadComRelacoes, OrigemLead } from "@/lib/types/comercial";
import type { TipoServicoRow } from "@/lib/types/producao";
import { atualizarLead, converterLeadEmCliente, moverStatusLead, removerLead } from "@/app/admin/comercial/actions";
import { STATUS_LEAD_ORDEM } from "@/lib/utils/comercial";
import { fmtDataHora } from "@/lib/utils/status";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { IconCheck } from "@/components/ui/icons";
import { FollowUpLog } from "@/components/admin/comercial/FollowUpLog";
import { GerenciarServicosModal } from "@/components/admin/comercial/GerenciarServicosModal";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ComercialDict } from "@/lib/i18n/dictionaries/pt/comercial";

interface LeadDetalheModalProps {
  lead: LeadComRelacoes;
  anotacoes: AnotacaoRow[];
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

// Inclui "whatsapp" aqui (diferente do modal de criação) — leads que vieram
// do Inbox via "Adicionar ao CRM" já nascem com essa origem, e o admin
// precisa conseguir ver/editar esse campo no detalhe como qualquer outro.
const ORIGEM_OPCOES: OrigemLead[] = ["indicacao", "trafego_pago", "outbound", "outro", "whatsapp"];

function etapaLabel(dict: ComercialDict, status: (typeof STATUS_LEAD_ORDEM)[number]): string {
  const MAPA: Record<(typeof STATUS_LEAD_ORDEM)[number], string> = {
    lead_frio: dict.etapaLeadFrio,
    contato_inicial: dict.etapaContatoInicial,
    reuniao_realizada: dict.etapaReuniaoRealizada,
    proposta_enviada: dict.etapaPropostaEnviada,
    negociacao: dict.etapaNegociacao,
    fechado_ganha: dict.etapaFechadoGanha,
    perdido: dict.etapaPerdido,
  };
  return MAPA[status];
}

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

export function LeadDetalheModal({ lead, anotacoes, tiposServico, onClose }: LeadDetalheModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState(lead.nome);
  const [email, setEmail] = useState(lead.email ?? "");
  const [whatsapp, setWhatsapp] = useState(lead.whatsapp ?? "");
  const [origem, setOrigem] = useState<OrigemLead | "">(lead.origem ?? "");
  const [tipoServicoId, setTipoServicoId] = useState(lead.tipo_servico_id ?? "");
  const [valorEstimado, setValorEstimado] = useState(lead.valor_estimado != null ? String(lead.valor_estimado) : "");
  const [dataPrevistaFechamento, setDataPrevistaFechamento] = useState(lead.data_prevista_fechamento ?? "");
  const [contratoAssinado, setContratoAssinado] = useState(lead.contrato_assinado);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [convertendo, setConvertendo] = useState(false);
  const [erroConversao, setErroConversao] = useState<string | null>(null);
  const [gerenciarServicosAberto, setGerenciarServicosAberto] = useState(false);

  function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSalvo(false);
    startTransition(async () => {
      const result = await atualizarLead(lead.id, {
        nome,
        email: email || null,
        whatsapp: whatsapp || null,
        origem: origem || null,
        tipoServicoId: tipoServicoId || null,
        valorEstimado: valorEstimado.trim() === "" ? null : Number(valorEstimado),
        dataPrevistaFechamento: dataPrevistaFechamento || null,
        contratoAssinado,
      });
      if (!result.ok) setError(result.error);
      else {
        setSalvo(true);
        setTimeout(() => setSalvo(false), 2000);
      }
    });
  }

  function handleMudarStatus(status: (typeof STATUS_LEAD_ORDEM)[number]) {
    setError(null);
    startTransition(async () => {
      const result = await moverStatusLead(lead.id, status);
      if (!result.ok) setError(result.error);
    });
  }

  function handleExcluir() {
    setError(null);
    startTransition(async () => {
      const result = await removerLead(lead.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  function handleConverter() {
    setErroConversao(null);
    setConvertendo(true);
    startTransition(async () => {
      const result = await converterLeadEmCliente(lead.id);
      setConvertendo(false);
      if (!result.ok) setErroConversao(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border-none bg-transparent px-0 text-base font-semibold focus:ring-0"
          />
          <button onClick={onClose} className="shrink-0 text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        {/* Funil — colunas clicáveis direto daqui */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {STATUS_LEAD_ORDEM.map((status) => {
            const ativo = lead.status === status;
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
                {etapaLabel(dict.comercial, status)}
              </button>
            );
          })}
        </div>

        {/* Conversão — some assim que já tem cliente_id vinculado */}
        {lead.cliente_id ? (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-status-good/30 bg-status-good/10 px-3.5 py-2.5">
            <IconCheck className="h-4 w-4 shrink-0 text-status-good" />
            <p className="text-xs text-ink-primary">
              {dict.comercial.convertidoLabel}{" "}
              {lead.convertido_em && (
                <>
                  {dict.comercial.convertidoEmPrefixo} {fmtDataHora(lead.convertido_em)}
                </>
              )}{" "}
              — {dict.comercial.convertidoRodape}
            </p>
          </div>
        ) : (
          <div className="mb-5 rounded-lg border border-base-700 bg-base-950/40 px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-ink-primary">{dict.comercial.converterTitulo}</p>
                <p className="text-[11px] text-ink-muted">
                  {lead.status === "fechado_ganha"
                    ? dict.comercial.converterHintDisponivel
                    : dict.comercial.converterHintIndisponivel.replace("{etapa}", dict.comercial.etapaFechadoGanha)}
                </p>
              </div>
              <Button onClick={handleConverter} disabled={convertendo || pending || !email} className="shrink-0 px-3 py-1.5 text-xs">
                {convertendo ? dict.comercial.convertendo : dict.comercial.converterTitulo}
              </Button>
            </div>
            {erroConversao && <p className="mt-2 text-xs text-danger">{erroConversao}</p>}
          </div>
        )}

        <form onSubmit={handleSalvar} className="mb-6 space-y-4 border-b border-base-800 pb-6">
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
              <Input type="number" min="0" step="0.01" value={valorEstimado} onChange={(e) => setValorEstimado(e.target.value)} />
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

          <div className="flex items-center justify-between">
            <div>
              {confirmandoExclusao ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-ink-secondary">{dict.comercial.excluirLeadPergunta}</span>
                  <button type="button" onClick={handleExcluir} disabled={pending} className="font-medium text-danger hover:underline">
                    {dict.comercial.simExcluir}
                  </button>
                  <button type="button" onClick={() => setConfirmandoExclusao(false)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                    {dict.common.cancelar}
                  </button>
                </div>
              ) : (
                <Button type="button" variant="danger" onClick={() => setConfirmandoExclusao(true)} className="px-3 py-1.5 text-xs">
                  {dict.comercial.excluirLeadBotao}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {salvo && <Badge tone="good" label={dict.comercial.badgeSalvo} />}
              <Button type="submit" disabled={pending} className="px-4 py-1.5 text-xs">
                {pending ? dict.common.salvando : dict.common.salvarAlteracoes}
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>

        <FollowUpLog leadId={lead.id} anotacoes={anotacoes} />
      </div>

      {gerenciarServicosAberto && <GerenciarServicosModal tiposServico={tiposServico} onClose={() => setGerenciarServicosAberto(false)} />}
    </div>
  );
}
