import { useEffect, useState } from 'react';

const SITE = 'Blockwise Tech Blog';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Title, description, Open Graph / Twitter tags, canonical and JSON-LD. */
export function useSeo({ title, description, image, type = 'website', jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | Engineering & Product Insights`;
    document.title = fullTitle;
    const url = window.location.href.split('#')[0];
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script = document.getElementById('jsonld');
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) {
      script.remove();
    }
    return () => document.getElementById('jsonld')?.remove();
  }, [title, description, image, type, jsonLd && JSON.stringify(jsonLd)]);
}

export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

/** Google Analytics 4 readiness: set VITE_GA_ID=G-XXXXXXX to enable. */
export function initAnalytics() {
  const id = import.meta.env.VITE_GA_ID;
  if (!id || window.gtag) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

export function trackPageView(path) {
  if (window.gtag) window.gtag('event', 'page_view', { page_path: path });
}
