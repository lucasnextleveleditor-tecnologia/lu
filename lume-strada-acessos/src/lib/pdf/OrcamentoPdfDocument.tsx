import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { fmtBRL, fmtDataCurta } from "@/lib/utils/format";
import type { DadosInstitucionaisOrcamento } from "@/lib/types/orcamentos";

// ============================================================================
// PDF de TEXTO REAL (não é print-to-image) — mesmo approach de
// `ContratoPdfDocument.tsx` (`@react-pdf/renderer`, fontes vetoriais, texto
// selecionável/pesquisável, roda 100% em JS puro no Node runtime, sem
// Chromium/Puppeteer). Substitui a antiga captura de tela
// (`exportarElementoComoPDF`, `src/lib/utils/export.ts`) como o "Baixar PDF"
// principal do Orçamento — agora com DUAS páginas: uma capa institucional
// (marca, apresentação, portfólio) seguida da página de proposta
// (itens/valores/condições), cada bloco condicional ao dado existir.
//
// Fonte Helvetica padrão do PDF (WinAnsiEncoding) já cobre acentuação do
// português sem precisar registrar/baixar fonte nenhuma — mesmo precedente
// de `ContratoPdfDocument.tsx`.
// ============================================================================

const styles = StyleSheet.create({
  // Capa
  capaPage: { padding: 0, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  banner: { width: "100%", height: 140, objectFit: "cover" },
  rodape: { width: "100%", height: 90, objectFit: "cover", borderRadius: 3, marginTop: 20 },
  encerramento: { marginTop: 18, padding: 16, backgroundColor: "#f7f6f3", borderRadius: 4, textAlign: "center" },
  encerramentoTexto: { fontSize: 10, fontStyle: "italic", lineHeight: 1.6, color: "#444444" },
  capaConteudo: { padding: 48, paddingTop: 24 },
  logo: { width: 72, height: 72, objectFit: "contain", marginBottom: 12 },
  nomeMarca: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  textoInstitucional: { marginTop: 12, fontSize: 10.5, lineHeight: 1.6, color: "#333333" },
  clientesTitulo: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 20, marginBottom: 8, color: "#666666" },
  clienteLinha: { fontSize: 9.5, color: "#333333", marginBottom: 3 },
  portfolioTitulo: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 20, marginBottom: 8, color: "#666666" },
  portfolioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  portfolioItem: { width: 100, height: 75, objectFit: "cover", borderRadius: 2 },
  capaRodape: { position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 8, color: "#999999" },

  // Proposta
  page: { padding: 48, paddingBottom: 64, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  header: { marginBottom: 16, borderBottom: "1pt solid #cccccc", paddingBottom: 12 },
  empresa: { fontSize: 9, color: "#666666" },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 4 },
  cliente: { marginTop: 4, fontSize: 10 },
  clienteDetalhe: { fontSize: 8.5, color: "#888888" },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 14, marginBottom: 6, color: "#666666" },
  paragrafo: { fontSize: 9.5, lineHeight: 1.6, color: "#333333" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "0.5pt solid #eeeeee" },
  itemNome: { flex: 1, paddingRight: 12 },
  itemDescricao: { fontSize: 8, color: "#888888", marginTop: 1 },
  itemOpcionalTag: { fontSize: 7, color: "#1f5c37", textTransform: "uppercase" },
  itemValor: { width: 90, textAlign: "right" },
  totaisBox: { marginTop: 10, alignSelf: "flex-end", width: 220 },
  totalLinha: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLinhaLabel: { fontSize: 9, color: "#666666" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 6, borderTop: "1pt solid #333333" },
  totalLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 8, color: "#999999", textAlign: "center" },
});

export interface OrcamentoPdfItem {
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
}

export interface OrcamentoPdfPortfolioItem {
  url: string;
  titulo: string;
}

export interface OrcamentoPdfProps {
  institucional: DadosInstitucionaisOrcamento;
  titulo: string;
  nomeDestinatario: string;
  clienteNome: string | null;
  emailDestinatario: string | null;
  whatsappDestinatario: string | null;
  textoProposta: string | null;
  objetivos: string | null;
  itensObrigatorios: OrcamentoPdfItem[];
  itensOpcionaisSelecionados: OrcamentoPdfItem[];
  subtotal: number;
  desconto: number;
  total: number;
  condicoesPagamento: string | null;
  /** Data ISO (yyyy-mm-dd) — já formatada com `fmtDataCurta` internamente. Null = sem validade definida. */
  dataExpiracao: string | null;
  observacoes: string | null;
  /** Só imagens (vídeo não embute em PDF) — já limitado a 9 itens por quem monta as props. */
  portfolio: OrcamentoPdfPortfolioItem[];
}

export function OrcamentoPdfDocument({
  institucional,
  titulo,
  nomeDestinatario,
  clienteNome,
  emailDestinatario,
  whatsappDestinatario,
  textoProposta,
  objetivos,
  itensObrigatorios,
  itensOpcionaisSelecionados,
  subtotal,
  desconto,
  total,
  condicoesPagamento,
  dataExpiracao,
  observacoes,
  portfolio,
}: OrcamentoPdfProps) {
  const temRodapeJuridico = !!(institucional.nomeLegal || institucional.cpfCnpj || institucional.endereco);

  return (
    <Document title={titulo} author={institucional.nomeMarca}>
      {/* Página 1 — Capa institucional */}
      <Page size="A4" style={styles.capaPage}>
        {institucional.bannerUrl && <Image src={institucional.bannerUrl} style={styles.banner} />}

        <View style={styles.capaConteudo}>
          {institucional.logoUrl && <Image src={institucional.logoUrl} style={styles.logo} />}
          <Text style={styles.nomeMarca}>{institucional.nomeMarca}</Text>

          {institucional.textoInstitucional && <Text style={styles.textoInstitucional}>{institucional.textoInstitucional}</Text>}

          {institucional.clientesAtendidos.length > 0 && (
            <View>
              <Text style={styles.clientesTitulo}>Empresas que já atendemos</Text>
              {institucional.clientesAtendidos.map((nome, idx) => (
                <Text key={idx} style={styles.clienteLinha}>
                  • {nome}
                </Text>
              ))}
            </View>
          )}

          {portfolio.length > 0 && (
            <View>
              <Text style={styles.portfolioTitulo}>Nossos trabalhos</Text>
              <View style={styles.portfolioGrid}>
                {portfolio.map((item, idx) => (
                  <Image key={idx} src={item.url} style={styles.portfolioItem} />
                ))}
              </View>
            </View>
          )}

          {institucional.textoEncerramento && (
            <View style={styles.encerramento}>
              <Text style={styles.encerramentoTexto}>{institucional.textoEncerramento}</Text>
            </View>
          )}

          {institucional.rodapeUrl && <Image src={institucional.rodapeUrl} style={styles.rodape} />}
        </View>

        {temRodapeJuridico && (
          <Text style={styles.capaRodape} fixed>
            {[institucional.nomeLegal, institucional.cpfCnpj, institucional.endereco].filter(Boolean).join(" — ")}
          </Text>
        )}
      </Page>

      {/* Página 2 (+ quebra automática) — Proposta/Orçamento */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.empresa}>{institucional.nomeMarca}</Text>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.cliente}>
            {nomeDestinatario}
            {clienteNome && clienteNome !== nomeDestinatario ? ` · ${clienteNome}` : ""}
          </Text>
          {(emailDestinatario || whatsappDestinatario) && (
            <Text style={styles.clienteDetalhe}>{[emailDestinatario, whatsappDestinatario].filter(Boolean).join(" · ")}</Text>
          )}
        </View>

        {textoProposta && (
          <View>
            <Text style={styles.sectionTitle}>Proposta de trabalho</Text>
            <Text style={styles.paragrafo}>{textoProposta}</Text>
          </View>
        )}

        {objetivos && (
          <View>
            <Text style={styles.sectionTitle}>Objetivos</Text>
            <Text style={styles.paragrafo}>{objetivos}</Text>
          </View>
        )}

        {itensObrigatorios.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Itens Inclusos</Text>
            {itensObrigatorios.map((item, idx) => (
              <View key={idx} style={styles.itemRow} wrap={false}>
                <View style={styles.itemNome}>
                  <Text>
                    {item.quantidade > 1 ? `${item.quantidade}x ` : ""}
                    {item.nome}
                  </Text>
                  {item.descricao && <Text style={styles.itemDescricao}>{item.descricao}</Text>}
                </View>
                <Text style={styles.itemValor}>{fmtBRL(item.quantidade * item.valorUnitario)}</Text>
              </View>
            ))}
          </View>
        )}

        {itensOpcionaisSelecionados.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Itens Opcionais Incluídos</Text>
            {itensOpcionaisSelecionados.map((item, idx) => (
              <View key={idx} style={styles.itemRow} wrap={false}>
                <View style={styles.itemNome}>
                  <Text>
                    {item.quantidade > 1 ? `${item.quantidade}x ` : ""}
                    {item.nome}
                    <Text style={styles.itemOpcionalTag}> (opcional incluído)</Text>
                  </Text>
                  {item.descricao && <Text style={styles.itemDescricao}>{item.descricao}</Text>}
                </View>
                <Text style={styles.itemValor}>{fmtBRL(item.quantidade * item.valorUnitario)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.totaisBox}>
          <View style={styles.totalLinha}>
            <Text style={styles.totalLinhaLabel}>Subtotal</Text>
            <Text style={styles.totalLinhaLabel}>{fmtBRL(subtotal)}</Text>
          </View>
          {desconto > 0 && (
            <View style={styles.totalLinha}>
              <Text style={styles.totalLinhaLabel}>Desconto</Text>
              <Text style={styles.totalLinhaLabel}>−{fmtBRL(desconto)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalLabel}>{fmtBRL(total)}</Text>
          </View>
        </View>

        {condicoesPagamento && (
          <View>
            <Text style={styles.sectionTitle}>Condições de Pagamento</Text>
            <Text style={styles.paragrafo}>{condicoesPagamento}</Text>
          </View>
        )}

        {dataExpiracao && (
          <View>
            <Text style={styles.sectionTitle}>Validade</Text>
            <Text style={styles.paragrafo}>Válido até {fmtDataCurta(dataExpiracao)}</Text>
          </View>
        )}

        {observacoes && (
          <View>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.paragrafo}>{observacoes}</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          {institucional.nomeMarca} — documento gerado eletronicamente.
        </Text>
      </Page>
    </Document>
  );
}
