#!/usr/bin/env python3
"""
Recolha automática de dados das empresas a partir dos seus sites.

Para cada empresa da tabela `companies` que tem `website`, o programa abre o
site, pede ao Gemini (via ScrapeGraph-ai) que leia a página e devolve:
email, telefone, endereço, descrição, província, distrito,
produtos/serviços e redes sociais.

Regras de segurança:
  * Por defeito corre em MODO DE TESTE: não grava nada, só gera um relatório.
    Para gravar é preciso passar --gravar.
  * Só preenche campos VAZIOS. Nunca substitui nem apaga o que já existe.
  * A província só é aceite se for uma das 11 províncias usadas no site.
  * As redes sociais só são gravadas se a coluna `social_links` existir
    (ver supabase/migrations/20261007_companies_social_links.sql).

Uso (ver LEIA-ME.md):
  python recolher_empresas.py                 # teste, todas as empresas
  python recolher_empresas.py --limite 5      # teste, só 5 empresas
  python recolher_empresas.py --gravar        # grava os campos vazios
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from dotenv import load_dotenv
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

AQUI = Path(__file__).resolve().parent
RAIZ_SITE = AQUI.parent.parent

# Ficheiros de configuração lidos por ordem (o primeiro valor encontrado ganha).
# O ficheiro próprio da recolha vem primeiro; depois os do site, para reutilizar
# o endereço e a chave do Supabase que o site já usa no servidor.
FICHEIROS_ENV = [
    Path("/etc/agro-recolha.env"),
    AQUI / ".env",
    RAIZ_SITE / ".env.production",
    RAIZ_SITE / ".env.local",
    RAIZ_SITE / ".env",
]

MODELO_PADRAO = "gemini-2.5-flash"

# Mesma lista que lib/constants.ts (PROVINCES)
PROVINCIAS = [
    "Maputo Cidade",
    "Maputo Província",
    "Gaza",
    "Inhambane",
    "Manica",
    "Sofala",
    "Tete",
    "Zambézia",
    "Nampula",
    "Niassa",
    "Cabo Delgado",
]

REDES = {
    "facebook": ("facebook.com", "fb.com", "fb.me"),
    "instagram": ("instagram.com",),
    "linkedin": ("linkedin.com",),
    "x": ("x.com", "twitter.com"),
    "youtube": ("youtube.com", "youtu.be"),
    "tiktok": ("tiktok.com",),
    "whatsapp": ("wa.me", "whatsapp.com", "api.whatsapp.com"),
}

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
EMAILS_FALSOS = ("example.com", "sentry", "wixpress", "webpack", "domain.com", "email.com")

LIMITE_DESCRICAO = 600
PAUSA_ENTRE_SITES = 3  # segundos, para não sobrecarregar os sites


# ---------------------------------------------------------------------------
# O que pedimos ao Gemini
# ---------------------------------------------------------------------------

class RedesSociais(BaseModel):
    facebook: Optional[str] = Field(None, description="URL da página de Facebook")
    instagram: Optional[str] = Field(None, description="URL do Instagram")
    linkedin: Optional[str] = Field(None, description="URL do LinkedIn")
    x: Optional[str] = Field(None, description="URL do X/Twitter")
    youtube: Optional[str] = Field(None, description="URL do canal YouTube")
    tiktok: Optional[str] = Field(None, description="URL do TikTok")
    whatsapp: Optional[str] = Field(None, description="Link wa.me ou número de WhatsApp")


class DadosEmpresa(BaseModel):
    email: Optional[str] = Field(None, description="Email de contacto principal")
    telefone: Optional[str] = Field(None, description="Telefone principal, com indicativo se existir")
    endereco: Optional[str] = Field(None, description="Endereço físico (rua, bairro, cidade)")
    descricao: Optional[str] = Field(
        None, description="Resumo em português, 2 a 4 frases, do que a empresa faz"
    )
    provincia: Optional[str] = Field(None, description="Província de Moçambique onde fica a sede")
    distrito: Optional[str] = Field(None, description="Distrito ou cidade da sede")
    produtos_servicos: list[str] = Field(
        default_factory=list, description="Lista curta dos principais produtos ou serviços"
    )
    redes_sociais: RedesSociais = Field(default_factory=RedesSociais)


PEDIDO = (
    "Esta página é o site de uma empresa do sector agrário em Moçambique. "
    "Extrai APENAS informação que aparece de facto na página; se um dado não "
    "aparecer, devolve null (não inventes nem adivinhes). "
    "Escreve a descrição e os produtos/serviços em português de Moçambique. "
    "A província tem de ser uma destas: " + ", ".join(PROVINCIAS) + ". "
    "Os produtos/serviços devem ser no máximo 10 itens curtos."
)


# ---------------------------------------------------------------------------
# Validação e limpeza
# ---------------------------------------------------------------------------

def _sem_acentos(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn"
    ).lower().strip()


def limpar_provincia(valor: Optional[str]) -> Optional[str]:
    if not valor:
        return None
    v = _sem_acentos(valor)
    for p in PROVINCIAS:
        if _sem_acentos(p) == v:
            return p
    if "maputo" in v:
        return "Maputo Província" if "provinc" in v else "Maputo Cidade"
    for p in PROVINCIAS:
        if _sem_acentos(p) in v:
            return p
    return None


def limpar_email(valor: Optional[str]) -> Optional[str]:
    if not valor:
        return None
    v = valor.strip().lower().removeprefix("mailto:")
    if not EMAIL_RE.match(v) or any(f in v for f in EMAILS_FALSOS):
        return None
    return v


def limpar_telefone(valor: Optional[str]) -> Optional[str]:
    if not valor:
        return None
    digitos = re.sub(r"[^\d+]", "", valor)
    if len(re.sub(r"\D", "", digitos)) < 8:
        return None
    return digitos


def limpar_texto(valor: Optional[str], limite: int) -> Optional[str]:
    if not valor:
        return None
    v = re.sub(r"\s+", " ", valor).strip()
    if len(v) < 3:
        return None
    return v[:limite].rstrip()


def limpar_redes(redes: RedesSociais | dict | None) -> dict:
    if redes is None:
        return {}
    dados = redes.model_dump() if isinstance(redes, BaseModel) else dict(redes)
    resultado = {}
    for nome, dominios in REDES.items():
        url = (dados.get(nome) or "").strip()
        if not url:
            continue
        if nome == "whatsapp" and re.fullmatch(r"\+?[\d\s-]{8,}", url):
            url = "https://wa.me/" + re.sub(r"\D", "", url)
        if not url.startswith("http"):
            url = "https://" + url.lstrip("/")
        host = (urlparse(url).hostname or "").lower().removeprefix("www.").removeprefix("m.")
        if any(host == d or host.endswith("." + d) for d in dominios):
            resultado[nome] = url
    return resultado


def limpar_lista(itens) -> list[str]:
    vistos, limpos = set(), []
    for item in itens or []:
        t = limpar_texto(str(item), 120)
        if t and t.lower() not in vistos:
            vistos.add(t.lower())
            limpos.append(t)
    return limpos[:10]


def vazio(valor) -> bool:
    if valor is None:
        return True
    if isinstance(valor, str):
        return valor.strip() == ""
    if isinstance(valor, (list, dict)):
        return len(valor) == 0
    return False


# ---------------------------------------------------------------------------
# Recolha
# ---------------------------------------------------------------------------

def carregar_configuracao() -> dict:
    for ficheiro in FICHEIROS_ENV:
        if ficheiro.exists():
            load_dotenv(ficheiro, override=False)

    cfg = {
        "supabase_url": os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        "supabase_key": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "gemini_key": os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
        "modelo": os.getenv("GEMINI_MODEL", MODELO_PADRAO),
    }
    em_falta = [nome for nome, chave in [
        ("SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)", "supabase_url"),
        ("SUPABASE_SERVICE_ROLE_KEY", "supabase_key"),
        ("GEMINI_API_KEY", "gemini_key"),
    ] if not cfg[chave]]
    if em_falta:
        print("ERRO: faltam estas configurações: " + ", ".join(em_falta), file=sys.stderr)
        print("Procurei em: " + ", ".join(str(f) for f in FICHEIROS_ENV), file=sys.stderr)
        sys.exit(2)
    return cfg


def ler_site(url: str, cfg: dict) -> DadosEmpresa:
    from scrapegraphai.graphs import SmartScraperGraph

    grafo = SmartScraperGraph(
        prompt=PEDIDO,
        source=url,
        schema=DadosEmpresa,
        config={
            "llm": {
                "api_key": cfg["gemini_key"],
                "model": "google_genai/" + cfg["modelo"],
                "temperature": 0,
            },
            "headless": True,
            "verbose": False,
            "loader_kwargs": {"timeout": 30},
        },
    )
    resultado = grafo.run()
    if isinstance(resultado, dict) and "content" in resultado and len(resultado) == 1:
        resultado = resultado["content"]
    if isinstance(resultado, str):
        resultado = json.loads(resultado)
    return DadosEmpresa.model_validate(resultado or {})


def normalizar_url(url: str) -> Optional[str]:
    url = (url or "").strip()
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    host = urlparse(url).hostname or ""
    if "." not in host:
        return None
    return url


def propor_alteracoes(empresa: dict, dados: DadosEmpresa, tem_redes: bool) -> dict:
    """Devolve só os campos que estão vazios na base de dados e foram encontrados."""
    candidatos = {
        "email": limpar_email(dados.email),
        "contact": limpar_telefone(dados.telefone),
        "address": limpar_texto(dados.endereco, 255),
        "description": limpar_texto(dados.descricao, LIMITE_DESCRICAO),
        "province": limpar_provincia(dados.provincia),
        "district": limpar_texto(dados.distrito, 120),
    }
    servicos = limpar_lista(dados.produtos_servicos)
    if servicos:
        candidatos["services"] = "; ".join(servicos)
    if tem_redes:
        redes = limpar_redes(dados.redes_sociais)
        if redes:
            candidatos["social_links"] = redes

    return {
        campo: valor
        for campo, valor in candidatos.items()
        if not vazio(valor) and vazio(empresa.get(campo))
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Recolha de dados das empresas (Base de Dados Agro)")
    parser.add_argument("--gravar", action="store_true",
                        help="Grava os campos vazios na base de dados (sem isto é só teste)")
    parser.add_argument("--limite", type=int, default=0, help="Processar no máximo N empresas")
    parser.add_argument("--empresa", help="Processar só a empresa com este slug")
    parser.add_argument("--todas", action="store_true",
                        help="Incluir empresas que já têm todos os campos preenchidos")
    parser.add_argument("--relatorios", default=str(AQUI / "relatorios"),
                        help="Pasta onde guardar o relatório CSV")
    args = parser.parse_args()

    cfg = carregar_configuracao()

    from supabase import create_client
    db = create_client(cfg["supabase_url"], cfg["supabase_key"])

    colunas = "id, name, slug, website, email, contact, address, description, province, district, services"
    tem_redes = True
    try:
        db.table("companies").select("social_links").limit(1).execute()
        colunas += ", social_links"
    except Exception:
        tem_redes = False
        print("Aviso: a coluna social_links ainda não existe; as redes sociais vão só para o relatório.")

    consulta = db.table("companies").select(colunas).not_.is_("website", "null").neq("website", "")
    if args.empresa:
        consulta = consulta.eq("slug", args.empresa)
    empresas = consulta.order("name").execute().data or []

    campos_alvo = ["email", "contact", "address", "description", "province", "district", "services"]
    if tem_redes:
        campos_alvo.append("social_links")
    if not args.todas:
        empresas = [e for e in empresas if any(vazio(e.get(c)) for c in campos_alvo)]
    if args.limite:
        empresas = empresas[: args.limite]

    modo = "GRAVAR" if args.gravar else "TESTE (nada é gravado)"
    print(f"Modo: {modo} · Modelo: {cfg['modelo']} · Empresas a processar: {len(empresas)}")

    pasta = Path(args.relatorios)
    pasta.mkdir(parents=True, exist_ok=True)
    relatorio = pasta / f"recolha-{datetime.now():%Y%m%d-%H%M%S}.csv"

    contagem = {"ok": 0, "sem_novidades": 0, "erro": 0, "gravadas": 0}
    with relatorio.open("w", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(["empresa", "slug", "site", "estado", "campos_novos", "valores", "redes_encontradas", "erro"])

        for i, empresa in enumerate(empresas, 1):
            url = normalizar_url(empresa.get("website"))
            nome = empresa.get("name") or "?"
            print(f"[{i}/{len(empresas)}] {nome} — {url or 'site inválido'}")
            if not url:
                escritor.writerow([nome, empresa.get("slug"), empresa.get("website"), "site inválido", "", "", "", ""])
                contagem["erro"] += 1
                continue
            try:
                dados = ler_site(url, cfg)
                novos = propor_alteracoes(empresa, dados, tem_redes)
                redes = limpar_redes(dados.redes_sociais)
                estado = "novidades" if novos else "sem novidades"
                if novos and args.gravar:
                    novos_gravar = dict(novos)
                    novos_gravar["updated_at"] = datetime.utcnow().isoformat()
                    db.table("companies").update(novos_gravar).eq("id", empresa["id"]).execute()
                    estado = "gravado"
                    contagem["gravadas"] += 1
                contagem["ok" if novos else "sem_novidades"] += 1
                escritor.writerow([
                    nome, empresa.get("slug"), url, estado,
                    ", ".join(novos.keys()),
                    json.dumps(novos, ensure_ascii=False),
                    json.dumps(redes, ensure_ascii=False),
                    "",
                ])
                print(f"    {estado}: {', '.join(novos.keys()) or '—'}")
            except Exception as erro:  # um site com problema não pára a recolha
                contagem["erro"] += 1
                mensagem = str(erro).splitlines()[0][:300] if str(erro) else type(erro).__name__
                escritor.writerow([nome, empresa.get("slug"), url, "erro", "", "", "", mensagem])
                print(f"    erro: {mensagem}")
            f.flush()
            time.sleep(PAUSA_ENTRE_SITES)

    print(
        f"\nConcluído. Com novidades: {contagem['ok']} · Sem novidades: {contagem['sem_novidades']} · "
        f"Erros: {contagem['erro']} · Gravadas: {contagem['gravadas']}"
    )
    print(f"Relatório: {relatorio}")


if __name__ == "__main__":
    main()
