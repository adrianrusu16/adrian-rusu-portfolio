# Content evidence and asset provenance

Reviewed 25 September 2026. Visitor links use the upstream default branch; these revisions identify the reviewed source snapshots.

| Project     | Public source                               | Reviewed revision                          |
| ----------- | ------------------------------------------- | ------------------------------------------ |
| PandaWave   | https://github.com/adrianrusu16/PandaWave   | `9558e60e4d83344e52d8487c13aa24955fa24348` |
| Canopy      | https://github.com/adrianrusu16/Canopy      | `596c09e4345ec6a15bbe58f33bd8b381dd8db214` |
| C++ Mastery | https://github.com/adrianrusu16/cpp-mastery | `60e7b5813c83107dd478b35d5244ebef9ffdb728` |

## Claim mapping

| Site content                                                | Evidence in the corresponding repository                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| PandaWave ownership, native snapshots, service/JNI boundary | `docs/native-engine-host.md`, `docs/architecture-roadmap.md`                                |
| AAOS media and native Android integration                   | `docs/android-platform-integration.md`                                                      |
| 216 overlayable resources and the two-resource canary       | `docs/rro-guide/RRO_GUIDE.md`, linked resource catalog and capture evidence                 |
| Recovery, native packaging and MediaBrowser tests           | `docs/testing.md`                                                                           |
| Secure sessions, observability and backend integration      | `docs/secure-storage.md`, `docs/observability.md`, `docs/canopy-backend-integration.md`     |
| Performance investigation infrastructure                    | `docs/build-performance.md`, `docs/ci-performance.md`; no measured results claimed          |
| Canopy services, ports, policy and reserved infrastructure  | `docs/architecture.md`, `docs/roadmap.md`                                                   |
| Canopy capabilities and Nginx reauthorization               | `docs/playback.md`                                                                          |
| Canopy identity and fail-closed sessions                    | `docs/authentication.md`, `docs/playback.md`                                                |
| C++ excerpts and diagrams                                   | `cpp/lifetime/main.cpp`, `cpp/containers/vector/Vector.h`, `cpp/containers/vector/main.cpp` |
| C/C++ generic-programming and tooling                       | Individually linked lab sources, `CMakeLists.txt`                                           |
| Public canopy-api contract repository                       | `https://github.com/adrianrusu16/canopy-api` plus its public compatibility/consumer docs    |
| Dates, Endava and résumé                                    | Supplied `Adrian_Rusu_Android_AAOS_CV_Human_First.pdf`                                      |

## PandaWave screenshot sources

All paths are inside PandaWave. Assets are WebP exports at 1408px and 700px widths; `src/data/screenshots.json` holds intrinsic dimensions.

| Asset                | Upstream path                                                                 |
| -------------------- | ----------------------------------------------------------------------------- |
| Home                 | `docs/images/home/home_recommendations_overview.png`                          |
| Now Playing          | `docs/images/readme/now-playing.png`                                          |
| Search               | `docs/images/search/search_query_and_media_results.png`                       |
| Library              | `docs/images/library/library_history_media_rows.png`                          |
| Profile              | `docs/images/profile/profile_account_details_and_preferences.png`             |
| AAOS launcher        | `docs/images/branding/aaos_launcher_pandawave_media_card.png`                 |
| Driving restrictions | `docs/images/restrictions/home_under_aaos_driving_restrictions.png`           |
| Focus                | `docs/images/accessibility/keyboard_focus_and_disabled_playback_controls.png` |
| RRO baseline         | `docs/images/validation/home_baseline_green_primary_standard_rail.png`        |
| RRO overlay          | `docs/images/validation/home_cyan_primary_wide_rail_overlay.png`              |

The RRO comparison uses matched captures. Progress differs; only primary color and rail geometry are overlay evidence. The canary validates two resources, not all 216 or an OEM release image.

## Other visuals

- Portrait: supplied WhatsApp photograph, edited once to remove foreground fabric and replace the backdrop with charcoal/navy. Facial features, expression, hair, clothing and natural skin preserved visually. WebP sizes: 160, 480 and 800px.
- Cockpit: existing generated mood image, preserved as atmosphere rather than project evidence.
- Diagrams: custom SVG from `scripts/generate-diagrams.py`; illustrative relationships and memory layout, not measured results.
- Sharing cards: created from primary project screenshots/diagrams by `scripts/generate-social.mjs`; metadata lives with each project record.
- Résumé: actual two-page CV with unresolved email/phone placeholders removed. No invented contact information added.

## Review procedure

Read the MDX collection, verify claims against these sources, inspect image mappings, and run README validation commands. Keep implemented work separate from labeled next steps. Preserve repository/source boundaries and commercial confidentiality.
