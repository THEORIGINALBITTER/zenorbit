import { useEffect } from 'react';

const SITE_NAME = 'ZenOrbit';
const SITE_BRAND_SUFFIX = 'ZenOrbit by Denis Bitter';
const SITE_URL = 'https://zenorbit.denisbitter.de';
const DEFAULT_IMAGE = '/og_zenorbit_20260522_1200x630.png';
const DEFAULT_DESCRIPTION = 'ZenOrbit ist das Radial-Menu-System von Denis Bitter: entwickelt und designt für markenstarke React-Interfaces mit Live-Vorschau, Customizer, KI-Generator und Export.';
const DEFAULT_THEME_COLOR = '#e8e3d8';
const DEFAULT_PUBLISH_DATE = '2026-05-22';

const setMetaTag = (selector, attributes) => {
  if (typeof document === 'undefined') return;

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const removeTag = (selector) => {
  if (typeof document === 'undefined') return;
  const element = document.head.querySelector(selector);
  if (element) element.remove();
};

const setCanonical = (href) => {
  if (typeof document === 'undefined') return;

  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
};

const buildAbsoluteUrl = (path) => {
  const baseUrl =
    import.meta.env.VITE_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : SITE_URL);

  if (!path) return baseUrl;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export default function SeoHelmet({
  title,
  description,
  path = '/',
  canonicalPath,
  image = DEFAULT_IMAGE,
  keywords,
  robots = 'index,follow',
  type = 'website',
  imageAlt = 'ZenOrbit Preview',
  jsonLd,
  locale = 'de_DE',
  author = 'Denis Bitter',
  themeColor = DEFAULT_THEME_COLOR,
  publishDate = DEFAULT_PUBLISH_DATE,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_BRAND_SUFFIX}` : 'ZenOrbit Radial Menu - Entwickelt und designt von Denis Bitter, Software Engineer';
    const safeDescription = description || DEFAULT_DESCRIPTION;
    const url = buildAbsoluteUrl(path);
    const canonicalUrl = buildAbsoluteUrl(canonicalPath || path);
    const imageUrl = buildAbsoluteUrl(image);

    document.title = fullTitle;

    setMetaTag('meta[name="description"]', { name: 'description', content: safeDescription });
    setMetaTag('meta[name="robots"]', { name: 'robots', content: robots });
    setMetaTag('meta[name="author"]', { name: 'author', content: author });
    setMetaTag('meta[name="theme-color"]', { name: 'theme-color', content: themeColor });
    setMetaTag('meta[name="application-name"]', { name: 'application-name', content: SITE_NAME });
    setMetaTag('meta[name="apple-mobile-web-app-title"]', { name: 'apple-mobile-web-app-title', content: SITE_NAME });

    if (keywords) {
      setMetaTag('meta[name="keywords"]', { name: 'keywords', content: keywords });
    } else {
      removeTag('meta[name="keywords"]');
    }

    setMetaTag('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    setMetaTag('meta[property="og:description"]', { property: 'og:description', content: safeDescription });
    setMetaTag('meta[property="og:type"]', { property: 'og:type', content: type });
    setMetaTag('meta[property="og:url"]', { property: 'og:url', content: url });
    setMetaTag('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    setMetaTag('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url', content: imageUrl });
    setMetaTag('meta[property="og:image:type"]', { property: 'og:image:type', content: 'image/png' });
    setMetaTag('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    setMetaTag('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    setMetaTag('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
    setMetaTag('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_BRAND_SUFFIX });
    setMetaTag('meta[property="og:locale"]', { property: 'og:locale', content: locale });

    setMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    setMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: safeDescription });
    setMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    setMetaTag('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });
    setMetaTag('meta[name="twitter:url"]', { name: 'twitter:url', content: url });
    setMetaTag('meta[name="publish_date"]', { name: 'publish_date', content: publishDate });
    setMetaTag('meta[property="article:published_time"]', { property: 'article:published_time', content: `${publishDate}T00:00:00Z` });

    // Clear optional article extras that are not needed.
    removeTag('meta[property="article:modified_time"]');
    removeTag('meta[property="article:author"]');

    setCanonical(canonicalUrl);

    const scriptId = 'zo-jsonld';
    let script = document.getElementById(scriptId);

    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
  }, [author, canonicalPath, description, image, imageAlt, jsonLd, keywords, locale, path, publishDate, robots, themeColor, title, type]);

  return null;
}
