"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { buscarOrcamentoPorId } from "@/app/admin/orcamentos/data";
import type { buscarContratoVinculado, buscarDadosConstrutorContrato } from "@/app/admin/contratos/data";
import { calcularTotalContrato } from "@/lib/types/contratos";
import { OrcamentoDetalhe } from "@/components/admin/orcamentos/OrcamentoDetalhe";
import { ContratoDetalhe } from "@/components/admin/contratos/ContratoDetalhe";
import { ContratoBuilder } from "@/components/admin/contratos/ContratoBuilder";
import { IconLock } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

type OrcamentoDoHub = Awaited<ReturnType<typeof buscarOrcamentoPorId>>;
type ContratoVinculado = Awaited<ReturnType<typeof buscarContratoVinculado>>;
type DadosConstrutorContrato = Awaited<ReturnType<typeof buscarDadosConstrutorContrato>>;

interface OrcamentoHubProps {
  orcamento: OrcamentoDoHub;
  contratoVinculado: ContratoVinculado;
  dadosContrato: DadosConstrutorContrato;
  /** Nome de MARCA (`getNomeApp()`) — repassado direto pro `ContratoBuilder` embutido, mesmo prop que `/admin/contratos/novo` já passa. */
  nomeEmpresa: string;
}

/**
 * Hub único de um orçamento — aba "Orçamento" (sempre disponível) + aba
 * "Contrato" (só destrava quando `orcamento.statusExibicao === "aprovado"`,
 * a trava de fluxo pedida: o Contrato não deveria nascer antes do Orçamento
 * estar fechado). Substitui o antigo botão "Gerar Contrato" que navegava
 * pra `/admin/contratos/novo?orcamentoId=...` — agora o construtor de
 * contrato (quando ainda não existe um vinculado) fica embutido na própria
 * aba, e some assim que o contrato é criado (`aoCriarComSucesso` chama
 * `router.refresh()`, que busca `buscarContratoVinculado` de novo no
 * server e troca pra `ContratoDetalhe` sozinho).
 */
export function OrcamentoHub({ orcamento, contratoVinculado, dadosContrato, nomeEmpresa }: OrcamentoHubProps) {
  const { dict } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contratoDestravado = orcamento.statusExibicao === "aprovado";

  const [aba, setAba] = useState<"orcamento" | "contrato">(searchParams.get("tab") === "contrato" && contratoDestravado ? "contrato" : "orcamento");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-base-800 print:hidden">
        <button
          type="button"
          onClick={() => setAba("orcamento")}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
            aba === "orcamento" ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          {dict.orcamentos.abaOrcamentoLabel}
        </button>
        <button
          type="button"
          onClick={() => contratoDestravado && setAba("contrato")}
          disabled={!contratoDestravado}
          title={!contratoDestravado ? dict.orcamentos.abaContratoBloqueadaHint : undefined}
          className={cn(
            "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition",
            !contratoDestravado
              ? "cursor-not-allowed border-transparent text-ink-muted/50"
              : aba === "contrato"
                ? "border-accent text-ink-primary"
                : "border-transparent text-ink-muted hover:text-ink-secondary"
          )}
        >
          {!contratoDestravado && <IconLock className="h-3.5 w-3.5" />}
          {dict.orcamentos.abaContratoLabel}
        </button>
      </div>

      {aba === "orcamento" && <OrcamentoDetalhe orcamento={orcamento} />}

      {aba === "contrato" &&
        contratoDestravado &&
        (contratoVinculado ? (
          <ContratoDetalhe contrato={{ ...contratoVinculado, total: calcularTotalContrato(contratoVinculado.itens) }} />
        ) : (
          <ContratoBuilder
            nomeEmpresa={nomeEmpresa}
            empresa={dadosContrato.empresa}
            clientes={dadosContrato.clientes}
            tiposContrato={dadosContrato.tiposContrato}
            orcamentosParaVincular={dadosContrato.orcamentosParaVincular}
            orcamentoIdInicial={orcamento.id}
            aoCriarComSucesso={() => router.refresh()}
          />
        ))}
    </div>
  );
}
