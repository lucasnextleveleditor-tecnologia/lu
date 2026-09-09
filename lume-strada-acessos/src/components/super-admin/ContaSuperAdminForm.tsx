"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { alterarMinhaSenha, atualizarMeuNome } from "@/app/admin/configuracoes/actions";

const TAMANHO_MINIMO_SENHA = 8;

/**
 * Sem i18n, como o resto de `/super-admin`.
 *
 * Reaproveita as MESMAS Server Actions da aba "Minha Conta" do painel das
 * agências (`app/admin/configuracoes/actions.ts`): elas não exigem papel
 * nenhum de propósito — qualquer pessoa autenticada mexe no próprio registro,
 * e só nele. Duplicar a lógica aqui só criaria dois lugares para manter (e
 * dois lugares para errar) a mesma regra de troca de senha.
 *
 * O telefone não aparece: ele mora em `equipe_membros`, o cadastro de RH de
 * uma empresa, e o super_admin não pertence a nenhuma.
 */
export function ContaSuperAdminForm({ nomeInicial, email }: { nomeInicial: string; email: string }) {
  const [nome, setNome] = useState(nomeInicial);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmar, setSenhaConfirmar] = useState("");

  const [avisoNome, setAvisoNome] = useState<{ ok: boolean; texto: string } | null>(null);
  const [avisoSenha, setAvisoSenha] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendingNome, startNome] = useTransition();
  const [pendingSenha, startSenha] = useTransition();

  function traduzErroSenha(codigo: string): string {
    if (codigo === "senha-atual") return "A senha atual não confere.";
    if (codigo === "senha-curta") return `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
    if (codigo === "senha-igual") return "A nova senha precisa ser diferente da atual.";
    return codigo;
  }

  function handleNome() {
    setAvisoNome(null);
    startNome(async () => {
      const r = await atualizarMeuNome(nome);
      setAvisoNome(r.ok ? { ok: true, texto: "Salvo." } : { ok: false, texto: r.error });
    });
  }

  function handleSenha() {
    setAvisoSenha(null);
    if (senhaNova.length < TAMANHO_MINIMO_SENHA) {
      return setAvisoSenha({ ok: false, texto: `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.` });
    }
    if (senhaNova !== senhaConfirmar) return setAvisoSenha({ ok: false, texto: "As duas senhas novas não são iguais." });

    startSenha(async () => {
      const r = await alterarMinhaSenha(senhaAtual, senhaNova);
      if (r.ok) {
        setSenhaAtual("");
        setSenhaNova("");
        setSenhaConfirmar("");
        setAvisoSenha({ ok: true, texto: "Senha alterada." });
      } else {
        setAvisoSenha({ ok: false, texto: traduzErroSenha(r.error) });
      }
    });
  }

  const senhaIncompleta = !senhaAtual || !senhaNova || !senhaConfirmar;

  return (
    <div className="max-w-2xl space-y-5">
      <Card>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Seus dados</p>

        <div className="space-y-5">
          <div>
            <label htmlFor="sa-nome" className="mb-1.5 block text-sm font-medium text-ink-secondary">
              Nome
            </label>
            <div className="flex gap-2">
              <Input id="sa-nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
              <Button onClick={handleNome} disabled={pendingNome || !nome.trim() || nome.trim() === nomeInicial}>
                {pendingNome ? "Salvando..." : "Salvar"}
              </Button>
            </div>
            {avisoNome && <p className={avisoNome.ok ? "mt-2 text-xs text-status-good" : "mt-2 text-xs text-danger"}>{avisoNome.texto}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">E-mail</label>
            {/* Só leitura: trocar o e-mail de acesso do super admin pelo app
                seria um jeito rápido de perder a única conta que administra o
                SaaS. Isso se faz no painel do Supabase, com confirmação. */}
            <div className="rounded-lg border border-base-700 bg-base-950/40 px-3 py-2 text-sm text-ink-secondary">{email}</div>
            <p className="mt-1.5 text-xs text-ink-muted">
              É com este e-mail que você entra. Para trocá-lo, use o painel do Supabase — assim não dá para perder o acesso por
              engano.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Senha</p>
        <p className="mb-4 text-sm text-ink-muted">Pedimos a senha atual antes de trocar — assim um computador destravado não vira conta perdida.</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="sa-senha-atual" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              Senha atual
            </label>
            <PasswordInput
              id="sa-senha-atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              mostrarSenhaAria="Mostrar senha"
              ocultarSenhaAria="Ocultar senha"
            />
          </div>
          <div>
            <label htmlFor="sa-senha-nova" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              Nova senha
            </label>
            <PasswordInput
              id="sa-senha-nova"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              autoComplete="new-password"
              mostrarSenhaAria="Mostrar senha"
              ocultarSenhaAria="Ocultar senha"
            />
          </div>
          <div>
            <label htmlFor="sa-senha-confirmar" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              Repita a nova senha
            </label>
            <PasswordInput
              id="sa-senha-confirmar"
              value={senhaConfirmar}
              onChange={(e) => setSenhaConfirmar(e.target.value)}
              autoComplete="new-password"
              mostrarSenhaAria="Mostrar senha"
              ocultarSenhaAria="Ocultar senha"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSenha} disabled={pendingSenha || senhaIncompleta}>
            {pendingSenha ? "Salvando..." : "Alterar senha"}
          </Button>
          {avisoSenha && <span className={avisoSenha.ok ? "text-xs text-status-good" : "text-xs text-danger"}>{avisoSenha.texto}</span>}
        </div>
      </Card>
    </div>
  );
}
