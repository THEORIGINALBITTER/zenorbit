# ZenOrbit Dokumentation

Technische Gesamtdokumentation fuer Entwicklung, Architektur, SEO und Deployment.

## Projektueberblick

ZenOrbit ist eine React/Vite Web-App zum Erstellen radialer Orbit-Menues.

Ziele:
- Schneller Einstieg ueber den 3-Step Builder
- Tiefes Feintuning ueber den Customizer
- Export von wiederverwendbarem React-Code

## Routen und Seiten

| Route | Seite | Zweck |
|---|---|---|
| `/` | LandingPage | Produktueberblick, Demo, Einstieg |
| `/builder` | BuilderPage | Wizard fuer Template, Design, Export |
| `/customizer` | CustomizerPage | Erweitertes Feintuning aller Parameter |
| `/guide` | GuidePage | Help-Seite mit "So geht das" Ablauf |
| `/hilfe` | GuidePage | Alias fuer deutschsprachigen Einstieg |
| `/pro` | PricingPage | Pro-Angebot, Kauf- und Supportflow |

Routing ist in `src/App.jsx` zentral definiert.

## Tech-Stack

- Vite 7
- React 19
- React Router DOM 7
- Framer Motion
- React Icons
- File Saver + JSZip (Export)

## Projektstruktur

```text
src/
  components/
    builder/          # UI-Bausteine fuer Builder/Customizer
    layout/           # Navbar/Footer
    seo/              # SEO-Metadaten-Management
  config/             # Default-Konfigurationen
  hooks/              # State- und Feature-Hooks
  orbify-ai/          # AI-Logik und Services
  orbify-core/        # Core-Utilities und Validierung
  pages/              # Route-Komponenten
  styles/             # Design-Tokens (z. B. zenPalette)
  templates/          # Vordefinierte Menu-Templates
  utils/              # Codegenerierung, Hilfsfunktionen
```

## Lokales Setup

Voraussetzungen:
- Node.js 18 oder neuer
- npm

Start:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

## Umgebungsvariablen

Datei: `.env.local` (lokal, nicht committen)

Relevante Keys:
- `VITE_AI_API_KEY` - optional fuer AI-Features
- `VITE_PRO_BUY_URL` - Ziel-URL fuer Pro-Kaufbutton
- `VITE_SITE_URL` - optionale Basis-URL fuer absolute Canonical-/OG-URLs (SEO)

Beispiel:

```bash
VITE_SITE_URL=https://zenorbit.denisbitter.de
VITE_PRO_BUY_URL=https://example-checkout-url
VITE_AI_API_KEY=...
```

## SEO

ZenOrbit nutzt zentrales route-basiertes Meta-Management ueber:
- `src/components/seo/SeoHelmet.jsx`

Die Komponente setzt pro Seite:
- `<title>`
- `meta[name="description"]`
- `meta[name="robots"]`
- `meta[name="keywords"]` (optional)
- Open Graph (`og:title`, `og:description`, `og:url`, `og:image`, ...)
- Twitter Card Metas
- `link[rel="canonical"]`

Fallback-Metas fuer First Paint liegen in `index.html`.

Hinweis:
- Fuer saubere Production-URLs `VITE_SITE_URL` setzen.

## Build und Deployment

Deployment laeuft via GitHub Actions auf IONOS ueber SFTP.

Details:
- Siehe `DEPLOYMENT.md`
- Workflow-Datei: `.github/workflows/deploy.yml`

Kurzablauf:
1. Code nach `main` pushen
2. GitHub Action baut `dist/`
3. Upload auf IONOS Zielpfad
4. Seite ist live

## Bekannte technische Punkte

- Bundle ist aktuell relativ gross (Vite-Warnung > 800 kB).
- Potenzial fuer Split:
  - route-basiertes Lazy Loading
  - gezieltes Chunking via Rollup-Config

## Entwicklungsworkflow

Empfohlener Ablauf:

```bash
git checkout -b feat/<name>
# Aenderungen
npm run build
git add .
git commit -m "feat: <beschreibung>"
git push
```

## Troubleshooting

Direkte Route liefert 404 auf Server:
- Pruefen, ob `.htaccess` korrekt deployed ist.

Build-Fehler lokal:
- Node-Version pruefen
- Dependencies neu installieren

```bash
rm -rf node_modules package-lock.json
npm install
```

## Kontakt

Support E-Mail: `saghallo@denisbitter.de`
