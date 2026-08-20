/**
 * vCard 3.0 generation utilities.
 * All processing is local - no network calls.
 */

/** Phone types supported by vCard */
export const PHONE_TYPES = ['CELL', 'WORK', 'HOME'] as const;
export type PhoneType = (typeof PHONE_TYPES)[number];

/** Email types supported by vCard */
export const EMAIL_TYPES = ['WORK', 'HOME'] as const;
export type EmailType = (typeof EMAIL_TYPES)[number];

export interface PhoneEntry {
  id: string;
  number: string;
  type: PhoneType;
}

export interface EmailEntry {
  id: string;
  address: string;
  type: EmailType;
}

export interface SocialEntry {
  id: string;
  type: SocialType;
  url: string;
}

export interface VCardData {
  prefix: string;      // e.g., "Dr.", "Prof."
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  address: string;
  phones: PhoneEntry[];
  emails: EmailEntry[];
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
 * Ensure a URL has a protocol prefix (defaults to https://).
 * Existing URI schemes (mailto:, https:, …) are left alone so
 * `mailto:a@b.ch` never becomes `https://mailto:a@b.ch`.
 * `example.com:8080` is a host:port, not a scheme, and still gets https.
 */
export function ensureUrl(v: string): string {
  const s = (v || '').trim();
  if (!s) return '';
  if (/^(javascript|data|vbscript):/i.test(s)) return '';
  if (/^https?:\/\//i.test(s)) return s;
  const scheme = s.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    const rest = s.slice(scheme[0].length);
    if (rest === '' || !/^\d/.test(rest)) return s;
  }
  return `https://${s}`;
}

/** RFC 2426 line folding: 75 octets, continuation lines start with a space. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const chunks: string[] = [];
  let remaining = line;
  let limit = 75;
  while (remaining.length > 0) {
    let lo = 1;
    let hi = remaining.length;
    let fit = 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const trial = remaining.slice(0, mid);
      if (encoder.encode(trial).length <= limit) {
        fit = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    chunks.push(remaining.slice(0, fit));
    remaining = remaining.slice(fit);
    limit = 74;
  }
  return chunks.map((chunk, i) => (i === 0 ? chunk : ` ${chunk}`)).join('\r\n');
}

/**
 * Build a vCard 3.0 string from contact data.
 * vCard 3.0 is the most widely compatible format for QR scanners.
 */
export function buildVCard(data: VCardData): string {
  const prefix = sanitizeLine(data.prefix);
  const firstName = sanitizeLine(data.firstName);
  const lastName = sanitizeLine(data.lastName);
  const jobTitle = sanitizeLine(data.jobTitle);
  const company = sanitizeLine(data.company);
  const address = sanitizeLine(data.address);
  const website = sanitizeLine(ensureUrl(data.website));

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  // FN is required (RFC 2426). Fall back to org, phone, email, then a placeholder.
  const fnParts = [prefix, firstName, lastName].filter(Boolean);
  const firstPhone = data.phones.map((p) => sanitizeLine(p.number)).find(Boolean) ?? '';
  const firstEmail = data.emails.map((e) => sanitizeLine(e.address)).find(Boolean) ?? '';
  const fullName = fnParts.join(' ') || company || firstPhone || firstEmail || 'Contact';

  lines.push(`FN:${fullName}`);
  // N format: <lastName>;<firstName>;<middleName>;<prefix>;<suffix>
  lines.push(`N:${lastName};${firstName};;${prefix};`);

  if (jobTitle) lines.push(`TITLE:${jobTitle}`);
  if (company) lines.push(`ORG:${company}`);

  // Multiple phone numbers
  for (const phone of data.phones) {
    const num = sanitizeLine(phone.number);
    if (num) {
      lines.push(`TEL;TYPE=${phone.type}:${num}`);
    }
  }

  // Multiple email addresses
  for (const email of data.emails) {
    const addr = sanitizeLine(email.address);
    if (addr) {
      lines.push(`EMAIL;TYPE=INTERNET,${email.type}:${addr}`);
    }
  }

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

  return lines.map(foldLine).join('\r\n');
}
