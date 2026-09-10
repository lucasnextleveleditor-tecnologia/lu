"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconCheck, IconAlertTriangle, IconX, IconPlus } from "@/components/ui/icons";
import {
  CANAIS_COMUNICACAO,
  OBJETIVOS_ONBOARDING,
  REDES_SOCIAIS,
  TOTAL_DE_ETAPAS,
  type CamposDoOnboarding,
  type OnboardingRow,
  type RedeSocial,
} from "@/lib/types/onboarding";
import { concluirOnboarding, reabrirOnboarding, salvarEtapaOnboarding } from "@/app/admin/onboarding/actions";

/**
 * O briefing do cliente, em cinco etapas.
 *
 * CADA ETAPA SALVA SOZINHA ao avançar, e é a decisão que define esta tela.
 * Um formulário com quarenta campos que só grava no fim perde tudo quando a
 * reunião acaba, o navegador fecha ou a pessoa é interrompida — e quem
 * preenche isso está quase sempre com o cliente na linha, ou seja, sendo
 * interrompido o tempo todo. Salvando por etapa, o pior caso é perder a
 * etapa aberta, e a pessoa reabre exatamente onde parou (`etapa_atual`).
 *
 * Todos os campos são opcionais até a hora de CONCLUIR. Obrigatoriedade em
 * cada tela faria a pessoa inventar resposta pra destravar o botão — e
 * briefing preenchido de qualquer jeito é pior que briefing vazio, porque
 * parece confiável. A conferência acontece uma vez só, no fim, e no servidor.
 *
 * Estado num objeto só (`campos`) em vez de um `useState` por campo: são
 * quarenta. O padrão da casa é um por campo (ver `ClienteModal`), e ele é
 * bom para cinco — aqui viraria uma parede de declarações.
 */
export function OnboardingWizard({
  clienteId,
  clienteNome,
  inicial,
}: {
  clienteId: string;
  clienteNome: string;
  inicial: OnboardingRow | null;
}) {
  const { dict, locale, moeda } = useLocale();
  const t = dict.onboarding;

  const [campos, setCampos] = useState<Partial<CamposDoOnboarding>>(() => paraFormulario(inicial));
  const [etapa, setEtapa] = useState(inicial?.etapa_atual ?? 1);
  const [concluidoEm, setConcluidoEm] = useState<string | null>(inicial?.concluido_em ?? null);

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [faltando, setFaltando] = useState<string[]>([]);

  function mudar<K extends keyof CamposDoOnboarding>(chave: K, valor: CamposDoOnboarding[K]) {
    setCampos((prev) => ({ ...prev, [chave]: valor }));
    setSalvo(false);
  }

  async function salvar(etapaAlvo = etapa): Promise<boolean> {
    setSalvando(true);
    setErro(null);
    const r = await salvarEtapaOnboarding(clienteId, etapaAlvo, campos);
    setSalvando(false);
    if (!r.ok) {
      setErro(r.error);
      return false;
    }
    setSalvo(true);
    return true;
  }

  async function avancar() {
    if (!(await salvar())) return;
    setEtapa((n) => Math.min(TOTAL_DE_ETAPAS, n + 1));
  }

  // Ir direto pra outra etapa salva a atual antes: clicar em "5" no topo com
  // a etapa 2 preenchida e perder o que foi digitado seria uma armadilha.
  async function irPara(destino: number) {
    if (destino === etapa) return;
    if (destino > etapa && !(await salvar())) return;
    if (destino < etapa) await salvar();
    setEtapa(destino);
  }

  async function concluir() {
    if (!(await salvar())) return;
    setSalvando(true);
    setFaltando([]);
    const r = await concluirOnboarding(clienteId);
    setSalvando(false);
    if (!r.ok) {
      if (r.faltando && r.faltando.length > 0) setFaltando(r.faltando);
      else setErro(r.error);
      return;
    }
    setConcluidoEm(r.row.concluido_em);
    setErro(null);
  }

  async function reabrir() {
    setSalvando(true);
    const r = await reabrirOnboarding(clienteId);
    setSalvando(false);
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setConcluidoEm(null);
  }

  const rotuloDoCampo: Record<string, string> = {
    oferta_principal: t.ofertaPrincipal,
    publico_alvo: t.publicoAlvo,
    objetivo_principal: t.objetivoPrincipal,
    decisor_nome: t.decisorNome,
    canal_comunicacao: t.canalComunicacao,
  };

  const etapas = [
    { n: 1, titulo: t.etapa1Titulo, descricao: t.etapa1Descricao },
    { n: 2, titulo: t.etapa2Titulo, descricao: t.etapa2Descricao },
    { n: 3, titulo: t.etapa3Titulo, descricao: t.etapa3Descricao },
    { n: 4, titulo: t.etapa4Titulo, descricao: t.etapa4Descricao },
    { n: 5, titulo: t.etapa5Titulo, descricao: t.etapa5Descricao },
  ];
  const atual = etapas[etapa - 1]!;

  return (
    <div>
      {/* Trilha das etapas — clicável, porque quem volta pra corrigir uma
          coisa não quer passar por três telas até chegar lá. */}
      <ol className="mb-6 flex items-center gap-1 overflow-x-auto">
        {etapas.map((e, i) => {
          const feita = e.n < etapa;
          const aqui = e.n === etapa;
          return (
            <li key={e.n} className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => irPara(e.n)}
                disabled={salvando}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50",
                  aqui ? "bg-base-800 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    aqui ? "border-accent bg-accent text-white" : feita ? "border-accent/50 text-accent" : "border-base-600"
                  )}
                >
                  {feita ? <IconCheck className="h-3 w-3" /> : e.n}
                </span>
                <span className="hidden sm:inline">{e.titulo}</span>
              </button>
              {i < etapas.length - 1 && <span aria-hidden className="mx-0.5 h-px w-3 bg-base-700 sm:w-5" />}
            </li>
          );
        })}
      </ol>

      {concluidoEm && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-status-good/40 bg-status-good/10 p-3 text-xs text-ink-secondary">
          <IconCheck className="h-4 w-4 shrink-0 text-status-good" />
          {substituir(t.concluidoEm, { data: new Date(concluidoEm).toLocaleDateString(locale) })}
          <button
            type="button"
            onClick={reabrir}
            disabled={salvando}
            className="ml-auto text-[11px] text-ink-muted underline transition hover:text-ink-primary"
          >
            {t.reabrir}
          </button>
        </p>
      )}

      <div className="rounded-2xl border border-base-700 bg-base-900/40 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {substituir(t.etapaDe, { n: etapa, total: TOTAL_DE_ETAPAS })}
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-ink-primary">{atual.titulo}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">{atual.descricao}</p>

        <div className="mt-5 space-y-4">
          {etapa === 1 && (
            <>
              <Campo rotulo={t.ofertaPrincipal}>
                <Textarea rows={3} value={campos.oferta_principal ?? ""} placeholder={t.ofertaPrincipalPlaceholder}
                  onChange={(e) => mudar("oferta_principal", e.target.value)} />
              </Campo>
              <Campo rotulo={`${t.ticketMedio} (${moeda})`}>
                <Input type="number" min={0} step="0.01" inputMode="decimal" value={campos.ticket_medio ?? ""}
                  onChange={(e) => mudar("ticket_medio", numero(e.target.value))} />
              </Campo>
              <Campo rotulo={t.propostaUnicaValor}>
                <Textarea rows={3} value={campos.proposta_unica_valor ?? ""} placeholder={t.propostaUnicaValorPlaceholder}
                  onChange={(e) => mudar("proposta_unica_valor", e.target.value)} />
              </Campo>
              <Campo rotulo={t.publicoAlvo}>
                <Textarea rows={3} value={campos.publico_alvo ?? ""} placeholder={t.publicoAlvoPlaceholder}
                  onChange={(e) => mudar("publico_alvo", e.target.value)} />
              </Campo>
              <Campo rotulo={t.personas}>
                <Textarea rows={3} value={campos.personas ?? ""} placeholder={t.personasPlaceholder}
                  onChange={(e) => mudar("personas", e.target.value)} />
              </Campo>
              <Campo rotulo={t.jornadaVendas}>
                <Textarea rows={3} value={campos.jornada_vendas ?? ""} placeholder={t.jornadaVendasPlaceholder}
                  onChange={(e) => mudar("jornada_vendas", e.target.value)} />
              </Campo>
              <Campo rotulo={t.concorrentes}>
                <ListaDeTexto
                  itens={campos.concorrentes ?? []}
                  onChange={(v) => mudar("concorrentes", v)}
                  placeholder={t.concorrentesPlaceholder}
                  rotuloAdicionar={t.adicionar}
                />
              </Campo>
            </>
          )}

          {etapa === 2 && (
            <>
              <Campo rotulo={t.manualMarcaUrl} dica={t.manualMarcaUrlDica}>
                <Input type="url" inputMode="url" value={campos.manual_marca_url ?? ""} placeholder="https://"
                  onChange={(e) => mudar("manual_marca_url", e.target.value)} />
              </Campo>
              <Campo rotulo={t.paletaCores} dica={t.paletaCoresDica}>
                <PaletaDeCores cores={campos.paleta_cores ?? []} onChange={(v) => mudar("paleta_cores", v)} rotuloAdicionar={t.adicionar} />
              </Campo>
              <Campo rotulo={t.tomDeVoz}>
                <Textarea rows={3} value={campos.tom_de_voz ?? ""} placeholder={t.tomDeVozPlaceholder}
                  onChange={(e) => mudar("tom_de_voz", e.target.value)} />
              </Campo>
              <Campo rotulo={t.diretrizesMarca}>
                <Textarea rows={3} value={campos.diretrizes_marca ?? ""} placeholder={t.diretrizesMarcaPlaceholder}
                  onChange={(e) => mudar("diretrizes_marca", e.target.value)} />
              </Campo>
              <Campo rotulo={t.driveAtivosUrl} dica={t.driveAtivosUrlDica}>
                <Input type="url" inputMode="url" value={campos.drive_ativos_url ?? ""} placeholder="https://"
                  onChange={(e) => mudar("drive_ativos_url", e.target.value)} />
              </Campo>
            </>
          )}

          {etapa === 3 && (
            <>
              <Campo rotulo={t.objetivoPrincipal}>
                <Select value={campos.objetivo_principal ?? ""}
                  onChange={(e) => mudar("objetivo_principal", (e.target.value || null) as CamposDoOnboarding["objetivo_principal"])}>
                  <option value="">{t.selecione}</option>
                  {OBJETIVOS_ONBOARDING.map((o) => (
                    <option key={o} value={o}>
                      {rotuloObjetivo(o, t)}
                    </option>
                  ))}
                </Select>
              </Campo>
              <Campo rotulo={t.objetivoDescricao}>
                <Input value={campos.objetivo_descricao ?? ""} placeholder={t.objetivoDescricaoPlaceholder}
                  onChange={(e) => mudar("objetivo_descricao", e.target.value)} />
              </Campo>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo={t.roasAlvo}>
                  <Input type="number" min={0} step="0.1" inputMode="decimal" value={campos.roas_alvo ?? ""}
                    onChange={(e) => mudar("roas_alvo", numero(e.target.value))} />
                </Campo>
                <Campo rotulo={`${t.cpaAlvo} (${moeda})`}>
                  <Input type="number" min={0} step="0.01" inputMode="decimal" value={campos.cpa_alvo ?? ""}
                    onChange={(e) => mudar("cpa_alvo", numero(e.target.value))} />
                </Campo>
                <Campo rotulo={t.metaLeadsMes}>
                  <Input type="number" min={0} step="1" inputMode="numeric" value={campos.meta_leads_mes ?? ""}
                    onChange={(e) => mudar("meta_leads_mes", inteiro(e.target.value))} />
                </Campo>
                <Campo rotulo={`${t.metaFaturamentoMes} (${moeda})`}>
                  <Input type="number" min={0} step="0.01" inputMode="decimal" value={campos.meta_faturamento_mes ?? ""}
                    onChange={(e) => mudar("meta_faturamento_mes", numero(e.target.value))} />
                </Campo>
              </div>
              <Campo rotulo={t.historicoMarketing}>
                <Textarea rows={4} value={campos.historico_marketing ?? ""} placeholder={t.historicoMarketingPlaceholder}
                  onChange={(e) => mudar("historico_marketing", e.target.value)} />
              </Campo>
            </>
          )}

          {etapa === 4 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo={t.metaAdsId}>
                  <Input value={campos.meta_ads_id ?? ""} onChange={(e) => mudar("meta_ads_id", e.target.value)} />
                </Campo>
                <Campo rotulo={t.googleAdsId}>
                  <Input value={campos.google_ads_id ?? ""} onChange={(e) => mudar("google_ads_id", e.target.value)} />
                </Campo>
                <Campo rotulo={t.ga4Id}>
                  <Input value={campos.ga4_id ?? ""} onChange={(e) => mudar("ga4_id", e.target.value)} />
                </Campo>
                <Campo rotulo={t.pixelId}>
                  <Input value={campos.pixel_id ?? ""} onChange={(e) => mudar("pixel_id", e.target.value)} />
                </Campo>
              </div>

              <Campo rotulo={t.redesSociais}>
                <div className="space-y-2">
                  {REDES_SOCIAIS.map((rede) => (
                    <div key={rede} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-[11px] capitalize text-ink-muted">{rede}</span>
                      <Input
                        type="url"
                        inputMode="url"
                        placeholder="https://"
                        value={(campos.redes_sociais ?? {})[rede] ?? ""}
                        onChange={(e) => mudar("redes_sociais", { ...(campos.redes_sociais ?? {}), [rede]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </Campo>

              <Campo rotulo={t.siteUrl}>
                <Input type="url" inputMode="url" value={campos.site_url ?? ""} placeholder="https://"
                  onChange={(e) => mudar("site_url", e.target.value)} />
              </Campo>
              <Campo rotulo={t.cmsUtilizado}>
                <Input value={campos.cms_utilizado ?? ""} placeholder={t.cmsUtilizadoPlaceholder}
                  onChange={(e) => mudar("cms_utilizado", e.target.value)} />
              </Campo>
              <Campo rotulo={t.cmsObservacoes}>
                <Textarea rows={2} value={campos.cms_observacoes ?? ""}
                  onChange={(e) => mudar("cms_observacoes", e.target.value)} />
                {/* O aviso fica COLADO no campo, não no topo da etapa: aviso
                    longe do campo não é lido na hora em que importa. */}
                <p className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-status-warning/40 bg-status-warning/10 p-2 text-[11px] leading-relaxed text-ink-secondary">
                  <IconAlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-status-warning" />
                  {t.cmsAviso}
                </p>
              </Campo>
              <Campo rotulo={t.crmUtilizado}>
                <Input value={campos.crm_utilizado ?? ""} placeholder={t.crmUtilizadoPlaceholder}
                  onChange={(e) => mudar("crm_utilizado", e.target.value)} />
              </Campo>
              <Campo rotulo={t.ferramentasObservacoes}>
                <Textarea rows={2} value={campos.ferramentas_observacoes ?? ""} placeholder={t.ferramentasObservacoesPlaceholder}
                  onChange={(e) => mudar("ferramentas_observacoes", e.target.value)} />
              </Campo>
            </>
          )}

          {etapa === 5 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo={t.decisorNome}>
                  <Input value={campos.decisor_nome ?? ""} onChange={(e) => mudar("decisor_nome", e.target.value)} />
                </Campo>
                <Campo rotulo={t.decisorCargo}>
                  <Input value={campos.decisor_cargo ?? ""} onChange={(e) => mudar("decisor_cargo", e.target.value)} />
                </Campo>
                <Campo rotulo={t.decisorEmail}>
                  <Input type="email" inputMode="email" value={campos.decisor_email ?? ""}
                    onChange={(e) => mudar("decisor_email", e.target.value)} />
                </Campo>
                <Campo rotulo={t.aprovadorWhatsapp} dica={t.aprovadorWhatsappDica}>
                  <Input inputMode="tel" placeholder="+55 11 99999-9999" value={campos.aprovador_whatsapp ?? ""}
                    onChange={(e) => mudar("aprovador_whatsapp", e.target.value)} />
                </Campo>
              </div>
              <Campo rotulo={t.canalComunicacao}>
                <Select value={campos.canal_comunicacao ?? ""}
                  onChange={(e) => mudar("canal_comunicacao", (e.target.value || null) as CamposDoOnboarding["canal_comunicacao"])}>
                  <option value="">{t.selecione}</option>
                  {CANAIS_COMUNICACAO.map((c) => (
                    <option key={c} value={c}>
                      {rotuloCanal(c, t)}
                    </option>
                  ))}
                </Select>
              </Campo>
              <Campo rotulo={t.observacoesOperacionais}>
                <Textarea rows={3} value={campos.observacoes_operacionais ?? ""} placeholder={t.observacoesOperacionaisPlaceholder}
                  onChange={(e) => mudar("observacoes_operacionais", e.target.value)} />
              </Campo>
            </>
          )}
        </div>

        {faltando.length > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs leading-relaxed text-ink-secondary">
            <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-warning" />
            {substituir(t.faltamCampos, {
              campos: faltando.map((c) => rotuloDoCampo[c] ?? c).join(", "),
            })}
          </p>
        )}

        {erro && (
          <p className="mt-4 rounded-xl border border-status-critical/40 bg-status-critical/10 p-3 text-xs text-ink-secondary">{erro}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-base-800 pt-4">
          <Button variant="ghost" onClick={() => irPara(etapa - 1)} disabled={etapa === 1 || salvando}>
            {t.anterior}
          </Button>

          {etapa < TOTAL_DE_ETAPAS ? (
            <Button onClick={avancar} disabled={salvando}>
              {salvando ? t.salvando : t.proximo}
            </Button>
          ) : (
            <Button onClick={concluir} disabled={salvando || Boolean(concluidoEm)}>
              {salvando ? t.concluindo : t.concluir}
            </Button>
          )}

          <Button variant="ghost" onClick={() => salvar()} disabled={salvando}>
            {salvando ? t.salvando : t.salvar}
          </Button>

          {salvo && !salvando && (
            <span className="flex items-center gap-1 text-[11px] text-status-good">
              <IconCheck className="h-3.5 w-3.5" />
              {t.salvoAgora}
            </span>
          )}

          <span className="ml-auto hidden text-[11px] text-ink-muted sm:inline">{t.rascunhoAviso}</span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-ink-muted">{clienteNome}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{rotulo}</label>
      {children}
      {dica && <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">{dica}</p>}
    </div>
  );
}

/**
 * Lista de textos curtos (concorrentes).
 *
 * Enter adiciona, e o campo continua focado — quem está listando cinco
 * concorrentes digita os cinco seguidos, sem tirar a mão do teclado.
 */
function ListaDeTexto({
  itens,
  onChange,
  placeholder,
  rotuloAdicionar,
}: {
  itens: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  rotuloAdicionar: string;
}) {
  const [texto, setTexto] = useState("");

  function adicionar() {
    const limpo = texto.trim();
    if (!limpo || itens.includes(limpo)) {
      setTexto("");
      return;
    }
    onChange([...itens, limpo]);
    setTexto("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={texto}
          placeholder={placeholder}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
        />
        <Button type="button" variant="ghost" onClick={adicionar} className="shrink-0 px-3">
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{rotuloAdicionar}</span>
        </Button>
      </div>
      {itens.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {itens.map((item) => (
            <span key={item} className="flex items-center gap-1.5 rounded-full border border-base-700 py-1 pl-3 pr-1.5 text-xs text-ink-secondary">
              {item}
              <button
                type="button"
                onClick={() => onChange(itens.filter((i) => i !== item))}
                className="rounded-full p-0.5 text-ink-muted transition hover:text-danger"
                aria-label={item}
              >
                <IconX className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Paleta de cores.
 *
 * Duas entradas para a mesma cor: o seletor nativo (para escolher no olho) e
 * o campo de texto (para colar o hex do Figma, que é como isso chega na
 * prática). A ordem das cores importa — primária, secundária, apoio — então
 * é lista, não conjunto.
 */
function PaletaDeCores({
  cores,
  onChange,
  rotuloAdicionar,
}: {
  cores: string[];
  onChange: (v: string[]) => void;
  rotuloAdicionar: string;
}) {
  function trocar(i: number, valor: string) {
    onChange(cores.map((c, idx) => (idx === i ? valor : c)));
  }

  return (
    <div className="space-y-2">
      {cores.map((cor, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(cor) ? cor : "#000000"}
            onChange={(e) => trocar(i, e.target.value)}
            className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-base-600 bg-base-900 p-1"
          />
          <Input value={cor} onChange={(e) => trocar(i, e.target.value)} placeholder="#000000" className="font-mono" />
          <button
            type="button"
            onClick={() => onChange(cores.filter((_, idx) => idx !== i))}
            className="shrink-0 rounded-lg p-1.5 text-ink-muted transition hover:text-danger"
            aria-label={cor}
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => onChange([...cores, "#000000"])} className="px-3 py-1.5 text-xs">
        <IconPlus className="h-3.5 w-3.5" />
        {rotuloAdicionar}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Campo de número vazio é `null`, não `0` — "não informado" e "zero" são coisas diferentes. */
function numero(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function inteiro(v: string): number | null {
  const n = numero(v);
  return n === null ? null : Math.round(n);
}

function paraFormulario(row: OnboardingRow | null): Partial<CamposDoOnboarding> {
  if (!row) return { concorrentes: [], paleta_cores: [], redes_sociais: {} };
  return {
    oferta_principal: row.oferta_principal,
    ticket_medio: row.ticket_medio,
    proposta_unica_valor: row.proposta_unica_valor,
    publico_alvo: row.publico_alvo,
    personas: row.personas,
    jornada_vendas: row.jornada_vendas,
    concorrentes: row.concorrentes ?? [],
    manual_marca_url: row.manual_marca_url,
    manual_marca_path: row.manual_marca_path,
    paleta_cores: row.paleta_cores ?? [],
    tom_de_voz: row.tom_de_voz,
    diretrizes_marca: row.diretrizes_marca,
    drive_ativos_url: row.drive_ativos_url,
    objetivo_principal: row.objetivo_principal,
    objetivo_descricao: row.objetivo_descricao,
    roas_alvo: row.roas_alvo,
    cpa_alvo: row.cpa_alvo,
    meta_leads_mes: row.meta_leads_mes,
    meta_faturamento_mes: row.meta_faturamento_mes,
    historico_marketing: row.historico_marketing,
    meta_ads_id: row.meta_ads_id,
    google_ads_id: row.google_ads_id,
    ga4_id: row.ga4_id,
    pixel_id: row.pixel_id,
    redes_sociais: (row.redes_sociais ?? {}) as Partial<Record<RedeSocial, string>>,
    site_url: row.site_url,
    cms_utilizado: row.cms_utilizado,
    cms_observacoes: row.cms_observacoes,
    crm_utilizado: row.crm_utilizado,
    ferramentas_observacoes: row.ferramentas_observacoes,
    decisor_nome: row.decisor_nome,
    decisor_cargo: row.decisor_cargo,
    decisor_email: row.decisor_email,
    aprovador_whatsapp: row.aprovador_whatsapp,
    canal_comunicacao: row.canal_comunicacao,
    observacoes_operacionais: row.observacoes_operacionais,
  };
}

type Rotulos = ReturnType<typeof useLocale>["dict"]["onboarding"];

function rotuloObjetivo(o: string, t: Rotulos): string {
  return o === "leads" ? t.objetivoLeads
    : o === "vendas" ? t.objetivoVendas
    : o === "branding" ? t.objetivoBranding
    : o === "comunidade" ? t.objetivoComunidade
    : t.objetivoOutro;
}

function rotuloCanal(c: string, t: Rotulos): string {
  return c === "whatsapp" ? t.canalWhatsapp
    : c === "slack" ? t.canalSlack
    : c === "email" ? t.canalEmail
    : c === "telefone" ? t.canalTelefone
    : c === "teams" ? t.canalTeams
    : c === "discord" ? t.canalDiscord
    : t.canalOutro;
}
