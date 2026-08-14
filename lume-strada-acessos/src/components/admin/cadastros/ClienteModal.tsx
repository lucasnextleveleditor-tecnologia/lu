"use client";

import { useState, type FormEvent } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import { criarCliente, atualizarCliente } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ClienteModalProps {
  cliente?: ClienteRow | null;
  onClose: () => void;
}

/** Cadastro estritamente cadastral — de propósito SEM nenhum campo/botão de contrato ou upload de documento (pedido explícito do requisito). */
export function ClienteModal({ cliente, onClose }: ClienteModalProps) {
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [documento, setDocumento] = useState(cliente?.documento ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [nomeResponsavel, setNomeResponsavel] = useState(cliente?.nome_responsavel ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(cliente);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = {
      nome,
      documento: documento || null,
      email: email || null,
      telefone: telefone || null,
      nomeResponsavel: nomeResponsavel || null,
      endereco: endereco || null,
    };
    const result = cliente ? await atualizarCliente(cliente.id, input) : await criarCliente(input);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? "Editar Cliente" : "Novo Cliente"}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Razão Social / Nome Completo *</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Estúdio Aurora Filmes Ltda." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">CNPJ / CPF</label>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Telefone / WhatsApp</label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">E-mail de Contato</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome do Responsável</label>
            <Input value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} placeholder="Quem fala pela conta" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Endereço Completo</label>
            <textarea
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
              placeholder="Rua, número, bairro, cidade — UF, CEP"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editando ? "Salvar Alterações" : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
