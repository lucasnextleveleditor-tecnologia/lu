import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, MetaDiariaRow, TrafegoRegistroRow } from "@/lib/types/database";
import { calcularStatus, fmtData } from "@/lib/utils/status";
import { calcularResumoTrafego, STATUS_TRAFEGO_META } from "@/lib/utils/trafego";
import { fmtBRL, fmtPercent, fmtDataExtensa, todayISO } from "@/lib/utils/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Meter } from "@/components/ui/Meter";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

/**
 * Dashboard do cliente — deliberadamente simples e SOMENTE LEITURA. Mostra
 * o status do próprio acesso, o andamento do tráfego de hoje em relação à
 * Meta Diária que o admin definiu (mesma lógica derivada de
 * calcularResumoTrafego usada no painel admin — nunca um número diferente
 * pra cada lado) e um espaço para o conteúdo liberado pela agência.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, expires_at, active")
    .eq("id", user!.id)
    .single()
    .overrideTypes<Pick<ProfileRow, "full_name" | "expires_at" | "active">, { merge: false }>();

  const status = profile ? calcularStatus(profile) : "inativo";

  const hoje = todayISO();

  const { data: metasHoje } = await supabase
    .from("metas_diarias")
    .select("*")
    .eq("cliente_id", user!.id)
    .eq("data", hoje)
    .limit(1)
    .overrideTypes<MetaDiariaRow[], { merge: false }>();

  const meta = metasHoje?.[0] ?? null;

  const { data: registros } = meta
    ? await supabase
        .from("trafego_registros")
        .select("*")
        .eq("meta_id", meta.id)
        .order("created_at", { ascending: true })
        .overrideTypes<TrafegoRegistroRow[], { merge: false }>()
    : { data: [] as TrafegoRegistroRow[] };

  const resumo = calcularResumoTrafego(meta, registros ?? []);
  const statusMeta = STATUS_TRAFEGO_META[resumo.status];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Olá, {profile?.full_name?.split(" ")[0] || "bem-vindo(a)"}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Este é o seu espaço de acesso à Lume Strada Filmes.</p>
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">Status do seu acesso</p>
          <div className="mt-1.5">
            <StatusBadge status={status} />
          </div>
        </div>
        <p className="text-xs text-ink-secondary">
          {profile?.expires_at ? `Válido até ${fmtData(profile.expires_at)}` : "Sem prazo de expiração definido"}
        </p>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Tráfego de hoje</h2>
            <p className="text-xs text-ink-muted">{fmtDataExtensa(hoje)}</p>
          </div>
          <Badge tone={statusMeta.tone} label={statusMeta.label} />
        </div>

        {!meta ? (
          <div className="rounded-xl border border-dashed border-base-700 py-10 text-center text-sm text-ink-muted">
            Sua agência ainda não definiu uma meta para hoje.
          </div>
        ) : (
          <>
            {meta.objetivo && <p className="mb-4 text-sm text-ink-secondary">{meta.objetivo}</p>}

            <div className="mb-4 rounded-xl border border-base-700 bg-base-950/60 p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-ink-secondary">
                <span>
                  Investido: <span className="font-medium text-ink-primary">{fmtBRL(resumo.totalInvestido)}</span>
                  {meta.valor_investido_meta > 0 && <> de {fmtBRL(meta.valor_investido_meta)}</>}
                </span>
                {resumo.pctInvestido !== null && <span className="font-medium text-ink-primary">{fmtPercent(resumo.pctInvestido)}</span>}
              </div>
              <Meter pct={resumo.pctInvestido ?? 0} tone={statusMeta.tone} />
              <p className="mt-2 text-xs text-ink-secondary">
                Leads: <span className="font-medium text-ink-primary">{resumo.totalLeads}</span>
                {meta.leads_meta != null && <> de {meta.leads_meta}</>}
              </p>
            </div>

            {registros && registros.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Campanhas de hoje</p>
                <div className="space-y-2">
                  {registros.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-base-700 bg-base-950/40 px-3 py-2 text-sm"
                    >
                      <p className="truncate font-medium">{r.nome_campanha || "Lançamento sem nome"}</p>
                      <p className="shrink-0 text-xs text-ink-muted">
                        {fmtBRL(r.valor_investido)} · {r.leads_gerados} lead(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold">Conteúdo liberado</h2>
        <p className="mb-6 text-xs text-ink-muted">
          Aqui aparecem os projetos, vídeos e materiais que a Lume Strada liberar para você.
        </p>
        <div className="rounded-xl border border-dashed border-base-700 py-14 text-center text-sm text-ink-muted">
          Nenhum conteúdo publicado ainda.
        </div>
      </Card>
    </div>
  );
}
