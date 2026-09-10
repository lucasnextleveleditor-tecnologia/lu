"use client";

import Link from "next/link";
import type { ClienteRow } from "@/lib/types/cadastros";
import type { ProfileRow } from "@/lib/types/database";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ClientesManager } from "@/components/admin/cadastros/ClientesManager";
import { IconSettings } from "@/components/ui/icons";

interface CadastrosWorkspaceProps {
  clientes: ClienteRow[];
  profilesPorId: Record<string, ProfileRow>;
  souAdmin: boolean;
}

/**
 * Central de Cadastros — hoje só Clientes (cadastro + Atividades & Tarefas +
 * Gerar Acesso ao portal do cliente).
 *
 * A aba "Equipe" (cadastro de RH, permissões RBAC e organograma) saiu daqui:
 * virou a aba "Empresa & Equipe" da engrenagem de Configurações
 * (`/admin/configuracoes?aba=empresa`). O motivo é que decidir QUEM tem
 * acesso a QUÊ nunca foi um cadastro operacional — era configuração da
 * conta escondida atrás da permissão "clientes", que não tem relação nenhuma
 * com o assunto. Como sobrou uma aba só, a barra de abas foi embora junto e
 * ficou no lugar um ponteiro pra quem procurar Equipe por aqui (só admin vê,
 * já que só admin tem a aba do outro lado).
 */
export function CadastrosWorkspace({ clientes, profilesPorId, souAdmin }: CadastrosWorkspaceProps) {
  const { dict } = useLocale();

  return (
    <div>
      {/* O título saiu daqui e subiu pro nível da página: com duas abas
          (Clientes e Onboarding), um título dentro de uma delas pareceria
          título DA ABA, e não da tela. */}
      {souAdmin && (
        <Link
          href="/admin/configuracoes?aba=empresa"
          className="mb-5 flex items-center gap-2 rounded-lg border border-base-700 bg-base-900/60 px-3 py-2 text-xs text-ink-muted transition hover:border-base-600 hover:text-ink-secondary"
        >
          <IconSettings className="h-3.5 w-3.5 shrink-0" />
          {dict.configuracoes.cadastrosPonteiroEquipe}
        </Link>
      )}

      <ClientesManager clientes={clientes} profilesPorId={profilesPorId} souAdmin={souAdmin} />
    </div>
  );
}
