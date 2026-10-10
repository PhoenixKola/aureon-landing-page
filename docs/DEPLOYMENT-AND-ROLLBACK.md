# Hosting and rollback — not yet deployed

The website is a **static** independent project, not a runtime service and not a subfolder within the gym platform. Target should be a dedicated hostname with its own document root. No production host/domain or credentials were provided; actual deployment remains unperformed.

## Local and production prep

1. Add real verified values to `.env`; restart the local dev server after changes. For the marketing origin enter its *actual HTTPS hostname*; for the app enter a *verified public Client Web tenant hostname*, not Keycloak or Platform Console. Have legal operator/counsel finalize and approve EN/SQ/IT content and details. Run `npm run release:check` and resolve every error.
2. Run `npm ci && npm run build && npm run lint && npm test`. Browser-review homepage and legal pages, test app link redirects, 320px, 390px, 768px, desktop, dark, light, all three locales, reduced motion, keyboard and direct route reloads.
3. Inspect the generated `out/`. Export contains only HTML, assets, CSS, JS, robots, sitemap (if origin configured), 404, and build manifest. Copy `infra/apache/.htaccess` alongside `out/` content **only for verified Apache hosting**. This `.htaccess` is **not** automatically included in `out/`; configure server headers consciously.
4. In Hetzner web hosting, create a dedicated subdomain / vhost with a dedicated document root (for example `public_html/aureon-public/`) and enabled Let's Encrypt. Never point deployment or deletion at `public_html/` if other applications or subdomains share it. For dedicated Apache, upload content of `out/` directly to that root using WinSCP/SFTP. For a dedicated Cloud VM, provision a TLS reverse server to the static root using `infra/nginx/aureon-site.conf.example` as a starting point, then validate config syntax via `nginx -t`.
5. Set security headers at webserver layer and HTTPS after TLS validation; never assume Next/Node dev server headers are production policy. Use the CSP from the provided configs: the static export needs `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` (Next inline bootstrap + theme pre-paint script) and no third-party origins. `PORT=4310 PREVIEW_CSP=1 npm run preview` reproduces it locally. HSTS is optional only after verified HTTPS across subdomains.
6. Verify production `curl -I` for `/`, `/sq/`, `/it/privacy/`, `/unknown/` and all file assets. Unknown URLs must return **HTTP 404**, not only a visual “not found” panel. `out/404.html` is the designed page and localizes itself from the `/sq/` and `/it/` prefixes, so one `ErrorDocument 404 /404.html` (Apache) or `error_page 404 /404.html` (nginx) rule covers all languages. Check HTTPS, redirects, canonicals, hreflang, sitemap, robots and the final app destination in a separate unauthenticated browser.

## Safe rollback

Before upload, copy the previous **site-only** release to a dated backup folder outside the live site. Prepare next release as a sibling named `release-<timestamp>`, compare manifests/files and switch only the dedicated Aureon site root/symlink when applicable. On shared Hetzner hosting, upload to a safe temporary directory within Aureon's own root and rename with careful backup. To roll back, restore that known previous site release, not any parent folder. Avoid any `rsync --delete` or automated recursive deletion against `public_html/`, webspace root, or other Aureon applications. No automated deployment or destructive script is included, intentionally, without a verified target.

## Troubleshooting

If links like `/it/terms/` fail on refresh, ensure the static host serves `index.html` for directory paths and that `trailing slash` URLs are supported. If Open App is missing, supply a verified `APP_ENTRY_URL` and rebuild. If site previews have `Disallow: /`, that is intentional until legal/domain/app checks pass. No contact form backend exists by design. CI only builds/tests; deployment must be separately authorized and gated.
