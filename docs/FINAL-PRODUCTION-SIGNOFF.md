# Aureon public website: release status (2026-10-10)

| Area | Status | Evidence |
|---|---|---|
| Architecture | Next.js 16.4 App Router, React 19.3, strict TS, static export | `npm run build` (21 static pages + designed 404) |
| `npm ci && npm run dev` | **Verified** | Clean `npm ci`, then the dev server serves every route |
| Typecheck / audit / unit tests | **Pass** | `npm run typecheck`, `npm run lint`, `npm test` (18/18) |
| Build + export check | **Pass** | `npm run build`, `npm run check:export` (18 localized pages, 404 design, 562 internal links) |
| Browser tests | **Pass** | `npm run test:e2e` (22/22, Chromium, dev). Against the export with the production CSP: Chromium + Firefox + WebKit **66/66** |
| HTTP status | **Verified** | `/`, `/sq/`, `/it/`, legal pages: 200. `/sa/`, `/not-a-real-page/`, `/sq/nope/`, `/it/nope/`: 404 (dev and export) |
| Hero, sections, legal, 404, mobile nav | **Implemented** | See `BATCH-01…04` reviews and `evidence/` |
| Legal content | **Draft, not approved** | Placeholders remain by design; draft notice shown; pages `noindex` |
| Real client app URL | **Blocked** | No verified `APP_ENTRY_URL`, so no app CTA is rendered |
| Public SEO / domain | **Blocked** | No `SITE_ORIGIN`, so `noindex` + `Disallow: /` |
| `npm run release:check` | **Fails as intended** | Missing: SITE_ORIGIN, APP_ENTRY_URL, OWNER_LEGAL_NAME, OWNER_LEGAL_ADDRESS, OWNER_JURISDICTION, PRIVACY_CONTACT_EMAIL, LEGAL_APPROVER, LEGAL_APPROVAL_DATE, LEGAL_APPROVED=true, and counsel-approved legal text |
| Deployment | **Not performed** | No host or credentials; see `DEPLOYMENT-AND-ROLLBACK.md` |

**Verdict:** the site is complete for local development and review. It is **not approved for public release** until the operator supplies the facts above and the legal text is professionally approved.
