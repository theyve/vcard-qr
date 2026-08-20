import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { localeFromAcceptLanguage } from '$lib/site';

export const handle: Handle = async ({ event, resolve }) => {
  if (!building && event.url.pathname === '/') {
    const lang = localeFromAcceptLanguage(event.request.headers.get('accept-language'));
    redirect(302, `/${lang}/`);
  }

  const lang = event.params.lang === 'en' ? 'en' : 'de';
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang),
  });
};
