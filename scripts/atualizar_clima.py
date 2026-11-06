"""Atualiza cópias públicas de fontes oficiais; não recebe dados de visitantes."""
import concurrent.futures
import json
import os
import re
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'clima' / 'data'
DATA.mkdir(parents=True, exist_ok=True)
HEADERS = {'User-Agent': 'CidadaoAgoraClima/1.0 (+https://cidadaoagora.com.br/clima/)'}

def download(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        data = response.read()
        if data[:2] == bytes([31, 139]):
            import gzip
            data = gzip.decompress(data)
        return data

def write(name, value):
    target = DATA / name
    fd, tmp = tempfile.mkstemp(dir=DATA, suffix='.tmp')
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        json.dump(value, f, ensure_ascii=False, separators=(',', ':'))
    os.replace(tmp, target)

def now():
    return datetime.now(timezone.utc).isoformat()

def population():
    path = DATA / 'municipios.json'
    if path.exists():
        return
    source = 'https://servicodados.ibge.gov.br/api/v3/agregados/4714/periodos/2022/variaveis/93?localidades='
    def rows(level):
        data = json.loads(download(source + level + '[all]'))
        return data[0]['resultados'][0]['series']
    cities = []
    for row in rows('N6'):
        loc = row['localidade']
        name, uf = loc['nome'].rsplit(' - ', 1)
        value = row['serie']['2022']
        if not value.isdigit() or int(value) <= 0:
            raise ValueError('População municipal inválida')
        cities.append({'id':loc['id'], 'name':name, 'uf':uf, 'pop':int(value)})
    states = []
    for row in rows('N3'):
        loc = row['localidade']
        uf = next(c['uf'] for c in cities if c['id'].startswith(loc['id']))
        states.append({'id':loc['id'], 'name':loc['nome'], 'uf':uf, 'pop':int(row['serie']['2022'])})
    if len(states) != 27 or len(cities) < 5500:
        raise ValueError('Base incompleta')
    write('municipios.json', {'source':source+'N6[all]', 'year':2022, 'collectedAt':now(), 'states':states, 'cities':cities})

def alerts():
    source = 'https://apiprevmet3.inmet.gov.br/avisos/rss'
    feed = ET.fromstring(download(source))
    urls = list(dict.fromkeys(item.findtext('link') for item in feed.findall('./channel/item')))
    if any(not re.fullmatch(r'https://apiprevmet3\.inmet\.gov\.br/avisos/rss/\d+', url or '') for url in urls):
        raise ValueError('Link inesperado no RSS')
    ns = {'c':'urn:oasis:names:tc:emergency:cap:1.2'}
    def parse(url):
        root = ET.fromstring(download(url))
        text = lambda p: root.findtext(p, default='', namespaces=ns)
        if text('c:status') != 'Actual' or text('c:msgType') not in ('Alert','Update'):
            return None
        info = root.find('c:info', ns)
        if info is None:
            raise ValueError('CAP sem informações')
        get = lambda p: info.findtext('c:'+p, default='', namespaces=ns)
        onset, expires = get('onset') or get('effective') or text('c:sent'), get('expires')
        if not onset or not expires:
            raise ValueError('CAP sem validade')
        datetime.fromisoformat(onset); datetime.fromisoformat(expires)
        params = {p.findtext('c:valueName',namespaces=ns):p.findtext('c:value',default='',namespaces=ns) for p in info.findall('c:parameter',ns)}
        codes = sorted(set(re.findall(r'\((\d{7})\)', params.get('Municipios',''))))
        web = get('web')
        if not web.startswith('https://avisos.inmet.gov.br/'):
            web = 'https://avisos.inmet.gov.br/'
        return {'id':text('c:identifier'),'event':get('event'),'severity':get('severity'),'start':onset,'end':expires,'sent':text('c:sent'),'description':get('description'),'instruction':get('instruction'),'area':get('area/c:areaDesc'),'cities':codes,'url':web}
    # A atualização só é marcada como completa se todos os CAPs forem obtidos.
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        values = [a for a in pool.map(parse, urls) if a]
    if not values:
        # Um feed vazio não é usado para declarar normalidade nacional.
        raise ValueError('Feed vazio: manter cópia anterior e sua data')
    write('avisos.json', {'source':source,'collectedAt':now(),'complete':True,'unmapped':sum(not a['cities'] for a in values),'alerts':values})

def enso():
    source = 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml'
    from html import unescape
    html = download(source).decode('utf-8', errors='replace')
    text = re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]+>', ' ', html)))
    date = re.search(r'\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2})\b',text)
    status = re.search(r'ENSO Alert System Status:\s*(El Niño Advisory|La Niña Advisory|El Niño Watch|La Niña Watch|Not Active)',text)
    if not date or not status:
        raise ValueError('Boletim ENSO não reconhecido')
    write('enso.json', {'source':source,'collectedAt':now(),'issued':datetime.strptime(date[1],'%d %B %Y').date().isoformat(),'status':status[1]})

if __name__ == '__main__':
    import sys
    failures = []
    for name, task in [('IBGE',population),('INMET',alerts),('NOAA',enso)]:
        try:
            task()
            print(name + ': atualizado')
        except Exception as error:
            failures.append(name)
            print(name + ': falha; cópia anterior preservada. ' + str(error),file=sys.stderr)
    if failures:
        sys.exit(1)
