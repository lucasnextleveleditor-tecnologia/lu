"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { DatePicker } from "@/components/ui/DatePicker";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtDataCurta } from "@/lib/utils/format";
import { IconCheck, IconPlus, IconX, IconBell, IconAlertTriangle } from "@/components/ui/icons";
import {
  DURACOES_DO_CICLO,
  JA_EXISTE_ATIVO,
  diasAte,
  estaVencendo,
  fimDoCiclo,
  proximoAviso,
  type CamposDoPlano,
  type DuracaoDoCiclo,
  type PlanoRow,
  type StatusDoPlano,
} from "@/lib/types/planejamento";
import { excluirPlano, mudarStatusDoPlano, salvarPlano } from "@/app/admin/planejamento/actions";

/**
 * O ciclo de planejamento de um cliente, em três blocos numa página só.
 *
 * Não é um wizard como o onboarding, e a diferença é proposital: o briefing
 * tem quarenta campos e é preenchido em cima da hora, com o cliente na linha;
 * o plano tem doze e sai de uma reunião de planejamento onde tudo já foi
 * decidido. Quebrar doze campos em cinco telas transformaria "passar a limpo
 * o que a gente combinou" em cinco cliques de navegação.
 *
 * Por isso também o salvamento é UM só, no fim, e não por etapa: aqui não há
 * o risco de perder meia hora de digitação.
 */
export function FormularioDoPlano({ plano }: { plano: PlanoRow }) {
  const { dict, moeda } = useLocale();
  const t = dict.planejamento;

  const [campos, setCampos] = useState<CamposDoPlano>(() => paraFormulario(plano));
  const [status, setStatus] = useState<StatusDoPlano>(plano.status);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);

  function mudar<K extends keyof CamposDoPlano>(chave: K, valor: CamposDoPlano[K]) {
    setCampos((prev) => ({ ...prev, [chave]: valor }));
    setSalvo(false);
  }

  /**
   * O fim mostrado na tela é uma PREVISÃO, refeita a cada tecla.
   *
   * A data que vale é a coluna gerada do banco — é dela que o Cron lê. Mas
   * esperar o "salvar" para a pessoa descobrir que o ciclo termina no dia 27
   * e não no dia 30 seria esconder dela justamente a informação que ela está
   * tentando decidir.
   */
  const fimPrevisto = campos.data_inicio ? fimDoCiclo(campos.data_inicio, campos.duracao_meses) : "";
  const dias = fimPrevisto ? diasAte(fimPrevisto) : 0;
  const proximo = proximoAviso(dias);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    const r = await salvarPlano(plano.id, campos);
    setSalvando(false);
    if (!r.ok) {
      setErro(amigavel(r.error, t.erroTabelaAusente, t.jaExisteAtivo));
      return;
    }
    setSalvo(true);
  }

  /**
   * Trocar de estado salva o formulário antes.
   *
   * Clicar em "ativar ciclo" com a data de início alterada e não salva
   * ativaria o ciclo com a data ANTIGA — e as datas são exatamente o que
   * decide quando o aviso vai tocar.
   */
  async function trocarStatus(novo: StatusDoPlano) {
    setSalvando(true);
    setErro(null);
    const salvamento = await salvarPlano(plano.id, campos);
    if (!salvamento.ok) {
      setSalvando(false);
      setErro(amigavel(salvamento.error, t.erroTabelaAusente, t.jaExisteAtivo));
      return;
    }
    const r = await mudarStatusDoPlano(plano.id, novo);
    setSalvando(false);
    if (!r.ok) {
      setErro(amigavel(r.error, t.erroTabelaAusente, t.jaExisteAtivo));
      return;
    }
    setStatus(r.row.status);
    setSalvo(true);
  }

  async function excluir() {
    setSalvando(true);
    setErro(null);
    const r = await excluirPlano(plano.id);
    setSalvando(false);
    if (!r.ok) {
      setErro(amigavel(r.error, t.erroTabelaAusente, t.jaExisteAtivo));
      return;
    }
    window.location.href = "/admin?aba=planejamento";
  }

  const rotuloStatus: Record<StatusDoPlano, string> = {
    rascunho: t.statusRascunho,
    ativo: t.statusAtivo,
    encerrado: t.statusEncerrado,
    cancelado: t.statusCancelado,
  };

  const podeExcluir = status === "rascunho" || status === "cancelado";

  return (
    <div>
      {/* Faixa de estado — o que este ciclo é agora, e o que dá para fazer
          com ele. Fica acima do formulário porque é a primeira pergunta de
          quem abre a página ("esse plano está valendo?"). */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-base-700 bg-base-900/40 p-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
            status === "ativo"
              ? "border-status-good/50 bg-status-good/10 text-status-good"
              : status === "rascunho"
                ? "border-base-600 text-ink-muted"
                : "border-base-600 text-ink-muted"
          )}
        >
          {status === "ativo" && <IconCheck className="h-3 w-3" />}
          {rotuloStatus[status]}
        </span>

        {status === "ativo" && fimPrevisto && (
          <span
            className={cn(
              "text-xs tabular-nums",
              dias <= 5 ? "text-danger" : estaVencendo(dias) ? "text-status-warning" : "text-ink-muted"
            )}
          >
            {dias < 0
              ? t.venceu
              : dias === 0
                ? t.venceHoje
                : substituir(dias === 1 ? t.faltamDias.um : t.faltamDias.muitos, { n: dias })}
          </span>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {status !== "ativo" && (
            <Button variant={status === "rascunho" ? "primary" : "ghost"} onClick={() => trocarStatus("ativo")} disabled={salvando}>
              {t.ativarCiclo}
            </Button>
          )}
          {status === "ativo" && (
            <Button variant="ghost" onClick={() => trocarStatus("encerrado")} disabled={salvando}>
              {t.encerrarCiclo}
            </Button>
          )}
          {(status === "rascunho" || status === "ativo") && (
            <Button variant="ghost" onClick={() => trocarStatus("cancelado")} disabled={salvando}>
              {t.cancelarCiclo}
            </Button>
          )}
          {podeExcluir &&
            // Confirmação em dois cliques, no próprio botão, em vez do
            // `confirm()` do navegador: o texto do aviso precisa estar nos
            // três idiomas, e a caixa nativa não aceita nada do dicionário.
            (confirmandoExcluir ? (
              <Button variant="danger" onClick={excluir} disabled={salvando}>
                <IconAlertTriangle className="h-3.5 w-3.5" />
                {t.confirmarExcluir}
              </Button>
            ) : (
              <Button variant="danger" onClick={() => setConfirmandoExcluir(true)} disabled={salvando}>
                {t.excluir}
              </Button>
            ))}
        </div>
      </div>

      {/* A régua de avisos, dita em palavras. O sino tocando sem que ninguém
          soubesse que ele ia tocar é o tipo de automação que assusta em vez
          de ajudar. */}
      <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-base-700 bg-base-900/40 p-4">
        <IconBell className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.reguaTitulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t.reguaTexto}</p>
          {status === "ativo" && (
            <p className="mt-1.5 text-xs text-ink-secondary">
              {proximo === null ? t.semMaisAvisos : substituir(t.proximoAviso, { n: proximo })}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <Bloco titulo={t.blocoResumo} descricao={t.blocoResumoDescricao}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo={t.duracao}>
              <Select
                value={String(campos.duracao_meses)}
                onChange={(e) => mudar("duracao_meses", Number(e.target.value) as DuracaoDoCiclo)}
              >
                {DURACOES_DO_CICLO.map((n) => (
                  <option key={n} value={n}>
                    {substituir(n === 1 ? t.duracaoMeses.um : t.duracaoMeses.muitos, { n })}
                  </option>
                ))}
              </Select>
            </Campo>

            <Campo rotulo={t.dataInicio}>
              <DatePicker value={campos.data_inicio} onChange={(iso) => mudar("data_inicio", iso)} />
            </Campo>

            <Campo rotulo={t.dataFim} dica={t.dataFimDica}>
              <p className="rounded-lg border border-base-700 bg-base-950/60 px-3 py-2 text-sm tabular-nums text-ink-secondary">
                {fimPrevisto ? fmtDataCurta(fimPrevisto) : "—"}
              </p>
            </Campo>

            <Campo rotulo={`${t.orcamentoMidia} (${moeda})`}>
              <CurrencyInput
                value={campos.orcamento_midia_total ?? 0}
                onChange={(v) => mudar("orcamento_midia_total", v === 0 ? null : v)}
                prefixo={prefixoDaMoeda(moeda)}
              />
            </Campo>
          </div>

          <Campo rotulo={t.focoEstrategico}>
            <Textarea
              rows={3}
              value={campos.foco_estrategico ?? ""}
              placeholder={t.focoEstrategicoPlaceholder}
              onChange={(e) => mudar("foco_estrategico", e.target.value)}
            />
          </Campo>
        </Bloco>

        <Bloco titulo={t.blocoEscopo} descricao={t.blocoEscopoDescricao}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo={t.postsSocial}>
              <Input
                type="number"
                min={0}
                step="1"
                inputMode="numeric"
                value={campos.qtd_posts_social}
                onChange={(e) => mudar("qtd_posts_social", inteiro(e.target.value))}
              />
            </Campo>
            <Campo rotulo={t.campanhasTrafego}>
              <Input
                type="number"
                min={0}
                step="1"
                inputMode="numeric"
                value={campos.qtd_campanhas_trafego}
                onChange={(e) => mudar("qtd_campanhas_trafego", inteiro(e.target.value))}
              />
            </Campo>
          </div>

          <Campo rotulo={t.pecasExtras}>
            <ListaDeTexto
              itens={campos.pecas_extras}
              onChange={(v) => mudar("pecas_extras", v)}
              placeholder={t.pecasExtrasPlaceholder}
              rotuloAdicionar={t.adicionar}
            />
          </Campo>

          <Campo rotulo={t.escopoObservacoes}>
            <Textarea
              rows={3}
              value={campos.escopo_observacoes ?? ""}
              placeholder={t.escopoObservacoesPlaceholder}
              onChange={(e) => mudar("escopo_observacoes", e.target.value)}
            />
          </Campo>
        </Bloco>

        <Bloco titulo={t.blocoCronograma} descricao={t.blocoCronogramaDescricao}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo={t.dataLimitePautas}>
              <DatePicker
                value={campos.data_limite_pautas ?? ""}
                onChange={(iso) => mudar("data_limite_pautas", iso || null)}
                clearable
              />
            </Campo>
            <Campo rotulo={t.dataLimiteArtes}>
              <DatePicker
                value={campos.data_limite_artes ?? ""}
                onChange={(iso) => mudar("data_limite_artes", iso || null)}
                clearable
              />
            </Campo>
            <Campo rotulo={t.dataGoLive}>
              <DatePicker
                value={campos.data_go_live ?? ""}
                onChange={(iso) => mudar("data_go_live", iso || null)}
                clearable
              />
            </Campo>
            <Campo rotulo={t.dataReuniaoResultados}>
              <DatePicker
                value={campos.data_reuniao_resultados ?? ""}
                onChange={(iso) => mudar("data_reuniao_resultados", iso || null)}
                clearable
              />
            </Campo>
          </div>
        </Bloco>
      </div>

      {erro && <p className="mt-4 text-xs text-danger">{erro}</p>}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={salvar} disabled={salvando}>
          {salvando ? t.salvando : t.salvar}
        </Button>
        {salvo && !salvando && (
          <span className="inline-flex items-center gap-1 text-xs text-status-good">
            <IconCheck className="h-3.5 w-3.5" />
            {t.salvoAgora}
          </span>
        )}
      </div>
    </div>
  );
}

function Bloco({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-base-700 bg-base-900/40 p-5">
      <h2 className="text-base font-semibold tracking-tight text-ink-primary">{titulo}</h2>
      <p className="mt-0.5 text-xs text-ink-muted">{descricao}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{rotulo}</label>
      {children}
      {dica && <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">{dica}</p>}
    </div>
  );
}

/** Lista de textos curtos. Enter adiciona e o campo continua focado. */
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
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {itens.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded-lg border border-base-600 px-2 py-1 text-xs text-ink-secondary"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(itens.filter((x) => x !== item))}
                className="text-ink-muted transition hover:text-danger"
                aria-label={item}
              >
                <IconX className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function amigavel(erro: string, tabelaAusente: string, jaExisteAtivo: string): string {
  if (erro === JA_EXISTE_ATIVO) return jaExisteAtivo;
  if (/schema cache|does not exist|PGRST205/i.test(erro)) return tabelaAusente;
  return erro;
}

/** Campo de quantidade vazio é zero — "nenhum post" e "não informado" são a mesma coisa aqui. */
function inteiro(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function prefixoDaMoeda(moeda: string): string {
  return moeda === "USD" ? "US$" : moeda === "EUR" ? "€" : "R$";
}

function paraFormulario(row: PlanoRow): CamposDoPlano {
  return {
    duracao_meses: row.duracao_meses,
    data_inicio: row.data_inicio,
    foco_estrategico: row.foco_estrategico,
    orcamento_midia_total: row.orcamento_midia_total,
    qtd_posts_social: row.qtd_posts_social,
    qtd_campanhas_trafego: row.qtd_campanhas_trafego,
    pecas_extras: row.pecas_extras ?? [],
    escopo_observacoes: row.escopo_observacoes,
    data_limite_pautas: row.data_limite_pautas,
    data_limite_artes: row.data_limite_artes,
    data_go_live: row.data_go_live,
    data_reuniao_resultados: row.data_reuniao_resultados,
  };
}
