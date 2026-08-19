"use client";

import { useState } from "react";
import type { EquipeMembroRow } from "@/lib/types/cadastros";
import type { ProfileRow, PermissoesFuncionario, PreferenciasDashboard, DashboardCardChave } from "@/lib/types/database";
import { gerarAcessoFuncionario, atualizarPermissoes, atualizarDashboardConfig } from "@/app/admin/actions";
import { MODULOS_PERMISSAO, CARDS_DASHBOARD } from "@/lib/utils/cadastros";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AcessoStatusControls } from "@/components/admin/cadastros/AcessoStatusControls";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Switch } from "@/components/ui/Switch";
import { CredenciaisAcessoGerado } from "@/components/ui/CredenciaisAcessoGerado";

interface AcessoFuncionarioModalProps {
  membro: EquipeMembroRow;
  profile: ProfileRow | null;
  onClose: () => void;
}

/**
 * Combina as duas situações num modal só: se o membro AINDA não tem acesso,
 * mostra o formulário de convite (e-mail + expiração) junto com os toggles
 * de permissão iniciais; se já tem, mostra o status de acesso (reaproveita
 * `AcessoStatusControls`) e os mesmos toggles, agora editando as permissões
 * já gravadas. Sempre admin-only — chamado só de dentro da aba Equipe, que
 * já é admin-only por inteiro.
 */
export function AcessoFuncionarioModal({ membro, profile, onClose }: AcessoFuncionarioModalProps) {
  const { dict } = useLocale();
  const [email, setEmail] = useState(membro.email ?? "");
  const [expiresAt, setExpiresAt] = useState("");
  const [permissoes, setPermissoes] = useState<PermissoesFuncionario>(profile?.permissoes ?? {});
  const [dashboardConfig, setDashboardConfig] = useState<PreferenciasDashboard>(profile?.dashboard_config ?? {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [credenciais, setCredenciais] = useState<{ email: string; senhaPadrao: string } | null>(null);

  const jaTemAcesso = Boolean(profile);

  function alternarPermissao(chave: keyof PermissoesFuncionario) {
    setPermissoes((atual) => ({ ...atual, [chave]: !atual[chave] }));
  }

  // Card ausente do objeto = visível (padrão oposto de `permissoes` — ver
  // comentário em `DashboardCardChave`). O switch some quando explicitamente
  // `false`; o primeiro clique grava `false` (some), o segundo apaga a
  // chave de novo (volta a herdar "visível").
  function alternarCardDashboard(chave: DashboardCardChave) {
    setDashboardConfig((atual) => {
      const visivelAgora = atual[chave] !== false;
      const proximo = { ...atual };
      if (visivelAgora) proximo[chave] = false;
      else delete proximo[chave];
      return proximo;
    });
  }

  async function handleGerarAcesso() {
    if (!email.trim()) {
      setError(dict.cadastros.informeEmailErro);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await gerarAcessoFuncionario(membro.id, { email, permissoes, expiresAt: expiresAt || null });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Fica aberto mostrando as credenciais (CredenciaisAcessoGerado) em vez
    // de fechar sozinho — sem isso a senha gerada nunca chegaria a aparecer
    // pra ninguém copiar.
    setCredenciais({ email: result.email, senhaPadrao: result.senhaPadrao });
  }

  async function handleSalvarPermissoes() {
    if (!profile) return;
    setLoading(true);
    setError(null);
    setSalvo(false);

    const resultPermissoes = await atualizarPermissoes(profile.id, permissoes);
    if (!resultPermissoes.ok) {
      setLoading(false);
      setError(resultPermissoes.error);
      return;
    }

    const resultDashboard = await atualizarDashboardConfig(profile.id, dashboardConfig);
    setLoading(false);
    if (!resultDashboard.ok) {
      setError(resultDashboard.error);
      return;
    }

    setSalvo(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {jaTemAcesso ? dict.cadastros.permissoes : dict.cadastros.gerarAcesso} — {membro.nome}
          </h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        {credenciais ? (
          <div className="space-y-4">
            <CredenciaisAcessoGerado
              email={credenciais.email}
              senhaPadrao={credenciais.senhaPadrao}
              titulo={dict.cadastros.linkAcessoTitulo}
              ajuda={dict.cadastros.linkAcessoAjuda}
              copiarLabel={dict.common.copiarLink}
              copiadoLabel={dict.common.linkCopiado}
              whatsappLabel={dict.common.enviarPorWhatsapp}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={onClose}>
                {dict.common.concluir}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {jaTemAcesso && profile && (
              <div className="mb-5 rounded-xl border border-base-800 bg-base-950/40 p-4">
                <AcessoStatusControls profile={profile} editavel />
              </div>
            )}

            {!jaTemAcesso && (
              <div className="mb-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.emailLoginLabel}</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.cadastros.emailFuncionarioPlaceholder}
                  />
                  <p className="mt-1 text-xs text-ink-muted">{dict.cadastros.conviteFuncionarioAjuda}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{dict.cadastros.dataExpiracaoLabel}</label>
                  <DatePicker value={expiresAt} onChange={setExpiresAt} clearable />
                </div>
              </div>
            )}

            <div className="mb-5">
              <p className="mb-1 text-sm font-semibold text-ink-primary">{dict.cadastros.modulosLiberadosTitulo}</p>
              <p className="mb-3 text-xs text-ink-muted">{dict.cadastros.modulosLiberadosAjuda}</p>
              <div className="divide-y divide-base-800 rounded-xl border border-base-800">
                {MODULOS_PERMISSAO.map((modulo) => (
                  <div key={modulo.chave} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm text-ink-primary">{modulo.label}</p>
                      <p className="text-xs text-ink-muted">{modulo.hint}</p>
                    </div>
                    <Switch checked={Boolean(permissoes[modulo.chave])} onChange={() => alternarPermissao(modulo.chave)} label={modulo.label} />
                  </div>
                ))}
              </div>
            </div>

            {jaTemAcesso && profile && (
              <div className="mb-5">
                <p className="mb-1 text-sm font-semibold text-ink-primary">Cards do Dashboard</p>
                <p className="mb-3 text-xs text-ink-muted">
                  Escolha o que aparece na Visão Geral desse funcionário — os cards de módulo (Financeiro/Inventário/Tráfego/WhatsApp) só
                  aparecem se o módulo acima também estiver liberado.
                </p>
                <div className="grid grid-cols-1 gap-x-3 gap-y-1 rounded-xl border border-base-800 p-2 sm:grid-cols-2">
                  {CARDS_DASHBOARD.map((card) => (
                    <div key={card.chave} className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2">
                      <p className="text-sm leading-tight text-ink-primary">{card.label}</p>
                      <Switch
                        checked={dashboardConfig[card.chave] !== false}
                        onChange={() => alternarCardDashboard(card.chave)}
                        label={card.label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="mb-3 text-sm text-danger">{error}</p>}
            {salvo && <p className="mb-3 text-sm text-ink-secondary">Alterações salvas.</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Fechar
              </Button>
              {jaTemAcesso ? (
                <Button type="button" onClick={handleSalvarPermissoes} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              ) : (
                <Button type="button" onClick={handleGerarAcesso} disabled={loading}>
                  {loading ? dict.cadastros.enviando : dict.cadastros.gerarAcessoEnviarConvite}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
