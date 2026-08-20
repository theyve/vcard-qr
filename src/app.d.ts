/// <reference types="@sveltejs/kit" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
  namespace App {
    interface Error {
      message: string;
    }
  }
}

export {};
