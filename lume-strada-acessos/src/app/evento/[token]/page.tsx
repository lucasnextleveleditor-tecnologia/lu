import { getDictionary } from "@/lib/i18n/getDictionary";
import { buscarPautaPorToken } from "@/app/evento/[token]/data";
import { TimelineDoCelular } from "@/components/evento/TimelineDoCelular";

export const dynamic = "force-dynamic";

/**
 * A tela de quem está em campo — SEM LOGIN, só de posse do token pessoal.
 *
 * Fora de `/admin`: não herda a sidebar, não passa por `requireModulo`, e a
 * rota está em `ROTAS_PUBLICAS` do middleware. Quem abre isto é um freelancer
 * contratado para um sábado, no celular, muitas vezes sem conta nenhuma no
 * sistema — e é exatamente para ele que a pauta precisa funcionar.
 */
export default async function PautaDoEventoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { dict } = await getDictionary();
  const t = dict.eventos;

  const pauta = await buscarPautaPorToken(token);

  if (pauta === null || pauta === "expirado") {
    return (
      <div className="ev-console flex min-h-screen items-center justify-center px-6">
        <div aria-hidden className="ev-linhas-monitor pointer-events-none fixed inset-0" />
        <div className="relative max-w-xs text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">{t.tituloPagina}</p>
          <p className="mt-3 text-lg font-semibold text-white">
            {pauta === "expirado" ? t.celularLinkExpirado : t.celularLinkInvalido}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/45">
            {pauta === "expirado" ? t.celularLinkExpiradoTexto : t.celularLinkInvalidoTexto}
          </p>
        </div>
      </div>
    );
  }

  return <TimelineDoCelular pauta={pauta} token={token} />;
}
