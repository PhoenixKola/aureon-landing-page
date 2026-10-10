import type { NextConfig } from 'next';

const building = process.env.npm_lifecycle_event === 'build' || process.argv.includes('build');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  // Multiple root layouts (one per locale route group) need a routing-level 404 for unmatched URLs.
  experimental: { globalNotFound: true },
  // `*.build.tsx` pages exist only in production builds (the static 404 document source).
  pageExtensions: building ? ['tsx', 'ts', 'build.tsx'] : ['tsx', 'ts'],
};
export default nextConfig;
