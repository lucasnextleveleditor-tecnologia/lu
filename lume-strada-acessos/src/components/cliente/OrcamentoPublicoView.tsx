"use client";

import { useMemo, useState } from "react";
import type { OrcItemRow, StatusOrcamento } from "@/lib/types/orcamentos";
import { calcularTotalOrcamento } from "@/lib/types/orcamentos";
import type { buscarOrcamentoPublicoPorToken } from "@/app/orcamento/data";
import { alternarItemPublico, aprovarOrcamentoPublico, recusarOrcamentoPublico } from "@/app/orcamento/actions";
import { exportarElementoComoPDF, ExportError } from "@/lib/utils/export";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconPrinter, IconDownload, IconCheckCircle, IconFilm, IconImage, IconBriefcase, IconTarget, IconBuilding } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

type OrcamentoPublico = NonNullable<Awaited<ReturnType<typeof buscarOrcamentoPublicoPorToken>>>;

const PRINT_ID = "orcamento-publico-conteudo";

/**
 * Página pública do orçamento — reformulada pra usar de fato o conteúdo
 * institucional que já existe no banco desde `orcamentos-pdf-institucional.sql`
 * (banner, rodapé, texto institucional, empresas atendidas, proposta de
 * trabalho, objetivos) mas que até então só aparecia no PDF
 * (`OrcamentoPdfDocument.tsx`) — o link que o cliente de fato abre ficava
 * bem mais pobre que o PDF baixado. Toda a lógica de estado/interação
 * (seleção de item opcional, aprovar/recusar, exportar) é a mesma de
 * sempre; o que muda aqui é só a apresentação visual.
 */
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
  const institucional = orcamento.institucional;
  const temHero = !!institucional.bannerUrl;
  const temQuemSomos = !!(institucional.textoInstitucional || institucional.clientesAtendidos.length > 0);

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
    <div className="mx-auto max-w-3xl space-y-4">
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

      <div id={PRINT_ID} className="overflow-hidden rounded-3xl border border-base-700 bg-base-900/80 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.04)]">
        {/* Capa — banner de topo se existir; sem ele, um degradê discreto na cor de marca (nunca um bloco vazio/sem graça) */}
        <div className="relative">
          {temHero ? (
            <div className="relative h-56 w-full sm:h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={institucional.bannerUrl!} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
            </div>
          ) : (
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-accent/20 via-base-900 to-accent2/10 sm:h-48" />
          )}

          {institucional.logoUrl && (
            <div className="absolute -bottom-7 left-6 h-14 w-14 overflow-hidden rounded-2xl border-4 border-base-900 bg-base-800 shadow-lg sm:left-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={institucional.logoUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className={cn("absolute inset-x-0 bottom-0 p-6 sm:p-8", !temHero && "relative")}>
            <p className={cn("text-xs font-semibold uppercase tracking-widest", temHero ? "text-white/70" : "text-ink-muted")}>{dict.orcamentos.propostaComercialTitulo}</p>
            <h1 className={cn("mt-1 text-2xl font-semibold tracking-tight sm:text-3xl", temHero ? "text-white" : "text-ink-primary")}>{orcamento.titulo}</h1>
            <p className={cn("mt-1 text-sm", temHero ? "text-white/80" : "text-ink-secondary")}>{orcamento.nome_destinatario}</p>
            {orcamento.data_expiracao && <p className={cn("mt-1 text-xs", temHero ? "text-white/60" : "text-ink-muted")}>{dict.orcamentos.validoAte.replace("{data}", fmtDataCurta(orcamento.data_expiracao))}</p>}
          </div>
        </div>

        <div className={cn("space-y-6 p-6 sm:p-8", institucional.logoUrl && "pt-10")}>
          {(orcamento.texto_proposta || orcamento.objetivos) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {orcamento.texto_proposta && (
                <div className="rounded-2xl border border-base-800 bg-base-950/40 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
                    <IconBriefcase className="h-3.5 w-3.5" />
                    <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.propostaSecaoTitulo}</p>
                  </div>
                  <p className="whitespace-pre-line text-sm text-ink-secondary">{orcamento.texto_proposta}</p>
                </div>
              )}
              {orcamento.objetivos && (
                <div className="rounded-2xl border border-base-800 bg-base-950/40 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
                    <IconTarget className="h-3.5 w-3.5" />
                    <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.objetivosSecaoTitulo}</p>
                  </div>
                  <p className="whitespace-pre-line text-sm text-ink-secondary">{orcamento.objetivos}</p>
                </div>
              )}
            </div>
          )}

          {itensObrigatorios.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensInclusosTitulo}</p>
              <div className="divide-y divide-base-800 rounded-2xl border border-base-800">
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
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensOpcionaisTitulo}</p>
              {podeInteragir && <p className="mb-2 text-xs text-ink-muted">{dict.orcamentos.hintItensOpcionaisPublico}</p>}
              <div className="divide-y divide-base-800 rounded-2xl border border-base-800">
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

          {orcamento.portfolio.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.nossosTrabalhosTitulo}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {orcamento.portfolio.map((item) => (
                  <div key={item.id} className="relative aspect-video overflow-hidden rounded-xl border border-base-800" title={item.titulo}>
                    {item.tipo_midia === "video" ? (
                      <video src={item.url} className="h-full w-full object-cover" muted controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.titulo} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-black/70 text-white print:hidden">
                      {item.tipo_midia === "video" ? <IconFilm className="h-2.5 w-2.5" /> : <IconImage className="h-2.5 w-2.5" />}
                    </div>
                  </div>
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
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">{fmtBRL(total)}</span>
            </div>
          </div>

          {orcamento.condicoes_pagamento && (
            <div className="border-t border-base-800 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.condicoesDePagamentoTitulo}</p>
              <p className="mt-1 text-sm text-ink-secondary">{orcamento.condicoes_pagamento}</p>
            </div>
          )}

          {orcamento.observacoes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.observacoesTitulo}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-secondary">{orcamento.observacoes}</p>
            </div>
          )}

          {temQuemSomos && (
            <div className="border-t border-base-800 pt-5">
              <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
                <IconBuilding className="h-3.5 w-3.5" />
                <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.quemSomosTitulo}</p>
              </div>
              {institucional.textoInstitucional && <p className="whitespace-pre-line text-sm text-ink-secondary">{institucional.textoInstitucional}</p>}
              {institucional.clientesAtendidos.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-ink-muted">{dict.orcamentos.empresasAtendidasTitulo}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {institucional.clientesAtendidos.map((nome, idx) => (
                      <span key={idx} className="rounded-full border border-base-700 bg-base-800/60 px-2.5 py-1 text-xs text-ink-secondary">
                        {nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {institucional.rodapeUrl && (
            <div className="-mx-6 -mb-6 overflow-hidden sm:-mx-8 sm:-mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={institucional.rodapeUrl} alt="" className="h-20 w-full object-cover sm:h-24" />
            </div>
          )}

          {orcamento.empresaNome && <p className="border-t border-base-800 pt-4 text-xs text-ink-muted">{dict.orcamentos.rodapePublico.replace("{empresa}", orcamento.empresaNome)}</p>}
        </div>
      </div>

      {podeInteragir && (
        <div className="rounded-2xl border border-base-800 bg-base-900/60 p-5 print:hidden">
          <p className="text-sm font-semibold text-ink-primary">{dict.orcamentos.ctaDecisaoTitulo}</p>
          <p className="mt-1 text-xs text-ink-muted">{dict.orcamentos.ctaDecisaoDescricao}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogRecusar(true)}>
              {dict.orcamentos.recusarOrcamentoBtn}
            </Button>
            <Button className="gap-1.5" onClick={() => setDialogAprovar(true)}>
              <IconCheckCircle className="h-4 w-4" />
              {dict.orcamentos.aprovarOrcamentoBtn}
            </Button>
          </div>
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
