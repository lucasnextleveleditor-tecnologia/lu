"use client";

import type { ContratoDoClienteLogado } from "@/app/dashboard/actions";
import { Card } from "@/components/ui/Card";
import { substituir } from "@/lib/utils/texto";
import { fmtDataCurta } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconFileText, IconExternalLink } from "@/components/ui/icons";

/**
 * O contrato na área do cliente — SÓ LEITURA, e de propósito.
 *
 * Não tem botão de editar, de renomear, de apagar nem de anexar: o contrato é
 * um acordo entre duas partes, e a parte que o guarda é a agência. O que o
 * cliente ganha aqui é o que faltava — saber que ele existe e conseguir abrir
 * sem caçar um e-mail de seis meses atrás.
 *
 * Só chega aqui contrato ASSINADO (o filtro está em
 * `listarContratosDoClienteLogado`), então a lista nunca mostra uma
 * negociação em andamento.
 */
export function ContratosDoClienteLogado({ contratos }: { contratos: ContratoDoClienteLogado[] }) {
  const { dict } = useLocale();
  const t = dict.cliente;

  if (contratos.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-ink-muted">{t.contratosVazio}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {contratos.map((c) => (
        <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-base-700 bg-base-950/60">
              <IconFileText className="h-4 w-4 text-accent" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-primary">{c.titulo}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {c.assinadoEm ? substituir(t.contratoAssinadoEm, { data: fmtDataCurta(c.assinadoEm.slice(0, 10)) }) : t.contratoSemData}
              </p>
            </div>
          </div>

          {c.href && (
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              <IconExternalLink className="h-3.5 w-3.5" />
              {t.contratoAbrir}
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}
