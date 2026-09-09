import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils/cn";
import { TONE_META, type Tone } from "@/lib/utils/tone";
import { IconCheckCircle, IconChevronRight } from "@/components/ui/icons";
import { getDictionary } from "@/lib/i18n/getDictionary";

export interface ItemAtencao {
  chave: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  rotulo: string;
  quantidade: number;
  tone: Exclude<Tone, "neutral" | "good">;
  href: string;
}

/**
 * Junta num cartão só tudo que está atrasado ou vence hoje.
 *
 * Antes cada um desses números era um cartão grande na grade — tarefas
 * atrasadas, contas vencidas, contas vencendo hoje, follow-ups atrasados,
 * entregas aguardando aprovação. Cinco cartões que, no dia bom (o dia
 * comum), mostram "0" cada um: cinco espaços ocupados para dizer que não há
 * nada para fazer.
 *
 * Aqui só entra o que é MAIOR QUE ZERO, e cada linha leva direto pra tela
 * onde se resolve. Quando não há nada, o cartão vira uma confirmação curta —
 * "nada pendente" — em vez de sumir: a ausência do problema também é
 * informação, e um painel que some com blocos muda de forma a cada dia e
 * fica difícil de ler por hábito.
 */
export async function PrecisaAtencao({ itens }: { itens: ItemAtencao[] }) {
  const { dict } = await getDictionary();
  const t = dict.dashboard;
  const pendentes = itens.filter((i) => i.quantidade > 0);

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900/80 p-5 backdrop-blur-sm">
      <p className="mb-4 text-xs font-medium text-ink-muted">{t.atencaoTitulo}</p>

      {pendentes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-status-good/15">
            <IconCheckCircle className="h-5 w-5 text-status-good" />
          </span>
          <p className="text-sm font-medium text-ink-primary">{t.atencaoTudoEmDia}</p>
          <p className="mt-1 text-xs text-ink-muted">{t.atencaoTudoEmDiaHint}</p>
        </div>
      ) : (
        <ul className="-mx-2 divide-y divide-base-800">
          {pendentes.map((item) => {
            const meta = TONE_META[item.tone];
            const Icon = item.icon;
            return (
              <li key={item.chave}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-base-800/60"
                >
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.badgeClassName)}>
                    <Icon className="h-4 w-4 text-ink-primary" />
                  </span>
                  {/* A quantidade em corpo médio, não em número gigante: aqui
                      o que importa é QUE existe e QUAL é, não a magnitude. */}
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-secondary">{item.rotulo}</span>
                  <span className="text-sm font-semibold tabular-nums text-ink-primary">{item.quantidade}</span>
                  <IconChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-ink-secondary" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
