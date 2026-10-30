@echo off
chcp 65001 >nul
title BarberApp - frontend_prueba
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js no esta instalado.
  echo Descarga Node 20 o superior desde https://nodejs.org y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias por primera vez...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Fallo npm install. Revisa tu conexion a internet.
    pause
    exit /b 1
  )
)

echo.
echo  ===============================================
echo   BarberApp - frontend de prueba
echo   URL: http://localhost:5174
echo   Deja esta ventana abierta mientras uses la app.
echo   Para detener el servidor: Ctrl + C
echo  ===============================================
echo.

call npm run dev -- --open

echo.
echo El servidor se ha detenido.
pause
