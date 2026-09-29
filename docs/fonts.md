# Self-hosted fonts

DM Sans and IBM Plex Mono are served from `/fonts/` through `src/styles/fonts.css`, imported by the existing global stylesheet. The shared layout no longer loads or preconnects to Google Fonts. There are no font preloads, new dependencies, inline font data or remote fallback URLs. Existing family names, sizes, weights, fallbacks and `font-synthesis: none` are preserved; both faces use `font-display: swap`.

## Assets and licensing

Files were obtained from the official [Google Fonts CSS API](https://developers.google.com/fonts/docs/css2) on 28 September 2026, requesting DM Sans 400–700 and IBM Plex Mono 400/500. Inspection of the WOFF2 metadata confirms the DM Sans file actually contains a continuous `wght` axis from 100 to 1000; the CSS declaration matches that axis. Intermediate 450, 550 and 650 weights remain available without synthesizing bold.

| Local file                                                 | Weight            |  Bytes | SHA-256                                                            |
| ---------------------------------------------------------- | ----------------- | -----: | ------------------------------------------------------------------ |
| `public/fonts/dm-sans/dm-sans-latin-wght.woff2`            | Variable 100–1000 | 36,932 | `9fea608a947e67020c33cad9a6fe3d60c54119dfb8cff87768a8117a15ed7543` |
| `public/fonts/ibm-plex-mono/ibm-plex-mono-latin-400.woff2` | 400               | 14,708 | `08949f728dc52d528e69b1667d15c89a5686a4ee9a296ff90983985f99c380f7` |

Original binary sources: [DM Sans](https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2), [IBM Plex Mono](https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2). The unmodified SIL Open Font License texts are included in `public/fonts/licenses/`, copied from the official Google Fonts [DM Sans](https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt) and [IBM Plex Mono](https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt) directories.

The existing pages request the Latin subsets. Their original Unicode ranges are retained so punctuation, accented Latin text and symbols keep their previous font/fallback behavior. An inventory of direct text nodes across all 11 routes, including hidden text, found DM Sans 400/500/550/600/650 and IBM Plex Mono 400. The unused IBM Plex Mono 500 and Latin Extended files are omitted. Add the appropriate licensed subset or weight when future content requires it.

## Privacy and analytics

The privacy page's entire “Other third-party resources” section was removed because the Google Fonts requests it described no longer exist. Optional Google Analytics still requires consent. The single global Cloudflare beacon remains independent of that choice. No analytics initialization, tracking, provider configuration or DNS settings change in this branch.

## Verification

Generated-output tests reject Google Fonts domains in every HTML/CSS file and verify WOFF2 signatures and bundled licenses. Browser coverage checks local HTTP 200 font responses, intermediate DM Sans weights and no Google Fonts or pre-consent Google Analytics requests. Existing browser tests cover GA4 acceptance, decline, withdrawal, event filtering and the independent single Cloudflare beacon.

Visual comparison covers the homepage at 1440×1000, 390×844 and 844×390, plus Projects, PandaWave, Privacy and Résumé. Font-family/weight and text-box measurements are compared with the previous revision; the obsolete privacy section is the intentional content difference.

## Performance comparison

The baseline is merged email revision `95d2bc7e66caf20a1ac3d0a8bc8105dd677c8936`, with remote fonts, served by Astro preview at `http://127.0.0.1:4173`. Production has older analytics/privacy content, so it would not isolate this change. Both variants use Lighthouse 13.5.0, Chrome 153, default mobile simulation and three cold navigation runs per route. Analytics endpoints are blocked in both variants to avoid production test traffic. Medians summarize the performance score, FCP, LCP, Speed Index, TBT and CLS.

Baseline collection spans 28–29 September after an interrupted session; the preview was restarted with the same build. Machine load and remote-font timing can affect comparisons. These are local lab observations, not production field data or a guaranteed speed improvement. No font preload is added without evidence that its extra priority is beneficial.

Three-run medians (milliseconds except score and CLS):

| Route                  | Version | Score |  FCP |  LCP | Speed Index | TBT |   CLS |
| ---------------------- | ------- | ----: | ---: | ---: | ----------: | --: | ----: |
| `/`                    | Before  |    87 | 2859 | 2934 |        4269 |   0 | 0.000 |
| `/`                    | After   |    99 | 1206 | 2104 |        1206 |   0 | 0.017 |
| `/projects/`           | Before  |    99 | 1626 | 1626 |        1626 |   0 | 0.023 |
| `/projects/`           | After   |   100 | 1210 | 1660 |        1210 |   0 | 0.023 |
| `/projects/pandawave/` | Before  |    88 | 1441 | 1625 |        1441 |   0 | 0.235 |
| `/projects/pandawave/` | After   |    88 | 1208 | 1742 |        1208 |   0 | 0.235 |
| `/privacy/`            | Before  |   100 | 1434 | 1434 |        1434 |   0 | 0.014 |
| `/privacy/`            | After   |   100 | 1206 | 1506 |        1206 |   0 | 0.014 |

The homepage improved in this sample. Other scores were effectively unchanged and some LCP medians increased slightly; this is not an across-the-board speed claim. PandaWave's pre-existing CLS of approximately 0.235 remains a separate performance concern. The reliable outcome is removing the external font stylesheet/dependency and serving two local WOFF2 files totaling 51,640 bytes. All seven visual comparisons preserve the measured dimensions, families and weights of corresponding headings, navigation and buttons. Browser checks recorded zero Google Fonts requests and both local faces loaded on every sampled page.

Three-run medians (milliseconds except score and CLS):

| Route                  | Version | Score |  FCP |  LCP | Speed Index | TBT |   CLS |
| ---------------------- | ------- | ----: | ---: | ---: | ----------: | --: | ----: |
| `/`                    | Before  |    87 | 2859 | 2934 |        4269 |   0 | 0.000 |
| `/`                    | After   |    99 | 1206 | 2104 |        1206 |   0 | 0.017 |
| `/projects/`           | Before  |    99 | 1626 | 1626 |        1626 |   0 | 0.023 |
| `/projects/`           | After   |   100 | 1210 | 1660 |        1210 |   0 | 0.023 |
| `/projects/pandawave/` | Before  |    88 | 1441 | 1625 |        1441 |   0 | 0.235 |
| `/projects/pandawave/` | After   |    88 | 1208 | 1742 |        1208 |   0 | 0.235 |
| `/privacy/`            | Before  |   100 | 1434 | 1434 |        1434 |   0 | 0.014 |
| `/privacy/`            | After   |   100 | 1206 | 1506 |        1206 |   0 | 0.014 |

The homepage improved in this sample. Other scores were effectively unchanged and some LCP medians increased slightly; this is not an across-the-board speed claim. PandaWave's pre-existing CLS of approximately 0.235 remains a separate performance concern. The reliable outcome is removing the external font stylesheet/dependency and serving two local WOFF2 files totaling 51,640 bytes. All seven visual comparisons preserve the measured dimensions, families and weights of corresponding headings, navigation and buttons. Browser checks recorded zero Google Fonts requests and both local faces loaded on every sampled page.
