"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OrcCategoriaRow, ServicoComCategoria, DescontoTipo, PerfilOrcamento, TipoOrcamentoComItens, PortfolioItemComUrl, DadosInstitucionaisOrcamento } from "@/lib/types/orcamentos";
import { calcularTotalOrcamento } from "@/lib/types/orcamentos";
import { criarOrcamentoCompleto, atualizarOrcamentoCompleto, enviarOrcamento, type ItemInput, type ItemEntregaInput, type ColunaInvestimentoInput } from "@/app/admin/orcamentos/actions";
import { salvarPortfolioDoOrcamento } from "@/app/admin/orcamentos/portfolio-actions";
import type { buscarOrcamentoPorId } from "@/app/admin/orcamentos/data";
import { CATEGORIAS_PORTFOLIO, CALCULADORA_HANDOFF_KEY, type ItemHandoffCalculadora } from "@/lib/utils/orcamentos";
import { listarModelosPorPerfil } from "@/lib/contratos/modelos/mapeamento";
import { OrcamentoPropostaPreview, type ItemPreview, type ItemEntregaPreview, type ColunaInvestimentoPreview } from "@/components/cliente/OrcamentoPropostaPreview";
import { MarcaApresentacaoCard } from "@/components/admin/orcamentos/MarcaApresentacaoCard";
import { CapaOrcamentoUploadField } from "@/components/admin/orcamentos/CapaOrcamentoUploadField";
import { CorDestaqueField } from "@/components/admin/orcamentos/CorDestaqueField";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconPlus, IconTrash, IconSearch, IconImage, IconFilm, IconEye, IconAlertTriangle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

import { cn } from "@/lib/utils/cn";
import { PlayerDeMidia } from "@/components/ui/PlayerDeMidia";

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

interface ItemEntregaLocal {
  key: string;
  item: string;
  prazo: string;
}

interface ColunaInvestimentoLocal {
  key: string;
  titulo: string;
  itens: string;
}

function novaChave(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
}

function paraItemPreview(item: ItemLocal): ItemPreview {
  return { id: item.key, nome: item.nome, descricao: item.descricao, quantidade: item.quantidade, valorUnitario: item.valorUnitario, opcional: item.opcional, selecionado: item.selecionado };
}

function paraItemEntregaPreview(item: ItemEntregaLocal): ItemEntregaPreview {
  return { id: item.key, item: item.item, prazo: item.prazo || null };
}

function paraColunaPreview(coluna: ColunaInvestimentoLocal): ColunaInvestimentoPreview {
  return { id: coluna.key, titulo: coluna.titulo, itens: coluna.itens || null };
}

interface OrcamentoBuilderProps {
  categorias: OrcCategoriaRow[];
  servicosComCategoria: ServicoComCategoria[];
  clientes: ClienteOpcao[];
  tiposOrcamento: Record<PerfilOrcamento, TipoOrcamentoComItens | null>;
  portfolioItens: PortfolioItemComUrl[];
  institucional: DadosInstitucionaisOrcamento;
  orcamentoParaEditar?: OrcamentoParaEditar;
  /** Area escolhida na primeira tela do fluxo novo. Quando vem preenchida, as
   *  pilhas de escolha somem do formulario e viram um resumo com link de trocar. */
  perfilInicial?: PerfilOrcamento;
  /** Tipo de trabalho escolhido na segunda tela. `null` = comecou do zero. */
  servicoInicial?: string | null;
}

export function OrcamentoBuilder({ categorias, servicosComCategoria, clientes, tiposOrcamento, portfolioItens, institucional, orcamentoParaEditar, perfilInicial, servicoInicial }: OrcamentoBuilderProps) {
  const { dict, fmtMoeda } = useLocale();
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
  const [textoProposta, setTextoProposta] = useState(orcamentoParaEditar?.texto_proposta ?? "");
  const [objetivos, setObjetivos] = useState(orcamentoParaEditar?.objetivos ?? "");
  const [descontoTipo, setDescontoTipo] = useState<DescontoTipo | "">(orcamentoParaEditar?.desconto_tipo ?? "");
  const [descontoValor, setDescontoValor] = useState(orcamentoParaEditar?.desconto_valor ?? 0);
  const [tipoPerfil, setTipoPerfil] = useState<PerfilOrcamento | null>(orcamentoParaEditar?.tipo_perfil ?? perfilInicial ?? null);
  const [tipoServico, setTipoServico] = useState<string | null>(orcamentoParaEditar?.tipo_servico ?? servicoInicial ?? null);
  // Quem chegou pelas duas telas de escolha ja decidiu area e tipo. Repetir as
  // pilhas aqui seria pedir a mesma decisao duas vezes -- e a segunda, num
  // canto do formulario, e a que costuma ser trocada sem querer.
  const vindoDoFluxo = !orcamentoParaEditar && !!perfilInicial;
  const modelosDoTipoServico = useMemo(() => listarModelosPorPerfil(tipoPerfil), [tipoPerfil]);
  const [portfolioSelecionado, setPortfolioSelecionado] = useState<string[]>(orcamentoParaEditar?.portfolio.map((p) => p.id) ?? []);

  // Proposta Comercial Web v2 — capa, cor de destaque e resumo do projeto
  // (ver `supabase/orcamentos-proposta-completa.sql`). Tudo opcional: some
  // do preview e nunca bloqueia salvar quando vazio.
  const [corDestaque, setCorDestaque] = useState(orcamentoParaEditar?.cor_destaque ?? "");
  const [capaPath, setCapaPath] = useState<string | null>(orcamentoParaEditar?.capa_path ?? null);
  const [capaUrl, setCapaUrl] = useState<string | null>(orcamentoParaEditar?.capaUrl ?? null);
  const [capaSubtitulo, setCapaSubtitulo] = useState(orcamentoParaEditar?.capa_subtitulo ?? "");
  const [escalaTextoCapa, setEscalaTextoCapa] = useState(orcamentoParaEditar?.escala_texto_capa ?? 1);
  const [quantidadeDiarias, setQuantidadeDiarias] = useState(orcamentoParaEditar?.quantidade_diarias ?? "");
  const [equipeEscalada, setEquipeEscalada] = useState(orcamentoParaEditar?.equipe_escalada ?? "");
  const [itensEntrega, setItensEntrega] = useState<ItemEntregaLocal[]>(() =>
    (orcamentoParaEditar?.itensEntrega ?? []).map((i) => ({ key: novaChave(), item: i.item, prazo: i.prazo ?? "" }))
  );
  const [colunasInvestimento, setColunasInvestimento] = useState<ColunaInvestimentoLocal[]>(() =>
    (orcamentoParaEditar?.colunasInvestimento ?? []).map((c) => ({ key: novaChave(), titulo: c.titulo, itens: c.itens ?? "" }))
  );

  function adicionarItemEntrega() {
    setItensEntrega((prev) => [...prev, { key: novaChave(), item: "", prazo: "" }]);
  }
  function atualizarItemEntrega(key: string, patch: Partial<ItemEntregaLocal>) {
    setItensEntrega((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }
  function removerItemEntrega(key: string) {
    setItensEntrega((prev) => prev.filter((i) => i.key !== key));
  }

  function adicionarColunaInvestimento() {
    setColunasInvestimento((prev) => [...prev, { key: novaChave(), titulo: "", itens: "" }]);
  }
  function atualizarColunaInvestimento(key: string, patch: Partial<ColunaInvestimentoLocal>) {
    setColunasInvestimento((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }
  function removerColunaInvestimento(key: string) {
    setColunasInvestimento((prev) => prev.filter((c) => c.key !== key));
  }

  // Marca/apresentação (logo, banner, rodapé, textos institucionais) — dado
  // da EMPRESA, não deste orçamento (ver `MarcaApresentacaoCard`), mas
  // mantido em estado aqui pra que o preview ao lado reflita a mudança na
  // hora, sem precisar recarregar a página depois de salvar.
  const [institucionalState, setInstitucionalState] = useState<DadosInstitucionaisOrcamento>(institucional);
  function handleInstitucionalChange(patch: Partial<DadosInstitucionaisOrcamento>) {
    setInstitucionalState((prev) => ({ ...prev, ...patch }));
  }

  const [itens, setItens] = useState<ItemLocal[]>(() => {
    if (orcamentoParaEditar) {
      return orcamentoParaEditar.itens.map((i) => ({
        key: novaChave(),
        servicoId: i.servico_id,
        nome: i.nome,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valorUnitario: i.valor_unitario,
        opcional: i.opcional,
        selecionado: i.selecionado,
      }));
    }

    // Sem orçamento pra editar (ou seja, `/novo`): checa se veio uma
    // simulação da Calculadora de Margem esperando pra virar orçamento (ver
    // `CalculadoraMargem.tsx`) — só client-side, nunca passa pelo servidor.
    // Lida com o handoff uma única vez (consome e limpa a chave) pra não
    // reaplicar os mesmos itens numa navegação de volta pra essa tela.
    try {
      const bruto = sessionStorage.getItem(CALCULADORA_HANDOFF_KEY);
      if (!bruto) return [];
      sessionStorage.removeItem(CALCULADORA_HANDOFF_KEY);
      const itensHandoff = JSON.parse(bruto) as ItemHandoffCalculadora[];
      return itensHandoff.map((i) => ({
        key: novaChave(),
        servicoId: null,
        nome: i.nome,
        descricao: null,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
        opcional: false,
        selecionado: true,
      }));
    } catch {
      return [];
    }
  });

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

  // Preview ao vivo (`OrcamentoPropostaPreview`, o MESMO componente da página
  // pública) — nada aqui é persistido, é só a leitura do estado atual do
  // formulário. `dataExpiracao` é uma projeção (hoje + validadeDias): o valor
  // real só é gravado no banco quando o orçamento é de fato enviado
  // (`enviarOrcamento`), mas mostrar a data aproximada aqui já ajuda a
  // pessoa a calibrar o prazo de validade enquanto ainda está editando.
  const dataExpiracaoPreview = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (validadeDias || 0));
    return d.toISOString().slice(0, 10);
  }, [validadeDias]);
  const itensObrigatoriosPreview = useMemo(() => itens.filter((i) => !i.opcional).map(paraItemPreview), [itens]);
  const itensOpcionaisPreview = useMemo(() => itens.filter((i) => i.opcional).map(paraItemPreview), [itens]);
  const portfolioSelecionadoItens = useMemo(() => portfolioItens.filter((p) => portfolioSelecionado.includes(p.id)), [portfolioItens, portfolioSelecionado]);
  const itensEntregaPreview = useMemo(() => itensEntrega.filter((i) => i.item.trim()).map(paraItemEntregaPreview), [itensEntrega]);
  const colunasInvestimentoPreview = useMemo(() => colunasInvestimento.filter((c) => c.titulo.trim()).map(paraColunaPreview), [colunasInvestimento]);

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

  /**
   * Aplica o modelo de um perfil (Fase 2): sempre marca a tag `tipoPerfil`;
   * se o orçamento ainda está vazio (nenhum item adicionado ainda), também
   * pré-preenche condições/observações/validade e carrega os itens padrão
   * do modelo — nunca sobrescreve algo que o usuário já preencheu na tela.
   * `forcarItens` (botão "Usar itens do modelo") ignora essa checagem e
   * ACRESCENTA os itens do modelo à lista atual, pra quem quer reaproveitar
   * o modelo depois de já ter começado a editar.
   */
  function escolherPerfil(perfil: PerfilOrcamento, forcarItens = false) {
    if (perfil !== tipoPerfil) setTipoServico(null);
    setTipoPerfil(perfil);
    const modelo = tiposOrcamento[perfil];
    if (!modelo) return;

    if (itens.length === 0 || forcarItens) {
      if (!forcarItens) {
        if (modelo.condicoes_pagamento_padrao && !condicoesPagamento) setCondicoesPagamento(modelo.condicoes_pagamento_padrao);
        if (modelo.observacoes_padrao && !observacoes) setObservacoes(modelo.observacoes_padrao);
        setValidadeDias(modelo.validade_dias_padrao);
      }
      if (modelo.itens.length > 0) {
        setItens((prev) => [
          ...prev,
          ...modelo.itens.map((i) => ({
            key: novaChave(),
            servicoId: i.servico_id,
            nome: i.nome,
            descricao: i.descricao,
            quantidade: i.quantidade,
            valorUnitario: i.valor_unitario,
            opcional: i.opcional,
            selecionado: true,
          })),
        ]);
      }
    }
  }

  function alternarPortfolioItem(id: string) {
    setPortfolioSelecionado((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
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
      textoProposta: textoProposta || null,
      objetivos: objetivos || null,
      tipoPerfil,
      tipoServico,
      corDestaque: corDestaque || null,
      capaPath,
      capaSubtitulo: capaSubtitulo || null,
      escalaTextoCapa,
      quantidadeDiarias: quantidadeDiarias || null,
      equipeEscalada: equipeEscalada || null,
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
    const itensEntregaInput: ItemEntregaInput[] = itensEntrega.filter((i) => i.item.trim()).map((i) => ({ item: i.item, prazo: i.prazo || null }));
    const colunasInput: ColunaInvestimentoInput[] = colunasInvestimento.filter((c) => c.titulo.trim()).map((c) => ({ titulo: c.titulo, itens: c.itens || null }));

    startTransition(async () => {
      let id: string;
      if (editando) {
        const result = await atualizarOrcamentoCompleto(orcamentoParaEditar.id, header, itensInput, itensEntregaInput, colunasInput);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        id = orcamentoParaEditar.id;
      } else {
        const result = await criarOrcamentoCompleto(header, itensInput, itensEntregaInput, colunasInput);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        id = result.id;
      }

      const resultPortfolio = await salvarPortfolioDoOrcamento(id, portfolioSelecionado);
      if (!resultPortfolio.ok) {
        setError(resultPortfolio.error);
        return;
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
      {/* Coluna do formulário — rola normalmente com a página */}
      <div className="space-y-4">
        <MarcaApresentacaoCard institucional={institucionalState} onChange={handleInstitucionalChange} />

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.orcamentos.capaTitulo}</h2>
          <p className="mb-3 text-xs text-ink-muted">{dict.orcamentos.capaSubtitulo}</p>
          <div className="space-y-4">
            <CapaOrcamentoUploadField path={capaPath} url={capaUrl} onChange={(v) => { setCapaPath(v.path); setCapaUrl(v.url); }} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.capaSubtituloLabel}</label>
              <Input value={capaSubtitulo} onChange={(e) => setCapaSubtitulo(e.target.value)} placeholder={dict.orcamentos.propostaComercialTitulo} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-secondary">
                <span>{dict.orcamentos.escalaTextoCapaLabel}</span>
                <span className="text-ink-muted">{escalaTextoCapa.toFixed(2)}×</span>
              </label>
              <input
                type="range"
                min={0.8}
                max={1.2}
                step={0.05}
                value={escalaTextoCapa}
                onChange={(e) => setEscalaTextoCapa(Number(e.target.value))}
                className="w-full accent-[rgb(var(--color-accent))]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-ink-muted">
                <span>{dict.orcamentos.escalaTextoCapaMenor}</span>
                <span>{dict.orcamentos.escalaTextoCapaPadrao}</span>
                <span>{dict.orcamentos.escalaTextoCapaMaior}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold">{dict.orcamentos.dadosDoOrcamentoTitulo}</h2>
          <div className="space-y-4">
            {vindoDoFluxo ? (
              <div className="rounded-xl border border-base-700 bg-base-900/50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted">{dict.orcamentos.resumoPerfilLabel}</p>
                    <p className="mt-0.5 text-sm font-medium text-ink-primary">
                      {tipoPerfil ? dict.orcamentos.categoriasProfissao[tipoPerfil] : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted">{dict.orcamentos.resumoServicoLabel}</p>
                    <p className="mt-0.5 text-sm font-medium text-ink-primary">
                      {modelosDoTipoServico.find((m) => m.tipoServico === tipoServico)?.nome ?? dict.orcamentos.resumoSemTipo}
                    </p>
                  </div>
                  <Link href="/admin/orcamentos/novo" className="ml-auto text-xs font-medium text-accent hover:underline">
                    {dict.orcamentos.resumoTrocar}
                  </Link>
                </div>
                {tipoPerfil && tiposOrcamento[tipoPerfil] && tiposOrcamento[tipoPerfil]!.itens.length > 0 && (
                  <button type="button" onClick={() => escolherPerfil(tipoPerfil, true)} className="mt-3 text-xs font-medium text-accent hover:underline">
                    {dict.orcamentos.usarItensDoModeloBtn}
                  </button>
                )}
              </div>
            ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.tipoDeOrcamentoLabel}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_PORTFOLIO.map((perfil) => (
                  <button
                    key={perfil}
                    type="button"
                    onClick={() => escolherPerfil(perfil)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      tipoPerfil === perfil ? "border-accent bg-accent/15 text-ink-primary" : "border-base-600 text-ink-secondary hover:text-ink-primary"
                    )}
                  >
                    {dict.orcamentos.categoriasProfissao[perfil]}
                  </button>
                ))}
              </div>
              {tipoPerfil && tiposOrcamento[tipoPerfil] && tiposOrcamento[tipoPerfil]!.itens.length > 0 && (
                <button type="button" onClick={() => escolherPerfil(tipoPerfil, true)} className="mt-2 text-xs font-medium text-accent hover:underline">
                  {dict.orcamentos.usarItensDoModeloBtn}
                </button>
              )}
              {tipoPerfil && modelosDoTipoServico.length > 0 && (
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.tipoServicoLabel}</label>
                  <Select value={tipoServico ?? ""} onChange={(e) => setTipoServico(e.target.value || null)}>
                    <option value="">{dict.orcamentos.tipoServicoVazio}</option>
                    {modelosDoTipoServico.map((m) => (
                      <option key={m.tipoServico} value={m.tipoServico}>
                        {m.nome}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.tipoServicoHint}</p>
                </div>
              )}
            </div>
            )}

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
                <Input type="email" value={emailDestinatario} onChange={(e) => setEmailDestinatario(e.target.value)} placeholder={dict.orcamentos.placeholderEmailDestinatario} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.whatsappDestinatarioLabel}</label>
                <Input value={whatsappDestinatario} onChange={(e) => setWhatsappDestinatario(e.target.value)} placeholder={dict.orcamentos.placeholderWhatsappDestinatario} />
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
          <h2 className="mb-1 text-sm font-semibold">{dict.orcamentos.propostaTitulo}</h2>
          <p className="mb-3 text-xs text-ink-muted">{dict.orcamentos.propostaSubtitulo}</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.objetivosLabel}</label>
              <Textarea rows={3} value={objetivos} onChange={(e) => setObjetivos(e.target.value)} placeholder={dict.orcamentos.placeholderObjetivos} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.quantidadeDiariasLabel}</label>
                <Input value={quantidadeDiarias} onChange={(e) => setQuantidadeDiarias(e.target.value)} placeholder={dict.orcamentos.placeholderQuantidadeDiarias} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.equipeEscaladaLabel}</label>
                <Input value={equipeEscalada} onChange={(e) => setEquipeEscalada(e.target.value)} placeholder={dict.orcamentos.placeholderEquipeEscalada} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.textoPropostaLabel}</label>
              <Textarea rows={4} value={textoProposta} onChange={(e) => setTextoProposta(e.target.value)} placeholder={dict.orcamentos.placeholderTextoProposta} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-ink-secondary">{dict.orcamentos.itensEntregaTitulo}</label>
                <Button variant="ghost" className="gap-1 px-2 py-1 text-xs" onClick={adicionarItemEntrega}>
                  <IconPlus className="h-3.5 w-3.5" />
                  {dict.orcamentos.adicionarItemBtn}
                </Button>
              </div>
              {itensEntrega.length === 0 ? (
                <p className="rounded-lg border border-dashed border-base-700 p-3 text-center text-xs text-ink-muted">{dict.orcamentos.itensEntregaVazio}</p>
              ) : (
                <div className="space-y-2">
                  {itensEntrega.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <Input
                        value={item.item}
                        onChange={(e) => atualizarItemEntrega(item.key, { item: e.target.value })}
                        placeholder={dict.orcamentos.itensEntregaItemPlaceholder}
                        className="flex-1"
                      />
                      <Input
                        value={item.prazo}
                        onChange={(e) => atualizarItemEntrega(item.key, { prazo: e.target.value })}
                        placeholder={dict.orcamentos.itensEntregaPrazoPlaceholder}
                        className="w-28 shrink-0"
                      />
                      <button onClick={() => removerItemEntrega(item.key)} className="shrink-0 rounded p-1.5 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
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
                  <p className="text-xs text-ink-muted">{fmtMoeda(s.valor_padrao)}</p>
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
                <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder={dict.orcamentos.placeholderNomeServico} />
                <Textarea rows={2} value={pDescricao} onChange={(e) => setPDescricao(e.target.value)} placeholder={dict.orcamentos.placeholderDescricaoServico} />
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
                  <p className="mt-2 text-right text-sm font-semibold text-ink-primary">{fmtMoeda(item.quantidade * item.valorUnitario)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">{dict.orcamentos.colunasInvestimentoTitulo}</h2>
              <p className="text-xs text-ink-muted">{dict.orcamentos.colunasInvestimentoHint}</p>
            </div>
            <Button variant="ghost" className="shrink-0 gap-1 px-2.5 py-1.5 text-xs" onClick={adicionarColunaInvestimento}>
              <IconPlus className="h-3.5 w-3.5" />
              {dict.orcamentos.colunasInvestimentoAdicionarBtn}
            </Button>
          </div>
          {colunasInvestimento.length === 0 ? (
            <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">{dict.orcamentos.colunasInvestimentoVazio}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {colunasInvestimento.map((coluna) => (
                <div key={coluna.key} className="space-y-2 rounded-lg border border-base-800 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={coluna.titulo}
                      onChange={(e) => atualizarColunaInvestimento(coluna.key, { titulo: e.target.value })}
                      placeholder={dict.orcamentos.colunasInvestimentoTituloPlaceholder}
                      className="flex-1"
                    />
                    <button onClick={() => removerColunaInvestimento(coluna.key)} className="shrink-0 rounded p-1.5 text-ink-muted hover:text-danger" aria-label={dict.orcamentos.removerItemBtn}>
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Textarea
                    rows={3}
                    value={coluna.itens}
                    onChange={(e) => atualizarColunaInvestimento(coluna.key, { itens: e.target.value })}
                    placeholder={dict.orcamentos.colunasInvestimentoItensPlaceholder}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.orcamentos.corDestaqueTitulo}</h2>
          <p className="mb-3 text-xs text-ink-muted">{dict.orcamentos.corDestaqueSubtitulo}</p>
          <CorDestaqueField value={corDestaque} onChange={setCorDestaque} />
        </Card>

        {portfolioItens.length > 0 && (
          <Card>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{dict.orcamentos.portfolioAnexarTitulo}</h2>
                <p className="text-xs text-ink-muted">{dict.orcamentos.portfolioAnexarHint}</p>
              </div>
              <Link href="/admin/orcamentos/portfolio" className="shrink-0 text-xs font-medium text-accent hover:underline">
                {dict.orcamentos.portfolioGerenciarBtn}
              </Link>
            </div>
            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
              {portfolioItens.map((item) => {
                const selecionado = portfolioSelecionado.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => alternarPortfolioItem(item.id)}
                    className={cn(
                      "relative aspect-video overflow-hidden rounded-lg border-2 transition",
                      selecionado ? "border-accent" : "border-transparent"
                    )}
                    title={item.titulo}
                  >
                    {item.tipo_midia === "video" ? (
                      item.ehLink ? (
                        <PlayerDeMidia url={item.url} className="h-full" />
                      ) : (
                        <video src={item.url} className="h-full w-full object-cover" muted />
                      )
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.titulo} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-black/70 text-white">
                      {item.tipo_midia === "video" ? <IconFilm className="h-2.5 w-2.5" /> : <IconImage className="h-2.5 w-2.5" />}
                    </div>
                    {selecionado && <div className="absolute inset-0 bg-accent/20" />}
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Coluna de preview — acompanha a rolagem (sticky), mostra exatamente o que o cliente vai ver no link público */}
      <div className="space-y-4 lg:sticky lg:top-4">
        <div className="flex items-center gap-1.5 text-ink-muted">
          <IconEye className="h-3.5 w-3.5" />
          <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.previewAoVivoTitulo}</p>
        </div>
        <div className="-mt-1 flex items-start gap-2 rounded-xl border border-status-warning/30 bg-status-warning/10 p-2.5">
          <IconAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" />
          <p className="text-[11px] leading-relaxed text-ink-secondary">{dict.orcamentos.previewExemploAviso}</p>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl">
          <OrcamentoPropostaPreview
            titulo={titulo}
            nomeDestinatario={nomeDestinatario || dict.orcamentos.placeholderNomeDestinatario}
            dataExpiracao={dataExpiracaoPreview}
            textoProposta={textoProposta || null}
            objetivos={objetivos || null}
            itensObrigatorios={itensObrigatoriosPreview}
            itensOpcionais={itensOpcionaisPreview}
            interactive={false}
            subtotal={subtotal}
            desconto={desconto}
            total={total}
            temDesconto={!!descontoTipo}
            condicoesPagamento={condicoesPagamento || null}
            observacoes={observacoes || null}
            portfolio={portfolioSelecionadoItens}
            institucional={institucionalState}
            empresaNome={institucionalState.nomeMarca || null}
            corDestaque={corDestaque || null}
            capaUrl={capaUrl}
            capaSubtitulo={capaSubtitulo || null}
            escalaTextoCapa={escalaTextoCapa}
            quantidadeDiarias={quantidadeDiarias || null}
            equipeEscalada={equipeEscalada || null}
            itensEntrega={itensEntregaPreview}
            colunasInvestimento={colunasInvestimentoPreview}
            modoExemplo
          />
        </div>

        <Card>
          {error && <p className="mb-3 text-xs text-danger">{error}</p>}
          <div className="flex flex-col gap-2">
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
