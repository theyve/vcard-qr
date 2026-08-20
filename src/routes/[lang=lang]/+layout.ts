import { error } from '@sveltejs/kit';
import { ensureI18n } from '$lib/i18n';
import { isLocale } from '$lib/site';
import type { LayoutLoad } from './$types';

export const prerender = true;

export const load: LayoutLoad = async ({ params }) => {
  if (!isLocale(params.lang)) {
    error(404, 'Not found');
  }
  await ensureI18n(params.lang);
  return { lang: params.lang };
};
