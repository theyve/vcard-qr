/**
 * i18n initialization using svelte-i18n.
 * Language is determined by URL path prefix (/de/ or /en/).
 * Also handles dynamic SEO meta tags and hreflang.
 */
import { addMessages, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import de from './i18n/de.json';
import en from './i18n/en.json';

export type SupportedLocale = 'de' | 'en';

const SUPPORTED_LOCALES: SupportedLocale[] = ['de', 'en'];
const BASE_URL = 'https://vcardqr.ch';
const GITHUB_URL = 'https://github.com/theyve/vcard-qr';
const LICENSE_URL = 'https://github.com/theyve/vcard-qr/blob/main/LICENSE';
const OG_IMAGE_URL = `${BASE_URL}/web-app-manifest-512x512.png`;
const OG_LOCALES: Record<SupportedLocale, string> = { de: 'de_CH', en: 'en_US' };

// Register messages
addMessages('de', de);
addMessages('en', en);

/**
 * Extract the language prefix from a URL pathname.
 * Returns 'de' or 'en', or null if no valid prefix found.
 */
export function getLocaleFromPath(pathname: string = window.location.pathname): SupportedLocale | null {
  const match = pathname.match(/^\/(de|en)(\/|$)/);
  return match ? (match[1] as SupportedLocale) : null;
}

/**
 * Detect the preferred locale from the browser's navigator.language.
 * Returns 'de' for any de-* locale, 'en' for everything else.
 */
export function detectBrowserLocale(): SupportedLocale {
  const nav = getLocaleFromNavigator() || navigator.language || 'en';
  return nav.startsWith('de') ? 'de' : 'en';
}

/**
 * Map of page slugs to their localized paths and hreflang pairs.
 */
interface RouteInfo {
  page: string;
  seoKey: string;
  hreflangPairs: Record<SupportedLocale, string>;
}

const ROUTE_MAP: Record<string, RouteInfo> = {
  '': {
    page: 'home',
    seoKey: 'home',
    hreflangPairs: { de: '/de/', en: '/en/' },
  },
  'was-ist-vcard': {
    page: 'vcard',
    seoKey: 'vcard',
    hreflangPairs: { de: '/de/was-ist-vcard', en: '/en/what-is-vcard' },
  },
  'what-is-vcard': {
    page: 'vcard',
    seoKey: 'vcard',
    hreflangPairs: { de: '/de/was-ist-vcard', en: '/en/what-is-vcard' },
  },
  'qr-code-visitenkarte': {
    page: 'business-card-guide',
    seoKey: 'businessCardGuide',
    hreflangPairs: { de: '/de/qr-code-visitenkarte', en: '/en/business-card-qr-code' },
  },
  'business-card-qr-code': {
    page: 'business-card-guide',
    seoKey: 'businessCardGuide',
    hreflangPairs: { de: '/de/qr-code-visitenkarte', en: '/en/business-card-qr-code' },
  },
  'faq': {
    page: 'faq',
    seoKey: 'faq',
    hreflangPairs: { de: '/de/faq', en: '/en/faq' },
  },
};

/**
 * Parse the current pathname into lang + page slug.
 */
export function parseRoute(pathname: string = window.location.pathname): { lang: SupportedLocale; slug: string; route: RouteInfo | null } {
  const lang = getLocaleFromPath(pathname);
  if (!lang) {
    return { lang: 'de', slug: '', route: null };
  }
  // Remove the /de/ or /en/ prefix and any trailing slash
  const rest = pathname.replace(/^\/(de|en)\/?/, '').replace(/\/$/, '');
  const route = ROUTE_MAP[rest] ?? null;
  return { lang, slug: rest, route };
}

/**
 * Get the equivalent path in the other language.
 */
export function getAlternatePath(currentPath: string, targetLang: SupportedLocale): string {
  const { route } = parseRoute(currentPath);
  if (route) {
    return route.hreflangPairs[targetLang];
  }
  // Fallback: just swap the prefix
  return `/${targetLang}/`;
}

// SEO meta tag helpers
const SEO_TITLES: Record<SupportedLocale, Record<string, string>> = {
  de: {
    home: de.seo.title_home,
    vcard: de.seo.title_vcard,
    businessCardGuide: de.seo.title_business_card_guide,
    faq: de.seo.title_faq,
  },
  en: {
    home: en.seo.title_home,
    vcard: en.seo.title_vcard,
    businessCardGuide: en.seo.title_business_card_guide,
    faq: en.seo.title_faq,
  },
};

const SEO_DESCRIPTIONS: Record<SupportedLocale, Record<string, string>> = {
  de: {
    home: de.seo.desc_home,
    vcard: de.seo.desc_vcard,
    businessCardGuide: de.seo.desc_business_card_guide,
    faq: de.seo.desc_faq,
  },
  en: {
    home: en.seo.desc_home,
    vcard: en.seo.desc_vcard,
    businessCardGuide: en.seo.desc_business_card_guide,
    faq: en.seo.desc_faq,
  },
};

/**
 * Update SEO meta tags, hreflang links, and canonical for the current route.
 */
export function updateSeoForRoute(lang: SupportedLocale, pathname: string): void {
  const { route } = parseRoute(pathname);
  const seoKey = route?.seoKey ?? 'home';

  // <html lang>
  document.documentElement.lang = lang;

  // <title>
  document.title = SEO_TITLES[lang]?.[seoKey] ?? SEO_TITLES[lang]?.home ?? '';

  // <meta name="description">
  const description = SEO_DESCRIPTIONS[lang]?.[seoKey] ?? SEO_DESCRIPTIONS[lang]?.home ?? '';
  setMetaContent('meta[name="description"]', 'name', 'description', description);

  // <link rel="canonical">
  const canonicalPath = route?.hreflangPairs[lang] ?? `/${lang}/`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  setMetaContent('meta[property="og:title"]', 'property', 'og:title', document.title);
  setMetaContent('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaContent('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaContent('meta[property="og:image"]', 'property', 'og:image', OG_IMAGE_URL);
  setMetaContent('meta[property="og:locale"]', 'property', 'og:locale', OG_LOCALES[lang]);
  setMetaContent('meta[name="twitter:title"]', 'name', 'twitter:title', document.title);
  setMetaContent('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaContent('meta[name="twitter:image"]', 'name', 'twitter:image', OG_IMAGE_URL);

  upsertJsonLd('webapp', webApplicationJsonLd(lang, `${BASE_URL}/${lang}/`, description));

  // hreflang tags
  updateHreflangTags(route?.hreflangPairs ?? { de: '/de/', en: '/en/' });
}

function setMetaContent(selector: string, attr: string, name: string, content: string): void {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertJsonLd(id: string, data: Record<string, unknown>): void {
  let script = document.querySelector(`script[type="application/ld+json"][data-seo="${id}"]`) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function webApplicationJsonLd(
  lang: SupportedLocale,
  url: string,
  description: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: lang === 'de' ? 'vCard QR-Code Generator' : 'vCard QR Code Generator',
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: lang,
    description,
    codeRepository: GITHUB_URL,
    license: LICENSE_URL,
  };
}

/**
 * Create or update hreflang <link> tags in <head>.
 */
function updateHreflangTags(pairs: Record<SupportedLocale, string>): void {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

  for (const loc of SUPPORTED_LOCALES) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = loc;
    link.href = `${BASE_URL}${pairs[loc]}`;
    link.setAttribute('data-hreflang', 'managed');
    document.head.appendChild(link);
  }

  // x-default pointing to the root (auto-detect)
  const xdefault = document.createElement('link');
  xdefault.rel = 'alternate';
  xdefault.hreflang = 'x-default';
  xdefault.href = `${BASE_URL}/`;
  xdefault.setAttribute('data-hreflang', 'managed');
  document.head.appendChild(xdefault);
}

/**
 * Initialize svelte-i18n with the locale derived from the current URL path.
 * Should be called once at app startup (in main.ts).
 */
export function initI18n(): void {
  const pathLocale = getLocaleFromPath();
  const initialLocale = pathLocale ?? detectBrowserLocale();

  init({
    fallbackLocale: 'de',
    initialLocale,
  });
}

export { locale, SUPPORTED_LOCALES, BASE_URL, GITHUB_URL, LICENSE_URL, OG_IMAGE_URL };
