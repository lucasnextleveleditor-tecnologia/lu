import Link from "next/link";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarFolhaPorToken } from "@/app/externa/acesso";
import { FolhaOrdemDoDia } from "@/components/admin/producao/ordem-do-dia/FolhaOrdemDoDia";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconLock } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * A Ordem de Externa aberta pelo link da equipe.
 *
 * É o MESMO componente da folha do painel, em modo de leitura — não uma
 * segunda versão do documento. Duas telas separadas divergiriam no primeiro
 * ajuste, e a equipe acabaria lendo uma folha diferente da que a produção
 * escreveu.
 *
 * Não é anônima: o middleware já manda quem não tem sessão para o login, e
 * `buscarFolhaPorToken` ainda confere se a conta é da mesma agência.
 */
export default async function ExternaPorLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [{ dict }, nomeApp, branding, resultado] = await Promise.all([
    getDictionary(),
    getNomeApp(),
    getBrandingConfig(),
    buscarFolhaPorToken(token),
  ]);
  const t = dict.ordemDoDia;

  if (resultado.estado !== "ok") {
    const semAcesso = resultado.estado === "sem-acesso";
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <IconLock className="h-5 w-5 text-ink-muted" />
          </span>
          <p className="text-lg font-semibold text-ink-primary">{semAcesso ? t.semAcessoTitulo : t.linkInvalidoTitulo}</p>
          <p className="mt-2 text-sm text-ink-muted">{semAcesso ? t.semAcessoDescricao : t.linkInvalidoDescricao}</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center rounded-lg border border-base-600 px-3 py-2 text-xs text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            {t.irParaInicio}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="fixed right-4 top-4 z-30 print:hidden">
        <ThemeToggle />
      </div>
      <FolhaOrdemDoDia
        dados={resultado.dados}
        clientes={[]}
        equipeCadastro={[]}
        logoUrl={branding.logo_dark_url ?? branding.logo_url}
        nomeApp={nomeApp}
        somenteLeitura
      />
    </div>
  );
}
