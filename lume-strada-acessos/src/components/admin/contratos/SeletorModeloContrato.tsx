"use client";

/**
 * PROTÓTIPO / REFERÊNCIA — ainda não plugado em nenhuma rota.
 *
 * Demonstra o pedido do usuário: (1) dropdown de Profissão -> (2) dropdown de
 * Tipo de Serviço -> (3) o contrato-modelo correspondente carrega pronto num
 * editor, com (4) um formulário lateral que preenche os `[TAG]` do texto em
 * tempo real.
 *
 * Decisões que ficaram em aberto para quando este componente for integrado
 * de verdade ao fluxo Orçamento -> Contrato (ver conversa sobre a "linha do
 * tempo" única dentro de Orçamentos):
 *  - Aqui o texto é editado num <Textarea> monospace, igual ao que já existe
 *    hoje em `ContratoBuilder.tsx` (zero dependência nova). Se for pra valer
 *    um editor rich-text "de verdade" (negrito, cabeçalhos, etc.), a troca é
 *    só nesse bloco — ex.: Tiptap (`@tiptap/react` + `@tiptap/starter-kit`),
 *    mantendo `valores`/`substituirPlaceholders` como estão.
 *  - Os campos `autoPreenchivel` (ver `tipos.ts`) indicam quais `[TAG]` dá
 *    pra popular sozinho a partir do orçamento/cliente de origem assim que
 *    este seletor morar dentro do wizard (nome/CPF-CNPJ/endereço do cliente,
 *    valor do orçamento aprovado, data de hoje, foro da empresa) — aqui o
 *    preenchimento é 100% manual pra manter o protótipo isolado e simples.
 */

import { useMemo, useState } from "react";
import type { PerfilOrcamento } from "@/lib/types/orcamentos";
import {
  BANCO_DE_MODELOS,
  buscarModelo,
  listarPlaceholdersPendentes,
  substituirPlaceholders,
  montarTextoDoContrato,
  obterClausulas,
  type ModeloContratoServico,
} from "@/lib/contratos/modelos";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

const LABEL_PERFIL: Record<PerfilOrcamento, string> = {
  filmmaker: "Filmmaker",
  videomaker: "Videomaker",
  social_media: "Social Media",
  storymaker: "Storymaker",
  designer: "Designer",
  fotografo: "Fotógrafo",
  agencia_marketing: "Agência de Marketing",
};

const PERFIS = Object.keys(LABEL_PERFIL) as PerfilOrcamento[];

export function SeletorModeloContrato() {
  const [perfil, setPerfil] = useState<PerfilOrcamento | "">("");
  const [tipoServico, setTipoServico] = useState<string>("");
  const [valores, setValores] = useState<Record<string, string>>({});

  const modelosDoPerfil = perfil ? BANCO_DE_MODELOS[perfil] : [];
  const modelo: ModeloContratoServico | undefined = perfil && tipoServico ? buscarModelo(perfil, tipoServico) : undefined;

  // Monta a prévia com TODAS as cláusulas do modelo, numeradas — esta tela é
  // a vitrine do banco de modelos, e quem a abre quer ver o contrato
  // completo, não escolher o que entra (isso é no construtor).
  const textoPreenchido = useMemo(
    () => (modelo ? substituirPlaceholders(montarTextoDoContrato(modelo, obterClausulas(modelo).map((c) => c.id)), valores) : ""),
    [modelo, valores]
  );
  const pendentes = useMemo(() => (modelo ? listarPlaceholdersPendentes(textoPreenchido) : []), [modelo, textoPreenchido]);

  function handlePerfilChange(novo: string) {
    setPerfil(novo as PerfilOrcamento);
    setTipoServico("");
    setValores({});
  }

  function handleTipoServicoChange(novo: string) {
    setTipoServico(novo);
    setValores({});
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Profissão</label>
          <Select value={perfil} onChange={(e) => handlePerfilChange(e.target.value)}>
            <option value="">Selecione...</option>
            {PERFIS.map((p) => (
              <option key={p} value={p}>
                {LABEL_PERFIL[p]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted">Tipo de Serviço</label>
          <Select value={tipoServico} onChange={(e) => handleTipoServicoChange(e.target.value)} disabled={!perfil}>
            <option value="">{perfil ? "Selecione..." : "Escolha a profissão primeiro"}</option>
            {modelosDoPerfil.map((m) => (
              <option key={m.tipoServico} value={m.tipoServico}>
                {m.nome}
              </option>
            ))}
          </Select>
          {perfil && modelosDoPerfil.length === 0 && (
            <p className="mt-1 text-xs text-ink-muted">Modelos deste perfil ainda não foram redigidos — em breve.</p>
          )}
        </div>
      </div>

      {modelo && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Editor — hoje é o mesmo <Textarea> monospace do ContratoBuilder atual.
              Ver comentário no topo do arquivo sobre trocar por rich-text depois. */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{modelo.nome}</h3>
              {pendentes.length > 0 ? (
                <Badge tone="warning" label={`${pendentes.length} campo(s) pendente(s)`} />
              ) : (
                <Badge tone="good" label="Pronto para enviar" />
              )}
            </div>
            <Textarea rows={26} value={textoPreenchido} readOnly className="font-mono text-xs leading-relaxed" />
          </div>

          {/* Formulário lateral — um campo por [TAG] do modelo selecionado. */}
          <div className="space-y-3 rounded-xl border border-base-700 bg-base-900/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Dados do contrato</p>
            {modelo.camposDinamicos.map((campo) => (
              <div key={campo.tag}>
                <label className="mb-1 block text-xs text-ink-muted">{campo.label}</label>
                {campo.tipo === "textarea" ? (
                  <Textarea
                    rows={2}
                    value={valores[campo.tag] ?? ""}
                    placeholder={campo.exemplo}
                    onChange={(e) => setValores((v) => ({ ...v, [campo.tag]: e.target.value }))}
                  />
                ) : campo.tipo === "moeda" ? (
                  <CurrencyInput
                    value={Number(valores[campo.tag] ?? 0)}
                    onChange={(n) => setValores((v) => ({ ...v, [campo.tag]: String(n) }))}
                  />
                ) : (
                  <Input
                    type={campo.tipo === "data" ? "date" : campo.tipo === "numero" || campo.tipo === "percentual" ? "number" : "text"}
                    value={valores[campo.tag] ?? ""}
                    placeholder={campo.exemplo}
                    onChange={(e) => setValores((v) => ({ ...v, [campo.tag]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
