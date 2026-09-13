import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarPerfilComPermissoes, usuarioAtual } from "@/lib/auth/requireAdmin";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { getNomeApp } from "@/lib/branding/getNomeApp";
import { getDictionary, getConfigDaEmpresa } from "@/lib/i18n/getDictionary";
import type { ProfileRow } from "@/lib/types/database";
import type { CargoRow, DepartamentoRow, EquipeMembroRow } from "@/lib/types/cadastros";
import { AparenciaForm } from "@/components/admin/aparencia/AparenciaForm";
import { EquipeManager } from "@/components/admin/cadastros/EquipeManager";
import { ConfiguracoesTabs, type AbaConfiguracoes, type ItemAbaConfiguracoes } from "@/components/admin/configuracoes/ConfiguracoesTabs";
import { ReceitasDePost } from "@/components/admin/configuracoes/ReceitasDePost";
import type { PostFormatoRow, PostReceitaRow, TipoServicoRow } from "@/lib/types/producao";
import { addDaysISO, todayISO } from "@/lib/utils/format";
import { CorDaMarcaCard } from "@/components/admin/configuracoes/CorDaMarcaCard";
import { EmpresaCard } from "@/components/admin/configuracoes/EmpresaCard";
import { MoedaEIdiomaCard } from "@/components/admin/configuracoes/MoedaEIdiomaCard";
import { MinhaContaForm } from "@/components/admin/configuracoes/MinhaContaForm";
import { AssinaturaCard } from "@/components/admin/configuracoes/AssinaturaCard";
import { IconBuilding, IconUsers, IconPalette, IconCreditCard, IconMegaphone, IconClipboardList } from "@/components/ui/icons";
import { CentralDeAvisos, type PessoaDaEquipe } from "@/components/admin/notificacoes/CentralDeAvisos";
import type { AvisoRow } from "@/lib/types/notificacoes";

export const dynamic = "force-dynamic";

const ABAS_VALIDAS: AbaConfiguracoes[] = ["empresa", "avisos", "conteudo", "conta", "aparencia", "assinatura"];
/** Única aba que um funcionário pode ver — as outras três são de admin. */
const ABA_PADRAO_FUNCIONARIO: AbaConfiguracoes = "conta";

function ehAbaValida(valor: string | undefined): valor is AbaConfiguracoes {
  return !!valor && (ABAS_VALIDAS as string[]).includes(valor);
}

/**
 * Tela única de Configurações — a "engrenagem" no rodapé do menu lateral.
 * Reúne quatro assuntos que antes moravam em lugares diferentes:
 *
 * - **Empresa & Equipe** — veio de dentro de `/admin` (a aba Equipe do módulo
 *   Cadastros). Decidir quem tem acesso a quê é configuração da conta, não
 *   cadastro operacional, e ficava escondido atrás da permissão "clientes",
 *   que não tem relação nenhuma com o assunto.
 * - **Minha Conta** — nova. Até aqui só existia troca FORÇADA de senha no
 *   primeiro login (`/definir-senha`); não havia como trocar por vontade
 *   própria depois.
 * - **Aparência** — veio de `/admin/aparencia`, que agora só redireciona.
 * - **Assinatura** — nova, somente leitura (ver `AssinaturaCard`).
 *
 * A aba fica na URL (`?aba=`), mesma mecânica do hub Comercial: sobrevive a
 * F5 e pode ser mandada por link. A busca de dados é feita AQUI, condicionada
 * à aba escolhida — em vez de um componente assíncrono por aba — pra que
 * abrir "Minha Conta" não dispare as consultas de equipe, e vice-versa.
 *
 * Autorização segue a regra que já existia: três das quatro abas são de
 * admin (o guard de servidor `requireAdmin` já protegia Aparência e Equipe
 * antes), então um funcionário que forçar `?aba=aparencia` na barra de
 * endereço é devolvido pra "Minha Conta" em vez de ver tela de erro. As
 * Server Actions por trás de cada aba continuam com os próprios guards —
 * isto aqui decide só o que MOSTRAR.
 */
export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const supabase = await createClient();
  const user = await usuarioAtual();
  if (!user) redirect("/login");

  const perfil = await buscarPerfilComPermissoes(supabase, user.id);
  if (!perfil) redirect("/login");
  if (perfil.role !== "admin" && perfil.role !== "funcionario") redirect("/dashboard");

  const souAdmin = perfil.role === "admin";
  const { locale, dict } = await getDictionary();
  const { moeda, idiomaPadrao } = await getConfigDaEmpresa();
  const t = dict.configuracoes;

  const { aba: abaParam } = await searchParams;
  const abaPedida: AbaConfiguracoes = ehAbaValida(abaParam) ? abaParam : souAdmin ? "empresa" : ABA_PADRAO_FUNCIONARIO;
  const aba: AbaConfiguracoes = souAdmin ? abaPedida : ABA_PADRAO_FUNCIONARIO;

  const abas: ItemAbaConfiguracoes[] = souAdmin
    ? [
        { value: "empresa", label: t.abaEmpresa, icon: IconBuilding },
        // "Avisos" fica ao lado de "Empresa & Equipe" de propósito: as duas
        // respondem à mesma pergunta — quem trabalha aqui e o que essa gente
        // precisa saber.
        { value: "avisos", label: "Avisos", icon: IconMegaphone },
        // Padrões de produção fica entre Avisos e Conta porque é regra de
        // OPERAÇÃO, como as duas de cima — o que vem depois é sobre a pessoa e
        // a assinatura. O valor da aba continua "conteudo" para não quebrar os
        // links que já foram mandados por aí; só o rótulo mudou, porque
        // "Conteúdo" não dizia nada sobre o que a tela faz — e ainda colidia
        // com a aba Conteúdo do Planejamento, que é o calendário.
        { value: "conteudo", label: dict.planejamento.abaPadroesDeProducao, icon: IconClipboardList },
        { value: "conta", label: t.abaConta, icon: IconUsers },
        { value: "aparencia", label: t.abaAparencia, icon: IconPalette },
        { value: "assinatura", label: t.abaAssinatura, icon: IconCreditCard },
      ]
    : [{ value: "conta", label: t.abaConta, icon: IconUsers }];

  // --------------------------------------------------------------------------
  // Empresa & Equipe — mesmas consultas que `app/admin/page.tsx` fazia pra
  // montar a aba Equipe. `profiles` entra junto só pra resolver o status de
  // acesso (Ativo/Expirado/Inativo) de cada membro; o RLS
  // `profiles_select_admin` já limita isso à própria empresa.
  // --------------------------------------------------------------------------
  let conteudoEmpresa: React.ReactNode = null;
  if (aba === "empresa") {
    const [nomeApp, equipeRes, profilesRes, departamentosRes, cargosRes] = await Promise.all([
      getNomeApp(),
      supabase.from("equipe_membros").select("*").order("nome").overrideTypes<EquipeMembroRow[], { merge: false }>(),
      supabase.from("profiles").select("*").overrideTypes<ProfileRow[], { merge: false }>(),
      supabase.from("departamentos").select("*").order("ordem").overrideTypes<DepartamentoRow[], { merge: false }>(),
      supabase.from("cargos").select("*").order("ordem").overrideTypes<CargoRow[], { merge: false }>(),
    ]);

    const equipeMembros = equipeRes.data ?? [];
    const profiles = profilesRes.data ?? [];

    conteudoEmpresa = (
      <div className="space-y-5">
        <EmpresaCard nomeApp={nomeApp} membrosComAcesso={equipeMembros.filter((m) => m.profile_id).length} dict={t} />
        {/* Moeda e idioma ficam na aba Empresa, e não em Aparência: não são
            enfeite, são a unidade em que o dinheiro é medido e a língua com
            que a conta abre. Só admin chega aqui (ver o guard acima). */}
        <MoedaEIdiomaCard moedaAtual={moeda} idiomaAtual={idiomaPadrao ?? locale} />
        <EquipeManager
          equipeMembros={equipeMembros}
          profilesPorId={Object.fromEntries(profiles.map((p) => [p.id, p]))}
          departamentos={departamentosRes.data ?? []}
          cargos={cargosRes.data ?? []}
        />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Avisos — a central de comunicados do administrador.
  //
  // A contagem de leituras vem numa consulta separada, e não por join: são
  // duas perguntas independentes ("quais avisos existem" e "quem já viu o
  // quê"), e o join obrigaria a trazer uma linha por leitura só para contá-las
  // aqui na memória do servidor.
  // --------------------------------------------------------------------------
  let conteudoAvisos: React.ReactNode = null;
  if (aba === "avisos") {
    const [avisosRes, equipeRes, leiturasRes] = await Promise.all([
      supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(100),
      supabase
        .from("profiles")
        .select("id, full_name, email, role, active")
        .in("role", ["admin", "funcionario"])
        .order("full_name"),
      supabase.from("announcement_reads").select("announcement_id"),
    ]);

    const equipe: PessoaDaEquipe[] = ((equipeRes.data ?? []) as {
      id: string;
      full_name: string | null;
      email: string;
      active: boolean | null;
    }[])
      .filter((p) => p.active !== false)
      .map((p) => ({ id: p.id, nome: p.full_name?.trim() || p.email, email: p.email }));

    const leiturasPorAviso: Record<string, number> = {};
    for (const l of (leiturasRes.data ?? []) as { announcement_id: string }[]) {
      leiturasPorAviso[l.announcement_id] = (leiturasPorAviso[l.announcement_id] ?? 0) + 1;
    }

    conteudoAvisos = (
      <CentralDeAvisos
        avisos={(avisosRes.data ?? []) as AvisoRow[]}
        equipe={equipe}
        leiturasPorAviso={leiturasPorAviso}
      />
    );
  }

  // --------------------------------------------------------------------------
  // Conteúdo — a receita de produção de cada formato de post.
  //
  // Mora aqui, e não dentro de Produção, porque é uma regra da AGÊNCIA: quem
  // decide que todo Reels sai em 9:16 com legenda e com o primeiro corte três
  // dias antes é quem manda na operação, não quem está montando o mês de um
  // cliente. A leitura é da equipe (o calendário aplica a receita ao subir o
  // post), mas a escrita é de admin — e a RLS da tabela garante isso mesmo se
  // alguém chamar a action direto.
  // --------------------------------------------------------------------------
  let conteudoConteudo: React.ReactNode = null;
  if (aba === "conteudo") {
    const [receitasRes, tiposRes, formatosRes] = await Promise.all([
      supabase.from("post_receitas").select("*").overrideTypes<PostReceitaRow[], { merge: false }>(),
      // `created_at` entra porque o atalho de cadastro na tela reaproveita o
      // MESMO modal do módulo Produção (`GerenciarTiposServicoModal`), que
      // recebe a linha inteira.
      supabase
        .from("prod_tipos_servico")
        .select("id, nome, created_at")
        .order("nome")
        .overrideTypes<TipoServicoRow[], { merge: false }>(),
      supabase
        .from("post_formatos")
        .select("*")
        .order("ordem")
        .overrideTypes<PostFormatoRow[], { merge: false }>(),
    ]);

    conteudoConteudo = (
      <ReceitasDePost
        receitas={receitasRes.data ?? []}
        tiposServico={tiposRes.data ?? []}
        formatos={formatosRes.data ?? []}
        // A data do post de exemplo da prévia sai daqui, e não de um
        // `new Date()` dentro do componente: ele renderiza no servidor e no
        // cliente, e um dia calculado nos dois lados discorda perto da
        // meia-noite. Nove dias à frente para que o primeiro corte de um
        // padrão comum (três dias antes) ainda caia no futuro.
        exemploDataPost={addDaysISO(todayISO(), 9)}
      />
    );
  }

  // --------------------------------------------------------------------------
  // Minha Conta — o telefone mora no cadastro de RH, não no perfil de acesso.
  // Quem não tem registro vinculado (`profile_id`) recebe `null` e o campo
  // some da tela, em vez de aparecer um input que nunca salvaria nada.
  // --------------------------------------------------------------------------
  let conteudoConta: React.ReactNode = null;
  if (aba === "conta") {
    const { data: membro } = await supabase
      .from("equipe_membros")
      .select("telefone")
      .eq("profile_id", user.id)
      .maybeSingle<{ telefone: string | null }>();

    conteudoConta = (
      <MinhaContaForm
        nomeInicial={perfil.full_name ?? ""}
        email={perfil.email}
        telefoneInicial={membro ? (membro.telefone ?? "") : null}
        fotoInicial={perfil.avatar_url ?? null}
      />
    );
  }

  let conteudoAparencia: React.ReactNode = null;
  if (aba === "aparencia") {
    const [branding, nomeApp] = await Promise.all([getBrandingConfig(), getNomeApp()]);
    conteudoAparencia = (
      <div className="space-y-5">
        {/* Cor primeiro: é a decisão que muda mais coisa de uma vez e a
            única com prévia imediata. Logo/favicon/login/banner vêm depois,
            no formulário grande que já existia. */}
        <CorDaMarcaCard corInicial={branding.primary_color} accent2Inicial={branding.accent_color} />
        <AparenciaForm initialBranding={branding} initialNomeApp={nomeApp} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Assinatura — RLS (`companies_select_own`) já restringe a UMA linha, a
  // própria empresa de quem chama, então não precisa filtrar por id aqui.
  // --------------------------------------------------------------------------
  let conteudoAssinatura: React.ReactNode = null;
  if (aba === "assinatura") {
    const { data: empresa } = await supabase
      .from("companies")
      .select("nome, nome_app, status, expires_at")
      .maybeSingle<{ nome: string; nome_app: string | null; status: string; expires_at: string | null }>();

    conteudoAssinatura = (
      <AssinaturaCard
        nomeEmpresa={empresa?.nome_app?.trim() || empresa?.nome || "—"}
        status={empresa?.status ?? "ativo"}
        expiraEm={empresa?.expires_at ?? null}
        checkoutUrl={process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || null}
        dict={t}
        locale={locale}
      />
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight">{t.tituloPagina}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{t.subtituloPagina}</p>
      </div>

      <div className="mb-6">
        <ConfiguracoesTabs abas={abas} abaAtiva={aba} />
      </div>

      {conteudoEmpresa}
      {conteudoAvisos}
      {conteudoConteudo}
      {conteudoConta}
      {conteudoAparencia}
      {conteudoAssinatura}
    </div>
  );
}
