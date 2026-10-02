# Canonical résumé

Last validated: 2 October 2026. Primary public email: `hello@adrianrusu.dev`.

The canonical public export is `public/adrian-rusu-resume.pdf`, served at `/adrian-rusu-resume.pdf`. Open, Download and footer links consume `identity.resume`; the `resume_pdf_click` event and consent behavior are unchanged.

## Editable source and export workflow

The original Word/Writer source was not recovered. On 2 October 2026, the owner explicitly authorized creating a new editable source from the previously approved PDF for the client-name redaction. The new source is `Adrian_Rusu_Android_AAOS_CV_2026_Redacted.docx`, maintained in the owner's private résumé workspace. Its working copy is excluded from Git. It is a newly established source, not a recovered original.

The source retains the original Noto Serif family, blue/gray palette, section order and two-page structure. Only the five planned client-identifying passages were rewritten; other normalized extracted content is equivalent. Reconstruction and the change of exporter introduce differences in spacing and line wrapping. Both rendered pages were inspected for clipping, overlap and missing glyphs.

LibreOffice was unavailable on the implementation host. The new DOCX was exported with Microsoft Word 2016, with Noto Serif fonts embedded, selectable text and hyperlinks preserved. No PDF internals were patched and no pages were rasterized. Future edits should use this editable source and the following controlled workflow:

1. Open the private DOCX in Word with its embedded Noto Serif fonts available.
2. Apply the approved content changes and retain the two-page structure.
3. Export one validated PDF with document properties, hyperlinks and selectable text. Avoid bitmap text for missing fonts.
4. Inspect both rendered pages, extracted text, metadata and the four contact annotations. Check client anonymity locally; do not commit restricted terms in regression tests or fixtures.
5. Copy the validated export's exact bytes to `public/adrian-rusu-resume.pdf` and the recruiter attachment `Adrian_Rusu_Android_AAOS_CV_2026.pdf`. Never maintain independently edited PDFs.
6. Update the validated fingerprint only after these checks pass, then run the project checks and résumé browser regressions.

Keep private absolute filesystem paths out of committed documentation. The original source's absence is an accepted historical maintenance limitation, not a publication requirement. The authorized new DOCX provides the workflow for future updates.

## Validated export

- SHA-256: `490c95618f74bd9648a46531548a8b4ec945c18c50297ffd56bf3bb0beb6115f`; 408,642 bytes; two pages.
- Visible email and annotation: `hello@adrianrusu.dev` and `mailto:hello@adrianrusu.dev`. Previous email and convenience aliases are absent from extracted text and link targets.
- Portfolio, LinkedIn and GitHub annotation targets remain. These checks do not establish external-service availability.
- Client identity and acronym are absent from extracted text, metadata and annotations. The employer remains AscentCore; production AAOS media, automotive interaction, performance and delivery responsibilities remain intact.
- Selectable text, headings, bullets and URLs remain. No raster text or private filesystem metadata was found.
- Recruiter and website copies are byte-identical. Static tests also require the generated website asset to match.

## Release checklist

- [x] Canonical public artifact and stable URL retained.
- [x] Owner authorized the newly established private DOCX source workflow.
- [x] Two-page visual, text, link, metadata and client-name checks completed.
- [x] Recruiter copy matches the canonical PDF.
- [x] Owner chose corrections to current materials only; historical commits and PRs remain intact and can still expose older materials.
- [ ] Build, static/browser checks and CI pass for the redaction release.
- [ ] Exact merged main prepared and previewed in the existing Site before publication.
- [ ] Production homepage, Experience, Résumé and opened/downloaded PDF pass the post-publication smoke test.

Version 12 is the prior published release. Release the client-name redaction from a new candidate built from exact merged main.

## Regression checks

The résumé test pins the SHA-256 of this manually validated export and confirms the generated file is identical. Before changing the fingerprint for any future export, repeat the two-page visual, extracted-text and annotation checks. Preserve the technical sections; do not add keywords merely to satisfy a check.

Browser coverage opens and downloads the PDF, compares both with the canonical asset, and retains consent-aware `resume_pdf_click` tests. Run frozen installation, check, lint, formatting, build, static tests and browser tests before delivery.
