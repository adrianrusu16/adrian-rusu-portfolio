# Canonical résumé

Last updated: 29 September 2026. Primary public email: `hello@adrianrusu.dev`.

The canonical public export is `public/adrian-rusu-resume.pdf`, served at `/adrian-rusu-resume.pdf`. Open, Download and footer links consume `identity.resume`; the `resume_pdf_click` event and consent behavior are unchanged.

## Source and export workflow

This update uses the owner's supplied `Adrian_Rusu_Android_AAOS_CV_2026_Final_Hello.pdf` unchanged. It supersedes the older filename referenced in the implementation plan. Its metadata identifies LibreOffice Writer 25.2.3.2 as the exporter. No PDF internals were edited, no content was recreated, and no pages were flattened.

The editable Word/Writer source was not found in the repository or the supplied files. Its location has been requested from the owner and is not yet verified. Do not describe this repository as having a reproducible authoring source until that document is supplied or its maintained location is confirmed. Keep private local paths out of committed documentation. This remains an open publication-gate item in the supplied plan.

For the next update, edit the owner's original Word/Writer document and export it once as a two-page text PDF with hyperlinks preserved. Validate the export, then copy those exact bytes to `public/adrian-rusu-resume.pdf`. The recruiter copy may be named `Adrian_Rusu_Android_AAOS_CV_2026.pdf`; make it a copy of the same export, never a separately edited document.

## Validated export

- SHA-256: `e33e124e13173610619bd996e1a92b9c22b61cff0250572a24dc2f9218e9d17b`; 95,207 bytes; two pages.
- Visible email and annotation: `hello@adrianrusu.dev` and `mailto:hello@adrianrusu.dev`. Previous email and convenience aliases are absent from extracted text, link targets and metadata.
- Portfolio, LinkedIn and GitHub link targets are retained. These are PDF annotation checks, not claims about external-service availability.
- Selectable text, headings, bullets and URLs remain; both pages render cleanly without clipped text or missing glyphs.
- Extracted content differs from the old website PDF only in the email address. Experience, projects, toolbox, systems learning, education, training and languages are unchanged. Rendered page 2 is pixel-identical; page 1 differs only within the email's header rectangle at the same rendering scale.
- Metadata retains the owner's name, Android/AAOS title and Writer exporter information; no private filesystem paths or internal comments were found. The supplied metadata was preserved instead of rewriting the PDF.

## Regression checks

The static résumé test pins the SHA-256 of this manually validated export and confirms the built file is identical. Before changing that fingerprint for any future export, repeat the two-page visual, extracted-text and annotation checks, including the absence of old or private contact addresses. Preserve the important sections and technical terms; do not add keywords merely to satisfy a check.

Browser coverage opens the PDF and downloads it, compares both with the canonical file, and retains the existing consent-aware `resume_pdf_click` tests. Run frozen installation, check, lint, formatting, build, static tests and browser tests before delivery. Verify exact merged main and save a new unpublished Site candidate; publication still requires owner approval.
