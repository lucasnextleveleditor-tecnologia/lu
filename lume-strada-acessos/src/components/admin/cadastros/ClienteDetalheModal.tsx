"use client";

import Link from "next/link";

import { useState } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { ProfileRow } from "@/lib/types/database";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { AcessoStatusControls } from "@/components/admin/cadastros/AcessoStatusControls";
import { AtividadesManager } from "@/components/admin/cadastros/AtividadesManager";
import { ContratosDoCliente } from "@/components/admin/cadastros/ContratosDoCliente";
import { GerarAcessoClienteModal } from "@/components/admin/cadastros/GerarAcessoClienteModal";
import { urlPublicaPortal } from "@/lib/utils/portal";
import { IconClipboardList, IconChevronRight } from "@/components/ui/icons";
import { IconKey, IconCopy, IconPencil } from "@/components/ui/icons";

interface ClienteDetalheModalProps {
  cliente: ClienteRow;
  profile: ProfileRow | null;
  souAdmin: boolean;
  onClose: () => void;
  /** Abre o formulário de cadastro deste cliente. Quem controla os dois modais é o `ClientesManager`. */
  onEditar: () => void;
}

/**
 * A ficha do cliente: cadastro completo, acesso ao painel dele, contratos e o
 * checklist de atividades — as quatro coisas que se procura quando se abre um
 * cliente.
 *
 * O cadastro aqui é SÓ LEITURA, com um botão que abre o formulário. A
 * alternativa (campos editáveis direto na ficha) foi descartada: esta tela é
 * consultada muito mais vezes do que editada, e um formulário sempre aberto
 * convida a trocar o CNPJ sem querer numa tela que a pessoa abriu só para
 * conferir o telefone.
 */
export function ClienteDetalheModal({ cliente, profile, souAdmin, onClose, onEditar }: ClienteDetalheModalProps) {
  const { dict } = useLocale();
  const t = dict.cadastros;
  const [modalAcessoAberto, setModalAcessoAberto] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  async function handleCopiarLinkPortal() {
    await navigator.clipboard.writeText(urlPublicaPortal(cliente.portal_token, typeof window !== "undefined" ? window.location.origin : undefined));
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{cliente.nome}</h3>
            {/* Razão social logo abaixo do nome de exibição, quando são
                diferentes: é ela que vai no contrato, e conferir isso é metade
                do motivo de alguém abrir esta ficha. */}
            {cliente.razao_social?.trim() && cliente.razao_social.trim() !== cliente.nome && (
              <p className="mt-0.5 truncate text-xs text-ink-secondary">{cliente.razao_social}</p>
            )}
            <p className="mt-0.5 text-xs text-ink-muted">{cliente.documento || t.semDocumentoCadastrado}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {souAdmin && (
              <Button variant="ghost" onClick={onEditar} className="gap-1.5 px-3 py-1.5 text-xs">
                <IconPencil className="h-3.5 w-3.5" />
                {t.editarCadastro}
              </Button>
            )}
            <Button variant="ghost" onClick={handleCopiarLinkPortal} className="gap-1.5 px-3 py-1.5 text-xs">
              <IconCopy className="h-3.5 w-3.5" />
              {linkCopiado ? dict.portal.linkCopiadoMsg : dict.portal.copiarLinkPortalBtn}
            </Button>
            <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
              ×
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-base-800 bg-base-950/40 p-4 sm:grid-cols-2">
          <Campo rotulo={t.emailContatoLabel} valor={cliente.email} />
          <Campo rotulo={t.telefoneWhatsappLabel} valor={cliente.telefone} />
          <Campo rotulo={t.responsavelLabel} valor={cliente.nome_responsavel} />
          <Campo rotulo={t.inscricaoEstadualLabel} valor={cliente.inscricao_estadual} />
          <Campo rotulo={t.inscricaoMunicipalLabel} valor={cliente.inscricao_municipal} />

          {/* O endereço numa linha só, como o contrato vai imprimi-lo — é a
              coluna composta pelo banco a partir dos campos separados. Mostrar
              sete campos aqui daria sete linhas para uma informação que se lê
              de uma vez. */}
          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-ink-muted">{t.enderecoDetalheLabel}</p>
            <p className="text-sm text-ink-primary">{cliente.endereco || t.semEnderecoCadastrado}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-ink-primary">{t.acessoDashboardClienteTitulo}</h4>
          {profile ? (
            <AcessoStatusControls profile={profile} editavel={souAdmin} />
          ) : (
            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-dashed border-base-700 p-4">
              <p className="text-xs text-ink-muted">{t.semAcessoDashboardClienteTexto}</p>
              {souAdmin && (
                <Button onClick={() => setModalAcessoAberto(true)} className="gap-1.5 px-3.5 py-2 text-xs">
                  <IconKey className="h-3.5 w-3.5" /> {t.gerarAcesso}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* O contrato fica ENTRE o acesso e as atividades de propósito: as
            duas coisas de cima são "quem é e o que ele pode ver", e as de
            baixo são o dia a dia. O contrato é o que liga uma coisa à outra. */}
        <div className="mb-6">
          <ContratosDoCliente clienteId={cliente.id} editavel={souAdmin} />
        </div>

        {/* Ponte para o briefing. A ficha do cliente é onde a pessoa está
            quando lembra que precisa consultar o tom de voz ou a meta — e o
            briefing vive noutra tela. Sem este atalho, ela sai daqui, volta
            pra lista, troca de aba e procura o cliente de novo. */}
        <Link
          href={`/admin/onboarding/${cliente.id}`}
          className="flex items-center gap-2 rounded-lg border border-base-700 bg-base-900/60 px-3 py-2.5 text-xs text-ink-secondary transition hover:border-base-600 hover:text-ink-primary"
        >
          <IconClipboardList className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="flex-1">{dict.onboarding.abaOnboarding}</span>
          <IconChevronRight className="h-3.5 w-3.5 text-ink-muted" />
        </Link>

        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold text-ink-primary">{t.atividadesTarefasTitulo}</h4>
          <AtividadesManager clienteId={cliente.id} />
        </div>
      </div>

      {modalAcessoAberto && <GerarAcessoClienteModal cliente={cliente} onClose={() => setModalAcessoAberto(false)} />}
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{rotulo}</p>
      <p className="text-sm text-ink-primary">{valor?.trim() || "—"}</p>
    </div>
  );
}
