@echo off
title Publicar Alteracoes no InfoCidadao
echo =======================================================
echo    PUBLICANDO ATUALIZACOES NO SITE ONLINE (CLOUDFLARE)
echo =======================================================
echo.

cd /d "C:\Users\clebi\Desktop\InfoCidadao"

echo 1. Puxando eventuais noticias novas geradas pelo robo na nuvem...
git pull origin main

echo.
echo 2. Preparando arquivos modificados...
git add -A

set /p msg="Digite o que voce alterou (ou aperte ENTER para 'atualizacao do site'): "
if "%msg%"=="" set msg=atualizacao do site

echo.
echo 3. Enviando para o GitHub e Cloudflare Pages...
git commit -m "%msg%"
git push origin main

echo.
echo =======================================================
echo SUCESSO! Em cerca de 20 segundos o site estara atualizado em:
echo https://infocidadao.pages.dev/
echo =======================================================
echo.
pause
