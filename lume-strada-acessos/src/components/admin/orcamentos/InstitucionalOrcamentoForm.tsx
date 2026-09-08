"use client";

import { useState, useTransition } from "react";
import type { InstitucionalOrcamentoBruto } from "@/app/admin/orcamentos/portfolio-data";
import { salvarInstitucionalOrcamento } from "@/app/admin/orcamentos/portfolio-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface InstitucionalOrcamentoFormProps {
  institucional: InstitucionalOrcamentoBruto;
}

/**
 * Texto de apresentação da empresa + lista de clientes já atendidos —
 * alimentam a capa institucional do PDF de orçamento (ver
 * `OrcamentoPdfDocument.tsx`). Diferente de `MarcaOrcamentoForm` (upload de
 * imagem, salva sozinho), aqui é texto livre digitado à mão: precisa de um
 * botão "Salvar" explícito, chamando `salvarInstitucionalOrcamento`.
 */
export function InstitucionalOrcamentoForm({ institucional }: InstitucionalOrcamentoFormProps) {
  const { dict } = useLocale();
  const [textoInstitucional, setTextoInstitucional] = useState(institucional.textoInstitucional ?? "");
  const [clientesAtendidos, setClientesAtendidos] = useState(institucional.clientesAtendidos ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function handleSalvar() {
    setError(null);
    setSalvo(false);
    startTransition(async () => {
      const result = await salvarInstitucionalOrcamento({ textoInstitucional, clientesAtendidos });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    });
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-sm font-semibold text-ink-primary">{dict.orcamentos.institucionalTitulo}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">{dict.orcamentos.institucionalSubtitulo}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.institucionalTextoLabel}</label>
        <Textarea
          rows={4}
          value={textoInstitucional}
          onChange={(e) => setTextoInstitucional(e.target.value)}
          placeholder={dict.orcamentos.institucionalTextoPlaceholder}
        />
        <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.institucionalTextoHint}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.institucionalClientesLabel}</label>
        <Textarea
          rows={4}
          value={clientesAtendidos}
          onChange={(e) => setClientesAtendidos(e.target.value)}
          placeholder={dict.orcamentos.institucionalClientesPlaceholder}
        />
        <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.institucionalClientesHint}</p>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <Button disabled={pending} onClick={handleSalvar} className="px-4 py-2 text-xs">
          {dict.orcamentos.institucionalSalvarBtn}
        </Button>
        {salvo && <span className="text-xs text-status-good">{dict.orcamentos.institucionalSalvoMsg}</span>}
      </div>
    </Card>
  );
}
