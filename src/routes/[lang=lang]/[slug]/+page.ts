import { error, redirect } from '@sveltejs/kit';
import { contentEntries, isLocale, pageFromSlug, wrongLanguageRedirect } from '$lib/site';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => contentEntries();

export const load: PageLoad = ({ params }) => {
  if (!isLocale(params.lang)) {
    error(404, 'Not found');
  }
  const elsewhere = wrongLanguageRedirect(params.lang, params.slug);
  if (elsewhere) {
    redirect(301, elsewhere);
  }
  const page = pageFromSlug(params.slug);
  if (!page || page === 'home') {
    error(404, 'Not found');
  }
  return { page };
};
