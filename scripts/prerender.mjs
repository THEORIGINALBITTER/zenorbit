#!/usr/bin/env node
/**
 * Prerendert die statischen Marketing-Routen nach dem Vite-Build:
 * öffnet jede Route headless, wartet auf das React-Rendering
 * (inkl. SeoHelmet-Meta-Tags und JSON-LD) und schreibt das fertige
 * HTML zurück in die jeweilige dist/*.html — damit sehen auch
 * Crawler ohne JS-Ausführung (GPTBot, ClaudeBot, PerplexityBot, …)
 * den vollständigen Inhalt.
 */
import { chromium } from 'playwright';
import { preview } from 'vite';
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');

const SITE_URL = process.env.VITE_SITE_URL || 'https://zenorbit.denisbitter.de';
const PREVIEW_ORIGIN = 'http://localhost:4319';

const ROUTES = [
  { path: '/', file: 'index.html' },
  { path: '/builder', file: 'builder.html' },
  { path: '/customizer', file: 'customizer.html' },
  { path: '/guide', file: 'guide.html' },
  { path: '/hilfe', file: 'hilfe.html' },
  { path: '/pro', file: 'pro.html' },
];

// Diese Routen enthalten interaktive Builder/Customizer-UI, keinen
// statischen Marketing-Inhalt — Prerendering bringt dort keinen
// SEO-Nutzen und würde nur unnötig große HTML-Dateien erzeugen.
const SKIP = new Set(['/builder', '/customizer']);

async function main() {
  const previewServer = await preview({
    root,
    build: { outDir: 'dist' },
    preview: { port: 4319, strictPort: true },
  });
  const base = `http://localhost:4319`;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const route of ROUTES) {
    if (SKIP.has(route.path)) continue;
    // Über die konkrete .html-Datei laden (wie es die .htaccess-Rewrite
    // in Produktion tut), damit die zur Route passenden Vorab-Meta-Tags
    // und Assets aus dem echten Build geladen werden.
    const url = `${base}/${route.file}`;
    console.log(`Prerender ${route.path} → ${route.file}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    // React committet Titel/Meta/JSON-LD in einem useEffect nach dem
    // ersten Paint — ein Tick Puffer stellt sicher, dass alles gesetzt ist.
    await page.waitForTimeout(150);

    let html = await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}`);
    // Falls VITE_SITE_URL beim Build nicht gesetzt war, fällt SeoHelmet auf
    // window.location.origin zurück — das wäre hier der lokale Preview-Server.
    html = html.split(PREVIEW_ORIGIN).join(SITE_URL);

    const filePath = resolve(distDir, route.file);
    await writeFile(filePath, html, 'utf-8');
  }

  await browser.close();
  await previewServer.close();
  console.log('Prerendering abgeschlossen.');
}

main().catch((error) => {
  console.error('Prerendering fehlgeschlagen:', error);
  process.exitCode = 1;
});
