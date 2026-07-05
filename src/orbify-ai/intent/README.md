# Adaptive Intent Navigation

ZenOrbit bekommt hier seine erste regelbasierte Intent-Schicht.

Nicht:

- "KI baut irgendein Menü"

Sondern:

- "ZenOrbit entscheidet innerhalb klarer Grenzen, welches Menü für diesen Kontext sinnvoll ist."

## Ziel

Die Engine wandelt `UserContext` in eine begrenzte `MenuDecision` um:

- welche Items sichtbar sind
- welche Reihenfolge Priorität hat
- welches Layout passt
- warum die Entscheidung getroffen wurde

## Dateien

- `types.js` – Kontext-, Layout- und Decision-Grundstruktur
- `signals.js` – abgeleitete Verhaltenssignale
- `rules.js` – priorisierte Entscheidungsregeln
- `resolveZenOrbitMenu.js` – Resolver-Pipeline
- `index.js` – Barrel Export

## Beispiel

```javascript
import { resolveZenOrbitMenu } from './index';

const decision = resolveZenOrbitMenu({
  role: 'student',
  intent: 'learn',
  device: 'mobile',
  page: '/courses/react',
  scrollDepth: 0.64,
  returning: true,
  recentClicks: ['lesson', 'support'],
});

console.log(decision);
```

Beispielausgabe:

```javascript
{
  items: [
    { id: 'dashboard', label: 'Dashboard', route: '/dashboard', action: 'route', audience: 'student' },
    { id: 'courses', label: 'Meine Kurse', route: '/courses', action: 'route', audience: 'student' },
    { id: 'support', label: 'Support', route: '/support', action: 'route', audience: 'student' }
  ],
  layout: 'orbit',
  priorityItem: 'courses',
  reason: 'Returning learner detected. Resume-oriented actions outrank discovery.',
  matchedRules: ['returning-student'],
  signals: { ... }
}
```

## Einsatz in Builder / Customizer

Empfohlener Ablauf:

1. User baut Basismenü
2. Adaptive Intent Navigation wird aktiviert
3. Preview-Szenarien simulieren Kontexte:
   - `guest`
   - `student`
   - `customer`
   - `admin`
4. Runtime erhält echte Kontextdaten und ruft den Resolver auf

Aktueller Stand:

- Builder enthält bereits ein `Adaptive Intent`-Panel mit Preview-Szenarien
- Customizer enthält dasselbe `Adaptive Intent`-Panel für identische Szenario-Tests
- Szenarien liegen in `scenarios.js`
- Entscheidungen können direkt als Builder-Menü übernommen werden
- Entscheidungen können direkt als Customizer-Menü übernommen werden
- Runtime kann jetzt echte Signale verwenden: `page`, `scrollDepth`, `device`, `returning`, `recentClicks`

## Runtime-Signale

Die Runtime-Schicht liegt in `runtime.js`.

Aktuell werden live gesammelt:

- `page` aus der aktuellen Route
- `scrollDepth` aus dem echten Dokument-Scroll
- `device` aus der aktuellen Viewport-Breite
- `returning` via `localStorage`
- `recentClicks` via `localStorage`

Optional kann die App zusätzlich setzen:

- `localStorage['zenorbit-user-role']`
- `localStorage['zenorbit-user-intent']`

## Internes Debug-Panel

Die Runtime-Navigation kann ein internes Debug-Overlay anzeigen.

```jsx
<BitterButtonWithMenu
  adaptiveNavigation={{
    enabled: true,
    debug: true,
    itemCatalog,
  }}
/>
```

Das Panel zeigt live:

- aktuellen `UserContext`
- aktive `signals`
- `matchedRules`
- finale Runtime-`Decision`

## Bewusste Grenze

Diese erste Version ist **regelbasiert**.

Das ist Absicht:

- testbar
- erklärbar
- deterministisch
- später durch LLM-Assist erweiterbar

## Nächster Schritt

Später kann darüber eine optionale AI-Schicht liegen:

- LLM bewertet nur Signale
- LLM schlägt Prioritäten vor
- finale Entscheidung bleibt im Regelrahmen
