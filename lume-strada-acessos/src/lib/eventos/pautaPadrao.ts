import type { CategoriaCaptura, TipoBloco } from "@/lib/types/eventos";

/**
 * A pauta que já vem preenchida pelo tipo do bloco.
 *
 * É o "escolhe o tipo do bloco — ela nasce pronta, você só apaga" do mapa, e é
 * a diferença mais grosseira entre isto e a planilha: digitar cinquenta linhas
 * à mão contra apagar as duas que não servem.
 *
 * O que cada tipo puxa não é opinião: é o que a produtora cobra de si mesma
 * depois. Show sem plano geral do palco é material incompleto. **Ativação sem
 * a marca legível é conversa com o cliente na segunda-feira** — por isso ela é
 * a única que nasce `obrigatorio`, e o painel ao vivo trata obrigatório
 * diferente de desejável. Boom é o disparo, que dura segundos e é o que mais
 * se perde: quem piscou perdeu.
 *
 * O TÍTULO NÃO MORA AQUI, mora no dicionário. Estes itens viram LINHAS NO
 * BANCO no momento em que o bloco é criado, e ficam guardados como texto —
 * então precisam nascer no idioma de quem criou. Uma constante com o texto em
 * português criaria pauta em português dentro de um painel em espanhol, para
 * sempre.
 */

export interface ItemDePautaPadrao {
  /** Chave do título no dicionário (`eventos.pautaPadrao`). */
  chave: string;
  categoria: CategoriaCaptura;
  precisa_foto: boolean;
  precisa_video: boolean;
  obrigatorio: boolean;
}

export const PAUTA_PADRAO: Record<TipoBloco, readonly ItemDePautaPadrao[]> = {
  show: [
    { chave: "planoGeralDoPalco", categoria: "palco", precisa_foto: false, precisa_video: true, obrigatorio: false },
    { chave: "detalheDoArtista", categoria: "palco", precisa_foto: true, precisa_video: false, obrigatorio: false },
    { chave: "publicoNaVirada", categoria: "publico", precisa_foto: true, precisa_video: true, obrigatorio: false },
    { chave: "bastidorDaBanda", categoria: "bastidores", precisa_foto: true, precisa_video: false, obrigatorio: false },
  ],
  ativacao: [
    { chave: "marcaLegivel", categoria: "patrocinador", precisa_foto: true, precisa_video: false, obrigatorio: true },
    { chave: "publicoInteragindo", categoria: "patrocinador", precisa_foto: true, precisa_video: true, obrigatorio: true },
    { chave: "detalheDoProduto", categoria: "patrocinador", precisa_foto: true, precisa_video: false, obrigatorio: false },
  ],
  boom: [
    { chave: "oDisparo", categoria: "boom", precisa_foto: false, precisa_video: true, obrigatorio: true },
    { chave: "reacaoDoPublico", categoria: "publico", precisa_foto: false, precisa_video: true, obrigatorio: false },
  ],
  operacao: [
    { chave: "registroDaMontagem", categoria: "bastidores", precisa_foto: true, precisa_video: false, obrigatorio: false },
  ],
};

/**
 * A janela em que ainda dá para captar cada item.
 *
 * Para um bloco com duração, a janela é o bloco inteiro. Para um boom, que é
 * instante, a janela abre um pouco antes e fecha um pouco depois — ninguém
 * aperta o REC no segundo exato do confete, e uma janela de zero segundo
 * marcaria tudo como perdido no momento em que fosse criada.
 */
export const FOLGA_DO_BOOM_MIN = 3;
