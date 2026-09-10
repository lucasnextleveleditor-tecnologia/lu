"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PAPEIS_SIGNATARIO,
  corDoSignatario,
  papelDe,
  type EventoAssinaturaRow,
  type SignatarioRow,
} from "@/lib/types/assinatura";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import {
  IconSend,
  IconCopy,
  IconCheck,
  IconMessageCircle,
  IconRotateCcw,
  IconActivity,
  IconDownload,
  IconFileText,
  IconAlertTriangle,
} from "@/components/ui/icons";
import { enviarParaAssinatura, regerarDocumentoAssinado, voltarParaRascunho } from "@/app/admin/assinaturas/actions";

const ROTULO: Record<string, { texto: string; cor: string }> = {
  pendente: { texto: "Aguardando", cor: "text-ink-muted" },
  visualizado: { texto: "Abriu o documento", cor: "text-status-warning" },
  assinado: { texto: "Assinou", cor: "text-status-good" },
  recusado: { texto: "Recusou", cor: "text-danger" },
};

/**
 * Depois do envio: o link de cada pessoa e a trilha do documento.
 *
 * Cada signatário tem o PRÓPRIO link — nunca um link compartilhado. É o que
 * permite dizer, depois, qual pessoa abriu e assinou de qual endereço: um
 * link só para todos registraria quatro acessos sem saber de quem era cada
 * um, e não sustentaria nada.
 */
export function PainelDeEnvio({
  documentoId,
  titulo,
  status,
  temArquivoAssinado,
  signatarios,
  eventos,
}: {
  documentoId: string;
  titulo: string;
  status: string;
  /** Se o PDF final carimbado já foi gerado e está no Storage. */
  temArquivoAssinado: boolean;
  signatarios: SignatarioRow[];
  eventos: EventoAssinaturaRow[];
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [pendente, start] = useTransition();

  const origem = typeof window === "undefined" ? "" : window.location.origin;
  const enviado = status !== "rascunho";
  const concluido = status === "assinado";

  async function copiar(token: string) {
    try {
      await navigator.clipboard.writeText(`${origem}/assinar/${token}`);
      setCopiado(token);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Sem permissão de área de transferência: o campo abaixo continua ali.
    }
  }

  return (
    <div className="space-y-5">
      {!enviado ? (
        <div className="rounded-2xl border border-base-700 bg-base-900/60 p-4">
          <p className="text-sm font-semibold text-ink-primary">Pronto para enviar?</p>
          <p className="mt-1 text-xs leading-snug text-ink-muted">
            Depois de enviar, cada pessoa recebe o próprio link. O documento fica travado — para mexer nos campos você
            precisa voltar para rascunho, e isso só é possível enquanto ninguém tiver assinado.
          </p>
          <Button
            className="mt-3 w-full"
            disabled={pendente}
            onClick={() =>
              start(async () => {
                const r = await enviarParaAssinatura(documentoId);
                if (!r.ok) setErro(r.error);
                else {
                  setErro(null);
                  router.refresh();
                }
              })
            }
          >
            <IconSend className="h-4 w-4" /> Enviar para assinatura
          </Button>
          {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">Links de assinatura</p>
            {status === "enviado" && (
              <Button
                variant="ghost"
                className="px-2 py-1 text-[11px]"
                disabled={pendente}
                onClick={() =>
                  start(async () => {
                    const r = await voltarParaRascunho(documentoId);
                    if (!r.ok) setErro(r.error);
                    else router.refresh();
                  })
                }
              >
                <IconRotateCcw className="h-3 w-3" /> Voltar para rascunho
              </Button>
            )}
          </div>

          {erro && <p className="text-xs text-danger">{erro}</p>}

          <ul className="space-y-2">
            {signatarios.map((s, i) => {
              const url = `${origem}/assinar/${s.token}`;
              const marca = ROTULO[s.status] ?? ROTULO.pendente;
              const papel = PAPEIS_SIGNATARIO[papelDe(s.papel)];
              // O convite diz o que se espera da pessoa. "Segue para
              // assinatura" mandado a uma testemunha começa a conversa com a
              // informação errada.
              const mensagem = `Olá${s.nome ? ` ${s.nome}` : ""}! Segue o documento "${titulo}" para ${papel.rotulo.toLowerCase()}: ${url}`;
              return (
                <li key={s.id} className="rounded-xl border border-base-800 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: corDoSignatario(i) }} />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-primary">
                      {s.nome || s.email || `Signatário ${i + 1}`}
                    </span>
                    <span className="shrink-0 rounded-full border border-base-700 px-1.5 py-0.5 text-[10px] text-ink-muted">
                      {papel.rotulo}
                    </span>
                    <span className={cn("shrink-0 text-[11px]", marca?.cor)}>{marca?.texto}</span>
                  </div>

                  {s.status === "assinado" ? (
                    <p className="text-[11px] leading-snug text-ink-muted">
                      {papel.feito} · {s.nome_informado} · CPF {s.cpf_informado ?? "—"} ·{" "}
                      {s.assinado_em ? new Date(s.assinado_em).toLocaleString("pt-BR") : ""} · IP {s.ip ?? "—"}
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        readOnly
                        value={url}
                        onFocus={(e) => e.currentTarget.select()}
                        className="min-w-0 flex-1 truncate rounded-lg border border-base-700 bg-base-950 px-2 py-1 text-[11px] text-ink-secondary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void copiar(s.token)}
                        title="Copiar link"
                        className="shrink-0 rounded-lg border border-base-700 p-1.5 text-ink-secondary transition hover:text-ink-primary"
                      >
                        {copiado === s.token ? (
                          <IconCheck className="h-3 w-3 text-status-good" />
                        ) : (
                          <IconCopy className="h-3 w-3" />
                        )}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Mandar no WhatsApp"
                        className="shrink-0 rounded-lg border border-base-700 p-1.5 text-ink-secondary transition hover:text-accent"
                      >
                        <IconMessageCircle className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* O ARQUIVO                                                         */}
      {/* ---------------------------------------------------------------- */}
      {/*
        Duas vias, e elas são coisas diferentes: o ORIGINAL é o arquivo de
        onde saiu o hash e é o que cada pessoa leu antes de assinar; o
        ASSINADO é esse mesmo arquivo com as assinaturas nos lugares
        marcados e o manifesto no fim. Guardar os dois é o que permite, se
        alguém contestar, mostrar que o texto não mudou entre um e outro.
      */}
      {enviado && (
        <div className="space-y-2 rounded-2xl border border-base-700 bg-base-900/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">Arquivo</p>

          {concluido && temArquivoAssinado && (
            <a
              href={`/api/assinaturas/${documentoId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
            >
              <IconDownload className="h-4 w-4" /> Baixar PDF assinado
            </a>
          )}

          {concluido && !temArquivoAssinado && (
            <div className="space-y-2">
              <p className="flex items-start gap-1.5 text-[11px] leading-snug text-status-warning">
                <IconAlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                Todos assinaram, mas o PDF final não foi montado. As assinaturas continuam registradas — é só refazer o
                arquivo.
              </p>
              <Button
                variant="ghost"
                className="w-full"
                disabled={pendente}
                onClick={() =>
                  start(async () => {
                    const r = await regerarDocumentoAssinado(documentoId);
                    if (!r.ok) setErro(r.error);
                    else {
                      setErro(null);
                      router.refresh();
                    }
                  })
                }
              >
                <IconRotateCcw className="h-4 w-4" /> Gerar PDF assinado
              </Button>
            </div>
          )}

          <a
            href={`/api/assinaturas/${documentoId}/pdf?original=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted transition hover:text-ink-secondary"
          >
            <IconFileText className="h-3 w-3" /> Baixar o original enviado
          </a>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TRILHA                                                            */}
      {/* ---------------------------------------------------------------- */}
      {eventos.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            <IconActivity className="h-3 w-3" /> Trilha do documento
          </p>
          <ol className="space-y-2 border-l border-base-800 pl-3">
            {eventos.map((e) => (
              <li key={e.id} className="relative text-[11px]">
                <span className="absolute -left-[17px] top-1.5 h-1.5 w-1.5 rounded-full bg-base-600" aria-hidden />
                <p className="text-ink-secondary">{e.descricao}</p>
                <p className="text-ink-muted">
                  {new Date(e.created_at).toLocaleString("pt-BR")}
                  {e.ip ? ` · IP ${e.ip}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
