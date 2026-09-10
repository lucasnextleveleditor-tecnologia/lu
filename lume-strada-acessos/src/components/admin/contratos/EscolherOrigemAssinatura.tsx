"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fmtDataCurta } from "@/lib/utils/format";
import { Input } from "@/components/ui/Input";
import { prepararContratoParaAssinatura } from "@/app/admin/contratos/assinar/actions";
import {
  IconFileText,
  IconUpload,
  IconChevronRight,
  IconChevronLeft,
  IconLoader,
  IconSearch,
} from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ContratoEscolhivel {
  id: string;
  titulo: string;
  cliente: string;
  status: string;
  total: number;
  criadoEm: string;
}

/**
 * A escolha da origem, e — quando é um contrato do sistema — a escolha de
 * qual.
 *
 * A lista só aparece DEPOIS de escolher o caminho. Mostrar as duas coisas ao
 * mesmo tempo faria a tela abrir com uma lista de contratos que metade de
 * quem chega não veio buscar.
 */
export function EscolherOrigemAssinatura({ contratos }: { contratos: ContratoEscolhivel[] }) {
  const { fmtMoeda } = useLocale();
  const router = useRouter();
  const [escolhendo, setEscolhendo] = useState(false);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState<string | null>(null);
  const [pendente, start] = useTransition();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return contratos;
    return contratos.filter((c) => c.titulo.toLowerCase().includes(termo) || c.cliente.toLowerCase().includes(termo));
  }, [contratos, busca]);

  function escolher(contrato: ContratoEscolhivel) {
    setErro(null);
    setGerando(contrato.id);
    start(async () => {
      const r = await prepararContratoParaAssinatura(contrato.id);
      if (!r.ok) {
        setErro(r.error);
        setGerando(null);
        return;
      }
      // Vai direto para o editor: o passo seguinte é sempre marcar onde cada
      // um assina, e voltar para uma lista no meio do caminho só atrasaria.
      router.push(`/admin/assinaturas/${r.documentoId}`);
    });
  }

  if (!escolhendo) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setEscolhendo(true)}
          className="group flex flex-col rounded-2xl border border-base-700 bg-base-900/60 p-5 text-left transition hover:border-accent/40 hover:bg-base-900"
        >
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-base-800 text-accent transition group-hover:bg-accent/10">
            <IconFileText className="h-5 w-5" />
          </span>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            Um contrato criado aqui
            <IconChevronRight className="h-3.5 w-3.5 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            Escolha um dos seus contratos. O sistema gera o PDF dele na hora e abre o editor para você marcar onde cada
            pessoa assina.
          </p>
        </button>

        <a
          href="/admin/assinaturas"
          className="group flex flex-col rounded-2xl border border-base-700 bg-base-900/60 p-5 transition hover:border-accent/40 hover:bg-base-900"
        >
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-base-800 text-accent transition group-hover:bg-accent/10">
            <IconUpload className="h-5 w-5" />
          </span>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            Subir um PDF
            <IconChevronRight className="h-3.5 w-3.5 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            O contrato já veio pronto de fora. Suba o arquivo, marque os campos e mande por link.
          </p>
        </a>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setEscolhendo(false);
          setErro(null);
        }}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        Escolher outra origem
      </button>

      {contratos.length > 6 && (
        <div className="relative mb-3">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou cliente"
            className="pl-9"
          />
        </div>
      )}

      {erro && <p className="mb-3 text-xs text-danger">{erro}</p>}

      {contratos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-700 p-10 text-center">
          <p className="text-sm font-medium text-ink-primary">Nenhum contrato criado ainda</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
            Crie um contrato primeiro, ou volte e suba um PDF que já esteja pronto.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-base-800 overflow-hidden rounded-2xl border border-base-700 bg-base-900/60">
          {filtrados.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={pendente}
                onClick={() => escolher(c)}
                className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-base-800/50 disabled:opacity-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-primary">{c.titulo}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {c.cliente} · {fmtMoeda(c.total)} · {fmtDataCurta(c.criadoEm)}
                  </p>
                </div>
                {gerando === c.id ? (
                  <IconLoader className="h-4 w-4 shrink-0 animate-spin text-accent" />
                ) : (
                  <IconChevronRight className="h-4 w-4 shrink-0 text-ink-muted transition group-hover:text-ink-secondary" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-snug text-ink-muted">
        O PDF é congelado no momento em que você escolhe — é sobre esses bytes que o hash é tirado e é isso que cada
        pessoa vai assinar. Mexer no contrato depois não altera o que já foi para assinatura.
      </p>
    </div>
  );
}
