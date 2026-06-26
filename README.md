# SV – Freie Waldorfschule Frankfurt

Website der Schülervertretung (SV) der Freien Waldorfschule Frankfurt am Main.
Single-Page-Website im hellen „Papier-/Archiv“-Stil: Glassmorphism, Schreibmaschinen-Akzente
(Courier Prime), Bleistift-Skizzen und dezente Scroll-Animationen. Farbwelt: Schwarz · Weiß ·
Dunkelblau.

## Tech-Stack

- **[Vite](https://vitejs.dev/)** – Build-Tool & Dev-Server
- **Vanilla JavaScript** – keine Framework- oder Animations-Bibliothek; Effekte über CSS
  und `IntersectionObserver`
- **[Fontsource](https://fontsource.org/)** – selbst gehostete Schriften
  ([Inter](https://rsms.me/inter/) + [Courier Prime](https://fonts.google.com/specimen/Courier+Prime)) –
  **kein Google-CDN** (DSGVO-konform)

## Voraussetzungen

- Node.js ≥ 20
- npm ≥ 10

## Lokale Entwicklung

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Dev-Server starten (http://localhost:5173/SV-FFM/)
npm run build    # Produktions-Build nach dist/
npm run preview  # Produktions-Build lokal testen
```

> Hinweis: Wegen `base: '/SV-FFM/'` läuft die Seite lokal unter dem Pfad
> `/SV-FFM/`, nicht auf der Root-URL.

## Projektstruktur

```
.
├── index.html          # HTML-Grundgerüst, Meta-Tags, CSP, noscript-Fallback
├── public/
│   ├── .nojekyll        # verhindert Jekyll-Processing auf GitHub Pages
│   └── assets/          # statische Assets (Logo)
├── src/
│   ├── main.js          # Einstieg: Fonts laden, Interaktionen initialisieren
│   ├── style.css        # gesamtes Styling (Papier-/Archiv-Design)
│   └── scroll.js        # Scroll-Reveal, Scroll-Spy, Header, Mobile-Nav, Pointer-Glow, Kontakt
├── vite.config.js       # Vite-Konfiguration (base)
└── .github/workflows/
    └── deploy.yml       # CI: Build & Deploy nach GitHub Pages
```

## Deployment (GitHub Pages)

Das Deployment läuft über **GitHub Actions** (`.github/workflows/deploy.yml`):
Bei jedem Push auf `main` wird `npm run build` ausgeführt und der `dist/`-Ordner
nach GitHub Pages veröffentlicht.

**Wichtig – einmalige Einstellung im Repository:**
`Settings → Pages → Build and deployment → Source` muss auf **„GitHub Actions“**
stehen (nicht „Deploy from a branch“). Andernfalls liefert GitHub Pages die
ungebaute `index.html` aus und die Seite bleibt leer.

## Barrierefreiheit & Datenschutz

- Selbst gehostete Schriften – keine Datenübertragung an Google.
- `prefers-reduced-motion` wird respektiert (keine Animationen).
- Skip-Link, Fokus-Ringe und ARIA-Attribute für Tastatur-/Screenreader-Nutzung.
- Ohne JavaScript bleiben alle Inhalte sichtbar (noscript-Fallback).
- Content-Security-Policy gegen XSS/Injection.

## Lizenz

[GPL-3.0](LICENSE)
