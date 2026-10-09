import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
import unicodedata
from datetime import datetime

# Feeds Oficiais de Dados Públicos do Governo Federal (EBC / Agência Brasil)
FEEDS = [
    { "categoria": "Economia & Tributos", "url": "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml" },
    { "categoria": "Política & Leis", "url": "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml" },
    { "categoria": "Geral & Cidadania", "url": "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml" },
    { "categoria": "Últimas Notícias", "url": "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml" }
]

# Detecta dinamicamente a pasta raiz do projeto (funciona no Windows, Linux e GitHub Actions)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
NOTICIAS_DIR = os.path.join(BASE_DIR, "noticias")
OUTPUT_JSON = os.path.join(NOTICIAS_DIR, "noticias.json")

def limpar_html(texto):
    if not texto:
        return ""
    limpo = re.sub(r'<[^>]+>', '', texto)
    limpo = limpo.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&amp;', '&').replace('&ccedil;', 'ç')
    return limpo.strip()

def criar_slug(titulo):
    # Transforma título em URL amigável para SEO
    n = unicodedata.normalize('NFKD', titulo).encode('ASCII', 'ignore').decode('ASCII')
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', n).strip('-').lower()
    return slug[:70] if len(slug) > 70 else slug

def extrair_imagem(item):
    # Procura a tag imagem-destaque ou enclosure
    img_tag = item.find('imagem-destaque')
    if img_tag is not None and img_tag.text:
        return img_tag.text.strip()
    
    enc = item.find('enclosure')
    if enc is not None and 'url' in enc.attrib:
        return enc.attrib['url']

    # Procura qualquer tag com link de imagem
    for child in item:
        if 'image' in child.tag.lower() and child.text and 'http' in child.text:
            return child.text.strip()

    # Imagem padrão de utilidade pública do governo se não houver
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80"

def gerar_pagina_materia(noticia):
    # Gera a página HTML individual da notícia dentro do próprio site para indexar no Google
    arquivo_html = os.path.join(NOTICIAS_DIR, noticia["slug"] + ".html")
    
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{noticia['titulo']} - InfoCidadão</title>
  <meta name="description" content="{noticia['resumo']}">
  <meta property="og:title" content="{noticia['titulo']}">
  <meta property="og:description" content="{noticia['resumo']}">
  <meta property="og:image" content="{noticia['imagem']}">
  <meta property="og:type" content="article">

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    .ad-placeholder {{
      border: 1px dashed #cbd5e1;
      background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px);
    }}
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased">

  <!-- CABEÇALHO -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="../index.html" class="flex items-center space-x-2.5">
        <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg">IC</div>
        <div>
          <span class="text-lg font-black text-slate-900">Info<span class="text-blue-600">Notícias</span></span>
          <span class="text-[10px] block text-slate-400 font-medium">Voltar para o Portal</span>
        </div>
      </a>
      <a href="index.html" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Todas as Notícias</span>
      </a>
    </div>
  </header>

  <!-- BANNER ADSENSE TOPO -->
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
          <span class="text-slate-400 font-medium">• Publicado em {noticia['coletado_em']}</span>
        </div>
        
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
          {noticia['titulo']}
        </h1>
        
        <p class="text-base text-slate-600 font-medium leading-relaxed">
          {noticia['resumo']}
        </p>
      </div>

      <!-- IMAGEM GRANDE OFICIAL DENTRO DO PRÓPRIO SITE -->
      <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[480px] bg-slate-900 flex items-center justify-center">
        <img src="{noticia['imagem']}" alt="{noticia['titulo']}" class="w-full h-full object-cover">
      </div>

      <!-- TEXTO DA MATÉRIA COMPLETA -->
      <div class="prose max-w-none text-slate-700 text-base leading-relaxed space-y-4 pt-4">
        <p>
          {noticia['conteudo_completo']}
        </p>
        
        <!-- Bloco AdSense no Meio do Texto -->
        <div class="ad-placeholder rounded-xl p-4 text-center text-xs text-slate-400 font-medium my-6">
          <span>[Espaço Reservado - Banner Google AdSense In-Article Meio do Artigo]</span>
        </div>

        <p>
          Esta notícia é de caráter público e oficial, transmitida e disponibilizada pela <strong>{noticia['fonte']}</strong>.
        </p>
      </div>

      <!-- BOX DE CRÉDITO E LINK OFICIAL DA EBC -->
      <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-8">
        <div>
          <span class="text-slate-500 block font-medium">Fonte Governamental Oficial:</span>
          <span class="font-bold text-slate-800">{noticia['fonte']}</span>
        </div>
        <a href="{noticia['link_oficial']}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
          <span>Ver Matéria na Íntegra na EBC</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>

    </article>

    <!-- BANNER RODAPÉ ADSENSE -->
    <div class="ad-placeholder rounded-xl p-4 text-center text-xs text-slate-400 font-medium mt-6">
      <span>[Espaço Reservado - Banner Google AdSense 728x90 Inferior]</span>
    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs text-center">
    <p>InfoCidadão Brasil © 2026 - Cobertura de notícias oficiais e utilidades públicas.</p>
  </footer>

  <script>
    if (window.lucide) window.lucide.createIcons();
  </script>
</body>
</html>
"""
    with open(arquivo_html, "w", encoding="utf-8") as f:
        f.write(html)

def coletar_e_gerar():
    todas_noticias = []
    titulos_vistos = set()

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Rastreando notícias e gerando páginas...")

    for feed_info in FEEDS:
        url = feed_info["url"]
        categoria = feed_info["categoria"]
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
                    
                    resumo = desc_texto[:240] + "..." if len(desc_texto) > 240 else desc_texto
                    imagem_url = extrair_imagem(item)
                    slug = criar_slug(titulo_limpo)

                    item_noticia = {
                        "titulo": titulo_limpo,
                        "resumo": resumo,
                        "conteudo_completo": desc_texto if len(desc_texto) > 100 else resumo + " Mais detalhes sobre este programa e as medidas do governo federal estão sendo atualizados continuamente pela nossa central de informações.",
                        "imagem": imagem_url,
                        "slug": slug,
                        "pagina_local": f"{slug}.html",
                        "link_oficial": link_oficial,
                        "categoria": categoria,
                        "fonte": "Agência Brasil / EBC (Empresa Brasil de Comunicação)",
                        "coletado_em": datetime.now().strftime("%d/%m/%Y às %H:%M")
                    }

                    # Gera a página HTML local completa para o Google indexar
                    gerar_pagina_materia(item_noticia)
                    todas_noticias.append(item_noticia)

        except Exception as e:
            print(f"Erro ao processar {url}: {e}")

    # Salva o arquivo JSON e o arquivo JS compatível com file:///
    if todas_noticias:
        dados_salvar = {
            "ultima_atualizacao": datetime.now().strftime("%d/%m/%Y às %H:%M:%S"),
            "total": len(todas_noticias),
            "noticias": todas_noticias[:40]
        }
        with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(dados_salvar, f, ensure_ascii=False, indent=2)
        
        # Grava também noticias_dados.js para abrir direto no navegador sem restrição de CORS local
        js_file = os.path.join(NOTICIAS_DIR, "noticias_dados.js")
        with open(js_file, "w", encoding="utf-8") as f:
            f.write("const DADOS_NOTICIAS = " + json.dumps(dados_salvar, ensure_ascii=False, indent=2) + ";")

        print(f"Concluído! {len(todas_noticias)} páginas de notícias geradas com imagens em {NOTICIAS_DIR}")

if __name__ == "__main__":
    coletar_e_gerar()
