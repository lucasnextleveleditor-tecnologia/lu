import { Card } from "@/components/ui/Card";
import { IconBuilding } from "@/components/ui/icons";
import type { ConfiguracoesDict } from "@/lib/i18n/dictionaries/pt/configuracoes";

/**
 * Cabeçalho da aba "Empresa & Equipe" — só a identificação da empresa de
 * quem está logado (`companies.nome_app`) e quantas pessoas têm acesso.
 *
 * É SOMENTE LEITURA de propósito: o nome do app já é editável na aba
 * Aparência (`atualizarNomeApp`), e ter o mesmo campo salvável em dois
 * lugares é o tipo de coisa que gera "salvei aqui e não mudou lá". O
 * ponteiro na descrição diz onde editar, no mesmo espírito do ponteiro
 * inverso que a aba Minha Conta tem.
 */
export function EmpresaCard({ nomeApp, membrosComAcesso, dict }: { nomeApp: string; membrosComAcesso: number; dict: ConfiguracoesDict }) {
  const inicial = nomeApp.trim().charAt(0).toUpperCase() || "?";

  return (
    <Card>
      <p className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        <IconBuilding className="h-3.5 w-3.5" /> {dict.empresaCardTitulo}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-850 text-lg font-semibold text-ink-primary">
          {inicial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-ink-primary">{nomeApp}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {membrosComAcesso} {dict.empresaMembrosAtivos}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted">{dict.empresaCardDescricao}</p>
    </Card>
  );
}
