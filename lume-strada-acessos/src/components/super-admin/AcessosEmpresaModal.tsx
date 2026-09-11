"use client";

import { useEffect, useState } from "react";
import type { AcessoEmpresaRow, CompanyRow } from "@/lib/types/super-admin";
import {
  listarAcessosEmpresa,
  atualizarEmailAcesso,
  excluirAcessoEmpresa,
  redefinirSenhaAcesso,
} from "@/app/super-admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconCheck, IconClipboardList, IconKey } from "@/components/ui/icons";
import { CredenciaisAcessoGerado } from "@/components/ui/CredenciaisAcessoGerado";
import { getSiteUrl } from "@/lib/utils/siteUrl";

const LABEL_PAPEL: Record<AcessoEmpresaRow["role"], string> = {
  admin: "Dono da empresa",
  funcionario: "Funcionário",
  cliente: "Cliente",
};

/**
 * Modal aberto ao clicar em "N acessos" na lista de Empresas licenciadas —
 * mostra todo login já gerado pra essa empresa (independente de papel) e
 * deixa o Super Admin editar o e-mail ou apagar o acesso. Busca a lista
 * sozinho (não vem por prop) porque a tabela de fora só tem a CONTAGEM
 * (`acessosPorEmpresa`, calculada em `page.tsx`) — o detalhe de cada login só
 * é buscado se alguém realmente abrir o modal.
 */
export function AcessosEmpresaModal({ empresa, onClose }: { empresa: CompanyRow; onClose: () => void }) {
  const [acessos, setAcessos] = useState<AcessoEmpresaRow[] | null>(null);
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [emailEditando, setEmailEditando] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [linkCopiadoId, setLinkCopiadoId] = useState<string | null>(null);

  const [confirmandoSenhaId, setConfirmandoSenhaId] = useState<string | null>(null);
  const [redefinindoId, setRedefinindoId] = useState<string | null>(null);
  /**
   * A senha nova fica na tela só até o modal fechar, e só do login que acabou
   * de ser redefinido. Não é guardada em lugar nenhum — nem aqui, nem no
   * banco, que tem só o hash. Se o Super Admin fechar antes de copiar, o
   * caminho é redefinir de novo, e isso é melhor do que uma senha em claro
   * parada em algum estado.
   */
  const [senhaNova, setSenhaNova] = useState<{ id: string; email: string; senha: string } | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarAcessosEmpresa(empresa.id).then((result) => {
      if (cancelado) return;
      if (!result.ok) {
        setErroCarregar(result.error);
        return;
      }
      setAcessos(result.acessos);
    });
    return () => {
      cancelado = true;
    };
  }, [empresa.id]);

  function iniciarEdicao(acesso: AcessoEmpresaRow) {
    setErroEdicao(null);
    setEditandoId(acesso.id);
    setEmailEditando(acesso.email);
  }

  async function salvarEdicao(id: string) {
    setSalvando(true);
    setErroEdicao(null);
    const result = await atualizarEmailAcesso(id, empresa.id, emailEditando);
    setSalvando(false);
    if (!result.ok) {
      setErroEdicao(result.error);
      return;
    }
    setAcessos((atual) => atual?.map((a) => (a.id === id ? { ...a, email: emailEditando.trim().toLowerCase() } : a)) ?? atual);
    setEditandoId(null);
  }

  async function excluir(id: string) {
    setExcluindo(true);
    const result = await excluirAcessoEmpresa(id, empresa.id);
    setExcluindo(false);
    setConfirmandoExclusaoId(null);
    if (!result.ok) {
      setErroCarregar(result.error);
      return;
    }
    setAcessos((atual) => atual?.filter((a) => a.id !== id) ?? atual);
  }

  /**
   * "Reenviar acesso" — copia só o link da área de login (`/login`), igual
   * ao botão "Enviar link" da lista de Empresas (`CompaniesManager`), só que
   * aqui dentro do detalhe de CADA login específico, pra reenviar pra quem
   * já tem conta e só perdeu o link. Não inclui e-mail/senha: a senha real
   * (se a pessoa já trocou) a gente nem sabe qual é, e reenviar a provisória
   * de novo pra quem já trocou seria enganoso.
   */
  async function reenviarAcesso(id: string) {
    const loginUrl = `${getSiteUrl()}/login`;
    try {
      await navigator.clipboard.writeText(loginUrl);
      setLinkCopiadoId(id);
      setTimeout(() => setLinkCopiadoId((atual) => (atual === id ? null : atual)), 2000);
    } catch {
      // Clipboard API pode falhar (contexto não seguro, permissão negada) —
      // sem quebrar nada, só não mostra o "Copiado!".
    }
  }

  /**
   * Senha nova na conta que JÁ existe — o caminho pra quem perdeu a senha.
   *
   * Não confundir com "Gerar acesso" da lista de fora: aquele cria um login
   * novo, e usado aqui deixaria o antigo órfão, junto com tudo que aponta pro
   * id da pessoa. Aqui o id, o e-mail e o histórico continuam iguais; só a
   * senha muda, e o painel obriga a trocá-la no primeiro login.
   */
  async function redefinirSenha(id: string) {
    setConfirmandoSenhaId(null);
    setRedefinindoId(id);
    setErroCarregar(null);
    const result = await redefinirSenhaAcesso(id, empresa.id);
    setRedefinindoId(null);
    if (!result.ok) {
      setErroCarregar(result.error);
      return;
    }
    setSenhaNova({ id, email: result.email, senha: result.senhaPadrao });
    // A etiqueta "Ainda com a senha provisória" volta na hora — é o estado
    // real da conta a partir de agora.
    setAcessos((atual) => atual?.map((a) => (a.id === id ? { ...a, senha_provisoria: true } : a)) ?? atual);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-base-700 bg-base-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Acessos — {empresa.nome}</h3>
            <p className="mt-1 text-xs text-ink-muted">Todo login já gerado pra essa empresa, de qualquer papel.</p>
          </div>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label="Fechar">
            ×
          </button>
        </div>

        {erroCarregar && <p className="mb-3 text-sm text-danger">{erroCarregar}</p>}

        {acessos === null ? (
          <p className="py-6 text-center text-sm text-ink-muted">Carregando...</p>
        ) : acessos.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">Nenhum acesso gerado pra essa empresa ainda.</p>
        ) : (
          <ul className="space-y-2">
            {acessos.map((acesso) => (
              <li key={acesso.id} className="rounded-xl border border-base-800 p-3">
                {editandoId === acesso.id ? (
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={emailEditando}
                      onChange={(e) => setEmailEditando(e.target.value)}
                      placeholder="novo@email.com"
                      autoFocus
                    />
                    {erroEdicao && <p className="text-xs text-danger">{erroEdicao}</p>}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setEditandoId(null)} disabled={salvando} className="px-3 py-1.5 text-xs">
                        Cancelar
                      </Button>
                      <Button type="button" onClick={() => salvarEdicao(acesso.id)} disabled={salvando} className="px-3 py-1.5 text-xs">
                        {salvando ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink-primary">{acesso.email}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {LABEL_PAPEL[acesso.role]}
                        {acesso.full_name ? ` · ${acesso.full_name}` : ""}
                        {!acesso.active ? " · Suspenso" : ""}
                        {acesso.senha_provisoria ? " · Ainda com a senha provisória" : ""}
                      </p>
                    </div>

                    {confirmandoExclusaoId === acesso.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-secondary">Apagar esse login?</span>
                        <button
                          onClick={() => excluir(acesso.id)}
                          disabled={excluindo}
                          className="text-xs font-medium text-danger hover:underline"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusaoId(null)}
                          disabled={excluindo}
                          className="text-xs text-ink-muted hover:text-ink-primary"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        {confirmandoSenhaId === acesso.id ? (
                          <div className="flex items-center gap-2 rounded-lg border border-status-warning/40 bg-status-warning/10 px-2.5 py-1.5">
                            <span className="text-xs text-ink-secondary">Criar uma senha nova? A atual para de funcionar.</span>
                            <button
                              onClick={() => redefinirSenha(acesso.id)}
                              className="text-xs font-medium text-accent hover:underline"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmandoSenhaId(null)}
                              className="text-xs text-ink-muted hover:text-ink-primary"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmandoSenhaId(acesso.id)}
                            disabled={redefinindoId === acesso.id}
                            className="px-3 py-1.5 text-xs"
                          >
                            <IconKey className="h-3.5 w-3.5" />
                            {redefinindoId === acesso.id ? "Gerando..." : "Nova senha"}
                          </Button>
                        )}
                        <Button type="button" variant="ghost" onClick={() => reenviarAcesso(acesso.id)} className="px-3 py-1.5 text-xs">
                          {linkCopiadoId === acesso.id ? (
                            <>
                              <IconCheck className="h-3.5 w-3.5" /> Copiado!
                            </>
                          ) : (
                            <>
                              <IconClipboardList className="h-3.5 w-3.5" /> Reenviar acesso
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => iniciarEdicao(acesso)} className="px-3 py-1.5 text-xs">
                          Editar e-mail
                        </Button>
                        <Button type="button" variant="danger" onClick={() => setConfirmandoExclusaoId(acesso.id)} className="px-3 py-1.5 text-xs">
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {senhaNova?.id === acesso.id && (
                  <div className="mt-3">
                    <CredenciaisAcessoGerado
                      email={senhaNova.email}
                      senhaPadrao={senhaNova.senha}
                      titulo="Senha nova gerada"
                      ajuda="Mande por WhatsApp ou dite por telefone. O login, o histórico e tudo que a pessoa já tinha continuam iguais — só a senha mudou, e o painel vai pedir uma definitiva assim que ela entrar."
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
