-- Proposta Comercial Web — captura do CPF de quem aprova (Parte 1 do fluxo
-- de aprovação -> dados pra contrato; a assinatura desenhada na tela fica
-- pra uma etapa futura, combinada com o usuário). Aplicado direto via MCP
-- do Supabase no projeto de produção (ifoggohkikwtnnhmhwoe) e salvo aqui só
-- pra manter o histórico de migrações no repositório.
alter table public.orcamentos
  add column if not exists aprovado_por_cpf text;
