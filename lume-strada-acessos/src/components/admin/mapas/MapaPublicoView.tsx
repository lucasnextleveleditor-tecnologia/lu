"use client";

import type { AcessoPublicoMapa, MapaCompleto } from "@/lib/types/mapa-mental";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MapaCanvas } from "./MapaCanvas";
import {
  adicionarNoPublico,
  comentarPublico,
  removerNoPublico,
  reorganizarMapaPublico,
  salvarNoPublico,
} from "@/app/mapa/actions";

/**
 * O mesmo canvas do painel, servido a quem chegou pelo link.
 *
 * Nada aqui decide permissão — o nível vem do servidor, que leu o mapa pelo
 * token, e as ações públicas conferem de novo antes de gravar. Esconder um
 * botão é conforto visual, nunca segurança: quem quiser chamar a ação
 * direto vai esbarrar na mesma checagem no servidor.
 */
export function MapaPublicoView({
  dados,
  token,
  acesso,
  nomeApp,
}: {
  dados: MapaCompleto;
  token: string;
  acesso: AcessoPublicoMapa;
  nomeApp: string;
}) {
  const { dict } = useLocale();
  const t = dict.mapaMental;

  const podeEditar = acesso === "editar";
  const podeComentar = acesso === "comentar" || acesso === "editar";
  const aviso = podeEditar ? t.podeEditarAviso : podeComentar ? t.podeComentarAviso : t.somenteLeitura;

  return (
    <MapaCanvas
      mapaId={dados.mapa.id}
      nosIniciais={dados.nos}
      comentariosIniciais={dados.comentarios}
      meuNome=""
      podeEditar={podeEditar}
      podeComentar={podeComentar}
      cabecalho={
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-ink-primary">{dados.mapa.titulo || t.semTitulo}</p>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            {nomeApp} · {aviso}
          </p>
        </div>
      }
      api={{
        adicionar: (paiId, valores) => adicionarNoPublico(token, paiId, valores),
        salvar: (noId, valores) => salvarNoPublico(token, noId, valores),
        remover: (noId) => removerNoPublico(token, noId),
        reorganizar: () => reorganizarMapaPublico(token),
        comentar: (noId, autor, texto) => comentarPublico(token, noId, autor, texto),
      }}
    />
  );
}
