"use client";

import { useMemo, useState } from "react";
import type { OrcItemRow, StatusOrcamento } from "@/lib/types/orcamentos";
import { calcularTotalOrcamento } from "@/lib/types/orcamentos";
import type { buscarOrcamentoPublicoPorToken } from "@/app/orcamento/data";
import { alternarItemPublico, aprovarOrcamentoPublico, recusarOrcamentoPublico } from "@/app/orcamento/actions";
import { exportarElementoComoPDF, ExportError } from "@/lib/utils/export";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconPrinter, IconDownload, IconCheckCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type OrcamentoPublico = NonNullable<Awaited<ReturnType<typeof buscarOrcamentoPublicoPorToken>>>;

const PRINT_ID = "orcamento-publico-conteudo";

export function OrcamentoPublicoView({ orcamento, token }: { orcamento: OrcamentoPublico; token: string }) {
  const { dict } = useLocale();
  const [itens, setItens] = useState<OrcItemRow[]>(orcamento.itens);
  const [error, setError] = useState<string | null>(null);
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const [dialogAprovar, setDialogAprovar] = useState(false);
  const [dialogRecusar, setDialogRecusar] = useState(false);
  const [nomeAprovador, setNomeAprovador] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [statusLocal, setStatusLocal] = useState<StatusOrcamento>(orcamento.statusExibicao);
  const [decidido, setDecidido] = useState<{ nome?: string; data: string; motivo?: string } | null>(null);

  const STATUS_LABEL: Record<StatusOrcamento, string> = {
    rascunho: dict.orcamentos.statusRascunho,
    enviado: dict.orcamentos.statusEnviado,
    visualizado: dict.orcamentos.statusVisualizado,
    aprovado: dict.orcamentos.statusAprovado,
    recusado: dict.orcamentos.statusRecusado,
    expirado: dict.orcamentos.statusExpirado,
  };

  const { subtotal, desconto, total } = useMemo(() => calcularTotalOrcamento(itens, orcamento.desconto_tipo, orcamento.desconto_valor), [itens, orcamento.desconto_tipo, orcamento.desconto_valor]);

  const itensObrigatorios = itens.filter((i) => !i.opcional);
  const itensOpcionais = itens.filter((i) => i.opcional);
  const podeInteragir = orcamento.podeInteragir && statusLocal !== "aprovado" && statusLocal !== "recusado";

  function handleToggleItem(item: OrcItemRow) {
    if (!podeInteragir) return;
    const novoValor = !item.selecionado;
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, selecionado: novoValor } : i)));
    alternarItemPublico(token, item.id, novoValor).then((result) => {
      if (!result.ok) {
        setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, selecionado: item.selecionado } : i)));
        setError(result.error);
      }
    });
  }

  async function handleAprovar() {
    if (!nomeAprovador.trim()) {
      setError(dict.orcamentos.placeholderSeuNome);
      return;
    }
    setEnviando(true);
    setError(null);
    const result = await aprovarOrcamentoPublico(token, nomeAprovador);
    setEnviando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatusLocal("aprovado");
    setDecidido({ nome: nomeAprovador.trim(), data: new Date().toISOString() });
    setDialogAprovar(false);
  }

  async function handleRecusar() {
    setEnviando(true);
    setError(null);
    const result = await recusarOrcamentoPublico(token, motivoRecusa || null);
    setEnviando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatusLocal("recusado");
    setDecidido({ data: new Date().toISOString(), motivo: motivoRecusa || undefined });
    setDialogRecusar(false);
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
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{STATUS_LABEL[statusLocal]}</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={() => window.print()}>
            <IconPrinter className="h-3.5 w-3.5" />
            {dict.orcamentos.imprimirBtn}
          </Button>
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={handleBaixarPdf} disabled={baixandoPdf}>
            <IconDownload className="h-3.5 w-3.5" />
            {dict.orcamentos.baixarPdfBtn}
          </Button>
        </div>
      </div>

      {statusLocal === "expirado" && (
        <div className="rounded-xl border border-status-critical/30 bg-status-critical/10 p-4 print:hidden">
          <p className="text-sm font-semibold text-ink-primary">{dict.orcamentos.expiradoAvisoTitulo}</p>
          <p className="mt-1 text-xs text-ink-secondary">{dict.orcamentos.expiradoAvisoDescricao}</p>
        </div>
      )}
      {statusLocal === "aprovado" && (
        <div className="rounded-xl border border-status-good/30 bg-status-good/10 p-4">
          <p className="text-sm font-semibold text-ink-primary">{dict.orcamentos.aprovadoAvisoTitulo}</p>
          <p className="mt-1 text-xs text-ink-secondary">
            {orcamento.aprovado_por_nome && orcamento.aprovado_em
              ? dict.orcamentos.aprovadoAvisoDescricao.replace("{nome}", orcamento.aprovado_por_nome).replace("{data}", fmtDataCurta(orcamento.aprovado_em.slice(0, 10)))
              : decidido?.nome && dict.orcamentos.aprovadoAvisoDescricao.replace("{nome}", decidido.nome).replace("{data}", fmtDataCurta(decidido.data.slice(0, 10)))}
          </p>
        </div>
      )}
      {statusLocal === "recusado" && (
        <div className="rounded-xl border border-status-critical/30 bg-status-critical/10 p-4">
          <p className="text-sm font-semibold text-ink-primary">{dict.orcamentos.recusadoAvisoTitulo}</p>
        </div>
      )}

      {error && <p className="text-sm text-danger print:hidden">{error}</p>}

      <div id={PRINT_ID}>
        <Card>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.propostaComercialTitulo}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-primary">{orcamento.titulo}</h1>
            <p className="mt-1 text-sm text-ink-secondary">{orcamento.nome_destinatario}</p>
            {orcamento.data_expiracao && <p className="mt-1 text-xs text-ink-muted">{dict.orcamentos.validoAte.replace("{data}", fmtDataCurta(orcamento.data_expiracao))}</p>}
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
              {podeInteragir && <p className="mb-2 text-xs text-ink-muted">{dict.orcamentos.hintItensOpcionaisPublico}</p>}
              <div className="divide-y divide-base-800 rounded-lg border border-base-800">
                {itensOpcionais.map((item) => (
                  <label key={item.id} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${podeInteragir ? "cursor-pointer" : ""}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.selecionado}
                        disabled={!podeInteragir}
                        onChange={() => handleToggleItem(item)}
                        className="h-4 w-4 rounded border-base-600 print:hidden"
                      />
                      <div>
                        <p className="text-sm text-ink-primary">{item.nome}</p>
                        {item.descricao && <p className="text-xs text-ink-muted">{item.descricao}</p>}
                      </div>
                    </div>
                    <p className={`shrink-0 text-sm font-medium ${item.selecionado ? "text-ink-primary" : "text-ink-muted line-through"}`}>
                      {item.quantidade > 1 && `${item.quantidade}x `}
                      {fmtBRL(item.quantidade * item.valor_unitario)}
                    </p>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>{dict.orcamentos.subtotalLabel}</span>
              <span>{fmtBRL(subtotal)}</span>
            </div>
            {orcamento.desconto_tipo && (
              <div className="flex justify-between text-ink-secondary">
                <span>{dict.orcamentos.descontoLabel}</span>
                <span>−{fmtBRL(desconto)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-base-800 pt-1.5 text-base font-semibold text-ink-primary">
              <span>{dict.orcamentos.totalLabel}</span>
              <span>{fmtBRL(total)}</span>
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

          {orcamento.empresaNome && <p className="mt-6 border-t border-base-800 pt-4 text-xs text-ink-muted">{dict.orcamentos.rodapePublico.replace("{empresa}", orcamento.empresaNome)}</p>}
        </Card>
      </div>

      {podeInteragir && (
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="ghost" onClick={() => setDialogRecusar(true)}>
            {dict.orcamentos.recusarOrcamentoBtn}
          </Button>
          <Button className="gap-1.5" onClick={() => setDialogAprovar(true)}>
            <IconCheckCircle className="h-4 w-4" />
            {dict.orcamentos.aprovarOrcamentoBtn}
          </Button>
        </div>
      )}

      {dialogAprovar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDialogAprovar(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-base font-semibold">{dict.orcamentos.confirmarAprovacaoTitulo}</h3>
            <p className="mb-4 text-xs text-ink-muted">{dict.orcamentos.confirmarAprovacaoDescricao}</p>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.seuNomeLabel}</label>
            <Input autoFocus value={nomeAprovador} onChange={(e) => setNomeAprovador(e.target.value)} placeholder={dict.orcamentos.placeholderSeuNome} />
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialogAprovar(false)}>
                {dict.common.cancelar}
              </Button>
              <Button onClick={handleAprovar} disabled={enviando}>
                {dict.orcamentos.confirmarAprovacaoBtn}
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
