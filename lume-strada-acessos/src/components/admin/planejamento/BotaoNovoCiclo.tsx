"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconPlus } from "@/components/ui/icons";
import { criarCiclo } from "@/app/admin/planejamento/actions";

/**
 * "Criar ciclo" — cria o rascunho e leva direto para o formulário.
 *
 * Sem modal perguntando datas antes. Quem clica aqui ainda está decidindo o
 * que vai no ciclo; perguntar "quando começa?" nesse momento é interromper a
 * pessoa para pedir um dado que ela vai preencher na tela seguinte de
 * qualquer jeito. O rascunho nasce começando hoje, não dispara aviso nenhum e
 * não ocupa a vaga do ciclo ativo — errar aqui não custa nada.
 *
 * `useTransition` e não um `useState` de "carregando": a navegação depois do
 * `router.push` também é assíncrona, e sem a transição o botão voltaria ao
 * normal antes de a página trocar, dando a impressão de que o clique falhou.
 */
export function BotaoNovoCiclo({ clienteId }: { clienteId: string }) {
  const { dict } = useLocale();
  const t = dict.planejamento;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function criar() {
    setErro(null);
    iniciar(async () => {
      const r = await criarCiclo(clienteId);
      if (!r.ok) {
        setErro(/schema cache|does not exist|PGRST205/i.test(r.error) ? t.erroTabelaAusente : r.error);
        return;
      }
      router.push(`/admin/planejamento/${r.id}`);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={criar}
        disabled={pendente}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg border border-base-600 px-3 py-1.5 text-xs font-medium text-ink-secondary transition",
          "hover:border-ink-muted hover:text-ink-primary disabled:opacity-50"
        )}
      >
        <IconPlus className="h-3.5 w-3.5" />
        {pendente ? t.criando : t.criarCiclo}
      </button>
      {erro && <p className="max-w-[16rem] text-right text-[11px] text-danger">{erro}</p>}
    </div>
  );
}
