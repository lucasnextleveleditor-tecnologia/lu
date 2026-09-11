"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { fmtDataCurta } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconExternalLink, IconPlus, IconX, IconFileText, IconUpload } from "@/components/ui/icons";
import {
  listarContratosDoCliente,
  listarContratosSemCliente,
  vincularContratoAoCliente,
  desvincularContrato,
  anexarContratoExterno,
  type ContratoDoCliente,
  type ContratoVinculavel,
} from "@/app/admin/contratos/cliente-actions";

/**
 * O contrato do cliente, dentro da ficha dele.
 *
 * Duas origens na mesma lista: o contrato gerado e assinado aqui (abre na
 * página pública dele) e o assinado fora, que entra por link ou arquivo. São
 * uma lista só de propósito — quem pergunta "o que esse cliente assinou?" não
 * quer saber por qual caminho o documento chegou, e duas listas garantiriam
 * que um dia alguém olha só uma delas.
 *
 * Busca sob demanda ao abrir a ficha, mesmo padrão de `AtividadesManager`.
 */
export function ContratosDoCliente({ clienteId, editavel }: { clienteId: string; editavel: boolean }) {
  const { dict } = useLocale();
  const t = dict.cadastros;

  const [contratos, setContratos] = useState<ContratoDoCliente[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const [painel, setPainel] = useState<"nenhum" | "vincular" | "anexar">("nenhum");
  const [vinculaveis, setVinculaveis] = useState<ContratoVinculavel[] | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [assinadoEm, setAssinadoEm] = useState("");
  const [link, setLink] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const ERROS: Record<string, string> = {
    CONTRATO_SEM_TITULO: t.erroContratoSemTitulo,
    CONTRATO_SEM_DOCUMENTO: t.erroContratoSemDocumento,
    CONTRATO_LINK_E_ARQUIVO: t.erroContratoLinkEArquivo,
    CONTRATO_LINK_INVALIDO: t.erroContratoLinkInvalido,
    CONTRATO_ARQUIVO_GRANDE: t.erroContratoArquivoGrande,
    CONTRATO_ARQUIVO_TIPO: t.erroContratoArquivoTipo,
    CONTRATO_JA_VINCULADO: t.erroContratoJaVinculado,
    CONTRATO_NAO_ENCONTRADO: t.erroContratoNaoEncontrado,
    CONTRATO_SEM_CLIENTE: t.erroContratoNaoEncontrado,
    SEM_EMPRESA: t.erroContratoNaoEncontrado,
  };
  const textoDoErro = (codigo: string) => ERROS[codigo] ?? codigo;

  useEffect(() => {
    let ativo = true;
    listarContratosDoCliente(clienteId).then((lista) => {
      if (ativo) setContratos(lista);
    });
    return () => {
      ativo = false;
    };
  }, [clienteId]);

  async function recarregar() {
    setContratos(await listarContratosDoCliente(clienteId));
  }

  function abrirVincular() {
    setErro(null);
    setPainel("vincular");
    if (vinculaveis === null) {
      startTransition(async () => setVinculaveis(await listarContratosSemCliente()));
    }
  }

  function vincular(contratoId: string) {
    setErro(null);
    startTransition(async () => {
      const r = await vincularContratoAoCliente(contratoId, clienteId);
      if (!r.ok) {
        setErro(textoDoErro(r.error));
        return;
      }
      setVinculaveis((atual) => atual?.filter((c) => c.id !== contratoId) ?? null);
      setPainel("nenhum");
      await recarregar();
    });
  }

  function remover(contratoId: string) {
    setErro(null);
    setConfirmandoRemocao(null);
    startTransition(async () => {
      const r = await desvincularContrato(contratoId);
      if (!r.ok) {
        setErro(textoDoErro(r.error));
        return;
      }
      // O do sistema volta a ficar sem dono, então a lista de vinculáveis
      // envelheceu — buscar de novo na próxima abertura.
      setVinculaveis(null);
      await recarregar();
    });
  }

  function anexar() {
    setErro(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("clienteId", clienteId);
      form.set("titulo", titulo);
      form.set("assinadoEm", assinadoEm);
      form.set("link", link);
      if (arquivo) form.set("arquivo", arquivo);

      const r = await anexarContratoExterno(form);
      if (!r.ok) {
        setErro(textoDoErro(r.error));
        return;
      }
      setTitulo("");
      setAssinadoEm("");
      setLink("");
      setArquivo(null);
      setPainel("nenhum");
      await recarregar();
    });
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-ink-primary">{t.contratosTitulo}</h4>

      {contratos === null ? (
        <p className="py-4 text-center text-xs text-ink-muted">{dict.common.carregando}</p>
      ) : contratos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-base-700 px-4 py-5 text-center text-xs text-ink-muted">{t.contratosVazio}</p>
      ) : (
        <ul className="space-y-2">
          {contratos.map((c) => (
            <li key={c.id} className="rounded-xl border border-base-800 bg-base-950/40 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <IconFileText className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                    <span className="truncate text-sm font-medium text-ink-primary">{c.titulo}</span>
                    {/* Etiqueta neutra, sem `Badge`: origem não é status. Os
                        tons do `Badge` significam bom/atenção/crítico, e usar
                        um deles aqui diria que contrato externo é pior do que
                        o gerado aqui — os dois são igualmente válidos. */}
                    <span className="shrink-0 rounded-full border border-base-700 px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                      {c.origem === "externo" ? t.contratoExterno : t.contratoDoSistema}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {c.assinadoEm ? substituir(t.contratoAssinadoEm, { data: fmtDataCurta(c.assinadoEm.slice(0, 10)) }) : t.contratoNaoAssinado}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {c.href && (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-base-600 px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                    >
                      <IconExternalLink className="h-3 w-3" />
                      {t.contratoAbrir}
                    </a>
                  )}
                  {editavel &&
                    (confirmandoRemocao === c.id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-status-critical/30 bg-status-critical/10 px-2 py-1 text-[11px]">
                        <span className="text-ink-primary">{t.removerContratoPergunta}</span>
                        <button onClick={() => remover(c.id)} disabled={pending} className="font-medium text-danger hover:underline">
                          {dict.common.sim}
                        </button>
                        <button onClick={() => setConfirmandoRemocao(null)} disabled={pending} className="text-ink-muted hover:text-ink-primary">
                          {dict.common.nao}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmandoRemocao(c.id)}
                        disabled={pending}
                        title={t.removerContrato}
                        aria-label={t.removerContrato}
                        className="rounded-lg p-1 text-ink-muted transition hover:text-danger disabled:opacity-40"
                      >
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editavel && painel === "nenhum" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={abrirVincular}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            <IconPlus className="h-3.5 w-3.5" />
            {t.vincularContrato}
          </button>
          <button
            type="button"
            onClick={() => {
              setErro(null);
              setPainel("anexar");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            <IconUpload className="h-3.5 w-3.5" />
            {t.anexarContrato}
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          Vincular um contrato que já existe no sistema e ainda não tem dono.
          --------------------------------------------------------------------- */}
      {painel === "vincular" && (
        <div className="mt-3 rounded-xl border border-base-700 bg-base-950/40 p-3">
          <Cabecalho titulo={t.vincularContrato} onFechar={() => setPainel("nenhum")} fechar={dict.common.fechar} />
          {vinculaveis === null ? (
            <p className="py-3 text-center text-xs text-ink-muted">{dict.common.carregando}</p>
          ) : vinculaveis.length === 0 ? (
            <p className="py-3 text-center text-xs text-ink-muted">{t.vincularContratoVazio}</p>
          ) : (
            <ul className="space-y-1.5">
              {vinculaveis.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-base-800 px-2.5 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-ink-primary">{c.titulo}</p>
                    <p className="text-[11px] text-ink-muted">
                      {c.nomeCliente} · {fmtDataCurta(c.criadoEm.slice(0, 10))}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => vincular(c.id)} disabled={pending} className="shrink-0 px-2.5 py-1 text-[11px]">
                    {t.vincular}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------------
          Anexar o que foi assinado fora: link OU arquivo, nunca os dois.
          --------------------------------------------------------------------- */}
      {painel === "anexar" && (
        <div className="mt-3 space-y-3 rounded-xl border border-base-700 bg-base-950/40 p-3">
          <Cabecalho titulo={t.anexarContrato} onFechar={() => setPainel("nenhum")} fechar={dict.common.fechar} />

          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <div>
              <label className="mb-1 block text-[11px] text-ink-secondary">{t.contratoTituloLabel}</label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={t.contratoTituloPlaceholder} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-ink-secondary">{t.contratoDataLabel}</label>
              <DatePicker value={assinadoEm} onChange={setAssinadoEm} clearable />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-ink-secondary">{t.contratoLinkLabel}</label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={t.contratoLinkPlaceholder}
              disabled={Boolean(arquivo)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-base-800" />
            <span className="text-[10px] uppercase tracking-wide text-ink-muted">{t.contratoOuEntao}</span>
            <span className="h-px flex-1 bg-base-800" />
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-ink-secondary">{t.contratoArquivoLabel}</label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              disabled={Boolean(link.trim())}
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              className={cn(
                "block w-full text-xs text-ink-secondary file:mr-3 file:rounded-lg file:border file:border-base-600 file:bg-base-900",
                "file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink-secondary hover:file:text-ink-primary",
                link.trim() && "opacity-40"
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={anexar} disabled={pending || !titulo.trim() || (!link.trim() && !arquivo)} className="px-3 py-1.5 text-xs">
              {pending ? dict.common.salvando : t.anexar}
            </Button>
          </div>
        </div>
      )}

      {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
    </div>
  );
}

function Cabecalho({ titulo, onFechar, fechar }: { titulo: string; onFechar: () => void; fechar: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="text-xs font-medium text-ink-primary">{titulo}</p>
      <button type="button" onClick={onFechar} className="rounded-lg p-1 text-ink-muted transition hover:text-ink-primary" aria-label={fechar}>
        <IconX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
