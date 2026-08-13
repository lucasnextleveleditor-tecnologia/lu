# Como atualizar o site depois de uma mudança

Guia rápido pra você não se perder da próxima vez que eu (ou outra sessão do Claude) fizer uma alteração no código do seu projeto.

## Regra de ouro

**Você nunca precisa mexer no código.** Meu trabalho é te entregar os arquivos prontos. O seu trabalho é só levar esses arquivos até o GitHub — o Vercel faz o resto sozinho.

## Passo a passo (mudança de página/código)

1. **Me peça a mudança** ("muda o texto X", "ajusta a cor Y" etc.)
2. **Eu aviso exatamente o que mudou** — geralmente te mando de volta o arquivo específico que foi alterado, ou o zip inteiro se forem muitas mudanças de uma vez
3. **Vá no GitHub**, no seu repositório (`lucasnextleveleditor-tecnologia/lu`)
4. **Entre na pasta certa**: clique em `lume-strada-acessos` até chegar exatamente na mesma pastinha onde o arquivo alterado vive (ex: se mudou `src/app/login/page.tsx`, entra em `lume-strada-acessos` → `src` → `app` → `login`)
5. Clique em **"Add file" → "Upload files"** (ou arraste o arquivo direto pra tela)
6. Arraste o(s) arquivo(s) que eu te mandei — o GitHub reconhece que já existe um arquivo com esse nome ali e vai **substituir** ele
7. Desça a página e clique em **"Commit changes"**

**Pronto — não precisa fazer mais nada.** Assim que você commita no GitHub, a Vercel detecta sozinha e já começa um novo deploy automaticamente. Só espera uns 1-2 minutos e atualiza a página do site (`Cmd + Shift + R` pra garantir que não é cache antigo).

## Diferente quando é variável de ambiente

Se um dia eu pedir pra você mexer em **Environment Variables** no Vercel (como fizemos com as chaves do Supabase), aí sim é diferente:
- Isso se mexe direto no site do Vercel, não no GitHub
- E depois de salvar, você **precisa clicar em Redeploy manualmente** (Deployments → `...` → Redeploy) — mudança de variável sozinha não dispara deploy novo

## Resumo visual

| O que mudou | Onde mexer | Precisa clicar Redeploy? |
|---|---|---|
| Texto, cor, layout, qualquer arquivo de código | GitHub (upload substituindo o arquivo) | Não — acontece sozinho |
| Chave/senha/variável de ambiente | Vercel → Environment Variables | Sim, manualmente |

## Se der erro de novo

Sempre que a tela mostrar algo estranho depois de um deploy, me manda um print da tela de **Deployments** no Vercel (mostrando se ficou "Ready" ou "Error") e, se possível, da aba **Logs** também — isso resolve 90% dos casos rapidinho.
