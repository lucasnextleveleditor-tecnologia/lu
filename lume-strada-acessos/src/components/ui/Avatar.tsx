"use client";

import { cn } from "@/lib/utils/cn";

/**
 * A foto de uma pessoa — ou as iniciais dela.
 *
 * Sem foto, mostra as iniciais em vez de um boneco cinza igual para todo
 * mundo: numa lista de equipe, dez bonecos idênticos não distinguem
 * ninguém, e duas letras distinguem. A cor de fundo é derivada do nome, não
 * sorteada, para a mesma pessoa ter sempre a mesma cor — em qualquer tela e
 * em qualquer sessão.
 */

/** Sete tons discretos; o mesmo nome cai sempre no mesmo. */
const TONS = [
  "bg-[#3987e5]/20 text-[#8ab6f0]",
  "bg-[#22b8cf]/20 text-[#7fdbe8]",
  "bg-[#37b24d]/20 text-[#8ed69c]",
  "bg-[#f59f00]/20 text-[#f6c76a]",
  "bg-[#f76707]/20 text-[#f7a173]",
  "bg-[#e64980]/20 text-[#f091b1]",
  "bg-[#845ef7]/20 text-[#b39ff9]",
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  // Primeira e ÚLTIMA, não as duas primeiras: "Ana Maria Souza" é LS para
  // quem o conhece, não LM.
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

function tomDoNome(nome: string): string {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) soma = (soma + nome.charCodeAt(i)) % 1000;
  return TONS[soma % TONS.length] as string;
}

export function Avatar({
  nome,
  fotoUrl,
  className,
  tamanhoTexto = "text-xs",
}: {
  nome: string;
  fotoUrl?: string | null;
  /** Precisa trazer a altura E a largura (ex.: "h-8 w-8"). */
  className?: string;
  tamanhoTexto?: string;
}) {
  const rotulo = nome.trim() || "?";

  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a foto vem do bucket do próprio projeto Supabase, sem domínio fixo pra configurar em next/image.
      <img
        src={fotoUrl}
        alt={rotulo}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-semibold leading-none",
        tomDoNome(rotulo),
        tamanhoTexto,
        className
      )}
    >
      {iniciais(rotulo)}
    </span>
  );
}
