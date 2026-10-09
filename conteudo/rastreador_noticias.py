import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
import time
from datetime import datetime

# Feeds Oficiais de Dados Públicos do Governo Federal (EBC / Agência Brasil)
# Livre de direitos autorais para reprodução com crédito à fonte
FEEDS = [
    { "categoria": "Economia & Tributos", "url": "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml" },
    { "categoria": "Política & Leis", "url": "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml" },
    { "categoria": "Geral & Cidadania", "url": "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml" },
    { "categoria": "Últimas Notícias", "url": "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml" }
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(BASE_DIR, "noticias.json")

def limpar_html(texto):
    if not texto:
        return ""
    # Remove tags HTML e entidades
    limpo = re.sub(r'<[^>]+>', '', texto)
    limpo = limpo.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&amp;', '&').replace('&ccedil;', 'ç')
    return limpo.strip()

def coletar_noticias():
    todas_noticias = []
    titulos_vistos = set()

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando rastreamento de notícias oficiais...")

    for feed_info in FEEDS:
        url = feed_info["url"]
        categoria = feed_info["categoria"]
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'InfoCidadaoBot/1.0 (Portal de Notícias Públicas)'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read()
                root = ET.fromstring(xml_data)
                items = root.findall('.//item')

                for item in items:
                    titulo = item.find('title')
                    titulo_texto = titulo.text if titulo is not None else ""
                    titulo_limpo = limpar_html(titulo_texto)

                    if not titulo_limpo or titulo_limpo in titulos_vistos:
                        continue
                    
                    titulos_vistos.add(titulo_limpo)

                    link = item.find('link')
                    link_texto = link.text if link is not None else "#"

                    descricao = item.find('description')
                    desc_texto = limpar_html(descricao.text) if descricao is not None else ""
                    # Limita resumo para card
                    resumo = desc_texto[:280] + "..." if len(desc_texto) > 280 else desc_texto

                    pub_date = item.find('pubDate')
                    data_pub = pub_date.text if pub_date is not None else ""

                    todas_noticias.append({
                        "titulo": titulo_limpo,
                        "resumo": resumo,
                        "link": link_texto,
                        "categoria": categoria,
                        "data": data_pub,
                        "fonte": "Agência Brasil / EBC (Comunicação Pública Oficial)",
                        "coletado_em": datetime.now().strftime("%d/%m/%Y às %H:%M")
                    })
        except Exception as e:
            print(f"Erro ao consultar {url}: {e}")

    # Salva no arquivo JSON consumido pelo site
    if todas_noticias:
        dados_salvar = {
            "ultima_atualizacao": datetime.now().strftime("%d/%m/%Y às %H:%M:%S"),
            "total": len(todas_noticias),
            "noticias": todas_noticias[:30] # Guarda as 30 notícias mais recentes
        }
        with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(dados_salvar, f, ensure_ascii=False, indent=2)
        print(f"Sucesso! {len(todas_noticias)} notícias oficiais salvas em {OUTPUT_JSON}")
    else:
        print("Nenhuma notícia nova coletada nesta rodada.")

if __name__ == "__main__":
    coletar_noticias()
