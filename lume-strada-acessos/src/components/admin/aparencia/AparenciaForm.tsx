"use client";

import { useState, useTransition } from "react";
import type { BannerTone, BrandingConfigRow, LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";
import { salvarBranding } from "@/app/admin/aparencia/actions";
import { BANNER_TONE_LABELS, LOGIN_BG_PRESETS } from "@/lib/branding/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { UploadField } from "@/components/admin/aparencia/UploadField";
import { LoginPreview } from "@/components/admin/aparencia/LoginPreview";
import { AnnouncementBanner } from "@/components/branding/AnnouncementBanner";

const POSICOES: { value: LoginBoxPosition; label: string }[] = [
  { value: "esquerda", label: "Esquerda" },
  { value: "centro", label: "Centralizada" },
  { value: "direita", label: "Direita" },
];

export function AparenciaForm({ initialBranding }: { initialBranding: BrandingConfigRow }) {
  // Uploads salvam sozinhos (ver UploadField/uploadBrandingAsset) — o estado
  // local só espelha o resultado pra atualizar sidebar/preview na hora.
  const [logoUrl, setLogoUrl] = useState(initialBranding.logo_url);
  const [logoDarkUrl, setLogoDarkUrl] = useState(initialBranding.logo_dark_url);
  const [logoLightUrl, setLogoLightUrl] = useState(initialBranding.logo_light_url);
  const [faviconUrl, setFaviconUrl] = useState(initialBranding.favicon_url);
  const [loginBgUrl, setLoginBgUrl] = useState(initialBranding.login_bg_url);

  // Os demais campos só persistem ao clicar "Salvar Alterações".
  const [loginTitle, setLoginTitle] = useState(initialBranding.login_title);
  const [loginSubtitle, setLoginSubtitle] = useState(initialBranding.login_subtitle);
  const [loginBoxPosition, setLoginBoxPosition] = useState<LoginBoxPosition>(initialBranding.login_box_position);
  const [loginBgPreset, setLoginBgPreset] = useState<LoginBgPreset>(initialBranding.login_bg_preset);
  const [sidebarCompactoPadrao, setSidebarCompactoPadrao] = useState(initialBranding.sidebar_compacto_padrao);

  // Banner de destaque — `bannerImgUrl` salva sozinho (upload), o resto só
  // persiste ao clicar "Salvar Alterações", igual o resto do formulário.
  // `?? valorPadrão` em cada campo abaixo é proteção extra: se o banco ainda
  // não tiver rodado a migração `supabase/banner.sql`, essas colunas não
  // existem e `initialBranding.banner_*` chega como `undefined` — sem essa
  // proteção o `.trim()` do preview mais abaixo quebraria a página inteira.
  const [bannerImgUrl, setBannerImgUrl] = useState(initialBranding.banner_img_url ?? null);
  const [bannerAtivoLogin, setBannerAtivoLogin] = useState(initialBranding.banner_ativo_login ?? false);
  const [bannerAtivoAdmin, setBannerAtivoAdmin] = useState(initialBranding.banner_ativo_admin ?? false);
  const [bannerAtivoCliente, setBannerAtivoCliente] = useState(initialBranding.banner_ativo_cliente ?? false);
  const [bannerTitulo, setBannerTitulo] = useState(initialBranding.banner_titulo ?? "");
  const [bannerDescricao, setBannerDescricao] = useState(initialBranding.banner_descricao ?? "");
  const [bannerLinkUrl, setBannerLinkUrl] = useState(initialBranding.banner_link_url ?? "");
  const [bannerLinkLabel, setBannerLinkLabel] = useState(initialBranding.banner_link_label ?? "Saiba mais");
  const [bannerTone, setBannerTone] = useState<BannerTone>(initialBranding.banner_tone ?? "neutral");
  const [bannerDispensavel, setBannerDispensavel] = useState(initialBranding.banner_dispensavel ?? true);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [salvoRecentemente, setSalvoRecentemente] = useState(false);

  function handleSalvar() {
    setError(null);
    setSalvoRecentemente(false);
    startTransition(async () => {
      const result = await salvarBranding({
        loginTitle,
        loginSubtitle,
        loginBoxPosition,
        loginBgPreset,
        sidebarCompactoPadrao,
        bannerAtivoLogin,
        bannerAtivoAdmin,
        bannerAtivoCliente,
        bannerTitulo,
        bannerDescricao,
        bannerLinkUrl,
        bannerLinkLabel,
        bannerTone,
        bannerDispensavel,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSalvoRecentemente(true);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-1 text-sm font-semibold">Logotipo & Favicon</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Usados no menu lateral do admin e no header do cliente (área de membros) — a tela de login sempre exibe a marca
            padrão da Lume Strada, por design. O app hoje é fixo em Dark Mode — a versão &ldquo;clara&rdquo; fica pronta pra
            quando existir um modo claro.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadField label="Logo principal" campo="logo_url" valorAtual={logoUrl} onChange={setLogoUrl} />
            <UploadField label="Favicon" campo="favicon_url" valorAtual={faviconUrl} onChange={setFaviconUrl} hint="Aba do navegador." />
            <UploadField
              label="Logo — versão Dark Mode"
              campo="logo_dark_url"
              valorAtual={logoDarkUrl}
              onChange={setLogoDarkUrl}
              hint="Versão clara/branca — usada agora (app é dark)."
            />
            <UploadField
              label="Logo — versão Light Mode"
              campo="logo_light_url"
              valorAtual={logoLightUrl}
              onChange={setLogoLightUrl}
              hint="Versão escura/preta — reservada p/ um modo claro futuro."
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">Tela de Login</h2>
          <p className="mb-4 text-xs text-ink-muted">Título, subtítulo, fundo e posição da caixa de login — veja o preview ao lado.</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Título</label>
                <Input value={loginTitle} onChange={(e) => setLoginTitle(e.target.value)} placeholder="Ex: Área Exclusiva - Lume Strada" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Subtítulo</label>
                <Input value={loginSubtitle} onChange={(e) => setLoginSubtitle(e.target.value)} placeholder="Ex: Acesso a clientes e projetos" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Posição da caixa de login</label>
                <Select value={loginBoxPosition} onChange={(e) => setLoginBoxPosition(e.target.value as LoginBoxPosition)}>
                  {POSICOES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Fundo — padrão cinematográfico</label>
                <Select
                  value={loginBgPreset}
                  onChange={(e) => setLoginBgPreset(e.target.value as LoginBgPreset)}
                  disabled={Boolean(loginBgUrl)}
                >
                  {LOGIN_BG_PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </Select>
                {loginBgUrl && <p className="mt-1 text-xs text-ink-muted">Desative removendo a imagem de fundo abaixo pra usar um padrão.</p>}
              </div>
            </div>

            <UploadField
              label="Ou envie uma imagem de fundo customizada"
              campo="login_bg_url"
              valorAtual={loginBgUrl}
              onChange={setLoginBgUrl}
              formato="wide"
              hint="Tem prioridade sobre o padrão cinematográfico escolhido acima."
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">Banner de Destaque</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Um aviso no topo da tela — pra anunciar novidade, manutenção programada, campanha etc. Mesmo conteúdo em
            qualquer lugar que você ligar abaixo; cada pessoa pode fechar (se você permitir) e ele só volta a aparecer
            pra ela se você editar o texto depois.
          </p>

          <div className="mb-4 divide-y divide-base-800 rounded-xl border border-base-800">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-ink-primary">Exibir na Tela de Login</p>
                <p className="text-xs text-ink-muted">Antes de qualquer um entrar — visível pra quem ainda não é cliente/equipe.</p>
              </div>
              <Switch checked={bannerAtivoLogin} onChange={setBannerAtivoLogin} label="Exibir na Tela de Login" />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-ink-primary">Exibir na Área Admin/Funcionário</p>
                <p className="text-xs text-ink-muted">No topo de toda página de dentro de /admin — Dashboard e todos os módulos.</p>
              </div>
              <Switch checked={bannerAtivoAdmin} onChange={setBannerAtivoAdmin} label="Exibir na Área Admin/Funcionário" />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-ink-primary">Exibir no Portal do Cliente</p>
                <p className="text-xs text-ink-muted">No topo do portal (área de membros) que os clientes acessam.</p>
              </div>
              <Switch checked={bannerAtivoCliente} onChange={setBannerAtivoCliente} label="Exibir no Portal do Cliente" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Título</label>
              <Input value={bannerTitulo} onChange={(e) => setBannerTitulo(e.target.value)} placeholder="Ex: Manutenção programada no sábado" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Descrição (opcional)</label>
              <Textarea
                rows={2}
                value={bannerDescricao}
                onChange={(e) => setBannerDescricao(e.target.value)}
                placeholder="Ex: O sistema fica indisponível das 2h às 4h pra atualização."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Texto do link (opcional)</label>
                <Input value={bannerLinkLabel} onChange={(e) => setBannerLinkLabel(e.target.value)} placeholder="Saiba mais" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">URL do link (opcional)</label>
                <Input
                  type="url"
                  value={bannerLinkUrl}
                  onChange={(e) => setBannerLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Tom</label>
                <Select value={bannerTone} onChange={(e) => setBannerTone(e.target.value as BannerTone)}>
                  {(Object.keys(BANNER_TONE_LABELS) as BannerTone[]).map((tone) => (
                    <option key={tone} value={tone}>
                      {BANNER_TONE_LABELS[tone]}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-ink-muted">Só afeta o ícone — texto continua sempre legível, nunca colorido.</p>
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-2.5 text-sm text-ink-secondary">
                  <Switch checked={bannerDispensavel} onChange={setBannerDispensavel} label="Permitir fechar o banner" />
                  Permitir que a pessoa feche o banner (×)
                </label>
              </div>
            </div>

            <UploadField
              label="Ou envie uma imagem de fundo pro banner (opcional)"
              campo="banner_img_url"
              valorAtual={bannerImgUrl}
              onChange={setBannerImgUrl}
              formato="wide"
              hint="Quando enviada, o banner vira uma faixa com essa imagem de fundo em vez do cartão simples."
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">Menu Lateral</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Cada admin pode expandir/recolher a própria sidebar a qualquer momento (botão no rodapé do menu) — isto só define o
            estado inicial de uma sessão nova.
          </p>
          <label className="flex items-center gap-2.5 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={sidebarCompactoPadrao}
              onChange={(e) => setSidebarCompactoPadrao(e.target.checked)}
              className="h-4 w-4 rounded border-base-600 bg-base-900 accent-accent"
            />
            Iniciar com o menu lateral recolhido (mini sidebar) por padrão
          </label>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSalvar} disabled={pending}>
            {pending ? "Salvando..." : "Salvar Alterações"}
          </Button>
          {salvoRecentemente && !pending && <span className="text-xs text-status-good">Alterações salvas.</span>}
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <h2 className="mb-1 text-sm font-semibold">Pré-visualização em Tempo Real</h2>
          <p className="mb-4 text-xs text-ink-muted">Reflete os textos ainda não salvos — os uploads já são reais.</p>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-ink-secondary">Tela de Login</p>
              {/* A logotipo do login é sempre a marca padrão (nunca a
                  customizada) — o preview usa `logoUrl={null}` de propósito,
                  pra refletir exatamente o que aparece na tela real. */}
              <LoginPreview
                logoUrl={null}
                titulo={loginTitle}
                subtitulo={loginSubtitle}
                posicao={loginBoxPosition}
                bgPreset={loginBgPreset}
                bgUrl={loginBgUrl}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-ink-secondary">Banner de Destaque</p>
              {bannerTitulo.trim() ? (
                // `dispensavel={false}` de propósito só aqui no preview — evita
                // que um clique no × durante a configuração grave uma dispensa
                // de verdade no localStorage deste navegador (ver componente).
                <AnnouncementBanner
                  titulo={bannerTitulo}
                  descricao={bannerDescricao}
                  linkUrl={bannerLinkUrl || null}
                  linkLabel={bannerLinkLabel}
                  imgUrl={bannerImgUrl}
                  tone={bannerTone}
                  dispensavel={false}
                  chaveDispensa="preview"
                />
              ) : (
                <div className="rounded-xl border border-dashed border-base-700 p-4 text-center text-xs text-ink-muted">
                  Preencha o título do banner pra ver o preview.
                </div>
              )}
              {bannerTitulo.trim() && !bannerAtivoLogin && !bannerAtivoAdmin && !bannerAtivoCliente && (
                <p className="mt-2 text-xs text-status-warning">Nenhum toggle ligado acima — o banner não vai aparecer em lugar nenhum ainda.</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-ink-secondary">Botões & Destaques (fixos em toda a plataforma)</p>
              <div className="space-y-2 rounded-xl border border-base-700 bg-base-950/60 p-4">
                <div className="flex flex-wrap gap-2">
                  <Button className="px-3 py-1.5 text-xs">Ação Primária</Button>
                  <Button variant="ghost" className="px-3 py-1.5 text-xs">
                    Secundária
                  </Button>
                </div>
                <a className="block text-xs text-accent hover:underline">Um link de destaque</a>
                <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-ink-primary">
                  Card com borda de destaque
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
