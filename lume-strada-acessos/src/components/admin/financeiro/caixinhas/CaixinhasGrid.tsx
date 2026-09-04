"use client";

import { useState } from "react";
import type { CaixinhaComSaldo, ContaComSaldo } from "@/lib/types/financeiro";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/ui/icons";
import { CaixinhaCard } from "@/components/admin/financeiro/caixinhas/CaixinhaCard";
import { NovaCaixinhaModal } from "@/components/admin/financeiro/caixinhas/NovaCaixinhaModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CaixinhasGridProps {
  caixinhas: CaixinhaComSaldo[];
  contas: ContaComSaldo[];
}

export function CaixinhasGrid({ caixinhas }: CaixinhasGridProps) {
  const { dict } = useLocale();
  const t = dict.financeiro.caixinhas;
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setModalAberto(true)}>
          <IconPlus className="h-4 w-4" />
          {t.novaCaixinhaBtn}
        </Button>
      </div>

      {caixinhas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 bg-base-950/40 p-10 text-center">
          <p className="text-sm font-medium text-ink-primary">{t.listaVaziaTitulo}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">{t.listaVaziaDescricao}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caixinhas.map((caixinha) => (
            <CaixinhaCard key={caixinha.id} caixinha={caixinha} />
          ))}
        </div>
      )}

      {modalAberto && <NovaCaixinhaModal onClose={() => setModalAberto(false)} />}
    </div>
  );
}
