!include "MUI2.nsh"
!include "FileFunc.nsh"

; Grundlegende Einstellungen
Name "EnvDiff"
OutFile "EnvDiff_1.0.0_x64_Setup.exe"
InstallDir "$PROGRAMFILES64\EnvDiff"
InstallDirRegKey HKLM "Software\EnvDiff" "Install_Dir"
RequestExecutionLevel admin

; Version
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "EnvDiff"
VIAddVersionKey "CompanyName" "jakubbbdev"
VIAddVersionKey "LegalCopyright" "© 2025 jakubbbdev. MIT License."
VIAddVersionKey "FileDescription" "Environment File Diff Tool"
VIAddVersionKey "FileVersion" "1.0.0"

; MUI Einstellungen - Komplett schwarzes Theme
!define MUI_ABORTWARNING
!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"

; Komplett schwarzes Theme
!define MUI_BGCOLOR "000000"
!define MUI_TEXTCOLOR "ffffff"
!define MUI_BRANDINGTEXT "jakubbbdev 2025"

; Zusätzliche dunkle Theme-Einstellungen
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "icons\icon.ico"
!define MUI_HEADERIMAGE_RIGHT
!define MUI_WELCOMEFINISHPAGE_BITMAP "icons\icon.ico"

; Seiten
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller Seiten
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Sprachen
!insertmacro MUI_LANGUAGE "English"

; Installer Sektion
Section "EnvDiff (required)" SecCore
  SectionIn RO
  SetOutPath "$INSTDIR"
  
  ; Hauptdateien
  File "envdiff.exe"
  File "LICENSE"
  File "README.md"
  
  ; Icons und Assets
  SetOutPath "$INSTDIR\icons"
  File "icons\*.ico"
  File "icons\*.png"
  
  ; Registry Einträge
  WriteRegStr HKLM "Software\EnvDiff" "Install_Dir" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "DisplayName" "EnvDiff"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "DisplayIcon" "$INSTDIR\icons\icon.ico"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "Publisher" "jakubbbdev"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "DisplayVersion" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "URLInfoAbout" "https://github.com/jakubbbdev/envdiff"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "NoRepair" 1
  
  ; Uninstaller erstellen
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

; Desktop Verknüpfung
Section "Desktop Shortcut" SecDesktop
  CreateShortCut "$DESKTOP\EnvDiff.lnk" "$INSTDIR\envdiff.exe" "" "$INSTDIR\icons\icon.ico" 0
SectionEnd

; Startmenü Verknüpfung
Section "Start Menu Shortcut" SecStartMenu
  CreateDirectory "$SMPROGRAMS\EnvDiff"
  CreateShortCut "$SMPROGRAMS\EnvDiff\EnvDiff.lnk" "$INSTDIR\envdiff.exe" "" "$INSTDIR\icons\icon.ico" 0
  CreateShortCut "$SMPROGRAMS\EnvDiff\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\icons\icon.ico" 0
SectionEnd

; Uninstaller Sektion
Section "Uninstall"
  ; Dateien entfernen
  Delete "$INSTDIR\envdiff.exe"
  Delete "$INSTDIR\LICENSE"
  Delete "$INSTDIR\README.md"
  RMDir /r "$INSTDIR\icons"
  
  ; Verknüpfungen entfernen
  Delete "$DESKTOP\EnvDiff.lnk"
  RMDir /r "$SMPROGRAMS\EnvDiff"
  
  ; Registry Einträge entfernen
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff"
  DeleteRegKey HKLM "Software\EnvDiff"
  
  ; Installationsverzeichnis entfernen
  RMDir "$INSTDIR"
SectionEnd

; Funktionen
Function .onInit
  ; Willkommensseite anpassen
  !insertmacro MUI_HEADER_TEXT "Welcome to EnvDiff Setup" "This will install EnvDiff on your computer."
  
  ; Prüfen ob bereits installiert
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EnvDiff" "UninstallString"
  StrCmp $R0 "" done
  
  MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "EnvDiff is already installed. $\n$\nClick 'OK' to remove the previous version or 'Cancel' to cancel this update." \
    IDOK uninst
  Abort
  
  uninst:
    ExecWait '$R0 _?=$INSTDIR'
  
  done:
FunctionEnd

Function .onInstSuccess
  MessageBox MB_YESNO "EnvDiff has been installed successfully! $\n$\nWould you like to run it now?" IDNO NoRun
    Exec "$INSTDIR\envdiff.exe"
  NoRun:
FunctionEnd 