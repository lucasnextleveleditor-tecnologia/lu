"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.login.novaSenha}</label>
        <Input
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.login.novaSenhaPlaceholder}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.login.confirmarSenha}</label>
        <Input
          type="password"
          autoComplete="new-password"
          required
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder={dict.login.confirmarSenhaPlaceholder}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? dict.common.salvando : dict.login.definirSenhaBotao}
      </Button>
    </form>
  );
}
