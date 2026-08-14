"use client";

import { useMemo, useState, useTransition } from "react";
import type { MetaCalendarioRow } from "@/lib/types/infoprodutos";
import { addMeses, fmtMesAno, gradeDoMes } from "@/lib/utils/infoprodutos";
import { fmtBRL, todayISO } from "@/lib/utils/format";
import { salvarMetaCalendario } from "@/app/admin/trafego/infoprodutos-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Calendário interativo pra digitar a Meta de Lucro Líquido de cada dia — clica no dia, digita, salva. */
export function CalendarioMetas({ metasCalendario }: { metasCalendario: MetaCalendarioRow[] }) {
  const [referencia, setReferencia] = useState(() => {
    const hoje = new Date();
    return new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
  });
  const [diaSelecionado, setDiaSelecionado] = useState<string>(todayISO());
  const [metaInput, setMetaInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const metaPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    metasCalendario.forEach((m) => mapa.set(m.data, m.meta_lucro));
    return mapa;
  }, [metasCalendario]);

  const semanas = useMemo(() => gradeDoMes(referencia), [referencia]);
  const hoje = todayISO();

  function selecionarDia(dia: string) {
    setDiaSelecionado(dia);
    setMetaInput(String(metaPorDia.get(dia) ?? ""));
    setSalvo(false);
    setError(null);
  }

  function handleSalvar() {
    setError(null);
    setSalvo(false);
    startTransition(async () => {
      const result = await salvarMetaCalendario(diaSelecionado, Number(metaInput) || 0);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSalvo(true);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-primary">{fmtMesAno(referencia)}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReferencia((r) => addMeses(r, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label="Mês anterior"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                const hojeD = new Date();
                setReferencia(new Date(Date.UTC(hojeD.getUTCFullYear(), hojeD.getUTCMonth(), 1)));
              }}
              className="rounded-lg border border-base-600 px-2.5 py-1 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
            >
              Hoje
            </button>
            <button
              onClick={() => setReferencia((r) => addMeses(r, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-base-600 text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
              aria-label="Próximo mês"
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DIAS_SEMANA.map((d) => (
            <p key={d} className="text-center text-[11px] font-medium uppercase text-ink-muted">
              {d}
            </p>
          ))}
        </div>

        <div className="space-y-1.5">
          {semanas.map((semana, i) => (
            <div key={i} className="grid grid-cols-7 gap-1.5">
              {semana.map((dia, j) => {
                if (!dia) return <div key={j} className="min-h-[64px]" />;
                const meta = metaPorDia.get(dia);
                const selecionado = dia === diaSelecionado;
                const ehHoje = dia === hoje;
                return (
                  <button
                    key={dia}
                    onClick={() => selecionarDia(dia)}
                    className={cn(
                      "min-h-[64px] rounded-lg border p-1.5 text-left transition",
                      selecionado ? "border-accent bg-base-800" : ehHoje ? "border-accent/50" : "border-base-800 hover:border-base-600"
                    )}
                  >
                    <p className="text-xs text-ink-secondary">{Number(dia.slice(-2))}</p>
                    {meta != null && meta > 0 && <p className="mt-1 truncate text-[10px] font-medium text-ink-primary">{fmtBRL(meta)}</p>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card className="h-fit p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Meta de Lucro do Dia</p>
        <p className="mb-4 text-sm text-ink-primary">{diaSelecionado.split("-").reverse().join("/")}</p>

        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Meta de lucro líquido (R$)</label>
        <Input type="number" min="0" step="0.01" value={metaInput} onChange={(e) => setMetaInput(e.target.value)} placeholder="0,00" />

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        {salvo && <p className="mt-2 text-xs text-ink-secondary">Meta salva.</p>}

        <Button onClick={handleSalvar} disabled={pending} className="mt-3 w-full">
          {pending ? "Salvando..." : "Salvar Meta"}
        </Button>
      </Card>
    </div>
  );
}
