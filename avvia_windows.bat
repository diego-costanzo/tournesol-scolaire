@echo off
chcp 65001 >nul
title Tournesol Study Companion - Avvio Automatico
cls

echo =====================================================================
echo           🌻 TOURNESOL STUDY COMPANION - AVVIO AUTOMATICO 🌻
echo =====================================================================
echo.

REM 1. Verifica presenza di Node.js
echo [1/3] Controllo dell'ambiente di sistema (Node.js)...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ---------------------------------------------------------------------
    echo  Node.js non e' ancora presente su questo computer.
    echo  Node.js e' il motore gratuito necessario per eseguire l'app su PC.
    echo ---------------------------------------------------------------------
    echo.
    echo Vuoi scaricarlo e installarlo AUTOMATICAMENTE adesso?
    set /p AUTO_INSTALL="Premi [INVIO] per l'installazione automatica (oppure scrivi N per farlo a mano): "
    
    if /i "%AUTO_INSTALL%"=="N" (
        echo.
        echo Apertura della pagina ufficiale di download...
        start https://nodejs.org/
        echo Una volta installato Node.js, riavvia questo file!
        pause
        exit /b
    )

    echo.
    echo [Download in corso] Scarico il programma di installazione ufficiale di Node.js LTS...
    
    REM Prova prima con winget (disponibile su Windows 10 e 11)
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        echo Rilevato Windows Package Manager (winget). Installazione in corso...
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    ) else (
        echo Download dell'installer ufficiale MSI tramite PowerShell...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $installer = Join-Path $env:TEMP 'node_setup.msi'; Write-Host 'Download da nodejs.org in corso...'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile $installer; Write-Host 'Avvio installatore...'; Start-Process msiexec.exe -ArgumentList '/i', $installer -Wait"
    )

    echo.
    echo =====================================================================
    echo  Installazione di Node.js completata!
    echo  Per applicare la nuova configurazione di sistema di Windows,
    echo  chiudi questa finestra e fai di nuovo doppio clic su 'avvia_windows.bat'!
    echo =====================================================================
    echo.
    pause
    exit /b
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo       Node.js rilevato: %NODE_VERSION% - OK!
echo.

REM 2. Installazione automatica delle dipendenze se assenti
echo [2/3] Verifica dei pacchetti e componenti dell'applicazione...
if not exist "node_modules\" (
    echo       Prima configurazione rilevata: installazione dei pacchetti in corso...
    echo       (L'operazione richiede circa 30-60 secondi, attendere...)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERRORE] Si e' verificato un problema durante 'npm install'.
        echo Verifica la tua connessione internet e riprova.
        pause
        exit /b
    )
    echo.
    echo       Installazione completata con successo!
) else (
    echo       Tutti i componenti necessari sono gia' pronti!
)
echo.

REM 3. Apertura automatica del browser e avvio del server
echo [3/3] Avvio del server locale in corso...
echo.
echo =====================================================================
echo  L'applicazione e' attiva all'indirizzo: http://localhost:3000
echo  Il tuo browser si aprira' automaticamente tra pochi istanti!
echo  (Per arrestare l'applicazione, chiudi semplicemente questa finestra)
echo =====================================================================
echo.

REM Attende 3 secondi per dare il tempo al server Vite di partire, poi apre il browser
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

REM Avvio di Vite
call npm run dev

pause
