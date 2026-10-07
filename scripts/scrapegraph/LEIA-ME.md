# Recolha automática de dados das empresas

Este programa visita o site de cada empresa registada e preenche a informação
que falta, usando o ScrapeGraph-ai e o Gemini da Google. Recolhe email,
telefone, endereço, descrição, província, distrito, produtos/serviços e redes
sociais.

## Regras

- **Só preenche campos vazios.** Nunca substitui o que a empresa já escreveu.
- **Modo de teste por defeito.** Sem `--gravar`, apenas gera um relatório (CSV).
- A província só é aceite se for uma das 11 do site.
- As redes sociais só são gravadas depois de criada a coluna `social_links`
  (`supabase/migrations/20261007_companies_social_links.sql`). Até lá aparecem
  apenas no relatório.

## Instalação no servidor Hetzner (uma vez)

O código chega a `/opt/basededadosagro-site` com o deploy normal. O ambiente
Python e os relatórios ficam **fora** dessa pasta, porque o deploy apaga o que
não estiver no GitHub.

1. Instalar o Python e criar o ambiente:

   ```bash
   apt-get install -y python3-venv
   mkdir -p /opt/agro-recolha /var/lib/agro-recolha/relatorios
   python3 -m venv /opt/agro-recolha/venv
   ```

2. Instalar o programa e o navegador que abre as páginas:

   ```bash
   /opt/agro-recolha/venv/bin/pip install -r /opt/basededadosagro-site/scripts/scrapegraph/requirements.txt
   /opt/agro-recolha/venv/bin/playwright install --with-deps chromium
   ```

3. Guardar a chave do Gemini (obtida em https://aistudio.google.com/apikey):

   ```bash
   printf 'GEMINI_API_KEY=COLE_AQUI_A_CHAVE\n' > /etc/agro-recolha.env
   chmod 600 /etc/agro-recolha.env
   ```

   O endereço e a chave do Supabase são lidos do ficheiro `.env` que o site já
   tem no servidor. Se estiverem noutro sítio, acrescente-os também a
   `/etc/agro-recolha.env` (`NEXT_PUBLIC_SUPABASE_URL=` e `SUPABASE_SERVICE_ROLE_KEY=`).

## Testar (não grava nada)

```bash
cd /opt/basededadosagro-site/scripts/scrapegraph
/opt/agro-recolha/venv/bin/python recolher_empresas.py --limite 5 --relatorios /var/lib/agro-recolha/relatorios
```

No fim indica onde ficou o relatório. Abra-o para conferir o que seria preenchido.

## Gravar a sério

```bash
/opt/agro-recolha/venv/bin/python recolher_empresas.py --gravar --relatorios /var/lib/agro-recolha/relatorios
```

## Activar a execução semanal (segunda-feira às 03:00)

Só depois de conferir o teste:

```bash
cp /opt/basededadosagro-site/scripts/scrapegraph/agro-recolha.service /etc/systemd/system/
cp /opt/basededadosagro-site/scripts/scrapegraph/agro-recolha.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now agro-recolha.timer
systemctl list-timers agro-recolha.timer
```

Ver o resultado da última execução: `journalctl -u agro-recolha --since "7 days ago"`

Desligar: `systemctl disable --now agro-recolha.timer`

## Outras opções

- `--empresa SLUG` — processa só uma empresa.
- `--todas` — inclui empresas que já têm tudo preenchido.
- Mudar o modelo: `GEMINI_MODEL=gemini-2.5-flash-lite` em `/etc/agro-recolha.env`
  (mais barato e mais rápido).
