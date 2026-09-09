import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AcessoPublicoMapa, MapaMentalRow } from "@/lib/types/mapa-mental";

/**
 * Quem pode abrir um mapa pelo link.
 *
 * O link SOZINHO não abre nada. São três condições, e todas as três valem
 * sempre — na página e em cada ação de escrita:
 *
 *   1. o token existe e o compartilhamento não está desligado;
 *   2. quem está pedindo está LOGADO;
 *   3. a conta dessa pessoa é da MESMA empresa dona do mapa.
 *
 * A terceira é a que importa de verdade. Sem ela, um link repassado num
 * grupo de WhatsApp daria acesso a qualquer pessoa do mundo com uma conta
 * no sistema — inclusive alguém de outra agência. Com ela, o link deixa de
 * ser a credencial e passa a ser só o endereço: a credencial é o cadastro
 * de funcionário ou cliente que a agência criou.
 *
 * As leituras usam Service Role porque um `cliente` não é `is_staff()` e o
 * RLS de `mapa_nos` o barraria — então o controle é TODO explícito aqui,
 * onde dá para ler e auditar, em vez de espalhado por policies que
 * precisariam de exceções.
 */
export type ResultadoAcesso =
  | { estado: "ok"; mapa: MapaMentalRow; acesso: AcessoPublicoMapa; nome: string; ehDaEquipe: boolean }
  | { estado: "sem-login" }
  | { estado: "sem-acesso" }
  | { estado: "nao-encontrado" };

const ESCADA = { ver: 0, comentar: 1, editar: 2 } as const;

export async function verificarAcessoPorToken(
  token: string,
  precisa: "ver" | "comentar" | "editar"
): Promise<ResultadoAcesso> {
  const admin = createAdminClient();

  const { data: mapa } = await admin.from("mapas_mentais").select("*").eq("token", token).maybeSingle<MapaMentalRow>();
  if (!mapa) return { estado: "nao-encontrado" };
  // Voltar para privado desliga o link sem trocar a URL.
  if (mapa.acesso_publico === "privado") return { estado: "nao-encontrado" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { estado: "sem-login" };

  // O perfil vem pelo Service Role de propósito: um `cliente` não enxerga a
  // própria linha de `profiles` por RLS em todos os cenários, e aqui o que
  // se quer é a verdade sobre a conta, não o que ela consegue ler.
  const { data: perfil } = await admin
    .from("profiles")
    .select("company_id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle<{ company_id: string | null; role: string; full_name: string | null; email: string }>();

  if (!perfil || perfil.company_id !== mapa.company_id) return { estado: "sem-acesso" };

  const nivel = ESCADA[mapa.acesso_publico as "ver" | "comentar" | "editar"] ?? -1;
  if (nivel < ESCADA[precisa]) return { estado: "sem-acesso" };

  return {
    estado: "ok",
    mapa,
    acesso: mapa.acesso_publico,
    nome: perfil.full_name?.trim() || perfil.email,
    ehDaEquipe: perfil.role === "admin" || perfil.role === "funcionario",
  };
}

/** O mesmo, já devolvendo o cliente Service Role para quem vai escrever. */
export async function abrirParaEscrita(token: string, precisa: "comentar" | "editar") {
  const acesso = await verificarAcessoPorToken(token, precisa);
  if (acesso.estado !== "ok") return null;
  return { admin: createAdminClient(), mapa: acesso.mapa, nome: acesso.nome };
}
