import { redirect } from "next/navigation";
import { buscarPerfilComPermissoes, usuarioAtual, perfilAtual } from "@/lib/auth/requireAdmin";
import { getBrandingConfig } from "@/lib/branding/getBrandingConfig";
import { buscarUsoDeArmazenamento } from "@/lib/armazenamento/uso";
import { fmtBytes } from "@/lib/utils/bytes";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { AdminShell } from "@/components/admin/AdminShell";
import { BrandingAccentStyle } from "@/components/branding/BrandingAccentStyle";
import { temAcessoAntecipado } from "@/lib/auth/acessoAntecipado";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Segunda camada de proteção (a primeira é o middleware): mesmo que
  // alguém chegasse aqui sem passar pelo middleware, o layout re-confirma
  // que quem está vendo é de fato um admin antes de renderizar qualquer
  // dado de outros usuários.
  const user = await usuarioAtual();

  if (!user) redirect("/login");

  // `buscarPerfilComPermissoes` tem fallback pra quando `permissoes` ainda
  // não existe no banco (supabase/cadastros.sql não rodado) — sem isso, um
  // select pedindo essa coluna falharia por INTEIRO e expulsaria todo mundo
  // (inclusive o admin) pro /dashboard de cliente.
  // AS QUATRO CONSULTAS SAEM JUNTAS.
  //
  // Elas estavam em fila — perfil, depois branding, depois armazenamento,
  // depois idioma — e nenhuma depende do resultado da anterior. Como as
  // funções rodam em iad1 e o banco está em ca-central-1, cada `await` em
  // sequência custa a ida E a volta; quatro em fila são quatro viagens que
  // cabiam numa. Este layout é o portão de TODA tela do painel, então o atraso
  // aparecia em cada navegação, não em uma.
  //
  // O preço de disparar tudo junto é buscar branding/uso/idioma de um cliente
  // que vai ser redirecionado duas linhas abaixo. É o caso raro (cliente não
  // navega no /admin) pagando pelo caso de todo dia — a troca certa.
  //
  // Só o idioma interessa do dicionário: a barra de armazenamento na sidebar
  // mostra número, e "1,5 GB" e "1.5 GB" não são a mesma coisa em cada língua.
  const [profile, branding, uso, { locale }] = await Promise.all([
    perfilAtual(),
    getBrandingConfig(),
    buscarUsoDeArmazenamento(),
    getDictionary(),
  ]);

  // Admin e funcionário passam — cliente é redirecionado pro portal dele.
  // A checagem FINA (qual módulo cada funcionário pode ver/usar) mora em
  // `requireModulo`/`requireModuloOuRedirect`, chamado em cada módulo; aqui
  // é só o portão geral do `/admin`.
  if (profile?.role !== "admin" && profile?.role !== "funcionario") redirect("/dashboard");

  const banner =
    branding.banner_ativo_admin && branding.banner_titulo.trim()
      ? {
          titulo: branding.banner_titulo,
          descricao: branding.banner_descricao,
          linkUrl: branding.banner_link_url,
          linkLabel: branding.banner_link_label,
          imgUrl: branding.banner_img_url,
          tone: branding.banner_tone,
          dispensavel: branding.banner_dispensavel,
          chaveDispensa: `${branding.banner_titulo}|${branding.banner_descricao}|${branding.updated_at}`,
        }
      : null;

  return (
    <>
      {/* Cor de marca da empresa por cima da paleta padrão — só aqui dentro
          (área logada), nunca no login, que é anterior a saber de qual
          empresa é o visitante. */}
      <BrandingAccentStyle primaryColor={branding.primary_color} accentColor={branding.accent_color} />
      <AdminShell
        logoUrl={branding.logo_dark_url ?? branding.logo_url}
        fotoUrl={profile.avatar_url ?? null}
        armazenamento={
          uso
            ? { usado: fmtBytes(uso.bytesUsados, locale), limite: fmtBytes(uso.bytesLimite, locale), fracao: uso.fracao }
            : null
        }
        nome={profile.full_name ?? ""}
        email={profile.email}
        colapsadoPadrao={branding.sidebar_compacto_padrao}
        papel={profile.role}
        permissoes={profile.permissoes ?? {}}
        banner={banner}
        acessoAntecipado={temAcessoAntecipado(profile.email)}
      >
        {children}
      </AdminShell>
    </>
  );
}
