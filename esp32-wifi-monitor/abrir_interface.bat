@echo off
chcp 65001 >nul
echo ========================================================
echo  Criando arquivos do Monitor Wi-Fi ESP32-S3...
echo ========================================================

set "DEST_DIR=%~dp0"
echo Destino: %DEST_DIR%

echo [OK] Arquivos já configurados na pasta!
echo Abrindo a interface no seu navegador para testar...
start "" "%DEST_DIR%index.html"

pause
