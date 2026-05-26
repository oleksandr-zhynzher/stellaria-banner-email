# Stellaria — FE Test

Static implementation of the Stellaria launch assets in two self-contained builds:

- `banner/` — 300 × 600 animated HTML5 banner ad.
- `email/` — 600px responsive single-column HTML email.
- `assets/` — original downloaded source assets and copy reference.
- `scripts/` — local server, analyzers, and archive builder.

## Tooling

Requires Node.js 20.19+.

```bash
npm install
npm run quality
```

Useful scripts:

- `npm run serve` — serve the repo at `http://localhost:8080`.
- `npm run format` / `npm run format:check` — format or check HTML, CSS, JS, SVG, and Markdown with Prettier.
- `npm run lint:html` — run static HTML validation.
- `npm run analyze:email` — run production email checks for table markup, preheader, VML CTA, local assets, no JS/forms, ISI copy, and Gmail clipping budget.
- `npm run analyze:banner` — verify banner dimensions, ISI behavior, local assets, reduced motion, count-up, and <1MB size budget.
- `npm run analyze:structure` — verify required files, package scripts, archive contents, and production folder boundaries.
- `npm run audit` — check installed dependencies for high-severity vulnerabilities.
- `npm run build` — rebuild `stellaria-fe-test.zip`.

## How to run locally

No build step is required.

1. Open `banner/index.html` directly in a browser, or serve the folder with the static server.
2. Open `email/index.html` directly in a browser or import the file into an email QA tool.
3. To serve locally from this folder:

```bash
npm run serve
```

Then visit:

- `http://localhost:8080/banner/`
- `http://localhost:8080/email/`
