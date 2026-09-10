"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  IconUpload,
  IconDownload,
  IconAlertTriangle,
  IconCheckCircle,
  IconFilm,
  IconFileText,
  IconImage,
  IconX,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  AVISO_DE_PESO,
  LIMITES_DE_ENTRADA,
  MB,
  alvosSugeridos,
  detectarTipo,
  fmtBytes,
  substituir,
  type AoProgredir,
  type ProgressoCompressao,
  type ResultadoCompressao,
  type TipoDeArquivo,
} from "@/lib/ferramentas/comprimir/nucleo";
import type { EstrategiaPdf } from "@/lib/ferramentas/comprimir/pdf";

const ICONE_DO_TIPO = { video: IconFilm, pdf: IconFileText, imagem: IconImage } as const;

/**
 * Compressor de arquivos — tudo roda aqui no navegador de quem está usando.
 *
 * As três estratégias (`video.ts`, `pdf.ts`, `imagem.ts`) entram por
 * `import()` dinâmico, nunca no topo do arquivo: juntas elas puxam o pdf.js e
 * o cliente do ffmpeg, e não há razão pra quem só abriu Ferramentas pra ver a
 * vitrine pagar esse download. Cada uma só é baixada quando o arquivo que a
 * pessoa escolheu é daquele tipo.
 *
 * Nenhuma das três importa o dicionário: elas recebem `c.motor` como
 * argumento (ver `TextosDoCompressor` em `nucleo.ts`). Assim o texto de cada
 * etapa e de cada aviso sai traduzido sem que os módulos de cálculo saibam
 * que existe i18n — e o `tsc` garante que nenhuma frase nova escape.
 *
 * A tela é deliberadamente linear — escolher arquivo, escolher tamanho,
 * comprimir, baixar — porque o processo pode levar minutos e uma interface com
 * várias coisas acontecendo ao mesmo tempo deixa a pessoa sem saber se pode
 * fechar a aba. (Não pode: é a aba dela que está fazendo a conta.)
 */
export function CompressorDeArquivos() {
  const { dict, locale } = useLocale();
  const c = dict.ferramentas.comprimir;

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoDeArquivo | null>(null);
  const [alvo, setAlvo] = useState<number | null>(null);
  const [alvoDigitado, setAlvoDigitado] = useState("");
  const [estrategiaPdf, setEstrategiaPdf] = useState<EstrategiaPdf>("preservar-texto");

  const [trabalhando, setTrabalhando] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoCompressao | null>(null);
  const [resultado, setResultado] = useState<ResultadoCompressao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const urlDoResultado = useRef<string | null>(null);

  const tam = useCallback((bytes: number) => fmtBytes(bytes, locale), [locale]);
  const rotulo = (t: TipoDeArquivo | null) =>
    t === "video" ? c.rotuloVideo : t === "pdf" ? c.rotuloPdf : t === "imagem" ? c.rotuloImagem : c.rotuloDesconhecido;

  // Revoga o endereço temporário do arquivo pronto quando ele é substituído
  // ou quando a pessoa sai da tela — um blob de 100 MB segurado por um URL
  // esquecido fica na memória até a aba fechar.
  useEffect(() => {
    return () => {
      if (urlDoResultado.current) URL.revokeObjectURL(urlDoResultado.current);
    };
  }, []);

  const escolher = useCallback(
    (file: File | null) => {
      if (urlDoResultado.current) {
        URL.revokeObjectURL(urlDoResultado.current);
        urlDoResultado.current = null;
      }
      setResultado(null);
      setErro(null);
      setProgresso(null);
      setAlvoDigitado("");

      if (!file) {
        setArquivo(null);
        setTipo(null);
        setAlvo(null);
        return;
      }

      const t = detectarTipo(file);
      setArquivo(file);
      setTipo(t);
      if (!t) {
        setAlvo(null);
        setErro(c.tipoDesconhecido);
        return;
      }
      if (file.size > LIMITES_DE_ENTRADA[t]) {
        setAlvo(null);
        setErro(
          substituir(c.acimaDoLimite, {
            tamanho: fmtBytes(file.size, locale),
            limite: fmtBytes(LIMITES_DE_ENTRADA[t], locale),
          })
        );
        return;
      }
      // Pré-seleciona um alvo razoável: o maior dos sugeridos, que é o de
      // menor perda. Assim quem só quer "diminuir um pouco" já pode clicar em
      // Comprimir sem escolher nada.
      const sugeridos = alvosSugeridos(t, file.size);
      setAlvo(sugeridos[sugeridos.length - 1] ?? null);
    },
    [c, locale]
  );

  async function comprimir() {
    if (!arquivo || !tipo || !alvo) return;
    setTrabalhando(true);
    setErro(null);
    setResultado(null);
    setProgresso({ etapa: c.comprimindo, porcentagem: 0 });

    const aoProgredir: AoProgredir = (p) => setProgresso(p);

    try {
      let r: ResultadoCompressao;
      if (tipo === "video") {
        const { comprimirVideo } = await import("@/lib/ferramentas/comprimir/video");
        r = await comprimirVideo(arquivo, alvo, c.motor, aoProgredir);
      } else if (tipo === "pdf") {
        const { comprimirPdf } = await import("@/lib/ferramentas/comprimir/pdf");
        r = await comprimirPdf(arquivo, alvo, estrategiaPdf, c.motor, aoProgredir);
      } else {
        const { comprimirImagem } = await import("@/lib/ferramentas/comprimir/imagem");
        r = await comprimirImagem(arquivo, alvo, c.motor, aoProgredir);
      }
      if (urlDoResultado.current) URL.revokeObjectURL(urlDoResultado.current);
      urlDoResultado.current = URL.createObjectURL(r.blob);
      setResultado(r);
      setProgresso(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : c.motor.erroImagemGenerico);
      setProgresso(null);
    } finally {
      setTrabalhando(false);
    }
  }

  function aplicarAlvoDigitado(texto: string) {
    setAlvoDigitado(texto);
    const n = Number(texto.replace(",", "."));
    if (Number.isFinite(n) && n > 0) setAlvo(Math.round(n * MB));
  }

  const sugeridos = arquivo && tipo ? alvosSugeridos(tipo, arquivo.size) : [];
  const pesado = arquivo && tipo ? arquivo.size > AVISO_DE_PESO[tipo] : false;
  const Icone = tipo ? ICONE_DO_TIPO[tipo] : IconUpload;
  const economia =
    resultado && resultado.bytesAntes > 0
      ? Math.max(0, Math.round((1 - resultado.bytesDepois / resultado.bytesAntes) * 100))
      : 0;

  return (
    <div className="space-y-5">
      {/* 1 — o arquivo */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!trabalhando) setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          if (!trabalhando) escolher(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "rounded-2xl border border-dashed p-6 text-center transition",
          arrastando ? "border-accent bg-accent/5" : "border-base-700 bg-base-900/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="video/*,image/*,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            e.target.value = "";
            escolher(f);
          }}
        />

        {!arquivo ? (
          <>
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-ink-muted">
              <IconUpload className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-secondary">{c.arrasteAqui}</p>
            <Button variant="ghost" className="mt-3" onClick={() => inputRef.current?.click()}>
              {c.escolherArquivo}
            </Button>
            <p className="mt-3 text-[11px] text-ink-muted">{c.limitesAceitos}</p>
          </>
        ) : (
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
              <Icone className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-primary">{arquivo.name}</p>
              <p className="text-xs text-ink-muted">
                {rotulo(tipo)} · {tam(arquivo.size)}
              </p>
            </div>
            {!trabalhando && (
              <button
                type="button"
                onClick={() => escolher(null)}
                className="shrink-0 rounded-lg p-1.5 text-ink-muted transition hover:text-ink-primary"
                aria-label={c.trocarArquivo}
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {erro && (
        <p className="flex items-start gap-2 rounded-xl border border-status-critical/40 bg-status-critical/10 p-3 text-xs leading-relaxed text-ink-secondary">
          <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-critical" />
          {erro}
        </p>
      )}

      {pesado && !erro && (
        <p className="flex items-start gap-2 rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs leading-relaxed text-ink-secondary">
          <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-warning" />
          {c.avisoArquivoPesado}
        </p>
      )}

      {/* 2 — o tamanho final */}
      {arquivo && tipo && !erro && (
        <div className="rounded-2xl border border-base-700 bg-base-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{c.tamanhoFinal}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sugeridos.map((s) => (
              <button
                key={s}
                type="button"
                disabled={trabalhando}
                onClick={() => {
                  setAlvo(s);
                  setAlvoDigitado("");
                }}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-40",
                  alvo === s && !alvoDigitado
                    ? "border-accent bg-accent/10 text-ink-primary"
                    : "border-base-700 text-ink-secondary hover:border-base-600"
                )}
              >
                {tam(s)}
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0.05}
                step={0.5}
                inputMode="decimal"
                value={alvoDigitado}
                disabled={trabalhando}
                onChange={(e) => aplicarAlvoDigitado(e.target.value)}
                placeholder={c.outroTamanho}
                className="w-20 rounded-lg border border-base-700 bg-base-950 px-2.5 py-1.5 text-xs text-ink-primary outline-none transition placeholder:text-ink-muted focus:border-accent disabled:opacity-40"
              />
              <span className="text-xs text-ink-muted">{c.unidadeMb}</span>
            </div>
          </div>

          {tipo === "pdf" && (
            <div className="mt-4 space-y-2 border-t border-base-800 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{c.comoReduzir}</p>
              <OpcaoPdf
                escolhida={estrategiaPdf === "preservar-texto"}
                desabilitada={trabalhando}
                onClick={() => setEstrategiaPdf("preservar-texto")}
                titulo={c.preservarTitulo}
                descricao={c.preservarDescricao}
              />
              <OpcaoPdf
                escolhida={estrategiaPdf === "rasterizar"}
                desabilitada={trabalhando}
                onClick={() => setEstrategiaPdf("rasterizar")}
                titulo={c.rasterizarTitulo}
                descricao={c.rasterizarDescricao}
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={comprimir} disabled={trabalhando || !alvo}>
              {trabalhando ? c.comprimindo : c.botaoComprimir}
            </Button>
            <p className="text-[11px] leading-relaxed text-ink-muted">{c.naoSaiDoComputador}</p>
          </div>
        </div>
      )}

      {/* 3 — andamento */}
      {progresso && (
        <div className="rounded-2xl border border-base-700 bg-base-900/40 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-secondary">{progresso.etapa}</p>
            {progresso.porcentagem !== null && (
              <span className="shrink-0 text-xs tabular-nums text-ink-muted">{progresso.porcentagem}%</span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-800">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-[width]",
                progresso.porcentagem === null && "animate-pulse"
              )}
              style={{ width: progresso.porcentagem === null ? "100%" : `${progresso.porcentagem}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">{c.naoFecheAba}</p>
        </div>
      )}

      {/* 4 — pronto */}
      {resultado && (
        <div className="rounded-2xl border border-base-700 bg-base-900/40 p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-status-good/40 bg-status-good/10 text-status-good">
              <IconCheckCircle className="h-4 w-4" />
            </span>
            <div className="flex items-baseline gap-2 text-sm">
              <span className="text-ink-muted line-through">{tam(resultado.bytesAntes)}</span>
              <span className="text-ink-muted">→</span>
              <span className="text-lg font-semibold text-ink-primary">{tam(resultado.bytesDepois)}</span>
              {economia > 0 && <span className="text-xs font-medium text-status-good">−{economia}%</span>}
            </div>
            <a
              href={urlDoResultado.current ?? "#"}
              download={resultado.nome}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
            >
              <IconDownload className="h-4 w-4" />
              {c.baixar}
            </a>
          </div>
          <p className="mt-2 truncate text-xs text-ink-muted">{resultado.nome}</p>
          {resultado.aviso && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs leading-relaxed text-ink-secondary">
              <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-warning" />
              {resultado.aviso}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OpcaoPdf({
  escolhida,
  desabilitada,
  onClick,
  titulo,
  descricao,
}: {
  escolhida: boolean;
  desabilitada: boolean;
  onClick: () => void;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitada}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition disabled:opacity-40",
        escolhida ? "border-accent bg-accent/5" : "border-base-700 hover:border-base-600"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          escolhida ? "border-accent" : "border-base-600"
        )}
      >
        {escolhida && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink-primary">{titulo}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-muted">{descricao}</span>
      </span>
    </button>
  );
}
