"""Valida conversão, ausência de valores e formatos da fonte pública."""
import unittest
from atualizar_blumenau import normalize, number, stamp


class BlumenauTests(unittest.TestCase):
    def test_local_time_is_explicit(self):
        self.assertEqual(stamp('07/11/2026 - 14:25'), '2026-11-07T14:25:00-03:00')
        self.assertIsNone(stamp('2026-11-07T14:25:00'))
        self.assertIsNone(stamp('data ausente'))

    def test_missing_is_not_zero(self):
        for v in (None, '', True, float('nan'), float('inf')):
            self.assertIsNone(number(v))
        self.assertEqual(number(0), 0)

    def test_cotas_keep_individual_stretches(self):
        html = '<table><tr><td>Rua &amp; Travessa</td><td>Centro</td><td>8,15</td><td>Final</td></tr><tr><td>Rua &amp; Travessa</td><td>Centro</td><td>8,90</td><td>Início</td></tr></table>'
        rows = normalize('cotas', html)
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]['street'], 'Rua & Travessa')
        self.assertEqual(rows[0]['level'], 8.15)

    def test_invalid_sources_are_rejected(self):
        for key, value in [('rio', {}), ('cotas', '<html>fora do ar</html>'), ('barragens', '<table></table>'), ('chuva', [])]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                normalize(key, value)

    def test_shelter_without_time_does_not_gain_measurement_time(self):
        result = normalize('abrigos', [{'id': 1, 'estado': 'Aberto'}])
        self.assertNotIn('time', result[0])

    def test_null_notice_is_not_safe_status(self):
        self.assertEqual(normalize('aviso', None), {'present': False})


if __name__ == '__main__':
    unittest.main()
