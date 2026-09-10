import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { FormatadorMoeda } from "@/lib/types/moeda";

// ============================================================================
// PDF de TEXTO REAL da simulação da Calculadora de Margem (mesmo motor de
// `OrcamentoPdfDocument.tsx`/`TarefaPdfDocument.tsx` — `@react-pdf/renderer`).
//
// O motivo de ser texto real, e não uma foto da tela: aqui NADA pode sair
// cortado. Uma captura de tela corta o que passa da dobra, corta nome de
// serviço longo no "..." e some com as linhas que não couberam. Este
// documento pagina sozinho, o nome do item quebra em quantas linhas
// precisar, e o cabeçalho da tabela se repete quando a lista vira a página.
// ============================================================================

const CINZA = "#666666";
const CINZA_CLARO = "#999999";
const LINHA = "#dddddd";

const styles = StyleSheet.create({
  // `lineHeight` NÃO fica na página, e isso não é estilo: com entrelinha
  // herdada da página, o rodapé `fixed` com numeração dinâmica simplesmente
  // não é desenhado no PDF (react-pdf 4.9) — sem erro, some. A entrelinha
  // vai em cada texto corrido que precisa dela.
  page: { padding: 40, paddingBottom: 58, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },

  header: { marginBottom: 16, borderBottom: `1pt solid ${LINHA}`, paddingBottom: 10 },
  eyebrow: { fontSize: 8, color: CINZA_CLARO, textTransform: "uppercase", letterSpacing: 1 },
  titulo: { fontSize: 17, fontFamily: "Helvetica-Bold", marginTop: 3 },
  subtitulo: { fontSize: 9, color: CINZA, marginTop: 3, lineHeight: 1.4 },

  // O resumo é duas fileiras de duas caixas, e não quatro caixas numa fileira
  // só: em quatro, um valor de sete dígitos encosta no vizinho.
  resumoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  resumoBox: { width: "50%", paddingRight: 10, marginBottom: 10 },
  resumoCaixa: { border: `1pt solid ${LINHA}`, borderRadius: 4, padding: 10 },
  resumoLabel: { fontSize: 8, textTransform: "uppercase", color: CINZA_CLARO, letterSpacing: 0.5 },
  resumoValor: { fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 3 },
  resumoHint: { fontSize: 8, color: CINZA, marginTop: 2, lineHeight: 1.4 },

  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginTop: 16, marginBottom: 6, color: CINZA },

  tabelaHead: { flexDirection: "row", borderBottom: `1pt solid ${LINHA}`, paddingBottom: 4, marginBottom: 2 },
  th: { fontSize: 8, textTransform: "uppercase", color: CINZA_CLARO, letterSpacing: 0.5 },
  linha: { flexDirection: "row", paddingVertical: 4, borderBottom: `0.5pt solid #eeeeee`, alignItems: "flex-start" },
  // Larguras em PORCENTAGEM, e não `flexGrow`: com flex o nome longo
  // atravessava por cima das colunas de número em vez de quebrar linha.
  // Com largura fixa ele quebra em quantas linhas precisar, e nenhuma
  // informação encosta na outra.
  colNome: { width: "52%", paddingRight: 8 },
  colQtd: { width: "10%", textAlign: "right", paddingRight: 6 },
  colUnit: { width: "18%", textAlign: "right", paddingRight: 6 },
  colTotal: { width: "20%", textAlign: "right" },
  celula: { fontSize: 9.5 },
  celulaNome: { fontSize: 9.5, lineHeight: 1.4 },

  subtotalLinha: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 5 },
  subtotalLabel: { fontSize: 9, color: CINZA, marginRight: 10 },
  subtotalValor: { fontSize: 9.5, fontFamily: "Helvetica-Bold", width: "20%", textAlign: "right" },

  paramLinha: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: `0.5pt solid #eeeeee` },
  paramLabel: { fontSize: 9.5, color: "#333333", flexGrow: 1, flexShrink: 1, paddingRight: 10, lineHeight: 1.4 },
  paramValor: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },

  demoLinha: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  demoLabel: { fontSize: 9.5, flexGrow: 1, flexShrink: 1, paddingRight: 10, lineHeight: 1.4 },
  demoValor: { fontSize: 9.5 },
  demoTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
    marginTop: 4,
    borderTop: `1pt solid ${LINHA}`,
  },
  demoTotalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", flexGrow: 1, flexShrink: 1, paddingRight: 10 },
  demoTotalValor: { fontSize: 13, fontFamily: "Helvetica-Bold" },

  aviso: { marginTop: 14, border: `1pt solid ${LINHA}`, borderRadius: 4, padding: 9, fontSize: 8.5, color: CINZA, lineHeight: 1.4 },
  vazio: { fontSize: 9, color: CINZA_CLARO, fontStyle: "italic", paddingVertical: 4 },

  footer: { position: "absolute", bottom: 22, left: 40, right: 40, fontSize: 7.5, color: "#aaaaaa", textAlign: "center" },
});

export interface CalculadoraPdfItem {
  nome: string;
  quantidade: number;
  custoUnitario: number;
}

export interface CalculadoraPdfProps {
  /** Formatador na moeda da empresa — o PDF é montado no servidor, onde não existe contexto de React. */
  fmtMoeda: FormatadorMoeda;
  nomeApp: string;
  geradoEm: string;
  itensServico: CalculadoraPdfItem[];
  itensEquipamento: CalculadoraPdfItem[];
  custoServicos: number;
  custoEquipamentos: number;
  impostosAtivo: boolean;
  aliquotaImposto: number;
  custoFixoAtivo: boolean;
  custoFixoBase: number;
  custoFixoPercentual: number;
  custoFixoRateado: number;
  margemDesejada: number;
  custoOperacionalTotal: number;
  impostoValor: number;
  lucroEstimado: number;
  valorFinalDoProjeto: number;
}

/** Uma tabela de itens — mesma forma para Serviços e Equipamentos. */
function TabelaDeItens({ itens, vazio, fmtMoeda }: { itens: CalculadoraPdfItem[]; vazio: string; fmtMoeda: FormatadorMoeda }) {
  if (itens.length === 0) return <Text style={styles.vazio}>{vazio}</Text>;
  return (
    <View>
      {/* `fixed` repete o cabeçalho quando a lista vira a página — senão a
          segunda página seria uma parede de números sem dizer o que são. */}
      <View style={styles.tabelaHead} fixed>
        <Text style={[styles.th, styles.colNome]}>Item</Text>
        <Text style={[styles.th, styles.colQtd]}>Qtd</Text>
        <Text style={[styles.th, styles.colUnit]}>Custo unit.</Text>
        <Text style={[styles.th, styles.colTotal]}>Total</Text>
      </View>
      {itens.map((item, i) => (
        // `wrap={false}`: a linha inteira desce para a próxima página em vez
        // de ser partida no meio. O nome, esse sim, quebra em várias linhas —
        // nunca é cortado nem some no "...".
        <View key={`${item.nome}-${i}`} style={styles.linha} wrap={false}>
          <Text style={[styles.celulaNome, styles.colNome]}>{item.nome}</Text>
          <Text style={[styles.celula, styles.colQtd]}>{item.quantidade}</Text>
          <Text style={[styles.celula, styles.colUnit]}>{fmtMoeda(item.custoUnitario)}</Text>
          <Text style={[styles.celula, styles.colTotal]}>{fmtMoeda(item.quantidade * item.custoUnitario)}</Text>
        </View>
      ))}
    </View>
  );
}

export function CalculadoraPdfDocument(p: CalculadoraPdfProps) {
  const pct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

  return (
    <Document title="Simulação de precificação" author={p.nomeApp}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{p.nomeApp} · Simulação de precificação</Text>
          <Text style={styles.titulo}>Calculadora de Margem</Text>
          <Text style={styles.subtitulo}>Gerada em {p.geradoEm}</Text>
        </View>

        <View style={styles.resumoGrid}>
          <View style={styles.resumoBox}>
            <View style={styles.resumoCaixa}>
              <Text style={styles.resumoLabel}>Valor final do projeto</Text>
              <Text style={styles.resumoValor}>{p.fmtMoeda(p.valorFinalDoProjeto)}</Text>
              <Text style={styles.resumoHint}>Cobre custo, imposto e a margem escolhida.</Text>
            </View>
          </View>
          <View style={styles.resumoBox}>
            <View style={styles.resumoCaixa}>
              <Text style={styles.resumoLabel}>Lucro estimado</Text>
              <Text style={styles.resumoValor}>{p.fmtMoeda(p.lucroEstimado)}</Text>
              <Text style={styles.resumoHint}>Margem desejada de {pct(p.margemDesejada)}.</Text>
            </View>
          </View>
          <View style={styles.resumoBox}>
            <View style={styles.resumoCaixa}>
              <Text style={styles.resumoLabel}>Custo operacional total</Text>
              <Text style={styles.resumoValor}>{p.fmtMoeda(p.custoOperacionalTotal)}</Text>
              <Text style={styles.resumoHint}>Serviços + equipamentos + custo fixo rateado.</Text>
            </View>
          </View>
          <View style={styles.resumoBox}>
            <View style={styles.resumoCaixa}>
              <Text style={styles.resumoLabel}>Imposto estimado</Text>
              <Text style={styles.resumoValor}>{p.fmtMoeda(p.impostoValor)}</Text>
              <Text style={styles.resumoHint}>
                {p.impostosAtivo ? `Alíquota de ${pct(p.aliquotaImposto)}.` : "Impostos desligados nesta simulação."}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Serviços (mão de obra)</Text>
        <TabelaDeItens itens={p.itensServico} vazio="Nenhum serviço lançado nesta simulação." fmtMoeda={p.fmtMoeda} />
        {p.itensServico.length > 0 && (
          <View style={styles.subtotalLinha}>
            <Text style={styles.subtotalLabel}>Subtotal de serviços</Text>
            <Text style={styles.subtotalValor}>{p.fmtMoeda(p.custoServicos)}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Equipamentos</Text>
        <TabelaDeItens itens={p.itensEquipamento} vazio="Nenhum equipamento lançado nesta simulação." fmtMoeda={p.fmtMoeda} />
        {p.itensEquipamento.length > 0 && (
          <View style={styles.subtotalLinha}>
            <Text style={styles.subtotalLabel}>Subtotal de equipamentos</Text>
            <Text style={styles.subtotalValor}>{p.fmtMoeda(p.custoEquipamentos)}</Text>
          </View>
        )}

        <View wrap={false}>
          <Text style={styles.sectionTitle}>Parâmetros da simulação</Text>
          <View style={styles.paramLinha}>
            <Text style={styles.paramLabel}>Margem desejada</Text>
            <Text style={styles.paramValor}>{pct(p.margemDesejada)}</Text>
          </View>
          <View style={styles.paramLinha}>
            <Text style={styles.paramLabel}>Impostos</Text>
            <Text style={styles.paramValor}>{p.impostosAtivo ? `Alíquota de ${pct(p.aliquotaImposto)}` : "Desligados"}</Text>
          </View>
          <View style={styles.paramLinha}>
            <Text style={styles.paramLabel}>Custo fixo / fee</Text>
            <Text style={styles.paramValor}>
              {p.custoFixoAtivo ? `${pct(p.custoFixoPercentual)} de ${p.fmtMoeda(p.custoFixoBase)}/mês` : "Desligado"}
            </Text>
          </View>
          {p.custoFixoAtivo && (
            <View style={styles.paramLinha}>
              <Text style={styles.paramLabel}>Custo fixo rateado para este projeto</Text>
              <Text style={styles.paramValor}>{p.fmtMoeda(p.custoFixoRateado)}</Text>
            </View>
          )}
        </View>

        {/* O demonstrativo fecha a conta de cima para baixo: quem receber
            este PDF consegue refazer o número sem abrir o sistema. */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>Demonstrativo de cálculo</Text>
          <View style={styles.demoLinha}>
            <Text style={styles.demoLabel}>Custo de serviços</Text>
            <Text style={styles.demoValor}>{p.fmtMoeda(p.custoServicos)}</Text>
          </View>
          <View style={styles.demoLinha}>
            <Text style={styles.demoLabel}>Custo de equipamentos</Text>
            <Text style={styles.demoValor}>{p.fmtMoeda(p.custoEquipamentos)}</Text>
          </View>
          <View style={styles.demoLinha}>
            <Text style={styles.demoLabel}>Custo fixo rateado</Text>
            <Text style={styles.demoValor}>{p.fmtMoeda(p.custoFixoRateado)}</Text>
          </View>
          <View style={[styles.demoLinha, { borderTop: `0.5pt solid ${LINHA}`, paddingTop: 5, marginTop: 2 }]}>
            <Text style={[styles.demoLabel, { fontFamily: "Helvetica-Bold" }]}>Custo operacional total</Text>
            <Text style={[styles.demoValor, { fontFamily: "Helvetica-Bold" }]}>{p.fmtMoeda(p.custoOperacionalTotal)}</Text>
          </View>
          <View style={styles.demoLinha}>
            <Text style={styles.demoLabel}>+ Imposto sobre o valor final{p.impostosAtivo ? ` (${pct(p.aliquotaImposto)})` : ""}</Text>
            <Text style={styles.demoValor}>{p.fmtMoeda(p.impostoValor)}</Text>
          </View>
          <View style={styles.demoLinha}>
            <Text style={styles.demoLabel}>+ Lucro na margem de {pct(p.margemDesejada)}</Text>
            <Text style={styles.demoValor}>{p.fmtMoeda(p.lucroEstimado)}</Text>
          </View>
          <View style={styles.demoTotal}>
            <Text style={styles.demoTotalLabel}>Valor final do projeto</Text>
            <Text style={styles.demoTotalValor}>{p.fmtMoeda(p.valorFinalDoProjeto)}</Text>
          </View>
        </View>

        <View style={styles.aviso} wrap={false}>
          <Text>
            Simulação de precificação, não é uma proposta comercial. Os valores consideram os custos lançados acima e a margem
            escolhida; impostos são estimados pela alíquota informada e não substituem a apuração contábil.
          </Text>
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => `${p.nomeApp} · Simulação gerada em ${p.geradoEm} · Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
