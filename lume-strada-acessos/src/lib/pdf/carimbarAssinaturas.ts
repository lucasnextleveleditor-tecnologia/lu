import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PAPEIS_SIGNATARIO, papelDe } from "@/lib/types/assinatura";
import type {
  AssinaturaDocumentoRow,
  CampoAssinaturaRow,
  EventoAssinaturaRow,
  SignatarioRow,
} from "@/lib/types/assinatura";

/**
 * Monta o PDF final: o documento original com as assinaturas carimbadas nos
 * lugares marcados, mais a folha de comprovação no fim — que quebra em quantas folhas precisar.
 *
 * O ORIGINAL NUNCA É ALTERADO. O que sai daqui é um arquivo novo — e isso é
 * o ponto: o hash guardado no envio foi tirado do original, e é ele que cada
 * pessoa leu antes de assinar. Sobrescrever o original destruiria a própria
 * prova que o documento carrega.
 *
 * A conversão de coordenadas é o detalhe que mais engana aqui. Os campos são
 * guardados em fração da página com o Y medido DE CIMA (convenção de tela);
 * o PDF mede DE BAIXO. Sem a inversão, toda assinatura sairia espelhada na
 * vertical — perto do topo quando devia estar no rodapé.
 */

const FUSO = "America/Sao_Paulo";

function dataHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { timeZone: FUSO });
}

/**
 * Helvetica padrão só sabe escrever WinAnsi. Um caractere fora disso — um
 * nome com alfabeto não latino, um emoji colado no título — não sai errado:
 * derruba a geração do PDF inteiro. Melhor perder o caractere do que perder
 * o comprovante.
 */
const EXTRA_WINANSI =
  "\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D" +
  "\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178";

function seguro(texto: string): string {
  return Array.from(texto)
    .filter(
      (c) => (c >= "\u0020" && c <= "\u007E") || (c >= "\u00A0" && c <= "\u00FF") || EXTRA_WINANSI.includes(c)
    )
    .join("");
}

/** O navegador cru é ilegível; o que importa na trilha é o essencial dele. */
function navegadorCurto(ua: string | null): string {
  if (!ua) return "—";
  return ua.length > 90 ? `${ua.slice(0, 90)}...` : ua;
}

export async function carimbarAssinaturas(input: {
  original: ArrayBuffer;
  documento: AssinaturaDocumentoRow;
  signatarios: SignatarioRow[];
  campos: CampoAssinaturaRow[];
  eventos: EventoAssinaturaRow[];
  nomeApp: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(input.original);
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdf.embedFont(StandardFonts.HelveticaBold);
  const paginas = pdf.getPages();

  // As imagens de assinatura são embutidas UMA vez por pessoa, não uma por
  // campo: quem tem assinatura e rubrica em dez páginas geraria vinte cópias
  // do mesmo PNG dentro do arquivo.
  const imagens = new Map<string, Awaited<ReturnType<typeof pdf.embedPng>>>();
  for (const s of input.signatarios) {
    if (!s.assinatura_imagem?.startsWith("data:image/png;base64,")) continue;
    try {
      imagens.set(s.id, await pdf.embedPng(s.assinatura_imagem));
    } catch {
      // Assinatura ilegível não pode impedir o documento de existir — o
      // nome, o CPF e a data continuam sendo carimbados.
    }
  }

  const porId = new Map(input.signatarios.map((s) => [s.id, s]));

  for (const campo of input.campos) {
    const pessoa = porId.get(campo.signatario_id);
    // Só carimba quem assinou de fato. Campo de quem recusou ou ainda não
    // assinou fica em branco, como no papel.
    if (!pessoa || pessoa.status !== "assinado") continue;

    const pagina = paginas[campo.pagina];
    if (!pagina) continue;

    const { width: larguraPagina, height: alturaPagina } = pagina.getSize();
    const x = campo.x * larguraPagina;
    const largura = campo.largura * larguraPagina;
    const altura = campo.altura * alturaPagina;
    // A inversão do eixo Y: tela mede de cima, PDF mede de baixo.
    const y = alturaPagina * (1 - campo.y - campo.altura);

    if (campo.tipo === "assinatura" || campo.tipo === "rubrica") {
      const imagem = imagens.get(pessoa.id);
      if (imagem) {
        // Mantém a proporção do traço dentro da caixa marcada, centralizado —
        // esticar uma assinatura até preencher o retângulo a deformaria.
        const escala = Math.min(largura / imagem.width, altura / imagem.height);
        const l = imagem.width * escala;
        const a = imagem.height * escala;
        pagina.drawImage(imagem, { x: x + (largura - l) / 2, y: y + (altura - a) / 2, width: l, height: a });
      }
      continue;
    }

    const texto =
      campo.tipo === "nome"
        ? pessoa.nome_informado || pessoa.nome || ""
        : campo.tipo === "cpf"
          ? pessoa.cpf_informado || ""
          : dataHora(pessoa.assinado_em).split(" ")[0] || "";

    if (!texto) continue;

    // O corpo acompanha a altura da caixa, com teto: um campo alto não
    // deveria virar um texto gigante atravessando o contrato.
    const corpo = Math.min(11, Math.max(7, altura * 0.6));
    pagina.drawText(seguro(texto), { x: x + 2, y: y + (altura - corpo) / 2, size: corpo, font: fonte, color: rgb(0.07, 0.07, 0.1) });
  }

  // -------------------------------------------------------------------
  // FOLHA(S) DE COMPROVAÇÃO
  // -------------------------------------------------------------------
  // É esta parte que se apresenta quando alguém contesta: quem confirmou, em
  // que papel, em que dia e hora, de que endereço e de que lugar — mais a
  // impressão digital do arquivo original.
  //
  // Ela QUEBRA EM QUANTAS FOLHAS FOREM NECESSÁRIAS. Numa folha só, um
  // documento com quatro signatários e a trilha completa escrevia por baixo
  // da margem — ou seja, o comprovante sumia justamente na parte que mais
  // importa. Comprovante cortado não comprova nada.
  const A4: [number, number] = [595.28, 841.89];
  const M = 48;
  const PISO = M + 30; // abaixo disto começa o rodapé: nada de texto aqui

  let folha = pdf.addPage(A4);
  const folhas = [folha];
  let y = A4[1] - M;

  const escrever = (
    texto: string,
    opcoes: { corpo?: number; negrito?: boolean; cor?: [number, number, number]; recuo?: number } = {}
  ) => {
    const corpo = opcoes.corpo ?? 9;
    y -= corpo + 4;
    folha.drawText(seguro(texto), {
      x: M + (opcoes.recuo ?? 0),
      y,
      size: corpo,
      font: opcoes.negrito ? fonteNegrito : fonte,
      color: rgb(...(opcoes.cor ?? [0.1, 0.1, 0.12])),
    });
  };

  const linha = () => {
    y -= 10;
    folha.drawLine({
      start: { x: M, y },
      end: { x: A4[0] - M, y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.84),
    });
  };

  const novaFolha = () => {
    folha = pdf.addPage(A4);
    folhas.push(folha);
    y = A4[1] - M;
    escrever("COMPROVANTE DE ASSINATURAS (continuação)", { corpo: 9, negrito: true, cor: [0.45, 0.45, 0.5] });
    linha();
  };

  // Abre folha nova quando o BLOCO INTEIRO não cabe. Reservar o bloco, e não
  // linha a linha, é o que impede um signatário de sair partido ao meio —
  // nome numa folha, data e local na seguinte.
  const reservar = (altura: number) => {
    if (y - altura < PISO) novaFolha();
  };

  escrever("COMPROVANTE DE ASSINATURAS", { corpo: 14, negrito: true });
  escrever(input.nomeApp, { corpo: 9, cor: [0.45, 0.45, 0.5] });
  linha();

  escrever("Documento", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });
  escrever(input.documento.titulo || input.documento.arquivo_nome, { corpo: 11, negrito: true });
  escrever(`Arquivo: ${input.documento.arquivo_nome}`, { corpo: 8, cor: [0.35, 0.35, 0.4] });
  escrever(`Enviado em: ${dataHora(input.documento.enviado_em)}`, { corpo: 8, cor: [0.35, 0.35, 0.4] });
  escrever(`Concluído em: ${dataHora(input.documento.concluido_em)}`, { corpo: 8, cor: [0.35, 0.35, 0.4] });
  escrever(`Fuso horário dos registros: ${FUSO} (horário de Brasília)`, { corpo: 8, cor: [0.35, 0.35, 0.4] });

  if (input.documento.hash_original) {
    y -= 6;
    escrever("Impressão digital do arquivo original (SHA-256)", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });
    // Quebrado em duas linhas: 64 caracteres em corpo 8 não cabem na largura
    // útil da folha, e um hash cortado não serve para conferir nada.
    escrever(input.documento.hash_original.slice(0, 32), { corpo: 8 });
    escrever(input.documento.hash_original.slice(32), { corpo: 8 });
  }

  reservar(40);
  linha();
  escrever("Signatários", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });

  for (const s of input.signatarios) {
    const papel = PAPEIS_SIGNATARIO[papelDe(s.papel)];

    // O bloco é montado antes de ser escrito, para dar para medir se cabe.
    const bloco: { texto: string; corpo: number; negrito?: boolean; cor?: [number, number, number] }[] = [
      { texto: s.nome_informado || s.nome || s.email || "—", corpo: 10, negrito: true },
      // O papel vem logo abaixo do nome, e não no fim: quem confere uma
      // assinatura precisa saber, na mesma olhada, se a pessoa se obrigou ou
      // apenas testemunhou.
      { texto: `Papel: ${papel.rotulo}`, corpo: 8, negrito: true, cor: [0.25, 0.25, 0.3] },
      { texto: `E-mail: ${s.email || "—"}`, corpo: 8, cor: [0.35, 0.35, 0.4] },
    ];
    if (s.cpf_informado) bloco.push({ texto: `CPF informado: ${s.cpf_informado}`, corpo: 8, cor: [0.35, 0.35, 0.4] });
    bloco.push({
      texto:
        s.status === "assinado"
          ? `${papel.feito.charAt(0).toUpperCase()}${papel.feito.slice(1)} em: ${dataHora(s.assinado_em)}`
          : `Situação: ${s.status}`,
      corpo: 8,
      cor: [0.35, 0.35, 0.4],
    });
    if (s.visualizado_em) bloco.push({ texto: `Abriu o documento em: ${dataHora(s.visualizado_em)}`, corpo: 8, cor: [0.35, 0.35, 0.4] });
    // Local e IP saem na MESMA linha de propósito: o endereço é o dado duro,
    // a cidade é a leitura dele. Separados, alguém leria a cidade como se
    // fosse medida por GPS — e ela é aproximada, da operadora.
    bloco.push({
      texto: s.local_assinatura
        ? `Local (aproximado pelo IP): ${s.local_assinatura} — IP ${s.ip ?? "—"}`
        : `Endereço de origem (IP): ${s.ip ?? "—"}`,
      corpo: 8,
      cor: [0.35, 0.35, 0.4],
    });
    bloco.push({ texto: `Navegador: ${navegadorCurto(s.user_agent)}`, corpo: 7, cor: [0.45, 0.45, 0.5] });

    const alturaDoBloco = bloco.reduce((total, l) => total + l.corpo + 4, 6);
    reservar(alturaDoBloco);

    y -= 6;
    for (const l of bloco) {
      escrever(l.texto, {
        corpo: l.corpo,
        negrito: l.negrito,
        cor: l.cor,
        recuo: l === bloco[0] ? 0 : 8,
      });
    }
  }

  reservar(40);
  linha();
  escrever("Registro de acontecimentos", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });

  for (const e of input.eventos) {
    reservar(14);
    escrever(`${dataHora(e.created_at)} — ${e.descricao}${e.ip ? ` (IP ${e.ip})` : ""}`, {
      corpo: 7.5,
      cor: [0.25, 0.25, 0.3],
    });
  }

  // O rodapé é o mesmo em todas as folhas do comprovante, com a contagem —
  // quem recebe o PDF consegue ver na hora se recebeu o comprovante inteiro.
  folhas.forEach((f, i) => {
    f.drawText(
      seguro(
        `Comprovante gerado por ${input.nomeApp} — folha ${i + 1} de ${folhas.length}. Registra o que o sistema apurou em cada confirmação.`
      ),
      { x: M, y: M - 12, size: 7, font: fonte, color: rgb(0.55, 0.55, 0.6) }
    );
  });

  return pdf.save();
}

/** SHA-256 do arquivo final — a impressão digital do que foi entregue assinado. */
export async function hashDeBytes(bytes: Uint8Array): Promise<string> {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
