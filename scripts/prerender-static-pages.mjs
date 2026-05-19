import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const baseUrl = 'https://vcardqr.ch';

const [template, de, en] = await Promise.all([
  fs.readFile(path.join(distDir, 'index.html'), 'utf8'),
  readJson(path.join(rootDir, 'src/lib/i18n/de.json')),
  readJson(path.join(rootDir, 'src/lib/i18n/en.json')),
]);

const routes = [
  {
    path: '/de/',
    lang: 'de',
    title: de.seo.title_home,
    description: de.seo.desc_home,
    alternates: { de: '/de/', en: '/en/', 'x-default': '/' },
    body: homeContent(de, 'de'),
  },
  {
    path: '/en/',
    lang: 'en',
    title: en.seo.title_home,
    description: en.seo.desc_home,
    alternates: { de: '/de/', en: '/en/', 'x-default': '/' },
    body: homeContent(en, 'en'),
  },
  {
    path: '/de/qr-code-visitenkarte',
    lang: 'de',
    title: de.seo.title_business_card_guide,
    description: de.seo.desc_business_card_guide,
    alternates: { de: '/de/qr-code-visitenkarte', en: '/en/business-card-qr-code' },
    body: guideContent(de, 'de'),
  },
  {
    path: '/en/business-card-qr-code',
    lang: 'en',
    title: en.seo.title_business_card_guide,
    description: en.seo.desc_business_card_guide,
    alternates: { de: '/de/qr-code-visitenkarte', en: '/en/business-card-qr-code' },
    body: guideContent(en, 'en'),
  },
  {
    path: '/de/was-ist-vcard',
    lang: 'de',
    title: de.seo.title_vcard,
    description: de.seo.desc_vcard,
    alternates: { de: '/de/was-ist-vcard', en: '/en/what-is-vcard' },
    body: vcardContent(de, 'de'),
  },
  {
    path: '/en/what-is-vcard',
    lang: 'en',
    title: en.seo.title_vcard,
    description: en.seo.desc_vcard,
    alternates: { de: '/de/was-ist-vcard', en: '/en/what-is-vcard' },
    body: vcardContent(en, 'en'),
  },
  {
    path: '/de/faq',
    lang: 'de',
    title: de.seo.title_faq,
    description: de.seo.desc_faq,
    alternates: { de: '/de/faq', en: '/en/faq' },
    body: faqContent(de, 'de'),
    structuredData: faqStructuredData(de),
  },
  {
    path: '/en/faq',
    lang: 'en',
    title: en.seo.title_faq,
    description: en.seo.desc_faq,
    alternates: { de: '/de/faq', en: '/en/faq' },
    body: faqContent(en, 'en'),
    structuredData: faqStructuredData(en),
  },
];

for (const route of routes) {
  const html = renderRoute(route);
  const outputDir = path.join(distDir, route.path.replace(/^\/|\/$/g, ''));
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), html);
}

console.log(`Prerendered ${routes.length} static route pages.`);

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function renderRoute(route) {
  const alternateLinks = Object.entries(route.alternates)
    .map(([hreflang, href]) => `    <link rel="alternate" hreflang="${hreflang}" href="${baseUrl}${href}" />`)
    .join('\n');
  const structuredData = route.structuredData
    ? `\n    <script type="application/ld+json">${escapeScriptJson(route.structuredData)}</script>`
    : '';

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${route.lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${escapeAttr(route.description)}" />`
    )
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${baseUrl}${route.path}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttr(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeAttr(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${baseUrl}${route.path}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`)
    .replace(/(?:[ ]{4}<link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>\n?)+/, `${alternateLinks}\n`)
    .replace(/<div id="app"><\/div>/, `<div id="app" data-prerendered="true">${route.body}</div>`)
    .replace('</head>', `${structuredData}\n  </head>`);
}

function homeContent(messages, lang) {
  const guidePath = lang === 'de' ? '/de/qr-code-visitenkarte' : '/en/business-card-qr-code';
  const vcardPath = lang === 'de' ? '/de/was-ist-vcard' : '/en/what-is-vcard';
  const faqPath = `/${lang}/faq`;
  return pageShell(messages, lang, `
    <section class="space-y-4">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(messages.header.title)}</h1>
      <p class="text-lg text-muted-foreground leading-relaxed">${escapeHtml(messages.header.subtitle)}</p>
      <p class="text-muted-foreground leading-relaxed">${escapeHtml(messages.footer.seo_text)}</p>
      <a class="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background" href="${guidePath}">${escapeHtml(messages.footer.use_case_business_cards_heading)}</a>
    </section>
    <section class="grid gap-3 sm:grid-cols-3">
      ${useCaseCard(messages.footer.use_case_business_cards_heading, messages.footer.use_case_business_cards_text)}
      ${useCaseCard(messages.footer.use_case_free_generator_heading, messages.footer.use_case_free_generator_text)}
      ${useCaseCard(messages.footer.use_case_contact_capture_heading, messages.footer.use_case_contact_capture_text)}
    </section>
    <section class="space-y-3">
      <h2 class="text-2xl font-bold tracking-tight">${escapeHtml(messages.footer.how_heading)}</h2>
      <p class="text-muted-foreground leading-relaxed">${escapeHtml(messages.footer.how_link_text)}${escapeHtml(messages.footer.how_text_after)}</p>
    </section>
    <nav class="flex flex-wrap gap-4 text-sm">
      <a class="font-medium underline underline-offset-2" href="${guidePath}">${escapeHtml(lang === 'de' ? 'QR-Code für Visitenkarte erstellen' : 'Create QR code for business card')}</a>
      <a class="font-medium underline underline-offset-2" href="${vcardPath}">${escapeHtml(messages.guide_page.more_vcard_link)}</a>
      <a class="font-medium underline underline-offset-2" href="${faqPath}">${escapeHtml(messages.guide_page.more_faq_link)}</a>
    </nav>
  `);
}

function guideContent(messages, lang) {
  const homePath = `/${lang}/`;
  const faqItems = ['q1', 'q2', 'q3'].map((key) => {
    const answerKey = key.replace('q', 'a');
    return `
      <div class="p-4">
        <h3 class="font-semibold">${escapeHtml(messages.guide_page[key])}</h3>
        <p class="mt-1 text-sm text-muted-foreground leading-relaxed">${escapeHtml(messages.guide_page[answerKey])}</p>
      </div>
    `;
  }).join('');

  return pageShell(messages, lang, `
    <section class="space-y-4">
      <p class="text-sm font-semibold uppercase tracking-wide text-accent">${escapeHtml(messages.guide_page.kicker)}</p>
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(messages.guide_page.heading)}</h1>
      <p class="text-lg text-muted-foreground leading-relaxed">${escapeHtml(messages.guide_page.intro)}</p>
      <a class="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background" href="${homePath}">${escapeHtml(messages.guide_page.cta)}</a>
    </section>
    <section class="grid gap-3 sm:grid-cols-3">
      ${useCaseCard(messages.guide_page.benefit_fast_heading, messages.guide_page.benefit_fast_text)}
      ${useCaseCard(messages.guide_page.benefit_print_heading, messages.guide_page.benefit_print_text)}
      ${useCaseCard(messages.guide_page.benefit_private_heading, messages.guide_page.benefit_private_text)}
    </section>
    ${section(messages.guide_page.how_heading, messages.guide_page.how_text)}
    ${section(messages.guide_page.contact_heading, messages.guide_page.contact_text, [
      messages.guide_page.contact_name,
      messages.guide_page.contact_phone,
      messages.guide_page.contact_email,
      messages.guide_page.contact_company,
      messages.guide_page.contact_website,
    ])}
    ${section(messages.guide_page.print_heading, messages.guide_page.print_text)}
    <section class="grid gap-3 sm:grid-cols-3">
      ${useCaseCard(messages.guide_page.format_svg_heading, messages.guide_page.format_svg_text)}
      ${useCaseCard(messages.guide_page.format_png_heading, messages.guide_page.format_png_text)}
      ${useCaseCard(messages.guide_page.format_vcf_heading, messages.guide_page.format_vcf_text)}
    </section>
    ${section(messages.guide_page.static_heading, messages.guide_page.static_text)}
    ${section(messages.guide_page.scan_heading, messages.guide_page.scan_text)}
    <section class="divide-y rounded-xl border">${faqItems}</section>
  `);
}

function vcardContent(messages, lang) {
  return pageShell(messages, lang, `
    <section class="space-y-4">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(messages.vcard_page.heading)}</h1>
      <p class="text-lg text-muted-foreground leading-relaxed">${escapeHtml(messages.vcard_page.intro)}</p>
    </section>
    ${section(messages.vcard_page.usage_heading, messages.vcard_page.usage_text)}
    ${section(messages.vcard_page.scan_heading, '', [
      messages.vcard_page.scan_iphone,
      messages.vcard_page.scan_android,
    ])}
    ${section(messages.vcard_page.print_heading, messages.vcard_page.print_text)}
    ${section(messages.vcard_page.format_heading, messages.vcard_page.format_text)}
    <a class="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background" href="/${lang}/">${escapeHtml(messages.vcard_page.back_link.replace('← ', ''))}</a>
  `);
}

function faqContent(messages, lang) {
  const faqItems = Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return `
      <details class="group border-b border-border/50 p-4" open>
        <summary class="font-semibold">${escapeHtml(messages.faq[`q${number}`])}</summary>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">${escapeHtml(messages.faq[`a${number}`])}</p>
      </details>
    `;
  }).join('');

  return pageShell(messages, lang, `
    <section class="space-y-4">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">${escapeHtml(messages.faq.heading)}</h1>
      <p class="text-lg text-muted-foreground leading-relaxed">${escapeHtml(messages.seo.desc_faq)}</p>
    </section>
    <section class="rounded-xl border">${faqItems}</section>
  `);
}

function pageShell(messages, lang, content) {
  return `
    <div class="min-h-screen flex flex-col">
      <header class="border-b bg-card/80">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <a href="/${lang}/" class="flex items-center gap-3 no-underline text-inherit">
            <span class="brand-qr" aria-hidden="true"></span>
            <span>
              <span class="block text-xl sm:text-2xl font-bold tracking-tight">${escapeHtml(messages.header.title)}</span>
              <span class="hidden sm:block text-sm text-muted-foreground">${escapeHtml(messages.header.subtitle)}</span>
            </span>
          </a>
        </div>
      </header>
      <main class="flex-1 px-4 mb-10 sm:px-6 py-6 sm:py-8">
        <div class="max-w-4xl mx-auto">
          <article class="rounded-2xl border bg-card p-5 sm:p-8 space-y-8">${content}</article>
        </div>
      </main>
    </div>
  `;
}

function section(title, text, list = []) {
  const items = list.length
    ? `<ul class="grid gap-2 sm:grid-cols-2">${list.map((item) => `<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span><span>${escapeHtml(item)}</span></li>`).join('')}</ul>`
    : '';
  return `
    <section class="space-y-3">
      <h2 class="text-2xl font-bold tracking-tight">${escapeHtml(title)}</h2>
      ${text ? `<p class="text-muted-foreground leading-relaxed">${escapeHtml(text)}</p>` : ''}
      ${items}
    </section>
  `;
}

function useCaseCard(title, text) {
  return `
    <div class="rounded-xl border bg-secondary/35 p-4">
      <h2 class="text-base font-semibold">${escapeHtml(title)}</h2>
      <p class="mt-1 text-sm text-muted-foreground leading-relaxed">${escapeHtml(text)}</p>
    </div>
  `;
}

function faqStructuredData(messages) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: Array.from({ length: 10 }, (_, index) => {
      const number = index + 1;
      return {
        '@type': 'Question',
        name: messages.faq[`q${number}`],
        acceptedAnswer: {
          '@type': 'Answer',
          text: messages.faq[`a${number}`],
        },
      };
    }),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}
