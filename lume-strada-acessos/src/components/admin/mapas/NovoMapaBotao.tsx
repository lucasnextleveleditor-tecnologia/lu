"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/ui/icons";
import { criarMapa } from "@/app/admin/mapas/actions";

/** Cria o mapa (já com o balão do meio) e entra nele. Sem modal pedindo nome: o título se digita no próprio mapa. */
export function NovoMapaBotao({ rotulo }: { rotulo: string }) {
  const router = useRouter();
  const [pendente, start] = useTransition();

  return (
    <Button
      disabled={pendente}
      onClick={() =>
        start(async () => {
          const r = await criarMapa();
          if (r.ok) router.push(`/admin/mapas/${r.id}`);
        })
      }
    >
      <IconPlus className="h-4 w-4" />
      {rotulo}
    </Button>
  );
}
