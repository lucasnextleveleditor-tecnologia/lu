-- ============================================================================
-- Cadastro completo do cliente: dados fiscais e endereço em campos próprios
-- ============================================================================
-- Rode DEPOIS de `cadastros.sql`. Idempotente.
--
-- O cadastro tinha `endereco` como UM campo de texto livre. Isso basta para
-- "onde fica a gravação" e não basta para mais nada: o contrato precisa da
-- rua separada do CEP para preencher a qualificação das partes, a nota fiscal
-- precisa de cidade e UF em campos distintos, e ninguém consegue filtrar
-- clientes por estado num texto solto.
--
-- Também faltava a diferença entre o nome que aparece na tela e o nome que vai
-- no contrato: "Só Crazy - MC Pedrinho" é como a equipe chama o cliente, e
-- "Crazy Produções de Eventos LTDA" é quem assina. São coisas diferentes e
-- agora moram em colunas diferentes.
--
-- A COLUNA `endereco` CONTINUA EXISTINDO E CONTINUA CORRETA. Ela é lida hoje
-- por `app/admin/contratos/data.ts` e `app/admin/orcamentos/data.ts` para
-- montar o documento, e reescrever esses dois para remontar o endereço na mão
-- espalharia a mesma concatenação por dois lugares que vão divergir. Em vez
-- disso, um gatilho recompõe `endereco` a partir dos campos estruturados a
-- cada escrita — quem lê continua lendo uma linha pronta, sem saber de nada.
--
-- Cliente antigo, com só o texto livre preenchido, fica exatamente como está:
-- o gatilho não inventa estrutura a partir de texto (ele erraria, e erraria em
-- silêncio, num campo que vai impresso num contrato). Assim que alguém abrir a
-- ficha e preencher os campos novos, a linha passa a ser composta.
-- ============================================================================

alter table public.clientes
  add column if not exists razao_social text,
  add column if not exists inscricao_estadual text,
  add column if not exists inscricao_municipal text,
  add column if not exists cep text,
  add column if not exists logradouro text,
  add column if not exists numero text,
  add column if not exists complemento text,
  add column if not exists bairro text,
  add column if not exists cidade text,
  add column if not exists uf text;

-- UF em duas letras maiúsculas ou nada. O gatilho abaixo já normaliza o que
-- vier em minúsculo, então o check nunca barra quem digitou "sp".
alter table public.clientes drop constraint if exists clientes_uf_check;
alter table public.clientes add constraint clientes_uf_check
  check (uf is null or uf ~ '^[A-Z]{2}$');

comment on column public.clientes.nome is
  'Nome de exibicao, usado em toda a interface. A razao social (quem assina o contrato) fica em razao_social.';
comment on column public.clientes.razao_social is
  'Razao social / nome completo de quem assina. Null = usar o nome de exibicao.';
comment on column public.clientes.endereco is
  'Endereco em UMA linha, COMPOSTO pelo gatilho clientes_compor_endereco a partir dos campos estruturados. Nao edite direto: a proxima escrita sobrescreve. Cliente antigo sem campos estruturados mantem o texto livre original.';

-- ============================================================================
-- O gatilho que mantém `endereco` como a linha pronta
-- ============================================================================

create or replace function public.compor_endereco_cliente()
returns trigger
language plpgsql
-- `search_path` fixo: sem ele o linter do Supabase acusa, e com razao — um
-- schema na frente de `public` no search_path de quem escreve poderia trocar
-- por baixo qualquer funcao que esta aqui chamasse.
set search_path = public
as $$
declare
  partes text[] := '{}';
  rua text;
  cidade_uf text;
  uf_limpa text;
begin
  uf_limpa := nullif(upper(btrim(coalesce(new.uf, ''))), '');
  new.uf := uf_limpa;

  -- Nenhum campo estruturado preenchido: não encosta em `endereco`. É o
  -- cliente antigo, cujo texto livre é a única coisa que se sabe dele.
  if nullif(btrim(coalesce(new.logradouro, '')), '') is null
     and nullif(btrim(coalesce(new.bairro, '')), '') is null
     and nullif(btrim(coalesce(new.cidade, '')), '') is null
     and nullif(btrim(coalesce(new.cep, '')), '') is null
     and uf_limpa is null then
    return new;
  end if;

  rua := nullif(btrim(coalesce(new.logradouro, '')), '');
  if rua is not null and nullif(btrim(coalesce(new.numero, '')), '') is not null then
    rua := rua || ', ' || btrim(new.numero);
  end if;
  if rua is not null and nullif(btrim(coalesce(new.complemento, '')), '') is not null then
    rua := rua || ' - ' || btrim(new.complemento);
  end if;
  if rua is not null then
    partes := partes || rua;
  end if;

  if nullif(btrim(coalesce(new.bairro, '')), '') is not null then
    partes := partes || btrim(new.bairro);
  end if;

  cidade_uf := nullif(btrim(coalesce(new.cidade, '')), '');
  if cidade_uf is not null and uf_limpa is not null then
    cidade_uf := cidade_uf || '/' || uf_limpa;
  elsif cidade_uf is null then
    cidade_uf := uf_limpa;
  end if;
  if cidade_uf is not null then
    partes := partes || cidade_uf;
  end if;

  if nullif(btrim(coalesce(new.cep, '')), '') is not null then
    partes := partes || ('CEP ' || btrim(new.cep));
  end if;

  new.endereco := nullif(array_to_string(partes, ', '), '');
  return new;
end;
$$;

drop trigger if exists clientes_compor_endereco on public.clientes;
create trigger clientes_compor_endereco
  before insert or update on public.clientes
  for each row execute function public.compor_endereco_cliente();

-- O gatilho é BEFORE INSERT/UPDATE numa tabela com RLS e não recebe parâmetro
-- nenhum de fora, então não há o que revogar aqui: ele só roda no contexto da
-- própria escrita, que a RLS de `clientes` já autorizou.
