"use client";

import { useMemo, useState } from "react";
import type { AnuncioComRelacoes, FechamentoSemanalRow, MetaCalendarioRow } from "@/lib/types/infoprodutos";
import { domingoISO, calcularStatusPeriodo, STATUS_PERIODO_META, metaBatida, STATUS_META_LUCRO } from "@/lib/utils/infoprodutos";
import { addDaysISO, fmtBRL, todayISO } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FechamentoModal } from "@/components/admin/trafego/infoprodutos/FechamentoModal";
import { IconTarget, IconTrendingUp, IconLock, IconPercent } from "@/components/ui/icons";

interface Dashboard7DiasProps {
  anuncios: AnuncioComRelacoes[];
  metasCalendario: MetaCalendarioRow[];
  fechamentos: FechamentoSemanalRow[];
}

interface ResumoSemana {
  semanaInicio: string;
  semanaFim: string;
  receitaBrutaTotal: number;
  investimentoTotal: number;
  fechamento: FechamentoSemanalRow | null;
}

export function Dashboard7Dias({ anuncios, metasCalendario, fechamentos }: Dashboard7DiasProps) {
  const [semanaAbrindoFechamento, setSemanaAbrindoFechamento] = useState<ResumoSemana | null>(null);

  const hoje = todayISO();
  const metaPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    metasCalendario.forEach((m) => mapa.set(m.data, m.meta_lucro));
    return mapa;
  }, [metasCalendario]);

  const janela7Dias = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysISO(hoje, -i)), [hoje]);

  const resumoHoje = useMemo(() => {
    const doDia = anuncios.filter((a) => a.data === hoje);
    const lucro = doDia.reduce((acc, a) => acc + (Number(a.receita_bruta) - Number(a.investimento)), 0);
    return { lucro, meta: metaPorDia.get(hoje) ?? 0 };
  }, [anuncios, hoje, metaPorDia]);

  const resumoSemana = useMemo(() => {
    const doPeriodo = anuncios.filter((a) => janela7Dias.includes(a.data));
    const lucro = doPeriodo.reduce((acc, a) => acc + (Number(a.receita_bruta) - Number(a.investimento)), 0);
    const meta = janela7Dias.reduce((acc, d) => acc + (metaPorDia.get(d) ?? 0), 0);
    return { lucro, meta };
  }, [anuncios, janela7Dias, metaPorDia]);

  // Semanas de fechamento — agrupa os anúncios por `semana_inicio` (já vem
  // denormalizado do banco) pra montar a lista de "Fechamento da Semana".
  const semanas = useMemo(() => {
    const mapa = new Map<string, { receita: number; investimento: number }>();
    anuncios.forEach((a) => {
      const atual = mapa.get(a.semana_inicio) ?? { receita: 0, investimento: 0 };
      atual.receita += Number(a.receita_bruta);
      atual.investimento += Number(a.investimento);
      mapa.set(a.semana_inicio, atual);
    });

    const fechamentoPorSemana = new Map(fechamentos.map((f) => [f.semana_inicio, f]));

    const lista: ResumoSemana[] = Array.from(mapa.entries()).map(([semanaInicio, totais]) => ({
      semanaInicio,
      semanaFim: domingoISO(semanaInicio),
      receitaBrutaTotal: totais.receita,
      investimentoTotal: totais.investimento,
      fechamento: fechamentoPorSemana.get(semanaInicio) ?? null,
    }));

    return lista.sort((a, b) => (a.semanaInicio < b.semanaInicio ? 1 : -1));
  }, [anuncios, fechamentos]);

  const statusHoje = metaBatida(resumoHoje.lucro, resumoHoje.meta) ? STATUS_META_LUCRO.batida : STATUS_META_LUCRO.abaixo;
  const statusSemana = metaBatida(resumoSemana.lucro, resumoSemana.meta) ? STATUS_META_LUCRO.batida : STATUS_META_LUCRO.abaixo;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-primary">Hoje</p>
            <Badge tone={statusHoje.tone} label={statusHoje.label} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-ink-muted">Meta de Lucro</p>
              <p className="mt-1 text-lg font-semibold text-ink-primary">{fmtBRL(resumoHoje.meta)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Lucro Gerado</p>
              <p className={`mt-1 text-lg font-semibold ${resumoHoje.lucro >= 0 ? "text-status-good" : "text-status-critical"}`}>
                {fmtBRL(resumoHoje.lucro)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-primary">Últimos 7 Dias</p>
            <Badge tone={statusSemana.tone} label={statusSemana.label} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-ink-muted">Meta da Semana</p>
              <p className="mt-1 text-lg font-semibold text-ink-primary">{fmtBRL(resumoSemana.meta)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Lucro da Semana</p>
              <p className={`mt-1 text-lg font-semibold ${resumoSemana.lucro >= 0 ? "text-status-good" : "text-status-critical"}`}>
                {fmtBRL(resumoSemana.lucro)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={IconTarget} label="Meta de Hoje" value={fmtBRL(resumoHoje.meta)} hint="Lucro líquido no bolso" />
        <StatTile
          icon={IconTrendingUp}
          label="Lucro de Hoje"
          value={fmtBRL(resumoHoje.lucro)}
          tone={resumoHoje.lucro >= resumoHoje.meta && resumoHoje.meta > 0 ? "good" : "warning"}
          hint="Ainda bruto, se não fechado"
        />
        <StatTile icon={IconPercent} label="Meta da Semana" value={fmtBRL(resumoSemana.meta)} hint="Soma dos últimos 7 dias" />
        <StatTile
          icon={IconLock}
          label="Semanas Pendentes"
          value={semanas.filter((s) => !s.fechamento).length}
          tone={semanas.some((s) => !s.fechamento) ? "warning" : "good"}
          hint="Aguardando Fechamento"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink-primary">Fechamento por Semana</p>
        {semanas.length === 0 ? (
          <Card className="py-10 text-center text-sm text-ink-muted">Nenhum anúncio lançado ainda — a lista de semanas aparece aqui.</Card>
        ) : (
          <div className="space-y-2">
            {semanas.map((semana) => {
              const status = calcularStatusPeriodo(semana.semanaFim, Boolean(semana.fechamento));
              const statusMeta = STATUS_PERIODO_META[status];
              const lucro = semana.fechamento ? semana.fechamento.lucro_liquido_real : semana.receitaBrutaTotal - semana.investimentoTotal;
              return (
                <Card key={semana.semanaInicio} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-ink-primary">
                      {semana.semanaInicio.split("-").reverse().join("/")} a {semana.semanaFim.split("-").reverse().join("/")}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Receita {fmtBRL(semana.receitaBrutaTotal)} · Investimento {fmtBRL(semana.investimentoTotal)}
                      {semana.fechamento && ` · Reembolsos ${fmtBRL(semana.fechamento.reembolsos)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-ink-muted">{semana.fechamento ? "Lucro Líquido Real" : "Lucro Bruto"}</p>
                      <p className={`text-sm font-semibold ${lucro >= 0 ? "text-status-good" : "text-status-critical"}`}>{fmtBRL(lucro)}</p>
                    </div>
                    <Badge tone={statusMeta.tone} label={statusMeta.label} />
                    <Button variant="ghost" onClick={() => setSemanaAbrindoFechamento(semana)} className="px-3 py-1.5 text-xs">
                      {semana.fechamento ? "Editar" : "Fechar Semana"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {semanaAbrindoFechamento && (
        <FechamentoModal
          semanaInicio={semanaAbrindoFechamento.semanaInicio}
          semanaFim={semanaAbrindoFechamento.semanaFim}
          receitaBrutaTotal={semanaAbrindoFechamento.receitaBrutaTotal}
          investimentoTotal={semanaAbrindoFechamento.investimentoTotal}
          fechamentoExistente={semanaAbrindoFechamento.fechamento}
          onClose={() => setSemanaAbrindoFechamento(null)}
        />
      )}
    </div>
  );
}
