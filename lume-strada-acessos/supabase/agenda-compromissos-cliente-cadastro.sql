-- Vínculo opcional de um compromisso manual da Agenda com o cadastro de
-- clientes (`clientes`, Cadastros → Clientes) — antes só existia
-- `cliente_nome` (texto livre, sem FK). Com o vínculo, o calendário da
-- Agenda passa a colorir e filtrar compromissos por CLIENTE (mesma cor
-- escolhida no cadastro, `clientes.cor`), igual já acontecia no Calendário
-- de Produção. `cliente_nome` continua existindo — cobre compromissos
-- antigos e o caso de alguém que ainda não tem cadastro completo.

alter table public.compromissos
  add column if not exists cliente_cadastro_id uuid references public.clientes(id) on delete set null;

comment on column public.compromissos.cliente_cadastro_id is 'Vínculo com o cadastro de clientes (Cadastros → Clientes) — dá a cor mostrada no calendário da Agenda e habilita o filtro "Filtrar por Cliente" (ver AgendaCalendario.tsx). Null = usa só cliente_nome (texto livre) ou nenhum cliente.';

create index if not exists compromissos_cliente_cadastro_id_idx on public.compromissos(cliente_cadastro_id);
