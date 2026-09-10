import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { buscarUsoDeArmazenamento, buscarDetalheDoArmazenamento, fmtBytes } from "@/lib/armazenamento/uso";
import { fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { IconChevronRight, IconAlertTriangle, IconYoutube, IconBox, IconTrash, IconExternalLink } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * Onde o espaço da conta está indo.
 *
 * Existe porque uma barra que só diz "8 de 10 GB" não ajuda ninguém: a
 * pergunta seguinte é sempre "gasto com o quê?", e sem resposta a pessoa
 * apaga no escuro ou pede mais espaço. Aqui a conta é aberta por área, e os
 * maiores arquivos ficam listados — é neles que se ganha espaço de verdade:
 * apagar cem arquivos de 20 KB não muda nada, apagar três de 40 MB muda.
 *
 * As dicas vêm depois da conta, e não antes: conselho antes do diagnóstico é
 * palpite.
 */
export default async function ArmazenamentoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const perfil = await buscarPerfilComPermissoes(supabase, user.id);
  if (!perfil) redirect("/login");
  if (perfil.role !== "admin" && perfil.role !== "funcionario") redirect("/dashboard");

  const [uso, detalhe] = await Promise.all([buscarUsoDeArmazenamento(), buscarDetalheDoArmazenamento()]);
  const pct = uso ? Math.round(uso.fracao * 100) : 0;
  const apertado = uso ? uso.fracao >= 0.75 : false;
  const cheio = uso ? uso.fracao >= 0.9 : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Armazenamento</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Quanto a sua conta ocupa e onde esse espaço está indo.</p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* O TOTAL                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Em uso</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-ink-primary">
              {uso ? fmtBytes(uso.bytesUsados) : "—"}
              <span className="ml-2 text-base font-normal text-ink-muted">de {uso ? fmtBytes(uso.bytesLimite) : "—"}</span>
            </p>
          </div>
          <p className={cn("text-2xl font-semibold tabular-nums", cheio ? "text-status-critical" : apertado ? "text-status-warning" : "text-status-good")}>
            {pct}%
          </p>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-base-800">
          <div
            className={cn("h-full rounded-full", cheio ? "bg-status-critical" : apertado ? "bg-status-warning" : "bg-status-good")}
            style={{ width: `${Math.max(pct, uso && uso.fracao > 0 ? 1.5 : 0)}%` }}
          />
        </div>

        {apertado && (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-status-warning/40 bg-status-warning/10 px-3 py-2 text-xs leading-snug text-status-warning">
            <IconAlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              {cheio
                ? "A conta está quase cheia. Quando encher, novos envios param — veja as dicas abaixo antes disso acontecer."
                : "Você já passou de três quartos do espaço. Vale olhar os maiores arquivos abaixo."}
            </span>
          </p>
        )}
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* POR ÁREA                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Onde está indo</p>
        <p className="mb-4 text-xs text-ink-muted">Cada linha leva à tela onde esses arquivos vivem.</p>

        {!detalhe || detalhe.areas.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">Nenhum arquivo guardado ainda.</p>
        ) : (
          <ul className="divide-y divide-base-800">
            {detalhe.areas.map((area) => {
              const linha = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                      {area.rotulo}
                      {area.href && <IconChevronRight className="h-3.5 w-3.5 text-ink-muted" />}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-ink-muted">{area.explicacao}</p>
                    <div className="mt-1.5 h-1 w-full max-w-xs overflow-hidden rounded-full bg-base-800">
                      <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.max(area.fatia * 100, 1.5)}%` }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink-primary">{fmtBytes(area.bytes)}</p>
                    <p className="text-[11px] tabular-nums text-ink-muted">
                      {area.arquivos} {area.arquivos === 1 ? "arquivo" : "arquivos"}
                    </p>
                  </div>
                </>
              );

              return (
                <li key={area.chave}>
                  {area.href ? (
                    <Link href={area.href} className="flex items-start gap-4 py-3 transition hover:opacity-80">
                      {linha}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4 py-3">{linha}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* OS MAIORES                                                        */}
      {/* ---------------------------------------------------------------- */}
      {detalhe && detalhe.maiores.length > 0 && (
        <Card>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Os maiores arquivos</p>
          <p className="mb-4 text-xs text-ink-muted">
            É aqui que se ganha espaço. Apagar cem arquivos de 20 KB não muda nada; apagar três destes muda.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-base-800 text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="py-2 font-medium">Arquivo</th>
                  <th className="py-2 font-medium">Área</th>
                  <th className="py-2 font-medium">Enviado</th>
                  <th className="py-2 text-right font-medium">Tamanho</th>
                </tr>
              </thead>
              <tbody>
                {detalhe.maiores.map((arq, i) => (
                  <tr key={`${arq.bucket}-${i}`} className="border-b border-base-800 last:border-0">
                    <td className="max-w-[22rem] truncate py-2.5 pr-4 text-sm text-ink-primary" title={arq.nome}>
                      {arq.nome}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-ink-secondary">{arq.area}</td>
                    <td className="py-2.5 pr-4 text-xs text-ink-muted">{fmtDataCurta(arq.criadoEm.slice(0, 10))}</td>
                    <td className="py-2.5 text-right text-sm font-medium tabular-nums text-ink-primary">{fmtBytes(arq.bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* COMO GANHAR ESPAÇO                                                */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Como ganhar espaço</p>
        <p className="mb-4 text-xs text-ink-muted">Em ordem do que mais rende para o que menos rende.</p>

        <div className="space-y-3">
          <Dica
            icone={<IconYoutube className="h-4 w-4" />}
            titulo="Vídeo, sempre por link"
            texto="É o que mais pesa, de longe. Suba no YouTube como “não listado” (grátis, ilimitado, toca liso) ou no Drive, e cole o link no lugar de enviar o arquivo. O vídeo aparece dentro do sistema do mesmo jeito, e ocupa zero."
            onde="Portfólio, criativos de anúncio e entregas de produção já aceitam link."
          />
          <Dica
            icone={<IconBox className="h-4 w-4" />}
            titulo="Comprima antes de subir"
            texto="Um PDF escaneado costuma cair a um quinto do tamanho sem perder leitura, e uma foto de 4000px vira 1600px sem ninguém notar na tela. Vale sobretudo para comprovante do financeiro, que é volume."
            onde="Qualquer compressor de PDF ou o próprio “exportar para web” do editor de imagem resolve."
          />
          <Dica
            icone={<IconTrash className="h-4 w-4" />}
            titulo="Apague versão antiga de entrega"
            texto="Cada revisão enviada ao cliente vira um arquivo novo, e a v1 raramente é aberta depois que a v4 foi aprovada. É a limpeza que mais rende sem perder nada de valor."
            onde="Produção → a tarefa → Entregas."
          />
          <Dica
            icone={<IconExternalLink className="h-4 w-4" />}
            titulo="Material pesado de referência, no Drive"
            texto="Briefing com muita imagem, pasta de referências, arquivo bruto de captação: nada disso precisa morar aqui. Guarde no Drive e traga o link."
            onde="Vale para tudo que é consulta, não para o que precisa de assinatura."
          />
        </div>

        <p className="mt-4 rounded-lg border border-base-700 bg-base-950/60 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
          <span className="font-medium text-ink-secondary">O que não dá para tirar daqui:</span> PDF enviado para assinatura. A
          assinatura é carimbada dentro do arquivo e o sistema guarda o original e a via assinada — é o par que sustenta a prova
          se alguém contestar. Esses ficam.
        </p>
      </Card>
    </div>
  );
}

function Dica({ icone, titulo, texto, onde }: { icone: React.ReactNode; titulo: string; texto: string; onde: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-base-800 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-800 text-accent">{icone}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-primary">{titulo}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{texto}</p>
        <p className="mt-1 text-[11px] leading-snug text-ink-muted/80">{onde}</p>
      </div>
    </div>
  );
}
