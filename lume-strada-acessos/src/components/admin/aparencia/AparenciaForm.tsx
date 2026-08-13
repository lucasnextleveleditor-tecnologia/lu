"use client";

import { useState, useTransition } from "react";
import type { BrandingConfigRow, LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";
import { salvarBranding } from "@/app/admin/aparencia/actions";
import { LOGIN_BG_PRESETS } from "@/lib/branding/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { UploadField } from "@/components/admin/aparencia/UploadField";
import { LoginPreview } from "@/components/admin/aparencia/LoginPreview";

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
