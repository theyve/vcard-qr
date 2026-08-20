import { ensureI18n } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const trailingSlash = 'always';

export const load: LayoutLoad = async ({ params }) => {
  const lang = params.lang === 'en' ? 'en' : 'de';
  await ensureI18n(lang);
  return { lang };
};
