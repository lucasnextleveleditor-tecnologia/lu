import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { fmtBRL } from "@/lib/utils/format";

// ============================================================================
// PDF de TEXTO REAL (não é print-to-image) — usa @react-pdf/renderer, que
// desenha o PDF diretamente (fontes vetoriais, texto selecionável/pesquisável,
// arquivo pequeno), rodando 100% em JS puro no servidor (Node runtime da
// Vercel), sem precisar de Chromium/Puppeteer. Só pra Contratos (Fase 3) —
// o "Baixar PDF" de Orçamento continua sendo a captura de tela em
// `src/lib/utils/export.ts` (screenshot vira imagem dentro do PDF), OK pra
// uma proposta comercial mas não ideal pra um documento assinado.
//
// Fonte Helvetica padrão do PDF (WinAnsiEncoding) já cobre acentuação do
// português (á, ã, ç, é, ...) sem precisar registrar/baixar fonte nenhuma.
// ============================================================================

const styles = StyleSheet.create({
  page: { padding: 48, paddingBottom: 64, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  header: { marginBottom: 16, borderBottom: "1pt solid #cccccc", paddingBottom: 12 },
  empresa: { fontSize: 9, color: "#666666" },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 4 },
  cliente: { marginTop: 4, fontSize: 10 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 14, marginBottom: 6, color: "#666666" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: "0.5pt solid #eeeeee" },
  itemNome: { flex: 1, paddingRight: 12 },
  itemDescricao: { fontSize: 8, color: "#888888", marginTop: 1 },
  itemValor: { width: 90, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTop: "1pt solid #333333" },
  totalLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  clausulas: { marginTop: 16, fontSize: 9.5, lineHeight: 1.6 },
  assinatura: { marginTop: 24, padding: 10, backgroundColor: "#f0f7f2", fontSize: 9, color: "#1f5c37" },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 8, color: "#999999", textAlign: "center" },
});

export interface ContratoPdfItem {
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorUnitario: number;
}

export interface ContratoPdfProps {
  empresaNome: string;
  titulo: string;
  nomeCliente: string;
  itens: ContratoPdfItem[];
  total: number;
  clausulas: string;
  assinatura?: { nome: string; data: string; ip: string | null } | null;
}

export function ContratoPdfDocument({ empresaNome, titulo, nomeCliente, itens, total, clausulas, assinatura }: ContratoPdfProps) {
  return (
    <Document title={titulo} author={empresaNome}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.empresa}>{empresaNome}</Text>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.cliente}>{nomeCliente}</Text>
        </View>

        {itens.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Itens</Text>
            {itens.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
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
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalLabel}>{fmtBRL(total)}</Text>
            </View>
          </View>
        )}

        <View style={styles.clausulas}>
          {clausulas.split("\n").map((linha, idx) => (
            <Text key={idx}>{linha || " "}</Text>
          ))}
        </View>

        {assinatura && (
          <View style={styles.assinatura}>
            <Text>
              Assinado eletronicamente por {assinatura.nome} em {assinatura.data}
              {assinatura.ip ? ` — IP ${assinatura.ip}` : ""}.
            </Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          {empresaNome} — documento gerado eletronicamente.
        </Text>
      </Page>
    </Document>
  );
}
