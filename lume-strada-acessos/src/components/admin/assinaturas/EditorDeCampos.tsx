"use client";

import { useCallback, useRef, useState } from "react";
import {
  ORDEM_TIPOS_CAMPO,
  TIPOS_CAMPO,
  corDoSignatario,
  type CampoAssinaturaRow,
  type DocumentoCompleto,
  type EventoAssinaturaRow,
  type SignatarioRow,
  type TipoCampo,
} from "@/lib/types/assinatura";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconPlus, IconTrash, IconUsers } from "@/components/ui/icons";
import { PaginaPdf } from "./PaginaPdf";
import { PainelDeEnvio } from "./PainelDeEnvio";
import {
  adicionarCampo,
  adicionarSignatario,
  moverCampo,
  removerCampo,
  removerSignatario,
  renomearDocumento,
  salvarSignatario,
} from "@/app/admin/assinaturas/actions";

/**
 * A tela onde se monta o documento: quem assina, e onde cada um assina.
 *
 * Os campos são posicionados por ARRASTE sobre a página desenhada, e o que
 * se guarda é a fração da página — não o pixel. É isso que faz o campo cair
 * no mesmo lugar aqui, no celular de quem vai assinar e no PDF final, que
 * são três tamanhos diferentes.
 */
export function EditorDeCampos({
  dados,
  urlArquivo,
  eventos,
}: {
  dados: DocumentoCompleto;
  urlArquivo: string | null;
  eventos: EventoAssinaturaRow[];
}) {
  const doc = dados.documento;
  // Enviado trava a edição: quem já recebeu o link está lendo ESTE arquivo
  // com ESTES campos. Mover um campo agora faria a pessoa assinar num lugar
  // diferente do que viu.
  const travado = doc.status !== "rascunho";

  const [titulo, setTitulo] = useState(doc.titulo);
  const [signatarios, setSignatarios] = useState<SignatarioRow[]>(dados.signatarios);
  const [campos, setCampos] = useState<CampoAssinaturaRow[]>(dados.campos);
  const [ativo, setAtivo] = useState<string | null>(dados.signatarios[0]?.id ?? null);
  const [tipoAtivo, setTipoAtivo] = useState<TipoCampo>("assinatura");
  const [erro, setErro] = useState<string | null>(null);
  const [larguraPagina, setLarguraPagina] = useState(720);
  const [proporcao, setProporcao] = useState(1.414); // A4 retrato até a primeira página medir

  const areaRef = useRef<HTMLDivElement | null>(null);
  const arrastando = useRef<{ campoId: string; dx: number; dy: number } | null>(null);

  const medir = useCallback((p: number) => setProporcao(p), []);
  const alturaPagina = larguraPagina * proporcao;

  const indiceDoSignatario = (id: string) => signatarios.findIndex((s) => s.id === id);

  // ---------------------------------------------------------------------
  // Signatários
  // ---------------------------------------------------------------------
  async function novoSignatario() {
    const r = await adicionarSignatario(doc.id);
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setSignatarios((atual) => [...atual, r.signatario]);
    setAtivo(r.signatario.id);
  }

  function editarSignatario(id: string, valores: Partial<SignatarioRow>) {
    setSignatarios((atual) => atual.map((s) => (s.id === id ? { ...s, ...valores } : s)));
    void salvarSignatario(doc.id, id, valores as Record<string, unknown>).then((r) => {
      if (!r.ok) setErro(r.error);
    });
  }

  function apagarSignatario(id: string) {
    setSignatarios((atual) => atual.filter((s) => s.id !== id));
    // Os campos daquela pessoa somem junto — no banco por cascata, aqui na
    // mão, para a tela não mostrar campo órfão por um segundo.
    setCampos((atual) => atual.filter((c) => c.signatario_id !== id));
    if (ativo === id) setAtivo(null);
    void removerSignatario(doc.id, id).then((r) => {
      if (!r.ok) setErro(r.error);
    });
  }

  // ---------------------------------------------------------------------
  // Campos sobre a página
  // ---------------------------------------------------------------------
  async function soltarCampo(pagina: number, e: React.MouseEvent<HTMLDivElement>) {
    if (!ativo) {
      setErro("Escolha primeiro quem vai assinar.");
      return;
    }
    const caixa = e.currentTarget.getBoundingClientRect();
    const tamanho = TIPOS_CAMPO[tipoAtivo];
    // O clique marca o CENTRO do campo — é onde o olho está mirando.
    const x = (e.clientX - caixa.left) / caixa.width - tamanho.largura / 2;
    const y = (e.clientY - caixa.top) / caixa.height - tamanho.altura / 2;

    const r = await adicionarCampo(doc.id, {
      signatarioId: ativo,
      pagina,
      tipo: tipoAtivo,
      x,
      y,
      largura: tamanho.largura,
      altura: tamanho.altura,
    });
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setCampos((atual) => [...atual, r.campo]);
  }

  function aoMover(e: React.MouseEvent) {
    const d = arrastando.current;
    if (!d || !areaRef.current) return;
    const pagina = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCampos((atual) =>
      atual.map((c) =>
        c.id === d.campoId
          ? {
              ...c,
              x: Math.min(1 - c.largura, Math.max(0, (e.clientX - pagina.left) / pagina.width - d.dx)),
              y: Math.min(1 - c.altura, Math.max(0, (e.clientY - pagina.top) / pagina.height - d.dy)),
            }
          : c
      )
    );
  }

  function aoSoltar() {
    const d = arrastando.current;
    arrastando.current = null;
    if (!d) return;
    const campo = campos.find((c) => c.id === d.campoId);
    if (campo) void moverCampo(doc.id, campo.id, { x: campo.x, y: campo.y });
  }

  function apagarCampo(id: string) {
    setCampos((atual) => atual.filter((c) => c.id !== id));
    void removerCampo(doc.id, id);
  }

  const paginas = Array.from({ length: Math.max(1, doc.paginas) }, (_, i) => i);

  return (
    <div className="flex min-h-0 flex-1 gap-5">
      {/* =============================================================== */}
      {/* PAINEL — quem assina e qual campo se está soltando              */}
      {/* =============================================================== */}
      <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto">
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-ink-muted">Título</label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() => {
              if (titulo !== doc.titulo) void renomearDocumento(doc.id, titulo);
            }}
          />
        </div>

        <div className={travado ? "pointer-events-none opacity-60" : undefined}>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              <IconUsers className="h-3 w-3" /> Quem assina
            </p>
            <Button variant="ghost" className="px-2 py-1 text-[11px]" onClick={() => void novoSignatario()}>
              <IconPlus className="h-3 w-3" /> Adicionar
            </Button>
          </div>

          {signatarios.length === 0 ? (
            <p className="rounded-lg border border-dashed border-base-700 px-3 py-4 text-center text-[11px] text-ink-muted">
              Ninguém ainda. Adicione quem vai assinar antes de marcar os campos.
            </p>
          ) : (
            <ul className="space-y-2">
              {signatarios.map((s, i) => {
                const cor = corDoSignatario(i);
                const selecionado = ativo === s.id;
                return (
                  <li
                    key={s.id}
                    onClick={() => setAtivo(s.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border p-2.5 transition",
                      selecionado ? "border-transparent bg-base-800/60" : "border-base-800 hover:border-base-700"
                    )}
                    style={selecionado ? { boxShadow: `0 0 0 2px ${cor}` } : undefined}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      {/* A cor é a ligação entre a pessoa aqui e os campos
                          dela lá na página — sem ela, dez campos iguais não
                          diriam de quem é qual. */}
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
                      <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">Signatário {i + 1}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          apagarSignatario(s.id);
                        }}
                        className="ml-auto rounded p-1 text-ink-muted transition hover:text-danger"
                        aria-label="Remover signatário"
                      >
                        <IconTrash className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={s.nome}
                        placeholder="Nome"
                        onChange={(e) => editarSignatario(s.id, { nome: e.target.value })}
                        className="h-8 py-1 text-xs"
                      />
                      <Input
                        value={s.email}
                        type="email"
                        placeholder="email@exemplo.com"
                        onChange={(e) => editarSignatario(s.id, { email: e.target.value })}
                        className="h-8 py-1 text-xs"
                      />
                      <Input
                        value={s.documento ?? ""}
                        placeholder="CPF (opcional — confere na hora de assinar)"
                        onChange={(e) => editarSignatario(s.id, { documento: e.target.value })}
                        className="h-8 py-1 text-xs"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {signatarios.length > 0 && !travado && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted">Campo a marcar</p>
            <div className="flex flex-wrap gap-1.5">
              {ORDEM_TIPOS_CAMPO.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoAtivo(tipo)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition",
                    tipoAtivo === tipo
                      ? "border-accent/40 bg-accent/[0.14] text-accent"
                      : "border-base-700 text-ink-secondary hover:border-base-600 hover:text-ink-primary"
                  )}
                >
                  {TIPOS_CAMPO[tipo].rotulo}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ink-muted">
              Escolha a pessoa e o campo, depois clique na página onde ele deve ficar. Para tirar, clique no campo e use a
              lixeira.
            </p>
          </div>
        )}

        {erro && <p className="text-xs text-danger">{erro}</p>}

        <PainelDeEnvio
          documentoId={doc.id}
          titulo={titulo}
          status={doc.status}
          signatarios={signatarios}
          eventos={eventos}
        />
      </aside>

      {/* =============================================================== */}
      {/* O DOCUMENTO                                                      */}
      {/* =============================================================== */}
      <div ref={areaRef} className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-base-700 bg-base-950/60 p-6">
        {!urlArquivo ? (
          <p className="py-16 text-center text-sm text-ink-muted">Não consegui abrir o arquivo deste documento.</p>
        ) : (
          <div className="mx-auto flex flex-col items-center gap-6" style={{ width: larguraPagina }}>
            <div className="flex w-full items-center justify-end gap-1 text-xs text-ink-secondary">
              <button
                type="button"
                className="rounded px-2 py-1 hover:text-ink-primary"
                onClick={() => setLarguraPagina((l) => Math.max(360, l - 120))}
              >
                −
              </button>
              <span className="w-16 text-center tabular-nums">{Math.round((larguraPagina / 720) * 100)}%</span>
              <button
                type="button"
                className="rounded px-2 py-1 hover:text-ink-primary"
                onClick={() => setLarguraPagina((l) => Math.min(1200, l + 120))}
              >
                +
              </button>
            </div>

            {paginas.map((p) => (
              <div key={p} className="w-full">
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  Página {p + 1} de {paginas.length}
                </p>
                <div
                  className={travado ? "relative" : "relative cursor-crosshair"}
                  style={{ width: larguraPagina, height: alturaPagina }}
                  onClick={(e) => (travado ? undefined : void soltarCampo(p, e))}
                  onMouseMove={aoMover}
                  onMouseUp={aoSoltar}
                  onMouseLeave={aoSoltar}
                >
                  <PaginaPdf url={urlArquivo} pagina={p} largura={larguraPagina} aoMedir={p === 0 ? medir : undefined} />

                  {campos
                    .filter((c) => c.pagina === p)
                    .map((campo) => {
                      const i = indiceDoSignatario(campo.signatario_id);
                      const cor = corDoSignatario(Math.max(0, i));
                      const pessoa = signatarios[i];
                      return (
                        <div
                          key={campo.id}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => {
                            if (travado) return;
                            e.stopPropagation();
                            const caixa = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                            arrastando.current = {
                              campoId: campo.id,
                              dx: (e.clientX - caixa.left) / caixa.width - campo.x,
                              dy: (e.clientY - caixa.top) / caixa.height - campo.y,
                            };
                          }}
                          className="group absolute cursor-move rounded-md border-2 border-dashed"
                          style={{
                            left: `${campo.x * 100}%`,
                            top: `${campo.y * 100}%`,
                            width: `${campo.largura * 100}%`,
                            height: `${campo.altura * 100}%`,
                            borderColor: cor,
                            backgroundColor: `${cor}22`,
                          }}
                        >
                          <span
                            className="pointer-events-none absolute inset-0 flex items-center justify-center truncate px-1 text-[10px] font-semibold"
                            style={{ color: cor }}
                          >
                            {TIPOS_CAMPO[campo.tipo]?.rotulo ?? campo.tipo}
                          </span>
                          <span className="pointer-events-none absolute -top-4 left-0 hidden truncate text-[9px] text-ink-muted group-hover:block">
                            {pessoa?.nome || pessoa?.email || "sem nome"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              apagarCampo(campo.id);
                            }}
                            className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-base-900 text-[9px] text-ink-secondary ring-1 ring-base-600 group-hover:flex hover:text-danger"
                            aria-label="Remover campo"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
