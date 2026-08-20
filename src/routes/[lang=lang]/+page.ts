import type { PageLoad } from './$types';

export const load: PageLoad = () => ({ page: 'home' as const });
