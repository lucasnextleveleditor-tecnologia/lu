"use client";

import { useState, type FormEvent } from "react";
import type { FornecedorRow } from "@/lib/types/financeiro";
import { atualizarFornecedor } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface EditarFornecedorModalProps {
  fornecedor: FornecedorRow;
  onClose: () => void;
}

/**
 * Detalhe/edição de um fornecedor já cadastrado — só existe na tela própria
 * de Fornecedores (`/admin/financeiro/fornecedores`), nunca dentro de Nova
 * Transação (esse continua usando só o `NovoFornecedorModal`, nome-only).
 * Pedido explícito do dono da conta: o cadastro rápido não devia virar
 * burocracia, mas quando um fornecedor "merece mais seriedade" (virou
 * pessoa jurídica, por exemplo) dá pra abrir ele aqui e completar e-mail,
 * CNPJ, endereço, telefone e responsável — nenhum desses é obrigatório, só
 * `nome` continua sendo. Deixar um campo em branco aqui apaga o valor
 * anterior (vira `null` no banco, ver `atualizarFornecedor`), então dá pra
 * "desfazer" um dado preenchido sem problema.
 */
export function EditarFornecedorModal({ fornecedor, onClose }: EditarFornecedorModalProps) {
  const { dict } = useLocale();
  const t = dict.financeiro;
  const [nome, setNome] = useState(fornecedor.nome);
  const [responsavel, setResponsavel] = useState(fornecedor.responsavel ?? "");
  const [cnpj, setCnpj] = useState(fornecedor.cnpj ?? "");
  const [email, setEmail] = useState(fornecedor.email ?? "");
  const [telefone, setTelefone] = useState(fornecedor.telefone ?? "");
  const [endereco, setEndereco] = useState(fornecedor.endereco ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await atualizarFornecedor(fornecedor.id, { nome, responsavel, cnpj, email, telefone, endereco });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{t.editarFornecedorTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.nomeFornecedorObrigatorio}</label>
            <Input required autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.placeholderNomeFornecedor} />
          </div>

          <p className="text-xs text-ink-muted">{t.camposOpcionaisFornecedorHint}</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.responsavelLabel}</label>
              <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder={t.placeholderResponsavel} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.cnpjLabel}</label>
              <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder={t.placeholderCnpj} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.emailFornecedorLabel}</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholderEmailFornecedor} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.telefoneFornecedorLabel}</label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder={t.placeholderTelefoneFornecedor} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.enderecoFornecedorLabel}</label>
            <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder={t.placeholderEnderecoFornecedor} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : dict.common.salvarAlteracoes}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
