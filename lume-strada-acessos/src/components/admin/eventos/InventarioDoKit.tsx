"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconCheck, IconSearch } from "@/components/ui/icons";
import type { ItemDaCasa } from "@/app/admin/eventos/[id]/data";
import { adicionarAoKit } from "@/app/admin/eventos/[id]/actions";

/**
 * O INVENTÁRIO INTEIRO, com check no que vai.
 *
 * A gaveta de Kit já puxava do Inventário, mas por um `select` — um item de
 * cada vez, escolhido numa lista suspensa. Montar um kit de doze itens assim
 * são doze aberturas da mesma lista, e, pior, obriga a pessoa a saber o nome
 * do que procura antes de procurar. Quem monta kit faz o contrário: passa o
 * olho na prateleira e marca.
 *
 * A CATEGORIA é o que torna a prateleira inteira utilizável. Um inventário de
 * agência tem câmera, lente e tripé, e também cafeteira, cadeira e extensão de
 * escritório. Sem filtro, quem monta o kit de um show rola por "Doméstico"
 * para achar a lente — e volta para a lista suspensa, que ao menos era curta.
 *
 * O que já está no kit aparece marcado e desabilitado, em vez de sumir: um
 * item que some da lista deixa a pessoa procurando o que ela mesma já
 * escolheu.
 */

export function InventarioDoKit({
  eventoId,
  inventario,
  jaNoKit,
  onFechar,
}: {
  eventoId: string;
  inventario: ItemDaCasa[];
  /** Ids do inventário que já estão no kit deste evento. */
  jaNoKit: Set<string>;
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  const categorias = useMemo(() => {
    const nomes = new Set<string>();
    for (const i of inventario) nomes.add(i.categoria ?? "");
    return [...nomes].sort((a, b) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)));
  }, [inventario]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return inventario.filter((i) => {
      if (categoria !== null && (i.categoria ?? "") !== categoria) return false;
      if (!termo) return true;
      return (
        i.nome.toLowerCase().includes(termo) || (i.etiqueta ?? "").toLowerCase().includes(termo)
      );
    });
  }, [inventario, busca, categoria]);

  // Agrupado por categoria mesmo quando o filtro está em "Todas": a lista
  // corrida de duzentos itens não é mais legível do que a lista suspensa que
  // ela veio substituir.
  const grupos = useMemo(() => {
    const mapa = new Map<string, ItemDaCasa[]>();
    for (const i of visiveis) {
      const chave = i.categoria ?? "";
      const lista = mapa.get(chave);
      if (lista) lista.push(i);
      else mapa.set(chave, [i]);
    }
    return [...mapa.entries()].sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : a[0].localeCompare(b[0])));
  }, [visiveis]);

  function alternar(id: string) {
    setMarcados((antes) => {
      const novo = new Set(antes);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function incluir() {
    const ids = [...marcados];
    if (ids.length === 0) return;
    iniciar(async () => {
      // Em série de propósito: `adicionarAoKit` calcula a ordem lendo o último
      // item, e em paralelo todos leriam a mesma e nasceriam empatados.
      for (const id of ids) {
        const item = inventario.find((i) => i.id === id);
        if (!item) continue;
        await adicionarAoKit(eventoId, {
          itemInventarioId: item.id,
          nome: item.nome,
          quantidade: 1,
          responsavelId: null,
        });
      }
      setMarcados(new Set());
      router.refresh();
      onFechar();
    });
  }

  return (
    <div className="rounded-xl border border-white/[0.1] bg-black/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.kitAbrirInventario}</p>
        <button
          type="button"
          onClick={onFechar}
          className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/35 transition hover:text-white"
        >
          {t.kitFecharInventario}
        </button>
      </div>

      {/* --- busca --- */}
      <div className="relative mt-2.5">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={t.kitBuscar}
          className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
        />
      </div>

      {/* --- categorias --- */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Chip ativo={categoria === null} rotulo={t.kitTodasCategorias} onClick={() => setCategoria(null)} />
        {categorias.map((c) => (
          <Chip
            key={c || "sem"}
            ativo={categoria === c}
            rotulo={c || t.kitSemCategoria}
            onClick={() => setCategoria(c)}
          />
        ))}
      </div>

      {/* --- a prateleira --- */}
      <div className="mt-3 max-h-[42vh] space-y-3 overflow-y-auto pr-1">
        {grupos.length === 0 && <p className="py-8 text-center text-xs text-white/30">{t.kitInventarioVazio}</p>}

        {grupos.map(([nome, itens]) => (
          <div key={nome || "sem"}>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
              {nome || t.kitSemCategoria}
            </p>
            <ul className="mt-1.5 space-y-1">
              {itens.map((i) => {
                const dentro = jaNoKit.has(i.id);
                const marcado = marcados.has(i.id);
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      disabled={dentro || pendente}
                      onClick={() => alternar(i.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition",
                        dentro
                          ? "cursor-default border-white/[0.05] opacity-40"
                          : marcado
                            ? "border-accent/50 bg-accent/[0.08]"
                            : "border-white/[0.07] hover:border-white/20"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                          marcado || dentro ? "border-accent/70 text-black" : "border-white/20"
                        )}
                        style={marcado || dentro ? { background: "rgb(var(--color-accent))" } : undefined}
                      >
                        {(marcado || dentro) && <IconCheck className="h-2.5 w-2.5" />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-white/85">{i.nome}</span>
                        {(i.etiqueta || dentro) && (
                          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.1em] text-white/25">
                            {[i.etiqueta, dentro ? t.kitJaNoKit : null].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {marcados.size > 0 && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
            {substituir(t.kitSelecionados, { n: marcados.size })}
          </span>
          <button
            type="button"
            onClick={incluir}
            disabled={pendente}
            className="rounded-full px-4 py-2 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
            style={{ background: "rgb(var(--color-accent))" }}
          >
            {pendente ? dict.common.salvando : t.kitIncluirSelecionados}
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({ ativo, rotulo, onClick }: { ativo: boolean; rotulo: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition",
        ativo ? "border-accent/55 bg-accent/10 text-accent" : "border-white/[0.09] text-white/40 hover:border-white/25 hover:text-white/75"
      )}
    >
      {rotulo}
    </button>
  );
}
