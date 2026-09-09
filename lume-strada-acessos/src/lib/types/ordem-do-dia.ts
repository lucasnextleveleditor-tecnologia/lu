export interface OrdemDoDiaRow {
  id: string;
  company_id: string;
  projeto: string;
  cliente_id: string | null;
  tarefa_id: string | null;
  /** Gravacao, Ensaio fotografico, Dia de conteudo, Edicao... texto livre. */
  tipo: string;
  arquivado: boolean;
  compartilhado: boolean;
  token: string;
  data: string | null;
  diaria_numero: number;
  diaria_total: number;
  crew_call: string | null;
  wrap: string | null;
  observacoes: string;
  clima_resumo: string | null;
  clima_max: number | null;
  clima_min: number | null;
  clima_chuva_mm: number | null;
  nascer_do_sol: string | null;
  por_do_sol: string | null;
  clima_atualizado_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocacaoRow {
  id: string;
  ordem_id: string;
  ordem: number;
  nome: string;
  endereco: string;
  notas: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CronogramaRow {
  id: string;
  ordem_id: string;
  ordem: number;
  hora: string | null;
  atividade: string;
  local: string;
}

export interface EquipeOrdemRow {
  id: string;
  ordem_id: string;
  ordem: number;
  membro_id: string | null;
  funcao: string;
  nome: string;
  contato: string;
  horario_chamada: string | null;
}

/**
 * Um vídeo a gravar naquele dia: o assunto e as falas.
 *
 * `formato` é texto livre ("Reels 30s", "YouTube", "Depoimento") porque a
 * lista de formatos muda mais rápido do que qualquer menu fechado.
 */
export interface RoteiroRow {
  id: string;
  ordem_id: string;
  ordem: number;
  titulo: string;
  formato: string;
  falas: string;
}

/** Tudo que a folha precisa para ser desenhada, numa viagem só ao banco. */
export interface OrdemDoDiaCompleta {
  ordem: OrdemDoDiaRow;
  locacoes: LocacaoRow[];
  cronograma: CronogramaRow[];
  equipe: EquipeOrdemRow[];
  roteiros: RoteiroRow[];
  clienteNome: string | null;
}
