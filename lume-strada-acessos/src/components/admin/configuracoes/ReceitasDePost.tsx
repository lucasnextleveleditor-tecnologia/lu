"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { IconCheck } from "@/components/ui/icons";
import { FORMATOS_DO_POST, type FormatoDoPost, type PostReceitaRow } from "@/lib/types/producao";
import { limparReceitaDePost, salvarReceitaDePost } from "@/app/admin/configuracoes/receitas-actions";

/**
 * A receita de produção de cada formato de post.
 *
 * Configurada uma vez, aplicada em todo post que sobe do calendário de
 * conteúdo — e só nos campos que a social media deixou em branco. É o que
 * responde ao problema real: o formulário de tarefa da Produção tem muito
 * campo, e nenhum deles é decisão de quem escreve a pauta. "Reels" já implica
 * tipo de serviço, formatos de exportação e quanto tempo antes o primeiro
 * corte precisa estar pronto — isso é o jeito da agência trabalhar, não uma
 * escolha post a post.
 *
 * Salva ao SAIR DO CAMPO, sem botão. São sete formatos e três campos cada; um
 * botão "salvar" por card viraria vinte e um botões numa tela que a pessoa
 * visita uma vez por ano, e um botão só no rodapé faria ela perder tudo se
 * fechasse a aba no meio.
 */
export function ReceitasDePost({
  receitas,
  tiposServico,
}: {
  receitas: PostReceitaRow[];
  tiposServico: { id: string; nome: string }[];
}) {
  const { dict } = useLocale();
  const t = dict.planejamento;

  const [porFormato, setPorFormato] = useState<Record<string, Partial<PostReceitaRow>>>(() =>
    Object.fromEntries(receitas.map((r) => [r.formato, r]))
  );
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function gravar(formato: FormatoDoPost, campos: Partial<PostReceitaRow>) {
    const atual = { ...porFormato[formato], ...campos };
    setPorFormato((prev) => ({ ...prev, [formato]: atual }));
    setErro(null);

    const vazia =
      !atual.tipo_servico_id &&
      !atual.formatos_exportacao?.trim() &&
      (atual.dias_v1 === null || atual.dias_v1 === undefined);

    // Receita esvaziada é receita apagada, e não uma linha de nulos. Uma linha
    // vazia no banco diria "este formato tem padrão" para quem for ler depois,
    // quando a verdade é que não tem.
    const r = vazia
      ? await limparReceitaDePost(formato)
      : await salvarReceitaDePost(formato, {
          tipo_servico_id: atual.tipo_servico_id ?? null,
          formatos_exportacao: atual.formatos_exportacao ?? null,
          dias_v1: atual.dias_v1 ?? null,
        });

    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setSalvo(formato);
    setTimeout(() => setSalvo((s) => (s === formato ? null : s)), 1800);
  }

  const CHIPS = [
    dict.producao.formatoChip916,
    dict.producao.formatoChip11,
    dict.producao.formatoChip169,
    dict.producao.formatoChipComLegenda,
    dict.producao.formatoChipSemLegenda,
    dict.producao.formatoChipAltaResolucao,
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold tracking-tight text-ink-primary">{t.receitasTitulo}</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t.receitasDescricao}</p>

      {tiposServico.length === 0 && (
        <p className="mt-3 text-[11px] text-status-warning">{t.receitasSemTipos}</p>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {FORMATOS_DO_POST.map((formato) => {
          const receita = porFormato[formato] ?? {};
          return (
            <div key={formato} className="rounded-xl border border-base-700 bg-base-950/40 p-3">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-sm font-medium text-ink-primary">{t.formatos[formato]}</span>
                {salvo === formato && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-status-good">
                    <IconCheck className="h-3 w-3" />
                    {t.salvoAgora}
                  </span>
                )}
              </div>

              <label className="mb-1 block text-[11px] text-ink-secondary">{t.postTipoServico}</label>
              <Select
                value={receita.tipo_servico_id ?? ""}
                onChange={(e) => gravar(formato, { tipo_servico_id: e.target.value || null })}
              >
                <option value="">{t.semTipoServico}</option>
                {tiposServico.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </Select>

              <label className="mb-1 mt-2.5 block text-[11px] text-ink-secondary">{t.postFormatoEntrega}</label>
              <div className="mb-1.5 flex flex-wrap gap-1">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const atual = (receita.formatos_exportacao ?? "").trim();
                      if (atual.includes(chip)) return;
                      gravar(formato, { formatos_exportacao: atual ? `${atual}, ${chip}` : chip });
                    }}
                    className="rounded-full border border-base-700 px-2 py-0.5 text-[10px] font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
              <Input
                key={`fmt-${formato}-${receita.formatos_exportacao ?? ""}`}
                defaultValue={receita.formatos_exportacao ?? ""}
                placeholder={dict.producao.formatosExportacaoPlaceholder}
                onBlur={(e) => {
                  const valor = e.target.value.trim();
                  if (valor !== (receita.formatos_exportacao ?? "").trim()) {
                    gravar(formato, { formatos_exportacao: valor || null });
                  }
                }}
              />

              <label className="mb-1 mt-2.5 block text-[11px] text-ink-secondary">{t.receitaDiasV1}</label>
              <div className="flex items-center gap-2">
                <div className="w-20 shrink-0">
                  <Input
                    key={`v1-${formato}-${receita.dias_v1 ?? ""}`}
                    type="number"
                    min={0}
                    max={90}
                    step="1"
                    inputMode="numeric"
                    defaultValue={receita.dias_v1 ?? ""}
                    onBlur={(e) => {
                      const bruto = e.target.value.trim();
                      const valor = bruto === "" ? null : Number(bruto);
                      if (valor !== (receita.dias_v1 ?? null)) gravar(formato, { dias_v1: valor });
                    }}
                  />
                </div>
                <span className="text-[11px] text-ink-muted">
                  {receita.dias_v1 === null || receita.dias_v1 === undefined ? t.receitaSemV1 : t.receitaDiasV1Sufixo}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {erro && <p className="mt-3 text-xs text-danger">{erro}</p>}
    </Card>
  );
}
