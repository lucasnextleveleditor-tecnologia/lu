import { StatTile } from "@/components/ui/StatTile";
import { IconCalendar, IconClipboardList, IconLayers } from "@/components/ui/icons";
import { AgendaCalendario } from "@/components/admin/agenda/AgendaCalendario";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarDadosAgenda } from "@/app/admin/agenda/data";

export const dynamic = "force-dynamic";

/**
 * Tela principal do módulo — StatTiles com as contagens do mês ATUAL
 * (calculadas no servidor, ver `data.ts`), calendário logo abaixo com o
 * grid mensal + filtro por tipo + botão "Novo Compromisso" (tudo dentro de
 * `AgendaCalendario`, que também gerencia o modal de criação/edição —
 * mesmo espírito de `ProducaoWorkspace.tsx` possuir o próprio botão "Nova
 * Tarefa").
 */
export default async function AgendaPage() {
  const { dict } = await getDictionary();
  const { compromissos, tarefasAgenda, leadsAgenda, clientes, eventosNoMes, compromissosManuaisNoMes, autoNoMes } = await buscarDadosAgenda();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{dict.agenda.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{dict.agenda.subtituloPagina}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={IconCalendar}
          label={dict.agenda.statEventosMesLabel}
          value={eventosNoMes}
          moduleColor="#fb7185"
          hint={dict.agenda.hintEventosMes.replace("{n}", String(eventosNoMes))}
        />
        <StatTile
          icon={IconClipboardList}
          label={dict.agenda.statCompromissosManuaisLabel}
          value={compromissosManuaisNoMes}
          hint={dict.agenda.hintCompromissosManuais}
        />
        <StatTile icon={IconLayers} label={dict.agenda.statAutoLabel} value={autoNoMes} hint={dict.agenda.hintAuto} />
      </div>

      <AgendaCalendario compromissos={compromissos} tarefasAgenda={tarefasAgenda} leadsAgenda={leadsAgenda} clientes={clientes} eventosNoMes={eventosNoMes} />
    </div>
  );
}
