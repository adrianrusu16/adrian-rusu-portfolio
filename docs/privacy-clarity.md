# Privacy clarity

Branch: `fix/privacy-clarity`. Base: `97b4154b5361533eb21658f07a3f6e45a7f38ffe`.

The privacy page identifies Adrian Rusu as controller, distinguishes Cloudflare measurement from optional Google Analytics, and adds named recipients, retention information and conditional privacy rights. The generic contact and external-link explanations are removed. Remote DM Sans and IBM Plex Mono remain disclosed until the separate font-hosting change.

Google-only control and status labels avoid implying that declining Google Analytics disables all measurement. The consent storage, tag initialization, advertising denial, Google Signals setting, revocation, cookie clearing and Cloudflare beacon are unchanged.

## Verified information — 28 September 2026

- Existing authorized read-only Google Analytics Admin API request `properties.getDataRetentionSettings` returned HTTP 200: `eventDataRetention=TWO_MONTHS` and `resetUserDataOnNewActivity=true`. No account configuration was changed. [Google explains](https://support.google.com/analytics/answer/7667196?hl=en) that reset applies to user-level data and standard aggregated reports are outside this retention limit.
- [Cloudflare's FAQ](https://developers.cloudflare.com/web-analytics/faq/) documents seven days of unsampled data, subsequent sampling/aggregation, and access to reports covering the previous six months. A reporting window is not presented as a guarantee that every provider record is deleted at six months.
- Recipients named: Google for Google Analytics and Cloudflare for Web Analytics.
- Rights are conditional, following the [European Commission's overview](https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en). The complaint link points to the [Romanian supervisory authority](https://www.dataprotection.ro/?lang=ro&page=Plangeri_meniu). No Cloudflare Article 6 legal basis or universal compliance claim is inferred.

## Résumé event

`resume_pdf_click` replaces `resume_download`, retaining the existing trigger on every résumé PDF link. It covers open and download intent without claiming a completed download. Historical data keeps the old name; no dashboard settings are changed. The type, allowlist, handler and unit/browser assertions use the new event name. See [analytics documentation](analytics-consent.md).

## Validation and delivery

Required checks: frozen dependency installation, check, lint, format check, build, unit/generated-output tests and browser tests. Coverage includes PDF open/download/footer clicks, Google-only labels and controls on desktop/mobile, one Cloudflare beacon throughout consent changes, and the existing GA4 regressions.

After merge, save an unpublished version of the existing Site from exact main. Preserve the domain, audience, Cloudflare configuration and IndexNow. Publication needs separate approval.
