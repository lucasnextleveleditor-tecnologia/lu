"use client";

import { useState, useTransition } from "react";
import type { CartaoComLimite, ContaComSaldo } from "@/lib/types/financeiro";
import { removerCartao } from "@/app/admin/financeiro/actions";
import { fmtBRL, fmtPercent } from "@/lib/utils/format";
import { toneLimiteCartao } from "@/lib/utils/financeiro";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { IconCreditCard } from "@/components/ui/icons";
import { NovoCartaoModal } from "@/components/admin/financeiro/NovoCartaoModal";
import { PagarFaturaModal } from "@/components/admin/financeiro/PagarFaturaModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CartoesCardProps {
  cartoes: CartaoComLimite[];
  contas: ContaComSaldo[];
  referencia: Date;
}

export function CartoesCard({ cartoes, contas, referencia }: CartoesCardProps) {
  const { dict } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [cartaoFatura, setCartaoFatura] = useState<CartaoComLimite | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerCartao(id);
      if (!result.ok) setError(result.error);
      setConfirmando(null);
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconCreditCard className="h-4 w-4 text-ink-muted" />
          <h2 className="text-sm font-semibold">{dict.financeiro.cartoesCreditoTitulo}</h2>
        </div>
        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setModalAberto(true)}>
          {dict.financeiro.btnNovoCartao}
        </Button>
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      {cartoes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
          {dict.financeiro.cartoesVazio}
        </p>
      ) : (
        <div className="space-y-3">
          {cartoes.map((cartao) => {
            const pct = cartao.limite > 0 ? cartao.limite_consumido / cartao.limite : 0;
            const tone = toneLimiteCartao(cartao.limite_consumido, cartao.limite);
            return (
              <div key={cartao.id} className="rounded-lg border border-base-700 bg-base-950/40 px-3 py-2.5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-primary">{cartao.nome}</p>
                    <p className="text-xs text-ink-muted">
                      {dict.financeiro.fechaDiaVenceDia
                        .replace("{fechamento}", String(cartao.dia_fechamento))
                        .replace("{vencimento}", String(cartao.dia_vencimento))}
                    </p>
                  </div>
                  {confirmando === cartao.id ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => handleExcluir(cartao.id)}
                        disabled={pending}
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        {dict.common.sim}
                      </button>
                      <button onClick={() => setConfirmando(null)} disabled={pending} className="text-xs text-ink-muted hover:text-ink-primary">
                        {dict.common.nao}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmando(cartao.id)}
                      className="shrink-0 text-ink-muted transition hover:text-danger"
                      aria-label={dict.financeiro.excluirCartaoAria}
                      title={dict.financeiro.excluirCartaoTitle}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
                  <span>
                    {dict.financeiro.usadoLabel} <span className="font-medium text-ink-primary">{fmtBRL(cartao.limite_consumido)}</span>{" "}
                    {dict.financeiro.deLabel} {fmtBRL(cartao.limite)}
                  </span>
                  <span className="font-medium text-ink-primary">{fmtPercent(pct)}</span>
                </div>
                <Meter pct={pct} tone={tone} />

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs text-ink-secondary">
                    {dict.financeiro.disponivelLabel} <span className="font-medium text-ink-primary">{fmtBRL(cartao.limite_disponivel)}</span>
                  </span>
                  <Button
                    variant="ghost"
                    className="px-2.5 py-1 text-xs"
                    onClick={() => setCartaoFatura(cartao)}
                    disabled={cartao.limite_consumido <= 0}
                  >
                    {dict.financeiro.pagarFaturaBtn}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && <NovoCartaoModal onClose={() => setModalAberto(false)} />}
      {cartaoFatura && (
        <PagarFaturaModal cartao={cartaoFatura} contas={contas} referencia={referencia} onClose={() => setCartaoFatura(null)} />
      )}
    </Card>
  );
}
