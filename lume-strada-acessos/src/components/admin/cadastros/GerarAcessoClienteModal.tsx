"use client";

import { useState, type FormEvent } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import { gerarAcessoCliente } from "@/app/admin/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { LinkAcessoGerado } from "@/components/ui/LinkAcessoGerado";

export function GerarAcessoClienteModal({ cliente, onClose }: { cliente: ClienteRow; onClose: () => void }) {
  const { dict } = useLocale();
  const [email, setEmail] = useState(cliente.email ?? "");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await gerarAcessoCliente(cliente.id, { email, expiresAt: expiresAt || null });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Fica aberto mostrando o link (LinkAcessoGerado) em vez de fechar
    // sozinho — sem isso o link gerado nunca chegaria a aparecer pra
    // ninguém copiar.
    setLink(result.link);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {dict.cadastros.gerarAcesso} — {cliente.nome}
          </h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        {link ? (
          <div className="space-y-4">
            <LinkAcessoGerado
              link={link}
              titulo={dict.cadastros.linkAcessoTitulo}
              ajuda={dict.cadastros.linkAcessoAjuda}
              copiarLabel={dict.common.copiarLink}
              copiadoLabel={dict.common.linkCopiado}
              whatsappLabel={dict.common.enviarPorWhatsapp}
            />
            <div className="flex justify-end pt-1">
              <Button type="button" onClick={onClose}>
                {dict.common.concluir}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.emailLoginLabel}</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.cadastros.emailClientePlaceholder}
              />
              <p className="mt-1 text-xs text-ink-muted">{dict.cadastros.conviteClienteAjuda}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.dataExpiracaoLabel}</label>
              <DatePicker value={expiresAt} onChange={setExpiresAt} clearable />
              <p className="mt-1 text-xs text-ink-muted">{dict.cadastros.semExpiracaoAjuda}</p>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={onClose}>
                {dict.common.cancelar}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? dict.cadastros.enviando : dict.cadastros.gerarAcessoEnviarConvite}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
