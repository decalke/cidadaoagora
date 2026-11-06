"""Aplica a nova estrutura visual preservando formulários, IDs e URLs existentes."""
import json
import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
LOADER='<link rel="stylesheet" href="/assets/v4/v4.css?v=4.0"><script defer src="/assets/v4/v4-shell.js?v=4.0"></script>'
IMAGE='/assets/v4/brasil-cotidiano.webp'

def process(path):
    text=path.read_text(encoding='utf-8')
    original=text
    if '/assets/v4/v4-shell.js' not in text:
        text=text.replace('</head>',LOADER+'</head>')
    # As tecnologias opcionais são inicializadas pela escolha de privacidade do novo shell.
    text=re.sub(r'<script\b[^>]+src=["\'][^"\']*(?:googletagmanager|pagead2\.googlesyndication)[^"\']*["\'][^>]*>\s*</script>','',text,flags=re.I)
    text=re.sub(r'<script\b[^>]*>(?:(?!</script>)[\s\S])*?gtag\((?:(?!</script>)[\s\S])*?</script>','',text,flags=re.I)
    if any(part in path.parts for part in ['noticias','politica','atualidades']):
        text=re.sub(r'(<img\b[^>]*\bsrc=["\'])https?://[^"\']*(?:ebc\.com\.br|agenciabrasil|flickr)[^"\']*(["\'])',lambda m:m[1]+IMAGE+m[2],text,flags=re.I)
        text=re.sub(r'(<meta\b[^>]*(?:og:image|twitter:image)[^>]*content=["\'])https?://[^"\']*(["\'])',lambda m:m[1]+'https://cidadaoagora.com.br'+IMAGE+m[2],text,flags=re.I)
        if IMAGE in text and 'v4-image-caption' not in text:
            text=re.sub(r'(<img\b[^>]*src=["\']'+re.escape(IMAGE)+r'["\'][^>]*>)',r'\1<p class="v4-image-caption">Ilustração gerada por IA. Não retrata o fato noticiado.</p>',text,count=1,flags=re.I)
    if text!=original:
        path.write_text(text,encoding='utf-8')

def editorial_feed():
    from scripts.editorial_images import image_for
    entries=[]
    for rel in ['noticias/noticias.json','conteudo/politica.json','conteudo/atualidades.json']:
        p=ROOT/rel
        if not p.exists():
            continue
        data=json.loads(p.read_text(encoding='utf-8'))
        items=data.get('noticias',[]) if isinstance(data,dict) else []
        folder='politica' if 'politica' in rel else 'atualidades' if 'atualidades' in rel else 'noticias'
        for item in items:
            if not item.get('editorial_v4'):
                continue
            illustration=image_for(item)
            entries.append({'title':item['titulo'],'summary':item.get('resumo',''),'category':item.get('categoria','Notícias'),'url':'/'+folder+'/'+item.get('pagina_local',item['slug']+'.html'),'image':illustration['src'],'imageAlt':illustration['alt'],'source':item.get('link_oficial',''),'date':item.get('coletado_em','')})
    (ROOT/'assets/v4/editorial.json').write_text(json.dumps({'items':entries},ensure_ascii=False),encoding='utf-8')

if __name__=='__main__':
    for folder in ['', 'servicos','noticias','politica','atualidades','conteudo','guias','consulta-veicular','clima']:
        base=ROOT/folder
        paths=[ROOT/'index.html'] if not folder else base.glob('*.html')
        for path in paths:
            process(path)
    editorial_feed()
    print('Identidade v4 aplicada. Formulários e rotas preservados.')
