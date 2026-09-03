# Sound Objects

A responsive, app-like archive for music plug-ins and browser instruments.

The current site includes dedicated pages for DriftField and bugnote 3,
downloadable macOS public test builds, a SEED series collection, and isolated
launch pages for imagescansound and orbitonic. The interface uses a white phone
silhouette on an acid-lime field and keeps visible copy intentionally compact.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm test
npm run lint
```

## Netlify

Connect the repository root to Netlify. The included `netlify.toml` runs the
build and validation suite, then publishes `dist/client` as a static site using
Node.js 22.13.0.

The downloadable plug-ins are clearly labelled test builds. Their pages include
compatibility notes and SHA-256 values for file verification.
