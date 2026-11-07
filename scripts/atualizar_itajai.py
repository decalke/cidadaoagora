"""Cópia periódica das medições públicas municipais, sem dados de visitantes."""
import json
import os
import tempfile
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://monitoramento.defesacivil.itajai.sc.gov.br/monitoramento/'


class PageParser(HTMLParser):
    page = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div' and attrs.get('id') == 'app' and 'data-page' in attrs:
            self.page = json.loads(attrs['data-page'])


def parse_page(html):
    parser = PageParser()
    parser.feed(html)
    props = (parser.page or {}).get('props', {})
    stations = props.get('estacoes')
    if not isinstance(stations, list) or not stations:
        raise ValueError('Fonte sem estações; cópia anterior preservada')
    selected = [s for s in stations if s.get('municipio_id') == 1]
    if not selected or any(not s.get('codigo') or not s.get('nome') for s in selected):
        raise ValueError('Estações municipais inválidas')
    for s in selected:
        if s.get('medido_em'):
            stamp = datetime.fromisoformat(s['medido_em'])
            if stamp.tzinfo is None:
                raise ValueError('Medição sem fuso horário')
    return selected


def main():
    result = {'collectedAt': datetime.now(timezone.utc).isoformat(), 'sources': {}}
    for section in ('rios', 'chuvas'):
        url = BASE + section + '?municipio_id=1'
        request = urllib.request.Request(url, headers={'User-Agent': 'CidadaoAgora/1.0 (+https://cidadaoagora.com.br/clima/itajai/)'})
        with urllib.request.urlopen(request, timeout=35) as response:
            stations = parse_page(response.read().decode('utf-8'))
        # Apenas campos necessários; sem copiar comunicados ou conteúdo editorial.
        keys = ('codigo', 'nome', 'fonte', 'medido_em', 'qualidade', 'nivel_rio_m',
                'tendencia', 'situacao', 'atencao_m', 'alerta_m', 'emergencia_m',
                'serie_12_h', 'historico_monitoramento', 'chuva_1_h_mm', 'chuva_24_h_mm')
        result[section] = [{k: s[k] for k in keys if k in s} for s in stations]
        result['sources'][section] = url
    target = ROOT / 'clima/data/itajai.json'
    fd, temp = tempfile.mkstemp(dir=target.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(result, stream, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
        os.replace(temp, target)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    print('Medições municipais atualizadas:', len(result['rios']), 'estações de rios')


if __name__ == '__main__':
    main()
