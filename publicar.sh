#!/bin/bash
# Publica o site: envia o commit para o GitHub e dispara o deploy para o
# servidor Hetzner (GitHub Actions -> rsync + build + pm2 restart).
# Uso:  bash publicar.sh
set -e
cd "$(dirname "$0")"

echo "→ 1/3  A enviar o código para o GitHub..."
git push origin main

echo "→ 2/3  A disparar o deploy (workflow deploy-hetzner)..."
gh workflow run deploy-hetzner.yml

echo "→ 3/3  A aguardar o deploy arrancar..."
RID=""
for i in 1 2 3 4 5 6 7 8; do
  RID=$(gh run list --workflow=deploy-hetzner.yml -L1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)
  [ -n "$RID" ] && break
  sleep 3
done

if [ -z "$RID" ]; then
  echo "   (não consegui apanhar o ID do run — vê em: separador Actions no GitHub)"
  exit 0
fi

echo "   A acompanhar o run $RID (isto NÃO cancela o deploy; só deixa de mostrar)..."
if gh run watch "$RID" --exit-status; then
  echo
  echo "✅ DEPLOY OK."
  echo "   Testa em produção (janela anónima, para evitar cache):"
  echo "     https://basededadosagro.com  → Entrar → Esqueci a senha"
else
  echo
  echo "❌ DEPLOY FALHOU. Logs do erro:"
  echo "     gh run view $RID --log-failed"
  exit 1
fi
