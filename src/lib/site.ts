import de from './i18n/de.json';
import en from './i18n/en.json';

export type SupportedLocale = 'de' | 'en';
export type PageId = 'home' | 'vcard' | 'faq';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['de', 'en'];
export const BASE_URL = 'https://vcardqr.ch';
export const GITHUB_URL = 'https://github.com/theyve/vcard-qr';
export const LICENSE_URL = 'https://github.com/theyve/vcard-qr/blob/main/LICENSE';
export const OG_IMAGE_URL = `${BASE_URL}/og.png`;
export const OG_LOCALES: Record<SupportedLocale, string> = { de: 'de_CH', en: 'en_US' };

export const PAGE_SLUGS: Record<PageId, Record<SupportedLocale, string>> = {
  home: { de: '', en: '' },
  vcard: { de: 'was-ist-vcard', en: 'what-is-vcard' },
  faq: { de: 'faq', en: 'faq' },
};

const SLUG_TO_PAGE: Record<string, PageId> = {};
for (const [page, slugs] of Object.entries(PAGE_SLUGS) as [PageId, Record<SupportedLocale, string>][]) {
  for (const slug of Object.values(slugs)) {
    if (slug) SLUG_TO_PAGE[slug] = page;
  }
}

export function isLocale(value: string): value is SupportedLocale {
  return value === 'de' || value === 'en';
}

export function pathFor(page: PageId, lang: SupportedLocale): string {
  const slug = PAGE_SLUGS[page][lang];
  return slug ? `/${lang}/${slug}/` : `/${lang}/`;
}

export function pageFromSlug(slug: string): PageId | null {
  if (slug === '') return 'home';
  return SLUG_TO_PAGE[slug] ?? null;
}

export function canonicalSlug(page: PageId, lang: SupportedLocale): string {
  return PAGE_SLUGS[page][lang];
}

/** If this slug belongs to a page but is the other language's URL, return the canonical path. */
export function wrongLanguageRedirect(lang: SupportedLocale, slug: string): string | null {
  const page = pageFromSlug(slug);
  if (!page || page === 'home') return null;
  const canonical = canonicalSlug(page, lang);
  if (canonical === slug) return null;
  return pathFor(page, lang);
}

export function localeFromAcceptLanguage(header: string | null): SupportedLocale {
  if (!header) return 'de';
  const tags = header.split(',').map((part) => part.split(';')[0].trim().toLowerCase());
  for (const tag of tags) {
    if (tag.startsWith('de')) return 'de';
    if (tag.startsWith('en')) return 'en';
  }
  return 'de';
}

export type SeoKey = 'home' | 'vcard' | 'faq' | 'notFound';

const PAGE_SEO_KEY: Record<PageId, SeoKey> = {
  home: 'home',
  vcard: 'vcard',
  faq: 'faq',
};

const MESSAGES = { de, en };

export function seoFor(lang: SupportedLocale, page: PageId | 'not-found'): {
  title: string;
  description: string;
  robots: string;
} {
  const seo = MESSAGES[lang].seo;
  if (page === 'not-found') {
    return { title: seo.title_404, description: seo.desc_404, robots: 'noindex, follow' };
  }
  const key = PAGE_SEO_KEY[page];
  const titles: Record<SeoKey, string> = {
    home: seo.title_home,
    vcard: seo.title_vcard,
    faq: seo.title_faq,
    notFound: seo.title_404,
  };
  const descriptions: Record<SeoKey, string> = {
    home: seo.desc_home,
    vcard: seo.desc_vcard,
    faq: seo.desc_faq,
    notFound: seo.desc_404,
  };
  return { title: titles[key], description: descriptions[key], robots: 'index, follow' };
}

export function hreflangFor(page: PageId): { de: string; en: string; xDefault: string } {
  const dePath = pathFor(page, 'de');
  const enPath = pathFor(page, 'en');
  return {
    de: dePath,
    en: enPath,
    xDefault: page === 'home' ? '/' : dePath,
  };
}

export function webApplicationJsonLd(lang: SupportedLocale, description: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: lang === 'de' ? 'vCard QR-Code Generator' : 'vCard QR Code Generator',
    url: `${BASE_URL}${pathFor('home', lang)}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: lang,
    description,
    codeRepository: GITHUB_URL,
    license: LICENSE_URL,
  };
}

export function webPageJsonLd(
  lang: SupportedLocale,
  name: string,
  url: string,
  description: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    description,
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', name: 'vcardqr.ch', url: BASE_URL },
  };
}

export function faqPageJsonLd(lang: SupportedLocale): Record<string, unknown> {
  const faq = MESSAGES[lang].faq as Record<string, string>;
  const keys = Object.keys(faq)
    .filter((key) => /^q\d+$/.test(key))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: keys.map((qKey) => ({
      '@type': 'Question',
      name: faq[qKey],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq[qKey.replace('q', 'a')].replace(/\n\n+/g, ' '),
      },
    })),
  };
}

export function contentEntries(): Array<{ lang: SupportedLocale; slug: string }> {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    (['vcard', 'faq'] as const).map((page) => ({
      lang,
      slug: canonicalSlug(page, lang),
    })),
  );
}
