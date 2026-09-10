-- ============================================================================
-- Receita de produção por formato de post
-- ============================================================================
--
-- O problema: o formulário de tarefa da Produção tem muito campo — tipo de
-- serviço, formatos de exportação, data do primeiro corte, prioridade — e
-- NENHUM deles é decisão de quem escreve a pauta. Obrigar a social media a
-- preencher isso trinta vezes por mês é dar a ela o trabalho de outra pessoa.
--
-- A saída não é deixar em branco (o editor receberia uma tarefa pelada) nem
-- perguntar na hora de subir (a pergunta seria a mesma trinta vezes). É que
-- "Reels" JÁ IMPLICA tipo de serviço, formatos de exportação e quanto tempo
-- antes o primeiro corte precisa estar pronto — isso é o jeito da agência
-- trabalhar, não uma escolha post a post. Então se configura uma vez.
--
-- A regra de aplicação, que é o que mantém isso honesto: a receita só
-- preenche o que ficou EM BRANCO, nunca sobrescreve. Se a social media
-- escreveu os formatos daquele post à mão, foi porque aquele post é diferente
-- — e um padrão que apaga a exceção é pior do que nenhum padrão.

create table if not exists public.post_receitas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id() references public.companies(id) on delete cascade,

  -- Mesma lista de `prod_tarefas.post_formato`. Fechada aqui também: uma
  -- receita para um formato que não existe nunca seria aplicada, e ninguém
  -- descobriria por quê.
  formato text not null check (formato in
    ('reels', 'carrossel', 'story', 'estatico', 'video', 'texto', 'outro')),

  -- `on delete set null` e não `cascade`: apagar um tipo de serviço não pode
  -- apagar a receita inteira — o resto dela (formatos, dias do V1) continua
  -- valendo.
  tipo_servico_id uuid references public.prod_tipos_servico(id) on delete set null,

  -- Texto livre, igual à coluna que ele preenche em `prod_tarefas`. A
  -- combinação real varia demais para caber num enum ("1 Reel 9:16 até 60s +
  -- versão sem legenda"), e a tela oferece os pedaços comuns como chips.
  formatos_exportacao text,

  -- Quantos dias ANTES do post o primeiro corte precisa estar pronto, para o
  -- cliente ter tempo de aprovar. `null` = este formato não tem V1.
  dias_v1 smallint check (dias_v1 is null or dias_v1 between 0 and 90),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Uma receita por formato, por empresa. É esta linha que permite a tela
  -- fazer upsert sem nunca duplicar — duas receitas do mesmo formato
  -- obrigariam a aplicação a escolher uma delas, e isso só apareceria meses
  -- depois, quando alguém perguntasse por que o Reels virou Carrossel.
  constraint post_receitas_uma_por_formato unique (company_id, formato)
);

drop trigger if exists post_receitas_set_updated_at on public.post_receitas;
create trigger post_receitas_set_updated_at
  before update on public.post_receitas
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS — ler é da equipe, escrever é do admin
-- ============================================================================
--
-- É a primeira tabela do sistema com essa divisão, e ela é deliberada. O
-- calendário de conteúdo aplica a receita na hora de subir o post, e quem
-- sobe o post é a social media — então ela PRECISA ler. Mas a receita é uma
-- regra da agência: trocada em silêncio, ela muda como toda peça futura nasce.
-- Por isso a escrita fica com quem manda na operação.

alter table public.post_receitas enable row level security;

drop policy if exists post_receitas_staff_select on public.post_receitas;
create policy post_receitas_staff_select on public.post_receitas
  for select
  using (is_staff() and company_id = current_company_id());

drop policy if exists post_receitas_admin_write on public.post_receitas;
create policy post_receitas_admin_write on public.post_receitas
  for all
  using (is_admin() and company_id = current_company_id())
  with check (is_admin() and company_id = current_company_id());

comment on table public.post_receitas is
  'Padroes de producao por formato de post. Aplicados no "subir para producao", e so nos campos que ficaram em branco.';
comment on column public.post_receitas.dias_v1 is
  'Dias antes da data do post em que o primeiro corte deve estar pronto. Null = este formato nao tem V1.';

-- ============================================================================
-- Onde a receita é aplicada
-- ============================================================================
--
-- Em `subirParaProducao`, em `src/app/admin/planejamento/pautas.ts` — na
-- APLICAÇÃO, e não num trigger do banco.
--
-- Trigger foi considerado e descartado: ele rodaria em toda escrita de
-- `prod_tarefas`, inclusive nas que vêm do formulário de Produção, onde a
-- pessoa está justamente escolhendo os campos na mão. Um padrão que se aplica
-- sozinho no lugar onde alguém está decidindo é um padrão que apaga decisão.
--
-- A receita também NÃO é aplicada quando o post é criado, e sim quando ele
-- sobe: no momento da criação o formato costuma nem estar escolhido — a social
-- media escreve trinta ideias primeiro e classifica depois.
