"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MOEDAS, ORDEM_MOEDAS, formatarMoeda, type Moeda } from "@/lib/types/moeda";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { definirMoedaEIdioma } from "@/app/admin/configuracoes/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IconGlobe, IconCheck } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

/**
 * A moeda e o idioma da conta — só para quem é admin.
 *
 * São duas coisas de naturezas diferentes, e o cartão diz isso na cara:
 *
 * - **Moeda** é da EMPRESA. É a unidade em que o faturamento é medido, então
 *   vale para o time inteiro. Ninguém escolhe a sua.
 * - **Idioma** é só o ponto de partida. Cada pessoa continua trocando a
 *   língua no canto da tela quando quiser, e a escolha dela vence sobre este
 *   padrão — que serve para quem nunca escolheu, e para a primeira vez de
 *   cada um.
 *
 * Trocar a moeda NÃO converte nada do que já foi lançado: a cotação de cada
 * dia era outra, e reescrever o histórico falsificaria o passado. O aviso
 * está no cartão porque é a primeira dúvida de quem clica.
 */
export function MoedaEIdiomaCard({ moedaAtual, idiomaAtual }: { moedaAtual: Moeda; idiomaAtual: Locale }) {
  const { dict, locale } = useLocale();
  const t = dict.configuracoes;
  const router = useRouter();

  const [moeda, setMoeda] = useState<Moeda>(moedaAtual);
  const [idioma, setIdioma] = useState<Locale>(idiomaAtual);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, iniciar] = useTransition();

  const mudou = moeda !== moedaAtual || idioma !== idiomaAtual;

  function salvar() {
    setErro(null);
    setSalvo(false);
    iniciar(async () => {
      const r = await definirMoedaEIdioma(moeda, idioma);
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      setSalvo(true);
      router.refresh();
    });
  }

  return (
    <Card>
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        <IconGlobe className="h-3.5 w-3.5" /> {t.moedaIdiomaTitulo}
      </p>
      <p className="mb-4 text-xs text-ink-muted">{t.moedaIdiomaDescricao}</p>

      {/* ---------------------------------------------------------------- */}
      {/* MOEDA                                                             */}
      {/* ---------------------------------------------------------------- */}
      <p className="mb-2 text-xs font-medium text-ink-secondary">{t.moedaLabel}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ORDEM_MOEDAS.map((chave) => {
          const info = MOEDAS[chave];
          const escolhida = moeda === chave;
          return (
            <button
              key={chave}
              type="button"
              onClick={() => setMoeda(chave)}
              aria-pressed={escolhida}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                escolhida ? "border-accent/50 bg-accent/[0.08]" : "border-base-700 hover:border-base-600"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                  escolhida ? "bg-accent/15 text-accent" : "bg-base-850 text-ink-secondary"
                )}
              >
                {info.simbolo}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-primary">
                  {info.rotulo} <span className="text-ink-muted">({chave})</span>
                </span>
                {/* O exemplo é o próprio número formatado no idioma de quem
                    está lendo: é mais rápido de conferir do que qualquer
                    explicação de separador decimal. */}
                <span className="block truncate text-xs text-ink-muted">
                  {formatarMoeda(1234.5, chave, locale)} · {info.onde}
                </span>
              </span>
              {escolhida && <IconCheck className="h-4 w-4 shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-ink-muted">{t.moedaAviso}</p>

      {/* ---------------------------------------------------------------- */}
      {/* IDIOMA PADRÃO                                                     */}
      {/* ---------------------------------------------------------------- */}
      <p className="mb-2 mt-5 text-xs font-medium text-ink-secondary">{t.idiomaPadraoLabel}</p>
      <div className="flex flex-wrap gap-2">
        {LOCALES.map((chave) => (
          <button
            key={chave}
            type="button"
            onClick={() => setIdioma(chave)}
            aria-pressed={idioma === chave}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              idioma === chave
                ? "border-accent/50 bg-accent/[0.08] text-accent"
                : "border-base-700 text-ink-secondary hover:border-base-600 hover:text-ink-primary"
            )}
          >
            {LOCALE_LABELS[chave]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-ink-muted">{t.idiomaPadraoAviso}</p>

      {erro && <p className="mt-3 text-xs text-danger">{erro}</p>}
      {salvo && !mudou && <p className="mt-3 text-xs text-status-good">{t.moedaIdiomaSalvo}</p>}

      <div className="mt-4">
        <Button disabled={!mudou || salvando} onClick={salvar}>
          {salvando ? dict.common.salvando : dict.common.salvar}
        </Button>
      </div>
    </Card>
  );
}
