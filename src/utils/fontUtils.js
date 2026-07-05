export function extractFontStylesheetUrl(input) {
  if (!input) return '';

  const value = String(input).trim();
  if (!value) return '';

  const hrefMatch = value.match(/href=["']([^"']+)["']/i);
  if (hrefMatch?.[1]) return hrefMatch[1];

  const importMatch = value.match(/@import\s+url\((['"]?)([^'")]+)\1\)/i);
  if (importMatch?.[2]) return importMatch[2];

  const urlMatch = value.match(/url\((['"]?)(https?:\/\/[^'")]+)\1\)/i);
  if (urlMatch?.[2]) return urlMatch[2];

  const plainUrlMatch = value.match(/https?:\/\/\S+/i);
  if (plainUrlMatch?.[0]) {
    return plainUrlMatch[0].replace(/["'`);]+$/, '');
  }

  return value;
}

function inferGenericFallback(fontName) {
  const lower = String(fontName || '').toLowerCase();
  if (lower.includes('mono') || lower.includes('code')) return 'monospace';
  if (lower.includes('serif') && !lower.includes('sans')) return 'serif';
  return 'sans-serif';
}

export function extractGoogleFontFamily(input) {
  const stylesheetUrl = extractFontStylesheetUrl(input);
  if (!stylesheetUrl || !stylesheetUrl.includes('fonts.googleapis.com')) return '';

  try {
    const url = new URL(stylesheetUrl);
    const families = url.searchParams.getAll('family');
    if (!families.length) return '';

    const firstFamily = families[0].split(':')[0].replace(/\+/g, ' ').trim();
    if (!firstFamily) return '';

    return `"${firstFamily}", ${inferGenericFallback(firstFamily)}`;
  } catch {
    return '';
  }
}
