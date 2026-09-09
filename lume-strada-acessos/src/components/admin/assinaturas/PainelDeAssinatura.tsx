"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { TIPOS_CAMPO, type CampoAssinaturaRow, type AssinaturaDocumentoRow, type SignatarioRow } from "@/lib/types/assinatura";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconCheckCircle, IconDownload, IconLoader, IconLock } from "@/components/ui/icons";
import { PaginaPdf } from "./PaginaPdf";
import { assinar, recusar, registrarVisualizacao } from "@/app/assinar/actions";

/**
 * A tela de quem vai assinar.
 *
 * O documento inteiro aparece PRIMEIRO, e o formulário fica embaixo, depois
 * da última página. Não é um detalhe de layout: um botão de assinar flutuando
 * sobre um contrato que a pessoa ainda não rolou convida a assinar sem ler, e
 * é justamente a leitura que dá sentido ao ato.
 *
 * Os campos marcados pela agência aparecem destacados sobre as páginas, para
 * a pessoa ver onde a assinatura dela vai cair antes de confirmar.
 */
export function PainelDeAssinatura({
  documento,
  signatario,
  campos,
  urlArquivo,
  token,
  esperandoNome,
  nomeApp,
}: {
  documento: AssinaturaDocumentoRow;
  signatario: SignatarioRow;
  campos: CampoAssinaturaRow[];
  urlArquivo: string | null;
  token: string;
  esperandoNome: string | null;
  nomeApp: string;
}) {
  const [nome, setNome] = useState(signatario.nome_informado ?? signatario.nome ?? "");
  const [cpf, setCpf] = useState(signatario.cpf_informado ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState(signatario.status === "assinado");
  const [recusado, setRecusado] = useState(signatario.status === "recusado");
  const [largura, setLargura] = useState(720);
  const [proporcao, setProporcao] = useState(1.414);
  const padRef = useRef<AssinaturaPadRef | null>(null);

  // Marca "abriu o documento" uma vez, na abertura. É o evento que sustenta,
  // depois, que a pessoa teve o texto à frente antes de assinar.
  useEffect(() => {
    void registrarVisualizacao(token);
  }, [token]);

  const paginas = Array.from({ length: Math.max(1, documento.paginas) }, (_, i) => i);

  async function confirmar() {
    setErro(null);
    const imagem = padRef.current?.paraImagem() ?? "";
    setEnviando(true);
    const r = await assinar(token, { nome, cpf, imagem });
    setEnviando(false);
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setPronto(true);
  }

  if (pronto) {
    // A via de quem assinou fica acessível PELO PRÓPRIO LINK, e não só por
    // e-mail: quem assina sem ter conta no sistema não tem outro lugar para
    // voltar e buscar o documento depois. Enquanto faltar alguém assinar, o
    // download é o texto que ela leu; quando todos assinarem, o mesmo
    // endereço passa a entregar o arquivo carimbado.
    return (
      <Aviso
        icone={<IconCheckCircle className="h-6 w-6 text-status-good" />}
        titulo="Assinatura registrada"
        texto={`Obrigado. Sua assinatura de "${documento.titulo}" foi registrada com data, hora e endereço de origem. ${nomeApp} avisará quem enviou.`}
        acao={
          <a
            href={`/api/assinar/${token}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-base-600 px-4 py-2 text-sm font-medium text-ink-secondary transition hover:border-ink-muted hover:text-ink-primary"
          >
            <IconDownload className="h-4 w-4" />
            {documento.status === "assinado" ? "Baixar documento assinado" : "Baixar sua via"}
          </a>
        }
      />
    );
  }

  if (recusado) {
    return (
      <Aviso
        icone={<IconLock className="h-6 w-6 text-ink-muted" />}
        titulo="Documento recusado"
        texto="Registramos sua recusa e avisamos quem enviou o documento."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">{nomeApp}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink-primary">{documento.titulo}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {signatario.nome ? `${signatario.nome}, ` : ""}leia o documento abaixo e assine no fim da página.
        </p>
      </header>

      {esperandoNome && (
        <div className="mb-6 rounded-xl border border-base-700 bg-base-900/60 p-4">
          <p className="text-sm font-medium text-ink-primary">Ainda não é a sua vez</p>
          <p className="mt-1 text-xs text-ink-muted">
            Este documento é assinado em ordem. Falta {esperandoNome} assinar antes de você. Guarde este link — ele
            continuará valendo.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* O DOCUMENTO                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-base-700 bg-base-950/60 p-4 sm:p-6">
        <div className="flex w-full items-center justify-end gap-1 text-xs text-ink-secondary">
          <button type="button" className="rounded px-2 py-1 hover:text-ink-primary" onClick={() => setLargura((l) => Math.max(320, l - 120))}>
            −
          </button>
          <span className="w-14 text-center tabular-nums">{Math.round((largura / 720) * 100)}%</span>
          <button type="button" className="rounded px-2 py-1 hover:text-ink-primary" onClick={() => setLargura((l) => Math.min(1000, l + 120))}>
            +
          </button>
        </div>

        {!urlArquivo ? (
          <p className="py-12 text-sm text-ink-muted">Não consegui abrir o arquivo.</p>
        ) : (
          paginas.map((p) => (
            <div key={p} className="relative" style={{ width: largura, height: largura * proporcao }}>
              <PaginaPdf url={urlArquivo} pagina={p} largura={largura} aoMedir={p === 0 ? setProporcao : undefined} />
              {campos
                .filter((c) => c.pagina === p)
                .map((campo) => (
                  <div
                    key={campo.id}
                    className="absolute animate-pulse rounded-md border-2 border-dashed border-accent bg-accent/10"
                    style={{
                      left: `${campo.x * 100}%`,
                      top: `${campo.y * 100}%`,
                      width: `${campo.largura * 100}%`,
                      height: `${campo.altura * 100}%`,
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center truncate px-1 text-[10px] font-semibold text-accent">
                      {TIPOS_CAMPO[campo.tipo]?.rotulo ?? campo.tipo}
                    </span>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* ASSINAR                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="mt-6 rounded-2xl border border-base-700 bg-base-900/60 p-5">
        <p className="text-sm font-semibold text-ink-primary">Sua assinatura</p>
        <p className="mt-1 text-xs text-ink-muted">
          Ao assinar, ficam registrados seu nome, CPF, data e hora, endereço de origem (IP) e navegador — junto com a
          impressão digital do arquivo, que garante que este é o documento que você leu.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Nome completo</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como no documento de identidade" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
              CPF {signatario.documento ? "" : "(opcional)"}
            </label>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Desenhe sua assinatura</label>
          <AssinaturaPad ref={padRef} />
        </div>

        {erro && <p className="mt-3 text-sm text-danger">{erro}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button disabled={enviando || Boolean(esperandoNome)} onClick={() => void confirmar()}>
            {enviando ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconCheckCircle className="h-4 w-4" />}
            {enviando ? "Registrando..." : "Assinar documento"}
          </Button>
          <Button
            variant="ghost"
            disabled={enviando}
            onClick={async () => {
              const motivo = window.prompt("Se quiser, diga por que está recusando:") ?? "";
              const r = await recusar(token, motivo);
              if (r.ok) setRecusado(true);
              else setErro(r.error);
            }}
          >
            Recusar
          </Button>
        </div>
      </div>
    </div>
  );
}

function Aviso({
  icone,
  titulo,
  texto,
  acao,
}: {
  icone: React.ReactNode;
  titulo: string;
  texto: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-base-800">{icone}</span>
        <p className="text-lg font-semibold text-ink-primary">{titulo}</p>
        <p className="mt-2 text-sm text-ink-muted">{texto}</p>
        {acao && <div className="mt-5">{acao}</div>}
      </div>
    </div>
  );
}

interface AssinaturaPadRef {
  paraImagem: () => string;
}

/**
 * O quadro onde se desenha a assinatura.
 *
 * Aceita mouse e dedo pelos eventos de ponteiro — metade das assinaturas vai
 * acontecer no celular, e um quadro que só entende mouse seria inútil
 * justamente onde mais se usa.
 */
function AssinaturaPad({ ref }: { ref: React.Ref<AssinaturaPadRef> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const desenhando = useRef(false);
  const [temTraco, setTemTraco] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Resolução real do elemento vezes o pixel ratio: assinatura desenhada
    // num canvas de baixa resolução vira um rabisco serrilhado no PDF final.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const caixa = canvas.getBoundingClientRect();
    canvas.width = caixa.width * dpr;
    canvas.height = caixa.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
  }, []);

  // `useImperativeHandle` e não uma atribuição direta: o tipo de ref do
  // React é somente-leitura, e escrever nele durante o render seria efeito
  // colateral no meio da renderização.
  useImperativeHandle(
    ref,
    () => ({
      paraImagem: () => (temTraco && canvasRef.current ? canvasRef.current.toDataURL("image/png") : ""),
    }),
    [temTraco]
  );

  function ponto(e: React.PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const caixa = canvas.getBoundingClientRect();
    return { x: e.clientX - caixa.left, y: e.clientY - caixa.top };
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-40 w-full cursor-crosshair touch-none rounded-lg border border-base-700 bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = canvasRef.current?.getContext("2d");
          const p = ponto(e);
          ctx?.beginPath();
          ctx?.moveTo(p.x, p.y);
          desenhando.current = true;
        }}
        onPointerMove={(e) => {
          if (!desenhando.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          const p = ponto(e);
          ctx?.lineTo(p.x, p.y);
          ctx?.stroke();
          if (!temTraco) setTemTraco(true);
        }}
        onPointerUp={() => {
          desenhando.current = false;
        }}
        onPointerLeave={() => {
          desenhando.current = false;
        }}
      />
      <button
        type="button"
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          setTemTraco(false);
        }}
        className={cn("mt-1.5 text-[11px] text-ink-muted transition hover:text-ink-secondary", !temTraco && "opacity-50")}
      >
        Limpar e desenhar de novo
      </button>
    </div>
  );
}
