"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { salvarCoresMarca } from "@/app/admin/aparencia/actions";
import {
  PRESETS_MARCA,
  accent2Derivado,
  contrasteSobre,
  ehHexValido,
  normalizarHex,
  type ChavePresetMarca,
} from "@/lib/branding/corDeMarca";
import type { ConfiguracoesDict } from "@/lib/i18n/dictionaries/pt/configuracoes";

const ROTULO_PRESET: Record<ChavePresetMarca, keyof ConfiguracoesDict> = {
  azul: "corPresetAzul",
  verde: "corPresetVerde",
  ambar: "corPresetAmbar",
  vinho: "corPresetVinho",
  violeta: "corPresetVioleta",
  grafite: "corPresetGrafite",
};

/**
 * Escolha da cor de marca da empresa. Fica no topo da aba Aparência, acima do
 * formulário grande (`AparenciaForm`), e salva por conta própria — como a cor
 * tem prévia imediata, prender o salvamento ao botão lá do fim da página faria
 * a pessoa achar que já valeu quando ainda não valeu.
 *
 * A prévia é local (um `style` inline nos três exemplos), não aplicada ao app
 * inteiro: mostrar o resultado sem ter salvado deixaria a sidebar e o resto da
 * tela num estado que some no F5. Depois de salvar, o `revalidatePath` do
 * servidor repinta tudo de verdade.
 */
export function CorDaMarcaCard({ corInicial, accent2Inicial }: { corInicial: string; accent2Inicial: string }) {
  const { dict } = useLocale();
  const t = dict.configuracoes;

  const [cor, setCor] = useState(normalizarHex(corInicial));
  const [accent2, setAccent2] = useState(normalizarHex(accent2Inicial));
  const [rascunho, setRascunho] = useState(normalizarHex(corInicial));
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [pending, startTransition] = useTransition();

  function aplicar(novaCor: string, novoAccent2: string) {
    setErro(null);
    setSalvo(false);
    setCor(novaCor);
    setAccent2(novoAccent2);
    setRascunho(novaCor);
    startTransition(async () => {
      const r = await salvarCoresMarca(novaCor, novoAccent2);
      if (r.ok) setSalvo(true);
      else setErro(r.error);
    });
  }

  function aplicarRascunho() {
    if (!ehHexValido(rascunho)) return setErro(t.corInvalida);
    const normalizada = normalizarHex(rascunho);
    aplicar(normalizada, accent2Derivado(normalizada));
  }

  const textoSobreCor = contrasteSobre(cor);

  return (
    <Card>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.corTitulo}</p>
      <p className="mb-5 text-sm text-ink-muted">{t.corDescricao}</p>

      <p className="mb-2 text-xs font-medium text-ink-secondary">{t.corPresetsLabel}</p>
      <div className="mb-6 flex flex-wrap gap-3">
        {PRESETS_MARCA.map((preset) => {
          const ativo = normalizarHex(preset.cor) === cor;
          return (
            <button
              key={preset.chave}
              type="button"
              onClick={() => aplicar(normalizarHex(preset.cor), normalizarHex(preset.accent2))}
              disabled={pending}
              className="flex w-16 flex-col items-center gap-1.5 disabled:opacity-50"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition",
                  ativo ? "ring-2 ring-ink-primary ring-offset-2 ring-offset-base-900" : "hover:brightness-110"
                )}
                style={{ background: `linear-gradient(135deg, ${preset.cor}, ${preset.accent2})` }}
              >
                {/* O check garante que a seleção não dependa só do anel —
                    quem não distingue bem as cores precisa de um segundo
                    sinal, e o rótulo de texto abaixo é o terceiro. */}
                {ativo && <IconCheck className="h-4 w-4" style={{ color: contrasteSobre(preset.cor) }} />}
              </span>
              <span className={cn("text-[11px]", ativo ? "text-ink-primary" : "text-ink-muted")}>
                {t[ROTULO_PRESET[preset.chave]]}
              </span>
            </button>
          );
        })}
      </div>

      <label htmlFor="cor-livre" className="mb-2 block text-xs font-medium text-ink-secondary">
        {t.corLivreLabel}
      </label>
      <div className="flex max-w-sm gap-2">
        <span className="h-9 w-9 shrink-0 rounded-lg border border-base-600" style={{ background: cor }} aria-hidden />
        <Input
          id="cor-livre"
          value={rascunho}
          onChange={(e) => {
            setRascunho(e.target.value);
            setErro(null);
            setSalvo(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && aplicarRascunho()}
          placeholder="#4F7CFF"
          maxLength={7}
          spellCheck={false}
        />
        <Button variant="ghost" onClick={aplicarRascunho} disabled={pending || normalizarHex(rascunho) === cor}>
          {pending ? dict.common.salvando : dict.common.salvar}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-ink-muted">{t.corLivreHint}</p>
      {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
      {salvo && !erro && <p className="mt-2 text-xs text-status-good">{t.contaSalvo}</p>}

      <div className="mt-6 border-t border-base-800 pt-5">
        <p className="mb-3 text-xs font-medium text-ink-secondary">{t.corPreviewLabel}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
            style={{ background: `linear-gradient(to right, ${cor}, ${accent2})`, color: textoSobreCor }}
          >
            {t.corPreviewBotao}
          </span>
          <span className="text-sm font-medium underline underline-offset-2" style={{ color: cor }}>
            {t.corPreviewLink}
          </span>
          <span
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-ink-primary"
            style={{ background: `${cor}1a`, boxShadow: `inset 0 0 0 1px ${cor}4d` }}
          >
            {t.corPreviewItemMenu}
          </span>
        </div>
      </div>
    </Card>
  );
}
