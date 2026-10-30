@echo off
chcp 65001 >nul
title BarberApp - parar servidor
cd /d "%~dp0"

set "KILLED=0"

for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`) do (
  if not "%%P"=="" (
    echo Parando el servidor de BarberApp ^(PID %%P^)...
    taskkill /PID %%P /F >nul 2>nul
    set "KILLED=1"
  )
)

if "%KILLED%"=="1" (
  echo.
  echo Servidor detenido. El puerto 5173 ha quedado libre.
) else (
  echo.
  echo No hay ningun servidor escuchando en el puerto 5173.
  echo Nada que parar.
)

echo.
pause
