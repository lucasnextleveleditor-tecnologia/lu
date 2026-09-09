"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const MAX_LINKS_ESTILO = 5;

interface ReferenciasEstiloFieldProps {
  /** Links separados por quebra de linha, como salvo em `prod_tarefas.referencias_estilo`. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * "Referências de Estilo" — em vez de uma única caixa de texto pedindo "um
 * link por linha", um campo de URL por referência (até `MAX_LINKS_ESTILO`),
 * com "+ Adicionar link" pra abrir o próximo campo. Guardado como texto
 * simples separado por `\n` em `prod_tarefas.referencias_estilo` (sem
 * tabela própria — é só um punhado de URLs de consulta rápida por tarefa),
 * então o parse/serialização acontece só aqui, na borda da UI.
 *
 * O estado local (`links`) guarda TODOS os campos, inclusive os vazios que
 * o usuário ainda não preencheu — é o que permite digitar num campo do meio
 * sem os outros sumirem. `onChange` recebe só os links não-vazios, unidos
 * por quebra de linha, que é o formato persistido.
 */
export function ReferenciasEstiloField({ value, onChange }: ReferenciasEstiloFieldProps) {
  const { dict } = useLocale();
  const links = value === "" ? [""] : value.split("\n");

  function commit(novosLinks: string[]) {
    onChange(novosLinks.filter((l) => l.trim() !== "").join("\n"));
  }

  function atualizar(indice: number, novoValor: string) {
    const novosLinks = [...links];
    novosLinks[indice] = novoValor;
    // Emite o valor bruto (com o campo em edição, mesmo vazio) só quando ele
    // não é o único campo — assim o próprio `links` derivado de `value`
    // continua mostrando o campo que o usuário está preenchendo.
    onChange(novosLinks.join("\n"));
  }

  function remover(indice: number) {
    const novosLinks = links.filter((_, i) => i !== indice);
    commit(novosLinks.length > 0 ? novosLinks : [""]);
  }

  function adicionar() {
    if (links.length >= MAX_LINKS_ESTILO) return;
    onChange([...links, ""].join("\n"));
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.producao.referenciasEstiloLabel}</label>
      <div className="space-y-1.5">
        {links.map((link, indice) => (
          <div key={indice} className="flex gap-1.5">
            <Input value={link} onChange={(e) => atualizar(indice, e.target.value)} placeholder="https://..." className="flex-1 text-xs" />
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => remover(indice)}
                aria-label={dict.common.remover}
                className="shrink-0 px-1 text-ink-muted transition hover:text-danger"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {links.length < MAX_LINKS_ESTILO && (
        <button type="button" onClick={adicionar} className="mt-1.5 text-xs font-medium text-accent hover:underline">
          + {dict.producao.referenciasEstiloAdicionarLink}
        </button>
      )}
      <p className="mt-1 text-[11px] text-ink-muted">{dict.producao.referenciasEstiloAjuda}</p>
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
