#!/usr/bin/env bash

# Colori per il terminale
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}          🌻 TOURNESOL STUDY COMPANION - AVVIO AUTOMATICO 🌻          ${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

OS_TYPE="$(uname -s)"

open_browser() {
    local url="$1"
    if [ "$OS_TYPE" = "Darwin" ]; then
        open "$url" 2>/dev/null
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url" 2>/dev/null
    fi
}

# 1. Verifica presenza di Node.js
echo -e "${BLUE}[1/3] Controllo dell'ambiente di sistema (Node.js)...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo ""
    echo -e "${YELLOW}---------------------------------------------------------------------${NC}"
    echo -e "${YELLOW} Node.js non è ancora installato su questo computer.${NC}"
    echo -e "${YELLOW} È il motore gratuito necessario per far girare l'app in locale.${NC}"
    echo -e "${YELLOW}---------------------------------------------------------------------${NC}"
    echo ""
    read -p "Vuoi scaricarlo e installarlo AUTOMATICAMENTE adesso? [S/n]: " choice
    choice=${choice:-S}

    if [[ "$choice" =~ ^[Nn]$ ]]; then
        echo "Apertura della pagina ufficiale di download..."
        open_browser "https://nodejs.org/"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}[Download in corso] Installazione di Node.js...${NC}"

    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS
        if command -v brew >/dev/null 2>&1; then
            echo "Rilevato Homebrew. Installazione tramite brew..."
            brew install node
        else
            echo "Download del pacchetto ufficiale di installazione da nodejs.org..."
            PKG_URL="https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg"
            curl -fsSL "$PKG_URL" -o /tmp/node_installer.pkg
            echo "Apertura della procedura di installazione di macOS..."
            open /tmp/node_installer.pkg
            echo -e "${YELLOW}Completa la finestra di installazione a schermo, poi riesegui questo script!${NC}"
            exit 0
        fi
    else
        # Linux (Debian/Ubuntu/Fedora/Arch)
        if command -v apt-get >/dev/null 2>&1; then
            echo "Installazione con apt..."
            sudo apt-get update && sudo apt-get install -y nodejs npm
        elif command -v dnf >/dev/null 2>&1; then
            sudo dnf install -y nodejs npm
        elif command -v pacman >/dev/null 2>&1; then
            sudo pacman -S --noconfirm nodejs npm
        else
            open_browser "https://nodejs.org/"
            exit 1
        fi
    fi

    echo ""
    echo -e "${GREEN}Installazione completata! Riavvio della procedura...${NC}"
fi

NODE_VER=$(node -v)
echo -e "      ${GREEN}Node.js rilevato: ${NODE_VER} - OK!${NC}"
echo ""

# 2. Installazione automatica dipendenze se mancanti
echo -e "${BLUE}[2/3] Verifica dei pacchetti e componenti dell'applicazione...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "      ${YELLOW}Prima configurazione rilevata: installazione pacchetti in corso...${NC}"
    echo "      (L'operazione richiede circa 30-60 secondi, attendere...)"
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}[ERRORE] Si è verificato un problema durante 'npm install'.${NC}"
        echo "Verifica la connessione internet e riprova."
        exit 1
    fi
    echo ""
    echo -e "      ${GREEN}Installazione completata con successo!${NC}"
else
    echo -e "      ${GREEN}Tutti i componenti necessari sono già pronti!${NC}"
fi
echo ""

# 3. Apertura browser e avvio server
echo -e "${BLUE}[3/3] Avvio del server locale in corso...${NC}"
echo ""
echo -e "${GREEN}=====================================================================${NC}"
echo -e "${GREEN} L'applicazione è attiva all'indirizzo: http://localhost:3000        ${NC}"
echo -e "${YELLOW} Il tuo browser si aprirà automaticamente tra pochi istanti!         ${NC}"
echo -e "${YELLOW} (Per arrestare l'applicazione, premi CTRL+C nel terminale)          ${NC}"
echo -e "${GREEN}=====================================================================${NC}"
echo ""

# Apri il browser in background dopo 2.5 secondi
(
    sleep 2.5
    open_browser "http://localhost:3000"
) &

# Avvio di Vite
npm run dev
