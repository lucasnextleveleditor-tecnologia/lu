"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtDataCurta } from "@/lib/utils/format";
import { addMeses, fmtMesAno, gradeDoMes } from "@/lib/utils/producao";
import {
  IconList,
  IconCalendar,
  IconPlus,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconArrowRight,
  IconRotateCcw,
  IconPalette,
} from "@/components/ui/icons";
import { ReferenciasEstiloField } from "@/components/admin/producao/BriefingCamposAvancados";
import { RichTextEditor } from "@/components/admin/producao/RichTextEditor";
import {
  CANAIS_DO_POST,
  FORMATOS_DO_POST,
  type CanalDoPost,
  type FormatoDoPost,
  type TarefaRow,
} from "@/lib/types/producao";
import {
  blocoDaMarca,
  criarPauta,
  devolverParaPauta,
  removerPauta,
  salvarPauta,
  subirParaProducao,
  type CamposDaPauta,
} from "@/app/admin/planejamento/pautas";

/**
 * O campo da linha nova é focado pelo `id`, e não por um `ref`.
 *
 * O `Input` da casa é um componente de função simples, sem `forwardRef` — e
 * neste React (18) `ref` num componente assim não chega no `<input>`: fica
 * `null` e o foco nunca volta. Dava para envolver o `Input` em `forwardRef`,
 * mas ele é primitivo compartilhado por todas as telas do app, e mudar um
 * primitivo para resolver o foco de uma tela é caro pelo lado errado.
 */
const ID_CAMPO_NOVO = "pauta-nova-ideia";

function focarCampoNovo() {
  document.getElementById(ID_CAMPO_NOVO)?.focus();
}

/**
 * O calendário de conteúdo do ciclo — onde a social media escreve os posts do
 * mês antes de eles virarem trabalho de alguém.
 *
 * DUAS VISÕES DA MESMA COISA, e a razão é que escrever e ler pedem telas
 * diferentes. Montar trinta posts é uma lista corrida: dia, ideia, Enter,
 * próxima — é o caderno, e uma grade de mês transforma isso em trinta cliques
 * e trinta janelinhas. Já conferir o mês montado é o contrário: a grade mostra
 * de relance a terça sem nada e a quinta com três posts, coisa que a lista não
 * mostra. Por isso a Lista é a visão padrão enquanto o ciclo está vazio.
 *
 * Nenhum post é rascunho de nada: cada linha aqui JÁ É a tarefa de produção,
 * só que com `em_pauta = true`, invisível para quem produz. Subir para
 * produção não copia nada — tira a marca e escolhe o responsável.
 */
export function CalendarioDeConteudo({
  planoId,
  inicio,
  fim,
  meta,
  pautaInicial,
  produzindoInicial,
  funcionarios,
  tiposServico,
}: {
  planoId: string;
  /** Limites do ciclo — o calendário não navega para fora deles. */
  inicio: string;
  fim: string;
  /** `qtd_posts_social` do escopo. Zero = a agência não vendeu posts neste ciclo. */
  meta: number;
  pautaInicial: TarefaRow[];
  /** Posts deste ciclo que já subiram — contam no total, mas não se editam aqui. */
  produzindoInicial: TarefaRow[];
  funcionarios: { id: string; nome: string }[];
  /** Os mesmos tipos cadastrados em Produção — para o post já subir categorizado. */
  tiposServico: { id: string; nome: string }[];
}) {
  const { dict } = useLocale();
  const t = dict.planejamento;

  const [pauta, setPauta] = useState<TarefaRow[]>(() => ordenar(pautaInicial));
  const [produzindo, setProduzindo] = useState<TarefaRow[]>(() => ordenar(produzindoInicial));
  // Lista é sempre a visão de entrada: mesmo com o mês montado, quem abre
  // aqui costuma vir acrescentar ou corrigir, não admirar a grade.
  const [visao, setVisao] = useState<"lista" | "calendario">("lista");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [responsavel, setResponsavel] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // A linha nova, que é o coração do modo Lista.
  const [novaData, setNovaData] = useState(inicio);
  const [novoTitulo, setNovoTitulo] = useState("");

  const [mes, setMes] = useState<Date>(() => primeiroDiaDoMes(inicio));

  // Um post aberto por vez. Trinta painéis abertos seriam uma parede, e a
  // pessoa que abre um detalhe está olhando para aquele post, não para a lista.
  const [aberto, setAberto] = useState<string | null>(null);

  // O bloco da marca é buscado UMA vez, na primeira abertura, e guardado:
  // ele é o mesmo para todos os posts do ciclo (é do cliente, não do post), e
  // buscá-lo a cada expansão seria trinta idas ao servidor para o mesmo texto.
  // `undefined` = ainda não buscamos; `null` = buscamos e não há onboarding.
  const [marca, setMarca] = useState<string | null | undefined>(undefined);

  async function garantirMarca() {
    if (marca !== undefined) return;
    const r = await blocoDaMarca(planoId);
    setMarca(r.ok ? r.html : null);
  }

  const total = pauta.length + produzindo.length;

  function erroLegivel(codigo: string): string {
    if (codigo === "SEM_TITULO") return t.postSemTitulo;
    if (/schema cache|does not exist|PGRST205/i.test(codigo)) return t.erroTabelaAusente;
    return codigo;
  }

  /**
   * Adiciona e já prepara a próxima.
   *
   * A data anda um dia sozinha e o foco não sai do campo de texto: é o que
   * transforma "montar o mês" em digitar trinta frases seguidas em vez de
   * trinta idas ao mouse. A data continua editável — quem quer pular o fim de
   * semana só troca o dia.
   */
  async function adicionar() {
    const titulo = novoTitulo.trim();
    if (!titulo) {
      setErro(t.postSemTitulo);
      return;
    }
    setOcupado(true);
    setErro(null);
    const r = await criarPauta(planoId, { titulo, data_entrega: novaData || null });
    setOcupado(false);
    if (!r.ok) {
      setErro(erroLegivel(r.error));
      return;
    }
    setPauta((atual) => ordenar([...atual, r.row]));
    setNovoTitulo("");
    if (novaData) setNovaData(somarDias(novaData, 1));
    focarCampoNovo();
  }

  /**
   * Grava um campo de um post já existente.
   *
   * Otimista: a linha muda na tela antes da resposta do servidor. Numa lista
   * de trinta linhas em que se corrige o canal de uma e o dia de outra,
   * esperar o servidor a cada tecla faria a tela piscar o tempo todo. Se
   * falhar, o erro aparece embaixo e o valor de verdade volta no próximo
   * carregamento.
   */
  async function editar(id: string, campos: Partial<CamposDaPauta>) {
    setPauta((atual) => atual.map((p) => (p.id === id ? { ...p, ...campos } : p)));
    const r = await salvarPauta(id, campos);
    if (!r.ok) setErro(erroLegivel(r.error));
  }

  async function remover(id: string) {
    setOcupado(true);
    const r = await removerPauta(id);
    setOcupado(false);
    if (!r.ok) {
      setErro(erroLegivel(r.error));
      return;
    }
    setPauta((atual) => atual.filter((p) => p.id !== id));
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      proximo.delete(id);
      return proximo;
    });
  }

  async function subir(ids: string[]) {
    if (ids.length === 0) return;
    setOcupado(true);
    setErro(null);
    const r = await subirParaProducao(ids, responsavel || null);
    setOcupado(false);
    if (!r.ok) {
      setErro(erroLegivel(r.error));
      return;
    }
    const subindo = new Set(ids);
    setProduzindo((atual) => ordenar([...atual, ...pauta.filter((p) => subindo.has(p.id))]));
    setPauta((atual) => atual.filter((p) => !subindo.has(p.id)));
    setSelecionados(new Set());
    setAviso(substituir(r.quantos === 1 ? t.subiuUm : t.subiuVarios, { n: r.quantos }));
  }

  async function devolver(id: string) {
    setOcupado(true);
    const r = await devolverParaPauta(id);
    setOcupado(false);
    if (!r.ok) {
      setErro(erroLegivel(r.error));
      return;
    }
    const alvo = produzindo.find((p) => p.id === id);
    if (alvo) {
      setProduzindo((atual) => atual.filter((p) => p.id !== id));
      setPauta((atual) => ordenar([...atual, { ...alvo, em_pauta: true }]));
    }
  }

  function alternar(id: string) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  const todosMarcados = pauta.length > 0 && selecionados.size === pauta.length;

  const porDia = useMemo(() => {
    const mapa = new Map<string, { post: TarefaRow; naProducao: boolean }[]>();
    for (const p of pauta) {
      if (!p.data_entrega) continue;
      const lista = mapa.get(p.data_entrega) ?? [];
      lista.push({ post: p, naProducao: false });
      mapa.set(p.data_entrega, lista);
    }
    for (const p of produzindo) {
      if (!p.data_entrega) continue;
      const lista = mapa.get(p.data_entrega) ?? [];
      lista.push({ post: p, naProducao: true });
      mapa.set(p.data_entrega, lista);
    }
    return mapa;
  }, [pauta, produzindo]);

  const semDia = pauta.filter((p) => !p.data_entrega).length;

  return (
    <section className="rounded-2xl border border-base-700 bg-base-900/40 p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-ink-primary">{t.conteudoTitulo}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{t.conteudoDescricao}</p>
        </div>

        {/* O contador é o escopo cobrando o calendário: os 12 posts vendidos
            no bloco de cima contra os que foram realmente pautados aqui. Some
            quando o ciclo não vendeu post nenhum — aí não há o que cobrar. */}
        <p className="shrink-0 text-xs tabular-nums text-ink-secondary">
          {meta > 0
            ? substituir(t.postsPautadosDe, { n: total, total: meta })
            : substituir(total === 1 ? t.postsPautadosUm : t.postsPautados, { n: total })}
        </p>

        <div className="flex shrink-0 overflow-hidden rounded-lg border border-base-600">
          {(["lista", "calendario"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisao(v)}
              aria-current={visao === v ? "true" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition",
                visao === v ? "bg-base-800 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              {v === "lista" ? <IconList className="h-3.5 w-3.5" /> : <IconCalendar className="h-3.5 w-3.5" />}
              {v === "lista" ? t.visaoLista : t.visaoCalendario}
            </button>
          ))}
        </div>
      </div>

      {visao === "lista" ? (
        <div className="mt-4">
          {/* A linha nova fica NO TOPO, e não no fim: numa lista de trinta
              posts, um campo no rodapé some da tela e obriga a rolar até o fim
              a cada ideia nova. */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-base-600 p-2.5">
            <div className="w-36 shrink-0">
              <DatePicker value={novaData} onChange={setNovaData} min={inicio} max={fim} />
            </div>
            <Input
              id={ID_CAMPO_NOVO}
              value={novoTitulo}
              placeholder={t.novoPostPlaceholder}
              onChange={(e) => setNovoTitulo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionar();
                }
              }}
              className="min-w-[12rem] flex-1"
            />
            <Button type="button" onClick={adicionar} disabled={ocupado} className="shrink-0">
              <IconPlus className="h-4 w-4" />
              {t.adicionarPost}
            </Button>
          </div>

          {pauta.length === 0 && produzindo.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">{t.semPosts}</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {pauta.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-base-700 bg-base-950/40 p-2"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.has(post.id)}
                    onChange={() => alternar(post.id)}
                    className="h-4 w-4 shrink-0 accent-current text-accent"
                    aria-label={post.titulo}
                  />
                  <div className="w-32 shrink-0">
                    <DatePicker
                      value={post.data_entrega ?? ""}
                      onChange={(iso) => editar(post.id, { data_entrega: iso || null })}
                      min={inicio}
                      max={fim}
                      clearable
                    />
                  </div>
                  <Input
                    defaultValue={post.titulo}
                    onBlur={(e) => {
                      const valor = e.target.value.trim();
                      if (valor && valor !== post.titulo) editar(post.id, { titulo: valor });
                      else e.target.value = post.titulo;
                    }}
                    className="min-w-[10rem] flex-1"
                  />
                  <div className="w-32 shrink-0">
                    <Select
                      value={post.post_canal ?? ""}
                      onChange={(e) => editar(post.id, { post_canal: (e.target.value || null) as CanalDoPost | null })}
                    >
                      <option value="">{t.canal}</option>
                      {CANAIS_DO_POST.map((c) => (
                        <option key={c} value={c}>
                          {t.canais[c]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-32 shrink-0">
                    <Select
                      value={post.post_formato ?? ""}
                      onChange={(e) =>
                        editar(post.id, { post_formato: (e.target.value || null) as FormatoDoPost | null })
                      }
                    >
                      <option value="">{t.formato}</option>
                      {FORMATOS_DO_POST.map((f) => (
                        <option key={f} value={f}>
                          {t.formatos[f]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAberto((a) => (a === post.id ? null : post.id));
                      garantirMarca();
                    }}
                    aria-expanded={aberto === post.id}
                    className={cn(
                      "shrink-0 rounded-lg p-1.5 transition",
                      aberto === post.id ? "text-accent" : "text-ink-muted hover:text-ink-primary"
                    )}
                    aria-label={t.postDetalhes}
                    title={t.postDetalhes}
                  >
                    <IconChevronDown className={cn("h-4 w-4 transition", aberto === post.id && "rotate-180")} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remover(post.id)}
                    disabled={ocupado}
                    className="shrink-0 rounded-lg p-1.5 text-ink-muted transition hover:text-danger disabled:opacity-40"
                    aria-label={t.removerPost}
                    title={t.removerPost}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>

                  {aberto === post.id && (
                    <DetalhesDoPost
                      post={post}
                      tiposServico={tiposServico}
                      marca={marca ?? null}
                      onChange={(campos) => editar(post.id, campos)}
                    />
                  )}
                </li>
              ))}

              {produzindo.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-base-800 bg-base-950/20 p-2 text-ink-muted"
                >
                  <span className="w-32 shrink-0 px-1 text-xs tabular-nums">
                    {post.data_entrega ? fmtDataCurta(post.data_entrega) : "—"}
                  </span>
                  <span className="min-w-[10rem] flex-1 truncate px-1 text-sm">{post.titulo}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-status-good/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-good">
                    {t.jaNaProducao}
                  </span>
                  <button
                    type="button"
                    onClick={() => devolver(post.id)}
                    disabled={ocupado}
                    className="shrink-0 rounded-lg p-1.5 transition hover:text-ink-primary disabled:opacity-40"
                    aria-label={t.devolverParaPauta}
                    title={t.devolverParaPauta}
                  >
                    <IconRotateCcw className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <GradeDoMes
          mes={mes}
          inicio={inicio}
          fim={fim}
          porDia={porDia}
          onMes={setMes}
          onNovoDia={(dia) => {
            setNovaData(dia);
            setVisao("lista");
            setTimeout(focarCampoNovo, 0);
          }}
        />
      )}

      {semDia > 0 && (
        <p className="mt-3 text-[11px] text-status-warning">
          {substituir(semDia === 1 ? t.semDiaUm : t.semDiaVarios, { n: semDia })}
        </p>
      )}

      {/* A barra de subir só aparece quando há o que subir. Um rodapé de ação
          permanente numa tela vazia é convite a clicar sem entender. */}
      {pauta.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-base-800 pt-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={todosMarcados}
              onChange={() => setSelecionados(todosMarcados ? new Set() : new Set(pauta.map((p) => p.id)))}
              className="h-4 w-4 accent-current text-accent"
            />
            {t.selecionarTodos}
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="w-44">
              <Select value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
                <option value="">{t.semResponsavel}</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              onClick={() => subir(Array.from(selecionados))}
              disabled={ocupado || selecionados.size === 0}
              className="shrink-0"
            >
              <IconArrowRight className="h-4 w-4" />
              {substituir(t.subirParaProducao, { n: selecionados.size })}
            </Button>
          </div>
        </div>
      )}

      {erro && <p className="mt-3 text-xs text-danger">{erro}</p>}
      {aviso && !erro && <p className="mt-3 text-xs text-status-good">{aviso}</p>}
    </section>
  );
}

/**
 * O detalhe de um post — o que a produção vai precisar, preenchido por quem
 * escreveu a ideia e SEM ela abrir o formulário de tarefa.
 *
 * Só quatro campos, e nenhum obrigatório. O que importa é título, referências,
 * briefing e data — o resto a receita do formato completa sozinha quando o
 * post sobe (ver `subirParaProducao`), então deixar em branco aqui não é
 * descuido, é o caminho normal.
 *
 * Os campos de referência e de formatos são OS MESMOS componentes que a tela
 * de Produção usa (`ReferenciasEstiloField`, `RichTextEditor`), e não cópias
 * parecidas: o texto vai para as mesmas colunas, e um campo que se comporta
 * diferente nos dois lugares gera briefing que quebra de um lado só.
 */
function DetalhesDoPost({
  post,
  tiposServico,
  marca,
  onChange,
}: {
  post: TarefaRow;
  tiposServico: { id: string; nome: string }[];
  /** HTML do bloco da marca, vindo do Onboarding. `null` = não há o que colar. */
  marca: string | null;
  onChange: (campos: Partial<CamposDaPauta>) => void;
}) {
  const { dict } = useLocale();
  const t = dict.planejamento;

  const [briefing, setBriefing] = useState(post.briefing ?? "");
  const [referencias, setReferencias] = useState(post.referencias_estilo ?? "");
  const [formatos, setFormatos] = useState(post.formatos_exportacao ?? "");

  const CHIPS = [
    dict.producao.formatoChip916,
    dict.producao.formatoChip11,
    dict.producao.formatoChip169,
    dict.producao.formatoChipComLegenda,
    dict.producao.formatoChipSemLegenda,
    dict.producao.formatoChipAltaResolucao,
  ];

  function inserirChip(chip: string) {
    const atual = formatos.trim();
    if (atual.includes(chip)) return;
    const novo = atual ? `${atual}, ${chip}` : chip;
    setFormatos(novo);
    onChange({ formatos_exportacao: novo });
  }

  return (
    <div className="mt-2 w-full space-y-3 border-t border-base-800 pt-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.postTipoServico}</label>
          <Select
            value={post.tipo_servico_id ?? ""}
            onChange={(e) => onChange({ tipo_servico_id: e.target.value || null })}
          >
            <option value="">{t.semTipoServico}</option>
            {tiposServico.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[11px] text-ink-muted">{t.campoOpcionalReceita}</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.postFormatoEntrega}</label>
          <div className="mb-1.5 flex flex-wrap gap-1">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => inserirChip(chip)}
                className="rounded-full border border-base-700 px-2 py-0.5 text-[10px] font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              >
                + {chip}
              </button>
            ))}
          </div>
          <Input
            value={formatos}
            placeholder={dict.producao.formatosExportacaoPlaceholder}
            onChange={(e) => setFormatos(e.target.value)}
            onBlur={() => onChange({ formatos_exportacao: formatos })}
          />
        </div>
      </div>

      <ReferenciasEstiloField
        value={referencias}
        onChange={(v) => {
          setReferencias(v);
          onChange({ referencias_estilo: v });
        }}
      />

      <div>
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-ink-secondary">{t.postBriefing}</label>
          {/* Um clique traz tom de voz, público, diretrizes e o drive de ativos
              que o CLIENTE escreveu no Onboarding. A informação existe desde o
              primeiro dia e nunca chegava em quem produz. */}
          {marca && (
            <button
              type="button"
              onClick={() => {
                const novo = briefing.trim() ? `${briefing}${marca}` : marca;
                setBriefing(novo);
                onChange({ briefing: novo });
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent transition hover:underline"
            >
              <IconPalette className="h-3 w-3" />
              {t.inserirMarca}
            </button>
          )}
        </div>
        <RichTextEditor
          value={briefing}
          onChange={(v) => {
            setBriefing(v);
            onChange({ briefing: v });
          }}
          placeholder={t.postBriefingPlaceholder}
        />
      </div>
    </div>
  );
}

/**
 * A grade do mês — a visão de LEITURA.
 *
 * Mesma grade do Calendário de Produção (`gradeDoMes` de `lib/utils/producao`,
 * o mesmo helper), para a social media não ter que aprender dois calendários.
 * A navegação de mês é limitada ao ciclo: um calendário de conteúdo que deixa
 * ir para março de um ciclo que acaba em outubro só mostra vazio e confunde.
 */
function GradeDoMes({
  mes,
  inicio,
  fim,
  porDia,
  onMes,
  onNovoDia,
}: {
  mes: Date;
  inicio: string;
  fim: string;
  porDia: Map<string, { post: TarefaRow; naProducao: boolean }[]>;
  onMes: (d: Date) => void;
  onNovoDia: (dia: string) => void;
}) {
  const { dict } = useLocale();
  const t = dict.planejamento;
  const semanas = gradeDoMes(mes);

  const podeVoltar = mesISO(addMeses(mes, -1)) >= inicio.slice(0, 7);
  const podeAvancar = mesISO(addMeses(mes, 1)) <= fim.slice(0, 7);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMes(addMeses(mes, -1))}
          disabled={!podeVoltar}
          className="rounded-lg border border-base-600 p-1.5 text-ink-muted transition hover:text-ink-primary disabled:opacity-30"
          aria-label={t.mesAnterior}
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm font-medium text-ink-primary">{fmtMesAno(mes)}</span>
        <button
          type="button"
          onClick={() => onMes(addMeses(mes, 1))}
          disabled={!podeAvancar}
          className="rounded-lg border border-base-600 p-1.5 text-ink-muted transition hover:text-ink-primary disabled:opacity-30"
          aria-label={t.proximoMes}
        >
          <IconChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-ink-muted">
            {t.diasDaSemana.map((d, i) => (
              <span key={i} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {semanas.map((semana, i) => (
            <div key={i} className="grid grid-cols-7 gap-1">
              {semana.map((dia, j) => {
                // Dia fora do ciclo não aceita post: o ciclo tem começo e fim,
                // e um post no dia seguinte ao fim pertence ao ciclo seguinte.
                const foraDoCiclo = !dia || dia < inicio || dia > fim;
                const itens = dia ? (porDia.get(dia) ?? []) : [];
                return (
                  <div
                    key={j}
                    className={cn(
                      "min-h-[76px] rounded-lg border p-1",
                      !dia
                        ? "border-transparent"
                        : foraDoCiclo
                          ? "border-base-800 bg-base-950/20"
                          : "border-base-700 bg-base-950/40"
                    )}
                  >
                    {dia && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className={cn("px-1 text-[10px] tabular-nums", foraDoCiclo ? "text-ink-muted/50" : "text-ink-muted")}>
                            {Number(dia.slice(8, 10))}
                          </span>
                          {!foraDoCiclo && (
                            <button
                              type="button"
                              onClick={() => onNovoDia(dia)}
                              className="rounded p-0.5 text-ink-muted opacity-0 transition hover:text-accent focus:opacity-100 group-hover:opacity-100 sm:opacity-100"
                              aria-label={t.adicionarPost}
                              title={t.adicionarPost}
                            >
                              <IconPlus className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <ul className="space-y-0.5">
                          {itens.slice(0, 3).map(({ post, naProducao }) => (
                            <li
                              key={post.id}
                              title={post.titulo}
                              className={cn(
                                "truncate rounded px-1 py-0.5 text-[10px]",
                                naProducao
                                  ? "border border-status-good/40 text-status-good"
                                  : "bg-accent/15 text-ink-secondary"
                              )}
                            >
                              {post.titulo}
                            </li>
                          ))}
                          {itens.length > 3 && (
                            <li className="px-1 text-[10px] text-ink-muted">
                              {substituir(t.maisPosts, { n: itens.length - 3 })}
                            </li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Sem dia primeiro (é o que falta resolver), depois por data e por criação. */
function ordenar(posts: TarefaRow[]): TarefaRow[] {
  return [...posts].sort((a, b) => {
    if (!a.data_entrega && !b.data_entrega) return a.created_at.localeCompare(b.created_at);
    if (!a.data_entrega) return -1;
    if (!b.data_entrega) return 1;
    const d = a.data_entrega.localeCompare(b.data_entrega);
    return d !== 0 ? d : a.created_at.localeCompare(b.created_at);
  });
}

function somarDias(iso: string, dias: number): string {
  const partes = iso.split("-").map(Number);
  const d = new Date(Date.UTC(partes[0] ?? 1970, (partes[1] ?? 1) - 1, partes[2] ?? 1));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function primeiroDiaDoMes(iso: string): Date {
  const partes = iso.split("-").map(Number);
  return new Date(Date.UTC(partes[0] ?? 1970, (partes[1] ?? 1) - 1, 1));
}

function mesISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
