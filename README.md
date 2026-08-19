# VCard QR Code Generator

vcardqr.ch is a free and open-source vCard QR code generator. Contact data is processed locally in the browser and is never uploaded to a server.

**Website:** [https://vcardqr.ch/](https://vcardqr.ch/)

## Features

- **Contact fields**: First/last name, job title, company, address, email, website
- **Multiple phone numbers**: Add as many as needed, with type (Cell/Work)
- **Social profiles**: LinkedIn, Twitter, GitHub, and more
- **Live QR preview**: Updates in real-time as you type
- **Download options**: PNG (1024×1024), SVG (vector), or vCard (.vcf) file
- **Error correction control**: Adjust QR density vs. robustness

## Transparency & Privacy

Contact details are processed locally in the browser and are never uploaded to a server.

### Trust Checklist

- ✅ **QR generation is client-side**: No backend stores or receives your contact details
- ✅ **No ads, no account**: You do not need to sign up
- ✅ **Fully auditable**: Source code is open and readable

### What the code does

1. Takes your input from form fields
2. Builds a vCard 3.0 formatted string locally
3. Generates a QR code from that string using the `qrcode` library
4. Renders the QR as SVG/PNG entirely in your browser
5. Downloads happen via browser APIs (Blob URLs)—no upload

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
npm run preview  # to test the build locally
```

The `dist/` folder contains static files ready to deploy anywhere (Netlify, Vercel, GitHub Pages, any static host).

## Project Structure

```
src/
├── App.svelte              # Main application, state management
├── main.ts                 # Entry point
├── app.css                 # Global styles (Tailwind CSS variables)
├── lib/
│   ├── vcard.ts           # vCard 3.0 generation (fully auditable)
│   ├── qr.ts              # QR code generation (wraps qrcode lib)
│   └── download.ts        # File download utilities
└── components/
    ├── ContactForm.svelte  # Contact input form
    ├── QrPreview.svelte    # QR preview + download actions
    ├── PhoneInput.svelte   # Phone number row component
    ├── SocialInput.svelte  # Social profile row component
    └── ui/                 # Minimal UI primitives (Button, Card, etc.)
```

## Tech Stack

- [Svelte 5](https://svelte.dev/) with runes
- [Vite](https://vitejs.dev/) for bundling
- [Tailwind CSS v4](https://tailwindcss.com/)
- [qrcode](https://www.npmjs.com/package/qrcode) for QR generation
- TypeScript throughout

## Built with AI

This project was developed using AI coding assistants. The entire codebase—components, styling, documentation, and configuration—was written with AI tools. This is noted for transparency; the code remains fully auditable.

## vCard Format

The app generates vCard 3.0, the most widely compatible format for QR scanners:

```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
N:Doe;John;;;
TITLE:Software Engineer
ORG:Acme Inc
TEL;TYPE=CELL:+1234567890
EMAIL;TYPE=INTERNET:john@example.com
URL:https://example.com
X-SOCIALPROFILE;type=linkedin:https://linkedin.com/in/johndoe
END:VCARD
```

## License

MIT - see [LICENSE](LICENSE)
