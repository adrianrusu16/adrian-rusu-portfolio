# Manual Cloudflare Web Analytics

Branch: `feat/cloudflare-web-analytics`  
Base main: `6546d1340a548fc1849d1f9fca50efcc52bfe233`

The existing Web Analytics entry for adrianrusu.dev was read through SEOMonster's Cloudflare client. Its manual snippet supplies the existing public site token; no token was generated and no second Web Analytics site was created. The API returns this domain under `ruleset.zone_name`, which SEOMonster 0.9.3's hostname filter does not currently inspect.

`CloudflareAnalytics.astro` supplies the standard deferred script from `https://static.cloudflareinsights.com/beacon.min.js`. The shared layout includes this component once, so every generated HTML page, including the existing 404 layout, gets exactly one beacon.

Cloudflare measurement is independent of `ar_analytics_consent`. The GA4 loader, consent handling and custom-event implementation are unchanged. Declining Google Analytics neither removes nor disables the Cloudflare beacon.

The existing account entry has automatic installation enabled, but [Cloudflare documents](https://developers.cloudflare.com/web-analytics/faq/) that automatic injection requires proxying. DNS remains DNS-only, proxying remains off, Crawler Hints stays unchanged/off by owner instruction, and destructive mode remains false. No account, DNS, cache, redirect, Web Analytics configuration or token settings were modified.

No Content Security Policy exists in this repository, so none was added. The manual script uses static.cloudflareinsights.com and sends its measurement requests to cloudflareinsights.com.

Privacy and analytics documentation now describe the manual beacon and its independence from optional Google Analytics. This describes the implemented behavior; successful dashboard receipt will be checked after approved publication.

## Verification

- Generated-output regression checks every HTML document for exactly one beacon, the exact standard script source, deferred loading and valid configuration without printing the token.
- Browser regression checks initial loading once, zero GA4 requests before consent, preservation of Cloudflare after No thanks, and one beacon again after navigating with a stored denial.
- Existing GA4 browser regressions intercept Cloudflare to prevent local test collection while exercising the original consent behavior.
- Required gates: `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test`, `pnpm test:browser`.
- After merge, build the exact main revision and save an unpublished Site version. Publication requires owner approval.
