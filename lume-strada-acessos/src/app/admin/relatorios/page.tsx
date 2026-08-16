import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes } from "@/lib/auth/requireAdmin";
import { RelatoriosHub, type ModuloRelatorio } from "@/components/admin/relatorios/RelatoriosHub";

export const dynamic = "force-dynamic";

/**
 * Hub de Business Intelligence — aberto a QUALQUER membro da equipe (mesmo
 * espírito do Dashboard, ver comentário em `AdminShell`), mas cada ABA só
 * aparece pra quem tem aquele módulo liberado (ou é admin) — mesma regra
 * fina de permissão já usada em toda a aplicação (`requireModulo`), nunca
 * confiada só ao filtro do menu. As Server Actions de cada relatório
 * (`src/app/admin/relatorios/actions.ts`) reforçam essa mesma checagem de
 * novo no servidor — a lista aqui é só o que MOSTRAR de aba, não é a
 * verdadeira barreira de segurança.
 */
export default async function RelatoriosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const perfil = user ? await buscarPerfilComPermissoes(supabase, user.id) : null;

  function temModulo(chave: "financeiro" | "comercial" | "producao" | "trafego" | "inventario"): boolean {
    return perfil?.role === "admin" || perfil?.permissoes?.[chave] === true;
  }

  const TODOS_OS_MODULOS: ModuloRelatorio[] = [
    { chave: "comercial", label: "Comercial & CRM", hint: "Funil de vendas, conversão e tempo de fechamento" },
    { chave: "financeiro", label: "Financeiro", hint: "Fluxo de caixa, DRE simplificado e despesas por categoria" },
    { chave: "producao", label: "Produção & Tarefas", hint: "Produtividade por funcionário e gargalos" },
    { chave: "trafego", label: "Tráfego & Metas", hint: "ROI, ROAS, lucro líquido e reembolsos" },
    { chave: "inventario", label: "Inventário", hint: "Depreciação total do patrimônio" },
  ];

  const modulosPermitidos = TODOS_OS_MODULOS.filter((m) => temModulo(m.chave));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Relatórios</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Central de Business Intelligence — um período só, todos os módulos comparáveis.</p>
      </div>

      <RelatoriosHub modulosPermitidos={modulosPermitidos} />
    </div>
  );
}
