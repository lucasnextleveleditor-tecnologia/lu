-- Organograma da agência — vive dentro de Cadastros → Equipe (sub-aba nova,
-- NÃO um item de menu novo, ver `EquipeManager.tsx`/`CadastrosWorkspace.tsx`).
--
-- Departamentos: colunas coloridas do organograma. A cor é um hex livre, mas
-- a UI sugere por padrão a MESMA paleta categórica já usada em Financeiro
-- (`PALETA_CATEGORIAS`, `lib/utils/financeiro.ts`) — evita inventar uma
-- segunda paleta de cores no sistema pra fazer a mesma coisa.
--
-- Cargos: pertencem a um departamento e podem estar em três estados —
-- "Vago" (funcionario_id e nome_livre ambos null), ligado a um membro REAL
-- da equipe (`funcionario_id -> equipe_membros.id` — de propósito NÃO
-- `prod_funcionarios`, que é só um espelho sincronizado por trigger, ver
-- `producao-sync-funcionarios.sql`) ou um nome livre pra freelancer/parceiro
-- externo sem cadastro completo (`nome_livre`, funcionario_id null).
create table if not exists public.departamentos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  nome text not null,
  cor text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.departamentos enable row level security;

drop policy if exists departamentos_staff_all on public.departamentos;
create policy departamentos_staff_all on public.departamentos
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

drop trigger if exists set_updated_at on public.departamentos;
create trigger set_updated_at before update on public.departamentos
  for each row execute function public.set_updated_at();

create table if not exists public.cargos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default current_company_id(),
  departamento_id uuid not null references public.departamentos(id) on delete cascade,
  titulo text not null,
  funcionario_id uuid references public.equipe_membros(id) on delete set null,
  nome_livre text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cargos_departamento_id_idx on public.cargos(departamento_id);

alter table public.cargos enable row level security;

drop policy if exists cargos_staff_all on public.cargos;
create policy cargos_staff_all on public.cargos
  for all
  using (is_staff() and company_id = current_company_id())
  with check (is_staff() and company_id = current_company_id());

drop trigger if exists set_updated_at on public.cargos;
create trigger set_updated_at before update on public.cargos
  for each row execute function public.set_updated_at();
