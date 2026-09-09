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
  restaurarNos,
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
    <MapaCanvas
      mapaId={dados.mapa.id}
      nosIniciais={dados.nos}
      comentariosIniciais={dados.comentarios}
      meuNome={meuNome}
      podeEditar
      podeComentar
      aoMudarPendencias={aoMudarPendencias}
      cabecalho={
        // A seta de voltar mora DENTRO do cabeçalho do canvas, colada no
        // título: uma linha inteira só para ela custava dois centímetros de
        // altura do mapa, que é o espaço que se quer para desenhar.
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/admin/mapas"
            // Sair com uma edição aberta perderia o que está no campo — daí a
            // pergunta. Fora esse caso não há o que perguntar: o mapa salva a
            // cada alteração, e um "deseja salvar?" à toa só ensinaria a
            // pessoa a clicar em OK sem ler.
            onClick={(e) => {
              if (!pendencias.current) return;
              e.preventDefault();
              if (window.confirm(t.confirmarSair)) router.push("/admin/mapas");
            }}
            aria-label={t.voltar}
            title={t.voltar}
            className="shrink-0 rounded-lg p-1.5 text-ink-muted transition hover:bg-base-800/60 hover:text-ink-secondary"
          >
            <IconChevronLeft className="h-4 w-4" />
          </Link>

          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() => {
              if (titulo !== dados.mapa.titulo) void renomearMapa(dados.mapa.id, titulo);
            }}
            placeholder={t.tituloExemplo}
            aria-label={t.tituloPagina}
            className="min-w-0 max-w-md rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-semibold tracking-tight text-ink-primary outline-none transition placeholder:font-normal placeholder:italic placeholder:text-ink-muted/45 hover:border-base-700 focus:border-accent"
          />

          <CompartilharMapa mapaId={dados.mapa.id} token={dados.mapa.token} acessoInicial={dados.mapa.acesso_publico} />
        </div>
      }
      api={{
        adicionar: (paiId, valores) => adicionarNo(dados.mapa.id, paiId, valores),
        salvar: (noId, valores) => salvarNo(dados.mapa.id, noId, valores),
        remover: (noId) => removerNo(dados.mapa.id, noId),
        reorganizar: () => reorganizarMapa(dados.mapa.id),
        restaurar: (nos) => restaurarNos(dados.mapa.id, nos as unknown as Record<string, unknown>[]),
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
  );
}
