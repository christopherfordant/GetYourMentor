@echo off
setlocal

set "ROOT=%~dp0.."
for %%I in ("%ROOT%") do set "ROOT=%%~fI"

set "PYTHON=%ROOT%\mempalace\.venv\Scripts\python.exe"
set "RUNTIME=%ROOT%\.mempalace-exec"
set "PALACE=%ROOT%\.mempalace\palace"

if not exist "%PYTHON%" (
  echo MemPalace venv introuvable: %PYTHON%
  exit /b 1
)

if not exist "%RUNTIME%" mkdir "%RUNTIME%"

set "PYTHONIOENCODING=utf-8"
set "HOME=%RUNTIME%"
set "USERPROFILE=%RUNTIME%"
set "XDG_CACHE_HOME=%RUNTIME%\.cache"
set "MEMPALACE_PALACE_PATH=%PALACE%"

if "%~1"=="" (
  "%PYTHON%" -m mempalace --palace "%PALACE%" status
) else (
  "%PYTHON%" -m mempalace --palace "%PALACE%" %*
)

endlocal
