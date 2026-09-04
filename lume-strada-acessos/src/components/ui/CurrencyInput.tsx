"use client";

import { useEffect, useState, type KeyboardEvent } from "react";

interface CurrencyInputProps {
  /** Valor em unidades (reais/dólares/euros), NUNCA em centavos — o componente cuida da conversão internamente. */
  value: number;
  onChange: (valor: number) => void;
  /** Símbolo exibido à esquerda — "R$", "US$" ou "€", conforme a moeda selecionada no formulário. */
  prefixo?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
}

function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Input de valor monetário com máscara "de trás pra frente": o estado
 * interno é sempre uma string de dígitos tratada como CENTAVOS (mesma
 * técnica de app bancário/maquininha) — cada tecla digitada empurra os
 * dígitos, nunca precisa lidar com cursor pulando de posição ou o usuário
 * apagando um separador "." / "," manualmente. Sempre formata como
 * "1.234,56" (padrão pt-BR de milhar/decimal), independente da MOEDA
 * selecionada no formulário (BRL/USD/EUR) — só o prefixo (R$/US$/€) muda; o
 * jeito de digitar o número continua o mesmo pro usuário brasileiro.
 */
export function CurrencyInput({ value, onChange, prefixo = "R$", placeholder, required, id, disabled, className }: CurrencyInputProps) {
  const [centavos, setCentavos] = useState(() => Math.round((value || 0) * 100));

  // Sincroniza quando o valor externo muda por fora (ex: abrir o modal em
  // modo edição carregando outra transação, ou a cotação recalculando o
  // equivalente em BRL) — sem isso o input ficaria "preso" no valor digitado
  // originalmente mesmo depois de `value` mudar programaticamente.
  useEffect(() => {
    setCentavos(Math.round((value || 0) * 100));
  }, [value]);

  function commit(novosCentavos: number) {
    setCentavos(novosCentavos);
    onChange(novosCentavos / 100);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const somenteDigitos = e.target.value.replace(/\D/g, "");
    const semZerosLideres = somenteDigitos.replace(/^0+(?=\d)/, "");
    commit(semZerosLideres === "" ? 0 : Number(semZerosLideres));
  }

  // Backspace/Delete removem só o último dígito (não o separador visual),
  // igual ao comportamento nativo de campo de valor de maquininha/banco.
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      commit(Math.floor(centavos / 10));
    }
  }

  return (
    <div
      className={
        "flex items-center rounded-lg border border-base-600 bg-base-900 px-3 transition focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30" +
        (disabled ? " opacity-60" : "") +
        (className ? ` ${className}` : "")
      }
    >
      <span className="mr-1.5 shrink-0 text-sm text-ink-muted">{prefixo}</span>
      <input
        id={id}
        inputMode="numeric"
        required={required}
        disabled={disabled}
        placeholder={placeholder ?? "0,00"}
        value={formatarCentavos(centavos)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
      />
    </div>
  );
}
