"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

/**
 * Lista de cadastro simples (nome + criar + excluir com confirmação inline)
 * — o mesmo padrão de "badge clicável vira botão de excluir" usado desde
 * `ConfiguracaoProducaoModal` (Funcionários/Tipos de Serviço), extraído
 * pra cá pra poder ser reaproveitado por outros módulos que dependem do
 * MESMO cadastro (ex: Comercial usa `prod_tipos_servico`, o mesmo cadastro
 * de "Tipo de Serviço" do módulo de Produção — ver `GerenciarServicosModal`
 * em `components/admin/comercial`).
 */
export function ListaCadastroSimples({
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
