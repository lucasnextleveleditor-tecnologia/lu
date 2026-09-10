"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { IconUsers, IconMail, IconKey } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  alterarMinhaSenha,
  atualizarMeuNome,
  atualizarMeuTelefone,
  atualizarMinhaFoto,
  removerMinhaFoto,
} from "@/app/admin/configuracoes/actions";
import { Avatar } from "@/components/ui/Avatar";

interface MinhaContaFormProps {
  nomeInicial: string;
  email: string;
  /** `null` quando esta pessoa não tem registro em `equipe_membros` (ex: o admin criado direto pelo super_admin) — o campo some em vez de fingir que salva. */
  telefoneInicial: string | null;
  fotoInicial: string | null;
}

const TAMANHO_MINIMO_SENHA = 8;

/**
 * Aba "Minha Conta". Cada campo salva sozinho, no próprio botão — em vez de
 * um "Salvar Alterações" no fim da página. São três coisas independentes
 * (nome, telefone, senha) que quase nunca mudam juntas; um botão só faria a
 * pessoa se perguntar se a troca de senha já valeu ou não.
 *
 * A troca de senha exige a senha ATUAL (conferida no servidor, ver
 * `alterarMinhaSenha`) — sem isso, uma máquina destravada viraria sequestro
 * de conta.
 */
export function MinhaContaForm({ nomeInicial, email, telefoneInicial, fotoInicial }: MinhaContaFormProps) {
  const { dict } = useLocale();
  const t = dict.configuracoes;

  const [nome, setNome] = useState(nomeInicial);
  const [foto, setFoto] = useState(fotoInicial);
  const [avisoFoto, setAvisoFoto] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendingFoto, startFoto] = useTransition();
  const inputFoto = useRef<HTMLInputElement>(null);
  const [telefone, setTelefone] = useState(telefoneInicial ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmar, setSenhaConfirmar] = useState("");

  // Um aviso por card — feedback longe do botão que a pessoa acabou de
  // clicar não é lido.
  const [avisoNome, setAvisoNome] = useState<{ ok: boolean; texto: string } | null>(null);
  const [avisoTelefone, setAvisoTelefone] = useState<{ ok: boolean; texto: string } | null>(null);
  const [avisoSenha, setAvisoSenha] = useState<{ ok: boolean; texto: string } | null>(null);

  const [pendingNome, startNome] = useTransition();
  const [pendingTelefone, startTelefone] = useTransition();
  const [pendingSenha, startSenha] = useTransition();

  /** Traduz os códigos previsíveis de `alterarMinhaSenha`; qualquer outra coisa é erro cru do Supabase e passa direto. */
  function traduzErroSenha(codigo: string): string {
    if (codigo === "senha-atual") return t.contaErroSenhaAtual;
    if (codigo === "senha-curta") return t.contaErroSenhaCurta;
    if (codigo === "senha-igual") return t.contaErroSenhaIgualAtual;
    return codigo;
  }

  function handleFoto(file: File) {
    setAvisoFoto(null);
    const formData = new FormData();
    formData.append("file", file);
    startFoto(async () => {
      const r = await atualizarMinhaFoto(formData);
      if (r.ok) {
        setFoto(r.url);
        setAvisoFoto({ ok: true, texto: t.fotoSalva });
      } else {
        setAvisoFoto({ ok: false, texto: r.error });
      }
    });
  }

  function handleRemoverFoto() {
    setAvisoFoto(null);
    startFoto(async () => {
      const r = await removerMinhaFoto();
      if (r.ok) {
        setFoto(null);
        setAvisoFoto({ ok: true, texto: t.fotoRemovida });
      } else {
        setAvisoFoto({ ok: false, texto: r.error });
      }
    });
  }

  function handleNome() {
    setAvisoNome(null);
    startNome(async () => {
      const r = await atualizarMeuNome(nome);
      setAvisoNome(r.ok ? { ok: true, texto: t.contaSalvo } : { ok: false, texto: r.error });
    });
  }

  function handleTelefone() {
    setAvisoTelefone(null);
    startTelefone(async () => {
      const r = await atualizarMeuTelefone(telefone);
      setAvisoTelefone(r.ok ? { ok: true, texto: t.contaSalvo } : { ok: false, texto: r.error });
    });
  }

  function handleSenha() {
    setAvisoSenha(null);
    // Validações que dá pra fazer sem ida ao servidor ficam aqui — resposta
    // instantânea; as que dependem do banco (senha atual confere?) só o
    // servidor sabe.
    if (senhaNova.length < TAMANHO_MINIMO_SENHA) return setAvisoSenha({ ok: false, texto: t.contaErroSenhaCurta });
    if (senhaNova !== senhaConfirmar) return setAvisoSenha({ ok: false, texto: t.contaErroSenhaDiferente });

    startSenha(async () => {
      const r = await alterarMinhaSenha(senhaAtual, senhaNova);
      if (r.ok) {
        setSenhaAtual("");
        setSenhaNova("");
        setSenhaConfirmar("");
        setAvisoSenha({ ok: true, texto: t.contaSenhaAlterada });
      } else {
        setAvisoSenha({ ok: false, texto: traduzErroSenha(r.error) });
      }
    });
  }

  const senhaIncompleta = !senhaAtual || !senhaNova || !senhaConfirmar;

  return (
    <div className="space-y-5">
      <Card>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.fotoTitulo}</p>
        <div className="flex items-center gap-4">
          {/* Sem foto, as iniciais — e não um boneco cinza igual para todo
              mundo. É a mesma coisa que a pessoa vai ver na barra do painel,
              então a prévia aqui é o resultado de verdade. */}
          <Avatar nome={nome || email} fotoUrl={foto} className="h-16 w-16" tamanhoTexto="text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => inputFoto.current?.click()} disabled={pendingFoto}>
                {pendingFoto ? t.fotoEnviando : foto ? t.fotoTrocar : t.fotoEnviar}
              </Button>
              {foto && (
                <Button variant="danger" onClick={handleRemoverFoto} disabled={pendingFoto}>
                  {t.fotoRemover}
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-ink-muted">{t.fotoHint}</p>
            {avisoFoto && (
              <p className={avisoFoto.ok ? "mt-2 text-xs text-status-good" : "mt-2 text-xs text-danger"}>{avisoFoto.texto}</p>
            )}
          </div>
          <input
            ref={inputFoto}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleFoto(file);
            }}
          />
        </div>
      </Card>

      <Card>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{t.contaDadosTitulo}</p>

        <div className="space-y-5">
          <div>
            <label htmlFor="conta-nome" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-secondary">
              <IconUsers className="h-4 w-4" /> {t.contaNomeLabel}
            </label>
            <div className="flex gap-2">
              <Input id="conta-nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
              <Button onClick={handleNome} disabled={pendingNome || !nome.trim() || nome.trim() === nomeInicial}>
                {pendingNome ? dict.common.salvando : dict.common.salvar}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">{t.contaNomeHint}</p>
            {avisoNome && (
              <p className={avisoNome.ok ? "mt-2 text-xs text-status-good" : "mt-2 text-xs text-danger"}>{avisoNome.texto}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-secondary">
              <IconMail className="h-4 w-4" /> {t.contaEmailLabel}
            </label>
            {/* Só leitura de propósito: trocar o e-mail de acesso é ação de
                admin (`atualizarEmailAcesso`), não de autoatendimento — mudar
                o login de alguém sem confirmação por e-mail seria um jeito
                fácil de perder acesso à própria conta. */}
            <div className="rounded-lg border border-base-700 bg-base-950/40 px-3 py-2 text-sm text-ink-secondary">{email}</div>
            <p className="mt-1.5 text-xs text-ink-muted">{t.contaEmailHint}</p>
          </div>

          {telefoneInicial !== null && (
            <div>
              <label htmlFor="conta-telefone" className="mb-1.5 block text-sm font-medium text-ink-secondary">
                {t.contaTelefoneLabel}
              </label>
              <div className="flex gap-2">
                <Input
                  id="conta-telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder={t.contaTelefonePlaceholder}
                  maxLength={40}
                />
                <Button onClick={handleTelefone} disabled={pendingTelefone || telefone === (telefoneInicial ?? "")}>
                  {pendingTelefone ? dict.common.salvando : dict.common.salvar}
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">{t.contaTelefoneHint}</p>
              {avisoTelefone && (
                <p className={avisoTelefone.ok ? "mt-2 text-xs text-status-good" : "mt-2 text-xs text-danger"}>{avisoTelefone.texto}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          <IconKey className="h-3.5 w-3.5" /> {t.contaSenhaTitulo}
        </p>
        <p className="mb-4 text-sm text-ink-muted">{t.contaSenhaDescricao}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="senha-atual" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              {t.contaSenhaAtualLabel}
            </label>
            <PasswordInput
              id="senha-atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              mostrarSenhaAria={t.contaSenhaMostrar}
              ocultarSenhaAria={t.contaSenhaOcultar}
            />
          </div>
          <div>
            <label htmlFor="senha-nova" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              {t.contaSenhaNovaLabel}
            </label>
            <PasswordInput
              id="senha-nova"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              autoComplete="new-password"
              mostrarSenhaAria={t.contaSenhaMostrar}
              ocultarSenhaAria={t.contaSenhaOcultar}
            />
          </div>
          <div>
            <label htmlFor="senha-confirmar" className="mb-1.5 block text-xs font-medium text-ink-secondary">
              {t.contaSenhaConfirmarLabel}
            </label>
            <PasswordInput
              id="senha-confirmar"
              value={senhaConfirmar}
              onChange={(e) => setSenhaConfirmar(e.target.value)}
              autoComplete="new-password"
              mostrarSenhaAria={t.contaSenhaMostrar}
              ocultarSenhaAria={t.contaSenhaOcultar}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSenha} disabled={pendingSenha || senhaIncompleta}>
            {pendingSenha ? dict.common.salvando : t.contaSenhaBotao}
          </Button>
          {avisoSenha && (
            <span className={avisoSenha.ok ? "text-xs text-status-good" : "text-xs text-danger"}>{avisoSenha.texto}</span>
          )}
        </div>
      </Card>

      <p className="text-xs text-ink-muted">{t.contaPonteiroEmpresa}</p>
    </div>
  );
}
