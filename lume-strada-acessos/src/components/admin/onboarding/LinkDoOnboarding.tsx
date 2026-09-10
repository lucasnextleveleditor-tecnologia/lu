"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconCopy, IconCheck, IconMessageCircle, IconExternalLink } from "@/components/ui/icons";
import { analisarNumero, montarLinkWhatsapp } from "@/lib/ferramentas/whatsapp";
import { desativarLinkOnboarding, enviarLinkOnboarding } from "@/app/admin/onboarding/actions";

/**
 * O link para o cliente responder o briefing ele mesmo.
 *
 * O endereço é montado no NAVEGADOR, a partir de `window.location.origin`.
 * Parece detalhe e não é: montar no servidor exigiria uma variável de
 * ambiente com a URL do site, que fatalmente ficaria errada em algum
 * ambiente — o preview da Vercel, o domínio próprio depois de trocado, o
 * localhost de quem está testando. O navegador sempre sabe onde ele está.
 *
 * O botão de WhatsApp reaproveita o gerador que já existe em Ferramentas
 * (`lib/ferramentas/whatsapp.ts`), com o número do aprovador que o próprio
 * briefing guarda. É o pedaço mais "conectado" do módulo: um campo da etapa
 * 5 vira o caminho de envio da etapa 1.
 */
export function LinkDoOnboarding({
  clienteId,
  clienteNome,
  token,
  linkEnviadoEm,
  whatsappAprovador,
  respondidoPorNome,
  respondidoEm,
}: {
  clienteId: string;
  clienteNome: string;
  token: string | null;
  linkEnviadoEm: string | null;
  whatsappAprovador: string | null;
  respondidoPorNome: string | null;
  respondidoEm: string | null;
}) {
  const { dict, locale } = useLocale();
  const t = dict.onboarding;

  const [tokenAtivo, setTokenAtivo] = useState(linkEnviadoEm ? token : null);
  const [dias, setDias] = useState("30");
  const [ocupado, setOcupado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [origem, setOrigem] = useState("");

  useEffect(() => setOrigem(window.location.origin), []);
  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(id);
  }, [copiado]);

  const url = tokenAtivo && origem ? `${origem}/onboarding/${tokenAtivo}` : "";

  const linkWhatsapp = (() => {
    if (!url || !whatsappAprovador) return null;
    const numero = analisarNumero("", whatsappAprovador);
    if (!numero.valido) return null;
    return montarLinkWhatsapp(
      numero.digitos,
      `${clienteNome}: ${substituir(t.linkExplicacao, {}).split(".")[0]}.\n${url}`
    );
  })();

  async function gerar() {
    setOcupado(true);
    setErro(null);
    const r = await enviarLinkOnboarding(clienteId, dias === "" ? null : Number(dias));
    setOcupado(false);
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setTokenAtivo(r.token);
  }

  async function desativar() {
    setOcupado(true);
    setErro(null);
    const r = await desativarLinkOnboarding(clienteId);
    setOcupado(false);
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setTokenAtivo(null);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      const campo = document.getElementById("link-onboarding") as HTMLInputElement | null;
      campo?.select();
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-base-700 bg-base-900/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.linkTitulo}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t.linkExplicacao}</p>

      {respondidoPorNome && respondidoEm && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-status-good/40 bg-status-good/10 px-3 py-2 text-[11px] text-ink-secondary">
          <IconCheck className="h-3.5 w-3.5 shrink-0 text-status-good" />
          {substituir(t.respondidoPor, {
            nome: respondidoPorNome,
            data: new Date(respondidoEm).toLocaleDateString(locale),
          })}
        </p>
      )}

      {!tokenAtivo ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-secondary">{t.linkValidade}</label>
            <Select value={dias} onChange={(e) => setDias(e.target.value)} className="w-36">
              <option value="30">{t.dias30}</option>
              <option value="60">{t.dias60}</option>
              <option value="">{t.semPrazo}</option>
            </Select>
          </div>
          <Button onClick={gerar} disabled={ocupado}>
            {ocupado ? t.gerando : t.gerarLink}
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="link-onboarding"
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-base-700 bg-base-950 px-3 py-2 font-mono text-[11px] text-ink-primary outline-none"
            />
            <Button onClick={copiar} className={cn("shrink-0", copiado && "pointer-events-none")}>
              {copiado ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
              {copiado ? t.linkCopiado : t.copiarLink}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {linkWhatsapp && (
              <a
                href={linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              >
                <IconMessageCircle className="h-3.5 w-3.5" />
                {t.enviarPorWhatsapp}
              </a>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              <IconExternalLink className="h-3.5 w-3.5" />
              {t.abrir}
            </a>
            <button
              type="button"
              onClick={desativar}
              disabled={ocupado}
              className="ml-auto text-[11px] text-ink-muted underline transition hover:text-danger"
            >
              {t.desativarLink}
            </button>
          </div>

          {linkEnviadoEm && (
            <p className="text-[11px] text-ink-muted">
              {substituir(t.linkEnviadoEm, { data: new Date(linkEnviadoEm).toLocaleDateString(locale) })}
            </p>
          )}
        </div>
      )}

      {erro && <p className="mt-2 text-[11px] text-danger">{erro}</p>}
    </div>
  );
}
