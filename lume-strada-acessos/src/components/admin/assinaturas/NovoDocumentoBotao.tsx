"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconLoader } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { calcularHash, contarPaginas } from "./PaginaPdf";
import { criarDocumento, prepararEnvioPdf } from "@/app/admin/assinaturas/actions";

/** 25 MB — o mesmo teto configurado no bucket. Barrar aqui poupa o envio inteiro só para receber erro no fim. */
const LIMITE = 25 * 1024 * 1024;

/**
 * Sobe o PDF e já entra no editor.
 *
 * Três coisas acontecem antes de o arquivo sair do navegador: contamos as
 * páginas, calculamos o SHA-256 e só então enviamos. O hash é calculado AQUI,
 * sobre o arquivo original que a pessoa escolheu — não depois, no servidor,
 * sobre o que chegou. É a impressão digital do documento tal como ele era no
 * momento do envio.
 */
export function NovoDocumentoBotao() {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivo: File) {
    setErro(null);
    if (arquivo.type !== "application/pdf") {
      setErro("Por enquanto só PDF.");
      return;
    }
    if (arquivo.size > LIMITE) {
      setErro("O arquivo passa de 25 MB.");
      return;
    }

    setEnviando(true);
    try {
      const [paginas, hash] = await Promise.all([contarPaginas(arquivo), calcularHash(arquivo)]);

      const preparo = await prepararEnvioPdf(arquivo.name);
      if (!preparo.ok) {
        setErro(preparo.error);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.storage
        .from("assinaturas")
        .uploadToSignedUrl(preparo.caminho, preparo.token, arquivo, { contentType: "application/pdf" });
      if (error) {
        setErro(error.message);
        return;
      }

      const criado = await criarDocumento({
        titulo: arquivo.name.replace(/\.pdf$/i, ""),
        arquivoPath: preparo.caminho,
        arquivoNome: arquivo.name,
        paginas,
        hash,
      });
      if (!criado.ok) {
        setErro(criado.error);
        return;
      }
      router.push(`/admin/assinaturas/${criado.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui ler este PDF.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={entrada}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          e.target.value = "";
          if (arquivo) void enviar(arquivo);
        }}
      />
      <Button disabled={enviando} onClick={() => entrada.current?.click()}>
        {enviando ? <IconLoader className="h-4 w-4 animate-spin" /> : <IconPlus className="h-4 w-4" />}
        {enviando ? "Enviando..." : "Enviar PDF"}
      </Button>
      {erro && <p className="text-xs text-danger">{erro}</p>}
    </div>
  );
}
