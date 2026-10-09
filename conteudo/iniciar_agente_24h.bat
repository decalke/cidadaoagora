@echo off
title Agente de Noticias Oficiais InfoCidadao (24h)
echo ==========================================================
echo    AGENTE RASTREADOR DE NOTICIAS GOVERNO EBC - 24 HORAS
echo ==========================================================
echo.
echo O agente esta ativo e atualizara o feed oficial a cada 30 minutos.
echo Pressione CTRL+C para parar.
echo.

:loop
echo [%date% %time%] Coletando ultimas noticias oficiais da EBC...
python "C:\Users\clebi\Desktop\InfoCidadao\conteudo\rastreador_noticias.py"
echo [%date% %time%] Aguardando proxima rodada em 30 minutos...
timeout /t 1800 /nobreak >nul
goto loop
