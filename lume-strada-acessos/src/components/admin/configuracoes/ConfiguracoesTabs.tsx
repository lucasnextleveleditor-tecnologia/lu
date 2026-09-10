import Link from "next/link";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

export type AbaConfiguracoes = "empresa" | "avisos" | "conta" | "aparencia" | "assinatura";

export interface ItemAbaConfiguracoes {
  value: AbaConfiguracoes;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Barra de abas da tela de Configurações. Mesma mecânica do hub Comercial
 * (`ComercialHubTabs`): cada aba é navegação de verdade (`?aba=...`), não
 * estado local — assim a aba fica na URL, sobrevive a um F5 e pode ser
 * mandada por link pra alguém ("vai em Configurações > Aparência").
 *
 * `overflow-x-auto` com máscara de recorte à direita: quando as abas não
 * cabem na largura da tela, a última não some sem aviso — o degradê deixa
 * visível que ainda tem coisa pra rolar. `abas` já chega filtrada pela
 * página com só o que este usuário pode ver.
 */
export function ConfiguracoesTabs({ abas, abaAtiva }: { abas: ItemAbaConfiguracoes[]; abaAtiva: AbaConfiguracoes }) {
  if (abas.length < 2) return null;

  return (
    <div className="relative">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-base-800 pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {abas.map((aba) => (
          <Link
            key={aba.value}
            href={`/admin/configuracoes?aba=${aba.value}`}
            aria-current={abaAtiva === aba.value ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
              abaAtiva === aba.value ? "border-accent text-ink-primary" : "border-transparent text-ink-muted hover:text-ink-secondary"
            )}
          >
            <aba.icon className="h-4 w-4" />
            {aba.label}
          </Link>
        ))}
      </div>
      {/* Degradê fixo na borda direita — some visualmente quando a lista
          cabe inteira (o fundo é o mesmo da página), e vira a pista de "tem
          mais aba ali" quando não cabe. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-base-950 to-transparent" />
    </div>
  );
}
