"use client";

import { useState, useTransition } from "react";
import type { CriativoRow } from "@/lib/types/infoprodutos";
import { alternarAtivoCriativo, removerCriativoCadastro } from "@/app/admin/trafego/infoprodutos-actions";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CriativoModal } from "@/components/admin/trafego/infoprodutos/CriativoModal";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface CriativosManagerProps {
  criativos: CriativoRow[];
  clienteCadastroId: string;
}

/**
 * Cadastro de Criativos — lista simples (sem agrupar por tipo, ao contrário
 * de `ProdutosManager.tsx`, que separa Principal/Order Bump). Cada Criativo
 * cadastrado aqui fica disponível pra vincular num lançamento de anúncio
 * (ver `AnuncioModal`), e seu `orcamento_diario` pré-preenche o Investimento
 * do Dia num anúncio NOVO (ver `CriativoRow`).
 */
export function CriativosManager({ criativos, clienteCadastroId }: CriativosManagerProps) {
  const { dict, fmtMoeda } = useLocale();
  const [modalAberto, setModalAberto] = useState(false);
  const [criativoEditando, setCriativoEditando] = useState<CriativoRow | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerCriativoCadastro(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  function handleToggleAtivo(criativo: CriativoRow) {
    setError(null);
    startTransition(async () => {
      const result = await alternarAtivoCriativo(criativo.id, !criativo.ativo);
      if (!result.ok) setError(result.error);
    });
  }

  function abrirEdicao(criativo: CriativoRow) {
    setCriativoEditando(criativo);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCriativoEditando(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{dict.trafego.criativosCadastradosContagem.replace("{count}", String(criativos.length))}</p>
        <Button onClick={() => setModalAberto(true)}>+ {dict.trafego.novoCriativoBotao}</Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Card className="overflow-x-auto p-0">
        {criativos.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-muted">{dict.trafego.nenhumCriativoCadastrado}</div>
        ) : (
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-base-800 text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-3 font-medium">{dict.trafego.criativoHeader}</th>
                <th className="px-0 py-3 font-medium">{dict.trafego.orcamentoDiarioLabel}</th>
                <th className="px-0 py-3 font-medium">{dict.common.status}</th>
                <th className="px-6 py-3 font-medium text-right">{dict.common.acoes}</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td:first-child]:pl-6 [&>tr>td:last-child]:pr-6">
              {criativos.map((criativo) => (
                <tr key={criativo.id} className="border-b border-base-800 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-ink-primary">{criativo.nome}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm text-ink-secondary">{fmtMoeda(criativo.orcamento_diario)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={criativo.ativo ? "good" : "neutral"} label={criativo.ativo ? dict.common.ativo : dict.common.inativo} />
                  </td>
                  <td className="py-3 text-right">
                    {confirmandoExclusao === criativo.id ? (
                      <div className="flex justify-end gap-2">
                        <span className="text-xs text-ink-secondary">{dict.common.confirmarExclusao}</span>
                        <button
                          onClick={() => handleExcluir(criativo.id)}
                          disabled={pending}
                          className="text-xs font-medium text-danger hover:underline"
                        >
                          {dict.common.sim}
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusao(null)}
                          disabled={pending}
                          className="text-xs text-ink-muted hover:text-ink-primary"
                        >
                          {dict.common.nao}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => handleToggleAtivo(criativo)} disabled={pending} className="px-3 py-1.5 text-xs">
                          {criativo.ativo ? dict.trafego.desativarBotao : dict.trafego.ativarBotao}
                        </Button>
                        <Button variant="ghost" onClick={() => abrirEdicao(criativo)} className="px-3 py-1.5 text-xs">
                          {dict.common.editar}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setConfirmandoExclusao(criativo.id)}
                          disabled={pending}
                          className="px-3 py-1.5 text-xs"
                        >
                          {dict.common.excluir}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modalAberto && <CriativoModal criativo={criativoEditando} clienteCadastroId={clienteCadastroId} onClose={fecharModal} />}
    </div>
  );
}
