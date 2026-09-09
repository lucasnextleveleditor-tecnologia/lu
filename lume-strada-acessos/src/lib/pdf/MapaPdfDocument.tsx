import { Document, Font, Image, Page, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import { ALTURA_IMAGEM, corDoRamo, type MapaNoRow } from "@/lib/types/mapa-mental";
import { caminhoLigacao, desenharMapa } from "@/lib/mapa-mental/layout";

/**
 * O mapa mental em PDF.
 *
 * VETORIAL, não uma foto da tela: o texto continua sendo texto (dá para
 * buscar, copiar e imprimir num plotter A0 sem serrilhar) e as curvas
 * continuam sendo curvas. É o que "alta resolução" de fato significa aqui —
 * uma imagem grande o bastante teria dezenas de megabytes e ainda assim
 * borraria ao ampliar.
 *
 * A página tem o TAMANHO DO MAPA, não A4. Um mapa é largo e raso; espremê-lo
 * numa folha retrato faria o texto ficar ilegível, e cortá-lo em várias
 * páginas destruiria justamente o que um mapa mental entrega — tudo à vista
 * de uma vez. Quem imprime ajusta na impressora; quem só abre no computador
 * vê inteiro.
 *
 * O desenho vem do MESMO `desenharMapa` que a tela usa. Duas contas
 * separadas divergiriam no primeiro ajuste, e o PDF deixaria de ser o que a
 * pessoa vê.
 */

// Sem hifenização: por padrão o react-pdf quebra "Equipamento" em
// "Equipamen-to" quando a palavra não cabe na linha. Num mapa mental, onde os
// balões são estreitos e cheios de palavra única, isso acontece o tempo todo
// e deixa a folha com cara de erro. Devolver a palavra inteira faz o texto
// preferir descer para a linha seguinte.
Font.registerHyphenationCallback((palavra) => [palavra]);

/** A fonte embutida do PDF é mais estreita que a da tela, então o texto sempre cabe na caixa calculada. */
const FONTE = "Helvetica";
const FONTE_NEGRITO = "Helvetica-Bold";
const FONTE_ITALICA = "Helvetica-Oblique";

const MARGEM = 48;

export interface MapaPdfProps {
  titulo: string;
  nomeApp: string;
  nos: MapaNoRow[];
  /** Já resolvidas para URL pública — o PDF é montado no servidor e busca cada uma. */
  imagens: Record<string, string>;
  gerarEm: string;
}

export function MapaPdfDocument({ titulo, nomeApp, nos, imagens, gerarEm }: MapaPdfProps) {
  const desenho = desenharMapa(nos, corDoRamo);
  const { minX, minY, maxX, maxY } = desenho.limites;

  const largura = Math.max(maxX - minX, 1) + MARGEM * 2;
  // O rodapé precisa de faixa própria, senão encostaria no balão de baixo.
  const altura = Math.max(maxY - minY, 1) + MARGEM * 2 + 24;

  const porId = new Map(desenho.baloes.map((b) => [b.no.id, b]));
  // Tudo é desenhado em coordenadas de tela; deslocar por aqui evita repetir
  // a soma em cada balão e em cada curva.
  const dx = -minX + MARGEM;
  const dy = -minY + MARGEM;

  return (
    <Document title={titulo || nomeApp} author={nomeApp}>
      <Page size={[largura, altura]} style={{ backgroundColor: "#FFFFFF", fontFamily: FONTE }}>
        {/* As ligações, numa camada só por baixo de todos os balões. */}
        <Svg
          width={largura}
          height={altura}
          viewBox={`${minX - MARGEM} ${minY - MARGEM} ${largura} ${altura}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {desenho.ligacoes.map((l) => {
            const pai = porId.get(l.de);
            const filho = porId.get(l.para);
            if (!pai || !filho) return null;
            return (
              <Path
                key={`${l.de}-${l.para}`}
                d={caminhoLigacao(pai, filho)}
                stroke={l.cor}
                strokeWidth={filho.profundidade <= 1 ? 2.5 : 1.75}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
          {/* Retângulo invisível fixando a área — sem ele o Svg encolhe até o
              conteúdo e as coordenadas saem do lugar. */}
          <Rect x={minX - MARGEM} y={minY - MARGEM} width={largura} height={altura} fill="none" />
        </Svg>

        {desenho.baloes.map((balao) => {
          const ehRaiz = balao.no.pai_id === null;
          const corpo = balao.no.tamanho || (ehRaiz ? 16 : 14);
          const imagem = imagens[balao.no.id];

          return (
            <View
              key={balao.no.id}
              style={{
                position: "absolute",
                left: balao.x + dx,
                top: balao.y + dy,
                width: balao.largura,
                minHeight: balao.altura,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
                // A raiz é preenchida; os ramos, contornados com o filete da
                // cor do lado que aponta para o pai — igual à tela.
                backgroundColor: ehRaiz ? "#4F7CFF" : "#FFFFFF",
                ...(ehRaiz
                  ? {}
                  : {
                      borderWidth: 1,
                      borderColor: "#D6D6DB",
                      ...(balao.lado === -1
                        ? { borderRightWidth: 3, borderRightColor: balao.cor, paddingRight: 16 }
                        : { borderLeftWidth: 3, borderLeftColor: balao.cor, paddingLeft: 16 }),
                    }),
              }}
            >
              {imagem && (
                <Image src={imagem} style={{ height: ALTURA_IMAGEM, marginBottom: 8, borderRadius: 8, objectFit: "cover" }} />
              )}

              <Text
                style={{
                  fontFamily: balao.no.italico ? FONTE_ITALICA : balao.no.negrito || ehRaiz ? FONTE_NEGRITO : FONTE,
                  fontSize: corpo,
                  lineHeight: 1.36,
                  color: ehRaiz ? "#FFFFFF" : "#18181B",
                }}
              >
                {balao.no.texto}
              </Text>

              {balao.no.link && (
                <Text style={{ fontSize: 9, marginTop: 5, color: ehRaiz ? "#DCE6FF" : balao.cor }}>
                  {balao.no.link.replace(/^https?:\/\//, "")}
                </Text>
              )}
            </View>
          );
        })}

        <Text
          fixed
          style={{ position: "absolute", left: MARGEM, bottom: 20, fontSize: 8, color: "#A1A1AA" }}
        >
          {[titulo, nomeApp, gerarEm].filter(Boolean).join("  ·  ")}
        </Text>
      </Page>
    </Document>
  );
}
