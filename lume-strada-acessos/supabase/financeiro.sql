-- ============================================================================
-- Agência Hub — Módulo A: Financeiro (ERP)
-- ============================================================================
-- Rode DEPOIS de `schema.sql` (precisa de `public.is_admin()` e da tabela
-- `profiles` já existirem). Só o admin usa este módulo por enquanto — dá
-- pra abrir pra colaboradores depois com uma policy nova, sem migração.
-- ============================================================================

create type public.fin_contexto as enum ('pessoal', 'profissional');
create type public.fin_tipo_transacao as enum ('receita', 'despesa', 'transferencia');

-- ----------------------------------------------------------------------------
-- 1. CONTAS / CARTEIRAS — saldo manual inicial; o saldo ATUAL é sempre
--    CALCULADO (view `fin_contas_saldo` no final), nunca uma coluna
--    incrementada manualmente — evita a conta e a soma das transações
--    "descolarem" uma da outra com o tempo.
-- ----------------------------------------------------------------------------
create table public.fin_contas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text, -- livre: "Corrente", "Poupança", "Carteira" etc. (só rótulo, não afeta lógica)
  saldo_inicial numeric(12,2) not null default 0,
  contexto public.fin_contexto not null default 'profissional',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. CARTÕES DE CRÉDITO — limite disponível também é CALCULADO (view
--    `fin_cartoes_limite`), a partir das transações ainda não incluídas
--    numa fatura paga.
-- ----------------------------------------------------------------------------
create table public.fin_cartoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  limite numeric(12,2) not null check (limite >= 0),
  dia_fechamento smallint not null check (dia_fechamento between 1 and 31),
  dia_vencimento smallint not null check (dia_vencimento between 1 and 31),
  contexto public.fin_contexto not null default 'profissional',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. CATEGORIAS (Plano de Contas)
-- ----------------------------------------------------------------------------
create table public.fin_categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  cor text, -- hex opcional, só decorativo na UI
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. TRANSAÇÕES — receitas, despesas e transferências. A "fonte de
--    pagamento" é OU uma conta OU um cartão (nunca os dois); transferência
--    usa conta_id (origem) + conta_destino_id, nunca cartão.
--
--    `pago`: pra transação em CONTA, é a baixa de verdade (pendente ->
--    pago, o que entra no saldo calculado). Pra transação em CARTÃO, a
--    compra já consome limite assim que é lançada (ver view de limite) —
--    `pago` fica só como rótulo informativo nesse caso.
--
--    `fatura_paga`: só relevante quando `cartao_id` não é nulo — vira TRUE
--    quando a função `pagar_fatura()` quita a fatura que contém essa
--    transação, e a partir daí ela para de consumir o limite do cartão.
-- ----------------------------------------------------------------------------
create table public.fin_transacoes (
  id uuid primary key default gen_random_uuid(),
  tipo public.fin_tipo_transacao not null,
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0), -- sempre positivo; o sinal é implícito pelo `tipo`
  categoria_id uuid references public.fin_categorias(id) on delete set null,
  contexto public.fin_contexto not null default 'profissional',
  conta_id uuid references public.fin_contas(id) on delete cascade, -- fonte (receita/despesa) OU origem (transferência)
  conta_destino_id uuid references public.fin_contas(id) on delete cascade, -- só transferência
  cartao_id uuid references public.fin_cartoes(id) on delete cascade, -- fonte alternativa (só despesa)
  recorrente boolean not null default false,
  recorrencia_intervalo text check (recorrencia_intervalo in ('semanal', 'mensal', 'anual')),
  data_vencimento date not null,
  pago boolean not null default false,
  data_pagamento timestamptz,
  fatura_paga boolean not null default false,
  created_at timestamptz not null default now(),
  constraint fin_transacoes_fonte_valida check (
    (tipo = 'transferencia' and conta_id is not null and conta_destino_id is not null and cartao_id is null)
    or
    (tipo <> 'transferencia' and conta_destino_id is null and (
      (conta_id is not null and cartao_id is null) or (conta_id is null and cartao_id is not null)
    ))
  )
);

create index fin_transacoes_conta_idx on public.fin_transacoes (conta_id);
create index fin_transacoes_cartao_idx on public.fin_transacoes (cartao_id);
create index fin_transacoes_vencimento_idx on public.fin_transacoes (data_vencimento);
create index fin_transacoes_contexto_idx on public.fin_transacoes (contexto);

-- ----------------------------------------------------------------------------
-- 5. FATURAS PAGAS — log de cada fatura de cartão quitada via
--    `pagar_fatura()`. Não é usada pra calcular nada (a view de limite
--    olha direto pra `fin_transacoes.fatura_paga`) — serve de histórico
--    ("quando/quanto foi pago", "de qual conta saiu").
-- ----------------------------------------------------------------------------
create table public.fin_faturas (
  id uuid primary key default gen_random_uuid(),
  cartao_id uuid not null references public.fin_cartoes(id) on delete cascade,
  periodo_referencia date not null, -- 1º dia do mês de referência da fatura
  valor_total numeric(12,2) not null,
  conta_pagamento_id uuid not null references public.fin_contas(id),
  transacao_pagamento_id uuid references public.fin_transacoes(id),
  pago_em timestamptz not null default now(),
  unique (cartao_id, periodo_referencia)
);

-- ----------------------------------------------------------------------------
-- 6. VIEWS CALCULADAS — nunca confiar em coluna incrementada manualmente
--    pra dinheiro; sempre somar a fonte da verdade (`fin_transacoes`).
-- ----------------------------------------------------------------------------
create view public.fin_contas_saldo as
select
  c.id as conta_id,
  c.nome,
  c.contexto,
  c.saldo_inicial,
  c.saldo_inicial + coalesce(sum(
    case
      when t.conta_id = c.id and t.tipo = 'receita' and t.pago then t.valor
      when t.conta_id = c.id and t.tipo = 'despesa' and t.pago then -t.valor
      when t.conta_id = c.id and t.tipo = 'transferencia' and t.pago then -t.valor
      when t.conta_destino_id = c.id and t.tipo = 'transferencia' and t.pago then t.valor
      else 0
    end
  ), 0) as saldo_atual
from public.fin_contas c
left join public.fin_transacoes t on t.conta_id = c.id or t.conta_destino_id = c.id
group by c.id, c.nome, c.contexto, c.saldo_inicial;

create view public.fin_cartoes_limite as
select
  cc.id as cartao_id,
  cc.nome,
  cc.contexto,
  cc.limite,
  coalesce(sum(t.valor) filter (where t.cartao_id = cc.id and not t.fatura_paga), 0) as limite_consumido,
  cc.limite - coalesce(sum(t.valor) filter (where t.cartao_id = cc.id and not t.fatura_paga), 0) as limite_disponivel
from public.fin_cartoes cc
left join public.fin_transacoes t on t.cartao_id = cc.id
group by cc.id, cc.nome, cc.contexto, cc.limite;

-- ----------------------------------------------------------------------------
-- 7. FUNÇÃO — Pagar Fatura. Soma tudo que está em aberto no cartão, cria
--    UMA despesa na conta escolhida (é isso que debita o saldo, via a view
--    acima) e marca as transações do cartão como `fatura_paga`, liberando
--    o limite. Tudo dentro de uma função só = atômico (ou faz tudo, ou nada).
-- ----------------------------------------------------------------------------
create or replace function public.pagar_fatura(p_cartao_id uuid, p_conta_pagamento_id uuid, p_periodo_referencia date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valor_total numeric(12,2);
  v_transacao_id uuid;
  v_fatura_id uuid;
  v_contexto public.fin_contexto;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem pagar faturas.';
  end if;

  select contexto into v_contexto from public.fin_cartoes where id = p_cartao_id;
  if v_contexto is null then
    raise exception 'Cartão não encontrado.';
  end if;

  select coalesce(sum(valor), 0) into v_valor_total
  from public.fin_transacoes
  where cartao_id = p_cartao_id and not fatura_paga;

  if v_valor_total <= 0 then
    raise exception 'Não há valor em aberto nesse cartão para pagar.';
  end if;

  insert into public.fin_transacoes (tipo, descricao, valor, contexto, conta_id, pago, data_pagamento, data_vencimento)
  values ('despesa', 'Pagamento de fatura', v_valor_total, v_contexto, p_conta_pagamento_id, true, now(), current_date)
  returning id into v_transacao_id;

  update public.fin_transacoes
  set fatura_paga = true
  where cartao_id = p_cartao_id and not fatura_paga and id <> v_transacao_id;

  insert into public.fin_faturas (cartao_id, periodo_referencia, valor_total, conta_pagamento_id, transacao_pagamento_id)
  values (p_cartao_id, p_periodo_referencia, v_valor_total, p_conta_pagamento_id, v_transacao_id)
  returning id into v_fatura_id;

  return v_fatura_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 8. RLS — só admin usa o módulo Financeiro por enquanto.
-- ----------------------------------------------------------------------------
alter table public.fin_contas enable row level security;
alter table public.fin_cartoes enable row level security;
alter table public.fin_categorias enable row level security;
alter table public.fin_transacoes enable row level security;
alter table public.fin_faturas enable row level security;

create policy fin_contas_admin on public.fin_contas for all using (public.is_admin()) with check (public.is_admin());
create policy fin_cartoes_admin on public.fin_cartoes for all using (public.is_admin()) with check (public.is_admin());
create policy fin_categorias_admin on public.fin_categorias for all using (public.is_admin()) with check (public.is_admin());
create policy fin_transacoes_admin on public.fin_transacoes for all using (public.is_admin()) with check (public.is_admin());
create policy fin_faturas_admin on public.fin_faturas for all using (public.is_admin()) with check (public.is_admin());

-- Views herdam RLS das tabelas base automaticamente (security_invoker é o padrão do Postgres/Supabase pra views simples como estas).
