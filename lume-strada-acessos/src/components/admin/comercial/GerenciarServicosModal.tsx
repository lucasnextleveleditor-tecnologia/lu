"use client";

import type { TipoServicoRow } from "@/lib/types/producao";
import { criarTipoServico, removerTipoServico } from "@/app/admin/producao/actions";
import { ListaCadastroSimples } from "@/components/ui/ListaCadastroSimples";

/**
 * Gerencia os "Serviços Oferecidos" direto do Comercial — sem precisar ir
 * até o módulo de Produção. É o MESMO cadastro (`prod_tipos_servico`, ver
 * `ConfiguracaoProducaoModal`), só com um atalho mais perto de onde o
 * vendedor de fato usa: escolhendo o "Serviço de Interesse" ao criar/editar
 * um lead. `z-[60]` de propósito — abre POR CIMA do modal do lead (mesmo
 * padrão de `GerarAcessoClienteModal`, aberto de dentro de `ClienteDetalheModal`).
 */
export function GerenciarServicosModal({ tiposServico, onClose }: { tiposServico: TipoServicoRow[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Serviços Oferecidos</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>
        <p className="mb-4 text-xs text-ink-muted">Essa lista também é usada em Produção — adicionar ou remover aqui vale pros dois módulos.</p>

        <ListaCadastroSimples titulo="Serviços" itens={tiposServico} aoCriar={criarTipoServico} aoRemover={removerTipoServico} placeholder="Ex: Edição de Vídeo" />
      </div>
    </div>
  );
}
