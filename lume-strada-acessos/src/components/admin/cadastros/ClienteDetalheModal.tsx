"use client";

import { useState } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { ProfileRow } from "@/lib/types/database";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { AcessoStatusControls } from "@/components/admin/cadastros/AcessoStatusControls";
import { AtividadesManager } from "@/components/admin/cadastros/AtividadesManager";
import { GerarAcessoClienteModal } from "@/components/admin/cadastros/GerarAcessoClienteModal";
import { IconKey } from "@/components/ui/icons";

interface ClienteDetalheModalProps {
  cliente: ClienteRow;
  profile: ProfileRow | null;
  souAdmin: boolean;
  onClose: () => void;
}

/** Painel de detalhe de um cliente: cadastro (resumo), acesso ao portal, e o checklist de Atividades & Tarefas — as 3 coisas que o cadastro de um cliente precisa reunir num lugar só. */
export function ClienteDetalheModal({ cliente, profile, souAdmin, onClose }: ClienteDetalheModalProps) {
  const { dict } = useLocale();
  const [modalAcessoAberto, setModalAcessoAberto] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">{cliente.nome}</h3>
            <p className="mt-0.5 text-xs text-ink-muted">{cliente.documento || dict.cadastros.semDocumentoCadastrado}</p>
          </div>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-base-800 bg-base-950/40 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">{dict.cadastros.emailContatoLabel}</p>
            <p className="text-sm text-ink-primary">{cliente.email || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">{dict.cadastros.telefoneWhatsappLabel}</p>
            <p className="text-sm text-ink-primary">{cliente.telefone || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">{dict.cadastros.responsavelLabel}</p>
            <p className="text-sm text-ink-primary">{cliente.nome_responsavel || "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">{dict.cadastros.enderecoDetalheLabel}</p>
            <p className="text-sm text-ink-primary">{cliente.endereco || "—"}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-ink-primary">{dict.cadastros.acessoDashboardClienteTitulo}</h4>
          {profile ? (
            <AcessoStatusControls profile={profile} editavel={souAdmin} />
          ) : (
            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-dashed border-base-700 p-4">
              <p className="text-xs text-ink-muted">{dict.cadastros.semAcessoDashboardClienteTexto}</p>
              {souAdmin && (
                <Button onClick={() => setModalAcessoAberto(true)} className="gap-1.5 px-3.5 py-2 text-xs">
                  <IconKey className="h-3.5 w-3.5" /> {dict.cadastros.gerarAcesso}
                </Button>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink-primary">{dict.cadastros.atividadesTarefasTitulo}</h4>
          <AtividadesManager clienteId={cliente.id} />
        </div>
      </div>

      {modalAcessoAberto && <GerarAcessoClienteModal cliente={cliente} onClose={() => setModalAcessoAberto(false)} />}
    </div>
  );
}
