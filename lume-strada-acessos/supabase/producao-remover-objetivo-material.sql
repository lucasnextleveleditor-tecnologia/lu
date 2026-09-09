-- Reversão parcial de `producao-briefing-detalhado.sql`: "Objetivo do
-- Material" (chips como Reels/TikTok/YouTube/Conversão em Anúncio...)
-- duplicava "Tipo de Serviço" (select já existente, ligado a
-- `prod_tipos_servico`, com "Gerenciar" pra CRUD) — a pedido do usuário, os
-- dois viraram um só campo (Tipo de Serviço continua sendo o lugar pra
-- isso, e o admin pode cadastrar ali qualquer categoria que precisar, ex:
-- "Reels"). Coluna nunca chegou a ser usada em produção — a feature foi
-- entregue e revertida na mesma sessão, antes de qualquer tarefa real ser
-- salva com objetivo preenchido.
alter table public.prod_tarefas drop column if exists objetivo_material;
