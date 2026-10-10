# Engineering and design decisions · October 9, 2026

## Verified source

Project brand and factual features were checked against `gym-app-main(20261009-142521).zip`; see `AUREON-SOURCE-FACTS.md`. The screenshot/ProGreen reference is NOT a UI template. The marketing site has no runtime coupling to the Aureon platform.

## Selected architecture

**Next.js 16.4 + React 19.3 + strict TypeScript.** These published npm versions were checked on October 9, 2026. App Router pages are statically exported into `out/`; three localized sites share components and source-verified copy. No database, runtime API, login, contact form or Keycloak dependency.

The package environment can reach official reference pages via search but cannot resolve `registry.npmjs.org` from its terminal (`EAI_AGAIN`). Therefore a fresh npm install, a real Next.js build, and browser E2E testing of the running app **were not performed here**; claiming otherwise would be misleading. An isolated TypeScript parser and test harness verified source syntax, routing/data and browser composition independently.

## Official references

- Next.js static export: https://nextjs.org/docs/app/guides/static-exports
- Next.js metadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js static params: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
- React: https://react.dev/reference/react
- WCAG reduced motion: https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html
- Google hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions

## Visual decision

One sans family, actual chevron mark and warm dark olive/brass tokens from Aureon. No grid-paper background and no decorative radial gradients. The first frame has **no complete gym image**. All assembling gym elements are independently authored SVG groups with distinct trajectories/entrance times. Website navigation is the last element to reveal. This is an honest vector interpretation, **not** final photoreal rendered 3D.

## Safety

No analytics/third-party scripts by default. Tenant-specific Client Web entry URL is configurable and strictly checked for valid HTTPS; no fabricated universal login. Legal texts are drafts until real company facts and professional approvals are supplied. Default metadata is noindex. Public release check must fail until blockers are handled.
