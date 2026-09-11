"use client";

import { useState, type FormEvent } from "react";
import type { ClienteRow } from "@/lib/types/cadastros";
import { criarCliente, atualizarCliente } from "@/app/admin/actions";
import { PALETA_CATEGORIAS } from "@/lib/utils/financeiro";
import { substituir } from "@/lib/utils/texto";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

interface ClienteModalProps {
  cliente?: ClienteRow | null;
  onClose: () => void;
  /**
   * Chamado só na CRIAÇÃO (nunca na edição) com o cliente recém-cadastrado —
   * usado por quem abre este modal "por dentro" de outro fluxo (Produção,
   * Tráfego, ver `TarefaModal.tsx`/`ClientesTrafegoTab.tsx`) pra já
   * selecionar o cliente novo no dropdown de origem sem precisar reabrir
   * nada. O cadastro em si sempre é o mesmo, completo — não existe uma
   * versão "rápida" separada, de propósito, pra não duplicar a lógica de
   * validação/cor em dois lugares.
   */
  onCreated?: (cliente: Pick<ClienteRow, "id" | "nome" | "cor">) => void;
}

/**
 * Cadastro do cliente — estritamente cadastral.
 *
 * O endereço mora em campos separados (CEP, logradouro, número...), e não num
 * texto livre, porque é disso que o contrato e a nota fiscal precisam: a
 * qualificação das partes num contrato pede a rua separada do CEP, e ninguém
 * filtra cliente por estado dentro de um parágrafo. A linha pronta que o
 * contrato imprime (`clientes.endereco`) é COMPOSTA pelo banco a partir
 * destes campos — por isso ela não é enviada daqui.
 *
 * Contrato e documento continuam FORA deste modal: aqui é o cadastro. O
 * contrato do cliente vive na ficha dele (`ClienteDetalheModal`), onde ele
 * pode ser vinculado ou anexado.
 */
export function ClienteModal({ cliente, onClose, onCreated }: ClienteModalProps) {
  const { dict } = useLocale();
  const t = dict.cadastros;

  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [razaoSocial, setRazaoSocial] = useState(cliente?.razao_social ?? "");
  const [documento, setDocumento] = useState(cliente?.documento ?? "");
  const [inscricaoEstadual, setInscricaoEstadual] = useState(cliente?.inscricao_estadual ?? "");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState(cliente?.inscricao_municipal ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [nomeResponsavel, setNomeResponsavel] = useState(cliente?.nome_responsavel ?? "");
  const [cep, setCep] = useState(cliente?.cep ?? "");
  const [logradouro, setLogradouro] = useState(cliente?.logradouro ?? "");
  const [numero, setNumero] = useState(cliente?.numero ?? "");
  const [complemento, setComplemento] = useState(cliente?.complemento ?? "");
  const [bairro, setBairro] = useState(cliente?.bairro ?? "");
  const [cidade, setCidade] = useState(cliente?.cidade ?? "");
  const [uf, setUf] = useState(cliente?.uf ?? "");
  const [cor, setCor] = useState<string | null>(cliente?.cor ?? PALETA_CATEGORIAS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(cliente);

  /**
   * Cliente cadastrado antes dos campos separados: o endereço dele é um texto
   * livre que ninguém mais edita. Mostrar esse texto aqui é o que evita a
   * pergunta "cadê o endereço que eu tinha digitado?" — e deixa claro que
   * preencher os campos abaixo substitui a linha antiga.
   */
  const enderecoLegado =
    cliente?.endereco?.trim() && !cliente.logradouro && !cliente.cidade && !cliente.cep ? cliente.endereco.trim() : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = {
      nome,
      razaoSocial: razaoSocial || null,
      documento: documento || null,
      inscricaoEstadual: inscricaoEstadual || null,
      inscricaoMunicipal: inscricaoMunicipal || null,
      email: email || null,
      telefone: telefone || null,
      nomeResponsavel: nomeResponsavel || null,
      cep: cep || null,
      logradouro: logradouro || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      uf: uf || null,
      cor,
    };

    if (cliente) {
      const result = await atualizarCliente(cliente.id, input);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    } else {
      const result = await criarCliente(input);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onCreated?.({ id: result.id, nome: input.nome.trim(), cor: input.cor });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      {/* Rolagem no modal: com endereço em campos próprios e dados fiscais, o
          formulário passou da altura de uma tela de notebook. */}
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? t.editarCliente : t.novoCliente}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ---------------------------------------------------------------
              Identificação
              --------------------------------------------------------------- */}
          <section className="space-y-3">
            <Secao titulo={t.secaoIdentificacao} />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.nomeClienteLabel}</label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.nomeClientePlaceholder} />
              <p className="mt-1 text-[11px] text-ink-muted">{t.nomeClienteAjuda}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.razaoSocialLabel}</label>
              <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder={t.razaoSocialPlaceholder} />
              <p className="mt-1 text-[11px] text-ink-muted">{t.razaoSocialAjuda}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.documentoLabel}</label>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder={t.documentoPlaceholder} />
            </div>
          </section>

          {/* ---------------------------------------------------------------
              Contato
              --------------------------------------------------------------- */}
          <section className="space-y-3">
            <Secao titulo={t.secaoContato} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.emailContatoLabel}</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailContatoPlaceholder} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.telefoneWhatsappLabel}</label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder={t.telefonePlaceholder} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.nomeResponsavelLabel}</label>
              <Input
                value={nomeResponsavel}
                onChange={(e) => setNomeResponsavel(e.target.value)}
                placeholder={t.nomeResponsavelPlaceholder}
              />
            </div>
          </section>

          {/* ---------------------------------------------------------------
              Endereço
              --------------------------------------------------------------- */}
          <section className="space-y-3">
            <Secao titulo={t.secaoEndereco} />

            {enderecoLegado && (
              <p className="rounded-lg border border-status-warning/30 bg-status-warning/5 px-3 py-2 text-[11px] leading-relaxed text-ink-secondary">
                {substituir(t.enderecoLegadoAviso, { endereco: enderecoLegado })}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.cepLabel}</label>
                <Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" inputMode="numeric" />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.logradouroLabel}</label>
                <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Av. Paulista" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.numeroLabel}</label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="1578" />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.complementoLabel}</label>
                <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Sala 12" />
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.bairroLabel}</label>
                <Input value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </div>
              <div className="col-span-3">
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.cidadeLabel}</label>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.ufLabel}</label>
                {/* Duas letras, maiúsculas, com o check do banco por trás. O
                    `maxLength` e o upper aqui poupam a viagem até o servidor
                    só para ouvir que "sp " não passa. */}
                <Input
                  value={uf}
                  maxLength={2}
                  onChange={(e) => setUf(e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase())}
                  placeholder="SP"
                />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------
              Dados fiscais
              --------------------------------------------------------------- */}
          <section className="space-y-3">
            <Secao titulo={t.secaoFiscal} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.inscricaoEstadualLabel}</label>
                <Input value={inscricaoEstadual} onChange={(e) => setInscricaoEstadual(e.target.value)} placeholder="Isento" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.inscricaoMunicipalLabel}</label>
                <Input value={inscricaoMunicipal} onChange={(e) => setInscricaoMunicipal(e.target.value)} />
              </div>
            </div>
          </section>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{t.corEtiquetaLabel}</label>
            <p className="mb-2 text-[11px] text-ink-muted">{t.corEtiquetaAjuda}</p>
            <div className="flex flex-wrap items-center gap-2">
              {PALETA_CATEGORIAS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setCor(hex)}
                  aria-label={t.escolherCorAria.replace("{hex}", hex)}
                  className={cn("h-7 w-7 rounded-full transition", cor === hex && "ring-2 ring-ink-primary ring-offset-2 ring-offset-base-900")}
                  style={{ backgroundColor: hex }}
                />
              ))}
              {/* Cor personalizada — pra quando as 7 opções fixas não bastam (agências com muitos clientes simultâneos no Calendário). */}
              <label
                className={cn(
                  "relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-dashed border-base-500 transition",
                  cor && !(PALETA_CATEGORIAS as readonly string[]).includes(cor) && "border-solid ring-2 ring-ink-primary ring-offset-2 ring-offset-base-900"
                )}
                style={cor && !(PALETA_CATEGORIAS as readonly string[]).includes(cor) ? { backgroundColor: cor } : undefined}
                title={t.corPersonalizadaAria}
              >
                <input
                  type="color"
                  value={cor && /^#[0-9A-Fa-f]{6}$/.test(cor) ? cor : "#999999"}
                  onChange={(e) => setCor(e.target.value)}
                  aria-label={t.corPersonalizadaAria}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : t.criarCliente}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Título de seção do formulário — com quatro blocos, sem eles o modal vira uma pilha de campos. */
function Secao({ titulo }: { titulo: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{titulo}</p>
      <span className="h-px flex-1 bg-base-800" />
    </div>
  );
}
