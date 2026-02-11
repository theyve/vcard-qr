import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

// Register PWA service worker (auto-updates in background)
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
