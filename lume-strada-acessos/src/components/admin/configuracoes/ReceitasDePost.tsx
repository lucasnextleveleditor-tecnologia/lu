"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { substituir } from "@/lib/utils/texto";
import { addDaysISO, fmtDataCurta } from "@/lib/utils/format";
import { IconCheck, IconPlus, IconX, IconTrash, IconArrowRight } from "@/components/ui/icons";
import { GerenciarTiposServicoModal } from "@/components/admin/producao/GerenciarTiposServicoModal";
import {
  rotuloDoFormato,
  type PostFormatoRow,
  type PostReceitaRow,
  type TipoServicoRow,
} from "@/lib/types/producao";
import {
  criarFormatoDePost,
  limparReceitaDePost,
  mostrarFormatoDePost,
  ocultarFormatoDePost,
  removerFormatoDePost,
  salvarReceitaDePost,
} from "@/app/admin/configuracoes/receitas-actions";

/**
 * Padrões de produção por formato de post.
 *
 * O que esta tela é: o lugar onde se responde, uma vez, "o que 'Reels' já
 * implica". Quando a social media clica em "subir para a produção" no
 * Calendário de Conteúdo, cada post vira tarefa — e é daqui que saem o tipo de
 * serviço, os formatos de entrega e o prazo do primeiro corte que ela não
 * preencheu. Só o que ficou EM BRANCO é preenchido: um padrão que apaga a
 * exceção é pior do que nenhum padrão.
 *
 * A versão anterior desta tela abria com sete cards vazios, sem botão de
 * salvar e sem mostrar o resultado — e o efeito era que ela parecia um
 * relatório de coisas que não existem. Três decisões corrigem isso, e todas as
 * três são sobre a mesma coisa: mostrar a consequência antes de pedir a
 * decisão.
 *
 *   1. A PRÉVIA no topo, que é a tela inteira em duas colunas: o que a social
 *      media escreve à esquerda, a tarefa que nasce à direita. Ela é a única
 *      parte que explica para que servem os campos de baixo.
 *   2. Só os formatos EM USO aparecem como card. O resto do cadastro fica
 *      atrás de "+ adicionar formato" — inclusive os que a própria agência
 *      criou. Uma agência de podcast não precisa olhar para "Story" todo dia.
 *   3. O salvamento automático continua (são poucos campos numa tela visitada
 *      uma vez por ano; vinte e um botões seria pior), mas agora está ESCRITO
 *      na tela. Salvar em silêncio e não contar é o mesmo que não salvar.
 */
export function ReceitasDePost({
  receitas,
  tiposServico,
  formatos,
  exemploDataPost,
}: {
  receitas: PostReceitaRow[];
  tiposServico: TipoServicoRow[];
  /** Todos os formatos da empresa — em uso e ocultos. */
  formatos: PostFormatoRow[];
  /**
   * A data do post de exemplo da prévia, em ISO. Vem do servidor, e não de um
   * `new Date()` aqui, porque este componente também renderiza no servidor: o
   * dia calculado nos dois lados tem que ser o mesmo, ou o React reclama de
   * hidratação toda vez que alguém abre a tela perto da meia-noite.
   */
  exemploDataPost: string;
}) {
  const { dict } = useLocale();
  const t = dict.planejamento;

  const [porFormato, setPorFormato] = useState<Record<string, Partial<PostReceitaRow>>>(() =>
    Object.fromEntries(receitas.map((r) => [r.formato, r]))
  );
  const [lista, setLista] = useState<PostFormatoRow[]>(() => [...formatos].sort((a, b) => a.ordem - b.ordem));
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const emUso = useMemo(() => lista.filter((f) => f.ativo), [lista]);
  const ocultos = useMemo(() => lista.filter((f) => !f.ativo), [lista]);

  const [foco, setFoco] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [cadastrandoTipo, setCadastrandoTipo] = useState(false);

  // O formato da prévia: o último que a pessoa tocou, ou o primeiro da lista.
  // Nunca nulo enquanto existir um formato em uso — a prévia sem formato não
  // mostraria nada, e mostrar nada é justamente o defeito que ela conserta.
  const formatoDaPrevia = emUso.find((f) => f.slug === foco) ?? emUso[0] ?? null;

  const ERROS: Record<string, string> = {
    FORMATO_SEM_NOME: t.erroFormatoSemNome,
    FORMATO_NOME_LONGO: t.erroFormatoNomeLongo,
    FORMATO_DUPLICADO: t.erroFormatoDuplicado,
    FORMATO_EM_USO: t.erroFormatoEmUso,
    FORMATO_NATIVO: t.erroFormatoNativo,
    FORMATO_DESCONHECIDO: t.erroFormatoDesconhecido,
  };
  const textoDoErro = (codigo: string) => ERROS[codigo] ?? codigo;

  const rotulo = (f: Pick<PostFormatoRow, "slug" | "nome">) => rotuloDoFormato(f, t.formatos);

  async function gravar(slug: string, campos: Partial<PostReceitaRow>) {
    const atual = { ...porFormato[slug], ...campos };
    setPorFormato((prev) => ({ ...prev, [slug]: atual }));
    setErro(null);
    setFoco(slug);

    const vazia =
      !atual.tipo_servico_id &&
      !atual.formatos_exportacao?.trim() &&
      (atual.dias_v1 === null || atual.dias_v1 === undefined);

    // Padrão esvaziado é padrão apagado, e não uma linha de nulos. Uma linha
    // vazia no banco diria "este formato tem padrão" para quem for ler depois,
    // quando a verdade é que não tem.
    const r = vazia
      ? await limparReceitaDePost(slug)
      : await salvarReceitaDePost(slug, {
          tipo_servico_id: atual.tipo_servico_id ?? null,
          formatos_exportacao: atual.formatos_exportacao ?? null,
          dias_v1: atual.dias_v1 ?? null,
        });

    if (!r.ok) {
      setErro(textoDoErro(r.error));
      return;
    }
    setSalvo(slug);
    setTimeout(() => setSalvo((s) => (s === slug ? null : s)), 1800);
  }

  function alternarUso(slug: string, passarAUsar: boolean) {
    setErro(null);
    setLista((prev) => prev.map((f) => (f.slug === slug ? { ...f, ativo: passarAUsar } : f)));
    if (passarAUsar) setFoco(slug);
    iniciar(async () => {
      const r = passarAUsar ? await mostrarFormatoDePost(slug) : await ocultarFormatoDePost(slug);
      if (!r.ok) {
        setErro(textoDoErro(r.error));
        setLista((prev) => prev.map((f) => (f.slug === slug ? { ...f, ativo: !passarAUsar } : f)));
      }
    });
  }

  function criar() {
    const nome = novoNome.trim();
    if (!nome) return;
    setErro(null);
    iniciar(async () => {
      const r = await criarFormatoDePost(nome);
      if (!r.ok) {
        setErro(textoDoErro(r.error));
        return;
      }
      const ordem = lista.reduce((max, f) => Math.max(max, f.ordem), -1) + 1;
      const agora = new Date().toISOString();
      setLista((prev) => [
        ...prev,
        {
          id: r.slug,
          company_id: "",
          slug: r.slug,
          nome,
          ordem,
          ativo: true,
          created_at: agora,
          updated_at: agora,
        },
      ]);
      setNovoNome("");
      setFoco(r.slug);
      setAbrindo(false);
    });
  }

  function excluir(slug: string) {
    setErro(null);
    setConfirmando(null);
    iniciar(async () => {
      const r = await removerFormatoDePost(slug);
      if (!r.ok) {
        setErro(textoDoErro(r.error));
        return;
      }
      setLista((prev) => prev.filter((f) => f.slug !== slug));
    });
  }

  const CHIPS = [
    dict.producao.formatoChip916,
    dict.producao.formatoChip11,
    dict.producao.formatoChip169,
    dict.producao.formatoChipComLegenda,
    dict.producao.formatoChipSemLegenda,
    dict.producao.formatoChipAltaResolucao,
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold tracking-tight text-ink-primary">{t.receitasTitulo}</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t.receitasDescricao}</p>

      {/* ---------------------------------------------------------------------
          A prévia. Fica ANTES dos campos de propósito: a pergunta que a tela
          responde ("o que acontece quando o post sobe?") precisa estar
          respondida antes de alguém decidir quantos dias antes é o V1.
          --------------------------------------------------------------------- */}
      {formatoDaPrevia && (
        <Previa
          formato={formatoDaPrevia}
          rotulo={rotulo(formatoDaPrevia)}
          receita={porFormato[formatoDaPrevia.slug] ?? {}}
          tiposServico={tiposServico}
          dataPost={exemploDataPost}
          formatosEmUso={emUso}
          aoTrocarFormato={setFoco}
          rotuloDe={rotulo}
          t={t}
        />
      )}

      {/* ---------------------------------------------------------------------
          Os cards — um por formato EM USO.
          --------------------------------------------------------------------- */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-ink-primary">{t.formatosQueUso}</h3>
        <p className="text-[11px] text-ink-muted">{t.salvaSozinho}</p>
      </div>

      {emUso.length === 0 && <p className="mt-3 text-xs text-status-warning">{t.semFormatosAtivos}</p>}

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {emUso.map((formato) => {
          const receita = porFormato[formato.slug] ?? {};
          return (
            <div
              key={formato.slug}
              onFocusCapture={() => setFoco(formato.slug)}
              className={cn(
                "rounded-xl border bg-base-950/40 p-3 transition",
                foco === formato.slug ? "border-accent/50" : "border-base-700"
              )}
            >
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-sm font-medium text-ink-primary">{rotulo(formato)}</span>
                {salvo === formato.slug && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-status-good">
                    <IconCheck className="h-3 w-3" />
                    {t.salvoAgora}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => alternarUso(formato.slug, false)}
                  disabled={pendente}
                  title={t.ocultarFormato}
                  aria-label={substituir(t.ocultarFormatoDe, { formato: rotulo(formato) })}
                  className="ml-auto rounded-lg p-1 text-ink-muted transition hover:text-ink-primary disabled:opacity-40"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>

              <label className="mb-1 block text-[11px] text-ink-secondary">{t.postTipoServico}</label>
              <Select
                value={receita.tipo_servico_id ?? ""}
                onChange={(e) => gravar(formato.slug, { tipo_servico_id: e.target.value || null })}
              >
                <option value="">{t.semTipoServico}</option>
                {tiposServico.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </Select>

              <label className="mb-1 mt-2.5 block text-[11px] text-ink-secondary">{t.postFormatoEntrega}</label>
              <div className="mb-1.5 flex flex-wrap gap-1">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const atual = (receita.formatos_exportacao ?? "").trim();
                      if (atual.includes(chip)) return;
                      gravar(formato.slug, { formatos_exportacao: atual ? `${atual}, ${chip}` : chip });
                    }}
                    className="rounded-full border border-base-700 px-2 py-0.5 text-[10px] font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <Input
                key={`fmt-${formato.slug}-${receita.formatos_exportacao ?? ""}`}
                defaultValue={receita.formatos_exportacao ?? ""}
                placeholder={dict.producao.formatosExportacaoPlaceholder}
                onBlur={(e) => {
                  const valor = e.target.value.trim();
                  if (valor !== (receita.formatos_exportacao ?? "").trim()) {
                    gravar(formato.slug, { formatos_exportacao: valor || null });
                  }
                }}
              />

              <label className="mb-1 mt-2.5 block text-[11px] text-ink-secondary">{t.receitaDiasV1}</label>
              <div className="flex items-center gap-2">
                {/* `cn()` é concatenação simples, sem tailwind-merge: uma
                    classe de largura no próprio Input perderia para o
                    `w-full` de dentro dele. A div é quem segura o tamanho. */}
                <div className="w-20 shrink-0">
                  <Input
                    key={`v1-${formato.slug}-${receita.dias_v1 ?? ""}`}
                    type="number"
                    min={0}
                    max={90}
                    step="1"
                    inputMode="numeric"
                    defaultValue={receita.dias_v1 ?? ""}
                    onBlur={(e) => {
                      const bruto = e.target.value.trim();
                      const valor = bruto === "" ? null : Number(bruto);
                      if (valor !== (receita.dias_v1 ?? null)) gravar(formato.slug, { dias_v1: valor });
                    }}
                  />
                </div>
                <span className="text-[11px] text-ink-muted">
                  {receita.dias_v1 === null || receita.dias_v1 === undefined
                    ? t.receitaSemV1
                    : t.receitaDiasV1Sufixo}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------------
          O cadastro de formatos, atrás de um botão.
          --------------------------------------------------------------------- */}
      {!abrindo ? (
        <button
          type="button"
          onClick={() => setAbrindo(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        >
          <IconPlus className="h-3.5 w-3.5" />
          {t.adicionarFormato}
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-base-700 bg-base-950/40 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-ink-primary">{t.adicionarFormato}</p>
            <button
              type="button"
              onClick={() => setAbrindo(false)}
              className="rounded-lg p-1 text-ink-muted transition hover:text-ink-primary"
              aria-label={dict.common.fechar}
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>

          {ocultos.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] text-ink-muted">{t.adicionarFormatoAjuda}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {ocultos.map((f) =>
                  confirmando === f.slug ? (
                    <span
                      key={f.slug}
                      className="inline-flex items-center gap-1.5 rounded-full border border-status-critical/30 bg-status-critical/10 px-2.5 py-1 text-[11px]"
                    >
                      <span className="text-ink-primary">{substituir(t.excluirFormatoPergunta, { formato: rotulo(f) })}</span>
                      <button onClick={() => excluir(f.slug)} disabled={pendente} className="font-medium text-danger hover:underline">
                        {dict.common.sim}
                      </button>
                      <button onClick={() => setConfirmando(null)} disabled={pendente} className="text-ink-muted hover:text-ink-primary">
                        {dict.common.nao}
                      </button>
                    </span>
                  ) : (
                    <span
                      key={f.slug}
                      className="inline-flex items-center overflow-hidden rounded-full border border-base-700 text-[11px] font-medium"
                    >
                      <button
                        type="button"
                        onClick={() => alternarUso(f.slug, true)}
                        disabled={pendente}
                        className="px-2.5 py-1 text-ink-secondary transition hover:bg-base-800 hover:text-ink-primary disabled:opacity-40"
                      >
                        + {rotulo(f)}
                      </button>
                      {/* Excluir é só para o formato que a agência criou e
                          errou o nome. Nativo não some — some da tela, e isso
                          já é o "+ ativar" acima ao contrário. */}
                      {f.nome !== null && (
                        <button
                          type="button"
                          onClick={() => setConfirmando(f.slug)}
                          disabled={pendente}
                          title={t.excluirFormato}
                          aria-label={substituir(t.excluirFormatoDe, { formato: rotulo(f) })}
                          className="border-l border-base-700 px-1.5 py-1 text-ink-muted transition hover:text-danger disabled:opacity-40"
                        >
                          <IconTrash className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  )
                )}
              </div>
            </>
          )}

          <label className="mb-1 block text-[11px] text-ink-secondary">{t.criarFormatoLabel}</label>
          <div className="flex gap-2">
            <Input
              value={novoNome}
              maxLength={40}
              placeholder={t.criarFormatoPlaceholder}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  criar();
                }
              }}
            />
            <Button type="button" variant="ghost" onClick={criar} disabled={pendente || !novoNome.trim()} className="shrink-0 px-3 py-2 text-xs">
              {t.criarFormatoBotao}
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-muted">{t.criarFormatoAjuda}</p>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          Tipo de serviço é o MESMO cadastro do módulo Produção
          (`prod_tipos_servico`) — não uma segunda lista que mora aqui. Antes
          esta tela mandava a pessoa "cadastrar em Produção" e a deixava na
          mão; agora o mesmo modal de lá abre daqui, e a frase explica por que
          o que ela cadastrar vai aparecer nos dois lugares.
          --------------------------------------------------------------------- */}
      <p className="mt-4 text-[11px] text-ink-muted">
        {tiposServico.length === 0 ? t.receitasSemTipos : t.tiposServicoCompartilhados}{" "}
        <button
          type="button"
          onClick={() => setCadastrandoTipo(true)}
          className="font-medium text-accent transition hover:underline"
        >
          {t.cadastrarTipoServico}
        </button>
      </p>

      {cadastrandoTipo && (
        <GerenciarTiposServicoModal tiposServico={tiposServico} onClose={() => setCadastrandoTipo(false)} />
      )}

      {erro && <p className="mt-3 text-xs text-danger">{erro}</p>}
    </Card>
  );
}

/**
 * A prévia: o mesmo post, dos dois lados da linha.
 *
 * À esquerda o que a social media digita no Calendário — quatro coisas que ela
 * sabe de cabeça. À direita a tarefa como o editor vai receber, com etiqueta
 * em tudo que veio daqui. Um campo sem padrão aparece vazio de propósito: é
 * exatamente assim que a tarefa vai nascer, e ver o buraco é o que faz alguém
 * preencher o campo de baixo.
 */
function Previa({
  formato,
  rotulo,
  receita,
  tiposServico,
  dataPost,
  formatosEmUso,
  aoTrocarFormato,
  rotuloDe,
  t,
}: {
  formato: PostFormatoRow;
  rotulo: string;
  receita: Partial<PostReceitaRow>;
  tiposServico: TipoServicoRow[];
  dataPost: string;
  formatosEmUso: PostFormatoRow[];
  aoTrocarFormato: (slug: string) => void;
  rotuloDe: (f: Pick<PostFormatoRow, "slug" | "nome">) => string;
  t: ReturnType<typeof useLocale>["dict"]["planejamento"];
}) {
  const tipo = tiposServico.find((s) => s.id === receita.tipo_servico_id)?.nome ?? null;
  const entrega = receita.formatos_exportacao?.trim() || null;
  const dias = receita.dias_v1 ?? null;
  const dataV1 = dias === null ? null : addDaysISO(dataPost, -dias);

  const antecedencia =
    dias === null ? null : dias === 0 ? t.previaMesmoDia : substituir(dias === 1 ? t.previaUmDiaAntes : t.previaDiasAntes, { n: dias });

  return (
    <div className="mt-4 rounded-xl border border-accent/25 bg-accent/[0.04] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t.previaTitulo}</p>
        {formatosEmUso.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {formatosEmUso.map((f) => (
              <button
                key={f.slug}
                type="button"
                onClick={() => aoTrocarFormato(f.slug)}
                aria-pressed={f.slug === formato.slug}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition",
                  f.slug === formato.slug
                    ? "border-accent/60 bg-accent/10 text-ink-primary"
                    : "border-base-700 text-ink-muted hover:text-ink-primary"
                )}
              >
                {rotuloDe(f)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-lg border border-base-700 bg-base-950/50 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{t.previaColunaPauta}</p>
          <Linha rotulo={t.previaCampoTitulo} valor={t.previaTituloExemplo} />
          <Linha rotulo={t.formato} valor={rotulo} />
          <Linha rotulo={t.previaCampoData} valor={fmtDataCurta(dataPost)} />
        </div>

        <IconArrowRight className="mx-auto hidden h-4 w-4 shrink-0 text-ink-muted sm:block" />

        <div className="rounded-lg border border-base-700 bg-base-950/50 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{t.previaColunaTarefa}</p>
          <Linha rotulo={t.previaCampoTitulo} valor={t.previaTituloExemplo} />
          <Linha rotulo={t.postTipoServico} valor={tipo} vazio={t.previaEmBranco} etiqueta={t.previaEtiquetaPadrao} />
          <Linha rotulo={t.postFormatoEntrega} valor={entrega} vazio={t.previaEmBranco} etiqueta={t.previaEtiquetaPadrao} />
          <Linha
            rotulo={t.receitaDiasV1}
            valor={dataV1 ? `${fmtDataCurta(dataV1)} · ${antecedencia}` : null}
            vazio={t.previaEmBranco}
            etiqueta={t.previaEtiquetaPadrao}
          />
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">{t.previaRodape}</p>
    </div>
  );
}

function Linha({
  rotulo,
  valor,
  vazio,
  etiqueta,
}: {
  rotulo: string;
  valor: string | null;
  vazio?: string;
  etiqueta?: string;
}) {
  return (
    <div className="flex items-baseline gap-2 py-0.5 text-xs">
      <span className="shrink-0 text-ink-muted">{rotulo}</span>
      {valor ? (
        <span className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-medium text-ink-primary">{valor}</span>
          {etiqueta && (
            <span className="rounded-full border border-accent/40 px-1.5 text-[9px] font-medium uppercase tracking-wide text-accent">
              {etiqueta}
            </span>
          )}
        </span>
      ) : (
        <span className="italic text-ink-muted">{vazio}</span>
      )}
    </div>
  );
}
