import Link from "next/link";
import { requireEquipeOuRedirect } from "@/lib/auth/requireAdmin";
import { CompressorDeArquivos } from "@/components/admin/ferramentas/CompressorDeArquivos";
import { IconMinimize, IconChevronLeft } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

/**
 * Compressor de arquivos.
 *
 * A página é só a moldura: quem faz o trabalho é o componente de cliente, e
 * ele faz TUDO no navegador de quem está usando (ver
 * `src/lib/ferramentas/comprimir/`). Não há action, não há upload, não há
 * bucket — o arquivo nunca chega ao servidor, o que resolve de uma vez o
 * limite de corpo de requisição da Vercel, o custo de armazenamento e a
 * privacidade de material de cliente que ainda não foi divulgado.
 *
 * `chave: null` como o Mapa Mental: é ferramenta de quem trabalha na
 * empresa, não de um módulo específico — quem entra no painel pode usar.
 */
export default async function ComprimirArquivosPage() {
  await requireEquipeOuRedirect();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/ferramentas"
        className="mb-5 inline-flex items-center gap-1 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        Ferramentas
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-accent">
          <IconMinimize className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Comprimir Arquivo</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Escolha o arquivo e o tamanho que ele precisa ter. A conversão acontece no seu próprio navegador — nada
            é enviado para a internet e nada ocupa o armazenamento da sua conta.
          </p>
        </div>
      </div>

      <CompressorDeArquivos />

      <div className="mt-8 rounded-2xl border border-base-700 bg-base-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Quando vale a pena</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-secondary">
          <li>
            <span className="text-ink-primary">Vídeo</span> — comprimir serve para mandar por e-mail ou WhatsApp. Para
            entregar ao cliente dentro do sistema, publicar no YouTube ou no Drive e colar o link continua sendo
            melhor: não perde qualidade e não gasta armazenamento nenhum.
          </li>
          <li>
            <span className="text-ink-primary">PDF escaneado</span> — é o caso onde mais se ganha. Um contrato
            digitalizado de 50 MB costuma sair com 5 a 10 MB sem atrapalhar a leitura.
          </li>
          <li>
            <span className="text-ink-primary">PDF gerado por computador</span> — proposta, contrato e relatório feitos
            aqui no sistema já são pequenos. Comprimir ganha pouco e pode custar a busca dentro do documento.
          </li>
          <li>
            <span className="text-ink-primary">Imagem</span> — foto de câmera ou print de 10 MB vira menos de 1 MB sem
            diferença visível na tela.
          </li>
        </ul>
      </div>
    </div>
  );
}
