"use client";

import { useState, useTransition } from "react";
import type { ServicoComCategoria, TipoOrcamentoComItens, PerfilOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";
import { salvarTipoOrcamento, type TipoOrcamentoItemInput } from "@/app/admin/orcamentos/tipos-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

import { cn } from "@/lib/utils/cn";

interface ItemLocal {
  key: string;
  servicoId: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
  opcional: boolean;
}

function novaChave(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
}

function itensDoTipo(tipo: TipoOrcamentoComItens | null): ItemLocal[] {
  return (tipo?.itens ?? []).map((i) => ({
    key: novaChave(),
    servicoId: i.servico_id,
    nome: i.nome,
    descricao: i.descricao,
    quantidade: i.quantidade,
    valorUnitario: i.valor_unitario,
    opcional: i.opcional,
  }));
}

interface TiposOrcamentoManagerProps {
  tipos: Record<PerfilOrcamento, TipoOrcamentoComItens | null>;
  servicosComCategoria: ServicoComCategoria[];
}

/** Um modelo (cabeçalho + itens padrão) por perfil profissional — pré-preenche o construtor de orçamento quando aquele tipo é escolhido num orçamento novo (ver `OrcamentoBuilder.tsx`). */
export function TiposOrcamentoManager({ tipos, servicosComCategoria }: TiposOrcamentoManagerProps) {
  const { dict, fmtMoeda } = useLocale();
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilOrcamento>(CATEGORIAS_PORTFOLIO[0]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const tipoInicial = tipos[perfilSelecionado];
  const [condicoes, setCondicoes] = useState(tipoInicial?.condicoes_pagamento_padrao ?? "");
  const [observacoes, setObservacoes] = useState(tipoInicial?.observacoes_padrao ?? "");
  const [validadeDias, setValidadeDias] = useState(tipoInicial?.validade_dias_padrao ?? 15);
  const [itens, setItens] = useState<ItemLocal[]>(itensDoTipo(tipoInicial));
  const [servicoParaAdicionar, setServicoParaAdicionar] = useState("");

  function trocarPerfil(perfil: PerfilOrcamento) {
    setPerfilSelecionado(perfil);
    setError(null);
    setSalvo(false);
    const tipo = tipos[perfil];
    setCondicoes(tipo?.condicoes_pagamento_padrao ?? "");
    setObservacoes(tipo?.observacoes_padrao ?? "");
    setValidadeDias(tipo?.validade_dias_padrao ?? 15);
    setItens(itensDoTipo(tipo));
  }

  function adicionarDoCatalogo() {
    const servico = servicosComCategoria.find((s) => s.id === servicoParaAdicionar);
    if (!servico) return;
    setItens((prev) => [
      ...prev,
      { key: novaChave(), servicoId: servico.id, nome: servico.nome, descricao: servico.descricao, quantidade: 1, valorUnitario: servico.valor_padrao, opcional: false },
    ]);
    setServicoParaAdicionar("");
  }

  function adicionarPersonalizado() {
    setItens((prev) => [...prev, { key: novaChave(), servicoId: null, nome: "", descricao: null, quantidade: 1, valorUnitario: 0, opcional: false }]);
  }

  function atualizarItem(key: string, patch: Partial<ItemLocal>) {
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removerItem(key: string) {
    setItens((prev) => prev.filter((i) => i.key !== key));
  }

  function salvar() {
    setError(null);
    setSalvo(false);
    const itensInput: TipoOrcamentoItemInput[] = itens.map((i) => ({
      servicoId: i.servicoId,
      nome: i.nome,
      descricao: i.descricao,
      quantidade: i.quantidade,
      valorUnitario: i.valorUnitario,
      opcional: i.opcional,
    }));
    startTransition(async () => {
      const result = await salvarTipoOrcamento(perfilSelecionado, {
        condicoesPagamentoPadrao: condicoes || null,
        observacoesPadrao: observacoes || null,
        validadeDiasPadrao: validadeDias,
        itens: itensInput,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSalvo(true);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      <div className="flex flex-row flex-wrap gap-2 lg:flex-col">
        {CATEGORIAS_PORTFOLIO.map((perfil) => (
          <button
            key={perfil}
            onClick={() => trocarPerfil(perfil)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm font-medium transition",
              perfilSelecionado === perfil ? "border-accent bg-accent/15 text-ink-primary" : "border-base-700 text-ink-secondary hover:text-ink-primary"
            )}
          >
            {dict.orcamentos.categoriasProfissao[perfil]}
          </button>
        ))}
      </div>

      <Card className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.validadeDiasLabel}</label>
            <Input type="number" min={1} value={validadeDias} onChange={(e) => setValidadeDias(Number(e.target.value) || 1)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.condicoesPagamentoLabel}</label>
            <Input value={condicoes} onChange={(e) => setCondicoes(e.target.value)} placeholder={dict.orcamentos.placeholderCondicoesPagamento} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.observacoesLabel}</label>
          <Textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder={dict.orcamentos.placeholderObservacoesOrcamento} />
        </div>

        <div className="border-t border-base-800 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.tiposItensTitulo}</p>

          {itens.length === 0 && <p className="mb-3 text-xs text-ink-muted">{dict.orcamentos.tiposItensVazio}</p>}

          <div className="space-y-2">
            {itens.map((item) => (
              <div key={item.key} className="flex flex-wrap items-center gap-2 rounded-lg border border-base-800 p-2.5">
                <Input value={item.nome} onChange={(e) => atualizarItem(item.key, { nome: e.target.value })} placeholder={dict.orcamentos.nomeServicoLabel} className="min-w-[160px] flex-1" />
                <CurrencyInput value={item.valorUnitario} onChange={(v) => atualizarItem(item.key, { valorUnitario: v })} className="w-32" />
                <label className="flex items-center gap-1.5 text-xs text-ink-secondary">
                  <input type="checkbox" checked={item.opcional} onChange={(e) => atualizarItem(item.key, { opcional: e.target.checked })} className="h-3.5 w-3.5 rounded border-base-600" />
                  {dict.orcamentos.itemOpcionalLabel}
                </label>
                <button onClick={() => removerItem(item.key)} className="rounded p-1 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select value={servicoParaAdicionar} onChange={(e) => setServicoParaAdicionar(e.target.value)} className="max-w-xs">
              <option value="">{dict.orcamentos.buscarServicoPlaceholder}</option>
              {servicosComCategoria.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {fmtMoeda(s.valor_padrao)}
                </option>
              ))}
            </Select>
            <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={adicionarDoCatalogo} disabled={!servicoParaAdicionar}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.adicionarItemBtn}
            </Button>
            <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={adicionarPersonalizado}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.itemPersonalizadoBtn}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {salvo && <p className="text-sm text-status-good">{dict.orcamentos.tiposSalvoMsg}</p>}

        <div className="flex justify-end border-t border-base-800 pt-4">
          <Button onClick={salvar} disabled={pending}>
            {pending ? dict.common.salvando : dict.orcamentos.tiposSalvarBtn}
          </Button>
        </div>
      </Card>
    </div>
  );
}
