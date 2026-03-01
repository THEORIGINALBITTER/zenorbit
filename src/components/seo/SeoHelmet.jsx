import { useEffect } from 'react';

const SITE_NAME = 'ZenOrbit';
const DEFAULT_IMAGE = '/ZenLogo_B.png';

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
  if (typeof window === 'undefined') return path || '';
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

  if (!path) return baseUrl;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

export default function SeoHelmet({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  keywords,
  robots = 'index,follow',
  type = 'website',
  imageAlt = 'ZenOrbit Preview',
  jsonLd,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = buildAbsoluteUrl(path);
    const imageUrl = buildAbsoluteUrl(image);

    document.title = fullTitle;

    setMetaTag('meta[name="description"]', { name: 'description', content: description });
    setMetaTag('meta[name="robots"]', { name: 'robots', content: robots });

    if (keywords) {
      setMetaTag('meta[name="keywords"]', { name: 'keywords', content: keywords });
    }

    setMetaTag('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    setMetaTag('meta[property="og:description"]', { property: 'og:description', content: description });
    setMetaTag('meta[property="og:type"]', { property: 'og:type', content: type });
    setMetaTag('meta[property="og:url"]', { property: 'og:url', content: url });
    setMetaTag('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    setMetaTag('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
    setMetaTag('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    setMetaTag('meta[property="og:locale"]', { property: 'og:locale', content: 'de_DE' });

    setMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    setMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    setMetaTag('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });

    setCanonical(url);

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
  }, [description, image, imageAlt, jsonLd, keywords, path, robots, title, type]);

  return null;
}
