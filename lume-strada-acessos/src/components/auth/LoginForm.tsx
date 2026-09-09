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
    // O `?redirectTo=` da URL é ignorado de propósito: ele é escrito por
    // quem foi barrado numa rota protegida, e pode ter ficado guardado de
    // uma sessão anterior, de outro papel ou de um link velho. Mandar a
    // pessoa direto pra ele fazia um super_admin aterrissar em `/dashboard`
    // e ficar lá, vendo o portal do cliente. `refresh()` força o Next a
    // revalidar os server components com a sessão nova antes de navegar.
    router.refresh();
    router.push("/");
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
