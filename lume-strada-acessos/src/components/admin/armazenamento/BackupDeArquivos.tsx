"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconDownload, IconAlertTriangle, IconCheckCircle } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fmtBytes } from "@/lib/utils/bytes";
import { substituir } from "@/lib/utils/texto";
import { assinarArquivosDoBackup, listarArquivosDoBackup } from "@/app/admin/armazenamento/actions";

export interface AreaParaBackup {
  chave: string;
  rotulo: string;
  arquivos: number;
  bytes: number;
}

/** Mesmo teto do lote aceito pela action que assina os links. */
const POR_LOTE = 60;

/**
 * "Otimizar espaço": baixa o acervo inteiro num ZIP organizado por área.
 *
 * O ZIP é montado AQUI, no navegador, e por dois motivos que se somam: a
 * Vercel tem teto de corpo de resposta em função serverless, e o acervo pode
 * ter gigabytes — juntar tudo no servidor pra devolver de uma vez não
 * sobreviveria a nenhum dos dois. O servidor faz só o que só ele pode fazer
 * (listar e assinar), e cada arquivo vem do Storage do Supabase direto pra
 * máquina de quem pediu.
 *
 * Quando o navegador tem `showSaveFilePicker` (Chrome, Edge), o ZIP é
 * ESCRITO NO DISCO enquanto é montado: a memória usada é a de um arquivo por
 * vez, e 10 GB passam sem a aba sentir. Sem essa API (Safari, Firefox) só
 * resta montar em memória, então a tela avisa antes em vez de deixar a
 * pessoa descobrir travando.
 *
 * A estrutura de pastas é deliberadamente ESTÁVEL — `Área/caminho original`,
 * sem data e sem renomear nada. É o que faz a segunda cópia se encaixar por
 * cima da primeira no Drive, atualizando em vez de duplicar. Foi esse o
 * pedido: baixar de novo quando encher de novo, e organizar igual.
 */
export function BackupDeArquivos({ areas }: { areas: AreaParaBackup[] }) {
  const { dict, locale } = useLocale();
  const t = dict.armazenamento.backup;

  const [marcadas, setMarcadas] = useState<Set<string>>(() => new Set(areas.map((a) => a.chave)));
  const [trabalhando, setTrabalhando] = useState(false);
  const [etapa, setEtapa] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<string | null>(null);
  const [temPicker, setTemPicker] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  // Detecção só depois de montar: no servidor `window` não existe, e decidir
  // isso durante a renderização faria o HTML do servidor discordar do
  // cliente. Começa otimista pra que o aviso apareça, e não desapareça.
  useEffect(() => {
    setTemPicker(typeof (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker === "function");
  }, []);

  const selecionadas = areas.filter((a) => marcadas.has(a.chave));
  const bytesSelecionados = selecionadas.reduce((s, a) => s + a.bytes, 0);
  const arquivosSelecionados = selecionadas.reduce((s, a) => s + a.arquivos, 0);

  function alternar(chave: string) {
    setMarcadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  async function baixar() {
    if (selecionadas.length === 0 || trabalhando) return;
    setErro(null);
    setFeito(null);

    const hoje = new Date().toISOString().slice(0, 10);
    const nomeDoArquivo = `${substituir(t.nomeDoZip, { data: hoje })}.zip`;

    // O seletor de destino precisa do clique AINDA quente: qualquer `await`
    // antes disso gasta o gesto do usuário e o navegador recusa a chamada.
    // Por isso ele vem antes até de listar os arquivos.
    let escritor: WritableStream<Uint8Array> | null = null;
    const picker = (window as unknown as { showSaveFilePicker?: (o: unknown) => Promise<any> }).showSaveFilePicker;
    if (typeof picker === "function") {
      try {
        const handle = await picker({
          suggestedName: nomeDoArquivo,
          types: [{ description: "ZIP", accept: { "application/zip": [".zip"] } }],
        });
        escritor = await handle.createWritable();
      } catch {
        return; // fechou o seletor: não é erro, é desistência.
      }
    }

    const controlador = new AbortController();
    abortRef.current = controlador;
    setTrabalhando(true);
    setPct(0);
    setEtapa(t.etapaListando);

    try {
      const lista = await listarArquivosDoBackup();
      if (!lista.ok) throw new Error(lista.error);

      const arquivos = lista.arquivos.filter((a) => marcadas.has(a.bucket));
      if (arquivos.length === 0) throw new Error(t.nenhumArquivo);
      if (lista.truncado) setErro(t.avisoTruncado);

      const rotulos = new Map(areas.map((a) => [a.chave, a.rotulo]));
      const bytesTotais = arquivos.reduce((s, a) => s + a.bytes, 0) || 1;
      const agora = new Date();

      const leiaMe = substituir(t.leiaMeCorpo, {
        data: agora.toLocaleDateString(locale),
        pastas: selecionadas.map((a) => `- ${pasta(a.rotulo)}/  (${a.arquivos})`).join("\n"),
      });

      let baixados = 0;
      let bytesFeitos = 0;

      async function* fluxo() {
        yield { name: t.leiaMeNome, lastModified: agora, input: leiaMe };

        for (let i = 0; i < arquivos.length; i += POR_LOTE) {
          const lote = arquivos.slice(i, i + POR_LOTE);
          // Os links são assinados EM LOTE, conforme o ZIP avança, e não
          // todos de uma vez no começo: num acervo grande os primeiros já
          // teriam vencido quando chegasse a vez deles.
          const assinado = await assinarArquivosDoBackup(
            lote.map((a) => ({ bucket: a.bucket, caminho: a.caminho }))
          );
          if (!assinado.ok) throw new Error(assinado.error);

          for (let j = 0; j < lote.length; j++) {
            if (controlador.signal.aborted) return;
            const arq = lote[j]!;
            const url = assinado.urls[j];
            baixados++;
            bytesFeitos += arq.bytes;
            setPct(Math.min(99, Math.round((bytesFeitos / bytesTotais) * 100)));
            setEtapa(
              substituir(t.etapaBaixando, {
                n: baixados.toLocaleString(locale),
                total: arquivos.length.toLocaleString(locale),
                tamanho: fmtBytes(bytesFeitos, locale),
              })
            );

            // Arquivo apagado entre a listagem e o download: pula. Derrubar o
            // backup inteiro por causa de um arquivo que não existe mais
            // seria pior do que entregá-lo sem ele.
            if (!url) continue;
            const resposta = await fetch(url, { signal: controlador.signal });
            if (!resposta.ok || !resposta.body) continue;

            yield {
              name: nomeNoZip(rotulos.get(arq.bucket) ?? arq.bucket, arq.caminho),
              lastModified: new Date(arq.criadoEm),
              input: resposta,
            };
          }
        }
      }

      const { downloadZip } = await import("client-zip");
      const zip = downloadZip(fluxo());
      if (!zip.body) throw new Error(t.erroGenerico);

      if (escritor) {
        // Caminho bom: o ZIP nunca existe inteiro na memória — cada pedaço
        // vai direto pro disco assim que fica pronto.
        await zip.body.pipeTo(escritor);
      } else {
        const blob = await zip.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nomeDoArquivo;
        a.click();
        // Um `revoke` imediato cancela o download em alguns navegadores.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }

      if (controlador.signal.aborted) {
        setEtapa(null);
        setErro(t.cancelado);
      } else {
        setPct(100);
        setEtapa(null);
        setFeito(substituir(t.concluido, { tamanho: fmtBytes(bytesFeitos, locale) }));
      }
    } catch (e) {
      setEtapa(null);
      if (controlador.signal.aborted) setErro(t.cancelado);
      else setErro(e instanceof Error ? e.message : t.erroGenerico);
      try {
        await escritor?.abort();
      } catch {
        // O escritor já pode ter sido fechado pelo `pipeTo`; nada a fazer.
      }
    } finally {
      abortRef.current = null;
      setTrabalhando(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-ink-muted">{t.descricao}</p>

      <div className="rounded-xl border border-base-800 bg-base-950/50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.comoFicaTitulo}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t.comoFica}</p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.escolhaAreas}</p>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => {
            const ativa = marcadas.has(a.chave);
            return (
              <button
                key={a.chave}
                type="button"
                disabled={trabalhando}
                onClick={() => alternar(a.chave)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition disabled:opacity-40",
                  ativa
                    ? "border-accent bg-accent/10 text-ink-primary"
                    : "border-base-700 text-ink-muted hover:border-base-600"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] font-bold",
                    ativa ? "border-accent bg-accent text-white" : "border-base-600"
                  )}
                >
                  {ativa ? "✓" : ""}
                </span>
                {a.rotulo}
                <span className="tabular-nums text-ink-muted">{fmtBytes(a.bytes, locale)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!temPicker && !trabalhando && (
        <p className="flex items-start gap-2 rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-xs leading-relaxed text-ink-secondary">
          <IconAlertTriangle className="mt-px h-4 w-4 shrink-0 text-status-warning" />
          {t.avisoSemStreaming}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={baixar} disabled={trabalhando || selecionadas.length === 0}>
          <IconDownload className="h-4 w-4" />
          {selecionadas.length === 0
            ? t.botaoVazio
            : substituir(t.botao, { tamanho: fmtBytes(bytesSelecionados, locale) })}
        </Button>
        {!trabalhando && arquivosSelecionados > 0 && (
          <span className="text-[11px] tabular-nums text-ink-muted">
            {substituir(dict.armazenamento.arquivoMuitos, { n: arquivosSelecionados.toLocaleString(locale) })}
          </span>
        )}
        {trabalhando && (
          <Button variant="ghost" onClick={() => abortRef.current?.abort()}>
            {t.cancelar}
          </Button>
        )}
      </div>

      {etapa && (
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-secondary">{etapa}</p>
            <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-muted">{t.avisoNaoFeche}</p>
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
 * Um pedaço de caminho que o Windows aceita.
 *
 * `\ : * ? " < > |` são proibidos em nome de arquivo no Windows, e o ZIP vai
 * ser aberto onde a pessoa quiser. Um arquivo guardado aqui como
 * `imagem: teste?.png` extrai normalmente no Mac e simplesmente FALHA no
 * Windows — e falhar na hora de extrair um backup é o pior momento possível.
 */
function limpar(pedaco: string): string {
  return pedaco.replace(/[\\:*?"<>|]/g, "-").replace(/[. ]+$/, "").trim();
}

function pasta(rotulo: string): string {
  return limpar(rotulo.replace(/\//g, "-")) || "outros";
}

/**
 * `Área/caminho-original` — e nada além disso.
 *
 * O primeiro pedaço do caminho no Storage é o id da empresa, que não diz
 * nada a ninguém, então sai. O resto fica EXATAMENTE como está guardado, sem
 * renomear e sem carimbar data: é essa estabilidade que faz a cópia do mês
 * que vem se sobrepor à deste mês no Drive em vez de virar uma segunda
 * árvore de arquivos quase iguais.
 */
function nomeNoZip(rotuloDaArea: string, caminho: string): string {
  const partes = caminho.split("/").slice(1).map(limpar).filter(Boolean);
  const relativo = partes.join("/") || limpar(caminho.split("/").pop() ?? "arquivo") || "arquivo";
  return `${pasta(rotuloDaArea)}/${relativo}`;
}
