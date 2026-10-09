@echo off
set SCRIPT_DIR=%~dp0
echo Registrando Agente de Noticias do InfoCidadao no Agendador de Tarefas do Windows...
echo.

schtasks /create /tn "InfoCidadao_Noticias_24h" /tr "\"%SCRIPT_DIR%iniciar_agente_noticias_24h.bat\"" /sc onstart /delay 0001:00 /rl highest /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo SUCESSO! A tarefa 'InfoCidadao_Noticias_24h' foi criada.
    echo O robô agora iniciará automaticamente toda vez que o Windows ligar!
    echo =====================================================================
) else (
    echo.
    echo [AVISO] Se der erro de permissão, execute este arquivo clicando com o
    echo botão direito e escolhendo "Executar como Administrador".
)
pause
