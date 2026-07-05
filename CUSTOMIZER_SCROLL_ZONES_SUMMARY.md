# Customizer Scroll-Zonen Zusammenfassung

## Ziel

Die Scroll-Vorschau im `CustomizerPage` bildet jetzt drei Ebenen sauber getrennt ab:

1. Geräte-/Browser-Chrome
2. Header-Zone innerhalb der eigentlichen Seitenfläche
3. Footer-Stop innerhalb der eigentlichen Seitenfläche

Damit startet die Y-Achse für das Scroll-Menü nicht mehr am äußersten Frame-Rand, sondern an der nutzbaren Content-Fläche des gewählten Geräts.

## Umgesetzte Änderungen

### 1. Gemeinsames Geräte-Chrome-Modell

In `src/pages/CustomizerPage.jsx` wurde ein zentrales Modell für die Preview-Chrome eingeführt:

- `PREVIEW_DEVICE_CHROME`
- `getPreviewDeviceChrome(...)`
- `PreviewDeviceChrome`

Dieses Modell beschreibt pro Gerät die visuelle Chrome-Fläche:

- `desktop`
- `ipadPortrait`
- `ipadLandscape`
- `mobile`

Jedes Gerät hat definierte `contentInsets`, damit Scroll-Berechnung, Bounds-Warnungen und Overlay-Darstellung dieselbe Content-Fläche verwenden.

### 2. Scroll-UI erweitert

Im Scrolling-Bereich des Customizers wurden neue Controls ergänzt:

- `Header-Zone Aktiv/Aus`
- `Footer-Stop Aktiv/Aus`
- `Header-Zone Höhe`
- `Footer-Stop Höhe`
- `Start unter Header`

Dadurch kann der User visuell definieren:

- ob oben ein Header reserviert wird
- ob unten ein Footer-/Stop-Bereich reserviert wird
- wie hoch beide Bereiche sind
- wie weit unterhalb der Header-Zone der Scroll-Button startet

### 3. Live-Preview visualisiert die Zonen

Die Preview zeigt jetzt zwei Hilfs-Overlays:

- `Header-Zone`
- `Footer-Stop`

Diese Overlays liegen auf der tatsächlichen Seitenfläche innerhalb des Geräte-/Browser-Chrome und werden nur angezeigt, wenn die jeweilige Zone aktiv ist.

Die Farbgebung wurde bewusst von Warn-Rot auf ruhige Hilfsflächen umgestellt:

- sand/gold statt Fehlerrot
- gestrichelte Kante als visuelle Grenze
- gleiche Begrifflichkeit wie im rechten Panel

### 4. Scroll-Mathematik angepasst

Die Position des Scroll-Buttons berücksichtigt jetzt:

- Geräte-Chrome oben
- Geräte-Chrome unten
- aktive Header-Zone
- aktive Footer-Stop-Zone
- bestehende Bottom-Buffer-Werte
- Open-State-Shifts

Das bedeutet konkret:

- `Start unter Header` beginnt unterhalb von Browser-/Geräte-Chrome und unterhalb der Header-Zone
- der Footer-Stop verkleinert die verfügbare Scroll-Strecke nach unten
- Bounds-Warnungen prüfen die gleiche nutzbare Fläche wie die Preview selbst

### 5. Export und Restore

Die neuen Scroll-Zonen werden im Snapshot-/Draft-State mitgeführt und beim Wiederherstellen wieder angewendet.

Zusätzlich wurde der generierte Export in `src/utils/codeGenerator.js` so erweitert, dass Header- und Footer-Offsets auch im exportierten React/CSS-Verhalten berücksichtigt werden.

## Betroffene Dateien

- `src/pages/CustomizerPage.jsx`
- `src/utils/codeGenerator.js`
- `CUSTOMIZER_SCROLL_ZONES_SUMMARY.md`

## Ergebnis

Der User kann jetzt im Customizer klar zwischen diesen Bereichen unterscheiden:

- Geräte-/Browser-Leiste
- eigentlicher Header der Seite
- eigentlicher Footer-/Stop-Bereich der Seite

Dadurch werden Scroll-Start, Scroll-Ende und die visuelle Vorschau deutlich verständlicher und konsistenter.

## Validierung

Validiert mit:

```bash
npm run build
```

Status:

- Build erfolgreich
- bestehende Vite-Warnung zu großen Chunks unverändert
