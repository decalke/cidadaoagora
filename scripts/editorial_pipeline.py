"""Edição automatizada: publica somente sínteses validadas, sem fallback de cópia."""
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime,timezone
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from editor_ia import obter_chave_api,reescrever_com_ia,formatar_bloco_destaques
from scripts.editorial_templates import write
FEEDS=[('noticias','Economia & cotidiano','https://agenciabrasil.ebc.com.br/rss/economia/feed.xml'),('politica','Política & direitos','https://agenciabrasil.ebc.com.br/rss/politica/feed.xml'),('noticias','Brasil & cidadania','https://agenciabrasil.ebc.com.br/rss/geral/feed.xml'),('politica','Justiça & direitos','https://agenciabrasil.ebc.com.br/rss/justica/feed.xml')]
PATHS={'noticias':'noticias/noticias.json','politica':'conteudo/politica.json','atualidades':'conteudo/atualidades.json'}
def get(url):
    if not url.startswith('https://agenciabrasil.ebc.com.br/'):
        raise ValueError('Origem não autorizada')
    req=urllib.request.Request(url,headers={'User-Agent':'CidadaoAgora/4.0 (+https://cidadaoagora.com.br/conteudo/sobre)'})
    with urllib.request.urlopen(req,timeout=25) as response:
        data=response.read()
        if data[:2]==bytes([31,139]):
            import gzip
            data=gzip.decompress(data)
        return data
def source_text(url):
    soup=BeautifulSoup(get(url),'html.parser')
    body=soup.select_one('[property="content:encoded"]') or soup.select_one('.field--name-body') or soup.find('article')
    if not body:
        raise ValueError('Corpo da fonte não localizado')
    for node in body.select('script,style,nav,footer,.related-news,.social-share'):
        node.decompose()
    return '\n'.join(p.get_text(' ',strip=True) for p in body.find_all(['p','h2','h3']) if len(p.get_text())>30)
def main(limit):
    if not obter_chave_api():
        raise RuntimeError('Gemini não configurado; edição não publicada.')
    bases={}
    for folder,rel in PATHS.items():
        path=ROOT/rel
        data=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {'noticias':[]}
        bases[folder]=data
    links={item.get('link_oficial'):item for data in bases.values() for item in data.get('noticias',[])}
    feeds=[]
    for folder,category,url in FEEDS:
        try:
            feed=ET.fromstring(get(url))
            candidates=[]
            for node in feed.findall('./channel/item')[:12]:
                link=node.findtext('link','').strip();title=BeautifulSoup(node.findtext('title',''),'html.parser').get_text(' ',strip=True)
                if link and title and not links.get(link,{}).get('editorial_v4'):
                    candidates.append((folder,category,link,title))
            feeds.append(candidates)
        except Exception as error:
            print('Feed indisponível: '+category+' ('+type(error).__name__+').')
    # Intercala as editorias para não concentrar todo o lote em uma única categoria.
    queue=[]
    for i in range(12):
        for feed in feeds:
            if i<len(feed):queue.append(feed[i])
    processed=0;attempts=0;seen=set()
    for folder,category,link,title in queue:
        if processed>=limit or attempts>=limit*2:break
        if link in seen:continue
        seen.add(link);attempts+=1
        try:
            text=source_text(link)
            result=reescrever_com_ia(title,text,category,'Agência Brasil / EBC')
            if not result:
                print('Matéria adiada: IA não retornou uma síntese válida.')
                continue
            old=links.get(link,{})
            slug=old.get('slug') or re.sub(r'[^a-z0-9]+','-',__import__('unicodedata').normalize('NFKD',result['titulo']).encode('ascii','ignore').decode().lower()).strip('-')[:65]+'-'+hashlib.sha1(link.encode()).hexdigest()[:8]
            item={'titulo':result['titulo'],'resumo':result['resumo'],'corpo_html':result['corpo_html'],'destaques_html':formatar_bloco_destaques(result['destaques']),'slug':slug,'pagina_local':slug+'.html','link_oficial':link,'categoria':category,'fonte':'Agência Brasil / EBC','imagem':'/assets/v4/brasil-cotidiano.webp','coletado_em':datetime.now(timezone.utc).isoformat(),'reescrito_ia':True,'editorial_v4':True,'modelo':result['modelo']}
            write(item,folder)
            bases[folder]['noticias']=[item]+[x for x in bases[folder].get('noticias',[]) if x.get('link_oficial')!=link]
            bases[folder]['noticias']=bases[folder]['noticias'][:80]
            links[link]=item;processed+=1;time.sleep(3)
        except Exception as error:
            print('Matéria adiada ('+type(error).__name__+'). Nenhuma cópia publicada.')
    for folder,rel in PATHS.items():
        data=bases[folder];data['total']=len(data.get('noticias',[]));data['ultima_atualizacao']=datetime.now(timezone.utc).isoformat();(ROOT/rel).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    from scripts.aplicar_identidade_v4 import editorial_feed
    editorial_feed()
    report={'processed':processed,'attempts':attempts,'copiedFallback':False,'date':datetime.now(timezone.utc).isoformat()}
    (ROOT/'editorial-pipeline-report.json').write_text(json.dumps(report),encoding='utf-8')
    print('Sínteses publicadas: '+str(processed))
    if not processed and not any(x.get('editorial_v4') for x in links.values()):
        raise RuntimeError('Nenhuma síntese disponível. Verificar API e fontes antes de publicar a edição.')
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--limit',type=int,default=6);args=parser.parse_args();main(max(1,min(args.limit,24)))
