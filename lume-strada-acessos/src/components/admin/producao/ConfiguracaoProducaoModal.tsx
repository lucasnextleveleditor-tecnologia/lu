"use client";

import { useState, useTransition } from "react";
import type { FuncionarioRow, TipoServicoRow } from "@/lib/types/producao";
import { criarFuncionario, criarTipoServico, removerFuncionario, removerTipoServico } from "@/app/admin/producao/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface ConfiguracaoProducaoModalProps {
  funcionarios: FuncionarioRow[];
  tiposServico: TipoServicoRow[];
  onClose: () => void;
}

/** Painel de configuração dos dois cadastros de apoio (Responsável / Tipo de Serviço) — usado com pouca frequência, por isso fica atrás de um botão em vez de ocupar espaço permanente no board. */
export function ConfiguracaoProducaoModal({ funcionarios, tiposServico, onClose }: ConfiguracaoProducaoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">Configurações de Produção</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ListaCadastro
            titulo="Funcionários (Responsável)"
            itens={funcionarios}
            aoCriar={criarFuncionario}
            aoRemover={removerFuncionario}
            placeholder="Ex: Ana Paula"
          />
          <ListaCadastro
            titulo="Tipos de Serviço"
            itens={tiposServico}
            aoCriar={criarTipoServico}
            aoRemover={removerTipoServico}
            placeholder="Ex: Edição de Vídeo"
          />
        </div>
      </div>
    </div>
  );
}

function ListaCadastro({
  titulo,
  itens,
  aoCriar,
  aoRemover,
  placeholder,
}: {
  titulo: string;
  itens: { id: string; nome: string }[];
  aoCriar: (nome: string) => Promise<{ ok: boolean; error?: string }>;
  aoRemover: (id: string) => Promise<{ ok: boolean; error?: string }>;
  placeholder: string;
}) {
  const [nome, setNome] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await aoCriar(nome);
      if (!result.ok) setError(result.error ?? "Erro desconhecido.");
      else setNome("");
    });
  }

  function handleRemover(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await aoRemover(id);
      if (!result.ok) setError(result.error ?? "Erro desconhecido.");
      setConfirmando(null);
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{titulo}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {itens.length === 0 && <p className="text-xs text-ink-muted">Nenhum cadastrado ainda.</p>}
        {itens.map((item) =>
          confirmando === item.id ? (
            <div key={item.id} className="flex items-center gap-1.5 rounded-full border border-status-critical/30 bg-status-critical/10 px-2.5 py-1 text-xs">
              <span className="text-ink-primary">Excluir?</span>
              <button onClick={() => handleRemover(item.id)} disabled={pending} className="font-medium text-danger hover:underline">
                Sim
              </button>
              <button onClick={() => setConfirmando(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                Não
              </button>
            </div>
          ) : (
            <button key={item.id} onClick={() => setConfirmando(item.id)} title="Clique para excluir">
              <Badge tone="neutral" label={item.nome} />
            </button>
          )
        )}
      </div>
      <form onSubmit={handleCriar} className="flex gap-2">
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={placeholder} className="flex-1" />
        <Button type="submit" variant="ghost" disabled={pending} className="shrink-0 px-3 py-2 text-xs">
          + Add
        </Button>
      </form>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
