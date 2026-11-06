"""Banco próprio de ilustrações temáticas; não importa fotos sem licença verificada."""
import unicodedata

ILLUSTRATIONS = {
    'comercio': ('Porto comercial e contêineres', ['balanca comercial', 'exporta', 'importa', 'porto', 'conteiner', 'carga', 'mercadoria']),
    'economia': ('Orçamento, compras e economia', ['dolar', 'juros', 'inflacao', 'ibovespa', 'selic', 'economia', 'preco', 'financeir']),
    'instituicoes': ('Instituições públicas brasileiras', ['ministerio', 'presidente', 'senado', 'senador', 'congresso', 'governo', 'deputad', 'politica']),
    'justica': ('Justiça e direitos', ['tribunal', 'supremo', 'acordo', 'colaboracao', 'investiga', 'indeniza', 'justica', 'falencia']),
    'moradia': ('Moradia rural e comunidade', ['moradia', 'habitacion', 'minha casa', 'rural', 'quilombol']),
    'saude': ('Saúde e formação médica', ['medic', 'saude', 'hospital', 'exame', 'graduacao']),
    'clima': ('Paisagens brasileiras entre sol e chuva', ['energia', 'energetic', 'renovav', 'solar', 'clima', 'ambient', 'indigena']),
}

def image_for(item):
    text = ' '.join(str(item.get(k, '')) for k in ('titulo', 'resumo', 'categoria'))
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().lower()
    weights = {'comercio': 3, 'economia': 2, 'instituicoes': 1, 'justica': 2, 'moradia': 4, 'saude': 4, 'clima': 3}
    scores = {key: weights[key] * sum(1 for term in terms if term in text) for key, (_, terms) in ILLUSTRATIONS.items()}
    topic = max(scores, key=scores.get)
    if not scores[topic]:
        return {'src': '/assets/v4/brasil-cotidiano.webp', 'alt': 'Ilustração do cotidiano brasileiro gerada por IA; não retrata o fato noticiado.', 'caption': 'Ilustração gerada por IA. Não retrata o acontecimento noticiado.'}
    subject = ILLUSTRATIONS[topic][0]
    src = '/assets/v4/clima-brasil.webp' if topic == 'clima' else '/assets/v4/editorial/' + topic + '.webp'
    return {'src': src, 'alt': subject + '. Ilustração conceitual gerada por IA; não retrata o fato noticiado.', 'caption': subject + ' — ilustração gerada por IA. Não retrata o acontecimento noticiado.'}
