# ZenOrbit – Radial Menu Builder

Visueller Builder für radiale Orbit-Menüs in React.
Live unter: **zenorbit.denisbitter.de**

## Dokumentation

- Gesamtdoku: `DOCS.md`
- Deployment: `DEPLOYMENT.md`

## Seiten

| Route | Inhalt |
|-------|--------|
| `/` | Landing Page mit Live-Demo |
| `/builder` | 3-Step-Wizard: Template → Design → ZIP-Export |
| `/customizer` | Profi-Customizer mit allen Einstellungen |
| `/guide` | Help- und Schritt-für-Schritt Guide („So geht das“) |
| `/hilfe` | Alias auf den Guide |
| `/pro` | Pro Pricing & Kaufanfrage |

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne http://localhost:5173

## AI-Features aktivieren (optional)

```bash
cp .env.example .env.local
# VITE_AI_API_KEY eintragen
```

## Build

```bash
npm run build
# Output: dist/
```

## SEO (Web)

- Route-SEO fuer `/`, `/builder`, `/customizer`, `/guide`, `/pro`
- `robots.txt` und `sitemap.xml` im `public/` Ordner
- Canonical/OG/Twitter Meta via zentraler SEO-Komponente
- Optional: `VITE_SITE_URL` fuer saubere absolute URLs setzen

## Deployment auf IONOS

### Automatisch (GitHub Actions)

1. GitHub Repo: `github.com/THEORIGINALBITTER/zenorbit`
2. Code pushen
3. GitHub Secrets setzen (unter Settings → Secrets → Actions):

| Secret | Wert |
|--------|------|
| `FTP_HOST` | z.B. `ftp.denisbitter.de` |
| `FTP_USERNAME` | IONOS FTP-Benutzername |
| `FTP_PASSWORD` | IONOS FTP-Passwort |
| `FTP_PATH` | Serverpfad z.B. `/zenorbit.denisbitter.de/` |
| `VITE_AI_API_KEY` | (optional) AI API Key |

Bei jedem Push auf `main` wird automatisch gebaut und deployed.

### Manuell (FTP)

```bash
npm run build
# dist/ Ordner per FTP auf IONOS hochladen
# Ziel: zenorbit.denisbitter.de Webspace
```

### IONOS Subdomain einrichten

1. IONOS Kundencenter → Domains → denisbitter.de
2. Subdomain `zenorbit` anlegen
3. Zielordner auf den Webspace-Pfad zeigen lassen

### .htaccess (bereits in public/)

Die `.htaccess` leitet alle Routen auf `index.html` weiter (notwendig für React Router).

## Technischer Stack

- Vite + React 19
- React Router v7
- Framer Motion
- orbify-core (Konfiguration, Validierung, Mathe)
- orbify-ai (KI-Menügenerator, Lizenzsystem)

## Ursprung

Ausgelagert aus [lerneinfach](https://github.com/THEORIGINALBITTER/lerneinfach).
Pakete: `@denisbitter/bitter-button-menu`, `@denisbitter/bitter-menu-builder`
