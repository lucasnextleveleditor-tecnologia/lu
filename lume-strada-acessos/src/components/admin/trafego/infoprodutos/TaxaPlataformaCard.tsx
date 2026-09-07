"use client";

import { useState, type FormEvent } from "react";
import type { TaxaPadraoRow } from "@/lib/types/infoprodutos";
import { salvarTaxaPadrao } from "@/app/admin/trafego/infoprodutos-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { IconPercent } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface TaxaPlataformaCardProps {
  clienteCadastroId: string;
  taxaPadrao: TaxaPadraoRow | null;
}

/**
 * Taxa padrão da plataforma (Hotmart/Kiwify/etc) desse cliente — percentual
 * + fixo por venda, os dois SEMPRE um número explícito (0 é um valor válido
 * e esperado, nunca "vazio"/null, ver pedido do dono da conta). Salvar aqui
 * só muda o PADRÃO que pré-preenche todo NOVO lançamento de anúncio (ver
 * `AnuncioModal`) — não mexe retroativamente em anúncios já lançados.
 */
export function TaxaPlataformaCard({ clienteCadastroId, taxaPadrao }: TaxaPlataformaCardProps) {
  const { dict } = useLocale();
  const [taxaPercentual, setTaxaPercentual] = useState(String(taxaPadrao?.taxa_percentual ?? 0));
  const [taxaFixa, setTaxaFixa] = useState(String(taxaPadrao?.taxa_fixa ?? 0));
  const [loading, setLoading] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSalvo(false);

    const result = await salvarTaxaPadrao(clienteCadastroId, Number(taxaPercentual) || 0, Number(taxaFixa) || 0);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSalvo(true);
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <IconPercent className="h-4 w-4 text-ink-muted" />
        <p className="text-sm font-semibold text-ink-primary">{dict.trafego.taxaPadraoTitulo}</p>
      </div>
      <p className="mb-4 text-xs text-ink-muted">{dict.trafego.taxaPadraoDescricao}</p>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.taxaPercentualLabel}</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={taxaPercentual}
            onChange={(e) => {
              setTaxaPercentual(e.target.value);
              setSalvo(false);
            }}
          />
        </div>
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.trafego.taxaFixaLabel}</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={taxaFixa}
            onChange={(e) => {
              setTaxaFixa(e.target.value);
              setSalvo(false);
            }}
          />
        </div>
        <Button type="submit" disabled={loading} className="px-4 py-2 text-xs">
          {loading ? dict.common.salvando : dict.trafego.salvarTaxaPadraoBotao}
        </Button>
        {salvo && !loading && <span className="text-xs text-status-good">{dict.trafego.taxaPadraoSalvaTexto}</span>}
      </form>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}
