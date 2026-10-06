# ZenOrbit Angebote

Die Angebotstexte und Preise stehen in `src/config/offers.js`. `/pro` bleibt die bestehende URL der Angebotsseite.

| Angebot | Preis | Nutzung |
| --- | --- | --- |
| Explore | Kostenlos | Builder-Vorschau, bis zu 3 Menüelemente, Default und Minimal, kein Production-Export |
| Creator | 99 € einmalig | Eine Person, eigene kommerzielle Projekte, React/JSON, grundlegende Templates, bis zu 12 Menüelemente |
| Studio | 299 € einmalig | Team- und Kundenprojekte, unbegrenzte Menüelemente, Luxury/Vibrant, HTML, adaptive Funktionen, Branding-freier Export |
| Signature | ab 2.500 € | Individuelles Projektangebot mit Briefing, Gestaltung, React-Integration und Dokumentation |
| Bespoke Experience | ab 6.000 € | Individuelles Projektangebot mit Workshop, Integration, Accessibility-Prüfung und vereinbarter Optimierungsphase |

Creator und Studio enthalten zwölf Monate Updates. Die erworbene Version bleibt dauerhaft nutzbar. Die zeitliche Update-Berechtigung wird beim manuellen Verkauf dokumentiert; die App deaktiviert nach zwölf Monaten keine erworbene Funktion. Teamumfang und individuelle Projektleistungen werden im Angebot festgehalten.

## Verkauf und bestehende Lizenzen

Anfragen öffnen das E-Mail-Programm und enthalten Angebot, Preis und die eingegebenen Kontaktdaten. Es wird weder automatisch gekauft noch eine Nachricht versendet. Der alte pauschale Checkout-Link wird nicht für die neuen Tarife wiederverwendet.

Neue Schlüssel erzeugen:

```sh
node scripts/generate-key.js --tier=creator
node scripts/generate-key.js --tier=studio
node scripts/generate-key.js --validate KEY
```

`ZNCRT` kennzeichnet Creator und `ZNSTU` Studio. Bestehende `ZNPRO`-Schlüssel behalten die früher zugesagten unbegrenzten Funktionen. Aktivierung und Wechsel sind auf der Angebotsseite und im Menüeditor verfügbar. Aktive Ansichten werden nach einem Wechsel synchronisiert.

Die vorhandene lokale Schlüsselprüfung wurde erweitert; dies ist kein neuer serverseitiger Lizenzdienst. Individuelle Angebote erzeugen nicht automatisch einen Software-Schlüssel.

## xAI Grok

Im Builder unter Provider konfigurieren `xAI Grok` auswählen, den eigenen API-Key aus `console.x.ai` eintragen und mit Test prüfen. Standardmodell: `grok-4.6`, Endpoint: `https://api.x.ai/v1/chat/completions`. Der Key wird wie die anderen persönlichen Provider-Einstellungen lokal gespeichert. API-Nutzung wird separat durch xAI abgerechnet.

Offizielle Referenzen:
- https://docs.x.ai/developers/grok-4-6
- https://docs.x.ai/developers/rest-api-reference/inference/chat-completions

## Support und Übergabe

Anfragen gehen an `saghallo@denisbitter.de`; Studio erhält bevorzugte Bearbeitung. Für individuelle Projekte werden Zielgeräte, Browser, Tastaturbedienung, reduzierte Bewegung und die Übergabedokumentation vorab abgestimmt. Die Angebotsseite behauptet keine Zertifizierung oder bereits absolvierte Accessibility-Prüfung des Builders.
