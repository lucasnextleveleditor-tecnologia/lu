"use client";

import { useState } from "react";
import type { StatusContrato } from "@/lib/types/contratos";
import type { buscarContratoPublicoPorToken } from "@/app/contrato/data";
import { assinarContratoPublico, recusarContratoPublico } from "@/app/contrato/actions";
import { fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconDownload, IconCheckCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ContratoPublico = NonNullable<Awaited<ReturnType<typeof buscarContratoPublicoPorToken>>>;

export function ContratoPublicoView({ contrato, token }: { contrato: ContratoPublico; token: string }) {
  const { dict, fmtMoeda } = useLocale();
  const [error, setError] = useState<string | null>(null);

  const [dialogAssinar, setDialogAssinar] = useState(false);
  const [dialogRecusar, setDialogRecusar] = useState(false);
  const [nomeAssinante, setNomeAssinante] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [statusLocal, setStatusLocal] = useState<StatusContrato>(contrato.status);
  const [decidido, setDecidido] = useState<{ nome?: string; data: string; motivo?: string } | null>(null);

  const STATUS_LABEL: Record<StatusContrato, string> = {
    rascunho: dict.contratos.statusRascunho,
    enviado: dict.contratos.statusEnviado,
    visualizado: dict.contratos.statusVisualizado,
    assinado: dict.contratos.statusAssinado,
    recusado: dict.contratos.statusRecusado,
    cancelado: dict.contratos.statusCancelado,
  };

  const podeAssinar = contrato.podeAssinar && statusLocal !== "assinado" && statusLocal !== "recusado" && statusLocal !== "cancelado";

  async function handleAssinar() {
    if (!nomeAssinante.trim()) {
      setError(dict.contratos.placeholderSeuNomeAssinatura);
      return;
    }
    setEnviando(true);
    setError(null);
    const result = await assinarContratoPublico(token, nomeAssinante);
    setEnviando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatusLocal("assinado");
    setDecidido({ nome: nomeAssinante.trim(), data: new Date().toISOString() });
    setDialogAssinar(false);
  }

  async function handleRecusar() {
    setEnviando(true);
    setError(null);
    const result = await recusarContratoPublico(token, motivoRecusa || null);
    setEnviando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatusLocal("recusado");
    setDecidido({ data: new Date().toISOString(), motivo: motivoRecusa || undefined });
    setDialogRecusar(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{STATUS_LABEL[statusLocal]}</p>
        <a href={`/api/contrato-publico/${token}/pdf`} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs">
            <IconDownload className="h-3.5 w-3.5" />
            {dict.orcamentos.baixarPdfBtn}
          </Button>
        </a>
      </div>

      {statusLocal === "assinado" && (
        <div className="rounded-xl border border-status-good/30 bg-status-good/10 p-4">
          <p className="text-sm font-semibold text-ink-primary">{dict.contratos.assinadoAvisoTitulo}</p>
          <p className="mt-1 text-xs text-ink-secondary">
            {contrato.assinado_nome && contrato.assinado_em
              ? dict.contratos.assinadoAvisoDescricao.replace("{nome}", contrato.assinado_nome).replace("{data}", fmtDataCurta(contrato.assinado_em.slice(0, 10)))
              : decidido?.nome && dict.contratos.assinadoAvisoDescricao.replace("{nome}", decidido.nome).replace("{data}", fmtDataCurta(decidido.data.slice(0, 10)))}
          </p>
        </div>
      )}
      {statusLocal === "recusado" && (
        <div className="rounded-xl border border-status-critical/30 bg-status-critical/10 p-4">
          <p className="text-sm font-semibold text-ink-primary">{dict.contratos.recusadoAvisoTitulo}</p>
        </div>
      )}

      {error && <p className="text-sm text-danger print:hidden">{error}</p>}

      <Card>
        {/* A logo abre o documento, centralizada — mesmo lugar em que aparece no PDF. */}
        {contrato.logoUrl && (
          <div className="mb-5 flex justify-center border-b border-base-800 pb-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem do bucket do próprio projeto */}
            <img src={contrato.logoUrl} alt="" className="max-h-16 w-auto max-w-[220px] object-contain" />
          </div>
        )}

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.contratos.contratoTitulo}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-primary">{contrato.titulo}</h1>
        </div>

        {contrato.itens.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensInclusosTitulo}</p>
            <div className="divide-y divide-base-800 rounded-lg border border-base-800">
              {contrato.itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm text-ink-primary">{item.nome}</p>
                    {item.descricao && <p className="text-xs text-ink-muted">{item.descricao}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-medium text-ink-primary">
                    {item.quantidade > 1 && `${item.quantidade}x `}
                    {fmtMoeda(item.quantidade * item.valor_unitario)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ml-auto max-w-xs border-t border-base-800 pt-1.5 text-base font-semibold text-ink-primary">
          <div className="flex justify-between">
            <span>{dict.orcamentos.totalLabel}</span>
            <span>{fmtMoeda(contrato.total)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-base-800 pt-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">{contrato.clausulas}</p>
        </div>

        {contrato.empresaNome && <p className="mt-6 border-t border-base-800 pt-4 text-xs text-ink-muted">{dict.orcamentos.rodapePublico.replace("{empresa}", contrato.empresaNome)}</p>}
      </Card>

      {podeAssinar && (
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="ghost" onClick={() => setDialogRecusar(true)}>
            {dict.contratos.recusarContratoBtn}
          </Button>
          <Button className="gap-1.5" onClick={() => setDialogAssinar(true)}>
            <IconCheckCircle className="h-4 w-4" />
            {dict.contratos.assinarContratoBtn}
          </Button>
        </div>
      )}

      {dialogAssinar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDialogAssinar(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-base font-semibold">{dict.contratos.confirmarAssinaturaTitulo}</h3>
            <p className="mb-4 text-xs text-ink-muted">{dict.contratos.confirmarAssinaturaDescricao}</p>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.seuNomeLabel}</label>
            <Input autoFocus value={nomeAssinante} onChange={(e) => setNomeAssinante(e.target.value)} placeholder={dict.orcamentos.placeholderSeuNome} />
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialogAssinar(false)}>
                {dict.common.cancelar}
              </Button>
              <Button onClick={handleAssinar} disabled={enviando}>
                {dict.contratos.confirmarAssinaturaBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {dialogRecusar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDialogRecusar(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-semibold">{dict.orcamentos.confirmarRecusaTitulo}</h3>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.motivoRecusaOpcionalLabel}</label>
            <Textarea rows={3} value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} placeholder={dict.orcamentos.placeholderMotivoRecusa} />
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialogRecusar(false)}>
                {dict.common.cancelar}
              </Button>
              <Button variant="danger" onClick={handleRecusar} disabled={enviando}>
                {dict.orcamentos.confirmarRecusaBtn}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
