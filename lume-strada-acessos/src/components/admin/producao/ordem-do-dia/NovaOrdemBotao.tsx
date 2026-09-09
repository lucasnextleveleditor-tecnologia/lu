"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/ui/icons";
import { criarOrdemDoDia } from "@/app/admin/producao/ordem-do-dia/actions";

/**
 * Cria a folha e já leva para dentro dela. Não abre modal pedindo nome antes:
 * uma ordem do dia nasce vazia e é preenchida no próprio documento — pedir
 * dados numa caixa para depois pedir de novo na folha seria digitar duas vezes.
 */
export function NovaOrdemBotao({ rotulo }: { rotulo: string }) {
  const router = useRouter();
  const [pendente, start] = useTransition();

  return (
    <Button
      disabled={pendente}
      onClick={() =>
        start(async () => {
          const r = await criarOrdemDoDia();
          if (r.ok) router.push(`/admin/producao/ordem-do-dia/${r.id}`);
        })
      }
    >
      <IconPlus className="h-4 w-4" />
      {rotulo}
    </Button>
  );
}
