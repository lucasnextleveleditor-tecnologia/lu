import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarUsoDeArmazenamento, buscarDetalheDoArmazenamento } from "@/lib/armazenamento/uso";
import { fmtBytes } from "@/lib/utils/bytes";
import { substituir } from "@/lib/utils/texto";
import { fmtDataCurta } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { OtimizarEspaco } from "@/components/admin/armazenamento/OtimizarEspaco";
import type { AreaTextoDict } from "@/lib/i18n/dictionaries/pt/armazenamento";
import {
  IconChevronRight,
  IconAlertTriangle,
  IconYoutube,
  IconMinimize,
  IconTrash,
  IconExternalLink,
  IconLayers,
} from "@/components/ui/icons";

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
 * palpite. E o backup ("Otimizar espaço") vem por último de propósito — é a
 * saída definitiva, e só faz sentido depois que a pessoa já viu o que tem.
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

  const { dict, locale } = await getDictionary();
  const t = dict.armazenamento;
  const [uso, detalhe] = await Promise.all([buscarUsoDeArmazenamento(), buscarDetalheDoArmazenamento()]);
  const pct = uso ? Math.round(uso.fracao * 100) : 0;
  const apertado = uso ? uso.fracao >= 0.75 : false;
  const cheio = uso ? uso.fracao >= 0.9 : false;

  // Bucket → texto. O `Record` frouxo é de propósito: se um bucket novo
  // aparecer antes de alguém escrever a tradução dele, a linha some da tela
  // — o `?? chave` abaixo mostra o nome técnico em vez de quebrar a página.
  const textoDaArea = t.areas as Record<string, AreaTextoDict | undefined>;
  const contarArquivos = (n: number) =>
    n === 1 ? t.arquivoUm : substituir(t.arquivoMuitos, { n: n.toLocaleString(locale) });

  const areasParaBackup = (detalhe?.areas ?? []).map((a) => ({
    chave: a.chave,
    rotulo: textoDaArea[a.chave]?.rotulo ?? a.chave,
    arquivos: a.arquivos,
    bytes: a.bytes,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t.titulo}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{t.subtitulo}</p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* O TOTAL                                                           */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.emUso}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-ink-primary">
              {uso ? fmtBytes(uso.bytesUsados, locale) : "—"}
              <span className="ml-2 text-base font-normal text-ink-muted">
                {t.de} {uso ? fmtBytes(uso.bytesLimite, locale) : "—"}
              </span>
            </p>
          </div>
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums",
              cheio ? "text-status-critical" : apertado ? "text-status-warning" : "text-status-good"
            )}
          >
            {pct}%
          </p>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-base-800">
          <div
            className={cn(
              "h-full rounded-full",
              cheio ? "bg-status-critical" : apertado ? "bg-status-warning" : "bg-status-good"
            )}
            style={{ width: `${Math.max(pct, uso && uso.fracao > 0 ? 1.5 : 0)}%` }}
          />
        </div>

        {apertado && (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-status-warning/40 bg-status-warning/10 px-3 py-2 text-xs leading-snug text-status-warning">
            <IconAlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>{cheio ? t.avisoQuaseCheio : t.avisoTresQuartos}</span>
          </p>
        )}
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* POR ÁREA                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.ondeEstaIndo}</p>
        <p className="mb-4 text-xs text-ink-muted">{t.ondeEstaIndoSub}</p>

        {!detalhe || detalhe.areas.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">{t.nenhumArquivo}</p>
        ) : (
          <ul className="divide-y divide-base-800">
            {detalhe.areas.map((area) => {
              const texto = textoDaArea[area.chave];
              const linha = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                      {texto?.rotulo ?? area.chave}
                      {area.href && <IconChevronRight className="h-3.5 w-3.5 text-ink-muted" />}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-ink-muted">{texto?.explicacao ?? ""}</p>
                    <div className="mt-1.5 h-1 w-full max-w-xs overflow-hidden rounded-full bg-base-800">
                      <div
                        className="h-full rounded-full bg-accent/70"
                        style={{ width: `${Math.max(area.fatia * 100, 1.5)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink-primary">
                      {fmtBytes(area.bytes, locale)}
                    </p>
                    <p className="text-[11px] tabular-nums text-ink-muted">{contarArquivos(area.arquivos)}</p>
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
      {/* OTIMIZAR ESPAÇO — SÓ ADMIN                                        */}
      {/* ---------------------------------------------------------------- */}
      {/*
        Vem logo depois de "onde está indo" porque é a resposta dela: a pessoa
        acabou de ver quem come o espaço, e a saída está à mão. O diagnóstico
        detalhado (maiores arquivos, dicas) segue abaixo, para quem quiser
        entender antes de agir.

        Fora do alcance de funcionário mesmo com a tela aberta: o backup leva
        junto contrato assinado e comprovante do financeiro, e apagar é
        definitivo. Nenhuma das duas coisas é de quem tem permissão só de um
        módulo. As actions conferem de novo no servidor — isto aqui é só a
        tela.
      */}
      {perfil.role === "admin" && areasParaBackup.length > 0 && (
        <Card>
          <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            <IconLayers className="h-3.5 w-3.5" />
            {t.backup.titulo}
          </p>
          <div className="mt-3">
            <OtimizarEspaco areas={areasParaBackup} />
          </div>
        </Card>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* OS MAIORES                                                        */}
      {/* ---------------------------------------------------------------- */}
      {detalhe && detalhe.maiores.length > 0 && (
        <Card>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.maioresTitulo}</p>
          <p className="mb-4 text-xs text-ink-muted">{t.maioresSub}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-base-800 text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="py-2 font-medium">{t.colArquivo}</th>
                  <th className="py-2 font-medium">{t.colArea}</th>
                  <th className="py-2 font-medium">{t.colEnviado}</th>
                  <th className="py-2 text-right font-medium">{t.colTamanho}</th>
                </tr>
              </thead>
              <tbody>
                {detalhe.maiores.map((arq, i) => (
                  <tr key={`${arq.bucket}-${i}`} className="border-b border-base-800 last:border-0">
                    <td className="max-w-[22rem] truncate py-2.5 pr-4 text-sm text-ink-primary" title={arq.nome}>
                      {arq.nome}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-ink-secondary">
                      {textoDaArea[arq.bucket]?.rotulo ?? arq.bucket}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-ink-muted">{fmtDataCurta(arq.criadoEm.slice(0, 10))}</td>
                    <td className="py-2.5 text-right text-sm font-medium tabular-nums text-ink-primary">
                      {fmtBytes(arq.bytes, locale)}
                    </td>
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
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.comoGanharTitulo}</p>
        <p className="mb-4 text-xs text-ink-muted">{t.comoGanharSub}</p>

        <div className="space-y-3">
          <Dica icone={<IconYoutube className="h-4 w-4" />} dica={t.dicaVideo} />
          <Dica icone={<IconMinimize className="h-4 w-4" />} dica={t.dicaComprimir} />
          <Dica icone={<IconTrash className="h-4 w-4" />} dica={t.dicaApagar} />
          <Dica icone={<IconExternalLink className="h-4 w-4" />} dica={t.dicaDrive} />
        </div>

        <p className="mt-4 rounded-lg border border-base-700 bg-base-950/60 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
          <span className="font-medium text-ink-secondary">{t.naoDaParaTirarLabel}</span> {t.naoDaParaTirarTexto}
        </p>
      </Card>

    </div>
  );
}

function Dica({ icone, dica }: { icone: React.ReactNode; dica: { titulo: string; texto: string; onde: string } }) {
  return (
    <div className="flex gap-3 rounded-xl border border-base-800 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-800 text-accent">
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-primary">{dica.titulo}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{dica.texto}</p>
        <p className="mt-1 text-[11px] leading-snug text-ink-muted/80">{dica.onde}</p>
      </div>
    </div>
  );
}
