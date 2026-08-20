"use client";

import { useState } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import { GerarAcessoClienteModal } from "@/components/admin/cadastros/GerarAcessoClienteModal";
import { IconKey } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Atalho pra liberar acesso (login/portal) de um cliente já cadastrado
 * direto do modal de Nova/Detalhe Tarefa — o dropdown "Cliente" de Produção
 * já lista TODOS os cadastros de `clientes` (com ou sem login, ver
 * `resolverVinculoCliente` em `app/admin/producao/actions.ts`), então isso
 * aqui não é mais pré-requisito pra selecionar o cliente na tarefa; serve só
 * pra quem quer que ESSE cliente específico passe a enxergar o próprio
 * dashboard (Tráfego, Aprovações, Boletos), sem sair de Produção pra ir em
 * Cadastros → Clientes. Mesma ação de lá (cria login com senha provisória).
 * `z-[60]` de propósito — mesmo padrão de `GerenciarTiposServicoModal`.
 */
export function GerenciarClientesAcessoModal({ clientes, onClose }: { clientes: ClienteRow[]; onClose: () => void }) {
  const { dict } = useLocale();
  const [clienteGerandoAcesso, setClienteGerandoAcesso] = useState<ClienteRow | null>(null);
  const pendentes = clientes.filter((c) => !c.profile_id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.producao.clientesPendentesTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-muted">{dict.producao.clientesPendentesAjuda}</p>

        {pendentes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
            {dict.producao.clientesPendentesVazio}
          </p>
        ) : (
          <div className="space-y-1.5">
            {pendentes.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-base-800 bg-base-950/40 px-3 py-2">
                <span className="truncate text-sm text-ink-primary" title={c.nome}>
                  {c.nome}
                </span>
                <button
                  type="button"
                  onClick={() => setClienteGerandoAcesso(c)}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-base-700 px-2 py-1 text-[11px] font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                >
                  <IconKey className="h-3 w-3" />
                  {dict.cadastros.gerarAcesso}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {clienteGerandoAcesso && <GerarAcessoClienteModal cliente={clienteGerandoAcesso} onClose={() => setClienteGerandoAcesso(null)} />}
    </div>
  );
}
