import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
import unicodedata
from datetime import datetime

# Feeds Oficiais do Governo Federal sobre Política, Leis, Eleições, STF e Tributos
# Cobertura oficial da imprensa pública (Agência Brasil / EBC / TSE / STF / Congresso)
FEEDS_POLITCAA = [
    { "orgao": "Congresso & Planalto", "categoria": "Política Nacional", "url": "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml" },
    { "orgao": "Justiça & Eleitoral", "categoria": "Justiça & TSE", "url": "https://agenciabrasil.ebc.com.br/rss/justica/feed.xml" },
    { "orgao": "Receita & Ministério da Fazenda", "categoria": "Novos Tributos & Economia", "url": "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml" }
]

# Detecta dinamicamente a pasta raiz do projeto (funciona no Windows, Linux e GitHub Actions)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
POLITCAA_DIR = os.path.join(BASE_DIR, "politica")
CONTEUDO_DIR = os.path.join(BASE_DIR, "conteudo")

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

def gerar_pagina_politica(noticia):
    arquivo_html = os.path.join(POLITCAA_DIR, noticia["slug"] + ".html")
    
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{noticia['titulo']} - InfoPolítica</title>
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
        <div class="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white font-extrabold text-lg">CA</div>
        <div>
          <span class="text-lg font-black text-slate-900">Info<span class="text-rose-600">Política</span></span>
          <span class="text-[10px] block text-slate-400 font-medium">Voltar para o Portal Principal</span>
        </div>
      </a>
      <a href="../conteudo/politica.html" class="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Todas as Matérias Políticas</span>
      </a>
    </div>
  </header>

  <!-- BANNER ADSENSE TOPO -->
  <div class="max-w-5xl mx-auto w-full px-4 pt-4">
    <div class="ad-placeholder rounded-xl p-3 text-center text-xs text-slate-400 font-medium">
      <span>[Espaço Reservado - Banner Google AdSense 728x90 Topo Matéria Política]</span>
    </div>
  </div>

  <main class="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
    <article class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
      
      <div class="space-y-3 border-b border-slate-100 pb-6">
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {noticia['categoria']}
          </span>
          <span class="text-slate-400 font-medium">• Órgão: {noticia['orgao']} • {noticia['coletado_em']}</span>
        </div>
        
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
          {noticia['titulo']}
        </h1>
        
        <p class="text-base text-slate-600 font-medium leading-relaxed">
          {noticia['resumo']}
        </p>
      </div>

      <!-- FOTO OFCAIAL GRANDE DENTRO DO SITE -->
      <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[480px] bg-slate-900 flex items-center justify-center">
        <img src="{noticia['imagem']}" alt="{noticia['titulo']}" class="w-full h-full object-cover">
      </div>

      <!-- TEXTO COMPLETO -->
      <div class="prose max-w-none text-slate-700 text-base leading-relaxed space-y-4 pt-4">
        <p>
          {noticia['conteudo_completo']}
        </p>
        
        <!-- Bloco AdSense no Meio do Texto -->
        <div class="ad-placeholder rounded-xl p-4 text-center text-xs text-slate-400 font-medium my-6">
          <span>[Espaço Reservado - Banner Google AdSense In-Article Política]</span>
        </div>

        <p>
          Esta publicação tem caráter de interesse cívico e transparência governamental, transmitida com base nos dados públicos oficiais da <strong>{noticia['fonte']}</strong>.
        </p>
      </div>

      <!-- BOX DE CRÉDITO E LINK OFCAIAL -->
      <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-8">
        <div>
          <span class="text-slate-500 block font-medium">Fonte Oficial:</span>
          <span class="font-bold text-slate-800">{noticia['fonte']}</span>
        </div>
        <a href="{noticia['link_oficial']}" target="_blank" rel="noopener noreferrer" class="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
          <span>Acessar Publicação Oficial Original</span>
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
    <p>Cidadão Agora Brasil © 2026 - Cobertura de atos do Congresso, TSE, STF e Governo Federal.</p>
  </footer>

  <script>
    if (window.lucide) window.lucide.createIcons();
  </script>
</body>
</html>
"""
    with open(arquivo_html, "w", encoding="utf-8") as f:
        f.write(html)

def rastrear_politica():
    materias_politica = []
    titulos_vistos = set()

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Rastreando canais oficiais de política e leis...")

    for feed_info in FEEDS_POLITCAA:
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
                    
                    resumo = desc_texto[:240] + "..." if len(desc_texto) > 240 else desc_texto
                    imagem_url = extrair_imagem(item)
                    slug = criar_slug(titulo_limpo)

                    materia = {
                        "titulo": titulo_limpo,
                        "resumo": resumo,
                        "conteudo_completo": desc_texto if len(desc_texto) > 100 else resumo + " Mais desdobramentos sobre este projeto de lei e deliberação pública seguem sendo acompanhados pelo portal Cidadão Agora.",
                        "imagem": imagem_url,
                        "slug": slug,
                        "pagina_local": f"{slug}.html",
                        "link_oficial": link_oficial,
                        "categoria": categoria,
                        "orgao": orgao,
                        "fonte": "Agência Brasil / EBC / Canais Oficiais de Imprensa do Governo",
                        "coletado_em": datetime.now().strftime("%d/%m/%Y às %H:%M")
                    }

                    gerar_pagina_politica(materia)
                    materias_politica.append(materia)

        except Exception as e:
            print(f"Erro ao processar {url}: {e}")

    if materias_politica:
        dados_salvar = {
            "ultima_atualizacao": datetime.now().strftime("%d/%m/%Y às %H:%M:%S"),
            "total": len(materias_politica),
            "noticias": materias_politica[:35]
        }
        
        # Salva em JSON e JS para carregar 100% liso no navegador
        for destino in [POLITCAA_DIR, CONTEUDO_DIR]:
            json_file = os.path.join(destino, "politica.json")
            js_file = os.path.join(destino, "politica_dados.js")
            
            with open(json_file, "w", encoding="utf-8") as f:
                json.dump(dados_salvar, f, ensure_ascii=False, indent=2)
            
            with open(js_file, "w", encoding="utf-8") as f:
                f.write("const DADOS_POLITCAA = " + json.dumps(dados_salvar, ensure_ascii=False, indent=2) + ";")

        print(f"Concluído! {len(materias_politica)} matérias políticas geradas com imagens em {POLITCAA_DIR}")

if __name__ == "__main__":
    rastrear_politica()
