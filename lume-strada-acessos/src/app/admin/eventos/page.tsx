import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { temAcessoAntecipado } from "@/lib/auth/acessoAntecipado";
import { EventosEmBreve } from "@/components/admin/eventos/EventosEmBreve";
import { EventosWorkspace } from "@/components/admin/eventos/EventosWorkspace";
import { listarEventos, listarClientesParaEvento } from "@/app/admin/eventos/data";

export const dynamic = "force-dynamic";

/**
 * Eventos — o módulo de operação de evento.
 *
 * A tela tem duas caras, e a porta que decide qual delas é SERVIDOR:
 *
 *   - quem está construindo (ver `acessoAntecipado.ts`) recebe o módulo de
 *     verdade, com o que já estiver pronto;
 *   - todo o resto recebe a página de "em breve".
 *
 * A checagem mora aqui e não no menu de propósito. O item aparece para todo
 * mundo — a promessa é para ser vista —, mas quem digitar `/admin/eventos` na
 * barra de endereço sem estar na lista continua caindo no "em breve", porque
 * quem escolhe o que renderizar é o servidor e não o link.
 */
export default async function EventosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const perfil = await buscarPerfilComPermissoes(supabase, user.id);
  if (!perfil) redirect("/login");
  if (perfil.role !== "admin" && perfil.role !== "funcionario") redirect("/dashboard");

  const { dict } = await getDictionary();
  const t = dict.eventos;

  if (!temAcessoAntecipado(perfil.email)) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
        </div>
        <EventosEmBreve />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // A partir daqui é o módulo de verdade, em construção. Cada pedaço pronto
  // entra aqui e só quem está na lista enxerga — nunca um cliente pagante.
  //
  // As consultas vêm DEPOIS da porta de propósito: quem recebe a página de
  // "em breve" não dispara nenhuma delas.
  // ---------------------------------------------------------------------------
  const [eventos, clientes] = await Promise.all([listarEventos(), listarClientesParaEvento()]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
      </div>

      <div className="mb-4 rounded-xl border border-dashed border-accent/40 bg-accent/[0.04] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{t.emConstrucaoTitulo}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t.emConstrucaoTexto}</p>
      </div>

      <EventosWorkspace eventos={eventos} clientes={clientes} />
    </div>
  );
}
