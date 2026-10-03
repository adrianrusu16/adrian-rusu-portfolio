# Engineering Notes

Notes live in the typed Astro `notes` collection. The index, static routes and sitemap share `getPublishedNotes()`, which excludes entries marked `draft: true`. Dates are maintained content metadata, not inferred Git modification times. Add `updated` only for a meaningful content change; it appears visibly and in the article schema.

Each note has a unique topic-first SEO title, description, tags and social image. `relatedProjects` contains IDs from the project collection; an unknown ID fails the build. Use public code, a reproducible experiment or a clearly labeled illustrative example. Do not describe an experiment as measured unless its evidence is available.

The first three notes cite PandaWave commit `bdf71eb9e570e98b3354a0c67a89c499e675d9b0`. These links document the inspected implementation. Portfolio checks do not run PandaWave's Android tests or establish vehicle-hardware behavior.

Generate cards after adding or renaming a note:

```bash
node scripts/generate-note-social.mjs
```

The reusable SVG template in `scripts/note-card-template.mjs` renders a 1200 × 630 PNG per note. The generator expects plain single-line `title` and `socialImage` fields and fails if the title exceeds four lines. Inspect generated cards before committing. Cards use the existing portfolio colors and text; the portrait is unchanged.

Run the repository checks and browser suite after content or route changes. Verify generated HTML, canonical URL, visible author/date, schema, source links, sitemap and related-project links before release. Keep commercial-client details out of prose, metadata, examples and social cards.
