"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import type { TipoAnexoTransacao, TransacaoAnexoRow } from "@/lib/types/financeiro";
import {
  confirmarAnexoTransacao,
  criarUploadAssinadoAnexo,
  getUrlDownloadAnexo,
  listarAnexosTransacao,
  removerAnexoTransacao,
} from "@/app/admin/financeiro/actions";
import { ANEXO_TRANSACAO_TAMANHO_MAX_BYTES } from "@/lib/utils/financeiro";
import { fmtTamanhoArquivo } from "@/lib/utils/producao";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { IconPaperclip } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const BUCKET = "financeiro";

interface AnexosTransacaoSectionProps {
  transacaoId: string;
}

/**
 * Anexos opcionais da transação — Nota Fiscal/Recibo e Comprovante de
 * Pagamento (ver `supabase/financeiro-anexos.sql`). Só aparece no modo
 * edição (`TransacaoModal.tsx`), porque o upload precisa de um
 * `transacaoId` já existente pra montar o path no Storage — mesma razão
 * pela qual, em Produção, os anexos de entrega só existem no painel de
 * detalhe (depois da tarefa criada), nunca no formulário de criação.
 *
 * Busca a lista de anexos ela mesma (via `listarAnexosTransacao`) em vez de
 * receber por prop — o módulo Financeiro não tem uma "TransacaoComRelacoes"
 * carregando os anexos junto (ao contrário de Produção, que já passa
 * `entregasPorTarefa` de cima pra baixo desde a página), então buscar aqui
 * dentro evita reformar o carregamento de TODAS as páginas que usam
 * `TransacoesManager`/`TransacaoModal` só por causa deste campo opcional.
 */
export function AnexosTransacaoSection({ transacaoId }: AnexosTransacaoSectionProps) {
  const { dict } = useLocale();
  const [anexos, setAnexos] = useState<TransacaoAnexoRow[] | null>(null); // null = carregando
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarAnexosTransacao(transacaoId).then((result) => {
      if (!ativo) return;
      if (result.ok) setAnexos(result.anexos);
      else setErroCarregar(result.error);
    });
    return () => {
      ativo = false;
    };
  }, [transacaoId]);

  function handleAnexado(anexo: TransacaoAnexoRow) {
    setAnexos((prev) => [anexo, ...(prev ?? [])]);
  }

  function handleRemovido(id: string) {
    setAnexos((prev) => (prev ?? []).filter((a) => a.id !== id));
  }

  const notasFiscais = (anexos ?? []).filter((a) => a.tipo === "nota_fiscal");
  const comprovantes = (anexos ?? []).filter((a) => a.tipo === "comprovante");

  return (
    <div className="space-y-4 rounded-lg border border-base-700 bg-base-950/40 p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.financeiro.anexosTitulo}</p>
      {erroCarregar && <p className="text-xs text-danger">{erroCarregar}</p>}
      {anexos === null ? (
        <p className="text-xs text-ink-muted">{dict.common.carregando}</p>
      ) : (
        <>
          <AnexoGrupo
            titulo={dict.financeiro.notaFiscalLabel}
            tipo="nota_fiscal"
            transacaoId={transacaoId}
            itens={notasFiscais}
            onAnexado={handleAnexado}
            onRemovido={handleRemovido}
          />
          <AnexoGrupo
            titulo={dict.financeiro.comprovantePagamentoLabel}
            tipo="comprovante"
            transacaoId={transacaoId}
            itens={comprovantes}
            onAnexado={handleAnexado}
            onRemovido={handleRemovido}
          />
        </>
      )}
    </div>
  );
}

function AnexoGrupo({
  titulo,
  tipo,
  transacaoId,
  itens,
  onAnexado,
  onRemovido,
}: {
  titulo: string;
  tipo: TipoAnexoTransacao;
  transacaoId: string;
  itens: TransacaoAnexoRow[];
  onAnexado: (anexo: TransacaoAnexoRow) => void;
  onRemovido: (id: string) => void;
}) {
  const { dict } = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleArquivoSelecionado(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);

    if (file.size > ANEXO_TRANSACAO_TAMANHO_MAX_BYTES) {
      setError(dict.financeiro.anexoMuitoGrande);
      return;
    }

    startTransition(async () => {
      // 1/3 — signed upload URL (checa permissão do módulo e reserva o path).
      const assinado = await criarUploadAssinadoAnexo(transacaoId, file.name);
      if (!assinado.ok) {
        setError(assinado.error);
        return;
      }

      // 2/3 — sobe o arquivo DIRETO pro Supabase Storage a partir do navegador.
      const supabase = createClient();
      const { error: erroUpload } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(assinado.path, assinado.token, file, { contentType: file.type || undefined });
      if (erroUpload) {
        setError(erroUpload.message);
        return;
      }

      // 3/3 — confirma o envio: grava a linha do anexo.
      const result = await confirmarAnexoTransacao(transacaoId, tipo, {
        path: assinado.path,
        nomeArquivo: file.name,
        tamanhoBytes: file.size,
        tipoMime: file.type || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // A action só devolve o id — completa o resto localmente (o próprio
      // upload que acabamos de fazer já tem tudo) pra não esperar o
      // `revalidatePath` recarregar a página inteira por trás do modal.
      onAnexado({
        id: result.id,
        transacao_id: transacaoId,
        tipo,
        storage_path: assinado.path,
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
        tipo_mime: file.type || null,
        enviado_por: null,
        created_at: new Date().toISOString(),
      });
    });
  }

  async function handleAbrir(storagePath: string) {
    setError(null);
    const result = await getUrlDownloadAnexo(storagePath);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  function handleRemover(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await removerAnexoTransacao(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onRemovido(id);
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-secondary">{titulo}</p>
        <Button variant="ghost" onClick={() => inputRef.current?.click()} disabled={pending} className="shrink-0 px-2.5 py-1 text-[11px]">
          {pending ? dict.financeiro.anexoEnviandoLabel : `+ ${dict.financeiro.anexarBtn}`}
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={handleArquivoSelecionado} />
      </div>

      {itens.length === 0 ? (
        <p className="text-[11px] text-ink-muted">{dict.financeiro.nenhumAnexoEnviado}</p>
      ) : (
        <div className="space-y-1.5">
          {itens.map((anexo) => (
            <div key={anexo.id} className="flex items-center justify-between gap-2 rounded border border-base-800 px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => handleAbrir(anexo.storage_path)}
                className="flex min-w-0 items-center gap-1.5 text-left text-xs text-ink-primary hover:underline"
              >
                <IconPaperclip className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{anexo.nome_arquivo}</span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] text-ink-muted">{fmtTamanhoArquivo(anexo.tamanho_bytes)}</span>
                <button
                  type="button"
                  onClick={() => handleRemover(anexo.id)}
                  disabled={pending}
                  className="text-ink-muted transition hover:text-danger"
                  aria-label={dict.common.remover}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1.5 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
