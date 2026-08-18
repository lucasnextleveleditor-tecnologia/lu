"use client";

import type { FuncionarioRow, TipoServicoRow } from "@/lib/types/producao";
import { criarFuncionario, criarTipoServico, removerFuncionario, removerTipoServico } from "@/app/admin/producao/actions";
import { ListaCadastroSimples } from "@/components/ui/ListaCadastroSimples";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ConfiguracaoProducaoModalProps {
  funcionarios: FuncionarioRow[];
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

/**
 * Painel de configuração dos dois cadastros de apoio (Responsável / Tipo de
 * Serviço) — usado com pouca frequência, por isso fica atrás de um botão em
 * vez de ocupar espaço permanente no board.
 *
 * "Tipos de Serviço" também pode ser gerenciado direto do módulo Comercial
 * (ver `GerenciarServicosModal`, em `components/admin/comercial`) — é o
 * MESMO cadastro (`prod_tipos_servico`), só com um atalho mais perto de
 * onde o vendedor realmente usa ("Serviço de Interesse" do lead).
 */
export function ConfiguracaoProducaoModal({ funcionarios, tiposServico, onClose }: ConfiguracaoProducaoModalProps) {
  const { dict } = useLocale();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{dict.producao.configTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ListaCadastroSimples
            titulo={dict.producao.funcionariosTitulo}
            itens={funcionarios}
            aoCriar={criarFuncionario}
            aoRemover={removerFuncionario}
            placeholder={dict.producao.funcionarioPlaceholder}
          />
          <ListaCadastroSimples
            titulo={dict.producao.tiposServicoTitulo}
            itens={tiposServico}
            aoCriar={criarTipoServico}
            aoRemover={removerTipoServico}
            placeholder={dict.producao.tipoServicoPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}
