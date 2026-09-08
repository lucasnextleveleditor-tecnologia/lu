"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContratoTipoRow } from "@/lib/types/contratos";
import { calcularTotalContrato } from "@/lib/types/contratos";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";
import { montarClausulasPadrao, substituirPlaceholders } from "@/lib/utils/contratos";
import { listarModelosPorPerfil, buscarModelo, montarValoresAutoPreenchiveis } from "@/lib/contratos/modelos/mapeamento";
import { substituirPlaceholders as substituirPlaceholdersModelo, listarPlaceholdersPendentes, type CampoDinamicoModelo } from "@/lib/contratos/modelos/tipos";
import { criarContratoCompleto, atualizarContratoCompleto, enviarContrato, type ContratoItemInput } from "@/app/admin/contratos/actions";
import type { buscarContratoPorId, OrcamentoParaVincular, EmpresaContratante } from "@/app/admin/contratos/data";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ContratoParaEditar = Awaited<ReturnType<typeof buscarContratoPorId>>;
interface ClienteOpcao {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  endereco: string | null;
}

interface ItemLocal {
  key: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
}

function novaChave(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
}

interface ContratoBuilderProps {
  /** Nome de MARCA (branding, `companies.nome_app` via `getNomeApp()`) — usado só pelo modelo simples legado (placeholder `{{empresa}}`). Nunca usar aqui pro CONTRATADO jurídico dos modelos ricos — ver prop `empresa`. */
  nomeEmpresa: string;
  /** Dados jurídicos reais da própria empresa (CONTRATADO) — razão social (`companies.nome`) + CPF/CNPJ + endereço, usados só pra auto-preencher os `[TAG]` do banco de modelos ricos (`BANCO_DE_MODELOS`). Prop separada de `nomeEmpresa` de propósito (ver comentário acima). */
  empresa: EmpresaContratante;
  clientes: ClienteOpcao[];
  tiposContrato: Record<PerfilOrcamento, ContratoTipoRow | null>;
  orcamentosParaVincular: OrcamentoParaVincular[];
  contratoParaEditar?: ContratoParaEditar;
  /** Pré-seleciona a origem quando a tela `/novo` chega com `?orcamentoId=` (ex: vindo do botão "Gerar Contrato" no orçamento aprovado). */
  orcamentoIdInicial?: string;
  /**
   * Quando informado, o builder cede o pós-criação a quem chama em vez do
   * `router.push("/admin/contratos/[id]")` padrão — usado pelo `OrcamentoHub`
   * (aba "Contrato" embutida no detalhe do orçamento), que prefere
   * `router.refresh()` pra recarregar `buscarContratoVinculado` no server e
   * trocar pra `ContratoDetalhe` automaticamente, sem navegar pra outra
   * página. Nunca chamado na EDIÇÃO (só no fluxo de criação) nem nas rotas
   * `/admin/contratos/novo` e `/[id]/editar`, que não passam essa prop e
   * mantêm o comportamento de sempre.
   */
  aoCriarComSucesso?: (contratoId: string) => void;
}

export function ContratoBuilder({
  nomeEmpresa,
  empresa,
  clientes,
  tiposContrato,
  orcamentosParaVincular,
  contratoParaEditar,
  orcamentoIdInicial,
  aoCriarComSucesso,
}: ContratoBuilderProps) {
  const { dict } = useLocale();
  const router = useRouter();
  const editando = !!contratoParaEditar;

  const [orcamentoId, setOrcamentoId] = useState<string | null>(contratoParaEditar?.orcamento_id ?? null);
  const [tipoPerfil, setTipoPerfil] = useState<PerfilOrcamento | null>(contratoParaEditar?.tipo_perfil ?? null);
  // Fonte das cláusulas: `true` (padrão) usa o banco de modelos ricos
  // (`BANCO_DE_MODELOS`, `[TAG]`, dezenas de modelos por perfil × tipo de
  // serviço); `false` volta pro caminho legado (`contratos_tipos` +
  // `montarClausulasPadrao`, `{{tag}}`, um modelo só por perfil, editável em
  // Aparência > Modelos). Trocar o modo NUNCA mexe em `clausulas` sozinho —
  // só um clique explícito em "Aplicar modelo"/"Gerar cláusulas" aplica.
  const [usarModeloNovo, setUsarModeloNovo] = useState(true);
  const [tipoServico, setTipoServico] = useState<string | null>(contratoParaEditar?.tipo_servico ?? null);
  const [valoresManuais, setValoresManuais] = useState<Record<string, string>>({});
  const [camposPendentes, setCamposPendentes] = useState<string[]>([]);
  const [titulo, setTitulo] = useState(contratoParaEditar?.titulo ?? "");
  const [clienteId, setClienteId] = useState(contratoParaEditar?.cliente_id ?? "");
  const [nomeCliente, setNomeCliente] = useState(contratoParaEditar?.nome_cliente ?? "");
  const [emailCliente, setEmailCliente] = useState(contratoParaEditar?.email_cliente ?? "");
  const [whatsappCliente, setWhatsappCliente] = useState(contratoParaEditar?.whatsapp_cliente ?? "");
  const [condicoesPagamento, setCondicoesPagamento] = useState(contratoParaEditar?.condicoes_pagamento ?? "");
  const [observacoes, setObservacoes] = useState(contratoParaEditar?.observacoes ?? "");
  const [clausulas, setClausulas] = useState(contratoParaEditar?.clausulas ?? "");

  const [itens, setItens] = useState<ItemLocal[]>(
    contratoParaEditar?.itens.map((i) => ({ key: novaChave(), nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valor_unitario })) ?? []
  );
  const [pNome, setPNome] = useState("");
  const [pValor, setPValor] = useState(0);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => calcularTotalContrato(itens.map((i) => ({ quantidade: i.quantidade, valor_unitario: i.valorUnitario }))), [itens]);

  function handleSelecionarCliente(id: string) {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      if (!nomeCliente) setNomeCliente(cliente.nome);
      if (!emailCliente && cliente.email) setEmailCliente(cliente.email);
      if (!whatsappCliente && cliente.telefone) setWhatsappCliente(cliente.telefone);
    }
  }

  /** Herda cabeçalho + itens de um orçamento já aprovado — só disponível na criação (não dá pra trocar a origem de um contrato já existente). */
  function escolherOrcamento(id: string) {
    setOrcamentoId(id || null);
    if (!id) return;
    const orc = orcamentosParaVincular.find((o) => o.id === id);
    if (!orc) return;

    setTitulo(`Contrato — ${orc.titulo}`);
    setClienteId(orc.cliente_id ?? "");
    setNomeCliente(orc.cliente_nome ?? orc.nome_destinatario);
    setEmailCliente(orc.email_destinatario ?? "");
    setWhatsappCliente(orc.whatsapp_destinatario ?? "");
    setCondicoesPagamento(orc.condicoes_pagamento ?? "");
    setItens(orc.itens.map((i) => ({ key: novaChave(), nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valor_unitario })));
    if (orc.tipo_perfil) {
      setTipoPerfil(orc.tipo_perfil);
    }
    // Só pré-seleciona o tipo de serviço — nunca gera as cláusulas sozinho
    // aqui (mesmo espírito do resto desta função: herda dados, mas quem
    // decide gerar o texto é sempre um clique explícito em "Aplicar modelo").
    if (orc.tipo_servico) {
      setTipoServico(orc.tipo_servico);
    }
  }

  // Roda só uma vez, na montagem — pré-seleciona a origem quando a tela
  // chega com `?orcamentoId=` (ex: vindo do botão "Gerar Contrato" no
  // orçamento aprovado). Nunca dispara na edição de um contrato existente.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!editando && orcamentoIdInicial) escolherOrcamento(orcamentoIdInicial);
  }, []);

  /**
   * (Re)gera o texto de cláusulas a partir do modelo do perfil, substituindo
   * os placeholders pelos valores JÁ PREENCHIDOS na tela neste momento —
   * pode ser chamado de novo a qualquer momento (botão "Aplicar modelo") pra
   * atualizar o texto depois de mudar cliente/valor/condições, mas NUNCA
   * sobrescreve edições manuais sem o usuário clicar de novo no botão.
   */
  function aplicarModelo(perfil: PerfilOrcamento) {
    setTipoPerfil(perfil);
    const modelo = tiposContrato[perfil]?.clausulas_padrao || montarClausulasPadrao(perfil);
    const condicoesModelo = !condicoesPagamento ? tiposContrato[perfil]?.condicoes_pagamento_padrao : null;
    if (condicoesModelo) setCondicoesPagamento(condicoesModelo);

    const textoFinal = substituirPlaceholders(modelo, {
      empresa: nomeEmpresa,
      cliente: nomeCliente || dict.contratos.placeholderNomeCliente,
      titulo: titulo || dict.contratos.placeholderTituloContrato,
      valorTotal: fmtBRL(total),
      condicoesPagamento: condicoesModelo || condicoesPagamento || "",
      data: new Date().toLocaleDateString("pt-BR"),
    });
    setClausulas(textoFinal);
  }

  /**
   * Equivalente a `aplicarModelo`, mas pro banco de modelos ricos
   * (`BANCO_DE_MODELOS`, `[TAG]`): busca o modelo do (perfil, tipo de
   * serviço) escolhidos, monta os valores auto-preenchíveis a partir do
   * cliente/empresa/total já na tela e substitui — igual ao legado, só
   * dispara com um clique explícito, nunca sozinho. Depois de gerar,
   * recalcula `camposPendentes` (os `[TAG]` que sobraram sem dado conhecido)
   * pro formulário lateral aparecer, e zera `valoresManuais` (texto novo,
   * preenchimento manual anterior não faz mais sentido).
   */
  function aplicarModeloNovo() {
    if (!tipoPerfil || !tipoServico) return;
    const modelo = buscarModelo(tipoPerfil, tipoServico);
    if (!modelo) return;

    const valoresAuto = montarValoresAutoPreenchiveis({
      cliente: clientes.find((c) => c.id === clienteId) ?? null,
      nomeDestinatario: nomeCliente,
      empresa,
      valorTotal: total,
      condicoesPagamento,
      dataAssinatura: new Date().toLocaleDateString("pt-BR"),
    });

    const resultado = substituirPlaceholdersModelo(modelo.texto, valoresAuto);
    setClausulas(resultado);
    setCamposPendentes(listarPlaceholdersPendentes(resultado));
    setValoresManuais({});
  }

  /** Reaplica o modelo atual combinando os valores auto-preenchíveis (recalculados na hora) com o que o usuário preencheu à mão no formulário de campos pendentes — chamado pelo botão "Preencher e aplicar". */
  function preencherCamposPendentes() {
    if (!tipoPerfil || !tipoServico) return;
    const modelo = buscarModelo(tipoPerfil, tipoServico);
    if (!modelo) return;

    const valoresAuto = montarValoresAutoPreenchiveis({
      cliente: clientes.find((c) => c.id === clienteId) ?? null,
      nomeDestinatario: nomeCliente,
      empresa,
      valorTotal: total,
      condicoesPagamento,
      dataAssinatura: new Date().toLocaleDateString("pt-BR"),
    });

    const resultado = substituirPlaceholdersModelo(modelo.texto, { ...valoresAuto, ...valoresManuais });
    setClausulas(resultado);
    setCamposPendentes(listarPlaceholdersPendentes(resultado));
  }

  function adicionarItem() {
    if (!pNome.trim()) return;
    setItens((prev) => [...prev, { key: novaChave(), nome: pNome.trim(), descricao: null, quantidade: 1, valorUnitario: pValor }]);
    setPNome("");
    setPValor(0);
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
      orcamentoId: editando ? (contratoParaEditar?.orcamento_id ?? null) : orcamentoId,
      tipoPerfil,
      tipoServico: usarModeloNovo ? tipoServico : null,
      titulo,
      clienteId: clienteId || null,
      nomeCliente,
      emailCliente: emailCliente || null,
      whatsappCliente: whatsappCliente || null,
      clausulas,
      condicoesPagamento: condicoesPagamento || null,
      observacoes: observacoes || null,
    };
    const itensInput: ContratoItemInput[] = itens.map((i) => ({ nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, valorUnitario: i.valorUnitario }));

    startTransition(async () => {
      let id: string;
      if (editando) {
        const result = await atualizarContratoCompleto(contratoParaEditar.id, header, itensInput);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        id = contratoParaEditar.id;
      } else {
        const result = await criarContratoCompleto(header, itensInput);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        id = result.id;
      }

      if (enviarDepois) {
        const resultEnvio = await enviarContrato(id);
        if (!resultEnvio.ok) {
          setError(resultEnvio.error);
          return;
        }
      }

      if (!editando && aoCriarComSucesso) {
        aoCriarComSucesso(id);
        return;
      }
      router.push(`/admin/contratos/${id}`);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {!editando && orcamentosParaVincular.length > 0 && (
          <Card>
            <h2 className="mb-1 text-sm font-semibold">{dict.contratos.origemTitulo}</h2>
            <p className="mb-3 text-xs text-ink-muted">{dict.contratos.origemHint}</p>
            <Select value={orcamentoId ?? ""} onChange={(e) => escolherOrcamento(e.target.value)}>
              <option value="">{dict.contratos.origemAvulso}</option>
              {orcamentosParaVincular.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.titulo} — {o.cliente_nome ?? o.nome_destinatario}
                </option>
              ))}
            </Select>
          </Card>
        )}

        <Card>
          <h2 className="mb-4 text-sm font-semibold">{dict.contratos.dadosDoContratoTitulo}</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex gap-1.5 rounded-lg border border-base-800 bg-base-900/60 p-1">
                <button
                  type="button"
                  onClick={() => setUsarModeloNovo(true)}
                  className={cn(
                    "flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
                    usarModeloNovo ? "bg-accent/15 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
                  )}
                >
                  {dict.contratos.modeloOrigemNovoBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setUsarModeloNovo(false)}
                  className={cn(
                    "flex-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
                    !usarModeloNovo ? "bg-accent/15 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
                  )}
                >
                  {dict.contratos.modeloOrigemLegadoBtn}
                </button>
              </div>

              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.contratos.tipoDeContratoLabel}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_PORTFOLIO.map((perfil) => (
                  <button
                    key={perfil}
                    type="button"
                    onClick={() => {
                      if (usarModeloNovo) {
                        setTipoPerfil(perfil);
                        setTipoServico(null);
                        setCamposPendentes([]);
                      } else {
                        aplicarModelo(perfil);
                      }
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      tipoPerfil === perfil ? "border-accent bg-accent/15 text-ink-primary" : "border-base-600 text-ink-secondary hover:text-ink-primary"
                    )}
                  >
                    {dict.orcamentos.categoriasProfissao[perfil]}
                  </button>
                ))}
              </div>

              {!usarModeloNovo && tipoPerfil && (
                <button type="button" onClick={() => aplicarModelo(tipoPerfil)} className="mt-2 text-xs font-medium text-accent hover:underline">
                  {dict.contratos.aplicarModeloBtn}
                </button>
              )}

              {usarModeloNovo && tipoPerfil && (
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.contratos.tipoServicoLabel}</label>
                  {listarModelosPorPerfil(tipoPerfil).length === 0 ? (
                    <p className="text-xs text-ink-muted">{dict.contratos.tipoServicoVazioSemModelos}</p>
                  ) : (
                    <>
                      <Select
                        value={tipoServico ?? ""}
                        onChange={(e) => {
                          setTipoServico(e.target.value || null);
                          setCamposPendentes([]);
                        }}
                      >
                        <option value="">{dict.contratos.tipoServicoVazio}</option>
                        {listarModelosPorPerfil(tipoPerfil).map((m) => (
                          <option key={m.tipoServico} value={m.tipoServico}>
                            {m.nome}
                          </option>
                        ))}
                      </Select>
                      {tipoServico && buscarModelo(tipoPerfil, tipoServico) && (
                        <p className="mt-1 text-xs text-ink-muted">{buscarModelo(tipoPerfil, tipoServico)!.descricao}</p>
                      )}
                      {tipoServico && (
                        <button type="button" onClick={aplicarModeloNovo} className="mt-2 text-xs font-medium text-accent hover:underline">
                          {dict.contratos.aplicarModeloNovoBtn}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.contratos.tituloContratoLabel}</label>
              <Input required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={dict.contratos.placeholderTituloContrato} />
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
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.contratos.nomeClienteLabel}</label>
                <Input required value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder={dict.contratos.placeholderNomeCliente} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.emailDestinatarioLabel}</label>
                <Input type="email" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.whatsappDestinatarioLabel}</label>
                <Input value={whatsappCliente} onChange={(e) => setWhatsappCliente(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.condicoesPagamentoLabel}</label>
              <Input value={condicoesPagamento} onChange={(e) => setCondicoesPagamento(e.target.value)} placeholder={dict.orcamentos.placeholderCondicoesPagamento} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.observacoesLabel}</label>
              <Textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder={dict.orcamentos.placeholderObservacoesOrcamento} />
            </div>
          </div>
        </Card>

        {usarModeloNovo && tipoServico && camposPendentes.length > 0 && (
          <Card>
            <h2 className="mb-1 text-sm font-semibold">{dict.contratos.camposPendentesTitulo}</h2>
            <p className="mb-3 text-xs text-ink-muted">{dict.contratos.camposPendentesHint}</p>
            <div className="space-y-3">
              {camposPendentes.map((tag) => {
                const campo: CampoDinamicoModelo | undefined = tipoPerfil ? buscarModelo(tipoPerfil, tipoServico)?.camposDinamicos.find((c) => c.tag === tag) : undefined;
                const label = campo?.label ?? tag.replace(/_/g, " ");
                return (
                  <div key={tag}>
                    <label className="mb-1 block text-xs text-ink-secondary">{label}</label>
                    {campo?.tipo === "textarea" ? (
                      <Textarea
                        rows={2}
                        value={valoresManuais[tag] ?? ""}
                        placeholder={campo?.exemplo}
                        onChange={(e) => setValoresManuais((v) => ({ ...v, [tag]: e.target.value }))}
                      />
                    ) : campo?.tipo === "moeda" ? (
                      <CurrencyInput value={Number(valoresManuais[tag] ?? 0)} onChange={(n) => setValoresManuais((v) => ({ ...v, [tag]: String(n) }))} />
                    ) : (
                      <Input
                        type={campo?.tipo === "data" ? "date" : campo?.tipo === "numero" || campo?.tipo === "percentual" ? "number" : "text"}
                        value={valoresManuais[tag] ?? ""}
                        placeholder={campo?.exemplo}
                        onChange={(e) => setValoresManuais((v) => ({ ...v, [tag]: e.target.value }))}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" className="mt-3 px-3 py-1.5 text-xs" onClick={preencherCamposPendentes}>
              {dict.contratos.preencherEAplicarBtn}
            </Button>
          </Card>
        )}

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.contratos.clausulasTitulo}</h2>
          <p className="mb-3 text-xs text-ink-muted">{dict.contratos.clausulasHint}</p>
          <Textarea rows={18} value={clausulas} onChange={(e) => setClausulas(e.target.value)} className="font-mono text-xs leading-relaxed" />
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">{dict.contratos.itensDoContratoTitulo}</h2>

          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">{dict.contratos.itensVazioDescricao}</p>
          ) : (
            <div className="space-y-3">
              {itens.map((item) => (
                <div key={item.key} className="rounded-lg border border-base-800 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <Input value={item.nome} onChange={(e) => atualizarItem(item.key, { nome: e.target.value })} className="text-sm" />
                    <button onClick={() => removerItem(item.key)} className="shrink-0 rounded p-1 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(item.key, { quantidade: Number(e.target.value) || 1 })}
                      className="py-1.5 text-xs"
                    />
                    <CurrencyInput value={item.valorUnitario} onChange={(v) => atualizarItem(item.key, { valorUnitario: v })} className="py-1" />
                  </div>
                  <p className="mt-2 text-right text-sm font-semibold text-ink-primary">{fmtBRL(item.quantidade * item.valorUnitario)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-800 pt-3">
            <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder={dict.orcamentos.nomeServicoLabel} className="min-w-[140px] flex-1" />
            <CurrencyInput value={pValor} onChange={setPValor} className="w-28" />
            <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={adicionarItem} disabled={!pNome.trim()}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.adicionarItemBtn}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between border-t-0 pt-0 text-base font-semibold text-ink-primary">
            <span>{dict.orcamentos.totalLabel}</span>
            <span>{fmtBRL(total)}</span>
          </div>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}

          <div className="mt-4 flex flex-col gap-2">
            <Button variant="ghost" disabled={pending} onClick={() => salvar(false)}>
              {dict.contratos.salvarRascunhoBtn}
            </Button>
            <Button disabled={pending} onClick={() => salvar(true)}>
              {dict.contratos.salvarEEnviarBtn}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
