"use client";

import { useState } from "react";
import type { MarcaOrcamentoComUrls } from "@/lib/types/orcamentos";
import { Card } from "@/components/ui/Card";
import { MarcaOrcamentoUploadField } from "@/components/admin/orcamentos/MarcaOrcamentoUploadField";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface MarcaOrcamentoFormProps {
  marca: MarcaOrcamentoComUrls;
}

/** Cada campo salva sozinho ao trocar o arquivo (ver `MarcaOrcamentoUploadField`) — não tem botão "Salvar" aqui de propósito, mesmo padrão dos campos de upload em Aparência. */
export function MarcaOrcamentoForm({ marca }: MarcaOrcamentoFormProps) {
  const { dict } = useLocale();
  const [logoUrl, setLogoUrl] = useState(marca.orcLogoUrl);
  const [bannerUrl, setBannerUrl] = useState(marca.orcBannerUrl);
  const [rodapeUrl, setRodapeUrl] = useState(marca.orcRodapeUrl);

  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="text-sm font-semibold text-ink-primary">{dict.orcamentos.marcaAgenciaTitulo}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">{dict.orcamentos.marcaAgenciaSubtitulo}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MarcaOrcamentoUploadField
          label={dict.orcamentos.marcaLogoLabel}
          hint={dict.orcamentos.marcaLogoHint}
          campo="orc_logo_path"
          valorAtual={logoUrl}
          onChange={setLogoUrl}
          formato="square"
        />
        <MarcaOrcamentoUploadField
          label={dict.orcamentos.marcaBannerLabel}
          hint={dict.orcamentos.marcaBannerHint}
          campo="orc_banner_path"
          valorAtual={bannerUrl}
          onChange={setBannerUrl}
          formato="wide"
        />
        <MarcaOrcamentoUploadField
          label={dict.orcamentos.marcaRodapeLabel}
          hint={dict.orcamentos.marcaRodapeHint}
          campo="orc_rodape_path"
          valorAtual={rodapeUrl}
          onChange={setRodapeUrl}
          formato="wide"
        />
      </div>
    </Card>
  );
}
