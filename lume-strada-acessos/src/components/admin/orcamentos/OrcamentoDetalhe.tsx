"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OrcamentoComRelacoes, StatusOrcamento } from "@/lib/types/orcamentos";
import { STATUS_ORCAMENTO_TONE, urlPublicaOrcamento } from "@/lib/utils/orcamentos";
import { duplicarOrcamento, enviarOrcamento, marcarStatusManual, removerOrcamento } from "@/app/admin/orcamentos/actions";
import { exportarElementoComoPDF, ExportError } from "@/lib/utils/export";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconCopy, IconPrinter, IconDownload, IconSend, IconCheckCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type OrcamentoDetalheProps = { orcamento: OrcamentoComRelacoes & { cliente_nome: string | null; subtotal: number; desconto: number; total: number; statusExibicao: StatusOrcamento } };

const PRINT_ID = "orcamento-detalhe-conteudo";

export function OrcamentoDetalhe({ orcamento }: OrcamentoDetalheProps) {
  const { dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const STATUS_LABEL: Record<StatusOrcamento, string> = {
    rascunho: dict.orcamentos.statusRascunho,
    enviado: dict.orcamentos.statusEnviado,
    visualizado: dict.orcamentos.statusVisualizado,
    aprovado: dict.orcamentos.statusAprovado,
    recusado: dict.orcamentos.statusRecusado,
    expirado: dict.orcamentos.statusExpirado,
  };

  const jaFoiEnviado = !!orcamento.enviado_em;
  const linkPublico = jaFoiEnviado ? urlPublicaOrcamento(orcamento.token, typeof window !== "undefined" ? window.location.origin : undefined) : null;
  const itensObrigatorios = orcamento.itens.filter((i) => !i.opcional);
  const itensOpcionais = orcamento.itens.filter((i) => i.opcional);

  function handleEnviar() {
    setError(null);
    startTransition(async () => {
      const result = await enviarOrcamento(orcamento.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDuplicar() {
    setError(null);
    startTransition(async () => {
      const result = await duplicarOrcamento(orcamento.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/orcamentos/${result.id}/editar`);
    });
  }

  function handleStatusManual(status: "rascunho" | "aprovado" | "recusado") {
    setError(null);
    startTransition(async () => {
      const result = await marcarStatusManual(orcamento.id, status);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleExcluir() {
    setError(null);
    startTransition(async () => {
      const result = await removerOrcamento(orcamento.id);
      if (!result.ok) setError(result.error);
      else router.push("/admin/orcamentos");
    });
  }

  async function handleCopiarLink() {
    if (!linkPublico) return;
    await navigator.clipboard.writeText(linkPublico);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  async function handleBaixarPdf() {
    setError(null);
    setBaixandoPdf(true);
    try {
      await exportarElementoComoPDF(PRINT_ID, `orcamento-${orcamento.titulo.toLowerCase().replace(/\s+/g, "-")}`);
    } catch (err) {
      setError(err instanceof ExportError ? err.message : "Não foi possível gerar o PDF.");
    } finally {
      setBaixandoPdf(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          {!jaFoiEnviado || orcamento.statusExibicao === "rascunho" ? (
            <Button onClick={handleEnviar} disabled={pending} className="gap-1.5">
              <IconSend className="h-4 w-4" />
              {dict.orcamentos.enviarBtn}
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleEnviar} disabled={pending} className="gap-1.5">
              <IconSend className="h-4 w-4" />
              {dict.orcamentos.reenviarBtn}
            </Button>
          )}
          <Link href={`/admin/orcamentos/${orcamento.id}/editar`}>
            <Button variant="ghost">{dict.orcamentos.editarBtn}</Button>
          </Link>
          <Button variant="ghost" onClick={handleDuplicar} disabled={pending} className="gap-1.5">
            <IconCopy className="h-4 w-4" />
            {dict.orcamentos.duplicarBtn}
          </Button>
          {linkPublico && (
            <Button variant="ghost" onClick={handleCopiarLink} className="gap-1.5">
              <IconCopy className="h-4 w-4" />
              {linkCopiado ? dict.orcamentos.linkCopiadoMsg : dict.orcamentos.copiarLinkBtn}
            </Button>
          )}
          <Button variant="ghost" onClick={() => window.print()} className="gap-1.5">
            <IconPrinter className="h-4 w-4" />
            {dict.orcamentos.imprimirBtn}
          </Button>
          <Button variant="ghost" onClick={handleBaixarPdf} disabled={baixandoPdf} className="gap-1.5">
            <IconDownload className="h-4 w-4" />
            {dict.orcamentos.baixarPdfBtn}
          </Button>
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

      {error && <p className="text-sm text-danger print:hidden">{error}</p>}

      {orcamento.statusExibicao !== "aprovado" && orcamento.statusExibicao !== "recusado" && (
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <span className="text-xs text-ink-muted">{dict.common.status}:</span>
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={() => handleStatusManual("aprovado")} disabled={pending}>
            <IconCheckCircle className="h-3.5 w-3.5" />
            {dict.orcamentos.marcarAprovadoBtn}
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => handleStatusManual("recusado")} disabled={pending}>
            {dict.orcamentos.marcarRecusadoBtn}
          </Button>
        </div>
      )}
      {(orcamento.statusExibicao === "aprovado" || orcamento.statusExibicao === "recusado") && (
        <div className="print:hidden">
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => handleStatusManual("rascunho")} disabled={pending}>
            {dict.orcamentos.voltarParaRascunhoBtn}
          </Button>
        </div>
      )}

      <div id={PRINT_ID}>
        <Card>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-ink-primary">{orcamento.titulo}</h1>
              <p className="mt-1 text-sm text-ink-secondary">
                {orcamento.nome_destinatario}
                {orcamento.cliente_nome && ` · ${orcamento.cliente_nome}`}
              </p>
              {orcamento.email_destinatario && <p className="text-xs text-ink-muted">{orcamento.email_destinatario}</p>}
            </div>
            <div className="text-right">
              <Badge tone={STATUS_ORCAMENTO_TONE[orcamento.statusExibicao]} label={STATUS_LABEL[orcamento.statusExibicao]} />
              {orcamento.data_expiracao && <p className="mt-1.5 text-xs text-ink-muted">{dict.orcamentos.validoAte.replace("{data}", fmtDataCurta(orcamento.data_expiracao))}</p>}
            </div>
          </div>

          {itensObrigatorios.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensInclusosTitulo}</p>
              <div className="divide-y divide-base-800 rounded-lg border border-base-800">
                {itensObrigatorios.map((item) => (
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

          {itensOpcionais.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensOpcionaisTitulo}</p>
              <div className="divide-y divide-base-800 rounded-lg border border-base-800">
                {itensOpcionais.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${!item.selecionado ? "opacity-50" : ""}`}>
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

          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>{dict.orcamentos.subtotalLabel}</span>
              <span>{fmtBRL(orcamento.subtotal)}</span>
            </div>
            {orcamento.desconto_tipo && (
              <div className="flex justify-between text-ink-secondary">
                <span>{dict.orcamentos.descontoLabel}</span>
                <span>−{fmtBRL(orcamento.desconto)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-base-800 pt-1.5 text-base font-semibold text-ink-primary">
              <span>{dict.orcamentos.totalLabel}</span>
              <span>{fmtBRL(orcamento.total)}</span>
            </div>
          </div>

          {orcamento.condicoes_pagamento && (
            <div className="mt-5 border-t border-base-800 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.condicoesDePagamentoTitulo}</p>
              <p className="mt-1 text-sm text-ink-secondary">{orcamento.condicoes_pagamento}</p>
            </div>
          )}

          {orcamento.observacoes && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.observacoesTitulo}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-secondary">{orcamento.observacoes}</p>
            </div>
          )}

          {orcamento.aprovado_em && orcamento.aprovado_por_nome && (
            <p className="mt-4 text-xs text-status-good">
              {dict.orcamentos.aprovadoAvisoDescricao.replace("{nome}", orcamento.aprovado_por_nome).replace("{data}", fmtDataCurta(orcamento.aprovado_em.slice(0, 10)))}
            </p>
          )}
          {orcamento.recusado_em && (
            <p className="mt-4 text-xs text-danger">
              {dict.orcamentos.recusadoAvisoTitulo}
              {orcamento.motivo_recusa ? ` — ${orcamento.motivo_recusa}` : ""}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
