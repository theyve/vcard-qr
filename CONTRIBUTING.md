# Contributing

Thanks for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run check    # TypeScript check
npm run lint     # ESLint
```

## Pull Request Guidelines

1. **Keep it focused**: One feature or fix per PR
2. **Maintain privacy guarantees**: Do not add:
   - Network requests (fetch, axios, etc.)
   - Analytics or tracking
   - Persistent storage without explicit user consent
   - External resources or CDN dependencies
3. **Test your changes**: Verify the QR codes scan correctly
4. **Follow existing style**: The codebase uses TypeScript, Svelte 5 runes, and Tailwind CSS
5. **Update docs if needed**: Keep README accurate

## Code Style

- TypeScript with strict mode
- Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Tailwind CSS for styling
- Meaningful variable and function names
- Comments for non-obvious logic

## Reporting Issues

- Check existing issues first
- Include browser and OS information
- Provide steps to reproduce
- For security issues, see [SECURITY.md](SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
