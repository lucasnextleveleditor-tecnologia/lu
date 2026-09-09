import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import { MODELOS_FILMMAKER } from "./filmmaker";
import { MODELOS_VIDEOMAKER } from "./videomaker";
import { MODELOS_SOCIAL_MEDIA } from "./social_media";
import { MODELOS_STORYMAKER } from "./storymaker";
import { MODELOS_DESIGNER } from "./designer";
import { MODELOS_FOTOGRAFO } from "./fotografo";
import { MODELOS_AGENCIA_MARKETING } from "./agencia_marketing";
import type { ModeloContratoServico } from "./tipos";

export type { ModeloContratoServico, CampoDinamicoModelo, ClausulaModelo } from "./tipos";
export {
  substituirPlaceholders,
  listarPlaceholdersPendentes,
  CAMPOS_COMUNS_CONTRATO,
  obterClausulas,
  montarTextoDoContrato,
  clausulasPadraoSelecionadas,
  ordinalDeClausula,
  dividirTextoEmClausulas,
} from "./tipos";

/**
 * Banco completo de modelos, por perfil. Cada arquivo de perfil (filmmaker.ts,
 * videomaker.ts, ...) é redigido em lote — ver conversa/roadmap "Fluxo
 * Orçamento -> Contrato" — e plugado aqui conforme fica pronto. Perfis ainda
 * não redigidos retornam array vazio (a UI mostra "em breve" nesse caso, ver
 * `SeletorModeloContrato.tsx`).
 */
export const BANCO_DE_MODELOS: Record<PerfilOrcamento, ModeloContratoServico[]> = {
  filmmaker: MODELOS_FILMMAKER,
  videomaker: MODELOS_VIDEOMAKER,
  social_media: MODELOS_SOCIAL_MEDIA,
  storymaker: MODELOS_STORYMAKER,
  designer: MODELOS_DESIGNER,
  fotografo: MODELOS_FOTOGRAFO,
  agencia_marketing: MODELOS_AGENCIA_MARKETING,
};

export function listarModelosPorPerfil(perfil: PerfilOrcamento): ModeloContratoServico[] {
  return BANCO_DE_MODELOS[perfil] ?? [];
}

export function buscarModelo(perfil: PerfilOrcamento, tipoServico: string): ModeloContratoServico | undefined {
  return listarModelosPorPerfil(perfil).find((m) => m.tipoServico === tipoServico);
}
