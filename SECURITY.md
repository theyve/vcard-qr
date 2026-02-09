# Security Policy

## Scope

This is a **client-side only** application. There is no server, no backend, and no data transmission. All processing happens locally in your browser.

### What this means for security

- **No server vulnerabilities**: There's no server to attack
- **No data breaches**: Your contact information never leaves your browser
- **No authentication**: There are no accounts or credentials
- **No database**: Nothing is stored persistently

### Potential concerns

The only security-relevant code paths are:

1. **QR code generation**: Uses the well-maintained `qrcode` npm package
2. **SVG rendering**: The generated SVG is rendered using `{@html}` in Svelte, but it comes from the trusted `qrcode` library, not user input
3. **File downloads**: Uses standard Blob URLs and anchor click simulation—no data is uploaded

## Reporting a Vulnerability

If you discover a security issue:

1. **Do not open a public issue**
2. Email the maintainer directly (see package.json for contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 7 days and work with you to understand and address the issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices for Users

Since this is a client-side app:

- Use a modern, updated browser
- Be cautious if you fork and modify the code
- Review any third-party deployments before using them
- When in doubt, run it locally from the source code
