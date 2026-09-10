"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Escolhe de qual cliente é o calendário aberto.
 *
 * Navega de verdade (`?cliente=`), e não muda estado local: assim o endereço
 * leva de volta ao mesmo calendário. É o que permite mandar "olha o conteúdo
 * da Filmmaker Academy" por link para alguém da equipe — coisa que um seletor
 * de estado interno não permite, porque o link abriria sempre no primeiro
 * cliente da lista.
 */
export function SeletorDeCliente({
  clientes,
  atual,
  aba = "conteudo",
}: {
  clientes: { id: string; nome: string }[];
  atual: string;
  /** Para qual aba de Gestão de Clientes navegar — Conteúdo e Histórico usam o mesmo seletor. */
  aba?: "conteudo" | "historico";
}) {
  const { dict } = useLocale();
  const router = useRouter();

  return (
    <div className="w-full sm:w-72">
      <label className="mb-1.5 block text-[11px] font-medium text-ink-secondary">
        {dict.planejamento.escolhaCliente}
      </label>
      <Select
        value={atual}
        onChange={(e) => router.push(`/admin?aba=${aba}&cliente=${e.target.value}`)}
      >
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Select>
    </div>
  );
}
