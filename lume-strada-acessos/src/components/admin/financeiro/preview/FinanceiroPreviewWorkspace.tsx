"use client";

import { useState } from "react";
import type { TransacaoPreview } from "@/lib/utils/financeiro-preview-mock";
import { TRANSACOES_PREVIEW } from "@/lib/utils/financeiro-preview-mock";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { DashboardPreview } from "@/components/admin/financeiro/preview/DashboardPreview";
import { ContasPreview } from "@/components/admin/financeiro/preview/ContasPreview";
import { TransacoesPreview } from "@/components/admin/financeiro/preview/TransacoesPreview";
import { NovaTransacaoModal } from "@/components/admin/financeiro/preview/NovaTransacaoModal";
import { IconBarChart2, IconPlus, IconWallet, IconArrowRightLeft } from "@/components/ui/icons";

type Aba = "dashboard" | "contas" | "transacoes";

const ABAS: { chave: Aba; label: string; icon: typeof IconBarChart2 }[] = [
  { chave: "dashboard", label: "Dashboard", icon: IconBarChart2 },
  { chave: "contas", label: "Contas", icon: IconWallet },
  { chave: "transacoes", label: "Transações", icon: IconArrowRightLeft },
];

/**
 * Preview visual do novo Financeiro (inspirado no Mobills, Design System
 * "Futurista Minimalista" — dark mode absoluto). TODOS os dados aqui são
 * MOCKADOS (`financeiro-preview-mock.ts`) só pra validar layout e o
 * agrupamento por data antes de integrar com o Supabase — ver
 * `src/app/admin/financeiro/novo/page.tsx`. A página real
 * (`/admin/financeiro`) e seu backend (`financeiro/actions.ts`) continuam
 * intocados; nenhuma escrita acontece aqui, só estado local em memória.
 */
export function FinanceiroPreviewWorkspace() {
  const [aba, setAba] = useState<Aba>("dashboard");
  const [referencia, setReferencia] = useState(() => new Date(Date.UTC(2026, 7, 1))); // Agosto/2026
  const [transacoes, setTransacoes] = useState<TransacaoPreview[]>(TRANSACOES_PREVIEW);
  const [modalAberto, setModalAberto] = useState(false);
  const [contaPadraoModal, setContaPadraoModal] = useState<string | undefined>(undefined);

  function abrirModal(contaId?: string) {
    setContaPadraoModal(contaId);
    setModalAberto(true);
  }

  function handleCriarTransacao(transacao: TransacaoPreview) {
    setTransacoes((atual) => [transacao, ...atual]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Financeiro</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Preview visual — dados fictícios, ainda não conectado ao banco de dados.</p>
        </div>
        <Button onClick={() => abrirModal()}>
          <IconPlus className="h-4 w-4" /> Nova Transação
        </Button>
      </div>

      <div className="flex gap-1.5 rounded-xl border border-base-800 bg-base-900/50 p-1.5">
        {ABAS.map(({ chave, label, icon: Icon }) => (
          <button
            key={chave}
            onClick={() => setAba(chave)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition",
              aba === chave ? "bg-accent text-base-950" : "text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {aba === "dashboard" && <DashboardPreview transacoes={transacoes} referencia={referencia} onMudarReferencia={setReferencia} />}
      {aba === "contas" && <ContasPreview onAdicionarDespesa={(contaId) => abrirModal(contaId)} />}
      {aba === "transacoes" && (
        <TransacoesPreview transacoes={transacoes} referencia={referencia} onMudarReferencia={setReferencia} />
      )}

      {modalAberto && (
        <NovaTransacaoModal contaPadraoId={contaPadraoModal} onClose={() => setModalAberto(false)} onCriar={handleCriarTransacao} />
      )}
    </div>
  );
}
