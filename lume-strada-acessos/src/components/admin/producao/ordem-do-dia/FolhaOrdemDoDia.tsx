"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrdemDoDiaCompleta } from "@/lib/types/ordem-do-dia";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { IconPrinter, IconPlus, IconTrash, IconSun, IconMoon, IconLoader } from "@/components/ui/icons";
import { CampoInline } from "./CampoInline";
import { BlocoFolha } from "./BlocoFolha";
import {
  adicionarLinha,
  atualizarClima,
  removerLinha,
  salvarCabecalho,
  salvarLinha,
  type CabecalhoInput,
} from "@/app/admin/producao/ordem-do-dia/actions";

interface Props {
  dados: OrdemDoDiaCompleta;
  clientes: { id: string; nome: string }[];
  equipeCadastro: { id: string; nome: string; cargo: string | null; telefone: string | null }[];
  logoUrl: string | null;
  nomeApp: string;
}

/** "2026-09-10" -> "Quinta-feira, 10 de setembro de 2026" */
function porExtenso(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const mapa: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };
  const texto = new Date(`${iso}T12:00:00`).toLocaleDateString(mapa[locale] ?? "pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

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

export function FolhaOrdemDoDia({ dados, clientes, equipeCadastro, logoUrl, nomeApp }: Props) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const t = dict.ordemDoDia;

  const { ordem, locacoes, cronograma, equipe } = dados;
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [buscandoClima, startClima] = useTransition();

  // Estado local só do cabeçalho: os campos precisam ser enviados juntos
  // (uma Server Action só), então vivem aqui até o `blur` disparar o salvamento.
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

  function comAcao(executar: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setErro(null);
    startTransition(async () => {
      const r = await executar();
      if (!r.ok) setErro(r.error);
      else router.refresh();
    });
  }

  function salvarCampoCabecalho(patch: Partial<CabecalhoInput>) {
    const proximo = { ...cabecalho, ...patch };
    setCabecalho(proximo);
    comAcao(() => salvarCabecalho(ordem.id, proximo));
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
          {pendente ? t.salvando : erro ? <span className="text-danger">{erro}</span> : t.salvo}
        </p>
        <Button onClick={() => window.print()}>
          <IconPrinter className="h-4 w-4" />
          {t.imprimir}
        </Button>
      </div>

      {/* ================================================================= */}
      {/* A FOLHA                                                            */}
      {/* ================================================================= */}
      <article className="folha-ordem-dia overflow-hidden rounded-2xl border border-base-700 bg-base-900/70 backdrop-blur-sm print:rounded-none print:border-0 print:bg-white">
        {/* --------------------------------------------------------------- */}
        {/* TARJA — a faixa que identifica de quem é a folha                  */}
        {/* --------------------------------------------------------------- */}
        {/* O fio da marca corre pela borda de cima, de ponta a ponta. É o
            detalhe que faz a folha ser DA AGÊNCIA e não do sistema: quem
            recebe impresso reconhece a cor antes de ler qualquer palavra. */}
        <div className="h-1 w-full bg-accent print:h-[3px] print:bg-black" aria-hidden />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-700 bg-base-950/60 px-6 py-4 sm:px-10 print:border-black/25 print:bg-transparent print:px-0 print:py-3">
          <div className="flex items-center gap-3">
            <BrandingLogo logoUrl={logoUrl} sizeClassName="h-9" />
            <p className="text-sm font-semibold tracking-tight text-ink-primary print:text-black">{nomeApp}</p>
          </div>

          <div className="flex items-center gap-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-muted print:text-black/60">
              {t.documento}
            </p>
            {/* Contador do dia: fica na tarja porque é a segunda informação
                que se procura numa folha ("é o dia 2, não o 1"). */}
            <p className="flex items-baseline gap-1 border-l border-base-700 pl-5 text-ink-primary print:border-black/25 print:text-black">
              <span className="text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.diaria}</span>
              <CampoInline
                ariaLabel={t.diariaNumeroLabel}
                tipo="number"
                valor={String(cabecalho.diariaNumero)}
                onSalvar={(v) => salvarCampoCabecalho({ diariaNumero: Number(v) || 1 })}
                className="w-10 text-right text-xl font-semibold tabular-nums"
              />
              <span className="text-xs text-ink-muted print:text-black/60">/</span>
              <CampoInline
                ariaLabel={t.diariaTotalLabel}
                tipo="number"
                valor={String(cabecalho.diariaTotal)}
                onSalvar={(v) => salvarCampoCabecalho({ diariaTotal: Number(v) || 1 })}
                className="w-10 text-xl font-semibold tabular-nums text-ink-secondary"
              />
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
              ariaLabel={t.projetoLabel}
              valor={cabecalho.projeto}
              exemplo={t.projetoExemplo}
              onSalvar={(v) => salvarCampoCabecalho({ projeto: v })}
              className="-ml-1.5 text-[26px] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[32px] print:text-black"
            />

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-secondary print:text-black/70">
              {/* Na tela é um seletor; no papel vira só o nome. */}
              <Select
                value={cabecalho.clienteId ?? ""}
                aria-label={t.clienteLabel}
                onChange={(e) => salvarCampoCabecalho({ clienteId: e.target.value || null })}
                className="h-8 w-auto py-1 text-xs print:hidden"
              >
                <option value="">{t.semCliente}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
              <span className="hidden print:inline">{dados.clienteNome ?? "—"}</span>

              <Separador />

              {/* Tipo de dia: é ele que faz esta folha servir para um ensaio
                  fotográfico, um dia de conteúdo ou uma edição — e não só
                  para gravação. Texto livre com sugestões, porque a lista de
                  ofícios que usam isto não cabe num menu fechado. */}
              <span className="inline-flex max-w-[16rem] items-center rounded-full bg-accent/[0.14] px-2 py-0.5 text-xs font-medium text-accent ring-1 ring-inset ring-accent/25 print:bg-transparent print:px-0 print:py-0 print:text-black print:ring-0">
                <CampoInline
                  ariaLabel={t.tipoLabel}
                  valor={cabecalho.tipo}
                  exemplo={t.tipoExemplo}
                  sugestoes={t.tiposSugeridos}
                  onSalvar={(v) => salvarCampoCabecalho({ tipo: v })}
                  className="text-center"
                />
              </span>

              <Separador />

              <span className="inline-flex items-center">
                <CampoInline
                  ariaLabel={t.dataLabel}
                  tipo="date"
                  valor={cabecalho.data ?? ""}
                  onSalvar={(v) => salvarCampoCabecalho({ data: v || null })}
                  className="w-[9.5rem] text-sm print:hidden"
                />
                {dataExtenso && <span className="hidden text-black print:inline">{dataExtenso}</span>}
              </span>

              {dataExtenso && <span className="text-xs text-ink-muted print:hidden">{dataExtenso}</span>}
            </div>
          </header>

          {/* ------------------------------------------------------------- */}
          {/* A RÉGUA DO DIA — a figura principal da folha                   */}
          {/* ------------------------------------------------------------- */}
          {/* Dois horários soltos em dois cartões obrigam quem lê a fazer a
              conta de cabeça. Aqui os dois números viram uma régua: começa
              aqui, termina ali, e o vão entre eles mostra o tamanho do dia.
              É a única figura grande da página — todo o resto é texto. */}
          <div className="mt-8 grid grid-cols-1 items-end gap-4 rounded-xl border border-base-700 bg-base-950/40 px-6 py-5 sm:grid-cols-[auto_minmax(3rem,1fr)_auto] sm:gap-6 print:rounded-none print:border-x-0 print:border-y print:border-black/25 print:bg-transparent print:px-0">
            <Horario
              rotulo={t.chamadaLabel}
              hint={t.chamadaHint}
              valor={cabecalho.crewCall ?? ""}
              onSalvar={(v) => salvarCampoCabecalho({ crewCall: v || null })}
            />

            {/* O vão. Na vertical (celular) vira só o texto da duração. */}
            <div className="hidden pb-3 sm:block">
              <p
                className={cn(
                  "mb-2 text-center text-[11px] uppercase tracking-[0.14em]",
                  duracao ? "text-ink-secondary print:text-black/70" : "text-ink-muted/70 print:text-black/40"
                )}
              >
                {duracao ? (
                  <>
                    <span className="font-semibold tabular-nums text-ink-primary print:text-black">{duracao}</span>{" "}
                    {t.duracao}
                  </>
                ) : (
                  t.duracaoVazia
                )}
              </p>
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent print:bg-black" />
                <span className="h-px flex-1 bg-gradient-to-r from-accent/60 via-base-700 to-accent/60 print:bg-black/30 print:bg-none" />
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent print:bg-black" />
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
            />
          </div>

          {/* CLIMA E LUZ — linha fina, não cartão. Impressa, é o que decide
              se leva capa de chuva e quanta luz natural sobra. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-base-800 px-1 pb-3 text-sm print:border-black/15">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.climaTitulo}</p>

            {ordem.clima_resumo ? (
              <>
                <p className="font-medium text-ink-primary print:text-black">
                  {ordem.clima_resumo}
                  <span className="ml-2 tabular-nums text-ink-secondary print:text-black/70">
                    {ordem.clima_max}° / {ordem.clima_min}°
                  </span>
                  {ordem.clima_chuva_mm != null && ordem.clima_chuva_mm > 0 && (
                    <span className="ml-2 text-xs text-ink-secondary print:text-black/70">
                      {t.climaChuva} {ordem.clima_chuva_mm} mm
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-secondary print:text-black/70">
                  <IconSun className="h-3.5 w-3.5" /> {t.nascerDoSol}{" "}
                  <span className="tabular-nums">{semSegundos(ordem.nascer_do_sol)}</span>
                </p>
                <p className="flex items-center gap-1.5 text-xs text-ink-secondary print:text-black/70">
                  <IconMoon className="h-3.5 w-3.5" /> {t.porDoSol}{" "}
                  <span className="tabular-nums">{semSegundos(ordem.por_do_sol)}</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-ink-muted print:text-black/60">{t.climaVazio}</p>
            )}

            <Button
              variant="ghost"
              className="ml-auto px-2 py-0.5 text-[11px] print:hidden"
              disabled={buscandoClima}
              onClick={() =>
                startClima(async () => {
                  setErro(null);
                  const r = await atualizarClima(ordem.id);
                  if (!r.ok) setErro(r.error);
                  else router.refresh();
                })
              }
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
              auxiliar={locacoes.length ? t.contagemLocais(locacoes.length) : undefined}
              acao={
                <Button
                  variant="ghost"
                  className="px-2.5 py-1 text-xs"
                  onClick={() => comAcao(() => adicionarLinha("locacoes", ordem.id))}
                >
                  <IconPlus className="h-3.5 w-3.5" /> {t.adicionarLocacao}
                </Button>
              }
            >
              {locacoes.length === 0 ? (
                <Vazio texto={t.locacoesVazio} />
              ) : (
                <ul className="space-y-5">
                  {locacoes.map((loc, i) => (
                    <li key={loc.id} className="flex gap-4 break-inside-avoid">
                      {/* Número em círculo: é assim que a pessoa amarra
                          "10:30 — Sala 2" do cronograma ao endereço aqui. */}
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/45 text-[11px] font-semibold tabular-nums text-accent print:border-black/40 print:text-black">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <CampoInline
                          ariaLabel={t.locacaoNome}
                          valor={loc.nome}
                          exemplo={t.locacaoNomeExemplo}
                          onSalvar={(v) => comAcao(() => salvarLinha("locacoes", ordem.id, loc.id, { nome: v }))}
                          className="-ml-1.5 text-[15px] font-semibold text-ink-primary print:text-black"
                        />
                        <CampoInline
                          ariaLabel={t.locacaoEndereco}
                          valor={loc.endereco}
                          exemplo={t.locacaoEnderecoExemplo}
                          onSalvar={(v) =>
                            comAcao(() =>
                              salvarLinha("locacoes", ordem.id, loc.id, { endereco: v, latitude: null, longitude: null })
                            )
                          }
                          className="-ml-1.5 text-sm text-ink-secondary print:text-black/75"
                        />
                        <CampoInline
                          ariaLabel={t.locacaoNotas}
                          valor={loc.notas}
                          exemplo={t.locacaoNotasExemplo}
                          onSalvar={(v) => comAcao(() => salvarLinha("locacoes", ordem.id, loc.id, { notas: v }))}
                          className="-ml-1.5 text-xs text-ink-muted print:text-black/60"
                        />
                      </div>
                      <BotaoRemover onClick={() => comAcao(() => removerLinha("locacoes", ordem.id, loc.id))} />
                    </li>
                  ))}
                </ul>
              )}
            </BlocoFolha>

            {/* --------------------- 02 · CRONOGRAMA ---------------------- */}
            <BlocoFolha
              numero="02"
              titulo={t.cronogramaTitulo}
              auxiliar={cronograma.length ? t.contagemEtapas(cronograma.length) : undefined}
              acao={
                <Button
                  variant="ghost"
                  className="px-2.5 py-1 text-xs"
                  onClick={() => comAcao(() => adicionarLinha("cronograma", ordem.id))}
                >
                  <IconPlus className="h-3.5 w-3.5" /> {t.adicionarLinha}
                </Button>
              }
            >
              {cronograma.length === 0 ? (
                <Vazio texto={t.cronogramaVazio} />
              ) : (
                <ol>
                  {cronograma.map((linha, i) => (
                    <li key={linha.id} className="flex items-stretch gap-3">
                      <CampoInline
                        ariaLabel={t.cronogramaHora}
                        tipo="time"
                        valor={semSegundos(linha.hora)}
                        onSalvar={(v) => comAcao(() => salvarLinha("cronograma", ordem.id, linha.id, { hora: v }))}
                        className="w-[5.5rem] shrink-0 self-start py-2 text-sm font-semibold tabular-nums text-accent print:text-black"
                      />

                      {/* A linha do tempo desenhada: fio contínuo, um ponto
                          por etapa. O fio não sobra antes da primeira nem
                          depois da última — um traço solto na ponta faria a
                          lista parecer cortada. */}
                      <div className="relative flex w-2.5 shrink-0 justify-center" aria-hidden>
                        {i > 0 && <span className="absolute top-0 h-[1.15rem] w-px bg-base-700 print:bg-black/25" />}
                        {i < cronograma.length - 1 && (
                          <span className="absolute bottom-0 top-[1.15rem] w-px bg-base-700 print:bg-black/25" />
                        )}
                        <span className="absolute top-[0.95rem] h-[7px] w-[7px] rounded-full border-2 border-accent bg-base-900 print:border-black print:bg-white" />
                      </div>

                      <div className="min-w-0 flex-1 py-1">
                        <CampoInline
                          ariaLabel={t.cronogramaAtividade}
                          valor={linha.atividade}
                          exemplo={t.cronogramaAtividadeExemplo}
                          onSalvar={(v) => comAcao(() => salvarLinha("cronograma", ordem.id, linha.id, { atividade: v }))}
                          className="text-sm text-ink-primary print:text-black"
                        />
                      </div>
                      <CampoInline
                        ariaLabel={t.cronogramaLocal}
                        valor={linha.local}
                        exemplo={t.cronogramaLocalExemplo}
                        onSalvar={(v) => comAcao(() => salvarLinha("cronograma", ordem.id, linha.id, { local: v }))}
                        className="w-32 shrink-0 self-start py-2 text-right text-xs text-ink-muted print:text-black/60"
                      />
                      <div className="self-start py-2">
                        <BotaoRemover onClick={() => comAcao(() => removerLinha("cronograma", ordem.id, linha.id))} />
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
              auxiliar={equipe.length ? t.contagemPessoas(equipe.length) : undefined}
              acao={
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
                      comAcao(() =>
                        adicionarLinha("equipe", ordem.id, {
                          membro_id: membro.id,
                          nome: membro.nome,
                          funcao: membro.cargo ?? "",
                          contato: membro.telefone ?? "",
                        })
                      );
                    }}
                  >
                    <option value="">{t.adicionarDoCadastro}</option>
                    {equipeCadastro.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    className="px-2.5 py-1 text-xs"
                    onClick={() => comAcao(() => adicionarLinha("equipe", ordem.id))}
                  >
                    <IconPlus className="h-3.5 w-3.5" /> {t.adicionarPessoa}
                  </Button>
                </div>
              }
            >
              {equipe.length === 0 ? (
                <Vazio texto={t.equipeVazio} />
              ) : (
                <div>
                  <div className={cn(GRADE_EQUIPE, "pb-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted print:text-black/55")}>
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
                          "items-center rounded-md py-1.5 odd:bg-base-950/40 print:rounded-none print:odd:bg-black/[0.04]"
                        )}
                      >
                        <CampoInline
                          ariaLabel={t.equipeFuncao}
                          valor={pessoa.funcao}
                          exemplo={t.equipeFuncaoExemplo}
                          onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { funcao: v }))}
                          className="text-[11px] uppercase tracking-[0.08em] text-ink-secondary print:text-black/70"
                        />
                        <CampoInline
                          ariaLabel={t.equipeNome}
                          valor={pessoa.nome}
                          exemplo={t.equipeNomeExemplo}
                          onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { nome: v }))}
                          className="text-sm font-medium text-ink-primary print:text-black"
                        />
                        <CampoInline
                          ariaLabel={t.equipeContato}
                          valor={pessoa.contato}
                          exemplo={t.equipeContatoExemplo}
                          onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { contato: v }))}
                          className="text-sm tabular-nums text-ink-secondary print:text-black/75"
                        />
                        <CampoInline
                          ariaLabel={t.equipeChamada}
                          tipo="time"
                          valor={semSegundos(pessoa.horario_chamada)}
                          onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { horario_chamada: v }))}
                          className="text-right text-sm font-semibold tabular-nums text-ink-primary print:text-black"
                        />
                        <BotaoRemover onClick={() => comAcao(() => removerLinha("equipe", ordem.id, pessoa.id))} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </BlocoFolha>

            {/* --------------------- 04 · OBSERVAÇÕES --------------------- */}
            <BlocoFolha numero="04" titulo={t.observacoesTitulo}>
              <CampoInline
                ariaLabel={t.observacoesTitulo}
                multiline
                valor={cabecalho.observacoes}
                exemplo={t.observacoesPlaceholder}
                onSalvar={(v) => salvarCampoCabecalho({ observacoes: v })}
                className="-ml-1.5 text-sm leading-relaxed text-ink-secondary print:text-black/80"
              />
            </BlocoFolha>
          </div>

          <footer className="mt-12 hidden items-center justify-between border-t border-black/25 pt-3 text-[10px] uppercase tracking-[0.12em] text-black/55 print:flex">
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
}: {
  rotulo: string;
  hint: string;
  valor: string;
  onSalvar: (v: string) => void;
  alinharDireita?: boolean;
}) {
  return (
    <div className={cn(alinharDireita && "sm:text-right")}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted print:text-black/60">{rotulo}</p>
      <CampoInline
        ariaLabel={rotulo}
        tipo="time"
        valor={valor}
        onSalvar={onSalvar}
        className={cn(
          "-ml-1.5 mt-0.5 text-[40px] font-semibold leading-none tabular-nums tracking-tight text-ink-primary sm:text-5xl print:text-black",
          alinharDireita && "sm:text-right"
        )}
      />
      <p className="mt-1.5 text-[11px] text-ink-muted print:text-black/60">{hint}</p>
    </div>
  );
}

function Separador() {
  return (
    <span className="text-ink-muted/50 print:text-black/30" aria-hidden>
      ·
    </span>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rounded-lg border border-dashed border-base-700 px-4 py-5 text-center text-xs text-ink-muted print:border-black/20 print:text-black/55">
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
