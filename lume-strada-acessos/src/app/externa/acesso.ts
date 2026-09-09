import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CronogramaRow,
  EquipeOrdemRow,
  LocacaoRow,
  OrdemDoDiaCompleta,
  OrdemDoDiaRow,
  RoteiroRow,
} from "@/lib/types/ordem-do-dia";

/**
 * Quem pode abrir uma Ordem de Externa pelo link.
 *
 * Mesmas três condições do mapa mental, pelo mesmo motivo: o token existe e
 * o compartilhamento está ligado; quem pede está LOGADO; e a conta é da
 * MESMA empresa dona da folha. O link diz QUAL folha; o cadastro de
 * funcionário ou cliente da agência diz SE pode abrir.
 *
 * Sem a terceira condição, uma folha repassada no grupo do trabalho ficaria
 * legível para qualquer pessoa com conta no sistema — e uma ordem de externa
 * carrega endereço, telefone de todo mundo e horário de chegada.
 *
 * Service Role na leitura porque um `cliente` não é `is_staff()` e o RLS de
 * `ordens_do_dia` o barraria: o controle é todo explícito aqui.
 */
export type FolhaPorToken =
  | { estado: "ok"; dados: OrdemDoDiaCompleta }
  | { estado: "sem-login" }
  | { estado: "sem-acesso" }
  | { estado: "nao-encontrado" };

export async function buscarFolhaPorToken(token: string): Promise<FolhaPorToken> {
  const admin = createAdminClient();

  const { data: ordem } = await admin
    .from("ordens_do_dia")
    .select("*, clientes(nome)")
    .eq("token", token)
    .maybeSingle<OrdemDoDiaRow & { clientes: { nome: string } | null }>();

  if (!ordem) return { estado: "nao-encontrado" };
  // Desligar o compartilhamento derruba o link sem trocar a URL.
  if (!ordem.compartilhado) return { estado: "nao-encontrado" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { estado: "sem-login" };

  const { data: perfil } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle<{ company_id: string | null }>();

  if (!perfil || perfil.company_id !== ordem.company_id) return { estado: "sem-acesso" };

  const [locacoesRes, cronogramaRes, equipeRes, roteirosRes] = await Promise.all([
    admin.from("ordem_dia_locacoes").select("*").eq("ordem_id", ordem.id).order("ordem"),
    admin.from("ordem_dia_cronograma").select("*").eq("ordem_id", ordem.id).order("ordem"),
    admin.from("ordem_dia_equipe").select("*").eq("ordem_id", ordem.id).order("ordem"),
    admin.from("ordem_dia_roteiros").select("*").eq("ordem_id", ordem.id).order("ordem"),
  ]);

  const { clientes, ...semRelacao } = ordem;

  return {
    estado: "ok",
    dados: {
      ordem: semRelacao as OrdemDoDiaRow,
      locacoes: (locacoesRes.data ?? []) as LocacaoRow[],
      cronograma: (cronogramaRes.data ?? []) as CronogramaRow[],
      equipe: (equipeRes.data ?? []) as EquipeOrdemRow[],
      roteiros: (roteirosRes.data ?? []) as RoteiroRow[],
      clienteNome: clientes?.nome ?? null,
    },
  };
}
