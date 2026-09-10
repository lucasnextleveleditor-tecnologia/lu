"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  IconTrash,
  IconAlertTriangle,
  IconCheckCircle,
  IconChevronDown,
  IconChevronRight,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtBytes } from "@/lib/utils/bytes";
import { substituir } from "@/lib/utils/texto";
import {
  apagarArquivosDoAcervo,
  listarArquivosDoBackup,
  type ArquivoDoBackup,
} from "@/app/admin/armazenamento/actions";
import type { AreaParaBackup } from "./BackupDeArquivos";

/** O bucket dos documentos de assinatura — o único que ganha um alerta próprio. */
const AREA_DOS_CONTRATOS = "assinaturas";
/** Mesmo teto aceito pela action. */
const POR_LOTE = 100;

/** Chave estável de um arquivo na seleção. O espaço separa sem colidir com o caminho. */
const chaveDe = (a: { bucket: string; caminho: string }) => `${a.bucket} ${a.caminho}`;

/**
 * Apagar arquivos para liberar espaço.
 *
 * A tela é uma lista de conferência de propósito: área por área, arquivo por
 * arquivo, com tamanho à vista. "Apagar tudo de Produção" num clique só
 * seria mais rápido e muito pior — quase sempre o que se quer apagar são as
 * três versões antigas de uma entrega, não a pasta inteira.
 *
 * Três travas antes do estrago, em ordem de força:
 *   1. O aviso de que não há recuperação fica SEMPRE visível, marcado ou
 *      não. Não é consequência de nada que a pessoa fez; é como a coisa é.
 *   2. Marcar documento assinado abre um bloco próprio explicando o que se
 *      perde, com uma confirmação separada — porque é o único arquivo aqui
 *      cujo valor não é o conteúdo, e sim a prova.
 *   3. O botão não apaga: abre a confirmação, que exige digitar uma palavra.
 *      Um clique errado não pode custar o acervo.
 *
 * O Storage do Supabase não tem lixeira. Depois do `remove` não há desfazer,
 * em lugar nenhum — nem pelo painel do Supabase.
 */
export function ApagarArquivos({ areas }: { areas: AreaParaBackup[] }) {
  const { dict, locale } = useLocale();
  const t = dict.armazenamento.apagar;
  const router = useRouter();

  const [arquivos, setArquivos] = useState<ArquivoDoBackup[] | null>(null);
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(() => new Set());
  const [abertas, setAbertas] = useState<Set<string>>(() => new Set());

  const [confirmando, setConfirmando] = useState(false);
  const [palavra, setPalavra] = useState("");
  const [entendiContratos, setEntendiContratos] = useState(false);

  const [apagando, setApagando] = useState(false);
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarArquivosDoBackup().then((r) => {
      if (!ativo) return;
      if (r.ok) setArquivos(r.arquivos);
      else setErroCarregar(r.error);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Por área, do maior arquivo para o menor: quem veio aqui liberar espaço
  // quer ver primeiro o que ocupa espaço.
  const porArea = useMemo(() => {
    const mapa = new Map<string, ArquivoDoBackup[]>();
    for (const a of arquivos ?? []) {
      const lista = mapa.get(a.bucket);
      if (lista) lista.push(a);
      else mapa.set(a.bucket, [a]);
    }
    for (const lista of mapa.values()) lista.sort((x, y) => y.bytes - x.bytes);
    return mapa;
  }, [arquivos]);

  const selecionados = useMemo(
    () => (arquivos ?? []).filter((a) => marcados.has(chaveDe(a))),
    [arquivos, marcados]
  );
  const bytesSelecionados = selecionados.reduce((s, a) => s + a.bytes, 0);
  const tocaContratos = selecionados.some((a) => a.bucket === AREA_DOS_CONTRATOS);

  const palavraOk = palavra.trim().toUpperCase() === t.palavraConfirmacao.toUpperCase();
  const podeApagar = selecionados.length > 0 && (!tocaContratos || entendiContratos);

  function alternarArquivo(a: ArquivoDoBackup) {
    setMarcados((prev) => {
      const novo = new Set(prev);
      const k = chaveDe(a);
      if (novo.has(k)) novo.delete(k);
      else novo.add(k);
      return novo;
    });
  }

  function alternarArea(bucket: string, marcarTudo: boolean) {
    const lista = porArea.get(bucket) ?? [];
    setMarcados((prev) => {
      const novo = new Set(prev);
      for (const a of lista) {
        if (marcarTudo) novo.add(chaveDe(a));
        else novo.delete(chaveDe(a));
      }
      return novo;
    });
  }

  async function apagarDeVerdade() {
    setApagando(true);
    setErro(null);
    setFeito(null);
    const total = selecionados.length;
    const bytes = bytesSelecionados;

    try {
      let apagados = 0;
      const falhas: string[] = [];
      for (let i = 0; i < selecionados.length; i += POR_LOTE) {
        const lote = selecionados.slice(i, i + POR_LOTE);
        setProgresso(
          substituir(t.apagando, {
            n: Math.min(i + lote.length, total).toLocaleString(locale),
            total: total.toLocaleString(locale),
          })
        );
        const r = await apagarArquivosDoAcervo(lote.map((a) => ({ bucket: a.bucket, caminho: a.caminho })));
        if (!r.ok) throw new Error(r.error);
        apagados += r.apagados;
        falhas.push(...r.falhas);
      }

      // Some da lista o que foi apagado, em vez de recarregar tudo: a pessoa
      // continua vendo o que sobrou, na mesma posição da tela.
      const apagadosSet = new Set(selecionados.map(chaveDe));
      setArquivos((prev) => (prev ?? []).filter((a) => !apagadosSet.has(chaveDe(a))));
      setMarcados(new Set());
      setEntendiContratos(false);
      setPalavra("");
      setConfirmando(false);
      setFeito(substituir(t.concluido, { n: apagados.toLocaleString(locale), tamanho: fmtBytes(bytes, locale) }));
      if (falhas.length > 0) setErro(`${t.erroParcial} ${falhas.join(" · ")}`);
      // A barra de uso é calculada no servidor (sidebar e topo desta página).
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : t.erro);
    } finally {
      setProgresso(null);
      setApagando(false);
    }
  }

  // ------------------------------------------------------------------ tela

  if (erroCarregar) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-status-critical/40 bg-status-critical/10 p-3 text-xs leading-relaxed text-ink-secondary">
        <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-critical" />
        {erroCarregar}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-ink-muted">{t.intro}</p>

      {/* Trava 1: o fato, sempre visível. */}
      <p className="flex items-start gap-2 rounded-xl border border-status-critical/40 bg-status-critical/10 p-3 text-xs font-medium leading-relaxed text-ink-secondary">
        <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-critical" />
        {t.avisoPermanente}
      </p>

      <p className="rounded-xl border border-base-800 bg-base-950/50 p-3 text-[11px] leading-relaxed text-ink-muted">
        {t.registroContinua}
        <br />
        <span className="text-ink-secondary">{t.baixeAntes}</span>
      </p>

      {arquivos === null ? (
        <p className="py-6 text-center text-xs text-ink-muted">{t.carregando}</p>
      ) : arquivos.length === 0 ? (
        <p className="py-6 text-center text-xs text-ink-muted">{t.semArquivos}</p>
      ) : (
        <ul className="divide-y divide-base-800 rounded-xl border border-base-800">
          {areas.map((area) => {
            const lista = porArea.get(area.chave) ?? [];
            if (lista.length === 0) return null;
            const marcadosNaArea = lista.filter((a) => marcados.has(chaveDe(a))).length;
            const todos = marcadosNaArea === lista.length;
            const alguns = marcadosNaArea > 0 && !todos;
            const aberta = abertas.has(area.chave);

            return (
              <li key={area.chave}>
                <div className="flex items-center gap-3 p-3">
                  <Caixa
                    estado={todos ? "todos" : alguns ? "alguns" : "nenhum"}
                    desabilitada={apagando}
                    onClick={() => alternarArea(area.chave, !todos)}
                    rotulo={t.marcarTudo}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-primary">{area.rotulo}</p>
                    <p className="text-[11px] tabular-nums text-ink-muted">
                      {substituir(t.resumoDaArea, {
                        n: lista.length.toLocaleString(locale),
                        tamanho: fmtBytes(
                          lista.reduce((s, a) => s + a.bytes, 0),
                          locale
                        ),
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAbertas((prev) => {
                        const novo = new Set(prev);
                        if (novo.has(area.chave)) novo.delete(area.chave);
                        else novo.add(area.chave);
                        return novo;
                      })
                    }
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-ink-muted transition hover:text-ink-secondary"
                  >
                    {aberta ? (
                      <IconChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <IconChevronRight className="h-3.5 w-3.5" />
                    )}
                    {t.verArquivos}
                  </button>
                </div>

                {aberta && (
                  <ul className="max-h-72 space-y-px overflow-y-auto border-t border-base-800 bg-base-950/40 px-3 py-2">
                    {lista.map((a) => {
                      const nome = a.caminho.split("/").slice(1).join("/") || a.caminho;
                      const marcado = marcados.has(chaveDe(a));
                      return (
                        <li key={a.caminho}>
                          <button
                            type="button"
                            disabled={apagando}
                            onClick={() => alternarArquivo(a)}
                            className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-base-800/60 disabled:opacity-40"
                          >
                            <Caixa estado={marcado ? "todos" : "nenhum"} comoSpan />
                            <span className="min-w-0 flex-1 truncate text-[11px] text-ink-secondary" title={nome}>
                              {nome}
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                              {fmtBytes(a.bytes, locale)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Trava 2: contratos têm alerta próprio e confirmação separada. */}
      {tocaContratos && (
        <div className="rounded-xl border border-status-warning/50 bg-status-warning/10 p-3">
          <p className="flex items-start gap-2 text-xs font-semibold text-status-warning">
            <IconAlertTriangle className="mt-px h-4 w-4 shrink-0" />
            {t.avisoContratosTitulo}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-secondary">{t.avisoContratosTexto}</p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] leading-relaxed text-ink-secondary">
            <input
              type="checkbox"
              checked={entendiContratos}
              onChange={(e) => setEntendiContratos(e.target.checked)}
              disabled={apagando}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[rgb(var(--color-accent))]"
            />
            {t.avisoContratosCheck}
          </label>
        </div>
      )}

      {/* Trava 3: o botão abre a confirmação; quem apaga é a palavra digitada. */}
      {!confirmando ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="danger"
            disabled={!podeApagar || apagando}
            onClick={() => {
              setPalavra("");
              setConfirmando(true);
            }}
          >
            <IconTrash className="h-4 w-4" />
            {t.botaoApagar}
          </Button>
          <span className="text-[11px] tabular-nums text-ink-muted">
            {selecionados.length === 0
              ? t.nenhumSelecionado
              : substituir(t.selecionado, {
                  n: selecionados.length.toLocaleString(locale),
                  tamanho: fmtBytes(bytesSelecionados, locale),
                })}
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-status-critical/50 bg-status-critical/10 p-4">
          <p className="text-sm font-semibold text-ink-primary">{t.confirmarTitulo}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
            {substituir(t.confirmarTexto, {
              n: selecionados.length.toLocaleString(locale),
              tamanho: fmtBytes(bytesSelecionados, locale),
            })}
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">{t.avisoPermanente}</p>

          <label className="mt-3 block text-[11px] text-ink-secondary">
            {substituir(t.confirmarDigite, { palavra: t.palavraConfirmacao })}
          </label>
          <input
            value={palavra}
            onChange={(e) => setPalavra(e.target.value)}
            disabled={apagando}
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-48 rounded-lg border border-base-700 bg-base-950 px-3 py-2 text-sm tracking-widest text-ink-primary outline-none transition focus:border-status-critical disabled:opacity-40"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="danger" disabled={!palavraOk || apagando || !podeApagar} onClick={apagarDeVerdade}>
              <IconTrash className="h-4 w-4" />
              {apagando ? (progresso ?? t.confirmarBotao) : t.confirmarBotao}
            </Button>
            <Button variant="ghost" disabled={apagando} onClick={() => setConfirmando(false)}>
              {t.voltar}
            </Button>
          </div>
        </div>
      )}

      {erro && (
        <p className="flex items-start gap-2 rounded-xl border border-status-critical/40 bg-status-critical/10 p-3 text-xs leading-relaxed text-ink-secondary">
          <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-critical" />
          {erro}
        </p>
      )}

      {feito && (
        <p className="flex items-start gap-2 rounded-xl border border-status-good/40 bg-status-good/10 p-3 text-xs leading-relaxed text-ink-secondary">
          <IconCheckCircle className="mt-px h-4 w-4 shrink-0 text-status-good" />
          {feito}
        </p>
      )}
    </div>
  );
}

/**
 * A caixinha de marcar.
 *
 * Vira `<span>` quando já está DENTRO de um botão (a linha do arquivo
 * inteira é clicável): botão dentro de botão é HTML inválido, o navegador
 * desmonta a árvore por conta própria e o clique simplesmente para de
 * funcionar — sem erro nenhum no console.
 */
function Caixa({
  estado,
  desabilitada,
  onClick,
  rotulo,
  comoSpan,
}: {
  estado: "todos" | "alguns" | "nenhum";
  desabilitada?: boolean;
  onClick?: () => void;
  rotulo?: string;
  comoSpan?: boolean;
}) {
  const visual = (
    <span
      aria-hidden
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold leading-none",
        estado === "nenhum" ? "border-base-600 text-transparent" : "border-accent bg-accent text-white"
      )}
    >
      {estado === "alguns" ? "–" : estado === "todos" ? "✓" : ""}
    </span>
  );

  if (comoSpan) return visual;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitada}
      aria-label={rotulo}
      className="shrink-0 disabled:opacity-40"
    >
      {visual}
    </button>
  );
}
