"use client";

import { useMemo, useState, useTransition } from "react";
import type { AnuncioComRelacoes, ProdutoRow } from "@/lib/types/infoprodutos";
import { removerAnuncio } from "@/app/admin/trafego/infoprodutos-actions";
import { fmtBRL, fmtDataExtensa, addDaysISO, todayISO } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CriativoUploader } from "@/components/admin/trafego/infoprodutos/CriativoUploader";
import { AnuncioModal } from "@/components/admin/trafego/infoprodutos/AnuncioModal";
import { IconChevronLeft, IconChevronRight, IconFilm } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface AnunciosManagerProps {
  anuncios: AnuncioComRelacoes[];
  produtos: ProdutoRow[];
}

export function AnunciosManager({ anuncios, produtos }: AnunciosManagerProps) {
  const { dict } = useLocale();
  const [dataSelecionada, setDataSelecionada] = useState(todayISO());
  const [modalAberto, setModalAberto] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<AnuncioComRelacoes | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const anunciosDoDia = useMemo(() => anuncios.filter((a) => a.data === dataSelecionada), [anuncios, dataSelecionada]);

  const resumoDoDia = useMemo(() => {
    const investimento = anunciosDoDia.reduce((acc, a) => acc + Number(a.investimento), 0);
    const receita = anunciosDoDia.reduce((acc, a) => acc + Number(a.receita_bruta), 0);
    return { investimento, receita, lucro: receita - investimento };
  }, [anunciosDoDia]);

  function abrirEdicao(anuncio: AnuncioComRelacoes) {
    setAnuncioEditando(anuncio);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setAnuncioEditando(null);
  }

  function handleExcluir(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerAnuncio(id);
      if (!result.ok) setError(result.error);
      setConfirmandoExclusao(null);
    });
  }

  const semProdutoPrincipal = !produtos.some((p) => p.tipo === "principal");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDataSelecionada((d) => addDaysISO(d, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label={dict.trafego.diaAnterior}
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <div className="w-56 text-center">
            <p className="text-sm font-medium">{fmtDataExtensa(dataSelecionada)}</p>
            {dataSelecionada !== todayISO() && (
              <button onClick={() => setDataSelecionada(todayISO())} className="text-xs text-accent hover:underline">
                {dict.trafego.voltarParaHoje}
              </button>
            )}
          </div>
          <button
            onClick={() => setDataSelecionada((d) => addDaysISO(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            aria-label={dict.trafego.proximoDia}
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
        <Button
          onClick={() => setModalAberto(true)}
          disabled={semProdutoPrincipal}
          title={semProdutoPrincipal ? dict.trafego.cadastreProdutoPrincipalPrimeiro : undefined}
        >
          + {dict.trafego.novoAnuncioBotao}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-ink-muted">{dict.trafego.investimentoDoDiaCard}</p>
          <p className="mt-1 text-xl font-semibold text-ink-primary">{fmtBRL(resumoDoDia.investimento)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-muted">{dict.trafego.receitaBrutaDoDiaCard}</p>
          <p className="mt-1 text-xl font-semibold text-ink-primary">{fmtBRL(resumoDoDia.receita)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-muted">{dict.trafego.lucroBrutoDoDiaCard}</p>
          <p className={`mt-1 text-xl font-semibold ${resumoDoDia.lucro >= 0 ? "text-status-good" : "text-status-critical"}`}>
            {fmtBRL(resumoDoDia.lucro)}
          </p>
        </Card>
      </div>

      {semProdutoPrincipal && <p className="text-xs text-ink-muted">{dict.trafego.cadastreProdutoPrincipalAviso}</p>}

      {error && <p className="text-sm text-danger">{error}</p>}

      {anunciosDoDia.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-14 text-center">
          <IconFilm className="h-6 w-6 text-ink-muted" />
          <p className="text-sm text-ink-muted">{dict.trafego.nenhumAnuncioNoDia}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {anunciosDoDia.map((anuncio) => {
            const lucro = Number(anuncio.receita_bruta) - Number(anuncio.investimento);
            return (
              <Card key={anuncio.id} className="p-4">
                <CriativoUploader anuncioId={anuncio.id} criativoUrl={anuncio.criativo_url} criativoTipo={anuncio.criativo_tipo} />

                <div className="mt-3 mb-3">
                  <p className="truncate text-sm font-medium text-ink-primary">{anuncio.nome_anuncio || dict.trafego.anuncioSemNome}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {anuncio.produto_principal_nome ?? dict.trafego.semProdutoPrincipalTexto}
                    {anuncio.order_bump_nome && ` + ${anuncio.order_bump_nome}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <p className="text-ink-muted">
                    {dict.trafego.investAbrevLabel} <span className="text-ink-primary">{fmtBRL(anuncio.investimento)}</span>
                  </p>
                  <p className="text-ink-muted">
                    {dict.trafego.receitaAbrevLabel} <span className="text-ink-primary">{fmtBRL(anuncio.receita_bruta)}</span>
                  </p>
                  <p className="text-ink-muted">
                    {dict.trafego.viewsAbrevLabel} <span className="text-ink-primary">{anuncio.visualizacoes}</span>
                  </p>
                  <p className="text-ink-muted">
                    {dict.trafego.cliquesAbrevLabel} <span className="text-ink-primary">{anuncio.cliques}</span>
                  </p>
                  <p className="text-ink-muted">
                    {dict.trafego.vendasPrincAbrevLabel} <span className="text-ink-primary">{anuncio.vendas_principal}</span>
                  </p>
                  <p className="text-ink-muted">
                    {dict.trafego.vendasBumpAbrevLabel} <span className="text-ink-primary">{anuncio.vendas_order_bump}</span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-base-800 pt-3">
                  <p className="text-xs text-ink-muted">
                    {dict.trafego.lucroAbrevLabel} <span className={lucro >= 0 ? "text-status-good" : "text-status-critical"}>{fmtBRL(lucro)}</span>
                  </p>
                  {confirmandoExclusao === anuncio.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExcluir(anuncio.id)}
                        disabled={pending}
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        {dict.common.confirmarExclusao}
                      </button>
                      <button onClick={() => setConfirmandoExclusao(null)} disabled={pending} className="text-xs text-ink-muted">
                        {dict.common.nao}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => abrirEdicao(anuncio)} className="text-xs font-medium text-ink-secondary hover:text-ink-primary">
                        {dict.common.editar}
                      </button>
                      <button onClick={() => setConfirmandoExclusao(anuncio.id)} className="text-xs font-medium text-danger hover:underline">
                        {dict.common.excluir}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalAberto && <AnuncioModal anuncio={anuncioEditando} produtos={produtos} dataPadrao={dataSelecionada} onClose={fecharModal} />}
    </div>
  );
}
