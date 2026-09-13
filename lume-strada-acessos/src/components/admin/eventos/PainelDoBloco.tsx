"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { fusoValido } from "@/lib/utils/fusos";
import { TIPOS_BLOCO, type AmbienteRow, type AncoraBloco, type BlocoRow, type EquipeEventoRow, type TipoBloco } from "@/lib/types/eventos";
import { IconCravado } from "@/components/admin/eventos/Grade";

/**
 * O painel do bloco — a única tela do módulo em que alguém digita.
 *
 * E digita UMA coisa: o título. Tipo é chip, âncora é chip, hora e duração são
 * −/+, ambiente e responsável são lista. Isso não é enfeite de usabilidade: a
 * pessoa vai abrir este painel trinta vezes montando um evento, e vinte delas
 * no celular, em pé, no meio de um galpão. Cada campo de texto a mais é uma
 * chance de teclado aberto por cima do que ela precisa ver.
 *
 * A PERGUNTA QUE IMPORTA é a âncora, e ela aparece com a explicação ao lado,
 * sempre — não escondida num tooltip. É a resposta dela que decide se o bloco
 * anda quando o show atrasar, e quem responde errado só descobre às duas da
 * manhã.
 */

const PASSO_MIN = 5;
const MINUTO = 60_000;

export interface ValoresDoBloco {
  ambienteId: string | null;
  titulo: string;
  tipo: TipoBloco;
  ancora: AncoraBloco;
  inicio: string;
  duracaoMin: number | null;
  responsavelId: string | null;
  observacoes: string | null;
}

interface Props {
  /** Null = fechado. */
  bloco: BlocoRow | null;
  /** Preenchido quando é criação a partir de um clique na grade. */
  /** `duracaoMin` vem preenchida quando o bloco foi DESENHADO na grade. */
  rascunho: { ambienteId: string; inicio: string; duracaoMin?: number } | null;
  ambientes: AmbienteRow[];
  equipe: EquipeEventoRow[];
  fuso: string;
  salvando: boolean;
  onSalvar: (valores: ValoresDoBloco) => void;
  onRemover: () => void;
  onFechar: () => void;
}

export function PainelDoBloco({ bloco, rascunho, ambientes, equipe, fuso, salvando, onSalvar, onRemover, onFechar }: Props) {
  const { dict } = useLocale();
  const t = dict.eventos;
  const zona = fusoValido(fuso);

  const aberto = !!bloco || !!rascunho;
  const editando = !!bloco;

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoBloco>("show");
  const [ancora, setAncora] = useState<AncoraBloco>("encadeado");
  const [inicio, setInicio] = useState<string>(new Date().toISOString());
  const [duracao, setDuracao] = useState(60);
  const [ambienteId, setAmbienteId] = useState<string | null>(null);
  const [responsavelId, setResponsavelId] = useState<string | null>(null);

  // Recarrega ao trocar de bloco. A dependência é o id (e não o objeto), senão
  // uma revalidação do servidor no meio da digitação jogaria o texto fora.
  useEffect(() => {
    if (bloco) {
      setTitulo(bloco.titulo);
      setTipo(bloco.tipo);
      setAncora(bloco.ancora);
      setInicio(bloco.inicio);
      setDuracao(bloco.duracao_min ?? 60);
      setAmbienteId(bloco.ambiente_id);
      setResponsavelId(bloco.responsavel_id);
      return;
    }
    if (rascunho) {
      const amb = ambientes.find((a) => a.id === rascunho.ambienteId);
      setTitulo("");
      setTipo("show");
      // O ambiente SUGERE a âncora — é para isso que ele carrega um modo.
      setAncora(amb?.modo_padrao ?? "encadeado");
      setInicio(rascunho.inicio);
      // Uma hora é o chute de quem só tocou na grade. Quem arrastou já
      // respondeu a pergunta, e sobrescrever a resposta seria rude.
      setDuracao(rascunho.duracaoMin ?? 60);
      setAmbienteId(rascunho.ambienteId);
      setResponsavelId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloco?.id, rascunho?.ambienteId, rascunho?.inicio, rascunho?.duracaoMin]);

  if (!aberto) return null;

  const ehBoom = tipo === "boom";
  const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(inicio)
  );
  const fimEscrito = ehBoom
    ? null
    : new Intl.DateTimeFormat("pt-BR", { timeZone: zona, hour: "2-digit", minute: "2-digit", hour12: false }).format(
        new Date(new Date(inicio).getTime() + duracao * MINUTO)
      );

  const mover = (min: number) => setInicio(new Date(new Date(inicio).getTime() + min * MINUTO).toISOString());

  return (
    <>
      {/* A gaveta abre POR CIMA e escurece o resto, mas não some com a grade:
          quem está editando um bloco precisa continuar vendo onde ele cai. */}
      <button
        type="button"
        aria-label={dict.common.fechar}
        onClick={onFechar}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
      />

      <aside className="ev-console fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-white/10 shadow-2xl">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none absolute inset-0" />

        <div className="relative flex-1 px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
              {editando ? t.blocoEditar : t.blocoNovo}
            </p>
            <button type="button" onClick={onFechar} className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:text-white">
              {dict.common.fechar}
            </button>
          </div>

          {/* O único campo de texto do painel. */}
          <label className="mt-6 block font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{t.blocoTitulo}</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={t.blocoTituloPlaceholder}
            autoFocus
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-[15px] text-white placeholder:text-white/25 focus:border-accent/60 focus:outline-none"
          />

          <Secao titulo={t.blocoTipo}>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_BLOCO.map((chave) => (
                <Chip
                  key={chave}
                  ativo={tipo === chave}
                  onClick={() => {
                    setTipo(chave);
                    // Boom é instante e quase sempre contratado com hora: o
                    // padrão acompanha, e continua trocável num toque.
                    if (chave === "boom") setAncora("cravado");
                  }}
                >
                  {rotuloDoTipo(chave, t)}
                </Chip>
              ))}
            </div>
          </Secao>

          <Secao titulo={t.blocoAncora}>
            <div className="grid gap-1.5 sm:grid-cols-2">
              <Cartao
                ativo={ancora === "encadeado"}
                onClick={() => setAncora("encadeado")}
                titulo={t.ancoraEncadeado}
                texto={t.ancoraEncadeadoAjuda}
              />
              <Cartao
                ativo={ancora === "cravado"}
                onClick={() => setAncora("cravado")}
                titulo={t.ancoraCravado}
                texto={t.ancoraCravadoAjuda}
                icone={<IconCravado className="h-3 w-3" />}
              />
            </div>
          </Secao>

          <Secao titulo={t.blocoQuando}>
            <div className="flex flex-wrap items-center gap-3">
              <Passo valor={hora} onMenos={() => mover(-PASSO_MIN)} onMais={() => mover(PASSO_MIN)} largo />
              {!ehBoom && (
                <>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{t.blocoDuracao}</span>
                  <Passo
                    valor={`${duracao} min`}
                    onMenos={() => setDuracao((d) => Math.max(PASSO_MIN, d - PASSO_MIN))}
                    onMais={() => setDuracao((d) => d + PASSO_MIN)}
                  />
                </>
              )}
            </div>
            {fimEscrito && (
              <p className="mt-2 font-mono text-[10px] text-white/35">
                {hora} — {fimEscrito}
              </p>
            )}
          </Secao>

          <Secao titulo={t.blocoOnde}>
            <Lista
              valor={ambienteId ?? ""}
              onChange={(v) => setAmbienteId(v || null)}
              opcoes={ambientes.map((a) => ({ valor: a.id, rotulo: a.nome }))}
              vazio={t.blocoSemAmbiente}
            />
          </Secao>

          <Secao titulo={t.blocoQuemCobre}>
            <Lista
              valor={responsavelId ?? ""}
              onChange={(v) => setResponsavelId(v || null)}
              opcoes={equipe.map((p) => ({ valor: p.id, rotulo: p.funcao ? `${p.nome} · ${p.funcao}` : p.nome }))}
              vazio={t.blocoSemResponsavel}
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">{t.blocoQuemCobreAjuda}</p>
          </Secao>

          <div className="mt-7 flex items-center gap-2">
            <button
              type="button"
              disabled={salvando || !titulo.trim()}
              onClick={() =>
                onSalvar({
                  ambienteId,
                  titulo,
                  tipo,
                  ancora,
                  inicio,
                  duracaoMin: ehBoom ? null : duracao,
                  responsavelId,
                  observacoes: null,
                })
              }
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-black transition disabled:opacity-40"
              style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 22px rgb(var(--color-accent) / 0.45)" }}
            >
              {salvando ? dict.common.salvando : dict.common.salvar}
            </button>

            {editando && (
              <button
                type="button"
                onClick={onRemover}
                disabled={salvando}
                className="rounded-lg border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-40"
              >
                {dict.common.excluir}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function rotuloDoTipo(tipo: TipoBloco, t: { tipoShow: string; tipoAtivacao: string; tipoBoom: string; tipoOperacao: string }): string {
  if (tipo === "show") return t.tipoShow;
  if (tipo === "ativacao") return t.tipoAtivacao;
  if (tipo === "boom") return t.tipoBoom;
  return t.tipoOperacao;
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{titulo}</p>
      {children}
    </div>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        ativo ? "border-accent bg-accent/15 text-white" : "border-white/12 text-white/55 hover:border-white/30 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function Cartao({
  ativo,
  onClick,
  titulo,
  texto,
  icone,
}: {
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  texto: string;
  icone?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border px-3.5 py-3 text-left transition",
        ativo ? "border-accent/50 bg-accent/[0.07]" : "border-white/10 bg-black/30 hover:border-white/25"
      )}
    >
      {ativo && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "rgb(var(--color-accent))", boxShadow: "0 0 10px rgb(var(--color-accent))" }}
        />
      )}
      <span className={cn("flex items-center gap-1.5 text-[13px] font-medium", ativo ? "text-white" : "text-white/75")}>
        {icone}
        {titulo}
      </span>
      <span className="mt-1 block text-[11px] leading-relaxed text-white/40">{texto}</span>
    </button>
  );
}

/** O −/+ que substitui o teclado. */
function Passo({
  valor,
  onMenos,
  onMais,
  largo,
}: {
  valor: string;
  onMenos: () => void;
  onMais: () => void;
  largo?: boolean;
}) {
  return (
    <span className="inline-flex items-stretch overflow-hidden rounded-lg border border-white/12 bg-black/40">
      <BotaoPasso onClick={onMenos} sinal="−" />
      <span
        className={cn(
          "flex items-center justify-center px-3 font-mono tabular-nums text-white",
          largo ? "min-w-[74px] text-[17px]" : "min-w-[68px] text-[13px]"
        )}
      >
        {valor}
      </span>
      <BotaoPasso onClick={onMais} sinal="+" />
    </span>
  );
}

function BotaoPasso({ onClick, sinal }: { onClick: () => void; sinal: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 shrink-0 text-base text-white/50 transition hover:bg-white/[0.06] hover:text-accent"
    >
      {sinal}
    </button>
  );
}

function Lista({
  valor,
  onChange,
  opcoes,
  vazio,
}: {
  valor: string;
  onChange: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
  vazio: string;
}) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-accent/60 focus:outline-none"
    >
      <option value="">{vazio}</option>
      {opcoes.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.rotulo}
        </option>
      ))}
    </select>
  );
}
