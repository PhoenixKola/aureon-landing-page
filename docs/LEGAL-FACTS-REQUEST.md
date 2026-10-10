# Required factual inputs before public release

This site currently has **no verified legal operator or real tenant entry link**. Please supply factual values and professional signoff; none should be guessed.

1. Exact registered website operating entity, legal form and registered address (`OWNER_LEGAL_NAME`, `OWNER_LEGAL_ADDRESS`).
2. Jurisdiction, trade registry/number, and tax/VAT fields where applicable (`OWNER_JURISDICTION`, `OWNER_REGISTRATION_NUMBER`, `OWNER_TAX_ID`).
3. Public domain for Aureon (`SITE_ORIGIN`) and verified production tenant-specific **Client Web entry URL** (`APP_ENTRY_URL`). Check destination and redirects in an unauthenticated session.
4. Real public email if wanted (`PUBLIC_CONTACT_EMAIL`) and rights/privacy request channel (`PRIVACY_CONTACT_EMAIL`).
5. Hosting provider, location, webserver log retention, actual subprocessors, technical security logs, applicable purposes/bases, transfers, rights handling, and correct complaints authority. These are **not** present in the ZIP.
6. Confirm whether corporate public website, platform supplier and gym tenant are same or different legal organizations; identify relevant controllers/processors **through counsel**, not code assumptions.
7. In `src/content.mjs`, replace/approve EVERY bracketed legal draft placeholder, plus professionally review all five full documents in each of EN/SQ/IT. Confirm terms scope and enforceability.
8. Have an authorized legal reviewer approve versions and dates in each language, then set `LEGAL_APPROVED=true`, `LEGAL_APPROVER`, `LEGAL_APPROVAL_DATE`. These config flags should reflect a real approval, not act as approval themselves.
9. Review production host logs, storage, site security headers, external app URL, possible future analytics/consent before launch. Explicitly approve branded AI-generated imagery and marketing claims.

**This is not legal advice.** A green build validates code, not legal/regulatory compliance.
