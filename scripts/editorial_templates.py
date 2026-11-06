import html
from scripts.editorial_images import image_for
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def render(item, folder):
    illustration=image_for(item)
    title=html.escape(item['titulo'])
    original=item.get('link_oficial','')
    if not original.startswith(('https://agenciabrasil.ebc.com.br/','https://www.camara.leg.br/','https://www12.senado.leg.br/')):
        original=''
    source='<a href="'+html.escape(original,quote=True)+'" target="_blank" rel="noopener noreferrer">Consultar a publicação de origem ↗</a>' if original else 'A fonte original não foi identificada nesta migração.'
    edited=item.get('editorial_v4',False)
    status='Síntese automatizada com auxílio de IA. Confira os fatos na fonte original.' if edited else 'Acervo em revisão editorial. O texto anteriormente republicado foi retirado desta página.'
    body=item.get('corpo_html','') if edited else '<p>Estamos reorganizando o acervo para oferecer informação com contexto e atribuição clara. Enquanto esta matéria não passa pelo novo processo, consulte a publicação de origem.</p>'
    route='/'+folder+'/'+item.get('pagina_local',item['slug']+'.html')
    description=html.escape(item.get('resumo','') if edited else 'Item do acervo em revisão editorial. Consulte a publicação original.',quote=True)
    content=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} | Cidadão Agora</title><meta name="description" content="{description}"><link rel="canonical" href="https://cidadaoagora.com.br{route}">{'' if edited else '<meta name="robots" content="noindex,follow">'}<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/v4/v4.css?v=4.0"><script defer src="/assets/v4/v4-shell.js?v=4.0"></script></head><body><main class="v4-article v4-width"><a href="/conteudo/{'politica' if folder=='politica' else 'noticias'}" class="v4-label">← Voltar à editoria</a><p class="v4-label">{html.escape(item.get('categoria','Informação pública'))}</p><h1>{title}</h1><p class="v4-article-deck">{html.escape(item.get('resumo','')) if edited else 'Este conteúdo faz parte do acervo do portal.'}</p><div class="v4-editorial-note">{status}<br>{source}<br>{html.escape(item.get('coletado_em',''))}</div><figure><img src="{html.escape(illustration['src'],quote=True)}" alt="{html.escape(illustration['alt'],quote=True)}" width="1536" height="1024"><figcaption>{html.escape(illustration['caption'])}</figcaption></figure><div class="v4-article-body">{item.get('destaques_html','') if edited else ''}{body}</div><div class="v4-editorial-note">Fonte: {html.escape(item.get('fonte','Publicação identificada no link de origem'))}. {source}</div></main></body></html>'''
    return content

def write(item, folder):
    target=ROOT/folder/item.get('pagina_local',item['slug']+'.html')
    target.write_text(render(item,folder),encoding='utf-8')
