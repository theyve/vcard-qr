# vcardqr.ch

Free vCard QR codes for printed business cards. The QR code holds a vCard, not a URL. Form data stays in the browser.

**Site:** [https://vcardqr.ch/](https://vcardqr.ch/)

## What it does

1. You fill in contact fields in the browser
2. The page builds a vCard 3.0 string locally (FN is always present)
3. `qrcode` draws SVG/PNG from that string
4. You download PNG, SVG, or `.vcf`

There is no account and no hosted profile. Scans are not counted: the code is not a link.

## Privacy

Contact details never leave the device. The site measures anonymous page views with [Plausible](https://plausible.io/). That is traffic on vcardqr.ch, not activity on the QR code.

## URLs

German is the default.

| Page | DE | EN |
| --- | --- | --- |
| Generator | `/de/` | `/en/` |
| What a vCard is | `/de/was-ist-vcard/` | `/en/what-is-vcard/` |
| FAQ | `/de/faq/` | `/en/faq/` |

`/` redirects by `Accept-Language` (German if unmatched). Unknown paths are HTTP 404 with `noindex`.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5180](http://127.0.0.1:5180) (`npm run dev` pins that port). Port 5173 is often taken by DDEV on this machine; Vite then used to bind IPv6 only, so `localhost:5173` showed DDEV's empty 404. In dev, `/` is an HTTP 302 from the server hook. Pages are real SvelteKit routes, prerendered to HTML on build.

```bash
npm run build
npm run preview
```

`build/` is static output for Netlify (`netlify.toml` publish directory).

## Stack

- SvelteKit 2 + Svelte 5, `@sveltejs/adapter-static`
- Tailwind CSS v4
- `svelte-i18n` (strings in `src/lib/i18n/de.json` and `en.json`)
- `qrcode` for QR drawing
- PWA via `@vite-pwa/sveltekit`
- Plausible on every HTML page

## vCard 3.0

```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
N:Doe;John;;;
TITLE:Software Engineer
ORG:Acme Inc
TEL;TYPE=CELL:+1234567890
EMAIL;TYPE=INTERNET,WORK:john@example.com
URL:https://example.com
END:VCARD
```

Phone types: Cell, Work, Home.

## License

MIT. See [LICENSE](LICENSE).
