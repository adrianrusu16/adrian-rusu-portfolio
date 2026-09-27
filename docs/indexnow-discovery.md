# IndexNow discovery preparation

Branch: `chore/indexnow-discovery`  
Base main: `482a51f06683c471ae638d64ecd22fcbd13d772a`

This branch adds the existing configured IndexNow public verification file and a generated-output regression test. It uses the user-owned local SEOMonster configuration without copying that configuration, API credentials or OAuth tokens into this repository. The public verification token appears only in its required verification filename and contents, never in this document or application logic.

## Hosting decision

Use manual IndexNow. The two apex A records were checked through SEOMonster and have `proxied: false` (DNS-only). Crawler Hints is to remain off, as specified by the site owner; no Cloudflare settings were changed. Do not enable proxying or modify Sites custom-domain records to obtain automated IndexNow.

No submission is made before the verification file is published and its production response is checked. No Google Indexing API call is used for portfolio pages.

## Read-only baseline

SEOMonster 0.9.3 loaded the existing local configuration. Google OAuth and IndexNow are configured; Search Console, GA4, PageSpeed and the Cloudflare zone API were reachable. The default Search Console property is `sc-domain:adrianrusu.dev`, the Cloudflare zone is `adrianrusu.dev`, and destructive mode is false.

- Search Console lists the sitemap with nine submitted URLs, no errors or warnings, and no pending processing flag. Its sitemap aggregate still reports zero indexed URLs; this lags the separate URL Inspection results below and is not evidence that all pages are unindexed.
- URL Inspection reports the homepage, About, Experience and PandaWave as submitted and indexed, with matching user/Google canonicals. Projects is discovered and currently not indexed. No indexing request was sent.
- All nine production sitemap URLs returned HTTP 200. Robots permits crawling and declares the correct sitemap. The homepage canonical is self-referential and reachable.
- Mobile PageSpeed: performance 93, accessibility 100, best practices 100, SEO 100; FCP 2.6 s, LCP 2.6 s, Speed Index 2.9 s, TBT 0 ms, CLS 0.005. This is one run, not a median or a font-optimization comparison. No field data was returned.
- GA4 responded successfully with no rows for the seven-day traffic-by-channel query. No GA4 account settings were changed.
- Cloudflare Web Analytics failed independently with `AUTH_INVALID`: “Cloudflare rejected the credentials (HTTP 403).” The zone API remained usable. Web Analytics mode, collection count and incoming traffic are not verified; no beacon or credential changes were made.

Only non-secret results are retained in ignored local audit output. The local configuration and OAuth token files remain outside the repository.

## Validation contract

`tests/indexnow.test.mjs` checks that exactly one verification file is present, its ASCII bytes exactly match its filename stem with no BOM/newline, the production build preserves those bytes, and the file is absent from the sitemap. Assertions do not print the token, including on failure.

Before creating the file, that regression failed because the file was missing. A before/after build comparison must confirm that every prior HTML page and asset, including robots, sitemap and structured data output, is byte-for-byte unchanged, with exactly one additional root verification file.

Required gates: `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`. The verification file is a public ownership proof, not a runtime secret or application dependency.

## Approval and production steps

1. Review and approve this PR independently from the PandaWave link, analytics, font and case-study changes.
2. After approval and merge, fetch the exact GitHub `main` revision and build it. Preserve the existing Sites project, public audience, domain and DNS configuration.
3. Review an unpublished preview before approving publication. Do not use a Sites deployment URL as a private preview: Sites deployment operations publish production versions.
4. After approved publication, fetch the IndexNow verification URL using the configured key in memory. Confirm HTTP 200, a harmless plain-text content type, no error-page redirect and an exact byte match without logging its URL/body.
5. Read the current production sitemap and submit that exact canonical URL set once through SEOMonster `indexnow_bulk_submit`. Record only count, timestamp and result status. If the sitemap changes before publication, do not assume it still contains nine URLs.
6. Subsequently submit only new, materially changed or removed URLs. Keep Google discovery on Search Console, sitemap and ordinary crawling.

The next analytics/privacy phase remains separate. Previously started analytics, font and case-study worktrees are preserved; they are not included in this PR or deployed.
