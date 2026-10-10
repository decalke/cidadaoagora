import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
import unicodedata
from datetime import datetime
from bs4 import BeautifulSoup

# Feeds Oficiais de Dados Abertos voltados a Atualidades, Economia Prática, Trabalho & Consumidor
FEEDS_ATUALIDADES = [
    { "orgao": "Economia & Finanças", "categoria": "Finanças do Cidadão", "url": "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml" },
    { "orgao": "Trabalho & Previdência", "categoria": "Trabalho & Benefícios", "url": "https://agenciabrasil.ebc.com.br/rss/geral/feed.xml" }
]

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ATUALIDADES_DIR = os.path.join(BASE_DIR, "atualidades")
CONTEUDO_DIR = os.path.join(BASE_DIR, "conteudo")

os.makedirs(ATUALIDADES_DIR, exist_ok=True)
os.makedirs(CONTEUDO_DIR, exist_ok=True)

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

    return "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&auto=format&fit=crop&q=80"

def extrair_artigo_formatado(url_materia, texto_fallback):
    if not url_materia or not url_materia.startswith("http"):
        return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

    try:
        req = urllib.request.Request(
            url_materia,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            
            corpo_div = soup.find('div', class_=re.compile(r'(field--name-body|node__content|news-content|article__content)'))
            if not corpo_div:
                article = soup.find('article')
                if article:
                    corpo_div = article

            if corpo_div:
                for irrelevante in corpo_div.find_all(['script', 'style', 'iframe', 'form']):
                    irrelevante.decompose()

                paragrafos = []
                elementos = corpo_div.find_all(['p', 'h2', 'h3'])
                
                ad_inserido = False
                for idx, elem in enumerate(elementos):
                    txt = elem.get_text().strip()
                    if len(txt) > 25 and not any(ignorar in txt.lower() for ignorar in ['leia também', 'veja mais', 'compartilhe']):
                        if elem.name in ['h2', 'h3']:
                            paragrafos.append(f"<h2 class='text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3 tracking-tight'>{txt}</h2>")
                        else:
                            paragrafos.append(f"<p class='text-base sm:text-lg text-slate-700 leading-relaxed font-normal'>{txt}</p>")

                        if idx == 2 and not ad_inserido:
                            paragrafos.append("""
                    <div class="ad-placeholder rounded-xl p-4 text-center text-xs text-slate-400 font-medium my-8">
                      <span>[Espaço Reservado - Banner Google AdSense In-Article]</span>
                    </div>
                    """)
                            ad_inserido = True

                if len(paragrafos) >= 2:
                    return "\n".join(paragrafos)

    except Exception:
        pass

    return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

def gerar_pagina_materia(materia):
    arquivo_destino = os.path.join(ATUALIDADES_DIR, materia['pagina_local'])

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- Google tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-C8ZSTXP9WQ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-C8ZSTXP9WQ');
  </script>
  <!-- Google AdSense Oficial -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1173007636108448" crossorigin="anonymous"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{materia['titulo']} - Atualidades Cidadão Agora</title>
  <meta name="description" content="{materia['resumo'][:150]}...">
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

  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="../conteudo/atualidades.html" class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">
          CA
        </div>
        <div>
          <span class="text-base font-black text-slate-900">Info<span class="text-emerald-600">Atualidades</span></span>
          <span class="text-[10px] block text-slate-400 font-medium">Voltar para Atualidades</span>
        </div>
      </a>
      <a href="../index.html" class="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Todos os Serviços</span>
      </a>
    </div>
  </header>

  <div class="max-w-4xl mx-auto w-full px-4 pt-4">
    <div class="ad-placeholder rounded-xl p-3 text-center text-xs text-slate-400 font-medium">
      <span>[Espaço Reservado - Banner Google AdSense 728x90 Topo Matéria]</span>
    </div>
  </div>

  <main class="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
    <article class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
      
      <div class="space-y-3 border-b border-slate-100 pb-6">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {materia['categoria']}
          </span>
          <span class="text-xs text-slate-400 font-medium">• Publicado em {materia['coletado_em']}</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
          {materia['titulo']}
        </h1>
        <p class="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
          {materia['resumo']}
        </p>
      </div>

      <div class="w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
        <img src="{materia['imagem']}" alt="{materia['titulo']}" class="w-full h-full object-cover">
      </div>

      <div class="prose max-w-none text-slate-700 space-y-4 pt-2">
        {materia['corpo_html']}
      </div>

      <div class="mt-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
        <h3 class="font-bold text-emerald-950 text-sm">Ferramentas Gratuitas Relacionadas:</h3>
        <p class="text-xs text-emerald-800">Use os simuladores oficiais do Cidadão Agora para conferir seus direitos:</p>
        <div class="flex flex-wrap gap-2 pt-1">
          <a href="../servicos/consulta-veicular-fipe.html" class="bg-white px-3 py-1.5 rounded-lg border border-emerald-300 font-bold text-xs text-emerald-900 hover:bg-emerald-100">Consulta Placa & FIPE</a>
          <a href="../servicos/calculadora-rescisao-clt.html" class="bg-white px-3 py-1.5 rounded-lg border border-emerald-300 font-bold text-xs text-emerald-900 hover:bg-emerald-100">Calculadora Rescisão CLT</a>
          <a href="../servicos/consulta-mei-cnpj.html" class="bg-white px-3 py-1.5 rounded-lg border border-emerald-300 font-bold text-xs text-emerald-900 hover:bg-emerald-100">Consultar MEI & CNPJ</a>
        </div>
      </div>

      <div class="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <span>Fonte das informações: {materia['fonte']}</span>
        <a href="{materia['link_oficial']}" target="_blank" rel="noopener noreferrer" class="font-bold text-emerald-700 hover:underline">
          Ver publicação original nos canais oficiais →
        </a>
      </div>

    </article>
  </main>

  <footer class="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs text-center">
    <p>Cidadão Agora Brasil © 2026 - Informação de utilidade pública e dados abertos.</p>
  </footer>

  <script>lucide.createIcons();</script>
</body>
</html>
"""
    with open(arquivo_destino, 'w', encoding='utf-8') as f:
        f.write(html)

def executar_agente():
    print("Iniciando Agente de Atualidades & Finanças...")
    materias_coletadas = []
    slugs_vistos = set()

    for feed_info in FEEDS_ATUALIDADES:
        try:
            req = urllib.request.Request(
                feed_info['url'],
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read()
                root = ET.fromstring(xml_data)

                for item in root.findall('.//item')[:15]:
                    titulo = limpar_html(item.find('title').text if item.find('title') is not None else "")
                    link = item.find('link').text.strip() if item.find('link') is not None else ""
                    descricao = limpar_html(item.find('description').text if item.find('description') is not None else "")
                    imagem = extrair_imagem(item)

                    slug = criar_slug(titulo)
                    if not slug or slug in slugs_vistos:
                        continue
                    slugs_vistos.add(slug)

                    corpo = extrair_artigo_formatado(link, descricao)
                    data_hora = datetime.now().strftime("%d/%m/%Y às %H:%M")

                    materia = {
                        "titulo": titulo,
                        "resumo": descricao[:220] + "..." if len(descricao) > 220 else descricao,
                        "corpo_html": corpo,
                        "imagem": imagem,
                        "slug": slug,
                        "pagina_local": f"{slug}.html",
                        "link_oficial": link,
                        "categoria": feed_info['categoria'],
                        "orgao": feed_info['orgao'],
                        "fonte": f"EBC / {feed_info['orgao']} (Canais Oficiais)",
                        "coletado_em": data_hora
                    }

                    gerar_pagina_materia(materia)
                    materias_coletadas.append(materia)

        except Exception as e:
            print(f"Erro ao processar feed {feed_info['url']}: {e}")

    # Salva os arquivos de dados para o frontend carregar
    payload = {
        "ultima_atualizacao": datetime.now().strftime("%d/%m/%Y às %H:%M:%S"),
        "total": len(materias_coletadas),
        "atualidades": materias_coletadas
    }

    json_path = os.path.join(CONTEUDO_DIR, "atualidades.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    js_path = os.path.join(CONTEUDO_DIR, "atualidades_dados.js")
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(f"const DADOS_ATUALIDADES = {json.dumps(payload, ensure_ascii=False, indent=2)};\n")

    print(f"Agente finalizado com sucesso! {len(materias_coletadas)} matérias de atualidades geradas.")

if __name__ == "__main__":
    executar_agente()
