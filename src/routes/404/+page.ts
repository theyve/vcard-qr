import { ensureI18n } from '$lib/i18n';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async () => {
  await ensureI18n('de');
  return { lang: 'de' as const, page: 'not-found' as const };
};
