/**
 * vCard 3.0 generation utilities (RFC 2426).
 * CHARSET=UTF-8 on text fields — required for Apple Contacts QR import
 * (vCard 4.0 umlauts are still misread there as MacRoman, e.g. Zürich → Z√ºrich).
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

export interface UrlEntry {
  id: string;
  url: string;
}

export interface VCardData {
  prefix: string; // honorific prefix, e.g. "Dr."
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  /** ADR: Post Office Box (usually empty) */
  poBox: string;
  /** ADR: Extended address (apartment, suite, …) */
  addressExtended: string;
  /** ADR: Street address */
  street: string;
  /** ADR: Locality */
  city: string;
  /** ADR: Postal code */
  postalCode: string;
  /** ADR: Country name */
  country: string;
  phones: PhoneEntry[];
  emails: EmailEntry[];
  websites: UrlEntry[];
}

/** Map UI type constants to vCard 3.0 TYPE parameter values (uppercase). */
function typeParam(type: string): string {
  return type.toUpperCase();
}

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

/** RFC 2426 / 6350 line folding: 75 octets, continuation lines start with a space. */
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
 * Build a vCard 3.0 string from contact data (RFC 2426).
 *
 * Structured fields:
 * - N: Family;Given;Additional;Prefix;Suffix
 * - ADR: PO Box;Extended;Street;Locality;Region;PostalCode;Country
 *   (Region is left empty; the form does not collect it)
 */
export function buildVCard(data: VCardData): string {
  const prefix = sanitizeLine(data.prefix);
  const firstName = sanitizeLine(data.firstName);
  const lastName = sanitizeLine(data.lastName);
  const jobTitle = sanitizeLine(data.jobTitle);
  const company = sanitizeLine(data.company);
  const poBox = sanitizeLine(data.poBox);
  const addressExtended = sanitizeLine(data.addressExtended);
  const street = sanitizeLine(data.street);
  const city = sanitizeLine(data.city);
  const postalCode = sanitizeLine(data.postalCode);
  const country = sanitizeLine(data.country);

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  // FN is required. Fall back to org, phone, email, then a placeholder.
  const fnParts = [prefix, firstName, lastName].filter(Boolean);
  const firstPhone = data.phones.map((p) => sanitizeLine(p.number)).find(Boolean) ?? '';
  const firstEmail = data.emails.map((e) => sanitizeLine(e.address)).find(Boolean) ?? '';
  const fullName = fnParts.join(' ') || company || firstPhone || firstEmail || 'Contact';

  lines.push(`FN;CHARSET=UTF-8:${fullName}`);
  // N: Family Name;Given Name;Additional Names;Honorific Prefixes;Honorific Suffixes
  lines.push(`N;CHARSET=UTF-8:${lastName};${firstName};;${prefix};`);

  if (jobTitle) lines.push(`TITLE;CHARSET=UTF-8:${jobTitle}`);
  if (company) lines.push(`ORG;CHARSET=UTF-8:${company}`);

  for (const phone of data.phones) {
    const num = sanitizeLine(phone.number);
    if (num) {
      lines.push(`TEL;TYPE=${typeParam(phone.type)}:${num}`);
    }
  }

  for (const email of data.emails) {
    const addr = sanitizeLine(email.address);
    if (addr) {
      lines.push(`EMAIL;TYPE=INTERNET,${typeParam(email.type)}:${addr}`);
    }
  }

  const hasAddress = [poBox, addressExtended, street, city, postalCode, country].some(Boolean);
  if (hasAddress) {
    // ADR: PO Box;Extended Address;Street;Locality;Region;Postal Code;Country
    lines.push(
      `ADR;CHARSET=UTF-8;TYPE=WORK:${poBox};${addressExtended};${street};${city};;${postalCode};${country}`,
    );
  }

  for (const website of data.websites) {
    const url = sanitizeLine(ensureUrl(website.url));
    if (url) {
      lines.push(`URL:${url}`);
    }
  }

  lines.push('END:VCARD');

  return lines.map(foldLine).join('\r\n');
}
