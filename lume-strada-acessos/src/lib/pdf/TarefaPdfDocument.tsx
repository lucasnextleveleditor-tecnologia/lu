import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { fmtDataCurta } from "@/lib/utils/format";

// ============================================================================
// PDF de TEXTO REAL (mesmo motor de `OrcamentoPdfDocument.tsx`/
// `ContratoPdfDocument.tsx` — `@react-pdf/renderer`, sem Chromium/Puppeteer) —
// "ficha de produção" de UMA tarefa, pensada pro funcionário imprimir e levar
// pro set/estúdio na captação: dados básicos, datas, referências de estilo
// (como link clicável), formatos de exportação, o briefing e um checklist de
// subtarefas com caixinha em branco pra marcar à caneta.
// ============================================================================

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a", lineHeight: 1.5 },
  header: { marginBottom: 14, borderBottom: "1pt solid #cccccc", paddingBottom: 10 },
  eyebrow: { fontSize: 8, color: "#888888", textTransform: "uppercase", letterSpacing: 1 },
  titulo: { fontSize: 17, fontFamily: "Helvetica-Bold", marginTop: 3 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 12 },
  metaItem: { fontSize: 9, color: "#444444" },
  metaLabel: { color: "#999999" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, marginBottom: 2 },
  gridItem: { width: "33%", marginBottom: 8, paddingRight: 8 },
  gridLabel: { fontSize: 8, textTransform: "uppercase", color: "#999999", marginBottom: 2 },
  gridValue: { fontSize: 10.5 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 14, marginBottom: 6, color: "#666666" },
  paragraph: { fontSize: 9.5, marginBottom: 3 },
  link: { fontSize: 9.5, color: "#2563eb", marginBottom: 3, textDecoration: "none" },
  checklistRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  checkbox: { width: 10, height: 10, border: "1pt solid #666666" },
  checklistText: { fontSize: 9.5, marginLeft: 7 },
  vazio: { fontSize: 9, color: "#999999", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 7.5, color: "#aaaaaa", textAlign: "center" },
});

interface SubtarefaPdf {
  titulo: string;
  concluida: boolean;
}

export interface TarefaPdfProps {
  titulo: string;
  clienteNome: string | null;
  tipoServicoNome: string | null;
  responsavelNome: string | null;
  prioridadeLabel: string;
  statusLabel: string;
  dataCaptacao: string | null;
  dataEntregaV1: string | null;
  dataEntregaFinal: string | null;
  /** Um link por linha, como salvo em `prod_tarefas.referencias_estilo`. */
  referenciasEstilo: string | null;
  formatosExportacao: string | null;
  /** HTML produzido pelo `RichTextEditor.tsx` (`document.execCommand`). */
  briefingHtml: string | null;
  subtarefas: SubtarefaPdf[];
}

/**
 * Extrai texto legível do HTML do Briefing: descarta a formatação
 * (negrito/itálico/sublinhado não têm um equivalente que valha a pena
 * reconstruir no react-pdf pra uma ficha de referência rápida), preserva
 * quebras de parágrafo e marca item de lista com "•".
 */
function htmlParaLinhas(html: string): string[] {
  const comQuebras = html
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(p|div|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");
  const semTags = comQuebras.replace(/<[^>]+>/g, "");
  const decodificado = semTags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decodificado
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function TarefaPdfDocument({
  titulo,
  clienteNome,
  tipoServicoNome,
  responsavelNome,
  prioridadeLabel,
  statusLabel,
  dataCaptacao,
  dataEntregaV1,
  dataEntregaFinal,
  referenciasEstilo,
  formatosExportacao,
  briefingHtml,
  subtarefas,
}: TarefaPdfProps) {
  const links = referenciasEstilo ? referenciasEstilo.split("\n").filter((l) => l.trim() !== "") : [];
  const linhasBriefing = briefingHtml ? htmlParaLinhas(briefingHtml) : [];

  return (
    <Document title={titulo}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Ficha de Produção</Text>
          <Text style={styles.titulo}>{titulo}</Text>
          <View style={styles.metaRow}>
            {clienteNome && (
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>Cliente: </Text>
                {clienteNome}
              </Text>
            )}
            {tipoServicoNome && (
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>Tipo de Serviço: </Text>
                {tipoServicoNome}
              </Text>
            )}
            {responsavelNome && (
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>Responsável: </Text>
                {responsavelNome}
              </Text>
            )}
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status: </Text>
              {statusLabel}
            </Text>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Prioridade: </Text>
              {prioridadeLabel}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Data de Captação</Text>
            <Text style={styles.gridValue}>{dataCaptacao ? fmtDataCurta(dataCaptacao) : "—"}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Entrega V1 (Primeiro Corte)</Text>
            <Text style={styles.gridValue}>{dataEntregaV1 ? fmtDataCurta(dataEntregaV1) : "—"}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Entrega Final</Text>
            <Text style={styles.gridValue}>{dataEntregaFinal ? fmtDataCurta(dataEntregaFinal) : "—"}</Text>
          </View>
        </View>

        {formatosExportacao && (
          <View>
            <Text style={styles.sectionTitle}>Formatos para Exportação</Text>
            <Text style={styles.paragraph}>{formatosExportacao}</Text>
          </View>
        )}

        {links.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Referências de Estilo</Text>
            {links.map((link, idx) => (
              <Link key={idx} src={link} style={styles.link}>
                {link}
              </Link>
            ))}
          </View>
        )}

        <View>
          <Text style={styles.sectionTitle}>Briefing</Text>
          {linhasBriefing.length > 0 ? (
            linhasBriefing.map((linha, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {linha}
              </Text>
            ))
          ) : (
            <Text style={styles.vazio}>Sem briefing preenchido.</Text>
          )}
        </View>

        <View wrap={false}>
          <Text style={styles.sectionTitle}>Subtarefas</Text>
          {subtarefas.length > 0 ? (
            subtarefas.map((s, idx) => (
              <View key={idx} style={styles.checklistRow}>
                <View style={styles.checkbox} />
                <Text style={styles.checklistText}>{s.titulo}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.vazio}>Nenhuma subtarefa cadastrada.</Text>
          )}
        </View>

        <Text style={styles.footer} fixed>
          Ficha gerada eletronicamente — uso interno.
        </Text>
      </Page>
    </Document>
  );
}
