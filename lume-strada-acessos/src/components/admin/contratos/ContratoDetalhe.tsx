"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ContratoComRelacoes, StatusContrato } from "@/lib/types/contratos";
import { STATUS_CONTRATO_TONE, urlPublicaContrato } from "@/lib/utils/contratos";
import { enviarContrato, marcarStatusManualContrato, removerContrato } from "@/app/admin/contratos/actions";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconCopy, IconDownload, IconSend, IconCheckCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ContratoDetalhe({ contrato }: { contrato: ContratoComRelacoes & { total: number } }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const STATUS_LABEL: Record<StatusContrato, string> = {
    rascunho: dict.contratos.statusRascunho,
    enviado: dict.contratos.statusEnviado,
    visualizado: dict.contratos.statusVisualizado,
    assinado: dict.contratos.statusAssinado,
    recusado: dict.contratos.statusRecusado,
    cancelado: dict.contratos.statusCancelado,
  };

  const jaFoiEnviado = !!contrato.enviado_em;
  const linkPublico = jaFoiEnviado ? urlPublicaContrato(contrato.token, typeof window !== "undefined" ? window.location.origin : undefined) : null;
  const decidido = contrato.status === "assinado" || contrato.status === "recusado" || contrato.status === "cancelado";

  function handleEnviar() {
    setError(null);
    startTransition(async () => {
      const result = await enviarContrato(contrato.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleStatusManual(status: "rascunho" | "assinado" | "recusado" | "cancelado") {
    setError(null);
    startTransition(async () => {
      const result = await marcarStatusManualContrato(contrato.id, status);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleExcluir() {
    setError(null);
    startTransition(async () => {
      const result = await removerContrato(contrato.id);
      if (!result.ok) setError(result.error);
      else router.push("/admin/contratos");
    });
  }

  async function handleCopiarLink() {
    if (!linkPublico) return;
    await navigator.clipboard.writeText(linkPublico);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {!jaFoiEnviado || contrato.status === "rascunho" ? (
            <Button onClick={handleEnviar} disabled={pending} className="gap-1.5">
              <IconSend className="h-4 w-4" />
              {dict.orcamentos.enviarBtn}
            </Button>
          ) : (
            !decidido && (
              <Button variant="ghost" onClick={handleEnviar} disabled={pending} className="gap-1.5">
                <IconSend className="h-4 w-4" />
                {dict.orcamentos.reenviarBtn}
              </Button>
            )
          )}
          <Link href={`/admin/contratos/${contrato.id}/editar`}>
            <Button variant="ghost">{dict.orcamentos.editarBtn}</Button>
          </Link>
          {linkPublico && (
            <Button variant="ghost" onClick={handleCopiarLink} className="gap-1.5">
              <IconCopy className="h-4 w-4" />
              {linkCopiado ? dict.orcamentos.linkCopiadoMsg : dict.orcamentos.copiarLinkBtn}
            </Button>
          )}
          <a href={`/api/contratos/${contrato.id}/pdf`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="gap-1.5">
              <IconDownload className="h-4 w-4" />
              {dict.orcamentos.baixarPdfBtn}
            </Button>
          </a>
        </div>

        {confirmandoExclusao ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-secondary">{dict.common.confirmarExclusao}</span>
            <button onClick={handleExcluir} disabled={pending} className="font-medium text-danger hover:underline">
              {dict.common.sim}
            </button>
            <button onClick={() => setConfirmandoExclusao(false)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
              {dict.common.nao}
            </button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmandoExclusao(true)} disabled={pending}>
            {dict.common.excluir}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {!decidido && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-ink-muted">{dict.common.status}:</span>
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={() => handleStatusManual("assinado")} disabled={pending}>
            <IconCheckCircle className="h-3.5 w-3.5" />
            {dict.contratos.marcarAssinadoBtn}
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => handleStatusManual("recusado")} disabled={pending}>
            {dict.contratos.marcarRecusadoBtn}
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => handleStatusManual("cancelado")} disabled={pending}>
            {dict.contratos.marcarCanceladoBtn}
          </Button>
        </div>
      )}
      {decidido && (
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => handleStatusManual("rascunho")} disabled={pending}>
          {dict.orcamentos.voltarParaRascunhoBtn}
        </Button>
      )}

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink-primary">{contrato.titulo}</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {contrato.nome_cliente}
              {contrato.cliente_nome && contrato.cliente_nome !== contrato.nome_cliente && ` · ${contrato.cliente_nome}`}
            </p>
            {contrato.orcamento_titulo && <p className="text-xs text-ink-muted">{dict.contratos.origemOrcamento.replace("{titulo}", contrato.orcamento_titulo)}</p>}
          </div>
          <Badge tone={STATUS_CONTRATO_TONE[contrato.status]} label={STATUS_LABEL[contrato.status]} />
        </div>

        {contrato.itens.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.contratos.itensDoContratoTitulo}</p>
            <div className="divide-y divide-base-800 rounded-lg border border-base-800">
              {contrato.itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm text-ink-primary">{item.nome}</p>
                    {item.descricao && <p className="text-xs text-ink-muted">{item.descricao}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-medium text-ink-primary">
                    {item.quantidade > 1 && `${item.quantidade}x `}
                    {fmtBRL(item.quantidade * item.valor_unitario)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ml-auto max-w-xs border-t border-base-800 pt-1.5 text-base font-semibold text-ink-primary">
          <div className="flex justify-between">
            <span>{dict.orcamentos.totalLabel}</span>
            <span>{fmtBRL(contrato.total)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-base-800 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.contratos.clausulasTitulo}</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">{contrato.clausulas}</p>
        </div>

        {contrato.observacoes && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.observacoesTitulo}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink-secondary">{contrato.observacoes}</p>
          </div>
        )}

        {contrato.assinado_em && contrato.assinado_nome && (
          <p className="mt-4 text-xs text-status-good">{dict.contratos.assinadoAvisoDescricao.replace("{nome}", contrato.assinado_nome).replace("{data}", fmtDataCurta(contrato.assinado_em.slice(0, 10)))}</p>
        )}
        {contrato.recusado_em && (
          <p className="mt-4 text-xs text-danger">
            {dict.contratos.recusadoAvisoTitulo}
            {contrato.motivo_recusa ? ` — ${contrato.motivo_recusa}` : ""}
          </p>
        )}
      </Card>
    </div>
  );
}
