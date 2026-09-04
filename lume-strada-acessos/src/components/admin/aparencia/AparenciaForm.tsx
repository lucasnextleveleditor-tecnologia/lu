"use client";

import { useState, useTransition } from "react";
import type { BannerTone, BrandingConfigRow, LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";
import { salvarBranding, atualizarNomeApp } from "@/app/admin/aparencia/actions";
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
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function AparenciaForm({ initialBranding, initialNomeApp }: { initialBranding: BrandingConfigRow; initialNomeApp: string }) {
  const { dict } = useLocale();

  // Nome do APP (sidebar do admin + header do cliente) — vive em
  // `companies.nome_app`, não em `branding_config` (que é global, ver
  // `atualizarNomeApp` em `actions.ts`). Fica junto do resto do formulário
  // por conveniência de UX (um botão "Salvar Alterações" só), mas salva
  // numa Server Action separada.
  const [nomeApp, setNomeApp] = useState(initialNomeApp);

  const POSICOES: { value: LoginBoxPosition; label: string }[] = [
    { value: "esquerda", label: dict.aparencia.posicaoEsquerda },
    { value: "centro", label: dict.aparencia.posicaoCentro },
    { value: "direita", label: dict.aparencia.posicaoDireita },
  ];
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
      // Duas tabelas diferentes (`companies.nome_app` vs `branding_config`),
      // uma Server Action cada — disparadas juntas pra manter um botão só.
      const [resultNomeApp, resultBranding] = await Promise.all([
        atualizarNomeApp(nomeApp),
        salvarBranding({
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
        }),
      ]);
      if (!resultNomeApp.ok) {
        setError(resultNomeApp.error);
        return;
      }
      if (!resultBranding.ok) {
        setError(resultBranding.error);
        return;
      }
      setSalvoRecentemente(true);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.aparencia.nomeAppCardTitulo}</h2>
          <p className="mb-4 text-xs text-ink-muted">{dict.aparencia.nomeAppCardDescricao}</p>
          <div className="max-w-sm">
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.nomeAppLabel}</label>
            <Input value={nomeApp} onChange={(e) => setNomeApp(e.target.value)} placeholder={dict.aparencia.nomeAppPlaceholder} maxLength={60} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.aparencia.logoCardTitulo}</h2>
          <p className="mb-4 text-xs text-ink-muted">{dict.aparencia.logoCardDescricao}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadField label={dict.aparencia.logoPrincipalLabel} campo="logo_url" valorAtual={logoUrl} onChange={setLogoUrl} />
            <UploadField
              label={dict.aparencia.faviconLabel}
              campo="favicon_url"
              valorAtual={faviconUrl}
              onChange={setFaviconUrl}
              hint={dict.aparencia.faviconHint}
            />
            <UploadField
              label={dict.aparencia.logoDarkLabel}
              campo="logo_dark_url"
              valorAtual={logoDarkUrl}
              onChange={setLogoDarkUrl}
              hint={dict.aparencia.logoDarkHint}
            />
            <UploadField
              label={dict.aparencia.logoLightLabel}
              campo="logo_light_url"
              valorAtual={logoLightUrl}
              onChange={setLogoLightUrl}
              hint={dict.aparencia.logoLightHint}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.aparencia.loginCardTitulo}</h2>
          <p className="mb-4 text-xs text-ink-muted">{dict.aparencia.loginCardDescricao}</p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.tituloLabel}</label>
                <Input value={loginTitle} onChange={(e) => setLoginTitle(e.target.value)} placeholder={dict.aparencia.tituloPlaceholder} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.subtituloLabel}</label>
                <Input value={loginSubtitle} onChange={(e) => setLoginSubtitle(e.target.value)} placeholder={dict.aparencia.subtituloPlaceholder} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.posicaoLabel}</label>
                <Select value={loginBoxPosition} onChange={(e) => setLoginBoxPosition(e.target.value as LoginBoxPosition)}>
                  {POSICOES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.fundoLabel}</label>
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
                {loginBgUrl && <p className="mt-1 text-xs text-ink-muted">{dict.aparencia.fundoDesativeHint}</p>}
              </div>
            </div>

            <UploadField
              label={dict.aparencia.fundoCustomLabel}
              campo="login_bg_url"
              valorAtual={loginBgUrl}
              onChange={setLoginBgUrl}
              formato="wide"
              hint={dict.aparencia.fundoCustomHint}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.aparencia.bannerCardTitulo}</h2>
          <p className="mb-4 text-xs text-ink-muted">{dict.aparencia.bannerCardDescricao}</p>

          <div className="mb-4 divide-y divide-base-800 rounded-xl border border-base-800">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-ink-primary">{dict.aparencia.bannerLoginTitulo}</p>
                <p className="text-xs text-ink-muted">{dict.aparencia.bannerLoginDescricao}</p>
              </div>
              <Switch checked={bannerAtivoLogin} onChange={setBannerAtivoLogin} label={dict.aparencia.bannerLoginTitulo} />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-ink-primary">{dict.aparencia.bannerAdminTitulo}</p>
                <p className="text-xs text-ink-muted">{dict.aparencia.bannerAdminDescricao}</p>
              </div>
              <Switch checked={bannerAtivoAdmin} onChange={setBannerAtivoAdmin} label={dict.aparencia.bannerAdminTitulo} />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-ink-primary">{dict.aparencia.bannerClienteTitulo}</p>
                <p className="text-xs text-ink-muted">{dict.aparencia.bannerClienteDescricao}</p>
              </div>
              <Switch checked={bannerAtivoCliente} onChange={setBannerAtivoCliente} label={dict.aparencia.bannerClienteTitulo} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.tituloLabel}</label>
              <Input value={bannerTitulo} onChange={(e) => setBannerTitulo(e.target.value)} placeholder={dict.aparencia.bannerTituloPlaceholder} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.bannerDescricaoLabel}</label>
              <Textarea
                rows={2}
                value={bannerDescricao}
                onChange={(e) => setBannerDescricao(e.target.value)}
                placeholder={dict.aparencia.bannerDescricaoPlaceholder}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.bannerLinkLabelLabel}</label>
                <Input value={bannerLinkLabel} onChange={(e) => setBannerLinkLabel(e.target.value)} placeholder="Saiba mais" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.bannerLinkUrlLabel}</label>
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
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.aparencia.bannerTomLabel}</label>
                <Select value={bannerTone} onChange={(e) => setBannerTone(e.target.value as BannerTone)}>
                  {(Object.keys(BANNER_TONE_LABELS) as BannerTone[]).map((tone) => (
                    <option key={tone} value={tone}>
                      {BANNER_TONE_LABELS[tone]}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-ink-muted">{dict.aparencia.bannerTomHint}</p>
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-2.5 text-sm text-ink-secondary">
                  <Switch checked={bannerDispensavel} onChange={setBannerDispensavel} label={dict.aparencia.bannerPermitirFechar} />
                  {dict.aparencia.bannerPermitirFecharTexto}
                </label>
              </div>
            </div>

            <UploadField
              label={dict.aparencia.bannerImgLabel}
              campo="banner_img_url"
              valorAtual={bannerImgUrl}
              onChange={setBannerImgUrl}
              formato="wide"
              hint={dict.aparencia.bannerImgHint}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.aparencia.sidebarCardTitulo}</h2>
          <p className="mb-4 text-xs text-ink-muted">{dict.aparencia.sidebarCardDescricao}</p>
          <label className="flex items-center gap-2.5 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={sidebarCompactoPadrao}
              onChange={(e) => setSidebarCompactoPadrao(e.target.checked)}
              className="h-4 w-4 rounded border-base-600 bg-base-900 accent-accent"
            />
            {dict.aparencia.sidebarCheckboxLabel}
          </label>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSalvar} disabled={pending}>
            {pending ? dict.common.salvando : dict.common.salvarAlteracoes}
          </Button>
          {salvoRecentemente && !pending && <span className="text-xs text-status-good">{dict.aparencia.alteracoesSalvas}</span>}
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <h2 className="mb-1 text-sm font-semibold">{dict.aparencia.previewCardTitulo}</h2>
          <p className="mb-4 text-xs text-ink-muted">{dict.aparencia.previewCardDescricao}</p>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-ink-secondary">{dict.aparencia.previewLoginLabel}</p>
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
              <p className="mb-2 text-xs font-medium text-ink-secondary">{dict.aparencia.bannerCardTitulo}</p>
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
                  {dict.aparencia.previewBannerPlaceholder}
                </div>
              )}
              {bannerTitulo.trim() && !bannerAtivoLogin && !bannerAtivoAdmin && !bannerAtivoCliente && (
                <p className="mt-2 text-xs text-status-warning">{dict.aparencia.previewBannerAvisoNenhumToggle}</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-ink-secondary">{dict.aparencia.previewBotoesLabel}</p>
              <div className="space-y-2 rounded-xl border border-base-700 bg-base-950/60 p-4">
                <div className="flex flex-wrap gap-2">
                  <Button className="px-3 py-1.5 text-xs">{dict.aparencia.previewAcaoPrimaria}</Button>
                  <Button variant="ghost" className="px-3 py-1.5 text-xs">
                    {dict.aparencia.previewSecundaria}
                  </Button>
                </div>
                <a className="block text-xs text-accent hover:underline">{dict.aparencia.previewLinkDestaque}</a>
                <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-ink-primary">
                  {dict.aparencia.previewCardDestaque}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
