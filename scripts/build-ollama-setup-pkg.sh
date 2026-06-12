#!/bin/bash
# Baut ein macOS .pkg Installer für ZenOrbit Ollama Setup
# Verwendung: bash scripts/build-ollama-setup-pkg.sh
# Output: public/ZenOrbit-Ollama-Setup.pkg

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$SCRIPT_DIR/.pkg_ollama_build"
PAYLOAD_DIR="$BUILD_DIR/payload"
SCRIPTS_DIR="$BUILD_DIR/scripts"
OUTPUT="$SCRIPT_DIR/public/ZenOrbit-Ollama-Setup.pkg"

echo "╔══════════════════════════════════════════╗"
echo "║   ZenOrbit · Ollama Setup Installer      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

rm -rf "$BUILD_DIR"
mkdir -p "$PAYLOAD_DIR/usr/local/share/zenorbit"
mkdir -p "$SCRIPTS_DIR"

# ── Payload: das Start-Script ────────────────────────────────────────────────
cat > "$PAYLOAD_DIR/usr/local/share/zenorbit/ZenOrbit-Ollama-Start.command" << 'STARTSCRIPT'
#!/bin/bash
CYAN="\033[0;36m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BOLD="\033[1m"
RESET="\033[0m"

clear
echo ""
echo -e "${BOLD}╔════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   ZenOrbit · Ollama Remote Tunnel      ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════╝${RESET}"
echo ""

if ! command -v brew &>/dev/null; then
  echo -e "${RED}✗ Homebrew fehlt.${RESET}"
  echo "  Bitte installieren: https://brew.sh"
  read -p "Enter zum Beenden..."
  exit 1
fi
echo -e "${GREEN}✓ Homebrew${RESET}"

if ! command -v ngrok &>/dev/null; then
  echo -e "${YELLOW}→ ngrok wird installiert...${RESET}"
  brew install ngrok
fi
echo -e "${GREEN}✓ ngrok${RESET}"

if ! command -v ollama &>/dev/null; then
  echo -e "${RED}✗ Ollama fehlt.${RESET}"
  echo "  Bitte installieren: https://ollama.com/download"
  read -p "Enter zum Beenden..."
  exit 1
fi
echo -e "${GREEN}✓ Ollama${RESET}"

if ! pgrep -x "ollama" &>/dev/null; then
  echo -e "${YELLOW}→ Ollama wird gestartet...${RESET}"
  ollama serve &>/dev/null &
  sleep 3
fi
echo -e "${GREEN}✓ Ollama läuft${RESET}"

MODELS=$(ollama list 2>/dev/null | tail -n +2)
if [ -z "$MODELS" ]; then
  echo -e "${YELLOW}→ Kein Modell gefunden. llama3.1:8b wird geladen...${RESET}"
  ollama pull llama3.1:8b
fi
echo -e "${GREEN}✓ Modell bereit${RESET}"

echo ""
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo -e "${BOLD}Tunnel startet...${RESET}"
echo ""
echo -e "Warte auf die ${CYAN}Forwarding${RESET}-Zeile:"
echo ""
echo -e "  ${CYAN}Forwarding  https://xxxxx.ngrok-free.app → localhost:11434${RESET}"
echo ""
echo -e "URL in ZenOrbit als ${BOLD}Endpoint${RESET} eintragen:"
echo -e "  ${YELLOW}https://xxxxx.ngrok-free.app/v1/chat/completions${RESET}"
echo ""
echo -e "Beenden: ${BOLD}Ctrl+C${RESET}"
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo ""
ngrok http 11434
STARTSCRIPT

chmod +x "$PAYLOAD_DIR/usr/local/share/zenorbit/ZenOrbit-Ollama-Start.command"

# ── postinstall: xattr entfernen + Desktop-Link anlegen ─────────────────────
cat > "$SCRIPTS_DIR/postinstall" << 'POSTINSTALL'
#!/bin/bash
INSTALL_PATH="/usr/local/share/zenorbit/ZenOrbit-Ollama-Start.command"
DESKTOP="$HOME/Desktop/ZenOrbit Ollama Start.command"

# Quarantäne entfernen
xattr -dr com.apple.quarantine "$INSTALL_PATH" 2>/dev/null || true
xattr -dr com.apple.metadata:kMDItemWhereFroms "$INSTALL_PATH" 2>/dev/null || true
chmod +x "$INSTALL_PATH"

# Desktop-Verknüpfung
cp "$INSTALL_PATH" "$DESKTOP" 2>/dev/null || true
xattr -dr com.apple.quarantine "$DESKTOP" 2>/dev/null || true
chmod +x "$DESKTOP" 2>/dev/null || true

exit 0
POSTINSTALL

chmod +x "$SCRIPTS_DIR/postinstall"

# ── .pkg bauen ───────────────────────────────────────────────────────────────
echo "Baue .pkg..."
pkgbuild \
  --root "$PAYLOAD_DIR" \
  --scripts "$SCRIPTS_DIR" \
  --identifier "de.denisbitter.zenorbit.ollama-setup" \
  --version "1.0.0" \
  --install-location "/" \
  "$OUTPUT"

rm -rf "$BUILD_DIR"

echo ""
echo "✓ Fertig: $OUTPUT"
echo "  Größe: $(du -sh "$OUTPUT" | cut -f1)"
echo ""
echo "Nutzer öffnet .pkg → Script landet auf dem Desktop → Doppelklick startet Tunnel"
