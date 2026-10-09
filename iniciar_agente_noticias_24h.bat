@echo off
title Agente de Noticias & Politica 24h - InfoCidadao
echo ====================================================================
echo    AGENTE RASTREADOR DE NOTICIAS E POLITICA NACIONAL (24 HORAS)
echo ====================================================================
echo.
echo Monitorando canais oficiais:
echo  1. Noticias Gerais / Economia (EBC / Agencia Brasil)
echo  2. Politica, TSE, Leis e Tributos (Congresso, Planalto e Fazenda)
echo.
echo O agente baixara fotos, gerara paginas individuais para o Google
echo e atualizara o site a cada 30 minutos sem parar.
echo Pressione CTRL+C para encerrar.
echo.

:loop
echo [%date% %time%] Coletando noticias gerais da EBC...
python "C:\Users\clebi\Desktop\InfoCidadao\noticias\agente_noticias.py"

echo [%date% %time%] Coletando noticias politicas oficiais e leis...
python "C:\Users\clebi\Desktop\InfoCidadao\conteudo\agente_politica.py"

echo.
echo [%date% %time%] Sucesso! Proxima varredura em 30 minutos...
timeout /t 1800 /nobreak >nul
goto loop
