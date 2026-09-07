"use client";

import { useState, useTransition } from "react";
import type { OrcCategoriaRow, ServicoComCategoria } from "@/lib/types/orcamentos";
import { removerCategoria, removerServico, alternarAtivoServico } from "@/app/admin/orcamentos/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconPencil, IconTrash, IconLayers, IconEye, IconEyeOff } from "@/components/ui/icons";
import { CategoriaModal } from "@/components/admin/orcamentos/CategoriaModal";
import { ServicoModal } from "@/components/admin/orcamentos/ServicoModal";
import { fmtBRL } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

const UNIDADE_KEY = { unico: "unidadeUnico", hora: "unidadeHora", dia: "unidadeDia", mes: "unidadeMes", pacote: "unidadePacote" } as const;

export function CatalogoManager({ categorias, servicosComCategoria }: { categorias: OrcCategoriaRow[]; servicosComCategoria: ServicoComCategoria[] }) {
  const { dict } = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [modalCategoria, setModalCategoria] = useState<"novo" | OrcCategoriaRow | null>(null);
  const [modalServico, setModalServico] = useState<"novo" | ServicoComCategoria | null>(null);
  const [confirmandoCategoria, setConfirmandoCategoria] = useState<string | null>(null);
  const [confirmandoServico, setConfirmandoServico] = useState<string | null>(null);

  function handleExcluirCategoria(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerCategoria(id);
      if (!result.ok) setError(result.error);
      setConfirmandoCategoria(null);
    });
  }

  function handleExcluirServico(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerServico(id);
      if (!result.ok) setError(result.error);
      setConfirmandoServico(null);
    });
  }

  function handleAlternarAtivo(servico: ServicoComCategoria) {
    setError(null);
    startTransition(async () => {
      const result = await alternarAtivoServico(servico.id, !servico.ativo);
      if (!result.ok) setError(result.error);
    });
  }

  const gruposPorCategoria = [
    ...categorias.map((c) => ({ categoria: c, servicos: servicosComCategoria.filter((s) => s.categoria_id === c.id) })),
    { categoria: null, servicos: servicosComCategoria.filter((s) => !s.categoria_id) },
  ].filter((g) => g.servicos.length > 0 || g.categoria !== null);

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-danger">{error}</p>}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconLayers className="h-4 w-4 text-ink-muted" />
            <h2 className="text-sm font-semibold">{dict.orcamentos.categoriasTitulo}</h2>
          </div>
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={() => setModalCategoria("novo")}>
            <IconPlus className="h-3.5 w-3.5" />
            {dict.orcamentos.novaCategoriaBtn}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="group flex items-center gap-1 rounded-full border border-base-600 bg-base-800/50 py-1 pl-3 pr-1.5 text-xs font-medium text-ink-primary">
              {categoria.emoji && <span aria-hidden>{categoria.emoji}</span>}
              {categoria.nome}
              {confirmandoCategoria === categoria.id ? (
                <span className="ml-1 flex items-center gap-1.5">
                  <span className="text-ink-muted">{dict.common.confirmarExclusao}</span>
                  <button onClick={() => handleExcluirCategoria(categoria.id)} disabled={pending} className="font-medium text-danger hover:underline">
                    {dict.common.sim}
                  </button>
                  <button onClick={() => setConfirmandoCategoria(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                    {dict.common.nao}
                  </button>
                </span>
              ) : (
                <span className="ml-1 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => setModalCategoria(categoria)} className="rounded p-1 text-ink-muted hover:text-ink-primary" aria-label={dict.orcamentos.editarCategoriaTitulo}>
                    <IconPencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setConfirmandoCategoria(categoria.id)} className="rounded p-1 text-ink-muted hover:text-danger" aria-label={dict.common.excluir}>
                    <IconTrash className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{dict.orcamentos.servicosTitulo}</h2>
          <Button variant="ghost" className="gap-1.5 px-3 py-1.5 text-xs" onClick={() => setModalServico("novo")}>
            <IconPlus className="h-3.5 w-3.5" />
            {dict.orcamentos.novoServicoBtn}
          </Button>
        </div>

        {servicosComCategoria.length === 0 ? (
          <div className="rounded-lg border border-dashed border-base-700 p-6 text-center">
            <p className="text-sm font-medium text-ink-primary">{dict.orcamentos.catalogoVazioTitulo}</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">{dict.orcamentos.catalogoVazioDescricao}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {gruposPorCategoria.map(({ categoria, servicos }) => (
              <div key={categoria?.id ?? "sem-categoria"}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {categoria?.emoji ? `${categoria.emoji} ` : ""}
                  {categoria?.nome ?? dict.orcamentos.semCategoriaLabel}
                </p>
                <div className="divide-y divide-base-800 rounded-lg border border-base-800">
                  {servicos.map((servico) => (
                    <div key={servico.id} className={cn("flex items-center justify-between gap-3 px-4 py-3", !servico.ativo && "opacity-50")}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-ink-primary">{servico.nome}</p>
                          {!servico.ativo && <Badge tone="neutral" label={dict.orcamentos.servicoInativoBadge} />}
                        </div>
                        {servico.descricao && <p className="mt-0.5 truncate text-xs text-ink-muted">{servico.descricao}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-ink-primary">{fmtBRL(servico.valor_padrao)}</p>
                          <p className="text-[11px] text-ink-muted">{dict.orcamentos[UNIDADE_KEY[servico.unidade]]}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAlternarAtivo(servico)}
                            disabled={pending}
                            className="rounded p-1.5 text-ink-muted hover:text-ink-primary"
                            title={servico.ativo ? dict.orcamentos.desativarServicoBtn : dict.orcamentos.ativarServicoBtn}
                          >
                            {servico.ativo ? <IconEyeOff className="h-3.5 w-3.5" /> : <IconEye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => setModalServico(servico)} className="rounded p-1.5 text-ink-muted hover:text-ink-primary" aria-label={dict.orcamentos.editarServicoTitulo}>
                            <IconPencil className="h-3.5 w-3.5" />
                          </button>
                          {confirmandoServico === servico.id ? (
                            <span className="flex items-center gap-1.5 text-xs">
                              <button onClick={() => handleExcluirServico(servico.id)} disabled={pending} className="font-medium text-danger hover:underline">
                                {dict.common.sim}
                              </button>
                              <button onClick={() => setConfirmandoServico(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                                {dict.common.nao}
                              </button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmandoServico(servico.id)} className="rounded p-1.5 text-ink-muted hover:text-danger" aria-label={dict.common.excluir}>
                              <IconTrash className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modalCategoria && <CategoriaModal onClose={() => setModalCategoria(null)} categoria={modalCategoria === "novo" ? undefined : modalCategoria} />}
      {modalServico && <ServicoModal onClose={() => setModalServico(null)} categorias={categorias} servico={modalServico === "novo" ? undefined : modalServico} />}
    </div>
  );
}
