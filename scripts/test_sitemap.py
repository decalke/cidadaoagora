"""Geração editorial deve preservar painéis, guias e ferramentas indexáveis."""
import contextlib
import io
import os
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from gerar_sitemap import gerar_sitemap


class SitemapTest(unittest.TestCase):
    def test_panels_survive_and_noindex_is_respected(self):
        original = Path.cwd()
        with tempfile.TemporaryDirectory() as work:
            try:
                os.chdir(work)
                pages = {
                    'index.html': '<h1>Início</h1>',
                    'servicos/agenda-cidada.html': '<h1>Agenda</h1>',
                    'clima/index.html': "<meta content='noindex, follow' name='robots'>",
                    'clima/blumenau/index.html': '<h1>Blumenau</h1>',
                    'clima/itajai/index.html': '<h1>Itajaí</h1>',
                    'clima/santa-catarina/index.html': '<h1>SC</h1>',
                    'guias/index.html': '<h1>Guias</h1>',
                    'guias/trabalho.html': '<h1>Trabalho</h1>',
                    'guias/rascunho.html': '<meta name="robots" content="noindex,follow">',
                }
                for name, html in pages.items():
                    p = Path(name)
                    p.parent.mkdir(parents=True, exist_ok=True)
                    p.write_text(html, encoding='utf-8')
                with contextlib.redirect_stdout(io.StringIO()):
                    gerar_sitemap()
                urls = [n.text for n in ET.parse('sitemap.xml').findall('.//{*}loc')]
                for path in ('/clima/blumenau/', '/clima/itajai/', '/clima/santa-catarina/', '/guias/', '/guias/trabalho', '/servicos/agenda-cidada'):
                    self.assertIn('https://cidadaoagora.com.br' + path, urls)
                self.assertNotIn('https://cidadaoagora.com.br/clima/', urls)
                self.assertNotIn('https://cidadaoagora.com.br/guias/rascunho', urls)
                self.assertEqual(len(urls), len(set(urls)))
            finally:
                os.chdir(original)


if __name__ == '__main__':
    unittest.main()
