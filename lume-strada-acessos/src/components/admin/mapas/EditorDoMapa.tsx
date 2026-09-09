"use client";

import { useState } from "react";
import type { MapaCompleto } from "@/lib/types/mapa-mental";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MapaCanvas } from "./MapaCanvas";
import { CompartilharMapa } from "./CompartilharMapa";
import {
  adicionarNo,
  comentarNo,
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
  const [titulo, setTitulo] = useState(dados.mapa.titulo);

  return (
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
      api={{
        adicionar: (paiId, valores) => adicionarNo(dados.mapa.id, paiId, valores),
        salvar: (noId, valores) => salvarNo(dados.mapa.id, noId, valores),
        remover: (noId) => removerNo(dados.mapa.id, noId),
        reorganizar: () => reorganizarMapa(dados.mapa.id),
        comentar: (noId, autor, texto) => comentarNo(dados.mapa.id, noId, autor, texto),
      }}
    />
  );
}
