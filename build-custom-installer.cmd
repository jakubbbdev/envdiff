@echo off
setlocal

set VERSION=1.0.0
set ARCH=x64

REM Ordner vorbereiten
if exist installer rmdir /s /q installer
mkdir installer
mkdir installer\icons

REM Dateien kopieren
copy src-tauri\target\release\envdiff.exe installer\
copy LICENSE installer\
copy README.md installer\
copy src-tauri\icons\* installer\icons\

REM NSIS-Installer-Skript kopieren
copy src-tauri\installer.nsi installer\

REM In den Installer-Ordner wechseln
cd installer

REM NSIS-Installer bauen
"C:\Program Files (x86)\NSIS\makensis.exe" installer.nsi

cd ..

echo.
echo Fertig! Installer liegt in installer\EnvDiff_%VERSION%_%ARCH%_Setup.exe
echo.
pause 