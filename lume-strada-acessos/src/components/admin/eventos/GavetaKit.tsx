"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { EquipeEventoRow, KitRow } from "@/lib/types/eventos";
import type { ItemDaCasa } from "@/app/admin/eventos/[id]/data";
import { adicionarAoKit, marcarItemDoKit, removerDoKit } from "@/app/admin/eventos/[id]/actions";
import { InventarioDoKit } from "@/components/admin/eventos/InventarioDoKit";

/**
 * A GAVETA DE KIT — o que vai, e o que voltou.
 *
 * O número que esta tela existe para mostrar não é quantos itens foram: é
 * **quantos não voltaram**. Uma lista de equipamento que só diz o que saiu é a
 * mesma lista que todo mundo já tem no bloco de notas; a que diz o que ficou
 * no galpão é a que paga a gaveta.
 *
 * Como na Equipe, duas portas: puxar do Inventário da casa ou escrever. E pelo
 * mesmo motivo — ninguém vai cadastrar um patrimônio emprestado às onze da
 * noite para poder anotar que ele foi.
 */

export function GavetaKit({
  eventoId,
  kit,
  inventario,
  equipe,
  onFechar,
}: {
  eventoId: string;
  kit: KitRow[];
  inventario: ItemDaCasa[];
  equipe: EquipeEventoRow[];
  onFechar: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const router = useRouter();
  const [pendente, iniciar] = useTransition();

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [itemId, setItemId] = useState<string | null>(null);
  const [responsavelId, setResponsavelId] = useState<string | null>(null);
  const [prateleira, setPrateleira] = useState(false);

  // O que ja esta no kit, por id do inventario — a prateleira marca esses e
  // nao deixa incluir de novo.
  const jaNoKit = new Set(kit.map((i) => i.item_inventario_id).filter((x): x is string => !!x));

  function escolherDoInventario(id: string) {
    const item = inventario.find((i) => i.id === id);
    if (!item) {
      setItemId(null);
      return;
    }
    setItemId(item.id);
    setNome(item.nome);
  }

  function adicionar() {
    iniciar(async () => {
      const r = await adicionarAoKit(eventoId, { itemInventarioId: itemId, nome, quantidade, responsavelId });
      if (!r.ok) return;
      setNome("");
      setQuantidade(1);
      setItemId(null);
      router.refresh();
    });
  }

  const naoVoltou = kit.filter((i) => i.saiu && !i.voltou);

  return (
    <>
      <button type="button" aria-label={dict.common.fechar} onClick={onFechar} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]" />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">{t.kitTitulo}</p>
            <button type="button" onClick={onFechar} className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white">
              {dict.common.fechar}
            </button>
          </div>

          {/* O número da gaveta. Vermelho só quando há o que cobrar. */}
          {kit.length > 0 && (
            <div
              className={cn(
                "mt-4 rounded-xl border px-4 py-3",
                naoVoltou.length > 0 ? "border-danger/35 bg-danger/[0.07]" : "border-status-good/30 bg-status-good/[0.05]"
              )}
            >
              <p className={cn("font-mono text-lg tabular-nums", naoVoltou.length > 0 ? "text-danger" : "text-status-good")}>
                {naoVoltou.length}
              </p>
              <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">{t.kitNaoVoltou}</p>
            </div>
          )}

          {/* --- acrescentar --- */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.kitDoInventario}</p>

            {/* DUAS PORTAS, e a de cima e a nova: abrir a prateleira inteira e
                marcar o que vai. A lista suspensa continua embaixo porque ela
                ganha quando a pessoa JA SABE o nome do item — digitar tres
                letras e mais rapido do que rolar uma categoria. */}
            <button
              type="button"
              onClick={() => setPrateleira((v) => !v)}
              className="mt-1.5 w-full rounded-lg border border-accent/35 bg-accent/[0.06] px-3 py-2.5 text-left text-sm text-white/85 transition hover:border-accent/55"
            >
              {t.kitAbrirInventario}
            </button>

            <select
              value={itemId ?? ""}
              onChange={(e) => escolherDoInventario(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none"
            >
              <option value="">{t.kitOuEscreva}</option>
              {inventario.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.etiqueta ? `${i.nome} · ${i.etiqueta}` : i.nome}
                </option>
              ))}
            </select>

            <input
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setItemId(null);
              }}
              placeholder={t.kitNome}
              className="mt-3 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-stretch overflow-hidden rounded-lg border border-white/12 bg-black/50">
                <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="w-9 text-white/50 transition hover:text-accent">−</button>
                <span className="flex min-w-[48px] items-center justify-center font-mono text-sm tabular-nums text-white">{quantidade}</span>
                <button type="button" onClick={() => setQuantidade((q) => q + 1)} className="w-9 text-white/50 transition hover:text-accent">+</button>
              </span>

              <select
                value={responsavelId ?? ""}
                onChange={(e) => setResponsavelId(e.target.value || null)}
                className="min-w-[10rem] flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none"
              >
                <option value="">{t.kitSemResponsavel}</option>
                {equipe.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={adicionar}
                disabled={pendente || !nome.trim()}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
                style={{ background: "rgb(var(--color-accent))" }}
              >
                {t.kitAdicionar}
              </button>
            </div>
          </div>

          {prateleira && (
            <div className="mt-3">
              <InventarioDoKit
                eventoId={eventoId}
                inventario={inventario}
                jaNoKit={jaNoKit}
                onFechar={() => setPrateleira(false)}
              />
            </div>
          )}

          {/* --- a lista --- */}
          <ul className="mt-5 space-y-2">
            {kit.length === 0 && (
              <li className="rounded-xl border border-white/[0.07] bg-black/30 px-4 py-6 text-center text-xs text-white/35">{t.kitVazio}</li>
            )}

            {kit.map((item) => {
              const dono = item.responsavel_id ? equipe.find((p) => p.id === item.responsavel_id) : null;
              const perdido = item.saiu && !item.voltou;

              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-xl border bg-black/40 px-4 py-3",
                    perdido ? "border-danger/25" : "border-white/[0.08]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-white">
                        {item.quantidade > 1 && <span className="font-mono text-white/50">{item.quantidade}× </span>}
                        {item.nome}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/35">
                        {dono && <span>{dono.nome}</span>}
                        {item.item_inventario_id && <span className="text-white/25">{t.kitDoPatrimonio}</span>}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={pendente}
                      onClick={() => iniciar(async () => { await removerDoKit(eventoId, item.id); router.refresh(); })}
                      className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/25 transition hover:text-danger disabled:opacity-40"
                    >
                      {dict.common.excluir}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    <Alternar
                      ativo={item.saiu}
                      texto={t.kitSaiu}
                      ocupado={pendente}
                      onClick={() => iniciar(async () => { await marcarItemDoKit(eventoId, item.id, { saiu: !item.saiu }); router.refresh(); })}
                    />
                    <Alternar
                      ativo={item.voltou}
                      texto={t.kitVoltou}
                      ocupado={pendente}
                      onClick={() => iniciar(async () => { await marcarItemDoKit(eventoId, item.id, { voltou: !item.voltou }); router.refresh(); })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}

/** Alternável nos dois sentidos: marcar errado às duas da manhã tem que ter volta. */
function Alternar({ ativo, texto, ocupado, onClick }: { ativo: boolean; texto: string; ocupado: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={ocupado}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition disabled:opacity-40",
        ativo ? "border-status-good/40 bg-status-good/[0.08] text-status-good" : "border-white/10 text-white/45 hover:text-white"
      )}
    >
      {texto}
    </button>
  );
}
