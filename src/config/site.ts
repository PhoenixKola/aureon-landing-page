/** All settings are build-time public configuration. Do not place secrets here. */
export function verifiedHttpsUrl(input?: string): string | null {
  if (!input?.trim()) return null;
  try {
    const url = new URL(input.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
    if (/^(localhost|127\.|192\.168\.|10\.|.*\.(test|invalid|local))/.test(url.hostname) ||
        /^example\.(com|org|net)$/.test(url.hostname) || /(^|\.)example\.(com|org|net)$/.test(url.hostname)) return null;
    return url.href.replace(/\/$/, '');
  } catch { return null; }
}
function verifiedEmail(input?: string): string | null {
  const value = input?.trim();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/\.(test|invalid|example)$/i.test(value) ? value : null;
}
export const site = {
  origin: verifiedHttpsUrl(process.env.SITE_ORIGIN),
  appEntryUrl: verifiedHttpsUrl(process.env.APP_ENTRY_URL),
  businessUrl: verifiedHttpsUrl(process.env.CLIENT_BUSINESS_WEBSITE_URL),
  contactEmail: verifiedEmail(process.env.PUBLIC_CONTACT_EMAIL),
  operator: {
    name: process.env.OWNER_LEGAL_NAME?.trim() || null,
    address: process.env.OWNER_LEGAL_ADDRESS?.trim() || null,
    jurisdiction: process.env.OWNER_JURISDICTION?.trim() || null,
    registrationNumber: process.env.OWNER_REGISTRATION_NUMBER?.trim() || null,
    taxId: process.env.OWNER_TAX_ID?.trim() || null,
    privacyEmail: verifiedEmail(process.env.PRIVACY_CONTACT_EMAIL),
  },
  legal: {
    approved: process.env.LEGAL_APPROVED === 'true',
    approver: process.env.LEGAL_APPROVER?.trim() || null,
    approvedAt: process.env.LEGAL_APPROVAL_DATE?.trim() || null,
  }
} as const;
