@echo off
title Conectar San José
echo ======================================
echo  Iniciando Conectar San Jose...
echo ======================================

start "Backend" cmd /c "cd /d backend && mvn spring-boot:run"
timeout /t 5 /nobreak >nul
start "Admin" cmd /c "cd /d frontend\conectar-sj && ng serve --port 4201 -o"
start "Publico" cmd /c "cd /d frontend\conectar-angular && ng serve -o"

echo.
echo ======================================
echo  Backend  → http://localhost:8080
echo  Admin    → http://localhost:4201
echo  Publico  → http://localhost:4200
echo ======================================
echo.
pause
