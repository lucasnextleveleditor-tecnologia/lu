"use client";

import { useState, type FormEvent } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import { criarCliente, atualizarCliente } from "@/app/admin/actions";
import { PALETA_CATEGORIAS } from "@/lib/utils/financeiro";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

interface ClienteModalProps {
  cliente?: ClienteRow | null;
  onClose: () => void;
  /**
   * Chamado só na CRIAÇÃO (nunca na edição) com o cliente recém-cadastrado —
   * usado por quem abre este modal "por dentro" de outro fluxo (Produção,
   * Tráfego, ver `TarefaModal.tsx`/`ClientesTrafegoTab.tsx`) pra já
   * selecionar o cliente novo no dropdown de origem sem precisar reabrir
   * nada. O cadastro em si sempre é o mesmo, completo — não existe uma
   * versão "rápida" separada, de propósito, pra não duplicar a lógica de
   * validação/cor em dois lugares.
   */
  onCreated?: (cliente: Pick<ClienteRow, "id" | "nome" | "cor">) => void;
}

/** Cadastro estritamente cadastral — de propósito SEM nenhum campo/botão de contrato ou upload de documento (pedido explícito do requisito). */
export function ClienteModal({ cliente, onClose, onCreated }: ClienteModalProps) {
  const { dict } = useLocale();
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [documento, setDocumento] = useState(cliente?.documento ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [nomeResponsavel, setNomeResponsavel] = useState(cliente?.nome_responsavel ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [cor, setCor] = useState<string | null>(cliente?.cor ?? PALETA_CATEGORIAS[0]);
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
      cor,
    };
    if (cliente) {
      const result = await atualizarCliente(cliente.id, input);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    } else {
      const result = await criarCliente(input);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onCreated?.({ id: result.id, nome: input.nome.trim(), cor: input.cor });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? dict.cadastros.editarCliente : dict.cadastros.novoCliente}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.razaoSocialLabel}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={dict.cadastros.razaoSocialPlaceholder} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.documentoLabel}</label>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder={dict.cadastros.documentoPlaceholder} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.telefoneWhatsappLabel}</label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder={dict.cadastros.telefonePlaceholder} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.emailContatoLabel}</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={dict.cadastros.emailContatoPlaceholder} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.nomeResponsavelLabel}</label>
            <Input
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              placeholder={dict.cadastros.nomeResponsavelPlaceholder}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.enderecoLabel}</label>
            <textarea
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
              placeholder={dict.cadastros.enderecoPlaceholder}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.corEtiquetaLabel}</label>
            <p className="mb-2 text-[11px] text-ink-muted">{dict.cadastros.corEtiquetaAjuda}</p>
            <div className="flex flex-wrap items-center gap-2">
              {PALETA_CATEGORIAS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCor(hex)}
                  aria-label={dict.cadastros.escolherCorAria.replace("{hex}", hex)}
                  className={cn("h-7 w-7 rounded-full transition", cor === hex && "ring-2 ring-ink-primary ring-offset-2 ring-offset-base-900")}
                  style={{ backgroundColor: hex }}
                />
              ))}
              {/* Cor personalizada — pra quando as 7 opções fixas não bastam (agências com muitos clientes simultâneos no Calendário). */}
              <label
                className={cn(
                  "relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-dashed border-base-500 transition",
                  cor && !(PALETA_CATEGORIAS as readonly string[]).includes(cor) && "border-solid ring-2 ring-ink-primary ring-offset-2 ring-offset-base-900"
                )}
                style={cor && !(PALETA_CATEGORIAS as readonly string[]).includes(cor) ? { backgroundColor: cor } : undefined}
                title={dict.cadastros.corPersonalizadaAria}
              >
                <input
                  type="color"
                  value={cor && /^#[0-9A-Fa-f]{6}$/.test(cor) ? cor : "#999999"}
                  onChange={(e) => setCor(e.target.value)}
                  aria-label={dict.cadastros.corPersonalizadaAria}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : dict.cadastros.criarCliente}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
