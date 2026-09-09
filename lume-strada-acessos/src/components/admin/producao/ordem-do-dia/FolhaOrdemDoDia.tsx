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

      {/* ---------------------------------------------------------------- */}
      {/* A FOLHA                                                           */}
      {/* ---------------------------------------------------------------- */}
      <article className="folha-ordem-dia rounded-2xl border border-base-700 bg-base-900/70 p-6 backdrop-blur-sm sm:p-10 print:rounded-none print:border-0 print:bg-white print:p-0">
        {/* Cabeçalho: logo e nome da agência de um lado, a identificação do
            documento do outro. A régua embaixo usa a cor da marca da própria
            agência — é o que faz a folha ser DELA e não do sistema. */}
        <header className="border-b border-base-700 pb-6 print:border-black/20">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <BrandingLogo logoUrl={logoUrl} sizeClassName="h-10" />
              <div>
                <p className="text-sm font-semibold tracking-tight text-ink-primary print:text-black">{nomeApp}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-accent print:text-black">{t.documento}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.diaria}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1 text-2xl font-semibold tabular-nums text-ink-primary print:text-black">
                <CampoInline
                  ariaLabel={t.diariaNumeroLabel}
                  tipo="number"
                  valor={String(cabecalho.diariaNumero)}
                  onSalvar={(v) => salvarCampoCabecalho({ diariaNumero: Number(v) || 1 })}
                  className="w-12 text-right"
                />
                <span className="text-base font-normal text-ink-muted print:text-black/60">{t.de}</span>
                <CampoInline
                  ariaLabel={t.diariaTotalLabel}
                  tipo="number"
                  valor={String(cabecalho.diariaTotal)}
                  onSalvar={(v) => salvarCampoCabecalho({ diariaTotal: Number(v) || 1 })}
                  className="w-12"
                />
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.projetoLabel}</p>
              <CampoInline
                ariaLabel={t.projetoLabel}
                valor={cabecalho.projeto}
                placeholder="—"
                onSalvar={(v) => salvarCampoCabecalho({ projeto: v })}
                className="text-lg font-semibold text-ink-primary print:text-black"
              />
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.clienteLabel}</p>
              {/* Na tela é um seletor; no papel vira só o nome. */}
              <Select
                value={cabecalho.clienteId ?? ""}
                onChange={(e) => salvarCampoCabecalho({ clienteId: e.target.value || null })}
                className="print:hidden"
              >
                <option value="">{t.semCliente}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
              <p className="hidden text-sm text-black print:block">{dados.clienteNome ?? "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.dataLabel}</p>
              <CampoInline
                ariaLabel={t.dataLabel}
                tipo="date"
                valor={cabecalho.data ?? ""}
                onSalvar={(v) => salvarCampoCabecalho({ data: v || null })}
                className="text-sm text-ink-primary print:hidden"
              />
              {dataExtenso && <p className="hidden text-sm font-medium text-black print:block">{dataExtenso}</p>}
              {dataExtenso && <p className="mt-1 text-xs text-ink-muted print:hidden">{dataExtenso}</p>}
            </div>
          </div>
        </header>

        {/* Horários âncora — os dois números que a equipe procura primeiro. */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              { chave: "crewCall" as const, rotulo: t.chamadaLabel, hint: t.chamadaHint },
              { chave: "wrap" as const, rotulo: t.encerramentoLabel, hint: t.encerramentoHint },
            ]
          ).map((campo) => (
            <div
              key={campo.chave}
              className="rounded-xl border border-base-700 bg-base-950/40 px-5 py-4 print:rounded-none print:border print:border-black/20 print:bg-transparent"
            >
              <p className="text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{campo.rotulo}</p>
              <CampoInline
                ariaLabel={campo.rotulo}
                tipo="time"
                valor={cabecalho[campo.chave] ?? ""}
                onSalvar={(v) => salvarCampoCabecalho({ [campo.chave]: v || null } as Partial<CabecalhoInput>)}
                className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-ink-primary print:text-black"
              />
              <p className="mt-1 text-[11px] text-ink-muted print:text-black/60">{campo.hint}</p>
            </div>
          ))}
        </div>

        {/* Clima e luz — a faixa fina. Impresso, é o que decide se leva capa
            de chuva e quanto tempo de luz natural sobra. */}
        <div className="mt-4 rounded-xl border border-base-700 bg-base-950/40 px-5 py-4 print:rounded-none print:border print:border-black/20 print:bg-transparent">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-muted print:text-black/60">{t.climaTitulo}</p>
            <Button
              variant="ghost"
              className="px-2.5 py-1 text-xs print:hidden"
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
              {buscandoClima ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : null}
              {buscandoClima ? t.climaBuscando : t.climaBuscar}
            </Button>
          </div>

          {ordem.clima_resumo ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-2">
              <p className="text-lg font-medium text-ink-primary print:text-black">
                {ordem.clima_resumo}
                <span className="ml-3 tabular-nums text-ink-secondary print:text-black/70">
                  {ordem.clima_max}° / {ordem.clima_min}°
                </span>
                {ordem.clima_chuva_mm != null && ordem.clima_chuva_mm > 0 && (
                  <span className="ml-3 text-sm text-ink-secondary print:text-black/70">
                    {t.climaChuva} {ordem.clima_chuva_mm} mm
                  </span>
                )}
              </p>
              <p className="flex items-center gap-2 text-sm text-ink-secondary print:text-black/70">
                <IconSun className="h-4 w-4" /> {t.nascerDoSol} <span className="tabular-nums">{semSegundos(ordem.nascer_do_sol)}</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-ink-secondary print:text-black/70">
                <IconMoon className="h-4 w-4" /> {t.porDoSol} <span className="tabular-nums">{semSegundos(ordem.por_do_sol)}</span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-muted print:text-black/60">{t.climaVazio}</p>
          )}
        </div>

        <div className="mt-9 space-y-9">
          {/* ---------------------------- LOCAÇÕES ---------------------------- */}
          <BlocoFolha
            titulo={t.locacoesTitulo}
            acao={
              <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => comAcao(() => adicionarLinha("locacoes", ordem.id))}>
                <IconPlus className="h-3.5 w-3.5" /> {t.adicionarLocacao}
              </Button>
            }
          >
            {locacoes.length === 0 ? (
              <p className="text-sm text-ink-muted print:text-black/60">{t.locacoesVazio}</p>
            ) : (
              <ul className="space-y-3">
                {locacoes.map((loc, i) => (
                  <li
                    key={loc.id}
                    className="flex gap-4 rounded-xl border border-base-800 p-4 print:rounded-none print:border-0 print:border-b print:border-black/10 print:p-0 print:pb-3"
                  >
                    <span className="mt-1 shrink-0 rounded-md bg-accent/15 px-2 py-1 text-[11px] font-semibold tabular-nums tracking-wider text-accent print:bg-transparent print:px-0 print:text-black">
                      LOC {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <CampoInline
                        ariaLabel={t.locacaoNome}
                        valor={loc.nome}
                        placeholder={t.locacaoNome}
                        onSalvar={(v) => comAcao(() => salvarLinha("locacoes", ordem.id, loc.id, { nome: v }))}
                        className="font-medium text-ink-primary print:text-black"
                      />
                      <CampoInline
                        ariaLabel={t.locacaoEndereco}
                        valor={loc.endereco}
                        placeholder={t.locacaoEndereco}
                        onSalvar={(v) => comAcao(() => salvarLinha("locacoes", ordem.id, loc.id, { endereco: v, latitude: null, longitude: null }))}
                        className="text-sm text-ink-secondary print:text-black/70"
                      />
                      <CampoInline
                        ariaLabel={t.locacaoNotas}
                        valor={loc.notas}
                        placeholder={t.locacaoNotas}
                        onSalvar={(v) => comAcao(() => salvarLinha("locacoes", ordem.id, loc.id, { notas: v }))}
                        className="text-xs text-ink-muted print:text-black/60"
                      />
                    </div>
                    <BotaoRemover onClick={() => comAcao(() => removerLinha("locacoes", ordem.id, loc.id))} />
                  </li>
                ))}
              </ul>
            )}
          </BlocoFolha>

          {/* --------------------------- CRONOGRAMA --------------------------- */}
          <BlocoFolha
            titulo={t.cronogramaTitulo}
            acao={
              <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => comAcao(() => adicionarLinha("cronograma", ordem.id))}>
                <IconPlus className="h-3.5 w-3.5" /> {t.adicionarLinha}
              </Button>
            }
          >
            {cronograma.length === 0 ? (
              <p className="text-sm text-ink-muted print:text-black/60">{t.cronogramaVazio}</p>
            ) : (
              <ul className="divide-y divide-base-800 print:divide-black/10">
                {cronograma.map((linha) => (
                  <li key={linha.id} className="flex items-center gap-3 py-2">
                    <CampoInline
                      ariaLabel={t.cronogramaHora}
                      tipo="time"
                      valor={semSegundos(linha.hora)}
                      onSalvar={(v) => comAcao(() => salvarLinha("cronograma", ordem.id, linha.id, { hora: v }))}
                      className="w-24 shrink-0 font-semibold tabular-nums text-accent print:text-black"
                    />
                    <CampoInline
                      ariaLabel={t.cronogramaAtividade}
                      valor={linha.atividade}
                      placeholder={t.cronogramaAtividade}
                      onSalvar={(v) => comAcao(() => salvarLinha("cronograma", ordem.id, linha.id, { atividade: v }))}
                      className="min-w-0 flex-1 text-sm text-ink-primary print:text-black"
                    />
                    <CampoInline
                      ariaLabel={t.cronogramaLocal}
                      valor={linha.local}
                      placeholder={t.cronogramaLocal}
                      onSalvar={(v) => comAcao(() => salvarLinha("cronograma", ordem.id, linha.id, { local: v }))}
                      className="w-32 shrink-0 text-xs text-ink-muted print:text-black/60"
                    />
                    <BotaoRemover onClick={() => comAcao(() => removerLinha("cronograma", ordem.id, linha.id))} />
                  </li>
                ))}
              </ul>
            )}
          </BlocoFolha>

          {/* ----------------------------- EQUIPE ----------------------------- */}
          <BlocoFolha
            titulo={t.equipeTitulo}
            acao={
              <div className="flex items-center gap-2">
                {/* Puxar do cadastro de Equipe já preenche função, nome e
                    telefone — é o mesmo dado que a agência digitou uma vez. */}
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
                <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => comAcao(() => adicionarLinha("equipe", ordem.id))}>
                  <IconPlus className="h-3.5 w-3.5" /> {t.adicionarPessoa}
                </Button>
              </div>
            }
          >
            {equipe.length === 0 ? (
              <p className="text-sm text-ink-muted print:text-black/60">{t.equipeVazio}</p>
            ) : (
              <div>
                <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_5rem_2rem] gap-3 border-b border-base-800 pb-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted print:border-black/20 print:text-black/60">
                  <span>{t.equipeFuncao}</span>
                  <span>{t.equipeNome}</span>
                  <span>{t.equipeContato}</span>
                  <span className="text-right">{t.equipeChamada}</span>
                  <span className="print:hidden" />
                </div>
                <ul className="divide-y divide-base-800 print:divide-black/10">
                  {equipe.map((pessoa) => (
                    <li
                      key={pessoa.id}
                      className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_5rem_2rem] items-center gap-3 py-2"
                    >
                      <CampoInline
                        ariaLabel={t.equipeFuncao}
                        valor={pessoa.funcao}
                        placeholder={t.equipeFuncao}
                        onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { funcao: v }))}
                        className="text-xs uppercase tracking-wide text-ink-secondary print:text-black/70"
                      />
                      <CampoInline
                        ariaLabel={t.equipeNome}
                        valor={pessoa.nome}
                        placeholder={t.equipeNome}
                        onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { nome: v }))}
                        className="text-sm font-medium text-ink-primary print:text-black"
                      />
                      <CampoInline
                        ariaLabel={t.equipeContato}
                        valor={pessoa.contato}
                        placeholder={t.equipeContato}
                        onSalvar={(v) => comAcao(() => salvarLinha("equipe", ordem.id, pessoa.id, { contato: v }))}
                        className="text-sm tabular-nums text-ink-secondary print:text-black/70"
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

          {/* --------------------------- OBSERVAÇÕES -------------------------- */}
          <BlocoFolha titulo={t.observacoesTitulo}>
            <CampoInline
              ariaLabel={t.observacoesTitulo}
              multiline
              valor={cabecalho.observacoes}
              placeholder={t.observacoesPlaceholder}
              onSalvar={(v) => salvarCampoCabecalho({ observacoes: v })}
              className="text-sm leading-relaxed text-ink-secondary print:text-black/80"
            />
          </BlocoFolha>
        </div>

        <footer className="mt-10 hidden border-t border-black/20 pt-3 text-[10px] text-black/60 print:block">
          {nomeApp} · {t.documento} · {t.rodapeImpressao}
        </footer>
      </article>
    </div>
  );
}

function BotaoRemover({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded p-1 text-ink-muted transition hover:text-danger",
        "print:hidden"
      )}
      aria-label="Remover"
    >
      <IconTrash className="h-3.5 w-3.5" />
    </button>
  );
}
