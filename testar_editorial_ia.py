"""Teste real mínimo do Gemini, sem publicar conteúdo de teste."""
import json
from pathlib import Path
from editor_ia import obter_chave_api, reescrever_com_ia, validar_resultado

def run():
    if not obter_chave_api():
        raise RuntimeError('GEMINI_API_KEY não disponível neste ambiente')
    source='Material sintético usado apenas para testar o sistema, não é notícia: A biblioteca municipal do exemplo abre de segunda a sexta-feira, das 9 às 18 horas. O cadastro é gratuito. Pessoas interessadas precisam apresentar documento de identificação e comprovante de endereço. O empréstimo permite retirar 3 livros por 14 dias. O prazo pode ser renovado quando não houver reserva. O serviço oferece mesas de estudo e catálogo digital. A biblioteca não anunciou mudança nas regras de cadastro. Nenhuma informação sobre multas ou atendimento aos sábados foi fornecida.'
    result=reescrever_com_ia('Biblioteca do exemplo oferece cadastro gratuito',source,'Teste técnico','Material sintético de teste')
    if not result or not validar_resultado(result,source+' Biblioteca do exemplo oferece cadastro gratuito'):
        raise RuntimeError('Teste de geração estruturada não passou')
    report={'ok':True,'model':result['modelo'],'structured':True,'numeric_guard':True,'published':False}
    Path('editorial-test-report.json').write_text(json.dumps(report),encoding='utf-8')
    print('Gemini: teste real aprovado. Nenhuma notícia de teste publicada.')

if __name__=='__main__':
    run()
