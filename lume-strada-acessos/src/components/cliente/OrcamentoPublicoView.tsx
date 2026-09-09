"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrcItemRow, StatusOrcamento } from "@/lib/types/orcamentos";
import { calcularTotalOrcamento } from "@/lib/types/orcamentos";
import type { buscarOrcamentoPublicoPorToken } from "@/app/orcamento/data";
import { alternarItemPublico, aprovarOrcamentoPublico, recusarOrcamentoPublico } from "@/app/orcamento/actions";
import { exportarElementoComoPDF, ExportError } from "@/lib/utils/export";
import { fmtDataCurta } from "@/lib/utils/format";
import { OrcamentoPropostaPreview, type ItemPreview } from "@/components/cliente/OrcamentoPropostaPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconPrinter, IconDownload, IconCheckCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type OrcamentoPublico = NonNullable<Awaited<ReturnType<typeof buscarOrcamentoPublicoPorToken>>>;

const PRINT_ID = "orcamento-publico-conteudo";

function paraItemPreview(item: OrcItemRow): ItemPreview {
  return {
    id: item.id,
    nome: item.nome,
    descricao: item.descricao,
    quantidade: item.quantidade,
    valorUnitario: item.valor_unitario,
    opcional: item.opcional,
    selecionado: item.selecionado,
  };
}

/**
 * Página pública do orçamento — cuida só de status/interação (aprovar,
 * recusar, marcar item opcional, baixar PDF, imprimir); a apresentação
 * visual da proposta em si é o `OrcamentoPropostaPreview` compartilhado com
 * o preview ao vivo do construtor admin (`OrcamentoBuilder.tsx`) — mudou lá,
 * muda aqui também, sem duplicar JSX.
 */
export function OrcamentoPublicoView({ orcamento, token }: { orcamento: OrcamentoPublico; token: string }) {
  const { dict } = useLocale();
  const [itens, setItens] = useState<OrcItemRow[]>(orcamento.itens);
  const [error, setError] = useState<string | null>(null);
  const [baixandoPdf, setBaixandoPdf] = useState(false);

  const [dialogAprovar, setDialogAprovar] = useState(false);
  const [dialogRecusar, setDialogRecusar] = useState(false);
  const [nomeAprovador, setNomeAprovador] = useState("");
  const [cpfAprovador, setCpfAprovador] = useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [statusLocal, setStatusLocal] = useState<StatusOrcamento>(orcamento.statusExibicao);
  const [decidido, setDecidido] = useState<{ nome?: string; data: string; motivo?: string } | null>(null);
  // Link da própria página, só pra gerar o QR Code de "abrir no celular" no
  // encerramento — lido do browser (client-side) porque é o link de verdade
  // que o cliente está vendo agora, com token e tudo.
  const [linkPublico, setLinkPublico] = useState<string | null>(null);
  useEffect(() => {
    setLinkPublico(window.location.href);
  }, []);

  const STATUS_LABEL: Record<StatusOrcamento, string> = {
    rascunho: dict.orcamentos.statusRascunho,
    enviado: dict.orcamentos.statusEnviado,
    visualizado: dict.orcamentos.statusVisualizado,
    aprovado: dict.orcamentos.statusAprovado,
    recusado: dict.orcamentos.statusRecusado,
    expirado: dict.orcamentos.statusExpirado,
  };

  const { subtotal, desconto, total } = useMemo(() => calcularTotalOrcamento(itens, orcamento.desconto_tipo, orcamento.desconto_valor), [itens, orcamento.desconto_tipo, orcamento.desconto_valor]);

  const itensObrigatorios = useMemo(() => itens.filter((i) => !i.opcional).map(paraItemPreview), [itens]);
  const itensOpcionais = useMemo(() => itens.filter((i) => i.opcional).map(paraItemPreview), [itens]);
  const podeInteragir = orcamento.podeInteragir && statusLocal !== "aprovado" && statusLocal !== "recusado";

  function handleToggleItem(item: ItemPreview) {
    if (!podeInteragir) return;
    const novoValor = !item.selecionado;
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, selecionado: novoValor } : i)));
    alternarItemPublico(token, item.id, novoValor).then((result) => {
      if (!result.ok) {
        setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, selecionado: !novoValor } : i)));
        setError(result.error);
      }
    });
  }

  async function handleAprovar() {
    if (!nomeAprovador.trim()) {
      setError(dict.orcamentos.placeholderSeuNome);
      return;
    }
    if (!cpfAprovador.trim()) {
      setError(dict.orcamentos.erroCpfObrigatorio);
      return;
    }
    if (cpfAprovador.replace(/\D/g, "").length !== 11 && cpfAprovador.replace(/\D/g, "").length !== 14) {
      setError(dict.orcamentos.erroCpfInvalido);
      return;
    }
    setEnviando(true);
    setError(null);
    const result = await aprovarOrcamentoPublico(token, nomeAprovador, cpfAprovador);
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

      <OrcamentoPropostaPreview
        id={PRINT_ID}
        titulo={orcamento.titulo}
        nomeDestinatario={orcamento.nome_destinatario}
        dataExpiracao={orcamento.data_expiracao}
        textoProposta={orcamento.texto_proposta}
        objetivos={orcamento.objetivos}
        itensObrigatorios={itensObrigatorios}
        itensOpcionais={itensOpcionais}
        interactive={podeInteragir}
        onToggleItem={handleToggleItem}
        subtotal={subtotal}
        desconto={desconto}
        total={total}
        temDesconto={!!orcamento.desconto_tipo}
        condicoesPagamento={orcamento.condicoes_pagamento}
        observacoes={orcamento.observacoes}
        portfolio={orcamento.portfolio}
        institucional={orcamento.institucional}
        empresaNome={orcamento.empresaNome}
        corDestaque={orcamento.cor_destaque}
        capaUrl={orcamento.capaUrl}
        capaSubtitulo={orcamento.capa_subtitulo}
        escalaTextoCapa={orcamento.escala_texto_capa}
        quantidadeDiarias={orcamento.quantidade_diarias}
        equipeEscalada={orcamento.equipe_escalada}
        itensEntrega={orcamento.itensEntrega}
        colunasInvestimento={orcamento.colunasInvestimento}
        linkPublico={linkPublico}
      />

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
            <label className="mb-1.5 mt-3 block text-xs font-medium text-ink-secondary">{dict.orcamentos.cpfAprovadorLabel}</label>
            <Input value={cpfAprovador} onChange={(e) => setCpfAprovador(e.target.value)} placeholder={dict.orcamentos.placeholderCpfAprovador} />
            <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.cpfAprovadorHint}</p>
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
