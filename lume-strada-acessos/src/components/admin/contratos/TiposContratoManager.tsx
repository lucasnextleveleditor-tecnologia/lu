"use client";

import { useState, useTransition } from "react";
import type { ContratoTipoRow } from "@/lib/types/contratos";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import { CATEGORIAS_PORTFOLIO } from "@/lib/utils/orcamentos";
import { montarClausulasPadrao } from "@/lib/utils/contratos";
import { salvarTipoContrato } from "@/app/admin/contratos/tipos-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

interface TiposContratoManagerProps {
  tipos: Record<PerfilOrcamento, ContratoTipoRow | null>;
}

/** Um modelo de cláusulas por perfil profissional — pré-preenche o construtor de contrato quando aquele perfil é escolhido (ver `ContratoBuilder.tsx`). Mesmo padrão de `TiposOrcamentoManager`. */
export function TiposContratoManager({ tipos }: TiposContratoManagerProps) {
  const { dict } = useLocale();
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilOrcamento>(CATEGORIAS_PORTFOLIO[0]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const tipoInicial = tipos[perfilSelecionado];
  const [clausulas, setClausulas] = useState(tipoInicial?.clausulas_padrao || montarClausulasPadrao(perfilSelecionado));
  const [condicoes, setCondicoes] = useState(tipoInicial?.condicoes_pagamento_padrao ?? "");

  function trocarPerfil(perfil: PerfilOrcamento) {
    setPerfilSelecionado(perfil);
    setError(null);
    setSalvo(false);
    const tipo = tipos[perfil];
    setClausulas(tipo?.clausulas_padrao || montarClausulasPadrao(perfil));
    setCondicoes(tipo?.condicoes_pagamento_padrao ?? "");
  }

  function restaurarSugestao() {
    setClausulas(montarClausulasPadrao(perfilSelecionado));
  }

  function salvar() {
    setError(null);
    setSalvo(false);
    startTransition(async () => {
      const result = await salvarTipoContrato(perfilSelecionado, clausulas, condicoes || null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSalvo(true);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      <div className="flex flex-row flex-wrap gap-2 lg:flex-col">
        {CATEGORIAS_PORTFOLIO.map((perfil) => (
          <button
            key={perfil}
            onClick={() => trocarPerfil(perfil)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm font-medium transition",
              perfilSelecionado === perfil ? "border-accent bg-accent/15 text-ink-primary" : "border-base-700 text-ink-secondary hover:text-ink-primary"
            )}
          >
            {dict.orcamentos.categoriasProfissao[perfil]}
          </button>
        ))}
      </div>

      <Card className="space-y-4 p-5">
        <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 p-3">
          <p className="text-xs text-ink-secondary">{dict.contratos.avisoModeloJuridico}</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.condicoesPagamentoLabel}</label>
          <Input value={condicoes} onChange={(e) => setCondicoes(e.target.value)} placeholder={dict.orcamentos.placeholderCondicoesPagamento} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-secondary">{dict.contratos.clausulasTitulo}</label>
            <button type="button" onClick={restaurarSugestao} className="text-xs font-medium text-accent hover:underline">
              {dict.contratos.restaurarSugestaoBtn}
            </button>
          </div>
          <p className="mb-2 text-[11px] text-ink-muted">{dict.contratos.placeholdersHint}</p>
          <Textarea rows={20} value={clausulas} onChange={(e) => setClausulas(e.target.value)} className="font-mono text-xs leading-relaxed" />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {salvo && <p className="text-sm text-status-good">{dict.contratos.tiposSalvoMsg}</p>}

        <div className="flex justify-end border-t border-base-800 pt-4">
          <Button onClick={salvar} disabled={pending}>
            {pending ? dict.common.salvando : dict.contratos.tiposSalvarBtn}
          </Button>
        </div>
      </Card>
    </div>
  );
}
