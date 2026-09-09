"use client";

import { useState } from "react";
import { ordinalDeClausula, type ClausulaModelo } from "@/lib/contratos/modelos/tipos";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconRotateCcw,
  IconLock,
  IconGrip,
  IconPlus,
  IconTrash,
  IconEye,
} from "@/components/ui/icons";

/**
 * O contrato como lista de caixas, e não como parede de texto.
 *
 * Quem manda um contrato de trinta cláusulas para o cliente precisa saber, em
 * dez segundos, o que está mandando. Aqui cada cláusula é uma linha: o número
 * que ela terá no documento, o título, uma frase dizendo o que ela protege, e
 * uma caixa para deixar entrar ou não. Abrir a linha mostra o texto inteiro,
 * editável para ESTE contrato — o modelo do sistema não é alterado.
 *
 * A numeração mostrada é a numeração REAL: desmarcar ou arrastar refaz a
 * conta na hora, do mesmo jeito que vai sair no documento.
 *
 * Três coisas que a lista permite além de marcar: reordenar arrastando pela
 * alça, escrever uma cláusula própria no fim, e ver a prévia do documento
 * inteiro antes de aplicar.
 */
export function ChecklistDeClausulas({
  clausulas,
  selecionadas,
  textos,
  aoAlternar,
  aoEditarTexto,
  aoRestaurarTexto,
  aoMarcarTodas,
  aoReordenar,
  aoAdicionarPropria,
  aoRenomearPropria,
  aoExcluirPropria,
  aoVerPrevia,
}: {
  /** Já na ordem de exibição, e já incluindo as cláusulas próprias. */
  clausulas: readonly ClausulaModelo[];
  selecionadas: readonly string[];
  textos: Record<string, string>;
  aoAlternar: (id: string) => void;
  aoEditarTexto: (id: string, texto: string) => void;
  aoRestaurarTexto: (id: string) => void;
  aoMarcarTodas: (marcar: boolean) => void;
  aoReordenar: (idArrastado: string, idAlvo: string) => void;
  aoAdicionarPropria: (titulo: string) => void;
  aoRenomearPropria: (id: string, titulo: string) => void;
  aoExcluirPropria: (id: string) => void;
  aoVerPrevia: () => void;
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [tituloNovo, setTituloNovo] = useState("");
  const marcadas = new Set(selecionadas);

  // A numeração é calculada aqui, na ordem da lista, contando só as que
  // entram — a mesma conta que `montarTextoDeClausulas` faz ao gerar.
  let contador = 0;
  const numeradas = clausulas.map((c) => {
    const entra = marcadas.has(c.id);
    const semNumero = c.id === "preambulo" || c.id === "documento";
    if (entra && !semNumero) contador += 1;
    return { clausula: c, numero: entra && !semNumero ? contador : null };
  });

  const dentro = clausulas.filter((c) => marcadas.has(c.id)).length;

  function adicionar() {
    const titulo = tituloNovo.trim();
    if (!titulo) return;
    aoAdicionarPropria(titulo);
    setTituloNovo("");
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">
          {dentro} de {clausulas.length} cláusulas neste contrato
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={aoVerPrevia}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary transition hover:text-ink-primary"
          >
            <IconEye className="h-3.5 w-3.5" /> Prévia
          </button>
          <button type="button" onClick={() => aoMarcarTodas(true)} className="text-xs font-medium text-accent hover:underline">
            Marcar todas
          </button>
          <button type="button" onClick={() => aoMarcarTodas(false)} className="text-xs text-ink-muted transition hover:text-ink-secondary">
            Só as essenciais
          </button>
        </div>
      </div>

      <ul className="divide-y divide-base-800 overflow-hidden rounded-xl border border-base-700">
        {numeradas.map(({ clausula, numero }) => (
          <LinhaDeClausula
            key={clausula.id}
            clausula={clausula}
            numero={numero}
            marcada={marcadas.has(clausula.id)}
            aberta={aberta === clausula.id}
            arrastada={arrastando === clausula.id}
            sobAlvo={alvo === clausula.id && arrastando !== clausula.id}
            texto={textos[clausula.id] ?? clausula.texto}
            editado={textos[clausula.id] != null && textos[clausula.id] !== clausula.texto}
            aoAbrir={() => setAberta((a) => (a === clausula.id ? null : clausula.id))}
            aoAlternar={() => aoAlternar(clausula.id)}
            aoEditarTexto={(t) => aoEditarTexto(clausula.id, t)}
            aoRestaurarTexto={() => aoRestaurarTexto(clausula.id)}
            aoRenomear={(t) => aoRenomearPropria(clausula.id, t)}
            aoExcluir={() => aoExcluirPropria(clausula.id)}
            aoIniciarArraste={() => setArrastando(clausula.id)}
            aoEntrarComArraste={() => setAlvo(clausula.id)}
            aoSoltar={() => {
              if (arrastando && arrastando !== clausula.id) aoReordenar(arrastando, clausula.id);
              setArrastando(null);
              setAlvo(null);
            }}
            aoTerminarArraste={() => {
              setArrastando(null);
              setAlvo(null);
            }}
          />
        ))}
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* CLÁUSULA PRÓPRIA                                                    */}
      {/* ------------------------------------------------------------------ */}
      {/*
        Nenhum modelo cobre tudo. Falta a regra de acesso daquele condomínio,
        a exigência do jurídico do cliente, o combinado que só aquele trabalho
        tem. Sem esta porta, a pessoa acabava colando o parágrafo no fim do
        texto grande — fora do checklist, fora da numeração, e perdido na
        próxima vez que regerasse o contrato.
      */}
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-base-700 px-3 py-2">
        <IconPlus className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
        <Input
          value={tituloNovo}
          onChange={(e) => setTituloNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="Título de uma cláusula sua — ex.: Do Acesso ao Condomínio"
          className="border-0 bg-transparent px-0 py-0 text-xs focus:ring-0"
        />
        <button
          type="button"
          onClick={adicionar}
          disabled={!tituloNovo.trim()}
          className="shrink-0 rounded-lg border border-base-700 px-2 py-1 text-[11px] font-medium text-ink-secondary transition hover:text-ink-primary disabled:opacity-40"
        >
          Acrescentar
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-ink-muted">
        Arraste pela alça à esquerda para mudar a ordem. A numeração se refaz sozinha.
      </p>
    </div>
  );
}

function LinhaDeClausula({
  clausula,
  numero,
  marcada,
  aberta,
  arrastada,
  sobAlvo,
  texto,
  editado,
  aoAbrir,
  aoAlternar,
  aoEditarTexto,
  aoRestaurarTexto,
  aoRenomear,
  aoExcluir,
  aoIniciarArraste,
  aoEntrarComArraste,
  aoSoltar,
  aoTerminarArraste,
}: {
  clausula: ClausulaModelo;
  numero: number | null;
  marcada: boolean;
  aberta: boolean;
  arrastada: boolean;
  sobAlvo: boolean;
  texto: string;
  editado: boolean;
  aoAbrir: () => void;
  aoAlternar: () => void;
  aoEditarTexto: (texto: string) => void;
  aoRestaurarTexto: () => void;
  aoRenomear: (titulo: string) => void;
  aoExcluir: () => void;
  aoIniciarArraste: () => void;
  aoEntrarComArraste: () => void;
  aoSoltar: () => void;
  aoTerminarArraste: () => void;
}) {
  // `draggable` só liga quando a pessoa segura a alça. Ligado o tempo todo, o
  // navegador rouba a seleção de texto dentro do textarea aberto e arrastar
  // uma palavra viraria arrastar a cláusula inteira.
  const [podeArrastar, setPodeArrastar] = useState(false);
  const travada = clausula.essencial === true;
  const propria = clausula.personalizada === true;

  return (
    <li
      draggable={podeArrastar}
      onDragStart={aoIniciarArraste}
      onDragEnd={() => {
        setPodeArrastar(false);
        aoTerminarArraste();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        aoEntrarComArraste();
      }}
      onDrop={(e) => {
        e.preventDefault();
        setPodeArrastar(false);
        aoSoltar();
      }}
      className={cn(
        "transition",
        marcada ? "bg-base-900/40" : "bg-transparent",
        arrastada && "opacity-40",
        sobAlvo && "border-t-2 border-t-accent"
      )}
    >
      <div className="flex items-start gap-2 px-2 py-2.5 sm:gap-3 sm:px-3">
        <span
          onMouseDown={() => setPodeArrastar(true)}
          onTouchStart={() => setPodeArrastar(true)}
          onMouseUp={() => setPodeArrastar(false)}
          title="Arraste para mudar a ordem"
          className="mt-0.5 shrink-0 cursor-grab text-ink-muted transition hover:text-ink-secondary active:cursor-grabbing"
        >
          <IconGrip className="h-3.5 w-3.5" />
        </span>

        {travada ? (
          <span
            title="Cláusula essencial — não pode sair do contrato"
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-base-600 bg-base-800 text-ink-muted"
          >
            <IconLock className="h-2.5 w-2.5" />
          </span>
        ) : (
          <button
            type="button"
            role="checkbox"
            aria-checked={marcada}
            onClick={aoAlternar}
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
              marcada ? "border-accent bg-accent text-white" : "border-base-600 hover:border-ink-muted"
            )}
          >
            {marcada && <IconCheck className="h-2.5 w-2.5" />}
          </button>
        )}

        <button type="button" onClick={aoAbrir} className="min-w-0 flex-1 text-left">
          <p className={cn("text-xs font-medium", marcada ? "text-ink-primary" : "text-ink-muted line-through decoration-base-600")}>
            {numero ? `Cláusula ${ordinalDeClausula(numero).toLowerCase()} — ` : ""}
            {clausula.titulo}
            {propria && <span className="ml-1.5 text-[10px] font-normal text-status-warning">sua</span>}
            {editado && !propria && <span className="ml-1.5 text-[10px] font-normal text-accent">editada</span>}
          </p>
          {clausula.protege && <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{clausula.protege}</p>}
        </button>

        {propria && (
          <button
            type="button"
            onClick={aoExcluir}
            title="Excluir esta cláusula"
            className="mt-0.5 shrink-0 text-ink-muted transition hover:text-danger"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        )}

        <button type="button" onClick={aoAbrir} className="mt-0.5 shrink-0 text-ink-muted transition hover:text-ink-secondary">
          {aberta ? <IconChevronDown className="h-3.5 w-3.5" /> : <IconChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {aberta && (
        <div className="border-t border-base-800 bg-base-950/60 px-3 py-3">
          {propria && (
            <div className="mb-3">
              <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-ink-muted">Título</label>
              <Input value={clausula.titulo} onChange={(e) => aoRenomear(e.target.value)} className="text-xs" />
            </div>
          )}

          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">Texto desta cláusula</p>
            {editado && !propria && (
              <button type="button" onClick={aoRestaurarTexto} className="inline-flex items-center gap-1 text-[11px] text-ink-muted transition hover:text-ink-secondary">
                <IconRotateCcw className="h-3 w-3" /> Voltar ao original
              </button>
            )}
          </div>
          <Textarea
            rows={10}
            value={texto}
            onChange={(e) => aoEditarTexto(e.target.value)}
            placeholder={propria ? "Escreva o texto da cláusula. Você pode usar as mesmas variáveis do modelo, entre colchetes — ex.: [NOME_DO_CLIENTE]." : undefined}
            className="font-mono text-[11px] leading-relaxed"
          />
          <p className="mt-1.5 text-[11px] text-ink-muted">
            {propria
              ? "Esta cláusula vale só para este contrato."
              : "A edição vale só para este contrato — o modelo do sistema continua intacto para os próximos."}
          </p>
        </div>
      )}
    </li>
  );
}
