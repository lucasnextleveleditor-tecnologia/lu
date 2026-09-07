"use client";

import type { TipoServicoRow } from "@/lib/types/producao";
import { criarTipoServico, removerTipoServico } from "@/app/admin/producao/actions";
import { ListaCadastroSimples } from "@/components/ui/ListaCadastroSimples";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Gerencia os "Serviços Oferecidos" direto do Comercial — sem precisar ir
 * até o módulo de Produção. É o MESMO cadastro (`prod_tipos_servico`, ver
 * `ConfiguracaoProducaoModal`), só com um atalho mais perto de onde o
 * vendedor de fato usa: escolhendo o "Serviço de Interesse" ao criar/editar
 * um lead. `z-[60]` de propósito — abre POR CIMA do modal do lead (mesmo
 * padrão de `GerarAcessoClienteModal`, aberto de dentro de `ClienteDetalheModal`).
 */
export function GerenciarServicosModal({ tiposServico, onClose }: { tiposServico: TipoServicoRow[]; onClose: () => void }) {
  const { dict } = useLocale();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.comercial.servicosOferecidosTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-muted">{dict.comercial.servicosDescricao}</p>

        <ListaCadastroSimples
          titulo={dict.comercial.servicosListaTitulo}
          itens={tiposServico}
          aoCriar={criarTipoServico}
          aoRemover={removerTipoServico}
          placeholder={dict.comercial.placeholderServico}
        />
      </div>
    </div>
  );
}
