# SEO / performance report (measured 2026-10-10 on the static export)

## SEO behaviour
- Every page has localized `lang`, title and description. `canonical`, `hreflang` and the Open Graph URL/image are emitted only when `SITE_ORIGIN` is a verified HTTPS origin. Currently it is unset, so none are emitted.
- Until `release:check` passes: pages are `noindex, nofollow`, `robots.txt` is `Disallow: /`, and the sitemap is an empty urlset (`scripts/generate-seo.mjs`).
- The 404 is `noindex` in dev and in `out/404.html`. The sitemap never lists it, and the build-only helper route is removed from the export (checked by `check:export`).
- **Static routes:** 3 homepages + 15 legal pages + `404.html`. 562 root-relative internal links across 21 exported HTML files all resolve (`npm run check:export`).
- **Social image:** `public/assets/social-preview.webp` (1200×630, 45 KB), composed from the hero's final 3D frame.

## Measured payload (`out/`, 134 files, 5.4 MB total including all theme/scene images)
| Item | Size |
|---|---|
| `index.html` | 108 KB |
| Initial JS referenced by the homepage | 589 KB raw / **181 KB gzip** |
| Lazy 3D chunk (three + scene), loaded after hydration | 231 KB gzip |
| CSS | 15 KB gzip |
| `404.html` (no JS runtime) | 7 KB |
| All WebP images | 1.6 MB, lazy and theme-gated, so a visitor downloads only the active theme's images near the viewport |

## Runtime behaviour relevant to Core Web Vitals
- The hero H1/CTA are server HTML (LCP candidate is text, not WebGL).
- The 3D loop stops after about 4.8 s (no permanent GPU work).
- Scroll reveals are one-shot and there is no scroll-jacking.
- The fixed header and full-viewport hero cause no layout shift.

**Not measured:** Lighthouse/field LCP, INP and CLS, and throttled mobile CPU. No scores are claimed. Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

## Security headers / CSP
`infra/nginx/aureon-site.conf.example` and `infra/apache/.htaccess` send `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`, which the static export requires for Next's inline bootstrap and the theme pre-paint script. No third-party origins are allowed.

The previous nginx example (`script-src 'self'`) would have broken the site. The whole browser suite (66 tests across Chromium, Firefox and WebKit) passes against the export served with this CSP.
