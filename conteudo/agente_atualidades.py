import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
import sys
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

    return "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&auto=format&fit=crop&q=80"

def extrair_artigo_formatado(url_materia, texto_fallback):
    if not url_materia or not url_materia.startswith("http"):
        return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

    try:
        req = urllib.request.Request(
            url_materia,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')

            content_div = soup.find('div', class_='content') or soup.find('article') or soup.find('div', class_='region-content')
            if not content_div:
                return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

            elementos = []
            for el in content_div.find_all(['p', 'h2', 'h3', 'blockquote']):
                if el.find_parent('nav') or el.find_parent('footer') or 'share' in str(el.get('class', [])):
                    continue
                texto = el.get_text(strip=True)
                if not texto or len(texto) < 3:
                    continue

                if 'Edição:' in texto or 'Compartilhe:' in texto:
                    elementos.append(f"<p class='text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100'>{el.decode_contents()}</p>")
                    continue

                if el.name == 'h2':
                    elementos.append(f"<h2 class='text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3 tracking-tight'>{el.decode_contents()}</h2>")
                elif el.name == 'h3':
                    elementos.append(f"<h3 class='text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-2 tracking-tight'>{el.decode_contents()}</h3>")
                elif el.name == 'blockquote':
                    elementos.append(f"<blockquote class='border-l-4 border-blue-600 bg-slate-50 p-4 sm:p-5 rounded-r-2xl my-6 text-slate-700 italic font-medium text-base shadow-sm'>{el.decode_contents()}</blockquote>")
                elif el.name == 'p':
                    elementos.append(f"<p class='text-base sm:text-lg text-slate-700 leading-relaxed font-normal mb-5'>{el.decode_contents()}</p>")

            if elementos:
                return inserir_ads_no_corpo("\n".join(elementos))

    except Exception as e:
        print(f"Aviso: Não foi possível obter HTML de {url_materia} ({e}).")

    partes = [p.strip() for p in texto_fallback.split('\n') if p.strip()]
    if partes:
        return "".join([f"<p class='text-base text-slate-700 leading-relaxed mb-4'>{p}</p>" for p in partes])
    return f"<p class='text-base text-slate-700 leading-relaxed'>{texto_fallback}</p>"

def gerar_pagina_materia(materia):
    arquivo_html = os.path.join(ATUALIDADES_DIR, materia["slug"] + ".html")

    badge_editorial = """
    <span class="inline-flex items-center gap-1 font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
      <i data-lucide="sparkles" class="w-3 h-3 text-blue-600"></i>
      <span>Edição & Estrutura Cidadão Agora</span>
    </span>
    """ if materia.get("reescrito_ia") else ""

    destaques_bloco = materia.get("destaques_html", "")

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{materia['titulo']} - Cidadão Agora</title>
  <meta name="description" content="{materia['resumo']}">
  <meta property="og:title" content="{materia['titulo']}">
  <meta property="og:description" content="{materia['resumo']}">
  <meta property="og:image" content="{materia['imagem']}">
  <meta property="og:type" content="article">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
  <meta name="theme-color" content="#2563EB">
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
          <span class="text-[10px] block text-slate-400 font-medium">Voltar para o Portal</span>
        </div>
      </a>
      <a href="../conteudo/atualidades.html" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Todas as Atualidades</span>
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
            {materia['categoria']}
          </span>
          <span class="font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {materia['orgao']}
          </span>
          {badge_editorial}
          <span class="text-slate-400 font-medium">• {materia['coletado_em']}</span>
        </div>
        
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {materia['titulo']}
        </h1>
        
        <p class="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          {materia['resumo']}
        </p>
      </div>

      <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[500px] bg-slate-900 flex items-center justify-center">
        <img src="{materia['imagem']}" alt="{materia['titulo']}" class="w-full h-full object-cover">
      </div>

      <!-- DESTAQUES DA MATÉRIA -->
      {destaques_bloco}

      <!-- CORPO FORMATADO -->
      <div class="prose max-w-none pt-4">
        {materia['corpo_html']}
      </div>

      <!-- CRÉDITO E FONTE -->
      <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-8">
        <div>
          <span class="text-slate-500 block font-medium">Fonte e Apuração Original:</span>
          <span class="font-bold text-slate-800">{materia['fonte']}</span>
        </div>
        <a href="{materia['link_oficial']}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm">
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
    <p>Cidadão Agora Atualidades © 2026 - Conteúdo informativo e utilidade pública.</p>
  </footer>

  <script>
    if (window.lucide) window.lucide.createIcons();
  </script>
</body>
</html>
"""
    with open(arquivo_html, "w", encoding="utf-8") as f:
        f.write(html)

def executar_agente():
    materias_coletadas = []
    slugs_vistos = set()

    # Cache de matérias existentes
    cache_existentes = {}
    json_path = os.path.join(CONTEUDO_DIR, "atualidades.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                dados_velhos = json.load(f)
                for item in dados_velhos.get("atualidades", []):
                    if item.get("link_oficial"):
                        cache_existentes[item["link_oficial"]] = item
        except Exception:
            pass

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Iniciando agente de atualidades com redação de IA...")

    for feed_info in FEEDS_ATUALIDADES:
        try:
            req = urllib.request.Request(feed_info['url'], headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read()
                root = ET.fromstring(xml_data)

                for item in root.findall('.//item')[:15]:
                    titulo = limpar_html(item.find('title').text if item.find('title') is not None else "")
                    link = item.find('link').text.strip() if item.find('link') is not None else ""
                    descricao = limpar_html(item.find('description').text if item.find('description') is not None else "")
                    imagem = extrair_imagem(item)
                    resumo_padrao = descricao[:220] + "..." if len(descricao) > 220 else descricao

                    slug_base = criar_slug(titulo)
                    if not slug_base or slug_base in slugs_vistos:
                        continue
                    slugs_vistos.add(slug_base)

                    # Se já existe no cache e o arquivo existe no disco, reaproveita
                    if link in cache_existentes:
                        item_existente = cache_existentes[link]
                        caminho_antigo = os.path.join(ATUALIDADES_DIR, item_existente.get("slug", "") + ".html")
                        if os.path.exists(caminho_antigo):
                            materias_coletadas.append(item_existente)
                            continue

                    corpo_bruto = extrair_artigo_formatado(link, descricao)
                    data_hora = datetime.now().strftime("%d/%m/%Y às %H:%M")

                    titulo_final = titulo
                    resumo_final = resumo_padrao
                    slug_final = slug_base
                    destaques_html = ""
                    corpo_final = corpo_bruto
                    foi_reescrito = False

                    # Aciona reescrita jornalística inédita com Gemini
                    if reescrever_com_ia:
                        print(f"-> Analisando e reescrevendo com IA: '{titulo[:45]}...'")
                        artigo_ia = reescrever_com_ia(
                            titulo_original=titulo,
                            conteudo_texto=corpo_bruto,
                            categoria=feed_info['categoria'],
                            orgao=f"EBC / {feed_info['orgao']}"
                        )
                        if artigo_ia:
                            titulo_final = artigo_ia["titulo"]
                            resumo_final = artigo_ia.get("resumo", resumo_padrao)
                            slug_final = criar_slug(titulo_final)
                            destaques_html = formatar_bloco_destaques(artigo_ia.get("destaques", []))
                            corpo_final = inserir_ads_no_corpo(artigo_ia["corpo_html"])
                            foi_reescrito = True

                    materia = {
                        "titulo": titulo_final,
                        "resumo": resumo_final,
                        "corpo_html": corpo_final,
                        "destaques_html": destaques_html,
                        "imagem": imagem,
                        "slug": slug_final,
                        "pagina_local": f"{slug_final}.html",
                        "link_oficial": link,
                        "categoria": feed_info['categoria'],
                        "orgao": feed_info['orgao'],
                        "fonte": f"EBC / {feed_info['orgao']} (Canais Oficiais)",
                        "coletado_em": data_hora,
                        "reescrito_ia": foi_reescrito
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

    print(f"Agente finalizado com sucesso! {len(materias_coletadas)} matérias de atualidades processadas.")

if __name__ == "__main__":
    executar_agente()
