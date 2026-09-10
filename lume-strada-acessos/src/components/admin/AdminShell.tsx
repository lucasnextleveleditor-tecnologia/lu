"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { PapelUsuario, PermissoesFuncionario } from "@/lib/types/database";
import { BrandingLogo } from "@/components/branding/BrandingLogo";
import { Avatar } from "@/components/ui/Avatar";
import { AnnouncementBanner } from "@/components/branding/AnnouncementBanner";
import type { BannerConfig } from "@/components/branding/AnnouncementBanner";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SinoDeNotificacoes } from "@/components/admin/notificacoes/SinoDeNotificacoes";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ValoresVisiveisProvider } from "@/lib/valores-visiveis/ValoresVisiveisProvider";
import type { NavDict } from "@/lib/i18n/dictionaries/pt/nav";
import {
  IconUsers,
  IconActivity,
  IconBox,
  IconSettings,
  IconWallet,
  IconTool,
  IconColumns,
  IconFileText,
  IconTarget,
  IconLayoutGrid,
  IconBarChart2,
  IconCalendar,
  IconFlag,
} from "@/components/ui/icons";

// Menu separado em grupos — "Visão Geral" (o Dashboard, que junta Produção +
// Comercial + Financeiro numa tela só) no topo, "Comercial" (pré-vendas/CRM,
// Orçamentos e clientes convertidos) depois, o resto da operação da
// agência em "Gestão", e "Financeiro" isolado por último (pedido explícito —
// separado do resto da gestão, sempre no fim do menu). Cada grupo pode
// crescer independente sem bagunçar a leitura do menu inteiro.
//
// `chave` é a mesma `ModuloChave` usada por `requireModulo`/`requireModuloOuRedirect`
// no servidor — o item some do menu de um funcionário sem aquela permissão
// ligada. Item sem `chave` (Dashboard) é visível pra qualquer membro da
// equipe. `adminOnly` nunca aparece pra funcionário, mesmo com todas as
// outras permissões ligadas — mesma regra do guard no servidor. Aparência
// saiu desta lista: virou aba da engrenagem de Configurações, fixa no
// rodapé da sidebar (ver o bloco do rodapé, mais abaixo).
const NAV_GRUPOS = [
  {
    tituloKey: "grupoVisaoGeral",
    itens: [
      { href: "/admin/dashboard", labelKey: "dashboard", icon: IconLayoutGrid, chave: null },
      // Mesmo espírito do Dashboard (chave: null — visível pra qualquer
      // membro da equipe, sem checagem de módulo aqui no menu): a checagem
      // FINA de quais relatórios cada um vê mora dentro da própria página
      // (`/admin/relatorios/page.tsx`, mesmo padrão de `cardVisivel` já
      // usado no Dashboard) — um funcionário sem nenhuma permissão extra
      // simplesmente vê o Hub vazio, com uma orientação pra falar com o
      // admin, em vej do link sumir do menu.
      { href: "/admin/relatorios", labelKey: "relatorios", icon: IconBarChart2, chave: null },
    ],
  },
  {
    tituloKey: "grupoComercial",
    itens: [
      // Item único que junta o que antes eram duas entradas separadas
      // (CRM & Vendas em `/admin/comercial` e Orçamentos em
      // `/admin/orcamentos`) — agora é um hub só com abas (Leads, Funil,
      // Calculadora, Propostas — ver `ComercialHubTabs.tsx` e
      // `app/admin/comercial/page.tsx`). `chave: "comercial"` só decide a
      // COR do destaque quando ativo (`MODULO_COR`); a VISIBILIDADE de
      // verdade usa `chavesQualquer` — aparece pra quem tem "comercial" OU
      // "orcamentos" (são permissões independentes por funcionário), e a
      // própria página decide quais abas mostrar pra cada um.
      // `matchPrefixes` mantém o item destacado mesmo nas rotas que
      // continuam fora do hub (`/admin/orcamentos/novo`, `/[id]`, `/catalogo`,
      // `/admin/contratos`...), pra não se perder a sensação de "ainda tô
      // dentro do Comercial" ao navegar pra essas telas.
      {
        href: "/admin/comercial",
        labelKey: "comercialHub",
        icon: IconTarget,
        chave: "comercial",
        chavesQualquer: ["comercial", "orcamentos"],
        matchPrefixes: ["/admin/comercial", "/admin/orcamentos"],
      },
      // "Contratos" não tem entrada própria — acessível pelo botão no
      // cabeçalho do hub (aba Propostas/Funil) e embutido no hub de detalhe
      // do orçamento (`OrcamentoHub.tsx`, aba "Contrato"). As rotas
      // `/admin/contratos/*` continuam funcionando normalmente.
      // WhatsApp foi escondido do menu e bloqueado por completo (ver
      // `src/app/admin/whatsapp/layout.tsx`) — código e dados continuam
      // intactos, só não aparece nem é acessível dentro do app. Pra
      // reativar: devolver esta linha e reverter o layout.
      // Contratos volta a ter entrada propria: e um documento que se procura
      // pelo nome, nao um passo escondido dentro do funil comercial. Segue
      // dentro do hub para quem chega por la, mas quem quer ir direto agora
      // tem por onde.
      // `/admin/assinaturas` entra nos prefixos porque, desde que Contratos
      // passou a abrir com a escolha "criar ou assinar", o editor de
      // assinatura de PDF virou destino de dentro deste menu — sem isso a
      // sidebar apagaria justo quando a pessoa esta no meio do caminho.
      {
        href: "/admin/contratos",
        labelKey: "contratos",
        icon: IconFileText,
        chave: "orcamentos",
        matchPrefixes: ["/admin/contratos", "/admin/assinaturas"],
      },
      { href: "/admin", labelKey: "cadastros", icon: IconUsers, chave: "clientes" },
    ],
  },
  {
    tituloKey: "grupoGestao",
    itens: [
      { href: "/admin/agenda", labelKey: "agenda", icon: IconCalendar, chave: "agenda" },
      {
        href: "/admin/producao",
        labelKey: "producaoTarefas",
        icon: IconColumns,
        chave: "producao",
        // A Ordem de Externa é filha de Produção na URL, mas tem entrada
        // própria logo abaixo — sem esta exclusão as duas ficariam acesas ao
        // mesmo tempo, já que o destaque é por prefixo de rota.
        naoAtivoEm: ["/admin/producao/ordem-do-dia"],
      },
      // Ordem de Externa e Mapa Mental saíram daqui e viraram cartões dentro
      // de Ferramentas. O menu vinha misturando duas naturezas: módulos que
      // se ACOMPANHA (Financeiro, Produção, Comercial) e ferramentas que se
      // ABRE para fazer uma tarefa e fechar. Numa lista vertical as duas
      // competem pelo mesmo espaço e a barra fica longa demais para varrer.
      //
      // `matchPrefixes` mantém Ferramentas acesa nas rotas das ferramentas
      // que agora moram nela — senão a sidebar apagaria justo quando a
      // pessoa está dentro de uma delas. `/admin/producao/ordem-do-dia`
      // segue na lista de `naoAtivoEm` de Produção logo acima, para as duas
      // não acenderem juntas.
      {
        href: "/admin/ferramentas",
        labelKey: "ferramentas",
        icon: IconTool,
        chave: null,
        matchPrefixes: ["/admin/ferramentas", "/admin/mapas", "/admin/producao/ordem-do-dia"],
      },
      { href: "/admin/trafego", labelKey: "trafegoMetas", icon: IconActivity, chave: "trafego" },
      { href: "/admin/inventario", labelKey: "inventarioPatrimonio", icon: IconBox, chave: "inventario" },
    ],
  },
  // Grupo próprio, separado de "Gestão" e sempre por último — pedido
  // explícito pra destacar Financeiro do resto da operação no menu.
  {
    tituloKey: "grupoFinanceiro",
    itens: [
      { href: "/admin/financeiro", labelKey: "financeiro", icon: IconWallet, chave: "financeiro" },
      // Meta de faturamento do mês/ano — reaproveita os mesmos números de
      // `fin_transacoes` já usados no Financeiro, então reaproveita a mesma
      // permissão em vez de criar uma `ModuloChave` nova só pra isso (ver
      // `src/app/admin/objetivos/data.ts`).
      { href: "/admin/objetivos", labelKey: "objetivos", icon: IconFlag, chave: "financeiro" },
    ],
  },
] as const satisfies ReadonlyArray<{
  tituloKey: keyof NavDict;
  itens: ReadonlyArray<{
    href: string;
    labelKey: keyof NavDict;
    icon: typeof IconUsers;
    chave: string | null;
    adminOnly?: boolean;
    /** Quando presente, SUBSTITUI `chave` na checagem de visibilidade — aparece pra quem tem QUALQUER UMA dessas permissões (ver hub Comercial acima, que junta "comercial" e "orcamentos"). `chave` continua valendo só pra escolher a cor do destaque ativo (`MODULO_COR`). */
    chavesQualquer?: ReadonlyArray<string>;
    /** Prefixos de rota que NÃO devem acender este item, mesmo casando com `href` — para sub-rotas que ganharam entrada própria no menu (ver Produção × Ordem de Externa). */
    naoAtivoEm?: ReadonlyArray<string>;
    /** Prefixos de rota (além de `href`) que também contam como "esse item está ativo" — pra itens guarda-chuva cujas sub-rotas moraram fora do próprio hub (ex: `/admin/orcamentos/novo`, `/admin/contratos`). Default: só `href`. */
    matchPrefixes?: ReadonlyArray<string>;
  }>;
}>;

// Mapeamento de `chave` de módulo (a mesma usada pra permissão, acima em
// `NAV_GRUPOS`) -> cor de identidade fixa de `tailwind.config.ts`
// `colors.module.*`. Usado SÓ pra recolorir o destaque do item ATIVO no
// menu lateral — puramente visual/decorativo, não afeta nenhuma checagem de
// permissão (`itemVisivel` continua sendo a única fonte de verdade pra
// isso). Onde não há um módulo de cor com correspondência óbvia
// (`clientes`, `trafego`), reaproveita o azul de `orcamentos` — a cor
// "neutra"/padrão da paleta — em vez de inventar categoria nova em
// `tailwind.config.ts`. Itens sem `chave` (Dashboard, Relatórios, Aparência)
// não entram aqui — caem no destaque neutro de sempre.
const MODULO_COR: Record<string, string> = {
  agenda: "#fb7185",
  comercial: "#8b6bf0",
  orcamentos: "#4f7cff",
  clientes: "#4f7cff",
  producao: "#fbbf24",
  trafego: "#4f7cff",
  inventario: "#9ca3af",
  financeiro: "#34d399",
};

interface AdminShellProps {
  logoUrl: string | null;
  /** Foto de perfil de quem está logado — `null` cai nas iniciais. */
  fotoUrl: string | null;
  /** Quanto a conta já ocupa. `null` quando a medição falhou — a barra some, o painel segue. */
  armazenamento: { usado: string; limite: string; fracao: number } | null;
  /** Nome do APP mostrado no topo da sidebar (`companies.nome_app`, editável em Aparência) — nunca o nome literal de uma empresa específica. Default "App Gestão". */
  nome: string;
  email: string;
  /** Não usado mais para o estado inicial da sidebar (ver `hover` abaixo) — mantido só pra não quebrar a assinatura de quem chama (`admin/layout.tsx`) e o campo em Aparência que ainda existe no banco. */
  colapsadoPadrao: boolean;
  papel: PapelUsuario;
  permissoes: PermissoesFuncionario;
  /** Já resolvido pelo `admin/layout.tsx` (`null` quando `banner_ativo_admin` está desligado ou o título está vazio) — aparece no topo de TODA página admin/funcionário, dashboards inclusos, porque este é o único wrapper compartilhado por todas elas. */
  banner: BannerConfig | null;
  children: React.ReactNode;
}

export function AdminShell({
  logoUrl,
  fotoUrl,
  armazenamento,
  nome,
  email,
  colapsadoPadrao: _colapsadoPadrao,
  papel,
  permissoes,
  banner,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const { dict } = useLocale();

  // Sidebar sempre começa recolhida (pedido explícito do dono da conta) e só
  // expande temporariamente enquanto o mouse está por cima dela — nada é
  // salvo/lembrado entre sessões, então recarregar a página ou navegar pra
  // outra tela sempre volta pro estado recolhido. Como a `<aside>` é
  // `position: fixed`, ela some/aparece por cima do conteúdo (`main` tem o
  // padding-left travado na largura recolhida) em vez de empurrar o layout.
  const [hover, setHover] = useState(false);
  const colapsado = !hover;

  // Mesma regra de autorização do servidor (`requireModulo`/`requireAdmin`),
  // só que aqui é pra decidir o que MOSTRAR no menu — a permissão de
  // verdade continua sendo sempre reforçada no servidor (Server Action +
  // RLS), o filtro aqui é só pra não deixar o funcionário nem ver um link
  // que vai barrar.
  function itemVisivel(item: { chave: string | null; chavesQualquer?: readonly string[]; adminOnly?: boolean }): boolean {
    if (papel === "admin") return true;
    if (item.adminOnly) return false;
    if (item.chavesQualquer) return item.chavesQualquer.some((chave) => permissoes?.[chave as keyof PermissoesFuncionario] === true);
    if (!item.chave) return true;
    return permissoes?.[item.chave as keyof PermissoesFuncionario] === true;
  }

  const gruposVisiveis = NAV_GRUPOS.map((grupo) => ({
    ...grupo,
    itens: grupo.itens.filter(itemVisivel),
  })).filter((grupo) => grupo.itens.length > 0);

  return (
    <ValoresVisiveisProvider>
    <div className="min-h-screen">
      <aside
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-base-800 bg-base-900/95 backdrop-blur-sm transition-[width] duration-200",
          colapsado ? "w-[72px]" : "w-64 shadow-2xl"
        )}
      >
        {/* Só a marca, ocupando o bloco inteiro.
            O nome da empresa e o "Painel Administrativo" saíram daqui: uma
            logo já DIZ de quem é o painel, e o nome ao lado dela roubava a
            largura da própria marca — a ponto de ser cortado num "...".
            Recolhida, a sidebar tem 72px e a marca vira um quadrado no
            centro; aberta, ela usa toda a faixa. `max-h` em vez de altura
            fixa para uma logo larga crescer até a borda sem estourar a
            altura do cabeçalho. */}
        <div className={cn("flex items-center justify-center border-b border-base-800 px-4 py-3.5", colapsado && "px-2")}>
          <BrandingLogo logoUrl={logoUrl} sizeClassName={colapsado ? "h-8" : "h-auto max-h-16"} larguraTotal={!colapsado} />
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {gruposVisiveis.map((grupo, i) => (
            <div key={grupo.tituloKey} className={cn(i > 0 && colapsado && "border-t border-base-800 pt-3")}>
              {!colapsado && (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {dict.nav[grupo.tituloKey]}
                </p>
              )}
              <div className="space-y-1">
                {grupo.itens.map((item) => {
                  const prefixos: readonly string[] = "matchPrefixes" in item && item.matchPrefixes ? item.matchPrefixes : [item.href];
                  const excluidos: readonly string[] = "naoAtivoEm" in item && item.naoAtivoEm ? item.naoAtivoEm : [];
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : prefixos.some((prefixo) => pathname?.startsWith(prefixo)) &&
                        !excluidos.some((prefixo) => pathname?.startsWith(prefixo));
                  const Icon = item.icon;
                  const label = dict.nav[item.labelKey];
                  // Cor de módulo só entra em jogo pro item ATIVO — os
                  // demais estados (hover, inativo) continuam neutros de
                  // propósito, senão o menu inteiro vira um arco-íris. Cor
                  // vem como hex direto (não classe Tailwind arbitrária: o
                  // JIT escaneia texto estático do código-fonte, não
                  // consegue gerar CSS pra uma interpolação de variável em
                  // runtime como `bg-[${corModulo}]`), aplicada via `style`.
                  const corModulo = item.chave ? MODULO_COR[item.chave] : undefined;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={colapsado ? label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                        colapsado && "justify-center px-0",
                        active
                          ? corModulo
                            ? // Item ativo com módulo mapeado: fundo levemente
                              // tingido na cor do módulo + anel sutil, no
                              // lugar do "pill" sólido genérico.
                              "text-ink-primary ring-1 ring-inset"
                            : // Fallback pro comportamento neutro (itens sem
                              // `chave` de módulo, ex: Dashboard/Relatórios).
                              "bg-base-800 text-ink-primary"
                          : "font-medium text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
                      )}
                      style={
                        active && corModulo
                          ? { background: `${corModulo}1a`, boxShadow: `inset 0 0 0 1px ${corModulo}4d` }
                          : undefined
                      }
                    >
                      <Icon
                        className={cn("h-[18px] w-[18px] shrink-0", active && !corModulo ? "text-ink-primary" : undefined)}
                        style={active && corModulo ? { color: corModulo } : undefined}
                      />
                      {!colapsado && <span className="truncate">{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn("border-t border-base-800 p-3", colapsado && "px-2")}>
          {/* Configurações fica FORA dos grupos de módulo, ancorada no
              rodapé: não é um lugar de trabalho como Financeiro ou
              Produção — é onde se mexe na conta, na equipe e na cara do
              sistema, coisas que se visita de vez em quando. Ancorar aqui
              também deixa o menu de módulos com um comprimento estável
              conforme o app cresce. Só admin vê, mesma regra que o item
              "Aparência" tinha quando morava na lista acima; o guard de
              verdade continua no servidor (ver `configuracoes/page.tsx`). */}
          {papel === "admin" && (
            <Link
              href="/admin/configuracoes"
              title={colapsado ? dict.nav.configuracoes : undefined}
              className={cn(
                "mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                colapsado && "justify-center px-0",
                pathname?.startsWith("/admin/configuracoes")
                  ? "bg-base-800 text-ink-primary"
                  : "font-medium text-ink-muted hover:bg-base-800 hover:text-ink-secondary"
              )}
            >
              <IconSettings className="h-[18px] w-[18px] shrink-0" />
              {!colapsado && <span className="truncate">{dict.nav.configuracoes}</span>}
            </Link>
          )}
          {/* Armazenamento logo acima da conta, no rodapé: é informação de
              consumo, e informação de consumo se olha de canto de olho, não
              se procura num menu. Fica verde até 75%, âmbar até 90% e
              vermelho depois — cor de aviso só quando há o que avisar. */}
          {!colapsado && armazenamento && (
            <Link
              href="/admin/armazenamento"
              className="mb-3 block rounded-lg px-1 py-1 transition hover:bg-base-800/60"
              title={dict.nav.armazenamentoDica}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">{dict.nav.armazenamento}</span>
                <span className="text-[10px] tabular-nums text-ink-muted">
                  {armazenamento.usado} <span className="opacity-60">/ {armazenamento.limite}</span>
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-base-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500",
                    armazenamento.fracao >= 0.9 ? "bg-status-critical" : armazenamento.fracao >= 0.75 ? "bg-status-warning" : "bg-status-good"
                  )}
                  // Largura mínima visível: 0,1% de 10 GB some, e uma barra
                  // vazia parece medição quebrada em vez de conta nova.
                  style={{ width: `${Math.max(armazenamento.fracao * 100, armazenamento.fracao > 0 ? 2 : 0)}%` }}
                />
              </div>
            </Link>
          )}

          {!colapsado && (
            <div className="mb-2 flex items-center gap-2 px-1" title={email}>
              <Avatar nome={nome || email} fotoUrl={fotoUrl} className="h-6 w-6" tamanhoTexto="text-[10px]" />
              <p className="min-w-0 flex-1 truncate text-xs text-ink-muted">{nome || email}</p>
            </div>
          )}
          <div className={cn("flex items-center gap-2", colapsado && "flex-col")}>
            <LogoutButton iconOnly={colapsado} className={colapsado ? undefined : "flex-1"} />
          </div>
        </div>
      </aside>

      {/* Fixo no canto superior direito da VIEWPORT (não da sidebar/main), pra
          ficar sempre no mesmo lugar em toda tela do painel — mesmo padrão de
          posição usado na tela de login e no portal do cliente. */}
      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        {/* O sino vem antes do tema e do idioma porque é o único dos três que
            MUDA sozinho: os outros dois a pessoa procura quando quer, este
            precisa ser encontrado sem procurar. */}
        <SinoDeNotificacoes />
        <ThemeToggle />
        <LanguageSwitcher />

        {/* Por último, na ponta direita da tela — é a posição de "quem está
            aqui" em quase todo painel, e é onde o olho vai procurar. Some
            abaixo de `sm` para não brigar por espaço com os três controles
            numa tela estreita. */}
        <Link
          href="/admin/configuracoes?aba=conta"
          title={email}
          className="hidden items-center gap-2 rounded-full border border-base-700 bg-base-900/80 py-1.5 pl-1.5 pr-3.5 backdrop-blur-sm transition hover:border-base-600 hover:bg-base-900 sm:flex"
        >
          <Avatar nome={nome || email} fotoUrl={fotoUrl} className="h-6 w-6" tamanhoTexto="text-[10px]" />
          <span className="max-w-[14rem] truncate text-sm text-ink-primary">{nome || email}</span>
        </Link>
      </div>

      {/* padding-left travado na largura RECOLHIDA de propósito — a sidebar
          expande por cima (fixed) ao passar o mouse, sem empurrar/redimensionar
          o conteúdo, então o `main` nunca precisa reagir ao hover. */}
      <main className="admin-bg-grid min-h-screen pl-[72px]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {banner && <AnnouncementBanner {...banner} className="mb-6" />}
          {children}
        </div>
      </main>
    </div>
    </ValoresVisiveisProvider>
  );
}
