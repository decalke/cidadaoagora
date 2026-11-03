import os
import sys
import time
import argparse
import subprocess
from bs4 import BeautifulSoup
from editor_ia import reescrever_com_ia, formatar_bloco_destaques, inserir_ads_no_corpo

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

PASTAS_ALVO = ["noticias", "politica", "atualidades"]

BADGE_EDITORIAL = """
<span class="inline-flex items-center gap-1 font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
  <i data-lucide="sparkles" class="w-3 h-3 text-blue-600"></i>
  <span>Edição & Estrutura Cidadão Agora</span>
</span>
"""

def salvar_commit_periodico(contador):
    """Faz commit a cada lote de matérias para não perder progresso"""
    try:
        subprocess.run(["git", "config", "--global", "user.name", "Robô Editorial Cidadão Agora [IA]"], check=False)
        subprocess.run(["git", "config", "--global", "user.email", "bot-editorial@cidadaoagora.com"], check=False)
        subprocess.run(["git", "add", "-A"], check=False)
        subprocess.run(["git", "commit", "-m", f"chore(ia): reescrita editorial de lote ({contador} matérias) [skip ci]"], check=False)
        subprocess.run(["git", "push", "origin", "HEAD:main"], check=False)
        print(f"  💾 Progresso salvo e commit enviado para o GitHub ({contador} matérias)!")
    except Exception as e:
        print(f"  ⚠️ Aviso ao fazer commit periódico: {e}")

def processar_arquivo_materia(caminho_arquivo, pasta):
    with open(caminho_arquivo, "r", encoding="utf-8", errors="ignore") as f:
        html_original = f.read()

    # Se já foi reescrita pela IA, pula
    if "Edição & Estrutura Cidadão Agora" in html_original or "Pontos Principais da Notícia" in html_original:
        return False, "já_reescrita"

    soup = BeautifulSoup(html_original, "html.parser")

    # Extrai o título atual
    h1 = soup.find("h1")
    if not h1:
        return False, "sem_h1"
    titulo_atual = h1.get_text(strip=True)

    # Extrai a área de texto original
    div_prose = soup.find("div", class_="prose")
    if not div_prose:
        return False, "sem_prose"
    texto_prose = div_prose.get_text(separator="\n", strip=True)

    if len(texto_prose) < 120:
        return False, "texto_curto"

    # Categoria e Fonte
    categoria = "Notícias e Legislação"
    badge_cat = soup.find("span", class_="uppercase")
    if badge_cat:
        categoria = badge_cat.get_text(strip=True)

    fonte = "Canais Oficiais / Agência Brasil"
    if pasta == "politica":
        categoria = "Política & Leis"
        fonte = "Congresso, STF e Planalto (Canais Oficiais)"
    elif pasta == "atualidades":
        categoria = "Economia, Trabalho e Benefícios"

    print(f"\n[IA] Reestruturando: '{titulo_atual[:55]}...' ({pasta})")

    artigo_ia = reescrever_com_ia(
        titulo_original=titulo_atual,
        conteudo_texto=texto_prose,
        categoria=categoria,
        orgao=fonte
    )

    if not artigo_ia or not artigo_ia.get("titulo") or not artigo_ia.get("corpo_html"):
        print("  ⚠️ Falha ao reescrever matéria. Mantendo versão original.")
        return False, "falha_ia"

    novo_titulo = artigo_ia["titulo"]
    novo_resumo = artigo_ia.get("resumo", "")
    destaques = artigo_ia.get("destaques", [])
    novo_corpo_html = inserir_ads_no_corpo(artigo_ia["corpo_html"])

    # 1. Atualiza <title>
    if soup.title:
        soup.title.string = f"{novo_titulo} - Cidadão Agora"

    # 2. Atualiza meta descriptions e OpenGraph
    meta_desc = soup.find("meta", attrs={"name": "description"})
    if meta_desc and novo_resumo:
        meta_desc["content"] = novo_resumo

    og_title = soup.find("meta", attrs={"property": "og:title"})
    if og_title:
        og_title["content"] = novo_titulo

    og_desc = soup.find("meta", attrs={"property": "og:description"})
    if og_desc and novo_resumo:
        og_desc["content"] = novo_resumo

    # 3. Atualiza <h1>
    h1.string = novo_titulo

    # 4. Atualiza o parágrafo de lead/resumo logo abaixo do H1
    lead_p = h1.find_next_sibling("p")
    if lead_p and novo_resumo:
        lead_p.string = novo_resumo

    # 5. Insere badge editorial no cabeçalho da notícia se ainda não tiver
    badge_container = soup.find("div", class_="flex-wrap")
    if badge_container and "Edição & Estrutura" not in str(badge_container):
        badge_soup = BeautifulSoup(BADGE_EDITORIAL, "html.parser")
        badge_container.insert(1, badge_soup)

    # 6. Insere o card de Destaques
    if destaques:
        card_destaques_html = formatar_bloco_destaques(destaques)
        card_soup = BeautifulSoup(card_destaques_html, "html.parser")
        div_prose.insert_before(card_soup)

    # 7. Substitui o corpo da matéria pelo conteúdo novo formatado
    div_prose.clear()
    corpo_soup = BeautifulSoup(novo_corpo_html, "html.parser")
    div_prose.append(corpo_soup)

    # Salva o arquivo atualizado
    with open(caminho_arquivo, "w", encoding="utf-8") as f:
        f.write(str(soup))

    print(f"  ✅ Matéria 100% reestruturada com sucesso!")
    # Pausa de segurança de 4.2 segundos para garantir taxa <= 14 requisições/minuto
    time.sleep(4.2)
    return True, "sucesso"

def executar(limite=0):
    total_processadas = 0
    total_sucesso = 0
    total_ja_reescritas = 0

    print("=" * 60)
    print("🚀 INICIANDO REESCRITA EDITORIAL EM LOTE DE TODAS AS MATÉRIAS")
    print(f"Limite configurado: {'TODAS' if limite == 0 else f'{limite} matérias'}")
    print("=" * 60)

    for pasta in PASTAS_ALVO:
        pasta_dir = os.path.join(BASE_DIR, pasta)
        if not os.path.exists(pasta_dir):
            continue

        arquivos = [f for f in sorted(os.listdir(pasta_dir)) if f.endswith(".html")]

        for arq in arquivos:
            caminho = os.path.join(pasta_dir, arq)
            sucesso, status = processar_arquivo_materia(caminho, pasta)

            if status == "já_reescrita":
                total_ja_reescritas += 1
                continue

            total_processadas += 1

            if sucesso:
                total_sucesso += 1
                # Salva commit e envia a cada 20 matérias reescritas
                if total_sucesso % 5 == 0:
                    salvar_commit_periodico(total_sucesso)

            if limite > 0 and total_sucesso >= limite:
                print(f"\n🎯 Limite de {limite} matérias atingido!")
                break

        if limite > 0 and total_sucesso >= limite:
            break

    # Salva o commit final
    if total_sucesso > 0:
        salvar_commit_periodico(total_sucesso)

    print("\n" + "=" * 60)
    print(f"🎉 FINALIZADO!")
    print(f"  • Matérias reescritas com sucesso: {total_sucesso}")
    print(f"  • Matérias que já estavam no formato novo: {total_ja_reescritas}")
    print(f"  • Total processadas neste ciclo: {total_processadas}")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reescreve histórico de matérias com IA Gemini")
    parser.add_argument("--limite", type=int, default=0, help="Limite de matérias a reescrever (0 para todas)")
    args = parser.parse_args()
    executar(limite=args.limite)
