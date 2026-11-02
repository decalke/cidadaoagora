import os
import re
import json
import time
import urllib.request
import urllib.error

# Modelos do Gemini em ordem de prioridade
MODELOS_GEMINI = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
]

def obter_chave_api():
    """Busca a chave da API em variáveis de ambiente ou em arquivo .env"""
    chave = os.environ.get("GEMINI_API_KEY", "").strip()
    if chave:
        return chave

    # Tenta carregar de um arquivo .env na raiz do projeto se existir
    raiz = os.path.abspath(os.path.join(os.path.dirname(__file__)))
    caminho_env = os.path.join(raiz, ".env")
    if os.path.exists(caminho_env):
        try:
            with open(caminho_env, "r", encoding="utf-8") as f:
                for linha in f:
                    linha = linha.strip()
                    if linha.startswith("GEMINI_API_KEY="):
                        return linha.split("=", 1)[1].strip().strip('"').strip("'")
        except Exception:
            pass

    return ""

def limpar_texto_puro(texto_html_ou_puro):
    """Remove marcações HTML residuais para enviar texto limpo à IA"""
    if not texto_html_ou_puro:
        return ""
    texto = re.sub(r'<[^>]+>', ' ', texto_html_ou_puro)
    texto = re.sub(r'\s+', ' ', texto)
    return texto.strip()

def reescrever_com_ia(titulo_original, conteudo_texto, categoria="Notícias", orgao="Agência Brasil"):
    """
    Recebe os dados apurados da notícia original e utiliza a IA do Google Gemini
    para gerar uma matéria jornalística 100% inédita, reestruturada e original,
    evitando reprovação por 'conteúdo copiado' no Google AdSense.
    
    Retorna um dicionário com:
      - titulo: novo título exclusivo
      - resumo: lead inédito
      - destaques: lista de bullet points principais
      - corpo_html: matéria completa reescrita com estilos Tailwind limpos
    Ou None em caso de falha/ausência de chave (acionando o fallback).
    """
    chave = obter_chave_api()
    if not chave:
        return None

    texto_limpo = limpar_texto_puro(conteudo_texto)
    # Se o texto for muito curto, não tem substância suficiente para reescrever
    if len(texto_limpo) < 150:
        return None

    # Limita o texto de entrada para não estourar tokens desnecessariamente
    if len(texto_limpo) > 6000:
        texto_limpo = texto_limpo[:6000]

    prompt = f"""Você é o editor-chefe e jornalista sênior do portal 'Cidadão Agora' (Brasil).
Sua missão é reescrever a matéria apurada abaixo com uma ESTRUTURA JORNALÍSTICA TOTALMENTE INÉDITA, rica em utilidade pública e linguagem clara para o leitor brasileiro.

Categoria: {categoria}
Fonte da apuração original: {orgao}
Título original de referência: {titulo_original}

Fatos apurados na matéria:
{texto_limpo}

DIRETRIZES EDITORIAIS OBRIGATÓRIAS:
1. NÃO COPIE TRECHOS: Reescreva todas as ideias com vocabulário próprio, parágrafos inéditos e ordem renovada de apresentação.
2. VERACIDADE RIGOROSA: Mantenha com total exatidão todos os fatos, nomes de autoridades, dados numéricos, percentuais, datas e valores citados.
3. NOVO TÍTULO: Crie uma manchete jornalística inédita, informativa, profissional e engajadora (sem sensacionalismo ou clickbait).
4. RESUMO/LEAD: Escreva um lead conciso (2 a 3 frases) contextualizando o ocorrido e o impacto para a sociedade.
5. DESTAQUES: Selecione 3 pontos centrais ('O que você precisa saber') em frases curtas e objetivas.
6. CORPO DO ARTIGO FORMATADO:
   - Divida a matéria em 3 a 5 seções bem encadeadas.
   - Use títulos de seção com a tag <h2 class='text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3 tracking-tight'>.
   - Parágrafos claros e bem espaçados com <p class='text-base sm:text-lg text-slate-700 leading-relaxed font-normal mb-5'>.
   - Destaque frases de impacto ou declarações com <blockquote class='border-l-4 border-blue-600 bg-slate-50 p-4 sm:p-5 rounded-r-2xl my-6 text-slate-700 italic font-medium text-base shadow-sm'>.
   - Inclua no final uma seção prática: '📌 O que muda para o cidadão' ou 'Próximos passos', explicando os efeitos práticos da notícia.
   - Conclua com um parágrafo breve de crédito: <p class='text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100'>Reportagem editorial Cidadão Agora, com informações apuradas pelos canais oficiais da {orgao}.</p>

Retorne a resposta ESTRITAMENTE em formato JSON no seguinte formato:
{{
  "titulo": "Novo título inédito aqui",
  "resumo": "Lead jornalístico conciso aqui...",
  "destaques": [
    "Ponto principal 1",
    "Ponto principal 2",
    "Ponto principal 3"
  ],
  "corpo_html": "corpo formatado em HTML..."
}}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "application/json"
        }
    }

    payload_bytes = json.dumps(payload).encode("utf-8")

    for modelo in MODELOS_GEMINI:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={chave}"
        req = urllib.request.Request(
            endpoint,
            data=payload_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                resposta_bruta = resp.read().decode("utf-8")
                dados_resp = json.loads(resposta_bruta)

                # Extrai o texto da resposta do Gemini
                candidatos = dados_resp.get("candidates", [])
                if not candidatos:
                    continue

                conteudo_resposta = candidatos[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                if not conteudo_resposta:
                    continue

                # Remove eventuais blocos de código ```json ... ``` se vierem
                texto_limpo_json = conteudo_resposta.strip()
                if texto_limpo_json.startswith("```"):
                    texto_limpo_json = re.sub(r'^```(?:json)?\s*', '', texto_limpo_json)
                    texto_limpo_json = re.sub(r'\s*```$', '', texto_limpo_json)

                resultado = json.loads(texto_limpo_json)

                # Valida se os campos essenciais estão presentes
                if "titulo" in resultado and "corpo_html" in resultado and len(resultado["titulo"]) > 10:
                    print(f"  ✨ [IA Gemini] Matéria reescrita com sucesso usando {modelo}: '{resultado['titulo'][:50]}...'")
                    
                    # Pausa de cortesia de 2 segundos para respeitar a cota gratuita (15 RPM)
                    time.sleep(2.5)
                    return resultado

        except urllib.error.HTTPError as e:
            # Se for 404 (modelo não existe), tenta o próximo da lista
            if e.code == 404:
                continue
            # Se for 429 (rate limit), espera um pouco
            elif e.code == 429:
                print(f"  ⚠️ [IA Gemini] Limite de requisições atingido (429). Aguardando 5s...")
                time.sleep(5)
                continue
            else:
                print(f"  ⚠️ [IA Gemini] Erro HTTP {e.code} ao consultar modelo {modelo}: {e.reason}")
        except Exception as e:
            print(f"  ⚠️ [IA Gemini] Falha ao processar com {modelo}: {e}")

    return None

def formatar_bloco_destaques(destaques):
    """Gera um card visual moderno com os destaques gerados pela IA"""
    if not destaques or not isinstance(destaques, list):
        return ""
    
    itens = "".join([f"<li class='flex items-start gap-2.5'><span class='text-blue-600 font-extrabold mt-0.5 text-base'>•</span><span>{d}</span></li>" for d in destaques if d])
    if not itens:
        return ""

    return f"""
    <div class="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 sm:p-6 my-6 shadow-sm">
      <div class="flex items-center gap-2 text-blue-900 font-black text-sm uppercase tracking-wider mb-3">
        <i data-lucide="sparkles" class="w-4 h-4 text-blue-600"></i>
        <span>Pontos Principais da Notícia</span>
      </div>
      <ul class="space-y-2.5 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
        {itens}
      </ul>
    </div>
    """

def inserir_ads_no_corpo(corpo_html):
    """Insere o anúncio do Google AdSense no meio do texto da matéria após o 2º ou 3º parágrafo"""
    bloco_ad = """
    <div class="ad-placeholder rounded-xl p-4 text-center text-xs text-slate-400 font-medium my-8">
      <span>[Espaço Reservado - Banner Google AdSense In-Article Meio da Notícia]</span>
    </div>
    """
    # Encontra posições de fechamento de </p>
    posicoes = [m.end() for m in re.finditer(r'</p>', corpo_html, flags=re.IGNORECASE)]
    if len(posicoes) >= 3:
        ponto_insercao = posicoes[2] # Após o 3º parágrafo
        return corpo_html[:ponto_insercao] + "\n" + bloco_ad + "\n" + corpo_html[ponto_insercao:]
    elif len(posicoes) >= 2:
        ponto_insercao = posicoes[1] # Após o 2º parágrafo
        return corpo_html[:ponto_insercao] + "\n" + bloco_ad + "\n" + corpo_html[ponto_insercao:]
    return corpo_html
