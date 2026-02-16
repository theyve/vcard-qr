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
    faq: de.seo.title_faq,
  },
  en: {
    home: en.seo.title_home,
    vcard: en.seo.title_vcard,
    faq: en.seo.title_faq,
  },
};

const SEO_DESCRIPTIONS: Record<SupportedLocale, Record<string, string>> = {
  de: {
    home: de.seo.desc_home,
    vcard: de.seo.desc_vcard,
    faq: de.seo.desc_faq,
  },
  en: {
    home: en.seo.desc_home,
    vcard: en.seo.desc_vcard,
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
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', SEO_DESCRIPTIONS[lang]?.[seoKey] ?? SEO_DESCRIPTIONS[lang]?.home ?? '');

  // <link rel="canonical">
  const canonicalUrl = `${BASE_URL}${pathname.replace(/\/$/, '') || '/'}`;
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  // hreflang tags
  updateHreflangTags(route?.hreflangPairs ?? { de: '/de/', en: '/en/' });
}

/**
 * Create or update hreflang <link> tags in <head>.
 */
function updateHreflangTags(pairs: Record<SupportedLocale, string>): void {
  // Remove existing hreflang tags we manage
  document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove());

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

export { locale, SUPPORTED_LOCALES, BASE_URL };
