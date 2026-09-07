"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { IconLogOut } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface LogoutButtonProps {
  className?: string;
  /** Modo compacto (sidebar recolhida) — só o ícone, com `title` pra acessibilidade. */
  iconOnly?: boolean;
}

export function LogoutButton({ className, iconOnly = false }: LogoutButtonProps) {
  const router = useRouter();
  const { dict } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={loading}
      title={iconOnly ? dict.login.sair : undefined}
      aria-label={iconOnly ? dict.login.sair : undefined}
      className={cn(className)}
    >
      {iconOnly ? <IconLogOut className="h-4 w-4" /> : loading ? dict.login.saindo : dict.login.sair}
    </Button>
  );
}
