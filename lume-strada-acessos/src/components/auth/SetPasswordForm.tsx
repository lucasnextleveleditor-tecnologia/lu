"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { concluirTrocaDeSenha } from "@/app/definir-senha/actions";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function SetPasswordForm() {
  const router = useRouter();
  const { dict } = useLocale();
  const [password, setPassword] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(dict.login.senhaMinimoCaracteres);
      return;
    }
    if (password !== confirmacao) {
      setError(dict.login.senhasNaoCoincidem);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    // Senha de verdade já está trocada nesse ponto — o que falta é só
    // limpar `senha_provisoria` (ver `app/definir-senha/actions.ts`) pra o
    // middleware parar de forçar essa tela. Best-effort: se isso falhar por
    // algum motivo, a senha NOVA já está valendo (o auth.updateUser acima
    // funcionou), só que a pessoa cairia de novo aqui no próximo login — bem
    // menos grave do que travar a troca de senha por causa disso, então
    // seguimos em frente de qualquer jeito.
    const resultado = await concluirTrocaDeSenha();
    setLoading(false);
    if (!resultado.ok) {
      console.error("[SetPasswordForm] falha ao limpar senha_provisoria:", resultado.error);
    }

    router.refresh();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.login.novaSenha}</label>
        <PasswordInput
          autoComplete="new-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.login.novaSenhaPlaceholder}
          mostrarSenhaAria={dict.login.mostrarSenhaAria}
          ocultarSenhaAria={dict.login.ocultarSenhaAria}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.login.confirmarSenha}</label>
        <PasswordInput
          autoComplete="new-password"
          required
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder={dict.login.confirmarSenhaPlaceholder}
          mostrarSenhaAria={dict.login.mostrarSenhaAria}
          ocultarSenhaAria={dict.login.ocultarSenhaAria}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? dict.common.salvando : dict.login.definirSenhaBotao}
      </Button>
    </form>
  );
}
