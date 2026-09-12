"use client";

import { useCallback, useRef, useState } from "react";
import type { CronogramaRow, EquipeOrdemRow, LocacaoRow, OrdemDoDiaCompleta, RoteiroRow } from "@/lib/types/ordem-do-dia";
import type { FormaPlural } from "@/lib/i18n/dictionaries/pt/ordemDoDia";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { IconPrinter, IconPlus, IconTrash, IconSun, IconMoon, IconLoader, IconFileText } from "@/components/ui/icons";
import { CampoInline } from "./CampoInline";
import { BlocoFolha } from "./BlocoFolha";
import { CompartilharOrdem } from "./CompartilharOrdem";
import {
  adicionarLinha,
  atualizarClima,
  removerLinha,
  salvarCabecalho,
  salvarLinha,
  type CabecalhoInput,
  type ClimaSalvo,
} from "@/app/admin/producao/ordem-do-dia/actions";
import { LOCALE_BCP47, type Locale } from "@/lib/i18n/locales";

interface Props {
  dados: OrdemDoDiaCompleta;
  clientes: { id: string; nome: string }[];
  equipeCadastro: { id: string; nome: string; cargo: string | null; telefone: string | null }[];
  logoUrl: string | null;
  nomeApp: string;
  /** A folha aberta pelo link da equipe: mesmo documento, sem os controles. */
  somenteLeitura?: boolean;
}

/** "2026-09-10" -> "Quinta-feira, 10 de setembro de 2026" */
function porExtenso(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  const texto = new Date(`${iso}T12:00:00`).toLocaleDateString(LOCALE_BCP47[locale], {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * "3 locais" a partir de { um, muitos }.
 *
 * A contagem mora no dicionário como objeto, não como função: o dicionário
 * inteiro é entregue a um provider CLIENTE lá no layout raiz, e função não
 * atravessa essa fronteira — o app todo quebra, não só esta tela.
 */
function contar(n: number, forma: FormaPlural): string {
  return n === 1 ? forma.um : forma.muitos.replace("{n}", String(n));
}

type ListaDaFolha = "locacoes" | "cronograma" | "equipe" | "roteiros";

/** "07:00:00" -> "07:00" — o banco devolve `time` com segundos que ninguém quer ver. */
const semSegundos = (hora: string | null) => (hora ? hora.slice(0, 5) : "");

/**
 * Quanto tempo separa o início do encerramento, em "9h30".
 *
 * Se o encerramento for MENOR que o início, o dia virou a meia-noite (evento
 * que acaba de madrugada, live que atravessa) — some 24h em vez de devolver
 * um número negativo.
 */
function duracaoEntre(inicio: string | null, fim: string | null): string | null {
  if (!inicio || !fim) return null;
  const emMinutos = (t: string) => {
    const [h, m] = t.split(":");
    return Number(h) * 60 + Number(m);
  };
  let total = emMinutos(fim) - emMinutos(inicio);
  if (total <= 0) total += 24 * 60;
  const horas = Math.floor(total / 60);
  const minutos = total % 60;
  return minutos ? `${horas}h${String(minutos).padStart(2, "0")}` : `${horas}h`;
}

/**
 * Imprime em preto e branco (papel) ou colorido igual à tela (PDF).
 *
 * O modo colorido é só uma classe na raiz do documento: as regras de "vira
 * preto no branco" estão todas presas à variante `papel:`, que não dispara
 * enquanto a classe estiver lá. A classe sai sozinha quando a impressão
 * termina — se ficasse, a próxima impressão sairia colorida sem ninguém ter
 * pedido.
 */
function imprimir(colorido: boolean) {
  const raiz = document.documentElement;
  if (!colorido) {
    window.print();
    return;
  }

  raiz.classList.add("imprimir-colorido");
  const limpar = () => raiz.classList.remove("imprimir-colorido");
  window.addEventListener("afterprint", limpar, { once: true });
  // Safari nem sempre dispara `afterprint`; a consulta de mídia dispara.
  const consulta = window.matchMedia("print");
  const aoSair = (e: MediaQueryListEvent) => {
    if (!e.matches) {
      limpar();
      consulta.removeEventListener("change", aoSair);
    }
  };
  consulta.addEventListener("change", aoSair);

  window.print();
}

export function FolhaOrdemDoDia({ dados, clientes, equipeCadastro, logoUrl, nomeApp, somenteLeitura = false }: Props) {
  const { dict, locale } = useLocale();
  const t = dict.ordemDoDia;

  const { ordem } = dados;

  // ---------------------------------------------------------------------
  // Estado local de TUDO que se edita na folha
  // ---------------------------------------------------------------------
  // A folha guarda as próprias listas em vez de reler o servidor a cada
  // alteração. Antes, todo campo que perdia o foco pedia um `router.refresh()`
  // — o que remontava a página inteira (mais de dez consultas) só para
  // reexibir um texto que o navegador já tinha. Era isso que deixava a folha
  // lenta de digitar. Agora o servidor é avisado em segundo plano e a tela
  // não espera por ele.
  const [cabecalho, setCabecalho] = useState<CabecalhoInput>({
    projeto: ordem.projeto,
    clienteId: ordem.cliente_id,
    tipo: ordem.tipo,
    data: ordem.data,
    diariaNumero: ordem.diaria_numero,
    diariaTotal: ordem.diaria_total,
    crewCall: semSegundos(ordem.crew_call),
    wrap: semSegundos(ordem.wrap),
    observacoes: ordem.observacoes,
  });
  const [locacoes, setLocacoes] = useState<LocacaoRow[]>(dados.locacoes);
  const [cronograma, setCronograma] = useState<CronogramaRow[]>(dados.cronograma);
  const [equipe, setEquipe] = useState<EquipeOrdemRow[]>(dados.equipe);
  const [roteiros, setRoteiros] = useState<RoteiroRow[]>(dados.roteiros);
  const [clima, setClima] = useState<ClimaSalvo | null>(
    ordem.clima_resumo
      ? {
          clima_resumo: ordem.clima_resumo,
          clima_max: ordem.clima_max,
          clima_min: ordem.clima_min,
          clima_chuva_mm: ordem.clima_chuva_mm,
          nascer_do_sol: ordem.nascer_do_sol,
          por_do_sol: ordem.por_do_sol,
          clima_atualizado_em: ordem.clima_atualizado_em ?? "",
        }
      : null
  );

  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(0);
  const [buscandoClima, setBuscandoClima] = useState(false);
  // Nome do cliente escolhido agora — o do servidor pode estar velho depois
  // de trocar o seletor, e é ele que vai impresso no papel.
  const clienteNome = clientes.find((c) => c.id === cabecalho.clienteId)?.nome ?? null;

  /**
   * Manda para o servidor sem travar a tela.
   *
   * A alteração já está aplicada localmente quando isto roda; aqui só se
   * confirma que o banco aceitou. Se não aceitar, a mensagem aparece — mas o
   * texto continua na tela, para ninguém perder o que digitou.
   */
  const emSegundoPlano = useCallback(async (executar: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setSalvando((n) => n + 1);
    try {
      const r = await executar();
      setErro(r.ok ? null : r.error);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setSalvando((n) => n - 1);
    }
  }, []);

  // O cabeçalho vai inteiro numa ação só, então precisa do valor mais recente
  // mesmo quando dois campos são alterados em sequência rápida.
  const cabecalhoRef = useRef(cabecalho);
  cabecalhoRef.current = cabecalho;

  function salvarCampoCabecalho(patch: Partial<CabecalhoInput>) {
    const proximo = { ...cabecalhoRef.current, ...patch };
    cabecalhoRef.current = proximo;
    setCabecalho(proximo);
    void emSegundoPlano(() => salvarCabecalho(ordem.id, proximo));
  }

  /** Edita uma linha: aplica na tela e avisa o servidor. */
  function editarLinha<T extends { id: string }>(
    lista: ListaDaFolha,
    definir: React.Dispatch<React.SetStateAction<T[]>>,
    linhaId: string,
    valores: Record<string, unknown>
  ) {
    definir((atual) => atual.map((l) => (l.id === linhaId ? { ...l, ...valores } : l)));
    void emSegundoPlano(() => salvarLinha(lista, ordem.id, linhaId, valores));
  }

  /** Acrescenta uma linha usando a que o banco devolveu (já com `id`). */
  async function novaLinha<T>(
    lista: ListaDaFolha,
    definir: React.Dispatch<React.SetStateAction<T[]>>,
    valores: Record<string, unknown> = {}
  ) {
    setSalvando((n) => n + 1);
    const r = await adicionarLinha(lista, ordem.id, valores);
    setSalvando((n) => n - 1);
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setErro(null);
    definir((atual) => [...atual, r.linha as T]);
  }

  function apagarLinha<T extends { id: string }>(
    lista: ListaDaFolha,
    definir: React.Dispatch<React.SetStateAction<T[]>>,
    linhaId: string
  ) {
    definir((atual) => atual.filter((l) => l.id !== linhaId));
    void emSegundoPlano(() => removerLinha(lista, ordem.id, linhaId));
  }

  const dataExtenso = porExtenso(cabecalho.data, locale);
  const duracao = duracaoEntre(cabecalho.crewCall, cabecalho.wrap);

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* Barra de ações — só existe na tela                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs text-ink-muted">
          {somenteLeitura ? "" : salvando > 0 ? t.salvando : erro ? <span className="text-danger">{erro}</span> : t.salvo}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {!somenteLeitura && (
            <CompartilharOrdem
              ordemId={ordem.id}
              token={ordem.token}
              compartilhadoInicial={ordem.compartilhado}
              projeto={cabecalho.projeto}
              data={dataExtenso}
            />
          )}
          {/* Duas saídas para a mesma folha, e a diferença entre elas está no
              rótulo: uma vai para a impressora, a outra vai para o WhatsApp. */}
          <Button variant="ghost" onClick={() => imprimir(true)} title={t.pdfColoridoHint}>
            <IconFileText className="h-4 w-4" />
            {t.pdfColorido}
          </Button>
          <Button onClick={() => imprimir(false)} title={t.imprimirHint}>
            <IconPrinter className="h-4 w-4" />
            {t.imprimir}
          </Button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* A FOLHA                                                            */}
      {/* ================================================================= */}
      <article className="folha-ordem-dia overflow-hidden rounded-2xl border border-base-700 bg-base-900/70 backdrop-blur-sm papel:rounded-none papel:border-0 papel:bg-white">
        {/* --------------------------------------------------------------- */}
        {/* TARJA — a faixa que identifica de quem é a folha                  */}
        {/* --------------------------------------------------------------- */}
        {/* O fio da marca corre pela borda de cima, de ponta a ponta. É o
            detalhe que faz a folha ser DA AGÊNCIA e não do sistema: quem
            recebe impresso reconhece a cor antes de ler qualquer palavra. */}
        <div className="h-1 w-full bg-accent papel:h-[3px] papel:bg-black" aria-hidden />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-700 bg-base-950/60 px-6 py-4 sm:px-10 print:px-0 print:py-3 papel:border-black/25 papel:bg-transparent">
          <div className="flex items-center gap-3">
            <BrandingLogo logoUrl={logoUrl} sizeClassName="h-9" />
            <p className="text-sm font-semibold tracking-tight text-ink-primary papel:text-black">{nomeApp}</p>
          </div>

          <div className="flex items-center gap-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted papel:text-black/60">
              {t.documento}
            </p>
            {/* Contador do dia: fica na tarja porque é a segunda informação
                que se procura numa folha ("é o dia 2, não o 1"). */}
            <p className="flex items-baseline gap-1 border-l border-base-700 pl-5 text-ink-primary papel:border-black/25 papel:text-black">
              <span className="text-[10px] uppercase tracking-[0.16em] text-ink-muted papel:text-black/60">{t.diaria}</span>
              {/* A largura mora no invólucro, nunca no campo: o campo é
                  sempre `w-full` e o `cn()` do projeto não resolve conflito
                  entre duas classes de largura — a última do CSS vencia, não
                  a que o componente pediu. */}
              <span className="inline-block w-9">
                <CampoInline
                  somenteLeitura={somenteLeitura}
                  ariaLabel={t.diariaNumeroLabel}
                  tipo="number"
                  valor={String(cabecalho.diariaNumero)}
                  onSalvar={(v) => salvarCampoCabecalho({ diariaNumero: Number(v) || 1 })}
                  className="text-right text-xl font-semibold tabular-nums"
                />
              </span>
              <span className="text-xs text-ink-muted papel:text-black/60">/</span>
              <span className="inline-block w-9">
                <CampoInline
                  somenteLeitura={somenteLeitura}
                  ariaLabel={t.diariaTotalLabel}
                  tipo="number"
                  valor={String(cabecalho.diariaTotal)}
                  onSalvar={(v) => salvarCampoCabecalho({ diariaTotal: Number(v) || 1 })}
                  className="text-xl font-semibold tabular-nums text-ink-secondary"
                />
              </span>
            </p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10 print:px-0 print:py-6">
          {/* ------------------------------------------------------------- */}
          {/* IDENTIFICAÇÃO — o nome do trabalho é o maior texto da página   */}
          {/* ------------------------------------------------------------- */}
          {/* Numa folha impressa que circula entre cinco pessoas, o que
              precisa ser lido de longe é o NOME DO PROJETO, não o tipo de
              documento. Por isso ele vem em corpo de título e o resto da
              identificação desce para uma linha só embaixo. */}
          <header>
            <CampoInline
                  somenteLeitura={somenteLeitura}
              ariaLabel={t.projetoLabel}
              valor={cabecalho.projeto}
              exemplo={t.projetoExemplo}
              onSalvar={(v) => salvarCampoCabecalho({ projeto: v })}
              className="-ml-1.5 text-[26px] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[32px] papel:text-black"
            />

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-secondary papel:text-black/70">
              {/* Na tela é um seletor; no papel vira só o nome. */}
              {somenteLeitura ? (
                <span>{clienteNome ?? dados.clienteNome ?? "—"}</span>
              ) : (
                <>
                  <Select
                    value={cabecalho.clienteId ?? ""}
                    aria-label={t.clienteLabel}
                    onChange={(e) => salvarCampoCabecalho({ clienteId: e.target.value || null })}
                    className="h-8 w-auto py-1 text-xs papel:hidden"
                  >
                    <option value="">{t.semCliente}</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </Select>
                  <span className="hidden papel:inline">{clienteNome ?? "—"}</span>
                </>
              )}

              <Separador />

              {/* Tipo de dia: é ele que faz esta folha servir para um ensaio
                  fotográfico, um dia de conteúdo ou uma edição — e não só
                  para gravação. Texto livre com sugestões, porque a lista de
                  ofícios que usam isto não cabe num menu fechado. */}
              <span className="inline-flex w-[13rem] items-center rounded-full bg-accent/[0.14] px-2 py-0.5 text-xs font-medium text-accent ring-1 ring-inset ring-accent/25 papel:w-auto papel:bg-transparent papel:px-0 papel:py-0 papel:text-black papel:ring-0">
                <CampoInline
                  somenteLeitura={somenteLeitura}
                  ariaLabel={t.tipoLabel}
                  valor={cabecalho.tipo}
                  exemplo={t.tipoExemplo}
                  sugestoes={t.tiposSugeridos}
                  onSalvar={(v) => salvarCampoCabecalho({ tipo: v })}
                  className="text-center"
                />
              </span>

              <Separador />

              <span className={cn("inline-block w-[9.5rem] papel:hidden", somenteLeitura && "hidden")}>
                <CampoInline
                  somenteLeitura={somenteLeitura}
                  ariaLabel={t.dataLabel}
                  tipo="date"
                  valor={cabecalho.data ?? ""}
                  onSalvar={(v) => salvarCampoCabecalho({ data: v || null })}
                  className="text-sm"
                />
              </span>
              {dataExtenso && (
                <span className={cn("hidden text-black papel:inline", somenteLeitura && "!inline text-ink-primary")}>{dataExtenso}</span>
              )}
              {dataExtenso && <span className="text-xs text-ink-muted papel:hidden">{dataExtenso}</span>}
            </div>
          </header>

          {/* ------------------------------------------------------------- */}
          {/* A RÉGUA DO DIA — a figura principal da folha                   */}
          {/* ------------------------------------------------------------- */}
          {/* Dois horários soltos em dois cartões obrigam quem lê a fazer a
              conta de cabeça. Aqui os dois números viram uma régua: começa
              aqui, termina ali, e o vão entre eles mostra o tamanho do dia.
              É a única figura grande da página — todo o resto é texto. */}
          <div className="mt-8 grid grid-cols-1 items-end gap-4 rounded-xl border border-base-700 bg-base-950/40 px-6 py-5 sm:grid-cols-[auto_minmax(3rem,1fr)_auto] sm:gap-6 papel:rounded-none papel:border-x-0 papel:border-y papel:border-black/25 papel:bg-transparent papel:px-0">
            <Horario
              rotulo={t.chamadaLabel}
              hint={t.chamadaHint}
              valor={cabecalho.crewCall ?? ""}
              onSalvar={(v) => salvarCampoCabecalho({ crewCall: v || null })}
              somenteLeitura={somenteLeitura}
            />

            {/* O vão. Na vertical (celular) vira só o texto da duração. */}
            <div className="hidden pb-3 sm:block">
              <p
                className={cn(
                  "mb-2 text-center text-[11px] uppercase tracking-[0.14em]",
                  duracao ? "text-ink-secondary papel:text-black/70" : "text-ink-muted/70 papel:text-black/40"
                )}
              >
                {duracao ? (
                  <>
                    <span className="font-semibold tabular-nums text-ink-primary papel:text-black">{duracao}</span>{" "}
                    {t.duracao}
                  </>
                ) : (
                  t.duracaoVazia
                )}
              </p>
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent papel:bg-black" />
                <span className="h-px flex-1 bg-gradient-to-r from-accent/60 via-base-700 to-accent/60 papel:bg-black/30 papel:bg-none" />
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent papel:bg-black" />
              </div>
            </div>

            <p className="text-center text-[11px] uppercase tracking-[0.14em] text-ink-secondary sm:hidden print:hidden">
              {duracao ? `${duracao} ${t.duracao}` : t.duracaoVazia}
            </p>

            <Horario
              rotulo={t.encerramentoLabel}
              hint={t.encerramentoHint}
              valor={cabecalho.wrap ?? ""}
              onSalvar={(v) => salvarCampoCabecalho({ wrap: v || null })}
              alinharDireita
              somenteLeitura={somenteLeitura}
            />
          </div>

          {/* CLIMA E LUZ — linha fina, não cartão. Impressa, é o que decide
              se leva capa de chuva e quanta luz natural sobra. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-base-800 px-1 pb-3 text-sm papel:border-black/15">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-muted papel:text-black/60">{t.climaTitulo}</p>

            {clima ? (
              <>
                <p className="font-medium text-ink-primary papel:text-black">
                  {clima.clima_resumo}
                  <span className="ml-2 tabular-nums text-ink-secondary papel:text-black/70">
                    {clima.clima_max}° / {clima.clima_min}°
                  </span>
                  {clima.clima_chuva_mm != null && clima.clima_chuva_mm > 0 && (
                    <span className="ml-2 text-xs text-ink-secondary papel:text-black/70">
                      {t.climaChuva} {clima.clima_chuva_mm} mm
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-secondary papel:text-black/70">
                  <IconSun className="h-3.5 w-3.5" /> {t.nascerDoSol}{" "}
                  <span className="tabular-nums">{semSegundos(clima.nascer_do_sol)}</span>
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-secondary papel:text-black/70">
                  <IconMoon className="h-3.5 w-3.5" /> {t.porDoSol}{" "}
                  <span className="tabular-nums">{semSegundos(clima.por_do_sol)}</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-ink-muted papel:text-black/60">{t.climaVazio}</p>
            )}

            <Button
              variant="ghost"
              className={cn("ml-auto px-2 py-0.5 text-[11px] print:hidden", somenteLeitura && "hidden")}
              disabled={buscandoClima}
              onClick={async () => {
                setBuscandoClima(true);
                const r = await atualizarClima(ordem.id);
                setBuscandoClima(false);
                if (!r.ok) setErro(r.error);
                else {
                  setErro(null);
                  setClima(r.clima);
                }
              }}
            >
              {buscandoClima ? <IconLoader className="h-3 w-3 animate-spin" /> : null}
              {buscandoClima ? t.climaBuscando : t.climaBuscar}
            </Button>
          </div>

          <div className="mt-10 space-y-10">
            {/* ------------------------- 01 · ONDE ------------------------ */}
            <BlocoFolha
              numero="01"
              titulo={t.locacoesTitulo}
              auxiliar={locacoes.length ? contar(locacoes.length, t.contagemLocais) : undefined}
              acao={somenteLeitura ? undefined : (
                <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => void novaLinha("locacoes", setLocacoes)}>
                  <IconPlus className="h-3.5 w-3.5" /> {t.adicionarLocacao}
                </Button>
              )}
            >
              {locacoes.length === 0 ? (
                <Vazio texto={t.locacoesVazio} />
              ) : (
                <ul className="space-y-5">
                  {locacoes.map((loc, i) => (
                    <li key={loc.id} className="flex gap-4 break-inside-avoid">
                      {/* Número em círculo: é assim que a pessoa amarra
                          "10:30 — Sala 2" do cronograma ao endereço aqui. */}
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/45 text-[11px] font-semibold tabular-nums text-accent papel:border-black/40 papel:text-black">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.locacaoNome}
                          valor={loc.nome}
                          exemplo={t.locacaoNomeExemplo}
                          onSalvar={(v) => editarLinha("locacoes", setLocacoes, loc.id, { nome: v })}
                          className="-ml-1.5 text-[15px] font-semibold text-ink-primary papel:text-black"
                        />
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.locacaoEndereco}
                          valor={loc.endereco}
                          exemplo={t.locacaoEnderecoExemplo}
                          // Endereço novo invalida as coordenadas guardadas —
                          // senão a previsão do tempo continuaria vindo do
                          // endereço antigo.
                          onSalvar={(v) =>
                            editarLinha("locacoes", setLocacoes, loc.id, { endereco: v, latitude: null, longitude: null })
                          }
                          className="-ml-1.5 text-sm text-ink-secondary papel:text-black/75"
                        />
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.locacaoNotas}
                          valor={loc.notas}
                          exemplo={t.locacaoNotasExemplo}
                          onSalvar={(v) => editarLinha("locacoes", setLocacoes, loc.id, { notas: v })}
                          className="-ml-1.5 text-xs text-ink-muted papel:text-black/60"
                        />
                      </div>
                      {!somenteLeitura && <BotaoRemover onClick={() => apagarLinha("locacoes", setLocacoes, loc.id)} />}
                    </li>
                  ))}
                </ul>
              )}
            </BlocoFolha>

            {/* --------------------- 02 · CRONOGRAMA ---------------------- */}
            <BlocoFolha
              numero="02"
              titulo={t.cronogramaTitulo}
              auxiliar={cronograma.length ? contar(cronograma.length, t.contagemEtapas) : undefined}
              acao={somenteLeitura ? undefined : (
                <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => void novaLinha("cronograma", setCronograma)}>
                  <IconPlus className="h-3.5 w-3.5" /> {t.adicionarLinha}
                </Button>
              )}
            >
              {cronograma.length === 0 ? (
                <Vazio texto={t.cronogramaVazio} />
              ) : (
                <ol>
                  {cronograma.map((linha, i) => (
                    // Grade, não flex: a grade define a largura de cada coluna
                    // de fora, então o campo pode continuar sendo `w-full`
                    // dentro dela. Em flex, a largura tinha de ir na classe do
                    // próprio campo — e brigava com o `w-full` de dentro,
                    // fazendo a hora comer a linha toda e sumir com "o que
                    // acontece" e "onde".
                    <li key={linha.id} className={GRADE_CRONOGRAMA}>
                      <CampoInline
                  somenteLeitura={somenteLeitura}
                        ariaLabel={t.cronogramaHora}
                        tipo="time"
                        valor={semSegundos(linha.hora)}
                        onSalvar={(v) => editarLinha("cronograma", setCronograma, linha.id, { hora: v })}
                        className="py-2 text-sm font-semibold tabular-nums text-accent papel:text-black"
                      />

                      {/* A linha do tempo desenhada: fio contínuo, um ponto
                          por etapa. O fio não sobra antes da primeira nem
                          depois da última — um traço solto na ponta faria a
                          lista parecer cortada. */}
                      <div className="relative flex justify-center self-stretch" aria-hidden>
                        {i > 0 && <span className="absolute top-0 h-[1.15rem] w-px bg-base-700 papel:bg-black/25" />}
                        {i < cronograma.length - 1 && (
                          <span className="absolute bottom-0 top-[1.15rem] w-px bg-base-700 papel:bg-black/25" />
                        )}
                        <span className="absolute top-[0.95rem] h-[7px] w-[7px] rounded-full border-2 border-accent bg-base-900 papel:border-black papel:bg-white" />
                      </div>

                      <CampoInline
                  somenteLeitura={somenteLeitura}
                        ariaLabel={t.cronogramaAtividade}
                        valor={linha.atividade}
                        exemplo={t.cronogramaAtividadeExemplo}
                        onSalvar={(v) => editarLinha("cronograma", setCronograma, linha.id, { atividade: v })}
                        className="py-2 text-sm text-ink-primary papel:text-black"
                      />

                      <CampoInline
                  somenteLeitura={somenteLeitura}
                        ariaLabel={t.cronogramaLocal}
                        valor={linha.local}
                        exemplo={t.cronogramaLocalExemplo}
                        onSalvar={(v) => editarLinha("cronograma", setCronograma, linha.id, { local: v })}
                        className="py-2 text-right text-xs text-ink-muted papel:text-black/60"
                      />

                      <div className="py-2">
                        {!somenteLeitura && <BotaoRemover onClick={() => apagarLinha("cronograma", setCronograma, linha.id)} />}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </BlocoFolha>

            {/* -------------------- 03 · QUEM VAI ESTAR -------------------- */}
            <BlocoFolha
              numero="03"
              titulo={t.equipeTitulo}
              auxiliar={equipe.length ? contar(equipe.length, t.contagemPessoas) : undefined}
              acao={somenteLeitura ? undefined : (
                <div className="flex items-center gap-2">
                  {/* Puxar do cadastro já preenche função, nome e telefone —
                      é o mesmo dado que a agência digitou uma vez. */}
                  <Select
                    value=""
                    aria-label={t.adicionarDoCadastro}
                    className="h-8 py-1 text-xs"
                    onChange={(e) => {
                      const membro = equipeCadastro.find((m) => m.id === e.target.value);
                      if (!membro) return;
                      void novaLinha("equipe", setEquipe, {
                        membro_id: membro.id,
                        nome: membro.nome,
                        funcao: membro.cargo ?? "",
                        contato: membro.telefone ?? "",
                      });
                    }}
                  >
                    <option value="">{t.adicionarDoCadastro}</option>
                    {equipeCadastro.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </Select>
                  <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => void novaLinha("equipe", setEquipe)}>
                    <IconPlus className="h-3.5 w-3.5" /> {t.adicionarPessoa}
                  </Button>
                </div>
              )}
            >
              {equipe.length === 0 ? (
                <Vazio texto={t.equipeVazio} />
              ) : (
                <div>
                  <div className={cn(GRADE_EQUIPE, "pb-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted papel:text-black/55")}>
                    <span>{t.equipeFuncao}</span>
                    <span>{t.equipeNome}</span>
                    <span>{t.equipeContato}</span>
                    <span className="text-right">{t.equipeChamada}</span>
                    <span className="print:hidden" />
                  </div>
                  <ul>
                    {equipe.map((pessoa) => (
                      <li
                        key={pessoa.id}
                        // Zebra em vez de linha divisória: numa tabela de dez
                        // pessoas lidas de relance no papel, a faixa segura o
                        // olho na linha certa melhor que um filete.
                        className={cn(
                          GRADE_EQUIPE,
                          "items-center rounded-md py-1.5 odd:bg-base-950/40 papel:rounded-none papel:odd:bg-black/[0.04]"
                        )}
                      >
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.equipeFuncao}
                          valor={pessoa.funcao}
                          exemplo={t.equipeFuncaoExemplo}
                          onSalvar={(v) => editarLinha("equipe", setEquipe, pessoa.id, { funcao: v })}
                          className="text-[11px] uppercase tracking-[0.08em] text-ink-secondary papel:text-black/70"
                        />
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.equipeNome}
                          valor={pessoa.nome}
                          exemplo={t.equipeNomeExemplo}
                          onSalvar={(v) => editarLinha("equipe", setEquipe, pessoa.id, { nome: v })}
                          className="text-sm font-medium text-ink-primary papel:text-black"
                        />
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.equipeContato}
                          valor={pessoa.contato}
                          exemplo={t.equipeContatoExemplo}
                          onSalvar={(v) => editarLinha("equipe", setEquipe, pessoa.id, { contato: v })}
                          className="text-sm tabular-nums text-ink-secondary papel:text-black/75"
                        />
                        <CampoInline
                  somenteLeitura={somenteLeitura}
                          ariaLabel={t.equipeChamada}
                          tipo="time"
                          valor={semSegundos(pessoa.horario_chamada)}
                          onSalvar={(v) => editarLinha("equipe", setEquipe, pessoa.id, { horario_chamada: v })}
                          className="text-right text-sm font-semibold tabular-nums text-ink-primary papel:text-black"
                        />
                        {!somenteLeitura && <BotaoRemover onClick={() => apagarLinha("equipe", setEquipe, pessoa.id)} />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </BlocoFolha>

            {/* ------------------ 04 · ROTEIROS DE GRAVAÇÃO ---------------- */}
            {/* O que vai ser gravado, e o que se fala. Numa diária de conteúdo
                são seis vídeos diferentes num dia só — sem isto na folha,
                essa lista vive num bloco de notas que ninguém mais acha. */}
            <BlocoFolha
              numero="04"
              titulo={t.roteirosTitulo}
              auxiliar={roteiros.length ? contar(roteiros.length, t.contagemRoteiros) : undefined}
              acao={somenteLeitura ? undefined : (
                <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => void novaLinha("roteiros", setRoteiros)}>
                  <IconPlus className="h-3.5 w-3.5" /> {t.adicionarRoteiro}
                </Button>
              )}
            >
              {roteiros.length === 0 ? (
                <Vazio texto={t.roteirosVazio} />
              ) : (
                <ul className="space-y-6">
                  {roteiros.map((roteiro, i) => (
                    <li key={roteiro.id} className="break-inside-avoid">
                      <div className="flex items-start gap-4">
                        {/* V01, V02… — na hora de gravar, "vamos pro V03" é
                            mais rápido do que ler o título inteiro em voz alta. */}
                        <span className="mt-0.5 shrink-0 rounded-md bg-accent/[0.14] px-2 py-1 text-[11px] font-semibold tabular-nums tracking-wider text-accent ring-1 ring-inset ring-accent/25 papel:bg-transparent papel:px-0 papel:text-black papel:ring-0">
                          V{String(i + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3">
                            <span className="min-w-0 flex-1">
                              <CampoInline
                  somenteLeitura={somenteLeitura}
                                ariaLabel={t.roteiroTitulo}
                                valor={roteiro.titulo}
                                exemplo={t.roteiroTituloExemplo}
                                onSalvar={(v) => editarLinha("roteiros", setRoteiros, roteiro.id, { titulo: v })}
                                className="-ml-1.5 text-[15px] font-semibold text-ink-primary papel:text-black"
                              />
                            </span>
                            <span className="inline-block w-[9rem] shrink-0">
                              <CampoInline
                  somenteLeitura={somenteLeitura}
                                ariaLabel={t.roteiroFormato}
                                valor={roteiro.formato}
                                exemplo={t.roteiroFormatoExemplo}
                                sugestoes={t.formatosSugeridos}
                                onSalvar={(v) => editarLinha("roteiros", setRoteiros, roteiro.id, { formato: v })}
                                className="text-right text-[11px] uppercase tracking-[0.1em] text-ink-muted papel:text-black/60"
                              />
                            </span>
                          </div>

                          {/* As falas ficam recuadas e com um filete à
                              esquerda: no papel, é o que separa "o que é o
                              vídeo" de "o que se diz nele" sem precisar de
                              mais um rótulo. */}
                          <div className="mt-1 border-l-2 border-base-700 pl-3 papel:border-black/20">
                            <CampoInline
                  somenteLeitura={somenteLeitura}
                              ariaLabel={t.roteiroFalas}
                              multiline
                              valor={roteiro.falas}
                              exemplo={t.roteiroFalasExemplo}
                              onSalvar={(v) => editarLinha("roteiros", setRoteiros, roteiro.id, { falas: v })}
                              className="-ml-1.5 text-sm leading-relaxed text-ink-secondary papel:text-black/80"
                            />
                          </div>
                        </div>

                        {!somenteLeitura && <BotaoRemover onClick={() => apagarLinha("roteiros", setRoteiros, roteiro.id)} />}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </BlocoFolha>

            {/* --------------------- 05 · OBSERVAÇÕES --------------------- */}
            <BlocoFolha numero="05" titulo={t.observacoesTitulo}>
              <CampoInline
                  somenteLeitura={somenteLeitura}
                ariaLabel={t.observacoesTitulo}
                multiline
                valor={cabecalho.observacoes}
                exemplo={t.observacoesPlaceholder}
                onSalvar={(v) => salvarCampoCabecalho({ observacoes: v })}
                className="-ml-1.5 text-sm leading-relaxed text-ink-secondary papel:text-black/80"
              />
            </BlocoFolha>
          </div>

          <footer className="mt-12 hidden items-center justify-between border-t border-black/25 pt-3 text-[10px] uppercase tracking-[0.12em] text-black/55 papel:flex">
            <span>
              {nomeApp} · {cabecalho.projeto || t.semProjeto} · {t.diaria} {cabecalho.diariaNumero}/{cabecalho.diariaTotal}
            </span>
            <span>{t.rodapeImpressao}</span>
          </footer>
        </div>
      </article>
    </div>
  );
}

/** Hora · fio do tempo · o que acontece · onde · apagar. */
const GRADE_CRONOGRAMA =
  "grid grid-cols-[5rem_0.625rem_minmax(0,1fr)_7rem_1.75rem] items-start gap-x-3";

/** A mesma grade no cabeçalho e nas linhas da tabela de pessoas. */
const GRADE_EQUIPE =
  "grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.95fr)_4.5rem_1.75rem] items-center gap-x-3 px-1.5";

/** Um dos dois números grandes da régua do dia. */
function Horario({
  rotulo,
  hint,
  valor,
  onSalvar,
  alinharDireita = false,
  somenteLeitura = false,
}: {
  rotulo: string;
  hint: string;
  valor: string;
  onSalvar: (v: string) => void;
  alinharDireita?: boolean;
  somenteLeitura?: boolean;
}) {
  return (
    <div className={cn("w-[9rem]", alinharDireita && "sm:text-right")}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted papel:text-black/60">{rotulo}</p>
      <CampoInline
                  somenteLeitura={somenteLeitura}
        ariaLabel={rotulo}
        tipo="time"
        valor={valor}
        onSalvar={onSalvar}
        className={cn(
          "-ml-1.5 mt-0.5 text-[40px] font-semibold leading-none tabular-nums tracking-tight text-ink-primary sm:text-5xl papel:text-black",
          alinharDireita && "sm:text-right"
        )}
      />
      <p className="mt-1.5 text-[11px] text-ink-muted papel:text-black/60">{hint}</p>
    </div>
  );
}

function Separador() {
  return (
    <span className="text-ink-muted/50 papel:text-black/30" aria-hidden>
      ·
    </span>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rounded-lg border border-dashed border-base-700 px-4 py-5 text-center text-xs text-ink-muted papel:border-black/20 papel:text-black/55">
      {texto}
    </p>
  );
}

function BotaoRemover({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded p-1 text-ink-muted transition hover:text-danger print:hidden"
      aria-label="Remover"
    >
      <IconTrash className="h-3.5 w-3.5" />
    </button>
  );
}
