"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { fmtDataCurta, todayISO } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconPlus, IconX, IconChevronRight } from "@/components/ui/icons";
import { criarEvento } from "@/app/admin/eventos/actions";
import type { EventoComResumo, StatusEvento } from "@/lib/types/eventos";

/**
 * A lista de eventos — a porta do módulo.
 *
 * Cada linha responde, de relance, as três coisas que se quer saber de um
 * evento sem abri-lo: quando é, em que fase está, e — o número que só este
 * módulo tem — quanto da cobertura já existe. O contador de PERDIDO vem em
 * vermelho e separado porque é o único que não dá para consertar depois: uma
 * foto não feita às duas da manhã não vai ser feita mais.
 */
export function EventosWorkspace({
  eventos,
  clientes,
}: {
  eventos: EventoComResumo[];
  clientes: { id: string; nome: string }[];
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted">
          {eventos.length === 0 ? t.listaVazia : substituir(t.listaContagem, { n: eventos.length })}
        </p>
        <Button onClick={() => setModalAberto(true)} className="gap-1.5">
          <IconPlus className="h-4 w-4" />
          {t.novoEvento}
        </Button>
      </div>

      {eventos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-700 px-6 py-14 text-center">
          <p className="text-sm text-ink-secondary">{t.listaVaziaTitulo}</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-muted">{t.listaVaziaTexto}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {eventos.map((e) => (
            <LinhaDoEvento key={e.id} evento={e} />
          ))}
        </div>
      )}

      {modalAberto && <ModalNovoEvento clientes={clientes} onClose={() => setModalAberto(false)} />}
    </div>
  );
}

// ----------------------------------------------------------------------------

const TOM_DO_STATUS: Record<StatusEvento, string> = {
  planejamento: "border-base-600 text-ink-muted",
  montagem: "border-status-warning/40 text-status-warning",
  ao_vivo: "border-danger/50 text-danger",
  pos: "border-base-600 text-ink-secondary",
  encerrado: "border-base-700 text-ink-muted",
};

function LinhaDoEvento({ evento }: { evento: EventoComResumo }) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const cobertura =
    evento.capturas_total > 0 ? Math.round((evento.capturas_captadas / evento.capturas_total) * 100) : null;

  return (
    <a
      href={`/admin/eventos/${evento.id}`}
      className="group flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-base-800 bg-base-900/60 px-4 py-3.5 transition hover:border-base-600"
    >
      <div className="min-w-[12rem] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink-primary">{evento.nome}</span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]",
              TOM_DO_STATUS[evento.status]
            )}
          >
            {/* O ao vivo pisca: é o único estado em que alguém precisa estar olhando agora. */}
            {evento.status === "ao_vivo" && <span className="ev-rec mr-1 inline-block h-1 w-1 rounded-full bg-danger align-middle" />}
            {t.status[evento.status]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {[evento.cliente_nome, evento.local].filter(Boolean).join(" · ") || t.semCliente}
        </p>
      </div>

      <div className="font-mono text-[11px] tabular-nums text-ink-secondary">
        {fmtDataCurta(evento.inicio.slice(0, 10))}
        {evento.fim.slice(0, 10) !== evento.inicio.slice(0, 10) && (
          <span className="text-ink-muted"> → {fmtDataCurta(evento.fim.slice(0, 10))}</span>
        )}
      </div>

      <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
        <Numero valor={String(evento.ambientes)} rotulo={t.numeroAmbientes} />
        <Numero valor={String(evento.equipe)} rotulo={t.numeroEquipe} />
        {cobertura === null ? (
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">{t.semPauta}</span>
        ) : (
          <>
            <Numero valor={`${cobertura}%`} rotulo={t.numeroCobertura} acento />
            {evento.capturas_perdidas > 0 && (
              <Numero valor={String(evento.capturas_perdidas)} rotulo={t.numeroPerdido} alerta />
            )}
          </>
        )}
      </div>

      <IconChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-ink-primary" />
    </a>
  );
}

function Numero({ valor, rotulo, acento, alerta }: { valor: string; rotulo: string; acento?: boolean; alerta?: boolean }) {
  return (
    <span className="text-center">
      <span
        className={cn("block font-semibold", alerta ? "text-danger" : "text-ink-primary")}
        style={acento ? { color: "rgb(var(--color-accent))" } : undefined}
      >
        {valor}
      </span>
      <span className="block text-[9px] uppercase tracking-[0.12em] text-ink-muted">{rotulo}</span>
    </span>
  );
}

// ----------------------------------------------------------------------------
// Novo evento
// ----------------------------------------------------------------------------

/**
 * O formulário cria o evento E os primeiros ambientes.
 *
 * Os dois juntos porque um evento sem ambiente não desenha grade nenhuma — a
 * tela seguinte seria uma tela vazia pedindo para cadastrar algo antes de
 * poder fazer qualquer coisa. Quem está criando já sabe quantos palcos vai ter.
 */
function ModalNovoEvento({ clientes, onClose }: { clientes: { id: string; nome: string }[]; onClose: () => void }) {
  const { dict } = useLocale();
  const t = dict.eventos;

  const hoje = todayISO();
  const [nome, setNome] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [local, setLocal] = useState("");
  const [dataInicio, setDataInicio] = useState(hoje);
  const [horaInicio, setHoraInicio] = useState("20:00");
  const [dataFim, setDataFim] = useState(hoje);
  const [horaFim, setHoraFim] = useState("04:00");
  const [ambientes, setAmbientes] = useState<string[]>(["Palco principal"]);
  const [novoAmbiente, setNovoAmbiente] = useState("");
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const ERROS: Record<string, string> = {
    EVENTO_SEM_NOME: t.erroEventoSemNome,
    EVENTO_SEM_DATA: t.erroEventoSemData,
    EVENTO_FIM_ANTES: t.erroEventoFimAntes,
    AMBIENTE_SEM_NOME: t.erroAmbienteSemNome,
  };

  /**
   * Junta data + hora no instante com fuso.
   *
   * `new Date("2026-09-12T04:00:00")` sem sufixo de fuso é lido pelo navegador
   * no fuso DE QUEM ESTÁ OLHANDO — que é exatamente o que se quer: a pessoa
   * digitou "quatro da manhã" pensando no relógio dela. O `toISOString()`
   * converte para UTC na hora de gravar.
   */
  function instante(data: string, hora: string): string | null {
    if (!data || !hora) return null;
    const d = new Date(`${data}T${hora}:00`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  function adicionarAmbiente() {
    const limpo = novoAmbiente.trim();
    if (!limpo || ambientes.length >= 20) return;
    if (ambientes.some((a) => a.toLowerCase() === limpo.toLowerCase())) return;
    setAmbientes((a) => [...a, limpo]);
    setNovoAmbiente("");
  }

  function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    const inicio = instante(dataInicio, horaInicio);
    const fim = instante(dataFim, horaFim);
    if (!inicio || !fim) {
      setErro(t.erroEventoSemData);
      return;
    }

    iniciar(async () => {
      const r = await criarEvento(
        { nome, clienteId: clienteId || null, local: local || null, inicio, fim, observacoes: null },
        ambientes
      );
      if (!r.ok) {
        setErro(ERROS[r.error] ?? r.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{t.novoEvento}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.campoNome}</label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.campoNomePlaceholder} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.campoCliente}</label>
              <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">{t.semCliente}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.campoLocal}</label>
              <Input value={local} onChange={(e) => setLocal(e.target.value)} placeholder={t.campoLocalPlaceholder} />
            </div>
          </div>

          {/* Data E hora, nos dois lados. Um evento que começa 20h de sábado e
              termina 4h de domingo é a regra, não a exceção — e sem a hora a
              grade não sabe onde começar a desenhar. */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.campoInicio}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <DatePicker value={dataInicio} onChange={setDataInicio} />
                </div>
                <div className="w-[5.5rem] shrink-0">
                  <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.campoFim}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <DatePicker value={dataFim} onChange={setDataFim} />
                </div>
                <div className="w-[5.5rem] shrink-0">
                  <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.campoAmbientes}</label>
            <p className="mb-2 text-[11px] text-ink-muted">{t.campoAmbientesAjuda}</p>

            <div className="mb-2 flex flex-wrap gap-1.5">
              {ambientes.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full border border-base-700 py-1 pl-2.5 pr-1 text-[11px] text-ink-secondary"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => setAmbientes((lista) => lista.filter((x) => x !== a))}
                    className="rounded-full p-0.5 text-ink-muted transition hover:text-danger"
                    aria-label={substituir(t.removerAmbienteDe, { ambiente: a })}
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={novoAmbiente}
                onChange={(e) => setNovoAmbiente(e.target.value)}
                placeholder={t.campoAmbientesPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    adicionarAmbiente();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={adicionarAmbiente}
                disabled={!novoAmbiente.trim()}
                className="shrink-0 px-3 py-2 text-xs"
              >
                {dict.common.adicionar}
              </Button>
            </div>
          </div>

          {erro && <p className="text-sm text-danger">{erro}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={pendente || !nome.trim()}>
              {pendente ? dict.common.salvando : t.criarEvento}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
