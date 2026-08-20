/**
 * i18n using svelte-i18n. Locale comes from the /de/ or /en/ route, not from a client router.
 */
import { addMessages, init, locale, waitLocale } from 'svelte-i18n';
import de from './i18n/de.json';
import en from './i18n/en.json';
import type { SupportedLocale } from './site';

addMessages('de', de);
addMessages('en', en);

let started = false;

export function ensureI18n(lang: SupportedLocale): Promise<void> {
  if (!started) {
    init({
      fallbackLocale: 'de',
      initialLocale: lang,
    });
    started = true;
  } else {
    locale.set(lang);
  }
  return waitLocale(lang);
}

export { locale };
export type { SupportedLocale };
