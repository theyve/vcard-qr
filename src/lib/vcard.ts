/**
 * vCard 3.0 generation utilities.
 * All processing is local - no network calls.
 */

export type PhoneType = 'WORK' | 'CELL';

export interface PhoneEntry {
  number: string;
  type: PhoneType;
}

export interface SocialEntry {
  type: SocialType;
  url: string;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  address: string;
  phones: PhoneEntry[];
  email: string;
  website: string;
  socials: SocialEntry[];
}

/** Supported social profile types for X-SOCIALPROFILE field */
export const SOCIAL_TYPES = [
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'github',
  'youtube',
  'tiktok',
  'mastodon',
  'other',
] as const;

export type SocialType = (typeof SOCIAL_TYPES)[number];

/**
 * Escape per vCard text rules: backslash, semicolon, comma, newline
 */
export function sanitizeLine(v: string): string {
  return (v || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .trim();
}

/**
 * Ensure a URL has a protocol prefix (defaults to https://)
 */
export function ensureUrl(v: string): string {
  const s = (v || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/**
 * Build a vCard 3.0 string from contact data.
 * vCard 3.0 is the most widely compatible format for QR scanners.
 */
export function buildVCard(data: VCardData): string {
  const firstName = sanitizeLine(data.firstName);
  const lastName = sanitizeLine(data.lastName);
  const jobTitle = sanitizeLine(data.jobTitle);
  const company = sanitizeLine(data.company);
  const address = sanitizeLine(data.address);
  const email = sanitizeLine(data.email);
  const website = sanitizeLine(ensureUrl(data.website));

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName) {
    lines.push(`FN:${fullName}`);
    lines.push(`N:${lastName};${firstName};;;`);
  }

  if (jobTitle) lines.push(`TITLE:${jobTitle}`);
  if (company) lines.push(`ORG:${company}`);

  // Multiple phone numbers
  for (const phone of data.phones) {
    const num = sanitizeLine(phone.number);
    if (num) {
      lines.push(`TEL;TYPE=${phone.type}:${num}`);
    }
  }

  if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);

  if (address) {
    // Put everything into the street field to avoid over-complication.
    lines.push(`ADR;TYPE=WORK:;;${address};;;;`);
  }

  if (website) lines.push(`URL:${website}`);

  // Social profiles
  for (const social of data.socials) {
    const url = sanitizeLine(ensureUrl(social.url));
    if (url) {
      lines.push(`X-SOCIALPROFILE;type=${social.type}:${url}`);
    }
  }

  lines.push('END:VCARD');

  // QR expects CRLF per spec, but most readers accept LF. Use CRLF for best compatibility.
  return lines.join('\r\n');
}
