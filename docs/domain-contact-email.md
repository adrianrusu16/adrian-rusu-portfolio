# Domain contact email

The primary public address is `hello@adrianrusu.dev`, defined once in `src/data/identity.ts`. Contact links, privacy contacts, Person schema and the consent-aware email-click classifier consume that value. The `contact_email_click` event name and consent behavior are unchanged.

The owner manages inbound routing separately. Convenience aliases are not displayed on the website. No DNS, Email Routing, MX, SPF, DKIM, DMARC, proxy or account settings are changed by this implementation.

## Merge gate

Before merging, the owner must confirm that all three planned routes are active and real external messages to each reach the intended inbox. A working mailto link or passing browser test cannot establish forwarding delivery. Publication also requires approval of the final release candidate after the font PR.

## Résumé follow-up

The current two-page PDF retains its previous Gmail contact address in visible text and a mailto annotation. No editable PDF source or established PDF-generation workflow was found in this repository. The PDF is unchanged; its still-valid address remains a temporary alternate contact. Replace it through the original résumé authoring workflow in a separate update.

## Verification

Generated HTML must contain the domain contact link and exclude the forwarding destination and inbound aliases. Browser coverage verifies the domain email triggers `contact_email_click` only after consent and unrelated mailto addresses do not. Binary PDF content is intentionally outside the HTML assertion.
