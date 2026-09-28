# Analytics consent implementation

Branch: `feat/analytics-consent`  
Base main: `b32e2d31a95d5806ec425a39a6176e72215abe98`

## Behavior

- Direct GA4 tag, measurement ID `G-5JZG6LZFFN`; no Google Tag Manager container.
- Basic consent: no tag load or collection before grant or after a stored denial. Preference is browser-local `ar_analytics_consent`.
- Consent starts denied and grants only analytics storage before configuration. Advertising storage, advertising user data, personalization and Google Signals stay disabled.
- One initialization per document, including repeated clicks on Allow. Each static page navigation initializes its own document only when the stored choice is granted.
- Revocation disables GA immediately, clears the pending queue and accessible first-party GA cookies, and reloads without the tag. No denial ping is sent. Other tabs observe storage changes and withdraw too.
- Storage failures leave analytics off and show a visible message. A failed preference write cannot guarantee persistence across a later visit; the UI says so.
- Consent is a non-modal region. Allow and No thanks use equal styling; settings returns focus after a choice. A fixed, scrollable panel avoids content reflow and fits portrait/landscape.
- Four events: `contact_email_click`, `resume_download`, `linkedin_click`, `project_source_click`. Only public page paths and project slugs enter custom parameters. Destination queries, fragments, link text and email addresses are excluded.
- Project repositories/slugs come from the existing typed Markdown collection, not a second hard-coded project inventory.
- `/privacy/` is indexable and joins the sitemap (ten canonical URLs). Existing canonical/schema metadata is preserved.
- Cloudflare Web Analytics uses one global manual beacon with the existing domain site configuration. It is independent of the GA4 consent preference; declining Google Analytics leaves Cloudflare enabled. DNS-only mode is retained. No Cloudflare site, token, account setting or proxy configuration was created or changed. See [Cloudflare implementation](cloudflare-analytics.md).
- Current Google Fonts requests are disclosed independently of optional analytics; update that section when the separate font phase removes them.

## Validation

Required repository checks: `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`.

Browser regressions: `pnpm test:browser` after building. Install Playwright Chromium first; local QA can use `PLAYWRIGHT_CHROMIUM_EXECUTABLE` with an existing browser executable. CI installs Chromium and runs the suite.

Browser tests intercept the Google script and collection endpoints to avoid polluting the production property. They verify the request boundary, queued configuration/events, persistence, withdrawal, cross-tab behavior, mobile controls and storage failures. They do not claim successful delivery to GA4. Realtime/DebugView and production reject/allow checks must follow separately approved publication.

Enhanced Measurement and key-event account settings were not changed. Provider standard `click` / `file_download` events differ from the explicit portfolio intent events; do not count their sum as unique actions. The requested recommended key events remain an owner configuration task: email, résumé and LinkedIn.

## Supporting documentation

Implementation follows Google's [basic consent model](https://developers.google.com/tag-platform/security/concepts/consent-mode), [consent setup](https://developers.google.com/tag-platform/security/guides/consent), [privacy controls](https://developers.google.com/tag-platform/security/guides/privacy) and [GA4 configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).

## Prior production gate

Approved Sites version 7 published on 2026-09-28 at 05:25:25 UTC from canonical main above. Production IndexNow ownership passed HTTP 200, exact bytes, plain text and no redirect. One initial submission of nine live sitemap URLs received HTTP 202 at 05:28:58 UTC. This indicates receipt/pending engine verification, not guaranteed indexing. No further full-site submission should be repeated.

GSC sitemap remains registered with zero errors/warnings. Homepage, About, Experience and PandaWave are indexed; Projects was reported unknown at the follow-up. No Google Indexing API or indexing requests were used.

## Deployment gate

This branch must be reviewed/merged and an exact-main Site preview prepared before its separately approved publication. The approval for version 7 does not authorize publishing analytics. Font and case-study work remains separate and follows production analytics validation.

## Review and local provider check

The independent review found a failed repeat Allow write could leave already loaded tracking active while the UI reported it off. This is treated as a required correction because it violates the fail-closed storage behavior. A regression reproduced it; the failure now disables GA without reloading into an old stored grant.

The real Google tag was additionally loaded in a local browser with GA collection intercepted. It initialized once, emitted a page view and intent/standard event requests, and used the canonical page URL without the test query or fragment. No test collection traffic was sent to the production property. This does not establish Realtime/DebugView receipt or dashboard configuration.

Review limitations: real production provider behavior and Cloudflare account state remain post-publication checks. Pending-script withdrawal is covered separately with a delayed response. No other review findings were deferred.

Cloudflare setup reference: [automatic injection and DNS-only domains](https://developers.cloudflare.com/web-analytics/faq/). The permission issue is resolved. The manual beacon is implemented; dashboard receipt must be checked after approved publication.
