"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconDownload,
  IconAlertTriangle,
  IconMessageCircle,
} from "@/components/ui/icons";
import { DDIS, analisarNumero, montarLinkWhatsapp, type AvisoDoNumero } from "@/lib/ferramentas/whatsapp";

/**
 * Gerador de link de WhatsApp.
 *
 * Nada aqui vai ao servidor: o link é uma string montada com o que está nos
 * campos, e o QR Code é desenhado no próprio navegador pela biblioteca
 * `qrcode` (mesmo caminho já usado na proposta do cliente — nunca um serviço
 * externo de QR, que além de depender de rede alheia entrega uma imagem de
 * outro domínio).
 *
 * O botão "Gerar" existe, mas depois do primeiro clique o link passa a
 * acompanhar o que se digita. É deliberado: o botão dá o ponto de partida
 * que a pessoa espera, e a atualização ao vivo evita o vaivém de corrigir um
 * dígito e ter que clicar de novo — o erro mais comum aqui é justamente um
 * dígito trocado.
 */
export function GeradorLinkWhatsapp() {
  const { dict } = useLocale();
  const t = dict.ferramentas.linkWhatsapp;

  const [ddi, setDdi] = useState("55");
  const [numero, setNumero] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [gerado, setGerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  const analise = useMemo(() => analisarNumero(ddi, numero), [ddi, numero]);
  const link = analise.valido ? montarLinkWhatsapp(analise.digitos, mensagem) : "";
  const mostrando = gerado && analise.valido;

  // `Record<AvisoDoNumero, ...>` e não um objeto solto: acrescentar um aviso
  // novo em `whatsapp.ts` sem escrever o texto dele para aqui vira erro de
  // compilação, em vez de um alerta em branco na tela.
  const textoDoAviso: Record<AvisoDoNumero, string> = {
    ddiRepetido: t.avisoDdiRepetido,
    zeroRemovido: t.avisoZeroRemovido,
    possivelNonoDigito: t.avisoNonoDigito,
    curto: t.avisoCurto,
    longo: t.avisoLongo,
  };

  // O QR é redesenhado a cada mudança do link — inclusive da mensagem, que
  // faz parte da URL. Um QR que ficasse para trás mandaria a pessoa para a
  // conversa com o texto errado, que é pior do que não ter QR.
  useEffect(() => {
    if (!mostrando || !link) {
      setQr(null);
      return;
    }
    let cancelado = false;
    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(link, { width: 320, margin: 1 }))
      .then((url) => {
        if (!cancelado) setQr(url);
      })
      .catch(() => {
        if (!cancelado) setQr(null);
      });
    return () => {
      cancelado = true;
    };
  }, [link, mostrando]);

  // O "Copiado!" volta ao normal sozinho; o timer é limpo se a pessoa copiar
  // de novo antes de os dois segundos passarem.
  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(id);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      // Navegador sem permissão de área de transferência (ou página sem
      // HTTPS): seleciona o texto para a pessoa copiar com Ctrl+C.
      const campo = document.getElementById("link-whatsapp") as HTMLInputElement | null;
      campo?.select();
    }
  }

  function limpar() {
    setNumero("");
    setMensagem("");
    setGerado(false);
    setQr(null);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-base-700 bg-base-900/40 p-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,11rem)_1fr]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.paisLabel}</label>
            <Select value={ddi} onChange={(e) => setDdi(e.target.value)}>
              {DDIS.map((d) => (
                <option key={d.codigo} value={d.codigo}>
                  +{d.codigo} · {d.pais}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.numeroLabel}</label>
            <Input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder={t.numeroPlaceholder}
              inputMode="tel"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.mensagemLabel}</label>
          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder={t.mensagemPlaceholder}
            rows={3}
          />
          <p className="mt-1 text-[11px] text-ink-muted">{t.mensagemDica}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-muted">{t.sugestoesLabel}:</span>
            {[t.sugestao1, t.sugestao2, t.sugestao3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMensagem(s)}
                className="rounded-full border border-base-700 px-2.5 py-1 text-[11px] text-ink-secondary transition hover:border-base-600 hover:text-ink-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {analise.avisos.length > 0 && numero.trim() !== "" && (
          <div className="mt-4 space-y-1.5">
            {analise.avisos.map((a) => (
              <p
                key={a}
                className="flex items-start gap-2 rounded-lg border border-status-warning/40 bg-status-warning/10 p-2.5 text-[11px] leading-relaxed text-ink-secondary"
              >
                <IconAlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-status-warning" />
                {textoDoAviso[a]}
              </p>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => setGerado(true)} disabled={!analise.valido}>
            <IconMessageCircle className="h-4 w-4" />
            {t.gerar}
          </Button>
          {!analise.valido && <span className="text-[11px] text-ink-muted">{t.numeroInvalido}</span>}
          {(numero || mensagem) && (
            <Button variant="ghost" onClick={limpar} className="ml-auto">
              {t.limpar}
            </Button>
          )}
        </div>
      </div>

      {mostrando && (
        <div className="rounded-2xl border border-base-700 bg-base-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{t.seuLink}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              id="link-whatsapp"
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-base-700 bg-base-950 px-3 py-2 font-mono text-xs text-ink-primary outline-none"
            />
            <Button onClick={copiar} className={cn("shrink-0", copiado && "pointer-events-none")}>
              {copiado ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
              {copiado ? t.copiado : t.copiar}
            </Button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-base-600 px-4 py-2 text-sm font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              <IconExternalLink className="h-4 w-4" />
              {t.abrir}
            </a>
          </div>

          {qr && (
            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-base-800 pt-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URI gerada aqui, sem host pra otimizar */}
              <img
                src={qr}
                alt=""
                className="h-32 w-32 shrink-0 rounded-lg bg-white p-1.5"
                width={128}
                height={128}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-relaxed text-ink-muted">{t.qrLegenda}</p>
                <a
                  href={qr}
                  download="whatsapp-qr.png"
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                >
                  <IconDownload className="h-3.5 w-3.5" />
                  {t.baixarQr}
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
