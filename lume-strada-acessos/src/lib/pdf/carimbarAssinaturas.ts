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
 * lugares marcados, mais uma página de autenticidade no fim.
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
    pagina.drawText(texto, { x: x + 2, y: y + (altura - corpo) / 2, size: corpo, font: fonte, color: rgb(0.07, 0.07, 0.1) });
  }

  // -------------------------------------------------------------------
  // PÁGINA DE AUTENTICIDADE
  // -------------------------------------------------------------------
  // É esta página que se apresenta quando alguém contesta. Ela reúne, num
  // lugar só, o que o sistema registrou e não pode reescrever: quem assinou,
  // de onde, quando, e a impressão digital do arquivo original.
  const folha = pdf.addPage([595.28, 841.89]); // A4 retrato
  const M = 48;
  let y = 841.89 - M;

  const escrever = (texto: string, opcoes: { corpo?: number; negrito?: boolean; cor?: [number, number, number]; recuo?: number } = {}) => {
    const corpo = opcoes.corpo ?? 9;
    y -= corpo + 4;
    folha.drawText(texto, {
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
      end: { x: 595.28 - M, y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.84),
    });
  };

  escrever("MANIFESTO DE ASSINATURAS", { corpo: 14, negrito: true });
  escrever(input.nomeApp, { corpo: 9, cor: [0.45, 0.45, 0.5] });
  linha();

  escrever("Documento", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });
  escrever(input.documento.titulo || input.documento.arquivo_nome, { corpo: 11, negrito: true });
  escrever(`Arquivo: ${input.documento.arquivo_nome}`, { corpo: 8, cor: [0.35, 0.35, 0.4] });
  escrever(`Enviado em: ${dataHora(input.documento.enviado_em)}`, { corpo: 8, cor: [0.35, 0.35, 0.4] });
  escrever(`Concluído em: ${dataHora(input.documento.concluido_em)}`, { corpo: 8, cor: [0.35, 0.35, 0.4] });

  if (input.documento.hash_original) {
    y -= 6;
    escrever("Impressão digital do arquivo original (SHA-256)", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });
    // Quebrado em duas linhas: 64 caracteres em corpo 8 não cabem na largura
    // útil da folha, e um hash cortado não serve para conferir nada.
    escrever(input.documento.hash_original.slice(0, 32), { corpo: 8 });
    escrever(input.documento.hash_original.slice(32), { corpo: 8 });
  }

  linha();
  escrever("Signatários", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });

  for (const s of input.signatarios) {
    const papel = PAPEIS_SIGNATARIO[papelDe(s.papel)];
    y -= 6;
    escrever(s.nome_informado || s.nome || s.email || "—", { corpo: 10, negrito: true });
    // O papel vem logo abaixo do nome, e não no fim do bloco: quem lê o
    // manifesto para conferir uma assinatura precisa saber, na mesma
    // olhada, se aquela pessoa se obrigou ou apenas testemunhou.
    escrever(`Papel: ${papel.rotulo}`, { corpo: 8, recuo: 8, negrito: true, cor: [0.25, 0.25, 0.3] });
    escrever(`E-mail: ${s.email || "—"}`, { corpo: 8, recuo: 8, cor: [0.35, 0.35, 0.4] });
    if (s.cpf_informado) escrever(`CPF informado: ${s.cpf_informado}`, { corpo: 8, recuo: 8, cor: [0.35, 0.35, 0.4] });
    escrever(
      s.status === "assinado"
        ? `${papel.feito.charAt(0).toUpperCase()}${papel.feito.slice(1)} em: ${dataHora(s.assinado_em)}`
        : `Situação: ${s.status}`,
      { corpo: 8, recuo: 8, cor: [0.35, 0.35, 0.4] }
    );
    if (s.visualizado_em) escrever(`Abriu em: ${dataHora(s.visualizado_em)}`, { corpo: 8, recuo: 8, cor: [0.35, 0.35, 0.4] });
    escrever(`Endereço de origem (IP): ${s.ip ?? "—"}`, { corpo: 8, recuo: 8, cor: [0.35, 0.35, 0.4] });
    escrever(`Navegador: ${navegadorCurto(s.user_agent)}`, { corpo: 7, recuo: 8, cor: [0.45, 0.45, 0.5] });
  }

  linha();
  escrever("Registro de acontecimentos", { corpo: 8, negrito: true, cor: [0.45, 0.45, 0.5] });

  for (const e of input.eventos) {
    // A folha acaba: o essencial (documento, hash, signatários) já está
    // acima, e cortar a trilha é melhor do que escrever por cima do rodapé.
    if (y < M + 60) {
      escrever("(...) registro completo disponível no painel", { corpo: 7, cor: [0.5, 0.5, 0.55] });
      break;
    }
    escrever(
      `${dataHora(e.created_at)} — ${e.descricao}${e.ip ? ` (IP ${e.ip})` : ""}`,
      { corpo: 7.5, cor: [0.25, 0.25, 0.3] }
    );
  }

  folha.drawText(
    "Este manifesto acompanha o documento e registra o que o sistema apurou em cada assinatura.",
    { x: M, y: M - 10, size: 7, font: fonte, color: rgb(0.55, 0.55, 0.6) }
  );

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
