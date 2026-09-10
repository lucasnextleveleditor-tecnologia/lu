import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

// ============================================================================
// PDF de TEXTO REAL de uma FICHA — mesmo motor de
// `TarefaPdfDocument`/`ContratoPdfDocument` (`@react-pdf/renderer`, sem
// Chromium). Texto de verdade e não foto de tela: dá pra buscar uma palavra,
// copiar o tom de voz e colar no roteiro, e o arquivo pesa uns 30 KB.
//
// Este componente NÃO SABE o que está imprimindo. Ele recebe seções e pares
// rótulo/valor prontos, e isso é de propósito: assim quem monta o conteúdo é
// a rota, que tem o dicionário na mão, e o PDF sai no idioma de quem clicou
// sem o componente precisar de uma linha de i18n.
//
// Por isso o nome deixou de ser `OnboardingPdfDocument`: o briefing do
// onboarding e o ciclo de planejamento imprimem pelo MESMO componente, e um
// nome que cita um dos dois faz o outro parecer gambiarra.
// ============================================================================

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 56, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { marginBottom: 16, borderBottom: "1pt solid #cccccc", paddingBottom: 12 },
  eyebrow: { fontSize: 8, color: "#888888", textTransform: "uppercase", letterSpacing: 1 },
  titulo: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4 },
  subtitulo: { fontSize: 9.5, color: "#666666", marginTop: 4, lineHeight: 1.4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  metaItem: { fontSize: 8.5, color: "#555555", marginRight: 18, marginBottom: 2 },
  metaLabel: { color: "#999999" },

  secaoTitulo: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#4F7CFF",
    marginTop: 16,
    marginBottom: 8,
    borderBottom: "0.5pt solid #e5e5e5",
    paddingBottom: 4,
  },
  campo: { marginBottom: 9 },
  rotulo: { fontSize: 8, textTransform: "uppercase", color: "#999999", marginBottom: 2, letterSpacing: 0.4 },
  valor: { fontSize: 10, lineHeight: 1.45 },
  link: { fontSize: 10, color: "#2563eb", textDecoration: "none" },
  chipsLinha: { flexDirection: "row", flexWrap: "wrap", marginTop: 1 },
  chip: {
    fontSize: 9,
    border: "0.5pt solid #cccccc",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginRight: 4,
    marginBottom: 3,
  },
  vazio: { fontSize: 9, color: "#aaaaaa", fontStyle: "italic" },
  rodape: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: "#aaaaaa",
    textAlign: "center",
  },
});

/**
 * Helvetica só escreve WinAnsi. Um caractere fora disso — um emoji no campo
 * de tom de voz, um alfabeto não latino num nome — não sai errado: derruba a
 * geração do PDF inteiro. E o texto aqui é digitado pelo CLIENTE, do outro
 * lado de um link público, onde emoji é regra e não exceção. Melhor perder o
 * caractere do que perder o documento.
 */
const EXTRA_WINANSI =
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ" +
  "‘’“”•–—˜™š›œžŸ";

function seguro(texto: string): string {
  return Array.from(texto)
    .filter(
      (c) =>
        (c >= " " && c <= "~") ||
        (c >= " " && c <= "ÿ") ||
        c === "\n" ||
        EXTRA_WINANSI.includes(c)
    )
    .join("");
}

export type TipoDeCampoPdf = "texto" | "link" | "lista";

export interface CampoPdf {
  rotulo: string;
  /** Já formatado pela rota (moeda, data, número). Vazio ou nulo não é impresso. */
  valor: string | null;
  /** `lista` vira etiquetas lado a lado; `link` vira link clicável. */
  tipo?: TipoDeCampoPdf;
  /** Só para `tipo: "lista"`. */
  itens?: string[];
}

export interface SecaoPdf {
  titulo: string;
  campos: CampoPdf[];
}

export interface FichaPdfProps {
  clienteNome: string;
  eyebrow: string;
  subtitulo: string;
  meta: { rotulo: string; valor: string }[];
  secoes: SecaoPdf[];
  rodape: string;
  /** Mostrado quando o briefing está inteiro em branco. */
  textoVazio: string;
}

export function FichaPdfDocument({
  clienteNome,
  eyebrow,
  subtitulo,
  meta,
  secoes,
  rodape,
  textoVazio,
}: FichaPdfProps) {
  // Seções sem nenhum campo preenchido não entram. Um briefing impresso com
  // sete títulos e nada embaixo parece documento quebrado; o que a pessoa
  // quer ver é o que existe.
  const comConteudo = secoes
    .map((s) => ({ ...s, campos: s.campos.filter(temValor) }))
    .filter((s) => s.campos.length > 0);

  return (
    <Document title={`Briefing — ${seguro(clienteNome)}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{seguro(eyebrow)}</Text>
          <Text style={styles.titulo}>{seguro(clienteNome)}</Text>
          <Text style={styles.subtitulo}>{seguro(subtitulo)}</Text>
          {meta.length > 0 && (
            <View style={styles.metaRow}>
              {meta.map((m, i) => (
                <Text key={i} style={styles.metaItem}>
                  <Text style={styles.metaLabel}>{seguro(m.rotulo)}: </Text>
                  {seguro(m.valor)}
                </Text>
              ))}
            </View>
          )}
        </View>

        {comConteudo.length === 0 && <Text style={styles.vazio}>{seguro(textoVazio)}</Text>}

        {comConteudo.map((secao, i) => (
          // `wrap={false}` no bloco do campo, e não na seção inteira: uma
          // seção longa PRECISA quebrar entre páginas, mas um rótulo órfão no
          // pé da página, com o valor na página seguinte, é ilegível.
          <View key={i}>
            <Text style={styles.secaoTitulo}>{seguro(secao.titulo)}</Text>
            {secao.campos.map((campo, j) => (
              <View key={j} style={styles.campo} wrap={false}>
                <Text style={styles.rotulo}>{seguro(campo.rotulo)}</Text>
                {campo.tipo === "lista" ? (
                  <View style={styles.chipsLinha}>
                    {(campo.itens ?? []).map((item, k) => (
                      <Text key={k} style={styles.chip}>
                        {seguro(item)}
                      </Text>
                    ))}
                  </View>
                ) : campo.tipo === "link" && campo.valor ? (
                  <Link src={campo.valor} style={styles.link}>
                    {seguro(campo.valor)}
                  </Link>
                ) : (
                  <Text style={styles.valor}>{seguro(campo.valor ?? "")}</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        <Text
          style={styles.rodape}
          fixed
          render={({ pageNumber, totalPages }) => `${seguro(rodape)} — ${pageNumber}/${totalPages}`}
        />
      </Page>
    </Document>
  );
}

function temValor(campo: CampoPdf): boolean {
  if (campo.tipo === "lista") return (campo.itens ?? []).length > 0;
  return Boolean(campo.valor && campo.valor.trim());
}
