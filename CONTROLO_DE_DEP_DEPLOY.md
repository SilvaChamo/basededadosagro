# 🚀 CONTROLO DE DEPLOYS - BaseAgroData

> **Nota (Agosto 2026):** este documento descrevia anteriormente um fluxo via
> Vercel que **nunca chegou a ser activado** — o projecto não está e nunca
> esteve ligado ao Vercel. O site real corre num servidor Hetzner próprio.
> Conteúdo actualizado abaixo para reflectir a forma como o deploy acontece
> de facto.

---

## 1. Onde o site corre

`basededadosagro.com` **não está no Vercel**. Corre como processo PM2
(`basededadosagro-site`) num servidor Hetzner, sem `git` instalado no
próprio servidor — ou seja, um simples `git push` para o GitHub **não**
actualiza o site sozinho.

Detalhe técnico de acesso ao servidor fica documentado em `.env.local`
(secção "Deploy do site em produção").

## 2. Como trabalhar agora?

### Durante o dia (guardar trabalho)
`./sync.sh "Minha alteração"` continua a funcionar normalmente para guardar
o código no GitHub. A flag `--deploy` e a marca `[deploy]` no commit **já
não têm efeito nenhum** (não há Vercel a reagir a isso) — podem continuar a
usar-se sem problema, só não fazem nada de especial.

### Para publicar de facto no site
Isso é feito através de uma automação de publicação (GitHub Actions,
`workflow_dispatch`) que liga ao servidor Hetzner, aplica o código,
reconstrói e reinicia o processo. Não é algo que se dispare sozinho a cada
push — é pedido explicitamente quando há uma alteração pronta a publicar.

---

*Guia de configuração técnica — actualizado em Agosto 2026.*
