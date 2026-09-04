"use client";

import type { TipoServicoRow } from "@/lib/types/producao";
import { criarTipoServico, removerTipoServico } from "@/app/admin/producao/actions";
import { ListaCadastroSimples } from "@/components/ui/ListaCadastroSimples";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Atalho pra cadastrar um novo "Tipo de Serviço" sem sair do modal de Nova
 * Tarefa — mesmo cadastro (`prod_tipos_servico`) gerenciado em
 * `ConfiguracaoProducaoModal` e no atalho do Comercial (`GerenciarServicosModal`,
 * em `components/admin/comercial`, que reaproveita esse MESMO cadastro pro
 * "Serviço de Interesse" do lead). `z-[60]` de propósito — abre POR CIMA do
 * modal de Nova Tarefa (mesmo padrão de `GerarAcessoClienteModal`/
 * `GerenciarServicosModal`).
 */
export function GerenciarTiposServicoModal({ tiposServico, onClose }: { tiposServico: TipoServicoRow[]; onClose: () => void }) {
  const { dict } = useLocale();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.producao.tiposServicoTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <ListaCadastroSimples
          titulo={dict.producao.tiposServicoTitulo}
          itens={tiposServico}
          aoCriar={criarTipoServico}
          aoRemover={removerTipoServico}
          placeholder={dict.producao.tipoServicoPlaceholder}
        />
      </div>
    </div>
  );
}
