# Aureon source facts / claim register

**Verified October 9, 2026** against `gym-app-main(20261009-142521).zip`, internal root `gym-app-main/`. No `.git` metadata / commit SHA found in the ZIP. Source is a snapshot, not a guarantee of which features currently run on any particular hosted tenant. Marketing descriptions are deliberately careful.

| Claim used on site | Verified source | What may safely be said |
|---|---|---|
| Aureon brand and Gym Platform descriptor | `packages/tenant-config/src/brand.ts` | Brand fallback `Aureon`, descriptor `Gym Platform`. `.test` default brand domain/support email is **not** a production contact. |
| Chevron/A-shaped product glyph | `packages/ui/src/brand-mark.tsx`, `BrandChevron` | SVG with `M2.5 20.2 12 1.8l9.5 18.4`, stroke 1.6. Re-created as an independent vector graphic; not the old three-bar placeholder. |
| Warm gold/accent and deep olive neutrals | `packages/ui/src/tokens.css` | Light canvas `#f3f1eb`, primary `#b87912`, ink `#1f2623`, dark surface `#151c1a`. Site is art-directed around this genuine palette rather than copying a reference project. |
| Member view exists | `apps/mockups/app/client/page.tsx`, `apps/client-web/app/page.tsx` | Member app is one perspective; do not imply the public website is that member app. |
| Reception / member records / check-ins | `apps/gestionale/app/members/page.tsx`, `apps/gestionale/app/checkins/page.tsx` | Routes exist; exact production scope, role permissions and tenant enablement need verification. |
| Classes and appointments workflows | `apps/gestionale/app/classes/page.tsx`, `apps/gestionale/app/appointments/page.tsx`, `docs/claude/PRODUCT-CONTRACT.md` | Scheduling is product contract inventory. Avoid claiming provider integrations or universally deployed real-time features. |
| Team and club management | `apps/gestionale/app/shifts/page.tsx`, `apps/gestionale/app/instructors/page.tsx`, `apps/gestionale/app/reports/page.tsx` | Operations roles have distinct interfaces; no invented financial results or analytics. |
| Browser Radio product | `docs/claude/PRODUCT-CONTRACT.md`, `apps/radio-ops` | Library, playlists, schedules and announcements; no physical radio-engine hardware claim. |
| Public tenant Client Web is hostname-scoped | `apps/client-web/app/lib.ts`, `resolvePublicTenant()` | Requires verified tenant hostname. There is no source-verified generic `app.aureon.com` public entry URL in this snapshot. |
| Legal terms/privacy by gym tenant | `packages/db/src/member-privacy.ts`, `docs/LEGAL-PRIVACY-READINESS.md` | Gym-specific policies are separate from this marketing-site draft. No blanket compliance claim. |
| Internal console vs public marketing | `apps/platform-console` | Not publicly linked; no platform console login or API endpoints are exposed. |

**Not claimed:** installed physical hardware, live production deployment, paid gateway integrations, security certifications, client counts, uptime, GDPR compliance, testimonials, quantified efficiency, international customer adoption or AI-driven decisions. Product mockup visuals are labeled as *illustrative* and contain no member records.
