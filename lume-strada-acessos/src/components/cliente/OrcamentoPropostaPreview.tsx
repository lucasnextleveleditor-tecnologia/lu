"use client";

import type { DadosInstitucionaisOrcamento, PortfolioItemComUrl } from "@/lib/types/orcamentos";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import { buildPropostaAccentVars } from "@/lib/utils/color";
import { IconFilm, IconImage, IconBriefcase, IconTarget, IconBuilding, IconHeart, IconCalendar, IconUsers, IconClipboardList, IconLayers, IconMail, IconGlobe } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

/** Forma mínima de item que o preview precisa — `OrcamentoPublicoView` mapeia `OrcItemRow` (banco) e `OrcamentoBuilder` mapeia `ItemLocal` (rascunho em memória) pra isso, cada um com seus próprios nomes de campo. */
export interface ItemPreview {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
  opcional: boolean;
  selecionado: boolean;
}

/** Uma linha da tabela "Itens de Entrega" (deliverables) — `OrcamentoPublicoView`/`OrcamentoBuilder` mapeiam `OrcItemEntregaRow`/rascunho local pra isso. */
export interface ItemEntregaPreview {
  id: string;
  item: string;
  prazo: string | null;
}

/** Uma coluna descritiva de Investimento — `OrcamentoPublicoView`/`OrcamentoBuilder` mapeiam `OrcColunaInvestimentoRow`/rascunho local pra isso. */
export interface ColunaInvestimentoPreview {
  id: string;
  titulo: string;
  itens: string | null;
}

export interface OrcamentoPropostaPreviewProps {
  id?: string;
  titulo: string;
  nomeDestinatario: string;
  dataExpiracao: string | null;
  textoProposta: string | null;
  objetivos: string | null;
  itensObrigatorios: ItemPreview[];
  itensOpcionais: ItemPreview[];
  /** Presente + `interactive: true` = a pessoa pode marcar/desmarcar (link público). Sem isso, o opcional aparece só como informação (preview do construtor). */
  onToggleItem?: (item: ItemPreview) => void;
  interactive?: boolean;
  subtotal: number;
  desconto: number;
  total: number;
  temDesconto: boolean;
  condicoesPagamento: string | null;
  observacoes: string | null;
  portfolio: PortfolioItemComUrl[];
  institucional: DadosInstitucionaisOrcamento;
  empresaNome: string | null;
  className?: string;
  /** Cor de destaque (hex) desta proposta específica — sobrepõe a cor de marca padrão só dentro deste componente (ver `buildPropostaAccentVars`). Null/omitido = usa a cor padrão do app. */
  corDestaque?: string | null;
  /** Imagem de fundo (tela inteira) da capa desta proposta — tem prioridade sobre `institucional.bannerUrl` (que é fixo da agência). */
  capaUrl?: string | null;
  /** Subtítulo/badge da capa (ex: "Proposta Premium") — substitui o rótulo padrão quando presente. */
  capaSubtitulo?: string | null;
  /** Fator de escala (0.80–1.20) do bloco de texto da capa. */
  escalaTextoCapa?: number;
  quantidadeDiarias?: string | null;
  /** Texto livre separado por vírgula (ex: "01x Diretor, 02x Câmeras") — dividido em chips. */
  equipeEscalada?: string | null;
  itensEntrega?: ItemEntregaPreview[];
  colunasInvestimento?: ColunaInvestimentoPreview[];
}

/**
 * Apresentação visual da proposta — extraído de `OrcamentoPublicoView.tsx`
 * pra virar uma ÚNICA fonte de verdade usada em dois lugares: a página
 * pública (`/orcamento/[token]`, interativa — cliente marca opcional e
 * aprova/recusa) e o preview ao vivo do construtor admin
 * (`OrcamentoBuilder.tsx`, só leitura — mostra exatamente o que o cliente
 * vai ver enquanto a pessoa ainda está preenchendo). Qualquer ajuste visual
 * futuro na proposta é feito AQUI, uma vez só, e os dois lugares acompanham.
 */
export function OrcamentoPropostaPreview({
  id,
  titulo,
  nomeDestinatario,
  dataExpiracao,
  textoProposta,
  objetivos,
  itensObrigatorios,
  itensOpcionais,
  onToggleItem,
  interactive = false,
  subtotal,
  desconto,
  total,
  temDesconto,
  condicoesPagamento,
  observacoes,
  portfolio,
  institucional,
  empresaNome,
  className,
  corDestaque,
  capaUrl,
  capaSubtitulo,
  escalaTextoCapa = 1,
  quantidadeDiarias,
  equipeEscalada,
  itensEntrega = [],
  colunasInvestimento = [],
}: OrcamentoPropostaPreviewProps) {
  const { dict } = useLocale();
  const capaDeFundo = capaUrl || institucional.bannerUrl;
  const temHero = !!capaDeFundo;
  const equipeChips = (equipeEscalada ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const temResumoExtra = !!(quantidadeDiarias || equipeChips.length > 0);
  const clientesLogosPreenchidos = institucional.clientesLogosUrls.filter((url): url is string => !!url);
  const temQuemSomos = !!(institucional.textoInstitucional || institucional.clientesAtendidos.length > 0 || clientesLogosPreenchidos.length > 0);
  const accentVars = buildPropostaAccentVars(corDestaque);

  return (
    <div
      id={id}
      className={cn("overflow-hidden rounded-3xl border border-base-700 bg-base-900/80 shadow-[inset_0_1px_0_0_rgb(var(--glow-rgb) / 0.04)]", className)}
      style={accentVars ?? undefined}
    >
      {/* Capa — imagem própria da proposta, senão banner da agência; sem nenhum dos dois, um degradê discreto na cor de marca (nunca um bloco vazio/sem graça) */}
      <div className="relative">
        {temHero ? (
          <div className="relative h-56 w-full sm:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capaDeFundo!} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
          </div>
        ) : (
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-accent/20 via-base-900 to-accent2/10 sm:h-48" />
        )}

        {institucional.logoUrl && (
          <div className="absolute -bottom-7 left-6 h-14 w-14 overflow-hidden rounded-2xl border-4 border-base-900 bg-base-800 shadow-lg sm:left-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={institucional.logoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <div className={cn("absolute inset-x-0 bottom-0 p-6 sm:p-8", !temHero && "relative")}>
          <div style={escalaTextoCapa !== 1 ? { transform: `scale(${escalaTextoCapa})`, transformOrigin: "left bottom" } : undefined}>
            <p className={cn("text-xs font-semibold uppercase tracking-widest", temHero ? "text-white/70" : "text-ink-muted")}>{capaSubtitulo || dict.orcamentos.propostaComercialTitulo}</p>
            <h1 className={cn("mt-1 text-2xl font-semibold tracking-tight sm:text-3xl", temHero ? "text-white" : "text-ink-primary")}>{titulo || dict.orcamentos.placeholderTituloOrcamento}</h1>
            <p className={cn("mt-1 text-sm", temHero ? "text-white/80" : "text-ink-secondary")}>{nomeDestinatario}</p>
            {dataExpiracao && <p className={cn("mt-1 text-xs", temHero ? "text-white/60" : "text-ink-muted")}>{dict.orcamentos.validoAte.replace("{data}", fmtDataCurta(dataExpiracao))}</p>}
          </div>
        </div>
      </div>

      <div className={cn("space-y-6 p-6 sm:p-8", institucional.logoUrl && "pt-10")}>
        {(textoProposta || objetivos) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {objetivos && (
              <div className="rounded-2xl border border-base-800 bg-base-950/40 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
                  <IconTarget className="h-3.5 w-3.5" />
                  <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.objetivosSecaoTitulo}</p>
                </div>
                <p className="whitespace-pre-line text-sm text-ink-secondary">{objetivos}</p>
              </div>
            )}
            {textoProposta && (
              <div className="rounded-2xl border border-base-800 bg-base-950/40 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
                  <IconBriefcase className="h-3.5 w-3.5" />
                  <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.propostaSecaoTitulo}</p>
                </div>
                <p className="whitespace-pre-line text-sm text-ink-secondary">{textoProposta}</p>
              </div>
            )}
          </div>
        )}

        {temResumoExtra && (
          <div className="flex flex-wrap gap-2">
            {quantidadeDiarias && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-base-700 bg-base-800/60 px-3 py-1.5 text-xs text-ink-secondary">
                <IconCalendar className="h-3.5 w-3.5 text-accent" />
                {quantidadeDiarias}
              </span>
            )}
            {equipeChips.map((membro, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 rounded-full border border-base-700 bg-base-800/60 px-3 py-1.5 text-xs text-ink-secondary">
                {idx === 0 && <IconUsers className="h-3.5 w-3.5 text-accent" />}
                {membro}
              </span>
            ))}
          </div>
        )}

        {itensEntrega.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
              <IconClipboardList className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.itensEntregaTitulo}</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-base-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-base-950/60 text-[10px] uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">{dict.orcamentos.itensEntregaColItem}</th>
                    <th className="px-4 py-2 text-right font-medium">{dict.orcamentos.itensEntregaColPrazo}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-800">
                  {itensEntrega.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2.5 text-ink-primary">{item.item}</td>
                      <td className="px-4 py-2.5 text-right text-ink-muted">{item.prazo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {itensObrigatorios.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensInclusosTitulo}</p>
            <div className="divide-y divide-base-800 rounded-2xl border border-base-800">
              {itensObrigatorios.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="text-sm text-ink-primary">{item.nome}</p>
                    {item.descricao && <p className="text-xs text-ink-muted">{item.descricao}</p>}
                  </div>
                  <p className="shrink-0 text-sm font-medium text-ink-primary">
                    {item.quantidade > 1 && `${item.quantidade}x `}
                    {fmtBRL(item.quantidade * item.valorUnitario)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {itensOpcionais.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.itensOpcionaisTitulo}</p>
            {interactive && <p className="mb-2 text-xs text-ink-muted">{dict.orcamentos.hintItensOpcionaisPublico}</p>}
            <div className="divide-y divide-base-800 rounded-2xl border border-base-800">
              {itensOpcionais.map((item) => {
                const conteudo = (
                  <div className="flex items-center gap-3">
                    {interactive && (
                      <input
                        type="checkbox"
                        checked={item.selecionado}
                        onChange={() => onToggleItem?.(item)}
                        className="h-4 w-4 rounded border-base-600 print:hidden"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-ink-primary">{item.nome}</p>
                        {!interactive && (
                          <span className="rounded-full border border-base-700 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">
                            {dict.orcamentos.itensOpcionaisTitulo}
                          </span>
                        )}
                      </div>
                      {item.descricao && <p className="text-xs text-ink-muted">{item.descricao}</p>}
                    </div>
                  </div>
                );
                const valor = (
                  <p className={`shrink-0 text-sm font-medium ${item.selecionado ? "text-ink-primary" : "text-ink-muted line-through"}`}>
                    {item.quantidade > 1 && `${item.quantidade}x `}
                    {fmtBRL(item.quantidade * item.valorUnitario)}
                  </p>
                );
                return interactive ? (
                  <label key={item.id} className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5">
                    {conteudo}
                    {valor}
                  </label>
                ) : (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    {conteudo}
                    {valor}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {portfolio.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.nossosTrabalhosTitulo}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {portfolio.map((item) => (
                <div key={item.id} className="relative aspect-video overflow-hidden rounded-xl border border-base-800" title={item.titulo}>
                  {item.tipo_midia === "video" ? (
                    <video src={item.url} className="h-full w-full object-cover" muted controls={interactive} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.titulo} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-black/70 text-white print:hidden">
                    {item.tipo_midia === "video" ? <IconFilm className="h-2.5 w-2.5" /> : <IconImage className="h-2.5 w-2.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ml-auto max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-secondary">
            <span>{dict.orcamentos.subtotalLabel}</span>
            <span>{fmtBRL(subtotal)}</span>
          </div>
          {temDesconto && (
            <div className="flex justify-between text-ink-secondary">
              <span>{dict.orcamentos.descontoLabel}</span>
              <span>−{fmtBRL(desconto)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-base-800 pt-1.5 text-base font-semibold text-ink-primary">
            <span>{dict.orcamentos.totalLabel}</span>
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">{fmtBRL(total)}</span>
          </div>
        </div>

        {colunasInvestimento.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
              <IconLayers className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.colunasInvestimentoTitulo}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {colunasInvestimento.map((coluna) => {
                const linhas = (coluna.itens ?? "").split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
                return (
                  <div key={coluna.id} className="rounded-2xl border border-base-800 bg-base-950/40 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{coluna.titulo}</p>
                    {linhas.length > 0 ? (
                      <ul className="space-y-1">
                        {linhas.map((linha, idx) => (
                          <li key={idx} className="text-xs text-ink-secondary">
                            {linha}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-ink-muted">—</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {condicoesPagamento && (
          <div className="border-t border-base-800 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.condicoesDePagamentoTitulo}</p>
            <p className="mt-1 text-sm text-ink-secondary">{condicoesPagamento}</p>
          </div>
        )}

        {observacoes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{dict.orcamentos.observacoesTitulo}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ink-secondary">{observacoes}</p>
          </div>
        )}

        {temQuemSomos && (
          <div className="border-t border-base-800 pt-5">
            <div className="mb-2 flex items-center gap-1.5 text-ink-muted">
              <IconBuilding className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">{dict.orcamentos.quemSomosTitulo}</p>
            </div>
            {institucional.textoInstitucional && <p className="whitespace-pre-line text-sm text-ink-secondary">{institucional.textoInstitucional}</p>}
            {institucional.clientesAtendidos.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-ink-muted">{dict.orcamentos.empresasAtendidasTitulo}</p>
                <div className="flex flex-wrap gap-1.5">
                  {institucional.clientesAtendidos.map((nome, idx) => (
                    <span key={idx} className="rounded-full border border-base-700 bg-base-800/60 px-2.5 py-1 text-xs text-ink-secondary">
                      {nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {clientesLogosPreenchidos.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-5">
                {clientesLogosPreenchidos.map((url, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={url} alt="" style={{ height: institucional.logosTamanhoPx }} className="w-auto object-contain opacity-90 grayscale contrast-125" />
                ))}
              </div>
            )}
          </div>
        )}

        {institucional.textoEncerramento && (
          <div className="rounded-2xl border border-base-800 bg-gradient-to-br from-accent/10 via-base-950/40 to-accent2/10 p-5 text-center">
            <IconHeart className="mx-auto h-4 w-4 text-accent" />
            <p className="mt-2 whitespace-pre-line text-sm italic text-ink-secondary">{institucional.textoEncerramento}</p>
            {(institucional.emailComercial || institucional.siteComercial) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                {institucional.emailComercial && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                    <IconMail className="h-3.5 w-3.5 text-accent" />
                    {institucional.emailComercial}
                  </span>
                )}
                {institucional.siteComercial && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                    <IconGlobe className="h-3.5 w-3.5 text-accent" />
                    {institucional.siteComercial}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {institucional.rodapeUrl && (
          <div className="-mx-6 -mb-6 overflow-hidden sm:-mx-8 sm:-mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={institucional.rodapeUrl} alt="" className="h-20 w-full object-cover sm:h-24" />
          </div>
        )}

        {empresaNome && <p className="border-t border-base-800 pt-4 text-xs text-ink-muted">{dict.orcamentos.rodapePublico.replace("{empresa}", empresaNome)}</p>}
      </div>
    </div>
  );
}
