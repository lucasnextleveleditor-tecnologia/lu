"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { VINCULOS_EQUIPE, type EquipeMembroRow } from "@/lib/types/cadastros";
import { criarMembroEquipe, atualizarMembroEquipe } from "@/app/admin/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";

interface MembroEquipeModalProps {
  membro?: EquipeMembroRow | null;
  onClose: () => void;
}

/**
 * O cadastro de quem trabalha na agência.
 *
 * Só o NOME é obrigatório. Um formulário longo com dez campos obrigatórios
 * viraria um obstáculo entre a pessoa e o trabalho — na prática se cadastra
 * o freelancer às pressas na véspera da externa e se completa o resto
 * depois. Os campos vêm agrupados por assunto, e os dois grupos que nem toda
 * agência usa (vínculo e emergência) começam recolhidos: quem precisa abre.
 */
export function MembroEquipeModal({ membro, onClose }: MembroEquipeModalProps) {
  const { dict } = useLocale();
  const t = dict.cadastros;

  const [nome, setNome] = useState(membro?.nome ?? "");
  const [cargo, setCargo] = useState(membro?.cargo ?? "");
  const [email, setEmail] = useState(membro?.email ?? "");
  const [telefone, setTelefone] = useState(membro?.telefone ?? "");
  const [documento, setDocumento] = useState(membro?.documento ?? "");
  const [nascimento, setNascimento] = useState(membro?.nascimento ?? "");
  const [cidade, setCidade] = useState(membro?.cidade ?? "");
  const [uf, setUf] = useState(membro?.uf ?? "");
  const [vinculo, setVinculo] = useState(membro?.vinculo ?? "");
  const [entrada, setEntrada] = useState(membro?.entrada ?? "");
  const [saida, setSaida] = useState(membro?.saida ?? "");
  const [valorDiaria, setValorDiaria] = useState(membro?.valor_diaria != null ? String(membro.valor_diaria) : "");
  const [chavePix, setChavePix] = useState(membro?.chave_pix ?? "");
  const [emergenciaNome, setEmergenciaNome] = useState(membro?.emergencia_nome ?? "");
  const [emergenciaTelefone, setEmergenciaTelefone] = useState(membro?.emergencia_telefone ?? "");
  const [observacoes, setObservacoes] = useState(membro?.observacoes ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editando = Boolean(membro);

  // Abrem já preenchidos quando o membro tem algo lá dentro — senão a
  // informação ficaria escondida de quem só quis conferir um dado.
  const [abreVinculo, setAbreVinculo] = useState(
    Boolean(membro?.vinculo || membro?.entrada || membro?.valor_diaria || membro?.chave_pix)
  );
  const [abreEmergencia, setAbreEmergencia] = useState(
    Boolean(membro?.emergencia_nome || membro?.emergencia_telefone || membro?.observacoes)
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const input = {
      nome,
      cargo: cargo || null,
      email: email || null,
      telefone: telefone || null,
      documento: documento || null,
      nascimento: nascimento || null,
      vinculo: vinculo || null,
      entrada: entrada || null,
      saida: saida || null,
      // Aceita "1.200,50" e "1200.50": quem digita valor no Brasil usa
      // vírgula, e recusar isso seria implicância com quem está preenchendo.
      valorDiaria: valorDiaria ? Number(valorDiaria.replace(/\./g, "").replace(",", ".")) || null : null,
      chavePix: chavePix || null,
      cidade: cidade || null,
      uf: uf || null,
      emergenciaNome: emergenciaNome || null,
      emergenciaTelefone: emergenciaTelefone || null,
      observacoes: observacoes || null,
    };

    const result = membro ? await atualizarMembroEquipe(membro.id, input) : await criarMembroEquipe(input);

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-base-700 bg-base-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{editando ? t.editarMembro : t.novoMembroTitulo}</h3>
          <button onClick={onClose} className="text-xl leading-none text-ink-muted hover:text-ink-primary" aria-label={dict.common.fechar}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Grupo titulo={t.grupoIdentificacao}>
            <Campo label={t.nomeCompletoLabel} className="col-span-2">
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.nomeFuncionarioPlaceholder} />
            </Campo>
            <Campo label={t.cargoFuncaoLabel}>
              <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder={t.cargoPlaceholder} />
            </Campo>
            <Campo label={t.documentoLabel}>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder={t.documentoPlaceholder} />
            </Campo>
            <Campo label={t.nascimentoLabel}>
              <DatePicker value={nascimento} onChange={setNascimento} clearable />
            </Campo>
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-2">
              <Campo label={t.cidadeLabel}>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder={t.cidadePlaceholder} />
              </Campo>
              <Campo label={t.ufLabel}>
                <Input value={uf} maxLength={2} onChange={(e) => setUf(e.target.value.toUpperCase())} placeholder="SP" />
              </Campo>
            </div>
          </Grupo>

          <Grupo titulo={t.grupoContato}>
            <Campo label={dict.common.email}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailFuncionarioPlaceholder} />
            </Campo>
            <Campo label={dict.common.telefone}>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder={t.telefonePlaceholder} />
            </Campo>
          </Grupo>

          <Sanfona titulo={t.grupoVinculo} aberta={abreVinculo} aoAlternar={() => setAbreVinculo((a) => !a)}>
            <Campo label={t.vinculoLabel}>
              {/* Texto livre com sugestões: nem toda agência contrata pelos
                  mesmos cinco formatos, e um menu fechado excluiria os outros. */}
              <Input
                list="vinculos-equipe"
                value={vinculo}
                onChange={(e) => setVinculo(e.target.value)}
                placeholder={t.vinculoPlaceholder}
              />
              <datalist id="vinculos-equipe">
                {VINCULOS_EQUIPE.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </Campo>
            <Campo label={t.valorDiariaLabel}>
              <Input value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value)} placeholder="800,00" inputMode="decimal" />
            </Campo>
            <Campo label={t.entradaLabel}>
              <DatePicker value={entrada} onChange={setEntrada} clearable />
            </Campo>
            <Campo label={t.saidaLabel}>
              <DatePicker value={saida} onChange={setSaida} clearable />
            </Campo>
            <Campo label={t.chavePixLabel} className="col-span-2">
              <Input value={chavePix} onChange={(e) => setChavePix(e.target.value)} placeholder={t.chavePixPlaceholder} />
            </Campo>
          </Sanfona>

          <Sanfona titulo={t.grupoEmergencia} aberta={abreEmergencia} aoAlternar={() => setAbreEmergencia((a) => !a)}>
            <Campo label={t.emergenciaNomeLabel}>
              <Input value={emergenciaNome} onChange={(e) => setEmergenciaNome(e.target.value)} placeholder={t.emergenciaNomePlaceholder} />
            </Campo>
            <Campo label={t.emergenciaTelefoneLabel}>
              <Input value={emergenciaTelefone} onChange={(e) => setEmergenciaTelefone(e.target.value)} placeholder={t.telefonePlaceholder} />
            </Campo>
            <Campo label={t.observacoesLabel} className="col-span-2">
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                placeholder={t.observacoesPlaceholder}
                className="w-full resize-y rounded-lg border border-base-700 bg-base-950 px-3 py-2 text-sm text-ink-primary outline-none transition focus:border-accent"
              />
            </Campo>
          </Sanfona>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              {dict.common.cancelar}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dict.common.salvando : editando ? dict.common.salvarAlteracoes : t.criarMembro}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted">{titulo}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

/** Grupo que começa recolhido — para o formulário não intimidar quem só quer o nome. */
function Sanfona({
  titulo,
  aberta,
  aoAlternar,
  children,
}: {
  titulo: string;
  aberta: boolean;
  aoAlternar: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-base-800">
      <button
        type="button"
        onClick={aoAlternar}
        className="flex w-full items-center justify-between px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted transition hover:text-ink-secondary"
      >
        {titulo}
        <span className="text-sm leading-none">{aberta ? "−" : "+"}</span>
      </button>
      {aberta && <div className="grid grid-cols-2 gap-3 border-t border-base-800 p-3">{children}</div>}
    </div>
  );
}

function Campo({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}
