# ZenOrbit – Deployment Guide

Wie das Projekt von lokalem Code bis live auf `zenorbit.denisbitter.de` kommt.

---

## Übersicht

```
Lokaler Code  →  git push  →  GitHub Actions  →  SFTP  →  IONOS Webspace  →  zenorbit.denisbitter.de
```

---

## 1. Lokale Entwicklung

```bash
# Projekt klonen
git clone https://github.com/THEORIGINALBITTER/zenorbit.git
cd zenorbit

# Dependencies installieren
npm install

# Dev-Server starten (http://localhost:5173)
npm run dev

# Produktion bauen (Output: dist/)
npm run build
```

---

## 2. Git & GitHub

### Struktur
- **Repo:** github.com/THEORIGINALBITTER/zenorbit
- **Branch:** `main` → löst automatisch Deployment aus

### Typischer Workflow
```bash
# Änderungen machen
# ...

# Status prüfen
git status

# Änderungen stagen
git add .

# Commit erstellen
git commit -m "beschreibung der änderung"

# Zu GitHub pushen → startet automatisch Deployment
git push
```

### Deployment manuell auslösen (ohne Codeänderung)
```bash
git commit --allow-empty -m "trigger: deploy"
git push
```

---

## 3. GitHub Actions (automatisches Deployment)

Die Datei `.github/workflows/deploy.yml` läuft bei jedem Push auf `main`.

### Was sie macht:
1. Code auschecken
2. Node.js 20 einrichten
3. `npm ci` (Dependencies installieren)
4. `npm run build` (React-App bauen → `dist/`)
5. `lftp` per SFTP auf IONOS hochladen

### Workflow-Datei ansehen:
→ `.github/workflows/deploy.yml`

### Status prüfen:
→ github.com/THEORIGINALBITTER/zenorbit/actions

Grüner Haken = deployed ✅
Rotes X = Fehler, Logs anschauen ❌

---

## 4. GitHub Secrets

Zugangsdaten werden **nie in den Code** geschrieben, sondern als verschlüsselte Secrets gespeichert.

**Wo:** github.com/THEORIGINALBITTER/zenorbit/settings/secrets/actions

| Secret Name | Wert | Wo finden |
|-------------|------|-----------|
| `SFTP_HOST` | `access-5017945545.webspace-host.com` | IONOS Kundencenter → Hosting → FTP/SSH |
| `SFTP_USERNAME` | `a2413730` | IONOS Kundencenter → Hosting → FTP/SSH |
| `SFTP_PASSWORD` | dein IONOS Passwort | IONOS Kundencenter → Hosting → FTP/SSH |
| `SFTP_PATH` | `/zenorbit/` | IONOS Webspace-Explorer |
| `VITE_AI_API_KEY` | Anthropic API Key | optional, für AI-Features |

**Secret updaten:** Auf den Secret-Namen klicken → "Update" → neuen Wert eingeben.

---

## 5. IONOS Webspace

### Struktur auf dem Server
```
/ (Webspace-Root)
├── zenorbit/          ← unsere App landet hier
│   ├── index.html
│   ├── .htaccess      ← React Router funktioniert nur damit!
│   └── assets/
│       ├── index-xxx.js
│       └── index-xxx.css
├── blog/
├── zenpost/
└── ...
```

### Subdomain-Einrichtung (einmalig)
1. IONOS Kundencenter → **Domains & SSL**
2. `denisbitter.de` → **Subdomains**
3. `zenorbit` → Zielordner: `/zenorbit`

### `.htaccess` – warum wichtig?
React verwendet clientseitiges Routing. Wenn jemand direkt
`zenorbit.denisbitter.de/builder` aufruft, würde der Apache-Server
nach einem echten Ordner `builder/` suchen → 404.

Die `.htaccess` leitet alle Anfragen auf `index.html` um:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## 6. Fehlerbehebung

### "Permission denied" beim SFTP
→ `SFTP_PASSWORD` Secret ist falsch
→ Im IONOS Kundencenter Passwort neu setzen und Secret updaten

### Seite lädt, aber `/builder` gibt 404
→ `.htaccess` fehlt auf dem Server
→ GitHub Actions neu auslösen: `git commit --allow-empty -m "trigger" && git push`

### GitHub Actions schlägt fehl
→ github.com/THEORIGINALBITTER/zenorbit/actions → Job anklicken → Logs lesen
→ Häufigste Ursache: falsches Secret

### Lokaler Build funktioniert nicht
```bash
# Node-Version prüfen (braucht v18+)
node --version

# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
```

---

## 7. Neues Feature deployen (Cheatsheet)

```bash
# 1. Änderung machen (Datei editieren)

# 2. Testen
npm run dev

# 3. Committen & pushen
git add .
git commit -m "feat: beschreibung"
git push

# 4. Actions-Tab auf GitHub beobachten
# → grüner Haken = live auf zenorbit.denisbitter.de
```

Das war's. 🎯
