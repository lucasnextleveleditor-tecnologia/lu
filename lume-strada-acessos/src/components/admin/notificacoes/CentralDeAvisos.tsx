"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconMegaphone, IconBox, IconRotateCcw, IconCheck, IconUsers } from "@/components/ui/icons";
import { BotaoDeAcao, BotaoExcluir } from "@/components/ui/AcoesEmLinha";
import { IconTrash } from "@/components/ui/icons";
import { TOM_AVISO, tempoRelativo, type AvisoRow, type PublicoAviso, type TomAviso } from "@/lib/types/notificacoes";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_BCP47 } from "@/lib/i18n/locales";
import { arquivarAviso, excluirAviso, publicarAviso } from "@/app/admin/configuracoes/avisos-actions";

export interface PessoaDaEquipe {
  id: string;
  nome: string;
  email: string;
}

/**
 * A central de avisos do administrador.
 *
 * Duas metades: escrever um aviso novo e ver o que já foi dito. A segunda é
 * a que costuma faltar nos sistemas e a que mais se usa — "isso foi
 * avisado?" é uma pergunta que aparece toda semana, e ela precisa ter
 * resposta sem depender da memória de ninguém.
 *
 * Por isso cada aviso do histórico mostra quantas pessoas já marcaram como
 * visto. Não é métrica de vaidade: é a diferença entre "mandei" e "leram", e
 * é o que decide se vale a pena repetir o recado na reunião.
 */
export function CentralDeAvisos({
  avisos,
  equipe,
  leiturasPorAviso,
}: {
  avisos: AvisoRow[];
  equipe: PessoaDaEquipe[];
  /** avisoId -> quantas pessoas já marcaram como visto. */
  leiturasPorAviso: Record<string, number>;
}) {
  const { dict, locale } = useLocale();
  const tNotif = dict.notificacoes;
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tom, setTom] = useState<TomAviso>("info");
  const [publico, setPublico] = useState<PublicoAviso>("all");
  const [destinatarios, setDestinatarios] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [verArquivados, setVerArquivados] = useState(false);
  const [pendente, start] = useTransition();

  const lista = useMemo(() => avisos.filter((a) => a.arquivado === verArquivados), [avisos, verArquivados]);

  const alcance = publico === "all" ? equipe.length : destinatarios.length;

  function alternarPessoa(id: string) {
    setDestinatarios((atuais) => (atuais.includes(id) ? atuais.filter((p) => p !== id) : [...atuais, id]));
  }

  function publicar() {
    setErro(null);
    start(async () => {
      const r = await publicarAviso({ titulo, mensagem, tom, publico, destinatarios });
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      setTitulo("");
      setMensagem("");
      setTom("info");
      setPublico("all");
      setDestinatarios([]);
      setEnviado(true);
      setTimeout(() => setEnviado(false), 4000);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* ================================================================= */}
      {/* NOVO AVISO                                                        */}
      {/* ================================================================= */}
      <Card>
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <IconMegaphone className="h-4 w-4 text-accent" />
          Novo aviso para a equipe
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-ink-muted">
          Aparece em destaque no sino de quem receber e só sai de lá quando a pessoa clicar em &ldquo;marcar como
          visto&rdquo; — diferente das outras notificações, que somem no primeiro clique.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Título</label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Fechamento de ponto na sexta"
              maxLength={120}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Mensagem</label>
            <Textarea
              rows={4}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Escreva o recado como você falaria na reunião."
            />
          </div>

          {/* -------------------------------------------------------------- */}
          {/* TOM                                                             */}
          {/* -------------------------------------------------------------- */}
          {/*
            Três tons e não cinco: a escala só funciona enquanto a pessoa
            consegue diferenciá-los sem pensar. "Urgente" perde o sentido se
            houver dois níveis de urgente.
          */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Peso do aviso</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TOM_AVISO) as TomAviso[]).map((valor) => {
                const meta = TOM_AVISO[valor];
                const ativo = tom === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setTom(valor)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      !ativo && "border-base-600 text-ink-secondary hover:text-ink-primary"
                    )}
                    style={ativo ? { borderColor: meta.cor, backgroundColor: `${meta.cor}1f`, color: meta.cor } : undefined}
                  >
                    {tNotif.tom[valor]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* PÚBLICO                                                         */}
          {/* -------------------------------------------------------------- */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Quem recebe</label>
            <div className="mb-2 flex gap-1.5 rounded-lg border border-base-800 bg-base-900/60 p-1">
              <button
                type="button"
                onClick={() => setPublico("all")}
                className={cn(
                  "flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  publico === "all" ? "bg-accent/15 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
                )}
              >
                Toda a equipe
              </button>
              <button
                type="button"
                onClick={() => setPublico("specific_users")}
                className={cn(
                  "flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  publico === "specific_users" ? "bg-accent/15 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
                )}
              >
                Pessoas específicas
              </button>
            </div>

            {publico === "specific_users" && (
              <ul className="max-h-56 divide-y divide-base-800 overflow-y-auto rounded-xl border border-base-700">
                {equipe.length === 0 && (
                  <li className="px-3 py-4 text-center text-xs text-ink-muted">Ninguém com acesso ao sistema ainda.</li>
                )}
                {equipe.map((pessoa) => {
                  const marcado = destinatarios.includes(pessoa.id);
                  return (
                    <li key={pessoa.id}>
                      <button
                        type="button"
                        onClick={() => alternarPessoa(pessoa.id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-base-800/50"
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                            marcado ? "border-accent bg-accent text-white" : "border-base-600"
                          )}
                        >
                          {marcado && <IconCheck className="h-2.5 w-2.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-ink-primary">{pessoa.nome}</span>
                          <span className="block truncate text-[11px] text-ink-muted">{pessoa.email}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {erro && <p className="text-xs text-danger">{erro}</p>}
          {enviado && (
            <p className="flex items-center gap-1.5 text-xs text-status-good">
              <IconCheck className="h-3.5 w-3.5" /> Aviso publicado — já está no sino de quem recebeu.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <IconUsers className="h-3 w-3" />
              {alcance === 0
                ? "Ninguém selecionado"
                : alcance === 1
                  ? "1 pessoa vai receber"
                  : `${alcance} pessoas vão receber`}
            </p>
            <Button onClick={publicar} disabled={pendente || !titulo.trim() || !mensagem.trim()}>
              <IconMegaphone className="h-4 w-4" />
              {pendente ? "Publicando…" : "Publicar aviso"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ================================================================= */}
      {/* HISTÓRICO                                                         */}
      {/* ================================================================= */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Avisos publicados</h2>
          <div className="flex gap-1.5 rounded-lg border border-base-800 bg-base-900/60 p-1">
            <button
              type="button"
              onClick={() => setVerArquivados(false)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                !verArquivados ? "bg-accent/15 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => setVerArquivados(true)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                verArquivados ? "bg-accent/15 text-ink-primary" : "text-ink-muted hover:text-ink-secondary"
              )}
            >
              Arquivados
            </button>
          </div>
        </div>

        {lista.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-700 py-10 text-center">
            <p className="text-xs text-ink-muted">
              {verArquivados ? "Nenhum aviso arquivado." : "Nenhum aviso publicado ainda."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-base-800 overflow-hidden rounded-xl border border-base-700">
            {lista.map((aviso) => {
              const meta = TOM_AVISO[aviso.tone];
              const lidos = leiturasPorAviso[aviso.id] ?? 0;
              const total =
                aviso.target_type === "all" ? equipe.length : aviso.target_user_ids.length;
              return (
                <li key={aviso.id} className="flex items-start gap-3 px-4 py-3">
                  <span
                    className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.cor }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-ink-primary">{aviso.title}</span>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: meta.cor }}>
                        {tNotif.tom[aviso.tone]}
                      </span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-[11px] leading-snug text-ink-muted">
                      {aviso.message}
                    </p>
                    <p className="mt-1.5 text-[10px] text-ink-muted">
                      {tempoRelativo(aviso.created_at, tNotif, LOCALE_BCP47[locale])} ·{" "}
                      {aviso.target_type === "all" ? "toda a equipe" : `${aviso.target_user_ids.length} pessoa(s)`} ·{" "}
                      {/*
                        Quantos leram, e não só quantos receberam: é a
                        diferença entre "mandei" e "leram", e é ela que decide
                        se o recado precisa ser repetido na reunião.
                      */}
                      <span className={lidos > 0 ? "text-ink-secondary" : undefined}>
                        {lidos} de {total} marcaram como visto
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <BotaoDeAcao
                      icone={aviso.arquivado ? <IconRotateCcw className="h-3.5 w-3.5" /> : <IconBox className="h-3.5 w-3.5" />}
                      rotulo={aviso.arquivado ? "Desarquivar" : "Arquivar"}
                      desativado={pendente}
                      aoClicar={() =>
                        start(async () => {
                          await arquivarAviso(aviso.id, !aviso.arquivado);
                          router.refresh();
                        })
                      }
                    />
                    <BotaoExcluir
                      icone={<IconTrash className="h-3.5 w-3.5" />}
                      rotulo="Excluir aviso"
                      pergunta="Excluir?"
                      rotuloConfirmar="Confirmar"
                      rotuloCancelar="Cancelar"
                      desativado={pendente}
                      aoConfirmar={() =>
                        start(async () => {
                          await excluirAviso(aviso.id);
                          router.refresh();
                        })
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
