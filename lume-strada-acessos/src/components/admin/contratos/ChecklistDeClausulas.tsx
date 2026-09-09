"use client";

import { useState } from "react";
import { obterClausulas, ordinalDeClausula, type ClausulaModelo, type ModeloContratoServico } from "@/lib/contratos/modelos/tipos";
import { cn } from "@/lib/utils/cn";
import { Textarea } from "@/components/ui/Textarea";
import { IconCheck, IconChevronDown, IconChevronRight, IconRotateCcw, IconLock } from "@/components/ui/icons";

/**
 * O contrato como lista de caixas, e não como parede de texto.
 *
 * Quem manda um contrato de vinte cláusulas para o cliente precisa saber, em
 * dez segundos, o que está mandando. Aqui cada cláusula é uma linha: o
 * número que ela terá no documento, o título, uma frase dizendo o que ela
 * protege, e uma caixa para deixar entrar ou não. Abrir a linha mostra o
 * texto inteiro, editável para ESTE contrato — o modelo não é alterado.
 *
 * A numeração mostrada aqui é a numeração REAL: desmarcar a quinta faz a
 * sexta virar quinta na hora, na tela, do mesmo jeito que vai sair no PDF.
 *
 * Cláusulas marcadas como essenciais não têm caixa: sem qualificação das
 * partes, objeto, preço e foro não sobra contrato, sobra carta de intenções.
 */
export function ChecklistDeClausulas({
  modelo,
  selecionadas,
  textos,
  aoAlternar,
  aoEditarTexto,
  aoRestaurarTexto,
  aoMarcarTodas,
}: {
  modelo: ModeloContratoServico;
  selecionadas: readonly string[];
  textos: Record<string, string>;
  aoAlternar: (id: string) => void;
  aoEditarTexto: (id: string, texto: string) => void;
  aoRestaurarTexto: (id: string) => void;
  aoMarcarTodas: (marcar: boolean) => void;
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  const clausulas = obterClausulas(modelo);
  const marcadas = new Set(selecionadas);

  // A numeração é calculada aqui, na ordem, contando só as que entram — é a
  // mesma conta que `montarTextoDoContrato` faz ao gerar o documento.
  let contador = 0;
  const numeradas = clausulas.map((c) => {
    const entra = marcadas.has(c.id);
    const semNumero = c.id === "preambulo" || c.id === "documento";
    if (entra && !semNumero) contador += 1;
    return { clausula: c, numero: entra && !semNumero ? contador : null };
  });

  const total = clausulas.length;
  const dentro = clausulas.filter((c) => marcadas.has(c.id)).length;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">
          {dentro} de {total} cláusulas neste contrato
        </p>
        <div className="flex items-center gap-3">
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
            texto={textos[clausula.id] ?? clausula.texto}
            editado={textos[clausula.id] != null && textos[clausula.id] !== clausula.texto}
            aoAbrir={() => setAberta((a) => (a === clausula.id ? null : clausula.id))}
            aoAlternar={() => aoAlternar(clausula.id)}
            aoEditarTexto={(t) => aoEditarTexto(clausula.id, t)}
            aoRestaurarTexto={() => aoRestaurarTexto(clausula.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function LinhaDeClausula({
  clausula,
  numero,
  marcada,
  aberta,
  texto,
  editado,
  aoAbrir,
  aoAlternar,
  aoEditarTexto,
  aoRestaurarTexto,
}: {
  clausula: ClausulaModelo;
  numero: number | null;
  marcada: boolean;
  aberta: boolean;
  texto: string;
  editado: boolean;
  aoAbrir: () => void;
  aoAlternar: () => void;
  aoEditarTexto: (texto: string) => void;
  aoRestaurarTexto: () => void;
}) {
  const travada = clausula.essencial === true;

  return (
    <li className={cn("transition", marcada ? "bg-base-900/40" : "bg-transparent")}>
      <div className="flex items-start gap-3 px-3 py-2.5">
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
            {editado && <span className="ml-1.5 text-[10px] font-normal text-accent">editada</span>}
          </p>
          {clausula.protege && <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{clausula.protege}</p>}
        </button>

        <button type="button" onClick={aoAbrir} className="mt-0.5 shrink-0 text-ink-muted transition hover:text-ink-secondary">
          {aberta ? <IconChevronDown className="h-3.5 w-3.5" /> : <IconChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {aberta && (
        <div className="border-t border-base-800 bg-base-950/60 px-3 py-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">Texto desta cláusula</p>
            {editado && (
              <button type="button" onClick={aoRestaurarTexto} className="inline-flex items-center gap-1 text-[11px] text-ink-muted transition hover:text-ink-secondary">
                <IconRotateCcw className="h-3 w-3" /> Voltar ao original
              </button>
            )}
          </div>
          <Textarea rows={10} value={texto} onChange={(e) => aoEditarTexto(e.target.value)} className="font-mono text-[11px] leading-relaxed" />
          <p className="mt-1.5 text-[11px] text-ink-muted">
            A edição vale só para este contrato — o modelo do sistema continua intacto para os próximos.
          </p>
        </div>
      )}
    </li>
  );
}
