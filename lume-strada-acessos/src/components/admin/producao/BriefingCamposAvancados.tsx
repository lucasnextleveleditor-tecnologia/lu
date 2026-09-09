"use client";

import { useState, type KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function parseLista(valor: string): string[] {
  return valor
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

interface ObjetivoMaterialFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * "Objetivo do Material" — pedido do usuário pra virar clicável/selecionável
 * sempre que der, em vez de só texto livre: chips com os objetivos/destinos
 * mais comuns (campanha paga, orgânico, cobertura de evento, Reels/TikTok/
 * YouTube, portfólio, editorial...) + "+ Outro" pra qualquer coisa fora da
 * lista, digitada e confirmada com Enter. Guardado como texto separado por
 * vírgula em `prod_tarefas.objetivo_material` — sem tabela própria, é só um
 * punhado de tags por tarefa, sem precisar de CRUD/gestão dedicada.
 *
 * A lista mistura objetivo de negócio (conversão, engajamento, cobertura) e
 * destino/formato de conteúdo (Reels, TikTok, YouTube) de propósito — na
 * prática, pra quem produz vídeo/social isso já responde "pra que serve",
 * e quem não é audiovisual (fotógrafo, storymaker) usa as opções genéricas
 * (Portfólio, Editorial, Institucional) ou digita a própria em "+ Outro".
 */
export function ObjetivoMaterialField({ value, onChange }: ObjetivoMaterialFieldProps) {
  const { dict } = useLocale();
  const [outro, setOutro] = useState("");

  const OPCOES = [
    dict.producao.objetivoOpcaoConversaoAnuncio,
    dict.producao.objetivoOpcaoEngajamentoOrganico,
    dict.producao.objetivoOpcaoCoberturaEvento,
    dict.producao.objetivoOpcaoReels,
    dict.producao.objetivoOpcaoTiktok,
    dict.producao.objetivoOpcaoYoutube,
    dict.producao.objetivoOpcaoCriativoVenda,
    dict.producao.objetivoOpcaoPortfolio,
    dict.producao.objetivoOpcaoEditorial,
    dict.producao.objetivoOpcaoInstitucional,
  ];

  const selecionados = parseLista(value);
  const extras = selecionados.filter((s) => !OPCOES.includes(s));

  function toggle(opcao: string) {
    const atual = parseLista(value);
    const novo = atual.includes(opcao) ? atual.filter((x) => x !== opcao) : [...atual, opcao];
    onChange(novo.join(", "));
  }

  function removerExtra(item: string) {
    onChange(
      parseLista(value)
        .filter((x) => x !== item)
        .join(", ")
    );
  }

  function adicionarOutro(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const texto = outro.trim();
    if (!texto) return;
    const atual = parseLista(value);
    if (!atual.includes(texto)) onChange([...atual, texto].join(", "));
    setOutro("");
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.objetivoMaterialLabel}</label>
      <div className="flex flex-wrap gap-1.5">
        {OPCOES.map((opcao) => {
          const ativo = selecionados.includes(opcao);
          return (
            <button
              key={opcao}
              type="button"
              onClick={() => toggle(opcao)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                ativo ? "border-accent bg-accent text-base-950" : "border-base-700 text-ink-secondary hover:border-ink-muted hover:text-ink-primary"
              )}
            >
              {opcao}
            </button>
          );
        })}
        {extras.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => removerExtra(item)}
            title={dict.common.remover}
            className="flex items-center gap-1 rounded-full border border-accent bg-accent px-2.5 py-1 text-[11px] font-medium text-base-950"
          >
            {item} ×
          </button>
        ))}
      </div>
      <input
        value={outro}
        onChange={(e) => setOutro(e.target.value)}
        onKeyDown={adicionarOutro}
        placeholder={dict.producao.objetivoOutroPlaceholder}
        className="mt-1.5 w-full rounded-lg border border-base-600 bg-base-900 px-3 py-1.5 text-xs text-ink-primary placeholder:text-ink-muted transition focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>
  );
}

interface FormatosExportacaoFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * "Formatos para Exportação" — o texto em si continua livre (a combinação
 * real varia demais: "1 Reel 9:16 até 60s + versão sem legenda" não cabe
 * num enum), mas os tokens mais comuns viram chips de inserção rápida acima
 * do textarea, clicáveis em vez de sempre digitados.
 */
export function FormatosExportacaoField({ value, onChange }: FormatosExportacaoFieldProps) {
  const { dict } = useLocale();

  const CHIPS = [
    dict.producao.formatoChip916,
    dict.producao.formatoChip11,
    dict.producao.formatoChip169,
    dict.producao.formatoChipComLegenda,
    dict.producao.formatoChipSemLegenda,
    dict.producao.formatoChipAltaResolucao,
  ];

  function inserir(chip: string) {
    const atual = value.trim();
    if (!atual) {
      onChange(chip);
      return;
    }
    if (atual.includes(chip)) return; // evita duplicar o mesmo token
    onChange(`${atual}, ${chip}`);
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.formatosExportacaoLabel}</label>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => inserir(chip)}
            className="rounded-full border border-base-700 px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            + {chip}
          </button>
        ))}
      </div>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={dict.producao.formatosExportacaoPlaceholder} />
    </div>
  );
}
