#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador Dinâmico e Automatizado de Sitemap XML para Cidadão Agora
Varre todos os diretórios de conteúdo, serviços e notícias e gera sitemap.xml
em conformidade com os padrões do Google e Bing.
"""

import os
import glob
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime

DOMINIO_BASE = "https://cidadaoagora.com.br"


class RobotsParser(HTMLParser):
    noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('name', '').lower() == 'robots':
            self.noindex = self.noindex or 'noindex' in attrs.get('content', '').lower()

def formatar_data_mtime(caminho):
    try:
        mtime = os.path.getmtime(caminho)
        return datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")
    except Exception:
        return datetime.now().strftime("%Y-%m-%d")

def gerar_sitemap():
    urls = []
    
    # 1. Página Inicial
    if os.path.exists("index.html"):
        urls.append({
            "loc": f"{DOMINIO_BASE}/",
            "lastmod": formatar_data_mtime("index.html"),
            "changefreq": "hourly",
            "priority": "1.0"
        })

    # 2. Serviços ao Cidadão (alta relevância orgânica)
    for f in sorted(glob.glob("servicos/*.html")):
        slug = os.path.basename(f)
        # Permite rota limpa ou .html
        rota = f"servicos/{slug.replace('.html', '')}"
        urls.append({
            "loc": f"{DOMINIO_BASE}/{rota}",
            "lastmod": formatar_data_mtime(f),
            "changefreq": "weekly",
            "priority": "0.9"
        })

    # 3. Hubs Institucionais e de Conteúdo
    for f in sorted(glob.glob("conteudo/*.html")):
        slug = os.path.basename(f)
        rota = f"conteudo/{slug.replace('.html', '')}"
        urls.append({
            "loc": f"{DOMINIO_BASE}/{rota}",
            "lastmod": formatar_data_mtime(f),
            "changefreq": "daily",
            "priority": "0.8"
        })

    # 4. Matérias Jornalísticas (Notícias, Política, Atualidades)
    pastas_noticias = [
        ("noticias", "0.7", "daily"),
        ("politica", "0.7", "daily"),
        ("atualidades", "0.7", "daily")
    ]
    
    for pasta, prio, freq in pastas_noticias:
        if not os.path.exists(pasta):
            continue
        for f in sorted(glob.glob(f"{pasta}/*.html")):
            with open(f, "r", encoding="utf-8", errors="ignore") as pagina:
                if 'noindex,follow' in pagina.read():
                    continue
            nome_arquivo = os.path.basename(f)
            if nome_arquivo == "index.html":
                continue
            
            urls.append({
                "loc": f"{DOMINIO_BASE}/{pasta}/{nome_arquivo}",
                "lastmod": formatar_data_mtime(f),
                "changefreq": freq,
                "priority": prio
            })

    # Hubs e painéis locais também devem sobreviver às gerações do robô editorial.
    for pasta, prio in [("guias", "0.8"), ("clima", "0.8")]:
        for path in sorted(Path(pasta).rglob("*.html")):
            text = path.read_text(encoding="utf-8")
            robots = RobotsParser()
            robots.feed(text)
            if robots.noindex:
                continue
            relative = path.as_posix()
            rota = relative[:-10] if relative.endswith('index.html') else relative[:-5]
            urls.append({"loc": f"{DOMINIO_BASE}/{rota}", "lastmod": formatar_data_mtime(path), "changefreq": "daily", "priority": prio})

    # Construção do XML
    xml_linhas = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for item in urls:
        xml_linhas.append("  <url>")
        xml_linhas.append(f"    <loc>{item['loc']}</loc>")
        xml_linhas.append(f"    <lastmod>{item['lastmod']}</lastmod>")
        xml_linhas.append(f"    <changefreq>{item['changefreq']}</changefreq>")
        xml_linhas.append(f"    <priority>{item['priority']}</priority>")
        xml_linhas.append("  </url>")

    xml_linhas.append("</urlset>")
    conteudo_sitemap = "\n".join(xml_linhas)

    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(conteudo_sitemap)

    print(f"[OK] sitemap.xml gerado com sucesso! Total de URLs indexadas: {len(urls)}")

if __name__ == "__main__":
    gerar_sitemap()
