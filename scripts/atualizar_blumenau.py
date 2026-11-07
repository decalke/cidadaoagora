"""Coleta dados públicos do AlertaBlu. Cada fonte falha independentemente."""
import json
import math
import os
import re
import tempfile
import urllib.request
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://defesacivil.blumenau.sc.gov.br'
SOURCES = {
    'rio': '/static/data/nivel_oficial.json',
    'chuva': '/static/data/chuva.json',
    'situacao': '/static/data/situacao_atual.json',
    'temperatura': '/static/data/temperaturas.json',
    'abrigos': '/static/data/abrigos.json',
    'aviso': '/static/data/aviso.json',
    'cotas': '/p/cotas',
    'barragens': '/d/barragens',
}


def stamp(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if parsed.tzinfo is not None:
            return parsed.isoformat()
    except ValueError:
        pass
    try:
        return datetime.strptime(value, '%d/%m/%Y - %H:%M').replace(
            tzinfo=timezone(timedelta(hours=-3))).isoformat()
    except ValueError:
        return None


def number(value):
    return value if isinstance(value, (float, int)) and not isinstance(value, bool) and math.isfinite(value) else None


class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.cell = [], None, None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.row = []
        elif tag == 'td' and self.row is not None:
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag == 'td' and self.cell is not None:
            self.row.append(' '.join(' '.join(self.cell).split()))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            if self.row:
                self.rows.append(self.row)
            self.row = None


def normalize(key, data):
    if key == 'rio':
        if not isinstance(data, dict) or not isinstance(data.get('niveis'), list):
            raise ValueError('Formato de nível alterado')
        readings = [{'time': stamp(p.get('horaLeitura')), 'value': number(p.get('nivel'))} for p in data['niveis']]
        readings = [p for p in readings if p['time'] and p['value'] is not None]
        if not readings:
            raise ValueError('Nenhuma leitura válida')
        return {'readings': readings, 'thresholds': [{'name': p['condicao'], 'value': p['nivel']}
                for p in data.get('condicoes', []) if isinstance(p.get('condicao'), str) and number(p.get('nivel')) is not None]}
    if key == 'chuva':
        if not isinstance(data, list) or not data:
            raise ValueError('Estações ausentes')
        return [{'id': s['estacao_id'], 'name': s['estacao'], 'region': s.get('regiao', ''),
                 'provider': s.get('tipo', ''), 'time': stamp(s.get('horaLeitura')),
                 'disabled': 'desativad' in s['estacao'].lower(),
                 'rain': {k: number(v) for k, v in s.get('dados', {}).get('Variance', {}).items()},
                 'level': number(s.get('dados', {}).get('niv')),
                 'sensors': {k: number(v) for k, v in s.get('dados', {}).items() if k.startswith('umS')}}
                for s in data if isinstance(s.get('estacao'), str)]
    if key == 'temperatura':
        if not isinstance(data, list):
            raise ValueError('Formato de temperatura alterado')
        return [{'time': stamp(p.get('horaLeitura')), 'value': number(p.get('valor'))} for p in data]
    if key == 'situacao':
        if not isinstance(data, dict) or not isinstance(data.get('dados'), list):
            raise ValueError('Situação ausente')
        return {'updatedAt': stamp(data.get('datahoraAtualizacao')), 'groups': [
            {'name': g['tipoNome'], 'time': stamp(g.get('create_data')), 'regions': [
                {'name': r['regiao']['nome'], 'neighborhoods': r['regiao'].get('bairros', []),
                 'condition': r['condicao']['condicao']} for r in g['sitregioes']]}
            for g in data['dados']]}
    if key == 'abrigos':
        if not isinstance(data, list) or not data:
            raise ValueError('Cadastro de abrigos ausente')
        # Estado sem timestamp na fonte: não o apresentar como abertura confirmada.
        return [{k: s.get(k) for k in ('id', 'designacao', 'bairro', 'logradouro', 'telefone', 'estado')} for s in data]
    if key == 'aviso':
        # Boletins completos ficam na origem. null não atesta ausência de risco.
        return {'present': data is not None}
    parser = Tables()
    parser.feed(data)
    if key == 'cotas':
        rows = []
        for r in parser.rows:
            if len(r) >= 4 and re.fullmatch(r'\d+[,.]\d+', r[2]):
                rows.append({'street': r[0], 'neighborhood': r[1], 'level': float(r[2].replace(',', '.')), 'note': r[3]})
        if not rows:
            raise ValueError('Tabela de cotas não encontrada')
        return rows
    if key == 'barragens':
        rows = []
        for r in parser.rows:
            if len(r) >= 4 and r[0].startswith('Barragem'):
                time = datetime.strptime(r[1], '%d/%m/%Y %H:%M').replace(tzinfo=timezone(timedelta(hours=-3))).isoformat()
                capacity = re.search(r'(\d+[,.]\d+)\s*%', r[2])
                rows.append({'name': r[0], 'time': time, 'capacity': float(capacity[1].replace(',', '.')) if capacity else None, 'gates': r[3]})
        if not rows:
            raise ValueError('Tabela de barragens não encontrada')
        return rows
    raise ValueError('Fonte desconhecida')


def main():
    target = ROOT / 'clima/data/blumenau.json'
    try:
        result = json.loads(target.read_text(encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        result = {'sources': {}}
    failures = []
    for key, path in SOURCES.items():
        url = BASE + path
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'CidadaoAgora/1.0 (+https://cidadaoagora.com.br/clima/blumenau/)'})
            with urllib.request.urlopen(request, timeout=25) as response:
                text = response.read(5_000_000).decode('utf-8')
            data = normalize(key, text if key in ('cotas', 'barragens') else json.loads(text))
            result['sources'][key] = {'url': url, 'collectedAt': datetime.now(timezone.utc).isoformat(), 'ok': True, 'data': data}
        except Exception as exc:
            failures.append(key)
            # A idade da cópia anterior nunca é renovada quando uma fonte falha.
            previous = result['sources'].get(key, {'url': url, 'data': None, 'collectedAt': None})
            previous['ok'] = False
            result['sources'][key] = previous
            print('Fonte indisponível:', key, type(exc).__name__)
    target.parent.mkdir(exist_ok=True)
    fd, temp = tempfile.mkstemp(dir=target.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(result, stream, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
        os.replace(temp, target)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    print('Fontes de Blumenau atualizadas:', len(SOURCES) - len(failures), '/', len(SOURCES))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
