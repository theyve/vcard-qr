import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Initialize i18n (must be before mounting App)
import { initI18n } from '$lib/i18n';
initI18n();

// Register PWA service worker (auto-updates in background)
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
