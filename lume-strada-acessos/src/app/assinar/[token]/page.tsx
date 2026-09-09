import { getNomeApp } from "@/lib/branding/getNomeApp";
import { buscarPorToken, urlDoArquivo } from "@/app/assinar/acesso";
import { PainelDeAssinatura } from "@/components/admin/assinaturas/PainelDeAssinatura";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconLock } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * A página de assinatura — SEM LOGIN, acessada só de posse do token.
 *
 * É a única tela pública de escrita do sistema, e é assim de propósito: um
 * contrato vai para quem ainda não é cadastrado. O que segura a porta é o
 * token ser único por pessoa e o documento precisar estar enviado — e o que
 * dá validade ao ato é tudo o que se registra no momento de assinar (ver
 * `app/assinar/acesso.ts`).
 */
export default async function AssinarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [acesso, nomeApp] = await Promise.all([buscarPorToken(token), getNomeApp()]);

  if (!acesso) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="fixed right-4 top-4 z-30">
          <ThemeToggle />
        </div>
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">
            <IconLock className="h-5 w-5 text-ink-muted" />
          </span>
          <p className="text-lg font-semibold text-ink-primary">Link inválido</p>
          <p className="mt-2 text-sm text-ink-muted">
            Este link de assinatura não existe, foi cancelado, ou o documento ainda não foi enviado. Peça um novo a quem
            mandou.
          </p>
        </div>
      </div>
    );
  }

  const url = await urlDoArquivo(acesso.documento.arquivo_path);

  return (
    <div className="min-h-screen">
      <div className="fixed right-4 top-4 z-30">
        <ThemeToggle />
      </div>
      <PainelDeAssinatura
        documento={acesso.documento}
        signatario={acesso.signatario}
        campos={acesso.campos}
        urlArquivo={url}
        token={token}
        esperandoNome={acesso.esperando ? acesso.esperando.nome || acesso.esperando.email : null}
        nomeApp={nomeApp}
      />
    </div>
  );
}
