# SEO audit — 27 September 2026

Audited `https://adrianrusu.dev` with [SEO Monster](https://github.com/avansaber/seo-monster), PyPI version **0.9.3**, in an isolated temporary Python environment. The website does not depend on this package. Only credential-free, read-only tools were used; no analytics, DNS settings or search-engine submissions were changed.

## Production baseline

| Check                                    | Observed result                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `inspect_meta` on all nine sitemap pages | HTTP 200, unique titles and descriptions, one H1 each, canonical and social metadata present |
| `check_canonical` on all nine pages      | Self-referential HTTPS URLs; every canonical target returned 200; no findings                |
| `mixed_content_check` on all nine pages  | No violations                                                                                |
| `inspect_schema` on all nine pages       | Only `Person` present; no JSON parse errors                                                  |
| `robots_txt_validate`                    | Crawling allowed, correct sitemap, no stale edge-cache finding                               |
| `sitemap_validate` and `sitemap_health`  | Nine same-host URLs, all HTTP 200; optional `lastmod` absent                                 |
| `redirect_chain_audit`                   | HTTP → HTTPS in one 302 hop; `/projects` → `/projects/` in one 307 hop                       |
| `https://www.adrianrusu.dev/`            | DNS lookup failed from the audit host                                                        |
| Mobile `psi_analyze`                     | HTTP 429 on Google's shared anonymous quota; no score obtained                               |

The raw baseline is saved locally in `.sites-runtime/seo/before.json` (ignored by Git). This is a crawlability baseline, not evidence of Google indexing or ranking.

## Changes

- Added linked `Person`, `WebSite` and page entities with stable IDs. The about page uses `ProfilePage`; the projects index uses `CollectionPage` and a collection-derived `ItemList`.
- Added `TechArticle`, `SoftwareSourceCode` and `BreadcrumbList` entities to project case studies. The author links to the same person; repository links are emitted only for projects marked public.
- Added a typed `seoDescription` field to each project's Markdown metadata, keeping card summaries separate from search snippets. The previous PandaWave description was 73 characters and Canopy's was 203; the new descriptions explain each project directly. There is no guaranteed search-result character limit or promise that Google will use the supplied snippet.
- Made secondary page titles more descriptive and completed social-image alternative text.
- Made the 404 page explicitly `noindex, follow`, with no canonical or identity graph.
- Corrected the README's reference to a nonexistent `llms.txt` file. No `llms.txt` ranking benefit is assumed.
- Added generated-HTML regression checks for entity links, project source/breadcrumb data, 404 handling and exact sitemap coverage.
- Restored the hosting manifest from the existing public Site, preserving its project ID and static output directory.

No employment claims, project implementation status, benchmark results, public URLs or content dates were invented. The site remains static Astro with TypeScript and the existing client interactions.

## Validation

`pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build` and `pnpm test` passed; all eight generated-page tests passed. Before implementation, the three new regression tests failed on the missing graph, project schema and 404 directives while the five existing tests passed.

SEO Monster inspected the updated production build through a temporary local HTTP preview. All JSON-LD parsed successfully, all four breadcrumb entities passed its required/recommended-field checks, and the 404 had `noindex, follow` with no schema. The tool reports the other schema types as `unknown_type` because its rich-result validator does not cover them; they are not claimed as tool-validated rich results. Generated-page tests verify their IDs and relationships. Local results are retained in `.sites-runtime/seo/after-build.json`.

## Follow-up after publication

1. Verify ownership of the `adrianrusu.dev` domain property in Google Search Console and submit `https://adrianrusu.dev/sitemap.xml`. Inspect the homepage and the four project URLs. Search Console access was not configured for this audit, so indexing and search performance remain unverified.
2. Configure the `www` hostname and a permanent redirect to the apex through the existing domain/hosting controls if that alias is wanted. Review whether the host supports permanent HTTPS and trailing-slash redirects. These are hosting changes; the current redirects still reach the correct canonical URLs.
3. Use a personal PageSpeed API key with SEO Monster to avoid shared quota exhaustion. Assess performance from real lab and field results when available; this audit makes no Core Web Vitals claim.
4. Collect Search Console impressions, clicks and queries before choosing further content changes. A site launched yesterday has insufficient history for meaningful before/after ranking attribution.

Keep sitemap `lastmod` omitted until meaningful page-update dates can be maintained. Google's guidance permits omission; build timestamps would falsely imply every page changed on each deployment. Structured data helps describe the existing content but does not guarantee a rich result or ranking improvement.

References: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [breadcrumb markup](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [profile page markup](https://developers.google.com/search/docs/appearance/structured-data/profile-page).
