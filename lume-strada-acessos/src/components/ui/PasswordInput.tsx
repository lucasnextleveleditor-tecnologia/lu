"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { IconEye, IconEyeOff } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** aria-label do botão quando a senha está OCULTA (ação = mostrar). */
  mostrarSenhaAria: string;
  /** aria-label do botão quando a senha está VISÍVEL (ação = ocultar). */
  ocultarSenhaAria: string;
}

/**
 * Campo de senha com botão de "olho" pra alternar entre oculto/visível —
 * reaproveita os mesmos `IconEye`/`IconEyeOff` já usados no
 * `OlhoValoresToggle` (financeiro), só que aqui alternando o `type` do
 * próprio input em vez de mascarar texto. Usado em todo campo de senha
 * DIGITADO à mão (`LoginForm`, `SetPasswordForm`) — não se aplica às
 * credenciais só-leitura mostradas em `CredenciaisAcessoGerado`, que já são
 * copiáveis por inteiro.
 */
export function PasswordInput({ mostrarSenhaAria, ocultarSenhaAria, className, ...props }: PasswordInputProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <Input type={visivel ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? ocultarSenhaAria : mostrarSenhaAria}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-ink-muted transition hover:text-ink-primary"
      >
        {visivel ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
      </button>
    </div>
  );
}

