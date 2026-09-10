"use client";

import { useRef, useState, useTransition } from "react";
import type { BrandingConfigRow, LoginBgPreset, LoginBoxPosition } from "@/lib/types/database";
import { LOGIN_BG_PRESETS, LOGO_LOGIN_PADRAO, LOGO_LOGIN_PADRAO_CLARA } from "@/lib/branding/constants";
import {
  salvarTelaLogin,
  uploadFundoLogin,
  removerFundoLogin,
  uploadLogoLogin,
  removerLogoLogin,
  type VarianteLogoLogin,
} from "@/app/super-admin/actions";
import { LoginPreview } from "@/components/admin/aparencia/LoginPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { IconUpload } from "@/components/ui/icons";

const POSICOES: { value: LoginBoxPosition; label: string }[] = [
  { value: "esquerda", label: "À esquerda" },
  { value: "centro", label: "No centro" },
  { value: "direita", label: "À direita" },
];

/**
 * Sem i18n de propósito, como o resto de `/super-admin`: este painel é visto
 * por uma pessoa só (o dono do SaaS), então os textos ficam em português
 * direto no componente — mesma decisão documentada em `MIGRACAO-MULTI-TENANT.md`.
 */
export function TelaLoginForm({ initialBranding }: { initialBranding: BrandingConfigRow }) {
  const [titulo, setTitulo] = useState(initialBranding.login_title);
  const [subtitulo, setSubtitulo] = useState(initialBranding.login_subtitle);
  const [posicao, setPosicao] = useState<LoginBoxPosition>(initialBranding.login_box_position);
  const [bgPreset, setBgPreset] = useState<LoginBgPreset>(initialBranding.login_bg_preset);
  const [bgUrl, setBgUrl] = useState(initialBranding.login_bg_url);
  const [bannerAtivoLogin, setBannerAtivoLogin] = useState(initialBranding.banner_ativo_login ?? false);
  const [logoUrl, setLogoUrl] = useState(initialBranding.login_logo_url);
  const [logoLightUrl, setLogoLightUrl] = useState(initialBranding.login_logo_light_url);

  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [pending, startTransition] = useTransition();
  const [enviando, startEnvio] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSalvar() {
    setErro(null);
    setSalvo(false);
    startTransition(async () => {
      const r = await salvarTelaLogin({
        loginTitle: titulo,
        loginSubtitle: subtitulo,
        loginBoxPosition: posicao,
        loginBgPreset: bgPreset,
        bannerAtivoLogin,
      });
      if (r.ok) setSalvo(true);
      else setErro(r.error);
    });
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois de remover
    if (!file) return;
    setErro(null);
    const formData = new FormData();
    formData.append("file", file);
    startEnvio(async () => {
      const r = await uploadFundoLogin(formData);
      if (r.ok) setBgUrl(r.url);
      else setErro(r.error);
    });
  }

  function enviarLogo(variante: VarianteLogoLogin, file: File) {
    setErro(null);
    const formData = new FormData();
    formData.append("file", file);
    startEnvio(async () => {
      const r = await uploadLogoLogin(formData, variante);
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      if (variante === "escuro") setLogoUrl(r.url);
      else setLogoLightUrl(r.url);
    });
  }

  function removerLogo(variante: VarianteLogoLogin) {
    setErro(null);
    startEnvio(async () => {
      const r = await removerLogoLogin(variante);
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      if (variante === "escuro") setLogoUrl(null);
      else setLogoLightUrl(null);
    });
  }

  function handleRemoverFundo() {
    setErro(null);
    startEnvio(async () => {
      const r = await removerFundoLogin();
      if (r.ok) setBgUrl(null);
      else setErro(r.error);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="mb-1 text-sm font-semibold">Textos</h2>
          <p className="mb-4 text-xs text-ink-muted">Aparecem acima da caixa de e-mail e senha.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Título</label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome da plataforma" maxLength={60} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Subtítulo</label>
              <Input
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                placeholder="Acesso a clientes e projetos"
                maxLength={90}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">Logo da plataforma</h2>
          <p className="mb-4 text-xs text-ink-muted">
            É a sua marca, nunca a de uma agência — quem chega ao login ainda não foi identificado, então não há agência a
            mostrar. Sem logo enviada, aparece o losango padrão.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SlotDeLogo
              titulo="Para fundo escuro"
              ajuda="A que aparece no modo escuro, o padrão do sistema. Uma logo clara ou branca funciona melhor aqui."
              url={logoUrl ?? LOGO_LOGIN_PADRAO}
              ehPadrao={!logoUrl}
              escura
              enviando={enviando}
              onEnviar={(file) => enviarLogo("escuro", file)}
              onRemover={() => removerLogo("escuro")}
            />
            <SlotDeLogo
              titulo="Para fundo claro"
              ajuda="Opcional. Sem ela, a de cima é usada nos dois modos — e uma logo branca sumiria no tema claro."
              url={logoLightUrl ?? (logoUrl ? null : LOGO_LOGIN_PADRAO_CLARA)}
              ehPadrao={!logoLightUrl && !logoUrl}
              escura={false}
              enviando={enviando}
              onEnviar={(file) => enviarLogo("claro", file)}
              onRemover={() => removerLogo("claro")}
            />
          </div>

          <p className="mt-3 text-[11px] text-ink-muted/80">
            Ideal: PNG com fundo transparente, cerca de 3× mais larga que alta (ex.: 480×160 px). Aparece com 48 px de altura, então
            mande o dobro disso para ficar nítida em tela retina · até 3 MB · SVG não é aceito
          </p>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">Fundo e composição</h2>
          <p className="mb-4 text-xs text-ink-muted">Onde a caixa de login fica e o que aparece atrás dela.</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Posição da caixa de login</label>
              <Select value={posicao} onChange={(e) => setPosicao(e.target.value as LoginBoxPosition)}>
                {POSICOES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Fundo padrão</label>
              <Select value={bgPreset} onChange={(e) => setBgPreset(e.target.value as LoginBgPreset)} disabled={Boolean(bgUrl)}>
                {LOGIN_BG_PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </Select>
              {bgUrl && <p className="mt-1 text-xs text-ink-muted">Remova a imagem abaixo para voltar a usar um fundo padrão.</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Imagem de fundo</label>
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-base-600 bg-base-950">
                {bgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- preview de arquivo recém-enviado ao bucket do próprio projeto
                  <img src={bgUrl} alt="Fundo do login" className="h-full w-full object-cover" />
                ) : (
                  <IconUpload className="h-5 w-5 text-ink-muted" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => inputRef.current?.click()}
                    disabled={enviando}
                  >
                    {enviando ? "Enviando..." : bgUrl ? "Trocar" : "Enviar imagem"}
                  </Button>
                  {bgUrl && (
                    <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={handleRemoverFundo} disabled={enviando}>
                      Remover
                    </Button>
                  )}
                </div>
                <p className="max-w-md text-xs text-ink-muted">
                  Ideal: 1920×1080 px (16:9), paisagem. A imagem cobre a tela inteira e é cortada nas bordas — deixe o assunto
                  principal no centro. Tem prioridade sobre o fundo padrão escolhido acima.
                </p>
                <p className="text-[11px] text-ink-muted/80">PNG, JPG, WEBP ou GIF · até 3 MB · SVG não é aceito</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleArquivo} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold">Banner de destaque</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Liga ou desliga o banner nesta tela. O conteúdo dele (título, texto, imagem) é escrito em Aparência, dentro do painel
            da sua empresa.
          </p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-base-800 px-4 py-3">
            <div>
              <p className="text-sm text-ink-primary">Mostrar o banner na tela de login</p>
              <p className="text-xs text-ink-muted">Todo mundo que abrir o sistema vê, mesmo sem estar logado.</p>
            </div>
            <Switch checked={bannerAtivoLogin} onChange={setBannerAtivoLogin} label="Mostrar o banner na tela de login" />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSalvar} disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
          {salvo && !erro && <span className="text-xs text-status-good">Salvo.</span>}
          {erro && <span className="text-xs text-danger">{erro}</span>}
        </div>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card>
          <h2 className="mb-1 text-sm font-semibold">Pré-visualização</h2>
          <p className="mb-4 text-xs text-ink-muted">Reflete os textos ainda não salvos — a imagem de fundo já é real.</p>
          {/* `logoUrl={null}` de propósito: é exatamente o que a tela real
              usa, a marca padrão da plataforma. */}
          <LoginPreview logoUrl={logoUrl ?? LOGO_LOGIN_PADRAO} logoLightUrl={logoLightUrl ?? (logoUrl ? null : LOGO_LOGIN_PADRAO_CLARA)} titulo={titulo} subtitulo={subtitulo} posicao={posicao} bgPreset={bgPreset} bgUrl={bgUrl} />
        </Card>
      </div>
    </div>
  );
}

/**
 * Um slot de logo: miniatura, enviar/trocar/remover.
 *
 * A miniatura tem o FUNDO do modo a que a logo se destina — é o único jeito
 * de ver se uma logo branca está lá ou se o campo está vazio.
 */
function SlotDeLogo({
  titulo,
  ajuda,
  url,
  ehPadrao,
  escura,
  enviando,
  onEnviar,
  onRemover,
}: {
  titulo: string;
  ajuda: string;
  url: string | null;
  /** Nada foi enviado: o que está na miniatura é a marca que vem com a plataforma. */
  ehPadrao: boolean;
  escura: boolean;
  enviando: boolean;
  onEnviar: (file: File) => void;
  onRemover: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{titulo}</label>
      <div
        className="flex h-16 items-center justify-center overflow-hidden rounded-lg border border-base-600 px-3"
        style={{ backgroundColor: escura ? "#0a0c14" : "#f4f4f5" }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview de arquivo recém-enviado ao bucket do próprio projeto
          <img src={url} alt={titulo} className="max-h-10 w-auto object-contain" />
        ) : (
          <IconUpload className={escura ? "h-5 w-5 text-ink-muted" : "h-5 w-5 text-zinc-400"} />
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => input.current?.click()} disabled={enviando}>
          {enviando ? "Enviando..." : url ? "Trocar" : "Enviar logo"}
        </Button>
        {url && !ehPadrao && (
          <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={onRemover} disabled={enviando}>
            Remover
          </Button>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-snug text-ink-muted">
        {ehPadrao && <span className="text-ink-secondary">Marca padrão da plataforma. </span>}
        {ajuda}
      </p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onEnviar(file);
        }}
      />
    </div>
  );
}
