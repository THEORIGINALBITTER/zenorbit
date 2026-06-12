#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ZenOrbit – Ollama Remote Tunnel Setup
# Startet Ollama lokal und erstellt einen öffentlichen ngrok-Tunnel.
# Danach kannst du die angezeigte URL als Endpoint in ZenOrbit eintragen.
#
# Voraussetzungen: macOS mit Homebrew (https://brew.sh)
# ─────────────────────────────────────────────────────────────────────────────

set -e

CYAN="\033[0;36m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BOLD="\033[1m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}ZenOrbit · Ollama Remote Tunnel Setup${RESET}"
echo "──────────────────────────────────────"
echo ""

# 1. Homebrew
if ! command -v brew &>/dev/null; then
  echo -e "${RED}✗ Homebrew nicht gefunden.${RESET}"
  echo "  Bitte installieren: https://brew.sh"
  exit 1
fi
echo -e "${GREEN}✓ Homebrew gefunden${RESET}"

# 2. ngrok
if ! command -v ngrok &>/dev/null; then
  echo -e "${YELLOW}→ ngrok wird installiert...${RESET}"
  brew install ngrok
fi
echo -e "${GREEN}✓ ngrok bereit${RESET}"

# 3. Ollama
if ! command -v ollama &>/dev/null; then
  echo -e "${RED}✗ Ollama nicht gefunden.${RESET}"
  echo "  Bitte installieren: https://ollama.com/download"
  exit 1
fi
echo -e "${GREEN}✓ Ollama gefunden${RESET}"

# 4. Ollama starten (falls nicht läuft)
if ! pgrep -x "ollama" &>/dev/null; then
  echo -e "${YELLOW}→ Ollama wird gestartet...${RESET}"
  ollama serve &>/dev/null &
  sleep 3
fi
echo -e "${GREEN}✓ Ollama läuft${RESET}"

# 5. Modell prüfen
echo ""
echo -e "${CYAN}Verfügbare Modelle:${RESET}"
ollama list 2>/dev/null || echo "  (keine Modelle geladen – mit 'ollama pull llama3.1:8b' nachladen)"

# 6. ngrok Tunnel starten
echo ""
echo -e "${BOLD}Tunnel wird gestartet...${RESET}"
echo -e "${YELLOW}Die öffentliche URL erscheint gleich.${RESET}"
echo ""
echo -e "  Forwarding-URL kopieren (beginnt mit ${BOLD}https://...ngrok-free.app${RESET})"
echo -e "  Endpoint in ZenOrbit eintragen:"
echo -e "  ${CYAN}https://DEINE-URL.ngrok-free.app/v1/chat/completions${RESET}"
echo ""
echo -e "${YELLOW}Beenden mit Ctrl+C${RESET}"
echo "──────────────────────────────────────"
echo ""

ngrok http 11434
