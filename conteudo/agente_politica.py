import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
import sys
import unicodedata
from datetime import datetime
from bs4 import BeautifulSoup

# Feeds Oficiais do Governo Federal sobre Política, Leis, Eleições, STF e Tributos
FEEDS_POLITICA = [
    { "orgao": "Congresso & Planalto", "categoria": "Política Nacional", "url": "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml" },
    { "orgao": "Justiça & Eleitoral", "categoria": "Justiça & TSE", "url": "https://agenciabrasil.ebc.com.br/rss/justica/feed.xml" },
    {"orgao": "Direitos & Cidadania", "categoria": "Cidadania & Leis", "url": "https://agenciabrasil.ebc.com.br/rss/direitos-humanos/feed.xml"}
]

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
POLITICA_DIR = os.path.join(BASE_DIR, "politica")
CONTEUDO_DIR = os.path.join(BASE_DIR, "conteudo")

# Importa o módulo editorial com IA para reescrita original
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
try:
    from editor_ia import reescrever_com_ia, formatar_bloco_destaques, inserir_ads_no_corpo
except ImportError:
    reescrever_com_ia = None
    formatar_bloco_destaques = lambda d: ""
    inserir_ads_no_corpo = lambda c: c

def limpar_html(texto):
    if not texto:
        return ""
    limpo = re.sub(r'<[^>]+>', '', texto)
    limpo = limpo.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&amp;', '&').replace('&ccedil;', 'ç')
    return limpo.strip()

def criar_slug(titulo):
    n = unicodedata.normalize('NFKD', titulo).encode('ASCII', 'ignore').decode('ASCII')
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', n).strip('-').lower()
    return slug[:70] if len(slug) > 70 else slug

def extrair_imagem(item):
    img_tag = item.find('imagem-destaque')
    if img_tag is not None and img_tag.text:
        return img_tag.text.strip()
    
    enc = item.find('enclosure')
    if enc is not None and 'url' in enc.attrib:
        return enc.attrib['url']

    for child in item:
        if 'image' in child.tag.lower() and child.text and 'http' in child.text:
            return child.text.strip()

    return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80"

def extrair_artigo_politica_formatado(url_materia, texto_fallback):
    if not url_materia or not url_materia.startswith("http"):
        return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

    try:
        req = urllib.request.Request(
            url_materia,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')

            content_div = soup.find('div', class_='content') or soup.find('article') or soup.find('div', class_='region-content')
            if not content_div:
                return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

            elementos_formatados = []
            tags_relevantes = content_div.find_all(['p', 'h2', 'h3', 'blockquote'])

            for el in tags_relevantes:
                if el.find_parent('nav') or el.find_parent('footer') or 'share' in str(el.get('class', [])):
                    continue

                texto_puro = el.get_text(strip=True)
                if not texto_puro or len(texto_puro) < 3:
                    continue

                if 'Edição:' in texto_puro or 'Compartilhe:' in texto_puro:
                    elementos_formatados.append(f"<p class='text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100'>{el.decode_contents()}</p>")
                    continue

                if el.name == 'h2':
                    elementos_formatados.append(f"<h2 class='text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3 tracking-tight'>{el.decode_contents()}</h2>")
                elif el.name == 'h3':
                    elementos_formatados.append(f"<h3 class='text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-2 tracking-tight'>{el.decode_contents()}</h3>")
                elif el.name == 'blockquote':
                    elementos_formatados.append(f"<blockquote class='border-l-4 border-blue-600 bg-slate-50 p-4 sm:p-5 rounded-r-2xl my-6 text-slate-700 italic font-medium text-base shadow-sm'>{el.decode_contents()}</blockquote>")
                elif el.name == 'p':
                    elementos_formatados.append(f"<p class='text-base sm:text-lg text-slate-700 leading-relaxed font-normal mb-5'>{el.decode_contents()}</p>")

            if elementos_formatados:
                return inserir_ads_no_corpo("\n".join(elementos_formatados))

    except Exception as e:
        print(f"Aviso: Não foi possível obter HTML de {url_materia} ({e}).")

    partes = [p.strip() for p in texto_fallback.split('\n') if p.strip()]
    if partes:
        return "".join([f"<p class='text-base text-slate-700 leading-relaxed mb-4'>{p}</p>" for p in partes])
    return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

def gerar_pagina_politica(noticia):
    arquivo_html = os.path.join(POLITICA_DIR, noticia["slug"] + ".html")
    
    badge_editorial = """
    <span class="inline-flex items-center gap-1 font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
      <i data-lucide="sparkles" class="w-3 h-3 text-blue-600"></i>
      <span>Edição & Estrutura Cidadão Agora</span>
    </span>
    """ if noticia.get("reescrito_ia") else ""

    destaques_bloco = noticia.get("destaques_html", "")

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{noticia['titulo']} - Cidadão Agora Política</title>
  <meta name="description" content="{noticia['resumo']}">
  <meta property="og:title" content="{noticia['titulo']}">
  <meta property="og:description" content="{noticia['resumo']}">
  <meta property="og:image" content="{noticia['imagem']}">
  <meta property="og:type" content="article">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
  <meta name="theme-color" content="#2563EB">
  <link rel="canonical" href="https://cidadaoagora.com.br/politica/{noticia['slug']}.html">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "{json.dumps(noticia.get('titulo', ''))[1:-1]}",
    "image": ["{noticia.get('imagem', '')}"],
    "datePublished": "{datetime.now().isoformat()}",
    "dateModified": "{datetime.now().isoformat()}",
    "author": [{{
      "@type": "Organization",
      "name": "Redação Cidadão Agora"
    }}],
    "publisher": {{
      "@type": "Organization",
      "name": "Cidadão Agora",
      "logo": {{
        "@type": "ImageObject",
        "url": "https://cidadaoagora.com.br/apple-touch-icon.png"
      }}
    }},
    "description": "{json.dumps(noticia.get('resumo', ''))[1:-1]}"
  }}
  </script>
  <link rel="stylesheet" href="../css/design-system.css">
  <link rel="stylesheet" href="../css/tailwind.min.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1173007636108448" crossorigin="anonymous"></script>
  <script defer src="../js/ads-safe.js"></script>
  <script src="../js/lucide.min.js"></script>
  <style>
    .ad-placeholder {{
      border: 1px dashed #cbd5e1;
      background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px);
    }}
    .prose p {{
      margin-bottom: 1.25rem;
      line-height: 1.8;
    }}
    .prose strong {{
      color: #0f172a;
      font-weight: 700;
    }}
    .prose a {{
      color: #2563eb;
      text-decoration: underline;
    }}
    .prose a:hover {{
      color: #1d4ed8;
    }}
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased">

  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="../index.html" class="flex items-center space-x-2.5">
        <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">CA</div>
        <div>
          <span class="text-lg font-black text-slate-900">Cidadão<span class="text-blue-600">Agora</span></span>
          <span class="text-[10px] block text-slate-400 font-medium">Voltar para o Início</span>
        </div>
      </a>
      <a href="../conteudo/politica.html" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Painel de Política</span>
      </a>
    </div>
  </header>

  <div class="max-w-5xl mx-auto w-full px-4 pt-4">
    <div class="ad-placeholder rounded-xl p-3 text-center text-xs text-slate-400 font-medium">
      <span>[Espaço Reservado - Banner Google AdSense 728x90 Topo da Matéria]</span>
    </div>
  </div>

  <main class="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
    <article class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
      
      <div class="space-y-3 border-b border-slate-100 pb-6">
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            {noticia['categoria']}
          </span>
          <span class="font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {noticia['orgao']}
          </span>
          {badge_editorial}
          <span class="text-slate-400 font-medium">• {noticia['coletado_em']}</span>
        </div>
        
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {noticia['titulo']}
        </h1>
        
        <p class="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          {noticia['resumo']}
        </p>
      </div>

      <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[500px] bg-slate-900 flex items-center justify-center">
        <img src="{noticia['imagem']}" alt="{noticia['titulo']}" class="w-full h-full object-cover">
      </div>

      <!-- DESTAQUES DA MATÉRIA -->
      {destaques_bloco}

      <!-- CORPO FORMATADO -->
      <div class="prose max-w-none pt-4">
        {noticia['corpo_html']}
      </div>

      <!-- CRÉDITO E LINK OFICIAL -->
      <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-8">
        <div>
          <span class="text-slate-500 block font-medium">Fonte e Apuração Original:</span>
          <span class="font-bold text-slate-800">{noticia['fonte']}</span>
        </div>
        <a href="{noticia['link_oficial']}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm">
          <span>Ver Apuração Original na EBC</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>

    </article>

    <div class="ad-placeholder rounded-xl p-4 text-center text-xs text-slate-400 font-medium mt-6">
      <span>[Espaço Reservado - Banner Google AdSense 728x90 Inferior]</span>
    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs text-center">
    <p>Cidadão Agora Política © 2026 - Transparência pública e cobertura de leis.</p>
  </footer>

  <script>
    if (window.lucide) window.lucide.createIcons();
  </script>
</body>
</html>
"""
    with open(arquivo_html, "w", encoding="utf-8") as f:
        f.write(html)

def coletar_e_gerar_politica():
    todas_materias = []
    titulos_vistos = set()

    # Cache de matérias já salvas
    cache_existentes = {}
    json_politica = os.path.join(POLITICA_DIR, "politica.json")
    if os.path.exists(json_politica):
        try:
            with open(json_politica, "r", encoding="utf-8") as f:
                dados_velhos = json.load(f)
                for item in dados_velhos.get("politica", []):
                    if item.get("link_oficial"):
                        cache_existentes[item["link_oficial"]] = item
        except Exception:
            pass

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Rastreando matérias de política com IA...")

    for feed_info in FEEDS_POLITICA:
        url = feed_info["url"]
        categoria = feed_info["categoria"]
        orgao = feed_info["orgao"]
        
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
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

                    link_oficial = item.find('link').text if item.find('link') is not None else "#"
                    descricao = item.find('description')
                    desc_texto = limpar_html(descricao.text) if descricao is not None else ""
                    resumo_padrao = desc_texto[:240] + "..." if len(desc_texto) > 240 else desc_texto
                    imagem_url = extrair_imagem(item)

                    # Se já existe no cache e o HTML está salvo no disco, reaproveita
                    if link_oficial in cache_existentes:
                        item_existente = cache_existentes[link_oficial]
                        caminho_antigo = os.path.join(POLITICA_DIR, item_existente.get("slug", "") + ".html")
                        if os.path.exists(caminho_antigo):
                            todas_materias.append(item_existente)
                            continue

                    corpo_bruto = extrair_artigo_politica_formatado(link_oficial, desc_texto)

                    titulo_final = titulo_limpo
                    resumo_final = resumo_padrao
                    slug_final = criar_slug(titulo_limpo)
                    destaques_html = ""
                    corpo_final = corpo_bruto
                    foi_reescrito = False

                    # Aciona reescrita jornalística inédita com Gemini
                    if reescrever_com_ia:
                        print(f"-> Analisando e reescrevendo com IA: '{titulo_limpo[:45]}...'")
                        artigo_ia = reescrever_com_ia(
                            titulo_original=titulo_limpo,
                            conteudo_texto=corpo_bruto,
                            categoria=categoria,
                            orgao=f"EBC / {orgao}"
                        )
                        if artigo_ia:
                            titulo_final = artigo_ia["titulo"]
                            resumo_final = artigo_ia.get("resumo", resumo_padrao)
                            slug_final = criar_slug(titulo_final)
                            destaques_html = formatar_bloco_destaques(artigo_ia.get("destaques", []))
                            corpo_final = inserir_ads_no_corpo(artigo_ia["corpo_html"])
                            foi_reescrito = True

                    item_noticia = {
                        "titulo": titulo_final,
                        "resumo": resumo_final,
                        "conteudo_completo": desc_texto,
                        "corpo_html": corpo_final,
                        "destaques_html": destaques_html,
                        "imagem": imagem_url,
                        "slug": slug_final,
                        "pagina_local": f"{slug_final}.html",
                        "link_oficial": link_oficial,
                        "categoria": categoria,
                        "orgao": orgao,
                        "fonte": f"EBC / {orgao} (Canais Oficiais)",
                        "coletado_em": datetime.now().strftime("%d/%m/%Y às %H:%M"),
                        "reescrito_ia": foi_reescrito
                    }

                    gerar_pagina_politica(item_noticia)
                    todas_materias.append(item_noticia)

        except Exception as e:
            print(f"Erro ao processar política {url}: {e}")

    if todas_materias:
        dados_salvar = {
            "ultima_atualizacao": datetime.now().strftime("%d/%m/%Y às %H:%M:%S"),
            "total": len(todas_materias),
            "politica": todas_materias[:40]
        }
        
        json_politica = os.path.join(POLITICA_DIR, "politica.json")
        with open(json_politica, "w", encoding="utf-8") as f:
            json.dump(dados_salvar, f, ensure_ascii=False, indent=2)

        js_politica = os.path.join(POLITICA_DIR, "politica_dados.js")
        with open(js_politica, "w", encoding="utf-8") as f:
            f.write("const DADOS_POLITICA = " + json.dumps(dados_salvar, ensure_ascii=False, indent=2) + ";")

        json_conteudo = os.path.join(CONTEUDO_DIR, "politica.json")
        with open(json_conteudo, "w", encoding="utf-8") as f:
            json.dump(dados_salvar, f, ensure_ascii=False, indent=2)

        js_conteudo = os.path.join(CONTEUDO_DIR, "politica_dados.js")
        with open(js_conteudo, "w", encoding="utf-8") as f:
            f.write("const DADOS_POLITICA = " + json.dumps(dados_salvar, ensure_ascii=False, indent=2) + ";")

        print(f"Concluído! {len(todas_materias)} matérias de política salvas com sucesso.")

if __name__ == "__main__":
    coletar_e_gerar_politica()
