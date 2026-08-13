import type { StatusItemInventario } from "@/lib/types/database";
import type { Tone } from "@/lib/utils/tone";

/**
 * Tone de cada status de patrimônio — mesma paleta fixa de 4 tons usada em
 * todo o app (acesso e tráfego). "Baixado/Descartado" usa `critical` de
 * propósito: numa auditoria visual, um bem baixado que ainda aparece em uso
 * é exatamente o tipo de discrepância que o admin precisa notar de cara.
 */
export const STATUS_ITEM_META: Record<StatusItemInventario, { label: string; tone: Tone }> = {
  ativo: { label: "Ativo", tone: "good" },
  emprestado: { label: "Emprestado", tone: "neutral" },
  manutencao: { label: "Em Manutenção", tone: "warning" },
  baixado: { label: "Baixado", tone: "critical" },
};

export const STATUS_ITEM_OPCOES: StatusItemInventario[] = ["ativo", "manutencao", "emprestado", "baixado"];
