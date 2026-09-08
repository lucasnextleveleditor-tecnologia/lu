"use client";

import { useState, useTransition } from "react";
import type { DadosInstitucionaisOrcamento } from "@/lib/types/orcamentos";
import { salvarInstitucionalOrcamento } from "@/app/admin/orcamentos/portfolio-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MarcaOrcamentoUploadField } from "@/components/admin/orcamentos/MarcaOrcamentoUploadField";
import { IconBuilding, IconChevronDown, IconCheckCircle } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";

interface MarcaApresentacaoCardProps {
  institucional: DadosInstitucionaisOrcamento;
  /** Atualiza o preview ao vivo do construtor assim que algo muda aqui — sem isso a pessoa só veria o logo/texto novo depois de recarregar a página. */
  onChange: (patch: Partial<DadosInstitucionaisOrcamento>) => void;
}

/**
 * Marca (logo/banner/rodapé) + apresentação institucional (texto sobre a
 * empresa, clientes já atendidos, mensagem de encerramento) — tudo reunido
 * AQUI, na mesma tela onde o orçamento é montado, em vez de escondido numa
 * aba separada (`/admin/orcamentos/portfolio`, como era antes — deixava o
 * fluxo confuso). É conteúdo da EMPRESA, não deste orçamento: salvo uma vez,
 * some junto do preview ao vivo e passa a valer automaticamente em todo
 * orçamento novo — por isso o card nasce recolhido assim que já existe algo
 * configurado (não é algo que se fica editando toda hora).
 */
export function MarcaApresentacaoCard({ institucional, onChange }: MarcaApresentacaoCardProps) {
  const { dict } = useLocale();
  const jaConfigurada = !!(institucional.logoUrl || institucional.bannerUrl || institucional.rodapeUrl || institucional.textoInstitucional);
  const [aberto, setAberto] = useState(!jaConfigurada);
  const [textoInstitucional, setTextoInstitucional] = useState(institucional.textoInstitucional ?? "");
  const [clientesAtendidos, setClientesAtendidos] = useState(institucional.clientesAtendidos.join("\n"));
  const [textoEncerramento, setTextoEncerramento] = useState(institucional.textoEncerramento ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  function handleSalvarTextos() {
    setError(null);
    setSalvo(false);
    startTransition(async () => {
      const result = await salvarInstitucionalOrcamento({ textoInstitucional, clientesAtendidos, textoEncerramento });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange({
        textoInstitucional: textoInstitucional.trim() || null,
        clientesAtendidos: clientesAtendidos
          .split("\n")
          .map((linha) => linha.trim())
          .filter((linha) => linha.length > 0),
        textoEncerramento: textoEncerramento.trim() || null,
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    });
  }

  return (
    <Card className="space-y-4">
      <button type="button" onClick={() => setAberto((v) => !v)} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-base-700 bg-base-950">
            {institucional.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={institucional.logoUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <IconBuilding className="h-4 w-4 text-ink-muted" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink-primary">{dict.orcamentos.marcaAgenciaTitulo}</h2>
            <p className="truncate text-xs text-ink-muted">{jaConfigurada ? dict.orcamentos.marcaApresentacaoResumoConfigurada : dict.orcamentos.marcaApresentacaoResumoVazia}</p>
          </div>
        </div>
        <IconChevronDown className={cn("h-4 w-4 shrink-0 text-ink-muted transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="space-y-5 border-t border-base-800 pt-4">
          <div className="flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/10 p-3">
            <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-xs text-ink-secondary">{dict.orcamentos.marcaApresentacaoAvisoPadrao}</p>
          </div>

          <div>
            <p className="mb-3 text-xs text-ink-muted">{dict.orcamentos.marcaAgenciaSubtitulo}</p>
            <div className="space-y-3">
              <MarcaOrcamentoUploadField
                label={dict.orcamentos.marcaLogoLabel}
                hint={dict.orcamentos.marcaLogoHint}
                specs={dict.orcamentos.marcaLogoEspecificacoes}
                campo="orc_logo_path"
                valorAtual={institucional.logoUrl}
                onChange={(url) => onChange({ logoUrl: url })}
                formato="square"
              />
              <MarcaOrcamentoUploadField
                label={dict.orcamentos.marcaBannerLabel}
                hint={dict.orcamentos.marcaBannerHint}
                specs={dict.orcamentos.marcaBannerEspecificacoes}
                campo="orc_banner_path"
                valorAtual={institucional.bannerUrl}
                onChange={(url) => onChange({ bannerUrl: url })}
                formato="wide"
              />
              <MarcaOrcamentoUploadField
                label={dict.orcamentos.marcaRodapeLabel}
                hint={dict.orcamentos.marcaRodapeHint}
                specs={dict.orcamentos.marcaRodapeEspecificacoes}
                campo="orc_rodape_path"
                valorAtual={institucional.rodapeUrl}
                onChange={(url) => onChange({ rodapeUrl: url })}
                formato="wide"
              />
            </div>
          </div>

          <div className="border-t border-base-800 pt-4">
            <h3 className="text-sm font-semibold text-ink-primary">{dict.orcamentos.institucionalTitulo}</h3>
            <p className="mt-0.5 text-xs text-ink-muted">{dict.orcamentos.institucionalSubtitulo}</p>
            <div className="mt-3 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.institucionalTextoLabel}</label>
                <Textarea rows={3} value={textoInstitucional} onChange={(e) => setTextoInstitucional(e.target.value)} placeholder={dict.orcamentos.institucionalTextoPlaceholder} />
                <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.institucionalTextoHint}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.institucionalClientesLabel}</label>
                <Textarea rows={3} value={clientesAtendidos} onChange={(e) => setClientesAtendidos(e.target.value)} placeholder={dict.orcamentos.institucionalClientesPlaceholder} />
                <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.institucionalClientesHint}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.orcamentos.institucionalEncerramentoLabel}</label>
                <Textarea rows={2} value={textoEncerramento} onChange={(e) => setTextoEncerramento(e.target.value)} placeholder={dict.orcamentos.institucionalEncerramentoPlaceholder} />
                <p className="mt-1 text-[11px] text-ink-muted">{dict.orcamentos.institucionalEncerramentoHint}</p>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-danger">{error}</p>}

            <div className="mt-3 flex items-center gap-3">
              <Button disabled={pending} onClick={handleSalvarTextos} className="px-4 py-2 text-xs">
                {dict.orcamentos.institucionalSalvarBtn}
              </Button>
              {salvo && <span className="text-xs text-status-good">{dict.orcamentos.institucionalSalvoMsg}</span>}
              <button type="button" onClick={() => setAberto(false)} className="ml-auto text-xs font-medium text-ink-muted hover:text-ink-primary">
                {dict.orcamentos.marcaApresentacaoRecolherBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
