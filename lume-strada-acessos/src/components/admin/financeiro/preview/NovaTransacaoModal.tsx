"use client";

import { useMemo, useState } from "react";
import type { TransacaoPreview } from "@/lib/utils/financeiro-preview-mock";
import { CATEGORIAS_PREVIEW, CONTAS_PREVIEW } from "@/lib/utils/financeiro-preview-mock";
import { addDaysISO, todayISO } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { IconTrendingDown, IconTrendingUp } from "@/components/ui/icons";
import { DatePicker } from "@/components/ui/DatePicker";

interface NovaTransacaoModalProps {
  contaPadraoId?: string;
  onClose: () => void;
  onCriar: (transacao: TransacaoPreview) => void;
}

type Tipo = "despesa" | "receita";
type AtalhoData = "hoje" | "ontem" | "outros";

function gerarId(): string {
  return `t-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Modal de lançamento rápido — inspirado no Mobills: valor grande em
 * destaque no topo, atrito mínimo (pills de data, sem calendário aberto por
 * padrão), toggle animado de "já paga/recebida" e "Salvar e Criar Nova"
 * pra lançar vários gastos em sequência sem fechar o modal. Só ATUALIZA o
 * estado local mockado do preview (`onCriar`) — nenhuma escrita real no
 * Supabase acontece aqui.
 */
export function NovaTransacaoModal({ contaPadraoId, onClose, onCriar }: NovaTransacaoModalProps) {
  const [tipo, setTipo] = useState<Tipo>("despesa");
  const [valor, setValor] = useState("");
  const [pago, setPago] = useState(true);
  const [atalhoData, setAtalhoData] = useState<AtalhoData>("hoje");
  const [dataCustom, setDataCustom] = useState(todayISO());
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [contaId, setContaId] = useState(contaPadraoId ?? CONTAS_PREVIEW[0]?.id ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const categoriasDoTipo = useMemo(() => CATEGORIAS_PREVIEW.filter((c) => c.tipo === tipo), [tipo]);
  const categoriaSelecionada = categoriasDoTipo.find((c) => c.id === categoriaId) ?? categoriasDoTipo[0];
  const contaSelecionada = CONTAS_PREVIEW.find((c) => c.id === contaId) ?? CONTAS_PREVIEW[0];

  const dataISO = atalhoData === "hoje" ? todayISO() : atalhoData === "ontem" ? addDaysISO(todayISO(), -1) : dataCustom;

  function resetCampos() {
    setValor("");
    setDescricao("");
  }

  function validar(): TransacaoPreview | null {
    const numero = Number(valor.replace(",", "."));
    if (!numero || numero <= 0) {
      setErro("Informe um valor maior que zero.");
      return null;
    }
    if (!descricao.trim()) {
      setErro("Informe uma descrição.");
      return null;
    }
    if (!categoriaSelecionada || !contaSelecionada) {
      setErro("Selecione categoria e conta.");
      return null;
    }
    setErro(null);
    return {
      id: gerarId(),
      tipo,
      descricao: descricao.trim(),
      valor: numero,
      data: dataISO,
      categoriaId: categoriaSelecionada.id,
      contaId: contaSelecionada.id,
      pago,
    };
  }

  function handleSalvar() {
    const transacao = validar();
    if (!transacao) return;
    onCriar(transacao);
    onClose();
  }

  function handleSalvarECriarNova() {
    const transacao = validar();
    if (!transacao) return;
    onCriar(transacao);
    resetCampos();
  }

  const CategoriaIcon = categoriaSelecionada?.icon;
  const ContaIcon = contaSelecionada?.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl border border-base-700 bg-base-900 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toggle Despesa/Receita */}
        <div className="flex gap-1.5 border-b border-base-800 p-3">
          <button
            onClick={() => {
              setTipo("despesa");
              setCategoriaId("");
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
              tipo === "despesa" ? "bg-status-critical/15 text-danger" : "text-ink-muted hover:bg-base-800"
            )}
          >
            <IconTrendingDown className="h-4 w-4" /> Despesa
          </button>
          <button
            onClick={() => {
              setTipo("receita");
              setCategoriaId("");
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
              tipo === "receita" ? "bg-status-good/15 text-status-good" : "text-ink-muted hover:bg-base-800"
            )}
          >
            <IconTrendingUp className="h-4 w-4" /> Receita
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Valor em destaque */}
          <div className="text-center">
            <p className="mb-1 text-xs uppercase tracking-wide text-ink-muted">Valor (R$)</p>
            <input
              autoFocus
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-transparent text-center text-4xl font-bold tracking-tight text-ink-primary placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          {/* Toggle "Foi paga" / "Foi recebida" */}
          <div className="flex items-center justify-between rounded-lg bg-base-800/60 px-4 py-3">
            <span className="text-sm text-ink-secondary">{tipo === "despesa" ? "Já foi paga?" : "Já foi recebida?"}</span>
            <Switch checked={pago} onChange={setPago} label={tipo === "despesa" ? "Foi paga" : "Foi recebida"} />
          </div>

          {/* Pills de data rápida */}
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">Data</p>
            <div className="flex flex-wrap gap-2">
              {(["hoje", "ontem"] as const).map((chave) => (
                <button
                  key={chave}
                  onClick={() => setAtalhoData(chave)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                    atalhoData === chave ? "bg-accent text-base-950" : "bg-base-800 text-ink-secondary hover:text-ink-primary"
                  )}
                >
                  {chave === "hoje" ? "Hoje" : "Ontem"}
                </button>
              ))}
              <button
                onClick={() => setAtalhoData("outros")}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                  atalhoData === "outros" ? "bg-accent text-base-950" : "bg-base-800 text-ink-secondary hover:text-ink-primary"
                )}
              >
                Outros...
              </button>
              {atalhoData === "outros" && (
                <DatePicker
                  value={dataCustom}
                  onChange={setDataCustom}
                  aria-label="Data personalizada"
                  className="w-[136px]"
                />
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-ink-muted">Descrição</p>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={tipo === "despesa" ? "Ex.: Supermercado" : "Ex.: Salário"}
              className="border-0 border-b border-base-800 rounded-none bg-transparent px-0 focus:ring-0 focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Categoria */}
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-muted">
                {CategoriaIcon && <CategoriaIcon className="h-3.5 w-3.5" />} Categoria
              </p>
              <Select value={categoriaSelecionada?.id ?? ""} onChange={(e) => setCategoriaId(e.target.value)} className="bg-base-800 border-0">
                {categoriasDoTipo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>

            {/* Conta */}
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-muted">
                {ContaIcon && <ContaIcon className="h-3.5 w-3.5" />} Conta
              </p>
              <Select value={contaSelecionada?.id ?? ""} onChange={(e) => setContaId(e.target.value)} className="bg-base-800 border-0">
                {CONTAS_PREVIEW.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {erro && <p className="text-xs text-danger">{erro}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-base-800 p-4">
          <Button variant="ghost" onClick={handleSalvarECriarNova} className="text-xs uppercase tracking-wide">
            Salvar e Criar Nova
          </Button>
          <Button onClick={handleSalvar} className="text-xs uppercase tracking-wide">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
