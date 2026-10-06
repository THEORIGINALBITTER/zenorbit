export const OFFERS = [
  {
    id: 'explore', name: 'Explore', price: 'Kostenlos', amount: 0, billing: 'Zum Ausprobieren',
    audience: 'Für einen ersten Eindruck im Builder.',
    features: ['Builder ausprobieren', 'Bis zu 3 Menüelemente', 'Ausgewählte Templates', 'Vorschau mit ZenOrbit-Branding', 'Kein vollständiger Production-Export'],
    longDescription: 'Explore ist der schnellste Weg, ZenOrbit selbst zu erleben. Du baust im Builder ein Orbit-Menü mit bis zu drei Elementen, probierst Layout und Bewegung aus und siehst live, wie sich deine Navigation anfühlt. Es entsteht kein Production-Export – Explore dient der Einschätzung, nicht dem Einsatz auf einer echten Seite.',
    useCases: ['Du willst vor dem Kauf prüfen, ob sich die Orbit-Navigation für dein Projekt richtig anfühlt.', 'Du zeigst einem Kunden oder Team eine erste Idee, bevor ein Budget freigegeben wird.', 'Du vergleichst ZenOrbit mit anderen Navigationsansätzen.'],
    faq: [
      { q: 'Kann ich Explore produktiv einsetzen?', a: 'Nein. Der Export ist eingeschränkt und trägt ZenOrbit-Branding – für den Live-Einsatz brauchst du Creator oder Studio.' },
      { q: 'Muss ich mich registrieren?', a: 'Nein, der Builder ist direkt im Browser nutzbar.' },
      { q: 'Kann ich später upgraden?', a: 'Ja, ein Wechsel zu Creator oder Studio ist jederzeit möglich, deine Builder-Experimente gehen nicht verloren.' },
    ],
  },
  {
    id: 'creator', name: 'Creator', price: '99 €', amount: 99, billing: 'einmalig · eine Person',
    audience: 'Für Freelancer und einzelne Entwickler.',
    features: ['Vollständiger React-Export', 'Alle grundlegenden Templates', 'Customizer · bis zu 12 Menüelemente', 'JSON-Import und -Export', 'Kommerzielle Nutzung für eigene Projekte', 'Updates für zwölf Monate', 'Nutzung durch eine Person'],
    longDescription: 'Creator ist die einmalige Lizenz für eine einzelne Person, die ZenOrbit in eigenen oder freiberuflichen Projekten produktiv einsetzt. Du erhältst den vollständigen React-Export, den Customizer mit bis zu zwölf Menüelementen sowie JSON-Import und -Export, um Konfigurationen zu sichern oder wiederzuverwenden. Zwölf Monate Updates sind enthalten, die zu diesem Zeitpunkt erworbene Version bleibt danach uneingeschränkt nutzbar.',
    useCases: ['Du baust als Freelancer eine Marken- oder Portfolio-Website mit einer markanten Navigation.', 'Du integrierst ZenOrbit in ein eigenes Produkt oder Side-Project.', 'Du entwickelst für einen einzelnen Kunden, ohne dass mehrere Personen an der Navigation arbeiten.'],
    faq: [
      { q: 'Reicht Creator für ein Kundenprojekt?', a: 'Ja, solange nur du an der Navigation arbeitest. Sobald ein Team oder mehrere Kundenprojekte beteiligt sind, ist Studio die passende Lizenz.' },
      { q: 'Was passiert nach den zwölf Monaten?', a: 'Du behältst die zu diesem Zeitpunkt aktuelle Version dauerhaft. Für neue Updates ist eine erneute Lizenz nötig.' },
      { q: 'Ist eine spätere Erweiterung auf Studio möglich?', a: 'Ja, ein Upgrade ist jederzeit möglich, sprich uns dazu einfach an.' },
    ],
  },
  {
    id: 'studio', name: 'Studio', price: '299 €', amount: 299, billing: 'einmalig · für Teams',
    audience: 'Für Agenturen, Designteams und Kundenprojekte.',
    features: ['Alles aus Creator', 'Nutzung im Team und für Kundenprojekte', 'Unbegrenzte Menüelemente', 'Premium-Templates', 'Branding-freier Export', 'HTML-Delivery-Paket', 'Adaptive und intent-basierte Funktionen', 'Bevorzugter Support'],
    longDescription: 'Studio erweitert Creator um alles, was für Teamarbeit und mehrere Kundenprojekte nötig ist: unbegrenzte Menüelemente, Premium-Templates, einen branding-freien Export sowie ein HTML-Delivery-Paket für die direkte Übergabe. Adaptive und intent-basierte Funktionen passen die Navigation an das Nutzerverhalten an. Bevorzugter Support unterstützt dich bei der Integration.',
    useCases: ['Deine Agentur setzt ZenOrbit für mehrere Kundenprojekte gleichzeitig ein.', 'Mehrere Designer:innen oder Entwickler:innen arbeiten gemeinsam an derselben Navigation.', 'Du lieferst ein fertiges HTML-Paket an einen Kunden ohne eigenes React-Setup.'],
    faq: [
      { q: 'Wie viele Personen dürfen Studio nutzen?', a: 'Ein ganzes Team – die Lizenz ist projektbezogen für Agenturen und Designteams gedacht, nicht personengebunden wie Creator.' },
      { q: 'Was ist das HTML-Delivery-Paket?', a: 'Ein eigenständiges HTML/CSS/JS-Export, das du auch ohne React-Build an Kunden übergeben kannst.' },
      { q: 'Ist Branding vollständig entfernbar?', a: 'Ja, der Export in Studio ist vollständig frei von ZenOrbit-Branding.' },
      { q: 'Gibt es ein Figma-Plugin für ZenOrbit?', a: 'Ein Figma-Plugin für Studio ist in Entwicklung – es synchronisiert Farben, Radius und Menüstruktur direkt aus deinem Figma-Entwurf mit dem Builder. Noch nicht verfügbar.' },
    ],
  },
  {
    id: 'signature', name: 'Signature', price: 'ab 2.500 €', amount: 2500, billing: 'individuelles Projektangebot',
    audience: 'Eine Marken-Navigation mit eigener gestalterischer Handschrift.',
    features: ['Analyse der Marke', 'Individuelle Bewegungslogik', 'Maßgeschneiderte Orbit-Komposition', 'Responsive Ausarbeitung', 'React-Integration', 'Übergabe und Dokumentation'],
    longDescription: 'Signature ist kein Software-Produkt, sondern ein begleitetes Projekt: Ausgehend von einer Analyse deiner Marke entwickle ich eine Orbit-Komposition mit eigener Bewegungslogik, die responsiv ausgearbeitet und in dein React-Projekt integriert wird. Am Ende steht eine dokumentierte Übergabe, mit der dein Team selbstständig weiterarbeiten kann.',
    useCases: ['Deine Marke hat eine klare visuelle Identität, die die Standard-Templates nicht abbilden.', 'Du willst eine Navigation, die sich spürbar von Wettbewerbern unterscheidet.', 'Dein Team kann React integrieren, aber nicht die gestalterische und animatorische Feinarbeit selbst leisten.'],
    faq: [
      { q: 'Wie läuft ein Signature-Projekt ab?', a: 'Es beginnt mit einem gemeinsamen Briefing, gefolgt von Markenanalyse, Konzept, Umsetzung und begleiteter Übergabe.' },
      { q: 'Wie lange dauert ein Signature-Projekt üblicherweise?', a: 'Der Umfang wird im Angebot nach dem Briefing festgelegt – er hängt von Komplexität und Integrationstiefe ab.' },
      { q: 'Ist Support nach der Übergabe enthalten?', a: 'Die Übergabe umfasst eine Dokumentation. Laufende Betreuung darüber hinaus wird im Angebot separat festgehalten.' },
    ],
  },
  {
    id: 'bespoke', name: 'Bespoke Experience', price: 'ab 6.000 €', amount: 6000, billing: 'je nach Umfang 6.000–15.000 €+',
    audience: 'Für anspruchsvolle Marken mit umfassendem Integrationsbedarf.',
    features: ['Marken- und Interaktionsworkshop', 'Vollständig individuelle Navigation', 'Adaptive Inhalte und Intent-Logik', 'Accessibility-Prüfung', 'Integration in die bestehende Anwendung', 'Motion-System und Dokumentation', 'Definierte Optimierungsphase nach Veröffentlichung'],
    longDescription: 'Bespoke Experience ist die umfassendste Stufe: ein gemeinsamer Marken- und Interaktionsworkshop bildet die Grundlage für eine vollständig individuelle Navigation mit adaptiven Inhalten und Intent-Logik. Die Umsetzung wird in deine bestehende Anwendung integriert, geprüft auf Accessibility und mit einem dokumentierten Motion-System übergeben. Nach der Veröffentlichung folgt eine definierte Optimierungsphase, in der die Navigation anhand echter Nutzung verfeinert wird.',
    useCases: ['Du integrierst die Navigation tief in eine bestehende, komplexe Anwendung.', 'Deine Nutzer:innen sollen je nach Kontext oder Intent unterschiedliche Inhalte in der Navigation sehen.', 'Accessibility und Qualitätssicherung sind für dein Projekt verbindliche Anforderungen.'],
    faq: [
      { q: 'Warum ist die Preisspanne so groß?', a: 'Der Umfang reicht von einer einzelnen tief integrierten Navigation bis zu mehreren adaptiven Varianten mit komplexer Intent-Logik – der genaue Preis ergibt sich aus dem Workshop.' },
      { q: 'Was passiert in der Optimierungsphase?', a: 'Nach dem Launch wird das Verhalten der Navigation anhand echter Nutzungsdaten geprüft und feinjustiert – der Umfang wird vorab definiert.' },
      { q: 'Ist Signature ein sinnvoller erster Schritt?', a: 'Wenn der Integrationsbedarf geringer ist als beschrieben, ist Signature oft die passendere und schnellere Wahl.' },
    ],
  },
];

export const COMPARISON_ROWS = [
  { label: 'Preis', values: { explore: 'Kostenlos', creator: '99 € einmalig', studio: '299 € einmalig', signature: 'ab 2.500 €', bespoke: 'ab 6.000 €' } },
  { label: 'Menüelemente', values: { explore: 'bis zu 3', creator: 'bis zu 12', studio: 'unbegrenzt', signature: 'individuell', bespoke: 'individuell' } },
  { label: 'React-Export', values: { explore: '–', creator: '✓', studio: '✓', signature: '✓', bespoke: '✓' } },
  { label: 'Branding-frei', values: { explore: '–', creator: '–', studio: '✓', signature: '✓', bespoke: '✓' } },
  { label: 'Team- / Kundennutzung', values: { explore: '–', creator: '–', studio: '✓', signature: '✓', bespoke: '✓' } },
  { label: 'Individuelle Gestaltung', values: { explore: '–', creator: '–', studio: '–', signature: '✓', bespoke: '✓' } },
  { label: 'Adaptive / Intent-Logik', values: { explore: '–', creator: '–', studio: '✓', signature: '–', bespoke: '✓' } },
  { label: 'Accessibility-Prüfung', values: { explore: '–', creator: '–', studio: '–', signature: '–', bespoke: '✓' } },
  { label: 'Betreuung nach Launch', values: { explore: '–', creator: '–', studio: 'Support', signature: 'Dokumentation', bespoke: 'Optimierungsphase' } },
];

export const SUPPORT_EMAIL = 'saghallo@denisbitter.de';
