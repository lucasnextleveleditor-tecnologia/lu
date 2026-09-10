import Link from "next/link";
import { notFound } from "next/navigation";
import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fmtDataCurta } from "@/lib/utils/format";
import { substituir } from "@/lib/utils/texto";
import { cn } from "@/lib/utils/cn";
import { FormularioDoPlano } from "@/components/admin/planejamento/FormularioDoPlano";
import { CalendarioDeConteudo } from "@/components/admin/planejamento/CalendarioDeConteudo";
import { IconChevronLeft, IconCalendar, IconPrinter } from "@/components/ui/icons";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { PlanoRow, StatusDoPlano } from "@/lib/types/planejamento";
import type { TarefaRow } from "@/lib/types/producao";

export const dynamic = "force-dynamic";

/**
 * UM ciclo de planejamento.
 *
 * O endereço é o do PLANO e não o do cliente, ao contrário do onboarding —
 * porque aqui existe mais de um por cliente, e a notificação do sino precisa
 * levar ao ciclo específico que está vencendo, não a uma lista onde a pessoa
 * teria que adivinhar qual era.
 *
 * As três leituras vêm do servidor, já com a RLS aplicada: um id de outra
 * agência simplesmente não devolve linha, e aqui vira 404 — nunca "sem
 * permissão", que confirmaria que aquele plano existe em algum lugar.
 */
export default async function CicloDePlanejamentoPage({ params }: { params: Promise<{ planoId: string }> }) {
  const { supabase } = await requireModuloOuRedirect("clientes");
  const { planoId } = await params;
  const { dict } = await getDictionary();
  const t = dict.planejamento;

  const { data: plano } = await supabase
    .from("planos_estrategicos")
    .select("*")
    .eq("id", planoId)
    .maybeSingle<PlanoRow>();

  if (!plano) notFound();

  const [clienteRes, irmaosRes, postsRes, funcionariosRes] = await Promise.all([
    supabase.from("clientes").select("id, nome").eq("id", plano.cliente_id).maybeSingle<Pick<ClienteRow, "id" | "nome">>(),
    supabase
      .from("planos_estrategicos")
      .select("id, data_inicio, data_fim, status, duracao_meses")
      .eq("cliente_id", plano.cliente_id)
      .order("data_inicio", { ascending: false })
      .overrideTypes<Pick<PlanoRow, "id" | "data_inicio" | "data_fim" | "status" | "duracao_meses">[], { merge: false }>(),
    // Os posts DESTE ciclo — em pauta e já em produção, na mesma consulta.
    // São a mesma tabela e a mesma linha: o que separa os dois é só a coluna
    // `em_pauta`, e separar em memória custa menos que duas idas ao banco.
    supabase
      .from("prod_tarefas")
      .select("*")
      .eq("plano_id", planoId)
      .order("data_entrega", { ascending: true })
      .overrideTypes<TarefaRow[], { merge: false }>(),
    // A mesma lista de pessoas que Produção usa (`prod_funcionarios`, que é
    // espelho automático da Equipe) — para o responsável escolhido aqui ser
    // exatamente o responsável que aparece lá.
    supabase
      .from("prod_funcionarios")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome")
      .overrideTypes<{ id: string; nome: string }[], { merge: false }>(),
  ]);

  if (!clienteRes.data) notFound();

  const rotuloStatus: Record<StatusDoPlano, string> = {
    rascunho: t.statusRascunho,
    ativo: t.statusAtivo,
    encerrado: t.statusEncerrado,
    cancelado: t.statusCancelado,
  };

  const irmaos = (irmaosRes.data ?? []).filter((p) => p.id !== plano.id);
  const posts = postsRes.data ?? [];
  const pauta = posts.filter((p) => p.em_pauta);
  const produzindo = posts.filter((p) => !p.em_pauta);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin?aba=planejamento"
        className="mb-5 inline-flex items-center gap-1 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {t.voltar}
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
          <IconCalendar className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">{clienteRes.data.nome}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
        </div>

        {/* `target="_blank"` e não download: o PDF abre na aba, que é onde se
            aperta Ctrl+P. Quem quer o arquivo salva de lá. */}
        <a
          href={`/api/planejamento/${plano.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-base-600 px-3 py-2 text-xs font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
        >
          <IconPrinter className="h-3.5 w-3.5" />
          {t.baixarPdf}
        </a>
      </div>

      <FormularioDoPlano plano={plano} />

      {/* O calendário vem DEPOIS do escopo, e não antes: o número de posts
          vendidos está lá em cima, e é contra ele que o contador daqui se
          compara ("9 de 12 posts pautados"). Ler o escopo e depois preencher é
          a ordem em que a pessoa trabalha. */}
      <div className="mt-5">
        <CalendarioDeConteudo
          planoId={plano.id}
          inicio={plano.data_inicio}
          fim={plano.data_fim}
          meta={plano.qtd_posts_social}
          pautaInicial={pauta}
          produzindoInicial={produzindo}
          funcionarios={funcionariosRes.data ?? []}
        />
      </div>

      {/* O histórico fica no fim, e não numa tela própria: a pergunta "o que
          a gente combinou no ciclo passado?" quase sempre nasce enquanto se
          monta o próximo. */}
      <section className="mt-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.historicoTitulo}</p>
        {irmaos.length === 0 ? (
          <p className="text-xs text-ink-muted">{t.semHistorico}</p>
        ) : (
          <ul className="divide-y divide-base-800 rounded-2xl border border-base-700">
            {irmaos.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/planejamento/${p.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs transition hover:bg-base-900/60"
                >
                  <span className="text-ink-secondary">
                    {substituir(t.periodo, { inicio: fmtDataCurta(p.data_inicio), fim: fmtDataCurta(p.data_fim) })}
                  </span>
                  <span
                    className={cn(
                      "ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      p.status === "ativo" ? "border-status-good/50 text-status-good" : "border-base-600 text-ink-muted"
                    )}
                  >
                    {rotuloStatus[p.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
