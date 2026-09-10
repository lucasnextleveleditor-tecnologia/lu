import type { PortalClienteData, TimelineEventoPortal } from "@/lib/types/portal";
import type { Dictionary } from "@/lib/i18n/dictionaries/pt";
import type { StatusOrcamento } from "@/lib/types/orcamentos";
import type { StatusContrato } from "@/lib/types/contratos";
import { STATUS_ORCAMENTO_TONE } from "@/lib/utils/orcamentos";
import { STATUS_CONTRATO_TONE } from "@/lib/utils/contratos";

import { fmtDataHora } from "@/lib/utils/status";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconFileText, IconShieldCheck, IconImage, IconActivity, IconExternalLink, IconDownload } from "@/components/ui/icons";
import type { FormatadorMoeda } from "@/lib/types/moeda";
import { PlayerDeMidia } from "@/components/ui/PlayerDeMidia";

/**
 * View da Fase 4 (Portal do Cliente) — server component puro (sem "use
 * client"): diferente de `OrcamentoPublicoView`/`ContratoPublicoView`, esta
 * tela é só leitura (nenhum botão aqui muda o estado de nada no banco), então
 * não precisa de estado local nem de `useLocale` — o `dict` já chega pronto
 * do server component pai (`page.tsx`), igual o resto do app faz quando não
 * há interatividade.
 */
export function ClientePortalView({ data, dict, fmtMoeda }: { data: PortalClienteData; dict: Dictionary; fmtMoeda: FormatadorMoeda }) {
  const statusOrcLabel: Record<StatusOrcamento, string> = {
    rascunho: dict.orcamentos.statusRascunho,
    enviado: dict.orcamentos.statusEnviado,
    visualizado: dict.orcamentos.statusVisualizado,
    aprovado: dict.orcamentos.statusAprovado,
    recusado: dict.orcamentos.statusRecusado,
    expirado: dict.orcamentos.statusExpirado,
  };
  const statusContratoLabel: Record<StatusContrato, string> = {
    rascunho: dict.contratos.statusRascunho,
    enviado: dict.contratos.statusEnviado,
    visualizado: dict.contratos.statusVisualizado,
    assinado: dict.contratos.statusAssinado,
    recusado: dict.contratos.statusRecusado,
    cancelado: dict.contratos.statusCancelado,
  };

  const eventoLabel: Record<`${TimelineEventoPortal["origem"]}:${TimelineEventoPortal["evento"]}`, string> = {
    "orcamento:enviado": dict.portal.eventoEnviadoOrcamento,
    "orcamento:visualizado": dict.portal.eventoVisualizadoOrcamento,
    "orcamento:aprovado": dict.portal.eventoAprovadoOrcamento,
    "orcamento:assinado": "", // combinação inexistente (orçamento nunca tem evento "assinado") — mantida só pra o tipo do Record fechar
    "orcamento:recusado": dict.portal.eventoRecusadoOrcamento,
    "contrato:enviado": dict.portal.eventoEnviadoContrato,
    "contrato:visualizado": dict.portal.eventoVisualizadoContrato,
    "contrato:aprovado": "", // idem, contrato nunca tem "aprovado"
    "contrato:assinado": dict.portal.eventoAssinadoContrato,
    "contrato:recusado": dict.portal.eventoRecusadoContrato,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.portal.tituloPagina}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-primary">{data.cliente.nome}</h1>
        {data.empresaNome && <p className="mt-1 text-sm text-ink-muted">{dict.portal.subtituloComEmpresa.replace("{empresa}", data.empresaNome)}</p>}
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <IconFileText className="h-4 w-4 text-ink-muted" />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.portal.orcamentosTitulo}</p>
        </div>
        {data.orcamentos.length === 0 ? (
          <p className="text-sm text-ink-muted">{dict.portal.orcamentosVazio}</p>
        ) : (
          <div className="divide-y divide-base-800 rounded-lg border border-base-800">
            {data.orcamentos.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-primary">{o.titulo}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={STATUS_ORCAMENTO_TONE[o.statusExibicao]} label={statusOrcLabel[o.statusExibicao]} />
                    <span className="text-xs text-ink-muted">{fmtMoeda(o.total)}</span>
                  </div>
                </div>
                <a href={`/orcamento/${o.token}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs">
                    <IconExternalLink className="h-3.5 w-3.5" />
                    {dict.portal.verOrcamentoBtn}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <IconShieldCheck className="h-4 w-4 text-ink-muted" />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.portal.contratosTitulo}</p>
        </div>
        {data.contratos.length === 0 ? (
          <p className="text-sm text-ink-muted">{dict.portal.contratosVazio}</p>
        ) : (
          <div className="divide-y divide-base-800 rounded-lg border border-base-800">
            {data.contratos.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-primary">{c.titulo}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={STATUS_CONTRATO_TONE[c.status]} label={statusContratoLabel[c.status]} />
                    <span className="text-xs text-ink-muted">{fmtMoeda(c.total)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <a href={`/api/contrato-publico/${c.token}/pdf`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs">
                      <IconDownload className="h-3.5 w-3.5" />
                      {dict.portal.baixarPdfBtn}
                    </Button>
                  </a>
                  <a href={`/contrato/${c.token}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs">
                      <IconExternalLink className="h-3.5 w-3.5" />
                      {dict.portal.verContratoBtn}
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {data.portfolio.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <IconImage className="h-4 w-4 text-ink-muted" />
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.portal.portfolioTitulo}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {data.portfolio.map((item) => (
              <div key={item.id} className="relative aspect-video overflow-hidden rounded-lg border border-base-800" title={item.titulo}>
                {item.tipo_midia === "video" ? (
                  item.ehLink ? (
                  <PlayerDeMidia url={item.url} className="h-full" />
                ) : (
                  <video src={item.url} className="h-full w-full object-cover" muted controls />
                )
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.titulo} className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <IconActivity className="h-4 w-4 text-ink-muted" />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.portal.timelineTitulo}</p>
        </div>
        {data.timeline.length === 0 ? (
          <p className="text-sm text-ink-muted">{dict.portal.timelineVazio}</p>
        ) : (
          <ol className="space-y-3">
            {data.timeline.map((evento, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-status-neutral" />
                <div className="min-w-0">
                  <p className="text-sm text-ink-primary">{eventoLabel[`${evento.origem}:${evento.evento}`].replace("{titulo}", evento.titulo)}</p>
                  <p className="text-xs text-ink-muted">{fmtDataHora(evento.data)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
