"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Inicializa a partir de `?erro=convite_invalido` (`app/auth/callback/route.ts`
  // manda pra cá quando o `verifyOtp`/`exchangeCodeForSession` falha — link já
  // usado, expirado, etc.) — sem isso a pessoa cai aqui sem NENHUMA pista do
  // que aconteceu, só a tela de login comum (bug real encontrado testando o
  // link copiável: alguém clicava o link, dava erro, e via só isso — nada
  // indicava que era o link, e não usuário/senha).
  const [error, setError] = useState<string | null>(searchParams.get("erro") === "convite_invalido" ? dict.login.conviteInvalidoErro : null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (signInError) {
      setError(signInError.message === "Invalid login credentials" ? dict.login.credenciaisInvalidas : signInError.message);
      setLoading(false);
      return;
    }

    // Vai sempre pra "/" e deixa o MIDDLEWARE escolher o destino a partir do
    // papel (super_admin -> /super-admin, admin -> /admin, funcionário ->
    // /admin/dashboard, cliente -> /dashboard).
    //
    // O `?redirectTo=` da URL é ignorado de propósito — ele é escrito por
    // quem monta o link, e mandar a pessoa recém-logada para um destino
    // vindo de fora é como um super admin acabou caindo no portal do
    // cliente. A ÚNICA exceção é `/mapa/...`: é um caminho relativo, de uma
    // tela que faz a própria checagem de empresa antes de mostrar qualquer
    // coisa, e é o que faz o link de um mapa levar ao mapa depois do login
    // em vez de despejar a pessoa na home sem explicação.
    const destino = searchParams.get("redirectTo");
    const paraOMapa = destino && /^\/mapa\/[A-Za-z0-9_-]+$/.test(destino);
    router.push(paraOMapa ? destino : "/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.login.emailLabel}</label>
        <Input
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.login.emailPlaceholder}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.login.senhaLabel}</label>
        <PasswordInput
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.login.senhaPlaceholder}
          mostrarSenhaAria={dict.login.mostrarSenhaAria}
          ocultarSenhaAria={dict.login.ocultarSenhaAria}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? dict.login.entrando : dict.login.entrar}
      </Button>
    </form>
  );
}
