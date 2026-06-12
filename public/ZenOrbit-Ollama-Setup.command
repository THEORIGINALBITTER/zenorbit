#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ZenOrbit – Ollama Remote Tunnel Setup
# Doppelklick auf diese Datei → Terminal öffnet sich automatisch
# ─────────────────────────────────────────────────────────────────────────────

CYAN="\033[0;36m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BOLD="\033[1m"
RESET="\033[0m"

clear
echo ""
echo -e "${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   ZenOrbit · Ollama Remote Setup       ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""
echo "Dieses Script startet Ollama und erstellt"
echo "eine öffentliche URL für ZenOrbit."
echo ""

# Homebrew
if ! command -v brew &>/dev/null; then
  echo -e "${RED}✗ Homebrew fehlt.${RESET}"
  echo ""
  echo "Bitte zuerst Homebrew installieren:"
  echo "  https://brew.sh"
  echo ""
  echo "Danach diese Datei erneut öffnen."
  read -p "Enter drücken zum Beenden..."
  exit 1
fi
echo -e "${GREEN}✓ Homebrew${RESET}"

# ngrok
if ! command -v ngrok &>/dev/null; then
  echo -e "${YELLOW}→ ngrok wird installiert (einmalig)...${RESET}"
  brew install ngrok
fi
echo -e "${GREEN}✓ ngrok${RESET}"

# Ollama
if ! command -v ollama &>/dev/null; then
  echo ""
  echo -e "${RED}✗ Ollama fehlt.${RESET}"
  echo ""
  echo "Bitte Ollama installieren:"
  echo "  https://ollama.com/download"
  echo ""
  echo "Danach diese Datei erneut öffnen."
  read -p "Enter drücken zum Beenden..."
  exit 1
fi
echo -e "${GREEN}✓ Ollama${RESET}"

# Ollama starten
if ! pgrep -x "ollama" &>/dev/null; then
  echo -e "${YELLOW}→ Ollama wird gestartet...${RESET}"
  ollama serve &>/dev/null &
  sleep 3
fi
echo -e "${GREEN}✓ Ollama läuft${RESET}"

# Modell prüfen
MODELS=$(ollama list 2>/dev/null | tail -n +2)
if [ -z "$MODELS" ]; then
  echo ""
  echo -e "${YELLOW}→ Kein Modell gefunden. llama3.1:8b wird geladen...${RESET}"
  ollama pull llama3.1:8b
fi
echo -e "${GREEN}✓ Modell bereit${RESET}"

# ngrok Tunnel
echo ""
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo -e "${BOLD}Tunnel startet jetzt...${RESET}"
echo ""
echo -e "Warte auf die ${CYAN}Forwarding${RESET}-Zeile:"
echo ""
echo -e "  ${CYAN}Forwarding  https://xxxxx.ngrok-free.app → http://localhost:11434${RESET}"
echo ""
echo -e "Diese URL in ZenOrbit als ${BOLD}Endpoint${RESET} eintragen:"
echo -e "  ${YELLOW}https://xxxxx.ngrok-free.app/v1/chat/completions${RESET}"
echo ""
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo -e "Beenden: ${BOLD}Ctrl + C${RESET} drücken"
echo ""

ngrok http 11434
