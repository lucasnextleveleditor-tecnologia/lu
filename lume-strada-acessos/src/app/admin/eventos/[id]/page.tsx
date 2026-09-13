import { redirect } from "next/navigation";
import { usuarioAtual, perfilAtual } from "@/lib/auth/requireAdmin";
import { temAcessoAntecipado } from "@/lib/auth/acessoAntecipado";
import { buscarEvento } from "@/app/admin/eventos/[id]/data";
import { EventoWorkspace } from "@/components/admin/eventos/EventoWorkspace";
import { MODOS_EVENTO, modoDoStatus, type ModoEvento } from "@/lib/types/eventos";

export const dynamic = "force-dynamic";

/**
 * A tela de um evento.
 *
 * A porta é a mesma da lista: quem não está no acesso antecipado não entra
 * nem digitando a URL. Enquanto o módulo está em construção, esta tela é
 * versão de trabalho — e uma agência pagante que caísse aqui por acidente
 * concluiria que o sistema é frágil.
 *
 * O MODO vem do status (`modoDoStatus`) e pode ser forçado por `?modo=`. O
 * padrão existe porque o sistema já sabe a resposta: evento de daqui a duas
 * semanas abre no Plano; o de hoje, no meio do show, abre no Ao Vivo. A URL
 * existe porque quem quer conferir a grade no meio do evento tem que
 * conseguir — e porque assim o modo é compartilhável.
 */
export default async function EventoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ modo?: string }>;
}) {
  const user = await usuarioAtual();
  if (!user) redirect("/login");

  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");
  if (!temAcessoAntecipado(perfil.email)) redirect("/admin/eventos");

  const { id } = await params;
  const { modo: modoParam } = await searchParams;

  const dados = await buscarEvento(id);
  const modo: ModoEvento = (MODOS_EVENTO as readonly string[]).includes(modoParam ?? "")
    ? (modoParam as ModoEvento)
    : modoDoStatus(dados.evento.status);

  return <EventoWorkspace dados={dados} modoInicial={modo} />;
}
