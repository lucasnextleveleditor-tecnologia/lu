export type TipoCompromisso = "captacao" | "reuniao" | "entrega" | "pagamento";

/** Linha da tabela `public.compromissos` (ver `supabase/agenda-compromissos.sql`) — os compromissos MANUAIS da Agenda, com CRUD completo e arrastar-pra-reagendar. */
export interface Compromisso {
  id: string;
  company_id: string;
  titulo: string;
  tipo: TipoCompromisso;
  data: string; // ISO yyyy-mm-dd
  hora: string | null; // "HH:MM:SS" (formato `time` do Postgres) ou null
  cliente_nome: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type OrigemAgendaItem = "manual" | "producao" | "comercial";

/**
 * Forma ENXUTA e UNIFORME que o calendário da Agenda usa pra desenhar
 * qualquer pill, seja ela um compromisso manual (`origem: "manual"`,
 * arrastável, abre o modal de edição) ou um item auto-surfado de Produção/
 * Comercial (`origem: "producao"`/`"comercial"`, só leitura, clique navega
 * pro módulo de origem — mesmo espírito de `AgendaDoDia.tsx` no Dashboard).
 * O grid não precisa conhecer a forma original de cada fonte, só o
 * suficiente pra renderizar e decidir o comportamento de clique/drag.
 */
export interface AgendaItem {
  /** Único no board inteiro — id de verdade pra manual, prefixado por origem+id de origem pros itens auto (ver `src/app/admin/agenda/data.ts`). */
  id: string;
  origem: OrigemAgendaItem;
  tipo: TipoCompromisso;
  titulo: string;
  data: string; // ISO yyyy-mm-dd
  hora: string | null;
  clienteNome: string | null;
  /** Só definido pra `origem === "manual"` — id real em `compromissos`, usado pra abrir o modal de edição/exclusão. */
  compromissoId?: string;
  /** Só definido pra `origem !== "manual"` — pra onde o clique navega (`/admin/producao` ou `/admin/comercial`). */
  href?: string;
}

/** Payload do formulário de criação/edição (`NovoCompromissoModal.tsx`) — mesmo shape pras duas Server Actions (`criarCompromisso`/`atualizarCompromisso`). */
export interface CompromissoInput {
  titulo: string;
  tipo: TipoCompromisso;
  data: string; // ISO yyyy-mm-dd
  hora: string | null;
  clienteNome: string | null;
  notas: string | null;
}

/**
 * Forma ENXUTA de `Compromisso`, pra outros módulos exibirem (só leitura)
 * compromissos da Agenda dentro do PRÓPRIO calendário deles — hoje usada só
 * pelo Calendário de Produção (`CalendarioTarefas.tsx`), que mostra os
 * compromissos manuais de tipo `captacao`/`entrega` (os dois tipos que
 * também existem nativamente em Produção) ao lado das próprias tarefas,
 * mesmo espírito "os dois se conversam" do resto da agregação cross-módulo
 * deste app (ver `CalendarioGeral.tsx` do Dashboard). Compromissos de tipo
 * `reuniao`/`pagamento` não têm por que aparecer no calendário de Produção —
 * não fazem parte do domínio dele.
 */
export interface CompromissoResumo {
  id: string;
  titulo: string;
  tipo: TipoCompromisso;
  data: string; // ISO yyyy-mm-dd
  cliente_nome: string | null;
}
