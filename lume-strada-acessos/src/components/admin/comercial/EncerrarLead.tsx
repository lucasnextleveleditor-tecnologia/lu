"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconX, IconRotateCcw } from "@/components/ui/icons";
import { MOTIVOS_PERDA, REABORDAR_EM_DIAS, type MotivoPerda } from "@/lib/utils/comercial";
import { encerrarLead, reabrirLead } from "@/app/admin/comercial/actions";

/**
 * Encerrar um lead — e marcar quando tentar de novo.
 *
 * "Lead perdido" quase nunca é "não": é "não agora". A data de reabordagem
 * guarda esse "agora", e é o que transforma uma lista de derrotas numa fila de
 * trabalho futuro.
 *
 * Quando o dia chega, o sistema AVISA E NÃO REABRE o lead sozinho. Um lead que
 * volta ao funil por conta própria mente sobre o pipeline: olha-se "5 em
 * negociação" e um deles é um morto que o relógio ressuscitou. O aviso chega,
 * a pessoa decide — e reabrir é o botão que aparece aqui depois.
 *
 * O motivo é lista fechada, e não texto livre, porque só vale se virar número:
 * "perdi 6 dos 10 por preço" muda como se vende; "perdi 10 por vários motivos
 * escritos de dez jeitos" não responde nada.
 */
export function EncerrarLead({
  leadId,
  perdido,
  motivoAtual,
  reabordarEm,
}: {
  leadId: string;
  perdido: boolean;
  motivoAtual: MotivoPerda | null;
  reabordarEm: string | null;
}) {
  const { dict, locale } = useLocale();
  const t = dict.comercial;

  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState<MotivoPerda | "">("");
  const [dias, setDias] = useState<string>("60");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function confirmar() {
    if (!motivo) {
      setErro(t.escolhaOMotivo);
      return;
    }
    setErro(null);
    startTransition(async () => {
      const r = await encerrarLead(leadId, motivo, dias === "" ? null : Number(dias));
      if (!r.ok) setErro(r.error);
      else setAberto(false);
    });
  }

  function reabrir() {
    setErro(null);
    startTransition(async () => {
      const r = await reabrirLead(leadId);
      if (!r.ok) setErro(r.error);
    });
  }

  if (perdido) {
    return (
      <div className="rounded-lg border border-base-700 bg-base-950/40 p-3">
        <p className="text-xs text-ink-secondary">
          {t.encerradoComo}{" "}
          <span className="font-medium text-ink-primary">
            {motivoAtual ? t.motivosPerda[motivoAtual] : t.motivoNaoInformado}
          </span>
        </p>
        <p className="mt-1 text-[11px] text-ink-muted">
          {reabordarEm
            ? t.reabordarMarcado.replace("{data}", new Date(`${reabordarEm}T00:00:00`).toLocaleDateString(locale))
            : t.semReabordagem}
        </p>
        <Button variant="ghost" onClick={reabrir} disabled={pending} className="mt-2 px-3 py-1.5 text-xs">
          <IconRotateCcw className="h-3.5 w-3.5" />
          {t.reabrirLead}
        </Button>
        {erro && <p className="mt-1.5 text-xs text-danger">{erro}</p>}
      </div>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs font-medium text-danger transition hover:underline"
      >
        {t.encerrarLead}
      </button>
    );
  }

  return (
    <div className={cn("rounded-lg border border-status-critical/40 bg-status-critical/5 p-3")}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-primary">{t.encerrarLead}</p>
        <button type="button" onClick={() => setAberto(false)} className="text-ink-muted hover:text-ink-primary">
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>

      <label className="mb-1 block text-[11px] text-ink-muted">{t.motivoDaPerda}</label>
      <Select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoPerda | "")} className="text-xs">
        <option value="">{dict.common.selecione}</option>
        {MOTIVOS_PERDA.map((m) => (
          <option key={m} value={m}>
            {t.motivosPerda[m]}
          </option>
        ))}
      </Select>

      <label className="mb-1 mt-2.5 block text-[11px] text-ink-muted">{t.avisarParaRetomar}</label>
      <Select value={dias} onChange={(e) => setDias(e.target.value)} className="text-xs">
        {REABORDAR_EM_DIAS.map((d) => (
          <option key={d} value={d}>
            {t.emDias.replace("{n}", String(d))}
          </option>
        ))}
        <option value="">{t.nuncaMais}</option>
      </Select>

      <div className="mt-3 flex gap-2">
        <Button variant="danger" onClick={confirmar} disabled={pending} className="px-3 py-1.5 text-xs">
          {pending ? dict.common.salvando : t.confirmarEncerramento}
        </Button>
        <Button variant="ghost" onClick={() => setAberto(false)} className="px-3 py-1.5 text-xs">
          {dict.common.cancelar}
        </Button>
      </div>

      {erro && <p className="mt-1.5 text-xs text-danger">{erro}</p>}
    </div>
  );
}
