-- ============================================================================
-- Financeiro — Caixinhas & Investimentos (Vaults)
-- ============================================================================
-- Rode DEPOIS de `financeiro.sql` + `multitenant-migration.sql` (precisa de
-- `public.fin_contexto`, `public.fin_contas`, `public.fin_transacoes`,
-- `public.is_staff()`, `public.current_company_id()` e `public.set_updated_at()`
-- já existindo). Idempotente — seguro rodar de novo.
--
-- NOMEAÇÃO: o pedido original usava `financial_vaults`/`vault_transactions`
-- — renomeado pra `fin_caixinhas`/`fin_caixinhas_transacoes` pra seguir o
-- prefixo `fin_` já usado por TODA tabela do módulo (`fin_contas`,
-- `fin_cartoes`, `fin_categorias`, `fin_transacoes`, `fin_faturas`) — sem
-- isso, `fin_caixinhas` ficaria com um nome incoerente com o resto do
-- schema e quebraria a convenção que o resto do time já segue de cabeça.
--
-- MODELO — 2 tabelas, saldo sempre CALCULADO (mesma filosofia de
-- `fin_contas_saldo`/`fin_cartoes_limite`: nunca uma coluna incrementada
-- manualmente):
--   1) `fin_caixinhas` — o CADASTRO da caixinha (nome, objetivo, meta, taxa
--      de rendimento, nível de risco/liquidez). Editável livremente pelo
--      admin, igual `fin_contas`/`fin_cartoes` — SEM regra de negócio
--      especial, por isso as Server Actions de CRUD fazem INSERT/UPDATE
--      direto (RLS já protege), sem precisar de função no banco.
--   2) `fin_caixinhas_transacoes` — o LEDGER imutável da caixinha (aporte /
--      resgate / rendimento). Toda escrita aqui passa por uma das 3 funções
--      SECURITY DEFINER abaixo (nunca INSERT direto do client) — é o que
--      garante que:
--        a) aporte/resgate sempre nascem ATRELADOS a um lançamento espelho
--           em `fin_transacoes` (debitando/creditando a `fin_conta`
--           escolhida), as duas inserções acontecendo ATOMICAMENTE dentro
--           da mesma função (mesmo padrão de `pagar_fatura()`) — nunca dá
--           pra ter uma caixinha creditada sem a conta ter sido debitada,
--           ou vice-versa;
--        b) resgate nunca deixa a caixinha com saldo negativo;
--        c) rendimento é o único tipo que NÃO mexe em `fin_transacoes` —
--           entra direto no saldo da caixinha, por definição (juro
--           creditado pela instituição financeira, não uma movimentação
--           entre contas da agência).
--
-- O saldo da CONTA de origem/destino (`fin_contas_saldo`) já enxerga esses
-- aportes/resgates automaticamente, porque eles nascem como uma despesa/
-- receita normal em `fin_transacoes` — nenhuma mudança precisa nessa view.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CADASTRO da caixinha.
-- ----------------------------------------------------------------------------
create table if not exists public.fin_caixinhas (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default public.current_company_id() references public.companies(id) on delete cascade,

  nome text not null,
  objetivo text, -- descrição livre opcional ("Reserva de emergência", "13º da equipe"...)
  valor_meta numeric(12,2) check (valor_meta is null or valor_meta > 0), -- meta opcional
  data_alvo date, -- data alvo opcional

  -- Taxa de rendimento usada só pra PROJETAR (ver `references/palette.md`/
  -- gráfico no front) — nunca aplicada automaticamente ao saldo: rendimento
  -- de verdade só entra quando o admin clica "Lançar Rendimento" (função
  -- abaixo), refletindo o extrato real da instituição financeira.
  taxa_rendimento numeric(8,4) not null default 0 check (taxa_rendimento >= 0),
  taxa_rendimento_periodo text not null default 'mensal' check (taxa_rendimento_periodo in ('mensal', 'anual')),

  nivel_risco text not null default 'baixo' check (nivel_risco in ('baixo', 'medio', 'alto')),
  liquidez text not null default 'imediata' check (liquidez in ('imediata', 'curto_prazo', 'longo_prazo')),

  contexto public.fin_contexto not null default 'profissional',
  emoji text,
  cor text, -- hex opcional, mesma paleta categórica de `fin_categorias` (`PALETA_CATEGORIAS`)

  arquivada boolean not null default false, -- "excluir" uma caixinha com histórico não some com o ledger — só arquiva (mesmo espírito de nunca apagar dinheiro do passado)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fin_caixinhas_company_idx on public.fin_caixinhas (company_id);

drop trigger if exists fin_caixinhas_set_updated_at on public.fin_caixinhas;
create trigger fin_caixinhas_set_updated_at
  before update on public.fin_caixinhas
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. LEDGER da caixinha — append-only, escrito só pelas 3 funções abaixo.
-- ----------------------------------------------------------------------------
create table if not exists public.fin_caixinhas_transacoes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default public.current_company_id() references public.companies(id) on delete cascade,
  caixinha_id uuid not null references public.fin_caixinhas(id) on delete cascade,

  tipo text not null check (tipo in ('aporte', 'resgate', 'rendimento')),
  valor numeric(12,2) not null check (valor > 0), -- sempre positivo; o sinal é implícito pelo `tipo` (mesmo padrão de `fin_transacoes.valor`)
  descricao text,

  -- Espelho em `fin_transacoes` — preenchido pra aporte/resgate (o
  -- lançamento que debita/credita a `fin_conta` escolhida), NULO pra
  -- rendimento (que não mexe em conta nenhuma, ver nota no topo do arquivo).
  transacao_fin_id uuid references public.fin_transacoes(id) on delete set null,

  data timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists fin_caixinhas_transacoes_company_idx on public.fin_caixinhas_transacoes (company_id);
create index if not exists fin_caixinhas_transacoes_caixinha_idx on public.fin_caixinhas_transacoes (caixinha_id, data desc);

-- ----------------------------------------------------------------------------
-- 3. SALDO — sempre CALCULADO a partir do ledger, nunca uma coluna na
--    tabela `fin_caixinhas` (mesma filosofia de `fin_contas_saldo`).
--    `security_invoker = true` — sem isso a view rodaria com o privilégio
--    de quem CRIOU ela (ignorando RLS de quem está de fato consultando),
--    vazando saldo de caixinha entre empresas (mesmo motivo documentado em
--    `multitenant-migration.sql` §7 pras views de conta/cartão).
-- ----------------------------------------------------------------------------
create or replace view public.fin_caixinhas_saldo
with (security_invoker = true) as
select
  c.id as caixinha_id,
  c.company_id,
  coalesce(sum(
    case
      when t.tipo in ('aporte', 'rendimento') then t.valor
      when t.tipo = 'resgate' then -t.valor
      else 0
    end
  ), 0) as saldo_atual,
  count(t.id) as qtd_movimentacoes,
  max(t.data) as ultima_movimentacao_em
from public.fin_caixinhas c
left join public.fin_caixinhas_transacoes t on t.caixinha_id = c.id
group by c.id, c.company_id;

-- ----------------------------------------------------------------------------
-- 4. RLS
-- ----------------------------------------------------------------------------
alter table public.fin_caixinhas enable row level security;
alter table public.fin_caixinhas_transacoes enable row level security;

-- Cadastro (nome/objetivo/meta/taxa...) — CRUD normal, mesmo padrão de
-- `fin_contas`/`fin_cartoes`/`fin_categorias` (sem regra de negócio,
-- Server Action escreve direto).
drop policy if exists fin_caixinhas_admin on public.fin_caixinhas;
create policy fin_caixinhas_admin on public.fin_caixinhas for all
  using (public.is_staff() and company_id = public.current_company_id())
  with check (public.is_staff() and company_id = public.current_company_id());

-- Ledger — SÓ LEITURA pro client. Todo INSERT passa pelas 3 funções
-- SECURITY DEFINER abaixo (que rodam como dono da tabela, ignorando RLS de
-- propósito, e validam a empresa na mão) — de caso pensado NÃO existe
-- policy de insert/update/delete aqui: um INSERT direto do client (fora das
-- funções) é negado pelo RLS, o que é o comportamento desejado (ninguém
-- deve conseguir "aportar" sem passar pela validação de saldo/empresa).
drop policy if exists fin_caixinhas_transacoes_select on public.fin_caixinhas_transacoes;
create policy fin_caixinhas_transacoes_select on public.fin_caixinhas_transacoes for select
  using (public.is_staff() and company_id = public.current_company_id());

-- ----------------------------------------------------------------------------
-- 5. FUNÇÕES — aporte / resgate / rendimento. Todas SECURITY DEFINER (regra
--    de negócio + 2 inserções atômicas, mesmo padrão de `pagar_fatura()`),
--    então validam `company_id` NA MÃO em toda leitura/escrita — sem isso,
--    um admin malicioso poderia aportar numa caixinha de OUTRA empresa só
--    adivinhando/copiando o UUID (ver nota de segurança em
--    `multitenant-migration.sql` §8, mesmo raciocínio aqui).
-- ----------------------------------------------------------------------------

-- Aporte — debita `p_conta_id` (nasce como despesa em `fin_transacoes`,
-- rotulada como transferência pro usuário na descrição) e credita a
-- caixinha no mesmo instante.
create or replace function public.aportar_caixinha(p_caixinha_id uuid, p_conta_id uuid, p_valor numeric, p_descricao text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_nome text;
  v_contexto public.fin_contexto;
  v_transacao_id uuid;
  v_movimentacao_id uuid;
  v_descricao text;
begin
  if not public.is_staff() then
    raise exception 'Você não tem permissão pra fazer aportes.';
  end if;
  if p_valor is null or p_valor <= 0 then
    raise exception 'Informe um valor maior que zero.';
  end if;

  v_company_id := public.current_company_id();

  select nome, contexto into v_nome, v_contexto from public.fin_caixinhas where id = p_caixinha_id and company_id = v_company_id and not arquivada;
  if v_nome is null then
    raise exception 'Caixinha não encontrada.';
  end if;

  if not exists (select 1 from public.fin_contas where id = p_conta_id and company_id = v_company_id) then
    raise exception 'Conta de origem não encontrada.';
  end if;

  v_descricao := coalesce(nullif(trim(p_descricao), ''), 'Aporte — ' || v_nome);

  insert into public.fin_transacoes (tipo, descricao, valor, contexto, conta_id, pago, data_pagamento, data_vencimento, company_id)
  values ('despesa', v_descricao, p_valor, v_contexto, p_conta_id, true, now(), current_date, v_company_id)
  returning id into v_transacao_id;

  insert into public.fin_caixinhas_transacoes (company_id, caixinha_id, tipo, valor, descricao, transacao_fin_id)
  values (v_company_id, p_caixinha_id, 'aporte', p_valor, v_descricao, v_transacao_id)
  returning id into v_movimentacao_id;

  return v_movimentacao_id;
end;
$$;

-- Resgate — inverso do aporte: credita `p_conta_id` (nasce como receita em
-- `fin_transacoes`) e debita a caixinha, nunca deixando o saldo negativo.
create or replace function public.resgatar_caixinha(p_caixinha_id uuid, p_conta_id uuid, p_valor numeric, p_descricao text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_nome text;
  v_contexto public.fin_contexto;
  v_saldo_atual numeric(12,2);
  v_transacao_id uuid;
  v_movimentacao_id uuid;
  v_descricao text;
begin
  if not public.is_staff() then
    raise exception 'Você não tem permissão pra fazer resgates.';
  end if;
  if p_valor is null or p_valor <= 0 then
    raise exception 'Informe um valor maior que zero.';
  end if;

  v_company_id := public.current_company_id();

  select nome, contexto into v_nome, v_contexto from public.fin_caixinhas where id = p_caixinha_id and company_id = v_company_id and not arquivada;
  if v_nome is null then
    raise exception 'Caixinha não encontrada.';
  end if;

  if not exists (select 1 from public.fin_contas where id = p_conta_id and company_id = v_company_id) then
    raise exception 'Conta de destino não encontrada.';
  end if;

  select coalesce(sum(case when tipo in ('aporte', 'rendimento') then valor when tipo = 'resgate' then -valor else 0 end), 0)
  into v_saldo_atual
  from public.fin_caixinhas_transacoes
  where caixinha_id = p_caixinha_id and company_id = v_company_id;

  if p_valor > v_saldo_atual then
    raise exception 'Saldo insuficiente na caixinha — disponível: %', to_char(v_saldo_atual, 'FM999G999G990D00');
  end if;

  v_descricao := coalesce(nullif(trim(p_descricao), ''), 'Resgate — ' || v_nome);

  insert into public.fin_transacoes (tipo, descricao, valor, contexto, conta_id, pago, data_pagamento, data_vencimento, company_id)
  values ('receita', v_descricao, p_valor, v_contexto, p_conta_id, true, now(), current_date, v_company_id)
  returning id into v_transacao_id;

  insert into public.fin_caixinhas_transacoes (company_id, caixinha_id, tipo, valor, descricao, transacao_fin_id)
  values (v_company_id, p_caixinha_id, 'resgate', p_valor, v_descricao, v_transacao_id)
  returning id into v_movimentacao_id;

  return v_movimentacao_id;
end;
$$;

-- Lançar Rendimento — SÓ credita a caixinha, nunca mexe em `fin_transacoes`/
-- conta nenhuma (ver nota no topo do arquivo).
create or replace function public.lancar_rendimento_caixinha(p_caixinha_id uuid, p_valor numeric, p_descricao text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_nome text;
  v_movimentacao_id uuid;
begin
  if not public.is_staff() then
    raise exception 'Você não tem permissão pra lançar rendimento.';
  end if;
  if p_valor is null or p_valor <= 0 then
    raise exception 'Informe um valor maior que zero.';
  end if;

  v_company_id := public.current_company_id();

  select nome into v_nome from public.fin_caixinhas where id = p_caixinha_id and company_id = v_company_id and not arquivada;
  if v_nome is null then
    raise exception 'Caixinha não encontrada.';
  end if;

  insert into public.fin_caixinhas_transacoes (company_id, caixinha_id, tipo, valor, descricao)
  values (v_company_id, p_caixinha_id, 'rendimento', p_valor, coalesce(nullif(trim(p_descricao), ''), 'Rendimento'))
  returning id into v_movimentacao_id;

  return v_movimentacao_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Realtime — mesma decisão de outros módulos com tela que se beneficia
--    de atualização ao vivo (múltiplos membros da equipe podem lançar
--    aporte/resgate ao mesmo tempo).
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fin_caixinhas'
  ) then
    alter publication supabase_realtime add table public.fin_caixinhas;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fin_caixinhas_transacoes'
  ) then
    alter publication supabase_realtime add table public.fin_caixinhas_transacoes;
  end if;
end $$;
