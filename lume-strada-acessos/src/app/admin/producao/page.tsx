import { requireModuloOuRedirect } from "@/lib/auth/requireAdmin";
import type { ProfileRow } from "@/lib/types/database";
import type {
  EntregaComVersoes,
  EntregaRow,
  EntregaVersaoRow,
  FuncionarioRow,
  SubtarefaRow,
  TarefaComRelacoes,
  TarefaRow,
  TipoServicoRow,
} from "@/lib/types/producao";
import { ProducaoWorkspace } from "@/components/admin/producao/ProducaoWorkspace";
import { ExportMenuButton } from "@/components/ui/ExportMenuButton";

export const dynamic = "force-dynamic";

export default async function ProducaoPage() {
  const { supabase } = await requireModuloOuRedirect("producao");

  const [tarefasRes, subtarefasRes, entregasRes, versoesRes, clientesRes, funcionariosRes, tiposServicoRes] = await Promise.all([
    supabase.from("prod_tarefas").select("*").order("data_entrega", { ascending: true }).overrideTypes<TarefaRow[], { merge: false }>(),
    supabase.from("prod_subtarefas").select("*").order("created_at").overrideTypes<SubtarefaRow[], { merge: false }>(),
    supabase.from("prod_entregas").select("*").order("created_at").overrideTypes<EntregaRow[], { merge: false }>(),
    supabase
      .from("prod_entrega_versoes")
      .select("*")
      .order("versao", { ascending: false })
      .overrideTypes<EntregaVersaoRow[], { merge: false }>(),
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "cliente")
      .order("full_name")
      .overrideTypes<Pick<ProfileRow, "id" | "email" | "full_name">[], { merge: false }>(),
    supabase
      .from("prod_funcionarios")
      .select("*")
      .eq("ativo", true)
      .order("nome")
      .overrideTypes<FuncionarioRow[], { merge: false }>(),
    supabase.from("prod_tipos_servico").select("*").order("nome").overrideTypes<TipoServicoRow[], { merge: false }>(),
  ]);

  const tarefas = tarefasRes.data ?? [];
  const subtarefas = subtarefasRes.data ?? [];
  const entregas = entregasRes.data ?? [];
  const versoes = versoesRes.data ?? [];
  const clientes = clientesRes.data ?? [];
  const funcionarios = funcionariosRes.data ?? [];
  const tiposServico = tiposServicoRes.data ?? [];

  const nomeCliente = new Map(clientes.map((c) => [c.id, c.full_name || c.email]));
  const nomeFuncionario = new Map(funcionarios.map((f) => [f.id, f.nome]));
  const nomeTipoServico = new Map(tiposServico.map((t) => [t.id, t.nome]));

  const subtarefasPorTarefa = new Map<string, SubtarefaRow[]>();
  for (const s of subtarefas) subtarefasPorTarefa.set(s.tarefa_id, [...(subtarefasPorTarefa.get(s.tarefa_id) ?? []), s]);

  const versoesPorEntrega = new Map<string, EntregaVersaoRow[]>();
  for (const v of versoes) versoesPorEntrega.set(v.entrega_id, [...(versoesPorEntrega.get(v.entrega_id) ?? []), v]);

  const entregasPorTarefa = new Map<string, EntregaComVersoes[]>();
  for (const e of entregas) {
    const comVersoes: EntregaComVersoes = { ...e, versoes: versoesPorEntrega.get(e.id) ?? [] };
    entregasPorTarefa.set(e.tarefa_id, [...(entregasPorTarefa.get(e.tarefa_id) ?? []), comVersoes]);
  }

  const tarefasComRelacoes: TarefaComRelacoes[] = tarefas.map((t) => {
    const subs = subtarefasPorTarefa.get(t.id) ?? [];
    return {
      ...t,
      cliente_nome: t.cliente_id ? (nomeCliente.get(t.cliente_id) ?? null) : null,
      responsavel_nome: t.responsavel_id ? (nomeFuncionario.get(t.responsavel_id) ?? null) : null,
      tipo_servico_nome: t.tipo_servico_id ? (nomeTipoServico.get(t.tipo_servico_id) ?? null) : null,
      subtarefas_total: subs.length,
      subtarefas_concluidas: subs.filter((s) => s.concluida).length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Produção &amp; Tarefas</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Board de produção, subtarefas e entregas com controle de versão e aprovação.</p>
        </div>
        <ExportMenuButton
          targetId="producao-export-area"
          nomeArquivo="producao-tarefas"
          dadosCSV={tarefasComRelacoes.map((t) => ({
            titulo: t.titulo,
            status: t.status,
            responsavel: t.responsavel_nome ?? "",
            cliente: t.cliente_nome ?? "",
            prioridade: t.prioridade,
            dataEntrega: t.data_entrega ?? "",
          }))}
          colunasCSV={[
            { chave: "titulo", rotulo: "Título" },
            { chave: "status", rotulo: "Status" },
            { chave: "responsavel", rotulo: "Responsável" },
            { chave: "cliente", rotulo: "Cliente" },
            { chave: "prioridade", rotulo: "Prioridade" },
            { chave: "dataEntrega", rotulo: "Data de Entrega" },
          ]}
        />
      </div>

      <div id="producao-export-area">
        <ProducaoWorkspace
          tarefas={tarefasComRelacoes}
          subtarefasPorTarefa={Object.fromEntries(subtarefasPorTarefa)}
          entregasPorTarefa={Object.fromEntries(entregasPorTarefa)}
          clientes={clientes}
          funcionarios={funcionarios}
          tiposServico={tiposServico}
        />
      </div>
    </div>
  );
}
