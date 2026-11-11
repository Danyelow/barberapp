@echo off
chcp 65001 >nul
title BarberApp - backend (API y Admin)
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo.
  echo [ERROR] No existe el entorno virtual backend\.venv.
  echo Crea el entorno y instala las dependencias con:
  echo.
  echo   python -m venv .venv
  echo   .venv\Scripts\python.exe -m pip install -r requirements.txt
  echo.
  pause
  exit /b 1
)

echo.
echo  ===============================================
echo   BarberApp - backend
echo   API:   http://localhost:8000/api/health/
echo   Admin: http://localhost:8000/admin/
echo   Deja esta ventana abierta mientras uses la app.
echo   Para detener el servidor: Ctrl + C
echo  ===============================================
echo.

".venv\Scripts\python.exe" manage.py runserver 127.0.0.1:8000

echo.
echo El servidor de Django se ha detenido.
pause
