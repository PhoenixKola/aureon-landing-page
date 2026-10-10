# Security, privacy, assets

- **Frontend:** dependency-free static HTML/CSS/JS. No backend, form submission, auth, cookies, trackers, embeds, analytics, external font loading or runtime database/API calls.
- **Local preferences:** `aureon-theme` in localStorage; `aureon-intro-seen` in sessionStorage, both device-only and non-identifying. Page language is URL-based.
- **Product data:** only source-verified route/function descriptions. Example interface uses descriptive labels and no personal records, QR, medical details, access codes or staff credentials.
- **Config:** `.env` is ignored. Site config is build-time public data. HTTPS URL validation disallows localhost/test/example-like destinations, URL queries, password-bearing URLs and non-HTTPS. No generic Keycloak redirect is used.
- **Legal:** drafts clearly labeled / preview noindex. No false legal name, consent banner or GDPR certification claim.
- **Headers:** Apache/Nginx examples set basic CSP, frame, referrer and MIME protections; hosts must configure/test them. HSTS only after production TLS is verified.
- **Dependencies:** none; pinned lockfile contains only project. GitHub Action runs `npm ci`, syntax, build and tests without production secrets.
- **Media:** see `docs/ASSET-LICENSES.md`; all distributed media are local and generated or derived from Aureon's verified chevron mark.
