-- ============================================================================
-- Senha provisória — substitui o fluxo de convite por link/e-mail (magic
-- link) por um jeito mais simples e sem NENHUMA dependência de e-mail/link:
-- toda conta nova já nasce com uma senha padrão fixa ("123") e uma flag
-- marcando que essa senha é provisória. A pessoa loga direto com o e-mail
-- cadastrado + "123" e, na primeira vez, é obrigada a trocar a senha antes
-- de conseguir usar qualquer outra tela do painel (ver `src/middleware.ts`
-- e `src/app/definir-senha/*`).
--
-- Motivo da mudança: depois de VÁRIAS tentativas de deixar o fluxo de
-- convite por link funcionando (rate limit do e-mail embutido, link caindo
-- em localhost, Redirect URLs vazio no Supabase, token de uso único
-- queimado por pré-visualização de link no WhatsApp/navegador, e por fim um
-- bug real na própria rota de callback que fazia TODO convite — nem o novo,
-- nem o antigo — nunca terminar em "definir senha"), a pessoa que está
-- testando pediu explicitamente pra abandonar o link/token e usar senha
-- padrão + login direto. Sem token de uso único, sem link, sem e-mail —
-- nada disso pode mais quebrar.
-- ============================================================================

alter table public.profiles add column if not exists senha_provisoria boolean not null default false;

comment on column public.profiles.senha_provisoria is
  'true = a pessoa ainda está com a senha padrão ("123") atribuída na criação da conta; o middleware força a troca antes de liberar qualquer outra tela. Vira false assim que ela define a própria senha em /definir-senha (ver app/definir-senha/actions.ts).';
