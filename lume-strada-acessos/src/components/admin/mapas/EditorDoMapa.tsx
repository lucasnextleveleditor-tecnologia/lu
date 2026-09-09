"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MapaCompleto } from "@/lib/types/mapa-mental";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MapaCanvas } from "./MapaCanvas";
import { CompartilharMapa } from "./CompartilharMapa";
import { IconChevronLeft } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import {
  adicionarNo,
  comentarNo,
  prepararEnvioImagem,
  removerNo,
  renomearMapa,
  reorganizarMapa,
  salvarNo,
} from "@/app/admin/mapas/actions";

/**
 * O mapa dentro do painel: o canvas mais o título editável e o menu de
 * compartilhamento. Amarra as Server Actions da equipe à interface genérica
 * do canvas — que é a MESMA usada pelo link público, só com outras ações
 * atrás (ver `app/mapa/[token]/page.tsx`). Uma interface só significa que o
 * mapa se comporta igual nos dois lugares.
 */
export function EditorDoMapa({ dados, meuNome }: { dados: MapaCompleto; meuNome: string }) {
  const { dict } = useLocale();
  const t = dict.mapaMental;
  const router = useRouter();
  const [titulo, setTitulo] = useState(dados.mapa.titulo);
  // Guardado numa ref e não no estado: o valor só é lido no clique de sair,
  // e mantê-lo no estado faria a tela inteira redesenhar a cada tecla.
  const pendencias = useRef(false);
  const aoMudarPendencias = useCallback((tem: boolean) => {
    pendencias.current = tem;
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Sair com uma edição aberta perderia o que está no campo — daí a
          pergunta. Fora esse caso não há o que perguntar: o mapa salva a cada
          alteração, e um "deseja salvar?" a toa só ensinaria a pessoa a
          clicar em OK sem ler. */}
      <Link
        href="/admin/mapas"
        onClick={(e) => {
          if (!pendencias.current) return;
          e.preventDefault();
          if (window.confirm(t.confirmarSair)) router.push("/admin/mapas");
        }}
        className="mb-3 inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition hover:text-ink-secondary"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        {t.voltar}
      </Link>

      <div className="min-h-0 flex-1">
    <MapaCanvas
      mapaId={dados.mapa.id}
      nosIniciais={dados.nos}
      comentariosIniciais={dados.comentarios}
      meuNome={meuNome}
      podeEditar
      podeComentar
      cabecalho={
        <div className="flex min-w-0 items-center gap-3">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() => {
              if (titulo !== dados.mapa.titulo) void renomearMapa(dados.mapa.id, titulo);
            }}
            placeholder={t.tituloExemplo}
            aria-label={t.tituloPagina}
            className="min-w-0 max-w-md rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-semibold tracking-tight text-ink-primary outline-none transition hover:border-base-700 focus:border-accent placeholder:font-normal placeholder:italic placeholder:text-ink-muted/45"
          />
          <CompartilharMapa mapaId={dados.mapa.id} token={dados.mapa.token} acessoInicial={dados.mapa.acesso_publico} />
        </div>
      }
      aoMudarPendencias={aoMudarPendencias}
      api={{
        adicionar: (paiId, valores) => adicionarNo(dados.mapa.id, paiId, valores),
        salvar: (noId, valores) => salvarNo(dados.mapa.id, noId, valores),
        remover: (noId) => removerNo(dados.mapa.id, noId),
        reorganizar: () => reorganizarMapa(dados.mapa.id),
        comentar: (noId, autor, texto) => comentarNo(dados.mapa.id, noId, autor, texto),
        // O arquivo NÃO passa pela Server Action: ela só assina o caminho
        // (com o id da empresa vindo do servidor) e o navegador envia direto
        // para o Storage. Mesmo desenho dos anexos de Produção e Financeiro.
        enviarImagem: async (arquivo) => {
          const preparo = await prepararEnvioImagem(dados.mapa.id, arquivo.name);
          if (!preparo.ok) return preparo;

          const supabase = createClient();
          const { error } = await supabase.storage
            .from("mapas")
            .uploadToSignedUrl(preparo.caminho, preparo.token, arquivo, { contentType: arquivo.type });
          if (error) return { ok: false as const, error: error.message };

          return { ok: true as const, caminho: preparo.caminho };
        },
      }}
    />
      </div>
    </div>
  );
}
