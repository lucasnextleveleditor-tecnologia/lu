import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AmbienteRow, BlocoRow, CapturaRow, EquipeEventoRow, EventoRow } from "@/lib/types/eventos";

/**
 * A pauta de quem está em campo, buscada pelo TOKEN da URL.
 *
 * SEM LOGIN, e de propósito. Freelancer contratado para um sábado não vai
 * criar conta, e obrigar a isso garante que ninguém marca nada — e uma pauta
 * que ninguém marca é uma planilha com outro nome. A "autorização" aqui é
 * conhecer o token: 32 bytes aleatórios, um POR PESSOA (nunca um link único do
 * evento), que é o que faz o "captei" ficar assinado com um nome.
 *
 * Por não haver sessão, não há RLS para filtrar por empresa: a leitura sai
 * pelo Service Role e o `.eq("token", token)` é o ÚNICO controle de acesso,
 * feito em código. Mesmo trato do contrato público e do portal do cliente.
 *
 * O QUE ESTA FUNÇÃO DEVOLVE É O MÍNIMO. O freela vê o evento dele, a pauta
 * dele e os blocos para saber a que hora é cada coisa. Não vê cachê de
 * ninguém, não vê o resto da equipe, não vê os outros eventos da agência.
 */

export interface PautaDoFreela {
  evento: Pick<EventoRow, "id" | "nome" | "local" | "fuso" | "inicio" | "fim" | "iniciado_em" | "status">;
  pessoa: Pick<EquipeEventoRow, "id" | "nome" | "funcao">;
  capturas: CapturaRow[];
  blocos: Pick<BlocoRow, "id" | "titulo" | "inicio" | "fim" | "ambiente_id">[];
  ambientes: Pick<AmbienteRow, "id" | "nome" | "cor">[];
}

/** `null` = token que não existe. `"expirado"` = existia e já não vale. */
export type ResultadoDaPauta = PautaDoFreela | "expirado" | null;

export async function buscarPautaPorToken(token: string): Promise<ResultadoDaPauta> {
  if (!token || token.length < 16) return null;

  const admin = createAdminClient();

  const { data: pessoa } = await admin
    .from("ev_equipe")
    .select("id, evento_id, nome, funcao, ativo, token_expira_em")
    .eq("token", token)
    .maybeSingle<{
      id: string;
      evento_id: string;
      nome: string;
      funcao: string | null;
      ativo: boolean;
      token_expira_em: string | null;
    }>();

  if (!pessoa) return null;

  // Desligado na hora pelo painel, ou vencido pelo relógio. Os dois dizem a
  // mesma coisa para quem está com o link na mão, e nenhum dos dois é "não
  // existe" — a pessoa precisa saber que o link ERA dela e acabou, senão ela
  // fica tentando recarregar achando que é sinal ruim.
  if (!pessoa.ativo) return "expirado";
  if (pessoa.token_expira_em && new Date(pessoa.token_expira_em).getTime() < Date.now()) return "expirado";

  const { data: evento } = await admin
    .from("ev_eventos")
    .select("id, nome, local, fuso, inicio, fim, iniciado_em, status")
    .eq("id", pessoa.evento_id)
    .maybeSingle<PautaDoFreela["evento"]>();

  if (!evento) return null;

  const [capturas, blocos, ambientes] = await Promise.all([
    // A NOITE INTEIRA, e não só a pauta dela.
    //
    // A consulta era filtrada por responsável, e a tela nascia cega: quem está
    // no meio de um festival não pergunta apenas "o que eu tenho que fazer",
    // pergunta "onde eu estou na noite". Sem a programação completa, o
    // freelancer não sabia que o show seguinte começava em dez minutos no
    // palco ao lado, nem por que a janela dele fechava às 23h40.
    //
    // O que ele PODE MARCAR continua sendo só o dele e o que não tem dono — e
    // quem garante isso é `marcarPorToken`, no servidor, não esta consulta. A
    // tela mostra o resto apagado e sem botão; a ação recusa de qualquer jeito.
    // Trazer tudo aqui não abre porta nenhuma: é a programação do evento para
    // o qual essa pessoa foi contratada, e ela vai estar lá dentro.
    admin
      .from("ev_capturas")
      .select("*")
      .eq("evento_id", evento.id)
      .order("janela_inicio")
      .overrideTypes<CapturaRow[], { merge: false }>(),
    admin
      .from("ev_blocos")
      .select("id, titulo, inicio, fim, ambiente_id")
      .eq("evento_id", evento.id)
      .order("inicio")
      .overrideTypes<PautaDoFreela["blocos"], { merge: false }>(),
    admin
      .from("ev_ambientes")
      .select("id, nome, cor")
      .eq("evento_id", evento.id)
      .order("ordem")
      .overrideTypes<PautaDoFreela["ambientes"], { merge: false }>(),
  ]);

  return {
    evento,
    pessoa: { id: pessoa.id, nome: pessoa.nome, funcao: pessoa.funcao },
    capturas: capturas.data ?? [],
    blocos: blocos.data ?? [],
    ambientes: ambientes.data ?? [],
  };
}
