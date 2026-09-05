"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrcCategoriaRow, ServicoComCategoria, DescontoTipo } from "@/lib/types/orcamentos";
import { calcularTotalOrcamento } from "@/lib/types/orcamentos";
import { criarOrcamentoCompleto, atualizarOrcamentoCompleto, enviarOrcamento, type ItemInput } from "@/app/admin/orcamentos/actions";
import type { buscarOrcamentoPorId } from "@/app/admin/orcamentos/data";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconPlus, IconTrash, IconSearch } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type OrcamentoParaEditar = Awaited<ReturnType<typeof buscarOrcamentoPorId>>;
interface ClienteOpcao {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
}

interface ItemLocal {
  key: string;
  servicoId: string | null;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
  opcional: boolean;
  selecionado: boolean;
}

function novaChave(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
}

interface OrcamentoBuilderProps {
  categorias: OrcCategoriaRow[];
  servicosComCategoria: ServicoComCategoria[];
  clientes: ClienteOpcao[];
  orcamentoParaEditar?: OrcamentoParaEditar;
}

export function OrcamentoBuilder({ categorias, servicosComCategoria, clientes, orcamentoParaEditar }: OrcamentoBuilderProps) {
  const { dict } = useLocale();
  const router = useRouter();
  const editando = !!orcamentoParaEditar;

  const [titulo, setTitulo] = useState(orcamentoParaEditar?.titulo ?? "");
  const [clienteId, setClienteId] = useState(orcamentoParaEditar?.cliente_id ?? "");
  const [nomeDestinatario, setNomeDestinatario] = useState(orcamentoParaEditar?.nome_destinatario ?? "");
  const [emailDestinatario, setEmailDestinatario] = useState(orcamentoParaEditar?.email_destinatario ?? "");
  const [whatsappDestinatario, setWhatsappDestinatario] = useState(orcamentoParaEditar?.whatsapp_destinatario ?? "");
  const [validadeDias, setValidadeDias] = useState(orcamentoParaEditar?.validade_dias ?? 15);
  const [condicoesPagamento, setCondicoesPagamento] = useState(orcamentoParaEditar?.condicoes_pagamento ?? "");
  const [observacoes, setObservacoes] = useState(orcamentoParaEditar?.observacoes ?? "");
  const [descontoTipo, setDescontoTipo] = useState<DescontoTipo | "">(orcamentoParaEditar?.desconto_tipo ?? "");
  const [descontoValor, setDescontoValor] = useState(orcamentoParaEditar?.desconto_valor ?? 0);

  const [itens, setItens] = useState<ItemLocal[]>(
    orcamentoParaEditar?.itens.map((i) => ({
      key: novaChave(),
      servicoId: i.servico_id,
      nome: i.nome,
      descricao: i.descricao,
      quantidade: i.quantidade,
      valorUnitario: i.valor_unitario,
      opcional: i.opcional,
      selecionado: i.selecionado,
    })) ?? []
  );

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [buscaServico, setBuscaServico] = useState("");
  const [personalizadoAberto, setPersonalizadoAberto] = useState(false);
  const [pNome, setPNome] = useState("");
  const [pDescricao, setPDescricao] = useState("");
  const [pValor, setPValor] = useState(0);
  const [pOpcional, setPOpcional] = useState(false);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const servicosFiltrados = useMemo(() => {
    const termo = buscaServico.trim().toLowerCase();
    return servicosComCategoria.filter((s) => {
      if (categoriaSelecionada && s.categoria_id !== categoriaSelecionada) return false;
      if (termo && !s.nome.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [servicosComCategoria, categoriaSelecionada, buscaServico]);

  const { subtotal, desconto, total } = calcularTotalOrcamento(
    itens.map((i) => ({ quantidade: i.quantidade, valor_unitario: i.valorUnitario, opcional: i.opcional, selecionado: i.selecionado })),
    descontoTipo || null,
    descontoValor
  );

  function handleSelecionarCliente(id: string) {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      if (!nomeDestinatario) setNomeDestinatario(cliente.nome);
      if (!emailDestinatario && cliente.email) setEmailDestinatario(cliente.email);
      if (!whatsappDestinatario && cliente.telefone) setWhatsappDestinatario(cliente.telefone);
    }
  }

  function handleAdicionarServico(servico: ServicoComCategoria) {
    setItens((prev) => [
      ...prev,
      {
        key: novaChave(),
        servicoId: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        quantidade: 1,
        valorUnitario: servico.valor_padrao,
        opcional: false,
        selecionado: true,
      },
    ]);
  }

  function handleAdicionarPersonalizado() {
    if (!pNome.trim()) return;
    setItens((prev) => [
      ...prev,
      {
        key: novaChave(),
        servicoId: null,
        nome: pNome.trim(),
        descricao: pDescricao.trim() || null,
        quantidade: 1,
        valorUnitario: pValor,
        opcional: pOpcional,
        selecionado: true,
      },
    ]);
    setPNome("");
    setPDescricao("");
    setPValor(0);
    setPOpcional(false);
    setPersonalizadoAberto(false);
  }

  function atualizarItem(key: string, patch: Partial<ItemLocal>) {
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function removerItem(key: string) {
    setItens((prev) => prev.filter((i) => i.key !== key));
  }

  async function salvar(enviarDepois: boolean) {
    setError(null);
    const header = {
      titulo,
      clienteId: clienteId || null,
      leadId: orcamentoParaEditar?.lead_id ?? null,
      nomeDestinatario,
      emailDestinatario: emailDestinatario || null,
      whatsappDestinatario: whatsappDestinatario || null,
      validadeDias,
      descontoTipo: descontoTipo || null,
      descontoValor,
      condicoesPagamento: condicoesPagamento || null,
      observacoes: observacoes || null,
    };
    const itensInput: ItemInput[] = itens.map((i) => ({
      servicoId: i.servicoId,
      nome: i.nome,
      descricao: i.descricao,
      quantidade: i.quantidade,
      valorUnitario: i.valorUnitario,
      opcional: i.opcional,
      selecionado: i.selecionado,
    }));

    startTransition(async () => {
      let id: string;
      if (editando) {
        const result = await atualizarOrcamentoCompleto(orcamentoParaEditar.id, header, itensInput);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        id = orcamentoParaEditar.id;
      } else {
        const result = await criarOrcamentoCompleto(header, itensInput);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        id = result.id;
      }
      if (enviarDepois) {
        const resultEnvio = await enviarOrcamento(id);
        if (!resultEnvio.ok) {
          setError(resultEnvio.error);
          return;
        }
      }
      router.push(`/admin/orcamentos/${id}`);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold">{dict.orcamentos.dadosDoOrcamentoTitulo}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.tituloOrcamentoLabel}</label>
              <Input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.orcamentos.placeholderTituloOrcamento} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.clienteExistenteLabel}</label>
                <Select value={clienteId} onChange={(e) => handleSelecionarCliente(e.target.value)}>
                  <option value="">{dict.orcamentos.clienteNenhum}</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.nomeDestinatarioLabel}</label>
                <Input required value={nomeDestinatario} onChange={(e) => setNomeDestinatario(e.target.value)} placeholder={dict.orcamentos.placeholderNomeDestinatario} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.emailDestinatarioLabel}</label>
                <Input type="email" value={emailDestinatario} onChange={(e) => setEmailDestinatario(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.whatsappDestinatarioLabel}</label>
                <Input value={whatsappDestinatario} onChange={(e) => setWhatsappDestinatario(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.validadeDiasLabel}</label>
                <Input type="number" min={1} value={validadeDias} onChange={(e) => setValidadeDias(Number(e.target.value) || 1)} />
                <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.hintValidadeDias}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.condicoesPagamentoLabel}</label>
                <Input value={condicoesPagamento} onChange={(e) => setCondicoesPagamento(e.target.value)} placeholder={dict.orcamentos.placeholderCondicoesPagamento} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.observacoesLabel}</label>
              <Textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder={dict.orcamentos.placeholderObservacoesOrcamento} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.descontoLabel}</label>
                <Select value={descontoTipo} onChange={(e) => setDescontoTipo(e.target.value as DescontoTipo | "")}>
                  <option value="">{dict.orcamentos.descontoTipoNenhum}</option>
                  <option value="percentual">{dict.orcamentos.descontoTipoPercentual}</option>
                  <option value="fixo">{dict.orcamentos.descontoTipoFixo}</option>
                </Select>
              </div>
              {descontoTipo && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">&nbsp;</label>
                  {descontoTipo === "percentual" ? (
                    <Input type="number" min={0} max={100} value={descontoValor} onChange={(e) => setDescontoValor(Number(e.target.value) || 0)} />
                  ) : (
                    <CurrencyInput value={descontoValor} onChange={setDescontoValor} />
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.escolhaCategoriaTitulo}</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaSelecionada(null)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                categoriaSelecionada === null ? "border-accent bg-accent/15 text-ink-primary" : "border-base-600 text-ink-secondary hover:text-ink-primary"
              )}
            >
              {dict.common.todos}
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoriaSelecionada(c.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  categoriaSelecionada === c.id ? "border-accent bg-accent/15 text-ink-primary" : "border-base-600 text-ink-secondary hover:text-ink-primary"
                )}
              >
                {c.emoji ? `${c.emoji} ` : ""}
                {c.nome}
              </button>
            ))}
          </div>

          <div className="relative mb-3">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <Input value={buscaServico} onChange={(e) => setBuscaServico(e.target.value)} placeholder={dict.orcamentos.buscarServicoPlaceholder} className="pl-9" />
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto">
            {servicosFiltrados.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-base-800 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink-primary">{s.nome}</p>
                  <p className="text-xs text-ink-muted">{fmtBRL(s.valor_padrao)}</p>
                </div>
                <Button variant="ghost" className="shrink-0 gap-1 px-2.5 py-1 text-xs" onClick={() => handleAdicionarServico(s)}>
                  <IconPlus className="h-3.5 w-3.5" />
                  {dict.orcamentos.adicionarItemBtn}
                </Button>
              </div>
            ))}
            {servicosFiltrados.length === 0 && <p className="py-3 text-center text-xs text-ink-muted">{dict.common.nenhumResultado}</p>}
          </div>

          <div className="mt-3 border-t border-base-800 pt-3">
            {personalizadoAberto ? (
              <div className="space-y-2.5 rounded-lg border border-base-700 p-3">
                <p className="text-xs font-semibold text-ink-secondary">{dict.orcamentos.itemPersonalizadoTitulo}</p>
                <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder={dict.orcamentos.nomeServicoLabel} />
                <Textarea rows={2} value={pDescricao} onChange={(e) => setPDescricao(e.target.value)} placeholder={dict.orcamentos.descricaoOpcionalLabel} />
                <CurrencyInput value={pValor} onChange={setPValor} />
                <label className="flex items-center gap-2 text-xs text-ink-secondary">
                  <input type="checkbox" checked={pOpcional} onChange={(e) => setPOpcional(e.target.checked)} className="h-3.5 w-3.5 rounded border-base-600" />
                  {dict.orcamentos.itemOpcionalLabel}
                </label>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setPersonalizadoAberto(false)}>
                    {dict.common.cancelar}
                  </Button>
                  <Button className="px-3 py-1.5 text-xs" onClick={handleAdicionarPersonalizado}>
                    {dict.orcamentos.adicionarItemBtn}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" className="gap-1.5 text-xs" onClick={() => setPersonalizadoAberto(true)}>
                <IconPlus className="h-3.5 w-3.5" />
                {dict.orcamentos.itemPersonalizadoBtn}
              </Button>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">{dict.orcamentos.itensDoOrcamentoTitulo}</h2>

          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">{dict.orcamentos.itensVazioDescricao}</p>
          ) : (
            <div className="space-y-3">
              {itens.map((item) => (
                <div key={item.key} className="rounded-lg border border-base-800 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink-primary">{item.nome}</p>
                    <button onClick={() => removerItem(item.key)} className="shrink-0 rounded p-1 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.quantidadeLabel}</label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.key, { quantidade: Number(e.target.value) || 1 })}
                        className="py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-ink-muted">{dict.orcamentos.valorUnitarioLabel}</label>
                      <CurrencyInput value={item.valorUnitario} onChange={(v) => atualizarItem(item.key, { valorUnitario: v })} className="py-1" />
                    </div>
                  </div>
                  <label className="mt-2 flex items-start gap-2 text-[11px] text-ink-secondary">
                    <input
                      type="checkbox"
                      checked={item.opcional}
                      onChange={(e) => atualizarItem(item.key, { opcional: e.target.checked, selecionado: e.target.checked ? item.selecionado : true })}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-base-600"
                    />
                    {dict.orcamentos.itemOpcionalLabel}
                  </label>
                  <p className="mt-2 text-right text-sm font-semibold text-ink-primary">{fmtBRL(item.quantidade * item.valorUnitario)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>{dict.orcamentos.subtotalLabel}</span>
              <span>{fmtBRL(subtotal)}</span>
            </div>
            {descontoTipo && (
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

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}

          <div className="mt-4 flex flex-col gap-2">
            <Button variant="ghost" disabled={pending} onClick={() => salvar(false)}>
              {dict.orcamentos.salvarRascunhoBtn}
            </Button>
            <Button disabled={pending} onClick={() => salvar(true)}>
              {dict.orcamentos.salvarEEnviarBtn}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
